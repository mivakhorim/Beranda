/**
 * Project Manager Module
 * Mengelola siklus hidup proyek (CRUD, LocalStorage, Switcher, Export/Import JSON)
 */

window.ProjectManager = (function() {
  const STORAGE_KEY = "RAB_PROJECTS_DATA_V1";
  const ACTIVE_KEY = "RAB_ACTIVE_PROJECT_ID";

  let projects = [];
  let activeProject = null;

  function init() {
    loadProjects();
    if (!projects || projects.length === 0) {
      // Inisialisasi dengan data proyek contoh
      projects = [JSON.parse(JSON.stringify(window.SAMPLE_PROJECT))];
      saveProjects();
    }
    const savedActiveId = localStorage.getItem(ACTIVE_KEY);
    activeProject = projects.find(p => p.id === savedActiveId) || projects[0];
    localStorage.setItem(ACTIVE_KEY, activeProject.id);
  }

  function loadProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        projects = JSON.parse(data);
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

  function createProject(name, owner, location, regionId = "jabar-bdg", useTemplate = true) {
    const newId = `PROJ-${Date.now().toString(36).toUpperCase()}`;
    const today = new Date().toISOString().split('T')[0];
    
    let divisions = [];
    let volumeCalculations = [];
    let calendarTasks = [];
    let terminSchemes = [];
    let bapRecords = [];
    let customPrices = {};
    let customAhsp = {};

    // Jika opsi template aktif, salin item & rincian standar dari sample agar tidak kosong
    if (useTemplate && window.SAMPLE_PROJECT) {
      const sample = JSON.parse(JSON.stringify(window.SAMPLE_PROJECT));
      divisions = sample.divisions || [];
      volumeCalculations = sample.volumeCalculations || [];
      calendarTasks = sample.calendarTasks || [];
      bapRecords = sample.bapRecords || [];
      if (window.BapInvoicing && window.BapInvoicing.getDefaultTerminSchemes) {
        terminSchemes = window.BapInvoicing.getDefaultTerminSchemes();
      }
    } else {
      divisions = [
        { id: "DIV-01", code: "I", name: "PEKERJAAN PERSIAPAN", items: [] },
        { id: "DIV-02", code: "II", name: "PEKERJAAN STRUKTUR", items: [] },
        { id: "DIV-03", code: "III", name: "PEKERJAAN ARSITEKTUR", items: [] }
      ];
    }

    const newProject = {
      id: newId,
      name: name || "Proyek Baru",
      owner: owner || "Pemberi Tugas",
      contractor: activeProject ? activeProject.contractor : "PT. KONTRAKTOR PELAKSANA",
      consultant: activeProject ? activeProject.consultant : "PT. KONSULTAN PERENCANA",
      location: location || "Indonesia",
      startDate: today,
      finishDate: today,
      durationDays: 180,
      docNumber: `RAB/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      regionId: regionId,
      regionName: "Standar Daerah",
      ppnRate: 11,
      includePpn: true,
      overheadRate: 15,
      bankInfo: {
        bankName: "Bank Mandiri / BCA / BNI",
        accountNumber: "000-00-0000000-0",
        accountName: "Rekening Operasional Proyek"
      },
      divisions: divisions,
      volumeCalculations: volumeCalculations,
      signatories: {
        ownerName: owner || "Pemberi Tugas",
        ownerTitle: "Pemilik Bangunan / Pemberi Tugas",
        ownerNip: "-",
        consultantCompany: activeProject ? activeProject.consultant : "PT. KONSULTAN PERENCANA",
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
    importProjectJson
  };
})();
