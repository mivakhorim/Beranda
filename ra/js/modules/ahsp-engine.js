/**
 * AHSP Engine Module (Analisis Harga Satuan Pekerjaan 2026)
 * Standar SE Bina Konstruksi No. 47/SE/Dk/2026
 * Fitur: Edit Koefisien/Harga, Label [Edited/Revisi], Reset Standar,
 * AHSP Custom Full, Hapus AHSP, Filter Hanya AHSP Terpakai, Export/Import JSON
 */

window.AhspEngine = (function() {
  let masterAhsp = [];
  let customAhspMap = {}; // { ahspId: ahspObject }
  let selectedBidang = "ALL";
  let selectedCategory = "ALL";
  let searchQuery = "";
  let onlyUsedFilter = false;

  function init() {
    masterAhsp = window.MASTER_AHSP || [];
    const proj = window.ProjectManager.getActiveProject();
    if (proj && proj.customAhsp) {
      customAhspMap = proj.customAhsp;
    } else {
      customAhspMap = {};
    }
  }

  function getBidangs() {
    const bSet = new Set();
    masterAhsp.forEach(a => {
      if (a.bidang) bSet.add(a.bidang);
    });
    return Array.from(bSet);
  }

  function getCategories() {
    const cats = new Set();
    masterAhsp.forEach(a => {
      if (selectedBidang && selectedBidang !== "ALL") {
        if (a.bidang === selectedBidang && a.category) cats.add(a.category);
      } else {
        if (a.category) cats.add(a.category);
      }
    });
    return Array.from(cats);
  }

  // Ambil set ID atau Kode AHSP yang sedang digunakan dalam RAB aktif
  function getUsedAhspCodes() {
    const proj = window.ProjectManager.getActiveProject();
    const used = new Set();
    if (proj && proj.divisions) {
      proj.divisions.forEach(div => {
        (div.items || []).forEach(item => {
          if (item.ahspId) used.add(item.ahspId);
          if (item.code) used.add(item.code);
        });
      });
    }
    return used;
  }

  // Hitung ulang HSP suatu AHSP berdasarkan komponen & harga material saat ini
  function calculateHsp(ahsp, overrideOverhead = null) {
    let subtotalTenaga = 0;
    let subtotalBahan = 0;
    let subtotalAlat = 0;

    (ahsp.components || []).forEach(c => {
      const koef = Number(c.koef) || 0;
      let price = Number(c.price) || 0;
      // Ambil harga terkini jika komponen terkait katalog
      if (window.CatalogPricing) {
        // Cek apakah ada override harga dari katalog
        const effectivePrice = window.CatalogPricing.getEffectivePrice({ id: c.code, price: price });
        if (effectivePrice && effectivePrice > 0) {
          price = effectivePrice;
        }
      }
      const total = koef * price;
      c.total = Math.round(total * 100) / 100;

      const sec = (c.section || "BAHAN").toUpperCase();
      if (sec.includes("TENAGA")) subtotalTenaga += total;
      else if (sec.includes("ALAT") || sec.includes("PERALATAN")) subtotalAlat += total;
      else subtotalBahan += total;
    });

    const dTotal = subtotalTenaga + subtotalBahan + subtotalAlat;
    let overheadPercent = 15;
    if (overrideOverhead !== null && overrideOverhead !== undefined && !isNaN(overrideOverhead)) {
      overheadPercent = Number(overrideOverhead);
    } else {
      const proj = (window.ProjectManager && window.ProjectManager.getActiveProject) ? window.ProjectManager.getActiveProject() : null;
      if (proj && proj.overheadRate !== undefined && proj.overheadRate !== null && !isNaN(proj.overheadRate)) {
        overheadPercent = Number(proj.overheadRate);
      } else {
        overheadPercent = Number(ahsp.overhead_percent) || 15;
      }
    }
    const eOverhead = dTotal * (overheadPercent / 100);
    const finalHsp = Math.floor(dTotal + eOverhead); // Standar ROUNDDOWN/FLOOR SE PUPR

    return {
      subtotalTenaga,
      subtotalBahan,
      subtotalAlat,
      dTotal,
      overheadPercent,
      eOverhead,
      finalHsp
    };
  }

  // Dapatkan detail AHSP efektif (custom jika ada, atau master bawaan)
  function getAhspById(id) {
    if (!id) return null;
    if (customAhspMap && customAhspMap[id]) {
      return customAhspMap[id];
    }
    const list = (masterAhsp && masterAhsp.length > 0) ? masterAhsp : (window.MASTER_AHSP || []);
    const found = list.find(a => a.id === id || a.code === id || (a.code && id && String(a.code).trim() === String(id).trim()));
    if (found) {
      return JSON.parse(JSON.stringify(found));
    }
    return null;
  }

  // Update atau simpan AHSP yang diedit
  function saveEditedAhsp(editedAhsp) {
    editedAhsp.is_edited = true;
    const calc = calculateHsp(editedAhsp);
    editedAhsp.hsp = calc.finalHsp;
    customAhspMap[editedAhsp.id] = editedAhsp;

    const proj = window.ProjectManager.getActiveProject();
    if (proj) {
      proj.customAhsp = customAhspMap;
      // Sinkronkan juga harga di RAB jika AHSP ini digunakan
      if (proj.divisions) {
        proj.divisions.forEach(div => {
          (div.items || []).forEach(itm => {
            if (itm.ahspId === editedAhsp.id || itm.code === editedAhsp.code) {
              itm.price = editedAhsp.hsp;
            }
          });
        });
      }
      window.ProjectManager.updateActiveProject(proj);
    }
    return editedAhsp;
  }

  // Reset AHSP yang diedit kembali ke nilai Standar SE PUPR 2026
  function resetToStandard(ahspId) {
    const orig = masterAhsp.find(a => a.id === ahspId);
    if (!orig) return false;

    delete customAhspMap[ahspId];
    const proj = window.ProjectManager.getActiveProject();
    if (proj) {
      proj.customAhsp = customAhspMap;
      if (proj.divisions) {
        proj.divisions.forEach(div => {
          (div.items || []).forEach(itm => {
            if (itm.ahspId === ahspId || itm.code === orig.code) {
              itm.price = orig.hsp;
            }
          });
        });
      }
      window.ProjectManager.updateActiveProject(proj);
    }
    return true;
  }

  // Buat AHSP Kustom Penuh (Full Custom AHSP)
  function createCustomAhsp(code, name, category, unit, overheadPercent = 15, components = []) {
    const newId = `CUST-AHSP-${Date.now().toString(36).toUpperCase()}`;
    const newAhsp = {
      id: newId,
      code: code || `CUST.${Math.floor(100 + Math.random() * 900)}`,
      name: name,
      category: category || "Pekerjaan Kustom",
      unit: unit || "m2",
      overhead_percent: Number(overheadPercent),
      is_custom: true,
      is_edited: false,
      components: components
    };
    const calc = calculateHsp(newAhsp);
    newAhsp.hsp = calc.finalHsp;
    customAhspMap[newId] = newAhsp;

    const proj = window.ProjectManager.getActiveProject();
    if (proj) {
      proj.customAhsp = customAhspMap;
      window.ProjectManager.updateActiveProject(proj);
    }
    return newAhsp;
  }

  // Hapus AHSP Kustom
  function deleteCustomAhsp(ahspId) {
    if (customAhspMap[ahspId]) {
      delete customAhspMap[ahspId];
      const proj = window.ProjectManager.getActiveProject();
      if (proj) {
        proj.customAhsp = customAhspMap;
        window.ProjectManager.updateActiveProject(proj);
      }
      return true;
    }
    return false;
  }

  // Filter daftar AHSP
  function getFilteredAhsp(limit = 100, offset = 0) {
    // Gabungkan custom AHSP yang baru dibuat dengan master AHSP
    const customList = Object.values(customAhspMap).filter(a => a.is_custom);
    let allList = [...customList, ...masterAhsp];

    // Jika filter "Hanya AHSP Terpakai" aktif
    if (onlyUsedFilter) {
      const usedCodes = getUsedAhspCodes();
      allList = allList.filter(a => usedCodes.has(a.id) || usedCodes.has(a.code));
    }

    // Filter Bidang (Cipta Karya, Bina Marga, Sumber Daya Air, SMKK)
    if (selectedBidang && selectedBidang !== "ALL") {
      allList = allList.filter(a => a.bidang === selectedBidang);
    }

    // Filter Kategori / Sub-Kategori
    if (selectedCategory && selectedCategory !== "ALL") {
      allList = allList.filter(a => a.category === selectedCategory);
    }

    // Pencarian Multi-Keyword (Nama, Kode, Bidang, Divisi, Tags)
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      allList = allList.filter(a => 
        (a.name && a.name.toLowerCase().includes(q)) || 
        (a.code && a.code.toLowerCase().includes(q)) ||
        (a.bidang && a.bidang.toLowerCase().includes(q)) ||
        (a.divisi && a.divisi.toLowerCase().includes(q)) ||
        (a.category && a.category.toLowerCase().includes(q)) ||
        (a.tags && Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Terapkan override dari customAhspMap jika ada
    const items = allList.slice(offset, offset + limit).map(item => {
      if (customAhspMap[item.id]) {
        return customAhspMap[item.id];
      }
      return item;
    });

    return {
      total: allList.length,
      items: items
    };
  }

  function setOnlyUsedFilter(active) {
    onlyUsedFilter = active;
  }

  function getOnlyUsedFilter() {
    return onlyUsedFilter;
  }

  function setSearch(query) {
    searchQuery = query;
  }

  function setCategory(cat) {
    selectedCategory = cat;
  }

  // Export pustaka AHSP lengkap (seluruh item master + custom overrides) ke JSON
  function exportAhspJson() {
    const customList = Object.values(customAhspMap).filter(a => a.is_custom);
    let allList = [...customList, ...masterAhsp];

    // Terapkan override dari customAhspMap dan hitung HSP terkini
    const fullAhspList = allList.map(item => {
      const activeAhsp = customAhspMap[item.id] || item;
      const calculated = calculateHsp(activeAhsp);
      return {
        id: activeAhsp.id,
        code: activeAhsp.code,
        name: activeAhsp.name,
        category: activeAhsp.category,
        unit: activeAhsp.unit,
        overhead_percent: activeAhsp.overhead_percent || 15,
        hsp: calculated.finalHsp,
        directCost: calculated.dTotal,
        components: (activeAhsp.components || []).map(c => ({
          section: c.section,
          code: c.code,
          name: c.name,
          unit: c.unit,
          koef: Number(c.koef) || 0,
          price: Number(c.price) || 0,
          total: Math.round((Number(c.koef) || 0) * (Number(c.price) || 0) * 100) / 100
        })),
        is_custom: !!activeAhsp.is_custom,
        is_edited: !!activeAhsp.is_edited
      };
    });

    const dataToExport = {
      title: "Pustaka Lengkap Analisis Harga Satuan Pekerjaan (AHSP) 2026",
      standard: "SE Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026",
      exportDate: new Date().toISOString(),
      totalItems: fullAhspList.length,
      items: fullAhspList,
      customAhsp: customAhspMap,
      usedAhspOnly: onlyUsedFilter ? Array.from(getUsedAhspCodes()) : null
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `Pustaka_AHSP_2026_Lengkap_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }

  // Import pustaka AHSP dari JSON (Mendukung full library array maupun custom map)
  function importAhspJson(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const imported = JSON.parse(e.target.result);
        let importedCount = 0;

        // 1. Jika memuat array items langsung atau imported.items / imported.ahspList
        const itemsArray = Array.isArray(imported) 
          ? imported 
          : (Array.isArray(imported.items) 
              ? imported.items 
              : (Array.isArray(imported.ahspList) ? imported.ahspList : null));

        if (itemsArray && itemsArray.length > 0) {
          itemsArray.forEach(itm => {
            if (itm && (itm.id || itm.code)) {
              const key = itm.id || `AHSP-${itm.code.replace(/\./g, '-')}`;
              customAhspMap[key] = {
                id: key,
                code: itm.code || "",
                name: itm.name || "AHSP Baru",
                category: itm.category || "UMUM",
                unit: itm.unit || "m2",
                overhead_percent: Number(itm.overhead_percent) || 15,
                hsp: Number(itm.hsp) || 0,
                components: itm.components || [],
                is_custom: itm.is_custom !== undefined ? itm.is_custom : true,
                is_edited: true
              };
              importedCount++;
            }
          });
        }

        // 2. Jika memuat customAhsp map
        if (imported.customAhsp && typeof imported.customAhsp === 'object') {
          Object.assign(customAhspMap, imported.customAhsp);
          importedCount = Math.max(importedCount, Object.keys(imported.customAhsp).length);
        }

        if (importedCount > 0) {
          const proj = window.ProjectManager.getActiveProject();
          if (proj) {
            proj.customAhsp = customAhspMap;
            window.ProjectManager.updateActiveProject(proj);
          }
          if (callback) callback(true, importedCount);
        } else {
          if (callback) callback(false, 0, "File JSON tidak memuat data format AHSP yang sesuai.");
        }
      } catch (err) {
        if (callback) callback(false, 0, "Gagal membaca file JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  return {
    init,
    getCategories,
    getUsedAhspCodes,
    calculateHsp,
    getAhspById,
    saveEditedAhsp,
    resetToStandard,
    createCustomAhsp,
    deleteCustomAhsp,
    getFilteredAhsp,
    setOnlyUsedFilter,
    getOnlyUsedFilter,
    setSearch,
    getSearch: () => searchQuery,
    setCategory,
    getCategory: () => selectedCategory,
    getBidangs,
    setBidang: (b) => { selectedBidang = b || "ALL"; },
    getBidang: () => selectedBidang,
    exportAhspJson,
    importAhspJson
  };
})();
