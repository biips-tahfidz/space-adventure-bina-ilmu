# 🚀 Petualangan Luar Angkasa - SD Bina Ilmu
### Game Edukasi Persiapan Ujian Akhir Semester (UAS) Berbasis Web • Supabase & Vercel Ready

Aplikasi web game petualangan luar angkasa interaktif yang dirancang khusus untuk melatih siswa **SD Bina Ilmu** dalam persiapan Ujian Akhir Semester (UAS). Aplikasi ini dapat diakses secara online dari mana saja oleh Kepala Sekolah, Guru, dan Siswa menggunakan **Vercel** sebagai media hosting web dan **Supabase** sebagai database cloud.

---

## 🌟 Fitur Utama & Alur Pengguna

### 1. Struktur Pengguna & Peran (Role-Based Access)
* **🏫 Kepala Sekolah (Principal & Administrator)**:
  * **Edit Profil & Ganti Password**: Dapat memperbarui nama lengkap, gelar, dan kata sandi akun administrator secara langsung dengan sinkronisasi otomatis ke cloud.
  * Dapat bertindak sebagai guru (membuat soal dan materi ujian).
  * Mendaftarkan Mata Pelajaran baru (Planet tujuan) dari **Kelas 1 hingga Kelas 6**.
  * Mendaftarkan akun Guru dan menugaskannya ke Mata Pelajaran yang diampu.
  * Mendaftarkan akun Siswa lengkap dengan pilihan **Tingkat Kelas (Kelas 1 - Kelas 6)** serta fitur filter siswa per kelas.
  * Dapat melihat **seluruh bank soal** yang dibuat oleh semua guru.
  * Melihat rekap nilai seluruh siswa secara lengkap (bisa dicetak / diunduh PDF).
* **👨‍🏫 Guru Pengampu**:
  * **Hanya bisa** membuat dan mengelola soal pada mata pelajaran yang diampunya.
  * Satu akun guru dapat ditugaskan ke beberapa mata pelajaran sekaligus; guru memilih mapel aktif dari dashboard.
  * Mengatur pembagian nilai Pilihan Ganda, Isian, dan Uraian per mapel, dengan total bobot wajib 100.
  * Mengatur **Hak Akses Siswa**: memilih siswa mana saja yang diizinkan mendarat di planet pelajarannya, lengkap dengan badge kelas dan filter per kelas (Kelas 1 - Kelas 6).
  * Menambahkan gambar pada opsi jawaban Isian dan kunci jawaban Uraian dengan mengunggah atau menempel gambar.
  * Menambahkan pilihan amunisi Isian sebanyak yang diperlukan.
  * Membuat 3 jenis soal lengkap dengan fitur upload gambar ilustrasi:
    1. **15 Soal Pilihan Ganda (PG)**: Bobot 2 poin/soal (Total 30 poin).
    2. **10 Soal Isian**: Bobot 3 poin/soal (Total 30 poin).
    3. **5 Soal Uraian**: Bobot 8 poin/soal (Total 40 poin).
* **👦 Siswa (Peserta Ujian)**:
  * Login dengan akun siswa sesuai kelasnya (Kelas 1 sampai Kelas 6).
  * Memilih **Planet Mata Pelajaran** tujuan di peta galaksi.

---

## 🎮 Mekanika Permainan & Pengalaman Kokpit Luar Angkasa

1. **Efek Planet Menghilang (Black Hole Vortex)**:
   * Jika siswa mencoba memasuki planet yang soalnya belum lengkap (belum ada 15 PG, 10 Isian, atau 5 Uraian), planet akan **menghilang tersedot ke lubang cacing kosmik** dengan animasi grafis dan efek suara khusus.
   * Siswa akan menerima peringatan bahwa materi belum siap dan diberikan opsi untuk memilih planet lain yang tersedia.
2. **Suasana Kokpit Pesawat Luar Angkasa**:
   * Sudut pandang orang pertama (First-Person Cockpit View) dengan instrumen radar aktif, indikator neon, power meter, shield generator, dan kemudi (*yoke*).
   * Efek audio *synthesizer* mandiri (Web Audio API) tanpa perlu file MP3 eksternal: suara tembakan laser blaster, desingan roket/rudal, ledakan musuh, alarm kokpit, dan musik kemenangan.
3. **Tantangan 1 — 15 Soal Pilihan Ganda (Rintangan Drone & Asteroid)**:
   * Soal ditampilkan sebagai rintangan luar angkasa.
   * Siswa memilih opsi A, B, C, atau D.
   * **Jika Benar**: Meriam laser kokpit menembakkan blaster ganda menghancurkan rintangan, dan pesawat melaju maju (*warp speed*). (+2 Poin dengan bobot awal).
   * **Jika Salah**: Pesawat bermanuver miring darurat ke sisi lain, alarm berbunyi, rintangan terlewatkan tanpa nilai (+0 Poin).
4. **Tantangan 2 — 10 Soal Isian (Peluncur Amunisi Rudal Taktis)**:
   * Soal disajikan dengan target kapal penjelajah musuh.
   * Disediakan dropdown jawaban berupa **Slot Amunisi Rudal Taktis**.
   * Siswa memilih amunisi yang tepat dan meluncurkannya ke kapal musuh. (+3 Poin dengan bobot awal jika tepat sasaran).
5. **Tantangan 3 — 5 Soal Uraian (5 Boss Jurang & Kristal Tebing Jurang)**:
   * 5 musuh Boss menghadang di jurang kosmik yang dalam (*Cosmic Canyon*).
   * Di dinding tebing jurang terdapat **Artefak / Petunjuk Tebing**. Siswa dapat mengklik tombol *"Ambil ke Jawaban"* untuk mengambil kata kunci dari tebing ke dalam lembar jawaban dan merumuskan jawaban uraiannya.
   * Mengalahkan boss memberikan +8 Poin per soal dengan bobot awal.
6. **Penilaian Akhir (Skor Maksimal 100)**:
   * Bobot awal: 30 (PG) + 30 (Isian) + 40 (Uraian) = **100 Poin**. Guru dapat mengubah pembagian bobot per mapel; aplikasi membagi bobot tiap kategori rata ke jumlah soal dan memastikan totalnya tetap 100.
   * Evaluasi Nilai:
     * Nilai **≥ 80**: Tampil pesan kebanggaan: **`"Masya Allah kamu keren"`** disertai medali kosmik.
     * Nilai **< 80**: Tampil pesan motivasi: **`"ayo semangat belajar lagi ya"`**.
   * Pilihan Lanjutan:
     * 🪐 **Masuk ke Planet Berikutnya**: Melanjutkan ujian ke planet mata pelajaran lain yang diizinkan.
     * 🚪 **Tutup Aplikasi**: Menyelesaikan sesi dan keluar dengan aman.

---

## ⚡ Panduan Menghubungkan ke Supabase (Database Cloud)

Aplikasi ini memiliki fitur *Dual Mode*:
- **Mode Offline (LocalStorage)**: Langsung bisa dimainkan dan diuji coba seketika tanpa perlu setup apapun.
- **Mode Cloud (Supabase)**: Data guru, siswa, mapel, soal, gambar, dan nilai tersimpan online dan terhubung secara realtime.

### Langkah-langkah Setup Supabase (Gratis):
1. Buka [https://supabase.com](https://supabase.com) dan buat proyek baru (misalnya bernama `bina-ilmu-uas`).
2. Masuk ke menu **SQL Editor** pada dashboard Supabase.
3. Buka file `supabase_schema.sql` pada proyek ini, salin seluruh kodenya, tempel di SQL Editor Supabase, lalu klik **Run**. Jika proyek Supabase sudah memakai skema versi sebelumnya, jalankan kembali file terbaru ini untuk menambahkan kolom bobot nilai, gambar kunci jawaban, dan rincian nilai maksimum.
4. Masuk ke menu **Project Settings -> API** di Supabase. Salin:
   - **Project URL**
   - **anon public key**
5. Buka game di browser, klik tombol ikon **⚙️ (Pengaturan)** di pojok kanan atas, lalu masukkan Project URL dan Anon Key Anda, kemudian klik **Simpan & Hubungkan**.
6. Status di pojok kiri atas akan berubah menjadi **`Supabase: Cloud Aktif 🟢`**.

---

## 🌐 Panduan Deploy ke Vercel (Gratis & Cepat)

Karena aplikasi ini dibangun menggunakan standar web modern yang *zero-dependency* dan ramah browser, aplikasi siap dideploy ke Vercel dalam hitungan detik.

### Cara 1: Menggunakan Vercel CLI
```bash
# 1. Buka folder proyek
cd space-adventure-bina-ilmu

# 2. Jalankan perintah deploy
vercel deploy --prod
```

### Cara 2: Melalui GitHub & Vercel Dashboard
1. Unggah folder proyek ini ke repository GitHub Anda (misal `space-adventure-bina-ilmu`).
2. Masuk ke [https://vercel.com](https://vercel.com) dan klik **Add New Project**.
3. Pilih repository GitHub Anda, lalu klik **Deploy**.
4. Website game langsung online dan memiliki alamat URL publik (contoh: `https://space-adventure-bina-ilmu.vercel.app`) yang dapat dibagikan kepada seluruh guru dan siswa!

---

## 🔑 Kredensial Pengujian Cepat (Bawaan)

| Peran | Username | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Kepala Sekolah** | `admin` | `admin123` | Akses penuh seluruh sistem, edit profil, & penugasan |
| **Guru IPA** | `guru_ipa` | `guru123` | Guru mata pelajaran IPA (Planet Hijau) |
| **Guru Matematika** | `guru_mat` | `guru123` | Guru mata pelajaran Matematika (Planet Biru) |
| **Siswa Kelas 6** | `siswa_budi` | `siswa123` | Peserta ujian Kelas 6 |
| **Siswa Kelas 5** | `siswa_andi` | `siswa123` | Peserta ujian Kelas 5 |
| **Siswa Kelas 1** | `siswa_rara` | `siswa123` | Peserta ujian Kelas 1 |

> 💡 **Tips Cepat untuk Pengujian**:
> Masuk sebagai `admin`, lalu di sidebar dashboard klik tombol **`🌱 Muat 30 Soal Demo`**. Sistem akan otomatis mengisi 15 Soal Pilihan Ganda, 10 Soal Isian, dan 5 Soal Uraian lengkap untuk mata pelajaran IPA sehingga siswa dapat langsung memainkan seluruh alur permainan hingga skor akhir!
