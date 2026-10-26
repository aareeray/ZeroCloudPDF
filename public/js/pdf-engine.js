/**
 * PDF Engine - Pure client-side PDF operations using pdf-lib and pdf.js
 */

import { loadEngine } from './engine-loader.js';

export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export function parsePageRange(rangeStr, totalPages) {
  if (!rangeStr || !rangeStr.trim()) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set();
  const parts = rangeStr.split(/[\s,]+/);

  for (const part of parts) {
    if (!part) continue;
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr, 10) || 1);
      const end = Math.min(totalPages, parseInt(endStr, 10) || totalPages);
      for (let i = start; i <= end; i++) {
        pages.add(i);
      }
    } else {
      const num = parseInt(part, 10);
      if (num >= 1 && num <= totalPages) {
        pages.add(num);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

// 1. MERGE PDF
export async function mergePdfs(files, onProgress) {
  if (!files || files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  const { PDFDocument } = await loadEngine('pdfLib', onProgress);
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) onProgress(`Merging file ${i + 1} of ${files.length}: ${file.name}...`);
    const buffer = await readFileAsArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  if (onProgress) onProgress('Finalizing merged document...');
  const bytes = await mergedPdf.save();
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: 'merged.pdf'
  };
}

// 2. SPLIT PDF
export async function splitPdf(file, options, onProgress) {
  const { PDFDocument } = await loadEngine('pdfLib', onProgress);
  const buffer = await readFileAsArrayBuffer(file);
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  const selectedPages = parsePageRange(options.ranges || '1', totalPages);
  if (selectedPages.length === 0) {
    throw new Error('No valid pages found in the specified range.');
  }

  if (onProgress) onProgress(`Extracting ${selectedPages.length} pages...`);
  const newDoc = await PDFDocument.create();
  // 0-based indices for pdf-lib
  const indices = selectedPages.map(p => p - 1);
  const copiedPages = await newDoc.copyPages(srcDoc, indices);
  copiedPages.forEach(p => newDoc.addPage(p));

  const bytes = await newDoc.save();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: `${baseName}-split.pdf`
  };
}

// 3. ORGANIZE / REORDER PAGES
export async function organizePages(file, order, onProgress) {
  const { PDFDocument } = await loadEngine('pdfLib', onProgress);
  const buffer = await readFileAsArrayBuffer(file);
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  const validOrder = (order && order.length > 0)
    ? order.filter(n => n >= 1 && n <= totalPages)
    : Array.from({ length: totalPages }, (_, i) => i + 1);

  const newDoc = await PDFDocument.create();
  const indices = validOrder.map(n => n - 1);
  const copiedPages = await newDoc.copyPages(srcDoc, indices);
  copiedPages.forEach(p => newDoc.addPage(p));

  const bytes = await newDoc.save();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: `${baseName}-organized.pdf`
  };
}

// 4. ROTATE PDF
export async function rotatePdf(file, options, onProgress) {
  const { PDFDocument, degrees } = await loadEngine('pdfLib', onProgress);
  const buffer = await readFileAsArrayBuffer(file);
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  const angle = parseInt(options.angle, 10) || 90;
  const pages = doc.getPages();

  if (onProgress) onProgress(`Rotating ${pages.length} pages by ${angle}°...`);
  pages.forEach(page => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angle) % 360));
  });

  const bytes = await doc.save();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: `${baseName}-rotated.pdf`
  };
}

// 5. EXTRACT PAGES
export async function extractPages(file, options, onProgress) {
  return splitPdf(file, { ranges: options.pages }, onProgress);
}

// 6. DELETE PAGES
export async function deletePages(file, options, onProgress) {
  const { PDFDocument } = await loadEngine('pdfLib', onProgress);
  const buffer = await readFileAsArrayBuffer(file);
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  const toDelete = new Set(parsePageRange(options.pages, totalPages));
  const toKeep = [];
  for (let i = 1; i <= totalPages; i++) {
    if (!toDelete.has(i)) {
      toKeep.push(i - 1);
    }
  }

  if (toKeep.length === 0) {
    throw new Error('Cannot delete all pages in the PDF.');
  }

  const newDoc = await PDFDocument.create();
  const copied = await newDoc.copyPages(srcDoc, toKeep);
  copied.forEach(p => newDoc.addPage(p));

  const bytes = await newDoc.save();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: `${baseName}-cleaned.pdf`
  };
}

// 7. CREATE BLANK PDF
export async function createBlankPdf(options, onProgress) {
  const { PDFDocument, PageSizes } = await loadEngine('pdfLib', onProgress);
  const doc = await PDFDocument.create();

  const count = parseInt(options.pageCount, 10) || 1;
  const sizeMap = {
    A4: PageSizes.A4,
    Letter: PageSizes.Letter,
    Legal: PageSizes.Legal,
    A3: PageSizes.A3
  };

  let pageSize = sizeMap[options.size] || PageSizes.A4;
  if (options.orientation === 'landscape') {
    pageSize = [pageSize[1], pageSize[0]];
  }

  for (let i = 0; i < count; i++) {
    doc.addPage(pageSize);
  }

  const bytes = await doc.save();
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: `blank-${options.size.toLowerCase()}-${count}p.pdf`
  };
}

// 8. PAGES PER SHEET (N-Up)
export async function pagesPerSheet(file, options, onProgress) {
  const { PDFDocument, PageSizes } = await loadEngine('pdfLib', onProgress);
  const buffer = await readFileAsArrayBuffer(file);
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const outDoc = await PDFDocument.create();

  const n = parseInt(options.layout, 10) || 2;
  const totalPages = srcDoc.getPageCount();

  if (onProgress) onProgress(`Imposing ${totalPages} pages at ${n} per sheet...`);

  // Target sheet is A4 Landscape for 2-up, A4 Portrait for 4-up
  const sheetWidth = n === 2 ? 841.89 : 595.28;
  const sheetHeight = n === 2 ? 595.28 : 841.89;

  for (let i = 0; i < totalPages; i += n) {
    const sheet = outDoc.addPage([sheetWidth, sheetHeight]);
    for (let slot = 0; slot < n; slot++) {
      const pageIdx = i + slot;
      if (pageIdx >= totalPages) break;

      const [embedded] = await outDoc.embedPdf(srcDoc, [pageIdx]);
      if (n === 2) {
        const slotWidth = sheetWidth / 2;
        const scale = Math.min((slotWidth - 20) / embedded.width, (sheetHeight - 20) / embedded.height);
        const drawW = embedded.width * scale;
        const drawH = embedded.height * scale;
        const x = slot * slotWidth + (slotWidth - drawW) / 2;
        const y = (sheetHeight - drawH) / 2;
        sheet.drawPage(embedded, { x, y, width: drawW, height: drawH });
      } else {
        // 4-up (2x2 grid)
        const col = slot % 2;
        const row = Math.floor(slot / 2);
        const cellW = sheetWidth / 2;
        const cellH = sheetHeight / 2;
        const scale = Math.min((cellW - 16) / embedded.width, (cellH - 16) / embedded.height);
        const drawW = embedded.width * scale;
        const drawH = embedded.height * scale;
        const x = col * cellW + (cellW - drawW) / 2;
        const y = (1 - row) * cellH + (cellH - drawH) / 2;
        sheet.drawPage(embedded, { x, y, width: drawW, height: drawH });
      }
    }
  }

  const bytes = await outDoc.save();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: `${baseName}-${n}up.pdf`
  };
}

// 9. COMPRESS PDF
export async function compressPdf(file, options, onProgress) {
  const { PDFDocument } = await loadEngine('pdfLib', onProgress);
  const buffer = await readFileAsArrayBuffer(file);
  if (onProgress) onProgress('Analyzing PDF structure...');

  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  // Strip extraneous metadata and optimize objects
  doc.setTitle('');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setKeywords([]);
  doc.setProducer('A Thousand Tools (Optimized)');
  doc.setCreator('A Thousand Tools');

  if (onProgress) onProgress('Compressing content streams and deduplicating resources...');
  const bytes = await doc.save({
    useObjectStreams: true,
    addDefaultPage: false
  });

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: `${baseName}-compressed.pdf`
  };
}

// 10. FLATTEN PDF
export async function flattenPdf(file, options, onProgress) {
  const { PDFDocument } = await loadEngine('pdfLib', onProgress);
  const buffer = await readFileAsArrayBuffer(file);
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  const form = doc.getForm();
  if (form) {
    if (onProgress) onProgress('Flattening interactive form fields...');
    try {
      form.flatten();
    } catch (e) {
      console.warn('Form flatten notice:', e);
    }
  }

  const bytes = await doc.save();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: `${baseName}-flattened.pdf`
  };
}

// 11. REPAIR PDF
export async function repairPdf(file, options, onProgress) {
  const { PDFDocument } = await loadEngine('pdfLib', onProgress);
  const buffer = await readFileAsArrayBuffer(file);
  if (onProgress) onProgress('Attempting structural recovery...');

  const srcDoc = await PDFDocument.load(buffer, {
    ignoreEncryption: true,
    parseSpeed: 1
  });

  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
  pages.forEach(p => newDoc.addPage(p));

  const bytes = await newDoc.save({ useObjectStreams: false });
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: `${baseName}-repaired.pdf`
  };
}

// 12. WATERMARK PDF
export async function watermarkPdf(file, options, onProgress) {
  const { PDFDocument, rgb, degrees, StandardFonts } = await loadEngine('pdfLib', onProgress);
  const buffer = await readFileAsArrayBuffer(file);
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const text = options.text || 'CONFIDENTIAL';
  const opacity = parseFloat(options.opacity) || 0.3;
  const angle = parseInt(options.angle, 10) || 45;
  const fontSize = parseInt(options.fontSize, 10) || 48;

  // Convert hex color to RGB
  const hex = (options.color || '#ef4444').replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const pages = doc.getPages();
  if (onProgress) onProgress(`Watermarking ${pages.length} pages...`);

  pages.forEach(page => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: (height - textHeight) / 2,
      size: fontSize,
      font,
      color: rgb(r, g, b),
      opacity,
      rotate: degrees(angle)
    });
  });

  const bytes = await doc.save();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: `${baseName}-watermarked.pdf`
  };
}

// 13. ADD PAGE NUMBERS
export async function addPageNumbers(file, options, onProgress) {
  const { PDFDocument, rgb, StandardFonts } = await loadEngine('pdfLib', onProgress);
  const buffer = await readFileAsArrayBuffer(file);
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontSize = parseInt(options.fontSize, 10) || 11;
  const format = options.format || 'Page {n} of {total}';
  const position = options.position || 'bottom-center';

  const pages = doc.getPages();
  const total = pages.length;

  pages.forEach((page, idx) => {
    const n = idx + 1;
    const text = format.replace('{n}', n).replace('{total}', total);
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const { width, height } = page.getSize();

    let x = (width - textWidth) / 2;
    let y = 30;

    if (position === 'bottom-right') x = width - textWidth - 40;
    else if (position === 'bottom-left') x = 40;
    else if (position === 'top-right') { x = width - textWidth - 40; y = height - 40; }
    else if (position === 'top-center') { x = (width - textWidth) / 2; y = height - 40; }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.3, 0.35, 0.4)
    });
  });

  const bytes = await doc.save();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: `${baseName}-numbered.pdf`
  };
}

// 14. CROP PDF
export async function cropPdf(file, options, onProgress) {
  const { PDFDocument } = await loadEngine('pdfLib', onProgress);
  const buffer = await readFileAsArrayBuffer(file);
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  const margin = parseInt(options.margin, 10) || 36;
  const pages = doc.getPages();

  pages.forEach(page => {
    const { width, height } = page.getSize();
    page.setCropBox(margin, margin, width - margin * 2, height - margin * 2);
  });

  const bytes = await doc.save();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: `${baseName}-cropped.pdf`
  };
}

// 15. PDF TO IMAGES
export async function pdfToImages(file, options, onProgress) {
  const pdfjsLib = await loadEngine('pdfjs', onProgress);
  const JSZip = await loadEngine('jszip', onProgress);

  const buffer = await readFileAsArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const numPages = pdf.numPages;

  const format = options.format === 'png' ? 'png' : 'jpeg';
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const scale = parseFloat(options.scale) || 2.0;

  const zip = new JSZip();
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) onProgress(`Rendering page ${pageNum} of ${numPages}...`);
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;

    const dataUrl = canvas.toDataURL(mimeType, 0.92);
    const base64Data = dataUrl.split(',')[1];
    zip.file(`${baseName}-page-${pageNum}.${format === 'png' ? 'png' : 'jpg'}`, base64Data, { base64: true });
  }

  if (numPages === 1) {
    // If only one page, return direct image
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve({
          blob,
          filename: `${baseName}.${format === 'png' ? 'png' : 'jpg'}`
        });
      }, mimeType, 0.92);
    });
  }

  if (onProgress) onProgress('Generating ZIP archive...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return {
    blob: zipBlob,
    filename: `${baseName}-images.zip`
  };
}

// 16. IMAGES TO PDF
export async function imagesToPdf(imageFiles, options, onProgress) {
  if (!imageFiles || imageFiles.length === 0) {
    throw new Error('Please select at least one image file.');
  }

  const { PDFDocument, PageSizes } = await loadEngine('pdfLib', onProgress);
  const pdfDoc = await PDFDocument.create();

  const margin = parseInt(options.margin, 10) || 0;
  const pageSizeOption = options.pageSize || 'A4';

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    if (onProgress) onProgress(`Adding image ${i + 1} of ${imageFiles.length}: ${file.name}...`);
    const arrayBuffer = await readFileAsArrayBuffer(file);

    let embeddedImage;
    if (file.type === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(arrayBuffer);
    } else {
      embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
    }

    let pageW = embeddedImage.width + margin * 2;
    let pageH = embeddedImage.height + margin * 2;

    if (pageSizeOption === 'A4') {
      pageW = PageSizes.A4[0];
      pageH = PageSizes.A4[1];
    } else if (pageSizeOption === 'Letter') {
      pageW = PageSizes.Letter[0];
      pageH = PageSizes.Letter[1];
    }

    const page = pdfDoc.addPage([pageW, pageH]);
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;
    const scale = Math.min(maxW / embeddedImage.width, maxH / embeddedImage.height, 1);

    const drawW = embeddedImage.width * scale;
    const drawH = embeddedImage.height * scale;
    const x = margin + (maxW - drawW) / 2;
    const y = margin + (maxH - drawH) / 2;

    page.drawImage(embeddedImage, { x, y, width: drawW, height: drawH });
  }

  const bytes = await pdfDoc.save();
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: 'converted-images.pdf'
  };
}

// 17. PDF TO TEXT
export async function pdfToText(file, options, onProgress) {
  const pdfjsLib = await loadEngine('pdfjs', onProgress);
  const buffer = await readFileAsArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    if (onProgress) onProgress(`Extracting text from page ${i} of ${pdf.numPages}...`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    fullText += `--- Page ${i} ---\n` + strings.join(' ') + '\n\n';
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return {
    blob: new Blob([fullText], { type: 'text/plain;charset=utf-8' }),
    filename: `${baseName}-extracted.txt`,
    previewText: fullText
  };
}

// 18. TEXT TO PDF
export async function textToPdf(options, onProgress) {
  const { PDFDocument, StandardFonts, PageSizes, rgb } = await loadEngine('pdfLib', onProgress);
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = parseInt(options.fontSize, 10) || 12;
  const lineHeight = fontSize * 1.5;
  const margin = 50;
  const [pageW, pageH] = PageSizes.A4;

  let page = doc.addPage(PageSizes.A4);
  let y = pageH - margin;

  // Title
  if (options.title) {
    page.drawText(options.title, {
      x: margin,
      y: y - 10,
      size: fontSize + 8,
      font: boldFont,
      color: rgb(0.1, 0.15, 0.25)
    });
    y -= (fontSize + 8) * 1.8;
  }

  const lines = (options.content || '').split('\n');
  for (const rawLine of lines) {
    if (y < margin + lineHeight) {
      page = doc.addPage(PageSizes.A4);
      y = pageH - margin;
    }

    page.drawText(rawLine, {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2)
    });
    y -= lineHeight;
  }

  const bytes = await doc.save();
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: `${(options.title || 'document').toLowerCase().replace(/\s+/g, '-')}.pdf`
  };
}

// 19. MARKDOWN TO PDF
export async function markdownToPdf(options, onProgress) {
  const { PDFDocument, StandardFonts, PageSizes, rgb } = await loadEngine('pdfLib', onProgress);
  const doc = await PDFDocument.create();
  const normalFont = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage(PageSizes.A4);
  const [pageW, pageH] = PageSizes.A4;
  let y = pageH - 50;
  const margin = 50;

  const lines = (options.content || '').split('\n');
  for (const line of lines) {
    if (y < margin + 30) {
      page = doc.addPage(PageSizes.A4);
      y = pageH - margin;
    }

    if (line.startsWith('# ')) {
      page.drawText(line.replace('# ', ''), { x: margin, y, size: 22, font: boldFont, color: rgb(0.1, 0.15, 0.3) });
      y -= 34;
    } else if (line.startsWith('## ')) {
      page.drawText(line.replace('## ', ''), { x: margin, y, size: 17, font: boldFont, color: rgb(0.2, 0.3, 0.45) });
      y -= 26;
    } else if (line.startsWith('### ')) {
      page.drawText(line.replace('### ', ''), { x: margin, y, size: 14, font: boldFont, color: rgb(0.2, 0.2, 0.2) });
      y -= 22;
    } else if (line.startsWith('- ')) {
      page.drawText('• ' + line.replace('- ', ''), { x: margin + 10, y, size: 11, font: normalFont, color: rgb(0.2, 0.2, 0.2) });
      y -= 18;
    } else {
      page.drawText(line, { x: margin, y, size: 11, font: normalFont, color: rgb(0.25, 0.25, 0.25) });
      y -= 18;
    }
  }

  const bytes = await doc.save();
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    filename: 'markdown-rendered.pdf'
  };
}

// 20. PDF INSPECTOR
export async function inspectPdf(file, options, onProgress) {
  const { PDFDocument } = await loadEngine('pdfLib', onProgress);
  const buffer = await readFileAsArrayBuffer(file);
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  const pageCount = doc.getPageCount();
  const firstPage = doc.getPage(0);
  const { width, height } = firstPage.getSize();

  const report = {
    fileName: file.name,
    fileSize: `${(file.size / 1024).toFixed(1)} KB (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
    pageCount,
    dimensions: `${width.toFixed(1)} × ${height.toFixed(1)} pt (${(width / 72 * 25.4).toFixed(0)} × ${(height / 72 * 25.4).toFixed(0)} mm)`,
    title: doc.getTitle() || '(None)',
    author: doc.getAuthor() || '(None)',
    subject: doc.getSubject() || '(None)',
    producer: doc.getProducer() || '(None)',
    creator: doc.getCreator() || '(None)',
    creationDate: doc.getCreationDate() ? doc.getCreationDate().toISOString() : '(None)',
    modificationDate: doc.getModificationDate() ? doc.getModificationDate().toISOString() : '(None)'
  };

  return {
    report,
    reportText: JSON.stringify(report, null, 2)
  };
}
