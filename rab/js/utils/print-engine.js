/**
 * Print Engine - A4 PDF Precision Print Coordinator
 * Mengatur margin A4: Atas 20mm, Bawah 20mm, Kiri 10mm, Kanan 10mm
 * Running header dan running footer otomatis dengan nomor halaman
 */

window.PrintEngine = (function() {
  function printDocument(targetElementId, documentTitle = "") {
    const targetEl = document.getElementById(targetElementId);
    if (!targetEl) {
      console.warn("Target elemen cetak tidak ditemukan:", targetElementId);
      return;
    }

    const originalTitle = document.title;
    // Kosongkan document.title selama proses cetak agar peramban TIDAK mencetak nama menu atau jam di header PDF
    document.title = " ";

    // Pastikan seluruh elemen SVG memiliki lebar yang responsif untuk cetak
    const svgs = targetEl.querySelectorAll('svg');
    svgs.forEach(svg => {
      svg.setAttribute('width', '100%');
      svg.style.maxWidth = '100%';
    });

    // Isolasi ketat: tandai target cetak dan sembunyikan seluruh tab lainnya
    document.querySelectorAll(".is-print-target").forEach(el => el.classList.remove("is-print-target"));
    targetEl.classList.add("is-print-target");
    document.body.classList.add("printing-target");

    // Tampilkan animasi loading agar pengguna tahu proses cetak telah aktif
    if (window.App && window.App.showLoading) {
      window.App.showLoading(
        "Menyiapkan Dokumen Cetak A4...", 
        "Mengisolasi tata letak presisi A4 tanpa kebocoran data panel lain..."
      );
    }

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      document.body.classList.remove("printing-target");
      document.body.classList.remove("printing-batch");
      if (targetEl) {
        targetEl.classList.remove("is-print-target");
      }
      document.title = originalTitle;
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
          console.warn("window.print error, beralih ke iframe cetak:", err);
          if (targetEl) {
            printViaHiddenIframe(targetEl.innerHTML, documentTitle);
          }
        }
        document.title = originalTitle;
        // Jaminan pembersihan jika afterprint tidak didukung atau tertunda
        setTimeout(cleanup, 1200);
      }, 60);
    }, 250);
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
      printFrame.style.top = "-99999px";
      printFrame.style.left = "-99999px";
      printFrame.style.width = "0px";
      printFrame.style.height = "0px";
      printFrame.style.border = "none";
      printFrame.style.opacity = "0";
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
        <title> </title>
        <link rel="stylesheet" href="css/theme.css">
        <link rel="stylesheet" href="css/main.css">
        <link rel="stylesheet" href="css/print-a4.css">
        <style>
          @page {
            size: A4 portrait;
            margin-top: 20mm !important;
            margin-right: 10mm !important;
            margin-bottom: 18mm !important;
            margin-left: 10mm !important;
            @top-left { content: none !important; }
            @top-center { content: none !important; }
            @top-right { content: none !important; }
            @bottom-left { content: none !important; }
            @bottom-center { content: none !important; }
            @bottom-right { content: none !important; }
          }

          @page coverPage {
            size: A4 portrait;
            margin-top: 20mm !important;
            margin-right: 10mm !important;
            margin-bottom: 18mm !important;
            margin-left: 10mm !important;
            @top-right { content: none !important; }
            @bottom-right { content: none !important; }
            @bottom-left { content: none !important; }
          }
          .cover-page {
            page: coverPage;
            page-break-after: always !important;
            break-after: page !important;
          }
          .proposal-page.content-page:first-of-type {
            counter-reset: page 1;
          }
          .proposal-footer {
            display: none !important;
          }
          .proposal-page {
            width: 100% !important;
            max-width: 100% !important;
            min-height: 250mm !important;
            max-height: 258mm !important;
            padding: 0 0 5mm 0 !important;
            box-sizing: border-box !important;
            page-break-before: always !important;
            page-break-after: always !important;
            break-before: page !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            position: relative !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .proposal-page.cover-page,
          .proposal-page:first-child {
            page-break-before: avoid !important;
            break-before: avoid !important;
          }
          .proposal-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .proposal-page .print-footer-block {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            font-size: 8pt !important;
            color: #475569 !important;
            border-top: 0.75pt solid #cbd5e1 !important;
            padding-top: 6px !important;
            margin-top: auto !important;
            margin-bottom: 2px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .print-footer-block {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            font-size: 8pt !important;
            color: #475569 !important;
            border-top: 0.75pt solid #cbd5e1 !important;
            padding-top: 6px !important;
            margin-top: 14px !important;
            margin-bottom: 2px !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            box-sizing: border-box !important;
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
            max-width: 100% !important;
            min-height: auto !important;
            height: auto !important;
            max-height: 258mm !important;
            padding: 0 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            page-break-after: auto !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            position: relative !important;
            background: #ffffff !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .printable-bap-doc:last-child {
            page-break-after: auto !important;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
            font-size: 8.5pt !important;
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
          <div class="print-doc-subtitle">Berdasarkan Standar SE Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026</div>
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

  function createPrintFooter(arg1, options = {}) {
    const proj = (typeof arg1 === 'object' && arg1) ? arg1 : ((window.ProjectManager && window.ProjectManager.getActiveProject()) || {});
    const docNum = proj.docNumber || "RAB/2026/001";
    const contractor = proj.contractor || "";
    const pageStr = options.pageStr || "Halaman 1 dari 1";

    return `
      <div class="print-footer-block">
        <div class="footer-left">
          <span>${contractor ? contractor + ' — ' : ''}Standar SE PUPR No. 47/2026</span>
          <span style="margin-left: 8px; font-family: monospace;">(${docNum})</span>
        </div>
        <div class="footer-right">
          <strong>${pageStr}</strong>
        </div>
      </div>
    `;
  }

  return {
    printDocument,
    printViaHiddenIframe,
    createPrintHeader,
    createPrintFooter
  };
})();
