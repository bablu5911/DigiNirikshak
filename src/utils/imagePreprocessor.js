/**
 * Image Pre-processing Utility
 * Downscales oversized camera captures and applies grayscale + contrast stretching
 * to eliminate browser lag and maximize Tesseract OCR text recognition on packaging.
 */

export async function preprocessImage(imageSource, maxDimension = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;

      // 1. Calculate downscaled dimensions (max 1600px)
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

        // 2. Compute min and max luminance for contrast stretching
        let minLum = 255;
        let maxLum = 0;

        for (let i = 0; i < data.length; i += 4) {
          // Standard ITU-R BT.601 luminance formula
          const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          if (lum < minLum) minLum = lum;
          if (lum > maxLum) maxLum = lum;
        }

        // Avoid division by zero
        const lumRange = Math.max(1, maxLum - minLum);

        // 3. Apply grayscale conversion and contrast stretching
        for (let i = 0; i < data.length; i += 4) {
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Stretch luminance to full [0, 255] dynamic range
          const stretched = Math.min(255, Math.max(0, Math.round(((lum - minLum) / lumRange) * 255)));

          // Mild high-contrast curve to sharpen packaging text
          const enhanced = stretched < 128 
            ? Math.max(0, stretched * 0.85) 
            : Math.min(255, stretched * 1.12);

          data[i] = enhanced;     // R
          data[i + 1] = enhanced; // G
          data[i + 2] = enhanced; // B
          // Alpha data[i + 3] remains unchanged
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      } catch (err) {
        // If getImageData has CORS restrictions on an external URL, fallback to downscaled canvas
        console.warn('Contrast enhancement skipped due to CORS, using scaled canvas:', err);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      }
    };

    img.onerror = (err) => reject(new Error('Failed to load image for pre-processing: ' + err));
    img.src = imageSource;
  });
}
