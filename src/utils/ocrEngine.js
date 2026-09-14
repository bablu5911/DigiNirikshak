/**
 * Persistent Singleton Tesseract.js Worker Engine
 * Maintains an active WebAssembly worker in memory across multiple scans and crops
 * to eliminate worker re-initialization lag.
 */
import Tesseract from 'tesseract.js';
import { preprocessImage } from './imagePreprocessor';

let singletonWorker = null;
let initPromise = null;
let currentProgressCallback = null;

// Initialize or return the cached singleton worker instance
async function getSingletonWorker() {
  if (singletonWorker) {
    return singletonWorker;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (currentProgressCallback) {
            if (m.status === 'recognizing text') {
              const pct = Math.round((m.progress || 0) * 100);
              currentProgressCallback(pct, `Scanning packaging text... ${pct}%`);
            } else if (m.status === 'loading tesseract core') {
              currentProgressCallback(15, 'Loading WebAssembly OCR core...');
            } else if (m.status === 'initializing tesseract') {
              currentProgressCallback(30, 'Initializing OCR worker thread...');
            } else if (m.status === 'loading language traineddata') {
              currentProgressCallback(50, 'Loading English linguistic models...');
            } else {
              currentProgressCallback(10, m.status || 'Preparing OCR...');
            }
          }
        }
      });

      singletonWorker = worker;
      return worker;
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

/**
 * Execute OCR on an image source with automatic pre-processing
 * @param {string} imageSource - Data URL or image path
 * @param {function} onProgress - Callback receiving (progressPercent, statusText)
 */
export async function runOcr(imageSource, onProgress) {
  currentProgressCallback = onProgress;

  try {
    if (onProgress) onProgress(5, 'Optimizing packaging image resolution & contrast...');

    // 1. Auto-downscale to max 1600px and enhance contrast
    const preprocessedDataUrl = await preprocessImage(imageSource, 1600);

    if (onProgress) onProgress(20, 'Acquiring persistent OCR engine worker...');

    // 2. Fetch persistent singleton worker
    const worker = await getSingletonWorker();

    if (onProgress) onProgress(35, 'Analyzing Principal Display Panel...');

    // 3. Recognize characters
    const result = await worker.recognize(preprocessedDataUrl);

    if (onProgress) onProgress(100, 'Compliance OCR extraction complete');

    return {
      text: result.data.text || '',
      confidence: Math.round(result.data.confidence || 0),
      lines: (result.data.lines || []).map(l => ({
        text: l.text,
        bbox: l.bbox,
        confidence: l.confidence
      })),
      words: (result.data.words || []).map(w => ({
        text: w.text,
        bbox: w.bbox,
        confidence: w.confidence
      }))
    };
  } catch (error) {
    console.error('Singleton OCR Execution Error:', error);
    throw error;
  } finally {
    currentProgressCallback = null;
  }
}
