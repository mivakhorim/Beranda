/**
 * Site Correction Module (Lembar Koreksi Proyek & Pengawasan Lapangan)
 * Format Pengawasan Mutu Pekerjaan Fisik Lapangan
 * Memuat: Catatan Temuan Teknis, Instruksi Perbaikan, Kolom Tertulis Manual,
 * dan Blok Paraf Mandor / Pengawas Lapangan
 * Kepatuhan Negative Prompt: Border minimalis bersih tanpa kotak bertingkat
 */

window.SiteCorrection = (function() {
  function getInspections() {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return [];
    if (!proj.siteInspections) proj.siteInspections = [];
    return proj.siteInspections;
  }

  function addInspection(data) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return null;
    if (!proj.siteInspections) proj.siteInspections = [];

    const newInsp = {
      id: `INSP-${Date.now().toString(36).toUpperCase()}`,
      date: data.date || new Date().toISOString().split('T')[0],
      itemCode: data.itemCode || "1.1",
      itemName: data.itemName || "Item Pekerjaan",
      inspector: data.inspector || "Pengawas Lapangan",
      foreman: data.foreman || "Mandor Pelaksana",
      findings: data.findings || "",
      correctionAction: data.correctionAction || "",
      targetDate: data.targetDate || data.date,
      status: data.status || "In Progress",
      foremanInitial: data.foremanInitial || ""
    };

    proj.siteInspections.push(newInsp);
    window.ProjectManager.updateActiveProject(proj);
    return newInsp;
  }

  function updateInspection(id, updatedFields) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !proj.siteInspections) return false;

    const insp = proj.siteInspections.find(i => i.id === id);
    if (insp) {
      Object.assign(insp, updatedFields);
      window.ProjectManager.updateActiveProject(proj);
      return true;
    }
    return false;
  }

  function deleteInspection(id) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !proj.siteInspections) return false;

    proj.siteInspections = proj.siteInspections.filter(i => i.id !== id);
    window.ProjectManager.updateActiveProject(proj);
    return true;
  }

  // Generate HTML Lembar Koreksi Siap Cetak A4 (dengan kolom aksi hapus saat di layar)
  function generatePrintableSheetHtml(projectInfo = null, isInteractive = true) {
    const proj = projectInfo || (window.ProjectManager && window.ProjectManager.getActiveProject()) || {};
    const sig = proj.signatories || {};
    const qcName = sig.qcInspectorName || "Ir. M. Ridwan";
    const qcRole = sig.qcInspectorRole || "Konsultan Pengawas / QC";
    const mandorName = sig.fieldMandorName || "Sutarji / Warsito";
    const mandorRole = sig.fieldMandorRole || "Mandor Lapangan";
    const smName = sig.siteManagerName || "Ir. Hendra Prasetya";
    const smRole = sig.siteManagerRole || "Site Manager Kontraktor";
    const qualityNotes = proj.siteQualityNotes || "";

    const inspections = getInspections();

    let rowsHtml = "";
    inspections.forEach((insp, idx) => {
      let stBadge = insp.status === "Approved" ? "text-success font-bold" : "text-warning";
      rowsHtml += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>${insp.date}</td>
          <td><strong>${insp.itemCode}</strong><br><small class="text-muted">${insp.itemName}</small></td>
          <td>${insp.findings}</td>
          <td>${insp.correctionAction}</td>
          <td class="text-center">${insp.targetDate}</td>
          <td class="text-center ${stBadge}">${insp.status}</td>
          <td class="text-center initial-box">${insp.foremanInitial ? `<span class="paraf-stamp">${insp.foremanInitial}</span>` : '<span class="paraf-line"></span>'}</td>
          ${isInteractive ? `<td class="text-center no-print">
            <button class="btn btn-sm btn-danger" onclick="App.deleteInspection('${insp.id}')" title="Hapus Catatan Koreksi">Hapus</button>
          </td>` : ''}
        </tr>
      `;
    });

    return `
      <div class="printable-inspection-doc a4-portrait">

        <div class="print-doc-header text-center mb-4 no-print">
          <h2 class="doc-title">LEMBAR PENGAWASAN & KOREKSI MUTU PEKERJAAN</h2>
          <div class="doc-subtitle">Quality Control & Site Correction Log</div>
          <div class="doc-meta-line">Proyek: <strong>${proj.name || 'Proyek'}</strong> | Lokasi: ${proj.location || 'Indonesia'}</div>
        </div>

        <table class="table table-bordered print-compact-table mb-4">
          <thead>
            <tr class="table-header-row">
              <th style="width: 4%">No</th>
              <th style="width: 10%">Tanggal</th>
              <th style="width: 22%">Item Pekerjaan</th>
              <th style="width: 24%">Catatan Temuan / Defek Lapangan</th>
              <th style="width: 22%">Instruksi Tindak Lanjut Perbaikan</th>
              <th style="width: 9%">Batas Waktu</th>
              <th style="width: 9%">Status</th>
              <th style="width: 8%">Paraf Mandor</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="8" class="text-center p-3 text-muted">Belum ada catatan koreksi lapangan.</td></tr>'}
          </tbody>
        </table>

        <!-- Area Catatan Lapangan Manual Tambahan -->
        <div class="manual-notes-section mb-4">
          <div class="section-subheading" style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">Catatan Tambahan & Instruksi Khusus Pengawas:</div>
          ${qualityNotes ? `<div style="background: #f8fafc; border: 1px dashed #94a3b8; border-radius: 4px; padding: 10px 14px; font-size: 11px; margin-bottom: 10px; color: #1e293b; line-height: 1.5;">${qualityNotes}</div>` : ''}
          <div class="blank-lines-container">
            <div class="blank-line"></div>
            <div class="blank-line"></div>
            <div class="blank-line"></div>
          </div>
        </div>

        <!-- Kolom Tanda Tangan 3 Kolom Sejajar Horizontal Rapi & Profesional (Anti-Bersusun Vertikal) -->
        <table class="signature-clean-table" style="width: 100% !important; border-collapse: collapse !important; border: none !important; background: transparent !important; margin-top: 28pt !important; page-break-inside: avoid !important; break-inside: avoid !important;">
          <tr style="border: none !important; background: transparent !important;">
            <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 10px !important; background: transparent !important;">
              <div style="font-weight: 800; font-size: 8.5pt; color: #1e293b; margin-bottom: 4px; text-transform: uppercase;">${qcRole}</div>
              <div style="height: 52px;"></div>
              <div style="font-weight: 700; font-size: 8.5pt; color: #0f172a; text-decoration: none !important; border-bottom: none !important;">( ${qcName} )</div>
              <div style="font-size: 7.5pt; color: #475569; margin-top: 2px;">Site Inspector / QC</div>
            </td>
            <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 10px !important; background: transparent !important;">
              <div style="font-weight: 800; font-size: 8.5pt; color: #1e293b; margin-bottom: 4px; text-transform: uppercase;">${mandorRole}</div>
              <div style="height: 52px;"></div>
              <div style="font-weight: 700; font-size: 8.5pt; color: #0f172a; text-decoration: none !important; border-bottom: none !important;">( ${mandorName} )</div>
              <div style="font-size: 7.5pt; color: #475569; margin-top: 2px;">Pelaksana Harian</div>
            </td>
            <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 10px !important; background: transparent !important;">
              <div style="font-weight: 800; font-size: 8.5pt; color: #1e293b; margin-bottom: 4px; text-transform: uppercase;">${smRole}</div>
              <div style="height: 52px;"></div>
              <div style="font-weight: 700; font-size: 8.5pt; color: #0f172a; text-decoration: none !important; border-bottom: none !important;">( ${smName} )</div>
              <div style="font-size: 7.5pt; color: #475569; margin-top: 2px;">Penanggung Jawab Teknis</div>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  return {
    getInspections,
    addInspection,
    updateInspection,
    deleteInspection,
    generatePrintableSheetHtml
  };
})();
