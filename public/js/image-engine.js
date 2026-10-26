/**
 * Image Engine - Pure client-side Canvas 2D image processing
 */

export function loadImage(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(fileOrBlob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file.'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, type = 'image/jpeg', quality = 0.85) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

// 1. COMPRESS IMAGE
export async function compressImage(file, options, onProgress) {
  if (onProgress) onProgress('Loading image...');
  const img = await loadImage(file);

  const quality = (parseInt(options.quality, 10) || 75) / 100;
  const maxDim = parseInt(options.maxDimension, 10) || 1920;

  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  if (onProgress) onProgress('Compressing image on canvas...');
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob,
    filename: `${baseName}-compressed.jpg`,
    originalSize: file.size,
    newSize: blob.size,
    dimensions: `${width} × ${height} px`
  };
}

// 2. COMPRESS IMAGE TO EXACT TARGET KB (Binary Search Optimizer)
export async function compressImageToTargetKb(file, options, onProgress) {
  if (onProgress) onProgress('Loading image...');
  const img = await loadImage(file);

  let targetKb = 50;
  if (options.targetKb === 'custom') {
    targetKb = parseInt(options.customKb, 10) || 50;
  } else {
    targetKb = parseInt(options.targetKb, 10) || 50;
  }
  const targetBytes = targetKb * 1024;

  if (onProgress) onProgress(`Optimizing image to stay under ${targetKb} KB...`);

  let lowQuality = 0.05;
  let highQuality = 0.95;
  let bestBlob = null;
  let scale = 1.0;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  for (let attempt = 0; attempt < 8; attempt++) {
    const curW = Math.round(img.width * scale);
    const curH = Math.round(img.height * scale);
    canvas.width = curW;
    canvas.height = curH;
    ctx.drawImage(img, 0, 0, curW, curH);

    const midQuality = (lowQuality + highQuality) / 2;
    const blob = await canvasToBlob(canvas, 'image/jpeg', midQuality);

    if (blob.size <= targetBytes) {
      bestBlob = blob;
      lowQuality = midQuality; // Try to get higher quality while staying under
    } else {
      highQuality = midQuality; // Too large, reduce quality
    }

    // If even low quality is too large, downscale image by 20%
    if (highQuality < 0.25 && blob.size > targetBytes && scale > 0.3) {
      scale *= 0.8;
      lowQuality = 0.2;
      highQuality = 0.85;
    }
  }

  // Fallback if not found
  if (!bestBlob) {
    canvas.width = Math.round(img.width * 0.5);
    canvas.height = Math.round(img.height * 0.5);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    bestBlob = await canvasToBlob(canvas, 'image/jpeg', 0.4);
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob: bestBlob,
    filename: `${baseName}-${targetKb}kb.jpg`,
    originalSize: file.size,
    newSize: bestBlob.size,
    dimensions: `${canvas.width} × ${canvas.height} px`
  };
}

// 3. RESIZE IMAGE
export async function resizeImage(file, options, onProgress) {
  const img = await loadImage(file);

  let targetW = parseInt(options.width, 10) || img.width;
  let targetH = parseInt(options.height, 10) || img.height;

  if (options.maintainAspect) {
    const ratio = img.width / img.height;
    if (options.width && !options.height) {
      targetH = Math.round(targetW / ratio);
    } else if (options.height && !options.width) {
      targetW = Math.round(targetH * ratio);
    }
  }

  if (onProgress) onProgress(`Resizing to ${targetW} × ${targetH} px...`);
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const isPng = file.type === 'image/png';
  const blob = await canvasToBlob(canvas, isPng ? 'image/png' : 'image/jpeg', 0.9);
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob,
    filename: `${baseName}-resized.${isPng ? 'png' : 'jpg'}`,
    dimensions: `${targetW} × ${targetH} px`
  };
}

// 4. CROP IMAGE
export async function cropImage(file, options, onProgress) {
  const img = await loadImage(file);
  const { width, height } = img;

  let cropW = width;
  let cropH = height;
  let cropX = 0;
  let cropY = 0;

  const ratioOption = options.aspectRatio || 'free';
  if (ratioOption === '1:1') {
    const size = Math.min(width, height);
    cropW = size;
    cropH = size;
    cropX = (width - size) / 2;
    cropY = (height - size) / 2;
  } else if (ratioOption === '4:3') {
    if (width / height > 4 / 3) {
      cropW = Math.round(height * (4 / 3));
      cropX = (width - cropW) / 2;
    } else {
      cropH = Math.round(width * (3 / 4));
      cropY = (height - cropH) / 2;
    }
  } else if (ratioOption === '16:9') {
    if (width / height > 16 / 9) {
      cropW = Math.round(height * (16 / 9));
      cropX = (width - cropW) / 2;
    } else {
      cropH = Math.round(width * (9 / 16));
      cropY = (height - cropH) / 2;
    }
  } else if (ratioOption === '35:45') {
    // Standard Passport Aspect Ratio
    if (width / height > 35 / 45) {
      cropW = Math.round(height * (35 / 45));
      cropX = (width - cropW) / 2;
    } else {
      cropH = Math.round(width * (45 / 35));
      cropY = (height - cropH) / 2;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = cropW;
  canvas.height = cropH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob,
    filename: `${baseName}-cropped.jpg`,
    dimensions: `${cropW} × ${cropH} px`
  };
}

// 5. ROTATE & FLIP IMAGE
export async function rotateAndFlipImage(file, options, onProgress) {
  const img = await loadImage(file);
  const angle = parseInt(options.angle, 10) || 0;
  const flipH = !!options.flipH;
  const flipV = !!options.flipV;

  const isSwap = angle === 90 || angle === 270;
  const canvas = document.createElement('canvas');
  canvas.width = isSwap ? img.height : img.width;
  canvas.height = isSwap ? img.width : img.height;

  const ctx = canvas.getContext('2d');
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob,
    filename: `${baseName}-transformed.jpg`
  };
}

// 6. CONVERT IMAGE FORMAT
export async function convertImageFormat(file, options, onProgress) {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  // Fill white background for non-alpha formats like JPEG
  const targetFormat = options.targetFormat || 'jpg';
  if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  let mimeType = 'image/jpeg';
  let ext = 'jpg';
  let quality = (parseInt(options.quality, 10) || 85) / 100;

  if (targetFormat === 'png') {
    mimeType = 'image/png';
    ext = 'png';
  } else if (targetFormat === 'webp') {
    mimeType = 'image/webp';
    ext = 'webp';
  }

  const blob = await canvasToBlob(canvas, mimeType, quality);
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob,
    filename: `${baseName}.${ext}`,
    dimensions: `${canvas.width} × ${canvas.height} px`
  };
}

// 7. PHOTO EDITOR & FILTERS
export async function applyPhotoFilters(file, options, onProgress) {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  const filter = options.filter || 'none';
  const brightness = parseInt(options.brightness, 10) || 100;
  const contrast = parseInt(options.contrast, 10) || 100;

  let filterStr = `brightness(${brightness}%) contrast(${contrast}%)`;
  if (filter === 'grayscale') filterStr += ' grayscale(100%)';
  else if (filter === 'sepia') filterStr += ' sepia(100%)';
  else if (filter === 'invert') filterStr += ' invert(100%)';
  else if (filter === 'blur') filterStr += ' blur(4px)';

  ctx.filter = filterStr;
  ctx.drawImage(img, 0, 0);

  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob,
    filename: `${baseName}-filtered.jpg`
  };
}

// 8. WATERMARK IMAGE
export async function watermarkImage(file, options, onProgress) {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0);

  const text = options.text || '© Watermark';
  const color = options.color || '#ffffff';
  const opacity = (parseInt(options.opacity, 10) || 60) / 100;
  const position = options.position || 'bottom-right';

  const fontSize = Math.max(20, Math.round(canvas.width / 25));
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;

  const textMetrics = ctx.measureText(text);
  const textW = textMetrics.width;
  const pad = fontSize;

  let x = canvas.width - textW - pad;
  let y = canvas.height - pad;

  if (position === 'center') {
    x = (canvas.width - textW) / 2;
    y = canvas.height / 2;
  } else if (position === 'bottom-left') {
    x = pad;
    y = canvas.height - pad;
  } else if (position === 'top-right') {
    x = canvas.width - textW - pad;
    y = pad + fontSize;
  }

  // Draw soft text shadow for legibility
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 6;
  ctx.fillText(text, x, y);

  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob,
    filename: `${baseName}-watermarked.jpg`
  };
}

// 9. MEME GENERATOR
export async function memeGenerator(file, options, onProgress) {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0);

  const topText = (options.topText || '').toUpperCase();
  const bottomText = (options.bottomText || '').toUpperCase();
  const fontSize = parseInt(options.fontSize, 10) || Math.max(24, Math.round(canvas.width / 14));

  ctx.font = `900 ${fontSize}px Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(3, Math.round(fontSize / 8));
  ctx.lineJoin = 'round';

  if (topText) {
    ctx.strokeText(topText, canvas.width / 2, fontSize + 15);
    ctx.fillText(topText, canvas.width / 2, fontSize + 15);
  }

  if (bottomText) {
    ctx.strokeText(bottomText, canvas.width / 2, canvas.height - 25);
    ctx.fillText(bottomText, canvas.width / 2, canvas.height - 25);
  }

  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob,
    filename: `${baseName}-meme.jpg`
  };
}

// 10. BLUR SENSITIVE AREA / FACE
export async function blurFaceArea(file, options, onProgress) {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0);

  // Apply blur to central 30% area by default if no interactive box provided
  const boxW = Math.round(canvas.width * 0.35);
  const boxH = Math.round(canvas.height * 0.35);
  const boxX = Math.round((canvas.width - boxW) / 2);
  const boxY = Math.round((canvas.height - boxH) / 3);

  const strength = parseInt(options.blurStrength, 10) || 15;

  // Pixelate algorithm
  const pixelSize = Math.max(8, strength);
  const areaCanvas = document.createElement('canvas');
  const smallW = Math.max(1, Math.round(boxW / pixelSize));
  const smallH = Math.max(1, Math.round(boxH / pixelSize));

  areaCanvas.width = smallW;
  areaCanvas.height = smallH;
  const areaCtx = areaCanvas.getContext('2d');
  areaCtx.drawImage(canvas, boxX, boxY, boxW, boxH, 0, 0, smallW, smallH);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(areaCanvas, 0, 0, smallW, smallH, boxX, boxY, boxW, boxH);
  ctx.imageSmoothingEnabled = true;

  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob,
    filename: `${baseName}-blurred.jpg`
  };
}

// 11. EXAM PHOTO RESIZER
export async function examPhotoResizer(file, options, onProgress) {
  const preset = options.preset || 'passport_2x2';

  if (preset === 'passport_2x2') {
    return resizeImage(file, { width: 600, height: 600, maintainAspect: false }, onProgress);
  } else if (preset === 'visa_35x45') {
    return resizeImage(file, { width: 413, height: 531, maintainAspect: false }, onProgress);
  } else if (preset === 'form_photo') {
    return compressImageToTargetKb(file, { targetKb: 50 }, onProgress);
  } else if (preset === 'form_signature') {
    return compressImageToTargetKb(file, { targetKb: 20 }, onProgress);
  }

  return compressImageToTargetKb(file, { targetKb: 50 }, onProgress);
}

// 12. TEXT TO HANDWRITING
export async function textToHandwriting(options, onProgress) {
  const text = options.text || 'Handwritten note';
  const inkColor = options.inkColor || '#1d4ed8';

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');

  // Draw lined stationery paper background
  ctx.fillStyle = '#fefdfa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Red left margin line
  ctx.strokeStyle = '#fca5a5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 0);
  ctx.lineTo(140, canvas.height);
  ctx.stroke();

  // Blue horizontal ruled lines
  ctx.strokeStyle = '#e0e7ff';
  ctx.lineWidth = 1.5;
  const lineSpacing = 42;
  const startY = 120;

  for (let y = startY; y < canvas.height - 60; y += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(canvas.width - 40, y);
    ctx.stroke();
  }

  // Draw text with cursive feel and subtle organic offsets
  ctx.fillStyle = inkColor;
  ctx.font = '26px "Brush Script MT", "Segoe Script", "Caveat", cursive, sans-serif';

  const lines = text.split('\n');
  let curY = startY - 10;

  for (const line of lines) {
    // Add natural subtle baseline wave
    let curX = 165;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const charY = curY + (Math.sin(i * 0.4) * 1.5);
      ctx.fillText(char, curX, charY);
      curX += ctx.measureText(char).width;
    }
    curY += lineSpacing;
    if (curY > canvas.height - 80) break;
  }

  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  return {
    blob,
    filename: 'handwritten-notes.jpg'
  };
}
