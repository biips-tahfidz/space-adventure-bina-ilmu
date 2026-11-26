import { ambilSemuaSoal, tambahSoal, updateSoal, hapusSoal } from './api.js';
import { sesuaikanFormTipe, bukaFormEdit, renderDaftarSoal } from './ui.js';

// Inisialisasi elemen DOM
const formSoal = document.getElementById('form-soal');
const modalSoal = document.getElementById('modal-soal');
const selectTipe = document.getElementById('tipe-soal');
const btnTambahBaru = document.getElementById('btn-tambah-baru');
const btnBatal = document.getElementById('btn-batal');

// 1. Muat dan tampilkan daftar soal dari Supabase
async function muatData() {
  const kontainer = document.getElementById('daftar-soal');
  kontainer.innerHTML = '<p>Memuat daftar soal...</p>';

  try {
    const dataSoal = await ambilSemuaSoal();

    if (!dataSoal || dataSoal.length === 0) {
      kontainer.innerHTML = '<p>Belum ada soal tersimpan. Klik "+ Tambah Soal" untuk memulai.</p>';
      return;
    }

    renderDaftarSoal(
      dataSoal,
      // Callback saat tombol Edit diklik
      (soalTerpilih) => {
        bukaFormEdit(soalTerpilih);
      },
      // Callback saat tombol Hapus diklik
      async (idSoal) => {
        if (confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
          try {
            await hapusSoal(idSoal);
            await muatData();
          } catch (err) {
            alert('Gagal menghapus soal: ' + err.message);
          }
        }
      }
    );
  } catch (err) {
    kontainer.innerHTML = '<p style="color:red;">Gagal terhubung ke database.</p>';
    alert('Gagal memuat soal: ' + err.message);
  }
}

// 2. Buka modal untuk menambah soal baru
btnTambahBaru.addEventListener('click', () => {
  formSoal.reset();
  document.getElementById('soal-id').value = '';
  document.getElementById('judul-modal').textContent = 'Tambah Soal Baru';
  selectTipe.value = 'pg';
  sesuaikanFormTipe('pg'); // Tampilkan input opsi PG secara default
  modalSoal.classList.remove('hidden');
});

// 3. Tutup modal saat tombol Batal diklik
btnBatal.addEventListener('click', () => {
  modalSoal.classList.add('hidden');
});

// Tutup modal jika area gelap di luar kotak modal diklik
modalSoal.addEventListener('click', (e) => {
  if (e.target === modalSoal) {
    modalSoal.classList.add('hidden');
  }
});

// 4. Sesuaikan tampilan kolom form saat tipe soal diubah (PG / Isian / Uraian)
selectTipe.addEventListener('change', (e) => {
  sesuaikanFormTipe(e.target.value);
});

// 5. Proses simpan form (Tambah Baru atau Simpan Perubahan Edit)
formSoal.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btnSubmit = formSoal.querySelector('button[type="submit"]');
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Menyimpan...';

  const id = document.getElementById('soal-id').value;
  const tipe = selectTipe.value;

  const payload = {
    tipe: tipe,
    pertanyaan: document.getElementById('pertanyaan').value.trim(),
    kunci: document.getElementById('kunci-jawaban').value.trim(),
    // Jika tipe bukan PG (isian/uraian), set kolom opsi menjadi null
    opsi_a: tipe === 'pg' ? document.getElementById('opsi-a').value.trim() : null,
    opsi_b: tipe === 'pg' ? document.getElementById('opsi-b').value.trim() : null,
    opsi_c: tipe === 'pg' ? document.getElementById('opsi-c').value.trim() : null,
    opsi_d: tipe === 'pg' ? document.getElementById('opsi-d').value.trim() : null,
  };

  try {
    if (id) {
      // Mode Edit (Update data yang sudah ada berdasarkan ID)
      await updateSoal(id, payload);
    } else {
      // Mode Tambah Baru
      await tambahSoal(payload);
    }

    formSoal.reset();
    document.getElementById('soal-id').value = '';
    modalSoal.classList.add('hidden');
    await muatData();
  } catch (err) {
    alert('Gagal menyimpan soal: ' + err.message);
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Simpan';
  }
});

// Jalankan aplikasi pertama kali saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', muatData);
