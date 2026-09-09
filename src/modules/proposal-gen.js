/**
 * Proposal Generator Module (Cetak Proposal Rencana Proyek Lengkap A4)
 * Berpedoman Penuh pada Standar Resmi:
 * - Undang-Undang Republik Indonesia No. 2 Tahun 2017 tentang Jasa Konstruksi
 * - Peraturan Menteri PUPR No. 8 Tahun 2023 tentang Pedoman Penyusunan Perkiraan Biaya Pekerjaan Konstruksi
 * - Surat Edaran Direktur Jenderal Bina Konstruksi Kementerian PUPR No. 47/SE/Dk/2026
 * 
 * Menghasilkan Dokumen Proposal Resmi Komprehensif Berstandar A4 dengan Halaman Terpisah per Bab:
 * - Halaman 1: Cover A4 Eksekutif Elegan
 * - Halaman 2: Kata Pengantar & Ringkasan Eksekutif (Executive Summary)
 * - Halaman 3: Daftar Isi Dokumen Proposal
 * - Halaman 4: Bab I. Data Umum Proyek & Ruang Lingkup Pekerjaan Fisik
 * - Halaman 5: Bab II. Rekapitulasi Rencana Anggaran Biaya (RAB) & Bobot %
 * - Halaman 6: Bab III. Rincian Anggaran Biaya per Divisi Pekerjaan
 * - Halaman 7: Bab IV. Jadwal Pelaksanaan & Diagram Kurva S Rencana
 * - Halaman 8: Bab V. Rekapitulasi Kebutuhan Sumber Daya (Bahan & Tenaga Kerja)
 * - Halaman 9: Bab VI. Skema Pembayaran Termin & Garansi Mutu Konstruksi
 * - Halaman 10: Bab VII. Lembar Pengesahan Tiga Pihak (Owner, Perencana, Kontraktor)
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

    // 1. Kalkulasi Finansial dengan Rumus Baku Matematis (Strict Zero Double-Counting)
    const rabCalc = rabCalcParam || ((window.RabCalculator && window.RabCalculator.calculateProjectRab)
      ? window.RabCalculator.calculateProjectRab(proj)
      : null);

    const activeRealCost = (rabCalc && typeof rabCalc.realCost === 'number' && !isNaN(rabCalc.realCost) && rabCalc.realCost > 0)
      ? rabCalc.realCost
      : (proj.divisions || []).reduce((acc, d) => acc + (Number(d.subtotal) || 0), 0);

    const isPpnIncluded = proj.includePpn !== false && proj.includeTax !== false;
    const activePpnRate = (rabCalc && typeof rabCalc.ppnRate === 'number' && !isNaN(rabCalc.ppnRate))
      ? rabCalc.ppnRate
      : ((proj.ppnRate !== undefined && proj.ppnRate !== null && !isNaN(Number(proj.ppnRate))) ? Number(proj.ppnRate) : 0);

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
      : ((proj.overheadRate !== undefined && proj.overheadRate !== null && !isNaN(Number(proj.overheadRate))) ? Number(proj.overheadRate) : 0);

    const activeTerbilang = (rabCalc && rabCalc.terbilangStr)
      ? rabCalc.terbilangStr
      : ((window.CurrencyUtil && window.CurrencyUtil.terbilang) ? window.CurrencyUtil.terbilang(activeGrandTotal) : "");

    // 2. Data Sumber Daya & Jadwal
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
    // PARTISI BAB III: SETIAP BAB MEMILIKI HALAMAN SENDIRI
    // Bab III Hanya Memiliki 1 Awalan Bersih (Tanpa "Bagian 1", "Bagian 2")
    // Bab VI (Termin) dan Bab VII (Pengesahan) Dipisahkan 100% pada Halaman Mandiri
    // =========================================================================
    const allDivisions = proj.divisions || [];
    const MAX_ITEMS_PER_PAGE = 16;
    const bab3Partitions = [];
    let curDivs = [];
    let curCount = 0;

    allDivisions.forEach((div, idx) => {
      const cnt = (div.items || []).length;
      if (curDivs.length > 0 && curCount + cnt > MAX_ITEMS_PER_PAGE) {
        bab3Partitions.push({ divs: curDivs, count: curCount });
        curDivs = [];
        curCount = 0;
      }
      curDivs.push({ div, originalIdx: idx });
      curCount += cnt;
    });
    if (curDivs.length > 0) {
      bab3Partitions.push({ divs: curDivs, count: curCount });
    }
    if (bab3Partitions.length === 0) {
      bab3Partitions.push({ divs: [], count: 0 });
    }

    const bab3SheetCount = bab3Partitions.length;

    // Nomor Halaman Eksak:
    // Cover = 1
    // Kata Pengantar = 2
    // Daftar Isi = 3
    // Bab I = 4
    // Bab II = 5
    // Bab III = 6 s.d. (5 + bab3SheetCount)
    // Bab IV = 5 + bab3SheetCount + 1
    // Bab V = 5 + bab3SheetCount + 2
    // Bab VI = 5 + bab3SheetCount + 3 (Halaman Mandiri Termin & Garansi)
    // Bab VII = 5 + bab3SheetCount + 4 (Halaman Mandiri Lembar Pengesahan Tiga Pihak)
    const bab4PageNum = 5 + bab3SheetCount + 1;
    const bab5PageNum = 5 + bab3SheetCount + 2;
    const bab6PageNum = 5 + bab3SheetCount + 3;
    const bab7PageNum = 5 + bab3SheetCount + 4;
    const totalPages = bab7PageNum;

    function renderRunningFooter(pageNum) {
      return `
        <div class="print-footer-block" style="margin-top: auto; border-top: 1px solid #e2e8f0; padding-top: 4px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman ${pageNum} dari ${totalPages}</strong></div>
        </div>
      `;
    }

    // =========================================================================
    // 1. Cover Page (Halaman 1)
    // =========================================================================
    const coverHtml = `
      <div class="proposal-page cover-page" id="proposal-p1">
        <div class="cover-inner-border">
          <div class="cover-header-top">
            <div class="cover-badge-pill">
              DOKUMEN PENAWARAN TEKNIS &amp; ANGGARAN BIAYA KONSTRUKSI
            </div>
            <div class="cover-subbadge-text">
              STANDAR RESMI SE BINA KONSTRUKSI KEMENTERIAN PEKERJAAN UMUM NO. 47/SE/Dk/2026
            </div>
          </div>

          <div class="cover-emblem-wrap">
            ${proj.logo ? `
              <img src="${proj.logo}" alt="Logo Perusahaan" style="max-height: 55px; max-width: 170px; object-fit: contain; margin: 0 auto; display: block;" />
            ` : `
              <div style="font-family: 'Times New Roman', serif; font-size: 13pt; font-weight: bold; letter-spacing: 2px; color: #0f172a; text-transform: uppercase;">
                ${companyDisplay}
              </div>
            `}
          </div>

          <div class="cover-title-block">
            <h1 class="cover-main-title">PROPOSAL RENCANA ANGGARAN BIAYA<br>&amp; TEKNIS PELAKSANAAN</h1>
            <div class="cover-title-divider"></div>
            <div class="cover-project-card">
              <div class="cover-project-name">${proj.name || "Nama Proyek Belum Ditentukan"}</div>
              <div class="cover-project-location">📍 Lokasi Pekerjaan: ${proj.location || "Lokasi Proyek Belum Ditentukan"}</div>
            </div>
          </div>

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

          <div class="cover-grand-total-banner">
            <div class="banner-lbl">TOTAL NILAI RENCANA ANGGARAN BIAYA (RAB) TERMASUK PPN:</div>
            <div class="banner-nominal">${formatRp(activeGrandTotal)}</div>
            <div class="banner-terbilang">(${activeTerbilang})</div>
          </div>

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
            Sehubungan dengan rencana pelaksanaan pekerjaan konstruksi <strong>${proj.name || "Nama Proyek Belum Ditentukan"}</strong> yang berlokasi di <strong>${proj.location || "Lokasi Proyek Belum Ditentukan"}</strong>, bersama ini kami dari <strong>${companyDisplay}</strong> menyampaikan Dokumen Proposal Rencana Anggaran Biaya (RAB) dan Rencana Kerja Teknis Pelaksanaan Proyek secara komprehensif, terinci, dan dapat dipertanggungjawabkan secara teknis maupun yuridis.
          </p>
          <p style="margin-bottom: 10px; text-align: justify;">
            Penyusunan anggaran biaya ini berpedoman penuh pada regulasi baku <strong>Surat Edaran Direktur Jenderal Bina Konstruksi Kementerian Pekerjaan Umum Nomor 47/SE/Dk/2026</strong> serta <strong>Peraturan Menteri PUPR Nomor 8 Tahun 2023</strong>, dengan analisis harga satuan berbasis acuan daerah <strong>${proj.regionName || proj.location || 'Standar Nasional PUPR'}</strong>, spesifikasi material berstandar SNI, metode kerja termutakhir, serta pengendalian mutu bertingkat demi menjamin terwujudnya bangunan yang kokoh, tepat waktu, dan berdaya guna optimal.
          </p>
        </div>

        <div class="executive-summary-grid mb-3" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          <div style="border: 1px solid #e2e8f0; background-color: #f8fafc; border-radius: 6px; padding: 10px 12px; text-align: center;">
            <div style="font-size: 7.5pt; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL NILAI INVESTASI (RAB)</div>
            <div style="font-size: 12.5pt; font-weight: 900; color: #0f172a; margin: 4px 0; white-space: nowrap;">${formatRp(activeGrandTotal)}</div>
            <div style="font-size: 7.5pt; color: #64748b; font-weight: 500;">${isPpnIncluded ? `Termasuk PPN ${activePpnRate}% &amp; Overhead ${activeOverheadRate}%` : 'Biaya Bersih Konstruksi (Tanpa PPN)'}</div>
          </div>

          <div style="border: 1px solid #e2e8f0; background-color: #f8fafc; border-radius: 6px; padding: 10px 12px; text-align: center;">
            <div style="font-size: 7.5pt; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">WAKTU PELAKSANAAN</div>
            <div style="font-size: 12.5pt; font-weight: 900; color: #0f172a; margin: 4px 0; white-space: nowrap;">${proj.durationDays || 180} Hari Kalender</div>
            <div style="font-size: 7.5pt; color: #64748b; font-weight: 500;">Target: ${proj.startDate || '01 Apr 2026'} s.d. ${proj.finishDate || '30 Sep 2026'}</div>
          </div>

          <div style="border: 1px solid #e2e8f0; background-color: #f8fafc; border-radius: 6px; padding: 10px 12px; text-align: center;">
            <div style="font-size: 7.5pt; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">LINGKUP &amp; JAMINAN MUTU</div>
            <div style="font-size: 12.5pt; font-weight: 900; color: #0f172a; margin: 4px 0; white-space: nowrap;">${(proj.divisions || []).length} Divisi Utama</div>
            <div style="font-size: 7.5pt; color: #64748b; font-weight: 500;">${(proj.divisions || []).reduce((acc, d) => acc + (d.items || []).length, 0)} Item Pekerjaan &bull; Garansi 90 Hari</div>
          </div>
        </div>

        <div class="prose-text mb-3" style="font-size: 8.5pt; line-height: 1.45; color: #334155; text-align: justify;">
          <p>
            Besar harapan kami agar proposal teknis dan penawaran anggaran ini dapat memenuhi sasaran strategis Bapak/Ibu. Kami berkomitmen menerapkan standar keselamatan kerja konstruksi (SMKK/K3) tanpa kompromi, efisiensi sumber daya tanpa mengurangi kualitas, serta memberikan layanan purna jual pemeliharaan selama 90 hari kalender pasca Serah Terima Pertama (PHO) secara penuh.
          </p>
        </div>

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

        ${renderRunningFooter(2)}
      </div>
    `;

    // =========================================================================
    // 3. Daftar Isi Dokumen Proposal (Halaman 3)
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
          <div class="toc-item"><span class="toc-title">BAB I. DATA UMUM PROYEK &amp; RUANG LINGKUP PEKERJAAN</span><span class="toc-dots"></span><span class="toc-page">Halaman 4</span></div>
          <div class="toc-item"><span class="toc-title">BAB II. REKAPITULASI RENCANA ANGGARAN BIAYA (RAB)</span><span class="toc-dots"></span><span class="toc-page">Halaman 5</span></div>
          <div class="toc-item"><span class="toc-title">BAB III. RINCIAN ANGGARAN BIAYA PEKERJAAN</span><span class="toc-dots"></span><span class="toc-page">Halaman 6${bab3SheetCount > 1 ? ` - ${5 + bab3SheetCount}` : ''}</span></div>
          <div class="toc-item"><span class="toc-title">BAB IV. JADWAL PELAKSANAAN &amp; DIAGRAM KURVA S</span><span class="toc-dots"></span><span class="toc-page">Halaman ${bab4PageNum}</span></div>
          <div class="toc-item"><span class="toc-title">BAB V. REKAPITULASI KEBUTUHAN SUMBER DAYA (BAHAN &amp; TENAGA)</span><span class="toc-dots"></span><span class="toc-page">Halaman ${bab5PageNum}</span></div>
          <div class="toc-item"><span class="toc-title">BAB VI. SKEMA PEMBAYARAN TERMIN &amp; GARANSI MUTU</span><span class="toc-dots"></span><span class="toc-page">Halaman ${bab6PageNum}</span></div>
          <div class="toc-item"><span class="toc-title">BAB VII. LEMBAR PENGESAHAN TIGA PIHAK</span><span class="toc-dots"></span><span class="toc-page">Halaman ${bab7PageNum}</span></div>
        </div>

        <div style="margin-top: 35px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; font-size: 8pt; color: #475569; line-height: 1.6;">
          <strong>Keterangan Sistematika Dokumen:</strong><br>
          Dokumen proposal ini disusun secara sistematis dan terstruktur dengan memisahkan setiap pokok bahasan (Bab) pada lembar halaman tersendiri guna memudahkan penelaahan teknis, audit anggaran, serta pengarsipan administratif formal. Seluruh perhitungan didukung oleh analisis koefisien bahan, upah kerja, dan alat yang dapat diverifikasi secara transparan.
        </div>

        ${renderRunningFooter(3)}
      </div>
    `;

    // =========================================================================
    // 4. Bab I: Data Umum Proyek & Ruang Lingkup Pekerjaan (Halaman 4)
    // =========================================================================
    const bab1Html = `
      <div class="proposal-page content-page" id="proposal-p4">
        <div class="page-heading">
          <h2>BAB I. DATA UMUM PROYEK &amp; RUANG LINGKUP PEKERJAAN</h2>
          <div class="heading-line"></div>
        </div>

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
              <td>${proj.dataSource || 'Surat Edaran Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026 &amp; Permen PUPR No. 8/2023'}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Wilayah Remunerasi &amp; Indeks</td>
              <td>${proj.regionName || 'Jawa Barat - Bandung Raya & Priangan'} (Indeks Remunerasi Standar PUPR)</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Luas Rencana Pembangunan</td>
              <td><strong>${formatNum(proj.buildingArea || 180, 0)} m²</strong> ${proj.projectType === 'rehab' ? '<span style="color:#f59e0b;font-size:7.5pt;">(Area Bangunan Terrehab)</span>' : '<span style="color:#64748b;font-size:7.5pt;">(Luas Bangunan Baru)</span>'}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Luas Tanah / Kavling</td>
              <td>${formatNum(proj.landArea || 200, 0)} m²</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Estimasi Biaya per m² (HSP m²)</td>
              <td><strong style="color:#0f172a;">${(rabCalc && rabCalc.costPerM2 && rabCalc.costPerM2 > 0) ? formatRp(Math.round(rabCalc.costPerM2)) : (activeGrandTotal > 0 ? formatRp(Math.round(activeGrandTotal / (proj.buildingArea || 180))) : 'Rp 0')}</strong> / m² <span style="color:#64748b;font-size:7.5pt;">(Total Anggaran ÷ Luas Bangunan)</span></td>
            </tr>
          </tbody>
        </table>

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

        <div class="subheading mb-2" style="font-size: 9.5pt; font-weight: 700; color: #0f172a;">
          <strong>C. Landasan Hukum &amp; Pengendalian Mutu Konstruksi:</strong>
        </div>
        <div style="font-size: 8pt; color: #334155; line-height: 1.5; text-align: justify; border-left: 2.5px solid #0f172a; padding: 4px 0 4px 10px; margin-top: 4px;">
          Pelaksanaan seluruh tahapan pekerjaan mengacu pada ketentuan teknis baku Spesifikasi Bina Konstruksi 2026, Standar Nasional Indonesia (SNI Beton 2847:2019, Baja Tulangan SNI 2052:2017, Mortar Pasangan SNI 03-6882-2002), serta Sistem Manajemen Keselamatan Konstruksi (SMKK) berbasis Permen PUPR No. 10/2021 untuk menjamin zero fatal accident, kesesuaian dimensi fisik lapangan, dan perlindungan lingkungan kerja.
        </div>

        ${renderRunningFooter(4)}
      </div>
    `;

    // =========================================================================
    // 5. Bab II: Rekapitulasi Rencana Anggaran Biaya (Halaman 5)
    // =========================================================================
    let recapRows = "";
    const divisionSummaries = (rabCalc && rabCalc.divisionSummaries) ? rabCalc.divisionSummaries : (proj.divisions || []).map(d => ({
      code: d.code,
      name: d.name,
      subtotal: d.subtotal || 0,
      weightPercent: activeRealCost > 0 ? ((d.subtotal || 0) / activeRealCost) * 100 : 0
    }));

    divisionSummaries.forEach((div, idx) => {
      const weightVal = (div.weightPercent !== undefined && !isNaN(div.weightPercent))
        ? div.weightPercent
        : (activeRealCost > 0 ? ((div.subtotal || 0) / activeRealCost) * 100 : 0);

      recapRows += `
        <tr>
          <td style="text-align: center; width: 5%;">${idx + 1}</td>
          <td style="text-align: center; font-weight: 700; width: 10%;">${div.code ? `DIVISI ${div.code}` : `DIVISI ${idx + 1}`}</td>
          <td style="width: 45%;"><strong>${div.name}</strong></td>
          <td style="text-align: right; font-weight: 700; width: 25%; white-space: nowrap;">${formatRp(div.subtotal)}</td>
          <td style="text-align: center; width: 15%;">${formatNum(weightVal, 2)}%</td>
        </tr>
      `;
    });

    const bab2Html = `
      <div class="proposal-page content-page" id="proposal-p5">
        <div class="page-heading">
          <h2>BAB II. REKAPITULASI RENCANA ANGGARAN BIAYA</h2>
          <div class="heading-line"></div>
        </div>

        <div class="prose-text mb-3" style="font-size: 8.5pt; color: #334155; line-height: 1.5; text-align: justify;">
          Rekapitulasi Rencana Anggaran Biaya berikut menyajikan ikhtisar akumulasi biaya langsung per divisi pekerjaan, proporsi bobot finansial terhadap total konstruksi, alokasi Pajak Pertambahan Nilai (PPN), serta total nilai penawaran akhir yang mengikat secara kontraktual:
        </div>

        <table class="table table-bordered print-compact-table mb-3" style="width: 100%; border-collapse: collapse;">
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

        <div class="terbilang-box mb-3" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; font-size: 8.5pt;">
          <strong>Terbilang:</strong> <em style="color: #1e40af; font-weight: 600;">"${activeTerbilang}"</em>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; font-size: 8pt; color: #475569; line-height: 1.5;">
          <strong>Catatan Finansial &amp; Transparansi Beban:</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li>Perhitungan harga satuan pekerjaan (HSP) menerapkan arsitektur <em>Zero Double-Counting</em>, di mana seluruh biaya overhead dan keuntungan kontraktor telah diintegrasikan secara presisi tanpa pembebanan berulang.</li>
            <li>Nilai penawaran bersifat tetap (<em>Fixed Lump Sum / Unit Price</em>) untuk lingkup pekerjaan yang tertera, kecuali terjadi perubahan spesifikasi (Addendum/CCO) yang disetujui tertulis oleh Pemberi Tugas.</li>
          </ul>
        </div>

        ${renderRunningFooter(5)}
      </div>
    `;

    // =========================================================================
    // 6. Bab III: Rincian Anggaran Biaya Pekerjaan (Halaman 6 s.d. ...)
    // HANYA MEMILIKI 1 AWALAN BERSIH (TANPA PENGULANGAN "BAGIAN 1", "BAGIAN 2")
    // =========================================================================
    function buildDivisionsHtml(divEntries) {
      let dHtml = "";
      divEntries.forEach((entry) => {
        const div = entry.div;
        const actualIdx = entry.originalIdx;
        let itemsHtml = "";
        (div.items || []).forEach((itm, idx) => {
          itemsHtml += `
            <tr>
              <td style="text-align: center; width: 4%; padding: 2px 2px;">${idx + 1}</td>
              <td style="width: 38%; padding: 2px 4px;">
                <strong>${itm.name}</strong>
                ${itm.notes ? `<div style="font-size: 6.8pt; color: #64748b; margin-top: 1px;">${itm.notes}</div>` : ''}
              </td>
              <td style="text-align: center; width: 11%; padding: 2px 2px;"><span class="badge badge-light" style="font-size: 6.8pt;">${itm.code || itm.ahspCode || "-"}</span></td>
              <td style="text-align: right; font-weight: 700; width: 8%; padding: 2px 3px;">${formatNum(itm.volume, 2)}</td>
              <td style="text-align: center; width: 6%; padding: 2px 2px;">${itm.unit || "-"}</td>
              <td style="text-align: right; width: 16%; padding: 2px 3px; white-space: nowrap;">${formatRp(itm.price)}</td>
              <td style="text-align: right; font-weight: 700; width: 17%; padding: 2px 4px; white-space: nowrap;">${formatRp(itm.total)}</td>
            </tr>
          `;
        });

        dHtml += `
          <div class="division-block mb-1" style="page-break-inside: avoid; break-inside: avoid;">
            <div class="division-title-bar" style="background-color: #f1f5f9; border-left: 3px solid #0f172a; padding: 3px 6px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span style="font-size: 7.5pt; font-weight: 800; color: #0f172a;">${div.code ? `DIVISI ${div.code}. ` : `DIVISI ${actualIdx + 1}. `}${(div.name || "").toUpperCase()}</span>
              <span style="font-size: 7.5pt; font-weight: 800; color: #1e40af; white-space: nowrap;">Subtotal: ${formatRp(div.subtotal)}</span>
            </div>
            <table class="table table-bordered print-compact-table" style="width: 100%; border-collapse: collapse; font-size: 7pt; margin-bottom: 4px;">
              <thead>
                <tr class="table-header-row" style="background-color: #f8fafc;">
                  <th style="width: 4%; text-align: center; padding: 2px 2px;">No</th>
                  <th style="width: 38%; text-align: left; padding: 2px 4px;">Uraian Pekerjaan</th>
                  <th style="width: 11%; text-align: center; padding: 2px 2px;">Kode AHSP</th>
                  <th style="width: 8%; text-align: right; padding: 2px 3px;">Volume</th>
                  <th style="width: 6%; text-align: center; padding: 2px 2px;">Satuan</th>
                  <th style="width: 16%; text-align: right; padding: 2px 3px;">Harga Satuan (Rp)</th>
                  <th style="width: 17%; text-align: right; padding: 2px 4px;">Jumlah Harga (Rp)</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml || '<tr><td colspan="7" class="text-center text-muted p-2">Belum ada rincian pekerjaan pada divisi ini.</td></tr>'}
              </tbody>
            </table>
          </div>
        `;
      });
      return dHtml;
    }

    const bab3PagesHtml = bab3Partitions.map((p, pIdx) => {
      const pageNum = 6 + pIdx;
      const headerTitle = pIdx === 0 
        ? "BAB III. RINCIAN ANGGARAN BIAYA PEKERJAAN" 
        : "BAB III. RINCIAN ANGGARAN BIAYA PEKERJAAN (Lanjutan)";
      return `
        <div class="proposal-page content-page" id="proposal-p${pageNum}">
          <div class="page-heading">
            <h2>${headerTitle}</h2>
            <div class="heading-line"></div>
          </div>
          ${buildDivisionsHtml(p.divs) || '<div class="text-muted p-3 text-center">Belum ada rincian divisi pekerjaan.</div>'}

          ${renderRunningFooter(pageNum)}
        </div>
      `;
    }).join('\n');

    // =========================================================================
    // 7. Bab IV: Jadwal Pelaksanaan & Diagram Kurva S (Halaman Mandiri)
    // Teks Diberi Bobot Narasi Formal & Komprehensif
    // =========================================================================
    const bab4Html = `
      <div class="proposal-page content-page" id="proposal-p${bab4PageNum}">
        <div class="page-heading">
          <h2>BAB IV. JADWAL PELAKSANAAN &amp; DIAGRAM KURVA S</h2>
          <div class="heading-line"></div>
        </div>

        <div class="prose-text mb-3" style="font-size: 8.5pt; color: #334155; line-height: 1.5; text-align: justify;">
          <p style="margin-bottom: 6px;">
            Jadwal pelaksanaan pekerjaan konstruksi disusun berdasarkan metode lintasan kritis (<em>Critical Path Method / CPM</em>) yang mengoptimalkan urutan logis ketergantungan antar-aktivitas (preseden pekerjaan pondasi, struktur utama, dinding, hingga pekerjaan penyelesaian akhir/finishing). Alokasi durasi keseluruhan ditetapkan selama <strong>${proj.durationDays || 180} hari kalender</strong>, terhitung sejak diterbitkannya Surat Perintah Mulai Kerja (SPMK) periode <strong>${proj.startDate || '01 Apr 2026'} s.d. ${proj.finishDate || '30 Sep 2026'}</strong>.
          </p>
          <p style="margin-bottom: 0;">
            Diagram Kurva S di bawah ini mencerminkan distribusi bobot kumulatif rencana fisik tiap periode mingguan, berfungsi sebagai instrumen pengendalian batas deviasi (<em>variance tracking</em>) agar progres fisik senantiasa berada dalam ambang toleransi deviasi aman (&plusmn;5%):
          </p>
        </div>

        <div id="proposal-scurve-embed" class="svg-print-container mb-3" style="width: 100%; min-height: 290px; text-align: center;">
          <!-- Diisi via renderSvgChart langsung ke elemen proposal -->
        </div>

        <div class="prose-text" style="font-size: 8pt; color: #475569; line-height: 1.5; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px;">
          <strong>Keterangan Pengendalian Jadwal &amp; Mitigasi Risiko:</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><strong>Garis Biru (Rencana Target Kumulatif):</strong> Target pencapaian bobot prestasi fisik yang wajib dicapai oleh tim teknis lapangan pada setiap akhir minggu berjalan.</li>
            <li><strong>Garis Hijau (Realisasi Aktual Lapangan):</strong> Progres fisik terverifikasi yang diperbarui secara berkala berdasarkan lembar opname volume harian.</li>
            <li><strong>Manajemen Kontingensi:</strong> Apabila terjadi keterlambatan fisik di atas 5% (deviasi negatif), Kontraktor Pelaksana wajib segera menggelar rapat pembuktian keterlambatan (<em>Show Cause Meeting / SCM</em>) dan menerapkan langkah percepatan (<em>crashing schedule</em> / penambahan jam kerja lembur).</li>
          </ul>
        </div>

        ${renderRunningFooter(bab4PageNum)}
      </div>
    `;

    // =========================================================================
    // 8. Bab V: Rekapitulasi Kebutuhan Sumber Daya Proyek (Halaman Mandiri)
    // Teks Diberi Bobot Narasi Formal & Komprehensif
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
      <div class="proposal-page content-page" id="proposal-p${bab5PageNum}">
        <div class="page-heading">
          <h2>BAB V. REKAPITULASI KEBUTUHAN SUMBER DAYA PROYEK</h2>
          <div class="heading-line"></div>
        </div>

        <div class="prose-text mb-2" style="font-size: 8.5pt; color: #334155; line-height: 1.5; text-align: justify;">
          Pengelolaan sumber daya konstruksi dirancang dengan pendekatan rantai pasok terintegrasi (<em>Supply Chain Management</em>) untuk memastikan ketersediaan material berstandar SNI tepat mutu, kontinuitas tenaga kerja terampil tersertifikasi, serta kepatuhan penuh terhadap ketentuan upah minimum regional:
        </div>

        <div class="card p-2 mb-2 bg-light" style="font-size: 8pt; border: 1px solid #e2e8f0; border-radius: 4px;">
          <strong>Proporsi Distribusi Sumber Daya Konstruksi:</strong> Bahan Material: <strong>${resources.materialsPct || '0.00'}%</strong> &bull; Upah Tenaga Kerja: <strong>${resources.laborPct || '0.00'}%</strong> &bull; Peralatan: <strong>${resources.equipmentPct || '0.00'}%</strong>
        </div>

        <div class="subheading mb-1" style="font-size: 8.5pt; font-weight: 700; color: #0f172a;">
          <strong>A. Estimasi Kebutuhan Bahan Material Utama Terbesar (Top Material):</strong>
        </div>
        <table class="table table-bordered print-compact-table mb-2" style="width: 100%; border-collapse: collapse; font-size: 7.2pt;">
          <thead>
            <tr class="table-header-row" style="background-color: #f1f5f9;">
              <th style="width: 5%; text-align: center; padding: 2px 2px;">No</th>
              <th style="width: 43%; text-align: left; padding: 2px 6px;">Nama Bahan Material</th>
              <th style="width: 10%; text-align: center; padding: 2px 2px;">Satuan</th>
              <th style="width: 12%; text-align: right; padding: 2px 4px;">Volume</th>
              <th style="width: 15%; text-align: right; padding: 2px 4px;">Harga Satuan</th>
              <th style="width: 15%; text-align: right; padding: 2px 5px;">Subtotal Biaya</th>
            </tr>
          </thead>
          <tbody>
            ${matRows || '<tr><td colspan="6" class="text-center text-muted p-2">Belum ada kebutuhan bahan.</td></tr>'}
          </tbody>
        </table>

        <div class="subheading mb-1" style="font-size: 8.5pt; font-weight: 700; color: #0f172a;">
          <strong>B. Alokasi Kebutuhan Tenaga Kerja Lapangan (Orang-Hari / OH):</strong>
        </div>
        <table class="table table-bordered print-compact-table mb-2" style="width: 100%; border-collapse: collapse; font-size: 7.2pt;">
          <thead>
            <tr class="table-header-row" style="background-color: #f1f5f9;">
              <th style="width: 5%; text-align: center; padding: 2px 2px;">No</th>
              <th style="width: 43%; text-align: left; padding: 2px 6px;">Klasifikasi Tenaga Kerja</th>
              <th style="width: 10%; text-align: center; padding: 2px 2px;">Satuan</th>
              <th style="width: 12%; text-align: right; padding: 2px 4px;">Jumlah OH</th>
              <th style="width: 15%; text-align: right; padding: 2px 4px;">Upah Harian</th>
              <th style="width: 15%; text-align: right; padding: 2px 5px;">Subtotal Upah</th>
            </tr>
          </thead>
          <tbody>
            ${labRows || '<tr><td colspan="6" class="text-center text-muted p-2">Belum ada data upah tenaga kerja.</td></tr>'}
          </tbody>
        </table>

        <div style="font-size: 7.5pt; color: #64748b; line-height: 1.4; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 10px;">
          <em>Seluruh tenaga kerja dibekali perlengkapan Alat Pelindung Diri (APD) berstandar K3 Konstruksi dan terdaftar dalam jaminan perlindungan BPJS Ketenagakerjaan Jasa Konstruksi selama periode operasional berlangsung.</em>
        </div>

        ${renderRunningFooter(bab5PageNum)}
      </div>
    `;

    // =========================================================================
    // 9. Bab VI: Skema Pembayaran Termin & Garansi Mutu (HALAMAN SENDIRI)
    // Dipisahkan Secara Mutlak dari Bab VII Lembar Pengesahan!
    // Diberi Narasi Kontraktual & Hukum yang Matang & Berbobot
    // =========================================================================
    const term1Val = Math.round(activeGrandTotal * 0.20);
    const term2Val = Math.round(activeGrandTotal * 0.30);
    const term3Val = Math.round(activeGrandTotal * 0.30);
    const term4Val = Math.round(activeGrandTotal * 0.15);
    const retensiVal = activeGrandTotal - (term1Val + term2Val + term3Val + term4Val);

    const bab6Html = `
      <div class="proposal-page content-page" id="proposal-p${bab6PageNum}">
        <div class="page-heading">
          <h2>BAB VI. SKEMA PEMBAYARAN TERMIN &amp; GARANSI MUTU</h2>
          <div class="heading-line"></div>
        </div>

        <div class="prose-text mb-3" style="font-size: 8.5pt; color: #334155; line-height: 1.5; text-align: justify;">
          <p style="margin-bottom: 6px;">
            Sistem pembayaran nilai kontrak disepakati secara bertahap (termin progres fisik) berdasarkan prestasi capaian lapangan riil yang dibuktikan melalui <strong>Berita Acara Pemeriksaan Kemajuan Pekerjaan (BAPKP)</strong> dan disahkan secara tertulis dalam <strong>Berita Acara Pembayaran (BAP)</strong> oleh Konsultan Pengawas serta Pemberi Tugas:
          </p>
        </div>

        <table class="table table-bordered print-compact-table mb-3" style="font-size: 7.5pt; width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="width: 12%; text-align: center; vertical-align: middle; padding: 4px;">Tahap</th>
              <th style="width: 40%; text-align: left; vertical-align: middle; padding: 4px 6px;">Tahapan Prestasi Fisik &amp; Syarat Pencairan</th>
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
              <td>Prestasi Fisik 50% (Pekerjaan Pondasi, Kolom Struktur &amp; Cor Dak Selesai)</td>
              <td style="text-align: center;">50%</td>
              <td style="text-align: center; font-weight: 700;">30%</td>
              <td style="text-align: right; font-weight: 700; white-space: nowrap;">${formatRp(term2Val)}</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">Termin III</td>
              <td>Prestasi Fisik 80% (Pasangan Dinding, Rangka &amp; Penutup Atap, serta MEP)</td>
              <td style="text-align: center;">80%</td>
              <td style="text-align: center; font-weight: 700;">30%</td>
              <td style="text-align: right; font-weight: 700; white-space: nowrap;">${formatRp(term3Val)}</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">Termin IV</td>
              <td>Prestasi Fisik 100% (Pekerjaan Finishing Selesai &amp; Serah Terima Pertama / PHO)</td>
              <td style="text-align: center;">100%</td>
              <td style="text-align: center; font-weight: 700;">15%</td>
              <td style="text-align: right; font-weight: 700; white-space: nowrap;">${formatRp(term4Val)}</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">Retensi</td>
              <td>Jaminan Masa Pemeliharaan 90 Hari Kalender &amp; Serah Terima Akhir / FHO</td>
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

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; font-size: 8pt; color: #334155; line-height: 1.55; text-align: justify;">
          <strong style="color: #0f172a; font-size: 8.5pt;">Ketentuan Garansi Mutu &amp; Pemeliharaan Konstruksi:</strong>
          <ol style="margin: 6px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 4px;">
              <strong>Masa Pemeliharaan (Defects Liability Period):</strong> Kontraktor Pelaksana memberikan jaminan pemeliharaan penuh selama <strong>90 (sembilan puluh) hari kalender</strong> terhitung sejak tanggal penandatanganan Berita Acara Serah Terima Pertama (<em>Provisional Hand Over / PHO</em>).
            </li>
            <li style="margin-bottom: 4px;">
              <strong>Perbaikan Cacat Mutu:</strong> Segala bentuk ketidaksempurnaan hasil pekerjaan, kebocoran atap, retak rambut plesteran non-struktural, maupun kegagalan fungsi mekanikal/elektrikal yang timbul selama masa pemeliharaan menjadi tanggung jawab Kontraktor untuk diperbaiki atas beban biaya Kontraktor selambat-lambatnya 7 (tujuh) hari kerja sejak laporan tertulis diterima.
            </li>
            <li style="margin-bottom: 4px;">
              <strong>Pencairan Dana Retensi:</strong> Dana jaminan retensi sebesar 5% (lima persen) akan dibayarkan secara penuh kepada Kontraktor Pelaksana setelah Berita Acara Serah Terima Akhir (<em>Final Hand Over / FHO</em>) ditandatangani bersama tanpa catatan cacat mutu yang tertunda.
            </li>
            <li>
              <strong>Keadaan Kahar (Force Majeure):</strong> Hal-hal yang terjadi di luar kendali para pihak (bencana alam, huru-hara, kebijakan moneter nasional yang bersifat mendasar) akan diselesaikan secara musyawarah mufakat melalui addendum kontrak resmi.
            </li>
          </ol>
        </div>

        ${renderRunningFooter(bab6PageNum)}
      </div>
    `;

    // =========================================================================
    // 10. Bab VII: Lembar Pengesahan Tiga Pihak (HALAMAN SENDIRI)
    // Tampil Megah, Resmi, Berbobot Hukum Tinggi
    // =========================================================================
    const bab7Html = `
      <div class="proposal-page content-page" id="proposal-p${bab7PageNum}">
        <div class="page-heading">
          <h2>BAB VII. LEMBAR PENGESAHAN TIGA PIHAK</h2>
          <div class="heading-line"></div>
        </div>

        <div class="prose-text mb-3" style="font-size: 8.5pt; color: #334155; line-height: 1.6; text-align: justify;">
          <p style="margin-bottom: 8px;">
            Dokumen Proposal Rencana Anggaran Biaya (RAB), Spesifikasi Teknis, Jadwal Pelaksanaan (Kurva S), serta Skema Pembayaran Termin ini telah diperiksa, diverifikasi secara komprehensif, dan disetujui bersama oleh Para Pihak yang berwenang.
          </p>
          <p style="margin-bottom: 0;">
            Persetujuan ini mengikat secara hukum sebagai acuan dasar dalam penyusunan Surat Perjanjian Kontrak Kerja Pelaksanaan Konstruksi (Surat Perjanjian Pemborongan) sesuai amanat Undang-Undang Republik Indonesia Nomor 2 Tahun 2017 tentang Jasa Konstruksi serta pedoman teknis Kementerian Pekerjaan Umum dan Perumahan Rakyat Republik Indonesia.
          </p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; font-size: 8pt; color: #1e293b; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div>Status Dokumen: <strong>PENAWARAN TEKNIS &amp; ANGGARAN SAH</strong></div>
            <div>Ditetapkan di: <strong>${sig.docCity || proj.location || 'Indonesia'}</strong>, Tanggal: <strong>${docDateStr}</strong></div>
          </div>
        </div>

        <div class="subheading mb-3" style="font-size: 9pt; font-weight: 700; color: #0f172a; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">
          DEWAN PENGESAHAN &amp; PENANGGUNG JAWAB TEKNIS PROYEK
        </div>

        <!-- Kolom Tanda Tangan Tiga Pihak Bersih Minimalis & Sejajar 3 Kolom Horizontal -->
        <table class="signature-clean-table" style="width: 100% !important; border-collapse: collapse !important; border: none !important; background: transparent !important; margin-top: 15pt !important; page-break-inside: avoid !important; break-inside: avoid !important;">
          <tr style="border: none !important; background: transparent !important;">
            <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 10px !important; background: transparent !important;">
              <div style="font-weight: 800; font-size: 8.5pt; color: #1e293b; margin-bottom: 2px; text-transform: uppercase;">PEMBERI TUGAS / OWNER</div>
              <div style="font-size: 7.5pt; color: #64748b; min-height: 14px;">Menyetujui &amp; Menetapkan:</div>
              <div style="height: 60px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 7pt; color: #cbd5e1; border: 1px dashed #cbd5e1; padding: 3px 8px; border-radius: 4px;">Materai Rp 10.000</span>
              </div>
              <div style="font-weight: 700; font-size: 9pt; color: #0f172a; text-decoration: none !important; border-bottom: 1px solid #0f172a !important; padding-bottom: 2px;">( ${(sig.ownerName && !sig.ownerName.includes('...')) ? sig.ownerName : (proj.owner || 'Ir. Budi Santoso, M.T.')} )</div>
              <div style="font-size: 7.5pt; color: #334155; margin-top: 3px;">${sig.ownerTitle || 'Pemilik Bangunan / Pemberi Tugas'}</div>
              ${sig.ownerNip && sig.ownerNip !== '-' ? `<div style="font-size: 7pt; color: #64748b; margin-top: 1px;">NIP/NIK: ${sig.ownerNip}</div>` : ''}
            </td>
            <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 10px !important; background: transparent !important;">
              <div style="font-weight: 800; font-size: 8.5pt; color: #1e293b; margin-bottom: 2px; text-transform: uppercase;">KONSULTAN PERENCANA</div>
              <div style="font-size: 7.5pt; color: #64748b; min-height: 14px;">Direncanakan &amp; Dihitung:</div>
              <div style="height: 60px;"></div>
              <div style="font-weight: 700; font-size: 9pt; color: #0f172a; text-decoration: none !important; border-bottom: 1px solid #0f172a !important; padding-bottom: 2px;">( ${(sig.consultantName && !sig.consultantName.includes('...')) ? sig.consultantName : 'Ir. Bambang Hartono, S.T., M.T.'} )</div>
              <div style="font-size: 7.5pt; color: #334155; margin-top: 3px;">${sig.consultantTitle || 'Konsultan Perencana / Team Leader'}</div>
              <div style="font-size: 7pt; color: #64748b; margin-top: 1px;">${sig.consultantCompany || proj.consultant || 'PT. Sarana Buana Konsultan'}</div>
            </td>
            <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 10px !important; background: transparent !important;">
              <div style="font-weight: 800; font-size: 8.5pt; color: #1e293b; margin-bottom: 2px; text-transform: uppercase;">KONTRAKTOR PELAKSANA</div>
              <div style="font-size: 7.5pt; color: #64748b; min-height: 14px;">Diajukan &amp; Dilaksanakan:</div>
              <div style="height: 60px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 7pt; color: #cbd5e1; border: 1px dashed #cbd5e1; padding: 3px 8px; border-radius: 4px;">Cap &amp; Tanda Tangan</span>
              </div>
              <div style="font-weight: 700; font-size: 9pt; color: #0f172a; text-decoration: none !important; border-bottom: 1px solid #0f172a !important; padding-bottom: 2px;">( ${(sig.contractorName && !sig.contractorName.includes('...')) ? sig.contractorName : 'H. Ahmad Fauzi, S.T.'} )</div>
              <div style="font-size: 7.5pt; color: #334155; margin-top: 3px;">${sig.contractorTitle || 'Direktur Utama'}</div>
              <div style="font-size: 7pt; color: #64748b; margin-top: 1px;">${companyDisplay}</div>
            </td>
          </tr>
        </table>

        <div style="margin-top: 35px; border-top: 1px dashed #cbd5e1; padding-top: 10px; font-size: 7.5pt; color: #64748b; text-align: center;">
          <em>Dokumen penawaran ini merupakan satu kesatuan tak terpisahkan dari Kontrak Kerja Konstruksi dan dinyatakan sah setelah ditandatangani oleh Para Pihak di atas materai yang cukup.</em>
        </div>

        ${renderRunningFooter(bab7PageNum)}
      </div>
    `;

    return coverHtml + introHtml + tocHtml + bab1Html + bab2Html + bab3PagesHtml + bab4Html + bab5Html + bab6Html + bab7Html;
  }

  return {
    generateProposalHtml,
    generateFullProposalHtml: generateProposalHtml
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.ProposalGen;
}
