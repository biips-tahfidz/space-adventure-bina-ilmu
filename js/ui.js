// Tampilkan/sembunyikan kolom opsi berdasarkan tipe soal
export function sesuaikanFormTipe(tipe) {
  const areaOpsi = document.getElementById('area-opsi-pg');
  const inputOpsi = areaOpsi.querySelectorAll('input');

  if (tipe === 'pg') {
    areaOpsi.style.display = 'block';
    inputOpsi.forEach(inp => inp.required = true);
  } else {
    // Jika isian atau uraian, sembunyikan dan matikan atribut required agar form bisa di-submit
    areaOpsi.style.display = 'none';
    inputOpsi.forEach(inp => {
      inp.required = false;
      inp.value = ''; // Bersihkan sisa input PG sebelumnya
    });
  }
}

// Isi form modal saat tombol Edit diklik
export function bukaFormEdit(soal) {
  document.getElementById('judul-modal').textContent = 'Edit Soal';
  document.getElementById('soal-id').value = soal.id;
  document.getElementById('tipe-soal').value = soal.tipe;
  document.getElementById('pertanyaan').value = soal.pertanyaan || '';
  document.getElementById('kunci-jawaban').value = soal.kunci || '';

  // Atur tampilan form dulu sesuai tipe soalnya
  sesuaikanFormTipe(soal.tipe);

  // Isi opsi hanya jika tipe soal adalah PG
  if (soal.tipe === 'pg') {
    document.getElementById('opsi-a').value = soal.opsi_a || '';
    document.getElementById('opsi-b').value = soal.opsi_b || '';
    document.getElementById('opsi-c').value = soal.opsi_c || '';
    document.getElementById('opsi-d').value = soal.opsi_d || '';
  }

  document.getElementById('modal-soal').classList.remove('hidden');
}

// Render daftar soal ke layar (Tombol edit dipasang seragam untuk semua tipe)
export function renderDaftarSoal(daftarSoal, onEditKlik, onHapusKlik) {
  const kontainer = document.getElementById('daftar-soal');
  kontainer.innerHTML = '';

  daftarSoal.forEach((soal, index) => {
    const kartu = document.createElement('div');
    kartu.className = 'kartu-soal';

    let detailOpsiHTML = '';
    if (soal.tipe === 'pg') {
      detailOpsiHTML = `
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
        <strong>No. ${index + 1} [${soal.tipe.toUpperCase()}]</strong>
        <div>
          <button type="button" class="btn-edit">Edit</button>
          <button type="button" class="btn-hapus">Hapus</button>
        </div>
      </div>
      <p>${soal.pertanyaan}</p>
      ${detailOpsiHTML}
      <small><strong>Kunci:</strong> ${soal.kunci || '-'}</small>
    `;

    // Pasang event listener langsung ke elemen tombol (aman dari error tanda kutip di teks soal)
    kartu.querySelector('.btn-edit').addEventListener('click', () => onEditKlik(soal));
    kartu.querySelector('.btn-hapus').addEventListener('click', () => onHapusKlik(soal.id));

    kontainer.appendChild(kartu);
  });
}
