// Atur tampilan form tambah/edit sesuai tipe soal (PG, Isian, Uraian)
export function sesuaikanFormTipe(tipe) {
  const areaOpsi = document.getElementById('area-opsi-pg');
  const inputOpsi = areaOpsi.querySelectorAll('input');
  const labelKunci = document.getElementById('label-kunci');

  if (tipe === 'pg') {
    areaOpsi.style.display = 'flex';
    inputOpsi.forEach((inp) => (inp.required = true));
    labelKunci.textContent = 'Kunci Jawaban (Ketik huruf A, B, C, atau D):';
  } else if (tipe === 'isian') {
    areaOpsi.style.display = 'none';
    inputOpsi.forEach((inp) => {
      inp.required = false;
      inp.value = '';
    });
    labelKunci.textContent = 'Kunci Jawaban Singkat (untuk koreksi otomatis):';
  } else {
    areaOpsi.style.display = 'none';
    inputOpsi.forEach((inp) => {
      inp.required = false;
      inp.value = '';
    });
    labelKunci.textContent = 'Pedoman Penskoran / Kunci Uraian:';
  }
}

// Buka modal form dalam mode Edit untuk semua tipe soal
export function bukaFormEdit(soal) {
  document.getElementById('judul-modal').textContent = `Edit Soal (${soal.tipe.toUpperCase()})`;
  document.getElementById('soal-id').value = soal.id;
  document.getElementById('tipe-soal').value = soal.tipe;
  document.getElementById('pertanyaan').value = soal.pertanyaan || '';
  document.getElementById('kunci-jawaban').value = soal.kunci || '';

  sesuaikanFormTipe(soal.tipe);

  if (soal.tipe === 'pg') {
    document.getElementById('opsi-a').value = soal.opsi_a || '';
    document.getElementById('opsi-b').value = soal.opsi_b || '';
    document.getElementById('opsi-c').value = soal.opsi_c || '';
    document.getElementById('opsi-d').value = soal.opsi_d || '';
  }

  document.getElementById('modal-soal').classList.remove('hidden');
}

// Render daftar soal di Panel Guru
export function renderDaftarSoalGuru(daftarSoal, onEditKlik, onHapusKlik) {
  const kontainer = document.getElementById('daftar-soal');
  kontainer.innerHTML = '';

  if (!daftarSoal.length) {
    kontainer.innerHTML = '<p class="subtitle">Belum ada soal. Klik "+ Tambah Soal Baru" untuk membuat soal.</p>';
    return;
  }

  daftarSoal.forEach((soal, index) => {
    const kartu = document.createElement('div');
    kartu.className = 'kartu-soal';

    let opsiHTML = '';
    if (soal.tipe === 'pg') {
      opsiHTML = `
        <ul>
          <li>A. ${soal.opsi_a || '-'}</li>
          <li>B. ${soal.opsi_b || '-'}</li>
          <li>C. ${soal.opsi_c || '-'}</li>
          <li>D. ${soal.opsi_d || '-'}</li>
        </ul>
      `;
    }

    kartu.innerHTML = `
      <div class="header-soal">
        <strong>No. ${index + 1} • ${soal.tipe.toUpperCase()}</strong>
        <div>
          <button type="button" class="btn-edit">Edit</button>
          <button type="button" class="btn-hapus">Hapus</button>
        </div>
      </div>
      <p>${soal.pertanyaan}</p>
      ${opsiHTML}
      <small><strong>Kunci / Pedoman:</strong> ${soal.kunci || '-'}</small>
    `;

    kartu.querySelector('.btn-edit').addEventListener('click', () => onEditKlik(soal));
    kartu.querySelector('.btn-hapus').addEventListener('click', () => onHapusKlik(soal.id));

    kontainer.appendChild(kartu);
  });
}

// Render lembar soal untuk Siswa dengan dukungan auto-save ke localStorage
export function renderLembarSiswa(daftarSoal, jawabanTersimpan, onJawabanBerubah) {
  const kontainer = document.getElementById('kontainer-soal-siswa');
  kontainer.innerHTML = '';

  if (!daftarSoal.length) {
    kontainer.innerHTML = '<p class="subtitle">Belum ada soal ujian yang tersedia saat ini.</p>';
    return;
  }

  daftarSoal.forEach((soal, index) => {
    const kartu = document.createElement('div');
    kartu.className = 'kartu-soal';
    const nilaiAwal = jawabanTersimpan[soal.id] || '';

    let inputHTML = '';
    if (soal.tipe === 'pg') {
      const opsiList = [
        { kode: 'A', teks: soal.opsi_a },
        { kode: 'B', teks: soal.opsi_b },
        { kode: 'C', teks: soal.opsi_c },
        { kode: 'D', teks: soal.opsi_d },
      ];
      inputHTML = `<div class="opsi-radio-list">` + opsiList.map((o) => `
        <label class="opsi-radio-item">
          <input type="radio" name="soal_${soal.id}" value="${o.kode}" ${nilaiAwal === o.kode ? 'checked' : ''}>
          <span><strong>${o.kode}.</strong> ${o.teks || ''}</span>
        </label>
      `).join('') + `</div>`;
    } else if (soal.tipe === 'isian') {
      inputHTML = `<input type="text" class="input-jawaban-siswa" data-id="${soal.id}" placeholder="Ketik jawaban singkat Anda..." value="${nilaiAwal.replace(/"/g, '&quot;')}">`;
    } else {
      inputHTML = `<textarea class="input-jawaban-siswa" data-id="${soal.id}" rows="4" placeholder="Tuliskan penjelasan/uraian Anda di sini...">${nilaiAwal}</textarea>`;
    }

    kartu.innerHTML = `
      <div class="header-soal">
        <strong>Misi No. ${index + 1} (${soal.tipe.toUpperCase()})</strong>
      </div>
      <p>${soal.pertanyaan}</p>
      ${inputHTML}
    `;

    if (soal.tipe === 'pg') {
      kartu.querySelectorAll('input[type="radio"]').forEach((radio) => {
        radio.addEventListener('change', (e) => onJawabanBerubah(soal.id, e.target.value));
      });
    } else {
      const inp = kartu.querySelector('.input-jawaban-siswa');
      inp.addEventListener('input', (e) => onJawabanBerubah(soal.id, e.target.value));
    }

    kontainer.appendChild(kartu);
  });
}

// Render rekap hasil ujian siswa untuk Guru
export function renderRekapHasil(daftarHasil) {
  const kontainer = document.getElementById('daftar-hasil-siswa');
  kontainer.innerHTML = '';

  if (!daftarHasil.length) {
    kontainer.innerHTML = '<p class="subtitle">Belum ada siswa yang mengumpulkan jawaban.</p>';
    return;
  }

  daftarHasil.forEach((item) => {
    const waktu = new Date(item.created_at).toLocaleString('id-ID');
    const kartu = document.createElement('div');
    kartu.className = 'kartu-soal';
    kartu.innerHTML = `
      <div class="header-soal">
        <strong>🧑‍🚀 ${item.nama_siswa} (${item.kelas})</strong>
        <small>Skor Otomatis (PG & Isian): ${item.skor_otomatis}</small>
      </div>
      <p style="font-size:0.85rem; color:#94a3b8;">Waktu Kumpul: ${waktu}</p>
      <details>
        <summary style="cursor:pointer; color:#38bdf8; font-weight:600;">Lihat Detail Jawaban Siswa</summary>
        <pre style="margin-top:10px; white-space:pre-wrap; font-size:0.85rem; background:#0f172a; padding:12px; border-radius:8px;">${JSON.stringify(item.detail_jawaban, null, 2)}</pre>
      </details>
    `;
    kontainer.appendChild(kartu);
  });
}
