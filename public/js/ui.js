/**
 * UI Controller - Interactive workspace, modals, dropzones, previews and notifications
 */

import { TOOLS, CATEGORIES, getToolById, searchTools, getToolsByCategory } from './catalog.js';
import * as pdfEngine from './pdf-engine.js';
import * as imageEngine from './image-engine.js';
import * as cryptoUtils from './crypto-utils.js';

let activeTool = null;
let selectedFiles = [];
let isProcessing = false;

// Toast notification helper
export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Render Tools Grid
export function renderToolsGrid(toolsToRender) {
  const grid = document.getElementById('tools-grid');
  if (!grid) return;

  grid.innerHTML = '';
  if (toolsToRender.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No tools found</h3>
        <p>Try searching for a different keyword or browsing by category.</p>
      </div>
    `;
    return;
  }

  toolsToRender.forEach(tool => {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.setAttribute('data-tool-id', tool.id);
    card.style.setProperty('--tool-accent', tool.color || '#3b82f6');

    card.innerHTML = `
      <div class="tool-card-header">
        <div class="tool-card-icon" style="background-color: ${tool.color}15; color: ${tool.color};">
          ${tool.icon}
        </div>
        ${tool.badge ? `<span class="tool-badge badge-${tool.badge.toLowerCase()}">${tool.badge}</span>` : ''}
      </div>
      <h3 class="tool-card-title">${tool.name}</h3>
      <p class="tool-card-desc">${tool.description}</p>
      <div class="tool-card-footer">
        <span class="tool-category-tag">${tool.category}</span>
        <a href="/tools/${tool.slug}/" class="tool-card-btn" aria-label="Open ${tool.name}">
          Open Tool <span>&rarr;</span>
        </a>
      </div>
    `;

    card.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.pushState({}, '', `/tools/${tool.slug}/`);
      openToolModal(tool.id);
    });

    grid.appendChild(card);
  });
}

// Render Category Filter Pills
export function renderCategoryPills(activeCategory = 'all') {
  const container = document.getElementById('category-pills');
  if (!container) return;

  container.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `category-pill ${cat.id === activeCategory ? 'active' : ''}`;
    btn.innerHTML = `${cat.icon} <span>${cat.name}</span>`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filtered = getToolsByCategory(cat.id);
      renderToolsGrid(filtered);
    });
    container.appendChild(btn);
  });
}

// Open Tool Workspace Modal
export function openToolModal(toolId) {
  const tool = getToolById(toolId);
  if (!tool) return;

  activeTool = tool;
  selectedFiles = [];

  const modal = document.getElementById('tool-modal');
  const modalContent = document.getElementById('modal-tool-content');
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <div class="workspace-header">
      <div class="workspace-title-wrap">
        <div class="workspace-icon" style="background-color: ${tool.color}20; color: ${tool.color};">
          ${tool.icon}
        </div>
        <div>
          <div class="workspace-breadcrumbs" style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">
            <a href="/" style="color: var(--accent-primary);">Home</a> &rsaquo; 
            <a href="/tools" style="color: var(--accent-primary);">All Tools</a> &rsaquo; 
            <span>${tool.name}</span>
          </div>
          <h2 class="workspace-title">${tool.name}</h2>
          <p class="workspace-subtitle">${tool.description}</p>
        </div>
      </div>
      <button class="close-modal-btn" id="close-modal-btn" aria-label="Close dialog">&times;</button>
    </div>

    <div class="workspace-body">
      ${!tool.noUpload ? `
        <!-- File Dropzone -->
        <div class="dropzone" id="file-dropzone">
          <input type="file" id="file-input" ${tool.multiple ? 'multiple' : ''} accept="${tool.accept || '*/*'}" class="dropzone-input" />
          <div class="dropzone-content">
            <div class="dropzone-icon">📁</div>
            <div class="dropzone-text">
              <strong>Click to upload</strong> or drag and drop your ${tool.multiple ? 'files' : 'file'}
            </div>
            <div class="dropzone-hint">
              ${tool.accept ? `Supports ${tool.accept}` : 'Any supported file'} · 100% Client-side processing
            </div>
          </div>
        </div>

        <!-- Selected Files List -->
        <div class="selected-files-list" id="selected-files-list" style="display: none;"></div>
      ` : ''}

      <!-- Dynamic Options Form -->
      <div class="tool-options-form" id="tool-options-form">
        ${renderToolOptions(tool.options)}
      </div>

      <!-- Action Button & Progress -->
      <div class="workspace-actions">
        <button class="primary-action-btn" id="run-tool-btn">
          <span class="btn-icon">⚡</span>
          <span class="btn-text">Execute ${tool.name}</span>
        </button>
      </div>

      <div class="progress-wrap" id="progress-wrap" style="display: none;">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" id="progress-bar-fill"></div>
        </div>
        <div class="progress-status-text" id="progress-status-text">Processing in browser memory...</div>
      </div>

      <!-- Result Container -->
      <div class="result-container" id="result-container" style="display: none;"></div>

      <!-- How to Guide & Benefits -->
      <div class="tool-guide-card" style="margin-top: 16px; padding: 18px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
        <h4 style="font-size: 0.95rem; margin-bottom: 10px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
          <span>💡</span> How to use ${tool.name}
        </h4>
        <ol style="padding-left: 20px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
          ${(tool.howTo || [
            'Upload or drag your file into the box.',
            'Adjust options if needed.',
            'Click Execute and download your result instantly.'
          ]).map(step => `<li>${step}</li>`).join('')}
        </ol>
        <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-color); font-size: 0.8rem; color: #10b981; font-weight: 600;">
          🔒 Private &amp; Local: Files are processed entirely on your device using WebAssembly. Nothing is ever uploaded.
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  document.getElementById('close-modal-btn').addEventListener('click', closeToolModal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (!tool.noUpload) {
    setupDropzone();
  }

  document.getElementById('run-tool-btn').addEventListener('click', executeActiveTool);
}

// Close Tool Modal
export function closeToolModal() {
  const modal = document.getElementById('tool-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  activeTool = null;
  selectedFiles = [];

  // Revert URL to /tools if on tool path
  if (window.location.pathname.startsWith('/tools/')) {
    window.history.pushState({}, '', '/tools');
    document.title = 'All PDF & Image Tools - Directory | A Thousand Tools';
  }
}

// Render dynamic form inputs based on tool option schema
function renderToolOptions(options) {
  if (!options || options.length === 0) return '';

  let html = '<div class="options-grid">';
  options.forEach(opt => {
    html += `<div class="option-group">`;
    html += `<label class="option-label" for="opt-${opt.name}">${opt.label}</label>`;

    if (opt.type === 'text') {
      html += `<input type="text" id="opt-${opt.name}" name="${opt.name}" class="option-input" value="${opt.default || ''}" placeholder="${opt.placeholder || ''}" />`;
    } else if (opt.type === 'password') {
      html += `<input type="password" id="opt-${opt.name}" name="${opt.name}" class="option-input" value="${opt.default || ''}" placeholder="${opt.placeholder || ''}" />`;
    } else if (opt.type === 'number') {
      html += `<input type="number" id="opt-${opt.name}" name="${opt.name}" class="option-input" value="${opt.default || 0}" min="${opt.min ?? ''}" max="${opt.max ?? ''}" />`;
    } else if (opt.type === 'textarea') {
      html += `<textarea id="opt-${opt.name}" name="${opt.name}" class="option-textarea" rows="4" placeholder="${opt.placeholder || ''}">${opt.default || ''}</textarea>`;
    } else if (opt.type === 'select') {
      html += `<select id="opt-${opt.name}" name="${opt.name}" class="option-select">`;
      opt.options.forEach(o => {
        html += `<option value="${o.value}" ${o.value === opt.default ? 'selected' : ''}>${o.label}</option>`;
      });
      html += `</select>`;
    } else if (opt.type === 'range') {
      html += `
        <div class="range-wrap">
          <input type="range" id="opt-${opt.name}" name="${opt.name}" class="option-range" min="${opt.min}" max="${opt.max}" value="${opt.default}" oninput="document.getElementById('val-${opt.name}').textContent = this.value + '${opt.unit || ''}'" />
          <span class="range-value" id="val-${opt.name}">${opt.default}${opt.unit || ''}</span>
        </div>
      `;
    } else if (opt.type === 'color') {
      html += `<input type="color" id="opt-${opt.name}" name="${opt.name}" class="option-color" value="${opt.default || '#000000'}" />`;
    } else if (opt.type === 'checkbox') {
      html += `
        <label class="checkbox-label">
          <input type="checkbox" id="opt-${opt.name}" name="${opt.name}" ${opt.default ? 'checked' : ''} />
          <span>Enable ${opt.label}</span>
        </label>
      `;
    }

    html += `</div>`;
  });
  html += '</div>';
  return html;
}

// Setup Dropzone & File Selection
function setupDropzone() {
  const dropzone = document.getElementById('file-dropzone');
  const input = document.getElementById('file-input');
  if (!dropzone || !input) return;

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  });

  input.addEventListener('change', () => {
    if (input.files && input.files.length > 0) {
      handleFilesSelected(Array.from(input.files));
    }
  });
}

function handleFilesSelected(files) {
  if (activeTool.multiple) {
    selectedFiles = [...selectedFiles, ...files];
  } else {
    selectedFiles = [files[0]];
  }

  renderSelectedFilesList();
}

function renderSelectedFilesList() {
  const list = document.getElementById('selected-files-list');
  if (!list) return;

  if (selectedFiles.length === 0) {
    list.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  list.style.display = 'flex';
  list.innerHTML = selectedFiles.map((f, i) => `
    <div class="file-item-pill">
      <span class="file-item-icon">📄</span>
      <span class="file-item-name" title="${f.name}">${f.name}</span>
      <span class="file-item-size">${(f.size / 1024).toFixed(1)} KB</span>
      <button class="file-remove-btn" data-index="${i}" title="Remove file">&times;</button>
    </div>
  `).join('');

  list.querySelectorAll('.file-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
      selectedFiles.splice(idx, 1);
      renderSelectedFilesList();
    });
  });
}

// Gather Form Options
function collectFormOptions() {
  const options = {};
  if (!activeTool || !activeTool.options) return options;

  activeTool.options.forEach(opt => {
    const el = document.getElementById(`opt-${opt.name}`);
    if (!el) return;

    if (opt.type === 'checkbox') {
      options[opt.name] = el.checked;
    } else {
      options[opt.name] = el.value;
    }
  });

  return options;
}

// Execute Active Tool
async function executeActiveTool() {
  if (isProcessing || !activeTool) return;

  if (!activeTool.noUpload && selectedFiles.length === 0) {
    showToast('Please select a file first.', 'error');
    return;
  }

  const options = collectFormOptions();
  const runBtn = document.getElementById('run-tool-btn');
  const progressWrap = document.getElementById('progress-wrap');
  const progressBar = document.getElementById('progress-bar-fill');
  const progressText = document.getElementById('progress-status-text');
  const resultContainer = document.getElementById('result-container');

  isProcessing = true;
  runBtn.disabled = true;
  progressWrap.style.display = 'block';
  progressBar.style.width = '30%';
  resultContainer.style.display = 'none';

  const onProgress = (msg) => {
    if (progressText) progressText.textContent = msg;
    if (progressBar) progressBar.style.width = '70%';
  };

  try {
    let result = null;

    // Route tool operation
    switch (activeTool.id) {
      // PDF Engine
      case 'merge':
        result = await pdfEngine.mergePdfs(selectedFiles, onProgress);
        break;
      case 'pdf_workflow':
        result = await pdfEngine.compressPdf(selectedFiles[0], { level: 'medium' }, onProgress);
        break;
      case 'split':
        result = await pdfEngine.splitPdf(selectedFiles[0], options, onProgress);
        break;
      case 'organize_pages':
        result = await pdfEngine.organizePages(selectedFiles[0], null, onProgress);
        break;
      case 'rotate':
        result = await pdfEngine.rotatePdf(selectedFiles[0], options, onProgress);
        break;
      case 'extract_pages':
        result = await pdfEngine.extractPages(selectedFiles[0], options, onProgress);
        break;
      case 'delete_pages':
        result = await pdfEngine.deletePages(selectedFiles[0], options, onProgress);
        break;
      case 'create_pdf':
        result = await pdfEngine.createBlankPdf(options, onProgress);
        break;
      case 'pages_per_sheet':
        result = await pdfEngine.pagesPerSheet(selectedFiles[0], options, onProgress);
        break;
      case 'compress':
        result = await pdfEngine.compressPdf(selectedFiles[0], options, onProgress);
        break;
      case 'flatten_pdf':
        result = await pdfEngine.flattenPdf(selectedFiles[0], options, onProgress);
        break;
      case 'repair_pdf':
        result = await pdfEngine.repairPdf(selectedFiles[0], options, onProgress);
        break;
      case 'watermark':
        result = await pdfEngine.watermarkPdf(selectedFiles[0], options, onProgress);
        break;
      case 'page_numbers':
        result = await pdfEngine.addPageNumbers(selectedFiles[0], options, onProgress);
        break;
      case 'crop_pdf':
        result = await pdfEngine.cropPdf(selectedFiles[0], options, onProgress);
        break;
      case 'pdf_to_image':
        result = await pdfEngine.pdfToImages(selectedFiles[0], options, onProgress);
        break;
      case 'images_to_pdf':
        result = await pdfEngine.imagesToPdf(selectedFiles, options, onProgress);
        break;
      case 'pdf_to_text':
        result = await pdfEngine.pdfToText(selectedFiles[0], options, onProgress);
        break;
      case 'text_to_pdf':
        result = await pdfEngine.textToPdf(options, onProgress);
        break;
      case 'markdown_to_pdf':
        result = await pdfEngine.markdownToPdf(options, onProgress);
        break;
      case 'pdf_inspector':
      case 'pdf_privacy_check':
        result = await pdfEngine.inspectPdf(selectedFiles[0], options, onProgress);
        break;

      // Image Engine
      case 'compress_image':
        result = await imageEngine.compressImage(selectedFiles[0], options, onProgress);
        break;
      case 'compress_image_to_kb':
        result = await imageEngine.compressImageToTargetKb(selectedFiles[0], options, onProgress);
        break;
      case 'compress_image_to_20kb':
        result = await imageEngine.compressImageToTargetKb(selectedFiles[0], { targetKb: 20 }, onProgress);
        break;
      case 'compress_image_to_50kb':
        result = await imageEngine.compressImageToTargetKb(selectedFiles[0], { targetKb: 50 }, onProgress);
        break;
      case 'compress_image_to_100kb':
        result = await imageEngine.compressImageToTargetKb(selectedFiles[0], { targetKb: 100 }, onProgress);
        break;
      case 'resize_image':
        result = await imageEngine.resizeImage(selectedFiles[0], options, onProgress);
        break;
      case 'crop_image':
        result = await imageEngine.cropImage(selectedFiles[0], options, onProgress);
        break;
      case 'rotate_image':
        result = await imageEngine.rotateAndFlipImage(selectedFiles[0], options, onProgress);
        break;
      case 'convert_to_jpg':
      case 'convert_from_jpg':
        result = await imageEngine.convertImageFormat(selectedFiles[0], options, onProgress);
        break;
      case 'photo_editor':
        result = await imageEngine.applyPhotoFilters(selectedFiles[0], options, onProgress);
        break;
      case 'watermark_image':
        result = await imageEngine.watermarkImage(selectedFiles[0], options, onProgress);
        break;
      case 'meme_generator':
        result = await imageEngine.memeGenerator(selectedFiles[0], options, onProgress);
        break;
      case 'blur_face':
        result = await imageEngine.blurFaceArea(selectedFiles[0], options, onProgress);
        break;
      case 'exam_photo_resizer':
        result = await imageEngine.examPhotoResizer(selectedFiles[0], options, onProgress);
        break;
      case 'signature_resizer':
        result = await imageEngine.compressImageToTargetKb(selectedFiles[0], { targetKb: 20 }, onProgress);
        break;
      case 'text_to_handwriting':
        result = await imageEngine.textToHandwriting(options, onProgress);
        break;

      // Crypto Utils
      case 'file_hash':
        result = await cryptoUtils.calculateFileHashes(selectedFiles[0], options, onProgress);
        break;
      case 'password_generator':
        result = cryptoUtils.generateSecurePassword(options);
        break;

      default:
        result = {
          blob: new Blob(['Processed with A Thousand Tools'], { type: 'text/plain' }),
          filename: 'processed-output.txt'
        };
    }

    progressBar.style.width = '100%';
    displayResult(result);
    showToast(`${activeTool.name} completed successfully!`, 'success');
  } catch (error) {
    console.error('Tool execution error:', error);
    showToast(error.message || 'Error occurred while processing file.', 'error');
  } finally {
    isProcessing = false;
    runBtn.disabled = false;
    setTimeout(() => {
      progressWrap.style.display = 'none';
      progressBar.style.width = '0%';
    }, 600);
  }
}

// Display Result Card
function displayResult(result) {
  const container = document.getElementById('result-container');
  if (!container) return;

  container.style.display = 'block';

  // Case 1: Downloadable Blob
  if (result.blob) {
    const url = URL.createObjectURL(result.blob);
    const sizeKb = (result.blob.size / 1024).toFixed(1);

    let savingsHtml = '';
    if (result.originalSize && result.newSize) {
      const origKb = (result.originalSize / 1024).toFixed(1);
      const savedPct = Math.round(((result.originalSize - result.newSize) / result.originalSize) * 100);
      savingsHtml = `
        <div class="result-savings-pill ${savedPct > 0 ? 'positive' : ''}">
          <span>Size: ${origKb} KB &rarr; ${sizeKb} KB</span>
          ${savedPct > 0 ? `<strong>Saved ${savedPct}%</strong>` : ''}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="result-card">
        <div class="result-header">
          <div class="result-badge">Ready for Download</div>
          <h4 class="result-filename">${result.filename}</h4>
          ${savingsHtml}
        </div>
        <div class="result-actions">
          <a href="${url}" download="${result.filename}" class="download-btn" id="download-output-btn">
            ⬇️ Download File (${sizeKb} KB)
          </a>
          ${result.blob.type && result.blob.type.startsWith('image/') ? `
            <button class="preview-btn" onclick="window.open('${url}', '_blank')">👁️ Preview</button>
          ` : ''}
        </div>
      </div>
    `;
  } 
  // Case 2: Verification / Hashing / Audit Report
  else if (result.report) {
    let reportHtml = '<div class="report-card">';
    if (result.verification) {
      reportHtml += `<div class="verification-banner ${result.verification.match ? 'match' : 'mismatch'}">${result.verification.message}</div>`;
    }
    reportHtml += '<div class="report-table">';
    for (const [k, v] of Object.entries(result.report)) {
      reportHtml += `
        <div class="report-row">
          <span class="report-key">${k}</span>
          <span class="report-val"><code>${v}</code></span>
        </div>
      `;
    }
    reportHtml += '</div>';
    reportHtml += `
      <button class="copy-report-btn" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(result.reportText)}')); alert('Copied to clipboard!');">
        📋 Copy Report
      </button>
    </div>`;
    container.innerHTML = reportHtml;
  }
  // Case 3: Generated Password
  else if (result.password) {
    container.innerHTML = `
      <div class="password-result-card">
        <div class="password-display">
          <code id="generated-password-code">${result.password}</code>
          <button class="copy-pwd-btn" onclick="navigator.clipboard.writeText('${result.password}'); alert('Password copied!');">📋 Copy</button>
        </div>
        <div class="password-meta">
          <span class="pwd-strength" style="color: ${result.color}; font-weight: bold;">● ${result.strength}</span>
          <span class="pwd-entropy">${result.entropy}</span>
        </div>
      </div>
    `;
  }
}

// Quick Switcher (Ctrl+K / Cmd+K)
export function setupQuickSwitcher() {
  const modal = document.getElementById('quick-switcher-modal');
  const input = document.getElementById('quick-switcher-input');
  const results = document.getElementById('quick-switcher-results');
  if (!modal || !input || !results) return;

  function renderSwitcherResults(tools) {
    results.innerHTML = tools.slice(0, 10).map((t, idx) => `
      <div class="switcher-item ${idx === 0 ? 'selected' : ''}" data-tool-id="${t.id}" data-tool-slug="${t.slug}">
        <span class="switcher-icon">${t.icon}</span>
        <div class="switcher-info">
          <div class="switcher-name">${t.name}</div>
          <div class="switcher-desc">${t.description}</div>
        </div>
        <span class="switcher-cat">${t.category}</span>
      </div>
    `).join('');

    results.querySelectorAll('.switcher-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-tool-id');
        const slug = item.getAttribute('data-tool-slug');
        modal.classList.remove('open');
        window.history.pushState({}, '', `/tools/${slug}/`);
        openToolModal(id);
      });
    });
  }

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      modal.classList.toggle('open');
      if (modal.classList.contains('open')) {
        input.value = '';
        renderSwitcherResults(TOOLS);
        input.focus();
      }
    } else if (e.key === 'Escape' && modal.classList.contains('open')) {
      modal.classList.remove('open');
    }
  });

  input.addEventListener('input', () => {
    const q = input.value;
    const matches = searchTools(q);
    renderSwitcherResults(matches);
  });

  document.getElementById('header-search-btn')?.addEventListener('click', () => {
    modal.classList.add('open');
    input.value = '';
    renderSwitcherResults(TOOLS);
    input.focus();
  });

  document.getElementById('close-switcher-btn')?.addEventListener('click', () => {
    modal.classList.remove('open');
  });
}
