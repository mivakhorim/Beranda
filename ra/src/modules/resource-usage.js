/**
 * Resource Usage Module
 * Menghitung rincian rekapitulasi kebutuhan seluruh sumber daya:
 * 1. Kebutuhan Material / Bahan Fisik
 * 2. Kebutuhan Tenaga Kerja (Orang-Hari / OH)
 * 3. Kebutuhan Sewa Peralatan
 * Dilengkapi kalkulasi persentase (%) terhadap subtotal dan grand total,
 * serta rekonsiliasi finansial 100% presisi dengan Total Biaya Real Cost RAB.
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

    return (sec.includes("TENAGA") || validLaborTitles.some(t => cNameLower.includes(t))) && 
           !isParamRow && (
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
        let price = Number(comp.price) || 0;
        if (window.CatalogPricing) {
          const eff = window.CatalogPricing.getEffectivePrice({ id: comp.code, price: price });
          if (eff && eff > 0) price = eff;
        }
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
        totalMaterials: 0, totalLabor: 0, totalEquipment: 0, totalDirectCost: 0,
        totalOverheadProfit: 0, rabRealCost: 0, rabGrandTotal: 0,
        ppnRate: 0, ppnAmount: 0, includePpn: true,
        grandTotal: 0, materialsPct: 0, laborPct: 0, equipmentPct: 0 
      };
    }

    const materialMap = {};
    const laborMap = {};
    const equipmentMap = {};

    // Dapatkan data kalkulasi RAB resmi untuk rekonsiliasi 100% presisi
    const rab = window.RabCalculator ? window.RabCalculator.calculateProjectRab(proj) : null;
    const rabRealCost = rab ? (rab.realCost || 0) : 0;
    const rabGrandTotal = rab ? (rab.grandTotal || 0) : rabRealCost;
    const ppnRate = Number(proj.ppnRate !== undefined ? proj.ppnRate : (rab ? rab.ppnRate : 0)) || 0;
    const ppnAmount = rab ? (rab.ppnAmount || 0) : 0;
    const includePpn = proj.includePpn !== false;
    const projOverheadRate = Number(proj.overheadRate !== undefined ? proj.overheadRate : (rab ? rab.overheadPercent : 0)) || 0;

    let totalBudgetedOverhead = 0;

    proj.divisions.forEach(div => {
      (div.items || []).forEach(item => {
        const itemVol = Number(item.volume) || 0;
        const itemPrice = Number(item.price !== undefined ? item.price : item.unitPrice) || 0;
        const itemTotal = Math.round(itemVol * itemPrice);
        if (itemVol <= 0 || itemTotal <= 0) return;

        // Hitung biaya langsung (Direct Cost) dan overhead item berdasarkan anggaran RAB
        const itmDirectCost = (projOverheadRate > 0) ? Math.round(itemTotal / (1 + (projOverheadRate / 100))) : itemTotal;
        const itmOverhead = itemTotal - itmDirectCost;
        totalBudgetedOverhead += itmOverhead;

        let ahsp = null;
        if (window.AhspEngine) {
          if (item.ahspId) {
            ahsp = window.AhspEngine.getAhspById(item.ahspId, item);
          }
          if (!ahsp && item.code) {
            ahsp = window.AhspEngine.getAhspById(item.code, item);
          }
        }

        if (ahsp && ahsp.components && ahsp.components.length > 0) {
          let bTenaga = 0;
          let bBahan = 0;
          let bAlat = 0;

          const evaluatedComps = ahsp.components.map(comp => {
            const koef = Number(comp.koef) || 0;
            let price = Number(comp.price) || 0;
            if (window.CatalogPricing) {
              const eff = window.CatalogPricing.getEffectivePrice({ id: comp.code, price: price });
              if (eff && eff > 0) price = eff;
            }
            const compTotal = koef * price;
            const sec = (comp.section || "BAHAN").toUpperCase();
            const cNameLower = (comp.name || "").toLowerCase().trim();

            let category = 'material';
            if (isLaborComponent(comp)) {
              bTenaga += compTotal;
              category = 'labor';
            } else if (sec.includes("ALAT") || sec.includes("PERALATAN") || ['sewa', 'crane', 'excavator', 'truck', 'roller', 'loader', 'hammer'].some(k => cNameLower.includes(k))) {
              bAlat += compTotal;
              category = 'equipment';
            } else {
              bBahan += compTotal;
            }

            return { comp, koef, price, compTotal, category, cNameLower };
          });

          const dSum = bTenaga + bBahan + bAlat;

          if (dSum > 0) {
            evaluatedComps.forEach(({ comp, koef, price, compTotal, category, cNameLower }) => {
              const compShare = compTotal / dSum;
              const compBudgetCost = Math.round(itmDirectCost * compShare);
              const compQty = price > 0 ? (compBudgetCost / price) : (itemVol * koef);
              const key = `${cNameLower}_${(comp.unit || "").trim().toLowerCase()}`;

              let compCode = (comp.code || "").trim();
              if (!compCode) {
                const list = window.MASTER_MATERIALS || [];
                const match = list.find(m => (m.name || "").trim().toLowerCase() === cNameLower);
                if (match && match.code) compCode = match.code;
              }

              const targetMap = category === 'labor' ? laborMap : (category === 'equipment' ? equipmentMap : materialMap);
              if (!targetMap[key]) {
                targetMap[key] = {
                  name: comp.name.trim(),
                  code: compCode || (category === 'labor' ? 'L.01' : (category === 'equipment' ? 'E.01' : 'M.0001')),
                  unit: comp.unit || (category === 'labor' ? 'OH' : 'unit'),
                  qty: 0,
                  price: price,
                  totalCost: 0
                };
              }
              targetMap[key].qty += compQty;
              targetMap[key].totalCost += compBudgetCost;
            });
          } else {
            // Komponen direct fallback
            const key = (item.name || "").toLowerCase().trim();
            materialMap[key] = {
              name: item.name,
              code: item.code || 'M.0001',
              unit: item.unit || 'unit',
              qty: itemVol,
              price: itemPrice,
              totalCost: itmDirectCost
            };
          }
        } else {
          // Item penunjang / lump sum tanpa AHSP (misal air kerja, listrik sementara)
          const key = (item.name || "").toLowerCase().trim();
          materialMap[key] = {
            name: item.name,
            code: item.code || 'M.0001',
            unit: item.unit || 'ls',
            qty: itemVol,
            price: itemPrice,
            totalCost: itmDirectCost
          };
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

    let totalMaterials = rawMaterials.reduce((acc, m) => acc + m.totalCost, 0);
    let totalLabor = rawLabor.reduce((acc, l) => acc + l.totalCost, 0);
    let totalEquipment = rawEquipment.reduce((acc, e) => acc + e.totalCost, 0);
    let totalDirectCost = totalMaterials + totalLabor + totalEquipment;

    // Selisih antara Total Real Cost RAB dan Total Biaya Langsung (Direct Cost) dialokasikan
    // secara transparan ke Biaya Umum & Keuntungan Kontraktor (Overhead & Profit)
    const totalOverheadProfit = Math.max(0, rabRealCost - totalDirectCost);

    // Tambahkan persentase (%) terhadap subtotal kategori dan grand total proyek
    const materials = rawMaterials.map(m => ({
      ...m,
      pctOfGroup: totalMaterials > 0 ? Math.round((m.totalCost / totalMaterials) * 10000) / 100 : 0,
      pctOfTotal: rabRealCost > 0 ? Math.round((m.totalCost / rabRealCost) * 10000) / 100 : 0
    }));

    const labor = rawLabor.map(l => ({
      ...l,
      pctOfGroup: totalLabor > 0 ? Math.round((l.totalCost / totalLabor) * 10000) / 100 : 0,
      pctOfTotal: rabRealCost > 0 ? Math.round((l.totalCost / rabRealCost) * 10000) / 100 : 0
    }));

    const equipment = rawEquipment.map(e => ({
      ...e,
      pctOfGroup: totalEquipment > 0 ? Math.round((e.totalCost / totalEquipment) * 10000) / 100 : 0,
      pctOfTotal: rabRealCost > 0 ? Math.round((e.totalCost / rabRealCost) * 10000) / 100 : 0
    }));

    const materialsPct = rabRealCost > 0 ? Math.round((totalMaterials / rabRealCost) * 10000) / 100 : 0;
    const laborPct = rabRealCost > 0 ? Math.round((totalLabor / rabRealCost) * 10000) / 100 : 0;
    const equipmentPct = rabRealCost > 0 ? Math.round((totalEquipment / rabRealCost) * 10000) / 100 : 0;

    return {
      materials,
      labor,
      equipment,
      totalMaterials,
      totalLabor,
      totalEquipment,
      totalDirectCost,
      totalOverheadProfit,
      rabRealCost,
      rabGrandTotal,
      ppnRate,
      ppnAmount,
      includePpn,
      grandTotal: rabRealCost,
      materialsPct,
      laborPct,
      equipmentPct
    };
  }

  return {
    getItemLaborDetails,
    calculateTotalResources
  };
})();
