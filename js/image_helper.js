// Kompres gambar otomatis ke WebP/JPEG ringan (< 80KB) agar cepat dimuat di jaringan lambat
export function prosesFileGambarKeBase64(file, maxLebar = 720, kualitas = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('File bukan gambar yang valid.'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxLebar) {
          height = Math.round((height * maxLebar) / width);
          width = maxLebar;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/webp', kualitas);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('Gagal memproses gambar.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}

// Ambil gambar dari event Paste (Ctrl+V)
export async function ambilGambarDariPaste(clipboardEvent) {
  const items = clipboardEvent.clipboardData?.items;
  if (!items) return null;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        return await prosesFileGambarKeBase64(file);
      }
    }
  }
  return null;
}
