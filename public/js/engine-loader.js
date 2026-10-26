/**
 * Engine Loader - On-demand, lazy-loaded client libraries with local vendor priority and CDN fallback
 */

const ENGINES = {
  pdfLib: {
    urls: [
      '/vendor/pdf-lib.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
      'https://unpkg.com/@cantoo/pdf-lib@2.7.4/dist/pdf-lib.min.js'
    ],
    global: 'PDFLib',
    name: 'PDF-Lib Core Engine'
  },
  pdfjs: {
    urls: [
      '/vendor/pdf.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
      'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js'
    ],
    global: 'pdfjsLib',
    name: 'PDF.js Rendering Engine',
    init: (lib) => {
      if (lib && !lib.GlobalWorkerOptions.workerSrc) {
        lib.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.min.js';
      }
    }
  },
  jszip: {
    urls: [
      '/vendor/jszip.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
      'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js'
    ],
    global: 'JSZip',
    name: 'JSZip Archive Engine'
  },
  tesseract: {
    urls: [
      'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract.min.js'
    ],
    global: 'Tesseract',
    name: 'Tesseract OCR Engine'
  }
};

const loadedCache = new Map();

export async function loadEngine(engineKey, onProgress) {
  if (loadedCache.has(engineKey)) {
    return loadedCache.get(engineKey);
  }

  const spec = ENGINES[engineKey];
  if (!spec) {
    throw new Error(`Unknown engine key: ${engineKey}`);
  }

  // Check if global already present in window
  if (window[spec.global]) {
    if (spec.init) spec.init(window[spec.global]);
    loadedCache.set(engineKey, window[spec.global]);
    return window[spec.global];
  }

  if (onProgress) onProgress(`Loading ${spec.name}...`);

  let lastError = null;
  for (const url of spec.urls) {
    try {
      await loadScript(url);
      const instance = window[spec.global];
      if (instance) {
        if (spec.init) spec.init(instance);
        loadedCache.set(engineKey, instance);
        if (onProgress) onProgress(`${spec.name} ready!`);
        return instance;
      }
    } catch (err) {
      lastError = err;
      console.warn(`Fallback: Failed to load ${spec.name} from ${url}:`, err);
    }
  }

  throw new Error(`Could not load ${spec.name}: ${lastError ? lastError.message : 'Network error'}`);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.hasAttribute('data-loaded')) {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (e) => reject(e));
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    script.onload = () => {
      script.setAttribute('data-loaded', 'true');
      resolve();
    };
    script.onerror = (e) => reject(new Error(`Failed to load script ${src}`));

    document.head.appendChild(script);
  });
}
