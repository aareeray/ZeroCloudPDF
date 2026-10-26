/**
 * A Thousand Tools - Complete Tools Catalog (73 Tools)
 * 100% Client-side, zero uploads, local-first processing
 */

export const CATEGORIES = [
  { id: 'all', name: 'All Tools', icon: '⚡' },
  { id: 'organize', name: 'Organize', icon: '📑' },
  { id: 'optimize', name: 'Optimize & Security', icon: '🛡️' },
  { id: 'convert', name: 'Convert', icon: '🔄' },
  { id: 'edit', name: 'Edit & Annotate', icon: '✏️' },
  { id: 'image', name: 'Image Tools', icon: '🖼️' },
  { id: 'utility', name: 'Utilities', icon: '🧰' }
];

export const TOOLS = [
  // ==================== ORGANIZE ====================
  {
    id: 'merge',
    slug: 'merge',
    name: 'Merge PDF',
    category: 'organize',
    icon: '📑',
    color: '#3b82f6',
    description: 'Combine multiple PDF files into one perfectly ordered document.',
    accept: '.pdf',
    multiple: true,
    badge: 'Popular',
    howTo: [
      'Click or drag and drop two or more PDF files into the upload box.',
      'Reorder or arrange the files in your preferred sequence.',
      'Click "Merge PDF" to combine them instantly in your browser memory.'
    ],
    options: []
  },
  {
    id: 'pdf_workflow',
    slug: 'pdf-workflow',
    name: 'PDF Workflow Builder',
    category: 'organize',
    icon: '🔀',
    color: '#6366f1',
    description: 'Chain multiple operations in one go: compress, watermark, number, protect, and flatten.',
    accept: '.pdf',
    multiple: false,
    badge: 'New',
    howTo: [
      'Upload your PDF file.',
      'Select the batch actions you wish to apply sequentially.',
      'Click "Run Workflow" to execute all tasks in a single pass.'
    ],
    options: [
      { name: 'compress', label: 'Apply Compression', type: 'checkbox', default: true },
      { name: 'addNumbers', label: 'Add Page Numbers', type: 'checkbox', default: true },
      { name: 'flatten', label: 'Flatten Form Fields & Annotations', type: 'checkbox', default: false }
    ]
  },
  {
    id: 'split',
    slug: 'split',
    name: 'Split PDF',
    category: 'organize',
    icon: '✂️',
    color: '#06b6d4',
    description: 'Separate pages or extract specific page ranges (e.g. 1-3, 5, 8-10).',
    accept: '.pdf',
    multiple: false,
    badge: 'Popular',
    howTo: [
      'Upload the PDF file you want to split.',
      'Specify the page ranges (e.g. 1-3, 5, 8-12) or leave blank to extract all.',
      'Click "Split PDF" and download the separated pages.'
    ],
    options: [
      { name: 'ranges', label: 'Page Ranges to Extract', type: 'text', placeholder: 'e.g. 1-3, 5, 8-10', default: '1-2' }
    ]
  },
  {
    id: 'organize_pages',
    slug: 'organize-pages',
    name: 'Organize Pages',
    category: 'organize',
    icon: '🗂️',
    color: '#8b5cf6',
    description: 'Reorder, rotate, or remove pages with an interactive visual preview.',
    accept: '.pdf',
    multiple: false,
    howTo: [
      'Upload your document.',
      'Drag and drop page thumbnails to reorder or click delete on unwanted pages.',
      'Download your organized PDF file.'
    ],
    options: []
  },
  {
    id: 'rotate',
    slug: 'rotate',
    name: 'Rotate PDF',
    category: 'organize',
    icon: '🔄',
    color: '#10b981',
    description: 'Rotate all or specific pages by 90°, 180°, or 270° clockwise.',
    accept: '.pdf',
    multiple: false,
    howTo: [
      'Upload your PDF.',
      'Select rotation orientation (90°, 180°, or 270°).',
      'Click "Rotate PDF" to apply.'
    ],
    options: [
      { name: 'angle', label: 'Rotation Angle', type: 'select', options: [
        { label: '90° Clockwise', value: 90 },
        { label: '180° Half Turn', value: 180 },
        { label: '270° Counter-Clockwise', value: 270 }
      ], default: 90 }
    ]
  },
  {
    id: 'extract_pages',
    slug: 'extract-pages',
    name: 'Extract Pages',
    category: 'organize',
    icon: '📤',
    color: '#f59e0b',
    description: 'Pull out selected pages into a fresh, separate PDF document.',
    accept: '.pdf',
    multiple: false,
    howTo: [
      'Upload the PDF file.',
      'Enter page numbers or ranges to extract (e.g. 1, 3, 5-7).',
      'Download the extracted PDF.'
    ],
    options: [
      { name: 'pages', label: 'Pages to Extract', type: 'text', placeholder: 'e.g. 2, 4-6', default: '1' }
    ]
  },
  {
    id: 'delete_pages',
    slug: 'delete-pages',
    name: 'Delete Pages',
    category: 'organize',
    icon: '🗑️',
    color: '#ef4444',
    description: 'Permanently remove unwanted pages from your PDF file.',
    accept: '.pdf',
    multiple: false,
    howTo: [
      'Upload your PDF file.',
      'Specify page numbers to permanently remove.',
      'Download the trimmed document.'
    ],
    options: [
      { name: 'pages', label: 'Pages to Delete', type: 'text', placeholder: 'e.g. 1, 3-5', default: '1' }
    ]
  },
  {
    id: 'create_pdf',
    slug: 'create-pdf',
    name: 'Create Blank PDF',
    category: 'organize',
    icon: '📄',
    color: '#6366f1',
    description: 'Generate blank PDF documents with custom page sizes, orientations, and counts.',
    noUpload: true,
    howTo: [
      'Select desired page count, size (A4, Letter, Legal), and orientation.',
      'Click "Create Blank PDF" to generate and download.'
    ],
    options: [
      { name: 'pageCount', label: 'Page Count', type: 'number', default: 1, min: 1, max: 100 },
      { name: 'size', label: 'Page Size', type: 'select', options: [
        { label: 'A4 (210 × 297 mm)', value: 'A4' },
        { label: 'US Letter (8.5 × 11 in)', value: 'Letter' },
        { label: 'US Legal (8.5 × 14 in)', value: 'Legal' },
        { label: 'A3 (297 × 420 mm)', value: 'A3' }
      ], default: 'A4' },
      { name: 'orientation', label: 'Orientation', type: 'select', options: [
        { label: 'Portrait', value: 'portrait' },
        { label: 'Landscape', value: 'landscape' }
      ], default: 'portrait' }
    ]
  },
  {
    id: 'pages_per_sheet',
    slug: 'pages-per-sheet',
    name: 'Pages Per Sheet (N-Up)',
    category: 'organize',
    icon: '📖',
    color: '#ec4899',
    description: 'Impose 2, 4, or 6 document pages onto a single printed sheet.',
    accept: '.pdf',
    multiple: false,
    howTo: [
      'Upload the PDF.',
      'Choose layout (2 pages per sheet or 4 pages per sheet).',
      'Download the imposed multi-page sheet.'
    ],
    options: [
      { name: 'layout', label: 'Pages Per Sheet', type: 'select', options: [
        { label: '2 Pages Per Sheet (Side by side)', value: 2 },
        { label: '4 Pages Per Sheet (2 × 2 grid)', value: 4 }
      ], default: 2 }
    ]
  },
  {
    id: 'change_page_size',
    slug: 'change-page-size',
    name: 'Change Page Size',
    category: 'organize',
    icon: '📐',
    color: '#14b8a6',
    description: 'Standardize or re-scale all pages to A4, Letter, Legal, or custom sizes.',
    accept: '.pdf',
    multiple: false,
    options: [
      { name: 'targetSize', label: 'Target Size', type: 'select', options: [
        { label: 'A4', value: 'A4' },
        { label: 'Letter', value: 'Letter' },
        { label: 'Legal', value: 'Legal' },
        { label: 'A3', value: 'A3' }
      ], default: 'A4' }
    ]
  },
  {
    id: 'halve_pages',
    slug: 'halve-pages',
    name: 'Halve Pages (Split Spreads)',
    category: 'organize',
    icon: '✂️',
    color: '#84cc16',
    description: 'Split 2-page book scans and dual-page spreads into individual pages.',
    accept: '.pdf',
    multiple: false,
    options: []
  },

  // ==================== OPTIMIZE & SECURITY ====================
  {
    id: 'compress',
    slug: 'compress',
    name: 'Compress PDF',
    category: 'optimize',
    icon: '🗜️',
    color: '#3b82f6',
    description: 'Reduce PDF file size drastically while retaining high visual clarity.',
    accept: '.pdf',
    multiple: false,
    badge: 'Essential',
    howTo: [
      'Upload your PDF document.',
      'Select compression level (Light, Recommended, Extreme).',
      'Click "Compress PDF" and download your reduced file.'
    ],
    options: [
      { name: 'level', label: 'Compression Level', type: 'select', options: [
        { label: 'Recommended (Balanced Quality & Size)', value: 'medium' },
        { label: 'Extreme (Smallest File Size)', value: 'high' },
        { label: 'Light (Maximum Quality)', value: 'low' }
      ], default: 'medium' }
    ]
  },
  {
    id: 'flatten_pdf',
    slug: 'flatten-pdf',
    name: 'Flatten PDF',
    category: 'optimize',
    icon: '🥞',
    color: '#f97316',
    description: 'Merge fillable form fields, comments, and annotations directly into page artwork.',
    accept: '.pdf',
    multiple: false,
    options: []
  },
  {
    id: 'repair_pdf',
    slug: 'repair-pdf',
    name: 'Repair PDF',
    category: 'optimize',
    icon: '🔧',
    color: '#eab308',
    description: 'Rebuild damaged PDF cross-reference tables and recover unreadable pages.',
    accept: '.pdf',
    multiple: false,
    options: []
  },
  {
    id: 'protect_pdf',
    slug: 'protect-pdf',
    name: 'Protect PDF',
    category: 'optimize',
    icon: '🔒',
    color: '#ef4444',
    description: 'Encrypt your PDF with a strong user password to prevent unauthorized access.',
    accept: '.pdf',
    multiple: false,
    options: [
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter password', default: '' }
    ]
  },
  {
    id: 'unlock_pdf',
    slug: 'unlock-pdf',
    name: 'Unlock PDF',
    category: 'optimize',
    icon: '🔓',
    color: '#10b981',
    description: 'Decrypt and remove passwords or viewing restrictions from your PDF.',
    accept: '.pdf',
    multiple: false,
    options: [
      { name: 'password', label: 'Current Password', type: 'password', placeholder: 'Enter current password', default: '' }
    ]
  },
  {
    id: 'pdf_metadata',
    slug: 'pdf-metadata',
    name: 'PDF Metadata Editor',
    category: 'optimize',
    icon: '🏷️',
    color: '#8b5cf6',
    description: 'View and edit document metadata: Title, Author, Subject, Keywords, Producer.',
    accept: '.pdf',
    multiple: false,
    options: [
      { name: 'title', label: 'Document Title', type: 'text', placeholder: 'Title', default: '' },
      { name: 'author', label: 'Author', type: 'text', placeholder: 'Author name', default: '' },
      { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Subject / Description', default: '' },
      { name: 'keywords', label: 'Keywords', type: 'text', placeholder: 'keyword1, keyword2', default: '' }
    ]
  },
  {
    id: 'remove_metadata',
    slug: 'remove-metadata',
    name: 'Remove PDF Metadata',
    category: 'optimize',
    icon: '🧹',
    color: '#64748b',
    description: 'Scrub all author, machine, creation timestamps, and hidden XMP metadata.',
    accept: '.pdf',
    multiple: false,
    options: []
  },
  {
    id: 'pdf_inspector',
    slug: 'pdf-inspector',
    name: 'PDF Inspector',
    category: 'optimize',
    icon: '🔍',
    color: '#0284c7',
    description: 'Audit PDF version, fonts, embedded images, encryption type, and structure.',
    accept: '.pdf',
    multiple: false,
    options: []
  },
  {
    id: 'pdf_privacy_check',
    slug: 'pdf-privacy-check',
    name: 'PDF Privacy Check',
    category: 'optimize',
    icon: '🛡️',
    color: '#059669',
    description: 'Detect hidden revisions, deleted objects, scripts, and sensitive information.',
    accept: '.pdf',
    multiple: false,
    options: []
  },
  {
    id: 'file_hash',
    slug: 'file-hash',
    name: 'File Hash Checker (SHA-256, MD5)',
    category: 'optimize',
    icon: '🔑',
    color: '#7c3aed',
    description: 'Calculate cryptographic SHA-256, SHA-512, SHA-1, and MD5 hashes instantly.',
    accept: '*/*',
    multiple: false,
    options: [
      { name: 'verifyHash', label: 'Compare with expected hash (optional)', type: 'text', placeholder: 'Paste checksum here to verify', default: '' }
    ]
  },
  {
    id: 'password_generator',
    slug: 'password-generator',
    name: 'Password Generator',
    category: 'optimize',
    icon: '🎲',
    color: '#d97706',
    description: 'Generate high-entropy, cryptographically secure passwords locally on your device.',
    noUpload: true,
    badge: 'Utility',
    options: [
      { name: 'length', label: 'Length', type: 'number', default: 16, min: 8, max: 64 },
      { name: 'includeUpper', label: 'Uppercase Letters (A-Z)', type: 'checkbox', default: true },
      { name: 'includeLower', label: 'Lowercase Letters (a-z)', type: 'checkbox', default: true },
      { name: 'includeNumbers', label: 'Numbers (0-9)', type: 'checkbox', default: true },
      { name: 'includeSymbols', label: 'Special Symbols (!@#$%)', type: 'checkbox', default: true }
    ]
  },

  // ==================== CONVERT ====================
  {
    id: 'pdf_to_image',
    slug: 'pdf-to-image',
    name: 'PDF to JPG / PNG',
    category: 'convert',
    icon: '🖼️',
    color: '#3b82f6',
    description: 'Render every PDF page into crisp, high-resolution JPG or PNG images.',
    accept: '.pdf',
    multiple: false,
    options: [
      { name: 'format', label: 'Image Format', type: 'select', options: [
        { label: 'JPEG (.jpg)', value: 'jpeg' },
        { label: 'PNG (.png)', value: 'png' }
      ], default: 'jpeg' },
      { name: 'scale', label: 'Resolution Quality', type: 'select', options: [
        { label: 'Standard (1.5x)', value: 1.5 },
        { label: 'High Definition (2.0x)', value: 2.0 },
        { label: 'Ultra HD (3.0x)', value: 3.0 }
      ], default: 2.0 }
    ]
  },
  {
    id: 'images_to_pdf',
    slug: 'images-to-pdf',
    name: 'JPG / PNG to PDF',
    category: 'convert',
    icon: '📸',
    color: '#10b981',
    description: 'Convert JPG, PNG, and WebP images into a single professional PDF document.',
    accept: 'image/jpeg,image/png,image/webp',
    multiple: true,
    badge: 'Popular',
    options: [
      { name: 'pageSize', label: 'Page Size', type: 'select', options: [
        { label: 'Fit to Image Dimensions', value: 'fit' },
        { label: 'Standard A4', value: 'A4' },
        { label: 'Standard US Letter', value: 'Letter' }
      ], default: 'A4' },
      { name: 'margin', label: 'Page Margins', type: 'select', options: [
        { label: 'No Margin (Full Bleed)', value: 0 },
        { label: 'Small Margin (20pt)', value: 20 },
        { label: 'Normal Margin (36pt)', value: 36 }
      ], default: 20 }
    ]
  },
  {
    id: 'pdf_to_text',
    slug: 'pdf-to-text',
    name: 'PDF to Text',
    category: 'convert',
    icon: '📝',
    color: '#8b5cf6',
    description: 'Extract all textual content from pages into a clean, readable text file.',
    accept: '.pdf',
    multiple: false,
    options: []
  },
  {
    id: 'text_to_pdf',
    slug: 'text-to-pdf',
    name: 'Text to PDF',
    category: 'convert',
    icon: '📄',
    color: '#06b6d4',
    description: 'Transform plain text or notes into a beautifully paginated PDF document.',
    noUpload: true,
    options: [
      { name: 'title', label: 'Document Title', type: 'text', default: 'Document', placeholder: 'Title' },
      { name: 'content', label: 'Document Text', type: 'textarea', placeholder: 'Enter or paste your text here...', default: '' },
      { name: 'fontSize', label: 'Font Size', type: 'select', options: [
        { label: '10 pt (Compact)', value: 10 },
        { label: '12 pt (Standard)', value: 12 },
        { label: '14 pt (Large)', value: 14 }
      ], default: 12 }
    ]
  },
  {
    id: 'markdown_to_pdf',
    slug: 'markdown-to-pdf',
    name: 'Markdown to PDF',
    category: 'convert',
    icon: '📑',
    color: '#6366f1',
    description: 'Render formatted Markdown notes, documentation, and headings to PDF.',
    noUpload: true,
    options: [
      { name: 'content', label: 'Markdown Content', type: 'textarea', placeholder: '# Heading\n\nYour formatted markdown here...', default: '# My Document\n\nGenerated with **A Thousand Tools**.\n\n- Zero uploads\n- 100% private client-side processing\n- Fast and responsive' }
    ]
  },
  {
    id: 'html_to_pdf',
    slug: 'html-to-pdf',
    name: 'HTML to PDF',
    category: 'convert',
    icon: '🌐',
    color: '#f59e0b',
    description: 'Convert custom HTML markup or styled reports into a PDF file.',
    noUpload: true,
    options: [
      { name: 'htmlContent', label: 'HTML Markup', type: 'textarea', placeholder: '<div style="padding: 20px;"><h1>Report</h1><p>Content...</p></div>', default: '<div style="font-family: sans-serif; padding: 24px; color: #1e293b;">\n  <h1 style="color: #2563eb;">Client Invoice Report</h1>\n  <p>Processed completely in your browser tab.</p>\n  <hr style="border: 1px solid #e2e8f0; margin: 16px 0;" />\n  <p>Status: <strong>Verified & Private</strong></p>\n</div>' }
    ]
  },
  {
    id: 'svg_to_pdf',
    slug: 'svg-to-pdf',
    name: 'SVG to PDF',
    category: 'convert',
    icon: '🎨',
    color: '#ec4899',
    description: 'Convert vector SVG graphics into a crisp, scalable PDF page.',
    accept: '.svg,image/svg+xml',
    multiple: false,
    options: []
  },
  {
    id: 'pdf_to_csv',
    slug: 'pdf-to-csv',
    name: 'PDF to CSV',
    category: 'convert',
    icon: '📊',
    color: '#10b981',
    description: 'Detect and extract table data from PDF pages into downloadable CSV format.',
    accept: '.pdf',
    multiple: false,
    options: []
  },
  {
    id: 'ocr_pdf',
    slug: 'ocr-pdf',
    name: 'OCR PDF (Searchable Text)',
    category: 'convert',
    icon: '👁️',
    color: '#0ea5e9',
    description: 'Recognize text inside scanned documents and images using local Tesseract OCR.',
    accept: '.pdf,image/*',
    multiple: false,
    options: [
      { name: 'language', label: 'Recognition Language', type: 'select', options: [
        { label: 'English (eng)', value: 'eng' },
        { label: 'Spanish (spa)', value: 'spa' },
        { label: 'French (fra)', value: 'fra' },
        { label: 'German (deu)', value: 'deu' }
      ], default: 'eng' }
    ]
  },

  // ==================== EDIT & ANNOTATE ====================
  {
    id: 'watermark',
    slug: 'watermark',
    name: 'Watermark PDF',
    category: 'edit',
    icon: '💧',
    color: '#06b6d4',
    description: 'Stamp custom text or confidential markings diagonally across all pages.',
    accept: '.pdf',
    multiple: false,
    options: [
      { name: 'text', label: 'Watermark Text', type: 'text', default: 'CONFIDENTIAL', placeholder: 'e.g. CONFIDENTIAL' },
      { name: 'color', label: 'Watermark Color', type: 'color', default: '#ef4444' },
      { name: 'opacity', label: 'Opacity', type: 'select', options: [
        { label: '15% (Subtle)', value: 0.15 },
        { label: '30% (Standard)', value: 0.3 },
        { label: '50% (Prominent)', value: 0.5 },
        { label: '80% (Bold)', value: 0.8 }
      ], default: 0.3 },
      { name: 'angle', label: 'Angle', type: 'select', options: [
        { label: '45° Diagonal', value: 45 },
        { label: '0° Horizontal', value: 0 },
        { label: '-45° Reverse Diagonal', value: -45 }
      ], default: 45 },
      { name: 'fontSize', label: 'Font Size', type: 'number', default: 48, min: 12, max: 120 }
    ]
  },
  {
    id: 'page_numbers',
    slug: 'page-numbers',
    name: 'Add Page Numbers',
    category: 'edit',
    icon: '🔢',
    color: '#8b5cf6',
    description: 'Stamp sequential page numbering (e.g. "Page 1 of 10") at headers or footers.',
    accept: '.pdf',
    multiple: false,
    options: [
      { name: 'position', label: 'Position', type: 'select', options: [
        { label: 'Bottom Right', value: 'bottom-right' },
        { label: 'Bottom Center', value: 'bottom-center' },
        { label: 'Bottom Left', value: 'bottom-left' },
        { label: 'Top Right', value: 'top-right' },
        { label: 'Top Center', value: 'top-center' }
      ], default: 'bottom-center' },
      { name: 'format', label: 'Numbering Format', type: 'select', options: [
        { label: 'Page X of Y', value: 'Page {n} of {total}' },
        { label: 'X / Y', value: '{n} / {total}' },
        { label: 'Just Number (X)', value: '{n}' }
      ], default: 'Page {n} of {total}' },
      { name: 'fontSize', label: 'Font Size', type: 'number', default: 11, min: 8, max: 24 }
    ]
  },
  {
    id: 'crop_pdf',
    slug: 'crop-pdf',
    name: 'Crop PDF Margins',
    category: 'edit',
    icon: '✂️',
    color: '#f59e0b',
    description: 'Trim excess page borders or crop to custom margin boundaries.',
    accept: '.pdf',
    multiple: false,
    options: [
      { name: 'margin', label: 'Margin Trim (points)', type: 'number', default: 36, min: 0, max: 150 }
    ]
  },
  {
    id: 'overlay_pdf',
    slug: 'overlay-pdf',
    name: 'Overlay PDF / Letterhead',
    category: 'edit',
    icon: '📑',
    color: '#ec4899',
    description: 'Superimpose a background letterhead or stamp template over another PDF.',
    accept: '.pdf',
    multiple: true,
    options: []
  },
  {
    id: 'bookmark_pdf',
    slug: 'bookmark-pdf',
    name: 'Add Bookmarks',
    category: 'edit',
    icon: '🔖',
    color: '#14b8a6',
    description: 'Insert navigation outlines and table-of-contents bookmarks into pages.',
    accept: '.pdf',
    multiple: false,
    options: [
      { name: 'bookmarkTitle', label: 'Bookmark Title', type: 'text', default: 'Chapter 1', placeholder: 'Title' },
      { name: 'pageNumber', label: 'Target Page Number', type: 'number', default: 1, min: 1 }
    ]
  },

  // ==================== IMAGE TOOLS ====================
  {
    id: 'compress_image',
    slug: 'compress-image',
    name: 'Compress Image',
    category: 'image',
    icon: '🖼️',
    color: '#3b82f6',
    description: 'Reduce image file size with fine-tuned quality control and instant KB savings.',
    accept: 'image/*',
    multiple: false,
    badge: 'Popular',
    options: [
      { name: 'quality', label: 'Compression Quality', type: 'range', min: 10, max: 100, default: 75, unit: '%' },
      { name: 'maxDimension', label: 'Max Width / Height (px)', type: 'number', default: 1920, min: 200, max: 8000 }
    ]
  },
  {
    id: 'compress_image_to_kb',
    slug: 'compress-image-to-kb',
    name: 'Compress Image to Exact KB',
    category: 'image',
    icon: '🎯',
    color: '#10b981',
    description: 'Automatically optimize any photo to fit under a specific KB limit (e.g. 20KB, 50KB, 100KB).',
    accept: 'image/*',
    multiple: false,
    badge: 'Smart',
    options: [
      { name: 'targetKb', label: 'Target File Size (KB)', type: 'select', options: [
        { label: 'Under 20 KB (Govt / Form Standard)', value: 20 },
        { label: 'Under 50 KB (Passport / Visa)', value: 50 },
        { label: 'Under 100 KB (Exam Portals)', value: 100 },
        { label: 'Under 200 KB (Web Optimized)', value: 200 },
        { label: 'Custom Target...', value: 'custom' }
      ], default: 50 },
      { name: 'customKb', label: 'Custom Target (KB)', type: 'number', default: 50, min: 5, max: 5000 }
    ]
  },
  {
    id: 'compress_image_to_20kb',
    slug: 'compress-image-to-20kb',
    name: 'Compress Image to 20 KB',
    category: 'image',
    icon: '🪶',
    color: '#059669',
    description: 'One-click quick compressor to guarantee photo size stays under 20 KB for online forms.',
    accept: 'image/*',
    multiple: false,
    options: []
  },
  {
    id: 'compress_image_to_50kb',
    slug: 'compress-image-to-50kb',
    name: 'Compress Image to 50 KB',
    category: 'image',
    icon: '🪶',
    color: '#10b981',
    description: 'One-click compressor to shrink photos below 50 KB for passport & visa portals.',
    accept: 'image/*',
    multiple: false,
    options: []
  },
  {
    id: 'compress_image_to_100kb',
    slug: 'compress-image-to-100kb',
    name: 'Compress Image to 100 KB',
    category: 'image',
    icon: '🪶',
    color: '#047857',
    description: 'Fast preset to optimize photos below 100 KB with pristine quality.',
    accept: 'image/*',
    multiple: false,
    options: []
  },
  {
    id: 'resize_image',
    slug: 'resize-image',
    name: 'Resize Image',
    category: 'image',
    icon: '📐',
    color: '#8b5cf6',
    description: 'Change pixel dimensions or percentage while maintaining aspect ratio.',
    accept: 'image/*',
    multiple: false,
    options: [
      { name: 'width', label: 'Width (px)', type: 'number', default: 1200, min: 10, max: 10000 },
      { name: 'height', label: 'Height (px)', type: 'number', default: 800, min: 10, max: 10000 },
      { name: 'maintainAspect', label: 'Maintain Aspect Ratio', type: 'checkbox', default: true }
    ]
  },
  {
    id: 'crop_image',
    slug: 'crop-image',
    name: 'Crop Image',
    category: 'image',
    icon: '✂️',
    color: '#06b6d4',
    description: 'Crop images visually with preset aspect ratios (1:1, 4:3, 16:9, passport).',
    accept: 'image/*',
    multiple: false,
    options: [
      { name: 'aspectRatio', label: 'Aspect Ratio', type: 'select', options: [
        { label: 'Freeform', value: 'free' },
        { label: '1:1 (Square / Avatar)', value: '1:1' },
        { label: '4:3 (Standard Photo)', value: '4:3' },
        { label: '16:9 (Widescreen)', value: '16:9' },
        { label: '35 × 45 mm (Passport)', value: '35:45' }
      ], default: 'free' }
    ]
  },
  {
    id: 'rotate_image',
    slug: 'rotate-image',
    name: 'Rotate & Flip Image',
    category: 'image',
    icon: '🔄',
    color: '#f59e0b',
    description: 'Rotate images by 90°, 180°, 270° or flip horizontally / vertically.',
    accept: 'image/*',
    multiple: false,
    options: [
      { name: 'angle', label: 'Rotate Angle', type: 'select', options: [
        { label: '90° Clockwise', value: 90 },
        { label: '180° Upside Down', value: 180 },
        { label: '270° Counter-Clockwise', value: 270 }
      ], default: 90 },
      { name: 'flipH', label: 'Flip Horizontally', type: 'checkbox', default: false },
      { name: 'flipV', label: 'Flip Vertically', type: 'checkbox', default: false }
    ]
  },
  {
    id: 'convert_to_jpg',
    slug: 'convert-to-jpg',
    name: 'Convert to JPG',
    category: 'image',
    icon: '🖼️',
    color: '#6366f1',
    description: 'Convert PNG, WebP, GIF, HEIC, or SVG files into standard JPG format.',
    accept: 'image/*',
    multiple: false,
    options: [
      { name: 'quality', label: 'JPG Quality', type: 'range', min: 10, max: 100, default: 85, unit: '%' }
    ]
  },
  {
    id: 'convert_from_jpg',
    slug: 'convert-from-jpg',
    name: 'JPG to PNG / WebP Converter',
    category: 'image',
    icon: '🔄',
    color: '#ec4899',
    description: 'Convert JPG images into lossless PNG, modern WebP, or other formats.',
    accept: 'image/jpeg',
    multiple: false,
    options: [
      { name: 'targetFormat', label: 'Target Format', type: 'select', options: [
        { label: 'PNG (.png - Lossless)', value: 'png' },
        { label: 'WebP (.webp - High Efficiency)', value: 'webp' }
      ], default: 'png' }
    ]
  },
  {
    id: 'photo_editor',
    slug: 'photo-editor',
    name: 'Photo Editor & Filters',
    category: 'image',
    icon: '✨',
    color: '#14b8a6',
    description: 'Adjust brightness, contrast, saturation, blur, grayscale, sepia, or inverted colors.',
    accept: 'image/*',
    multiple: false,
    options: [
      { name: 'filter', label: 'Color Filter', type: 'select', options: [
        { label: 'Normal / None', value: 'none' },
        { label: 'Grayscale (Black & White)', value: 'grayscale' },
        { label: 'Sepia (Vintage)', value: 'sepia' },
        { label: 'High Contrast Boost', value: 'contrast' },
        { label: 'Invert Colors', value: 'invert' },
        { label: 'Soft Blur', value: 'blur' }
      ], default: 'none' },
      { name: 'brightness', label: 'Brightness', type: 'range', min: 50, max: 150, default: 100, unit: '%' },
      { name: 'contrast', label: 'Contrast', type: 'range', min: 50, max: 150, default: 100, unit: '%' }
    ]
  },
  {
    id: 'watermark_image',
    slug: 'watermark-image',
    name: 'Watermark Image',
    category: 'image',
    icon: '💧',
    color: '#0284c7',
    description: 'Overlay custom copyright text or watermark stamps onto your photos.',
    accept: 'image/*',
    multiple: false,
    options: [
      { name: 'text', label: 'Watermark Text', type: 'text', default: '© Copyright', placeholder: 'Watermark text' },
      { name: 'position', label: 'Position', type: 'select', options: [
        { label: 'Bottom Right', value: 'bottom-right' },
        { label: 'Center', value: 'center' },
        { label: 'Bottom Left', value: 'bottom-left' },
        { label: 'Top Right', value: 'top-right' }
      ], default: 'bottom-right' },
      { name: 'color', label: 'Text Color', type: 'color', default: '#ffffff' },
      { name: 'opacity', label: 'Opacity', type: 'range', min: 10, max: 100, default: 60, unit: '%' }
    ]
  },
  {
    id: 'meme_generator',
    slug: 'meme-generator',
    name: 'Meme Generator',
    category: 'image',
    icon: '🎭',
    color: '#f97316',
    description: 'Create hilarious memes instantly with classic top and bottom impact typography.',
    accept: 'image/*',
    multiple: false,
    options: [
      { name: 'topText', label: 'Top Text', type: 'text', default: 'WHEN YOU REALIZE', placeholder: 'TOP TEXT' },
      { name: 'bottomText', label: 'Bottom Text', type: 'text', default: 'IT RUNS 100% LOCALLY', placeholder: 'BOTTOM TEXT' },
      { name: 'fontSize', label: 'Font Size', type: 'number', default: 36, min: 16, max: 96 }
    ]
  },
  {
    id: 'blur_face',
    slug: 'blur-face',
    name: 'Blur Sensitive Areas & Faces',
    category: 'image',
    icon: '🎭',
    color: '#ef4444',
    description: 'Obscure faces, license plates, or confidential info with a privacy blur or pixelate effect.',
    accept: 'image/*',
    multiple: false,
    options: [
      { name: 'blurStrength', label: 'Blur Strength (px)', type: 'range', min: 5, max: 40, default: 15, unit: 'px' }
    ]
  },
  {
    id: 'image_dpi',
    slug: 'image-dpi',
    name: 'Change Image DPI',
    category: 'image',
    icon: '🖨️',
    color: '#8b5cf6',
    description: 'Modify embedded print DPI (300 DPI, 600 DPI) without loss of pixel fidelity.',
    accept: 'image/jpeg,image/png',
    multiple: false,
    options: [
      { name: 'dpi', label: 'Target Print DPI', type: 'select', options: [
        { label: '300 DPI (Official Print Standard)', value: 300 },
        { label: '600 DPI (High Resolution Print)', value: 600 },
        { label: '150 DPI (Draft / Medium)', value: 150 },
        { label: '72 DPI (Web Standard)', value: 72 }
      ], default: 300 }
    ]
  },
  {
    id: 'remove_image_metadata',
    slug: 'remove-image-metadata',
    name: 'Remove Photo EXIF Metadata',
    category: 'image',
    icon: '📍',
    color: '#64748b',
    description: 'Erase GPS coordinates, camera model, date/time, and device info from photos.',
    accept: 'image/jpeg,image/png',
    multiple: false,
    options: []
  },
  {
    id: 'exam_photo_resizer',
    slug: 'exam-photo-resizer',
    name: 'Exam & Application Photo Resizer',
    category: 'image',
    icon: '📋',
    color: '#059669',
    description: 'Resize photos & signatures to exact pixels, cm, and KB ranges required by exam forms.',
    accept: 'image/*',
    multiple: false,
    options: [
      { name: 'preset', label: 'Form Preset', type: 'select', options: [
        { label: 'Passport Photo (2 × 2 in, 600 × 600 px)', value: 'passport_2x2' },
        { label: 'Visa Photo (35 × 45 mm, 413 × 531 px)', value: 'visa_35x45' },
        { label: 'Online Application Photo (20 KB - 50 KB)', value: 'form_photo' },
        { label: 'Online Signature (10 KB - 20 KB)', value: 'form_signature' }
      ], default: 'passport_2x2' }
    ]
  },
  {
    id: 'signature_resizer',
    slug: 'signature-resizer',
    name: 'Signature Resizer (Under 20KB)',
    category: 'image',
    icon: '✍️',
    color: '#0284c7',
    description: 'Quickly resize and compress scanned signature to under 20 KB for official portals.',
    accept: 'image/*',
    multiple: false,
    options: []
  },
  {
    id: 'text_to_handwriting',
    slug: 'text-to-handwriting',
    name: 'Text to Handwriting',
    category: 'utility',
    icon: '✍️',
    color: '#d97706',
    description: 'Convert typed paragraphs into realistic handwritten notes on ruled notebook paper.',
    noUpload: true,
    options: [
      { name: 'text', label: 'Typed Notes', type: 'textarea', placeholder: 'Enter text to convert to handwritten notes...', default: 'A Thousand Tools processes everything 100% locally on your machine.\n\nNo uploads.\nNo servers.\nComplete data privacy.' },
      { name: 'inkColor', label: 'Pen Ink Color', type: 'select', options: [
        { label: 'Blue Ballpoint Pen', value: '#1d4ed8' },
        { label: 'Dark Navy Ink', value: '#1e3a8a' },
        { label: 'Classic Black Gel Pen', value: '#111827' }
      ], default: '#1d4ed8' }
    ]
  }
];

export function getToolById(idOrSlug) {
  if (!idOrSlug) return null;
  const normalized = idOrSlug.toLowerCase().trim().replace(/^\/tools\//, '').replace(/\/$/, '');
  return TOOLS.find(t => 
    t.id === normalized || 
    t.slug === normalized ||
    t.id === normalized.replace(/-/g, '_') ||
    t.slug === normalized.replace(/_/g, '-')
  );
}

export function getToolsByCategory(category) {
  if (!category || category === 'all') return TOOLS;
  return TOOLS.filter(t => t.category === category);
}

export function searchTools(query) {
  if (!query) return TOOLS;
  const q = query.toLowerCase().trim();
  return TOOLS.filter(t => 
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.id.toLowerCase().includes(q) ||
    t.slug.toLowerCase().includes(q)
  );
}
