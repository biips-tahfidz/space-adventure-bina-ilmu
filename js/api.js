import * as supabaseModule from './supabase.js';

// Deteksi otomatis klien Supabase dari named export, default export, atau global window
const supabase =
  supabaseModule.supabase ||
  supabaseModule.default ||
  window.supabaseClient ||
  window.supabase;

const CACHE_SOAL_KEY = 'space_adv_soal_cache_v2';

function cekKoneksiSupabase() {
  if (!supabase || typeof supabase.from !== 'function') {
    throw new Error(
      'Klien Supabase belum terbaca dari js/supabase.js. Pastikan file js/supabase.js memiliki baris: export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);'
    );
  }
}

export async function ambilSemuaSoal(paksaSegarkan = false) {
  cekKoneksiSupabase();

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

export async function tambahSoal(payload) {
  cekKoneksiSupabase();
  const { data, error } = await supabase
    .from('soal')
    .insert([payload])
    .select();

  if (error) throw error;
  bersihkanCacheSoal();
  return data[0];
}

export async function updateSoal(id, payload) {
  cekKoneksiSupabase();
  const { data, error } = await supabase
    .from('soal')
    .update(payload)
    .eq('id', id)
    .select();

  if (error) throw error;
  bersihkanCacheSoal();
  return data[0];
}

export async function hapusSoal(id) {
  cekKoneksiSupabase();
  const { error } = await supabase
    .from('soal')
    .delete()
    .eq('id', id);

  if (error) throw error;
  bersihkanCacheSoal();
}

export async function kirimHasilUjian(payload, maksCoba = 3) {
  cekKoneksiSupabase();
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
      await new Promise((r) => setTimeout(r, 1200 * percobaan));
    }
  }
}

export async function ambilSemuaHasilUjian() {
  cekKoneksiSupabase();
  const { data, error } = await supabase
    .from('hasil_ujian')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
