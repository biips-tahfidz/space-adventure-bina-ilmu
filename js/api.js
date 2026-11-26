import { supabase } from './supabase.js';

// Ambil semua soal urut dari yang terlama
export async function ambilSemuaSoal() {
  const { data, error } = await supabase
    .from('soal')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// Tambah soal baru
export async function tambahSoal(payload) {
  const { data, error } = await supabase
    .from('soal')
    .insert([payload])
    .select();

  if (error) throw error;
  return data[0];
}

// Update / Edit soal (berlaku untuk PG, Isian, maupun Uraian)
export async function updateSoal(id, payload) {
  const { data, error } = await supabase
    .from('soal')
    .update(payload)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
}

// Hapus soal
export async function hapusSoal(id) {
  const { error } = await supabase
    .from('soal')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
