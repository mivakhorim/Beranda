/**
 * Proposal Generator Module (Proposal Rencana Proyek Lengkap A4)
 * Menghasilkan dokumen proposal resmi komprehensif:
 * - Cover A4 Elegan
 * - Kata Pengantar / Ringkasan Eksekutif
 * - Daftar Isi Dinamis
 * - Data Teknis & Lingkup Pekerjaan
 * - Rekapitulasi RAB
 * - Rincian Detail Biaya per Divisi
 * - Jadwal Pelaksanaan & Diagram Kurva S SVG
 * - Rekapitulasi Kebutuhan Sumber Daya (Bahan, Tenaga, Alat)
 * - Syarat Pembayaran & Ketentuan Kontrak
 * - Halaman Pengesahan Tiga Pihak
 */

window.ProposalGen = (function() {


  function generateProposalHtml() {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return "<div class='p-4 text-center text-muted'>Tidak ada data proyek aktif.</div>";

    const rabCalc = window.RabCalculator.calculateProjectRab(proj);
    const resources = window.ResourceUsage.calculateTotalResources(proj);
    const schedule = window.SCurveDiagram.getScheduleData();
    const wmOverlay = "";

    // 1. Cover Page
    const coverHtml = `
      <div class="proposal-page cover-page">
        <div class="cover-inner-border">
          <div class="cover-badge-top">DOKUMEN RESMI PENAWARAN & RENCANA KERJA</div>
          
          <div class="cover-title-section">
            <h1 class="cover-main-title">PROPOSAL RENCANA ANGGARAN BIAYA & TEKNIS PELAKSANAAN</h1>
            <div class="cover-project-name">${proj.name}</div>
            <div class="cover-project-location">${proj.location}</div>
          </div>

          <div class="cover-divider-accent"></div>

          <div class="cover-meta-grid">
            <div class="cover-meta-col">
              <span class="cover-meta-lbl">PEMBERI TUGAS / PEMILIK:</span>
              <span class="cover-meta-val">${proj.owner}</span>
            </div>
            <div class="cover-meta-col">
              <span class="cover-meta-lbl">KONTRAKTOR PELAKSANA:</span>
              <span class="cover-meta-val">${proj.contractor}</span>
            </div>
            <div class="cover-meta-col">
              <span class="cover-meta-lbl">KONSULTAN PERENCANA:</span>
              <span class="cover-meta-val">${proj.consultant || '-'}</span>
            </div>
            <div class="cover-meta-col">
              <span class="cover-meta-lbl">NOMOR DOKUMEN:</span>
              <span class="cover-meta-val">${proj.docNumber || 'RAB/2026/001'}</span>
            </div>
          </div>

          <div class="cover-footer-section">
            <div class="cover-total-box">
              <div class="total-caption">TOTAL NILAI RENCANA ANGGARAN BIAYA:</div>
              <div class="total-nominal">${window.CurrencyUtil.formatRupiah(rabCalc.grandTotal, false, true)}</div>
              <div class="total-terbilang">(${rabCalc.terbilangStr})</div>
            </div>
            <div class="cover-date-year">Tahun Anggaran 2026 / 2027</div>
          </div>
        </div>
        ${wmOverlay}
      </div>
    `;

    // 2. Kata Pengantar & Ringkasan Eksekutif (Halaman 2 PDF)
    const sig = proj.signatories || {};
    const companyDisplay = (sig.contractorCompany || proj.contractor || '').trim();
    const footerLeftText = companyDisplay 
      ? `${companyDisplay} — Dokumen Proposal Teknis & Anggaran Biaya` 
      : `${proj.name || 'Proposal Rencana Anggaran Biaya'} — Dokumen Proposal Teknis & Anggaran Biaya`;

    const introHtml = `
      <div class="proposal-page content-page" id="proposal-p2">
        <div class="page-heading">
          <h2>KATA PENGANTAR & RINGKASAN EKSEKUTIF</h2>
          <div class="heading-line"></div>
        </div>

        <!-- Identitas Surat Penawaran Resmi -->
        <div class="letter-meta-box mb-3" style="display: flex; justify-content: space-between; font-size: 8.5pt; color: #334155; border-bottom: 1.5pt solid #cbd5e1; padding-bottom: 8px;">
          <div>
            <div><strong>Nomor:</strong> ${proj.docNumber || '001/PROP-RAB/2026'}</div>
            <div><strong>Lampiran:</strong> 1 (Satu) Berkas Proposal Teknis & Rencana Anggaran Biaya</div>
            <div><strong>Perihal:</strong> Pengajuan Penawaran Biaya Konstruksi & Rencana Kerja</div>
          </div>
          <div style="text-align: right;">
            <div><strong>Kota Penetapan:</strong> ${sig.docCity || proj.location || 'Indonesia'}</div>
            <div><strong>Tanggal Dokumen:</strong> ${(window.DateUtil && window.DateUtil.formatTanggalIndo) ? window.DateUtil.formatTanggalIndo(sig.docDate || proj.startDate || '2026-04-01') : (sig.docDate || proj.startDate || '2026-04-01')}</div>
          </div>
        </div>

        <div class="prose-text mb-3" style="font-size: 9pt; line-height: 1.5; color: #1e293b;">
          <p style="margin-bottom: 4px;">Kepada Yth.<br><strong>${proj.owner || sig.ownerName || 'Pemberi Tugas'}</strong><br>${sig.ownerTitle || 'Pemilik Proyek / Pemberi Tugas'}<br>Di Tempat</p>
          <p style="margin-top: 8px; margin-bottom: 8px;">Dengan hormat,</p>
          <p style="margin-bottom: 8px; text-align: justify;">
            Sehubungan dengan rencana pelaksanaan pekerjaan konstruksi <strong>${proj.name}</strong> yang berlokasi di <strong>${proj.location}</strong>, bersama ini kami dari <strong>${companyDisplay || 'Tim Pelaksana Konstruksi'}</strong> menyampaikan Dokumen Proposal Rencana Anggaran Biaya (RAB) dan Rencana Kerja Teknis Pelaksanaan Proyek secara komprehensif.
          </p>
          <p style="margin-bottom: 12px; text-align: justify;">
            Penyusunan anggaran ini berpedoman penuh pada standar resmi <strong>Surat Edaran Direktur Jenderal Bina Konstruksi Kementerian Pekerjaan Umum Nomor 47/SE/Dk/2026</strong>, dengan analisis harga bahan dan upah berbasis acuan daerah <strong>${proj.regionName || proj.location || 'Standar Daerah'}</strong>, mutu material berstandar SNI, serta metode kerja terstruktur demi menjamin kualitas, ketepatan waktu, dan efisiensi biaya.
          </p>
        </div>

        <!-- Kartu Ringkasan Eksekutif Elegan Berbingkai (3 Kolom Berwarna) -->
        <div class="executive-summary-grid mb-4" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          <div style="border: 1.5px solid #2563eb; background-color: #eff6ff; border-radius: 6px; padding: 10px 12px; text-align: center;">
            <div style="font-size: 8pt; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL NILAI INVESTASI (RAB)</div>
            <div style="font-size: 13pt; font-weight: 900; color: #1e3a8a; margin: 4px 0;">${window.CurrencyUtil.formatRupiah(rabCalc.grandTotal, false, true)}</div>
            <div style="font-size: 7.5pt; color: #3b82f6; font-weight: 600;">${proj.includePpn !== false ? `Termasuk PPN ${proj.ppnRate || 11}% & Overhead ${proj.overheadRate || 15}%` : 'Biaya Bersih (Tanpa PPN)'}</div>
          </div>

          <div style="border: 1.5px solid #059669; background-color: #ecfdf5; border-radius: 6px; padding: 10px 12px; text-align: center;">
            <div style="font-size: 8pt; font-weight: 700; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px;">WAKTU PELAKSANAAN</div>
            <div style="font-size: 13pt; font-weight: 900; color: #047857; margin: 4px 0;">${proj.durationDays || 182} Hari Kalender</div>
            <div style="font-size: 7.5pt; color: #059669; font-weight: 600;">Periode: ${proj.startDate || '2026-04-01'} s.d. ${proj.finishDate || '2026-09-30'}</div>
          </div>

          <div style="border: 1.5px solid #d97706; background-color: #fffbeb; border-radius: 6px; padding: 10px 12px; text-align: center;">
            <div style="font-size: 8pt; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">LINGKUP & MUTU PEKERJAAN</div>
            <div style="font-size: 13pt; font-weight: 900; color: #b45309; margin: 4px 0;">${(proj.divisions || []).length} Divisi Utama</div>
            <div style="font-size: 7.5pt; color: #d97706; font-weight: 600;">${(proj.divisions || []).reduce((acc, d) => acc + (d.items || []).length, 0)} Item Pekerjaan & Garansi 90 Hari</div>
          </div>
        </div>

        <div class="prose-text mb-4" style="font-size: 8.5pt; line-height: 1.45; color: #334155; text-align: justify;">
          <p>
            Besar harapan kami agar proposal teknis dan penawaran anggaran ini dapat memenuhi ekspektasi Bapak/Ibu. Kami berkomitmen memberikan garansi masa pemeliharaan selama 90 hari kalender pasca Serah Terima Pertama (PHO) serta pengawasan mutu bertingkat demi terwujudnya bangunan yang kokoh, estetis, dan amanah.
          </p>
        </div>

        <!-- Blok Tanda Tangan Hormat Kami -->
        <div style="display: flex; justify-content: flex-end; margin-top: 15px;">
          <div style="width: 220px; text-align: center;">
            <div style="font-size: 8.5pt; color: #334155;">Hormat kami,</div>
            <div style="font-size: 9pt; font-weight: 800; color: #0f172a; margin-top: 2px;">${companyDisplay}</div>
            <div style="height: 48px;"></div>
            <div style="font-size: 9pt; font-weight: 800; color: #0f172a; border-bottom: 1px solid #0f172a; padding-bottom: 2px;">
              ${sig.contractorName || 'Penanggung Jawab Proyek'}
            </div>
            <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">
              ${sig.contractorTitle || 'Direktur / Penanggung Jawab Teknis'}
            </div>
          </div>
        </div>

        <!-- Running Footer -->
        <div class="print-footer-block" style="margin-top: auto; border-top: 0.75pt solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman 2 dari 9</strong></div>
        </div>
        ${wmOverlay}
      </div>
    `;

    // 3. Daftar Isi Dinamis (Sesuai Nomor Halaman PDF Nyata)
    const tocHtml = `
      <div class="proposal-page content-page" id="proposal-p3">
        <div class="page-heading">
          <h2>DAFTAR ISI DOKUMEN PROPOSAL</h2>
          <div class="heading-line"></div>
        </div>

        <div class="toc-list" style="margin-top: 25px;">
          <div class="toc-item"><span class="toc-title">KATA PENGANTAR & RINGKASAN EKSEKUTIF</span><span class="toc-dots"></span><span class="toc-page">Halaman 2</span></div>
          <div class="toc-item"><span class="toc-title">DAFTAR ISI DOKUMEN PROPOSAL</span><span class="toc-dots"></span><span class="toc-page">Halaman 3</span></div>
          <div class="toc-item"><span class="toc-title">BAB I. DATA UMUM & RUANG LINGKUP PEKERJAAN</span><span class="toc-dots"></span><span class="toc-page">Halaman 4</span></div>
          <div class="toc-item"><span class="toc-title">BAB II. REKAPITULASI RENCANA ANGGARAN BIAYA (RAB)</span><span class="toc-dots"></span><span class="toc-page">Halaman 5</span></div>
          <div class="toc-item"><span class="toc-title">BAB III. RINCIAN ANGGARAN BIAYA PER DIVISI PEKERJAAN</span><span class="toc-dots"></span><span class="toc-page">Halaman 6</span></div>
          <div class="toc-item"><span class="toc-title">BAB IV. JADWAL PELAKSANAAN & KURVA S</span><span class="toc-dots"></span><span class="toc-page">Halaman 7</span></div>
          <div class="toc-item"><span class="toc-title">BAB V. REKAPITULASI KEBUTUHAN SUMBER DAYA MATERIAL & TENAGA</span><span class="toc-dots"></span><span class="toc-page">Halaman 8</span></div>
          <div class="toc-item"><span class="toc-title">BAB VI & VII. KETENTUAN KONTRAK & LEMBAR PENGESAHAN</span><span class="toc-dots"></span><span class="toc-page">Halaman 9</span></div>
        </div>

        <!-- Running Footer Halaman 3 -->
        <div class="print-footer-block" style="margin-top: auto; border-top: 0.75pt solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman 3 dari 9</strong></div>
        </div>
        ${wmOverlay}
      </div>
    `;

    // 4. Bab I: Data Umum Proyek & Lingkup Terstruktur (Halaman 4 PDF)
    const bab1Html = `
      <div class="proposal-page content-page" id="proposal-p4">
        <div class="page-heading">
          <h2>BAB I. DATA UMUM & RUANG LINGKUP PEKERJAAN</h2>
          <div class="heading-line"></div>
        </div>

        <!-- A. Data Umum Proyek -->
        <div class="subheading mb-2" style="font-size: 9.5pt; font-weight: 700; color: #0f172a;">
          <strong>A. Data Umum & Identitas Proyek:</strong>
        </div>
        <table class="table table-bordered print-compact-table mb-3" style="font-size: 8pt;">
          <tbody>
            <tr>
              <td style="width: 28%; font-weight: 700; background-color: #f8fafc;">Nama Pekerjaan</td>
              <td style="width: 72%; font-weight: 700; color: #0f172a;">${proj.name}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Lokasi Pekerjaan</td>
              <td>${proj.location}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Pemberi Tugas / Pemilik</td>
              <td><strong>${proj.owner || sig.ownerName || 'Pemberi Tugas'}</strong> (${sig.ownerTitle || 'Pemilik Proyek'})</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Kontraktor Pelaksana</td>
              <td><strong>${proj.contractor || sig.contractorCompany || '-'}</strong> ${sig.contractorName ? `(${sig.contractorName})` : ''}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Konsultan Perencana / MK</td>
              <td><strong>${proj.consultant || sig.consultantCompany || '-'}</strong> ${sig.consultantName ? `(${sig.consultantName})` : ''}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Waktu Pelaksanaan</td>
              <td><strong>${proj.durationDays || 182} Hari Kalender</strong> (${proj.startDate || '2026-04-01'} s.d. ${proj.finishDate || '2026-09-30'})</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Standar Acuan AHSP</td>
              <td>Surat Edaran Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026</td>
            </tr>
            <tr>
              <td style="font-weight: 700; background-color: #f8fafc;">Wilayah Remunerasi & Indeks</td>
              <td>${proj.regionName || 'Jawa Barat - Bandung Raya & Priangan'} (Indeks Remunerasi PUPR)</td>
            </tr>
          </tbody>
        </table>

        <!-- B. Ruang Lingkup Pekerjaan Fisik (Scope of Work) -->
        <div class="subheading mb-2" style="font-size: 9.5pt; font-weight: 700; color: #0f172a;">
          <strong>B. Lingkup Pekerjaan Fisik (Scope of Work):</strong>
        </div>
        <table class="table table-bordered print-compact-table mb-3" style="font-size: 7.5pt;">
          <thead>
            <tr class="table-header-row" style="background-color: #f1f5f9;">
              <th style="width: 6%; text-align: center;">No</th>
              <th style="width: 10%; text-align: center;">Divisi</th>
              <th style="width: 44%;">Nama Divisi Pekerjaan</th>
              <th style="width: 15%; text-align: center;">Jumlah Item</th>
              <th style="width: 25%; text-align: right;">Estimasi Anggaran</th>
            </tr>
          </thead>
          <tbody>
            ${(proj.divisions || []).map((d, i) => `
              <tr>
                <td style="text-align: center;">${i + 1}</td>
                <td style="text-align: center; font-weight: 700;">${d.code}</td>
                <td><strong>${d.name}</strong></td>
                <td style="text-align: center;">${(d.items || []).length} Item Pekerjaan</td>
                <td style="text-align: right; font-weight: 700;">${window.CurrencyUtil.formatRupiah(d.subtotal || 0, false, true)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- C. Standar Teknis & Pengendalian Mutu -->
        <div class="subheading mb-2" style="font-size: 9.5pt; font-weight: 700; color: #0f172a;">
          <strong>C. Standar Teknis & Pengendalian Mutu Konstruksi:</strong>
        </div>
        <div style="font-size: 7.5pt; color: #334155; line-height: 1.4; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 10px;">
          Pekerjaan dilaksanakan sesuai dengan Spesifikasi Teknis Umum Bina Konstruksi 2026, Standar Nasional Indonesia (SNI) Bahan Bangunan (Beton Bertulang SNI 2847:2019, Baja Tulangan SNI 2052:2017, Mortar SNI 03-6882-2002), serta Standar Keselamatan dan Kesehatan Kerja Konstruksi (K3).
        </div>

        <!-- Running Footer Halaman 4 -->
        <div class="print-footer-block" style="margin-top: auto; border-top: 0.75pt solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman 4 dari 9</strong></div>
        </div>
        ${wmOverlay}
      </div>
    `;

    // 5. Bab II: Rekapitulasi RAB
    let recapRows = "";
    rabCalc.divisionSummaries.forEach((div, idx) => {
      recapRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center">${div.code}</td>
          <td>${div.name}</td>
          <td class="text-right">${window.CurrencyUtil.formatRupiah(div.subtotal, false, true)}</td>
          <td class="text-center">${window.CurrencyUtil.formatNumber(div.weightPercent, 2)}%</td>
        </tr>
      `;
    });

    const bab2Html = `
      <div class="proposal-page content-page" id="proposal-p5">
        <div class="page-heading">
          <h2>BAB II. REKAPITULASI RENCANA ANGGARAN BIAYA</h2>
          <div class="heading-line"></div>
        </div>

        <table class="table table-bordered print-compact-table mb-4">
          <thead>
            <tr class="table-header-row">
              <th style="width: 5%">No</th>
              <th style="width: 8%">Divisi</th>
              <th style="width: 47%">Uraian Divisi Pekerjaan</th>
              <th style="width: 25%">Jumlah Harga (Rp)</th>
              <th style="width: 15%">Bobot (%)</th>
            </tr>
          </thead>
          <tbody>
            ${recapRows}
            <tr class="table-active font-bold">
              <td colspan="3" class="text-right">JUMLAH BIAYA KONSTRUKSI (REAL COST)</td>
              <td class="text-right">${window.CurrencyUtil.formatRupiah(rabCalc.realCost, false, true)}</td>
              <td class="text-center">100.00%</td>
            </tr>
            ${rabCalc.includePpn ? `
            <tr>
              <td colspan="3" class="text-right">Pajak Pertambahan Nilai (PPN ${rabCalc.ppnRate}%)</td>
              <td class="text-right">${window.CurrencyUtil.formatRupiah(rabCalc.ppnAmount, false, true)}</td>
              <td class="text-center">-</td>
            </tr>` : ''}
            <tr class="total-highlight-row">
              <td colspan="3" class="text-right font-bold">TOTAL RENCANA ANGGARAN BIAYA (DIBULATKAN)</td>
              <td class="text-right font-bold text-primary" style="font-size: 1.05rem;">
                ${window.CurrencyUtil.formatRupiah(rabCalc.grandTotal, false, true)}
              </td>
              <td class="text-center">-</td>
            </tr>
          </tbody>
        </table>

        <div class="terbilang-box mb-4">
          <strong>Terbilang:</strong> <em>"${rabCalc.terbilangStr}"</em>
        </div>

        <!-- Running Footer Halaman 5 -->
        <div class="print-footer-block" style="margin-top: auto; border-top: 0.75pt solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman 5 dari 9</strong></div>
        </div>
        ${wmOverlay}
      </div>
    `;

    // 6. Bab III: Rincian Detail RAB per Divisi
    let detailDivisionsHtml = "";
    (proj.divisions || []).forEach(div => {
      let itemsHtml = "";
      (div.items || []).forEach((itm, idx) => {
        itemsHtml += `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td><strong>${itm.name}</strong>${itm.notes ? `<br><small class="text-muted">${itm.notes}</small>` : ''}</td>
            <td class="text-center"><span class="badge badge-light">${itm.code}</span></td>
            <td class="text-right">${window.CurrencyUtil.formatNumber(itm.volume, 2)}</td>
            <td class="text-center">${itm.unit}</td>
            <td class="text-right">${window.CurrencyUtil.formatRupiah(itm.price, false, true)}</td>
            <td class="text-right font-bold">${window.CurrencyUtil.formatRupiah(itm.total, false, true)}</td>
          </tr>
        `;
      });

      detailDivisionsHtml += `
        <div class="division-block mb-4">
          <div class="division-title-bar">
            <span><strong>DIVISI ${div.code}. ${div.name}</strong></span>
            <span>Subtotal: ${window.CurrencyUtil.formatRupiah(div.subtotal, false, true)}</span>
          </div>
          <table class="table table-bordered print-compact-table">
            <thead>
              <tr class="table-header-row">
                <th style="width: 4%">No</th>
                <th style="width: 38%">Uraian Pekerjaan</th>
                <th style="width: 12%">Kode AHSP</th>
                <th style="width: 10%">Volume</th>
                <th style="width: 8%">Satuan</th>
                <th style="width: 13%">Harga Satuan</th>
                <th style="width: 15%">Jumlah Harga</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || '<tr><td colspan="7" class="text-center text-muted">Belum ada rincian pekerjaan.</td></tr>'}
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
        ${wmOverlay}
      </div>
    `;

    // 7. Bab IV: Kurva S & Jadwal
    const bab4Html = `
      <div class="proposal-page content-page" id="proposal-p7">
        <div class="page-heading">
          <h2>BAB IV. JADWAL PELAKSANAAN & KURVA S</h2>
          <div class="heading-line"></div>
        </div>

        <div class="prose-text mb-3">
          <p>Kurva S di bawah ini merepresentasikan distribusi beban kerja dan target progres fisik kumulatif selama masa pelaksanaan proyek (${proj.durationDays || 180} hari kalender, periode ${proj.startDate || '07 Sep 2026'} s.d. ${proj.finishDate || '09 Sep 2026'}):</p>
        </div>

        <div id="proposal-scurve-embed" class="svg-print-container mb-4">
          <!-- Diisi via renderSvgChart langsung ke elemen proposal -->
        </div>

        <div class="prose-text">
          <p><small class="text-muted">*Kurva garis biru mewakili Target Rencana Kumulatif (%), garis hijau mewakili Realisasi Fisik Aktual (%), dan diagram batang di bagian bawah menunjukkan bobot rencana proporsional.</small></p>
        </div>

        <!-- Running Footer Halaman 7 -->
        <div class="print-footer-block" style="margin-top: auto; border-top: 0.75pt solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman 7 dari 9</strong></div>
        </div>
        ${wmOverlay}
      </div>
    `;

    // 8. Bab V: Rekapitulasi Sumber Daya
    let matRows = "";
    resources.materials.slice(0, 15).forEach((m, idx) => {
      matRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>${m.name}</td>
          <td class="text-center">${m.unit}</td>
          <td class="text-right">${window.CurrencyUtil.formatNumber(m.qty, 2)}</td>
          <td class="text-right">${window.CurrencyUtil.formatRupiah(m.price, false, true)}</td>
          <td class="text-right">${window.CurrencyUtil.formatRupiah(m.totalCost, false, true)}</td>
        </tr>
      `;
    });

    let labRows = "";
    resources.labor.forEach((l, idx) => {
      labRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>${l.name}</td>
          <td class="text-center">${l.unit}</td>
          <td class="text-right">${window.CurrencyUtil.formatNumber(l.qty, 2)}</td>
          <td class="text-right">${window.CurrencyUtil.formatRupiah(l.price, false, true)}</td>
          <td class="text-right">${window.CurrencyUtil.formatRupiah(l.totalCost, false, true)}</td>
        </tr>
      `;
    });

    const bab5Html = `
      <div class="proposal-page content-page" id="proposal-p8">
        <div class="page-heading">
          <h2>BAB V. REKAPITULASI KEBUTUHAN SUMBER DAYA</h2>
          <div class="heading-line"></div>
        </div>

        <div class="subheading mb-2"><strong>A. Estimasi Kebutuhan Bahan Utama Terbesar (Top 15 Material):</strong></div>
        <div class="card p-2 mb-3 bg-light" style="font-size: 8.5pt;">
          <strong>Ringkasan Bobot Sumber Daya:</strong> Material: ${resources.materialsPct || '0.00'}% &bull; Upah Tenaga: ${resources.laborPct || '0.00'}% &bull; Sewa Alat: ${resources.equipmentPct || '0.00'}%
        </div>
        <table class="table table-bordered print-compact-table mb-4">
          <thead>
            <tr class="table-header-row">
              <th style="width: 5%">No</th>
              <th style="width: 45%">Nama Bahan Material</th>
              <th style="width: 10%">Satuan</th>
              <th style="width: 12%">Volume</th>
              <th style="width: 13%">Harga Satuan</th>
              <th style="width: 15%">Subtotal Biaya</th>
            </tr>
          </thead>
          <tbody>
            ${matRows || '<tr><td colspan="6" class="text-center text-muted">Belum ada kebutuhan bahan.</td></tr>'}
          </tbody>
        </table>

        <div class="subheading mb-2"><strong>B. Estimasi Kebutuhan Tenaga Kerja (Orang-Hari / OH):</strong></div>
        <table class="table table-bordered print-compact-table mb-4">
          <thead>
            <tr class="table-header-row">
              <th style="width: 5%">No</th>
              <th style="width: 45%">Klasifikasi Tenaga Kerja</th>
              <th style="width: 10%">Satuan</th>
              <th style="width: 12%">Jumlah OH</th>
              <th style="width: 13%">Upah Harian</th>
              <th style="width: 15%">Subtotal Upah</th>
            </tr>
          </thead>
          <tbody>
            ${labRows || '<tr><td colspan="6" class="text-center text-muted">Belum ada data upah.</td></tr>'}
          </tbody>
        </table>

        <!-- Running Footer Halaman 8 -->
        <div class="print-footer-block" style="margin-top: auto; border-top: 0.75pt solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman 8 dari 9</strong></div>
        </div>
        ${wmOverlay}
      </div>
    `;

    // 9. Bab VI & VII: Ketentuan Pembayaran & Lembar Pengesahan
    const bab67Html = `
      <div class="proposal-page content-page" id="proposal-p9">
        <div class="page-heading">
          <h2>BAB VI. SKEMA PEMBAYARAN TERMIN & GARANSI MUTU</h2>
          <div class="heading-line"></div>
        </div>

        <div class="prose-text mb-2">
          <p>Pembayaran nilai kontrak disepakati bertahap (termin) berbasis capaian bobot fisik lapangan yang diverifikasi resmi dalam Berita Acara Pembayaran (BAP):</p>
        </div>

        <!-- Tabel Skema Pembayaran Termin Resmi -->
        <table class="table table-bordered print-compact-table mb-3" style="font-size: 7.5pt;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="width: 12%; text-align: center;">Termin</th>
              <th style="width: 34%;">Tahapan Fisik & Syarat Kemajuan</th>
              <th style="width: 13%; text-align: center;">Bobot Fisik</th>
              <th style="width: 13%; text-align: center;">Porsi Bayar</th>
              <th style="width: 28%; text-align: right;">Estimasi Nilai Pembayaran</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; font-weight: 700;">Termin I</td>
              <td>Uang Muka Kerja (Mobilisasi & Persiapan Awal)</td>
              <td style="text-align: center;">0%</td>
              <td style="text-align: center; font-weight: 700;">20%</td>
              <td style="text-align: right; font-weight: 700;">${window.CurrencyUtil.formatRupiah(rabCalc.grandTotal * 0.20, false, true)}</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">Termin II</td>
              <td>Kemajuan Fisik 50% (Selesai Cor Dak Lantai 2)</td>
              <td style="text-align: center;">50%</td>
              <td style="text-align: center; font-weight: 700;">30%</td>
              <td style="text-align: right; font-weight: 700;">${window.CurrencyUtil.formatRupiah(rabCalc.grandTotal * 0.30 * 0.75 * 1.11, false, true)}</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">Termin III</td>
              <td>Kemajuan Fisik 80% (Selesai Dinding, Atap & MEP)</td>
              <td style="text-align: center;">80%</td>
              <td style="text-align: center; font-weight: 700;">30%</td>
              <td style="text-align: right; font-weight: 700;">${window.CurrencyUtil.formatRupiah(rabCalc.grandTotal * 0.30 * 0.75 * 1.11, false, true)}</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">Termin IV</td>
              <td>Kemajuan Fisik 100% (Serah Terima Pertama / PHO)</td>
              <td style="text-align: center;">100%</td>
              <td style="text-align: center; font-weight: 700;">15%</td>
              <td style="text-align: right; font-weight: 700;">${window.CurrencyUtil.formatRupiah(rabCalc.grandTotal * 0.15 * 0.75 * 1.11, false, true)}</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: 700;">Retensi</td>
              <td>Serah Terima Akhir Pasca Pemeliharaan 90 Hari (FHO)</td>
              <td style="text-align: center;">100%</td>
              <td style="text-align: center; font-weight: 700;">5%</td>
              <td style="text-align: right; font-weight: 700;">${window.CurrencyUtil.formatRupiah(rabCalc.grandTotal * 0.05 * 1.11, false, true)}</td>
            </tr>
          </tbody>
        </table>

        <div class="page-heading mt-3">
          <h2>BAB VII. LEMBAR PENGESAHAN TIGA PIHAK</h2>
          <div class="heading-line"></div>
        </div>

        <div class="prose-text mb-3">
          <p>Dokumen Proposal Rencana Anggaran Biaya dan Rencana Kerja ini telah diperiksa, disetujui, dan disepakati bersama oleh Para Pihak:</p>
        </div>

        <!-- Tanggal & Kota Penetapan Lembar Pengesahan -->
        <div style="text-align: right; font-size: 8.5pt; color: #334155; margin-bottom: 12px; font-weight: 500;">
          Ditetapkan di: <strong>${sig.docCity || proj.location || 'Indonesia'}</strong>, Tanggal: <strong>${(window.DateUtil && window.DateUtil.formatTanggalIndo) ? window.DateUtil.formatTanggalIndo(sig.docDate || proj.startDate || '2026-04-01') : (sig.docDate || proj.startDate || '2026-04-01')}</strong>
        </div>

        <!-- Kolom Tanda Tangan Tiga Pihak Bersih Minimalis & Elegan (Polos Tanpa Border) -->
        <div class="signature-clean-grid three-parties mt-2" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; text-align: center;">
          <div class="sig-block" style="border: none !important; background: transparent !important; padding: 4px 8px;">
            <div class="sig-title" style="font-weight: 800; font-size: 9pt; color: #1e293b; padding-bottom: 4px; margin-bottom: 6px;">PEMBERI TUGAS / OWNER</div>
            <div style="font-size: 8pt; color: #64748b; min-height: 18px;">Menyetujui & Menetapkan:</div>
            <div class="sig-space" style="height: 55px;"></div>
            <div class="sig-name" style="font-weight: 700; font-size: 9.5pt; color: #0f172a; text-decoration: underline;">( ${sig.ownerName || proj.owner || '.................................'} )</div>
            <div class="sig-role" style="font-size: 8pt; color: #334155; margin-top: 3px;">${sig.ownerTitle || 'Pemilik Proyek / Pemberi Tugas'}</div>
            ${sig.ownerNip && sig.ownerNip !== '-' ? `<div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">NIP/NIK: ${sig.ownerNip}</div>` : ''}
          </div>

          <div class="sig-block" style="border: none !important; background: transparent !important; padding: 4px 8px;">
            <div class="sig-title" style="font-weight: 800; font-size: 9pt; color: #1e293b; padding-bottom: 4px; margin-bottom: 6px;">KONSULTAN PERENCANA</div>
            <div style="font-size: 8pt; color: #64748b; min-height: 18px;">Direncanakan & Dihitung:</div>
            <div class="sig-space" style="height: 55px;"></div>
            <div class="sig-name" style="font-weight: 700; font-size: 9.5pt; color: #0f172a; text-decoration: underline;">( ${sig.consultantName || '.................................'} )</div>
            <div class="sig-role" style="font-size: 8pt; color: #334155; margin-top: 3px;">${sig.consultantTitle || 'Konsultan Perencana'}</div>
            <div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">${sig.consultantCompany || proj.consultant || ''}</div>
          </div>

          <div class="sig-block" style="border: none !important; background: transparent !important; padding: 4px 8px;">
            <div class="sig-title" style="font-weight: 800; font-size: 9pt; color: #1e293b; padding-bottom: 4px; margin-bottom: 6px;">KONTRAKTOR PELAKSANA</div>
            <div style="font-size: 8pt; color: #64748b; min-height: 18px;">Diajukan & Dilaksanakan:</div>
            <div class="sig-space" style="height: 55px;"></div>
            <div class="sig-name" style="font-weight: 700; font-size: 9.5pt; color: #0f172a; text-decoration: underline;">( ${sig.contractorName || '.................................'} )</div>
            <div class="sig-role" style="font-size: 8pt; color: #334155; margin-top: 3px;">${sig.contractorTitle || 'Direktur Pelaksana'}</div>
            <div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">${sig.contractorCompany || proj.contractor || ''}</div>
          </div>
        </div>

        <!-- Running Footer Halaman 9 -->
        <div class="print-footer-block" style="margin-top: auto; border-top: 0.75pt solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8pt; color: #475569;">
          <div class="footer-left">${footerLeftText}</div>
          <div class="footer-right"><strong>Halaman 9 dari 9</strong></div>
        </div>
        ${wmOverlay}
      </div>
    `;

    return coverHtml + introHtml + tocHtml + bab1Html + bab2Html + bab3Html + bab4Html + bab5Html + bab67Html;
  }

  return {
    generateProposalHtml
  };
})();
