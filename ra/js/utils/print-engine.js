/**
 * Print Engine - A4 PDF Precision Print Coordinator
 * Mengatur margin A4: Atas 20mm, Bawah 20mm, Kiri 10mm, Kanan 10mm
 * Running header dan running footer otomatis dengan nomor halaman
 */

window.PrintEngine = (function() {
  function printDocument(targetElementId, documentTitle = "") {
    const originalTitle = document.title;
    // Kosongkan document.title selama proses cetak agar peramban TIDAK mencetak nama menu atau jam di header PDF
    document.title = " ";

    // Tampilkan animasi loading agar pengguna tahu proses cetak telah aktif
    if (window.App && window.App.showLoading) {
      window.App.showLoading(
        "Menyiapkan Dokumen Cetak A4...", 
        "Mengatur tata letak margin presisi A4 dan membersihkan header peramban..."
      );
    }

    const targetEl = document.getElementById(targetElementId);
    const proj = (window.ProjectManager && window.ProjectManager.getActiveProject()) || {};

    // Pastikan seluruh elemen SVG memiliki lebar yang responsif untuk cetak
    if (targetEl) {
      const svgs = targetEl.querySelectorAll('svg');
      svgs.forEach(svg => {
        svg.setAttribute('width', '100%');
        svg.style.maxWidth = '100%';
      });
    }

    // Dukungan Orientasi Landscape Otomatis untuk Kurva S & Kalender Proyek
    const isLandscape = (targetElementId === "panel-kurva-s" || targetElementId === "panel-kalender");
    if (isLandscape) {
      let dynStyle = document.getElementById("dynamicLandscapePrintStyle");
      if (!dynStyle) {
        dynStyle = document.createElement("style");
        dynStyle.id = "dynamicLandscapePrintStyle";
        document.head.appendChild(dynStyle);
      }
      dynStyle.innerHTML = `
        @media print {
          @page {
            size: A4 landscape !important;
            margin-top: 10mm !important;
            margin-bottom: 12mm !important;
            margin-left: 12mm !important;
            margin-right: 12mm !important;
          }
        }
      `;
    }

    const cleanup = () => {
      document.body.classList.remove("printing-batch");
      document.title = originalTitle;
      const dyn = document.getElementById("dynamicLandscapePrintStyle");
      if (dyn) dyn.remove();
      if (window.App && window.App.hideLoading) {
        window.App.hideLoading();
      }
    };

    if (typeof window.addEventListener === 'function') {
      window.addEventListener('afterprint', cleanup, { once: true });
    }

    // Sembunyikan loader visual SEBELUM memanggil window.print()
    setTimeout(() => {
      if (window.App && window.App.hideLoading) {
        window.App.hideLoading();
      }
      setTimeout(() => {
        try {
          window.print();
        } catch (err) {
          console.warn("window.print error:", err);
        }
        document.title = originalTitle;
        cleanup();
      }, 60);
    }, 280);
  }

  // Cetak Dokumen Terisolasi via Hidden Iframe (Mencegah 100% Kebocoran Data & Menghilangkan Header Peramban)
  function printViaHiddenIframe(htmlContent, docTitle = "") {
    if (window.App && window.App.showLoading) {
      window.App.showLoading(
        "Menyiapkan Dokumen Cetak A4...",
        "Menyusun tata letak presisi A4 tanpa footage header atau nama menu..."
      );
    }

    let printFrame = document.getElementById("appPrintIframe");
    if (!printFrame) {
      printFrame = document.createElement("iframe");
      printFrame.id = "appPrintIframe";
      printFrame.style.position = "fixed";
      printFrame.style.right = "0";
      printFrame.style.bottom = "0";
      printFrame.style.width = "1024px";
      printFrame.style.height = "768px";
      printFrame.style.border = "none";
      printFrame.style.opacity = "0.01";
      printFrame.style.zIndex = "-9999";
      printFrame.style.pointerEvents = "none";
      document.body.appendChild(printFrame);
    }

    const frameDoc = (printFrame.contentWindow && printFrame.contentWindow.document) || printFrame.contentDocument;
    if (!frameDoc) {
      window.print();
      return;
    }

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=1024">
        <title> </title>
        <link rel="stylesheet" href="css/theme.css">
        <link rel="stylesheet" href="css/main.css">
        <link rel="stylesheet" href="css/print-a4.css">
        <style>
          .print-only { display: block !important; visibility: visible !important; }
          .no-print, .btn, .btn-group, .page-header-actions, .d-mobile-only { display: none !important; }
          .d-desktop-only, table.d-desktop-only { display: table !important; }
          div.d-desktop-only { display: block !important; }
          ${htmlContent.includes('proposal-page') ? `
          @page {
            size: A4 portrait;
            margin: 8mm 10mm 10mm 10mm;
            @top-left { content: none !important; }
            @top-center { content: none !important; }
            @top-right { content: none !important; }
            @bottom-left { content: none !important; }
            @bottom-center { content: none !important; }
            @bottom-right { content: none !important; }
          }
          @page coverPage {
            size: A4 portrait;
            margin: 8mm 10mm 8mm 10mm;
            @top-right { content: none !important; }
            @bottom-right { content: none !important; }
            @bottom-left { content: none !important; }
            @bottom-center { content: none !important; }
          }
          ` : htmlContent.includes('printable-bap-doc') ? `
          @page {
            size: A4 portrait;
            margin-top: 20mm !important;
            margin-bottom: 15mm !important;
            margin-left: 12mm !important;
            margin-right: 12mm !important;
            @top-left { content: none !important; }
            @top-center { content: none !important; }
            @top-right { content: none !important; }
            @bottom-left { content: none !important; }
            @bottom-center { content: none !important; }
            @bottom-right { content: none !important; }
          }
          ` : `
          @page {
            size: A4 portrait;
            margin-top: 10mm;
            margin-bottom: 14mm;
            margin-left: 10mm;
            margin-right: 10mm;
            @top-left { content: none !important; }
            @top-center { content: none !important; }
            @top-right { content: none !important; }
            @bottom-left {
              content: "Dokumen Resmi Proyek • Standar SE PUPR No. 47/2026";
              font-size: 8pt;
              color: #64748b;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            @bottom-center { content: none !important; }
            @bottom-right {
              content: "Halaman " counter(page) " dari " counter(pages);
              font-size: 8pt;
              font-weight: 700;
              color: #334155;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
          }
          ` }

          @page coverPage {
            size: A4 portrait;
            margin: 8mm 10mm 8mm 10mm;
            @top-right { content: none !important; }
            @bottom-right { content: none !important; }
            @bottom-left { content: none !important; }
            @bottom-center { content: none !important; }
          }
          .cover-page {
            page: coverPage;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .proposal-page.content-page:first-of-type {
            counter-reset: page 1;
          }
          .proposal-footer {
            display: none !important;
          }
          .proposal-page {
            width: 100% !important;
            max-width: 190mm !important;
            min-height: 265mm !important;
            height: auto !important;
            max-height: none !important;
            margin: 0 auto !important;
            padding: 4mm 0 6mm 0 !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: visible !important;
            position: relative !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
          }
          .proposal-page .print-footer-block {
            margin-top: auto !important;
            padding-top: 6px !important;
            border-top: 0.75pt solid #cbd5e1 !important;
            display: flex !important;
            justify-content: space-between !important;
            font-size: 8pt !important;
            color: #475569 !important;
            width: 100% !important;
            flex-shrink: 0 !important;
          }
          .cover-page {
            width: 100% !important;
            max-width: 190mm !important;
            min-height: 275mm !important;
            height: 275mm !important;
            max-height: 275mm !important;
            padding: 0 !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            border: none !important;
            box-shadow: none !important;
          }
          .cover-inner-border {
            width: 100% !important;
            height: 100% !important;
            max-height: 275mm !important;
            box-sizing: border-box !important;
            border: 2.5px solid #1e3a8a !important;
            outline: 1px solid #cbd5e1 !important;
            outline-offset: -5px !important;
            padding: 16px 20px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            background: #ffffff !important;
            position: relative !important;
          }
          .proposal-preview-wrapper {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
          }
          .printable-bap-doc {
            width: 100% !important;
            max-width: 186mm !important;
            margin: 0 auto !important;
            min-height: 245mm !important;
            height: auto !important;
            max-height: 255mm !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            overflow: visible !important;
            position: relative !important;
            background: #ffffff !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            border: none !important;
            box-shadow: none !important;
          }
          .printable-bap-doc:last-child {
            page-break-after: auto !important;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
            font-size: 9pt !important;
          }

          .table th {
            background-color: #f1f5f9 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `);
    frameDoc.close();

    setTimeout(() => {
      if (window.App && window.App.hideLoading) {
        window.App.hideLoading();
      }
      try {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
      } catch (err) {
        console.warn("Iframe print fallback error:", err);
        try {
          window.print();
        } catch (e) {
          console.error("Direct window print error:", e);
        }
      }
    }, 450);
  }

  function createPrintHeader(arg1, arg2 = "RENCANA ANGGARAN BIAYA", arg3 = {}) {
    let proj = {};
    let docType = "RENCANA ANGGARAN BIAYA";
    let extraInfo = {};

    if (typeof arg1 === 'string') {
      docType = arg1;
      proj = arg2 || {};
      extraInfo = arg3 || {};
    } else {
      proj = arg1 || {};
      docType = (typeof arg2 === 'string') ? arg2 : "RENCANA ANGGARAN BIAYA";
      extraInfo = (typeof arg3 === 'object') ? arg3 : {};
    }

    const projName = proj.name || proj.nama || "Pembangunan Rumah Tinggal Tropis Modern";
    const projLoc = proj.location || proj.lokasi || "Bandung, Jawa Barat";
    const projOwner = proj.owner || proj.pemilik || "Pemberi Tugas";
    const durDays = proj.durationDays || proj.durasi || 180;
    const durWeeks = Math.ceil(durDays / 7);
    const startStr = proj.startDate || proj.tanggalMulai || "2026-04-01";
    const finishStr = proj.finishDate || proj.tanggalSelesai || "2026-09-27";
    const regionStr = proj.regionName || proj.daerahAcuan || "Jawa Barat - Bandung Raya & Priangan (1.04x)";
    const contractorStr = proj.contractor || proj.kontraktor || "KONTRAKTOR PELAKSANA UTAMA";
    const docNumStr = proj.docNumber || proj.nomorDokumen || proj.kodeRegistrasi || "RAB/2026/001";
    const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const rawLabor = extraInfo.totalLaborQty || proj.totalLaborQty || proj.estimasiTenagaOH;
    let laborInfoStr = rawLabor 
      ? `${Number(rawLabor).toFixed(1)} OH (~${(rawLabor / durDays).toFixed(1)} Org/Hari)`
      : "Sesuai Analisis AHSP 2026";

    return `
      <div class="print-header-block">
        <!-- 1. Kop Kontraktor Pelaksana -->
        <div class="print-header-top">
          <div class="print-header-logo-text">
            <span class="company-brand">${contractorStr}</span>
            <span class="company-sub">Sistem Informasi Perencanaan, Estimasi Biaya & Manajemen Konstruksi</span>
          </div>
          <div class="print-header-meta">
            <div><strong>No. Dokumen:</strong> ${docNumStr}</div>
            <div><strong>Tanggal Cetak:</strong> ${printDate}</div>
            </div>
        </div>

        <!-- 2. Judul Dokumen Prominen -->
        <div class="print-doc-title-box">
          <h3 class="print-doc-title">${docType}</h3>
          <div class="print-doc-subtitle">Berdasarkan Standar ${proj.dataSource || 'SE Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026'}</div>
        </div>

        <!-- 3. Kotak Rincian Informasi Proyek Lengkap (Halaman 1) -->
        <table class="print-header-project-table">
          <tbody>
            <tr>
              <td style="width: 16%;"><strong>Nama Pekerjaan:</strong></td>
              <td style="width: 38%; font-weight: 700; color: #0f172a;">${projName}</td>
              <td style="width: 18%;"><strong>Waktu Pelaksanaan:</strong></td>
              <td style="width: 28%; font-weight: 700; color: #1e40af;">${durDays} Hari Kalender (${durWeeks} Minggu)</td>
            </tr>
            <tr>
              <td><strong>Lokasi Proyek:</strong></td>
              <td>${projLoc}</td>
              <td><strong>Target Jadwal:</strong></td>
              <td>${startStr} s.d. ${finishStr}</td>
            </tr>
            <tr>
              <td><strong>Pemilik / Tugas:</strong></td>
              <td>${projOwner}</td>
              <td><strong>Kebutuhan Tenaga:</strong></td>
              <td style="font-weight: 700; color: #059669;">${laborInfoStr}</td>
            </tr>
            <tr>
              <td><strong>Konsultan:</strong></td>
              <td>${proj.consultant || "Tim Perencana & Manajemen Konstruksi"}</td>
              <td><strong>Wilayah Acuan:</strong></td>
              <td>${regionStr}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  function createLandscapePrintHeader(arg1, arg2 = "KURVA S PEKERJAAN PROYEK", arg3 = {}) {
    let proj = {};
    let docType = "KURVA S PEKERJAAN PROYEK";
    let extraInfo = {};

    if (typeof arg1 === 'string') {
      docType = arg1;
      proj = arg2 || {};
      extraInfo = arg3 || {};
    } else {
      proj = arg1 || {};
      docType = (typeof arg2 === 'string') ? arg2 : "KURVA S PEKERJAAN PROYEK";
      extraInfo = (typeof arg3 === 'object') ? arg3 : {};
    }

    const projName = proj.name || proj.nama || "Pembangunan Rumah Tinggal Tropis Modern";
    const projLoc = proj.location || proj.lokasi || "Bandung, Jawa Barat";
    const projOwner = proj.owner || proj.pemilik || "Pemberi Tugas";
    const durDays = proj.durationDays || proj.durasi || 180;
    const durWeeks = Math.ceil(durDays / 7);
    const startStr = proj.startDate || proj.tanggalMulai || "2026-04-01";
    const finishStr = proj.finishDate || proj.tanggalSelesai || "2026-09-27";
    const contractorStr = proj.contractor || proj.kontraktor || "KONTRAKTOR PELAKSANA UTAMA";
    const docNumStr = proj.docNumber || proj.nomorDokumen || proj.kodeRegistrasi || "RAB/2026/001";
    const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return `
      <div class="print-header-landscape-compact" style="border-bottom: 1.5pt solid #0f172a; padding-bottom: 4px; margin-bottom: 6px; width: 100%; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Baris 1: Kop Ringkas, Judul Dokumen Prominen & Metadata Dokumen -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <div style="width: 28%; line-height: 1.2;">
            <div style="font-size: 9.5pt; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.3px;">${contractorStr}</div>
            <div style="font-size: 7pt; color: #475569;">Estimasi Biaya &amp; Manajemen Konstruksi</div>
          </div>
          <div style="width: 44%; text-align: center; line-height: 1.2;">
            <div style="font-size: 11pt; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">${docType}</div>
            <div style="font-size: 7pt; color: #475569;">Standar ${proj.dataSource || 'SE Dirjen Bina Konstruksi No. 47/SE/Dk/2026'}</div>
          </div>
          <div style="width: 28%; text-align: right; font-size: 7.5pt; color: #334155; line-height: 1.25;">
            <div><strong>No. Dok:</strong> ${docNumStr}</div>
            <div><strong>Tgl Cetak:</strong> ${printDate}</div>
          </div>
        </div>
        <!-- Baris 2: Info Proyek Satu Baris Padat & Efisien -->
        <table style="width: 100%; border-collapse: collapse; font-size: 7.5pt; background: #f8fafc; border: 1px solid #cbd5e1;">
          <tbody>
            <tr>
              <td style="padding: 2.5px 6px; width: 10%; font-weight: 700; color: #475569;">Pekerjaan:</td>
              <td style="padding: 2.5px 6px; width: 34%; font-weight: 700; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${projName}</td>
              <td style="padding: 2.5px 6px; width: 8%; font-weight: 700; color: #475569;">Lokasi:</td>
              <td style="padding: 2.5px 6px; width: 20%; color: #334155; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${projLoc}</td>
              <td style="padding: 2.5px 6px; width: 8%; font-weight: 700; color: #475569;">Durasi:</td>
              <td style="padding: 2.5px 6px; width: 20%; font-weight: 700; color: #1e40af;">${durDays} Hari (${durWeeks} Mgg) | ${startStr} s.d ${finishStr}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  function createPrintFooter(arg1, options = {}) {
    const proj = (typeof arg1 === 'object' && arg1) ? arg1 : ((window.ProjectManager && window.ProjectManager.getActiveProject()) || {});
    const docNum = proj.docNumber || "RAB/2026/001";
    const contractor = proj.contractor || "";
    const pageStr = options.pageStr || "Halaman 1 dari 1";

    return `
      <div class="print-footer-block">
        <div class="footer-left">
          <span>${contractor ? contractor + ' — ' : ''}${proj.dataSource || 'Standar SE PUPR No. 47/2026'}</span>
          <span style="margin-left: 8px; font-family: monospace;">(${docNum})</span>
        </div>
        <div class="footer-right">
          <strong>${pageStr}</strong>
        </div>
      </div>
    `;
  }

  function downloadPdfDirect(targetElementId, filename = "Dokumen_RAB.pdf", customOrientation = null) {
    if (!filename.endsWith(".pdf")) filename += ".pdf";
    const targetEl = document.getElementById(targetElementId);
    if (!targetEl) return;

    if (window.App && window.App.showLoading) {
      window.App.showLoading(
        "Menyiapkan Unduhan PDF Langsung...",
        "Menyusun tata letak presisi A4 tanpa artefak layar di memori perangkat..."
      );
    }

    const isLandscape = customOrientation 
      ? (customOrientation === 'landscape')
      : (targetElementId === "panel-kurva-s" || targetElementId === "panel-kalender");

    // Lebar standar piksel A4 pada 96 DPI: Portrait = 794px, Landscape = 1123px
    const a4WidthPx = isLandscape ? 1123 : 794;

    // Buat Isolated Off-Screen Sandbox Container untuk render PDF murni tanpa artefak layar
    const sandbox = document.createElement("div");
    sandbox.id = "pdf-render-sandbox-" + Date.now();
    sandbox.style.position = "absolute";
    sandbox.style.left = "-9999px";
    sandbox.style.top = "0";
    sandbox.style.width = a4WidthPx + "px";
    sandbox.style.minWidth = a4WidthPx + "px";
    sandbox.style.maxWidth = a4WidthPx + "px";
    sandbox.style.background = "#ffffff";
    sandbox.style.color = "#0f172a";
    sandbox.style.padding = isLandscape ? "16px 20px" : "20px 24px";
    sandbox.style.boxSizing = "border-box";
    sandbox.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    sandbox.style.fontSize = isLandscape ? "8pt" : "8.5pt";
    sandbox.style.lineHeight = "1.35";
    sandbox.style.zIndex = "-99999";
    sandbox.style.overflow = "visible";

    // Klon elemen target untuk dimanipulasi secara aman tanpa mempengaruhi DOM aktif layar
    const clone = targetEl.cloneNode(true);

    // 1. Bersihkan seluruh elemen interaktif, tombol aksi, filter, dan tampilan kartu ponsel
    const removeSelectors = [
      '.no-print',
      '.page-header-actions',
      '.topbar-actions',
      '.btn',
      '.btn-group',
      '.filter-bar',
      '.d-mobile-only',
      'button',
      'input',
      'select',
      '.modal-backdrop',
      '.modal',
      '.global-loader-backdrop',
      '#globalLoader'
    ];
    removeSelectors.forEach(sel => {
      clone.querySelectorAll(sel).forEach(el => el.remove());
    });

    // 2. Aktifkan dan perlihatkan seluruh elemen print-only (Kop Resmi PUPR & Info Proyek)
    clone.querySelectorAll('.print-only').forEach(el => {
      el.style.display = 'block';
      el.style.visibility = 'visible';
      el.style.opacity = '1';
      el.style.marginBottom = '12px';
    });

    // 3. Pastikan tampilan tabel desktop aktif 100% (bukan kartu ponsel)
    clone.querySelectorAll('.d-desktop-only').forEach(el => {
      el.style.display = el.tagName === 'TABLE' ? 'table' : 'block';
      el.style.visibility = 'visible';
    });

    // 4. Standarisasi tabel agar presisi A4 tanpa terpotong
    clone.querySelectorAll('table').forEach(tbl => {
      tbl.style.width = '100%';
      tbl.style.borderCollapse = 'collapse';
      tbl.style.tableLayout = 'auto';
      tbl.style.marginBottom = '12px';
      tbl.style.fontSize = isLandscape ? '7.5pt' : '8.5pt';
    });

    clone.querySelectorAll('th').forEach(th => {
      th.style.background = '#f1f5f9';
      th.style.color = '#0f172a';
      th.style.fontWeight = '700';
      th.style.border = '1px solid #cbd5e1';
      th.style.padding = '4px 6px';
      th.style.textAlign = th.classList.contains('text-left') ? 'left' : (th.classList.contains('text-right') ? 'right' : 'center');
    });

    clone.querySelectorAll('td').forEach(td => {
      td.style.border = '1px solid #e2e8f0';
      td.style.padding = '3.5px 6px';
      td.style.color = '#0f172a';
    });

    // 5. Cek apakah Kop Surat Resmi sudah ada, jika belum suntikkan otomatis
    const hasHeader = clone.querySelector('.print-kop-wrapper, .print-header-landscape-compact, .print-header-block, .proposal-cover, .bap-official-header');
    if (!hasHeader) {
      const proj = (window.ProjectManager && window.ProjectManager.getActiveProject()) || {};
      const cleanDocTitle = filename.replace(/_/g, ' ').replace('.pdf', '').toUpperCase();
      let headerHtml = "";
      if (isLandscape) {
        headerHtml = createLandscapePrintHeader(proj, cleanDocTitle);
      } else {
        headerHtml = createPrintHeader(proj, cleanDocTitle);
      }
      const headerDiv = document.createElement("div");
      headerDiv.innerHTML = headerHtml;
      clone.insertBefore(headerDiv, clone.firstChild);
    }

    // 6. Standarisasi SVG (misal Kurva S) agar skalanya tepat 100% dan tidak blur
    clone.querySelectorAll('svg').forEach(svg => {
      svg.setAttribute('width', '100%');
      svg.style.width = '100%';
      svg.style.maxWidth = '100%';
      svg.style.height = 'auto';
    });

    // 7. Bersihkan margin & padding liar pembungkus card
    clone.querySelectorAll('.card, .card-body').forEach(c => {
      c.style.boxShadow = 'none';
      c.style.border = 'none';
      c.style.padding = '0';
      c.style.margin = '0';
      c.style.background = 'transparent';
    });

    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);

    const cleanupSandbox = () => {
      if (sandbox && sandbox.parentNode) {
        sandbox.parentNode.removeChild(sandbox);
      }
    };

    if (window.html2pdf) {
      const opt = {
        margin: isLandscape ? [8, 10, 8, 10] : [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
          windowWidth: a4WidthPx,
          scrollY: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: isLandscape ? 'landscape' : 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      window.html2pdf().set(opt).from(sandbox).save().then(() => {
        cleanupSandbox();
        if (window.App && window.App.hideLoading) {
          window.App.hideLoading();
        }
        if (window.App && window.App.showNotificationModal) {
          window.App.showNotificationModal({
            title: "Unduh PDF Berhasil",
            type: "success",
            icon: "📥",
            contentHtml: `<div style="font-size: 13px;">Dokumen presisi A4 <strong>${filename}</strong> berhasil diunduh dan tersimpan di perangkat Anda.</div>`,
            confirmText: "Selesai"
          });
        }
      }).catch(err => {
        console.warn("html2pdf sandbox save error, fallback to print:", err);
        cleanupSandbox();
        if (window.App && window.App.hideLoading) {
          window.App.hideLoading();
        }
        printDocument(targetElementId, filename);
      });
    } else {
      cleanupSandbox();
      if (window.App && window.App.hideLoading) {
        window.App.hideLoading();
      }
      printDocument(targetElementId, filename);
    }
  }

  return {
    printDocument,
    printViaHiddenIframe,
    downloadPdfDirect,
    createPrintHeader,
    createLandscapePrintHeader,
    createPrintFooter
  };
})();
