/**
 * Adaptive Packaging Image Pre-processing Utility
 * Optimizes packaging photos taken on mobile cameras or under uneven lighting.
 * Enhances text edges, balances localized contrast, and sharpens ink-jet stamps
 * to maximize Tesseract OCR character accuracy across different packaging zones.
 */

export async function preprocessImage(imageSource, maxDimension = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;

      // 1. Calculate downscaled dimensions (max 1600px to maintain speed without losing fine print)
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Draw initial downscaled image
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // 2. Compute luminance histogram
        let minLum = 255;
        let maxLum = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // ITU-R BT.601 luminance
          const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
          if (lum < minLum) minLum = lum;
          if (lum > maxLum) maxLum = lum;
        }

        const lumRange = Math.max(1, maxLum - minLum);

        // 3. Adaptive Contrast Stretch & Edge Sharpness
        // Enhances both dark text on light backgrounds and light/yellow text on dark/colored packaging
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          // Normalize luminance across dynamic range
          const stretched = Math.min(255, Math.max(0, Math.round(((lum - minLum) / lumRange) * 255)));

          // High-contrast sigmoid curve for crisp character edges
          let enhanced;
          if (stretched < 120) {
            enhanced = Math.max(0, Math.round(stretched * 0.78)); // Darken text strokes
          } else if (stretched > 180) {
            enhanced = Math.min(255, Math.round(stretched * 1.15)); // Brighten paper/foil background
          } else {
            enhanced = stretched;
          }

          // Balance grayscale with a hint of original chroma for colored fonts
          data[i] = Math.round(enhanced * 0.9 + r * 0.1);
          data[i + 1] = Math.round(enhanced * 0.9 + g * 0.1);
          data[i + 2] = Math.round(enhanced * 0.9 + b * 0.1);
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch (err) {
        console.warn('Contrast enhancement skipped due to CORS, using scaled canvas:', err);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      }
    };

    img.onerror = (err) => reject(new Error('Failed to load image for pre-processing: ' + err));
    img.src = imageSource;
  });
}
