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
      const price = Number(item.price !== undefined ? item.price : (item.unitPrice !== undefined ? item.unitPrice : item.hsp)) || 0;
      const total = Math.round(vol * price);
      item.total = total;
      subtotal += total;
    });
    division.subtotal = subtotal;
    return subtotal;
  }

  function calculateProjectRab(project = null) {
    const proj = project || (window.ProjectManager ? window.ProjectManager.getActiveProject() : null);
    if (!proj) {
      return {
        totalDirectCost: 0,
        overheadPercent: 0,
        overheadAmount: 0,
        realCost: 0,
        ppnRate: 0,
        ppnAmount: 0,
        taxAmount: 0,
        grandTotal: 0,
        roundedCost: 0,
        terbilangStr: "Nol Rupiah",
        costPerM2: 0,
        costPerM2Real: 0,
        effectiveArea: 0,
        isRehab: false
      };
    }

    const currentOverhead = (proj.overheadRate !== undefined && proj.overheadRate !== null && !isNaN(Number(proj.overheadRate)))
      ? Number(proj.overheadRate)
      : ((proj.overheadPercent !== undefined && proj.overheadPercent !== null && !isNaN(Number(proj.overheadPercent))) ? Number(proj.overheadPercent) : 0);

    let divisionSum = 0;
    let totalDirectCost = 0;
    const divisionSummaries = [];

    (proj.divisions || []).forEach(div => {
      let divSub = 0;
      (div.items || []).forEach(itm => {
        const vol = Number(itm.volume) || 0;
        let itmPrice = Number(itm.price !== undefined ? itm.price : (itm.unitPrice !== undefined ? itm.unitPrice : itm.hsp)) || 0;
        let direct = 0;

        let ahsp = null;
        if (window.AhspEngine && window.AhspEngine.getAhspById) {
          ahsp = window.AhspEngine.getAhspById(itm.ahspId || itm.code, itm);
        }

        if (ahsp) {
          const hspInfo = window.AhspEngine.calculateHsp(ahsp, currentOverhead);
          direct = hspInfo.dTotal;
          itm.directCost = direct;
          if (currentOverhead === 0 || !itm.price) {
            itm.price = hspInfo.finalHsp;
            itmPrice = itm.price;
          }
        } else {
          direct = (itm.directCost !== undefined && itm.directCost !== null && !isNaN(itm.directCost) && itm.directCost > 0)
            ? Number(itm.directCost)
            : (currentOverhead > 0 ? Math.round(itmPrice / (1 + (currentOverhead / 100))) : itmPrice);
          if (currentOverhead === 0) direct = itmPrice;
          itm.directCost = direct;
        }

        const itmTotal = Math.round(vol * itmPrice);
        itm.total = itmTotal;
        divSub += itmTotal;
        totalDirectCost += Math.round(direct * vol);
      });

      div.subtotal = divSub;
      divisionSum += divSub;
      divisionSummaries.push({
        id: div.id,
        code: div.code,
        name: div.name,
        subtotal: divSub,
        itemCount: (div.items || []).length
      });
    });

    let realCost = divisionSum;
    let overheadAmount = 0;
    if (currentOverhead === 0) {
      overheadAmount = 0;
      totalDirectCost = realCost;
    } else {
      overheadAmount = Math.max(0, realCost - totalDirectCost);
    }

    (proj.divisions || []).forEach(div => {
      const w = realCost > 0 ? (div.subtotal / realCost) * 100 : 0;
      div.weightPercent = w;
      (div.items || []).forEach(itm => {
        itm.weightPercent = realCost > 0 ? ((Number(itm.total) || 0) / realCost) * 100 : 0;
      });
    });

    divisionSummaries.forEach(divSum => {
      divSum.weightPercent = realCost > 0 ? (divSum.subtotal / realCost) * 100 : 0;
    });

    const includePpn = proj.includePpn !== false && proj.includeTax !== false;
    const ppnRate = (proj.ppnRate !== undefined && proj.ppnRate !== null && !isNaN(Number(proj.ppnRate))) 
      ? Number(proj.ppnRate) 
      : ((proj.ppnPercent !== undefined && proj.ppnPercent !== null && !isNaN(Number(proj.ppnPercent))) ? Number(proj.ppnPercent) : 0);
    const ppnAmount = includePpn ? Math.round(realCost * (ppnRate / 100)) : 0;
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
      if (window.VolumeAnalysis) {
        window.VolumeAnalysis.syncWithRabItems();
      }
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
      : ((proj.overheadRate !== undefined && proj.overheadRate !== null && !isNaN(Number(proj.overheadRate))) ? Number(proj.overheadRate) : 0);
    const pRate = (testPpn !== null && testPpn !== undefined && !isNaN(Number(testPpn))) 
      ? Number(testPpn) 
      : ((proj.ppnRate !== undefined && proj.ppnRate !== null && !isNaN(Number(proj.ppnRate))) ? Number(proj.ppnRate) : 0);

    let totalDirectCost = 0;
    let divisionSum = 0;

    (proj.divisions || []).forEach(div => {
      let divSubtotal = 0;
      (div.items || []).forEach(itm => {
        const vol = Number(itm.volume) || 0;
        let itmPrice = Number(itm.price) || 0;
        let direct = 0;

        let ahsp = null;
        if (window.AhspEngine) {
          ahsp = window.AhspEngine.getAhspById(itm.ahspId || itm.code, itm);
        }

        if (ahsp) {
          const hspInfo = window.AhspEngine.calculateHsp(ahsp, ovRate);
          itmPrice = hspInfo.finalHsp;
          direct = hspInfo.dTotal;
        } else {
          let baseDirect = itm.directCost;
          if (!baseDirect || isNaN(baseDirect) || baseDirect <= 0 || (ovRate > 0 && baseDirect >= itmPrice)) {
            baseDirect = Math.round(itmPrice / (1 + (ovRate / 100)));
          }
          if (ovRate === 0) baseDirect = itmPrice;
          direct = baseDirect;
          itmPrice = Math.floor(direct * (1 + (ovRate / 100)));
        }

        totalDirectCost += Math.round(direct * vol);
        divSubtotal += Math.round(vol * itmPrice);
      });
      divisionSum += divSubtotal;
    });

    let realCost = divisionSum;
    let overheadAmount = 0;
    if (ovRate === 0) {
      overheadAmount = 0;
      totalDirectCost = realCost;
    } else {
      overheadAmount = Math.max(0, realCost - totalDirectCost);
    }

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

    const currentOverhead = (proj.overheadRate !== undefined && proj.overheadRate !== null && !isNaN(Number(proj.overheadRate))) ? Number(proj.overheadRate) : 0;
    const currentPpn = (proj.ppnRate !== undefined && proj.ppnRate !== null && !isNaN(Number(proj.ppnRate))) ? Number(proj.ppnRate) : 0;

    let totalDirectCost = 0;
    let divisionSum = 0;

    (proj.divisions || []).forEach(div => {
      let divSubtotal = 0;
      (div.items || []).forEach(itm => {
        const vol = Number(itm.volume) || 0;
        let itmPrice = Number(itm.price) || 0;
        let direct = 0;

        let ahsp = null;
        if (window.AhspEngine) {
          ahsp = window.AhspEngine.getAhspById(itm.ahspId || itm.code, itm);
        }

        if (ahsp) {
          const hspInfo = window.AhspEngine.calculateHsp(ahsp, currentOverhead);
          itmPrice = hspInfo.finalHsp;
          direct = hspInfo.dTotal;
          itm.price = itmPrice;
          itm.directCost = direct;
        } else {
          let baseDirect = itm.directCost;
          if (!baseDirect || isNaN(baseDirect) || baseDirect <= 0 || (currentOverhead > 0 && baseDirect >= itmPrice)) {
            baseDirect = Math.round(itmPrice / (1 + (currentOverhead / 100)));
          }
          if (currentOverhead === 0) baseDirect = itmPrice;
          direct = baseDirect;
          itm.directCost = direct;
          itmPrice = Math.floor(direct * (1 + (currentOverhead / 100)));
          itm.price = itmPrice;
        }

        const itmTotal = Math.round(vol * itmPrice);
        itm.total = itmTotal;
        divSubtotal += itmTotal;
        totalDirectCost += Math.round(direct * vol);
      });

      div.subtotal = divSubtotal;
      divisionSum += divSubtotal;
    });

    let realCost = divisionSum;
    let overheadAmount = 0;
    if (currentOverhead === 0) {
      overheadAmount = 0;
      totalDirectCost = realCost;
    } else {
      overheadAmount = Math.max(0, realCost - totalDirectCost);
    }

    // Hitung bobot tiap divisi
    (proj.divisions || []).forEach(div => {
      div.weightPercent = realCost > 0 ? (div.subtotal / realCost) * 100 : 0;
    });

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
