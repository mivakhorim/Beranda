/**
 * BAP Module (Berita Acara Pembayaran & Penagihan Termin Proyek)
 * Menghitung otomatis: Nilai Bruto, Potongan Uang Muka, Potongan Retensi 5%,
 * PPN, Nilai Bersih Tagihan (Net Payment), Terbilang Rupiah,
 * Skema Termin Dinamis (CRUD, Atur Porsi %, Target Fisik, Kriteria),
 * serta Dokumen BAP Resmi Siap Cetak A4 dengan Catatan Lapangan
 */

window.BapInvoicing = (function() {
  const _esc = (s) => (window.DutaSanitizer ? window.DutaSanitizer.escapeHtml(s) : String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])));

  function getDefaultTerminSchemes() {
    return [
      {
        phaseIndex: 1,
        title: "Termin I - Uang Muka (Down Payment 20%)",
        targetProgress: 0,
        portionPercent: 20,
        criteria: "Penandatanganan Surat Perjanjian Kontrak Kerja & Penyerahan Jaminan Uang Muka",
        notes: "Uang muka operasional awal, mobilisasi alat berat, tenaga kerja dan pembersihan lahan kavling",
        dpDeductionPercent: 0,
        retentionPercent: 0,
        targetDateOffsetDays: 5
      },
      {
        phaseIndex: 2,
        title: "Termin II - Kemajuan Fisik 50% (Selesai Dak Beton Lantai 2)",
        targetProgress: 50,
        portionPercent: 30,
        criteria: "Penyelesaian struktur pondasi, sloof, kolom lantai 1, dan cor dak plat beton lantai 2",
        notes: "Selesai pekerjaan struktur beton bertulang lantai 1, balok induk, dan plat lantai 2",
        dpDeductionPercent: 20,
        retentionPercent: 5,
        targetDateOffsetDays: 85
      },
      {
        phaseIndex: 3,
        title: "Termin III - Kemajuan Fisik 80% (Selesai Pasangan Dinding & Atap)",
        targetProgress: 80,
        portionPercent: 30,
        criteria: "Penyelesaian dinding bata, plesteran acian, rangka baja ringan, genteng, dan instalasi pipa/kabel",
        notes: "Selesai pekerjaan arsitektur basah, penutup atap genteng keramik, dan instalasi mekanikal elektrikal",
        dpDeductionPercent: 20,
        retentionPercent: 5,
        targetDateOffsetDays: 135
      },
      {
        phaseIndex: 4,
        title: "Termin IV - Kemajuan Fisik 100% (Serah Terima Pertama / PHO)",
        targetProgress: 100,
        portionPercent: 15,
        criteria: "Penyelesaian 100% seluruh item fisik, lantai keramik, kusen, pengecatan, sanitair, dan uji fungsi MEP",
        notes: "Serah Terima Pertama Pekerjaan (PHO) dengan Berita Acara Pemeriksaan Fisik 100%",
        dpDeductionPercent: 20,
        retentionPercent: 5,
        targetDateOffsetDays: 182
      },
      {
        phaseIndex: 5,
        title: "Termin V - Pelunasan Retensi Pemeliharaan 5% (FHO)",
        targetProgress: 100,
        portionPercent: 5,
        criteria: "Berita Acara Serah Terima Akhir (FHO) bebas cacat mutu pasca Masa Pemeliharaan 90 Hari",
        notes: "Pencairan jaminan retensi 5% setelah masa pemeliharaan 90 hari kalender selesai tanpa komplain",
        dpDeductionPercent: 0,
        retentionPercent: 0,
        targetDateOffsetDays: 272
      }
    ];
  }

  function getContractorAcronym(project) {
    const proj = project || (window.ProjectManager && window.ProjectManager.getActiveProject());
    const comp = (proj && proj.contractor) ? proj.contractor.trim() : "";
    if (!comp) return (proj && proj.code) ? proj.code : "PRJ";
    const words = comp.split(/\s+/).filter(w => !['PT', 'CV', 'UD', 'PT.', 'CV.', 'UD.'].includes(w.toUpperCase()));
    if (words.length >= 2) {
      return words.map(w => w[0]).join('').toUpperCase();
    } else if (words.length === 1) {
      return words[0].slice(0, 3).toUpperCase();
    }
    return "PRJ";
  }

  function getBapRecords() {
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (!proj) return [];
    if (!proj.bapRecords) proj.bapRecords = [];
    return proj.bapRecords;
  }

  // Hitung rincian angka BAP
  function calculateBapValues(contractValue, claimedPercent, dpPercentDeduction = 0, retentionPercent = 5, ppnRate = 0) {
    const contract = Number(contractValue) || 0;
    const claimedPct = Number(claimedPercent) || 0;
    const grossAmount = Math.round(contract * (claimedPct / 100));

    const dpDeduction = Math.round(grossAmount * (Number(dpPercentDeduction) / 100));
    const retentionDeduction = Math.round(grossAmount * (Number(retentionPercent) / 100));

    const netBeforeTax = grossAmount - dpDeduction - retentionDeduction;
    const ppnAmount = Math.round(netBeforeTax * (Number(ppnRate) / 100));
    const netPayable = netBeforeTax + ppnAmount;
    const terbilangStr = window.CurrencyUtil ? window.CurrencyUtil.terbilang(netPayable) : "";

    return {
      contractValue: contract,
      claimedPercent: claimedPct,
      grossAmount,
      dpDeduction,
      retentionDeduction,
      netBeforeTax,
      ppnRate,
      ppnAmount,
      netPayable,
      terbilangStr
    };
  }

  function addBapRecord(data) {
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (!proj) return null;
    if (!proj.bapRecords) proj.bapRecords = [];

    const rabCalc = window.RabCalculator ? window.RabCalculator.calculateProjectRab(proj) : null;
    let contractVal = 0;
    if (rabCalc && rabCalc.grandTotal > 0) {
      contractVal = rabCalc.grandTotal;
    } else if (Number(proj.contractBudget) > 0) {
      contractVal = Number(proj.contractBudget);
    } else if (Number(proj.grandTotal) > 0) {
      contractVal = Number(proj.grandTotal);
    } else {
      let divSum = 0;
      (proj.divisions || []).forEach(d => (d.items || []).forEach(it => {
        divSum += (Number(it.volume) || 0) * (Number(it.price) || 0);
      }));
      contractVal = divSum > 0 ? Math.round(divSum * (1 + (((proj.ppnRate !== undefined && proj.ppnRate !== null) ? Number(proj.ppnRate) : 0) / 100))) : 500000000;
    }

    const calc = calculateBapValues(
      contractVal,
      data.claimedPercent || 20,
      data.dpPercentDeduction || 0,
      data.retentionPercent || 5,
      (proj.ppnRate !== undefined && proj.ppnRate !== null) ? Number(proj.ppnRate) : 0
    );

    const newBap = {
      id: `BAP-${Date.now().toString(36).toUpperCase()}`,
      bapNumber: data.bapNumber || `BAP/${getContractorAcronym(proj)}/${new Date().getFullYear()}/${String(proj.bapRecords.length + 1).padStart(3, '0')}`,
      date: data.date || new Date().toISOString().split('T')[0],
      phaseTitle: data.phaseTitle || "Termin Pembayaran",
      physicalProgressPercent: Number(data.physicalProgressPercent) || 0,
      claimedPercent: calc.claimedPercent,
      grossAmount: calc.grossAmount,
      dpDeduction: calc.dpDeduction,
      retentionDeduction: calc.retentionDeduction,
      netBeforeTax: calc.netBeforeTax,
      ppnAmount: calc.ppnAmount,
      netPayable: calc.netPayable,
      status: data.status || "Pengajuan",
      paymentDate: data.paymentDate || "",
      notes: data.notes || "",
      manualNotes: data.manualNotes || ""
    };

    proj.bapRecords.push(newBap);
    window.ProjectManager.updateActiveProject(proj);
    return newBap;
  }

  function updateBapRecord(idOrNumber, data) {
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (!proj || !proj.bapRecords) return false;

    const bapIndex = proj.bapRecords.findIndex(b => b.id === idOrNumber || b.bapNumber === idOrNumber);
    if (bapIndex === -1) return false;

    const current = proj.bapRecords[bapIndex];
    const rabCalc = window.RabCalculator ? window.RabCalculator.calculateProjectRab(proj) : null;
    let contractVal = 0;
    if (rabCalc && rabCalc.grandTotal > 0) {
      contractVal = rabCalc.grandTotal;
    } else if (Number(proj.contractBudget) > 0) {
      contractVal = Number(proj.contractBudget);
    } else if (current.grossAmount && current.claimedPercent > 0) {
      contractVal = Math.round(current.grossAmount / (current.claimedPercent / 100));
    } else {
      contractVal = 500000000;
    }

    const claimedPct = (data.claimedPercent !== undefined && data.claimedPercent !== null) 
      ? Number(data.claimedPercent) 
      : current.claimedPercent;
    const dpPct = (data.dpPercentDeduction !== undefined && data.dpPercentDeduction !== null) 
      ? Number(data.dpPercentDeduction) 
      : (current.grossAmount > 0 ? (current.dpDeduction / current.grossAmount * 100) : 0);
    const retPct = (data.retentionPercent !== undefined && data.retentionPercent !== null) 
      ? Number(data.retentionPercent) 
      : (current.grossAmount > 0 ? (current.retentionDeduction / current.grossAmount * 100) : 5);

    const calc = calculateBapValues(
      contractVal,
      claimedPct,
      dpPct,
      retPct,
      (proj.ppnRate !== undefined && proj.ppnRate !== null) ? Number(proj.ppnRate) : 0
    );

    current.bapNumber = data.bapNumber || current.bapNumber;
    current.date = data.date || current.date;
    current.phaseTitle = data.phaseTitle || current.phaseTitle;
    current.physicalProgressPercent = (data.physicalProgressPercent !== undefined) ? Number(data.physicalProgressPercent) : current.physicalProgressPercent;
    current.claimedPercent = calc.claimedPercent;
    current.grossAmount = calc.grossAmount;
    current.dpDeduction = calc.dpDeduction;
    current.retentionDeduction = calc.retentionDeduction;
    current.netBeforeTax = calc.netBeforeTax;
    current.ppnAmount = calc.ppnAmount;
    current.netPayable = calc.netPayable;
    if (data.status) current.status = data.status;
    if (data.paymentDate !== undefined) current.paymentDate = data.paymentDate;
    if (data.notes !== undefined) current.notes = data.notes;
    if (data.manualNotes !== undefined) current.manualNotes = data.manualNotes;

    proj.bapRecords[bapIndex] = current;
    window.ProjectManager.updateActiveProject(proj);
    return current;
  }

  function deleteBapRecord(bapNumber) {
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (!proj || !proj.bapRecords) return false;

    proj.bapRecords = proj.bapRecords.filter(b => b.bapNumber !== bapNumber && b.id !== bapNumber);
    window.ProjectManager.updateActiveProject(proj);
    return true;
  }

  // Generate Dokumen Cetak BAP A4 Resmi (Terkunci Tepat 1 Halaman A4 Tanpa Melebar)
  function generatePrintableBapHtml(bapItem) {
    const proj = (window.ProjectManager && window.ProjectManager.getActiveProject()) || {};
    const sig = proj.signatories || {};
    const bank = proj.bankInfo || {};
    const rabCalc = window.RabCalculator ? window.RabCalculator.calculateProjectRab(proj) : null;
    
    let contractVal = 0;
    if (rabCalc && rabCalc.grandTotal > 0) {
      contractVal = rabCalc.grandTotal;
    } else if (Number(proj.contractBudget) > 0) {
      contractVal = Number(proj.contractBudget);
    } else if (Number(proj.grandTotal) > 0) {
      contractVal = Number(proj.grandTotal);
    } else if (bapItem.grossAmount && bapItem.claimedPercent > 0) {
      contractVal = Math.round(bapItem.grossAmount / (bapItem.claimedPercent / 100));
    } else {
      let divSum = 0;
      (proj.divisions || []).forEach(d => (d.items || []).forEach(it => {
        divSum += (Number(it.volume) || 0) * (Number(it.price) || 0);
      }));
      contractVal = divSum > 0 ? Math.round(divSum * (1 + (((proj.ppnRate !== undefined && proj.ppnRate !== null) ? Number(proj.ppnRate) : 0) / 100))) : (bapItem.grossAmount || 500000000);
    }

    // Periksa dan hitung ulang kalkulasi finansial BAP jika data awal bernilai 0 atau belum sinkron
    const phaseTitleLower = (bapItem.phaseTitle || "").toLowerCase();
    const isDp = phaseTitleLower.includes("uang muka") || phaseTitleLower.includes("down payment") || phaseTitleLower.includes("termin i");
    const claimedPct = Number(bapItem.claimedPercent) || (isDp ? 20 : 30);

    let grossAmount = Number(bapItem.grossAmount) || 0;
    let dpDeduction = Number(bapItem.dpDeduction) || 0;
    let retentionDeduction = Number(bapItem.retentionDeduction) || 0;
    let netBeforeTax = Number(bapItem.netBeforeTax) || 0;
    let ppnAmount = Number(bapItem.ppnAmount) || 0;
    let netPayable = Number(bapItem.netPayable) || 0;

    if ((grossAmount === 0 || netPayable === 0) && contractVal > 0) {
      const dpPct = isDp ? 0 : (bapItem.dpPercentDeduction !== undefined ? Number(bapItem.dpPercentDeduction) : 20);
      const retPct = isDp ? 0 : (bapItem.retentionPercent !== undefined ? Number(bapItem.retentionPercent) : 5);
      const ppnRate = (proj.ppnRate !== undefined && proj.ppnRate !== null) ? Number(proj.ppnRate) : 0;
      const rec = calculateBapValues(contractVal, claimedPct, dpPct, retPct, ppnRate);
      grossAmount = rec.grossAmount;
      dpDeduction = rec.dpDeduction;
      retentionDeduction = rec.retentionDeduction;
      netBeforeTax = rec.netBeforeTax;
      ppnAmount = rec.ppnAmount;
      netPayable = rec.netPayable;
    }

    const terbilangStr = (window.CurrencyUtil && window.CurrencyUtil.terbilang) 
      ? window.CurrencyUtil.terbilang(netPayable) 
      : "";

    const ownerName = _esc((sig.ownerName && !sig.ownerName.includes('...')) ? sig.ownerName : (proj.owner || "Orang Pertama"));
    const ownerTitle = _esc(sig.ownerTitle || "Pemilik Bangunan / Pemberi Tugas");
    const consultantCompany = _esc(sig.consultantCompany || proj.consultant || "Duta Digital Agensi");
    const consultantSigner = _esc((sig.consultantName && !sig.consultantName.includes('...')) ? sig.consultantName : "Orang Kedua");
    const consultantTitle = _esc(sig.consultantTitle || "Dutamik.id");
    const contractorCompany = _esc(sig.contractorCompany || proj.contractor || "Duta Digital Agensi");
    const contractorSigner = _esc((sig.contractorName && !sig.contractorName.includes('...')) ? sig.contractorName : (sig.siteManagerName || "Orang Ketiga"));
    const contractorTitle = _esc(sig.contractorTitle || "Dutamik.id");

    const bankName = _esc(bank.bankName || "Bank Mandiri");
    const bankAccount = _esc(bank.accountNumber || "xxx-xxx-xxxxxxxx-x");
    const bankOwner = _esc(bank.accountName || contractorCompany || "Duta Digital Agensi");

    return `
      <div class="printable-bap-doc a4-portrait" style="position: relative !important; width: 100%; max-width: 186mm !important; margin: 0 auto !important; min-height: 245mm; box-sizing: border-box !important; padding: 0 !important; display: flex; flex-direction: column; justify-content: space-between; overflow: visible; page-break-inside: avoid !important; page-break-after: auto !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 8pt; color: #0f172a; background: #ffffff !important;">

        <div>
          <!-- 1. Kop Surat & Judul BAP Resmi -->
          <div class="bap-header" style="border-bottom: 2pt double #0f172a; padding-bottom: 5px; margin-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="font-size: 11pt; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">${contractorCompany}</div>
                <div style="font-size: 7.5pt; color: #475569;">Kontraktor Pelaksana Konstruksi & Manajemen Proyek</div>
              </div>
              <div style="text-align: right; font-size: 8pt; color: #334155; line-height: 1.35;">
                <div><strong>No. Dokumen:</strong> ${_esc(bapItem.bapNumber)}</div>
                <div><strong>Tanggal:</strong> ${_esc(bapItem.date)}</div>
              </div>
            </div>
            <div style="text-align: center; margin-top: 4px;">
              <h3 style="font-size: 11pt; font-weight: 800; margin: 0; color: #0f172a; letter-spacing: 0.5px; text-transform: uppercase;">BERITA ACARA PEMBAYARAN (BAP)</h3>
              <div style="font-size: 7.5pt; color: #475569;">Prestasi Kemajuan Pekerjaan Fisik & Verifikasi Tagihan Termin Konstruksi</div>
            </div>
          </div>

          <!-- 2. Ringkasan Para Pihak (3 Pihak) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; padding: 4px 0 6px 0; margin-bottom: 5px; font-size: 7.5pt; border-bottom: 1px solid #e2e8f0;">
            <div>
              <div style="font-size: 7pt; font-weight: 700; color: #475569; text-transform: uppercase;">1. Pemberi Tugas (Owner)</div>
              <div style="font-weight: 700; color: #0f172a; font-size: 8pt;">${ownerName}</div>
              <div style="color: #475569; font-size: 7pt;">${ownerTitle}</div>
            </div>
            <div>
              <div style="font-size: 7pt; font-weight: 700; color: #475569; text-transform: uppercase;">2. Konsultan Pengawas</div>
              <div style="font-weight: 700; color: #0f172a; font-size: 8pt;">${consultantCompany}</div>
              <div style="color: #475569; font-size: 7pt;">${consultantTitle}</div>
            </div>
            <div>
              <div style="font-size: 7pt; font-weight: 700; color: #475569; text-transform: uppercase;">3. Kontraktor Pelaksana</div>
              <div style="font-weight: 700; color: #0f172a; font-size: 8pt;">${contractorCompany}</div>
              <div style="color: #475569; font-size: 7pt;">${contractorSigner} (${contractorTitle})</div>
            </div>
          </div>

          <div style="font-size: 7.5pt; color: #334155; margin-bottom: 5px; line-height: 1.3;">
            Menyatakan bersama bahwa prestasi kemajuan fisik pekerjaan lapangan untuk proyek <strong>${_esc(proj.name || 'Konstruksi')}</strong> telah diperiksa, diverifikasi, dan disetujui untuk penagihan pembayaran termin dengan rincian:
          </div>

          <!-- 3. Tabel Rincian Nilai Tagihan Termin BAP -->
          <table style="width: 100%; border-collapse: collapse; font-size: 7.5pt; margin-bottom: 6px; border: 1px solid #cbd5e1;">
            <tbody>
              <tr style="background: #f1f5f9; font-weight: 700;">
                <td style="border: 1px solid #cbd5e1; padding: 3px 6px; width: 55%;">Uraian Tahapan / Termin Pembayaran</td>
                <td style="border: 1px solid #cbd5e1; padding: 3px 6px; width: 45%; text-align: right; color: #1d4ed8; font-weight: 800;">${_esc(bapItem.phaseTitle)}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 2.5px 6px;">Nilai Total Kontrak Rencana Anggaran Biaya (RAB)</td>
                <td style="border: 1px solid #cbd5e1; padding: 2.5px 6px; text-align: right;">${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(contractVal, false, true) : contractVal}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 2.5px 6px;">Prestasi Fisik Lapangan & Porsi Tagihan Diajukan</td>
                <td style="border: 1px solid #cbd5e1; padding: 2.5px 6px; text-align: right;">Fisik: <strong>${bapItem.physicalProgressPercent}%</strong> &bull; Tagihan: <strong>${bapItem.claimedPercent}%</strong></td>
              </tr>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 2.5px 6px;">Nilai Prestasi Bruto Pekerjaan (${bapItem.claimedPercent}% x Kontrak)</td>
                <td style="border: 1px solid #cbd5e1; padding: 2.5px 6px; text-align: right; font-weight: 600;">${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(grossAmount, false, true) : grossAmount}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 2.5px 6px; color: #64748b;">Potongan Pengembalian Uang Muka (DP)</td>
                <td style="border: 1px solid #cbd5e1; padding: 2.5px 6px; text-align: right; color: #dc2626;">- ${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(dpDeduction, false, true) : dpDeduction}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 2.5px 6px; color: #64748b;">Potongan Retensi Masa Pemeliharaan (5%)</td>
                <td style="border: 1px solid #cbd5e1; padding: 2.5px 6px; text-align: right; color: #dc2626;">- ${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(retentionDeduction, false, true) : retentionDeduction}</td>
              </tr>
              <tr style="background: #f8fafc; font-weight: 700;">
                <td style="border: 1px solid #cbd5e1; padding: 3px 6px;">Jumlah Pembayaran Sebelum Pajak (Net Before PPN)</td>
                <td style="border: 1px solid #cbd5e1; padding: 3px 6px; text-align: right;">${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(netBeforeTax, false, true) : netBeforeTax}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 2.5px 6px;">Pajak Pertambahan Nilai (PPN ${(proj.ppnRate !== undefined && proj.ppnRate !== null) ? proj.ppnRate : 0}%)</td>
                <td style="border: 1px solid #cbd5e1; padding: 2.5px 6px; text-align: right;">${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(ppnAmount, false, true) : ppnAmount}</td>
              </tr>
              <tr style="background: #f1f5f9; font-weight: 800; border-top: 1.5pt solid #0f172a;">
                <td style="border: 1.5px solid #0f172a; padding: 4px 6px; font-size: 8pt; letter-spacing: 0.3px;">TOTAL BERSIH DIBAYARKAN (NET PAYABLE)</td>
                <td style="border: 1.5px solid #0f172a; padding: 4px 6px; text-align: right; font-size: 9pt; color: #1d4ed8;">${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(netPayable, false, true) : netPayable}</td>
              </tr>
            </tbody>
          </table>

          <!-- 4. Terbilang & Rekening Bank -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 5px 8px; margin-bottom: 6px; font-size: 7.5pt; line-height: 1.35;">
            <div><strong>Terbilang:</strong> <em>"${terbilangStr}"</em></div>
            <div style="margin-top: 3px; color: #334155; border-top: 1px dashed #cbd5e1; padding-top: 3px;">
              <strong>Instruksi Transfer:</strong> ${bankName} &bull; No. Rek: <strong>${bankAccount}</strong> &bull; a.n <strong>${bankOwner}</strong>
            </div>
          </div>

          <!-- 5. Catatan Mutu Lapangan -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 5px 8px; margin-bottom: 6px; font-size: 7.5pt; line-height: 1.3;">
            <div style="font-weight: 700; color: #0f172a;">Catatan & Rekomendasi Mutu Lapangan:</div>
            <div style="color: #334155;">${_esc(bapItem.notes || 'Pekerjaan fisik telah diperiksa bersama di lapangan dan memenuhi spesifikasi gambar kerja serta standar mutu SE PUPR.')}</div>
            ${bapItem.manualNotes ? `
              <div style="margin-top: 3px; color: #1e40af;"><strong>Catatan Tambahan:</strong> ${_esc(bapItem.manualNotes)}</div>
            ` : `
              <div style="margin-top: 3px; display: flex; align-items: center; gap: 6px;">
                <span style="color: #64748b; font-size: 7pt;">Catatan Manual:</span>
                <span style="flex: 1; border-bottom: 1px dotted #94a3b8; height: 10px;"></span>
              </div>
            `}
          </div>

          <!-- 6. Pernyataan Penutup -->
          <div style="font-size: 7pt; color: #475569; text-align: center; margin-bottom: 6px;">
            Demikian Berita Acara Pembayaran ini dibuat rangkap 3 (tiga) sah untuk dipergunakan sebagai dasar pencairan tagihan.
          </div>
        </div>

        <div>
          <!-- 7. Tanda Tangan Tiga Pihak (Format Tabel Sejajar 3 Kolom Bebas Garis Bawah) -->
          <table class="signature-clean-table" style="width: 100% !important; border-collapse: collapse !important; border: none !important; background: transparent !important; margin-top: 8px !important; margin-bottom: 6px !important; page-break-inside: avoid !important; break-inside: avoid !important;">
            <tr>
              <td style="width: 33.33% !important; text-align: center; vertical-align: top; border: none; padding: 0 8px;">
                <div style="font-weight: 800; font-size: 8pt; color: #0f172a; text-transform: uppercase;">PEMBERI TUGAS / OWNER</div>
                <div style="font-size: 7pt; color: #475569; margin-bottom: 2px;">Menyetujui &amp; Menetapkan:</div>
                <div style="height: 40px;"></div>
                <div style="font-weight: 700; font-size: 8pt; color: #0f172a; margin-bottom: 3px; text-decoration: none !important;">( ${ownerName} )</div>
                <div style="font-size: 7pt; color: #64748b;">${ownerTitle}</div>
              </td>
              <td style="width: 33.33% !important; text-align: center; vertical-align: top; border: none; padding: 0 8px;">
                <div style="font-weight: 800; font-size: 8pt; color: #0f172a; text-transform: uppercase;">KONSULTAN PERENCANA</div>
                <div style="font-size: 7pt; color: #475569; margin-bottom: 2px;">Direncanakan / Diawasi:</div>
                <div style="height: 40px;"></div>
                <div style="font-weight: 700; font-size: 8pt; color: #0f172a; margin-bottom: 3px; text-decoration: none !important;">( ${consultantSigner} )</div>
                <div style="font-size: 7pt; color: #64748b;">${consultantCompany}</div>
              </td>
              <td style="width: 33.33% !important; text-align: center; vertical-align: top; border: none; padding: 0 8px;">
                <div style="font-weight: 800; font-size: 8pt; color: #0f172a; text-transform: uppercase;">KONTRAKTOR PELAKSANA</div>
                <div style="font-size: 7pt; color: #475569; margin-bottom: 2px;">Diajukan:</div>
                <div style="height: 40px;"></div>
                <div style="font-weight: 700; font-size: 8pt; color: #0f172a; margin-bottom: 3px; text-decoration: none !important;">( ${contractorSigner} )</div>
                <div style="font-size: 7pt; color: #64748b;">${contractorTitle} &bull; ${contractorCompany}</div>
              </td>
            </tr>
          </table>

          <!-- 8. Running Footer Standar Dokumen Sah -->
          <!-- 8. Running Footer Standar Dokumen Sah - Dihapus Sesuai Mandat Single Page Tanpa Penomoran -->      </div>
        </div>

      </div>
    `;
  }

  // Menghasilkan Draft Skema Pembagian Termin Pembayaran Standar Konstruksi
  function getTerminScheme(project = null) {
    const proj = project || (window.ProjectManager && window.ProjectManager.getActiveProject()) || {};
    
    // Inisialisasi skema termin jika belum ada di objek proyek
    if (!proj.terminSchemes || !Array.isArray(proj.terminSchemes) || proj.terminSchemes.length === 0) {
      proj.terminSchemes = getDefaultTerminSchemes();
      if (window.ProjectManager && proj.id) {
        window.ProjectManager.updateActiveProject(proj);
      }
    }

    const rabCalc = window.RabCalculator ? window.RabCalculator.calculateProjectRab(proj) : null;
    let contractTotal = 0;
    if (rabCalc && rabCalc.grandTotal > 0) {
      contractTotal = rabCalc.grandTotal;
    } else if (Number(proj.contractBudget) > 0) {
      contractTotal = Number(proj.contractBudget);
    } else if (Number(proj.grandTotal) > 0) {
      contractTotal = Number(proj.grandTotal);
    } else {
      let divSum = 0;
      (proj.divisions || []).forEach(d => (d.items || []).forEach(it => {
        divSum += (Number(it.volume) || 0) * (Number(it.price) || 0);
      }));
      const pRate = (proj.ppnRate !== undefined && proj.ppnRate !== null) ? Number(proj.ppnRate) : 0;
      contractTotal = divSum > 0 ? Math.round(divSum * (1 + (pRate / 100))) : 0;
    }

    const ppnRate = (proj.ppnRate !== undefined && proj.ppnRate !== null) ? Number(proj.ppnRate) : 0;
    const isPpn = (proj.includePpn !== false);
    const pStart = new Date(proj.startDate || "2026-04-01");

    return proj.terminSchemes.map((s, idx) => {
      const phaseIndex = s.phaseIndex || (idx + 1);
      const portion = Number(s.portionPercent) || 0;
      const grossAmount = Math.round(contractTotal * (portion / 100));
      const dpDeduction = Math.round(grossAmount * ((Number(s.dpDeductionPercent) || 0) / 100));
      const retentionDeduction = Math.round(grossAmount * ((Number(s.retentionPercent) || 0) / 100));
      const netBeforeTax = grossAmount - dpDeduction - retentionDeduction;
      const ppnAmount = isPpn ? Math.round(netBeforeTax * (ppnRate / 100)) : 0;
      const netPayable = netBeforeTax + ppnAmount;

      const offsetDays = Number(s.targetDateOffsetDays) || (phaseIndex * 35);
      const tDate = new Date(pStart.getTime() + (offsetDays * 24 * 60 * 60 * 1000));
      const targetDateStr = tDate.toISOString().split('T')[0];

      // Cek apakah sudah pernah diterbitkan di bapRecords
      const existingBap = (proj.bapRecords || []).find(b => 
        b.phaseTitle.toLowerCase().includes(`termin ${['i','ii','iii','iv','v','vi','vii','viii','ix','x'][phaseIndex - 1]}`) ||
        b.phaseTitle.toLowerCase().includes(`termin ${phaseIndex}`) ||
        b.bapNumber.includes(`0${phaseIndex}-00${phaseIndex}`)
      );

      return {
        ...s,
        phaseIndex,
        contractTotal,
        grossAmount,
        dpDeduction,
        retentionDeduction,
        netBeforeTax,
        ppnAmount,
        netPayable,
        targetDateStr,
        isIssued: !!existingBap,
        bapNumber: existingBap ? existingBap.bapNumber : `BAP/${getContractorAcronym(proj)}/${new Date().getFullYear()}/0${phaseIndex}-00${phaseIndex}`,
        bapStatus: existingBap ? (existingBap.status || "Diterbitkan") : "Belum Diterbitkan",
        existingBapId: existingBap ? (existingBap.id || existingBap.bapNumber) : null
      };
    });
  }

  function addTerminScheme(data) {
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (!proj) return null;
    if (!proj.terminSchemes) proj.terminSchemes = getDefaultTerminSchemes();

    const newIndex = proj.terminSchemes.length + 1;
    const newScheme = {
      phaseIndex: newIndex,
      title: data.title || `Termin ${newIndex} - Progres Tambahan`,
      targetProgress: Number(data.targetProgress) || 50,
      portionPercent: Number(data.portionPercent) || 20,
      criteria: data.criteria || "Penyelesaian tahapan pekerjaan fisik lapangan",
      notes: data.notes || "",
      dpDeductionPercent: Number(data.dpDeductionPercent) || 0,
      retentionPercent: Number(data.retentionPercent) || 5,
      targetDateOffsetDays: Number(data.targetDateOffsetDays) || (newIndex * 30)
    };

    proj.terminSchemes.push(newScheme);
    window.ProjectManager.updateActiveProject(proj);
    return newScheme;
  }

  function updateTerminScheme(phaseIndex, data) {
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (!proj || !proj.terminSchemes) return false;

    const idx = proj.terminSchemes.findIndex(s => s.phaseIndex === phaseIndex);
    if (idx === -1) return false;

    const current = proj.terminSchemes[idx];
    if (data.title) current.title = data.title;
    if (data.targetProgress !== undefined) current.targetProgress = Number(data.targetProgress);
    if (data.portionPercent !== undefined) current.portionPercent = Number(data.portionPercent);
    if (data.criteria !== undefined) current.criteria = data.criteria;
    if (data.notes !== undefined) current.notes = data.notes;
    if (data.dpDeductionPercent !== undefined) current.dpDeductionPercent = Number(data.dpDeductionPercent);
    if (data.retentionPercent !== undefined) current.retentionPercent = Number(data.retentionPercent);
    if (data.targetDateOffsetDays !== undefined) current.targetDateOffsetDays = Number(data.targetDateOffsetDays);

    proj.terminSchemes[idx] = current;
    window.ProjectManager.updateActiveProject(proj);
    return current;
  }

  function deleteTerminScheme(phaseIndex) {
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (!proj || !proj.terminSchemes) return false;

    proj.terminSchemes = proj.terminSchemes.filter(s => s.phaseIndex !== phaseIndex);
    // Re-index
    proj.terminSchemes.forEach((s, i) => {
      s.phaseIndex = i + 1;
    });

    window.ProjectManager.updateActiveProject(proj);
    return true;
  }

  function resetTerminSchemeToDefault() {
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (!proj) return false;

    proj.terminSchemes = getDefaultTerminSchemes();
    window.ProjectManager.updateActiveProject(proj);
    return true;
  }

  function createBapFromScheme(phaseIndex) {
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (!proj) return null;
    const schemes = getTerminScheme(proj);
    const item = schemes.find(s => s.phaseIndex === phaseIndex);
    if (!item) return null;

    if (!proj.bapRecords) proj.bapRecords = [];
    const existingIdx = proj.bapRecords.findIndex(b => 
      b.bapNumber === item.bapNumber || 
      b.phaseTitle.includes(`Termin ${phaseIndex}`) ||
      (item.phaseIndex <= 5 && b.phaseTitle.includes(`Termin ${['I','II','III','IV','V'][phaseIndex - 1]}`))
    );

    const newRecord = {
      id: `BAP-${Date.now().toString(36).toUpperCase()}`,
      bapNumber: item.bapNumber,
      date: item.targetDateStr,
      phaseTitle: item.title,
      physicalProgressPercent: item.targetProgress,
      claimedPercent: item.portionPercent,
      grossAmount: item.grossAmount,
      dpDeduction: item.dpDeduction,
      retentionDeduction: item.retentionDeduction,
      netBeforeTax: item.netBeforeTax,
      ppnAmount: item.ppnAmount,
      netPayable: item.netPayable,
      status: phaseIndex <= 2 ? (phaseIndex === 1 ? "Lunas / Dibayar" : "Pengajuan Disetujui") : "Siap Diajukan",
      paymentDate: item.targetDateStr,
      notes: item.notes,
      manualNotes: ""
    };

    if (existingIdx >= 0) {
      newRecord.id = proj.bapRecords[existingIdx].id || newRecord.id;
      proj.bapRecords[existingIdx] = newRecord;
    } else {
      proj.bapRecords.push(newRecord);
    }

    window.ProjectManager.updateActiveProject(proj);
    return newRecord;
  }

  return {
    getDefaultTerminSchemes,
    getBapRecords,
    calculateBapValues,
    addBapRecord,
    updateBapRecord,
    deleteBapRecord,
    generatePrintableBapHtml,
    getTerminScheme,
    addTerminScheme,
    updateTerminScheme,
    deleteTerminScheme,
    resetTerminSchemeToDefault,
    createBapFromScheme
  };
})();
