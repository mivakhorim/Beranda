/**
 * RAB Calculator Module
 * Menghitung Rekapitulasi Rencana Anggaran Biaya, Rincian Detail per Divisi,
 * Bobot %, PPN (11%/12%), dan Terbilang Rupiah
 */

window.RabCalculator = (function() {
  function calculateDivisionTotals(division) {
    let subtotal = 0;
    (division.items || []).forEach(item => {
      const vol = Number(item.volume) || 0;
      const price = Number(item.price !== undefined ? item.price : item.unitPrice) || 0;
      const total = Math.round(vol * price);
      item.total = total;
      subtotal += total;
    });
    division.subtotal = subtotal;
    return subtotal;
  }

  function calculateProjectRab(project = null) {
    const proj = project || window.ProjectManager.getActiveProject();
    if (!proj) return null;

    let divisionSum = 0;
    const divisionSummaries = [];

    (proj.divisions || []).forEach(div => {
      const subtotal = calculateDivisionTotals(div);
      divisionSum += subtotal;
      divisionSummaries.push({
        id: div.id,
        code: div.code,
        name: div.name,
        subtotal: subtotal,
        itemCount: (div.items || []).length
      });
    });

    // Hitung total direct cost & overhead amount
    let totalDirectCost = 0;
    const currentOverhead = (proj.overheadRate !== undefined && proj.overheadRate !== null && !isNaN(Number(proj.overheadRate)))
      ? Number(proj.overheadRate)
      : ((proj.overheadPercent !== undefined && proj.overheadPercent !== null && !isNaN(Number(proj.overheadPercent))) ? Number(proj.overheadPercent) : 15);
    (proj.divisions || []).forEach(div => {
      (div.items || []).forEach(itm => {
        const vol = Number(itm.volume) || 0;
        let itmPrice = Number(itm.price !== undefined ? itm.price : itm.unitPrice) || 0;
        let direct = itm.directCost;
        // Direct cost tidak boleh undefined, null, NaN, <= 0, atau >= itmPrice (karena harga jual sudah mencakup overhead)
        if (direct === undefined || direct === null || isNaN(direct) || direct <= 0 || direct >= itmPrice) {
          if (window.AhspEngine) {
            const ahsp = window.AhspEngine.getAhspById(itm.ahspId || itm.code, itm);
            if (ahsp) {
              const hspInfo = window.AhspEngine.calculateHsp(ahsp, currentOverhead);
              direct = hspInfo.dTotal;
            }
          }
          if (!direct || direct >= itmPrice || direct <= 0) {
            direct = Math.round(itmPrice / (1 + (currentOverhead / 100)));
          }
          itm.directCost = direct;
        }
        totalDirectCost += Math.round(direct * vol);
      });
    });

    // Pastikan realCost konsisten dengan total subtotal divisi
    let realCost = divisionSum > 0 ? divisionSum : (totalDirectCost + Math.round(totalDirectCost * (currentOverhead / 100)));
    // Total direct cost harus selalu lebih kecil dari realCost dan > 0 jika realCost > 0
    if (totalDirectCost <= 0 || totalDirectCost >= realCost) {
      totalDirectCost = Math.round(realCost / (1 + (currentOverhead / 100)));
    }
    const overheadAmount = Math.max(0, realCost - totalDirectCost);

    // Hitung bobot (%) tiap divisi terhadap realCost total
    divisionSummaries.forEach(div => {
      div.weightPercent = realCost > 0 ? (div.subtotal / realCost) * 100 : 0;
    });

    const includePpn = proj.includePpn !== false && proj.includeTax !== false;
    const ppnRate = (proj.ppnRate !== undefined && proj.ppnRate !== null && !isNaN(Number(proj.ppnRate))) 
      ? Number(proj.ppnRate) 
      : ((proj.ppnPercent !== undefined && proj.ppnPercent !== null && !isNaN(Number(proj.ppnPercent))) ? Number(proj.ppnPercent) : 11);
    const ppnAmount = includePpn ? Math.round(realCost * (ppnRate / 100)) : 0;
    const grandTotal = Math.round(realCost + ppnAmount);
    const terbilangStr = (window.CurrencyUtil && window.CurrencyUtil.terbilang)
      ? window.CurrencyUtil.terbilang(grandTotal)
      : "";

    // Hitung Biaya Konstruksi per m2 (Cost per m2) berbasis Luas Rencana Baru / Luas Rehab
    const isRehab = proj.projectType === 'rehab';
    const effectiveArea = isRehab 
      ? (Number(proj.rehabArea) || Number(proj.buildingArea) || 0)
      : (Number(proj.buildingArea) || 0);
    
    const costPerM2 = effectiveArea > 0 ? Math.round(grandTotal / effectiveArea) : 0;
    const costPerM2Real = effectiveArea > 0 ? Math.round(realCost / effectiveArea) : 0;

    proj.realCost = realCost;
    proj.totalDirectCost = totalDirectCost;
    proj.overheadAmount = overheadAmount;
    proj.ppnAmount = ppnAmount;
    proj.taxAmount = ppnAmount;
    proj.grandTotal = grandTotal;
    proj.roundedCost = grandTotal;
    proj.costPerM2 = costPerM2;
    proj.costPerM2Real = costPerM2Real;
    proj.effectiveArea = effectiveArea;

    return {
      realCost,
      totalDirectCost,
      overheadAmount,
      overheadPercent: currentOverhead,
      divisionSummaries,
      includePpn,
      ppnRate,
      ppnAmount,
      taxAmount: ppnAmount,
      grandTotal,
      roundedCost: grandTotal,
      terbilangStr,
      costPerM2,
      costPerM2Real,
      effectiveArea,
      isRehab
    };
  }

  function addItemToDivision(divisionId, itemData) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !proj.divisions) return null;

    const div = proj.divisions.find(d => d.id === divisionId);
    if (!div) return null;

    if (!div.items) div.items = [];
    const newItem = {
      id: `ITM-${Date.now().toString(36).toUpperCase()}`,
      code: itemData.code || "1.1",
      ahspId: itemData.ahspId || "",
      name: itemData.name || "Pekerjaan Baru",
      unit: itemData.unit || "m2",
      volume: Number(itemData.volume) || 1,
      price: Number(itemData.price) || 0,
      notes: itemData.notes || ""
    };
    newItem.total = Math.round(newItem.volume * newItem.price);
    div.items.push(newItem);

    // Sinkronisasi otomatis ke Volume Analysis
    if (window.VolumeAnalysis) {
      window.VolumeAnalysis.syncWithRabItems();
    }

    window.ProjectManager.updateActiveProject(proj);
    return newItem;
  }

  function updateItem(itemId, updatedFields) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !proj.divisions) return false;

    let found = false;
    proj.divisions.forEach(div => {
      const itm = (div.items || []).find(i => i.id === itemId);
      if (itm) {
        Object.assign(itm, updatedFields);
        if (itm.volume !== undefined || itm.price !== undefined) {
          itm.total = Math.round((Number(itm.volume) || 0) * (Number(itm.price) || 0));
        }
        found = true;
      }
    });

    if (found) {
      window.ProjectManager.updateActiveProject(proj);
    }
    return found;
  }

  function removeItem(itemId) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !proj.divisions) return false;

    let removed = false;
    proj.divisions.forEach(div => {
      const prevLen = (div.items || []).length;
      div.items = (div.items || []).filter(i => i.id !== itemId);
      if (div.items.length < prevLen) {
        removed = true;
      }
    });

    if (removed) {
      if (window.VolumeAnalysis) {
        window.VolumeAnalysis.removeCalculation(itemId);
      }
      window.ProjectManager.updateActiveProject(proj);
    }
    return removed;
  }

  function addDivision(name, code = "") {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return null;
    if (!proj.divisions) proj.divisions = [];

    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];
    const autoCode = code || (romanNumerals[proj.divisions.length] || `${proj.divisions.length + 1}`);

    const newDiv = {
      id: `DIV-${Date.now().toString(36).toUpperCase()}`,
      code: autoCode,
      name: name.toUpperCase(),
      items: []
    };
    proj.divisions.push(newDiv);
    window.ProjectManager.updateActiveProject(proj);
    return newDiv;
  }

  function updateDivision(divisionId, data) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !proj.divisions) return false;
    const div = proj.divisions.find(d => d.id === divisionId);
    if (!div) return false;
    if (data.code !== undefined && data.code !== null) div.code = String(data.code).trim();
    if (data.name !== undefined && data.name !== null) div.name = String(data.name).trim().toUpperCase();
    window.ProjectManager.updateActiveProject(proj);
    return true;
  }

  function removeDivision(divisionId) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !proj.divisions) return false;
    if (proj.divisions.length <= 1) {
      if (window.showNotificationModal) {
        window.showNotificationModal({
          title: "Perhatian",
          subtitle: "Hapus Divisi",
          icon: "⚠️",
          type: "warning",
          contentHtml: "<p>Tidak dapat menghapus divisi terakhir dalam proyek.</p>"
        });
      } else {
        alert("Tidak dapat menghapus divisi terakhir.");
      }
      return false;
    }
    proj.divisions = proj.divisions.filter(d => d.id !== divisionId);
    window.ProjectManager.updateActiveProject(proj);
    return true;
  }

  
  // Preview kalkulasi ulang cepat tanpa merubah state proyek (untuk live input feedback di tab Info Proyek)
  function previewProjectRecalculation(project = null, testOverhead = null, testPpn = null) {
    const proj = project || (window.ProjectManager ? window.ProjectManager.getActiveProject() : null);
    if (!proj) return null;

    const ovRate = (testOverhead !== null && testOverhead !== undefined && !isNaN(Number(testOverhead))) 
      ? Number(testOverhead) 
      : ((proj.overheadRate !== undefined && proj.overheadRate !== null && !isNaN(Number(proj.overheadRate))) ? Number(proj.overheadRate) : 15);
    const pRate = (testPpn !== null && testPpn !== undefined && !isNaN(Number(testPpn))) 
      ? Number(testPpn) 
      : ((proj.ppnRate !== undefined && proj.ppnRate !== null && !isNaN(Number(proj.ppnRate))) ? Number(proj.ppnRate) : 11);

    let totalDirectCost = 0;

    (proj.divisions || []).forEach(div => {
      let divSubtotal = 0;
      (div.items || []).forEach(itm => {
        const vol = Number(itm.volume) || 0;
        let itmPrice = Number(itm.price) || 0;

        let ahsp = null;
        if (window.AhspEngine) {
          ahsp = window.AhspEngine.getAhspById(itm.ahspId || itm.code, itm);
        }

        if (ahsp) {
          const hspInfo = window.AhspEngine.calculateHsp(ahsp, ovRate);
          itmPrice = hspInfo.finalHsp;
          totalDirectCost += (hspInfo.dTotal * vol);
        } else {
          let baseDirect = itm.directCost;
          if (!baseDirect || isNaN(baseDirect) || baseDirect <= 0 || baseDirect >= itmPrice) {
            baseDirect = Math.round(itmPrice / (1 + (ovRate / 100)));
          }
          itmPrice = Math.floor(baseDirect * (1 + (ovRate / 100)));
          totalDirectCost += (baseDirect * vol);
        }
        divSubtotal += Math.round(vol * itmPrice);
      });
    });

    const overheadAmount = Math.round(totalDirectCost * (ovRate / 100));
    const realCost = totalDirectCost + overheadAmount;
    const includePpn = proj.includePpn !== false;
    const ppnAmount = includePpn ? Math.round(realCost * (pRate / 100)) : 0;
    const grandTotal = Math.round(realCost + ppnAmount);
    const terbilangStr = (window.CurrencyUtil && window.CurrencyUtil.terbilang) 
      ? window.CurrencyUtil.terbilang(grandTotal) 
      : "";

    const isRehab = proj.projectType === 'rehab';
    const effectiveArea = isRehab 
      ? (Number(proj.rehabArea) || Number(proj.buildingArea) || 0)
      : (Number(proj.buildingArea) || 0);
    const costPerM2 = effectiveArea > 0 ? Math.round(grandTotal / effectiveArea) : 0;
    const costPerM2Real = effectiveArea > 0 ? Math.round(realCost / effectiveArea) : 0;

    return {
      totalDirectCost,
      overheadPercent: ovRate,
      overheadAmount,
      realCost,
      ppnRate: pRate,
      ppnAmount,
      taxAmount: ppnAmount,
      grandTotal,
      roundedCost: grandTotal,
      terbilangStr,
      costPerM2,
      costPerM2Real,
      effectiveArea,
      isRehab
    };
  }

  // Hitung ulang seluruh data proyek (HSP per item, subtotal divisi, realCost, PPN, grand total)
  // Dipanggil saat tombol simpan diklik atau profit/pajak diubah
  function recalculateProjectRabSettings(project = null, newOverheadRate = null, newPpnRate = null) {
    const proj = project || (window.ProjectManager ? window.ProjectManager.getActiveProject() : null);
    if (!proj) return null;

    if (newOverheadRate !== null && newOverheadRate !== undefined && !isNaN(newOverheadRate)) {
      proj.overheadRate = Number(newOverheadRate);
    }
    if (newPpnRate !== null && newPpnRate !== undefined && !isNaN(newPpnRate)) {
      proj.ppnRate = Number(newPpnRate);
    }

    const currentOverhead = (proj.overheadRate !== undefined && proj.overheadRate !== null && !isNaN(Number(proj.overheadRate))) ? Number(proj.overheadRate) : 15;
    const currentPpn = (proj.ppnRate !== undefined && proj.ppnRate !== null && !isNaN(Number(proj.ppnRate))) ? Number(proj.ppnRate) : 11;

    let totalDirectCost = 0;
    let realCost = 0;

    (proj.divisions || []).forEach(div => {
      let divSubtotal = 0;
      (div.items || []).forEach(itm => {
        const vol = Number(itm.volume) || 0;
        let itmPrice = Number(itm.price) || 0;

        let ahsp = null;
        if (window.AhspEngine) {
          ahsp = window.AhspEngine.getAhspById(itm.ahspId || itm.code, itm);
        }

        if (ahsp) {
          const hspInfo = window.AhspEngine.calculateHsp(ahsp, currentOverhead);
          itmPrice = hspInfo.finalHsp;
          itm.price = itmPrice;
          itm.directCost = hspInfo.dTotal;
          totalDirectCost += (hspInfo.dTotal * vol);
        } else {
          let baseDirect = itm.directCost;
          if (!baseDirect || isNaN(baseDirect) || baseDirect <= 0 || baseDirect >= itmPrice) {
            baseDirect = Math.round(itmPrice / (1 + (currentOverhead / 100)));
          }
          itm.directCost = baseDirect;
          itmPrice = Math.floor(baseDirect * (1 + (currentOverhead / 100)));
          itm.price = itmPrice;
          totalDirectCost += (baseDirect * vol);
        }

        const itmTotal = Math.round(vol * itmPrice);
        itm.total = itmTotal;
        divSubtotal += itmTotal;
      });

      div.subtotal = divSubtotal;
      realCost += divSubtotal;
    });

    // Hitung bobot tiap divisi
    (proj.divisions || []).forEach(div => {
      div.weightPercent = realCost > 0 ? (div.subtotal / realCost) * 100 : 0;
    });

    const overheadAmount = Math.round(totalDirectCost * (currentOverhead / 100));
    realCost = totalDirectCost + overheadAmount;
    const includePpn = proj.includePpn !== false;
    const ppnAmount = includePpn ? Math.round(realCost * (currentPpn / 100)) : 0;
    const grandTotal = Math.round(realCost + ppnAmount);
    const terbilangStr = (window.CurrencyUtil && window.CurrencyUtil.terbilang) 
      ? window.CurrencyUtil.terbilang(grandTotal) 
      : "";

    const isRehab = proj.projectType === 'rehab';
    const effectiveArea = isRehab 
      ? (Number(proj.rehabArea) || Number(proj.buildingArea) || 0)
      : (Number(proj.buildingArea) || 0);
    const costPerM2 = effectiveArea > 0 ? Math.round(grandTotal / effectiveArea) : 0;
    const costPerM2Real = effectiveArea > 0 ? Math.round(realCost / effectiveArea) : 0;

    proj.realCost = realCost;
    proj.totalDirectCost = totalDirectCost;
    proj.overheadAmount = overheadAmount;
    proj.ppnAmount = ppnAmount;
    proj.grandTotal = grandTotal;
    proj.costPerM2 = costPerM2;
    proj.costPerM2Real = costPerM2Real;
    proj.effectiveArea = effectiveArea;

    if (window.ProjectManager) {
      window.ProjectManager.updateActiveProject(proj);
    }
    if (window.SCurveDiagram) {
      window.SCurveDiagram.calculateScheduleFromCalendar(proj);
    }

    return {
      totalDirectCost,
      overheadPercent: currentOverhead,
      overheadAmount,
      realCost,
      ppnRate: currentPpn,
      ppnAmount,
      taxAmount: ppnAmount,
      grandTotal,
      roundedCost: grandTotal,
      terbilangStr,
      costPerM2,
      costPerM2Real,
      effectiveArea,
      isRehab
    };
  }

  return {
    calculateDivisionTotals,
    calculateProjectRab,
    previewProjectRecalculation,
    recalculateProjectRabSettings,
    addItemToDivision,
    updateItem,
    removeItem,
    addDivision,
    updateDivision,
    removeDivision
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.RabCalculator;
}
