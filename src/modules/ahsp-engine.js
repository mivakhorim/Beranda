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
    // Nilai Overhead & Profit default 0% pada seluruh pustaka AHSP
    (masterAhsp || []).forEach(a => {
      a.overhead_percent = 0.0;
      a.overhead_cost = 0.0;
      if (a.hsp_base) a.hsp = Math.floor(Number(a.hsp_base));
    });
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;


    if (proj && proj.customAhsp) {
      customAhspMap = proj.customAhsp;
    } else {
      customAhspMap = {};
    }
  }

  function getAllAhspList() {
    const proj = (window.ProjectManager && window.ProjectManager.getActiveProject) ? window.ProjectManager.getActiveProject() : null;
    if (proj && proj.customAhsp) {
      customAhspMap = proj.customAhsp;
    }
    const customList = Object.values(customAhspMap || {}).filter(a => a && (a.is_custom || (a.id && String(a.id).startsWith('CUST')) || (a.code && String(a.code).startsWith('CUST'))));
    const masterWithRevisions = (masterAhsp || []).map(m => {
      const active = (customAhspMap && (customAhspMap[m.id] || customAhspMap[m.code])) ? (customAhspMap[m.id] || customAhspMap[m.code]) : m;
      return active;
    });
    return [...customList, ...masterWithRevisions];
  }

  function getBidangs() {
    const bSet = new Set();
    const all = getAllAhspList();
    all.forEach(a => {
      if (a.bidang) bSet.add(a.bidang);
    });
    return Array.from(bSet);
  }

  function getCategories() {
    const cats = new Set();
    const all = getAllAhspList();
    all.forEach(a => {
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


  // Sanitasi Otomatis Kode Komponen (Anti-Tanda Acak & Anti-Asterisk *)
  function sanitizeComponentCode(c) {
    if (!c) return;
    let code = (c.code || c.kode || '').trim();
    if (!code || code.includes('*') || code === '-' || code.length > 15) {
      const allMats = window.MASTER_MATERIALS || [];
      const cName = (c.name || '').toLowerCase().trim();
      const match = allMats.find(m => (m.name || '').toLowerCase().trim() === cName);
      if (match && match.code && !match.code.includes('*')) {
        c.code = match.code;
        c.kode = match.code;
      } else {
        const sec = (c.section || c.category || 'material').toUpperCase();
        if (sec.includes('TENAGA') || sec.includes('UPAH')) {
          c.code = 'L.01';
        } else if (sec.includes('ALAT') || sec.includes('PERALATAN')) {
          c.code = 'E.01';
        } else {
          // Cari substring nama
          const partial = allMats.find(m => m.name && cName && (m.name.toLowerCase().includes(cName) || cName.includes(m.name.toLowerCase())));
          c.code = (partial && partial.code && !partial.code.includes('*')) ? partial.code : 'M.9001';
        }
        c.kode = c.code;
      }
    } else {
      // Hilangkan kurung tutup atau spasi liar jika ada
      const cleaned = code.replace(/[\*\)\(]/g, '').trim();
      if (cleaned) {
        c.code = cleaned;
        c.kode = cleaned;
      }
    }
  }

  // Hitung ulang HSP suatu AHSP berdasarkan komponen & harga material saat ini
  function calculateHsp(ahsp, overrideOverhead = null) {

    let subtotalTenaga = 0;
    let subtotalBahan = 0;
    let subtotalAlat = 0;

    (ahsp.components || []).forEach(c => {
      sanitizeComponentCode(c);
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
    // Overhead HANYA dari pengaturan proyek (proj.overheadRate) — default 0%
    // Tidak ada fallback ke ahsp.overhead_percent — single source of truth
    let overheadPercent = 0;
    if (overrideOverhead !== null && overrideOverhead !== undefined && !isNaN(overrideOverhead)) {
      overheadPercent = Number(overrideOverhead);
    } else {
      const proj = (window.ProjectManager && window.ProjectManager.getActiveProject) ? window.ProjectManager.getActiveProject() : null;
      if (proj && proj.overheadRate !== undefined && proj.overheadRate !== null && !isNaN(proj.overheadRate)) {
        overheadPercent = Number(proj.overheadRate);
      }
      // Jika proj.overheadRate tidak ada → tetap 0% (BUKAN fallback ke ahsp.overhead_percent)
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
  function getAhspById(id, itemContext = null) {
    if (!id) return null;
    
    let targetId = String(id).trim();
    
    // Normalisasi kontekstual: jika item arsitektural terasosiasi dengan ID/kode elektrikal/mekanikal lawas
    const ctxName = (typeof itemContext === 'string' ? itemContext : (itemContext && itemContext.name ? itemContext.name : '')).toLowerCase();
    const isKeramikContext = ctxName.includes('keramik') || ctxName.includes('tile') || ctxName.includes('plin') || ctxName.includes('lantai') || ctxName.includes('dinding');
    const isKusenContext = ctxName.includes('kusen') || ctxName.includes('aluminium');
    const isKacaContext = ctxName.includes('kaca') || ctxName.includes('tempered');
    const isPasirContext = ctxName.includes('pasir') || ctxName.includes('urug');
    const isBouwplankContext = ctxName.includes('bouwplank');
    const isCatContext = ctxName.includes('cat') || ctxName.includes('pengecatan');
    const isPipaContext = ctxName.includes('pipa') || ctxName.includes('air bersih');
    const isAtapContext = ctxName.includes('baja ringan') || ctxName.includes('atap');
    const isLampuContext = ctxName.includes('lampu') || ctxName.includes('titik lampu');
    const isStopKontakContext = ctxName.includes('stop kontak');
    const isKantorContext = ctxName.includes('kantor') || ctxName.includes('gudang');

    if (isKeramikContext) {
      if (targetId === 'AHSP-1063' || targetId === '5.1.2.1' || ctxName.includes('30x30')) {
        targetId = 'AHSP-0574';
      } else if (targetId === 'AHSP-1085' || targetId === '5.1.3.1' || ctxName.includes('30x60')) {
        targetId = 'AHSP-0608B';
      } else if (targetId === 'AHSP-1097' || targetId === '5.1.4.1' || ctxName.includes('plin')) {
        targetId = 'AHSP-0535';
      } else if (targetId === '5.1.1.1' || ctxName.includes('60x60')) {
        targetId = 'AHSP-0532';
      }
    } else if (isKusenContext && (targetId === 'AHSP-1538' || targetId === '6.1.1.1')) {
      targetId = 'AHSP-0647';
    } else if (isKacaContext && (targetId === 'AHSP-1588' || targetId === '6.1.5.1')) {
      targetId = 'AHSP-0682';
    } else if (isPasirContext && (targetId === 'AHSP-0177' || targetId === '2.1.2.1')) {
      targetId = 'AHSP-0086';
    } else if (isBouwplankContext && (targetId === 'AHSP-0007' || targetId === '1.1.2.1')) {
      targetId = 'AHSP-0032';
    } else if (isKantorContext && (targetId === 'AHSP-0031' || targetId === '1.1.4.1')) {
      targetId = 'AHSP-0031B';
    } else if (isCatContext && (targetId === 'AHSP-0910' || targetId === 'AHSP-0920' || targetId === 'AHSP-0930' || targetId.startsWith('10.1'))) {
      targetId = ctxName.includes('eksterior') ? 'AHSP-0494' : (ctxName.includes('plafon') ? 'AHSP-0505' : 'AHSP-0493');
    } else if (isPipaContext && (targetId === 'AHSP-2202' || targetId.startsWith('8.1.3'))) {
      targetId = 'AHSP-1568';
    } else if (isAtapContext && (targetId === 'AHSP-2128' || targetId.startsWith('7.1.1'))) {
      targetId = 'AHSP-0173';
    } else if (isLampuContext && (targetId === 'AHSP-2253' || targetId.startsWith('9.1.1'))) {
      targetId = 'AHSP-1153';
    } else if (isStopKontakContext && (targetId === 'AHSP-2275' || targetId.startsWith('9.1.2'))) {
      targetId = 'AHSP-1069';
    }

    if (customAhspMap) {
      if (customAhspMap[targetId]) return customAhspMap[targetId];
      const customMatch = Object.values(customAhspMap).find(a =>
        a.id === targetId || a.code === targetId ||
        (a.code && targetId && String(a.code).trim() === String(targetId).trim())
      );
      if (customMatch) return customMatch;
    }


    const list = (masterAhsp && masterAhsp.length > 0) ? masterAhsp : (window.MASTER_AHSP || []);
    const found = list.find(a => a.id === targetId || a.code === targetId || (a.code && targetId && String(a.code).trim() === String(targetId).trim()));
    if (found) {
      return JSON.parse(JSON.stringify(found));
    }
    return null;
  }

  // Update atau simpan AHSP yang diedit dengan Proteksi Data Orisinal & Kode Revisi Resmi
  function saveEditedAhsp(editedAhsp) {
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (proj) {
      proj.ahspOriginals = proj.ahspOriginals || {};
      // Kunci data orisinal sebelum modifikasi jika belum pernah dicadangkan
      if (!proj.ahspOriginals[editedAhsp.id]) {
        const origFound = masterAhsp.find(a => a.id === editedAhsp.id) || 
                          (window.MASTER_AHSP && window.MASTER_AHSP.find(a => a.id === editedAhsp.id));
        if (origFound) {
          proj.ahspOriginals[editedAhsp.id] = JSON.parse(JSON.stringify(origFound));
        } else if (customAhspMap[editedAhsp.id]) {
          proj.ahspOriginals[editedAhsp.id] = JSON.parse(JSON.stringify(customAhspMap[editedAhsp.id]));
        }
      }
    }

    // Pembaruan kode revisi berurutan (REV-1, REV-2, dst.)
    editedAhsp.revision = (Number(editedAhsp.revision) || 0) + 1;
    editedAhsp.revisionCode = `REV-${editedAhsp.revision}`;
    editedAhsp.is_edited = true;
    editedAhsp.lastEditedDate = new Date().toISOString();

    const calc = calculateHsp(editedAhsp);
    editedAhsp.hsp_base = calc.dTotal; // Direct Cost / HPP Pokok murni dari revisi komponen
    editedAhsp.hsp = calc.finalHsp;
    customAhspMap[editedAhsp.id] = editedAhsp;

    if (proj) {
      proj.customAhsp = customAhspMap;
      // Sinkronkan juga harga di RAB jika AHSP ini digunakan
      if (proj.divisions) {
        proj.divisions.forEach(div => {
          (div.items || []).forEach(itm => {
            if (itm.ahspId === editedAhsp.id || itm.code === editedAhsp.code || itm.ahspId === editedAhsp.code) {
              itm.price = editedAhsp.hsp;
              // Nilai AHSP revisi adalah 100% Biaya Langsung (Direct Cost) murni tanpa profit
              itm.directCost = calc.dTotal;
              itm.total = Math.round((Number(itm.volume) || 0) * itm.price);
            }
          });
        });
      }
      window.ProjectManager.updateActiveProject(proj);
      if (window.RabCalculator && window.RabCalculator.calculateProjectRab) {
        window.RabCalculator.calculateProjectRab(proj);
      }
      // Sinkronkan ke database folder mandiri jika terhubung
      if (window.ProjectManager.syncAhspDatabaseToFolder) {
        window.ProjectManager.syncAhspDatabaseToFolder();
      }
    }
    return editedAhsp;
  }

  // Pulihkan AHSP tertentu ke Nilai Orisinal (Anti-Ketidaksengajaan)
    // Pulihkan snapshot murni modal AHSP tanpa menaikkan revisi jika dibatalkan
  function restoreAhspSnapshot(snapshot) {
    if (!snapshot || !snapshot.id) return;
    const ahspId = snapshot.id;
    if (!snapshot.is_edited && !snapshot.is_custom) {
      delete customAhspMap[ahspId];
      const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
      if (proj && proj.customAhsp) {
        delete proj.customAhsp[ahspId];
      }
      if (proj && proj.ahspOriginals) {
        delete proj.ahspOriginals[ahspId];
      }
    } else {
      customAhspMap[ahspId] = JSON.parse(JSON.stringify(snapshot));
      const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
      if (proj && proj.customAhsp) {
        proj.customAhsp[ahspId] = customAhspMap[ahspId];
      }
    }
  }

function restoreOriginalAhsp(ahspId) {
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (!proj) return false;

    const orig = (proj.ahspOriginals && proj.ahspOriginals[ahspId]) || 
                 masterAhsp.find(a => a.id === ahspId) || 
                 (window.MASTER_AHSP && window.MASTER_AHSP.find(a => a.id === ahspId));

    if (!orig) return false;

    const isCustom = !!orig.is_custom;
    if (!isCustom) {
      delete customAhspMap[ahspId];
    } else {
      customAhspMap[ahspId] = JSON.parse(JSON.stringify(orig));
      customAhspMap[ahspId].revision = 0;
      delete customAhspMap[ahspId].revisionCode;
      customAhspMap[ahspId].is_edited = false;
    }

    if (proj.ahspOriginals) {
      delete proj.ahspOriginals[ahspId];
    }

    const calcOrig = calculateHsp(orig);
    const targetHsp = orig.hsp || calcOrig.finalHsp;

    if (proj.divisions) {
      proj.divisions.forEach(div => {
        (div.items || []).forEach(itm => {
          if (itm.ahspId === ahspId || itm.code === orig.code) {
            itm.price = targetHsp;
            itm.total = Math.round((Number(itm.volume) || 0) * itm.price);
          }
        });
      });
    }

    proj.customAhsp = customAhspMap;
    window.ProjectManager.updateActiveProject(proj);
    if (window.RabCalculator && window.RabCalculator.calculateProjectRab) {
      window.RabCalculator.calculateProjectRab(proj);
    }
    if (window.ProjectManager.syncAhspDatabaseToFolder) {
      window.ProjectManager.syncAhspDatabaseToFolder();
    }
    return true;
  }

  // Pulihkan SELURUH AHSP yang direvisi kembali ke nilai awal
  function restoreAllOriginalAhsp() {
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (!proj || !proj.ahspOriginals) return 0;
    const ids = Object.keys(proj.ahspOriginals);
    let count = 0;
    ids.forEach(id => {
      if (restoreOriginalAhsp(id)) count++;
    });
    return count;
  }

  // Reset AHSP yang diedit kembali ke nilai Standar SE PUPR 2026
  function resetToStandard(ahspId) {
    return restoreOriginalAhsp(ahspId);
  }

  // Muat pustaka master database dari folder proyek mandiri
  function loadProjectDatabase(db) {
    if (!db) return;
    if (Array.isArray(db.items) && db.items.length > 0) {
      masterAhsp = db.items;
    }
    if (db.customAhsp && typeof db.customAhsp === 'object') {
      Object.assign(customAhspMap, db.customAhsp);
    }
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (proj) {
      if (db.ahspOriginals) {
        proj.ahspOriginals = Object.assign(proj.ahspOriginals || {}, db.ahspOriginals);
      }
      proj.customAhsp = customAhspMap;
      proj.ahspDatabaseSource = "folder";
      window.ProjectManager.updateActiveProject(proj);
    }
  }

  // Buat AHSP Kustom Penuh (Full Custom AHSP)
  function createCustomAhsp(code, name, category, unit, overheadPercent = 0, components = []) {
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
      if (window.ProjectManager.syncAhspDatabaseToFolder) {
        window.ProjectManager.syncAhspDatabaseToFolder();
      }
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
        if (window.ProjectManager.syncAhspDatabaseToFolder) {
          window.ProjectManager.syncAhspDatabaseToFolder();
        }
      }
      return true;
    }
    return false;
  }

  // Tambah Komponen ke AHSP (dari Katalog atau Kustom)
  function addComponentToAhsp(ahspId, comp) {
    let ahsp = getAhspById(ahspId);
    if (!ahsp) return null;

    if (!customAhspMap[ahsp.id]) {
      ahsp = JSON.parse(JSON.stringify(ahsp));
      customAhspMap[ahsp.id] = ahsp;
    } else {
      ahsp = customAhspMap[ahsp.id];
    }

    if (!ahsp.components) ahsp.components = [];
    const numKoef = Number(comp.koef) || 0;
    const numPrice = Number(comp.price) || 0;
    const newComp = {
      section: comp.section || "BAHAN MATERIAL",
      name: comp.name || "Komponen Baru",
      code: comp.code || "-",
      unit: comp.unit || "satuan",
      koef: numKoef,
      price: numPrice,
      total: Math.round(numKoef * numPrice * 100) / 100
    };
    ahsp.components.push(newComp);
    return saveEditedAhsp(ahsp);
  }

  // Hapus Komponen dari AHSP
  function removeComponentFromAhsp(ahspId, compIdx) {
    let ahsp = getAhspById(ahspId);
    if (!ahsp) return null;

    if (!customAhspMap[ahsp.id]) {
      ahsp = JSON.parse(JSON.stringify(ahsp));
      customAhspMap[ahsp.id] = ahsp;
    } else {
      ahsp = customAhspMap[ahsp.id];
    }

    if (ahsp.components && ahsp.components[compIdx] !== undefined) {
      ahsp.components.splice(compIdx, 1);
      return saveEditedAhsp(ahsp);
    }
    return ahsp;
  }

  // Global Price Cascade: Update harga material/upah/alat di katalog & seluruh AHSP/RAB terkait
  function cascadeMaterialPrice(matCode, matName, newPrice, sourceAhspId = null) {
    const numPrice = Number(newPrice);
    if (isNaN(numPrice) || numPrice < 0) return { success: false, affectedAhspCount: 0, affectedItemCount: 0 };

    const cCode = (matCode || '').trim();
    const cName = (matName || '').trim().toLowerCase();
    let affectedAhspCount = 0;
    let affectedItemCount = 0;

    // 1. Update di CatalogPricing override
    if (window.CatalogPricing && window.CatalogPricing.setOverridePrice) {
      if (cCode && cCode !== '-') window.CatalogPricing.setOverridePrice(cCode, numPrice);
      const allMats = window.MASTER_MATERIALS || [];
      const matchedMats = allMats.filter(m => 
        (cCode && cCode !== '-' && m.code === cCode) || 
        (cName && (m.name || '').trim().toLowerCase() === cName)
      );
      matchedMats.forEach(m => {
        window.CatalogPricing.setOverridePrice(m.id, numPrice);
        if (m.code) window.CatalogPricing.setOverridePrice(m.code, numPrice);
      });
    }

    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;

    // 2. Cascade ke seluruh AHSP di customAhspMap
    for (let id in customAhspMap) {
      const ahsp = customAhspMap[id];
      let ahspModified = false;
      if (ahsp.components && Array.isArray(ahsp.components)) {
        ahsp.components.forEach(comp => {
          const compCodeMatch = cCode && cCode !== '-' && comp.code && comp.code.trim() === cCode;
          const compNameMatch = cName && comp.name && comp.name.trim().toLowerCase() === cName;
          if (compCodeMatch || compNameMatch) {
            comp.price = numPrice;
            comp.total = Math.round((Number(comp.koef) || 0) * numPrice * 100) / 100;
            ahspModified = true;
          }
        });
      }
      if (ahspModified) {
        ahsp.is_edited = true;
        const calc = calculateHsp(ahsp);
        ahsp.hsp = calc.finalHsp;
        affectedAhspCount++;
      }
    }

    // 3. Cascade ke seluruh AHSP yang dipakai dalam RAB aktif (meskipun belum masuk customAhspMap)
    if (proj && proj.divisions && Array.isArray(proj.divisions)) {
      proj.divisions.forEach(div => {
        (div.items || []).forEach(itm => {
          const targetAhspId = itm.ahspId || itm.code;
          if (targetAhspId) {
            let ahsp = customAhspMap[targetAhspId];
            if (!ahsp) {
              const list = (masterAhsp && masterAhsp.length > 0) ? masterAhsp : (window.MASTER_AHSP || []);
              const orig = list.find(a => a.id === targetAhspId || a.code === targetAhspId);
              if (orig && orig.components) {
                const hasComp = orig.components.some(comp => 
                  (cCode && cCode !== '-' && comp.code && comp.code.trim() === cCode) ||
                  (cName && comp.name && comp.name.trim().toLowerCase() === cName)
                );
                if (hasComp) {
                  ahsp = JSON.parse(JSON.stringify(orig));
                  ahsp.is_edited = true;
                  customAhspMap[ahsp.id] = ahsp;
                  ahsp.components.forEach(comp => {
                    if ((cCode && cCode !== '-' && comp.code && comp.code.trim() === cCode) || (cName && comp.name && comp.name.trim().toLowerCase() === cName)) {
                      comp.price = numPrice;
                      comp.total = Math.round((Number(comp.koef) || 0) * numPrice * 100) / 100;
                    }
                  });
                  const calc = calculateHsp(ahsp);
                  ahsp.hsp = calc.finalHsp;
                  affectedAhspCount++;
                }
              }
            }

            if (ahsp) {
              itm.price = ahsp.hsp;
              itm.total = Math.round((Number(itm.volume) || 0) * itm.price);
              affectedItemCount++;
            }
          }
        });
      });

      proj.customAhsp = customAhspMap;
      if (window.ProjectManager && window.ProjectManager.updateActiveProject) {
        window.ProjectManager.updateActiveProject(proj);
      }
    }

    // 4. Hitung ulang total RAB
    if (window.RabCalculator && window.RabCalculator.calculateProjectRab && proj) {
      window.RabCalculator.calculateProjectRab(proj);
    }

    return {
      success: true,
      affectedAhspCount,
      affectedItemCount,
      newPrice: numPrice
    };
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
      const activeItem = customAhspMap[item.id] || item;
      const calc = calculateHsp(activeItem);
      return {
        ...activeItem,
        hsp: calc.finalHsp,
        overhead_percent: calc.overheadPercent
      };
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
        overhead_percent: (activeAhsp.overhead_percent !== undefined) ? activeAhsp.overhead_percent : 0,
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
                overhead_percent: Number(itm.overhead_percent) || 0,
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
    addComponentToAhsp,
    removeComponentFromAhsp,
    cascadeMaterialPrice,
    deleteCustomAhsp,
    getAllAhspList,
    getAllAhsp: getAllAhspList,
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
    importAhspJson,
    restoreAhspSnapshot,
    restoreOriginalAhsp,
    restoreAllOriginalAhsp,
    loadProjectDatabase,
    getOriginals: () => ((window.ProjectManager && window.ProjectManager.getActiveProject()) || {}).ahspOriginals || {}
  };
})();
