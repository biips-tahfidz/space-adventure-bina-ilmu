import {
  ambilSemuaSoal,
  tambahSoal,
  updateSoal,
  hapusSoal,
  kirimHasilUjian,
  ambilSemuaHasilUjian,
} from './api.js';
import {
  sesuaikanFormTipe,
  bukaFormEdit,
  renderDaftarSoalGuru,
  renderLembarSiswa,
  renderRekapHasil,
} from './ui.js';

const STORAGE_JAWABAN_KEY = 'space_adventure_jawaban_siswa_v1';
const STORAGE_PESERTA_KEY = 'space_adventure_peserta_v1';

let daftarSoalAktif = [];
let jawabanSiswa = {};
let dataPeserta = null;

// Elemen Navigasi Mode
const tabSiswa = document.getElementById('tab-siswa');
const tabGuru = document.getElementById('tab-guru');
const viewSiswa = document.getElementById('view-siswa');
const viewGuru = document.getElementById('view-guru');

// Elemen Guru
const subtabSoal = document.getElementById('subtab-soal');
const subtabNilai = document.getElementById('subtab-nilai');
const panelDaftarSoal = document.getElementById('panel-daftar-soal');
const panelRekapNilai = document.getElementById('panel-rekap-nilai');
const modalSoal = document.getElementById('modal-soal');
const formSoal = document.getElementById('form-soal');
const selectTipe = document.getElementById('tipe-soal');

// Elemen Siswa
const formIdentitas = document.getElementById('form-identitas-siswa');
const cardMulai = document.getElementById('siswa-mulai-card');
const areaUjian = document.getElementById('siswa-ujian-area');
const cardSelesai = document.getElementById('siswa-selesai-card');

// ================= NAVIGASI TAB UTAMA =================
tabSiswa.addEventListener('click', () => {
  tabSiswa.classList.add('active');
  tabGuru.classList.remove('active');
  viewSiswa.classList.remove('hidden');
  viewGuru.classList.add('hidden');
});

tabGuru.addEventListener('click', async () => {
  tabGuru.classList.add('active');
  tabSiswa.classList.remove('active');
  viewGuru.classList.remove('hidden');
  viewSiswa.classList.add('hidden');
  await muatSoalGuru(true);
});

subtabSoal.addEventListener('click', () => {
  subtabSoal.classList.add('active');
  subtabNilai.classList.remove('active');
  panelDaftarSoal.classList.remove('hidden');
  panelRekapNilai.classList.add('hidden');
});

subtabNilai.addEventListener('click', async () => {
  subtabNilai.classList.add('active');
  subtabSoal.classList.remove('active');
  panelRekapNilai.classList.remove('hidden');
  panelDaftarSoal.classList.add('hidden');
  await muatRekapNilai();
});

// ================= LOGIKA PANEL GURU =================
async function muatSoalGuru(paksaSegarkan = false) {
  try {
    daftarSoalAktif = await ambilSemuaSoal(paksaSegarkan);
    renderDaftarSoalGuru(daftarSoalAktif, bukaFormEdit, async (id) => {
      if (confirm('Yakin ingin menghapus soal ini?')) {
        await hapusSoal(id);
        await muatSoalGuru(true);
      }
    });
  } catch (err) {
    document.getElementById('daftar-soal').innerHTML =
      `<p style="color:#f87171;">Gagal memuat soal: ${err.message}</p>`;
  }
}

async function muatRekapNilai() {
  const kontainer = document.getElementById('daftar-hasil-siswa');
  kontainer.innerHTML = '<p>Memuat hasil ujian siswa...</p>';
  try {
    const hasil = await ambilSemuaHasilUjian();
    renderRekapHasil(hasil);
  } catch (err) {
    kontainer.innerHTML = `<p style="color:#f87171;">Gagal memuat hasil ujian: ${err.message}</p>`;
  }
}

document.getElementById('btn-refresh-nilai').addEventListener('click', muatRekapNilai);

document.getElementById('btn-tambah-baru').addEventListener('click', () => {
  formSoal.reset();
  document.getElementById('soal-id').value = '';
  document.getElementById('judul-modal').textContent = 'Tambah Soal Baru';
  selectTipe.value = 'pg';
  sesuaikanFormTipe('pg');
  modalSoal.classList.remove('hidden');
});

document.getElementById('btn-batal').addEventListener('click', () => {
  modalSoal.classList.add('hidden');
});

selectTipe.addEventListener('change', (e) => {
  sesuaikanFormTipe(e.target.value);
});

formSoal.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btnSubmit = formSoal.querySelector('button[type="submit"]');
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Menyimpan...';

  const id = document.getElementById('soal-id').value;
  const tipe = selectTipe.value;

  const payload = {
    tipe,
    pertanyaan: document.getElementById('pertanyaan').value.trim(),
    kunci: document.getElementById('kunci-jawaban').value.trim(),
    opsi_a: tipe === 'pg' ? document.getElementById('opsi-a').value.trim() : null,
    opsi_b: tipe === 'pg' ? document.getElementById('opsi-b').value.trim() : null,
    opsi_c: tipe === 'pg' ? document.getElementById('opsi-c').value.trim() : null,
    opsi_d: tipe === 'pg' ? document.getElementById('opsi-d').value.trim() : null,
  };

  try {
    if (id) {
      await updateSoal(id, payload);
    } else {
      await tambahSoal(payload);
    }
    formSoal.reset();
    document.getElementById('soal-id').value = '';
    modalSoal.classList.add('hidden');
    await muatSoalGuru(true);
  } catch (err) {
    alert('Gagal menyimpan soal: ' + err.message);
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Simpan Soal';
  }
});

// ================= LOGIKA UJIAN SISWA (TAHAN 100+ USER) =================
function muatStateLokalSiswa() {
  try {
    const savedPeserta = localStorage.getItem(STORAGE_PESERTA_KEY);
    const savedJawaban = localStorage.getItem(STORAGE_JAWABAN_KEY);
    if (savedPeserta) dataPeserta = JSON.parse(savedPeserta);
    if (savedJawaban) jawabanSiswa = JSON.parse(savedJawaban);
  } catch (_) {}
}

function simpanJawabanLokal(soalId, nilai) {
  jawabanSiswa[soalId] = nilai;
  localStorage.setItem(STORAGE_JAWABAN_KEY, JSON.stringify(jawabanSiswa));
  const badge = document.getElementById('status-autosave');
  badge.textContent = '✓ Tersimpan lokal (' + new Date().toLocaleTimeString('id-ID') + ')';
}

async function mulaiSesiUjianSiswa() {
  cardMulai.classList.add('hidden');
  cardSelesai.classList.add('hidden');
  areaUjian.classList.remove('hidden');
  document.getElementById('info-peserta').textContent =
    `🧑‍🚀 ${dataPeserta.nama} • Kelas ${dataPeserta.kelas}`;

  try {
    daftarSoalAktif = await ambilSemuaSoal(false);
    renderLembarSiswa(daftarSoalAktif, jawabanSiswa, simpanJawabanLokal);
  } catch (err) {
    document.getElementById('kontainer-soal-siswa').innerHTML =
      `<p style="color:#f87171;">Gagal memuat soal ujian: ${err.message}</p>`;
  }
}

formIdentitas.addEventListener('submit', async (e) => {
  e.preventDefault();
  dataPeserta = {
    nama: document.getElementById('siswa-nama').value.trim(),
    kelas: document.getElementById('siswa-kelas').value.trim(),
  };
  localStorage.setItem(STORAGE_PESERTA_KEY, JSON.stringify(dataPeserta));
  await mulaiSesiUjianSiswa();
});

document.getElementById('btn-kumpulkan-ujian').addEventListener('click', async () => {
  if (!confirm('Apakah Anda yakin ingin mengumpulkan jawaban sekarang?')) return;

  const btnKumpul = document.getElementById('btn-kumpulkan-ujian');
  btnKumpul.disabled = true;
  btnKumpul.textContent = 'Mengirim Jawaban...';

  // Hitung skor otomatis untuk PG & Isian Singkat
  let benarOtomatis = 0;
  let totalSoalOtomatis = 0;
  const detailLengkap = daftarSoalAktif.map((s, idx) => {
    const jwb = (jawabanSiswa[s.id] || '').trim();
    if (s.tipe === 'pg' || s.tipe === 'isian') {
      totalSoalOtomatis++;
      if (s.kunci && jwb.toLowerCase() === s.kunci.trim().toLowerCase()) {
        benarOtomatis++;
      }
    }
    return {
      no: idx + 1,
      tipe: s.tipe,
      pertanyaan: s.pertanyaan,
      jawaban_siswa: jwb || '(Kosong)',
      kunci: s.kunci || '-',
    };
  });

  const skorPersen =
    totalSoalOtomatis > 0 ? Math.round((benarOtomatis / totalSoalOtomatis) * 100) : 0;

  // Jeda acak singkat (0-1.5 detik) untuk mencegah lonjakan bersamaan 100 siswa
  await new Promise((r) => setTimeout(r, Math.random() * 1500));

  try {
    await kirimHasilUjian({
      nama_siswa: dataPeserta.nama,
      kelas: dataPeserta.kelas,
      skor_otomatis: skorPersen,
      detail_jawaban: detailLengkap,
    });

    // Bersihkan penyimpanan sementara setelah berhasil terkirim
    localStorage.removeItem(STORAGE_JAWABAN_KEY);
    localStorage.removeItem(STORAGE_PESERTA_KEY);
    jawabanSiswa = {};

    areaUjian.classList.add('hidden');
    cardSelesai.classList.remove('hidden');
    document.getElementById('pesan-hasil-siswa').textContent =
      `Terima kasih ${dataPeserta.nama} (${dataPeserta.kelas}), jawaban Anda telah berhasil dikirim ke server.`;
    document.getElementById('skor-akhir-box').textContent =
      `Skor Sementara (PG & Isian): ${skorPersen} (${benarOtomatis}/${totalSoalOtomatis} benar)`;
  } catch (err) {
    alert(
      'Gagal mengirim ke server karena koneksi padat. Jawaban Anda tetap aman di perangkat, silakan klik Kumpulkan lagi.\nDetail: ' +
        err.message
    );
  } finally {
    btnKumpul.disabled = false;
    btnKumpul.textContent = 'Kumpulkan Jawaban';
  }
});

document.getElementById('btn-ujian-ulang').addEventListener('click', () => {
  cardSelesai.classList.add('hidden');
  cardMulai.classList.remove('hidden');
  formIdentitas.reset();
});

// ================= INISIALISASI AWAL =================
document.addEventListener('DOMContentLoaded', async () => {
  muatStateLokalSiswa();
  if (dataPeserta && dataPeserta.nama) {
    await mulaiSesiUjianSiswa();
  }
});
