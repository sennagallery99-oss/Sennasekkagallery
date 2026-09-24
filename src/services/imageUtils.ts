/**
 * Utilities for client-side image optimization, compression, and formatting.
 * Ensures uploaded photos from phones / cameras never exceed PHP / MySQL payload limits.
 */

export const compressImageFile = async (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If it's not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('File bukan gambar yang valid'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight = height;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw and compress
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Gagal memuat format gambar untuk kompresi'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file gambar dari perangkat'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Checks if a base64 string is oversized (> 1.5MB) and downscales it.
 */
export const compressBase64IfNeeded = async (
  dataUrl: string,
  maxWidth = 1200,
  quality = 0.8
): Promise<string> => {
  if (!dataUrl.startsWith('data:image/')) return dataUrl;
  if (dataUrl.length < 800000) return dataUrl; // Less than ~600KB, perfectly fine

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};
