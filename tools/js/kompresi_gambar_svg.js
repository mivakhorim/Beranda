// ===== BLOK JS #1 (Diekstrak dari kompresi_gambar_svg.html) =====
{
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://dutamik.id/#image-compressor",
        "name": "Kompresi Gambar & SVG",
        "alternateName": "Image & SVG Compressor dutamik.id",
        "operatingSystem": "All",
        "applicationCategory": "MultimediaApplication",
        "description": "Layanan kompresi gambar (AVIF, WebP, JPEG, PNG) dan optimasi vektor SVG berbasis browser client-side 100% aman, cepat, dan tanpa batas.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "IDR"
        },
        "author": {
          "@id": "https://dutamik.id/#organization"
        },
        "publisher": {
          "@id": "https://dutamik.id/#organization"
        }
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://dutamik.id/#organization",
        "name": "Duta Digital Agensi",
        "alternateName": "dutamik.id",
        "slogan": "Duta Media Informasi berKarya",
        "url": "https://dutamik.id",
        "telephone": "0831-3030-0094",
        "priceRange": "Free / Contact",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Bulusan RT 01 RW 08 Mandan",
          "addressLocality": "Kec. Sukoharjo",
          "addressRegion": "Jawa Tengah",
          "addressCountry": "ID"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+6283130300094",
          "contactType": "customer service",
          "availableLanguage": ["Indonesian", "English"]
        }
      }
    ]
  }

// ===== BLOK JS #2 (Diekstrak dari kompresi_gambar_svg.html) =====
tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#ecfdf5',
              100: '#d1fae5',
              200: '#a7f3d0',
              300: '#6ee7b7',
              400: '#34d399',
              500: '#10b981',
              600: '#059669',
              700: '#047857',
              800: '#065f46',
              900: '#064e3b'
            }
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
          }
        }
      }
    }

// ===== BLOK JS #3 (Diekstrak dari kompresi_gambar_svg.html) =====
(function() {
      'use strict';

      // Multi-Language Dictionary (ID & EN)
      const translations = {
        id: {
          appTitle: "Kompresi Gambar & SVG",
          appSubtitle: "Kompresi Gambar & Optimasi SVG Instan Tanpa Upload ke Server",
          studio: "Studio",
          batch: "Batch",
          demoSvg: "Contoh SVG",
          demoRaster: "Contoh Raster",
          dropTitle: "Tarik & Lepas Gambar / Berkas SVG",
          dropSubtitle: "Mendukung SVG (Vector), WebP, AVIF, PNG, JPEG. 100% langsung di perangkat Anda.",
          pasteHint: "Ctrl + V untuk Paste",
          chooseFile: "Pilih Berkas",
          labelOriginal: "Asli",
          labelCompressed: "Hasil",
          processing: "MEMPROSES...",
          svgCode: "Kode SVG",
          delta: "Delta",
          histogram: "Histogram",
          rgbSpectrum: "Spektrum RGB Keluaran",
          bins: "256 Bins",
          sizeEfficiency: "Efisiensi Ukuran",
          originalSize: "Ukuran Asli",
          compressedSize: "Ukuran Hasil",
          download: "Download",
          copyData: "Salin Data",
          targetFormat: "Format Output Sasaran",
          svgOptimizer: "Optimasi Vektor SVG",
          coordPrecision: "Presisi Desimal Koordinat",
          coordHint: "(Makin kecil = Makin hemat)",
          stripMetadata: "Bersihkan Metadata Editor (Inkscape/Illustrator)",
          shortenColors: "Ringkas Kode Warna (#ffffff → #fff)",
          compressionQuality: "Kualitas Kompresi",
          qualitySlim: "Ramping (1)",
          qualityBalanced: "Seimbang (75)",
          qualityCrisp: "Tajam (100)",
          pngQuantizer: "PNG Color Quantizer",
          dithering: "Floyd-Steinberg Dithering",
          resolutionResize: "Resolusi (Resize)",
          lockRatio: "Kunci Rasio",
          widthPx: "Lebar (px)",
          heightPx: "Tinggi (px)",
          filtersTransform: "Filter & Transformasi",
          sharpen: "Ketajaman (Unsharp Mask)",
          rotate90: "Putar 90°",
          flipH: "Balik (Flip)",
          totalFiles: "Total Berkas",
          totalOrigSize: "Ukuran Asli Total",
          totalCompSize: "Ukuran Hasil Total",
          totalSavings: "Total Penghematan",
          batchTitle: "Pengaturan Kompresi Batch Mandiri",
          batchSubtitle: "Sesuaikan kualitas, format, dan dimensi untuk semua berkas antrean.",
          addFiles: "Tambah Berkas",
          runBatch: "Jalankan Kompresi",
          downloadZip: "Download (.ZIP)",
          outputFormat: "Format Output",
          scaleMaxDim: "Skala / Resolusi Maksimal",
          microSharpen: "Ketajaman Mikro",
          batchCleanSvg: "Bersihkan Metadata Editor & Komentar XML (Khusus SVG)",
          batchPngDither: "Aktifkan Error Diffusion Dithering (Khusus PNG)",
          batchDropTitle: "Tarik & Jatuhkan Banyak Berkas (Gambar / SVG) ke Sini",
          batchDropSubtitle: "Mendukung SVG, WebP, AVIF, PNG, JPEG",
          thPreview: "Pratinjau",
          thName: "Nama Berkas",
          thFormat: "Format Input → Output",
          thOriginal: "Ukuran Asli",
          thResult: "Hasil Kompresi",
          thSavings: "Penghematan",
          thStatus: "Status",
          thAction: "Aksi",
          batchEmpty: "Belum ada berkas dalam antrean batch. Silakan tarik berkas atau klik tombol Tambah Berkas di atas.",
          svgCodeTitle: "Kode SVG Teroptimasi",
          copyCode: "Salin Kode",
          optWebP: "WebP (Sangat Dianjurkan)",
          optAVIF: "AVIF (Kompresi Maksimal)",
          optSVG: "SVG (Minifikasi Vektor)",
          optJPEG: "JPEG (Universal)",
          optPNG: "PNG (Transparansi / Kuantisasi)",
          optOriginal: "Pertahankan Format Asli Tiap File",
          scale100: "100% (Resolusi Asli Penuh)",
          scale75: "75% (Turunkan Sedikit)",
          scale50: "50% (Resolusi Separuh)",
          scale25: "25% (Thumbnail Cepat)",
          scale1920: "Batas Maks Lebar 1920px (Full HD)",
          scale1280: "Batas Maks Lebar 1280px (HD)",
          scale800: "Batas Maks Lebar 800px (Web Content)"
        },
        en: {
          appTitle: "Image & SVG Compressor",
          appSubtitle: "Instant Client-Side Image Compression & SVG Optimizer Without Server Upload",
          studio: "Studio",
          batch: "Batch",
          demoSvg: "Demo SVG",
          demoRaster: "Demo Raster",
          dropTitle: "Drag & Drop Images / SVG Files Here",
          dropSubtitle: "Supports SVG (Vector), WebP, AVIF, PNG, JPEG. 100% processed directly on your device.",
          pasteHint: "Ctrl + V to Paste",
          chooseFile: "Browse Files",
          labelOriginal: "Original",
          labelCompressed: "Result",
          processing: "PROCESSING...",
          svgCode: "SVG Code",
          delta: "Delta",
          histogram: "Histogram",
          rgbSpectrum: "Output RGB Spectrum",
          bins: "256 Bins",
          sizeEfficiency: "Size Efficiency",
          originalSize: "Original Size",
          compressedSize: "Compressed Size",
          download: "Download",
          copyData: "Copy Data",
          targetFormat: "Target Output Format",
          svgOptimizer: "SVG Vector Optimizer",
          coordPrecision: "Coordinate Decimal Precision",
          coordHint: "(Lower = Smaller size)",
          stripMetadata: "Strip Editor Metadata (Inkscape/Illustrator)",
          shortenColors: "Shorten Color Codes (#ffffff → #fff)",
          compressionQuality: "Compression Quality",
          qualitySlim: "Small (1)",
          qualityBalanced: "Balanced (75)",
          qualityCrisp: "Crisp (100)",
          pngQuantizer: "PNG Color Quantizer",
          dithering: "Floyd-Steinberg Dithering",
          resolutionResize: "Resolution (Resize)",
          lockRatio: "Lock Ratio",
          widthPx: "Width (px)",
          heightPx: "Height (px)",
          filtersTransform: "Filters & Transform",
          sharpen: "Micro Sharpen (Unsharp Mask)",
          rotate90: "Rotate 90°",
          flipH: "Flip Horizontal",
          totalFiles: "Total Files",
          totalOrigSize: "Total Original Size",
          totalCompSize: "Total Result Size",
          totalSavings: "Total Savings",
          batchTitle: "Custom Batch Compression Settings",
          batchSubtitle: "Customize quality, format, and dimensions for all queued files.",
          addFiles: "Add Files",
          runBatch: "Run Compression",
          downloadZip: "Download (.ZIP)",
          outputFormat: "Output Format",
          scaleMaxDim: "Scale / Max Resolution",
          microSharpen: "Micro Sharpening",
          batchCleanSvg: "Clean Editor Metadata & XML Comments (SVG Only)",
          batchPngDither: "Enable Error Diffusion Dithering (PNG Only)",
          batchDropTitle: "Drag & Drop Multiple Files (Images / SVG) Here",
          batchDropSubtitle: "Supports SVG, WebP, AVIF, PNG, JPEG",
          thPreview: "Preview",
          thName: "File Name",
          thFormat: "Input → Output Format",
          thOriginal: "Original Size",
          thResult: "Compressed Result",
          thSavings: "Savings",
          thStatus: "Status",
          thAction: "Action",
          batchEmpty: "No files in the batch queue. Drag files or click Add Files button above.",
          svgCodeTitle: "Optimized SVG Code",
          copyCode: "Copy Code",
          optWebP: "WebP (Highly Recommended)",
          optAVIF: "AVIF (Max Compression)",
          optSVG: "SVG (Vector Minify)",
          optJPEG: "JPEG (Universal)",
          optPNG: "PNG (Transparency / Quantized)",
          optOriginal: "Keep Original Format per File",
          scale100: "100% (Full Original Resolution)",
          scale75: "75% (Slight Downscale)",
          scale50: "50% (Half Resolution)",
          scale25: "25% (Quick Thumbnail)",
          scale1920: "Max Width 1920px (Full HD)",
          scale1280: "Max Width 1280px (HD)",
          scale800: "Max Width 800px (Web Content)"
        }
      };

      let currentLang = localStorage.getItem('lang') || 'id';

      // Global State
      const state = {
        mode: 'studio',
        originalImage: null,
        originalFile: null,
        isSvgInput: false,
        rawSvgText: '',
        optimizedSvgText: '',
        compressedBlob: null,
        compressedUrl: null,
        format: 'image/webp',
        quality: 0.75,
        colors: 256,
        dither: true,
        width: 0,
        height: 0,
        originalWidth: 0,
        originalHeight: 0,
        aspectRatio: 1,
        sharpen: 0,
        rotation: 0,
        flipH: false,
        zoom: 1,
        panX: 0,
        panY: 0,
        splitPos: 50,
        showDiff: false,
        showHistogram: false,
        isProcessing: false,
        svgPrecision: 2,
        svgStripMeta: true,
        svgShortenColors: true,
        batchQueue: []
      };

      // DOM Elements
      const els = {
        appRoot: document.getElementById('app-root'),
        tabStudioBtn: document.getElementById('tab-studio-btn'),
        tabBatchBtn: document.getElementById('tab-batch-btn'),
        studioView: document.getElementById('studio-view'),
        batchView: document.getElementById('batch-view'),
        dropzone: document.getElementById('dropzone'),
        fileInput: document.getElementById('file-input'),
        canvasWrapper: document.getElementById('canvas-wrapper'),
        canvasOriginal: document.getElementById('canvas-original'),
        canvasCompressed: document.getElementById('canvas-compressed'),
        canvasDiff: document.getElementById('canvas-diff'),
        clipOverlay: document.getElementById('clip-overlay'),
        splitHandle: document.getElementById('split-handle'),
        viewportBox: document.getElementById('viewport-box'),
        viewportToolbar: document.getElementById('viewport-toolbar'),
        processingLoader: document.getElementById('processing-loader'),
        
        btnZoomIn: document.getElementById('btn-zoom-in'),
        btnZoomOut: document.getElementById('btn-zoom-out'),
        btnZoomFit: document.getElementById('btn-zoom-fit'),
        btnZoom100: document.getElementById('btn-zoom-100'),
        zoomLevelText: document.getElementById('zoom-level-text'),
        btnToggleDiff: document.getElementById('btn-toggle-diff'),
        btnToggleHistogram: document.getElementById('btn-toggle-histogram'),
        btnViewSvgCode: document.getElementById('btn-view-svg-code'),
        histogramContainer: document.getElementById('histogram-container'),
        histogramCanvas: document.getElementById('histogram-canvas'),
        
        statOrigSize: document.getElementById('stat-orig-size'),
        statCompSize: document.getElementById('stat-comp-size'),
        savingsBadge: document.getElementById('savings-badge'),
        labelOrigType: document.getElementById('label-orig-type'),
        labelOrigRes: document.getElementById('label-orig-res'),
        labelCompFormat: document.getElementById('label-comp-format'),
        
        formatPills: document.querySelectorAll('.format-pill'),
        svgOptimizerBlock: document.getElementById('svg-optimizer-block'),
        paramSvgPrecision: document.getElementById('param-svg-precision'),
        svgPrecValBadge: document.getElementById('svg-prec-val-badge'),
        paramSvgStripMeta: document.getElementById('param-svg-strip-meta'),
        paramSvgShortenColors: document.getElementById('param-svg-shorten-colors'),

        paramQuality: document.getElementById('param-quality'),
        qualityValBadge: document.getElementById('quality-val-badge'),
        qualityBlock: document.getElementById('quality-control-block'),
        pngQuantBlock: document.getElementById('png-quant-block'),
        paramColors: document.getElementById('param-colors'),
        colorsValBadge: document.getElementById('colors-val-badge'),
        paramDither: document.getElementById('param-dither'),
        paramWidth: document.getElementById('param-width'),
        paramHeight: document.getElementById('param-height'),
        paramResizeLock: document.getElementById('param-resize-lock'),
        scalePresets: document.querySelectorAll('.btn-scale-preset'),
        paramSharpen: document.getElementById('param-sharpen'),
        sharpenValBadge: document.getElementById('sharpen-val-badge'),
        btnRotateCw: document.getElementById('btn-rotate-cw'),
        btnFlipH: document.getElementById('btn-flip-h'),
        btnDownload: document.getElementById('btn-download'),
        btnCopyClipboard: document.getElementById('btn-copy-clipboard'),
        btnLangToggle: document.getElementById('btn-lang-toggle'),
        btnThemeToggle: document.getElementById('btn-theme-toggle'),
        btnDemoSvg: document.getElementById('btn-demo-svg'),
        btnDemoImg: document.getElementById('btn-demo-img'),
        btnReset: document.getElementById('btn-reset'),

        modalSvgCode: document.getElementById('modal-svg-code'),
        svgCodeOutput: document.getElementById('svg-code-output'),
        svgCodeSizeInfo: document.getElementById('svg-code-size-info'),
        btnCloseModalSvg: document.getElementById('btn-close-modal-svg'),
        btnCopySvgCode: document.getElementById('btn-copy-svg-code'),

        batchStatCount: document.getElementById('batch-stat-count'),
        batchStatOrigTotal: document.getElementById('batch-stat-orig-total'),
        batchStatCompTotal: document.getElementById('batch-stat-comp-total'),
        batchStatSavedTotal: document.getElementById('batch-stat-saved-total'),
        batchOptFormat: document.getElementById('batch-opt-format'),
        batchOptQuality: document.getElementById('batch-opt-quality'),
        batchQualityVal: document.getElementById('batch-quality-val'),
        batchOptScale: document.getElementById('batch-opt-scale'),
        batchOptSharpen: document.getElementById('batch-opt-sharpen'),
        batchSharpenVal: document.getElementById('batch-sharpen-val'),
        batchOptSvgClean: document.getElementById('batch-opt-svg-clean'),
        batchOptPngDither: document.getElementById('batch-opt-png-dither'),
        batchProgressBox: document.getElementById('batch-progress-box'),
        batchProgressText: document.getElementById('batch-progress-text'),
        batchProgressPct: document.getElementById('batch-progress-pct'),
        batchProgressBar: document.getElementById('batch-progress-bar'),
        batchFileInput: document.getElementById('batch-file-input'),
        batchDropzone: document.getElementById('batch-dropzone'),
        btnBatchAdd: document.getElementById('btn-batch-add'),
        btnBatchProcess: document.getElementById('btn-batch-process'),
        btnBatchZip: document.getElementById('btn-batch-zip'),
        btnBatchClear: document.getElementById('btn-batch-clear'),
        batchTableBody: document.getElementById('batch-table-body'),
        batchEmptyState: document.getElementById('batch-empty-state')
      };

      function initIcons() {
        if (window.lucide) lucide.createIcons();
      }

      function formatBytes(bytes, decimals = 1) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
      }

      // --- LANGUAGE SWITCHER ENGINE ---
      function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        document.documentElement.lang = lang;
        els.btnLangToggle.innerText = lang.toUpperCase();

        const dict = translations[lang] || translations.id;
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          if (dict[key]) {
            el.innerHTML = dict[key];
          }
        });

        // Update Dynamic Badges
        els.svgPrecValBadge.innerText = `${state.svgPrecision} ${lang === 'id' ? 'Desimal' : 'Decimals'}`;
        els.colorsValBadge.innerText = `${state.colors} ${lang === 'id' ? 'Warna' : 'Colors'}`;

        renderBatchTable();
        initIcons();
      }

      els.btnLangToggle.addEventListener('click', () => {
        const nextLang = currentLang === 'id' ? 'en' : 'id';
        applyLanguage(nextLang);
      });

      // --- THEME SWITCHER ---
      function toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        initIcons();
      }
      els.btnThemeToggle.addEventListener('click', toggleTheme);

      // --- SVG TRANSFORMATION ENGINE ---
      function transformSvgXml(svgString, rotation, flipH) {
        if (rotation === 0 && !flipH) return svgString;
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(svgString, 'image/svg+xml');
          const svgEl = doc.querySelector('svg');
          if (!svgEl) return svgString;

          let vb = svgEl.getAttribute('viewBox');
          let baseW, baseH;
          if (vb) {
            const parts = vb.trim().split(/[\s,]+/).map(parseFloat);
            baseW = parts[2] || 800;
            baseH = parts[3] || 600;
          } else {
            baseW = parseFloat(svgEl.getAttribute('width')) || 800;
            baseH = parseFloat(svgEl.getAttribute('height')) || 600;
          }

          const isSwapped = (rotation % 180 !== 0);
          const targetW = isSwapped ? baseH : baseW;
          const targetH = isSwapped ? baseW : baseH;

          let transformStr = '';
          if (rotation === 90) {
            transformStr += `translate(${targetW}, 0) rotate(90) `;
          } else if (rotation === 180) {
            transformStr += `translate(${targetW}, ${targetH}) rotate(180) `;
          } else if (rotation === 270) {
            transformStr += `translate(0, ${targetH}) rotate(270) `;
          }

          if (flipH) {
            const flipOffset = isSwapped ? targetH : targetW;
            transformStr += `translate(${flipOffset}, 0) scale(-1, 1) `;
          }

          const g = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
          if (transformStr.trim()) g.setAttribute('transform', transformStr.trim());

          while (svgEl.firstChild) g.appendChild(svgEl.firstChild);
          svgEl.appendChild(g);

          svgEl.setAttribute('viewBox', `0 0 ${targetW} ${targetH}`);
          svgEl.setAttribute('width', targetW.toString());
          svgEl.setAttribute('height', targetH.toString());

          return new XMLSerializer().serializeToString(doc);
        } catch (e) {
          console.error("SVG Transform error:", e);
          return svgString;
        }
      }

      // --- SVG MINIFICATION ---
      function optimizeSvgString(svgString, options = {}) {
        const precision = options.precision !== undefined ? options.precision : 2;
        const stripMeta = options.stripMeta !== false;
        const shortenColors = options.shortenColors !== false;

        let result = svgString;
        result = result.replace(/<\?xml[\s\S]*?\?>/gi, '');
        result = result.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
        result = result.replace(/<!--[\s\S]*?-->/g, '');

        if (stripMeta) {
          result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
          result = result.replace(/<title[\s\S]*?<\/title>/gi, '');
          result = result.replace(/<desc[\s\S]*?<\/desc>/gi, '');
          result = result.replace(/\s*(xmlns:inkscape|xmlns:sodipodi|xmlns:sketch|xmlns:dc|xmlns:cc|xmlns:rdf|xmlns:svg)="[^"]*"/gi, '');
          result = result.replace(/\s*(inkscape:[a-z-]+|sodipodi:[a-z-]+|sketch:[a-z-]+)="[^"]*"/gi, '');
        }

        if (precision >= 0) {
          const numRegex = /(-?\d+\.\d+)/g;
          result = result.replace(numRegex, (match) => {
            const num = parseFloat(match);
            if (isNaN(num)) return match;
            return Number(num.toFixed(precision)).toString();
          });
        }

        if (shortenColors) {
          result = result.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, '#$1$2$3');
        }

        return result.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();
      }

      // --- COLOR QUANTIZATION & DITHERING ---
      function quantizeImageData(imageData, colorCount = 256, useDither = true) {
        const data = imageData.data;
        const w = imageData.width;
        const h = imageData.height;
        const step = Math.max(1, Math.round(256 / Math.cbrt(colorCount)));
        const quantizeVal = (v) => Math.min(255, Math.floor((v + step / 2) / step) * step);

        if (!useDither) {
          for (let i = 0; i < data.length; i += 4) {
            data[i] = quantizeVal(data[i]);
            data[i + 1] = quantizeVal(data[i + 1]);
            data[i + 2] = quantizeVal(data[i + 2]);
          }
          return imageData;
        }

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const oldR = data[idx];
            const oldG = data[idx + 1];
            const oldB = data[idx + 2];

            const newR = quantizeVal(oldR);
            const newG = quantizeVal(oldG);
            const newB = quantizeVal(oldB);

            data[idx] = newR;
            data[idx + 1] = newG;
            data[idx + 2] = newB;

            const errR = oldR - newR;
            const errG = oldG - newG;
            const errB = oldB - newB;

            const distributeError = (px, py, factor) => {
              if (px >= 0 && px < w && py >= 0 && py < h) {
                const targetIdx = (py * w + px) * 4;
                data[targetIdx] = Math.min(255, Math.max(0, data[targetIdx] + errR * factor));
                data[targetIdx + 1] = Math.min(255, Math.max(0, data[targetIdx + 1] + errG * factor));
                data[targetIdx + 2] = Math.min(255, Math.max(0, data[targetIdx + 2] + errB * factor));
              }
            };

            distributeError(x + 1, y, 7 / 16);
            distributeError(x - 1, y + 1, 3 / 16);
            distributeError(x, y + 1, 5 / 16);
            distributeError(x + 1, y + 1, 1 / 16);
          }
        }
        return imageData;
      }

      // --- UNSHARP MASK SHARPENING ---
      function applySharpen(ctx, width, height, amount) {
        if (amount <= 0) return;
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const buff = new Uint8ClampedArray(data);
        const factor = amount * 0.15;

        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            for (let c = 0; c < 3; c++) {
              const current = buff[idx + c];
              const neighbors = (
                buff[((y - 1) * width + x) * 4 + c] +
                buff[((y + 1) * width + x) * 4 + c] +
                buff[(y * width + (x - 1)) * 4 + c] +
                buff[(y * width + (x + 1)) * 4 + c]
              );
              const sharpened = current + (current * 4 - neighbors) * factor;
              data[idx + c] = Math.min(255, Math.max(0, sharpened));
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // --- CANVAS RENDERING PIPELINE ---
      function renderProcessedCanvas(sourceImg, targetW, targetH, options = {}) {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = targetW;
        offCanvas.height = targetH;
        const ctx = offCanvas.getContext('2d', { willReadFrequently: true, alpha: true });

        ctx.save();
        ctx.translate(targetW / 2, targetH / 2);
        if (options.rotation) ctx.rotate((options.rotation * Math.PI) / 180);
        if (options.flipH) ctx.scale(-1, 1);

        const drawW = (options.rotation % 180 !== 0) ? targetH : targetW;
        const drawH = (options.rotation % 180 !== 0) ? targetW : targetH;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(sourceImg, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        if (options.sharpen > 0) {
          applySharpen(ctx, targetW, targetH, options.sharpen);
        }

        if (options.format === 'image/png' && options.colors && options.colors < 256) {
          const imgData = ctx.getImageData(0, 0, targetW, targetH);
          quantizeImageData(imgData, options.colors, options.dither);
          ctx.putImageData(imgData, 0, 0);
        }

        return offCanvas;
      }

      // --- DELTA HEATMAP GENERATOR ---
      function generateDifferenceMap(origCanvas, compCanvas, diffCanvas) {
        diffCanvas.width = origCanvas.width;
        diffCanvas.height = origCanvas.height;
        const ctxDiff = diffCanvas.getContext('2d');
        const ctxOrig = origCanvas.getContext('2d', { willReadFrequently: true });
        const ctxComp = compCanvas.getContext('2d', { willReadFrequently: true });

        const d1 = ctxOrig.getImageData(0, 0, origCanvas.width, origCanvas.height).data;
        const d2 = ctxComp.getImageData(0, 0, origCanvas.width, origCanvas.height).data;
        const out = ctxDiff.createImageData(origCanvas.width, origCanvas.height);
        const outData = out.data;

        for (let i = 0; i < d1.length; i += 4) {
          const dr = Math.abs(d1[i] - d2[i]);
          const dg = Math.abs(d1[i + 1] - d2[i + 1]);
          const db = Math.abs(d1[i + 2] - d2[i + 2]);
          const delta = (dr + dg + db) / 3;

          if (delta === 0) {
            outData[i + 3] = 0;
          } else {
            outData[i] = Math.min(255, delta * 8);
            outData[i + 1] = Math.max(0, 255 - delta * 6);
            outData[i + 2] = 255;
            outData[i + 3] = Math.min(255, 60 + delta * 5);
          }
        }
        ctxDiff.putImageData(out, 0, 0);
      }

      // --- HISTOGRAM RENDERER ---
      function updateHistogram(canvasSource) {
        if (!state.showHistogram || !canvasSource) return;
        const ctxHist = els.histogramCanvas.getContext('2d');
        const srcCtx = canvasSource.getContext('2d', { willReadFrequently: true });
        
        const w = els.histogramCanvas.width = els.histogramCanvas.clientWidth;
        const h = els.histogramCanvas.height = els.histogramCanvas.clientHeight;
        ctxHist.clearRect(0, 0, w, h);
        
        const imgData = srcCtx.getImageData(0, 0, canvasSource.width, canvasSource.height).data;
        const rCount = new Array(256).fill(0);
        const gCount = new Array(256).fill(0);
        const bCount = new Array(256).fill(0);

        for (let i = 0; i < imgData.length; i += 4) {
          rCount[imgData[i]]++;
          gCount[imgData[i + 1]]++;
          bCount[imgData[i + 2]]++;
        }

        const maxVal = Math.max(...rCount, ...gCount, ...bCount) || 1;
        const drawChannel = (arr, color) => {
          ctxHist.strokeStyle = color;
          ctxHist.lineWidth = 1;
          ctxHist.beginPath();
          for (let x = 0; x < 256; x++) {
            const plotX = (x / 255) * w;
            const plotY = h - (arr[x] / maxVal) * h;
            if (x === 0) ctxHist.moveTo(plotX, plotY);
            else ctxHist.lineTo(plotX, plotY);
          }
          ctxHist.stroke();
        };

        ctxHist.globalCompositeOperation = 'screen';
        drawChannel(rCount, 'rgba(239, 68, 68, 0.7)');
        drawChannel(gCount, 'rgba(34, 197, 94, 0.7)');
        drawChannel(bCount, 'rgba(59, 130, 246, 0.7)');
        ctxHist.globalCompositeOperation = 'source-over';
      }

      // --- STUDIO COMPRESSION PIPELINE ---
      async function executeCompression() {
        if (!state.originalImage) return;
        state.isProcessing = true;
        els.processingLoader.classList.remove('hidden');

        try {
          if (state.format === 'image/svg+xml' && state.isSvgInput) {
            const transformedSvg = transformSvgXml(state.rawSvgText, state.rotation, state.flipH);
            const cleanSvg = optimizeSvgString(transformedSvg, {
              precision: state.svgPrecision,
              stripMeta: state.svgStripMeta,
              shortenColors: state.svgShortenColors
            });

            state.optimizedSvgText = cleanSvg;
            const blob = new Blob([cleanSvg], { type: 'image/svg+xml' });
            state.compressedBlob = blob;
            if (state.compressedUrl) URL.revokeObjectURL(state.compressedUrl);
            state.compressedUrl = URL.createObjectURL(blob);

            els.canvasOriginal.width = state.width;
            els.canvasOriginal.height = state.height;
            const origCanvas = renderProcessedCanvas(state.originalImage, state.width, state.height, {
              rotation: state.rotation,
              flipH: state.flipH
            });
            els.canvasOriginal.getContext('2d').drawImage(origCanvas, 0, 0);

            const optSvgImg = new Image();
            await new Promise((resolve) => {
              optSvgImg.onload = resolve;
              optSvgImg.src = state.compressedUrl;
            });

            els.canvasCompressed.width = state.width;
            els.canvasCompressed.height = state.height;
            els.canvasCompressed.getContext('2d').drawImage(optSvgImg, 0, 0, state.width, state.height);

            els.btnViewSvgCode.classList.remove('hidden');

          } else if (state.format === 'image/svg+xml' && !state.isSvgInput) {
            const compCanvas = renderProcessedCanvas(state.originalImage, state.width, state.height, {
              rotation: state.rotation,
              flipH: state.flipH,
              sharpen: state.sharpen,
              format: 'image/png',
              colors: state.colors,
              dither: state.dither
            });
            const dataUrl = compCanvas.toDataURL('image/png');
            const wrappedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${state.width} ${state.height}" width="${state.width}" height="${state.height}"><image href="${dataUrl}" width="${state.width}" height="${state.height}"/></svg>`;
            
            state.optimizedSvgText = wrappedSvg;
            const blob = new Blob([wrappedSvg], { type: 'image/svg+xml' });
            state.compressedBlob = blob;
            if (state.compressedUrl) URL.revokeObjectURL(state.compressedUrl);
            state.compressedUrl = URL.createObjectURL(blob);

            els.canvasOriginal.width = state.width;
            els.canvasOriginal.height = state.height;
            els.canvasOriginal.getContext('2d').drawImage(state.originalImage, 0, 0, state.width, state.height);

            els.canvasCompressed.width = state.width;
            els.canvasCompressed.height = state.height;
            els.canvasCompressed.getContext('2d').drawImage(compCanvas, 0, 0);

            els.btnViewSvgCode.classList.remove('hidden');

          } else {
            els.btnViewSvgCode.classList.add('hidden');

            const origCanvas = renderProcessedCanvas(state.originalImage, state.width, state.height, {
              rotation: state.rotation,
              flipH: state.flipH,
              sharpen: 0
            });

            const compCanvas = renderProcessedCanvas(state.originalImage, state.width, state.height, {
              rotation: state.rotation,
              flipH: state.flipH,
              sharpen: state.sharpen,
              format: state.format,
              colors: state.colors,
              dither: state.dither
            });

            const blob = await new Promise((resolve) => {
              compCanvas.toBlob((b) => {
                if (b) resolve(b);
                else compCanvas.toBlob(resolve, 'image/jpeg', state.quality);
              }, state.format, state.quality);
            });

            state.compressedBlob = blob;
            if (state.compressedUrl) URL.revokeObjectURL(state.compressedUrl);
            state.compressedUrl = URL.createObjectURL(blob);

            els.canvasOriginal.width = state.width;
            els.canvasOriginal.height = state.height;
            els.canvasOriginal.getContext('2d').drawImage(origCanvas, 0, 0);

            els.canvasCompressed.width = state.width;
            els.canvasCompressed.height = state.height;
            const compCtx = els.canvasCompressed.getContext('2d');
            
            const finalImg = new Image();
            await new Promise((resolve) => {
              finalImg.onload = resolve;
              finalImg.src = state.compressedUrl;
            });
            compCtx.drawImage(finalImg, 0, 0);
          }

          generateDifferenceMap(els.canvasOriginal, els.canvasCompressed, els.canvasDiff);

          const origSize = state.originalFile ? state.originalFile.size : 100000;
          const compSize = state.compressedBlob.size;
          const savedPct = Math.round(((origSize - compSize) / origSize) * 100);

          els.statOrigSize.innerText = formatBytes(origSize);
          els.statCompSize.innerText = formatBytes(compSize);
          els.savingsBadge.innerText = (savedPct >= 0 ? '-' : '+') + Math.abs(savedPct) + '%';
          els.savingsBadge.className = `px-2 py-0.5 rounded-full text-xs font-bold font-mono border ${
            savedPct >= 0 
              ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' 
              : 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
          }`;

          els.labelCompFormat.innerText = state.format === 'image/svg+xml' ? 'SVG' : state.format.split('/')[1].toUpperCase();
          els.btnDownload.disabled = false;
          els.btnCopyClipboard.disabled = false;

          updateHistogram(els.canvasCompressed);
          updateViewportTransforms();

        } catch (err) {
          console.error("Pipeline Error:", err);
        } finally {
          state.isProcessing = false;
          els.processingLoader.classList.add('hidden');
        }
      }

      // --- VIEWPORT TRANSFORMS ---
      function updateViewportTransforms() {
        if (!state.originalImage) return;

        const containerW = els.viewportBox.clientWidth;
        const containerH = els.viewportBox.clientHeight;
        const scaledW = state.width * state.zoom;
        const scaledH = state.height * state.zoom;

        const left = (containerW - scaledW) / 2 + state.panX;
        const top = (containerH - scaledH) / 2 + state.panY;

        const style = `width: ${scaledW}px; height: ${scaledH}px; transform: translate3d(${left}px, ${top}px, 0);`;
        els.canvasOriginal.style.cssText = style;
        els.canvasCompressed.style.cssText = style;
        els.canvasDiff.style.cssText = style;

        const splitPx = (containerW * state.splitPos) / 100;
        els.clipOverlay.style.clipPath = `polygon(0 0, ${splitPx}px 0, ${splitPx}px 100%, 0 100%)`;
        els.splitHandle.style.left = `${splitPx}px`;

        els.zoomLevelText.innerText = Math.round(state.zoom * 100) + '%';
      }

      function fitToViewport() {
        if (!state.originalImage) return;
        const containerW = els.viewportBox.clientWidth - 32;
        const containerH = els.viewportBox.clientHeight - 32;
        const scale = Math.min(containerW / state.width, containerH / state.height, 1);
        state.zoom = scale;
        state.panX = 0;
        state.panY = 0;
        updateViewportTransforms();
      }

      // --- FILE LOAD HANDLER ---
      function loadSourceFile(file) {
        if (!file) return;
        state.originalFile = file;
        state.isSvgInput = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

        els.labelOrigType.innerText = state.isSvgInput ? 'SVG' : (file.type.split('/')[1]?.toUpperCase() || 'RASTER');

        if (state.isSvgInput) {
          const reader = new FileReader();
          reader.onload = (e) => {
            state.rawSvgText = e.target.result;
            setFormatSelection('image/svg+xml');

            const blob = new Blob([state.rawSvgText], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const img = new Image();

            img.onload = () => {
              state.originalImage = img;
              const w = img.naturalWidth || 800;
              const h = img.naturalHeight || 600;
              state.originalWidth = w;
              state.originalHeight = h;
              state.width = w;
              state.height = h;
              state.aspectRatio = w / h;
              state.rotation = 0;
              state.flipH = false;

              els.paramWidth.value = w;
              els.paramHeight.value = h;
              els.labelOrigRes.innerText = `${w} × ${h}`;

              els.dropzone.classList.add('hidden');
              els.canvasWrapper.classList.remove('hidden');
              els.viewportToolbar.classList.remove('hidden');

              fitToViewport();
              executeCompression();
              URL.revokeObjectURL(url);
            };
            img.src = url;
          };
          reader.readAsText(file);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              state.originalImage = img;
              state.originalWidth = img.naturalWidth;
              state.originalHeight = img.naturalHeight;
              state.width = img.naturalWidth;
              state.height = img.naturalHeight;
              state.aspectRatio = img.naturalWidth / img.naturalHeight;
              state.rotation = 0;
              state.flipH = false;

              els.paramWidth.value = state.width;
              els.paramHeight.value = state.height;
              els.labelOrigRes.innerText = `${state.width} × ${state.height}`;

              if (state.format === 'image/svg+xml') {
                setFormatSelection('image/webp');
              }

              els.dropzone.classList.add('hidden');
              els.canvasWrapper.classList.remove('hidden');
              els.viewportToolbar.classList.remove('hidden');

              fitToViewport();
              executeCompression();
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      }

      function setFormatSelection(newFormat) {
        state.format = newFormat;
        els.formatPills.forEach(p => {
          if (p.dataset.format === newFormat) {
            p.className = "format-pill py-1.5 rounded-lg transition-all bg-brand-500 text-white dark:text-slate-950 shadow-sm font-semibold";
          } else {
            p.className = "format-pill py-1.5 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold";
          }
        });

        const isSVG = newFormat === 'image/svg+xml';
        const isPNG = newFormat === 'image/png';

        els.svgOptimizerBlock.classList.toggle('hidden', !isSVG);
        els.pngQuantBlock.classList.toggle('hidden', !isPNG);
        els.qualityBlock.classList.toggle('hidden', isSVG || isPNG);
      }

      // --- EVENTS ---

      els.dropzone.addEventListener('click', () => els.fileInput.click());
      els.fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) loadSourceFile(e.target.files[0]);
      });

      window.addEventListener('dragover', (e) => e.preventDefault());
      window.addEventListener('drop', (e) => {
        e.preventDefault();
        if (state.mode === 'studio') {
          if (e.dataTransfer.files && e.dataTransfer.files[0]) loadSourceFile(e.dataTransfer.files[0]);
        } else {
          handleBatchAddFiles(e.dataTransfer.files);
        }
      });

      window.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1 || items[i].type === 'image/svg+xml') {
            const file = items[i].getAsFile();
            loadSourceFile(file);
            break;
          }
        }
      });

      // Split Divider Drag (Touch & Mouse)
      let isDraggingSplit = false;
      els.splitHandle.addEventListener('mousedown', () => isDraggingSplit = true);
      els.splitHandle.addEventListener('touchstart', () => isDraggingSplit = true, { passive: true });

      window.addEventListener('mousemove', (e) => {
        if (!isDraggingSplit) return;
        const rect = els.viewportBox.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        let pct = (offsetX / rect.width) * 100;
        state.splitPos = Math.max(0, Math.min(100, pct));
        updateViewportTransforms();
      });

      window.addEventListener('touchmove', (e) => {
        if (!isDraggingSplit || !e.touches[0]) return;
        const rect = els.viewportBox.getBoundingClientRect();
        const offsetX = e.touches[0].clientX - rect.left;
        let pct = (offsetX / rect.width) * 100;
        state.splitPos = Math.max(0, Math.min(100, pct));
        updateViewportTransforms();
      }, { passive: true });

      window.addEventListener('mouseup', () => isDraggingSplit = false);
      window.addEventListener('touchend', () => isDraggingSplit = false);

      // Pan & Zoom
      let isPanning = false;
      let startPanX = 0, startPanY = 0;

      els.canvasWrapper.addEventListener('mousedown', (e) => {
        if (e.target === els.splitHandle || els.splitHandle.contains(e.target)) return;
        isPanning = true;
        startPanX = e.clientX - state.panX;
        startPanY = e.clientY - state.panY;
      });

      window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        state.panX = e.clientX - startPanX;
        state.panY = e.clientY - startPanY;
        updateViewportTransforms();
      });

      window.addEventListener('mouseup', () => isPanning = false);

      let initialDistance = 0;
      let initialZoom = 1;

      els.viewportBox.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1 && !isDraggingSplit) {
          isPanning = true;
          startPanX = e.touches[0].clientX - state.panX;
          startPanY = e.touches[0].clientY - state.panY;
        } else if (e.touches.length === 2) {
          isPanning = false;
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          initialDistance = Math.hypot(dx, dy);
          initialZoom = state.zoom;
        }
      }, { passive: true });

      els.viewportBox.addEventListener('touchmove', (e) => {
        if (isDraggingSplit) return;
        if (e.touches.length === 1 && isPanning) {
          state.panX = e.touches[0].clientX - startPanX;
          state.panY = e.touches[0].clientY - startPanY;
          updateViewportTransforms();
        } else if (e.touches.length === 2 && initialDistance > 0) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const currentDistance = Math.hypot(dx, dy);
          const factor = currentDistance / initialDistance;
          state.zoom = Math.min(10, Math.max(0.1, initialZoom * factor));
          updateViewportTransforms();
        }
      }, { passive: true });

      els.viewportBox.addEventListener('touchend', () => {
        isPanning = false;
        initialDistance = 0;
      });

      els.viewportBox.addEventListener('wheel', (e) => {
        if (!state.originalImage) return;
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
        state.zoom = Math.min(10, Math.max(0.1, state.zoom * zoomFactor));
        updateViewportTransforms();
      }, { passive: false });

      els.btnZoomIn.addEventListener('click', () => {
        state.zoom = Math.min(10, state.zoom * 1.25);
        updateViewportTransforms();
      });
      els.btnZoomOut.addEventListener('click', () => {
        state.zoom = Math.max(0.1, state.zoom * 0.8);
        updateViewportTransforms();
      });
      els.btnZoomFit.addEventListener('click', fitToViewport);
      els.btnZoom100.addEventListener('click', () => {
        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;
        updateViewportTransforms();
      });

      els.btnToggleDiff.addEventListener('click', () => {
        state.showDiff = !state.showDiff;
        els.canvasDiff.classList.toggle('hidden', !state.showDiff);
        els.btnToggleDiff.classList.toggle('bg-pink-500/20', state.showDiff);
        els.btnToggleDiff.classList.toggle('border-pink-500', state.showDiff);
      });

      els.btnToggleHistogram.addEventListener('click', () => {
        state.showHistogram = !state.showHistogram;
        els.histogramContainer.classList.toggle('hidden', !state.showHistogram);
        els.btnToggleHistogram.classList.toggle('bg-cyan-500/20', state.showHistogram);
        els.btnToggleHistogram.classList.toggle('border-cyan-500', state.showHistogram);
        if (state.showHistogram) updateHistogram(els.canvasCompressed);
      });

      els.btnViewSvgCode.addEventListener('click', () => {
        els.svgCodeOutput.value = state.optimizedSvgText;
        els.svgCodeSizeInfo.innerText = `${state.optimizedSvgText.length.toLocaleString()} ${currentLang === 'id' ? 'Karakter' : 'Characters'} (${formatBytes(state.compressedBlob?.size || 0)})`;
        els.modalSvgCode.classList.remove('hidden');
        initIcons();
      });

      els.btnCloseModalSvg.addEventListener('click', () => {
        els.modalSvgCode.classList.add('hidden');
      });

      els.btnCopySvgCode.addEventListener('click', async () => {
        await navigator.clipboard.writeText(state.optimizedSvgText);
        const oldHTML = els.btnCopySvgCode.innerHTML;
        els.btnCopySvgCode.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-300"></i> ${currentLang === 'id' ? 'Tersalin!' : 'Copied!'}`;
        initIcons();
        setTimeout(() => {
          els.btnCopySvgCode.innerHTML = oldHTML;
          initIcons();
        }, 2000);
      });

      els.formatPills.forEach(pill => {
        pill.addEventListener('click', () => {
          setFormatSelection(pill.dataset.format);
          executeCompression();
        });
      });

      els.paramSvgPrecision.addEventListener('input', (e) => {
        state.svgPrecision = parseInt(e.target.value);
        els.svgPrecValBadge.innerText = `${state.svgPrecision} ${currentLang === 'id' ? 'Desimal' : 'Decimals'}`;
      });
      els.paramSvgPrecision.addEventListener('change', executeCompression);

      els.paramSvgStripMeta.addEventListener('change', (e) => {
        state.svgStripMeta = e.target.checked;
        executeCompression();
      });
      els.paramSvgShortenColors.addEventListener('change', (e) => {
        state.svgShortenColors = e.target.checked;
        executeCompression();
      });

      els.paramQuality.addEventListener('input', (e) => {
        state.quality = parseInt(e.target.value) / 100;
        els.qualityValBadge.innerText = e.target.value + '%';
      });
      els.paramQuality.addEventListener('change', executeCompression);

      els.paramColors.addEventListener('input', (e) => {
        state.colors = parseInt(e.target.value);
        els.colorsValBadge.innerText = `${state.colors} ${currentLang === 'id' ? 'Warna' : 'Colors'}`;
      });
      els.paramColors.addEventListener('change', executeCompression);

      els.paramDither.addEventListener('change', (e) => {
        state.dither = e.target.checked;
        executeCompression();
      });

      els.paramWidth.addEventListener('change', (e) => {
        const val = parseInt(e.target.value) || state.originalWidth;
        state.width = val;
        if (els.paramResizeLock.checked) {
          state.height = Math.round(val / state.aspectRatio);
          els.paramHeight.value = state.height;
        }
        executeCompression();
      });

      els.paramHeight.addEventListener('change', (e) => {
        const val = parseInt(e.target.value) || state.originalHeight;
        state.height = val;
        if (els.paramResizeLock.checked) {
          state.width = Math.round(val * state.aspectRatio);
          els.paramWidth.value = state.width;
        }
        executeCompression();
      });

      els.scalePresets.forEach(btn => {
        btn.addEventListener('click', () => {
          const factor = parseFloat(btn.dataset.scale);
          state.width = Math.round(state.originalWidth * factor);
          state.height = Math.round(state.originalHeight * factor);
          els.paramWidth.value = state.width;
          els.paramHeight.value = state.height;
          executeCompression();
        });
      });

      els.paramSharpen.addEventListener('input', (e) => {
        state.sharpen = parseInt(e.target.value);
        els.sharpenValBadge.innerText = state.sharpen;
      });
      els.paramSharpen.addEventListener('change', executeCompression);

      els.btnRotateCw.addEventListener('click', () => {
        state.rotation = (state.rotation + 90) % 360;
        const tmp = state.width;
        state.width = state.height;
        state.height = tmp;
        state.aspectRatio = state.width / state.height;
        els.paramWidth.value = state.width;
        els.paramHeight.value = state.height;
        executeCompression();
      });

      els.btnFlipH.addEventListener('click', () => {
        state.flipH = !state.flipH;
        executeCompression();
      });

      els.btnDownload.addEventListener('click', () => {
        if (!state.compressedBlob) return;
        const ext = state.format === 'image/svg+xml' ? 'svg' : state.format.split('/')[1].replace('jpeg', 'jpg');
        const origName = state.originalFile ? state.originalFile.name.replace(/\.[^/.]+$/, "") : "compressed";
        const a = document.createElement('a');
        a.href = state.compressedUrl;
        a.download = `${origName}-dutamik.${ext}`;
        a.click();
      });

      els.btnCopyClipboard.addEventListener('click', async () => {
        if (!state.compressedBlob) return;
        try {
          if (state.format === 'image/svg+xml') {
            await navigator.clipboard.writeText(state.optimizedSvgText);
          } else {
            const item = new ClipboardItem({ [state.compressedBlob.type]: state.compressedBlob });
            await navigator.clipboard.write([item]);
          }
          const oldHTML = els.btnCopyClipboard.innerHTML;
          els.btnCopyClipboard.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> ${currentLang === 'id' ? 'Tersalin!' : 'Copied!'}`;
          initIcons();
          setTimeout(() => {
            els.btnCopyClipboard.innerHTML = oldHTML;
            initIcons();
          }, 2000);
        } catch (err) {
          alert(currentLang === 'id' ? 'Gunakan tombol Download untuk format ini.' : 'Please use the Download button for this format.');
        }
      });

      els.btnDemoSvg.addEventListener('click', () => {
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#grad1)" rx="24" />
  <circle cx="400" cy="240" r="110" fill="#34d399" fill-opacity="0.85" />
  <path d="M 260 440 L 400 310 L 540 440 Z" fill="#ffffff" />
  <text x="400" y="510" font-size="28" font-family="sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">DUTAMIK.ID - Vector SVG</text>
</svg>`;
        const file = new File([svgContent], "demo-vector.svg", { type: "image/svg+xml" });
        loadSourceFile(file);
      });

      els.btnDemoImg.addEventListener('click', () => {
        const demoCanvas = document.createElement('canvas');
        demoCanvas.width = 1200;
        demoCanvas.height = 800;
        const dCtx = demoCanvas.getContext('2d');

        const grad = dCtx.createLinearGradient(0, 0, 1200, 800);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#059669');
        grad.addColorStop(1, '#047857');
        dCtx.fillStyle = grad;
        dCtx.fillRect(0, 0, 1200, 800);

        for (let i = 0; i < 100; i++) {
          dCtx.beginPath();
          dCtx.arc(Math.random() * 1200, Math.random() * 800, Math.random() * 50 + 10, 0, Math.PI * 2);
          dCtx.fillStyle = `rgba(52, 211, 153, ${Math.random() * 0.35})`;
          dCtx.fill();
        }

        dCtx.font = 'bold 48px sans-serif';
        dCtx.fillStyle = '#ffffff';
        dCtx.textAlign = 'center';
        dCtx.fillText('DUTAMIK.ID Image Engine', 600, 410);

        demoCanvas.toBlob((blob) => {
          const demoFile = new File([blob], "demo-raster.png", { type: "image/png" });
          loadSourceFile(demoFile);
        }, 'image/png');
      });

      els.btnReset.addEventListener('click', () => {
        state.originalImage = null;
        state.originalFile = null;
        state.rawSvgText = '';
        state.optimizedSvgText = '';
        state.compressedBlob = null;
        if (state.compressedUrl) URL.revokeObjectURL(state.compressedUrl);
        state.compressedUrl = null;
        
        els.canvasWrapper.classList.add('hidden');
        els.viewportToolbar.classList.add('hidden');
        els.histogramContainer.classList.add('hidden');
        els.dropzone.classList.remove('hidden');
        els.btnDownload.disabled = true;
        els.btnCopyClipboard.disabled = true;
        els.statOrigSize.innerText = '0 KB';
        els.statCompSize.innerText = '0 KB';
        els.savingsBadge.innerText = '-0%';
      });

      function switchMode(newMode) {
        state.mode = newMode;
        if (newMode === 'studio') {
          els.tabStudioBtn.className = "px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all bg-brand-500 text-white dark:text-slate-950 shadow-sm";
          els.tabBatchBtn.className = "px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800";
          els.studioView.classList.remove('hidden');
          els.batchView.classList.add('hidden');
          updateViewportTransforms();
        } else {
          els.tabBatchBtn.className = "px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all bg-brand-500 text-white dark:text-slate-950 shadow-sm";
          els.tabStudioBtn.className = "px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800";
          els.studioView.classList.add('hidden');
          els.batchView.classList.remove('hidden');
          updateBatchDashboardStats();
        }
        initIcons();
      }

      els.tabStudioBtn.addEventListener('click', () => switchMode('studio'));
      els.tabBatchBtn.addEventListener('click', () => switchMode('batch'));

      // --- BATCH ENGINE ---
      els.batchOptQuality.addEventListener('input', (e) => {
        els.batchQualityVal.innerText = e.target.value + '%';
      });
      els.batchOptSharpen.addEventListener('input', (e) => {
        els.batchSharpenVal.innerText = e.target.value;
      });

      function updateBatchDashboardStats() {
        const count = state.batchQueue.length;
        els.batchStatCount.innerText = `${count} ${currentLang === 'id' ? 'Berkas' : 'Files'}`;

        let totalOrig = 0;
        let totalComp = 0;
        let processedCount = 0;

        state.batchQueue.forEach(item => {
          totalOrig += item.file.size || 0;
          if (item.compressedBlob) {
            totalComp += item.compressedBlob.size;
            processedCount++;
          }
        });

        els.batchStatOrigTotal.innerText = formatBytes(totalOrig);
        els.batchStatCompTotal.innerText = processedCount > 0 ? formatBytes(totalComp) : '-';

        if (processedCount > 0 && totalOrig > 0) {
          const savedPct = Math.round(((totalOrig - totalComp) / totalOrig) * 100);
          els.batchStatSavedTotal.innerText = (savedPct >= 0 ? '-' : '+') + Math.abs(savedPct) + '%';
          els.batchStatSavedTotal.className = `text-base sm:text-xl font-bold font-mono ${savedPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`;
        } else {
          els.batchStatSavedTotal.innerText = '-0%';
          els.batchStatSavedTotal.className = 'text-base sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400';
        }
      }

      function renderBatchTable() {
        els.batchTableBody.innerHTML = '';
        updateBatchDashboardStats();

        if (state.batchQueue.length === 0) {
          els.batchEmptyState.classList.remove('hidden');
          els.btnBatchProcess.disabled = true;
          els.btnBatchZip.disabled = true;
          return;
        }

        els.batchEmptyState.classList.add('hidden');
        els.btnBatchProcess.disabled = false;

        const isID = currentLang === 'id';

        state.batchQueue.forEach((item, index) => {
          const isSvg = item.file.type === 'image/svg+xml' || item.file.name.toLowerCase().endsWith('.svg');
          const origFormatText = isSvg ? 'SVG' : (item.file.type.split('/')[1]?.toUpperCase() || 'IMG');
          const outFormatText = item.outputFormat ? item.outputFormat.replace('image/', '').toUpperCase() : '-';

          const statusText = item.status === 'done' ? (isID ? 'SELESAI' : 'DONE') :
                             item.status === 'processing' ? (isID ? 'MEMPROSES' : 'PROCESSING') :
                             item.status === 'error' ? (isID ? 'GAGAL' : 'ERROR') :
                             (isID ? 'SIAP' : 'READY');

          const tr = document.createElement('tr');
          tr.className = "hover:bg-slate-100/60 dark:hover:bg-slate-900/50 transition";
          
          tr.innerHTML = `
            <td class="p-2.5">
              <img src="${item.previewUrl}" class="w-8 h-8 object-contain rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-0.5">
            </td>
            <td class="p-2.5 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px] sm:max-w-[180px]" title="${item.file.name}">${item.file.name}</td>
            <td class="p-2.5 text-slate-500 uppercase text-[10px] font-mono">
              <span class="font-bold text-slate-600 dark:text-slate-300">${origFormatText}</span> &rarr; <span class="text-brand-600 dark:text-brand-400 font-bold">${outFormatText}</span>
            </td>
            <td class="p-2.5 text-slate-500">${formatBytes(item.file.size)}</td>
            <td class="p-2.5 text-brand-600 dark:text-brand-400 font-semibold">${item.compressedBlob ? formatBytes(item.compressedBlob.size) : '-'}</td>
            <td class="p-2.5 font-bold ${item.savings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}">
              ${item.savings !== null ? (item.savings >= 0 ? '-' : '+') + Math.abs(item.savings) + '%' : '-'}
            </td>
            <td class="p-2.5">
              <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${
                item.status === 'done' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' :
                item.status === 'processing' ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 animate-pulse' :
                item.status === 'error' ? 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30' :
                'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }">${statusText}</span>
            </td>
            <td class="p-2.5 text-right flex items-center justify-end gap-1">
              <button onclick="window.inspectInStudio(${index})" class="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-500 dark:text-slate-400 transition" title="${isID ? 'Buka di Studio' : 'Open in Studio'}">
                <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
              </button>
              ${item.compressedBlob ? `
                <a href="${item.compressedUrl}" download="${item.downloadName}" class="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-brand-600 dark:text-brand-400 inline-block" title="${isID ? 'Download Berkas' : 'Download File'}">
                  <i data-lucide="download" class="w-3.5 h-3.5"></i>
                </a>
              ` : ''}
              <button onclick="window.removeBatchItem(${index})" class="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-red-500 text-slate-400" title="${isID ? 'Hapus' : 'Delete'}">
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
              </button>
            </td>
          `;
          els.batchTableBody.appendChild(tr);
        });

        initIcons();
      }

      window.removeBatchItem = function(index) {
        const item = state.batchQueue[index];
        if (item) {
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
          if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
          state.batchQueue.splice(index, 1);
          renderBatchTable();
        }
      };

      window.inspectInStudio = function(index) {
        const item = state.batchQueue[index];
        if (item) {
          switchMode('studio');
          loadSourceFile(item.file);
        }
      };

      function handleBatchAddFiles(files) {
        if (!files) return;
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.svg')) {
            state.batchQueue.push({
              file: file,
              previewUrl: URL.createObjectURL(file),
              compressedBlob: null,
              compressedUrl: null,
              savings: null,
              outputFormat: null,
              downloadName: '',
              status: 'siap'
            });
          }
        }
        renderBatchTable();
      }

      els.batchDropzone.addEventListener('click', () => els.batchFileInput.click());
      els.btnBatchAdd.addEventListener('click', () => els.batchFileInput.click());
      els.batchFileInput.addEventListener('change', (e) => {
        handleBatchAddFiles(e.target.files);
        els.batchFileInput.value = '';
      });

      els.btnBatchClear.addEventListener('click', () => {
        state.batchQueue.forEach(item => {
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
          if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
        });
        state.batchQueue = [];
        renderBatchTable();
      });

      // Execute Batch Compression
      els.btnBatchProcess.addEventListener('click', async () => {
        if (state.batchQueue.length === 0) return;

        const globalFormatOpt = els.batchOptFormat.value;
        const quality = parseInt(els.batchOptQuality.value) / 100;
        const scaleOpt = els.batchOptScale.value;
        const sharpenAmount = parseInt(els.batchOptSharpen.value);
        const stripSvgMeta = els.batchOptSvgClean.checked;
        const pngDither = els.batchOptPngDither.checked;

        els.btnBatchProcess.disabled = true;
        els.batchProgressBox.classList.remove('hidden');

        const totalItems = state.batchQueue.length;
        const isID = currentLang === 'id';

        for (let i = 0; i < totalItems; i++) {
          const item = state.batchQueue[i];
          item.status = 'processing';
          
          const currentProgress = Math.round(((i) / totalItems) * 100);
          els.batchProgressText.innerText = isID ? `Memproses (${i + 1}/${totalItems}) ${item.file.name}...` : `Processing (${i + 1}/${totalItems}) ${item.file.name}...`;
          els.batchProgressPct.innerText = `${currentProgress}%`;
          els.batchProgressBar.style.width = `${currentProgress}%`;
          renderBatchTable();

          try {
            const isSvg = item.file.type === 'image/svg+xml' || item.file.name.toLowerCase().endsWith('.svg');
            let targetFormat = globalFormatOpt;
            if (globalFormatOpt === 'original') {
              targetFormat = isSvg ? 'image/svg+xml' : (item.file.type || 'image/jpeg');
            }

            item.outputFormat = targetFormat;
            const cleanBaseName = item.file.name.replace(/\.[^/.]+$/, "");
            const outExt = targetFormat === 'image/svg+xml' ? 'svg' : targetFormat.replace('image/', '').replace('jpeg', 'jpg');
            item.downloadName = `${cleanBaseName}-dutamik.${outExt}`;

            if (targetFormat === 'image/svg+xml' && isSvg) {
              const text = await item.file.text();
              const minified = optimizeSvgString(text, { precision: 2, stripMeta: stripSvgMeta, shortenColors: true });
              const blob = new Blob([minified], { type: 'image/svg+xml' });
              
              if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
              item.compressedBlob = blob;
              item.compressedUrl = URL.createObjectURL(blob);
              item.savings = Math.round(((item.file.size - blob.size) / item.file.size) * 100);
              item.status = 'done';
            } else {
              const img = new Image();
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = item.previewUrl;
              });

              let origW = img.naturalWidth || 800;
              let origH = img.naturalHeight || 600;
              let targetW = origW;
              let targetH = origH;

              if (scaleOpt.startsWith('max-')) {
                const maxDim = parseInt(scaleOpt.replace('max-', ''));
                if (origW > maxDim) {
                  targetW = maxDim;
                  targetH = Math.round(origH * (maxDim / origW));
                }
              } else {
                const scaleVal = parseFloat(scaleOpt) || 1.0;
                targetW = Math.round(origW * scaleVal);
                targetH = Math.round(origH * scaleVal);
              }

              const canvas = renderProcessedCanvas(img, targetW, targetH, {
                rotation: 0,
                flipH: false,
                sharpen: sharpenAmount,
                format: targetFormat,
                colors: 256,
                dither: pngDither
              });

              const blob = await new Promise((resolve) => {
                canvas.toBlob((b) => {
                  if (b) resolve(b);
                  else canvas.toBlob(resolve, 'image/jpeg', quality);
                }, targetFormat, quality);
              });

              if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
              item.compressedBlob = blob;
              item.compressedUrl = URL.createObjectURL(blob);
              item.savings = Math.round(((item.file.size - blob.size) / item.file.size) * 100);
              item.status = 'done';
            }

          } catch (err) {
            console.error(`Error processing batch file ${item.file.name}:`, err);
            item.status = 'error';
          }

          renderBatchTable();
        }

        els.batchProgressText.innerText = isID ? `Selesai! Berhasil mengompres ${totalItems} berkas.` : `Done! Successfully compressed ${totalItems} files.`;
        els.batchProgressPct.innerText = `100%`;
        els.batchProgressBar.style.width = `100%`;
        els.btnBatchProcess.disabled = false;
        els.btnBatchZip.disabled = false;
      });

      // Export All as ZIP
      els.btnBatchZip.addEventListener('click', async () => {
        if (typeof JSZip === 'undefined') {
          alert('JSZip belum selesai dimuat.');
          return;
        }

        const zip = new JSZip();
        let validItemCount = 0;

        state.batchQueue.forEach((item) => {
          if (item.compressedBlob) {
            zip.file(item.downloadName, item.compressedBlob);
            validItemCount++;
          }
        });

        if (validItemCount === 0) {
          alert(currentLang === 'id' ? 'Belum ada berkas yang selesai dikompres.' : 'No compressed files ready for download.');
          return;
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(zipBlob);
        a.download = `dutamik-batch-${Date.now()}.zip`;
        a.click();
      });

      // Synchronize Theme & Language at Initialization
      if (localStorage.getItem('theme') === 'light' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }

      applyLanguage(currentLang);
    })();
