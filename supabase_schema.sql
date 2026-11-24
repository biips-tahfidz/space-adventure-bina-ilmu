-- ==============================================================================
-- SKEMA DATABASE SUPABASE: PETUALANGAN LUAR ANGKASA (SD BINA ILMU)
-- ==============================================================================
-- 1. Buat tabel users (Kepala Sekolah, Guru, Siswa)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('kepsek', 'guru', 'siswa')),
    nama TEXT NOT NULL,
    kelas TEXT DEFAULT '6',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat tabel mapel (Mata Pelajaran sebagai Planet)
CREATE TABLE IF NOT EXISTS public.mapel (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    warna TEXT NOT NULL DEFAULT '#3498db',
    kelas TEXT NOT NULL DEFAULT '6',
    deskripsi TEXT DEFAULT '',
    mc_points INTEGER NOT NULL DEFAULT 30,
    fill_points INTEGER NOT NULL DEFAULT 30,
    essay_points INTEGER NOT NULL DEFAULT 40,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mapel
    ADD COLUMN IF NOT EXISTS mc_points INTEGER NOT NULL DEFAULT 30,
    ADD COLUMN IF NOT EXISTS fill_points INTEGER NOT NULL DEFAULT 30,
    ADD COLUMN IF NOT EXISTS essay_points INTEGER NOT NULL DEFAULT 40;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'mapel_score_weights_sum_100'
          AND conrelid = 'public.mapel'::regclass
    ) THEN
        ALTER TABLE public.mapel
            ADD CONSTRAINT mapel_score_weights_sum_100
            CHECK (mc_points + fill_points + essay_points = 100) NOT VALID;
    END IF;
END $$;

ALTER TABLE public.mapel VALIDATE CONSTRAINT mapel_score_weights_sum_100;

-- 3. Buat tabel guru_mapel (Menghubungkan Guru dengan Mapel yang diampu)
CREATE TABLE IF NOT EXISTS public.guru_mapel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guru_username TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
    mapel_id TEXT NOT NULL REFERENCES public.mapel(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guru_username, mapel_id)
);

-- 4. Buat tabel questions (Soal PG, Isian, Uraian)
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    mapel_id TEXT NOT NULL REFERENCES public.mapel(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('mc', 'fill', 'essay')),
    text TEXT NOT NULL,
    image_url TEXT,
    options JSONB, -- Array pilihan: ["A","B","C","D"] atau pilihan amunisi rudal
    correct INTEGER, -- Index pilihan benar (0, 1, 2, ...)
    answer TEXT, -- Kunci jawaban uraian
    answer_image_url TEXT, -- Gambar pada kunci jawaban uraian
    cliff_hint TEXT, -- Petunjuk tebing jurang untuk soal uraian
    created_by TEXT REFERENCES public.users(username) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.questions
    ADD COLUMN IF NOT EXISTS answer_image_url TEXT;

-- 5. Buat tabel akses_siswa (Daftar siswa yang diizinkan mengakses planet mapel)
CREATE TABLE IF NOT EXISTS public.akses_siswa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mapel_id TEXT NOT NULL REFERENCES public.mapel(id) ON DELETE CASCADE,
    siswa_username TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(mapel_id, siswa_username)
);

-- 6. Buat tabel scores (Rekap nilai ujian siswa)
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siswa_username TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
    mapel_id TEXT NOT NULL REFERENCES public.mapel(id) ON DELETE CASCADE,
    score NUMERIC(6,2) NOT NULL,
    mc_score NUMERIC(6,2) DEFAULT 0,
    fill_score NUMERIC(6,2) DEFAULT 0,
    essay_score NUMERIC(6,2) DEFAULT 0,
    mc_max_score INTEGER NOT NULL DEFAULT 30,
    fill_max_score INTEGER NOT NULL DEFAULT 30,
    essay_max_score INTEGER NOT NULL DEFAULT 40,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scores
    ALTER COLUMN score TYPE NUMERIC(6,2) USING score::NUMERIC(6,2),
    ALTER COLUMN mc_score TYPE NUMERIC(6,2) USING mc_score::NUMERIC(6,2),
    ALTER COLUMN fill_score TYPE NUMERIC(6,2) USING fill_score::NUMERIC(6,2),
    ALTER COLUMN essay_score TYPE NUMERIC(6,2) USING essay_score::NUMERIC(6,2),
    ADD COLUMN IF NOT EXISTS mc_max_score INTEGER NOT NULL DEFAULT 30,
    ADD COLUMN IF NOT EXISTS fill_max_score INTEGER NOT NULL DEFAULT 30,
    ADD COLUMN IF NOT EXISTS essay_max_score INTEGER NOT NULL DEFAULT 40;

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_questions_mapel ON public.questions(mapel_id);
CREATE INDEX IF NOT EXISTS idx_akses_siswa ON public.akses_siswa(mapel_id, siswa_username);
CREATE INDEX IF NOT EXISTS idx_scores_siswa ON public.scores(siswa_username);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mapel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guru_mapel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akses_siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access users" ON public.users;
CREATE POLICY "Public access users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access mapel" ON public.mapel;
CREATE POLICY "Public access mapel" ON public.mapel FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access guru_mapel" ON public.guru_mapel;
CREATE POLICY "Public access guru_mapel" ON public.guru_mapel FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access questions" ON public.questions;
CREATE POLICY "Public access questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access akses_siswa" ON public.akses_siswa;
CREATE POLICY "Public access akses_siswa" ON public.akses_siswa FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access scores" ON public.scores;
CREATE POLICY "Public access scores" ON public.scores FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKET UNTUK GAMBAR SOAL
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-assets', 'game-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read game-assets" ON storage.objects;
CREATE POLICY "Allow public read game-assets" ON storage.objects
FOR SELECT USING (bucket_id = 'game-assets');

DROP POLICY IF EXISTS "Allow public upload game-assets" ON storage.objects;
CREATE POLICY "Allow public upload game-assets" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'game-assets');

-- ==============================================================================
-- SEED DATA AWAL (KEPSEK, GURU, SISWA, MAPEL)
-- ==============================================================================
INSERT INTO public.users (username, password, role, nama, kelas)
VALUES 
    ('admin', 'admin123', 'kepsek', 'Bapak H. Kepala Sekolah, M.Pd.', 'Semua'),
    ('guru_ipa', 'guru123', 'guru', 'Ibu Nurhayati, S.Pd. (Guru IPA)', '6'),
    ('guru_mat', 'guru123', 'guru', 'Bapak Rahmad, S.Pd. (Guru Matematika)', '6'),
    ('siswa_rara', 'siswa123', 'siswa', 'Rara Aulia', '1'),
    ('siswa_fajar', 'siswa123', 'siswa', 'Fajar Nugraha', '2'),
    ('siswa_dina', 'siswa123', 'siswa', 'Dina Safitri', '3'),
    ('siswa_rizki', 'siswa123', 'siswa', 'Rizki Maulana', '4'),
    ('siswa_andi', 'siswa123', 'siswa', 'Andi Pratama', '5'),
    ('siswa_budi', 'siswa123', 'siswa', 'Budi Santoso', '6'),
    ('siswa_siti', 'siswa123', 'siswa', 'Siti Rahmawati', '6')
ON CONFLICT (username) DO NOTHING;

INSERT INTO public.mapel (id, nama, warna, kelas, deskripsi)
VALUES 
    ('mapel_ipa', 'Ilmu Pengetahuan Alam (IPA)', '#2ecc71', '6', 'Planet Hijau Biosfer - Eksplorasi Sains Alam'),
    ('mapel_matematika', 'Matematika Antariksa', '#3498db', '6', 'Planet Biru Logika - Perhitungan Orbit Kosmik'),
    ('mapel_indo', 'Bahasa Indonesia Galaksi', '#e67e22', '6', 'Planet Oranye Sastra - Literasi Bintang')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.guru_mapel (guru_username, mapel_id)
VALUES 
    ('guru_ipa', 'mapel_ipa'),
    ('guru_mat', 'mapel_matematika')
ON CONFLICT (guru_username, mapel_id) DO NOTHING;

INSERT INTO public.akses_siswa (mapel_id, siswa_username)
VALUES 
    ('mapel_ipa', 'siswa_budi'),
    ('mapel_ipa', 'siswa_siti'),
    ('mapel_ipa', 'siswa_andi'),
    ('mapel_matematika', 'siswa_budi')
ON CONFLICT (mapel_id, siswa_username) DO NOTHING;

-- ==============================================================================
-- 30 SOAL LENGKAP DEMO (15 PG, 10 ISIAN, 5 URAIAN) UNTUK MAPEL IPA
-- ==============================================================================
-- 15 Pilihan Ganda (PG)
INSERT INTO public.questions (id, mapel_id, type, text, options, correct, created_by)
VALUES 
    ('q_seed_mc_1', 'mapel_ipa', 'mc', 'Planet yang dijuluki sebagai Planet Merah dalam sistem tata surya kita adalah...', '["Venus", "Mars", "Merkurius", "Jupiter"]'::jsonb, 1, 'admin'),
    ('q_seed_mc_2', 'mapel_ipa', 'mc', 'Bintang terdekat dengan planet Bumi yang menjadi pusat tata surya adalah...', '["Matahari", "Sirius", "Proxima Centauri", "Polaris"]'::jsonb, 0, 'admin'),
    ('q_seed_mc_3', 'mapel_ipa', 'mc', 'Lapisan udara yang menyelimuti dan melindungi bumi dari radiasi kosmik disebut...', '["Litosfer", "Hidrosfer", "Atmosfer", "Biosfer"]'::jsonb, 2, 'admin'),
    ('q_seed_mc_4', 'mapel_ipa', 'mc', 'Peristiwa berputarnya bumi pada porosnya sendiri dinamakan...', '["Revolusi Bumi", "Rotasi Bumi", "Presesi", "Evolusi"]'::jsonb, 1, 'admin'),
    ('q_seed_mc_5', 'mapel_ipa', 'mc', 'Satelit alami yang selalu mengorbit mengelilingi planet Bumi adalah...', '["Titan", "Bulan", "Phobos", "Europa"]'::jsonb, 1, 'admin'),
    ('q_seed_mc_6', 'mapel_ipa', 'mc', 'Peredaran planet-planet mengelilingi matahari pada orbitnya disebut...', '["Revolusi Planet", "Rotasi Planet", "Gerhana", "Gravitasi"]'::jsonb, 0, 'admin'),
    ('q_seed_mc_7', 'mapel_ipa', 'mc', 'Gaya tarik yang menyebabkan benda selalu jatuh ke bawah menuju pusat bumi adalah...', '["Gaya Magnet", "Gaya Gesek", "Gaya Gravitasi", "Gaya Pegas"]'::jsonb, 2, 'admin'),
    ('q_seed_mc_8', 'mapel_ipa', 'mc', 'Benda langit yang memiliki ekor bercahaya saat mendekati matahari dinamakan...', '["Komet", "Asteroid", "Meteor", "Satelit"]'::jsonb, 0, 'admin'),
    ('q_seed_mc_9', 'mapel_ipa', 'mc', 'Planet terbesar dalam tata surya kita adalah...', '["Saturnus", "Yupiter", "Uranus", "Neptunus"]'::jsonb, 1, 'admin'),
    ('q_seed_mc_10', 'mapel_ipa', 'mc', 'Garis khayal yang membagi bumi menjadi belahan utara dan selatan adalah...', '["Garis Bujur", "Garis Khatulistiwa", "Garis Merdian", "Garis Orbit"]'::jsonb, 1, 'admin'),
    ('q_seed_mc_11', 'mapel_ipa', 'mc', 'Kumpulan jutaan bintang, gas, dan debu luar angkasa yang terikat oleh gravitasi adalah...', '["Galaksi", "Tata Surya", "Nebula", "Konstelasi"]'::jsonb, 0, 'admin'),
    ('q_seed_mc_12', 'mapel_ipa', 'mc', 'Bagian tumbuhan yang berfungsi menyerap air dan zat hara dari dalam tanah adalah...', '["Daun", "Batang", "Akar", "Bunga"]'::jsonb, 2, 'admin'),
    ('q_seed_mc_13', 'mapel_ipa', 'mc', 'Proses pembuatan makanan pada tumbuhan hijau dengan bantuan cahaya matahari dinamakan...', '["Respirasi", "Fotosintesis", "Transpirasi", "Adaptasi"]'::jsonb, 1, 'admin'),
    ('q_seed_mc_14', 'mapel_ipa', 'mc', 'Sumber energi panas dan cahaya terbesar bagi kehidupan makhluk hidup di bumi adalah...', '["Lampu", "Batu Bara", "Matahari", "Minyak Bumi"]'::jsonb, 2, 'admin'),
    ('q_seed_mc_15', 'mapel_ipa', 'mc', 'Hewan yang memakan tumbuhan sebagai sumber makanan utamanya digolongkan sebagai...', '["Karnivora", "Herbivora", "Omnivora", "Insektivora"]'::jsonb, 1, 'admin')
ON CONFLICT (id) DO NOTHING;

-- 10 Isian (Fill Rudal)
INSERT INTO public.questions (id, mapel_id, type, text, options, correct, created_by)
VALUES 
    ('q_seed_fill_1', 'mapel_ipa', 'fill', 'Alat optik pembesar yang digunakan para astronom untuk mengamati benda langit yang jauh adalah...', '["Teleskop", "Mikroskop", "Periskop", "Lup"]'::jsonb, 0, 'admin'),
    ('q_seed_fill_2', 'mapel_ipa', 'fill', 'Lapisan gas Ozon pada atmosfer bumi berfungsi menyerap radiasi sinar berbahaya yaitu sinar...', '["Inframerah", "Ultraviolet", "Sinar Gamma", "Gelombang Radio"]'::jsonb, 1, 'admin'),
    ('q_seed_fill_3', 'mapel_ipa', 'fill', 'Hewan yang dapat hidup di dua alam (air dan darat) seperti katak dinamakan kelompok...', '["Reptil", "Mamalia", "Amfibi", "Aves"]'::jsonb, 2, 'admin'),
    ('q_seed_fill_4', 'mapel_ipa', 'fill', 'Planet kedua terdekat dari matahari yang tampak paling terang di langit malam adalah...', '["Merkurius", "Venus", "Mars", "Saturnus"]'::jsonb, 1, 'admin'),
    ('q_seed_fill_5', 'mapel_ipa', 'fill', 'Tempat tinggal dan berkembang biak alami bagi suatu makhluk hidup dinamakan...', '["Habitat", "Ekosistem", "Komunitas", "Populasi"]'::jsonb, 0, 'admin'),
    ('q_seed_fill_6', 'mapel_ipa', 'fill', 'Bagian sel darah manusia yang bertugas mengangkut oksigen ke seluruh tubuh adalah sel darah...', '["Putih", "Keping Darah", "Merah", "Plasma Darah"]'::jsonb, 2, 'admin'),
    ('q_seed_fill_7', 'mapel_ipa', 'fill', 'Perubahan wujud benda dari zat cair menjadi gas atau uap disebut proses...', '["Mencair", "Membeku", "Penguapan", "Pengembunan"]'::jsonb, 2, 'admin'),
    ('q_seed_fill_8', 'mapel_ipa', 'fill', 'Bunyi pantul yang terdengar jelas setelah bunyi asli selesai diucapkan dinamakan...', '["Gaung", "Gema", "Desah", "Nada"]'::jsonb, 1, 'admin'),
    ('q_seed_fill_9', 'mapel_ipa', 'fill', 'Bahan bakar yang digunakan untuk menggerakkan mesin roket peluncur satelit umumnya adalah...', '["Kerosin & Oksigen Cair", "Minyak Tanah", "Batu Bara", "Solar"]'::jsonb, 0, 'admin'),
    ('q_seed_fill_10', 'mapel_ipa', 'fill', 'Organ pernapasan utama pada manusia yang berfungsi menukar oksigen dan karbondioksida adalah...', '["Jantung", "Paru-paru", "Lambung", "Ginjal"]'::jsonb, 1, 'admin')
ON CONFLICT (id) DO NOTHING;

-- 5 Uraian (Essay Boss Jurang)
INSERT INTO public.questions (id, mapel_id, type, text, answer, cliff_hint, created_by)
VALUES 
    ('q_seed_essay_1', 'mapel_ipa', 'essay', 'Jelaskan mengapa planet Bumi merupakan satu-satunya planet di tata surya kita yang dapat dihuni oleh kehidupan makhluk hidup!', 'Memiliki air dalam bentuk cair, lapisan atmosfer kaya oksigen, dan jarak ideal dari matahari sehingga suhu stabil.', 'Air cair, oksigen atmosfer, dan suhu yang sesuai bagi kehidupan.', 'admin'),
    ('q_seed_essay_2', 'mapel_ipa', 'essay', 'Sebutkan 3 perbedaan mendasar antara bintang dan planet di luar angkasa!', 'Bintang memancarkan cahaya sendiri sedangkan planet memantulkan cahaya; bintang bersuhu sangat tinggi; planet mengorbit bintang.', 'Bintang memancarkan cahaya sendiri dan bersuhu sangat tinggi, planet mengorbit bintang.', 'admin'),
    ('q_seed_essay_3', 'mapel_ipa', 'essay', 'Jelaskan akibat yang ditimbulkan oleh peristiwa rotasi Bumi bagi kehidupan sehari-hari di permukaan bumi!', 'Terjadinya siang dan malam, gerak semu harian matahari, dan terjadinya perbedaan pembagian waktu di berbagai belahan bumi.', 'Terjadinya siang dan malam serta perbedaan waktu antarwilayah.', 'admin'),
    ('q_seed_essay_4', 'mapel_ipa', 'essay', 'Mengapa gaya gravitasi sangat penting bagi kelangsungan tata surya dan kehidupan makhluk hidup di Bumi?', 'Gaya gravitasi menahan atmosfer agar tidak lepas ke luar angkasa, menjaga planet tetap pada garis orbitnya, dan membuat benda tidak melayang.', 'Menahan atmosfer bumi dan menjaga planet tetap mengorbit matahari.', 'admin'),
    ('q_seed_essay_5', 'mapel_ipa', 'essay', 'Sebutkan tindakan nyata yang dapat dilakukan oleh siswa SD untuk menjaga kelestarian bumi dan lingkungan!', 'Menghemat air dan listrik, menanam pohon atau reboisasi, membuang sampah pada tempatnya, dan mendaur ulang barang bekas.', 'Menghemat energi, menanam pohon, dan membuang sampah pada tempatnya.', 'admin')
ON CONFLICT (id) DO NOTHING;
