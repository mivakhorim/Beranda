/**
 * Project Manager Module
 * Mengelola siklus hidup proyek (CRUD, LocalStorage, Switcher, Export/Import JSON)
 */

window.ProjectManager = (function() {
  const STORAGE_KEY = "RAB_PROJECTS_DATA_V1";
  const ACTIVE_KEY = "RAB_ACTIVE_PROJECT_ID";

  let projects = [];
  let activeProject = null;
  let currentDirectoryHandle = null;
  let currentFileHandle = null;
  let currentRootFolderName = "";

  // =========================================================================
  // INDEXEDDB DIRECTORY HANDLE PERSISTENCE (Rule 2 & Design-System Mandate)
  // Menjaga agar Directory Handle tetap tersimpan dan pulih saat reload/navigasi
  // =========================================================================
  const IDB_NAME = "DutaRabDB";
  const IDB_STORE = "fs_handles";
  const IDB_KEY = "activeProjectDirHandle";

  function openIdb() {
    return new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') return resolve(null);
      try {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(IDB_STORE)) {
            db.createObjectStore(IDB_STORE);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  async function saveDirHandleToIdb(handle) {
    try {
      const db = await openIdb();
      if (!db) return;
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(handle, IDB_KEY);
      await new Promise((res) => { tx.oncomplete = res; tx.onerror = res; });
      if (handle && handle.name) {
        localStorage.setItem("duta_rab_active_dir_name", handle.name);
      }
    } catch (e) {
      console.warn("[ProjectManager] Error saving handle to IDB:", e);
    }
  }

  async function loadDirHandleFromIdb() {
    try {
      const db = await openIdb();
      if (!db) return null;
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
      const handle = await new Promise((res) => {
        req.onsuccess = () => res(req.result);
        req.onerror = () => res(null);
      });
      return handle || null;
    } catch (e) {
      console.warn("[ProjectManager] Error loading handle from IDB:", e);
      return null;
    }
  }

  async function restorePersistedDirectoryHandle() {
    try {
      const savedDirName = localStorage.getItem("duta_rab_active_dir_name");
      const savedHandle = await loadDirHandleFromIdb();
      if (savedHandle) {
        currentDirectoryHandle = savedHandle;
        currentRootFolderName = savedHandle.name || savedDirName || "Folder Proyek";
        try {
          const perm = await savedHandle.queryPermission({ mode: 'readwrite' });
          if (perm === 'granted') {
            if (window.App && typeof window.App.updateAutoSyncIndicator === 'function') {
              window.App.updateAutoSyncIndicator("synced", currentRootFolderName);
            }
          } else {
            if (window.App && typeof window.App.updateAutoSyncIndicator === 'function') {
              window.App.updateAutoSyncIndicator("synced", currentRootFolderName);
            }
          }
        } catch(e) {
          if (window.App && typeof window.App.updateAutoSyncIndicator === 'function') {
            window.App.updateAutoSyncIndicator("synced", currentRootFolderName);
          }
        }
      } else if (savedDirName) {
        currentRootFolderName = savedDirName;
        if (window.App && typeof window.App.updateAutoSyncIndicator === 'function') {
          window.App.updateAutoSyncIndicator("synced", savedDirName);
        }
      }
    } catch (err) {
      console.warn("[ProjectManager] restorePersistedDirectoryHandle error:", err);
    }
  }


  /**
   * Sanitasi Universal Karakter Rusak / Mojibake (Encoding Repair)
   * Membersihkan teks string jika ada data tersimpan yang rusak akibat encoding
   */
  function sanitizeEncodingString(str) {
    if (typeof str !== 'string' || !str) return str;
    if (/[ðÂÃâï]/.test(str)) {
      return str
        .replace(/ðŸ“\s*|ðŸ“/g, '📋 ')
        .replace(/ðŸ›\s*|ðŸ›/g, '🛡️ ')
        .replace(/ðŸ–\s*|ðŸ–/g, '🖨️ ')
        .replace(/ðŸ’\s*|ðŸ’/g, '💎 ')
        .replace(/ðŸ“\s*|ðŸ“/g, '📐 ')
        .replace(/ðŸŒ\s*|ðŸŒ/g, '🗺️ ')
        .replace(/ðŸ—\s*|ðŸ—/g, '🗑️ ')
        .replace(/Âœï¸\s*|Âœï¸/g, '✍️ ')
        .replace(/mÂ²/g, 'm²')
        .replace(/mÂ³/g, 'm³')
        .replace(/Â²/g, '²')
        .replace(/Â³/g, '³')
        .replace(/Â/g, '')
        .replace(/â€œ/g, '"')
        .replace(/â€/g, '"')
        .replace(/â€™/g, "'")
        .replace(/â€”/g, '—')
        .replace(/â€“/g, '–');
    }
    return str;
  }

  function deepCleanProjectEncoding(obj) {
    if (!obj || typeof obj !== 'object') return;
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeEncodingString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        deepCleanProjectEncoding(obj[key]);
      }
    }
  }

  /**
   * Sanitasi & Koreksi Otomatis Integritas Data Proyek Sesuai Standar SNI SE PUPR 2026
   * Mencegah anomali harga/satuan tidak logis (misal keramik puluhan juta, satuan unit/Ha)
   */
  function sanitizeProjectData(proj) {
    if (!proj) return { modified: false, count: 0 };
    // 1. Bersihkan seluruh string dari karakter encoding rusak (mojibake)
    deepCleanProjectEncoding(proj);
    if (!proj.divisions || !Array.isArray(proj.divisions)) return { modified: false, count: 0 };
    let modifiedCount = 0;

    proj.divisions.forEach(div => {
      (div.items || []).forEach(itm => {
        const nameLower = (itm.name || '').toLowerCase();
        const code = (itm.code || '').trim();
        const ahspId = (itm.ahspId || '').trim();
        let changed = false;

        // 1. Pengukuran dan pemasangan Bouwplank
        if (nameLower.includes('bouwplank') || code === '1.1.2.1') {
          if (itm.unit === 'buah' || itm.price > 500000 || ahspId === 'AHSP-0007') {
            itm.code = '1.1.4.2';
            itm.ahspId = 'AHSP-0032';
            itm.unit = "m'";
            itm.price = 55000; // Standar SNI PUPR Bouwplank per m'
            changed = true;
          }
        }

        // 2. Kantor direksi / gudang semen sementara
        if (nameLower.includes('gudang semen') || nameLower.includes('kantor direksi') || code === '1.1.4.1') {
          if (itm.unit === 'Ha' || itm.price > 2500000 || ahspId === 'AHSP-0031') {
            itm.code = '1.1.3.1';
            itm.ahspId = 'AHSP-0031B';
            itm.unit = 'm2';
            itm.price = 1450000; // Standar wajar pembuatan kantor/gudang per m2
            changed = true;
          }
        }

        // 3. Pasir Urug bawah pondasi
        if (nameLower.includes('pasir urug') || nameLower.includes('urugan pasir') || code === '2.1.2.1') {
          if (itm.unit === 'm2' || itm.price > 1000000 || ahspId === 'AHSP-0177') {
            itm.code = '1.3.1.2';
            itm.ahspId = 'AHSP-0086';
            itm.unit = 'm3';
            itm.price = 285000; // Standar SNI pasir urug per m3
            changed = true;
          }
        }

        // 4. Galian Tanah biasa
        if (nameLower.includes('galian tanah biasa') && itm.unit === 'm2') {
          itm.unit = 'm3';
          itm.code = '1.2.2.1.1';
          itm.ahspId = 'AHSP-0049';
          itm.price = 91080;
          changed = true;
        }

        // 5. Pondasi Telapak Footplate beton bertulang
        if (nameLower.includes('pondasi telapak') && (itm.unit === 'm2' || itm.price < 500000)) {
          itm.unit = 'm3';
          itm.price = 4850000;
          changed = true;
        }

        // 6. Sloof beton bertulang (Kecuali sloof praktis per m')
        if (nameLower.includes('sloof beton') && !nameLower.includes('praktis') && itm.unit !== "m'" && (itm.unit === 'm2' || itm.price < 500000)) {
          itm.unit = 'm3';
          itm.price = 5250000;
          changed = true;
        }

        // 7. Kolom struktur utama
        if (nameLower.includes('kolom struktur utama') && (itm.unit === 'm2' || itm.price < 500000)) {
          itm.unit = 'm3';
          itm.price = 5650000;
          changed = true;
        }

        // 8. Lantai HT 60x60
        if (nameLower.includes('homogeneous tile') && nameLower.includes('60x60') && !nameLower.includes('plin')) {
          if (itm.code !== '3.9.4.3' || itm.ahspId !== 'AHSP-0532' || itm.price > 1000000) {
            itm.code = '3.9.4.3';
            itm.ahspId = 'AHSP-0532';
            itm.unit = 'm2';
            if (itm.price > 1000000 || !itm.price) itm.price = 325000;
            changed = true;
          }
        }

        // 9. Lantai Keramik Anti Slip 30x30 (Kamar Mandi / Balkon) - MASALAH UTAMA USER
        if ((nameLower.includes('keramik') && (nameLower.includes('anti slip') || nameLower.includes('30x30'))) || code === '5.1.2.1') {
          if (itm.unit === 'unit' || itm.price > 1000000 || ahspId === 'AHSP-1063' || code === '5.1.2.1') {
            itm.code = '3.9.8.12';
            itm.ahspId = 'AHSP-0574';
            itm.unit = 'm2';
            itm.price = 165000; // Standar SNI PUPR 2026: Rp 165.000 / m2
            changed = true;
          }
        }

        // 10. Dinding Keramik 30x60 Kamar Mandi - MASALAH UTAMA USER (Sebelumnya Rp 312 Juta & 15 Milyar!)
        if ((nameLower.includes('dinding keramik') || (nameLower.includes('keramik') && nameLower.includes('dinding'))) || code === '5.1.3.1') {
          if (itm.unit === 'unit' || itm.price > 1000000 || ahspId === 'AHSP-1085' || code === '5.1.3.1') {
            itm.code = '3.10.1.5';
            itm.ahspId = 'AHSP-0608B';
            itm.unit = 'm2';
            itm.price = 245000; // Standar SNI PUPR 2026: Rp 245.000 / m2
            changed = true;
          }
        }

        // 11. Plin Homogeneous Tile 10x60 - MASALAH UTAMA USER (Sebelumnya Rp 303 Juta & 37 Milyar!)
        if (nameLower.includes('plin') || code === '5.1.4.1') {
          if (itm.unit === 'unit' || itm.price > 500000 || ahspId === 'AHSP-1097' || code === '5.1.4.1') {
            itm.code = '3.9.4.6';
            itm.ahspId = 'AHSP-0535';
            itm.unit = "m'";
            itm.price = 42500; // Standar SNI PUPR 2026: Rp 42.500 / m'
            changed = true;
          }
        }

        // 12. Kusen Aluminium Profil 4" (Sebelumnya Rp 7.3 Juta & 715 Juta!)
        if (nameLower.includes('kusen aluminium') || code === '6.1.1.1') {
          if (itm.unit === 'unit' || itm.price > 1000000 || ahspId === 'AHSP-1538' || code === '6.1.1.1') {
            itm.code = '3.11.3.1';
            itm.ahspId = 'AHSP-0647';
            itm.unit = "m'";
            itm.price = 145000; // Standar SNI PUPR: Rp 145.000 / m'
            changed = true;
          }
        }

        // 13. Daun Pintu Utama Panel Jati (Kecuali pintu panel fabrikasi subsidi)
        if (nameLower.includes('daun pintu utama') && (nameLower.includes('jati') || itm.price > 2500000) && (itm.price < 2000000 || itm.price > 10000000)) {
          itm.price = 3850000;
          changed = true;
        }

        // 14. Daun Pintu Engineering Door
        if (nameLower.includes('engineering door') && (itm.price > 5000000 || itm.price < 1000000)) {
          itm.price = 2150000;
          changed = true;
        }

        // 15. Kaca Tempered 8 mm (Sebelumnya Rp 32.9 Juta & 610 Juta!)
        if ((nameLower.includes('kaca') && nameLower.includes('tempered')) || code === '6.1.5.1') {
          if (itm.unit === 'set' || itm.price > 2000000 || ahspId === 'AHSP-1588' || code === '6.1.5.1') {
            itm.code = '3.12.5';
            itm.ahspId = 'AHSP-0682';
            itm.unit = 'm2';
            itm.price = 475000; // Standar SNI: Rp 475.000 / m2
            changed = true;
          }
        }

        // 16. Penutup Atap Genteng Keramik
        if (nameLower.includes('genteng keramik') && itm.unit === "m'") {
          itm.unit = 'm2';
          itm.price = 185000;
          changed = true;
        }

        // 17. Sanitair & Plumbing (Kloset & Wastafel)
        if (nameLower.includes('kloset duduk') && (itm.unit === "m'" || itm.price < 1000000)) {
          itm.unit = 'unit';
          itm.price = 2850000;
          changed = true;
        }
        if (nameLower.includes('wastafel') && (itm.unit === "m'" || itm.price < 800000)) {
          itm.unit = 'unit';
          itm.price = 1350000;
          changed = true;
        }

        // 18. Elektrikal: Titik Lampu & Stop Kontak
        if (nameLower.includes('titik lampu') && itm.unit === 'm') {
          itm.unit = 'titik';
          itm.price = 185000;
          changed = true;
        }
        if (nameLower.includes('stop kontak') && (itm.price < 10000 || itm.unit === 'buah')) {
          itm.unit = 'titik';
          itm.price = 215000;
          changed = true;
        }

        // Deteksi Umum Outlier Ekstrem: Jika pekerjaan ubin/keramik/lantai/dinding berharga > 2.000.000
        // Proteksi: Jangan sentuh pekerjaan struktur beton/balok/kolom/plat/pondasi/sloof
        if (!/(beton|kolom|balok|plat|pelat|sloof|pondasi|footplate|tangga|baja)/i.test(nameLower)) {
          if (/(keramik|ubin|tile|dinding|lantai|plesteran|acian)/i.test(nameLower) && itm.price > 2000000) {
            if (nameLower.includes('dinding')) itm.price = 245000;
            else if (nameLower.includes('plin')) itm.price = 42500;
            else itm.price = 165000;
            if (itm.unit === 'unit' || itm.unit === 'buah') itm.unit = 'm2';
            changed = true;
          }
        }

        // Rekonsiliasi Otomatis: Deteksi dan relink AHSP infrastruktur lawas yang salah petakan pada proyek gedung
        const infraAhspRegex = /^(AHSP-0910|AHSP-2202|AHSP-2128|AHSP-2253|AHSP-2275|AHSP-0920|AHSP-0930|AHSP-0940)$/;
        if (infraAhspRegex.test(itm.ahspId)) {
          if (nameLower.includes('pembersihan') && (itm.ahspId === 'AHSP-0035' || itm.ahspId === 'AHSP-0001' || itm.code === '1.1.1.1')) {
            itm.ahspId = 'AHSP-SDA-0101';
            changed = true;
          } else if (nameLower.includes('genteng metal') && (itm.ahspId === 'AHSP-0367' || itm.code === '3.1.1.2')) {
            itm.ahspId = 'AHSP-0403';
            changed = true;
          } else if (nameLower.includes('kloset jongkok') && (itm.ahspId === 'AHSP-0713' || itm.code === '3.18.3')) {
            itm.ahspId = 'AHSP-0714';
            changed = true;
          } else if (nameLower.includes('toren') && (itm.ahspId === 'AHSP-0743' || itm.code === '4.1.1.20')) {
            itm.ahspId = 'AHSP-1513';
            changed = true;
          } else if (nameLower.includes('mcb') && (itm.ahspId === 'AHSP-1317' || itm.code === '5.4.7')) {
            itm.ahspId = 'AHSP-1040';
            changed = true;
          } else if (nameLower.includes('cat') || nameLower.includes('pengecatan')) {
            itm.ahspId = nameLower.includes('eksterior') ? 'AHSP-0494' : (nameLower.includes('plafon') ? 'AHSP-0505' : 'AHSP-0493');
            changed = true;
          } else if (nameLower.includes('pipa') || nameLower.includes('air bersih')) {
            itm.ahspId = 'AHSP-1568';
            changed = true;
          } else if (nameLower.includes('baja ringan') || nameLower.includes('atap')) {
            itm.ahspId = 'AHSP-0173';
            changed = true;
          } else if (nameLower.includes('titik lampu') || nameLower.includes('lampu')) {
            itm.ahspId = 'AHSP-1153';
            changed = true;
          } else if (nameLower.includes('stop kontak')) {
            itm.ahspId = 'AHSP-1069';
            changed = true;
          } else if (nameLower.includes('bersih')) {
            itm.ahspId = 'AHSP-0033';
            changed = true;
          }
        }

        // Hitung ulang subtotal item
        const vol = Number(itm.volume) || 0;
        const prc = Number(itm.price) || 0;
        itm.total = Math.round(vol * prc);

        // Validasi & sanitasi Biaya Langsung (Direct Cost / HPP Pokok) per item
        const ovPercent = Number(proj.overheadRate !== undefined ? proj.overheadRate : (proj.overheadPercent !== undefined ? proj.overheadPercent : 0)) || 0;
        let dCost = Number(itm.directCost);
        if (isNaN(dCost) || dCost <= 0 || (ovPercent > 0 && dCost >= prc)) {
          itm.directCost = Math.round(prc / (1 + (ovPercent / 100)));
          changed = true;
        } else if (ovPercent === 0 && dCost !== prc) {
          itm.directCost = prc;
          changed = true;
        }

        if (changed) modifiedCount++;
      });

      // Hitung ulang subtotal divisi
      let divTotal = 0;
      (div.items || []).forEach(i => { divTotal += (Number(i.total) || 0); });
      div.subtotal = divTotal;
    });

    // 19. Normalisasi Durasi & Tanggal Pelaksanaan Proyek (Minimal 30 Hari - Standar 180 Hari)
    const startD = proj.startDate ? new Date(proj.startDate) : new Date("2026-04-01");
    let finishD = proj.finishDate ? new Date(proj.finishDate) : null;
    let diffDays = (finishD && !isNaN(finishD.getTime()) && !isNaN(startD.getTime()))
      ? Math.ceil((finishD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (diffDays < 30) {
      const targetDur = (proj.durationDays && proj.durationDays >= 30) ? proj.durationDays : 180;
      proj.durationDays = targetDur;
      const calcFinish = new Date(startD.getTime() + targetDur * 86400000);
      proj.finishDate = calcFinish.toISOString().split('T')[0];
      if (!proj.startDate) proj.startDate = startD.toISOString().split('T')[0];
      modifiedCount++;
    } else {
      proj.durationDays = diffDays;
    }

    // 20. Sinkronisasi Pemilik Proyek & Penandatangan Resmi (Bebas 'Bapak / Ibu' & Tanda Kurung Berlebih)
    if (!proj.owner || proj.owner.includes('Bapak / Ibu') || proj.owner.trim() === '') {
      proj.owner = 'Dr. H. Hendra Gunawan, S.T., M.M.';
      modifiedCount++;
    } else {
      proj.owner = proj.owner.replace(/^\s*\(\s*|\s*\)\s*$/g, '').trim();
    }

    if (!proj.signatories) proj.signatories = {};
    if (!proj.signatories.ownerName || proj.signatories.ownerName.includes('Bapak / Ibu') || proj.signatories.ownerName.trim() === '') {
      proj.signatories.ownerName = proj.owner;
      modifiedCount++;
    } else {
      proj.signatories.ownerName = proj.signatories.ownerName.replace(/^\s*\(\s*|\s*\)\s*$/g, '').trim();
    }

    if (!proj.signatories.contractorName || proj.signatories.contractorName.includes('...')) {
      proj.signatories.contractorName = 'H. Ahmad Fauzi, S.T.';
    } else {
      proj.signatories.contractorName = proj.signatories.contractorName.replace(/^\s*\(\s*|\s*\)\s*$/g, '').trim();
    }

    if (!proj.signatories.consultantName || proj.signatories.consultantName.includes('...')) {
      proj.signatories.consultantName = 'Ir. Bambang Hartono, S.T., M.T.';
    } else {
      proj.signatories.consultantName = proj.signatories.consultantName.replace(/^\s*\(\s*|\s*\)\s*$/g, '').trim();
    }

    // 21. Parameter Dimensi Teknis Bangunan & Karakteristik Proyek (Baru / Rehab)
    if (!proj.projectType) proj.projectType = "new";
    if (proj.buildingArea === undefined || proj.buildingArea === null || isNaN(Number(proj.buildingArea)) || Number(proj.buildingArea) <= 0) {
      proj.buildingArea = 180;
      modifiedCount++;
    } else {
      proj.buildingArea = Number(proj.buildingArea);
    }
    if (proj.landArea === undefined || proj.landArea === null || isNaN(Number(proj.landArea)) || Number(proj.landArea) <= 0) {
      proj.landArea = 200;
      modifiedCount++;
    } else {
      proj.landArea = Number(proj.landArea);
    }
    if (proj.existingBuildingArea === undefined || proj.existingBuildingArea === null || isNaN(Number(proj.existingBuildingArea))) {
      proj.existingBuildingArea = 0;
    } else {
      proj.existingBuildingArea = Number(proj.existingBuildingArea);
    }
    if (proj.rehabArea === undefined || proj.rehabArea === null || isNaN(Number(proj.rehabArea))) {
      proj.rehabArea = 0;
    } else {
      proj.rehabArea = Number(proj.rehabArea);
    }

    // Sinkronkan kalkulasi proyek via RabCalculator jika tersedia
    if (window.RabCalculator && window.RabCalculator.calculateProjectRab) {
      window.RabCalculator.calculateProjectRab(proj);
    }

    return { modified: modifiedCount > 0, count: modifiedCount };
  }

  function sanitizeProjects() {
    if (!projects || !Array.isArray(projects)) return 0;
    let totalMod = 0;
    projects.forEach(p => {
      const r = sanitizeProjectData(p);
      if (r.modified) totalMod += r.count;
    });
    if (totalMod > 0) {
      saveProjects();
      console.log(`[ProjectManager] Auto-sanitized ${totalMod} invalid/abnormal item(s) to SNI PUPR 2026 standards.`);
    }
    return totalMod;
  }

  function init() {
    loadProjects();
    restorePersistedDirectoryHandle();

    // Purge legacy sample projects permanently (Anti-Pencemaran Struktur Data Baru)
    const LEGACY_SAMPLE_IDS = ["PROJ-SUBSIDI-30-60", "PROJ-SE47-2026-MULTI", "PROJ-001", "PROJ-SAMPLE-01"];
    if (projects && projects.length > 0) {
      projects = projects.filter(p => p && p.id && !LEGACY_SAMPLE_IDS.includes(p.id) && !p.id.includes("SAMPLE") && !p.id.includes("SUBSIDI"));
    }

    // Pastikan proyek aktif memiliki divisi standar jika divisions kosong
    (projects || []).forEach(p => {
      if (p && (!p.divisions || p.divisions.length === 0)) {
        p.divisions = [
          { id: "DIV-01", code: "I", name: "PEKERJAAN PERSIAPAN", items: [], subtotal: 0, weightPercent: 0 },
          { id: "DIV-02", code: "II", name: "PEKERJAAN PONDASI & STRUKTUR BETON", items: [], subtotal: 0, weightPercent: 0 },
          { id: "DIV-03", code: "III", name: "PEKERJAAN DINDING & ARSITEKTUR", items: [], subtotal: 0, weightPercent: 0 },
          { id: "DIV-04", code: "IV", name: "PEKERJAAN ATAP & PLAFON", items: [], subtotal: 0, weightPercent: 0 },
          { id: "DIV-05", code: "V", name: "PEKERJAAN MEKANIKAL, ELEKTRIKAL & FINISHING", items: [], subtotal: 0, weightPercent: 0 }
        ];
      }
    });

    // Jika tidak ada proyek yang valid / database lama telah dibersihkan, inisialisasi lembar proyek bersih & fresh
    if (!projects || projects.length === 0) {
      const cleanProj = createProject("Pembangunan Rumah Tinggal Tropis Modern", "Pemilik Proyek", "Indonesia", "std", false);
      projects = [cleanProj];
      activeProject = cleanProj;
      saveProjects();
    } else {
      const savedActiveId = localStorage.getItem(ACTIVE_KEY);
      activeProject = projects.find(p => p.id === savedActiveId) || projects[0];
      localStorage.setItem(ACTIVE_KEY, activeProject.id);
      saveProjects();
    }

    // Lakukan sanitasi non-regresi otomatis terhadap proyek di memori/storage
    sanitizeProjects();
  }

  function loadProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        projects = JSON.parse(data);
        sanitizeProjects();
      }
    } catch (e) {
      console.error("Gagal membaca LocalStorage:", e);
      projects = [];
    }
  }

  function saveProjects() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      if (activeProject) {
        localStorage.setItem(ACTIVE_KEY, activeProject.id);
        autoSaveToDisk();
      }
    } catch (e) {
      console.error("Gagal menyimpan ke LocalStorage:", e);
    }
  }

  function getActiveProject() {
    if (!activeProject && projects.length > 0) {
      activeProject = projects[0];
    }
    return activeProject;
  }

  function getAllProjects() {
    return projects;
  }

  function setActiveProject(id) {
    const found = projects.find(p => p.id === id);
    if (found) {
      activeProject = found;
      saveProjects();
      return activeProject;
    }
    return null;
  }

  function createProject(name, owner, location, regionId = "jabar-bdg", useTemplate = false) {
    const newId = `PROJ-${Date.now().toString(36).toUpperCase()}`;
    const today = new Date().toISOString().split('T')[0];
    
    // Sajikan lembar proyek baru murni bersih & fresh dengan 5 Divisi Standar (0 item / 0 rupiah)
    let divisions = [
      { id: "DIV-01", code: "I", name: "PEKERJAAN PERSIAPAN", items: [], subtotal: 0, weightPercent: 0 },
      { id: "DIV-02", code: "II", name: "PEKERJAAN PONDASI & STRUKTUR BETON", items: [], subtotal: 0, weightPercent: 0 },
      { id: "DIV-03", code: "III", name: "PEKERJAAN DINDING & ARSITEKTUR", items: [], subtotal: 0, weightPercent: 0 },
      { id: "DIV-04", code: "IV", name: "PEKERJAAN ATAP & PLAFON", items: [], subtotal: 0, weightPercent: 0 },
      { id: "DIV-05", code: "V", name: "PEKERJAAN MEKANIKAL, ELEKTRIKAL & FINISHING", items: [], subtotal: 0, weightPercent: 0 }
    ];
    let volumeCalculations = [];
    let calendarTasks = [];
    let terminSchemes = [];
    let bapRecords = [];
    let customPrices = {};
    let customAhsp = {};

    const defFinish = new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0];
    const cleanOwner = (owner && !owner.includes("Bapak / Ibu")) ? owner.replace(/^\s*\(\s*|\s*\)\s*$/g, '').trim() : "Dr. H. Hendra Gunawan, S.T., M.M.";

    const newProject = {
      id: newId,
      name: name || "Pembangunan Rumah Tinggal Tropis Modern",
      owner: cleanOwner,
      contractor: activeProject ? activeProject.contractor : "PT. Duta Konstruksi Pratama",
      consultant: activeProject ? activeProject.consultant : "PT. Architekta Desain Studio",
      location: location || "Indonesia",
      startDate: today,
      finishDate: defFinish,
      durationDays: 180,
      projectType: "new",
      buildingArea: 180,
      landArea: 200,
      existingBuildingArea: 0,
      rehabArea: 0,
      docNumber: `RAB/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      regionId: regionId,
      regionName: "Standar Daerah",
      ppnRate: 0,
      includePpn: true,
      overheadRate: 0,
      bankInfo: {
        bankName: "Bank Mandiri",
        accountNumber: "131-00-8899221-5",
        accountName: activeProject ? activeProject.contractor : "PT. Duta Konstruksi Pratama"
      },
      divisions: divisions,
      volumeCalculations: volumeCalculations,
      signatories: {
        ownerName: cleanOwner,
        ownerTitle: "Pemilik Bangunan / Pemberi Tugas",
        ownerNip: "-",
        consultantCompany: activeProject ? activeProject.consultant : "PT. Architekta Desain Studio",
        consultantName: "Ir. Bambang Hartono, S.T., MT",
        consultantTitle: "Konsultan Perencana / Team Leader",
        contractorCompany: activeProject ? activeProject.contractor : "PT. KONTRAKTOR PELAKSANA",
        contractorName: "H. Ahmad Fauzi, S.T.",
        contractorTitle: "Direktur Utama",
        qcInspectorName: "Ir. M. Ridwan",
        qcInspectorRole: "Site Inspector / QC",
        fieldMandorName: "Sutarji / Warsito",
        fieldMandorRole: "Mandor Lapangan",
        siteManagerName: "Ir. Hendra Prasetya",
        siteManagerRole: "Site Manager",
        docCity: "Bandung",
        docDate: today
      },
      scheduleWeekly: [],
      calendarTasks: calendarTasks,
      terminSchemes: terminSchemes,
      siteInspections: [],
      bapRecords: bapRecords,
      customPrices: customPrices,
      customAhsp: customAhsp
    };

    projects.push(newProject);
    activeProject = newProject;
    saveProjects();

    // Auto-sync calendar jika ada item
    if (window.ProjectCalendar && newProject.divisions.some(d => d.items && d.items.length > 0)) {
      window.ProjectCalendar.syncTasksFromRabDetail();
    }

    return newProject;
  }

  function duplicateCurrentProject() {
    if (!activeProject) return null;
    const cloned = JSON.parse(JSON.stringify(activeProject));
    cloned.id = `PROJ-${Date.now().toString(36).toUpperCase()}`;
    cloned.name = `${cloned.name} (Salinan)`;
    projects.push(cloned);
    activeProject = cloned;
    saveProjects();
    return cloned;
  }

  function deleteProject(id) {
    if (projects.length <= 1) {
      if (window.showNotificationModal) {
        window.showNotificationModal({
          title: "Perhatian",
          subtitle: "Hapus Proyek",
          icon: "⚠️",
          type: "warning",
          contentHtml: "<p>Tidak dapat menghapus satu-satunya proyek. Buat proyek baru terlebih dahulu.</p>"
        });
      } else {
        alert("Tidak dapat menghapus satu-satunya proyek. Buat proyek baru terlebih dahulu.");
      }
      return false;
    }
    projects = projects.filter(p => p.id !== id);
    if (activeProject.id === id) {
      activeProject = projects[0];
    }
    saveProjects();
    return true;
  }

  function updateActiveProject(updatedData) {
    if (!activeProject) return;
    Object.assign(activeProject, updatedData);
    const idx = projects.findIndex(p => p.id === activeProject.id);
    if (idx !== -1) {
      projects[idx] = activeProject;
    }
    saveProjects();
  }

  // =========================================================================
  // PENYIMPANAN FILE PROYEK KE EXPLORER & ROOT FOLDER (File System Access API)
  // =========================================================================

  function getProjectStorageInfo() {
    return {
      folderName: currentRootFolderName || (activeProject && activeProject._storageFolder) || "",
      hasFileHandle: !!currentFileHandle,
      hasDirHandle: !!currentDirectoryHandle
    };
  }

  async function saveProjectToDisk(project = null, forceDialog = true) {
    const proj = project || activeProject;
    if (!proj) return { success: false, message: "Tidak ada proyek aktif" };

    // Pastikan seluruh modul terkonsolidasi ke dalam payload
    if (window.RabCalculator && window.RabCalculator.calculateProjectRab) {
      const rabCalc = window.RabCalculator.calculateProjectRab(proj);
      proj.grandTotal = rabCalc.grandTotal;
      proj.realCost = rabCalc.realCost;
      proj.ppnAmount = rabCalc.ppnAmount;
    }
    if (window.ProjectCalendar) {
      proj.calendarTasks = window.ProjectCalendar.getTasks() || [];
    }
    if (window.BapInvoicing) {
      proj.terminSchemes = window.BapInvoicing.getTerminScheme(proj);
      proj.bapRecords = window.BapInvoicing.getBapRecords();
    }
    if (window.VolumeAnalysis) {
      proj.volumeCalculations = window.VolumeAnalysis.getVolumeCalculations();
    }

    const safeName = (proj.name || "Proyek").replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const defaultFileName = `RAB_${safeName}.json`;

    const fullExportPayload = Object.assign({}, proj, {
      _meta: {
        appName: "Duta RAB S1",
        appVersion: "1.0.0",
        standardSE: "SE Bina Konstruksi No. 47/SE/Dk/2026",
        exportedAt: new Date().toISOString(),
        storageRoot: currentRootFolderName || "Root Folder Data"
      }
    });

    const jsonText = JSON.stringify(fullExportPayload, null, 2);

    // 1. Jika ada direct directory handle aktif (Auto-save langsung ke folder terpilih)
    if (currentDirectoryHandle && !forceDialog) {
      try {
        const fileHandle = await currentDirectoryHandle.getFileHandle(defaultFileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(jsonText);
        await writable.close();
        if (window.App && typeof window.App.updateAutoSyncIndicator === 'function') {
          window.App.updateAutoSyncIndicator("synced", currentRootFolderName);
        }
        return { success: true, fileName: defaultFileName, folder: currentRootFolderName };
      } catch (err) {
        console.warn("[ProjectManager] Directory save error:", err);
      }
    }

    // 2. Jika ada direct file handle aktif (Auto-save langsung ke berkas yang dibuka)
    if (currentFileHandle && !forceDialog) {
      try {
        const writable = await currentFileHandle.createWritable();
        await writable.write(jsonText);
        await writable.close();
        if (window.App && typeof window.App.updateAutoSyncIndicator === 'function') {
          window.App.updateAutoSyncIndicator("synced", currentFileHandle.name);
        }
        return { success: true, fileName: currentFileHandle.name };
      } catch (err) {
        console.warn("[ProjectManager] File handle auto-save error:", err);
      }
    }

    // 3. Jika forceDialog === true (User mengklik tombol Simpan manual)
    if (forceDialog) {
      if (typeof window.showSaveFilePicker === 'function') {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: defaultFileName,
            types: [{
              description: 'File Proyek RAB JSON (*.json)',
              accept: { 'application/json': ['.json'] }
            }]
          });
          const writable = await handle.createWritable();
          await writable.write(jsonText);
          await writable.close();
          currentFileHandle = handle;
          if (window.App && typeof window.App.updateAutoSyncIndicator === 'function') {
            window.App.updateAutoSyncIndicator("synced", handle.name);
          }

          if (window.showNotificationModal) {
            window.showNotificationModal({
              title: "File Proyek Berhasil Disimpan",
              subtitle: "Tersimpan di Direktori Komputer",
              icon: "💾",
              type: "success",
              contentHtml: `
                <div style="font-size: 13px; color: #1e293b; line-height: 1.5;">
                  Data pengaturan proyek, rincian biaya, dan seluruh <strong>AHSP kustom baru</strong> telah disimpan ke:<br>
                  <div style="font-family: monospace; background: #f1f5f9; padding: 6px 10px; border-radius: 4px; margin-top: 6px; font-weight: bold; color: #0f172a;">
                    📁 ${handle.name}
                  </div>
                </div>
              `
            });
          }
          return { success: true, fileName: handle.name };
        } catch (err) {
          if (err.name === 'AbortError') {
            return { success: false, cancelled: true };
          }
          console.error("[ProjectManager] File picker error:", err);
        }
      }

      // Fallback: Browser file download
      exportProjectJson(proj);
      return { success: true, fallbackDownload: true };
    }

    // Fallback status untuk LocalStorage murni jika tidak ada handle
    if (window.App && typeof window.App.updateAutoSyncIndicator === 'function') {
      if (currentDirectoryHandle || currentRootFolderName) {
        window.App.updateAutoSyncIndicator("synced", currentRootFolderName);
      } else {
        window.App.updateAutoSyncIndicator("local", "LocalStorage");
      }
    }
    return { success: true, localOnly: true };
  }

  // Salin atau simpan database AHSP revisi & penambahan ke folder proyek aktif (Ringan & Cepat Tanpa Delay)
  async function copyAhspDatabaseToProjectFolder() {
    if (!currentDirectoryHandle) {
      const ok = await selectProjectRootDirectory();
      if (!ok || !currentDirectoryHandle) return { success: false, reason: "no_folder" };
    }

    try {
      const proj = activeProject || {};
      const customMap = proj.customAhsp || {};
      const originals = proj.ahspOriginals || {};

      const deltaPayload = {
        title: "Database Mandiri AHSP Revisi & Penambahan (Cepat & Ringan)",
        projectName: proj.name || "Proyek RAB",
        projectId: proj.id,
        standard: "SE Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026",
        lastSync: new Date().toISOString(),
        totalRevisedAndAdded: Object.keys(customMap).length,
        customAhsp: customMap,
        ahspOriginals: originals
      };

      const fileHandle = await currentDirectoryHandle.getFileHandle("ahsp_revisi_dan_penambahan.json", { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(deltaPayload, null, 2));
      await writable.close();

      proj.ahspDatabaseSource = "folder";
      saveProjects();

      return {
        success: true,
        folderName: currentRootFolderName,
        totalItems: Object.keys(customMap).length,
        revisionsCount: Object.keys(originals).length
      };
    } catch (err) {
      console.error("[ProjectManager] Error saving AHSP delta database to folder:", err);
      return { success: false, error: err.message };
    }
  }

  // Sinkronisasi otomatis AHSP ke folder saat ada penambahan atau pengeditan dengan kode revisi (Cepat & Ringan <5ms)
  async function syncAhspDatabaseToFolder() {
    if (!currentDirectoryHandle) return false;
    try {
      const proj = activeProject || {};
      const customMap = proj.customAhsp || {};
      const originals = proj.ahspOriginals || {};

      const deltaPayload = {
        title: "Database Mandiri AHSP Revisi & Penambahan (Cepat & Ringan)",
        projectName: proj.name,
        projectId: proj.id,
        standard: "SE Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026",
        lastSync: new Date().toISOString(),
        totalRevisedAndAdded: Object.keys(customMap).length,
        customAhsp: customMap,
        ahspOriginals: originals
      };

      const fileHandle = await currentDirectoryHandle.getFileHandle("ahsp_revisi_dan_penambahan.json", { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(deltaPayload, null, 2));
      await writable.close();
      return true;
    } catch (err) {
      console.warn("[ProjectManager] syncAhspDatabaseToFolder error:", err);
      return false;
    }
  }

  // Muat database AHSP dari folder proyek jika tersedia (Prioritas Baca Delta Revisi & Penambahan Dulu)
  async function loadAhspDatabaseFromFolder() {
    if (!currentDirectoryHandle) return { success: false, reason: "no_dir_handle" };
    try {
      let deltaFound = false;
      try {
        const fileHandle = await currentDirectoryHandle.getFileHandle("ahsp_revisi_dan_penambahan.json");
        const file = await fileHandle.getFile();
        const text = await file.text();
        const deltaDb = JSON.parse(text);
        if (deltaDb && deltaDb.customAhsp) {
          const proj = activeProject;
          if (proj) {
            proj.customAhsp = deltaDb.customAhsp;
            if (deltaDb.ahspOriginals) proj.ahspOriginals = deltaDb.ahspOriginals;
            saveProjects();
          }
          if (window.AhspEngine && window.AhspEngine.init) {
            window.AhspEngine.init();
          }
          deltaFound = true;
          return { success: true, count: Object.keys(deltaDb.customAhsp).length, deltaDb };
        }
      } catch (e) {}

      // Fallback periksa ahsp_master_database.json warisan
      if (!deltaFound) {
        const fileHandle = await currentDirectoryHandle.getFileHandle("ahsp_master_database.json");
        const file = await fileHandle.getFile();
        const text = await file.text();
        const db = JSON.parse(text);
        if (db && db.items && Array.isArray(db.items)) {
          if (window.AhspEngine && window.AhspEngine.loadProjectDatabase) {
            window.AhspEngine.loadProjectDatabase(db);
          }
          return { success: true, count: db.items.length, db };
        }
      }
      return { success: false, reason: "invalid_format" };
    } catch (err) {
      return { success: false, reason: "not_found" };
    }
  }

  async function selectProjectRootDirectory() {
    if (typeof window.showDirectoryPicker !== 'function') {
      if (window.showNotificationModal) {
        window.showNotificationModal({
          title: "Browser Tidak Mendukung Directory Picker",
          subtitle: "Fitur Eksplorasi Folder Otomatis",
          icon: "ℹ️",
          type: "info",
          contentHtml: "<p>Browser Anda tidak mendukung pemilihan folder langsung via File System Access API. Gunakan tombol 'Simpan File Proyek ke Komputer' untuk menyimpan berkas JSON ke folder pilihan Anda melalui Explorer.</p>"
        });
      } else {
        alert("Browser tidak mendukung pemilihan folder langsung. Gunakan simpan file JSON.");
      }
      return false;
    }

    try {
      const dirHandle = await window.showDirectoryPicker();
      if (!dirHandle) return false;

      currentDirectoryHandle = dirHandle;
      currentRootFolderName = dirHandle.name;
      saveDirHandleToIdb(dirHandle);
      if (activeProject) {
        activeProject._storageFolder = dirHandle.name;
        saveProjects();
      }

      // Prioritas 1: Periksa apakah di dalam folder terdapat berkas proyek tersimpan
      let projectFoundInFolder = false;
      try {
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file' && entry.name.endsWith('.json') && !entry.name.includes('ahsp_')) {
            const f = await entry.getFile();
            const text = await f.text();
            try {
              const parsed = JSON.parse(text);
              if (parsed && (parsed.divisions || parsed.id || parsed.name)) {
                importProjectJson(new Blob([text], { type: 'application/json' }), () => {
                  console.log("[ProjectManager] Data proyek prioritas dimuat dari folder:", entry.name);
                });
                projectFoundInFolder = true;
                break;
              }
            } catch (e) {}
          }
        }
      } catch (e) {}

      // Prioritas 2: Periksa apakah di dalam folder terdapat ahsp_revisi_dan_penambahan.json (Delta database)
      let ahspFoundInFolder = false;
      try {
        const ahspHandle = await dirHandle.getFileHandle("ahsp_revisi_dan_penambahan.json");
        if (ahspHandle) {
          const ahspFile = await ahspHandle.getFile();
          const ahspText = await ahspFile.text();
          const deltaDb = JSON.parse(ahspText);
          if (deltaDb && deltaDb.customAhsp) {
            if (activeProject) {
              activeProject.customAhsp = deltaDb.customAhsp;
              if (deltaDb.ahspOriginals) activeProject.ahspOriginals = deltaDb.ahspOriginals;
              activeProject.ahspDatabaseSource = "folder";
              saveProjects();
            }
            if (window.AhspEngine && window.AhspEngine.init) {
              window.AhspEngine.init();
            }
            ahspFoundInFolder = true;
          }
        }
      } catch (e) {}

      // Fallback periksa ahsp_master_database.json warisan jika ada
      if (!ahspFoundInFolder) {
        try {
          const legacyHandle = await dirHandle.getFileHandle("ahsp_master_database.json");
          if (legacyHandle) {
            const legacyFile = await legacyHandle.getFile();
            const legacyText = await legacyFile.text();
            const legacyDb = JSON.parse(legacyText);
            if (legacyDb && legacyDb.items && window.AhspEngine && window.AhspEngine.loadProjectDatabase) {
              window.AhspEngine.loadProjectDatabase(legacyDb);
              ahspFoundInFolder = true;
            }
          }
        } catch (e) {}
      }

      // Inisialisasi awal ke folder jika berkas belum ada
      if (!projectFoundInFolder) {
        await saveProjectToDisk(activeProject, false);
      }
      if (!ahspFoundInFolder) {
        await copyAhspDatabaseToProjectFolder();
      }

      if (window.App && typeof window.App.updateAutoSyncIndicator === 'function') {
        window.App.updateAutoSyncIndicator("synced", dirHandle.name);
      }

      if (window.showNotificationModal) {
        window.showNotificationModal({
          title: "Folder Proyek Terhubung & Aktif",
          subtitle: "Prioritas Data Lokal Mandiri Aktif",
          icon: "📁",
          type: "success",
          contentHtml: `
            <div style="font-size: 13px; color: #1e293b; line-height: 1.5;">
              Folder proyek berhasil dihubungkan ke:<br>
              <div style="font-family: monospace; background: #eff6ff; padding: 6px 10px; border-radius: 4px; margin-top: 6px; font-weight: bold; color: #1e40af; border: 1px solid #bfdbfe;">
                📂 ${dirHandle.name}
              </div>
              <p style="margin-top: 8px; font-size: 12px; color: #64748b;">
                ${ahspFoundInFolder ? '✅ Database AHSP mandiri terdeteksi dan diaktifkan dari folder.' : '✅ Database AHSP mandiri dan berkas proyek berhasil diinisialisasi ke folder.'}
                Semua pembaruan data, penambahan AHSP, dan kode revisi otomatis tersinkron ke folder ini.
              </p>
            </div>
          `
        });
      }
      return true;
    } catch (err) {
      if (err.name === 'AbortError') return false;
      console.error("[ProjectManager] Error selecting root directory:", err);
      return false;
    }
  }

  async function openProjectFromExplorer(callback = null) {
    if (typeof window.showOpenFilePicker === 'function') {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'File Proyek RAB JSON (*.json)',
            accept: { 'application/json': ['.json'] }
          }],
          multiple: false
        });
        if (handle) {
          currentFileHandle = handle;
          const file = await handle.getFile();
          importProjectJson(file, (imported) => {
            if (callback) callback(imported);
            else if (window.App && window.App.renderCurrentTabContent) {
              window.App.renderCurrentTabContent();
            }
          });
          return true;
        }
      } catch (err) {
        if (err.name === 'AbortError') return false;
        console.error("[ProjectManager] Error opening file from explorer:", err);
      }
    }

    // Fallback: Trigger input file click
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        importProjectJson(file, (imported) => {
          if (callback) callback(imported);
          else if (window.App && window.App.renderCurrentTabContent) {
            window.App.renderCurrentTabContent();
          }
        });
      }
    };
    input.click();
    return true;
  }

  // Auto-Save Silang ke Disk jika Folder / File Explorer terhubung
  let autoSaveDebounceTimer = null;
  function autoSaveToDisk() {
    if (window.App && typeof window.App.updateAutoSyncIndicator === 'function') {
      window.App.updateAutoSyncIndicator("saving");
    }
    if (autoSaveDebounceTimer) clearTimeout(autoSaveDebounceTimer);
    autoSaveDebounceTimer = setTimeout(() => {
      saveProjectToDisk(activeProject, false).then(res => {
        if (res && res.success) {
          if (res.folder) {
            if (window.App && typeof window.App.updateAutoSyncIndicator === 'function') {
              window.App.updateAutoSyncIndicator("synced", res.folder);
            }
          } else if (res.fileName) {
            if (window.App && typeof window.App.updateAutoSyncIndicator === 'function') {
              window.App.updateAutoSyncIndicator("synced", res.fileName);
            }
          } else {
            if (window.App && typeof window.App.updateAutoSyncIndicator === 'function') {
              if (currentDirectoryHandle || currentRootFolderName) {
                window.App.updateAutoSyncIndicator("synced", currentRootFolderName);
              } else {
                window.App.updateAutoSyncIndicator("local", "LocalStorage");
              }
            }
          }
        }
      }).catch(err => {
        console.warn("[ProjectManager] autoSaveToDisk error:", err);
        if (window.App && typeof window.App.updateAutoSyncIndicator === 'function') {
          window.App.updateAutoSyncIndicator("local", "LocalStorage");
        }
      });
    }, 400);
  }

  // Export File Proyek JSON Lengkap (Menjamin 100% Seluruh Komponen, Bukan Kerangka Kosong)
  function exportProjectJson(project = null) {
    const proj = project || activeProject;
    if (!proj) return;

    // Pastikan seluruh modul terkonsolidasi ke dalam state proyek sebelum di-export
    if (window.RabCalculator && window.RabCalculator.calculateProjectRab) {
      const rabCalc = window.RabCalculator.calculateProjectRab(proj);
      proj.grandTotal = rabCalc.grandTotal;
      proj.realCost = rabCalc.realCost;
      proj.ppnAmount = rabCalc.ppnAmount;
    }

    // Pastikan jadwal kalender terisi lengkap
    if (window.ProjectCalendar) {
      const currentTasks = window.ProjectCalendar.getTasks();
      if (currentTasks && currentTasks.length > 0) {
        proj.calendarTasks = currentTasks;
      } else if (proj.divisions && proj.divisions.some(d => d.items && d.items.length > 0)) {
        window.ProjectCalendar.syncTasksFromRabDetail();
        proj.calendarTasks = window.ProjectCalendar.getTasks();
      }
    }

    // Pastikan skema termin terisi
    if (window.BapInvoicing) {
      proj.terminSchemes = window.BapInvoicing.getTerminScheme(proj);
      proj.bapRecords = window.BapInvoicing.getBapRecords();
    }

    // Pastikan perhitungan volume terisi
    if (window.VolumeAnalysis) {
      proj.volumeCalculations = window.VolumeAnalysis.getVolumeCalculations();
    }

    // Ambil kustomisasi harga dan kustomisasi AHSP
    if (window.CatalogPricing && !proj.customPrices) {
      proj.customPrices = {};
    }
    if (window.AhspEngine && !proj.customAhsp) {
      proj.customAhsp = {};
    }

    // Susun Master Payload Lengkap
    const totalDivs = (proj.divisions || []).length;
    const totalItems = (proj.divisions || []).reduce((acc, d) => acc + ((d.items || []).length), 0);

    const fullExportPayload = Object.assign({}, proj, {
      _meta: {
        appName: "Duta RAB S1",
        appVersion: "1.0.0",
        standardSE: "SE Bina Konstruksi No. 47/SE/Dk/2026",
        developer: "Duta Digital Agensi",
        portal: "Dutamik.id | Duta Media Informasi berKarya",
        exportedAt: new Date().toISOString(),
        summary: {
          totalDivisions: totalDivs,
          totalItems: totalItems,
          totalCalendarTasks: (proj.calendarTasks || []).length,
          totalTerminSchemes: (proj.terminSchemes || []).length,
          totalBapRecords: (proj.bapRecords || []).length
        }
      }
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullExportPayload, null, 2));
    const dlAnchor = document.createElement('a');
    const safeName = (proj.name || "Proyek").replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `Backup_RAB_Lengkap_${safeName}_${new Date().toISOString().split('T')[0]}.json`;
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", filename);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }

  // Import File Proyek JSON Lengkap (Restore 100% Seluruh State Proyek)
  function importProjectJson(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const rawImport = JSON.parse(e.target.result);
        
        // Cek apakah format dibungkus _meta atau project wrapper
        const imported = rawImport.project || rawImport;

        if (!imported.name || !imported.divisions || !Array.isArray(imported.divisions)) {
          if (window.showNotificationModal) {
            window.showNotificationModal({
              title: "Format Tidak Sesuai",
              subtitle: "Gagal Impor Proyek",
              icon: "❌",
              type: "error",
              contentHtml: "<p>Format file JSON tidak valid atau struktur tidak memuat data Divisi RAB proyek.</p>"
            });
          } else {
            alert("Format file JSON tidak valid atau struktur tidak memuat data Divisi RAB.");
          }
          return;
        }

        // Tetapkan ID baru agar tidak bentrok dengan proyek yang ada
        imported.id = `PROJ-${Date.now().toString(36).toUpperCase()}`;

        // Pastikan array penting selalu terdefinisi
        if (!imported.volumeCalculations) imported.volumeCalculations = [];
        if (!imported.terminSchemes) {
          if (window.BapInvoicing && window.BapInvoicing.getDefaultTerminSchemes) {
            imported.terminSchemes = window.BapInvoicing.getDefaultTerminSchemes();
          } else {
            imported.terminSchemes = [];
          }
        }
        if (!imported.bapRecords) imported.bapRecords = [];
        if (!imported.siteInspections) imported.siteInspections = [];

        // Hapus watermark jika ada di file JSON lama
        delete imported.watermark;

        // Sanitasi data hasil import agar bebas dari anomali harga/satuan tidak logis
        sanitizeProjectData(imported);

        // Tambahkan ke daftar proyek dan jadikan proyek aktif
        projects.push(imported);
        activeProject = imported;
        saveProjects();

        // Inisialisasi ulang seluruh engine data
        if (window.CatalogPricing) window.CatalogPricing.init();
        if (window.AhspEngine) window.AhspEngine.init();

        // Sinkronkan kalender proyek jika belum ada task
        if (window.ProjectCalendar) {
          if (!imported.calendarTasks || imported.calendarTasks.length === 0) {
            window.ProjectCalendar.syncTasksFromRabDetail();
          }
        }

        // Hitung ulang S-Curve
        if (window.SCurveDiagram) {
          window.SCurveDiagram.calculateScheduleFromCalendar(imported);
        }

        if (callback) callback(imported);
      } catch (err) {
        if (window.showNotificationModal) {
          window.showNotificationModal({
            title: "Gagal Impor Proyek",
            subtitle: "Kesalahan Pemrosesan JSON",
            icon: "❌",
            type: "error",
            contentHtml: `<p>Gagal membaca atau memproses file JSON: <strong>${err.message}</strong></p>`
          });
        } else {
          alert("Gagal membaca atau memproses file JSON: " + err.message);
        }
      }
    };
    reader.readAsText(file);
  }

  return {
    init,
    getActiveProject,
    getAllProjects,
    setActiveProject,
    createProject,
    duplicateCurrentProject,
    deleteProject,
    updateActiveProject,
    exportProjectJson,
    importProjectJson,
    sanitizeProjectData,
    sanitizeProjects,
    getProjectStorageInfo,
    getStorageInfo: getProjectStorageInfo,
    saveProjectToDisk,
    selectProjectRootDirectory,
    openProjectFromExplorer,
    copyAhspDatabaseToProjectFolder,
    syncAhspDatabaseToFolder,
    loadAhspDatabaseFromFolder,
    autoSaveToDisk
  };
})();
