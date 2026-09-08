/**
 * Volume Analysis Module (Direct Volume Input Sheet)
 * Standar PUPR SE Bina Konstruksi No. 47/SE/Dk/2026
 * Penginputan volume pekerjaan secara mandiri (eksternal calculation) tanpa dimensi kaku.
 * Terhubung langsung secara real-time ke baris item pekerjaan pada Rencana Anggaran Biaya (RAB).
 */

window.VolumeAnalysis = (function() {
  function getVolumeCalculations() {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return [];
    if (!proj.volumeCalculations) {
      proj.volumeCalculations = [];
    }
    return proj.volumeCalculations;
  }

  function saveVolume(itemId, volume, notes) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return;
    if (!proj.volumeCalculations) proj.volumeCalculations = [];

    const numVol = Math.max(0, Number(volume) || 0);
    const existingIdx = proj.volumeCalculations.findIndex(c => c.itemId === itemId);

    if (existingIdx !== -1) {
      proj.volumeCalculations[existingIdx].totalVolume = numVol;
      if (notes !== undefined && notes !== null) {
        proj.volumeCalculations[existingIdx].notes = notes;
      }
    } else {
      proj.volumeCalculations.push({
        itemId: itemId,
        totalVolume: numVol,
        notes: notes || 'Perhitungan Mandiri'
      });
    }

    // Sinkronkan volume langsung ke item pada Divisi RAB terkait
    if (proj.divisions) {
      proj.divisions.forEach(div => {
        (div.items || []).forEach(itm => {
          if (itm.id === itemId) {
            itm.volume = numVol;
          }
        });
      });
    }

    window.ProjectManager.updateActiveProject(proj);
    return numVol;
  }

  function removeCalculation(itemId) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !proj.volumeCalculations) return;
    proj.volumeCalculations = proj.volumeCalculations.filter(c => c.itemId !== itemId);
    window.ProjectManager.updateActiveProject(proj);
  }

  // Sinkronisasi otomatis: sinkronkan daftar seluruh item divisi RAB ke tabel volume
  function syncWithRabItems() {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !proj.divisions) return [];
    if (!proj.volumeCalculations) proj.volumeCalculations = [];

    const existingMap = {};
    proj.volumeCalculations.forEach(c => existingMap[c.itemId] = c);

    const updatedList = [];
    proj.divisions.forEach(div => {
      (div.items || []).forEach(itm => {
        const existing = existingMap[itm.id];
        const rabVolume = (itm.volume !== undefined && itm.volume !== null && !isNaN(Number(itm.volume))) 
          ? Number(itm.volume) 
          : ((existing && existing.totalVolume !== undefined) ? Number(existing.totalVolume) : 0);

        updatedList.push({
          divisionCode: div.code,
          divisionName: div.name,
          itemId: itm.id,
          itemCode: itm.code,
          itemName: itm.name,
          unit: itm.unit,
          totalVolume: rabVolume,
          notes: (existing && existing.notes) ? existing.notes : (itm.notes || 'Hasil perhitungan mandiri CAD / As-Built')
        });
      });
    });

    proj.volumeCalculations = updatedList;
    window.ProjectManager.updateActiveProject(proj);
    return proj.volumeCalculations;
  }

  return {
    getVolumeCalculations,
    saveVolume,
    removeCalculation,
    syncWithRabItems
  };
})();
