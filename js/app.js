import {
  ambilSemuaSoal,
  tambahSoal,
  updateSoal,
  hapusSoal,
  kirimHasilUjian,
  ambilSemuaHasilUjian,
} from './api.js';
import {
  renderCheckboxMapelGuru,
  perbaruiDropdownMapel,
  renderPlanetSiswa,
  tambahBarisAmunisiIsian,
  tambahBarisAmunisiUraian,
  sesuaikanFormTipe,
  setPreviewGambarEditor,
  bukaFormEdit,
  renderDaftarSoalGuru,
  renderKartuInteraktifSiswa,
  renderRekapHasil,
} from './ui.js';
import { prosesFileGambarKeBase64, ambilGambarDariPaste } from './image_helper.js';
import { initSpaceCanvas, mainkanSuaraLaser } from './audio_fx.js';

const KEY_MAPEL_USTADZ = 'space_adv_mapel_ustadz_v2';
const KEY_JAWABAN_SISWA = 'space_adv_jawaban_siswa_v2';
const KEY_PESERTA_SISWA = 'space_adv_peserta_siswa_v2';

let semuaSoalDB = [];
let mapelUstadzAktif = ['Matematika', 'IPA / Sains', 'PAI / Tahfidz'];
let soalMisiSiswa = [];
let indexSoalAktif = 0;
let jawabanSiswa = {};
let pesertaAktif = null;

// ==================== PENGATURAN MAPEL USTADZ ====================
function muatMapelUstadz() {
  try {
    const saved = localStorage.getItem(KEY_MAPEL_USTADZ);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        mapelUstadzAktif = parsed;
      }
    }
  } catch (_) {}
  renderCheckboxMapelGuru(mapelUstadzAktif);
  perbaruiDropdownMapel(mapelUstadzAktif);
}

document.getElementById('btn-simpan-mapel-guru').addEventListener('click', () => {
  const checked = Array.from(document.querySelectorAll('input[name="mapel_guru"]:checked')).map(
    (el) => el.value
  );
  if (!checked.length) {
    alert('Pilih minimal satu mata pelajaran yang Anda ampu.');
    return;
  }
  mapelUstadzAktif = checked;
  localStorage.setItem(KEY_MAPEL_USTADZ, JSON.stringify(mapelUstadzAktif));
  perbaruiDropdownMapel(mapelUstadzAktif);
  renderPlanetSiswa(mapelUstadzAktif, semuaSoalDB);
  tampilkanDaftarSoalTerfilter();
  alert('Daftar mata pelajaran berhasil diterapkan! Planet di layar siswa telah diperbarui.');
});

// ==================== NAVIGASI UTAMA ====================
const tabSiswa = document.getElementById('tab-siswa');
const tabGuru = document.getElementById('tab-guru');
const viewSiswa = document.getElementById('view-siswa');
const viewGuru = document.getElementById('view-guru');

tabSiswa.addEventListener('click', async () => {
  tabSiswa.classList.add('active');
  tabGuru.classList.remove('active');
  viewSiswa.classList.remove('hidden');
  viewGuru.classList.add('hidden');
  try {
    semuaSoalDB = await ambilSemuaSoal(false);
  } catch (_) {}
  renderPlanetSiswa(mapelUstadzAktif, semuaSoalDB);
});

tabGuru.addEventListener('click', async () => {
  tabGuru.classList.add('active');
  tabSiswa.classList.remove('active');
  viewGuru.classList.remove('hidden');
  viewSiswa.classList.add('hidden');
  await muatSoalDariDatabase(true);
});

document.getElementById('subtab-soal').addEventListener('click', () => {
  document.getElementById('subtab-soal').classList.add('active');
  document.getElementById('subtab-nilai').classList.remove('active');
  document.getElementById('panel-daftar-soal').classList.remove('hidden');
  document.getElementById('panel-rekap-nilai').classList.add('hidden');
});

document.getElementById('subtab-nilai').addEventListener('click', async () => {
  document.getElementById('subtab-nilai').classList.add('active');
  document.getElementById('subtab-soal').classList.remove('active');
  document.getElementById('panel-rekap-nilai').classList.remove('hidden');
  document.getElementById('panel-daftar-soal').classList.add('hidden');
  try {
    const hasil = await ambilSemuaHasilUjian();
    renderRekapHasil(hasil);
  } catch (err) {
    document.getElementById('daftar-hasil-siswa').innerHTML =
      `<p style="color:#f87171;">Gagal memuat hasil: ${err.message}</p>`;
  }
});

document.getElementById('btn-refresh-nilai').addEventListener('click', async () => {
  try {
    const hasil = await ambilSemuaHasilUjian();
    renderRekapHasil(hasil);
  } catch (err) {
    alert('Gagal menyegarkan data: ' + err.message);
  }
});

// ==================== PANEL BANK SOAL GURU ====================
function tampilkanDaftarSoalTerfilter() {
  const filterVal = document.getElementById('filter-mapel-guru').value;
  const hasilFilter = semuaSoalDB.filter((s) => {
    const m = s.mapel || 'Matematika';
    if (filterVal === 'ALL') return mapelUstadzAktif.includes(m);
    return m === filterVal;
  });

  renderDaftarSoalGuru(hasilFilter, bukaFormEdit, async (id) => {
    if (confirm('Yakin ingin menghapus soal ini dari database?')) {
      await hapusSoal(id);
      await muatSoalDariDatabase(true);
    }
  });
}

document.getElementById('filter-mapel-guru').addEventListener('change', tampilkanDaftarSoalTerfilter);

async function muatSoalDariDatabase(paksa = false) {
  try {
    semuaSoalDB = await ambilSemuaSoal(paksa);
    tampilkanDaftarSoalTerfilter();
    renderPlanetSiswa(mapelUstadzAktif, semuaSoalDB);
  } catch (err) {
    document.getElementById('daftar-soal').innerHTML =
      `<p style="color:#f87171;">Gagal memuat soal dari Supabase: ${err.message}</p>`;
    renderPlanetSiswa(mapelUstadzAktif, []);
  }
}

// ==================== EDITOR SOAL ====================
const modalSoal = document.getElementById('modal-soal');
const formSoal = document.getElementById('form-soal');
const selectTipe = document.getElementById('tipe-soal');

document.getElementById('btn-tambah-baru').addEventListener('click', () => {
  formSoal.reset();
  document.getElementById('soal-id').value = '';
  document.getElementById('judul-modal').textContent = 'Buat Soal Baru';
  setPreviewGambarEditor('preview-gambar-soal', 'data-gambar-soal', '');
  document.getElementById('btn-hapus-gambar-soal').classList.add('hidden');
  ['a', 'b', 'c', 'd'].forEach((k) => setPreviewGambarEditor(`prev-img-${k}`, `data-gambar-${k}`, ''));
  document.getElementById('list-amunisi-isian').innerHTML = '';
  document.getElementById('list-amunisi-uraian').innerHTML = '';
  selectTipe.value = 'pg';
  sesuaikanFormTipe('pg');
  modalSoal.classList.remove('hidden');
});

document.getElementById('btn-batal').addEventListener('click', () => modalSoal.classList.add('hidden'));
document.getElementById('btn-close-x').addEventListener('click', () => modalSoal.classList.add('hidden'));
selectTipe.addEventListener('change', (e) => sesuaikanFormTipe(e.target.value));

// Upload & Paste Gambar Pertanyaan Soal
document.getElementById('file-gambar-soal').addEventListener('change', async (e) => {
  if (e.target.files[0]) {
    const b64 = await prosesFileGambarKeBase64(e.target.files[0]);
    setPreviewGambarEditor('preview-gambar-soal', 'data-gambar-soal', b64);
    document.getElementById('btn-hapus-gambar-soal').classList.remove('hidden');
  }
});

document.getElementById('pertanyaan').addEventListener('paste', async (e) => {
  const b64 = await ambilGambarDariPaste(e);
  if (b64) {
    e.preventDefault();
    setPreviewGambarEditor('preview-gambar-soal', 'data-gambar-soal', b64);
    document.getElementById('btn-hapus-gambar-soal').classList.remove('hidden');
  }
});

document.getElementById('btn-hapus-gambar-soal').addEventListener('click', () => {
  setPreviewGambarEditor('preview-gambar-soal', 'data-gambar-soal', '');
  document.getElementById('btn-hapus-gambar-soal').classList.add('hidden');
});

// Upload & Paste Gambar Opsi PG (A, B, C, D)
document.querySelectorAll('.file-opsi-img').forEach((inp) => {
  inp.addEventListener('change', async (e) => {
    const target = e.target.dataset.target;
    if (e.target.files[0]) {
      const b64 = await prosesFileGambarKeBase64(e.target.files[0]);
      setPreviewGambarEditor(`prev-img-${target}`, `data-gambar-${target}`, b64);
    }
  });
});

['a', 'b', 'c', 'd'].forEach((huruf) => {
  document.getElementById(`opsi-${huruf}`).addEventListener('paste', async (e) => {
    const b64 = await ambilGambarDariPaste(e);
    if (b64) {
      e.preventDefault();
      setPreviewGambarEditor(`prev-img-${huruf}`, `data-gambar-${huruf}`, b64);
    }
  });
});

// Tombol Tambah Amunisi Isian & Uraian
document.getElementById('btn-tambah-amunisi-isian').addEventListener('click', () => {
  tambahBarisAmunisiIsian({ teks: '', gambar: '', benar: false });
});

document.getElementById('btn-tambah-amunisi-uraian').addEventListener('click', () => {
  tambahBarisAmunisiUraian({ teks: '', gambar: '', benar: false });
});

document.getElementById('btn-set-jumlah-uraian').addEventListener('click', () => {
  const targetJml = parseInt(document.getElementById('jumlah-slot-uraian').value || '4', 10);
  const list = document.getElementById('list-amunisi-uraian');
  while (list.children.length < targetJml) {
    tambahBarisAmunisiUraian({ teks: '', gambar: '', benar: false });
  }
  while (list.children.length > targetJml && list.children.length > 1) {
    list.lastElementChild.remove();
  }
});

// Rakit objek payload dari form
function rakitPayloadDariForm() {
  const tipe = selectTipe.value;
  const payload = {
    mapel: document.getElementById('soal-mapel').value,
    tipe,
    pertanyaan: document.getElementById('pertanyaan').value.trim(),
    gambar_soal: document.getElementById('data-gambar-soal').value || null,
    opsi_a: null,
    gambar_a: null,
    opsi_b: null,
    gambar_b: null,
    opsi_c: null,
    gambar_c: null,
    opsi_d: null,
    gambar_d: null,
    opsi_tambahan: [],
    kunci: '',
  };

  if (tipe === 'pg') {
    payload.opsi_a = document.getElementById('opsi-a').value.trim();
    payload.gambar_a = document.getElementById('data-gambar-a').value || null;
    payload.opsi_b = document.getElementById('opsi-b').value.trim();
    payload.gambar_b = document.getElementById('data-gambar-b').value || null;
    payload.opsi_c = document.getElementById('opsi-c').value.trim();
    payload.gambar_c = document.getElementById('data-gambar-c').value || null;
    payload.opsi_d = document.getElementById('opsi-d').value.trim();
    payload.gambar_d = document.getElementById('data-gambar-d').value || null;
    payload.kunci = document.getElementById('kunci-pg').value;
  } else if (tipe === 'isian') {
    const rows = document.querySelectorAll('#list-amunisi-isian .dynamic-item-card');
    const items = [];
    let kunciBenar = '';
    rows.forEach((r) => {
      const teks = r.querySelector('.inp-teks-isian').value.trim();
      const gambar = r.querySelector('.data-img-isian').value || '';
      const benar = r.querySelector('input[type="radio"]').checked;
      if (teks || gambar) {
        items.push({ teks, gambar, benar });
        if (benar) kunciBenar = teks;
      }
    });
    payload.opsi_tambahan = items;
    payload.kunci = kunciBenar || (items[0]?.teks || '');
  } else if (tipe === 'uraian') {
    const rows = document.querySelectorAll('#list-amunisi-uraian .dynamic-item-card');
    const items = [];
    const kunciList = [];
    rows.forEach((r) => {
      const teks = r.querySelector('.inp-teks-uraian').value.trim();
      const gambar = r.querySelector('.data-img-uraian').value || '';
      const benar = r.querySelector('.chk-kunci-uraian').checked;
      if (teks || gambar) {
        items.push({ teks, gambar, benar });
        if (benar) kunciList.push(teks);
      }
    });
    payload.opsi_tambahan = items;
    payload.kunci = JSON.stringify(kunciList);
  }

  return payload;
}

// Fitur Preview Tampilan Siswa sebelum Simpan Soal
const modalPreview = document.getElementById('modal-preview');
document.getElementById('btn-preview-soal').addEventListener('click', () => {
  const draftSoal = rakitPayloadDariForm();
  if (!draftSoal.pertanyaan) {
    alert('Tuliskan pertanyaan terlebih dahulu untuk melihat preview.');
    return;
  }
  const box = document.getElementById('kontainer-preview-siswa');
  box.innerHTML = '';
  renderKartuInteraktifSiswa(box, draftSoal, 1, null, () => {});
  modalPreview.classList.remove('hidden');
});

document.getElementById('btn-tutup-preview').addEventListener('click', () => modalPreview.classList.add('hidden'));
document.getElementById('btn-tutup-preview-bawah').addEventListener('click', () => modalPreview.classList.add('hidden'));

// Simpan Soal ke Supabase
formSoal.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btnSimpan = document.getElementById('btn-simpan-soal');
  btnSimpan.disabled = true;
  btnSimpan.textContent = 'Menyimpan ke Database...';

  const id = document.getElementById('soal-id').value;
  const payload = rakitPayloadDariForm();

  if ((payload.tipe === 'isian' || payload.tipe === 'uraian') && payload.opsi_tambahan.length === 0) {
    alert('Tambahkan minimal 1 pilihan amunisi jawaban sebelum menyimpan.');
    btnSimpan.disabled = false;
    btnSimpan.textContent = '💾 Simpan Soal ke Database';
    return;
  }

  try {
    if (id) {
      await updateSoal(id, payload);
    } else {
      await tambahSoal(payload);
    }
    modalSoal.classList.add('hidden');
    await muatSoalDariDatabase(true);
    alert('✅ Soal berhasil disimpan permanen ke database Supabase!');
  } catch (err) {
    alert('Gagal menyimpan soal ke Supabase: ' + err.message);
  } finally {
    btnSimpan.disabled = false;
    btnSimpan.textContent = '💾 Simpan Soal ke Database';
  }
});

// ==================== ARENA MISI UJIAN SISWA ====================
function renderSoalAktifSiswa() {
  const arena = document.getElementById('arena-soal-aktif');
  arena.innerHTML = '';

  if (!soalMisiSiswa.length) {
    arena.innerHTML = '<div class="card-panel"><p>Belum ada soal misi di planet mata pelajaran ini.</p></div>';
    return;
  }

  const soal = soalMisiSiswa[indexSoalAktif];
  document.getElementById('progress-soal').textContent = `Misi ${indexSoalAktif + 1} / ${soalMisiSiswa.length}`;

  renderKartuInteraktifSiswa(arena, soal, indexSoalAktif + 1, jawabanSiswa[soal.id], (nilaiBaru) => {
    jawabanSiswa[soal.id] = nilaiBaru;
    localStorage.setItem(KEY_JAWABAN_SISWA, JSON.stringify(jawabanSiswa));
    document.getElementById('status-autosave').textContent =
      '✓ Tersimpan lokal (' + new Date().toLocaleTimeString('id-ID') + ')';
    renderIndikatorNomor();
  });

  document.getElementById('btn-prev-soal').disabled = indexSoalAktif === 0;
  document.getElementById('btn-next-soal').disabled = indexSoalAktif === soalMisiSiswa.length - 1;
  renderIndikatorNomor();
}

function renderIndikatorNomor() {
  const dots = document.getElementById('indikator-nomor-soal');
  dots.innerHTML = '';
  soalMisiSiswa.forEach((s, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const jwb = jawabanSiswa[s.id];
    const terisi = Array.isArray(jwb) ? jwb.length > 0 : Boolean(jwb);
    btn.className = `dot-num ${terisi ? 'answered' : ''} ${idx === indexSoalAktif ? 'active' : ''}`;
    btn.textContent = idx + 1;
    btn.addEventListener('click', () => {
      indexSoalAktif = idx;
      renderSoalAktifSiswa();
    });
    dots.appendChild(btn);
  });
}

document.getElementById('btn-prev-soal').addEventListener('click', () => {
  if (indexSoalAktif > 0) {
    indexSoalAktif--;
    renderSoalAktifSiswa();
  }
});

document.getElementById('btn-next-soal').addEventListener('click', () => {
  if (indexSoalAktif < soalMisiSiswa.length - 1) {
    indexSoalAktif++;
    renderSoalAktifSiswa();
  }
});

document.getElementById('form-identitas-siswa').addEventListener('submit', async (e) => {
  e.preventDefault();
  const mapelDipilih = document.getElementById('siswa-mapel-terpilih').value;
  if (!mapelDipilih) {
    alert('Silakan pilih planet mata pelajaran terlebih dahulu.');
    return;
  }

  pesertaAktif = {
    nama: document.getElementById('siswa-nama').value.trim(),
    kelas: document.getElementById('siswa-kelas').value.trim(),
    mapel: mapelDipilih,
  };
  localStorage.setItem(KEY_PESERTA_SISWA, JSON.stringify(pesertaAktif));

  try {
    semuaSoalDB = await ambilSemuaSoal(false);
  } catch (_) {}
  soalMisiSiswa = semuaSoalDB.filter((s) => (s.mapel || 'Matematika') === pesertaAktif.mapel);
  indexSoalAktif = 0;

  document.getElementById('siswa-mulai-card').classList.add('hidden');
  document.getElementById('siswa-ujian-area').classList.remove('hidden');
  document.getElementById('info-peserta').textContent = `🧑‍🚀 ${pesertaAktif.nama} (${pesertaAktif.kelas})`;
  document.getElementById('badge-planet-aktif').textContent = `🪐 ${pesertaAktif.mapel}`;
  mainkanSuaraLaser();
  renderSoalAktifSiswa();
});

document.getElementById('btn-kumpulkan-ujian').addEventListener('click', async () => {
  if (!confirm('Selesaikan misi dan kirim semua jawaban ke Ustadz?')) return;
  const btn = document.getElementById('btn-kumpulkan-ujian');
  btn.disabled = true;
  btn.textContent = 'Mengirim...';

  let benar = 0;
  const detail = soalMisiSiswa.map((s, idx) => {
    const jwb = jawabanSiswa[s.id];
    if (s.tipe === 'pg' || s.tipe === 'isian') {
      if (jwb && s.kunci && String(jwb).toLowerCase() === String(s.kunci).toLowerCase()) {
        benar++;
      }
    } else if (s.tipe === 'uraian') {
      try {
        const kunciArr = JSON.parse(s.kunci || '[]');
        const jwbArr = Array.isArray(jwb) ? jwb : [];
        if (
          kunciArr.length > 0 &&
          kunciArr.length === jwbArr.length &&
          kunciArr.every((k) => jwbArr.includes(k))
        ) {
          benar++;
        }
      } catch (_) {}
    }
    return {
      no: idx + 1,
      tipe: s.tipe,
      pertanyaan: s.pertanyaan,
      jawaban_siswa: jwb || '(Kosong)',
      kunci: s.kunci,
    };
  });

  const skor = soalMisiSiswa.length > 0 ? Math.round((benar / soalMisiSiswa.length) * 100) : 0;

  try {
    await kirimHasilUjian({
      nama_siswa: pesertaAktif.nama,
      kelas: pesertaAktif.kelas,
      mapel: pesertaAktif.mapel,
      skor_otomatis: skor,
      detail_jawaban: detail,
    });

    localStorage.removeItem(KEY_JAWABAN_SISWA);
    localStorage.removeItem(KEY_PESERTA_SISWA);
    jawabanSiswa = {};

    document.getElementById('siswa-ujian-area').classList.add('hidden');
    document.getElementById('siswa-selesai-card').classList.remove('hidden');
    document.getElementById('pesan-hasil-siswa').textContent =
      `Misi Planet ${pesertaAktif.mapel} oleh ${pesertaAktif.nama} telah berhasil dikirim!`;
    document.getElementById('skor-akhir-box').textContent =
      `Skor Akhir: ${skor} (${benar} dari ${soalMisiSiswa.length} Misi Tepat)`;
  } catch (err) {
    alert('Gagal mengirim jawaban: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '🏁 Selesaikan Misi';
  }
});

document.getElementById('btn-ujian-ulang').addEventListener('click', () => {
  document.getElementById('siswa-selesai-card').classList.add('hidden');
  document.getElementById('siswa-mulai-card').classList.remove('hidden');
});

// ==================== INISIALISASI ====================
document.addEventListener('DOMContentLoaded', async () => {
  initSpaceCanvas();
  muatMapelUstadz();
  renderPlanetSiswa(mapelUstadzAktif, []);
  await muatSoalDariDatabase(false);
});
