Aplikasi Manajemen Bank Soal Ujian

Aplikasi web berbasis modular JavaScript untuk mengelola bank soal ujian (Pilihan Ganda, Isian Singkat, dan Uraian) yang terhubung langsung ke Supabase sebagai database cloud dan siap di-deploy melalui GitHub + Vercel untuk menangani akses ratusan pengguna secara bersamaan.

Fitur Utama

Dukungan 3 Tipe Soal: Pilihan Ganda (PG), Isian Singkat, dan Uraian.

Arsitektur Modular: Pemisahan kode antara struktur HTML, tampilan CSS, koneksi database, operasi CRUD, dan logika antarmuka agar mudah dirawat dan dikembangkan.

Form Dinamis & Anti-Error: Kolom opsi jawaban (A–D) otomatis menyesuaikan saat mode tambah maupun edit soal isian/uraian.

Skalabilitas Tinggi: Menggunakan Supabase (PostgreSQL) sehingga aman diakses oleh 100+ pengguna secara bersamaan tanpa risiko antrean timeout.

Struktur Folder Proyek

📁 proyek-bank-soal/
├── 📄 index.html          # Kerangka utama tampilan aplikasi
├── 📄 README.md           # Dokumentasi proyek
├── 📁 css/
│   └── 📄 style.css       # Styling tampilan responsif & modal form
└── 📁 js/
    ├── 📄 supabase.js     # Konfigurasi koneksi ke Supabase
    ├── 📄 api.js          # Operasi database (Ambil, Tambah, Edit, Hapus soal)
    ├── 📄 ui.js           # Pengaturan elemen UI, render daftar soal, & form dinamis
    └── 📄 app.js          # Pengendali utama alur aplikasi & event listener


Panduan Instalasi & Konfigurasi

1. Persiapan Database di Supabase

Buat proyek baru di Supabase (disarankan memilih region Singapore).

Buka menu SQL Editor → New Query, lalu jalankan perintah SQL berikut untuk membuat tabel soal:

CREATE TABLE soal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  tipe TEXT NOT NULL,          -- 'pg', 'isian', atau 'uraian'
  pertanyaan TEXT NOT NULL,
  opsi_a TEXT,                 -- NULL untuk tipe isian/uraian
  opsi_b TEXT,
  opsi_c TEXT,
  opsi_d TEXT,
  kunci TEXT
);

-- Mengaktifkan Row Level Security (RLS)
ALTER TABLE soal ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses publik sementara (sesuaikan kembali jika sudah menerapkan autentikasi login)
CREATE POLICY "Izinkan akses publik sementara" 
ON soal FOR ALL 
USING (true) 
WITH CHECK (true);


Buka menu Project Settings → API, lalu salin Project URL dan anon public key.

2. Menghubungkan Aplikasi ke Supabase

Buka file js/supabase.js dan masukkan kredensial proyek Supabase Anda:

const SUPABASE_URL = 'https://PROJECT-ID-ANDA.supabase.co';
const SUPABASE_ANON_KEY = 'ANON-KEY-ANDA';


3. Menjalankan Secara Lokal (Local Development)

Karena proyek ini menggunakan standar ES Modules (<script type="module">), file index.html harus dijalankan melalui web server lokal (bukan dibuka langsung lewat klik ganda file:///):

Menggunakan VS Code: Instal ekstensi Live Server, klik kanan pada index.html, lalu pilih Open with Live Server.

Menggunakan Node.js / Python:

# Menggunakan npx serve
npx serve .

# Atau menggunakan Python
python -m http.server 8000


4. Deployment ke Vercel (Otomatis via GitHub)

Unggah (push) seluruh struktur folder proyek ini ke repositori GitHub Anda.

Masuk ke dashboard Vercel dan klik Add New Project.

Pilih repositori GitHub proyek ini, biarkan pengaturan build default (Framework Preset: Other), lalu klik Deploy.

Setiap kali ada perubahan kode yang di-push ke GitHub, Vercel akan memperbarui aplikasi secara otomatis.

Catatan Pengembangan Selanjutnya

Keamanan (Authentication): Aktifkan fitur Supabase Auth agar hanya akun guru/admin yang dapat menambah, mengubah, atau menghapus soal, sementara siswa hanya memiliki hak akses baca (SELECT).

Halaman Ujian Siswa: Pisahkan halaman pengerjaan ujian siswa (ujian.html) dan simpan progres jawaban sementara di localStorage browser sebelum dikirim ke tabel hasil_ujian di Supabase.
