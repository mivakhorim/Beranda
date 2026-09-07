/**
 * Proposal Generator Module (Proposal Rencana Proyek Lengkap A4)
 * Berpedoman Penuh pada Standar Resmi:
 * Surat Edaran Direktur Jenderal Bina Konstruksi Kementerian PUPR No. 47/SE/Dk/2026
 * 
 * Menghasilkan dokumen proposal resmi komprehensif 9 Halaman Standar:
 * - Halaman 1: Cover A4 Eksekutif Elegan
 * - Halaman 2: Kata Pengantar & Ringkasan Eksekutif (Executive Summary)
 * - Halaman 3: Daftar Isi Dokumen Proposal Dinamis
 * - Halaman 4: Bab I. Data Umum Proyek & Ruang Lingkup Pekerjaan Fisik
 * - Halaman 5: Bab II. Rekapitulasi Rencana Anggaran Biaya (RAB) & Bobot %
 * - Halaman 6: Bab III. Rincian Anggaran Biaya per Divisi Pekerjaan
 * - Halaman 7: Bab IV. Jadwal Pelaksanaan & Diagram Kurva S Rencana
 * - Halaman 8: Bab V. Rekapitulasi Kebutuhan Sumber Daya (Bahan & Tenaga Kerja)
 * - Halaman 9: Bab VI & VII. Skema Pembayaran Termin & Lembar Pengesahan Tiga Pihak
 */

window.ProposalGen = (function() {

  function generateProposalHtml(projParam = null, rabCalcParam = null, schedParam = null, resParam = null) {
    const proj = projParam || ((window.ProjectManager && window.ProjectManager.getActiveProject) 
      ? window.ProjectManager.getActiveProject() 
      : null);
    if (!proj) return "<div class='p-4 text-center text-muted'>Tidak ada data proyek aktif.</div>";

    const formatRp = (val) => {
      if (window.CurrencyUtil && typeof window.CurrencyUtil.formatRupiah === 'function') {
        return window.CurrencyUtil.formatRupiah(val, false, true);
      }
      const num = Math.round(Number(val) || 0);
      return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const formatNum = (val, dec = 2) => {
      if (window.CurrencyUtil && typeof window.CurrencyUtil.formatNumber === 'function') {
        return window.CurrencyUtil.formatNumber(val, dec);
      }
      const num = Number(val) || 0;
      return num.toLocaleString('id-ID', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    };


    // 1. Kalkulasi Finansial dengan Rumus Baku Matematis (Strict Zero-Error)
    const rabCalc = rabCalcParam || ((window.RabCalculator && window.RabCalculator.calculateProjectRab)
      ? window.RabCalculator.calculateProjectRab(proj)
      : null);

    const activeRealCost = (rabCalc && typeof rabCalc.realCost === 'number' && !isNaN(rabCalc.realCost) && rabCalc.realCost > 0)
      ? rabCalc.realCost
      : (proj.divisions || []).reduce((acc, d) => acc + (Number(d.subtotal) || 0), 0);

    const isPpnIncluded = proj.includePpn !== false && proj.includeTax !== false;
    const activePpnRate = (rabCalc && typeof rabCalc.ppnRate === 'number' && !isNaN(rabCalc.ppnRate))
      ? rabCalc.ppnRate
      : ((proj.ppnRate !== undefined && proj.ppnRate !== null && !isNaN(Number(proj.ppnRate))) ? Number(proj.ppnRate) : 11);

    const activePpnAmount = isPpnIncluded
      ? ((rabCalc && typeof rabCalc.ppnAmount === 'number' && !isNaN(rabCalc.ppnAmount) && rabCalc.ppnAmount > 0)
          ? rabCalc.ppnAmount
          : Math.round(activeRealCost * (activePpnRate / 100)))
      : 0;

    const activeGrandTotal = (rabCalc && typeof rabCalc.grandTotal === 'number' && !isNaN(rabCalc.grandTotal) && rabCalc.grandTotal > 0)
      ? rabCalc.grandTotal
      : Math.round(activeRealCost + activePpnAmount);

    const activeOverheadRate = (rabCalc && typeof rabCalc.overheadPercent === 'number' && !isNaN(rabCalc.overheadPercent))
      ? rabCalc.overheadPercent
      : ((proj.overheadRate !== undefined && proj.overheadRate !== null && !isNaN(Number(proj.overheadRate))) ? Number(proj.overheadRate) : 15);

    const activeTerbilang = (rabCalc && rabCalc.terbilangStr)
      ? rabCalc.terbilangStr
      : ((window.CurrencyUtil && window.CurrencyUtil.terbilang) ? window.CurrencyUtil.terbilang(activeGrandTotal) : "");

    // 2. Data Sumber Daya & Jadwal dengan Proteksi Aman (Anti-Crash)
    const resources = resParam || ((window.ResourceUsage && window.ResourceUsage.calculateTotalResources)
      ? window.ResourceUsage.calculateTotalResources(proj)
      : { materials: [], labor: [], equipment: [], totalMaterials: 0, totalLabor: 0, totalEquipment: 0, grandTotal: 0, materialsPct: '0.00', laborPct: '0.00', equipmentPct: '0.00' });

    const matList = (resources && Array.isArray(resources.materials)) ? resources.materials : [];
    const labList = (resources && Array.isArray(resources.labor)) ? resources.labor : [];

    const sig = proj.signatories || {};
    const companyDisplay = (sig.contractorCompany || proj.contractor || 'PT. Duta Konstruksi Pratama').trim();
    const footerLeftText = companyDisplay 
      ? `${companyDisplay} — Dokumen Proposal Teknis & Anggaran Biaya` 
      : `${proj.name || 'Proposal Rencana Anggaran Biaya'} — Dokumen Proposal Teknis & Anggaran Biaya`;

    const docDateStr = (window.DateUtil && window.DateUtil.formatTanggalIndo)
      ? window.DateUtil.formatTanggalIndo(sig.docDate || proj.startDate || '2026-04-01')
      : (sig.docDate || proj.startDate || '2026-04-01');

    // =========================================================================
    // 1. Cover Page (Sesuai Desain Rujukan Resmi Standar SE PUPR 2026 - Rapi & Elegan)
    // =========================================================================
    const coverHtml = `
      <div class="proposal-page cover-page" id="proposal-p1">
        <div class="cover-inner-border">
          <!-- Top Header Badge & Regulatory Reference -->
          <div class="cover-header-top">
            <div class="cover-badge-pill">
              DOKUMEN PENAWARAN TEKNIS &amp; ANGGARAN BIAYA KONSTRUKSI
            </div>
            <div class="cover-subbadge-text">
              STANDAR RESMI SE BINA KONSTRUKSI KEMENTERIAN PEKERJAAN UMUM NO. 47/SE/Dk/2026
            </div>
          </div>

          <!-- Architectural Emblem SVG -->
          <div class="cover-emblem-wrap">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 0 auto;">
              <rect x="4" y="10" width="18" height="34" rx="2" fill="#1e3a8a" />
              <rect x="26" y="18" width="18" height="26" rx="2" fill="#0284c7" />
              <rect x="8" y="15" width="4" height="4" rx="0.5" fill="#ffffff" />
              <rect x="14" y="15" width="4" height="4" rx="0.5" fill="#ffffff" />
              <rect x="8" y="22" width="4" height="4" rx="0.5" fill="#ffffff" />
              <rect x="14" y="22" width="4" height="4" rx="0.5" fill="#ffffff" />
              <rect x="8" y="29" width="4" height="4" rx="0.5" fill="#ffffff" />
              <rect x="14" y="29" width="4" height="4" rx="0.5" fill="#ffffff" />
              <rect x="30" y="23" width="4" height="4" rx="0.5" fill="#ffffff" />
              <rect x="36" y="23" width="4" height="4" rx="0.5" fill="#ffffff" />
              <rect x="30" y="30" width="4" height="4" rx="0.5" fill="#ffffff" />
              <rect x="36" y="30" width="4" height="4" rx="0.5" fill="#ffffff" />
              <path d="M2 44H46" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" />
              <path d="M13 5L22 10H4L13 5Z" fill="#d97706" />
            </svg>
          </div>

          <!-- Main Title Block -->
          <div class="cover-title-block">
            <h1 class="cover-main-title">PROPOSAL RENCANA ANGGARAN BIAYA<br>&amp; TEKNIS PELAKSANAAN</h1>
            <div class="cover-title-divider"></div>
            <div class="cover-project-card">
              <div class="cover-project-name">${proj.name || "Nama Proyek Belum Ditentukan"}</div>
              <div class="cover-project-location">📍 Lokasi Pekerjaan: ${proj.location || "Lokasi Proyek Belum Ditentukan"}</div>
            </div>
          </div>

          <!-- 4-Card Stakeholder Grid -->
          <div class="cover-stakeholder-grid">
            <div class="stakeholder-card">
              <div class="stakeholder-lbl">PEMBERI TUGAS / PEMILIK</div>
              <div class="stakeholder-val">${proj.owner || sig.ownerName || 'Pemberi Tugas'}</div>
              <div class="stakeholder-sub">${sig.ownerTitle || 'Pemilik Proyek / Pemberi Tugas'}</div>
            </div>
            <div class="stakeholder-card">
              <div class="stakeholder-lbl">KONSULTAN PERENCANA / MK</div>
              <div class="stakeholder-val">${proj.consultant || sig.consultantCompany || 'Konsultan Perencana'}</div>
              <div class="stakeholder-sub">${sig.consultantName ? `Team Leader: ${sig.consultantName}` : 'Konsultan Supervisi'}</div>
            </div>
            <div class="stakeholder-card">
              <div class="stakeholder-lbl">KONTRAKTOR PELAKSANA UTAMA</div>
              <div class="stakeholder-val">${companyDisplay}</div>
              <div class="stakeholder-sub">${sig.contractorName ? `Direktur: ${sig.contractorName}` : 'Penanggung Jawab Proyek'}</div>
            </div>
            <div class="stakeholder-card">
              <div class="stakeholder-lbl">NOMOR REGISTRASI DOKUMEN</div>
              <div class="stakeholder-val">${proj.docNumber || 'RAB/2026/001'}</div>
              <div class="stakeholder-sub">Durasi: ${proj.durationDays || 180} Hari Kalender</div>
            </div>
          </div>

          <!-- Grand Total Cost Banner -->
          <div class="cover-grand-total-banner">
            <div class="banner-lbl">TOTAL NILAI RENCANA ANGGARAN BIAYA (RAB) TERMASUK PPN:</div>
            <div class="banner-nominal">${formatRp(activeGrandTotal)}</div>
            <div class="banner-terbilang">(${activeTerbilang})</div>
          </div>

          <!-- Footer Metadata Row -->
          <div class="cover-footer-meta">
            <div>Ditetapkan di: <strong>${sig.docCity || proj.location || 'Indonesia'}</strong></div>
            <div>Tahun Anggaran: <strong>${proj.budgetYear || '2026 / 2027'}</strong></div>
            <div>Status: <strong>Dokumen Penawaran Sah</strong></div>
          </div>
        </div>
      </div>
    `;

    // =========================================================================
    // 2. Kata Pengantar & Ringkasan Eksekutif (Halaman 2)
    // =========================================================================
    const introHtml = `
      <div class="proposal-page content-page" id="proposal-p2">
        <div class="page-heading">
          <h2>KATA PENGANTAR &amp; RINGKASAN EKSEKUTIF</h2>
          <div class="heading-line"></div>
        </div>

        <!-- Identitas Surat Penawaran Resmi -->
        <div class="letter-meta-box mb-3" style="display: flex; justify-content: space-between; font-size: 8.5pt; color: #334155; border-bottom: 1.5pt solid #cbd5e1; padding-bottom: 8px;">
          <div>
            <div><strong>Nomor:</strong> ${proj.docNumber || '001/PROP-RAB/2026'}</div>
            <div><strong>Lampiran:</strong> 1 (Satu) Berkas Lengkap Proposal Teknis &amp; Rencana Anggaran Biaya</div>
            <div><strong>Perihal:</strong> Pengajuan Dokumen Penawaran Biaya Konstruksi &amp; Rencana Kerja</div>
          </div>
          <div style="text-align: right;">
            <div><strong>Kota Penetapan:</strong> ${sig.docCity || proj.location || 'Indonesia'}</div>
            <div><strong>Tanggal Dokumen:</strong> ${docDateStr}</div>
          </div>
        </div>

        <div class="prose-text mb-3" style="font-size: 9pt; line-height: 1.5; color: #1e293b;">
          <p style="margin-bottom: 4px;">Kepada Yth.<br><strong>${proj.owner || sig.ownerName || 'Pemberi Tugas'}</strong><br>${sig.ownerTitle || 'Pemilik Proyek / Pemberi Tugas'}<br>Di Tempat</p>
          <p style="margin-top: 8px; margin-bottom: 8px;">Dengan hormat,</p>
          <p style="margin-bottom: 8px; text-align: justify;">
            Sehubungan dengan rencana pelaksanaan pekerjaan konstruksi <strong>${proj.name || "Nama Proyek Belum Ditentukan"}</strong> yang berlokasi di <strong>${proj.location || "Lokasi Proyek Belum Ditentukan"}</strong>, bersama ini kami dari <strong>${companyDisplay}</strong> menyampaikan Dokumen Proposal Rencana Anggaran Biaya (RAB) dan Rencana Kerja Teknis Pelaksanaan Proyek secara komprehensif, transparan, dan dapat dipertanggungjawabkan.
          </p>
          <p style="margin-bottom: 12px; text-align: justify;">
            Penyusunan anggaran ini berpedoman penuh pada standar teknis resmi <strong>Surat Edaran Direktur Jenderal Bina Konstruksi Kementerian Pekerjaan Umum Nomor 47/SE/Dk/2026</strong>, dengan analisis harga bahan dan upah berbasis acuan daerah <strong>${proj.regionName || proj.location || 'Standar Daerah'}</strong>, mutu material berstandar SNI, serta metode kerja terukur demi menjamin mutu konstruksi prima, ketepatan waktu, dan efisiensi biaya.
          </p>
        </div>

        <!-- Kartu Ringkasan Eksekutif (3 Kolom Berwarna) -->
        <div class="executive-summary-grid mb-3" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          <div style="border: 1.5px solid #2563eb; background-color: #eff6ff; border-radius: 6px; padding: 10px 12px; text-align: center;">
            <div style="font-size: 8pt; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL NILAI INVESTASI (RAB)</div>
            <div style="font-size: 12.5pt; font-weight: 900; color: #1e3a8a; margin: 4px 0; white-space: nowrap;">${formatRp(activeGrandTotal)}</div>
            <div style="font-size: 7.5pt; color: #3b82f6; font-weight: 600;">${isPpnIncluded ? `Termasuk PPN ${activePpnRate}% &amp; Overhead ${activeOverheadRate}%` : 'Biaya Bersih Fisik (Tanpa PPN)'}</div>
          </div>

          <div style="border: 1.5px solid #059669; background-color: #ecfdf5; border-radius: 6px; padding: 10px 12px; text-align: center;">
            <div style="font-size: 8pt; font-weight: 700; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px;">WAKTU PELAKSANAAN</div>
            <div style="font-size: 12.5pt; font-weight: 900; color: #047857; margin: 4px 0; white-space: nowrap;">${proj.durationDays || 180} Hari Kalender</div>
            <div style="font-size: 7.5pt; color: #059669; font-weight: 600;">Periode: ${proj.startDate || '01 Apr 2026'} s.d. ${proj.finishDate || '30 Sep 2026'}</div>
          </div>

          <div style="border: 1.5px solid #d97706; background-color: #fffbeb; border-radius: 6px; padding: 10px 12px; text-align: center;">
            <div style="font-size: 8pt; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">LINGKUP &amp; JAMINAN MUTU</div>
            <div style="font-size: 12.5pt; font-weight: 900; color: #b45309; margin: 4px 0; white-space: nowrap;">${(proj.divisions || []).length} Divisi Utama</div>
            <div style="font-size: 7.5pt; color: #d97706; font-weight: 600;">${(proj.divisions || []).reduce((acc, d) => acc + (d.items || []).length, 0)} Item Pekerjaan &bull; Garansi 90 Hari</div>
          </div>
        </div>

        <div class="prose-text mb-3" style="font-size: 8.5pt; line-height: 1.45; color: #334155; text-align: justify;">
          <p>
            Besar harapan kami agar proposal teknis dan penawaran anggaran ini dapat memenuhi ekspektasi Bapak/Ibu. Kami berkomitmen memberikan garansi masa pemeliharaan selama 90 hari kalender pasca Serah Terima Pertama (PHO) serta pengendalian mutu bertingkat demi terwujudnya bangunan yang kokoh, estetis, dan amanah.
          </p>
        </div>

        <!-- Blok Tanda Tangan Hormat Kami -->
        <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
          <div style="width: 220px; text-align: center;">
            <div style="font-size: 8.5pt; color: #334155;">Hormat kami,</div>
            <div style="font-size: 9pt; font-weight: 800; color: #0f172a; margin-top: 2px;">${companyDisplay}</div>
            <div style="height: 44px;"></div>
            <div style="font-size: 9pt; font-weight: 800; color: #0f172a; border-bottom: 1px solid #0f172a; padding-bottom: 2px;">
              ${sig.contractorName || 'Penanggung Jawab Proyek'}
            </div>
            <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">
              ${sig.contractorTitle || 'Direktur / Penanggung Jawab Teknis'}
            </div>
          </div>
        </div>

        <!-- Running Footer Halaman 2 -->
        <div class="print-footer-block" style="margin-top: auto; border-top: 0.75pt solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman 2 dari 9</strong></div>
        </div>
      </div>
    `;

    // =========================================================================
    // 3. Daftar Isi Dinamis (Halaman 3)
    // =========================================================================
    const tocHtml = `
      <div class="proposal-page content-page" id="proposal-p3">
        <div class="page-heading">
          <h2>DAFTAR ISI DOKUMEN PROPOSAL</h2>
          <div class="heading-line"></div>
        </div>

        <div class="toc-list" style="margin-top: 25px;">
          <div class="toc-item"><span class="toc-title">KATA PENGANTAR &amp; RINGKASAN EKSEKUTIF</span><span class="toc-dots"></span><span class="toc-page">Halaman 2</span></div>
          <div class="toc-item"><span class="toc-title">DAFTAR ISI DOKUMEN PROPOSAL</span><span class="toc-dots"></span><span class="toc-page">Halaman 3</span></div>
          <div class="toc-item"><span class="toc-title">BAB I. DATA UMUM &amp; RUANG LINGKUP PEKERJAAN</span><span class="toc-dots"></span><span class="toc-page">Halaman 4</span></div>
          <div class="toc-item"><span class="toc-title">BAB II. REKAPITULASI RENCANA ANGGARAN BIAYA (RAB)</span><span class="toc-dots"></span><span class="toc-page">Halaman 5</span></div>
          <div class="toc-item"><span class="toc-title">BAB III. RINCIAN ANGGARAN BIAYA PER DIVISI PEKERJAAN</span><span class="toc-dots"></span><span class="toc-page">Halaman 6</span></div>
          <div class="toc-item"><span class="toc-title">BAB IV. JADWAL PELAKSANAAN &amp; DIAGRAM KURVA S</span><span class="toc-dots"></span><span class="toc-page">Halaman 7</span></div>
          <div class="toc-item"><span class="toc-title">BAB V. REKAPITULASI KEBUTUHAN SUMBER DAYA (BAHAN &amp; TENAGA)</span><span class="toc-dots"></span><span class="toc-page">Halaman 8</span></div>
          <div class="toc-item"><span class="toc-title">BAB VI &amp; VII. SKEMA PEMBAYARAN TERMIN &amp; LEMBAR PENGESAHAN</span><span class="toc-dots"></span><span class="toc-page">Halaman 9</span></div>
        </div>

        <!-- Running Footer Halaman 3 -->
        <div class="print-footer-block" style="margin-top: auto; border-top: 0.75pt solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman 3 dari 9</strong></div>
        </div>
      </div>
    `;

    // =========================================================================
    // 4. Bab I: Data Umum Proyek & Lingkup Terstruktur (Halaman 4)
    // =========================================================================
    const bab1Html = `
      <div class="proposal-page content-page" id="proposal-p4">
        <div class="page-heading">
          <h2>BAB I. DATA UMUM &amp; RUANG LINGKUP PEKERJAAN</h2>
          <div class="heading-line"></div>
        </div>

        <!-- A. Data Umum Proyek -->
        <div class="subheading mb-2" style="font-size: 9.5pt; font-weight: 700; color: #0f172a;">
          <strong>A. Identitas Umum &amp; Administrasi Proyek:</strong>
        </div>
        <table class="table table-bordered print-compact-table mb-3" style="font-size: 8pt; border-collapse: collapse; width: 100%;">
          <tbody>
            <tr>
              <td style="width: 28%; font-weight: 700; background-color: #f8fafc;">Nama Pekerjaan</td>
              <td style="width: 72%; font-weight: 700; color: #0f172a;">${proj.name || "Nama Proyek Belum Ditentukan"}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Lokasi Pekerjaan</td>
              <td>${proj.location || "Lokasi Proyek Belum Ditentukan"}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Pemberi Tugas / Pemilik</td>
              <td><strong>${proj.owner || sig.ownerName || 'Pemberi Tugas'}</strong> (${sig.ownerTitle || 'Pemilik Proyek'})</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Kontraktor Pelaksana</td>
              <td><strong>${companyDisplay}</strong> ${sig.contractorName ? `(${sig.contractorName})` : ''}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Konsultan Perencana / MK</td>
              <td><strong>${proj.consultant || sig.consultantCompany || '-'}</strong> ${sig.consultantName ? `(${sig.consultantName})` : ''}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Waktu Pelaksanaan</td>
              <td><strong>${proj.durationDays || 180} Hari Kalender</strong> (${proj.startDate || '01 Apr 2026'} s.d. ${proj.finishDate || '30 Sep 2026'})</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Standar Acuan AHSP</td>
              <td>${proj.dataSource || 'Surat Edaran Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026'}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Wilayah Remunerasi &amp; Indeks</td>
              <td>${proj.regionName || 'Jawa Barat - Bandung Raya & Priangan'} (Indeks Remunerasi Standar PUPR)</td>
            </tr>
          </tbody>
        </table>

        <!-- B. Ruang Lingkup Pekerjaan Fisik -->
        <div class="subheading mb-2" style="font-size: 9.5pt; font-weight: 700; color: #0f172a;">
          <strong>B. Lingkup Pekerjaan Fisik (Scope of Work):</strong>
        </div>
        <table class="table table-bordered print-compact-table mb-3" style="font-size: 7.5pt; border-collapse: collapse; width: 100%;">
          <thead>
            <tr class="table-header-row" style="background-color: #f1f5f9;">
              <th style="width: 6%; text-align: center; vertical-align: middle;">No</th>
              <th style="width: 12%; text-align: center; vertical-align: middle;">Divisi</th>
              <th style="width: 44%; text-align: left; vertical-align: middle;">Nama Divisi Pekerjaan</th>
              <th style="width: 14%; text-align: center; vertical-align: middle;">Jumlah Item</th>
              <th style="width: 24%; text-align: right; vertical-align: middle;">Subtotal Anggaran</th>
            </tr>
          </thead>
          <tbody>
            ${(proj.divisions || []).map((d, i) => `
              <tr>
                <td style="text-align: center;">${i + 1}</td>
                <td style="text-align: center; font-weight: 700;">${d.code ? `DIVISI ${d.code}` : `DIVISI ${i + 1}`}</td>
                <td><strong>${d.name}</strong></td>
                <td style="text-align: center;">${(d.items || []).length} Item Pekerjaan</td>
                <td style="text-align: right; font-weight: 700; white-space: nowrap;">${formatRp(d.subtotal || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- C. Standar Teknis & Pengendalian Mutu -->
        <div class="subheading mb-2" style="font-size: 9.5pt; font-weight: 700; color: #0f172a;">
          <strong>C. Standar Teknis &amp; Pengendalian Mutu Konstruksi:</strong>
        </div>
        <div style="font-size: 7.5pt; color: #334155; line-height: 1.45; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 10px;">
          Pekerjaan dilaksanakan sesuai dengan Spesifikasi Teknis Umum Bina Konstruksi 2026, Standar Nasional Indonesia (SNI) Bahan Bangunan (Beton Bertulang SNI 2847:2019, Baja Tulangan SNI 2052:2017, Mortar Pasangan SNI 03-6882-2002), serta Sistem Manajemen Keselamatan dan Kesehatan Kerja Konstruksi (SMKK/K3).
        </div>

        <!-- Running Footer Halaman 4 -->
        <div class="print-footer-block" style="margin-top: auto; border-top: 0.75pt solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman 4 dari 9</strong></div>
        </div>
      </div>
    `;

    // =========================================================================
    // 5. Bab II: Rekapitulasi RAB (Halaman 5)
    // =========================================================================
    let recapRows = "";
    const divisionSummaries = (rabCalc && rabCalc.divisionSummaries) ? rabCalc.divisionSummaries : (proj.divisions || []).map(d => ({
      code: d.code,
      name: d.name,
      subtotal: d.subtotal || 0,
      weightPercent: activeRealCost > 0 ? ((d.subtotal || 0) / activeRealCost) * 100 : 0
    }));

    divisionSummaries.forEach((div, idx) => {
      recapRows += `
        <tr>
          <td style="text-align: center; width: 5%;">${idx + 1}</td>
          <td style="text-align: center; font-weight: 700; width: 10%;">${div.code ? `DIVISI ${div.code}` : `DIVISI ${idx + 1}`}</td>
          <td style="width: 45%;"><strong>${div.name}</strong></td>
          <td style="text-align: right; font-weight: 700; width: 25%; white-space: nowrap;">${formatRp(div.subtotal)}</td>
          <td style="text-align: center; width: 15%;">${formatNum(div.weightPercent, 2)}%</td>
        </tr>
      `;
    });

    const bab2Html = `
      <div class="proposal-page content-page" id="proposal-p5">
        <div class="page-heading">
          <h2>BAB II. REKAPITULASI RENCANA ANGGARAN BIAYA</h2>
          <div class="heading-line"></div>
        </div>

        <table class="table table-bordered print-compact-table mb-4" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr class="table-header-row" style="background-color: #f1f5f9;">
              <th style="width: 5%; text-align: center;">No</th>
              <th style="width: 10%; text-align: center;">Divisi</th>
              <th style="width: 45%; text-align: left;">Uraian Divisi Pekerjaan</th>
              <th style="width: 25%; text-align: right;">Jumlah Harga (Rp)</th>
              <th style="width: 15%; text-align: center;">Bobot (%)</th>
            </tr>
          </thead>
          <tbody>
            ${recapRows}
            <tr class="table-active font-bold" style="background-color: #f8fafc; border-top: 1.5px solid #cbd5e1;">
              <td colspan="3" style="text-align: right; font-weight: 700; padding: 6px 8px;">JUMLAH BIAYA FISIK KONSTRUKSI (REAL COST)</td>
              <td style="text-align: right; font-weight: 800; padding: 6px 8px; white-space: nowrap;">${formatRp(activeRealCost)}</td>
              <td style="text-align: center; font-weight: 700; padding: 6px 8px;">100.00%</td>
            </tr>
            ${isPpnIncluded ? `
            <tr>
              <td colspan="3" style="text-align: right; padding: 5px 8px;">Pajak Pertambahan Nilai (PPN ${activePpnRate}%)</td>
              <td style="text-align: right; font-weight: 600; padding: 5px 8px; white-space: nowrap;">${formatRp(activePpnAmount)}</td>
              <td style="text-align: center; padding: 5px 8px;">-</td>
            </tr>` : ''}
            <tr class="total-highlight-row" style="background-color: #eff6ff; border-top: 2px solid #0f172a;">
              <td colspan="3" style="text-align: right; font-weight: 800; font-size: 9.5pt; padding: 8px 8px; color: #0f172a;">TOTAL RENCANA ANGGARAN BIAYA (DIBULATKAN)</td>
              <td style="text-align: right; font-weight: 900; color: #2563eb; font-size: 11pt; padding: 8px 8px; white-space: nowrap;">
                ${formatRp(activeGrandTotal)}
              </td>
              <td style="text-align: center; padding: 8px 8px;">-</td>
            </tr>
          </tbody>
        </table>

        <div class="terbilang-box mb-4" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; font-size: 8.5pt;">
          <strong>Terbilang:</strong> <em style="color: #1e40af; font-weight: 600;">"${activeTerbilang}"</em>
        </div>

        <!-- Running Footer Halaman 5 -->
        <div class="print-footer-block" style="margin-top: auto; border-top: 0.75pt solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman 5 dari 9</strong></div>
        </div>
      </div>
    `;

    // =========================================================================
    // 6. Bab III: Rincian Detail RAB per Divisi (Halaman 6)
    // =========================================================================
    let detailDivisionsHtml = "";
    (proj.divisions || []).forEach((div, dIdx) => {
      let itemsHtml = "";
      (div.items || []).forEach((itm, idx) => {
        itemsHtml += `
          <tr>
            <td style="text-align: center; width: 4%; padding: 4px 2px;">${idx + 1}</td>
            <td style="width: 38%; padding: 4px 6px;">
              <strong>${itm.name}</strong>
              ${itm.notes ? `<div style="font-size: 7.5pt; color: #64748b; margin-top: 1px;">${itm.notes}</div>` : ''}
            </td>
            <td style="text-align: center; width: 11%; padding: 4px 2px;"><span class="badge badge-light" style="font-size: 7.5pt;">${itm.code || itm.ahspCode || "-"}</span></td>
            <td style="text-align: right; font-weight: 700; width: 8%; padding: 4px 4px;">${formatNum(itm.volume, 2)}</td>
            <td style="text-align: center; width: 6%; padding: 4px 2px;">${itm.unit || "-"}</td>
            <td style="text-align: right; width: 16%; padding: 4px 4px; white-space: nowrap;">${formatRp(itm.price)}</td>
            <td style="text-align: right; font-weight: 700; width: 17%; padding: 4px 5px; white-space: nowrap;">${formatRp(itm.total)}</td>
          </tr>
        `;
      });

      detailDivisionsHtml += `
        <div class="division-block mb-3" style="page-break-inside: avoid; break-inside: avoid;">
          <div class="division-title-bar" style="background-color: #f1f5f9; border-left: 3px solid #2563eb; padding: 5px 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 8.5pt; font-weight: 800; color: #0f172a;">${div.code ? `DIVISI ${div.code}. ` : `DIVISI ${dIdx + 1}. `}${(div.name || "").toUpperCase()}</span>
            <span style="font-size: 8.5pt; font-weight: 800; color: #1e40af; white-space: nowrap;">Subtotal: ${formatRp(div.subtotal)}</span>
          </div>
          <table class="table table-bordered print-compact-table" style="width: 100%; border-collapse: collapse; font-size: 7.5pt; margin-bottom: 8px;">
            <thead>
              <tr class="table-header-row" style="background-color: #f8fafc;">
                <th style="width: 4%; text-align: center; padding: 3px 2px;">No</th>
                <th style="width: 38%; text-align: left; padding: 3px 6px;">Uraian Pekerjaan</th>
                <th style="width: 11%; text-align: center; padding: 3px 2px;">Kode AHSP</th>
                <th style="width: 8%; text-align: right; padding: 3px 4px;">Volume</th>
                <th style="width: 6%; text-align: center; padding: 3px 2px;">Satuan</th>
                <th style="width: 16%; text-align: right; padding: 3px 4px;">Harga Satuan (Rp)</th>
                <th style="width: 17%; text-align: right; padding: 3px 5px;">Jumlah Harga (Rp)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || '<tr><td colspan="7" class="text-center text-muted p-2">Belum ada rincian pekerjaan pada divisi ini.</td></tr>'}
            </tbody>
          </table>
        </div>
      `;
    });

    const bab3Html = `
      <div class="proposal-page content-page" id="proposal-p6">
        <div class="page-heading">
          <h2>BAB III. RINCIAN ANGGARAN BIAYA PEKERJAAN</h2>
          <div class="heading-line"></div>
        </div>
        ${detailDivisionsHtml}

        <!-- Running Footer Halaman 6 -->
        <div class="print-footer-block" style="margin-top: auto; border-top: 0.75pt solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman 6 dari 9</strong></div>
        </div>
      </div>
    `;

    // =========================================================================
    // 7. Bab IV: Kurva S & Jadwal Pelaksanaan (Halaman 7)
    // =========================================================================
    const bab4Html = `
      <div class="proposal-page content-page" id="proposal-p7">
        <div class="page-heading">
          <h2>BAB IV. JADWAL PELAKSANAAN &amp; DIAGRAM KURVA S</h2>
          <div class="heading-line"></div>
        </div>

        <div class="prose-text mb-3" style="font-size: 8.5pt; color: #334155; line-height: 1.45;">
          <p>Diagram Kurva S berikut merepresentasikan distribusi beban kerja terencana dan target progres fisik kumulatif sepanjang masa pelaksanaan konstruksi (${proj.durationDays || 180} hari kalender, periode ${proj.startDate || '01 Apr 2026'} s.d. ${proj.finishDate || '30 Sep 2026'}):</p>
        </div>

        <div id="proposal-scurve-embed" class="svg-print-container mb-3" style="width: 100%; min-height: 290px; text-align: center;">
          <!-- Diisi via renderSvgChart langsung ke elemen proposal -->
        </div>

        <div class="prose-text" style="font-size: 8pt; color: #475569; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 10px;">
          <p style="margin: 0;"><strong>Keterangan Diagram Kurva S:</strong> Garis biru mewakili Rencana Target Fisik Kumulatif (%), garis hijau mewakili Realisasi Fisik Aktual Lapangan (%), dan diagram batang pada bagian dasar grafik memperlihatkan bobot rencana mingguan/harian proporsional.</p>
        </div>

        <!-- Running Footer Halaman 7 -->
        <div class="print-footer-block" style="margin-top: auto; border-top: 0.75pt solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman 7 dari 9</strong></div>
        </div>
      </div>
    `;

    // =========================================================================
    // 8. Bab V: Rekapitulasi Kebutuhan Sumber Daya (Halaman 8)
    // =========================================================================
    let matRows = "";
    const topMats = matList.slice(0, 10);
    const otherMats = matList.slice(10);
    const otherMatTotal = otherMats.reduce((acc, m) => acc + (Number(m.totalCost) || 0), 0);

    topMats.forEach((m, idx) => {
      matRows += `
        <tr>
          <td style="text-align: center; width: 5%; padding: 3px 2px;">${idx + 1}</td>
          <td style="width: 43%; padding: 3px 6px;"><strong>${m.name}</strong></td>
          <td style="text-align: center; width: 10%; padding: 3px 2px;">${m.unit}</td>
          <td style="text-align: right; font-weight: 700; width: 12%; padding: 3px 4px;">${formatNum(m.qty, 2)}</td>
          <td style="text-align: right; width: 15%; padding: 3px 4px; white-space: nowrap;">${formatRp(m.price)}</td>
          <td style="text-align: right; font-weight: 700; width: 15%; padding: 3px 5px; white-space: nowrap;">${formatRp(m.totalCost)}</td>
        </tr>
      `;
    });

    if (otherMats.length > 0) {
      matRows += `
        <tr style="background-color: #f8fafc; font-style: italic;">
          <td style="text-align: center; padding: 3px 2px;">+</td>
          <td colspan="4" style="padding: 3px 6px;">Material Bahan Bangunan Lainnya (${otherMats.length} jenis bahan pendukung)</td>
          <td style="text-align: right; font-weight: 700; padding: 3px 5px; white-space: nowrap;">${formatRp(otherMatTotal)}</td>
        </tr>
      `;
    }

    let labRows = "";
    labList.forEach((l, idx) => {
      labRows += `
        <tr>
          <td style="text-align: center; width: 5%; padding: 3px 2px;">${idx + 1}</td>
          <td style="width: 43%; padding: 3px 6px;"><strong>${l.name}</strong></td>
          <td style="text-align: center; width: 10%; padding: 3px 2px;">${l.unit || 'OH'}</td>
          <td style="text-align: right; font-weight: 700; width: 12%; padding: 3px 4px;">${formatNum(l.qty, 2)}</td>
          <td style="text-align: right; width: 15%; padding: 3px 4px; white-space: nowrap;">${formatRp(l.price)}</td>
          <td style="text-align: right; font-weight: 700; width: 15%; padding: 3px 5px; white-space: nowrap;">${formatRp(l.totalCost)}</td>
        </tr>
      `;
    });

    const bab5Html = `
      <div class="proposal-page content-page" id="proposal-p8">
        <div class="page-heading">
          <h2>BAB V. REKAPITULASI KEBUTUHAN SUMBER DAYA</h2>
          <div class="heading-line"></div>
        </div>

        <div class="subheading mb-2" style="font-size: 9pt; font-weight: 700; color: #0f172a;">
          <strong>A. Estimasi Kebutuhan Bahan Material Utama Terbesar (Top Material):</strong>
        </div>
        <div class="card p-2 mb-2 bg-light" style="font-size: 8pt; border: 1px solid #e2e8f0; border-radius: 4px;">
          <strong>Proporsi Distribusi Sumber Daya:</strong> Material Bahan: ${resources.materialsPct || '0.00'}% &bull; Upah Tenaga Kerja: ${resources.laborPct || '0.00'}% &bull; Sewa &amp; Operasional Alat: ${resources.equipmentPct || '0.00'}%
        </div>
        <table class="table table-bordered print-compact-table mb-3" style="width: 100%; border-collapse: collapse; font-size: 7.5pt;">
          <thead>
            <tr class="table-header-row" style="background-color: #f1f5f9;">
              <th style="width: 5%; text-align: center; padding: 3px 2px;">No</th>
              <th style="width: 43%; text-align: left; padding: 3px 6px;">Nama Bahan Material</th>
              <th style="width: 10%; text-align: center; padding: 3px 2px;">Satuan</th>
              <th style="width: 12%; text-align: right; padding: 3px 4px;">Volume</th>
              <th style="width: 15%; text-align: right; padding: 3px 4px;">Harga Satuan</th>
              <th style="width: 15%; text-align: right; padding: 3px 5px;">Subtotal Biaya</th>
            </tr>
          </thead>
          <tbody>
            ${matRows || '<tr><td colspan="6" class="text-center text-muted p-2">Belum ada kebutuhan bahan.</td></tr>'}
          </tbody>
        </table>

        <div class="subheading mb-2" style="font-size: 9pt; font-weight: 700; color: #0f172a;">
          <strong>B. Estimasi Kebutuhan Tenaga Kerja Lapangan (Orang-Hari / OH):</strong>
        </div>
        <table class="table table-bordered print-compact-table mb-3" style="width: 100%; border-collapse: collapse; font-size: 7.5pt;">
          <thead>
            <tr class="table-header-row" style="background-color: #f1f5f9;">
              <th style="width: 5%; text-align: center; padding: 3px 2px;">No</th>
              <th style="width: 43%; text-align: left; padding: 3px 6px;">Klasifikasi Tenaga Kerja</th>
              <th style="width: 10%; text-align: center; padding: 3px 2px;">Satuan</th>
              <th style="width: 12%; text-align: right; padding: 3px 4px;">Jumlah OH</th>
              <th style="width: 15%; text-align: right; padding: 3px 4px;">Upah Harian</th>
              <th style="width: 15%; text-align: right; padding: 3px 5px;">Subtotal Upah</th>
            </tr>
          </thead>
          <tbody>
            ${labRows || '<tr><td colspan="6" class="text-center text-muted p-2">Belum ada data upah tenaga kerja.</td></tr>'}
          </tbody>
        </table>

        <!-- Running Footer Halaman 8 -->
        <div class="print-footer-block" style="margin-top: auto; border-top: 0.75pt solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman 8 dari 9</strong></div>
        </div>
      </div>
    `;

    // =========================================================================
    // 9. Bab VI & VII: Skema Pembayaran & Lembar Pengesahan (Halaman 9)
    // =========================================================================
    // Kalkulasi Rumus Baku Termin Pembayaran 100% Akurat (Strict Mathematical Equality)
    const term1Val = Math.round(activeGrandTotal * 0.20);
    const term2Val = Math.round(activeGrandTotal * 0.30);
    const term3Val = Math.round(activeGrandTotal * 0.30);
    const term4Val = Math.round(activeGrandTotal * 0.15);
    const retensiVal = activeGrandTotal - (term1Val + term2Val + term3Val + term4Val);

    const bab67Html = `
      <div class="proposal-page content-page" id="proposal-p9">
        <div class="page-heading">
          <h2>BAB VI. SKEMA PEMBAYARAN TERMIN &amp; GARANSI MUTU</h2>
          <div class="heading-line"></div>
        </div>

        <div class="prose-text mb-2" style="font-size: 8.5pt; color: #334155; line-height: 1.45;">
          <p>Pembayaran nilai kontrak disepakati secara bertahap (termin) berbasis capaian bobot fisik lapangan yang diverifikasi resmi dalam Berita Acara Pembayaran (BAP):</p>
        </div>

        <!-- Tabel Skema Pembayaran Termin Resmi 100% Sesuai Standar -->
        <table class="table table-bordered print-compact-table mb-3" style="font-size: 7.5pt; width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="width: 12%; text-align: center; vertical-align: middle; padding: 4px;">Tahap</th>
              <th style="width: 40%; text-align: left; vertical-align: middle; padding: 4px 6px;">Tahapan Prestasi Fisik &amp; Syarat Pembayaran</th>
              <th style="width: 12%; text-align: center; vertical-align: middle; padding: 4px;">Bobot Fisik</th>
              <th style="width: 12%; text-align: center; vertical-align: middle; padding: 4px;">Porsi Bayar</th>
              <th style="width: 24%; text-align: right; vertical-align: middle; padding: 4px 6px;">Nilai Pembayaran (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; font-weight: 700;">Termin I</td>
              <td>Uang Muka Kerja (Mobilisasi Alat, Tenaga &amp; Persiapan Awal Lapangan)</td>
              <td style="text-align: center;">0%</td>
              <td style="text-align: center; font-weight: 700;">20%</td>
              <td style="text-align: right; font-weight: 700; white-space: nowrap;">${formatRp(term1Val)}</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">Termin II</td>
              <td>Prestasi Fisik 50% (Pekerjaan Pondasi, Kolom Struktur &amp; Cor Dak Lantai 2 Selesai)</td>
              <td style="text-align: center;">50%</td>
              <td style="text-align: center; font-weight: 700;">30%</td>
              <td style="text-align: right; font-weight: 700; white-space: nowrap;">${formatRp(term2Val)}</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">Termin III</td>
              <td>Prestasi Fisik 80% (Pasangan Dinding, Rangka &amp; Penutup Atap, serta Instalasi MEP)</td>
              <td style="text-align: center;">80%</td>
              <td style="text-align: center; font-weight: 700;">30%</td>
              <td style="text-align: right; font-weight: 700; white-space: nowrap;">${formatRp(term3Val)}</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">Termin IV</td>
              <td>Prestasi Fisik 100% (Pekerjaan Finishing Selesai &amp; Serah Terima Pertama / PHO Sah)</td>
              <td style="text-align: center;">100%</td>
              <td style="text-align: center; font-weight: 700;">15%</td>
              <td style="text-align: right; font-weight: 700; white-space: nowrap;">${formatRp(term4Val)}</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">Retensi</td>
              <td>Jaminan Masa Pemeliharaan 90 Hari Kalender &amp; Serah Terima Akhir / FHO Tanpa Cacat</td>
              <td style="text-align: center;">100%</td>
              <td style="text-align: center; font-weight: 700;">5%</td>
              <td style="text-align: right; font-weight: 700; white-space: nowrap;">${formatRp(retensiVal)}</td>
            </tr>
            <tr style="background-color: #f1f5f9; font-weight: 800; border-top: 1.5px solid #0f172a;">
              <td colspan="3" style="text-align: right; padding: 5px 8px;">TOTAL KELENGKAPAN NILAI PEMBAYARAN:</td>
              <td style="text-align: center; padding: 5px 8px;">100%</td>
              <td style="text-align: right; color: #2563eb; font-size: 9pt; padding: 5px 8px; white-space: nowrap;">${formatRp(activeGrandTotal)}</td>
            </tr>
          </tbody>
        </table>

        <div class="page-heading mt-2">
          <h2>BAB VII. LEMBAR PENGESAHAN TIGA PIHAK</h2>
          <div class="heading-line"></div>
        </div>

        <div class="prose-text mb-2" style="font-size: 8.5pt; color: #334155;">
          <p>Dokumen Proposal Rencana Anggaran Biaya dan Rencana Kerja ini telah diperiksa, disetujui, dan disepakati bersama oleh Para Pihak:</p>
        </div>

        <!-- Tanggal & Kota Penetapan Lembar Pengesahan -->
        <div style="text-align: right; font-size: 8.5pt; color: #334155; margin-bottom: 8px; font-weight: 500;">
          Ditetapkan di: <strong>${sig.docCity || proj.location || 'Indonesia'}</strong>, Tanggal: <strong>${docDateStr}</strong>
        </div>

        <!-- Kolom Tanda Tangan Tiga Pihak Bersih Minimalis & Elegan -->
        <div class="signature-clean-grid three-parties mt-1" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; text-align: center;">
          <div class="sig-block" style="border: none !important; background: transparent !important; padding: 2px 6px;">
            <div class="sig-title" style="font-weight: 800; font-size: 8.5pt; color: #1e293b; margin-bottom: 2px;">PEMBERI TUGAS / OWNER</div>
            <div style="font-size: 7.5pt; color: #64748b; min-height: 14px;">Menyetujui &amp; Menetapkan:</div>
            <div class="sig-space" style="height: 44px;"></div>
            <div class="sig-name" style="font-weight: 700; font-size: 9pt; color: #0f172a; text-decoration: underline;">( ${(sig.ownerName && !sig.ownerName.includes('...')) ? sig.ownerName : (proj.owner || 'Ir. Budi Santoso, M.T.')} )</div>
            <div class="sig-role" style="font-size: 7.5pt; color: #334155; margin-top: 2px;">${sig.ownerTitle || 'Pemilik Bangunan / Pemberi Tugas'}</div>
            ${sig.ownerNip && sig.ownerNip !== '-' ? `<div style="font-size: 7pt; color: #64748b; margin-top: 1px;">NIP/NIK: ${sig.ownerNip}</div>` : ''}
          </div>

          <div class="sig-block" style="border: none !important; background: transparent !important; padding: 2px 6px;">
            <div class="sig-title" style="font-weight: 800; font-size: 8.5pt; color: #1e293b; margin-bottom: 2px;">KONSULTAN PERENCANA</div>
            <div style="font-size: 7.5pt; color: #64748b; min-height: 14px;">Direncanakan &amp; Dihitung:</div>
            <div class="sig-space" style="height: 44px;"></div>
            <div class="sig-name" style="font-weight: 700; font-size: 9pt; color: #0f172a; text-decoration: underline;">( ${(sig.consultantName && !sig.consultantName.includes('...')) ? sig.consultantName : 'Ir. Bambang Hartono, S.T., M.T.'} )</div>
            <div class="sig-role" style="font-size: 7.5pt; color: #334155; margin-top: 2px;">${sig.consultantTitle || 'Konsultan Perencana / Team Leader'}</div>
            <div style="font-size: 7pt; color: #64748b; margin-top: 1px;">${sig.consultantCompany || proj.consultant || 'PT. Sarana Buana Konsultan'}</div>
          </div>

          <div class="sig-block" style="border: none !important; background: transparent !important; padding: 2px 6px;">
            <div class="sig-title" style="font-weight: 800; font-size: 8.5pt; color: #1e293b; margin-bottom: 2px;">KONTRAKTOR PELAKSANA</div>
            <div style="font-size: 7.5pt; color: #64748b; min-height: 14px;">Diajukan &amp; Dilaksanakan:</div>
            <div class="sig-space" style="height: 44px;"></div>
            <div class="sig-name" style="font-weight: 700; font-size: 9pt; color: #0f172a; text-decoration: underline;">( ${(sig.contractorName && !sig.contractorName.includes('...')) ? sig.contractorName : 'H. Ahmad Fauzi, S.T.'} )</div>
            <div class="sig-role" style="font-size: 7.5pt; color: #334155; margin-top: 2px;">${sig.contractorTitle || 'Direktur Utama'}</div>
            <div style="font-size: 7pt; color: #64748b; margin-top: 1px;">${companyDisplay}</div>
          </div>
        </div>

        <!-- Running Footer Halaman 9 -->
        <div class="print-footer-block" style="margin-top: auto; border-top: 0.75pt solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman 9 dari 9</strong></div>
        </div>
      </div>
    `;

    return coverHtml + introHtml + tocHtml + bab1Html + bab2Html + bab3Html + bab4Html + bab5Html + bab67Html;
  }

  return {
    generateProposalHtml,
    generateFullProposalHtml: generateProposalHtml
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.ProposalGen;
}
