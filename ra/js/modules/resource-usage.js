/**
 * Resource Usage Module
 * Menghitung rincian rekapitulasi kebutuhan seluruh sumber daya:
 * 1. Kebutuhan Material / Bahan Fisik
 * 2. Kebutuhan Tenaga Kerja (Orang-Hari / OH)
 * 3. Kebutuhan Sewa Peralatan
 * Dilengkapi kalkulasi persentase (%) terhadap subtotal dan grand total,
 * serta ekstraksi penggunaan tenaga per item pekerjaan RAB.
 */

window.ResourceUsage = (function() {
  const nonLaborKeywords = [
    'kapasitas', 'efisiensi', 'jarak angkut', 'kecepatan', 'waktu tempuh',
    'waktu muat', 'kap. produksi', 'kap. tenaga', 'koefisien alat', 'jam kerja efektif',
    'pemuatan', 'sewa lahan', 'penyiapan badan', 'pembersihan & pengupasan',
    'timbunan', 'beton fc', 'bjtp', 'pembesian', 'bekisting', 'polybag',
    'pemasangan pengikat', 'angkat arm', 'memuat 1', 'menurunkan 1'
  ];

  const validLaborUnits = ['oh', 'oj', 'jam', 'hari', 'orang', 'org'];
  const validLaborTitles = [
    'pekerja', 'tukang', 'mandor', 'kepala tukang', 'juru ukur',
    'pembantu juru ukur', 'juru gambar', 'ahli topografi', 'operator',
    'pembantu operator', 'supir', 'sopir', 'kenek', 'mekanik', 'surveyor'
  ];

  function isLaborComponent(comp) {
    if (!comp) return false;
    const sec = (comp.section || "").toUpperCase();
    const cNameLower = (comp.name || "").toLowerCase().trim();
    const cUnitLower = (comp.unit || "").toLowerCase().trim();
    const price = Number(comp.price) || 0;

    const isParamRow = nonLaborKeywords.some(kw => cNameLower.includes(kw));
    if (isParamRow && price === 0) return false;

    return sec.includes("TENAGA") && !isParamRow && (
      validLaborTitles.some(t => cNameLower.includes(t)) || validLaborUnits.includes(cUnitLower)
    );
  }

  function getItemLaborDetails(itemVol, ahsp, itemTotal = 0) {
    const vol = Number(itemVol) || 0;
    if (!ahsp || !ahsp.components || vol <= 0) {
      return { laborList: [], totalLaborQty: 0, totalLaborCost: 0, laborPercentOfItem: 0 };
    }

    const laborList = [];
    let totalLaborQty = 0;
    let totalLaborCost = 0;

    ahsp.components.forEach(comp => {
      if (isLaborComponent(comp)) {
        const koef = Number(comp.koef) || 0;
        const price = Number(comp.price) || 0;
        const qty = Math.round(vol * koef * 100) / 100;
        const cost = Math.round(qty * price);
        const pct = itemTotal > 0 ? (cost / itemTotal) * 100 : 0;

        totalLaborQty += qty;
        totalLaborCost += cost;

        laborList.push({
          name: comp.name.trim(),
          unit: comp.unit || "OH",
          koef: koef,
          price: price,
          qty: qty,
          totalCost: cost,
          pctOfItem: Math.round(pct * 100) / 100
        });
      }
    });

    const laborPercentOfItem = itemTotal > 0 ? Math.round((totalLaborCost / itemTotal) * 10000) / 100 : 0;

    return {
      laborList,
      totalLaborQty: Math.round(totalLaborQty * 100) / 100,
      totalLaborCost,
      laborPercentOfItem
    };
  }

  function calculateTotalResources(project = null) {
    const proj = project || (window.ProjectManager && window.ProjectManager.getActiveProject());
    if (!proj || !proj.divisions) {
      return { 
        materials: [], labor: [], equipment: [], 
        totalMaterials: 0, totalLabor: 0, totalEquipment: 0, 
        grandTotal: 0, materialsPct: 0, laborPct: 0, equipmentPct: 0 
      };
    }

    const materialMap = {};
    const laborMap = {};
    const equipmentMap = {};

    proj.divisions.forEach(div => {
      (div.items || []).forEach(item => {
        const itemVol = Number(item.volume) || 0;
        if (itemVol <= 0) return;

        let ahsp = null;
        if (window.AhspEngine) {
          if (item.ahspId) {
            ahsp = window.AhspEngine.getAhspById(item.ahspId);
          }
          if (!ahsp && item.code) {
            ahsp = window.AhspEngine.getAhspById(item.code);
          }
        }

        if (ahsp && ahsp.components && ahsp.components.length > 0) {
          ahsp.components.forEach(comp => {
            const koef = Number(comp.koef) || 0;
            const price = Number(comp.price) || 0;
            const reqQty = itemVol * koef;
            const totalCost = reqQty * price;
            const sec = (comp.section || "BAHAN").toUpperCase();
            const cNameLower = (comp.name || "").toLowerCase().trim();
            const key = `${cNameLower}_${(comp.unit || "").trim().toLowerCase()}`;

            const isLabor = isLaborComponent(comp);

            let compCode = (comp.code || "").trim();
            if (!compCode) {
              const list = window.MASTER_MATERIALS || [];
              const match = list.find(m => (m.name || "").trim().toLowerCase() === cNameLower);
              if (match && match.code) compCode = match.code;
            }

            if (isLabor) {
              if (!laborMap[key]) {
                laborMap[key] = {
                  name: comp.name.trim(),
                  code: compCode || `L.${String(Object.keys(laborMap).length + 1).padStart(2, '0')}`,
                  unit: comp.unit || "OH",
                  qty: 0,
                  price: price,
                  totalCost: 0
                };
              }
              laborMap[key].qty += reqQty;
              laborMap[key].totalCost += totalCost;
            } else if (sec.includes("ALAT") || sec.includes("PERALATAN") || ['sewa', 'crane', 'excavator', 'truck', 'roller', 'loader', 'hammer'].some(k => cNameLower.includes(k))) {
              if (!equipmentMap[key]) {
                equipmentMap[key] = {
                  name: comp.name.trim(),
                  code: compCode || `E.${String(Object.keys(equipmentMap).length + 1).padStart(2, '0')}`,
                  unit: comp.unit || "sewa-hari",
                  qty: 0,
                  price: price,
                  totalCost: 0
                };
              }
              equipmentMap[key].qty += reqQty;
              equipmentMap[key].totalCost += totalCost;
            } else {
              // Bahan / Material Fisik
              if (!materialMap[key]) {
                materialMap[key] = {
                  name: comp.name.trim(),
                  code: compCode || `M.${String(Object.keys(materialMap).length + 1).padStart(4, '0')}`,
                  unit: comp.unit || "unit",
                  qty: 0,
                  price: price,
                  totalCost: 0
                };
              }
              materialMap[key].qty += reqQty;
              materialMap[key].totalCost += totalCost;
            }
          });
        }
      });
    });

    const rawMaterials = Object.values(materialMap).map(m => ({
      ...m,
      qty: Math.round(m.qty * 100) / 100,
      totalCost: Math.round(m.totalCost)
    })).sort((a, b) => b.totalCost - a.totalCost);

    const rawLabor = Object.values(laborMap).map(l => ({
      ...l,
      qty: Math.round(l.qty * 100) / 100,
      totalCost: Math.round(l.totalCost)
    })).sort((a, b) => b.totalCost - a.totalCost);

    const rawEquipment = Object.values(equipmentMap).map(e => ({
      ...e,
      qty: Math.round(e.qty * 100) / 100,
      totalCost: Math.round(e.totalCost)
    })).sort((a, b) => b.totalCost - a.totalCost);

    const totalMaterials = rawMaterials.reduce((acc, m) => acc + m.totalCost, 0);
    const totalLabor = rawLabor.reduce((acc, l) => acc + l.totalCost, 0);
    const totalEquipment = rawEquipment.reduce((acc, e) => acc + e.totalCost, 0);
    const grandTotal = totalMaterials + totalLabor + totalEquipment;

    // Tambahkan persentase (%) terhadap subtotal kategori dan grand total proyek
    const materials = rawMaterials.map(m => ({
      ...m,
      pctOfGroup: totalMaterials > 0 ? Math.round((m.totalCost / totalMaterials) * 10000) / 100 : 0,
      pctOfTotal: grandTotal > 0 ? Math.round((m.totalCost / grandTotal) * 10000) / 100 : 0
    }));

    const labor = rawLabor.map(l => ({
      ...l,
      pctOfGroup: totalLabor > 0 ? Math.round((l.totalCost / totalLabor) * 10000) / 100 : 0,
      pctOfTotal: grandTotal > 0 ? Math.round((l.totalCost / grandTotal) * 10000) / 100 : 0
    }));

    const equipment = rawEquipment.map(e => ({
      ...e,
      pctOfGroup: totalEquipment > 0 ? Math.round((e.totalCost / totalEquipment) * 10000) / 100 : 0,
      pctOfTotal: grandTotal > 0 ? Math.round((e.totalCost / grandTotal) * 10000) / 100 : 0
    }));

    const materialsPct = grandTotal > 0 ? Math.round((totalMaterials / grandTotal) * 10000) / 100 : 0;
    const laborPct = grandTotal > 0 ? Math.round((totalLabor / grandTotal) * 10000) / 100 : 0;
    const equipmentPct = grandTotal > 0 ? Math.round((totalEquipment / grandTotal) * 10000) / 100 : 0;

    return {
      materials,
      labor,
      equipment,
      totalMaterials,
      totalLabor,
      totalEquipment,
      grandTotal,
      materialsPct,
      laborPct,
      equipmentPct
    };
  }

  return {
    calculateTotalResources,
    getItemLaborDetails,
    isLaborComponent
  };
})();
