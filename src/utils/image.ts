/**
 * Compresses an uploaded image to a maximum dimension and JPEG quality
 * to ensure fast uploads to Firebase Realtime Database.
 */
export async function comprimirImagen(file: File, maxDim = 1280, quality = 0.8): Promise<string> {
  // If createImageBitmap with orientation is supported, use it to respect EXIF rotation
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      let w = bitmap.width;
      let h = bitmap.height;

      if (w > h) {
        if (w > maxDim) {
          h = Math.round(h * (maxDim / w));
          w = maxDim;
        }
      } else {
        if (h > maxDim) {
          w = Math.round(w * (maxDim / h));
          w = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, w, h);
        bitmap.close();
        return canvas.toDataURL('image/jpeg', quality);
      }
    } catch {
      // fallback to FileReader
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen'));
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;

        if (w > h) {
          if (w > maxDim) {
            h = Math.round(h * (maxDim / w));
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round(w * (maxDim / h));
            w = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(img.src);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    };
  });
}

/**
 * Specifically processes a schedule/shift document (Planilla de Turnos)
 * preserving complete aspect ratio, correcting EXIF camera orientation,
 * and ensuring ultra-sharp high resolution (up to 2048px) so all text,
 * numbers, and table lines remain crisp and perfectly readable.
 */
export async function comprimirPlanillaDocumento(file: File, maxDim = 2048, quality = 0.88): Promise<string> {
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      let w = bitmap.width;
      let h = bitmap.height;

      if (w > h) {
        if (w > maxDim) {
          h = Math.round(h * (maxDim / w));
          w = maxDim;
        }
      } else {
        if (h > maxDim) {
          w = Math.round(w * (maxDim / h));
          w = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, w, h);
        bitmap.close();
        return canvas.toDataURL('image/jpeg', quality);
      }
    } catch {
      // fallback to FileReader
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen'));
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onerror = () => reject(new Error('Error al cargar la planilla'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;

        if (w > h) {
          if (w > maxDim) {
            h = Math.round(h * (maxDim / w));
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round(w * (maxDim / h));
            w = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(img.src);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    };
  });
}

/**
 * Specifically processes a profile carnet picture into a high-quality square 1:1 image
 * centered on the subject, avoiding any distortion, stretching, or loss of clarity.
 */
export async function comprimirFotoPerfil(file: File, targetSize = 600, quality = 0.85): Promise<string> {
  // Use createImageBitmap to properly orient camera selfies / uploads
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const w = bitmap.width;
      const h = bitmap.height;
      const minDim = Math.min(w, h);
      const sx = (w - minDim) / 2;
      const sy = (h - minDim) / 2;

      const canvas = document.createElement('canvas');
      const size = Math.min(targetSize, minDim);
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, sx, sy, minDim, minDim, 0, 0, size, size);
        bitmap.close();
        return canvas.toDataURL('image/jpeg', quality);
      }
    } catch {
      // fallback to standard Image
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onerror = () => reject(new Error('Error al cargar la foto'));
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const minDim = Math.min(w, h);
        const sx = (w - minDim) / 2;
        const sy = (h - minDim) / 2;

        const canvas = document.createElement('canvas');
        const size = Math.min(targetSize, minDim);
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(img.src);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    };
  });
}

/**
 * Gets GPS Coordinates as a Google Maps link.
 * Falls back safely if location is denied or unavailable.
 */
export async function obtenerCoordenadas(): Promise<string | null> {
  // Check Capacitor if present
  const cap = (window as unknown as { Capacitor?: { Plugins?: { Geolocation?: { requestPermissions: () => Promise<void>; getCurrentPosition: (opt: { enableHighAccuracy: boolean; timeout: number }) => Promise<{ coords: { latitude: number; longitude: number } }> } } } }).Capacitor;
  if (cap?.Plugins?.Geolocation) {
    try {
      await cap.Plugins.Geolocation.requestPermissions();
      const c = await cap.Plugins.Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 7000 });
      return `https://www.google.com/maps?q=${c.coords.latitude},${c.coords.longitude}`;
    } catch {
      // fallback to browser
    }
  }

  if (!navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve(`https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`);
      },
      () => {
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
}

/**
 * Returns an object with the map link for compatibility
 */
export async function obtenerCoordenadasGPS(): Promise<{ mapa: string | null }> {
  const mapa = await obtenerCoordenadas();
  return { mapa };
}
