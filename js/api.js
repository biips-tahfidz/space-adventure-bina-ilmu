import { supabase } from './supabase.js';

const CACHE_SOAL_KEY = 'space_adventure_cache_soal_v1';

// Ambil semua soal (dengan cache lokal agar tahan 100+ siswa akses bersamaan)
export async function ambilSemuaSoal(paksaSegarkan = false) {
  if (!paksaSegarkan) {
    const cached = sessionStorage.getItem(CACHE_SOAL_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (_) {}
    }
  }

  const { data, error } = await supabase
    .from('soal')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  sessionStorage.setItem(CACHE_SOAL_KEY, JSON.stringify(data || []));
  return data || [];
}

export function bersihkanCacheSoal() {
  sessionStorage.removeItem(CACHE_SOAL_KEY);
}

// Tambah soal baru
export async function tambahSoal(payload) {
  const { data, error } = await supabase
    .from('soal')
    .insert([payload])
    .select();

  if (error) throw error;
  bersihkanCacheSoal();
  return data[0];
}

// Update soal (PG, Isian, maupun Uraian)
export async function updateSoal(id, payload) {
  const { data, error } = await supabase
    .from('soal')
    .update(payload)
    .eq('id', id)
    .select();

  if (error) throw error;
  bersihkanCacheSoal();
  return data[0];
}

// Hapus soal
export async function hapusSoal(id) {
  const { error } = await supabase
    .from('soal')
    .delete()
    .eq('id', id);

  if (error) throw error;
  bersihkanCacheSoal();
}

// Kirim hasil jawaban siswa dengan mekanisme Retry otomatis jika antrean server padat
export async function kirimHasilUjian(payload, maksCoba = 3) {
  let percobaan = 0;
  while (percobaan < maksCoba) {
    try {
      const { data, error } = await supabase
        .from('hasil_ujian')
        .insert([payload])
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      percobaan++;
      if (percobaan >= maksCoba) throw err;
      await new Promise((res) => setTimeout(res, 1500 * percobaan));
    }
  }
}

// Ambil rekap hasil ujian siswa untuk panel guru
export async function ambilSemuaHasilUjian() {
  const { data, error } = await supabase
    .from('hasil_ujian')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
