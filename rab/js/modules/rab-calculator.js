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
      const price = Number(item.price) || 0;
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

    let realCost = 0;
    const divisionSummaries = [];

    (proj.divisions || []).forEach(div => {
      const subtotal = calculateDivisionTotals(div);
      realCost += subtotal;
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
    const currentOverhead = (proj.overheadRate !== undefined && proj.overheadRate !== null)
      ? Number(proj.overheadRate)
      : ((proj.overheadPercent !== undefined && proj.overheadPercent !== null) ? Number(proj.overheadPercent) : 15);
    (proj.divisions || []).forEach(div => {
      (div.items || []).forEach(itm => {
        const vol = Number(itm.volume) || 0;
        let itmPrice = Number(itm.price) || 0;
        let direct = itm.directCost;
        if (direct === undefined || direct === null || isNaN(direct) || direct === 0) {
          if (window.AhspEngine) {
            const ahsp = window.AhspEngine.getAhspById(itm.ahspId || itm.code);
            if (ahsp) {
              const hspInfo = window.AhspEngine.calculateHsp(ahsp, currentOverhead);
              direct = hspInfo.dTotal;
              itm.directCost = direct;
            }
          }
          if (!direct) {
            direct = Math.round(itmPrice / (1 + (currentOverhead / 100)));
            itm.directCost = direct;
          }
        }
        totalDirectCost += Math.round(direct * vol);
      });
    });

    const overheadAmount = Math.round(totalDirectCost * (currentOverhead / 100));
    realCost = totalDirectCost + overheadAmount;

    // Hitung bobot (%) tiap divisi terhadap realCost total
    divisionSummaries.forEach(div => {
      div.weightPercent = realCost > 0 ? (div.subtotal / realCost) * 100 : 0;
    });

    const includePpn = proj.includePpn !== false;
    const ppnRate = (proj.ppnRate !== undefined && proj.ppnRate !== null) 
      ? Number(proj.ppnRate) 
      : ((proj.ppnPercent !== undefined && proj.ppnPercent !== null) ? Number(proj.ppnPercent) : 11);
    const ppnAmount = includePpn ? Math.round(realCost * (ppnRate / 100)) : 0;
    const grandTotal = Math.round(realCost + ppnAmount);
    const terbilangStr = window.CurrencyUtil.terbilang(grandTotal);

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
      grandTotal,
      terbilangStr
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

    const ovRate = (testOverhead !== null && testOverhead !== undefined && !isNaN(testOverhead)) 
      ? Number(testOverhead) 
      : (Number(proj.overheadRate) || 15);
    const pRate = (testPpn !== null && testPpn !== undefined && !isNaN(testPpn)) 
      ? Number(testPpn) 
      : (Number(proj.ppnRate) || 11);

    let totalDirectCost = 0;

    (proj.divisions || []).forEach(div => {
      let divSubtotal = 0;
      (div.items || []).forEach(itm => {
        const vol = Number(itm.volume) || 0;
        let itmPrice = Number(itm.price) || 0;

        let ahsp = null;
        if (window.AhspEngine) {
          ahsp = window.AhspEngine.getAhspById(itm.ahspId || itm.code);
        }

        if (ahsp) {
          const hspInfo = window.AhspEngine.calculateHsp(ahsp, ovRate);
          itmPrice = hspInfo.finalHsp;
          totalDirectCost += (hspInfo.dTotal * vol);
        } else {
          const baseDirect = itm.directCost || (itmPrice / (1 + (ovRate / 100)));
          itmPrice = Math.floor(baseDirect * (1 + (ovRate / 100)));
          totalDirectCost += (baseDirect * vol);
        }
        divSubtotal += Math.round(vol * itmPrice);
      });
      realCost += divSubtotal;
    });

    const overheadAmount = Math.round(totalDirectCost * (ovRate / 100));
    const realCost = totalDirectCost + overheadAmount;
    const includePpn = proj.includePpn !== false;
    const ppnAmount = includePpn ? Math.round(realCost * (pRate / 100)) : 0;
    const grandTotal = Math.round(realCost + ppnAmount);
    const terbilangStr = (window.CurrencyUtil && window.CurrencyUtil.terbilang) 
      ? window.CurrencyUtil.terbilang(grandTotal) 
      : "";

    return {
      totalDirectCost,
      overheadPercent: ovRate,
      overheadAmount,
      realCost,
      ppnRate: pRate,
      ppnAmount,
      grandTotal,
      terbilangStr
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

    const currentOverhead = Number(proj.overheadRate) || 15;
    const currentPpn = Number(proj.ppnRate) || 11;

    let totalDirectCost = 0;
    let realCost = 0;

    (proj.divisions || []).forEach(div => {
      let divSubtotal = 0;
      (div.items || []).forEach(itm => {
        const vol = Number(itm.volume) || 0;
        let itmPrice = Number(itm.price) || 0;

        let ahsp = null;
        if (window.AhspEngine) {
          ahsp = window.AhspEngine.getAhspById(itm.ahspId || itm.code);
        }

        if (ahsp) {
          const hspInfo = window.AhspEngine.calculateHsp(ahsp, currentOverhead);
          itmPrice = hspInfo.finalHsp;
          itm.price = itmPrice;
          itm.directCost = hspInfo.dTotal;
          totalDirectCost += (hspInfo.dTotal * vol);
        } else {
          const baseDirect = itm.directCost || (itmPrice / (1 + (currentOverhead / 100)));
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

    proj.realCost = realCost;
    proj.totalDirectCost = totalDirectCost;
    proj.overheadAmount = overheadAmount;
    proj.ppnAmount = ppnAmount;
    proj.grandTotal = grandTotal;

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
      grandTotal,
      terbilangStr
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
