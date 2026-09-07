/**
 * Catalog & Pricing Module (Upah, Material, Alat)
 * Standar SE Bina Konstruksi No. 47/SE/Dk/2026
 * Mendukung Multi-Daerah, Indeks Kustom Mandiri, Pencarian Cepat, Filter Kategori, dan Kustomisasi Harga
 */

window.CatalogPricing = (function() {
  let materials = [];
  let customPriceOverrides = {}; // { materialId: newPrice }
  let selectedCategory = "ALL";
  let searchQuery = "";
  let currentRegionId = "std";

  function init() {
    materials = window.MASTER_MATERIALS || [];
    const proj = window.ProjectManager.getActiveProject();
    if (proj) {
      currentRegionId = proj.regionId || "std";
      customPriceOverrides = proj.customPrices || {};
    }
  }

  function getCategories() {
    const cats = new Set();
    materials.forEach(m => {
      if (m.category) cats.add(m.category);
    });
    return Array.from(cats);
  }

  function getEffectivePrice(mat) {
    if (customPriceOverrides[mat.id] !== undefined) {
      return customPriceOverrides[mat.id];
    }

    const proj = window.ProjectManager.getActiveProject();
    const regionId = (proj && proj.regionId) || currentRegionId;

    // Jika menggunakan Indeks Kustom Mandiri
    if (regionId === "custom" || (proj && proj.customIndices && proj.customIndices.enabled)) {
      const indices = (proj && proj.customIndices) || { material: 1.0, labor: 1.0, equipment: 1.0 };
      const cat = (mat.category || "").toUpperCase();
      if (cat.includes("UPAH") || cat.includes("TENAGA")) {
        return Math.round(mat.price * (Number(indices.labor) || 1.0));
      } else if (cat.includes("ALAT") || cat.includes("SEWA")) {
        return Math.round(mat.price * (Number(indices.equipment) || 1.0));
      } else {
        return Math.round(mat.price * (Number(indices.material) || 1.0));
      }
    }

    // Jika menggunakan preset wilayah
    const region = (window.REGIONAL_PRESETS || []).find(r => r.id === regionId);
    if (region && region.indexMultiplier && region.indexMultiplier !== 1.0) {
      return Math.round(mat.price * region.indexMultiplier);
    }
    return mat.price;
  }

  function setOverridePrice(matId, newPrice) {
    customPriceOverrides[matId] = Number(newPrice);
    const proj = window.ProjectManager.getActiveProject();
    if (proj) {
      proj.customPrices = customPriceOverrides;
      window.ProjectManager.updateActiveProject(proj);
    }
  }

  function resetOverridePrice(matId) {
    delete customPriceOverrides[matId];
    const proj = window.ProjectManager.getActiveProject();
    if (proj) {
      proj.customPrices = customPriceOverrides;
      window.ProjectManager.updateActiveProject(proj);
    }
  }

  function setRegion(regionId) {
    currentRegionId = regionId;
    const proj = window.ProjectManager.getActiveProject();
    const region = (window.REGIONAL_PRESETS || []).find(r => r.id === regionId);
    if (proj && region) {
      proj.regionId = regionId;
      proj.regionName = region.name;
      if (regionId !== "custom" && proj.customIndices) {
        proj.customIndices.enabled = false;
      }
      window.ProjectManager.updateActiveProject(proj);
    }
  }

  function setCustomIndices(indices) {
    const proj = window.ProjectManager.getActiveProject();
    if (proj) {
      proj.regionId = "custom";
      proj.regionName = "Indeks Kustom (" + (indices.label || "Mandiri Proyek") + ")";
      proj.customIndices = {
        enabled: true,
        label: indices.label || "Mandiri Proyek",
        material: Number(indices.material) || 1.0,
        labor: Number(indices.labor) || 1.0,
        equipment: Number(indices.equipment) || 1.0
      };
      currentRegionId = "custom";
      window.ProjectManager.updateActiveProject(proj);
    }
  }

  function getCustomIndices() {
    const proj = window.ProjectManager.getActiveProject();
    return (proj && proj.customIndices) || {
      enabled: false,
      label: "Mandiri Proyek",
      material: 1.0,
      labor: 1.0,
      equipment: 1.0
    };
  }

  function addCustomMaterial(name, unit, price, category, code) {
    const cat = category || "Material Kustom";
    const cd = code || "CUST";
    const newId = "CUST-MAT-" + Date.now().toString(36).toUpperCase();
    const newMat = {
      id: newId,
      no: "CUSTOM",
      code: cd,
      name: name,
      unit: unit,
      price: Number(price),
      category: cat,
      isCustom: true
    };
    materials.unshift(newMat);
    setOverridePrice(newId, price);
    return newMat;
  }

  // Mengambil daftar seluruh upah, material, dan peralatan yang dipakai pada AHSP di proyek aktif
  function getUsedMaterialsList(project = null) {
    const proj = project || (window.ProjectManager && window.ProjectManager.getActiveProject());
    if (!proj || !proj.divisions) return [];

    const map = new Map();

    (proj.divisions || []).forEach(div => {
      (div.items || []).forEach(itm => {
        let ahsp = null;
        if (window.AhspEngine) {
          if (itm.ahspId) ahsp = window.AhspEngine.getAhspById(itm.ahspId);
          if (!ahsp && itm.code) ahsp = window.AhspEngine.getAhspById(itm.code);
        }
        if (ahsp && ahsp.components && Array.isArray(ahsp.components)) {
          ahsp.components.forEach(comp => {
            const compName = (comp.name || "").trim();
            const compUnit = (comp.unit || "").trim();
            if (!compName) return;

            const key = `${compName.toLowerCase()}___${compUnit.toLowerCase()}`;
            const sec = (comp.section || "").toUpperCase();
            let category = "Material / Bahan Bangunan";
            if (sec.includes("TENAGA") || sec.includes("UPAH") || ['pekerja', 'tukang', 'mandor', 'kepala tukang', 'juru ukur', 'operator', 'supir', 'sopir', 'kenek'].some(k => compName.toLowerCase().includes(k))) {
              category = "Upah Tenaga Kerja";
            } else if (sec.includes("ALAT") || sec.includes("PERALATAN") || ['sewa', 'molen', 'stamper', 'excavator', 'crane', 'roller', 'loader'].some(k => compName.toLowerCase().includes(k))) {
              category = "Sewa Peralatan";
            }

            let compCode = (comp.code || "").trim();
            if (!compCode || compCode === '-' || compCode === '1') {
              const allMats = window.MASTER_MATERIALS || [];
              const exactMat = allMats.find(m => 
                (m.name || '').trim().toLowerCase() === compName.toLowerCase() && 
                (m.unit || '').trim().toLowerCase() === compUnit.toLowerCase()
              );
              if (exactMat && exactMat.code) {
                compCode = exactMat.code;
              } else {
                const nameMat = allMats.find(m => (m.name || '').trim().toLowerCase() === compName.toLowerCase());
                const cleanU = (compUnit || 'U').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'U';
                if (nameMat && nameMat.code) {
                  compCode = `${nameMat.code}.${cleanU}`;
                } else {
                  const prefix = category.includes("Upah") ? "L" : (category.includes("Alat") ? "E" : "M");
                  let hash = 0;
                  for (let ch = 0; ch < compName.length; ch++) {
                    hash = ((hash << 5) - hash) + compName.charCodeAt(ch);
                    hash |= 0;
                  }
                  const numCode = Math.abs(hash % 8999) + 1000;
                  compCode = `${prefix}.${numCode}.${cleanU}`;
                }
              }
            }

            const effPrice = getEffectivePrice({ id: compCode || comp.id || key, price: Number(comp.price) || 0, category: category });
            const ahspLabel = ahsp.code ? `[${ahsp.code}] ${ahsp.name}` : ahsp.name;

            if (!map.has(key)) {
              map.set(key, {
                id: comp.id || compCode || `USED-${key}`,
                name: compName,
                code: compCode,
                unit: compUnit || 'unit',
                price: effPrice,
                category: category,
                usedInAhsp: [ahspLabel]
              });
            } else {
              const existing = map.get(key);
              if (!existing.code || existing.code === '-') {
                existing.code = compCode;
              }
              if (!existing.usedInAhsp.includes(ahspLabel)) {
                existing.usedInAhsp.push(ahspLabel);
              }
            }
          });
        }
      });
    });

    return Array.from(map.values());
  }

  function getUsedCategories(project = null) {
    const list = getUsedMaterialsList(project);
    const cats = new Set();
    list.forEach(m => {
      if (m.category) cats.add(m.category);
    });
    return Array.from(cats);
  }

  function getFilteredMaterials(limit, offset, onlyUsed = true) {
    const lim = limit || 100;
    const off = offset || 0;
    let list = onlyUsed ? getUsedMaterialsList() : materials;

    if (selectedCategory && selectedCategory !== "ALL") {
      list = list.filter(m => m.category === selectedCategory);
    }
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m => 
        (m.name && m.name.toLowerCase().includes(q)) || 
        (m.code && m.code.toLowerCase().includes(q))
      );
    }
    return {
      total: list.length,
      items: list.slice(off, off + lim),
      all: list
    };
  }

  function setSearch(query) {
    searchQuery = query;
  }

  function setCategory(cat) {
    selectedCategory = cat;
  }

  return {
    init,
    getCategories,
    getUsedCategories,
    getUsedMaterialsList,
    getEffectivePrice,
    setOverridePrice,
    resetOverridePrice,
    setRegion,
    setCustomIndices,
    getCustomIndices,
    addCustomMaterial,
    getFilteredMaterials,
    setSearch,
    getSearch: () => searchQuery,
    setCategory,
    getCategory: () => selectedCategory,
    getCurrentRegionId: () => currentRegionId
  };
})();
