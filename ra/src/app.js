let showLaborDetailInRab = true;
/**
 * Main Application Controller (SPA Router, Event Binding & View Rendering)
 * Mengintegrasikan seluruh subsistem AHSP, Katalog, Volume, RAB, Kurva S,
 * Kalender, Lembar Koreksi, BAP, Proposal, dan Manajemen Proyek
 */

window.App = (function() {
  let currentTab = "rekap-rab";

  // ==========================================
  // SISTEM FEEDBACK ANIMASI LOADING & CETAK
  // ==========================================
  function showLoading(message = "Memproses Data...", sub = "Mohon tunggu sejenak...") {
    const el = document.getElementById("globalLoader");
    const msgEl = document.getElementById("globalLoaderMsg");
    const subEl = document.getElementById("globalLoaderSub");
    if (msgEl) msgEl.textContent = message;
    if (subEl) subEl.textContent = sub;
    if (el) el.style.display = "flex";
  }

  function hideLoading() {
    const el = document.getElementById("globalLoader");
    if (el) el.style.display = "none";
  }

  function printCurrentPage(panelId = null, docTitle = null) {
    const pId = panelId || `panel-${currentTab}`;
    if (pId === "panel-katalog") {
      printUsedMaterialsCatalog();
      return;
    }
    if (pId === "panel-proposal") {
      printProposal();
      return;
    }
    if (pId === "panel-info-proyek") {
      printProjectInfo();
      return;
    }
    showLoading("Menyiapkan Dokumen Cetak A4...", "Mengatur margin A4 presisi tanpa header peramban...");
    setTimeout(() => {
      window.PrintEngine.printDocument(pId, " ");
    }, 150);
  }

  let currentAhspPage = 1;
  let ahspPageSize = 50;
  let currentKatalogPage = 1;
  let katalogPageSize = 50;
  let katalogFilterMode = 'used'; // 'used' | 'all'

  
  // ==========================================
  // SISTEM MODAL FORMULIR & KONFIRMASI EKSEKUTIF (Anti-Prompt)
  // ==========================================
  let activeModalSubmitCallback = null;
  let activeConfirmCallback = null;

  function showFormModal(options) {
    const title = options.title || "Formulir Input Data";
    const subtitle = options.subtitle || "";
    const fields = options.fields || [];
    const submitText = options.submitText || "Simpan Data";
    const cancelText = options.cancelText || "Batal";
    const onSubmit = options.onSubmit;
    const dialogClass = options.dialogClass || "modal-md";

    const modal = document.getElementById("formModal");
    if (!modal) return;

    const dialog = modal.querySelector(".modal-dialog");
    if (dialog) {
      dialog.className = `modal-dialog ${dialogClass}`;
    }

    document.getElementById("formModalTitle").textContent = title;
    document.getElementById("formModalSubtitle").textContent = subtitle;
    const submitBtnEl = document.getElementById("formModalSubmitBtn");
    if (submitBtnEl) {
      submitBtnEl.textContent = submitText;
      submitBtnEl.onclick = function(e) {
        if (e) e.preventDefault();
        const dynamicForm = document.getElementById("dynamicModalForm");
        if (dynamicForm) {
          if (typeof dynamicForm.checkValidity === 'function' && !dynamicForm.checkValidity()) {
            if (typeof dynamicForm.reportValidity === 'function') dynamicForm.reportValidity();
            return;
          }
          const formData = new FormData(dynamicForm);
          const data = {};
          formData.forEach((value, key) => { data[key] = value; });
          hideFormModal();
          if (typeof activeModalSubmitCallback === 'function') {
            try {
              activeModalSubmitCallback(data);
            } catch(err) {
              console.error("Error executing modal onSubmit callback:", err);
            }
          }
        }
      };
    }
    const cancelBtnEl = document.getElementById("formModalCancelBtn");
    if (cancelBtnEl) {
      cancelBtnEl.textContent = cancelText;
      cancelBtnEl.onclick = function(e) {
        if (e) e.preventDefault();
        if (typeof options.onCancel === "function") { try { options.onCancel(); } catch(err) {} }
        hideFormModal();
      };
    }
    const closeBtnEl = document.getElementById("formModalCloseBtn");
    if (closeBtnEl) {
      closeBtnEl.onclick = function(e) {
        if (e) e.preventDefault();
        if (typeof options.onCancel === "function") { try { options.onCancel(); } catch(err) {} }
        hideFormModal();
      };
    }

    const customHtml = options.customBodyHtml || options.bodyHtml;
    if (customHtml) {
      document.getElementById("formModalBody").innerHTML = customHtml;
    } else {
      let fieldsHtml = "";
      fields.forEach(f => {
        const reqBadge = f.required ? '<span class="modal-field-required">*</span>' : '';
        const helpHtml = f.help ? `<div class="modal-help-text">${f.help}</div>` : '';
        const readonlyAttr = f.readonly ? 'readonly style="background-color: #f8fafc;"' : '';
        const disabledAttr = f.disabled ? 'disabled style="background-color: #f8fafc;"' : '';

        if (f.type === 'section') {
          fieldsHtml += `<div class="modal-section-divider">${f.label}</div>`;
        } else if (f.type === 'select') {
          let optHtml = "";
          (f.options || []).forEach(opt => {
            const sel = (String(opt.value) === String(f.value)) ? 'selected' : '';
            optHtml += `<option value="${opt.value}" ${sel}>${opt.label}</option>`;
          });
          fieldsHtml += `
            <div class="form-group">
              <label class="form-label">${f.label}${reqBadge}</label>
              <select class="form-control" name="${f.name}" ${disabledAttr}>${optHtml}</select>
              ${helpHtml}
            </div>
          `;
        } else if (f.type === 'textarea') {
          fieldsHtml += `
            <div class="form-group">
              <label class="form-label">${f.label}${reqBadge}</label>
              <textarea class="form-control" name="${f.name}" rows="${f.rows || 3}" placeholder="${f.placeholder || ''}" ${readonlyAttr}>${f.value || ''}</textarea>
              ${helpHtml}
            </div>
          `;
        } else {
          const stepAttr = f.step ? `step="${f.step}"` : '';
          const minAttr = (f.min !== undefined) ? `min="${f.min}"` : '';
          const maxAttr = (f.max !== undefined) ? `max="${f.max}"` : '';
          fieldsHtml += `
            <div class="form-group">
              <label class="form-label">${f.label}${reqBadge}</label>
              <input type="${f.type || 'text'}" class="form-control" name="${f.name}" value="${f.value !== undefined ? f.value : ''}" placeholder="${f.placeholder || ''}" ${stepAttr} ${minAttr} ${maxAttr} ${readonlyAttr} ${f.required ? 'required' : ''}>
              ${helpHtml}
            </div>
          `;
        }
      });
      document.getElementById("formModalBody").innerHTML = fieldsHtml;
    }

    activeModalSubmitCallback = onSubmit;

    modal.style.zIndex = "1100";
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("open"), 10);

    if (typeof options.onRender === 'function') {
      try {
        options.onRender(document.getElementById("formModalBody"));
      } catch (err) {
        console.error("Error in modal onRender:", err);
      }
    }
  }

  function hideFormModal() {
    const modal = document.getElementById("formModal");
    if (!modal) return;
    modal.classList.remove("open");
    modal.style.display = "none";
    activeModalSubmitCallback = null;
    const dialog = modal.querySelector(".modal-dialog");
    if (dialog) {
      dialog.className = "modal-dialog modal-md";
    }
  }
  window.hideFormModal = hideFormModal;













  function showConfirmModal(options) {
    const title = options.title || "Konfirmasi";
    const message = options.message || "Apakah Anda yakin ingin melanjutkan?";
    const confirmText = options.confirmText || "Ya, Lanjutkan";
    const cancelText = options.cancelText || "Batal";
    const onConfirm = options.onConfirm;

    const modal = document.getElementById("confirmModal");
    if (!modal) return;

    document.getElementById("confirmModalTitle").textContent = title;
    document.getElementById("confirmModalBody").innerHTML = message;
    document.getElementById("confirmModalConfirmBtn").textContent = confirmText;
    document.getElementById("confirmModalCancelBtn").textContent = cancelText;

    activeConfirmCallback = onConfirm;

    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("open"), 10);
  }

  function hideConfirmModal() {
    const modal = document.getElementById("confirmModal");
    if (!modal) return;
    modal.classList.remove("open");
    setTimeout(() => {
      modal.style.display = "none";
      activeConfirmCallback = null;
    }, 150);
  }

  let activeNotificationCallback = null;

  function showNotificationModal(options = {}) {
    const title = options.title || "Informasi Sistem";
    const subtitle = options.subtitle || "";
    const contentHtml = options.contentHtml || options.message || "";
    const icon = options.icon || (options.type === 'success' ? '✅' : (options.type === 'warning' ? '⚠️' : (options.type === 'error' ? '❌' : (options.type === 'calendar' ? '📅' : 'ℹ️'))));
    const confirmText = options.confirmText || "OK, Mengerti";
    const onConfirm = options.onConfirm || null;

    const modal = document.getElementById("notificationModal");
    if (!modal) {
      alert(typeof contentHtml === 'string' ? contentHtml.replace(/<[^>]*>/g, '') : title);
      return;
    }

    const titleEl = document.getElementById("notificationModalTitle");
    const subEl = document.getElementById("notificationModalSubtitle");
    const bodyEl = document.getElementById("notificationModalBody");
    const iconEl = document.getElementById("notificationModalIcon");
    const btnEl = document.getElementById("notificationModalBtn");

    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = subtitle;
    if (bodyEl) bodyEl.innerHTML = contentHtml;
    if (iconEl) {
      iconEl.textContent = icon;
      iconEl.className = `notification-icon-badge ${options.type || 'info'}`;
    }
    if (btnEl) btnEl.textContent = confirmText;

    activeNotificationCallback = onConfirm;

    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("open"), 10);
  }

  function hideNotificationModal() {
    const modal = document.getElementById("notificationModal");
    if (!modal) return;
    modal.classList.remove("open");
    setTimeout(() => {
      modal.style.display = "none";
      if (typeof activeNotificationCallback === 'function') {
        try { activeNotificationCallback(); } catch(e) { console.error(e); }
      }
      activeNotificationCallback = null;
    }, 150);
  }

  window.showNotificationModal = showNotificationModal;
  window.hideNotificationModal = hideNotificationModal;

  function initModalEvents() {
    const formClose = document.getElementById("formModalCloseBtn");
    const formCancel = document.getElementById("formModalCancelBtn");
    const confirmClose = document.getElementById("confirmModalCloseBtn");
    const confirmCancel = document.getElementById("confirmModalCancelBtn");
    const confirmBtn = document.getElementById("confirmModalConfirmBtn");
    const notifClose = document.getElementById("notificationModalCloseBtn");
    const notifBtn = document.getElementById("notificationModalBtn");
    const dynamicForm = document.getElementById("dynamicModalForm");

    if (formClose) formClose.onclick = hideFormModal;
    if (formCancel) formCancel.onclick = hideFormModal;
    if (confirmClose) confirmClose.onclick = hideConfirmModal;
    if (confirmCancel) confirmCancel.onclick = hideConfirmModal;
    if (notifClose) notifClose.onclick = hideNotificationModal;
    if (notifBtn) notifBtn.onclick = hideNotificationModal;

    // Tutup modal saat backdrop diklik (Cegah penutupan tidak sengaja jika modal dikunci)
    ["formModal", "confirmModal", "notificationModal", "genericModal"].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("click", function(e) {
          if (e.target === el) {
            if (el.dataset.preventBackdropClose === "true") {
              const dialog = el.querySelector(".modal-dialog");
              if (dialog) {
                dialog.classList.remove("modal-shake");
                void dialog.offsetWidth;
                dialog.classList.add("modal-shake");
                setTimeout(() => dialog.classList.remove("modal-shake"), 400);
              }
              return; // DILARANG TUTUP TANPA MENEKAN SIMPAN ATAU BATAL
            }
            if (id === "formModal") hideFormModal();
            else if (id === "confirmModal") hideConfirmModal();
            else if (id === "notificationModal") hideNotificationModal();
            else if (id === "genericModal") {
              el.classList.remove("open");
              setTimeout(() => { el.style.display = "none"; }, 150);
            }
          }
        });
      }
    });

    // Support keyboard Escape untuk menutup modal (Dilarang tutup jika modal sedang dikunci)
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" || e.keyCode === 27) {
        const gm = document.getElementById("genericModal");
        if (gm && gm.dataset.preventBackdropClose === "true" && gm.classList.contains("open")) {
          const dialog = gm.querySelector(".modal-dialog");
          if (dialog) {
            dialog.classList.remove("modal-shake");
            void dialog.offsetWidth;
            dialog.classList.add("modal-shake");
            setTimeout(() => dialog.classList.remove("modal-shake"), 400);
          }
          return; // Blokir Escape jika modal terkunci
        }
        hideNotificationModal();
        hideConfirmModal();
        hideFormModal();
        if (gm && gm.classList.contains("open")) {
          gm.classList.remove("open");
          setTimeout(() => { gm.style.display = "none"; }, 150);
        }
      }
    });

    if (confirmBtn) {
      confirmBtn.onclick = function() {
        if (typeof activeConfirmCallback === 'function') {
          activeConfirmCallback();
        }
        hideConfirmModal();
      };
    }

    if (dynamicForm) {
      dynamicForm.onsubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(dynamicForm);
        const data = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });
        if (typeof activeModalSubmitCallback === 'function') {
          activeModalSubmitCallback(data);
        }
        hideFormModal();
        return false;
      };
    }
  }

  function init() {
    // Bersihkan kontainer usang dari DOM layar seketika aplikasi dibuka
    const oldLeak = document.getElementById("printableAhspBatchArea");
    if (oldLeak) {
      if (typeof oldLeak.remove === 'function') oldLeak.remove();
      else if (oldLeak.parentNode) oldLeak.parentNode.removeChild(oldLeak);
    }

    initModalEvents();
    // Inisialisasi Data & Modul
    window.ProjectManager.init();
    window.CatalogPricing.init();
    window.AhspEngine.init();

    // Render Navigasi & Setup Event Listeners
    setupNavigation();
    setupProjectSwitcher();
    setupGlobalEventListeners();

    // Render Tampilan Awal
    switchTab("rekap-rab");
    updateProjectHeader();

    // Prioritas Pemuatan Awal Folder Proyek untuk GitHub Pages / Web Hosting
    setTimeout(() => {
      const getStorage = window.ProjectManager && (window.ProjectManager.getProjectStorageInfo || window.ProjectManager.getStorageInfo);
      const storageInfo = typeof getStorage === 'function' ? getStorage() : {};
      if (!storageInfo.hasDirHandle) {
        showFirstRunFolderModal();
      }
    }, 450);
  }

  function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item[data-tab]");
    navItems.forEach(item => {
      item.addEventListener("click", function(e) {
        e.preventDefault();
        const tab = this.getAttribute("data-tab");
        switchTab(tab);

        // Tutup sidebar pada tampilan mobile
        const sidebar = document.querySelector(".app-sidebar");
        if (sidebar) sidebar.classList.remove("mobile-open");
      });
    });

    const mobileToggle = document.getElementById("mobileToggleBtn");
    if (mobileToggle) {
      mobileToggle.addEventListener("click", function() {
        const sidebar = document.querySelector(".app-sidebar");
        if (sidebar) sidebar.classList.toggle("mobile-open");
      });
    }
  }

  function switchTab(tabId) {
    currentTab = tabId;

    // Update Nav Active State
    document.querySelectorAll(".nav-item[data-tab]").forEach(item => {
      if (item.getAttribute("data-tab") === tabId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Sembunyikan semua tab panel
    document.querySelectorAll(".tab-panel").forEach(panel => {
      panel.classList.remove("active");
    });

    // Tampilkan panel yang aktif
    const activePanel = document.getElementById(`panel-${tabId}`);
    if (activePanel) {
      activePanel.classList.add("active");
    }

    // Render Konten Spesifik Tab
    renderCurrentTabContent();
  }

  function renderCurrentTabContent() {
    switch (currentTab) {
            case "info-proyek":
        renderInfoProyekView();
        break;
      case "rekap-rab":
        renderRekapRabView();
        break;
      case "detail-rab":
        renderDetailRabView();
        break;
      case "volume":
        renderVolumeView();
        break;
      case "ahsp":
        renderAhspView();
        break;
      case "katalog":
        renderKatalogView();
        break;
      case "sumberdaya":
        renderSumberDayaView();
        break;
      case "kurva-s":
        renderKurvaSView();
        break;
      case "kalender":
        renderKalenderView();
        break;
      case "koreksi":
        renderKoreksiView();
        break;
      case "bap":
        renderBapView();
        break;
      case "proposal":
        renderProposalView();
        break;
      case "proyek":
        renderProyekView();
        break;
    }
  }

  function setupProjectSwitcher() {
    const select = document.getElementById("projectSelect");
    if (!select) return;

    const projects = window.ProjectManager.getAllProjects();
    const active = window.ProjectManager.getActiveProject();

    select.innerHTML = projects.map(p => `
      <option value="${p.id}" ${p.id === (active ? active.id : '') ? 'selected' : ''}>
        ${p.name}
      </option>
    `).join('');

    select.addEventListener("change", function() {
      window.ProjectManager.setActiveProject(this.value);
      window.CatalogPricing.init();
      window.AhspEngine.init();
      updateProjectHeader();
      renderCurrentTabContent();
    });
  }

  function updateProjectHeader() {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return;

    const nameEl = document.getElementById("currentProjectName");
    if (nameEl) nameEl.textContent = proj.name;

    const select = document.getElementById("projectSelect");
    if (select && select.value !== proj.id) {
      select.value = proj.id;
    }
  }

  function setupGlobalEventListeners() {
    // Tombol Cetak / Tampilkan Preview Dokumen A4 Saat Ini
    const printBtn = document.getElementById("globalPrintBtn");
    if (printBtn) {
      printBtn.addEventListener("click", function() {
        printCurrentPage();
      });
    }

    // Modal Close Listeners
    document.querySelectorAll(".modal-close-btn, .modal-cancel-btn").forEach(btn => {
      btn.addEventListener("click", function() {
        document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.remove("open"));
      });
    });
  }

  // ==========================================
  // VIEW RENDERERS
  // ==========================================

  
  // ==========================================
  // ==========================================
  // DIRECT PDF DOWNLOAD HELPERS (MOBILE & DESKTOP)
  // ==========================================
  function downloadCurrentPagePdfDirect(panelId, defaultTitle = "Dokumen_RAB") {
    printCurrentPage(panelId, defaultTitle);
  }

  function downloadProposalPdfDirect() {
    printProposal();
  }

  function downloadSingleBapPdfDirect(bapId) {
    printSingleBap(bapId);
  }


  // ==========================================
  // PENYIMPANAN FILE PROYEK KE EXPLORER & ROOT FOLDER
  // ==========================================
  async function handleSaveProjectExplorer() {
    if (window.ProjectManager && window.ProjectManager.saveProjectToDisk) {
      showLoading("Menyimpan File Proyek...", "Membuka dialog Windows Explorer untuk menyimpan berkas JSON...");
      try {
        const res = await window.ProjectManager.saveProjectToDisk();
        hideLoading();
        if (res && res.success) {
          renderCurrentTabContent();
        }
      } catch (err) {
        hideLoading();
        console.error("Save explorer error:", err);
      }
    }
  }

  async function handleSelectStorageFolder() {
    if (window.ProjectManager && window.ProjectManager.selectProjectRootDirectory) {
      const res = await window.ProjectManager.selectProjectRootDirectory();
      if (res) {
        renderCurrentTabContent();
      }
    }
  }

  async function handleOpenProjectExplorer() {
    if (window.ProjectManager && window.ProjectManager.openProjectFromExplorer) {
      await window.ProjectManager.openProjectFromExplorer(() => {
        if (window.CatalogPricing) window.CatalogPricing.init();
        if (window.AhspEngine) window.AhspEngine.init();
        updateProjectHeader();
        renderCurrentTabContent();
        if (window.showNotificationModal) {
          window.showNotificationModal({
            title: "Proyek Berhasil Dimuat",
            subtitle: "Data Proyek Aktif Diperbarui",
            icon: "📂",
            type: "success",
            contentHtml: "<p>Seluruh rincian RAB, pengaturan, dan analisis AHSP kustom telah berhasil dimuat dari berkas.</p>"
          });
        }
      });
    }
  }

  
    function updateAutoSyncIndicator(state = "synced", info = "") {
    const badge = document.getElementById("globalAutoSyncStatus");
    const dot = document.getElementById("syncDotIndicator");
    const label = document.getElementById("autoSyncLabel");
    if (!badge || !dot || !label) return;

    badge.style.border = "none";
    badge.classList.remove("state-saving", "state-synced", "state-local");

    if (state === "saving") {
      badge.classList.add("state-saving");
      badge.style.background = "rgba(234, 179, 8, 0.15)";
      badge.style.color = "#854d0e";
      dot.style.background = "#eab308";
      dot.style.boxShadow = "0 0 6px #eab308";
      label.innerHTML = '<span class="sync-text-full">🔄 Menyimpan...</span><span class="sync-text-mobile" style="display:none;">🔄 Simpan</span>';
    } else if (state === "synced") {
      badge.classList.add("state-synced");
      badge.style.background = "rgba(34, 197, 94, 0.12)";
      badge.style.color = "#15803d";
      dot.style.background = "#22c55e";
      dot.style.boxShadow = "0 0 6px #22c55e";
      const fullText = info ? `📁 Auto-Sync: ${info}` : "💾 Auto-Sync Aktif";
      const shortText = info ? `📁 ${info}` : "📁 Sync";
      label.innerHTML = `<span class="sync-text-full">${fullText}</span><span class="sync-text-mobile" style="display:none;">${shortText}</span>`;
    } else {
      badge.classList.add("state-local");
      badge.style.background = "rgba(59, 130, 246, 0.12)";
      badge.style.color = "#1d4ed8";
      dot.style.background = "#3b82f6";
      dot.style.boxShadow = "0 0 6px #3b82f6";
      label.innerHTML = '<span class="sync-text-full">💾 Auto-Save Cache Aktif</span><span class="sync-text-mobile" style="display:none;">💾 Cache</span>';
    }
  }

  function handleSyncBadgeClick() {
    const storageInfo = (window.ProjectManager && window.ProjectManager.getProjectStorageInfo)
      ? window.ProjectManager.getProjectStorageInfo()
      : { folderName: "", hasDirHandle: false, hasFileHandle: false };

    if (storageInfo.hasDirHandle || storageInfo.hasFileHandle) {
      if (window.showNotificationModal) {
        window.showNotificationModal({
          title: "Sinkronisasi Berkas Aktif",
          subtitle: "Penyimpanan Otomatis Real-Time ke Disk",
          icon: "📁",
          type: "success",
          contentHtml: `
            <div style="font-size: 13px; color: #1e293b; line-height: 1.55;">
              Aplikasi sedang terhubung langsung ke hard drive komputer Anda:<br>
              <div style="font-family: monospace; background: #eff6ff; padding: 8px 12px; border-radius: 6px; margin: 8px 0; font-weight: bold; color: #1e40af; border: 1px solid #bfdbfe;">
                📂 ${storageInfo.folderName || 'Berkas Terbuka'}
              </div>
              <p style="margin: 0; font-size: 12px; color: #475569;">
                Setiap kali Anda mengubah volume RAB, mengedit AHSP kustom, atau mengubah jadwal, sistem secara otomatis menyimpan data terbaru langsung ke berkas ini.
              </p>
            </div>
          `
        });
      }
    } else {
      showFirstRunFolderModal();
    }
  }

  function showFirstRunFolderModal() {
    const modal = document.getElementById("firstRunFolderModal");
    if (modal) {
      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("open"), 30);
    }
  }

  function closeFirstRunFolderModal() {
    const modal = document.getElementById("firstRunFolderModal");
    if (modal) {
      modal.classList.remove("open");
      modal.style.display = "none";
    }
  }

  async function handleFirstRunSelectFolder() {
    closeFirstRunFolderModal();
    localStorage.setItem("RAB_FIRST_RUN_EXPLORER_PROMPTED", "true");
    if (window.ProjectManager && window.ProjectManager.selectProjectRootDirectory) {
      await window.ProjectManager.selectProjectRootDirectory();
      renderCurrentTabContent();
    }
  }

  async function handleFirstRunOpenFile() {
    closeFirstRunFolderModal();
    localStorage.setItem("RAB_FIRST_RUN_EXPLORER_PROMPTED", "true");
    if (window.ProjectManager && window.ProjectManager.openProjectFromExplorer) {
      await window.ProjectManager.openProjectFromExplorer(() => {
        renderCurrentTabContent();
      });
    }
  }

  function handleFirstRunDismiss() {
    closeFirstRunFolderModal();
    localStorage.setItem("RAB_FIRST_RUN_EXPLORER_PROMPTED", "true");
  }

  // 0. PANEL INFORMASI & SETTING PROYEK
  // ==========================================
  
  // Update duration dynamically when start/finish dates change
  function handleProjectDateChange() {
    const startInput = document.getElementById("projStartDateInput");
    const finishInput = document.getElementById("projFinishDateInput");
    const durInput = document.getElementById("projDurationDisplayInput");
    if (!startInput || !finishInput || !durInput) return;

    const startD = new Date(startInput.value);
    const finishD = new Date(finishInput.value);
    if (isNaN(startD.getTime()) || isNaN(finishD.getTime())) return;

    const diffTime = Math.max(1, finishD.getTime() - startD.getTime());
    const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const durationWeeks = Math.ceil(durationDays / 7);
    durInput.value = `${durationDays} Hari (${durationWeeks} Minggu)`;
  }

  // Penanganan Perubahan Live Setting Finansial (Overhead Profit, PPN & Dimensi Bangunan)
  function handleLiveProjectSettingsChange() {
    const ovInput = document.getElementById("projOverheadRateInput");
    const ppnInput = document.getElementById("projPpnRateInput");
    if (!ovInput || !ppnInput) return;

    const newOverhead = (ovInput.value !== "" && !isNaN(parseFloat(ovInput.value))) ? parseFloat(ovInput.value) : 0;
    const newPpn = (ppnInput.value !== "" && !isNaN(parseFloat(ppnInput.value))) ? parseFloat(ppnInput.value) : 0;

    const ovSpan = document.getElementById("liveOverheadRatePct");
    const ppnSpan = document.getElementById("livePpnRatePct");
    if (ovSpan) ovSpan.textContent = newOverhead;
    if (ppnSpan) ppnSpan.textContent = newPpn;

    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !window.RabCalculator || !window.RabCalculator.previewProjectRecalculation) return;

    const typeSelect = document.getElementById("projProjectTypeSelect");
    const bldInput = document.getElementById("projBuildingAreaInput");
    const lndInput = document.getElementById("projLandAreaInput");
    const rhbInput = document.getElementById("projRehabAreaInput");
    const extInput = document.getElementById("projExistingAreaInput");

    const isRehab = typeSelect ? (typeSelect.value === 'rehab') : (proj.projectType === 'rehab');
    const bldArea = bldInput ? (parseFloat(bldInput.value) || 0) : (proj.buildingArea || 180);
    const lndArea = lndInput ? (parseFloat(lndInput.value) || 0) : (proj.landArea || 200);
    const rhbArea = rhbInput ? (parseFloat(rhbInput.value) || 0) : (proj.rehabArea || 0);
    const extArea = extInput ? (parseFloat(extInput.value) || 0) : (proj.existingBuildingArea || 0);

    // Salin sementara ke objek kalkulasi
    proj.projectType = isRehab ? 'rehab' : 'new';
    proj.buildingArea = bldArea;
    proj.landArea = lndArea;
    proj.rehabArea = rhbArea;
    proj.existingBuildingArea = extArea;

    const recalc = window.RabCalculator.previewProjectRecalculation(proj, newOverhead, newPpn);
    if (!recalc) return;

    const effArea = isRehab ? (rhbArea || bldArea) : bldArea;
    const costPerM2 = effArea > 0 ? Math.round(recalc.grandTotal / effArea) : 0;
    const costPerM2Real = effArea > 0 ? Math.round(recalc.realCost / effArea) : 0;

    const dcEl = document.getElementById("liveDirectCostVal");
    const ovEl = document.getElementById("liveOverheadVal");
    const rcEl = document.getElementById("liveRealCostVal");
    const ppnEl = document.getElementById("livePpnVal");
    const gtEl = document.getElementById("liveGrandTotalVal");
    const tbEl = document.getElementById("liveTerbilangVal");
    const cpmEl = document.getElementById("liveCostPerM2Display");
    const cpmSubEl = document.getElementById("liveCostPerM2SubDisplay");
    const bldAreaEl = document.getElementById("liveBuildingAreaDisplay");
    const heroAreaEl = document.getElementById("liveHeroArea");
    const heroCostEl = document.getElementById("liveHeroCostPerM2");

    if (dcEl) dcEl.innerHTML = window.CurrencyUtil.formatRupiah(recalc.totalDirectCost, false, true);
    if (ovEl) ovEl.innerHTML = window.CurrencyUtil.formatRupiah(recalc.overheadAmount, false, true);
    if (rcEl) rcEl.innerHTML = window.CurrencyUtil.formatRupiah(recalc.realCost, false, true);
    if (ppnEl) ppnEl.innerHTML = window.CurrencyUtil.formatRupiah(recalc.ppnAmount, false, true);
    if (gtEl) gtEl.innerHTML = window.CurrencyUtil.formatRupiah(recalc.grandTotal, false, true);
    if (tbEl) tbEl.innerHTML = `"${recalc.terbilangStr}"`;
    if (cpmEl) cpmEl.innerHTML = `${window.CurrencyUtil.formatRupiah(costPerM2, false, true)} / m²`;
    if (cpmSubEl) cpmSubEl.innerHTML = `Real Cost: ${window.CurrencyUtil.formatRupiah(costPerM2Real, false, true)} / m²`;
    if (bldAreaEl) bldAreaEl.innerHTML = `${bldArea} m² <span style="font-size: 13px; font-weight: 600; color: #64748b;">/ ${lndArea} m²</span>`;
    if (heroAreaEl) heroAreaEl.innerHTML = `${effArea} m²`;
    if (heroCostEl) heroCostEl.innerHTML = `${window.CurrencyUtil.formatRupiah(costPerM2, false, true)} / m²`;
  }

  function handleProjectTypeToggle() {
    const typeSelect = document.getElementById("projProjectTypeSelect");
    const rehabContainer = document.getElementById("rehabFieldsContainer");
    if (typeSelect && rehabContainer) {
      rehabContainer.style.display = typeSelect.value === "rehab" ? "flex" : "none";
    }
    handleLiveProjectSettingsChange();
  }

  function renderInfoProyekView() {
    const container = document.getElementById("infoProyekContent");
    if (!container) return;

    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return;

    // Hitung durasi hari dan minggu (Minimal 30 Hari - Standar 180 Hari)
    const startD = new Date(proj.startDate || "2026-04-01");
    let finishD = new Date(proj.finishDate || "2026-09-30");
    let diffTime = Math.max(1, finishD.getTime() - startD.getTime());
    let durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (durationDays < 30) {
      durationDays = (proj.durationDays && proj.durationDays >= 30) ? proj.durationDays : 180;
      proj.durationDays = durationDays;
      finishD = new Date(startD.getTime() + durationDays * 86400000);
      proj.finishDate = finishD.toISOString().split('T')[0];
    }
    const durationWeeks = Math.ceil(durationDays / 7);

    // Dimensi Bangunan & Perhitungan Biaya Satuan per m2
    const isRehab = proj.projectType === 'rehab';
    const bldArea = Number(proj.buildingArea) || 180;
    const lndArea = Number(proj.landArea) || 200;
    const extArea = Number(proj.existingBuildingArea) || 0;
    const rhbArea = Number(proj.rehabArea) || 0;
    const effArea = isRehab ? (rhbArea || bldArea) : bldArea;

    // Kalkulasi nilai RAB terkini untuk kalkulasi live & summary card
    const calcRecalc = window.RabCalculator 
      ? window.RabCalculator.calculateProjectRab(proj) 
      : { totalDirectCost: 0, overheadAmount: 0, realCost: 0, ppnAmount: 0, grandTotal: 0, terbilangStr: '', costPerM2: 0, costPerM2Real: 0 };

    const costPerM2 = effArea > 0 ? Math.round((calcRecalc.grandTotal || 0) / effArea) : 0;
    const costPerM2Real = effArea > 0 ? Math.round((calcRecalc.realCost || 0) / effArea) : 0;

    // Dapatkan data sumber daya tenaga kerja untuk menghitung kebutuhan harian
    const res = window.ResourceUsage.calculateTotalResources(proj);
    const laborList = res.labor || [];
    const totalLaborOH = laborList.reduce((acc, l) => acc + (Number(l.qty) || 0), 0);
    const avgDailyPersons = durationDays > 0 ? (totalLaborOH / durationDays) : 0;

    // Signatories & Bank fallback (Penuh Nilai Standar Proyek Resmi - Bebas Titik-Titik & Bebas 'Bapak / Ibu')
    const cleanSignerName = (val, fallback) => {
      let s = (val || "").toString().trim();
      s = s.replace(/^\s*\(\s*|\s*\)\s*$/g, '').trim();
      if (!s || s.includes('...') || s.includes('Bapak / Ibu')) return fallback;
      return s;
    };

    const rawSig = proj.signatories || {};
    const sig = {
      ownerName: cleanSignerName(rawSig.ownerName, cleanSignerName(proj.owner, "Dr. H. Hendra Gunawan, S.T., M.M.")),
      ownerTitle: rawSig.ownerTitle || "Kuasa Pengguna Anggaran / Pemilik",
      ownerNip: (rawSig.ownerNip && !rawSig.ownerNip.includes('...')) ? rawSig.ownerNip : "-",
      contractorName: cleanSignerName(rawSig.contractorName, "H. Ahmad Fauzi, S.T."),
      contractorTitle: rawSig.contractorTitle || "Direktur Utama",
      contractorCompany: cleanSignerName(rawSig.contractorCompany, (proj.contractor || "PT. Duta Konstruksi Pratama")),
      consultantName: cleanSignerName(rawSig.consultantName, "Ir. Bambang Hartono, S.T., M.T."),
      consultantTitle: rawSig.consultantTitle || "Team Leader / Pengawas",
      consultantCompany: cleanSignerName(rawSig.consultantCompany, (proj.consultant || "PT. Architekta Desain Studio")),
      qcInspectorName: cleanSignerName(rawSig.qcInspectorName, "Ir. M. Ridwan"),
      qcInspectorRole: rawSig.qcInspectorRole || "Konsultan Pengawas / QC",
      fieldMandorName: cleanSignerName(rawSig.fieldMandorName, "Sutarji / Warsito"),
      fieldMandorRole: rawSig.fieldMandorRole || "Mandor Lapangan / Pelaksana",
      siteManagerName: cleanSignerName(rawSig.siteManagerName, "Ir. Hendra Prasetya"),
      siteManagerRole: rawSig.siteManagerRole || "Site Manager Kontraktor",
      docCity: rawSig.docCity || proj.location || "Indonesia",
      docDate: rawSig.docDate || proj.startDate || "2026-04-01"
    };
    const rawBank = proj.bankInfo || {};
    const bank = {
      bankName: rawBank.bankName || "Bank Mandiri",
      accountNumber: rawBank.accountNumber || "131-00-8899221-5",
      accountName: rawBank.accountName || sig.contractorCompany || proj.contractor || "PT. Duta Konstruksi Pratama"
    };

    // Buat baris tabel estimasi kebutuhan tenaga kerja harian (Desktop & Mobile)
    let laborRowsHtml = "";
    let laborMobileCardsHtml = "";
    laborList.forEach((l, idx) => {
      const totalOH = Number(l.qty) || 0;
      const dailyReq = durationDays > 0 ? (totalOH / durationDays) : 0;
      const dailyRounded = Math.max(1, Math.round(dailyReq * 10) / 10);
      const estDailyCost = dailyReq * (Number(l.price) || 0);

      laborRowsHtml += `
        <tr>
          <td class="text-center" style="width: 5%">${idx + 1}</td>
          <td style="width: 30%">
            <strong>${l.name}</strong>
            <div class="text-muted" style="font-size: 11px;">Kode: ${l.code || 'UPAH'}</div>
          </td>
          <td class="text-right font-bold" style="width: 15%">${window.CurrencyUtil.formatNumber(totalOH, 2)} OH</td>
          <td class="text-center font-bold text-primary" style="width: 18%; font-size: 13px;">
            <span class="badge badge-primary" style="font-size: 12px; padding: 4px 8px;">${dailyRounded} Orang / Hari</span>
          </td>
          <td class="text-right" style="width: 16%">${window.CurrencyUtil.formatRupiah(l.price)}</td>
          <td class="text-right font-bold" style="width: 16%">${window.CurrencyUtil.formatRupiah(l.totalCost)}</td>
        </tr>
      `;

      laborMobileCardsHtml += `
        <div class="resource-mobile-card">
          <div class="resource-mobile-card-top">
            <span class="badge badge-secondary font-mono">${l.name}</span>
            <span class="font-bold text-emerald">${window.CurrencyUtil.formatRupiah(l.totalCost, false, true)}</span>
          </div>
          <div class="resource-mobile-card-row mt-1">
            <span>Total Kebutuhan: <strong>${window.CurrencyUtil.formatNumber(totalOH, 2)} OH</strong></span>
            <span>Harian: <strong>${dailyRounded} Orang/Hari</strong></span>
          </div>
        </div>
      `;
    });
    container.innerHTML = `
      <div class="print-only">
        ${window.PrintEngine.createPrintHeader(proj, "INFORMASI PROYEK & ANALISIS KEBUTUHAN TENAGA KERJA")}
      </div>

      <!-- Header Aksi Panel Informasi & Setting Proyek -->
      <div class="d-flex justify-content-between align-items-center mb-3 no-print" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 18px;">
        <div>
          <h2 style="font-weight: 800; color: #0f172a; margin: 0; font-size: 16px; display: flex; align-items: center; gap: 8px;">
            <span>📋</span> Informasi, Setting &amp; Parameter Finansial Proyek
          </h2>
          <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">Identitas kontrak, persentase pajak &amp; overhead, rekening penagihan termin, serta pejabat penandatangan</div>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button type="button" class="btn btn-primary" style="font-weight: 700; display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; box-shadow: 0 2px 4px rgba(37,99,235,0.2);" onclick="App.handleSaveProjectExplorer()" title="Simpan seluruh pengaturan proyek dan AHSP baru ke file JSON melalui Explorer">
            💾 Simpan File Proyek (Explorer)
          </button>
          <button type="button" class="btn btn-outline" style="font-weight: 700; display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-color: #059669; color: #059669;" onclick="App.handleSelectStorageFolder()" title="Pilih folder root komputer untuk auto-save proyek">
            📁 Folder Root Proyek
          </button>
          <button type="button" class="btn btn-outline" style="font-weight: 700; display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px;" onclick="App.handleOpenProjectExplorer()" title="Buka file proyek JSON dari Explorer">
            📂 Buka File Explorer
          </button>
          <button type="button" class="btn btn-outline" style="font-weight: 700; display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-color: #0284c7; color: #0284c7;" onclick="App.sanitizeCurrentProject()">
            🛡️ Verifikasi &amp; Sanitasi SNI 2026
          </button>
          <button type="button" class="btn btn-outline" style="font-weight: 700; display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px;" onclick="App.printProjectInfo()">
            🖨️ Cetak PDF
          </button>
        </div>
      </div>

      <!-- Kartu Ringkasan KPI Proyek (Termasuk Dimensi & Biaya/m²) -->
      <div class="dashboard-grid mb-4" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        <div class="stat-card">
          <div class="stat-label">Total Durasi Konstruksi</div>
          <div class="stat-value">${durationDays} Hari</div>
          <div class="stat-sub">${durationWeeks} Minggu Kerja Kalender</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Estimasi Tenaga Kerja Harian</div>
          <div class="stat-value">${Math.round(avgDailyPersons * 10) / 10} Orang</div>
          <div class="stat-sub">Rata-rata Personil Aktif / Hari Kerja</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Kebutuhan Mandor & Tukang</div>
          <div class="stat-value">${window.CurrencyUtil.formatNumber(totalLaborOH, 1)} OH</div>
          <div class="stat-sub">Total Alokasi Orang-Hari Kerja</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Anggaran Upah Lapangan</div>
          <div class="stat-value">${window.CurrencyUtil.formatRupiah(res.totalLabor || 0)}</div>
          <div class="stat-sub">${laborList.length} Klasifikasi Tenaga Kerja</div>
        </div>
        <div class="stat-card" style="border-top: 3px solid #0284c7;">
          <div class="stat-label">Dimensi Bangunan &amp; Tanah</div>
          <div class="stat-value" id="liveBuildingAreaDisplay">${bldArea} m² <span style="font-size: 13px; font-weight: 600; color: #64748b;">/ ${lndArea} m²</span></div>
          <div class="stat-sub">${isRehab ? `Rehab: ${rhbArea} m² (Eksis: ${extArea} m²)` : 'Luas Rencana / Luas Tanah'}</div>
        </div>
        <div class="stat-card" style="border-top: 3px solid #059669;">
          <div class="stat-label">Estimasi Biaya per m² (HSP M²)</div>
          <div class="stat-value text-emerald" id="liveCostPerM2Display" style="color: #059669;">${window.CurrencyUtil.formatRupiah(costPerM2, false, true)} / m²</div>
          <div class="stat-sub" id="liveCostPerM2SubDisplay">Real Cost: ${window.CurrencyUtil.formatRupiah(costPerM2Real, false, true)} / m²</div>
        </div>
      </div>

      <!-- Kartu Pusat Database AHSP Mandiri & Sinkronisasi Folder Proyek (Prioritas GitHub Pages) -->
      <div class="card mb-4 no-print" id="projectAhspDatabaseCard" style="border: 1.5px solid #0284c7; border-radius: 10px; background: #ffffff; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.08); overflow: hidden;">
        <div class="card-header d-flex justify-content-between align-items-center flex-wrap" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-bottom: 1.5px solid #bae6fd; padding: 14px 18px;">
          <div class="card-title" style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">📁</span>
            <div>
              <div style="font-weight: 800; color: #0369a1; font-size: 15px; letter-spacing: 0.2px;">Pusat Database AHSP &amp; Sinkronisasi Folder Proyek Mandiri</div>
              <div style="font-size: 11.5px; color: #0284c7; font-weight: 500;">Pilihan database aktif, riwayat revisi, perlindungan data orisinal, serta sinkronisasi folder lokal untuk GitHub Pages</div>
            </div>
          </div>
          <div class="card-actions d-flex align-items-center gap-2">
            <span class="badge" id="ahspSourceBadge" style="font-size: 11.5px; padding: 5px 12px; font-weight: 700; border-radius: 20px; ${proj.ahspDatabaseSource === 'folder' ? 'background: #dcfce7; color: #15803d; border: 1px solid #86efac;' : 'background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;'}">
              ${proj.ahspDatabaseSource === 'folder' ? '📁 Aktif: Database Folder Proyek' : '🌐 Aktif: Standar Web PUPR 2026'}
            </span>
          </div>
        </div>

        <div class="card-body p-4">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 16px;">
            <!-- Kolom 1: Pilihan Sumber Database AHSP -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
              <div style="font-weight: 700; font-size: 12.5px; color: #0f172a; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                <span>⚙️</span> Sumber Database AHSP yang Digunakan:
              </div>
              <div class="d-flex flex-column gap-2">
                <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; padding: 8px 10px; border-radius: 6px; background: ${proj.ahspDatabaseSource === 'folder' ? '#eff6ff' : '#ffffff'}; border: 1px solid ${proj.ahspDatabaseSource === 'folder' ? '#93c5fd' : '#cbd5e1'};">
                  <input type="radio" name="ahspSourceOption" value="folder" ${proj.ahspDatabaseSource === 'folder' ? 'checked' : ''} onchange="App.handleSelectAhspSource('folder')" style="margin-top: 3px;">
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #1e3a8a;">📁 Database Mandiri Folder Proyek (Lokal Folder)</div>
                    <div style="font-size: 11px; color: #64748b; line-height: 1.4;">Menggunakan berkas <code>ahsp_master_database.json</code> langsung dari folder komputer Anda. Pembaruan dan revisi tersimpan mandiri per proyek.</div>
                  </div>
                </label>

                <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; padding: 8px 10px; border-radius: 6px; background: ${proj.ahspDatabaseSource !== 'folder' ? '#eff6ff' : '#ffffff'}; border: 1px solid ${proj.ahspDatabaseSource !== 'folder' ? '#93c5fd' : '#cbd5e1'};">
                  <input type="radio" name="ahspSourceOption" value="web" ${proj.ahspDatabaseSource !== 'folder' ? 'checked' : ''} onchange="App.handleSelectAhspSource('web')" style="margin-top: 3px;">
                  <div>
                    <div style="font-weight: 700; font-size: 12px; color: #1e3a8a;">🌐 Database Web Standar PUPR 2026 (Preset Online)</div>
                    <div style="font-size: 11px; color: #64748b; line-height: 1.4;">Menggunakan pustaka master bawaan SE PUPR 2026 dengan kustomisasi tersimpan di browser LocalStorage.</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Kolom 2: Status Folder & Perlindungan Data Orisinal -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="font-weight: 700; font-size: 12.5px; color: #0f172a; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                  <span>🛡️</span> Status Folder &amp; Proteksi Orisinal:
                </div>
                <div style="font-size: 11.5px; color: #334155; line-height: 1.6;">
                  <div><strong>Folder Proyek Terhubung:</strong> <span style="font-family: monospace; color: #0369a1; font-weight: 700;">📂 ${proj._storageFolder || (window.ProjectManager && (window.ProjectManager.getProjectStorageInfo || window.ProjectManager.getStorageInfo) ? (window.ProjectManager.getProjectStorageInfo || window.ProjectManager.getStorageInfo)().folderName : '') || 'Belum Terhubung'}</span></div>
                  <div><strong>Jumlah Item AHSP Direvisi:</strong> <span class="badge" style="background: #fef3c7; color: #b45309; font-weight: 700;">${Object.keys(proj.ahspOriginals || {}).length} Item AHSP</span></div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                    Setiap AHSP yang diubah diberi kode revisi resmi (<code>REV-1</code>, <code>REV-2</code>) dengan data orisinal tetap terlindungi dan dapat dipulihkan jika ada ketidaksengajaan.
                  </div>
                </div>
              </div>

              <div class="d-flex gap-2 flex-wrap mt-3 pt-2" style="border-top: 1px solid #e2e8f0;">
                <button type="button" class="btn btn-sm btn-primary" onclick="App.handleCopyAhspToFolder()" title="Salin seluruh pustaka master AHSP ke folder proyek sebagai database mandiri" style="font-weight: 700; display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px;">
                  <span>📥</span> Salin Semua Master AHSP ke Folder Proyek
                </button>
                <button type="button" class="btn btn-sm btn-outline" onclick="App.handleRestoreAllAhsp()" title="Pulihkan seluruh AHSP yang direvisi kembali ke nilai orisinal standar PUPR" style="font-weight: 700; display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; border-color: #f59e0b; color: #b45309;">
                  <span>↺</span> Pulihkan Semua AHSP ke Orisinal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Kartu Kalkulasi Finansial, Alokasi Profit & Pajak PPN (Dutavis Executive Live Sync) -->
      <div class="card mb-4" id="projectFinancialSummaryCard" style="border: 1px solid #cbd5e1; border-radius: 10px; background: #ffffff; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06); overflow: hidden;">
        <div class="card-header d-flex justify-content-between align-items-center flex-wrap" style="background: #f8fafc; border-bottom: 1.5px solid #e2e8f0; padding: 14px 18px;">
          <div class="card-title" style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">💎</span>
            <span style="font-weight: 800; color: #0f172a; font-size: 15px; letter-spacing: 0.3px;">Ringkasan Kalkulasi Keuangan Proyek (Live Sync)</span>
          </div>
          <div class="card-actions no-print">
            <span class="badge badge-success" style="font-size: 11.5px; padding: 5px 10px; font-weight: 700; border-radius: 6px;">⚡ Terhubung Otomatis ke RAB & SPK</span>
          </div>
        </div>
        <div class="card-body p-4">
          <!-- Grid 4 Kartu Metrik Keuangan -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 16px;">
            <!-- 1. Biaya Langsung -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: 3px solid #0f172a; border-radius: 8px; padding: 12px 16px;">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span style="font-size: 10.5px; text-transform: uppercase; font-weight: 800; color: #475569;">1. Biaya Langsung (Direct)</span>
                <span class="badge badge-light" style="font-size: 10px; padding: 2px 6px;">HPP Pokok</span>
              </div>
              <div style="font-size: 16px; font-weight: 900; color: #0f172a; font-family: var(--font-mono); margin: 4px 0;" id="liveDirectCostVal">
                ${window.CurrencyUtil.formatRupiah(calcRecalc.totalDirectCost, false, true)}
              </div>
              <div style="font-size: 11px; color: #64748b;">Bahan, Upah Lapangan & Alat Murni</div>
            </div>

            <!-- 2. Overhead & Profit -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: 3px solid #475569; border-radius: 8px; padding: 12px 16px;">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span style="font-size: 10.5px; text-transform: uppercase; font-weight: 800; color: #475569;">2. Overhead & Profit</span>
                <span class="badge badge-secondary" style="font-size: 10.5px; font-weight: 800; padding: 2px 7px;"><span id="liveOverheadRatePct">${(proj.overheadRate !== undefined && proj.overheadRate !== null) ? proj.overheadRate : 0}</span>%</span>
              </div>
              <div style="font-size: 16px; font-weight: 900; color: #0f172a; font-family: var(--font-mono); margin: 4px 0;" id="liveOverheadVal">
                ${window.CurrencyUtil.formatRupiah(calcRecalc.overheadAmount, false, true)}
              </div>
              <div style="font-size: 11px; color: #64748b;">Keuntungan & Biaya Operasional</div>
            </div>

            <!-- 3. Real Cost -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: 3px solid #0f172a; border-radius: 8px; padding: 12px 16px;">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span style="font-size: 10.5px; text-transform: uppercase; font-weight: 800; color: #475569;">3. Real Cost Proyek</span>
                <span class="badge badge-light" style="font-size: 10px; padding: 2px 6px;">Subtotal</span>
              </div>
              <div style="font-size: 16px; font-weight: 900; color: #0f172a; font-family: var(--font-mono); margin: 4px 0;" id="liveRealCostVal">
                ${window.CurrencyUtil.formatRupiah(calcRecalc.realCost, false, true)}
              </div>
              <div style="font-size: 11px; color: #64748b;">Biaya Langsung + Overhead (Sebelum PPN)</div>
            </div>

            <!-- 4. PPN -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: 3px solid #475569; border-radius: 8px; padding: 12px 16px;">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span style="font-size: 10.5px; text-transform: uppercase; font-weight: 800; color: #475569;">4. Pajak PPN</span>
                <span class="badge badge-secondary" style="font-size: 10.5px; font-weight: 800; padding: 2px 7px;"><span id="livePpnRatePct">${(proj.ppnRate !== undefined && proj.ppnRate !== null) ? proj.ppnRate : 0}</span>%</span>
              </div>
              <div style="font-size: 16px; font-weight: 900; color: #0f172a; font-family: var(--font-mono); margin: 4px 0;" id="livePpnVal">
                ${window.CurrencyUtil.formatRupiah(calcRecalc.ppnAmount, false, true)}
              </div>
              <div style="font-size: 11px; color: #64748b;">Pajak Pertambahan Nilai Resmi</div>
            </div>
          </div>

          <!-- Hero Banner: Grand Total RAB & Terbilang Resmi -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 8px; padding: 16px 20px; color: #ffffff; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 4px 10px rgba(15, 23, 42, 0.12);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
              <div style="flex: 1; min-width: 260px;">
                <div style="display: inline-block; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; padding: 3px 9px; border-radius: 4px;">
                  5. GRAND TOTAL RENCANA ANGGARAN BIAYA (TERMASUK PAJAK)
                </div>
                <div id="liveTerbilangVal" style="color: #cbd5e1; font-size: 12.5px; font-style: italic; margin-top: 6px; line-height: 1.4;">
                  "${calcRecalc.terbilangStr}"
                </div>
              </div>
              <div style="text-align: right; min-width: 220px;">
                <div id="liveGrandTotalVal" style="font-size: 26px; font-weight: 900; color: #38bdf8; font-family: var(--font-mono); letter-spacing: -0.5px;">
                  ${window.CurrencyUtil.formatRupiah(calcRecalc.grandTotal, false, true)}
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                  Akumulasi Real Cost &amp; Pajak Pertambahan Nilai
                </div>
              </div>
            </div>
            <!-- Sub-Banner: Informasi Luas Bangunan & Biaya per m2 -->
            <div style="padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.12); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; font-size: 12px; color: #cbd5e1;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>📐 Luas Rencana Efektif: <strong class="text-white" id="liveHeroArea">${effArea} m²</strong> <span style="font-size: 11px; color: #94a3b8;">(${isRehab ? 'Bagian Direhab' : 'Bangunan Baru'})</span></span>
                <span style="color: #64748b;">|</span>
                <span>🏞️ Luas Tanah: <strong class="text-white">${lndArea} m²</strong></span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span>🏷️ Biaya per Satuan Luas (HSP/m²):</span>
                <span style="background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); color: #6ee7b7; font-weight: 800; font-size: 13px; padding: 2px 8px; border-radius: 4px;" id="liveHeroCostPerM2">
                  ${window.CurrencyUtil.formatRupiah(costPerM2, false, true)} / m²
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulir Edit Profil & Jadwal Proyek -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="card-title">
            <span>Identitas & Jadwal Pelaksanaan Proyek</span>
          </div>
          <div class="card-actions no-print"></div>
        </div>
        <div class="card-body">
          <form id="projectInfoForm" onsubmit="App.saveProjectInfoForm(event)">
            <div class="form-row">
              <div class="form-group" style="flex: 2;">
                <label class="form-label">Nama Proyek <span class="modal-field-required">*</span></label>
                <input type="text" class="form-control" name="name" value="${proj.name || ''}" required>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Nomor Dokumen / Kontrak</label>
                <input type="text" class="form-control" name="docNumber" value="${proj.docNumber || ''}">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 2;">
                <label class="form-label">Lokasi / Alamat Pekerjaan Proyek</label>
                <input type="text" class="form-control" name="location" value="${proj.location || ''}">
              </div>
              <div class="form-group" style="flex: 2;">
                <label class="form-label">Sumber Data Acuan / Dasar Regulasi</label>
                <input type="text" list="dataSourceOptions" class="form-control" name="dataSource" value="${proj.dataSource || 'SE Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026'}" placeholder="Pilih atau ketik sumber data acuan...">
                <datalist id="dataSourceOptions">
                  <option value="SE Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026">
                  <option value="Permen PUPR No. 1 Tahun 2022 tentang Pedoman AHSP">
                  <option value="Standar Satuan Harga (SSH) Pemerintah Daerah 2026">
                  <option value="Harga Satuan Pokok Kegiatan (HSPK) Dinas PUPR 2026">
                  <option value="Survei Pasar & Analisis Mandiri 2026">
                </datalist>
                <div class="modal-help-text">Dasar acuan analisa koefisien dan penentuan harga satuan pekerjaan</div>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Tarif PPN (%)</label>
                <input type="number" step="1" min="0" max="25" class="form-control" name="ppnRate" id="projPpnRateInput" value="${(proj.ppnRate !== undefined && proj.ppnRate !== null) ? proj.ppnRate : 0}" oninput="App.handleLiveProjectSettingsChange()">
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Overhead & Profit (%)</label>
                <input type="number" step="0.5" min="0" max="30" class="form-control" name="overheadRate" id="projOverheadRateInput" value="${(proj.overheadRate !== undefined && proj.overheadRate !== null) ? proj.overheadRate : 0}" oninput="App.handleLiveProjectSettingsChange()">
              </div>
            </div>

            <!-- Bagian Dimensi Bangunan, Luas Lahan & Parameter Rehab -->
            <div class="modal-section-divider">DIMENSI BANGUNAN, LAHAN &amp; PARAMETER REHABILITASI</div>
            <div class="form-row">
              <div class="form-group" style="flex: 1.3;">
                <label class="form-label">Kategori / Tujuan Pekerjaan <span class="modal-field-required">*</span></label>
                <select class="form-control" name="projectType" id="projProjectTypeSelect" onchange="App.handleProjectTypeToggle()">
                  <option value="new" ${!isRehab ? 'selected' : ''}>🏗️ Pembangunan Bangunan Baru</option>
                  <option value="rehab" ${isRehab ? 'selected' : ''}>🛠️ Renovasi / Rehab / Pemeliharaan Bangunan</option>
                </select>
                <div class="modal-help-text">Menentukan dasar pembagian estimasi biaya per m²</div>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Luas Rencana Pembangunan (m²) <span class="modal-field-required">*</span></label>
                <input type="number" step="0.1" min="1" class="form-control" name="buildingArea" id="projBuildingAreaInput" value="${bldArea}" oninput="App.handleLiveProjectSettingsChange()" required>
                <div class="modal-help-text">Luas lantai rencana konstruksi</div>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Luas Tanah / Kavling (m²)</label>
                <input type="number" step="0.1" min="1" class="form-control" name="landArea" id="projLandAreaInput" value="${lndArea}" oninput="App.handleLiveProjectSettingsChange()">
                <div class="modal-help-text">Luas tapak tanah / lahan proyek</div>
              </div>
            </div>

            <!-- Opsi Tambahan Khusus Rehab / Renovasi (Dinamis) -->
            <div id="rehabFieldsContainer" style="display: ${isRehab ? 'flex' : 'none'}; gap: 14px; margin-bottom: 14px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px; padding: 12px 16px; flex-wrap: wrap;">
              <div class="form-group" style="flex: 1; min-width: 200px; margin-bottom: 0;">
                <label class="form-label" style="color: #9a3412; font-weight: 700;">Luas Bangunan Eksisting (m²)</label>
                <input type="number" step="0.1" min="0" class="form-control" name="existingBuildingArea" id="projExistingAreaInput" value="${extArea}" oninput="App.handleLiveProjectSettingsChange()">
                <div class="modal-help-text">Luas fisik bangunan sebelum direhabilitasi</div>
              </div>
              <div class="form-group" style="flex: 1; min-width: 200px; margin-bottom: 0;">
                <label class="form-label" style="color: #9a3412; font-weight: 700;">Volume / Bagian yang Direhab (m²) <span class="modal-field-required">*</span></label>
                <input type="number" step="0.1" min="0" class="form-control" name="rehabArea" id="projRehabAreaInput" value="${rhbArea}" oninput="App.handleLiveProjectSettingsChange()">
                <div class="modal-help-text">Dasar pembagi biaya per m² untuk pekerjaan renovasi/rehab</div>
              </div>
            </div>

            <!-- Bagian Pengaturan Logo Cover Proposal & Kop Dokumen Resmi -->
            <div class="modal-section-divider">LOGO PERUSAHAAN / COVER PROPOSAL</div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px;">
              <div class="d-flex align-items-center justify-content-between flex-wrap" style="gap: 16px;">
                <div style="flex: 1; min-width: 250px;">
                  <label class="form-label" style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">Logo Resmi Instansi / Perusahaan Kontraktor</label>
                  <div class="modal-help-text" style="color: #64748b; font-size: 11.5px; line-height: 1.4;">
                    Logo akan disematkan pada Kover Proposal, Kop Surat, dan Dokumen A4. Format: PNG, JPG, WebP, SVG (latar transparan direkomendasikan).
                  </div>
                  <div class="mt-2 d-flex align-items-center gap-2 flex-wrap">
                    <input type="file" id="projectLogoFileInput" accept="image/*" style="display: none;" onchange="App.handleProjectLogoUpload(event)">
                    <button type="button" class="btn btn-sm btn-outline" style="font-weight: 600; display: inline-flex; align-items: center; gap: 5px;" onclick="document.getElementById('projectLogoFileInput').click()">
                      📁 ${proj.logo ? 'Ganti File Logo' : 'Pilih File Logo'}
                    </button>
                    ${proj.logo ? `
                      <button type="button" class="btn btn-sm btn-outline" style="color: #ef4444; border-color: #fca5a5; display: inline-flex; align-items: center; gap: 5px;" onclick="App.removeProjectLogo()">
                        🗑️ Hapus Logo
                      </button>
                    ` : ''}
                  </div>
                  <!-- Pengatur Ukuran Logo -->
                  <div class="mt-3" style="max-width: 320px;">
                    <label class="form-label" style="font-size: 11.5px; font-weight: 700; color: #475569; margin-bottom: 4px;">
                      Ukuran Logo pada Dokumen: <span id="logoSizeLabel" style="color: #0284c7;">${proj.logoSize || 120} px</span>
                    </label>
                    <input type="range" min="60" max="300" step="10"
                      value="${proj.logoSize || 120}"
                      name="logoSize"
                      id="projLogoSizeSlider"
                      style="width: 100%; accent-color: #0284c7;"
                      oninput="App.handleLogoSizeChange(this.value)">
                    <div style="display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; margin-top: 2px;">
                      <span>60px (Kecil)</span><span>180px (Standar)</span><span>300px (Besar)</span>
                    </div>
                    <input type="hidden" name="logoSize" id="projLogoSizeHidden" value="${proj.logoSize || 120}">
                  </div>
                </div>
                <div style="min-width: 160px; text-align: center;">
                  <div id="projectLogoPreviewWrapper" style="width: 160px; min-height: 80px; border: 1px dashed #cbd5e1; border-radius: 6px; background: #ffffff; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 8px;">
                    <img id="logoSizePreviewImg" src="${proj.logo || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 80\' width=\'200\' height=\'80\'><rect width=\'200\' height=\'80\' rx=\'8\' fill=\'%230f172a\'/><path d=\'M25 60 L45 20 L65 60 Z\' fill=\'none\' stroke=\'%2338bdf8\' stroke-width=\'4\' stroke-linejoin=\'round\'/><path d=\'M35 60 L45 40 L55 60 Z\' fill=\'%2338bdf8\' opacity=\'0.7\'/><circle cx=\'45\' cy=\'18\' r=\'4\' fill=\'%23f59e0b\'/><text x=\'78\' y=\'38\' font-family=\'Arial, sans-serif\' font-size=\'16\' font-weight=\'bold\' fill=\'%23ffffff\'>DUTA CIPTA</text><text x=\'78\' y=\'54\' font-family=\'Arial, sans-serif\' font-size=\'9\' font-weight=\'500\' fill=\'%2394a3b8\' letter-spacing=\'1\'>KONTRAKTOR &amp; KONSULTAN</text></svg>'}" alt="Logo Proyek" style="max-width: ${proj.logoSize || 120}px; max-height: ${Math.round((proj.logoSize || 120) * 0.55)}px; object-fit: contain;">
                  </div>
                  <input type="hidden" name="projectLogoBase64" id="projectLogoBase64Input" value="${proj.logo || ''}">
                  <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Preview ukuran dokumen</div>
                </div>
              </div>
            </div>

            <!-- Bagian Periode Tanggal Mulai & Target Selesai -->
            <div class="modal-section-divider">JADWAL PELAKSANAAN PROYEK (TARGET MULAI & SELESAI)</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Tanggal Awal Proyek Mulai <span class="modal-field-required">*</span></label>
                <input type="date" class="form-control" name="startDate" id="projStartDateInput" value="${proj.startDate || '2026-04-01'}" onchange="App.handleProjectDateChange()" required>
                <div class="modal-help-text">Tanggal resmi dimulainya pekerjaan di lapangan</div>
              </div>
              <div class="form-group">
                <label class="form-label">Target Tanggal Selesai Proyek <span class="modal-field-required">*</span></label>
                <input type="date" class="form-control" name="finishDate" id="projFinishDateInput" value="${proj.finishDate || '2026-09-30'}" onchange="App.handleProjectDateChange()" required>
                <div class="modal-help-text">Target serah terima pertama (PHO) pekerjaan</div>
              </div>
              <div class="form-group">
                <label class="form-label">Total Durasi Pelaksanaan</label>
                <input type="text" class="form-control" style="background-color: #f8fafc; font-weight: 700; color: var(--color-primary);" id="projDurationDisplayInput" value="${durationDays} Hari (${durationWeeks} Minggu)" readonly>
                <div class="modal-help-text">Dihitung otomatis dari selisih tanggal kalender</div>
              </div>
            </div>

            <!-- Bagian Pihak Penandatangan (Lembar Pengesahan Tiga Pihak Bab VII) -->
            <div class="modal-section-divider" style="background: #f8fafc; color: #0f172a; border-left: 4px solid #0f172a; padding: 8px 12px; font-weight: 800;">
              ✍️ PEJABAT PENANDATANGAN DOKUMEN & LEMBAR PENGESAHAN TIGA PIHAK (BAB VII PROPOSAL)
            </div>
            <div style="font-size: 11.5px; color: #64748b; margin-top: -6px; margin-bottom: 12px;">
              Data tiga pihak di bawah ini otomatis mengisi <strong>BAB VII Lembar Pengesahan Proposal</strong>, Surat Penawaran Resmi, serta Lembar Berita Acara (BAP).
            </div>

            <!-- PIHAK 1: PEMBERI TUGAS / OWNER -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; margin-bottom: 12px;">
              <div style="font-weight: 800; font-size: 12px; color: #0f172a; margin-bottom: 8px;">1. PIHAK PERTAMA: PEMBERI TUGAS / PEMILIK (OWNER)</div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nama Pemilik / Pemberi Tugas <span class="modal-field-required">*</span></label>
                  <input type="text" class="form-control" name="ownerName" value="${sig.ownerName}" placeholder="Nama lengkap & gelar">
                </div>
                <div class="form-group">
                  <label class="form-label">Jabatan Pemilik / PPK</label>
                  <input type="text" class="form-control" name="ownerTitle" value="${sig.ownerTitle}" placeholder="Misal: Pemilik Bangunan / PPK">
                </div>
                <div class="form-group">
                  <label class="form-label">NIP / No. Identitas Pemilik</label>
                  <input type="text" class="form-control" name="ownerNip" value="${sig.ownerNip}" placeholder="Nomor identitas / NIP">
                </div>
              </div>
            </div>

            <!-- PIHAK 2: KONSULTAN PERENCANA -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; margin-bottom: 12px;">
              <div style="font-weight: 800; font-size: 12px; color: #0f172a; margin-bottom: 8px;">2. PIHAK KEDUA: KONSULTAN PERENCANA (DESAIN & STRUKTUR)</div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nama Team Leader / Perencana <span class="modal-field-required">*</span></label>
                  <input type="text" class="form-control" name="consultantName" value="${sig.consultantName}" placeholder="Nama Pengawas / Perencana">
                </div>
                <div class="form-group">
                  <label class="form-label">Nama Badan Usaha / Kantor Konsultan (PT / CV)</label>
                  <input type="text" class="form-control" name="consultantCompany" value="${sig.consultantCompany}" placeholder="Nama PT / CV / Studio Konsultan">
                </div>
                <div class="form-group">
                  <label class="form-label">Jabatan Konsultan</label>
                  <input type="text" class="form-control" name="consultantTitle" value="${sig.consultantTitle}">
                </div>
              </div>
            </div>

            <!-- PIHAK 3: KONTRAKTOR PELAKSANA -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; margin-bottom: 12px;">
              <div style="font-weight: 800; font-size: 12px; color: #0f172a; margin-bottom: 8px;">3. PIHAK KETIGA: KONTRAKTOR PELAKSANA</div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nama Direktur / Penanggung Jawab <span class="modal-field-required">*</span></label>
                  <input type="text" class="form-control" name="contractorName" value="${sig.contractorName}" placeholder="Nama Direktur / PM">
                </div>
                <div class="form-group">
                  <label class="form-label">Nama Perusahaan Kontraktor (PT / CV)</label>
                  <input type="text" class="form-control" name="contractorCompany" value="${sig.contractorCompany}" placeholder="Nama PT / CV Kontraktor Pelaksana">
                </div>
                <div class="form-group">
                  <label class="form-label">Jabatan Kontraktor</label>
                  <input type="text" class="form-control" name="contractorTitle" value="${sig.contractorTitle}">
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Kota Penetapan Dokumen Proposal</label>
                <input type="text" class="form-control" name="docCity" value="${sig.docCity || proj.location || 'Indonesia'}">
              </div>
              <div class="form-group">
                <label class="form-label">Tanggal Penetapan Dokumen Proposal</label>
                <input type="date" class="form-control" name="docDate" value="${sig.docDate || proj.startDate || '2026-04-01'}">
              </div>
            </div>

            <!-- Bagian Rekening Bank Pembayaran Proyek (BAP) -->
            <div class="modal-section-divider">REKENING BANK KONTRAKTOR (UNTUK PENAGIHAN BAP & TRANSFER)</div>
            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Nama Bank Penerima</label>
                <input type="text" class="form-control" name="bankName" value="${bank.bankName || 'Bank Mandiri'}" placeholder="Misal: Bank Mandiri / BCA / BNI">
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Nomor Rekening Bank</label>
                <input type="text" class="form-control" name="accountNumber" value="${bank.accountNumber || '131-00-8899221-5'}" placeholder="Nomor rekening">
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Atas Nama Rekening</label>
                <input type="text" class="form-control" name="accountName" value="${bank.accountName || proj.contractor || ''}" placeholder="Nama pemilik rekening">
              </div>
            </div>

            <!-- Bagian Tim Teknis Lapangan & Pengawasan Mutu -->
            <div class="modal-section-divider">TIM PENGAWASAN & PELAKSANA LAPANGAN (LEMBAR PENGAWASAN MUTU & BAP)</div>
            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Konsultan Pengawas / QC (Nama & Gelar)</label>
                <input type="text" class="form-control" name="qcInspectorName" value="${sig.qcInspectorName || 'Ir. M. Ridwan'}" placeholder="Nama Pengawas Lapangan">
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Jabatan Pengawas QC</label>
                <input type="text" class="form-control" name="qcInspectorRole" value="${sig.qcInspectorRole || 'Site Inspector / QC'}">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Mandor Lapangan / Pelaksana Harian</label>
                <input type="text" class="form-control" name="fieldMandorName" value="${sig.fieldMandorName || 'Sutarji / Warsito'}" placeholder="Nama Mandor Lapangan">
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Jabatan Mandor / Pelaksana</label>
                <input type="text" class="form-control" name="fieldMandorRole" value="${sig.fieldMandorRole || 'Mandor / Pelaksana Lapangan'}">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Site Manager Kontraktor (Nama & Gelar)</label>
                <input type="text" class="form-control" name="siteManagerName" value="${sig.siteManagerName || 'Ir. Hendra Prasetya'}" placeholder="Nama Site Manager">
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Jabatan Site Manager</label>
                <input type="text" class="form-control" name="siteManagerRole" value="${sig.siteManagerRole || 'Site Manager / Penanggung Jawab Teknis'}">
              </div>
            </div>

            <!-- Bagian Pagu Anggaran Cadangan & Catatan Khusus Pengawasan Mutu -->
            <div class="modal-section-divider">PAGU ANGGARAN KONTRAK & INSTRUKSI MUTU LAPANGAN</div>
            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Pagu Anggaran Kontrak Cadangan (Rp)</label>
                <input type="number" step="1000" class="form-control" name="contractBudget" value="${proj.contractBudget || ''}" placeholder="Digunakan jika detail item RAB belum diisi">
                <div class="modal-help-text">Nilai acuan termin jika detail RAB belum memiliki rincian harga</div>
              </div>
              <div class="form-group" style="flex: 2;">
                <label class="form-label">Catatan Mutu & Arahan Khusus Pengawasan Lapangan</label>
                <textarea class="form-control" name="siteQualityNotes" rows="2" placeholder="Catatan instruksi teknis pengawas lapangan...">${proj.siteQualityNotes || ''}</textarea>
                <div class="modal-help-text">Ditampilkan otomatis pada Lembar Pengawasan & Koreksi Mutu</div>
              </div>
            </div>

            <div class="mt-3 d-flex justify-content-between align-items-center flex-wrap gap-2 no-print">
              <button type="button" class="btn btn-outline" style="font-weight: 700; display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px;" onclick="App.printProjectInfo()">
                🖨️ Cetak PDF Informasi &amp; Setting Proyek
              </button>
              <button type="button" class="btn btn-primary" style="padding: 9px 22px; font-weight: 700;" onclick="App.saveProjectInfoForm(event)">
                💾 Simpan Perubahan Informasi Proyek
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tabel Analisis Kebutuhan Tenaga Kerja Harian -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>Analisis & Estimasi Kebutuhan Tenaga Kerja Riil per Hari Kerja</span>
            <span class="badge badge-light">Basis: ${durationDays} Hari Kerja Proyek</span>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 5%">No</th>
                  <th style="width: 30%">Klasifikasi Tenaga Kerja</th>
                  <th style="width: 15%" class="text-right">Total Kebutuhan (OH)</th>
                  <th style="width: 18%" class="text-center">Kebutuhan per Hari Kerja</th>
                  <th style="width: 16%" class="text-right">Tarif Upah (Rp/OH)</th>
                  <th style="width: 16%" class="text-right">Total Anggaran Upah</th>
                </tr>
              </thead>
              <tbody>
                ${laborRowsHtml || '<tr><td colspan="6" class="text-center text-muted p-4">Belum ada data tenaga kerja pada RAB.</td></tr>'}
              </tbody>
            </table>
          </div>

          <!-- Mobile Touch Cards View: Kebutuhan Tenaga Kerja Harian -->
          <div class="d-mobile-only p-3">
            ${laborMobileCardsHtml || '<div class="text-center text-muted p-3 bg-light rounded">Belum ada data tenaga kerja pada RAB.</div>'}
          </div>
        </div>
      </div>
    `;
  }

  function handleProjectLogoUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotificationModal({
        title: "Format File Tidak Didukung",
        icon: "⚠️",
        type: "warning",
        contentHtml: "Silakan pilih file gambar dengan format PNG, JPG, JPEG, WebP, atau SVG.",
        confirmText: "Mengerti"
      });
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      showNotificationModal({
        title: "Ukuran File Terlalu Besar",
        icon: "⚠️",
        type: "warning",
        contentHtml: "Ukuran logo maksimal 2.5MB agar performa aplikasi dan cetak dokumen tetap optimal.",
        confirmText: "Pilih File Lain"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
      const base64Str = evt.target.result;
      const proj = window.ProjectManager.getActiveProject();
      if (proj) {
        proj.logo = base64Str;
        window.ProjectManager.updateActiveProject(proj);
      }
      const previewWrap = document.getElementById("projectLogoPreviewWrapper");
      if (previewWrap) {
        previewWrap.innerHTML = `<img src="${base64Str}" alt="Logo Proyek" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
      }
      const hiddenInput = document.getElementById("projectLogoBase64Input");
      if (hiddenInput) {
        hiddenInput.value = base64Str;
      }
      renderInfoProyekView();
      if (window.App && window.App.showNotificationModal) {
        showNotificationModal({
          title: "Logo Berhasil Dimuat",
          icon: "✅",
          type: "info",
          contentHtml: "Logo perusahaan berhasil diperbarui dan akan ditampilkan pada Cover Proposal serta Dokumen Cetak.",
          confirmText: "OK"
        });
      }
    };
    reader.readAsDataURL(file);
  }

  function removeProjectLogo() {
    const proj = window.ProjectManager.getActiveProject();
    if (proj) {
      proj.logo = "";
      window.ProjectManager.updateActiveProject(proj);
    }
    const previewWrap = document.getElementById("projectLogoPreviewWrapper");
    if (previewWrap) {
      previewWrap.innerHTML = `<span style="font-size: 11px; color: #94a3b8; font-weight: 600;">Belum Ada Logo</span>`;
    }
    const hiddenInput = document.getElementById("projectLogoBase64Input");
    if (hiddenInput) {
      hiddenInput.value = "";
    }
    renderInfoProyekView();
  }

  function saveProjectInfoForm(e) {
    if (e) e.preventDefault();
    const form = document.getElementById("projectInfoForm");
    if (!form) return;

    const formData = new FormData(form);
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return;

    const startD = new Date(formData.get("startDate") || "2026-04-01");
    const finishD = new Date(formData.get("finishDate") || "2026-09-30");
    if (finishD.getTime() < startD.getTime()) {
      showNotificationModal({
        title: "Validasi Jadwal Proyek",
        icon: "⚠️",
        type: "warning",
        contentHtml: `<div style="font-size: 13px;">Target tanggal selesai proyek tidak boleh lebih awal dari tanggal dimulainya pekerjaan. Silakan periksa kembali input tanggal kalender.</div>`,
        confirmText: "Perbaiki Tanggal"
      });
      return;
    }

    const diffTime = Math.max(1, finishD.getTime() - startD.getTime());
    const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const durationWeeks = Math.ceil(durationDays / 7);

    const rawOverhead = formData.get("overheadRate");
    const newOverhead = (rawOverhead !== null && rawOverhead !== "" && !isNaN(parseFloat(rawOverhead))) ? parseFloat(rawOverhead) : 0;
    const rawPpn = formData.get("ppnRate");
    const newPpn = (rawPpn !== null && rawPpn !== "" && !isNaN(parseFloat(rawPpn))) ? parseFloat(rawPpn) : 0;

    // Fungsi helper: baca nilai FormData — teks boleh kosong (user sengaja hapus), hanya skip jika null
    const fd = (key) => formData.get(key);
    const fdStr = (key, fallback) => { const v = fd(key); return (v !== null) ? v.trim() : fallback; };

    const logoVal = document.getElementById("projectLogoBase64Input") ? document.getElementById("projectLogoBase64Input").value : proj.logo;
    if (logoVal !== undefined) proj.logo = logoVal;
    const logoSizeEl = document.getElementById("projLogoSizeHidden");
    proj.logoSize = logoSizeEl ? (parseInt(logoSizeEl.value) || 120) : (proj.logoSize || 120);
    proj.name = fdStr("name", proj.name);
    proj.docNumber = fdStr("docNumber", proj.docNumber || "");
    proj.location = fdStr("location", proj.location || "");
    proj.dataSource = fdStr("dataSource", proj.dataSource || "SE Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026");
    proj.startDate = fdStr("startDate", proj.startDate || "2026-04-01");
    proj.finishDate = fdStr("finishDate", proj.finishDate || "2026-09-30");
    proj.durationDays = durationDays;
    proj.overheadRate = newOverhead;
    proj.ppnRate = newPpn;

    proj.projectType = fdStr("projectType", proj.projectType || "new");
    proj.buildingArea = parseFloat(formData.get("buildingArea")) || proj.buildingArea || 180;
    proj.landArea = parseFloat(formData.get("landArea")) || proj.landArea || 200;
    proj.existingBuildingArea = parseFloat(formData.get("existingBuildingArea")) || 0;
    proj.rehabArea = parseFloat(formData.get("rehabArea")) || 0;

    proj.bankInfo = {
      bankName: formData.get("bankName") || (proj.bankInfo && proj.bankInfo.bankName) || "Bank Mandiri",
      accountNumber: formData.get("accountNumber") || (proj.bankInfo && proj.bankInfo.accountNumber) || "131-00-8899221-5",
      accountName: formData.get("accountName") || (proj.bankInfo && proj.bankInfo.accountName) || proj.contractor || ""
    };

    const getCleanSigner = (val, fallback) => {
      let s = (val || "").toString().trim();
      s = s.replace(/^\s*\(\s*|\s*\)\s*$/g, '').trim();
      return (s && !s.includes("...") && !s.includes("Bapak / Ibu")) ? s : fallback;
    };

    proj.signatories = {
      ownerName: getCleanSigner(formData.get("ownerName"), (proj.signatories && proj.signatories.ownerName && !proj.signatories.ownerName.includes("Bapak / Ibu")) ? proj.signatories.ownerName : ((proj.owner && !proj.owner.includes("Bapak / Ibu")) ? proj.owner : "Dr. H. Hendra Gunawan, S.T., M.M.")),
      ownerTitle: getCleanSigner(formData.get("ownerTitle"), (proj.signatories && proj.signatories.ownerTitle) || "Kuasa Pengguna Anggaran / Pemilik"),
      ownerNip: getCleanSigner(formData.get("ownerNip"), (proj.signatories && proj.signatories.ownerNip) || "-"),
      contractorCompany: getCleanSigner(formData.get("contractorCompany"), (proj.signatories && proj.signatories.contractorCompany) || proj.contractor || "PT. Duta Konstruksi Pratama"),
      contractorName: getCleanSigner(formData.get("contractorName"), (proj.signatories && proj.signatories.contractorName) || "H. Ahmad Fauzi, S.T."),
      contractorTitle: getCleanSigner(formData.get("contractorTitle"), (proj.signatories && proj.signatories.contractorTitle) || "Direktur Utama"),
      consultantCompany: getCleanSigner(formData.get("consultantCompany"), (proj.signatories && proj.signatories.consultantCompany) || proj.consultant || "PT. Architekta Desain Studio"),
      consultantName: getCleanSigner(formData.get("consultantName"), (proj.signatories && proj.signatories.consultantName) || "Ir. Bambang Hartono, S.T., M.T."),
      consultantTitle: getCleanSigner(formData.get("consultantTitle"), (proj.signatories && proj.signatories.consultantTitle) || "Team Leader / Pengawas"),
      qcInspectorName: getCleanSigner(formData.get("qcInspectorName"), (proj.signatories && proj.signatories.qcInspectorName) || "Ir. M. Ridwan"),
      qcInspectorRole: getCleanSigner(formData.get("qcInspectorRole"), (proj.signatories && proj.signatories.qcInspectorRole) || "Site Inspector / QC"),
      fieldMandorName: getCleanSigner(formData.get("fieldMandorName"), (proj.signatories && proj.signatories.fieldMandorName) || "Sutarji / Warsito"),
      fieldMandorRole: getCleanSigner(formData.get("fieldMandorRole"), (proj.signatories && proj.signatories.fieldMandorRole) || "Mandor Lapangan"),
      siteManagerName: getCleanSigner(formData.get("siteManagerName"), (proj.signatories && proj.signatories.siteManagerName) || "Ir. Hendra Prasetya"),
      siteManagerRole: getCleanSigner(formData.get("siteManagerRole"), (proj.signatories && proj.signatories.siteManagerRole) || "Site Manager Kontraktor"),
      docCity: getCleanSigner(formData.get("docCity"), (proj.signatories && proj.signatories.docCity) || proj.location || "Indonesia"),
      docDate: getCleanSigner(formData.get("docDate"), (proj.signatories && proj.signatories.docDate) || proj.startDate || "2026-04-01")
    };

    proj.contractBudget = parseFloat(formData.get("contractBudget")) || proj.contractBudget || 0;
    proj.siteQualityNotes = formData.get("siteQualityNotes") || "";

    proj.owner = proj.signatories.ownerName || proj.owner;
    proj.contractor = proj.signatories.contractorCompany || proj.contractor;
    proj.consultant = proj.signatories.consultantCompany || proj.consultant;

    // EKSEKUSI REKALKULASI SELURUH DATA PROYEK (HSP AHSP, Subtotal Divisi, Real Cost, PPN, Grand Total)
    let recalcRes = null;
    if (window.RabCalculator && window.RabCalculator.recalculateProjectRabSettings) {
      recalcRes = window.RabCalculator.recalculateProjectRabSettings(proj, newOverhead, newPpn);
    }

    window.ProjectManager.updateActiveProject(proj);
    updateProjectHeader();
    setupProjectSwitcher();

    // Tampilkan konfirmasi eksekutif yang informatif dan jelas
    const ovFormatted = recalcRes ? window.CurrencyUtil.formatRupiah(recalcRes.overheadAmount, false, true) : "-";
    const realFormatted = recalcRes ? window.CurrencyUtil.formatRupiah(recalcRes.realCost, false, true) : "-";
    const ppnFormatted = recalcRes ? window.CurrencyUtil.formatRupiah(recalcRes.ppnAmount, false, true) : "-";
    const grandFormatted = recalcRes ? window.CurrencyUtil.formatRupiah(recalcRes.grandTotal, false, true) : "-";
    const cpmFormatted = recalcRes ? window.CurrencyUtil.formatRupiah(recalcRes.costPerM2, false, true) : "-";

    showConfirmModal({
      title: "✅ Data Proyek Berhasil Disimpan & Dihitung Ulang!",
      message: `
        Profil proyek, durasi kerja, dan pengaturan finansial telah diperbarui dan dihitung ulang secara menyeluruh:<br><br>
        &bull; <strong>Alokasi Overhead & Profit (${newOverhead}%):</strong> ${ovFormatted}<br>
        &bull; <strong>Subtotal Real Cost:</strong> ${realFormatted}<br>
        &bull; <strong>Pajak PPN (${newPpn}%):</strong> ${ppnFormatted}<br>
        &bull; <strong>Grand Total Kontrak Baru:</strong> <span style="color: #059669; font-weight: 800;">${grandFormatted}</span><br>
        &bull; <strong>Total Waktu Pelaksanaan:</strong> ${durationDays} Hari Kalender (${durationWeeks} Minggu)<br>
        &bull; <strong>Dimensi Rencana:</strong> ${proj.buildingArea} m² (Lahan: ${proj.landArea} m²)${proj.projectType === 'rehab' ? ` &bull; Rehab: ${proj.rehabArea} m²` : ''}<br>
        &bull; <strong>Estimasi Biaya per m²:</strong> <span style="color: #0284c7; font-weight: 800;">${cpmFormatted} / m²</span><br><br>
        <span class="text-muted" style="font-size: 11.5px;">Seluruh rincian pada Rekapitulasi RAB, Rincian Detail RAB, Kalender Proyek, Kurva S, dan Proposal telah otomatis disinkronkan.</span>
      `,
      confirmText: "Tutup & Lihat Data",
      onConfirm: () => {
        renderInfoProyekView();
      }
    });
  }

  // 1. Rekapitulasi RAB View
  function renderRekapRabView() {
    const container = document.getElementById("rekapRabContent");
    if (!container) return;

    const proj = window.ProjectManager.getActiveProject();
    const rab = window.RabCalculator.calculateProjectRab(proj);
    const cleanSignerName = (val, fallback) => {
      let s = (val || "").toString().trim();
      s = s.replace(/^\s*\(\s*|\s*\)\s*$/g, '').trim();
      if (!s || s.includes('...') || s.includes('Bapak / Ibu')) return fallback;
      return s;
    };

    const sig = (proj && proj.signatories) || {};
    const sigOwnerName = cleanSignerName(sig.ownerName, cleanSignerName(proj && proj.owner, 'Dr. H. Hendra Gunawan, S.T., M.M.'));
    const sigOwnerTitle = sig.ownerTitle || 'Pemilik Proyek';
    const sigConsultantName = cleanSignerName(sig.consultantName, 'Ir. Bambang Hartono, S.T., M.T.');
    const sigConsultantTitle = sig.consultantCompany || sig.consultantTitle || (proj && proj.consultant) || 'CV. Architecindo Consultant';
    const sigContractorName = cleanSignerName(sig.contractorName, 'H. Ahmad Fauzi, S.T.');
    const sigContractorTitle = sig.contractorCompany || sig.contractorTitle || (proj && proj.contractor) || 'PT. Karya Mandiri Perkasa';

    let rowsHtml = "";
    let rekapMobileCardsHtml = "";
    rab.divisionSummaries.forEach((div, idx) => {
      rowsHtml += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center font-bold">${div.code}</td>
          <td>
            <strong>${div.name}</strong>
            <div class="text-muted" style="font-size: 11px;">${div.itemCount} Item Pekerjaan</div>
          </td>
          <td class="text-right font-bold">${window.CurrencyUtil.formatRupiah(div.subtotal, false, true)}</td>
          <td class="text-center font-bold">${window.CurrencyUtil.formatNumber(div.weightPercent, 2)}%</td>
          <td class="text-center no-print">
            <button class="btn btn-sm btn-outline" onclick="App.jumpToDivision('${div.id}')">Lihat Rincian</button>
          </td>
        </tr>
      `;

      rekapMobileCardsHtml += `
        <div class="rekap-mobile-card">
          <div class="rekap-mobile-card-header">
            <span class="badge badge-secondary font-mono">Divisi ${div.code}</span>
            <span class="font-bold text-emerald" style="font-size: 15px;">
              ${window.CurrencyUtil.formatRupiah(div.subtotal, false, true)}
            </span>
          </div>
          <div class="rekap-mobile-card-title">
            ${div.name}
          </div>
          <div class="d-flex justify-content-between align-items-center text-muted" style="font-size: 11.5px; margin-top: 4px;">
            <span>${div.itemCount} Item Pekerjaan</span>
            <span>Bobot: <strong class="text-dark">${window.CurrencyUtil.formatNumber(div.weightPercent, 2)}%</strong></span>
          </div>
          <div class="no-print mt-2">
            <button class="btn btn-sm btn-outline w-100" onclick="App.jumpToDivision('${div.id}')">
              Lihat Rincian Pekerjaan &rarr;
            </button>
          </div>
        </div>
      `;
    });
    container.innerHTML = `
      <div class="print-only">
        ${window.PrintEngine.createPrintHeader(proj, "REKAPITULASI RENCANA ANGGARAN BIAYA")}
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>Rekapitulasi Rencana Anggaran Biaya (RAB)</span>
            <span class="badge badge-light">Standar SE PUPR No. 47/2026</span>
          </div>
          <div class="card-actions no-print d-flex align-items-center flex-wrap" style="gap: 8px;">
            <button class="btn btn-primary" onclick="App.openAddDivisionModal()">+ Tambah Divisi</button>
            <button class="btn btn-outline font-bold" onclick="App.printCurrentPage('panel-rekap-rab', 'Rekapitulasi_RAB')">🖨️ Cetak / Preview A4</button>
          </div>
        </div>
        <div class="card-body">
          <!-- Desktop Table View -->
          <div class="table-responsive d-desktop-only">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 5%">No</th>
                  <th style="width: 10%">Divisi</th>
                  <th style="width: 47%">Uraian Divisi Pekerjaan</th>
                  <th style="width: 25%">Jumlah Harga (Rp)</th>
                  <th style="width: 13%">Bobot (%)</th>
                  <th style="width: 10%" class="no-print">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || '<tr><td colspan="6" class="text-center text-muted">Belum ada divisi pekerjaan.</td></tr>'}
                <tr class="table-active">
                  <td colspan="3" class="text-right font-bold">JUMLAH BIAYA KONSTRUKSI (REAL COST)</td>
                  <td class="text-right font-bold">${window.CurrencyUtil.formatRupiah(rab.realCost, false, true)}</td>
                  <td class="text-center font-bold">100.00%</td>
                  <td class="no-print"></td>
                </tr>
                <tr>
                  <td colspan="3" class="text-right">
                    <label class="no-print" style="cursor: pointer;">
                      <input type="checkbox" id="ppnToggleCheckbox" ${rab.includePpn ? 'checked' : ''} onchange="App.togglePpn(this.checked)">
                    </label>
                    Pajak Pertambahan Nilai (PPN ${rab.ppnRate}%)
                  </td>
                  <td class="text-right">${window.CurrencyUtil.formatRupiah(rab.ppnAmount, false, true)}</td>
                  <td class="text-center">-</td>
                  <td class="no-print"></td>
                </tr>
                <tr class="total-highlight-row">
                  <td colspan="3" class="text-right font-bold" style="font-size: 1.05rem;">TOTAL RENCANA ANGGARAN BIAYA (DIBULATKAN)</td>
                  <td class="text-right font-bold text-primary" style="font-size: 1.15rem;">
                    ${window.CurrencyUtil.formatRupiah(rab.grandTotal, false, true)}
                  </td>
                  <td class="text-center">-</td>
                  <td class="no-print"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Summary Cards View (Zero Horizontal Scroll, Focused on Core Data) -->
          <div class="d-mobile-only p-3">
            ${rekapMobileCardsHtml || '<div class="text-center text-muted p-3 bg-light rounded">Belum ada divisi pekerjaan.</div>'}
            <div class="rekap-mobile-grand-total-card mt-3">
              <div class="rekap-grand-total-row">
                <span>Real Cost (Biaya Konstruksi):</span>
                <span class="font-bold">${window.CurrencyUtil.formatRupiah(rab.realCost, false, true)}</span>
              </div>
              <div class="rekap-grand-total-row">
                <span>PPN (${rab.ppnRate}%):</span>
                <span class="font-bold">${window.CurrencyUtil.formatRupiah(rab.ppnAmount, false, true)}</span>
              </div>
              <div class="rekap-grand-total-row rekap-grand-total-main">
                <span style="font-weight: 800; font-size: 13.5px;">TOTAL BIAYA (RAB):</span>
                <span class="rekap-grand-total-amount">${window.CurrencyUtil.formatRupiah(rab.grandTotal, false, true)}</span>
              </div>
              <div class="rekap-grand-total-terbilang">
                Terbilang: <strong>${rab.terbilangStr}</strong>
              </div>
            </div>
          </div>

          <div class="card p-3 bg-light mt-3" style="border: 1px solid #e2e8f0; border-radius: 6px;">
            <strong>Terbilang:</strong>
            <div class="text-muted" style="font-style: italic; margin-top: 2px;">
              "${rab.terbilangStr}"
            </div>
          </div>

          <!-- Ringkasan Dimensi Bangunan & Biaya per m2 -->
          <div class="mt-2 mb-2 d-flex justify-content-between align-items-center flex-wrap" style="font-size: 11.5px; color: #64748b; gap: 8px; padding: 6px 0; border-top: 1px solid #f1f5f9;">
            <span>📐 Luas Rencana: <strong>${proj.buildingArea || 180} m²</strong> | Luas Lahan: <strong>${proj.landArea || 200} m²</strong> ${proj.projectType === 'rehab' ? `| Bagian Direhab: <strong>${proj.rehabArea || 0} m²</strong>` : ''}</span>
            <span style="font-weight: 700; color: #059669;">🏷️ Estimasi Biaya Satuan: <strong>${window.CurrencyUtil.formatRupiah(rab.costPerM2 || Math.round(rab.grandTotal / (proj.buildingArea || 180)), false, true)} / m²</strong></span>
          </div>

          <!-- Tanda Tangan Tiga Pihak (Bebas Titik-Titik & Sejajar 3 Kolom Horizontal) -->
          <table class="signature-clean-table" style="width: 100% !important; border-collapse: collapse !important; border: none !important; background: transparent !important; margin-top: 24pt !important; page-break-inside: avoid !important; break-inside: avoid !important;">
            <tr style="border: none !important; background: transparent !important;">
              <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 10px !important; background: transparent !important;">
                <div class="sig-title" style="font-weight: 800; font-size: 9pt; color: #1e293b; margin-bottom: 4px;">PEMBERI TUGAS / OWNER</div>
                <div style="font-size: 8pt; color: #64748b; min-height: 16px;">Menyetujui:</div>
                <div class="sig-space" style="height: 45px;"></div>
                <div class="sig-name" style="font-weight: 700; font-size: 9pt; color: #0f172a; text-decoration: none !important; border-bottom: none !important;">( ${sigOwnerName} )</div>
                <div class="sig-role" style="font-size: 8pt; color: #334155; margin-top: 3px;">${sigOwnerTitle}</div>
              </td>
              <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 10px !important; background: transparent !important;">
                <div class="sig-title" style="font-weight: 800; font-size: 9pt; color: #1e293b; margin-bottom: 4px;">KONSULTAN PERENCANA</div>
                <div style="font-size: 8pt; color: #64748b; min-height: 16px;">Direncanakan:</div>
                <div class="sig-space" style="height: 45px;"></div>
                <div class="sig-name" style="font-weight: 700; font-size: 9pt; color: #0f172a; text-decoration: none !important; border-bottom: none !important;">( ${sigConsultantName} )</div>
                <div class="sig-role" style="font-size: 8pt; color: #334155; margin-top: 3px;">${sigConsultantTitle}</div>
              </td>
              <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 10px !important; background: transparent !important;">
                <div class="sig-title" style="font-weight: 800; font-size: 9pt; color: #1e293b; margin-bottom: 4px;">KONTRAKTOR PELAKSANA</div>
                <div style="font-size: 8pt; color: #64748b; min-height: 16px;">Diajukan:</div>
                <div class="sig-space" style="height: 45px;"></div>
                <div class="sig-name" style="font-weight: 700; font-size: 9pt; color: #0f172a; text-decoration: none !important; border-bottom: none !important;">( ${sigContractorName} )</div>
                <div class="sig-role" style="font-size: 8pt; color: #334155; margin-top: 3px;">${sigContractorTitle}</div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;
  }

  // 2. Detail Rincian RAB View dengan Rincian Penggunaan Tenaga Kerja
  function toggleLaborDetailInRab() {
    showLaborDetailInRab = !showLaborDetailInRab;
    renderDetailRabView();
  }

  function renderDetailRabView() {
    const container = document.getElementById("detailRabContent");
    if (!container) return;

    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return;
    if (!proj.divisions || proj.divisions.length === 0) {
      proj.divisions = [
        { id: "DIV-01", code: "I", name: "PEKERJAAN PERSIAPAN", items: [], subtotal: 0, weightPercent: 0 },
        { id: "DIV-02", code: "II", name: "PEKERJAAN PONDASI & STRUKTUR BETON", items: [], subtotal: 0, weightPercent: 0 },
        { id: "DIV-03", code: "III", name: "PEKERJAAN DINDING & ARSITEKTUR", items: [], subtotal: 0, weightPercent: 0 },
        { id: "DIV-04", code: "IV", name: "PEKERJAAN ATAP & PLAFON", items: [], subtotal: 0, weightPercent: 0 },
        { id: "DIV-05", code: "V", name: "PEKERJAAN MEKANIKAL, ELEKTRIKAL & FINISHING", items: [], subtotal: 0, weightPercent: 0 }
      ];
      if (window.ProjectManager && window.ProjectManager.updateActiveProject) {
        window.ProjectManager.updateActiveProject(proj);
      }
    }
    const cleanSignerName = (val, fallback) => {
      let s = (val || "").toString().trim();
      s = s.replace(/^\s*\(\s*|\s*\)\s*$/g, '').trim();
      if (!s || s.includes('...') || s.includes('Bapak / Ibu')) return fallback;
      return s;
    };

    const sig = proj.signatories || {};
    const sigOwnerName = cleanSignerName(sig.ownerName, cleanSignerName(proj.owner, 'Dr. H. Hendra Gunawan, S.T., M.M.'));
    const sigOwnerTitle = sig.ownerTitle || 'Pemilik Proyek';
    const sigConsultantName = cleanSignerName(sig.consultantName, 'Ir. Bambang Hartono, S.T., M.T.');
    const sigConsultantTitle = sig.consultantCompany || sig.consultantTitle || proj.consultant || 'CV. Architecindo Consultant';
    const sigContractorName = cleanSignerName(sig.contractorName, 'H. Ahmad Fauzi, S.T.');
    const sigContractorTitle = sig.contractorCompany || sig.contractorTitle || proj.contractor || 'PT. Karya Mandiri Perkasa';

    let totalProjectLaborCost = 0;
    let totalProjectLaborQty = 0;

    let divisionsHtml = "";
    proj.divisions.forEach(div => {
      let divLaborCost = 0;
      let divLaborQty = 0;
      let itemsHtml = "";
      let mobileCardsHtml = "";

      (div.items || []).forEach((itm, idx) => {
        let ahsp = null;
        if (window.AhspEngine) {
          if (itm.ahspId) ahsp = window.AhspEngine.getAhspById(itm.ahspId, itm);
          if (!ahsp && itm.code) ahsp = window.AhspEngine.getAhspById(itm.code, itm);
        }

        const laborInfo = (window.ResourceUsage && window.ResourceUsage.getItemLaborDetails)
          ? window.ResourceUsage.getItemLaborDetails(itm.volume, ahsp, itm.total)
          : { laborList: [], totalLaborQty: 0, totalLaborCost: 0, laborPercentOfItem: 0 };

        divLaborCost += laborInfo.totalLaborCost;
        divLaborQty += laborInfo.totalLaborQty;

        let laborDetailHtml = "";
        if (showLaborDetailInRab && laborInfo.laborList && laborInfo.laborList.length > 0) {
          const chipsHtml = laborInfo.laborList.map(c => `
            <span class="item-labor-chip">
              <strong>${c.name}:</strong> ${window.CurrencyUtil.formatNumber(c.qty, 2)} ${c.unit} &times; ${window.CurrencyUtil.formatRupiah(c.price, false, true)} = <strong>${window.CurrencyUtil.formatRupiah(c.totalCost, false, true)}</strong> <span class="text-muted">(${c.pctOfItem.toFixed(1)}%)</span>
            </span>
          `).join('');

          laborDetailHtml = `
            <div class="item-labor-box">
              <div class="item-labor-header">
                <span>👷 <strong>Penggunaan Tenaga Kerja (${window.CurrencyUtil.formatNumber(laborInfo.totalLaborQty, 2)} OH):</strong></span>
                <span class="badge badge-success" style="font-size: 11px;">
                  Total Upah: ${window.CurrencyUtil.formatRupiah(laborInfo.totalLaborCost, false, true)} (${laborInfo.laborPercentOfItem.toFixed(1)}% dari item)
                </span>
              </div>
              <div class="item-labor-chips">
                ${chipsHtml}
              </div>
            </div>
          `;
        }

        // 1. Desktop Table Row
        itemsHtml += `
          <tr>
            <td class="text-center" style="width: 4%;">${idx + 1}</td>
            <td style="width: 38%;">
              <strong>${itm.name}</strong>
              ${itm.notes ? `<div class="text-muted" style="font-size: 11px;">${itm.notes}</div>` : ''}
              ${laborDetailHtml}
            </td>
            <td class="text-center" style="width: 9%;"><span class="badge badge-light">${itm.code}</span></td>
            <td class="text-right font-bold" style="width: 8%;">${window.CurrencyUtil.formatNumber(itm.volume, 2)}</td>
            <td class="text-center" style="width: 6%;">${itm.unit}</td>
            <td class="text-right" style="width: 17%; white-space: nowrap;">${window.CurrencyUtil.formatRupiah(itm.price, false, true)}</td>
            <td class="text-right font-bold" style="width: 18%; white-space: nowrap;">${window.CurrencyUtil.formatRupiah(itm.total, false, true)}</td>
            <td class="text-center no-print" style="white-space: nowrap;">
              <button class="btn btn-sm btn-outline" style="padding: 2px 7px; margin-right: 3px;" title="Ubah Item Pekerjaan" onclick="App.openEditRabItemModal('${div.id}', '${itm.id}')">✏️</button>
              <button class="btn btn-sm btn-outline text-danger" style="padding: 2px 7px;" title="Hapus Item" onclick="App.deleteRabItem('${itm.id}')">✕</button>
            </td>
          </tr>
        `;

        // 2. Mobile Responsive Touch Card (Zero Horizontal Scroll, Focused on Core Data)
        mobileCardsHtml += `
          <div class="rab-mobile-item-card" id="mob-item-${itm.id}">
            <div class="rab-mobile-card-top">
              <div class="d-flex align-items-center gap-1">
                <span class="rab-mobile-item-no">#${idx + 1}</span>
                <span class="badge badge-secondary font-mono" style="font-size: 11px;">${itm.code}</span>
              </div>
              <div class="rab-mobile-card-total font-bold">
                ${window.CurrencyUtil.formatRupiah(itm.total, false, true)}
              </div>
            </div>
            
            <div class="rab-mobile-card-name">
              ${itm.name}
            </div>

            ${itm.notes ? `<div class="rab-mobile-card-notes"><span class="text-muted">Catatan:</span> ${itm.notes}</div>` : ''}

            <div class="rab-mobile-card-calc-row">
              <div>
                <span class="calc-label">Volume:</span>
                <span class="calc-val font-bold"> ${window.CurrencyUtil.formatNumber(itm.volume, 2)} ${itm.unit}</span>
              </div>
              <div class="text-right">
                <span class="calc-label">Harga Satuan:</span>
                <span class="calc-val font-bold"> ${window.CurrencyUtil.formatRupiah(itm.price, false, true)}</span>
              </div>
            </div>

            <div class="rab-mobile-card-actions no-print">
              <button type="button" class="btn btn-sm btn-outline flex-1 d-flex align-items-center justify-content-center gap-1" onclick="App.openEditRabItemModal('${div.id}', '${itm.id}')">
                <span>✏️</span> <span>Ubah</span>
              </button>
              <button type="button" class="btn btn-sm btn-outline text-danger d-flex align-items-center justify-content-center" style="min-width: 44px;" onclick="App.confirmDeleteRabItem('${div.id}', '${itm.id}')" title="Hapus Item">
                <span>🗑️</span>
              </button>
            </div>
          </div>
        `;
      });

      totalProjectLaborCost += divLaborCost;
      totalProjectLaborQty += divLaborQty;

      // Pastikan tampilan biaya tenaga tidak melebihi subtotal divisi (sanity cap)
      const divSubtotal = Number(div.subtotal) || 0;
      const cappedLaborCost = (divSubtotal > 0 && divLaborCost > divSubtotal) ? divSubtotal : divLaborCost;
      const laborPctOfDiv = divSubtotal > 0 ? ((cappedLaborCost / divSubtotal) * 100).toFixed(1) : '0.0';

      divisionsHtml += `
        <div class="card mb-4" id="div-card-${div.id}">
          <div class="card-header" style="background-color: #f8fafc;">
            <div class="card-title">
              <span>DIVISI ${div.code}. ${div.name}</span>
            </div>
            <div class="card-actions no-print d-flex align-items-center flex-wrap" style="gap: 8px;">
              <span class="badge badge-light mr-2" style="font-size: 12px; font-weight: 600; padding: 5px 10px;">
                👷 Tenaga Divisi: ${window.CurrencyUtil.formatNumber(divLaborQty, 2)} OH (${window.CurrencyUtil.formatRupiah(cappedLaborCost, false, true)}) <span style="font-size:10px;font-weight:400;color:#64748b;">${laborPctOfDiv}% dari subtotal</span>
              </span>
              <span class="mr-2 font-bold" style="font-size: 13px;">Subtotal: ${window.CurrencyUtil.formatRupiah(divSubtotal, false, true)}</span>
              <button class="btn btn-sm btn-primary" onclick="App.openAddItemModal('${div.id}')" title="Tambah baris item pekerjaan pada divisi ini">+ Tambah Item</button>
              <button class="btn btn-sm btn-outline" onclick="App.openEditDivisionModal('${div.id}')" title="Ubah nomor kode atau nama divisi ini">✏️ Edit Divisi</button>
              <button class="btn btn-sm btn-danger" onclick="App.deleteDivision('${div.id}')" title="Hapus divisi beserta seluruh itemnya">🗑️ Hapus Divisi</button>
            </div>
          </div>
          <div class="card-body p-0">
            <!-- Desktop Table View -->
            <div class="table-responsive d-desktop-only" style="margin-bottom: 0;">
              <table class="table">
                <thead>
                  <tr class="division-header-row">
                    <th colspan="7" class="division-title-cell">
                      DIVISI ${div.code}. ${div.name.toUpperCase()}
                    </th>
                  </tr>
                  <tr>
                    <th style="width: 4%; text-align: center;">No</th>
                    <th style="width: 38%; text-align: left;">Uraian Pekerjaan &amp; Rincian Tenaga</th>
                    <th style="width: 9%; text-align: center;">Kode AHSP</th>
                    <th style="width: 8%; text-align: right;">Volume</th>
                    <th style="width: 6%; text-align: center;">Satuan</th>
                    <th style="width: 17%; text-align: right;">Harga Satuan (Rp)</th>
                    <th style="width: 18%; text-align: right;">Jumlah Harga (Rp)</th>
                    <th style="width: 5%" class="no-print">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml || '<tr><td colspan="8" class="text-center text-muted p-3">Belum ada item pada divisi ini.</td></tr>'}
                  <tr class="division-subtotal-row" style="background-color: #f8fafc; font-weight: 700; border-top: 1.5px solid #cbd5e1;">
                    <td colspan="5" style="text-align: right; font-size: 8.5pt; padding: 5px 8px;">Subtotal Divisi ${div.code}:</td>
                    <td colspan="2" style="text-align: right; font-weight: 800; color: #0f172a; font-size: 9.5pt; padding: 5px 8px; white-space: nowrap;">${window.CurrencyUtil.formatRupiah(div.subtotal || 0, false, true)}</td>
                    <td class="no-print"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile Touch Cards View (Zero Horizontal Scroll!) -->
            <div class="d-mobile-only p-3">
              ${mobileCardsHtml || '<div class="text-center text-muted p-3 bg-light rounded">Belum ada item pada divisi ini.</div>'}
              <div class="rab-mobile-div-footer-card">
                <span class="font-bold text-muted">Subtotal Divisi ${div.code}:</span>
                <span class="font-black text-emerald" style="font-size: 15px;">${window.CurrencyUtil.formatRupiah(div.subtotal || 0, false, true)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    const rabCalc = window.RabCalculator ? window.RabCalculator.calculateProjectRab(proj) : null;
    const activeRealCost = (rabCalc && typeof rabCalc.realCost === 'number' && !isNaN(rabCalc.realCost) && rabCalc.realCost > 0)
      ? rabCalc.realCost
      : (proj.divisions || []).reduce((acc, d) => acc + (Number(d.subtotal) || 0), 0);
    const realCost = activeRealCost > 0 ? activeRealCost : 1;

    const isPpnIncluded = proj.includePpn !== false && proj.includeTax !== false;
    const activePpnRate = (rabCalc && typeof rabCalc.ppnRate === 'number' && !isNaN(rabCalc.ppnRate))
      ? rabCalc.ppnRate
      : ((proj.ppnRate !== undefined && proj.ppnRate !== null && !isNaN(Number(proj.ppnRate))) ? Number(proj.ppnRate) : 0);

    const activePpnAmount = isPpnIncluded
      ? ((rabCalc && typeof rabCalc.ppnAmount === 'number' && !isNaN(rabCalc.ppnAmount) && rabCalc.ppnAmount > 0)
          ? rabCalc.ppnAmount
          : Math.round(activeRealCost * (activePpnRate / 100)))
      : 0;

    const activeGrandTotal = (rabCalc && typeof rabCalc.grandTotal === 'number' && !isNaN(rabCalc.grandTotal) && rabCalc.grandTotal > 0)
      ? rabCalc.grandTotal
      : Math.round(activeRealCost + activePpnAmount);

    const durDays = proj.durationDays || 180;
    const durWeeks = Math.ceil(durDays / 7);
    container.innerHTML = `
      <div class="print-only">
        ${window.PrintEngine.createPrintHeader(proj, "RINCIAN DETAIL RENCANA ANGGARAN BIAYA", { totalLaborQty: totalProjectLaborQty, totalLaborCost: totalProjectLaborCost })}
      </div>
      <div class="page-header no-print">
        <div>
          <h2 class="page-header-title">📑 Rincian Detail Rencana Anggaran Biaya</h2>
          <div class="page-header-sub">Daftar uraian pekerjaan, koefisien volume, harga satuan pekerjaan, subtotal per divisi, dan rincian penggunaan tenaga</div>
        </div>
        <div class="page-header-actions d-flex align-items-center flex-wrap" style="gap: 8px;">
          <button class="btn ${showLaborDetailInRab ? 'btn-outline' : 'btn-secondary'}" onclick="App.toggleLaborDetailInRab()">
            👷 ${showLaborDetailInRab ? 'Sembunyikan' : 'Tampilkan'} Rincian Tenaga
          </button>
          <button class="btn btn-primary" onclick="App.openAddDivisionModal()" title="Tambah kelompok divisi pekerjaan baru">+ Tambah Divisi Baru</button>
          <button class="btn btn-primary" onclick="App.openAddItemModal()" title="Tambah item pekerjaan terintegrasi AHSP">+ Tambah Item Pekerjaan</button>
          <button class="btn btn-outline font-bold" onclick="App.printCurrentPage('panel-detail-rab', 'Rincian_Detail_RAB')">🖨️ Cetak / Preview A4</button>
        </div>
      </div>

      <!-- Ringkasan Eksekutif Informasi Proyek, Durasi & Total Tenaga Kerja (no-print: mencegah duplikasi dengan Kop Cetak) -->
      <div class="card p-3 mb-4 bg-white no-print" style="border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px;">
            <div class="text-muted" style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569;">📍 IDENTITAS & LOKASI PROYEK</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 3px;">${proj.name}</div>
            <div class="text-muted" style="font-size: 12px; margin-top: 3px;">Lokasi: <strong>${proj.location}</strong> &bull; Pemilik: <strong>${proj.owner}</strong></div>
            <div style="font-size: 11.5px; color: #2563eb; margin-top: 4px; font-weight: 600;">
              🏛️ Acuan: SE PUPR No. 47/2026 (${proj.regionName || 'Bandung Raya'})
            </div>
          </div>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px 14px;">
            <div class="text-muted" style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #1e40af;">⏱️ JADWAL & DURASI PELAKSANAAN</div>
            <div style="font-size: 14px; font-weight: 800; color: #1e40af; margin-top: 3px;">
              ${durDays} Hari Kalender (${durWeeks} Minggu)
            </div>
            <div style="font-size: 12px; color: #334155; margin-top: 3px;">
              Mulai: <strong>${proj.startDate || '2026-04-01'}</strong> s.d. Selesai: <strong>${proj.finishDate || '2026-09-27'}</strong>
            </div>
            <div style="font-size: 11.5px; color: #059669; margin-top: 4px; font-weight: 600;">
              🏁 Target Realisasi: 100.00% Sesuai Kalender
            </div>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px 14px;">
            <div class="text-muted" style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #166534;">👷 KEBUTUHAN TENAGA KERJA</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 3px;">
              Total: <span style="color: #166534;">${window.CurrencyUtil.formatNumber(totalProjectLaborQty, 1)} OH</span>
              <span class="badge badge-success ml-1" style="font-size: 11px;">~${(totalProjectLaborQty / durDays).toFixed(1)} Org/Hari</span>
            </div>
            <div style="font-size: 12px; color: #334155; margin-top: 3px;">
              Alokasi Upah: <strong>${window.CurrencyUtil.formatRupiah(totalProjectLaborCost, false, true)}</strong>
              <span class="text-muted">(${((totalProjectLaborCost / realCost) * 100).toFixed(1)}% Real Cost)</span>
            </div>
            <div style="font-size: 11.5px; color: #475569; margin-top: 4px;">
              💼 Mandor, Kepala Tukang, Tukang & Pekerja Lapangan
            </div>
          </div>
        </div>
      </div>

      ${divisionsHtml}

      <!-- Ringkasan Grand Total & Pengesahan Cetak Detail RAB (Print Only) -->
      <div class="print-only" style="margin-top: 15px; page-break-inside: avoid; break-inside: avoid;">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
          <table style="width: 400px; font-size: 9pt; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 8px; color: #475569;">Total Biaya Fisik Konstruksi (Real Cost):</td>
              <td style="padding: 5px 8px; text-align: right; font-weight: 700; white-space: nowrap;">${window.CurrencyUtil.formatRupiah(activeRealCost, false, true)}</td>
            </tr>
            ${isPpnIncluded ? `
            <tr>
              <td style="padding: 5px 8px; color: #475569;">PPN ${activePpnRate}%:</td>
              <td style="padding: 5px 8px; text-align: right; font-weight: 600; white-space: nowrap;">${window.CurrencyUtil.formatRupiah(activePpnAmount, false, true)}</td>
            </tr>
            ` : ''}
            <tr style="border-top: 2px solid #0f172a; background-color: #f1f5f9;">
              <td style="padding: 7px 8px; font-weight: 800; color: #0f172a; font-size: 9.5pt;">TOTAL AKHIR RAB:</td>
              <td style="padding: 7px 8px; text-align: right; font-weight: 800; color: #2563eb; font-size: 11pt; white-space: nowrap;">${window.CurrencyUtil.formatRupiah(activeGrandTotal, false, true)}</td>
            </tr>
          </table>
        </div>

        <!-- Lembar Pengesahan Tiga Pihak (Bebas Titik-Titik & Sejajar 3 Kolom Horizontal) -->
        <table class="signature-clean-table" style="width: 100% !important; border-collapse: collapse !important; border: none !important; background: transparent !important; margin-top: 24pt !important; page-break-inside: avoid !important; break-inside: avoid !important;">
          <tr style="border: none !important; background: transparent !important;">
            <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 10px !important; background: transparent !important;">
              <div class="sig-title" style="font-weight: 800; font-size: 9pt; color: #1e293b; margin-bottom: 4px;">PEMBERI TUGAS / OWNER</div>
              <div style="font-size: 8pt; color: #64748b; min-height: 16px;">Menyetujui &amp; Menetapkan:</div>
              <div class="sig-space" style="height: 42px;"></div>
              <div class="sig-name" style="font-weight: 700; font-size: 9pt; color: #0f172a; text-decoration: none !important; border-bottom: none !important;">( ${sigOwnerName} )</div>
              <div class="sig-role" style="font-size: 8pt; color: #334155; margin-top: 3px;">${sigOwnerTitle}</div>
            </td>
            <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 10px !important; background: transparent !important;">
              <div class="sig-title" style="font-weight: 800; font-size: 9pt; color: #1e293b; margin-bottom: 4px;">KONSULTAN PERENCANA</div>
              <div style="font-size: 8pt; color: #64748b; min-height: 16px;">Direncanakan:</div>
              <div class="sig-space" style="height: 42px;"></div>
              <div class="sig-name" style="font-weight: 700; font-size: 9pt; color: #0f172a; text-decoration: none !important; border-bottom: none !important;">( ${sigConsultantName} )</div>
              <div class="sig-role" style="font-size: 8pt; color: #334155; margin-top: 3px;">${sigConsultantTitle}</div>
            </td>
            <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 10px !important; background: transparent !important;">
              <div class="sig-title" style="font-weight: 800; font-size: 9pt; color: #1e293b; margin-bottom: 4px;">KONTRAKTOR PELAKSANA</div>
              <div style="font-size: 8pt; color: #64748b; min-height: 16px;">Diajukan:</div>
              <div class="sig-space" style="height: 42px;"></div>
              <div class="sig-name" style="font-weight: 700; font-size: 9pt; color: #0f172a; text-decoration: none !important; border-bottom: none !important;">( ${sigContractorName} )</div>
              <div class="sig-role" style="font-size: 8pt; color: #334155; margin-top: 3px;">${sigContractorTitle}</div>
            </td>
          </tr>
        </table>
      </div>

    `;
  }

    // 3. Analisis Volume View (Direct Volume Input Sheet)
  function renderVolumeView() {
    const container = document.getElementById("volumeContent");
    if (!container) return;

    window.VolumeAnalysis.syncWithRabItems();
    const calculations = window.VolumeAnalysis.getVolumeCalculations();
    const proj = window.ProjectManager.getActiveProject();

    const groupedByDiv = {};
    calculations.forEach(c => {
      const divName = c.divisionName || "Pekerjaan Lainnya";
      if (!groupedByDiv[divName]) groupedByDiv[divName] = [];
      groupedByDiv[divName].push(c);
    });

    let totalItems = calculations.length;
    let tableRowsHtml = "";
    let globalIdx = 1;

    Object.keys(groupedByDiv).forEach(divName => {
      tableRowsHtml += `
        <tr style="background-color: #f8fafc; font-weight: 700; border-top: 2px solid #e2e8f0;">
          <td colspan="5" style="padding: 8px 12px; color: var(--color-primary);">
            📁 ${divName}
          </td>
        </tr>
      `;

      groupedByDiv[divName].forEach(c => {
        tableRowsHtml += `
          <tr>
            <td class="text-center" style="width: 5%">${globalIdx++}</td>
            <td style="width: 12%" class="text-center">
              <span class="badge badge-light font-bold">${c.itemCode || '-'}</span>
            </td>
            <td style="width: 63%">
              <strong>${c.itemName}</strong>
            </td>
            <td style="width: 8%" class="text-center font-bold">${c.unit}</td>
            <td style="width: 12%" class="text-right">
              <input type="number" step="any" min="0" class="vol-input-clean" 
                     value="${c.totalVolume}" 
                     onchange="App.handleVolumeChange('${c.itemId}', this.value)"
                     title="Ketik volume hasil perhitungan mandiri (live sync ke RAB)">
            </td>
          </tr>
        `;
      });
    });
    container.innerHTML = `
      <div class="print-only">
        ${window.PrintEngine.createPrintHeader(proj, "DAFTAR ANALISIS VOLUME PEKERJAAN")}
      </div>

      <div class="card mb-4 no-print" style="border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
        <div class="card-body" style="padding: 12px 18px;">
          <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 4px;">
            ℹ️ Penginputan Volume Mandiri Langsung (Direct Volume Input)
          </div>
          <div style="font-size: 12px; color: var(--color-text-secondary); line-height: 1.5;">
            Volume pekerjaan diisi langsung berdasarkan hasil perhitungan mandiri di luar aplikasi (CAD, BIM, atau hitungan detail terukur). Nilai volume yang Anda ketik pada tabel di bawah ini akan <strong>secara otomatis tersinkronisasi langsung ke lembar RAB, Rekapitulasi, Agregasi Bahan/Upah, dan Kurva S</strong> tanpa perlu dimensi kaku.
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>Daftar Volume Pekerjaan Proyek</span>
            <span class="badge badge-light">${totalItems} Item Pekerjaan</span>
          </div>
          <div class="card-actions no-print">
            <button class="btn btn-outline" onclick="window.PrintEngine.printDocument('panel-volume', 'Analisis_Volume_RAB')">Cetak A4 PDF</button>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 5%">No</th>
                  <th style="width: 12%">Kode AHSP</th>
                  <th style="width: 63%">Uraian Pekerjaan</th>
                  <th style="width: 8%" class="th-nowrap">Satuan</th>
                  <th style="width: 12%">Volume Pekerjaan</th>
                </tr>
              </thead>
              <tbody>
                ${tableRowsHtml || '<tr><td colspan="5" class="text-center text-muted p-4">Belum ada item pekerjaan di RAB.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>


    `;
  }


  // 4. AHSP 2026 Helper Functions
  function generateAhspRows(items, offset) {
    let itemsHtml = "";
    items.forEach((item, idx) => {
      const isEdited = item.is_edited;
      const isCustom = item.is_custom;

      let badgeHtml = "";
      if (isEdited) {
        const revCode = item.revisionCode || 'REV-1';
        badgeHtml = `<span class="badge badge-warning ml-2" style="background: #fef3c7; color: #b45309; border: 1px solid #fde68a; font-weight: 700;">Revisi: ${revCode}</span>`;
      } else if (isCustom) {
        badgeHtml = `<span class="badge badge-success ml-2">AHSP Custom</span>`;
      }

      itemsHtml += `
        <tr>
          <td class="text-center">${offset + idx + 1}</td>
          <td>
            <strong>${item.name}</strong> ${badgeHtml}
            <div class="text-muted" style="font-size: 11px; margin-top: 2px;">
              ${item.bidang ? `<span class="badge ${item.bidang === 'SMKK' ? 'badge-danger' : (item.bidang === 'Bina Marga' ? 'badge-warning' : (item.bidang === 'Sumber Daya Air' ? 'badge-info' : 'badge-primary'))}" style="font-size: 9px; padding: 1px 6px; margin-right: 4px; font-weight: 700;">${item.bidang}</span>` : ''}
              Kategori: <strong>${item.category || item.sub_kategori || item.divisi}</strong> | ${item.components ? item.components.length : 0} Komponen
            </div>
          </td>
          <td class="text-center"><span class="badge badge-light" style="font-family: var(--font-mono);">${item.code}</span></td>
          <td class="text-center">${item.unit}</td>
          <td class="text-right font-bold" style="font-size: 13px;">${window.CurrencyUtil.formatRupiah(item.hsp, false, true)}</td>
          <td class="text-center no-print">
            <button class="btn btn-sm btn-primary" onclick="App.openAhspDetailModal('${item.id}')">Rincian & Edit</button>
            ${isEdited ? `<button class="btn btn-sm btn-outline" title="Pulihkan data orisinal sebelum revisi" style="border-color: #f59e0b; color: #b45309; font-weight: 600;" onclick="App.handleRestoreSingleAhsp('${item.id}')">↺ Pulihkan Orisinal</button>` : ''}
            ${isCustom ? `<button class="btn btn-sm btn-danger" title="Hapus Custom AHSP" onclick="App.deleteAhsp('${item.id}')">Hapus</button>` : ''}
          </td>
        </tr>
      `;
    });
    return itemsHtml;
  }

  function generateAhspPaginationButtons(current, total) {
    let pageNumbersHtml = "";
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(total, startPage + maxVisibleButtons - 1);
    if (endPage - startPage < maxVisibleButtons - 1) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    for (let p = startPage; p <= endPage; p++) {
      pageNumbersHtml += `
        <button class="btn btn-sm ${p === current ? 'btn-primary' : 'btn-outline'}" 
                style="min-width: 32px; padding: 4px 8px;"
                onclick="App.changeAhspPage(${p})">${p}</button>
      `;
    }
    return pageNumbersHtml;
  }

  function renderAhspPaginationInner(offset, pageSize, total, current, totalPages, pageButtons) {
    return `
      <div class="text-muted">
        Menampilkan <strong>${total > 0 ? offset + 1 : 0}</strong> - <strong>${Math.min(offset + pageSize, total)}</strong> dari <strong>${total}</strong> Analisis AHSP
      </div>
      
      <div class="d-flex align-items-center" style="gap: 8px;">
        <span class="text-muted" style="font-size: 12px;">Tampilkan:</span>
        <select class="form-control" style="width: auto; padding: 4px 8px; font-size: 12px;" onchange="App.changeAhspPageSize(this.value)">
          <option value="25" ${pageSize === 25 ? 'selected' : ''}>25 per halaman</option>
          <option value="50" ${pageSize === 50 ? 'selected' : ''}>50 per halaman</option>
          <option value="100" ${pageSize === 100 ? 'selected' : ''}>100 per halaman</option>
          <option value="250" ${pageSize === 250 ? 'selected' : ''}>250 per halaman</option>
          <option value="9999" ${pageSize >= 2000 ? 'selected' : ''}>Semua (${(window.MASTER_AHSP || []).length || 2531} AHSP)</option>
        </select>
      </div>

      <div class="pagination-nav d-flex align-items-center" style="gap: 4px;">
        <button class="btn btn-sm btn-outline" ${current <= 1 ? 'disabled' : ''} onclick="App.changeAhspPage(1)" title="Halaman Pertama">««</button>
        <button class="btn btn-sm btn-outline" ${current <= 1 ? 'disabled' : ''} onclick="App.changeAhspPage(${current - 1})" title="Halaman Sebelumnya">‹ Prev</button>
        <span class="pagination-info" style="font-size: 13px; font-weight: 500; padding: 0 8px;">
          Hal ${current} dari ${totalPages} (${total.toLocaleString('id-ID')} item)
        </span>
        <button class="btn btn-sm btn-outline" ${current >= totalPages ? 'disabled' : ''} onclick="App.changeAhspPage(${current + 1})" title="Halaman Berikutnya">Next ›</button>
        <button class="btn btn-sm btn-outline" ${current >= totalPages ? 'disabled' : ''} onclick="App.changeAhspPage(${totalPages})" title="Halaman Terakhir">»»</button>
      </div>
    `;
  }

  function renderAhspTableOnly() {
    const tbody = document.getElementById("ahspTableBody");
    const pagContainer = document.getElementById("ahspPaginationContainer");
    if (!tbody || !pagContainer) {
      renderAhspView();
      const inp = document.getElementById("ahspSearchInput");
      if (inp) {
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
      return;
    }

    const offset = (currentAhspPage - 1) * ahspPageSize;
    const ahspData = window.AhspEngine.getFilteredAhsp(ahspPageSize, offset);
    const totalPages = Math.max(1, Math.ceil(ahspData.total / ahspPageSize));

    const totalBadge = document.getElementById("ahspTotalBadge");
    if (totalBadge) totalBadge.textContent = `Total: ${ahspData.total} Item`;

    tbody.innerHTML = generateAhspRows(ahspData.items, offset) || '<tr><td colspan="6" class="text-center text-muted p-4">Tidak ada data AHSP yang cocok dengan pencarian.</td></tr>';
    const pageButtons = generateAhspPaginationButtons(currentAhspPage, totalPages);
    pagContainer.innerHTML = renderAhspPaginationInner(offset, ahspPageSize, ahspData.total, currentAhspPage, totalPages, pageButtons);
  }

  // 4. AHSP 2026 View
  function renderAhspView() {
    const container = document.getElementById("ahspContent");
    if (!container) return;

    const bidangs = (window.AhspEngine && window.AhspEngine.getBidangs) ? window.AhspEngine.getBidangs() : [];
    const activeBidang = (window.AhspEngine && window.AhspEngine.getBidang) ? window.AhspEngine.getBidang() : "ALL";
    const categories = window.AhspEngine.getCategories();
    const onlyUsed = window.AhspEngine.getOnlyUsedFilter();
    const activeCat = window.AhspEngine.getCategory() || "ALL";
    const searchVal = window.AhspEngine.getSearch() || "";
    
    // Hitung offset dan ambil data halaman aktif
    const offset = (currentAhspPage - 1) * ahspPageSize;
    const ahspData = window.AhspEngine.getFilteredAhsp(ahspPageSize, offset);
    const totalPages = Math.max(1, Math.ceil(ahspData.total / ahspPageSize));

    if (currentAhspPage > totalPages) {
      currentAhspPage = totalPages;
    }

    let bidangOptions = `<option value="ALL" ${activeBidang === "ALL" ? 'selected' : ''}>Semua Bidang (4 Bidang PU)</option>`;
    bidangs.forEach(b => {
      bidangOptions += `<option value="${b}" ${b === activeBidang ? 'selected' : ''}>Bidang: ${b}</option>`;
    });

    let catOptions = `<option value="ALL" ${activeCat === "ALL" ? 'selected' : ''}>Semua Kategori / Divisi</option>`;
    categories.forEach(c => {
      catOptions += `<option value="${c}" ${c === activeCat ? 'selected' : ''}>${c}</option>`;
    });

    let itemsHtml = generateAhspRows(ahspData.items, offset);
    let pageNumbersHtml = generateAhspPaginationButtons(currentAhspPage, totalPages);

    container.innerHTML = `
      <div class="page-header no-print">
        <div>
          <h2 class="page-header-title">
            📚 Daftar AHSP 2026 (SE Bina Konstruksi No. 47/2026)
            <span class="badge badge-light" id="ahspTotalBadge" style="font-size: 11px;">Total: ${ahspData.total} Item</span>
          </h2>
          <div class="page-header-sub">Katalog master analisa harga satuan terpadu: Cipta Karya, Bina Marga, SDA, dan SMKK</div>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline" onclick="App.printUsedAhsp()" title="Cetak seluruh analisa AHSP yang digunakan dalam RAB aktif">
            <span style="margin-right: 4px;">🖨️</span> Cetak AHSP Terpakai
          </button>
          <button class="btn btn-outline" onclick="App.printAllAhsp()" title="Cetak seluruh master AHSP SE Bina Konstruksi / Permen PUPR No. 8/2023 tanpa kecuali">
            <span style="margin-right: 4px;">📑</span> Cetak Seluruh AHSP Lengkap
          </button>
          <button class="btn btn-primary" onclick="App.openCreateCustomAhspModal()">+ Buat AHSP Custom</button>
          <button class="btn btn-outline" onclick="window.AhspEngine.exportAhspJson()">Export JSON</button>
          <button class="btn btn-outline" onclick="document.getElementById('importAhspInput').click()">Import JSON</button>
          <input type="file" id="importAhspInput" style="display: none" accept=".json" onchange="App.handleImportAhsp(this)">
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>Tabel Analisis Harga Satuan Pekerjaan (Multi-Bidang)</span>
          </div>
          <div class="card-actions no-print"></div>
        </div>
        <div class="card-body">
          <!-- Filter Bar -->
          <div class="filter-bar no-print" style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <input type="text" id="ahspSearchInput" class="search-input" placeholder="Cari nama, kode, bidang, divisi, atau tag..." value="${searchVal}" oninput="App.handleAhspSearch(this.value)" style="min-width: 240px; flex: 1;">
            <select class="select-filter" id="ahspBidangSelect" onchange="App.handleAhspBidang(this.value)" style="min-width: 170px;">
              ${bidangOptions}
            </select>
            <select class="select-filter" id="ahspCategorySelect" onchange="App.handleAhspCategory(this.value)" style="min-width: 200px;">
              ${catOptions}
            </select>
            <button class="btn ${onlyUsed ? 'btn-accent' : 'btn-outline'}" onclick="App.toggleOnlyUsedAhsp()">
              ${onlyUsed ? '✓ Menampilkan AHSP Terpakai Saja' : 'Tampilkan Hanya AHSP Terpakai'}
            </button>
          </div>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 5%">No</th>
                  <th style="width: 45%">Uraian Analisis Harga Satuan Pekerjaan</th>
                  <th style="width: 12%">Kode AHSP</th>
                  <th style="width: 8%">Satuan</th>
                  <th style="width: 16%">HSP Satuan (Rp)</th>
                  <th style="width: 14%" class="no-print">Aksi</th>
                </tr>
              </thead>
              <tbody id="ahspTableBody">
                ${itemsHtml || '<tr><td colspan="6" class="text-center text-muted p-4">Tidak ada data AHSP yang cocok dengan pencarian.</td></tr>'}
              </tbody>
            </table>
          </div>

          <!-- Bar Navigasi Paginasi Lengkap (Beralih Halaman Data) -->
          <div id="ahspPaginationContainer" class="pagination-container no-print d-flex justify-content-between align-items-center mt-3 pt-3" style="border-top: 1px solid var(--color-border); font-size: 13px; flex-wrap: wrap; gap: 10px;">
            ${renderAhspPaginationInner(offset, ahspPageSize, ahspData.total, currentAhspPage, totalPages, pageNumbersHtml)}
          </div>
        </div>
      </div>
    `;
  }

  // 5. Katalog Upah, Bahan, dan Alat Helper Functions
  function generateKatalogRows(items, offset) {
    let itemsHtml = "";
    items.forEach((item, idx) => {
      const effPrice = window.CatalogPricing.getEffectivePrice(item);
      const usedText = item.usedInAhsp && item.usedInAhsp.length > 0
        ? `<div class="text-muted" style="font-size: 10px; margin-top: 2px;">Dipakai pada: <em>${item.usedInAhsp.slice(0, 2).join(', ')}${item.usedInAhsp.length > 2 ? ` (+${item.usedInAhsp.length - 2} lainnya)` : ''}</em></div>`
        : '';
      const catBadge = (item.category || "").includes('Upah') 
        ? '<span class="badge badge-primary" style="font-size: 10px; margin-left: 6px;">Upah Tenaga</span>'
        : ((item.category || "").includes('Alat') 
          ? '<span class="badge badge-warning" style="font-size: 10px; margin-left: 6px;">Sewa Alat</span>'
          : '<span class="badge badge-success" style="font-size: 10px; margin-left: 6px;">Material Bahan</span>');

      itemsHtml += `
        <tr>
          <td class="text-center">${offset + idx + 1}</td>
          <td>
            <div class="d-flex align-items-center flex-wrap" style="gap: 4px;">
              <strong>${item.name}</strong>
              ${catBadge}
            </div>
            ${usedText}
          </td>
          <td class="text-center"><span class="badge badge-light" style="font-family: var(--font-mono);">${item.code || '-'}</span></td>
          <td class="text-center">${item.unit}</td>
          <td class="text-right font-bold">${window.CurrencyUtil.formatRupiah(effPrice, false, true)}</td>
          <td class="text-center no-print">
            <button class="btn btn-sm btn-outline" onclick="App.openEditMaterialPriceModal('${item.id}', '${item.name.replace(/'/g, "\\'")}', ${effPrice})">Ubah Harga</button>
          </td>
        </tr>
      `;
    });
    return itemsHtml;
  }

  function generateKatalogPaginationButtons(current, total) {
    let pageNumbersHtml = "";
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(total, startPage + maxVisibleButtons - 1);
    if (endPage - startPage < maxVisibleButtons - 1) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    for (let p = startPage; p <= endPage; p++) {
      pageNumbersHtml += `
        <button class="btn btn-sm ${p === current ? 'btn-primary' : 'btn-outline'}" 
                style="min-width: 32px; padding: 4px 8px;"
                onclick="App.changeKatalogPage(${p})">${p}</button>
      `;
    }
    return pageNumbersHtml;
  }

  function renderKatalogPaginationInner(offset, pageSize, total, current, totalPages, pageButtons) {
    return `
      <div class="text-muted">
        Menampilkan <strong>${total > 0 ? offset + 1 : 0}</strong> - <strong>${Math.min(offset + pageSize, total)}</strong> dari <strong>${total}</strong> Upah, Bahan & Alat Terpakai
      </div>
      
      <div class="d-flex align-items-center" style="gap: 8px;">
        <span class="text-muted" style="font-size: 12px;">Tampilkan:</span>
        <select class="form-control" style="width: auto; padding: 4px 8px; font-size: 12px;" onchange="App.changeKatalogPageSize(this.value)">
          <option value="25" ${pageSize === 25 ? 'selected' : ''}>25 per halaman</option>
          <option value="50" ${pageSize === 50 ? 'selected' : ''}>50 per halaman</option>
          <option value="100" ${pageSize === 100 ? 'selected' : ''}>100 per halaman</option>
          <option value="250" ${pageSize === 250 ? 'selected' : ''}>250 per halaman</option>
        </select>
      </div>

      <div class="pagination-nav d-flex align-items-center" style="gap: 4px;">
        <button class="btn btn-sm btn-outline" ${current <= 1 ? 'disabled' : ''} onclick="App.changeKatalogPage(1)" title="Halaman Pertama">««</button>
        <button class="btn btn-sm btn-outline" ${current <= 1 ? 'disabled' : ''} onclick="App.changeKatalogPage(${current - 1})" title="Halaman Sebelumnya">‹ Prev</button>
        ${pageButtons}
        <button class="btn btn-sm btn-outline" ${current >= totalPages ? 'disabled' : ''} onclick="App.changeKatalogPage(${current + 1})" title="Halaman Berikutnya">Next ›</button>
        <button class="btn btn-sm btn-outline" ${current >= totalPages ? 'disabled' : ''} onclick="App.changeKatalogPage(${totalPages})" title="Halaman Terakhir">»»</button>
      </div>
    `;
  }

  function renderKatalogTableOnly() {
    const tableBody = document.getElementById("katalogTableBody");
    const totalBadge = document.getElementById("katalogTotalBadge");
    const pagContainer = document.getElementById("katalogPaginationContainer");
    if (!tableBody) {
      renderKatalogView();
      return;
    }

    const isUsed = (katalogFilterMode === 'used');
    const offset = (currentKatalogPage - 1) * katalogPageSize;
    const result = window.CatalogPricing.getFilteredMaterials(katalogPageSize, offset, isUsed);
    const totalPages = Math.max(1, Math.ceil(result.total / katalogPageSize));

    if (currentKatalogPage > totalPages) {
      currentKatalogPage = totalPages;
    }

    let itemsHtml = generateKatalogRows(result.items, offset);
    let pageButtons = generateKatalogPaginationButtons(currentKatalogPage, totalPages);

    tableBody.innerHTML = itemsHtml || `
      <tr>
        <td colspan="6" class="text-center p-4">
          <div style="font-size: 24px; margin-bottom: 8px;">📋</div>
          <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px;">${isUsed ? 'Belum Ada Item Pekerjaan AHSP yang Digunakan' : 'Data Katalog Tidak Ditemukan'}</div>
          <div class="text-muted" style="font-size: 12px; max-width: 480px; margin: 0 auto 12px auto;">
            ${isUsed 
              ? 'Menu ini memfilter data harga satuan upah, material, dan peralatan dari item pekerjaan AHSP yang dipakai dalam RAB proyek aktif.' 
              : 'Tidak ada data material atau upah dalam katalog yang sesuai filter pencarian.'}
          </div>
          ${isUsed ? '<button class="btn btn-sm btn-primary" onclick="App.switchTab(\'detail-rab\')">Buka Detail RAB & Tambah Item</button>' : ''}
        </td>
      </tr>
    `;
    if (totalBadge) totalBadge.textContent = isUsed ? `Total: ${result.total} Item Terpakai` : `Total: ${result.total} Item Master`;
    if (pagContainer) {
      pagContainer.innerHTML = renderKatalogPaginationInner(offset, katalogPageSize, result.total, currentKatalogPage, totalPages, pageButtons);
    }
  }

  // 5. Katalog Upah, Bahan, dan Alat View (Mendukung Toggle: Item Terpakai vs Seluruh Master Data)
  function renderKatalogView() {
    const container = document.getElementById("katalogContent");
    if (!container) return;

    const isUsed = (katalogFilterMode === 'used');
    const categories = isUsed 
      ? ((window.CatalogPricing && window.CatalogPricing.getUsedCategories) ? window.CatalogPricing.getUsedCategories() : ["Upah Tenaga Kerja", "Material / Bahan Bangunan", "Sewa Peralatan"])
      : (window.CatalogPricing ? window.CatalogPricing.getCategories() : ["Upah Tenaga Kerja", "Material / Bahan Bangunan", "Sewa Peralatan"]);
    const regions = window.REGIONAL_PRESETS || [];
    const currentRegId = window.CatalogPricing.getCurrentRegionId();
    const activeCat = window.CatalogPricing.getCategory() || "ALL";
    const searchVal = window.CatalogPricing.getSearch() || "";

    const offset = (currentKatalogPage - 1) * katalogPageSize;
    const result = window.CatalogPricing.getFilteredMaterials(katalogPageSize, offset, isUsed);
    const totalPages = Math.max(1, Math.ceil(result.total / katalogPageSize));

    if (currentKatalogPage > totalPages) {
      currentKatalogPage = totalPages;
    }

    let catOptions = `<option value="ALL" ${activeCat === "ALL" ? 'selected' : ''}>Semua Kategori (${isUsed ? 'Upah, Bahan, Alat Terpakai' : 'Seluruh Katalog Master'})</option>`;
    categories.forEach(c => {
      catOptions += `<option value="${c}" ${c === activeCat ? 'selected' : ''}>${c}</option>`;
    });

    let regOptions = "";
    regions.forEach(r => {
      regOptions += `<option value="${r.id}" ${r.id === currentRegId ? 'selected' : ''}>${r.name} (Indeks: ${r.indexMultiplier}x)</option>`;
    });

    let itemsHtml = generateKatalogRows(result.items, offset);
    let pageNumbersHtml = generateKatalogPaginationButtons(currentKatalogPage, totalPages);

    const proj = (window.ProjectManager && window.ProjectManager.getActiveProject()) || {};

    container.innerHTML = `
      <div class="print-only">
        ${window.PrintEngine.createPrintHeader(proj, isUsed ? "KATALOG HARGA SATUAN UPAH, BAHAN & PERALATAN (ITEM TERPAKAI)" : "STANDAR HARGA SATUAN UPAH, BAHAN & PERALATAN (SELURUH MASTER KATALOG)")}
      </div>
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center flex-wrap" style="gap: 10px;">
          <div class="card-title d-flex align-items-center flex-wrap" style="gap: 10px;">
            <span>${isUsed ? 'Katalog Upah &amp; Bahan (Item yang Dipakai)' : 'Katalog Upah &amp; Bahan (Seluruh Master Data)'}</span>
            <span class="badge ${isUsed ? 'badge-primary' : 'badge-info'}" id="katalogTotalBadge">Total: ${result.total} ${isUsed ? 'Item Terpakai' : 'Item Master'}</span>
          </div>
          <div class="card-actions no-print d-flex align-items-center flex-wrap" style="gap: 8px;">
            <!-- Tombol Toggle Tampilkan Seluruh Data Katalog vs Katalog yang Dipakai -->
            <div class="btn-group" style="display: inline-flex; border-radius: 6px; overflow: hidden; border: 1px solid #cbd5e1; background: #ffffff;">
              <button type="button" class="btn btn-sm ${isUsed ? 'btn-primary' : 'btn-light'}" style="font-weight: 700; padding: 6px 12px; font-size: 12px;" onclick="App.setKatalogMode('used')" title="Tampilkan hanya upah dan bahan yang dipakai dalam RAB proyek aktif">
                📋 Katalog yang Dipakai
              </button>
              <button type="button" class="btn btn-sm ${!isUsed ? 'btn-primary' : 'btn-light'}" style="font-weight: 700; padding: 6px 12px; font-size: 12px;" onclick="App.setKatalogMode('all')" title="Tampilkan seluruh basis data katalog upah, bahan bangunan, dan peralatan nasional">
                🌐 Seluruh Data Katalog
              </button>
            </div>

            <button class="btn btn-sm btn-outline" onclick="${isUsed ? 'App.printUsedMaterialsCatalog()' : 'App.printAllMaterialsCatalog()'}" title="Cetak data katalog yang sedang aktif ditampilkan">
              🖨️ Cetak Tampilan Ini
            </button>
            <button class="btn btn-sm btn-outline" onclick="App.openAddCustomMaterialModal()">+ Tambah Material Kustom</button>
          </div>
        </div>
        <div class="card-body">
          <!-- Multi-Daerah Selector Bar -->
          <div class="card p-3 mb-3 region-selector-card no-print">
            <div class="d-flex align-items-center justify-content-between flex-wrap" style="gap: 12px;">
              <div>
                <strong>Pilih Wilayah / Daerah Proyek (Multi-Daerah):</strong>
                <div class="text-muted" style="font-size: 12px;">Menyesuaikan indeks remunerasi dan standar harga bahan lokal se-Indonesia.</div>
              </div>
              <select class="select-filter" style="min-width: 320px; font-weight: 600;" onchange="App.handleRegionChange(this.value)">
                ${regOptions}
              </select>
            </div>
          </div>

          <!-- Filter & Search Bar with Quick Filter Toggles -->
          <div class="filter-bar no-print d-flex align-items-center justify-content-between flex-wrap" style="gap: 10px;">
            <div class="d-flex align-items-center flex-wrap" style="flex: 1; gap: 8px; min-width: 280px;">
              <input type="text" id="katalogSearchInput" class="search-input" style="flex: 1; min-width: 200px;" placeholder="Cari nama atau kode bahan/upah/alat..." value="${searchVal}" oninput="App.handleMaterialSearch(this.value)">
              <select class="select-filter" id="katalogCategorySelect" style="min-width: 240px;" onchange="App.handleMaterialCategory(this.value)">
                ${catOptions}
              </select>
            </div>

          </div>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 5%">No</th>
                  <th style="width: 45%">Nama Upah / Material / Peralatan (${isUsed ? 'Terpakai' : 'Katalog Master'})</th>
                  <th style="width: 12%">Kode</th>
                  <th style="width: 10%">Satuan</th>
                  <th style="width: 18%">Harga Satuan (Rp)</th>
                  <th style="width: 10%" class="no-print">Aksi</th>
                </tr>
              </thead>
              <tbody id="katalogTableBody">
                ${itemsHtml || `
                  <tr>
                    <td colspan="6" class="text-center p-4">
                      <div style="font-size: 24px; margin-bottom: 8px;">📋</div>
                      <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px;">${isUsed ? 'Belum Ada Item Pekerjaan AHSP yang Digunakan' : 'Data Katalog Tidak Ditemukan'}</div>
                      <div class="text-muted" style="font-size: 12px; max-width: 480px; margin: 0 auto 12px auto;">
                        ${isUsed 
                          ? 'Menu ini hanya menampilkan data harga satuan upah, material, dan peralatan dari item pekerjaan AHSP yang dipakai dalam RAB proyek aktif.' 
                          : 'Tidak ada data material atau upah dalam katalog yang sesuai filter pencarian.'}
                      </div>
                      ${isUsed ? '<button class="btn btn-sm btn-primary" onclick="App.switchTab(\'detail-rab\')">Buka Detail RAB & Tambah Item</button>' : ''}
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>

          <!-- Bar Navigasi Paginasi Katalog -->
          <div id="katalogPaginationContainer" class="pagination-container no-print d-flex justify-content-between align-items-center mt-3 pt-3" style="border-top: 1px solid var(--color-border); font-size: 13px; flex-wrap: wrap; gap: 10px;">
            ${renderKatalogPaginationInner(offset, katalogPageSize, result.total, currentKatalogPage, totalPages, pageNumbersHtml)}
          </div>
        </div>
      </div>
    `;
  }

  // 6. Rincian Penggunaan Sumber Daya View dengan Persentase Nilai Sumber Daya & Progress Distribusi
  function renderSumberDayaView() {
    const container = document.getElementById("sumberdayaContent");
    if (!container) return;

    const proj = window.ProjectManager.getActiveProject();
    const res = window.ResourceUsage.calculateTotalResources(proj);

    const matPct = res.grandTotal > 0 ? ((res.totalMaterials / res.grandTotal) * 100).toFixed(2) : "0.00";
    const labPct = res.grandTotal > 0 ? ((res.totalLabor / res.grandTotal) * 100).toFixed(2) : "0.00";
    const eqPct = res.grandTotal > 0 ? ((res.totalEquipment / res.grandTotal) * 100).toFixed(2) : "0.00";

    let matRows = "";
    let matMobileCards = "";
    res.materials.forEach((m, idx) => {
      matRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center"><span class="badge badge-light" style="font-family: var(--font-mono);">${m.code || 'M.' + String(idx + 1).padStart(4, '0')}</span></td>
          <td><strong>${m.name}</strong></td>
          <td class="text-center">${m.unit}</td>
          <td class="text-right font-bold">${window.CurrencyUtil.formatNumber(m.qty, 2)}</td>
          <td class="text-right">${window.CurrencyUtil.formatRupiah(m.price, false, true)}</td>
          <td class="text-right font-bold">${window.CurrencyUtil.formatRupiah(m.totalCost, false, true)}</td>
          <td class="text-right font-bold">${m.pctOfGroup ? m.pctOfGroup.toFixed(2) : '0.00'}%</td>
          <td class="text-right text-muted">${m.pctOfTotal ? m.pctOfTotal.toFixed(2) : '0.00'}%</td>
        </tr>
      `;

      matMobileCards += `
        <div class="resource-mobile-card">
          <div class="resource-mobile-card-top">
            <span class="badge badge-secondary font-mono" style="font-size: 11px;">${m.code || 'M.' + String(idx + 1).padStart(4, '0')}</span>
            <span class="font-bold text-emerald" style="font-size: 14px;">${window.CurrencyUtil.formatRupiah(m.totalCost, false, true)}</span>
          </div>
          <div class="resource-mobile-card-name">${m.name}</div>
          <div class="resource-mobile-card-row">
            <span>Kebutuhan: <strong>${window.CurrencyUtil.formatNumber(m.qty, 2)} ${m.unit}</strong></span>
            <span>Harga: <strong>${window.CurrencyUtil.formatRupiah(m.price, false, true)}</strong></span>
          </div>
          <div class="d-flex justify-content-end text-muted" style="font-size: 11px; margin-top: 3px;">
            <span>Bobot Total: <strong class="text-dark">${m.pctOfTotal ? m.pctOfTotal.toFixed(2) : '0.00'}%</strong></span>
          </div>
        </div>
      `;
    });

    let labRows = "";
    let labMobileCards = "";
    res.labor.forEach((l, idx) => {
      labRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center"><span class="badge badge-light" style="font-family: var(--font-mono);">${l.code || 'L.' + String(idx + 1).padStart(2, '0')}</span></td>
          <td><strong>${l.name}</strong></td>
          <td class="text-center">${l.unit}</td>
          <td class="text-right font-bold">${window.CurrencyUtil.formatNumber(l.qty, 2)}</td>
          <td class="text-right">${window.CurrencyUtil.formatRupiah(l.price, false, true)}</td>
          <td class="text-right font-bold">${window.CurrencyUtil.formatRupiah(l.totalCost, false, true)}</td>
          <td class="text-right font-bold">${l.pctOfGroup ? l.pctOfGroup.toFixed(2) : '0.00'}%</td>
          <td class="text-right text-muted">${l.pctOfTotal ? l.pctOfTotal.toFixed(2) : '0.00'}%</td>
        </tr>
      `;

      labMobileCards += `
        <div class="resource-mobile-card">
          <div class="resource-mobile-card-top">
            <span class="badge badge-secondary font-mono" style="font-size: 11px;">${l.code || 'L.' + String(idx + 1).padStart(2, '0')}</span>
            <span class="font-bold text-emerald" style="font-size: 14px;">${window.CurrencyUtil.formatRupiah(l.totalCost, false, true)}</span>
          </div>
          <div class="resource-mobile-card-name">${l.name}</div>
          <div class="resource-mobile-card-row">
            <span>Jumlah: <strong>${window.CurrencyUtil.formatNumber(l.qty, 2)} ${l.unit}</strong></span>
            <span>Upah/OH: <strong>${window.CurrencyUtil.formatRupiah(l.price, false, true)}</strong></span>
          </div>
          <div class="d-flex justify-content-end text-muted" style="font-size: 11px; margin-top: 3px;">
            <span>Bobot Total: <strong class="text-dark">${l.pctOfTotal ? l.pctOfTotal.toFixed(2) : '0.00'}%</strong></span>
          </div>
        </div>
      `;
    });

    let eqRows = "";
    let eqMobileCards = "";
    res.equipment.forEach((e, idx) => {
      eqRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center"><span class="badge badge-light" style="font-family: var(--font-mono);">${e.code || 'E.' + String(idx + 1).padStart(2, '0')}</span></td>
          <td><strong>${e.name}</strong></td>
          <td class="text-center">${e.unit}</td>
          <td class="text-right font-bold">${window.CurrencyUtil.formatNumber(e.qty, 2)}</td>
          <td class="text-right">${window.CurrencyUtil.formatRupiah(e.price, false, true)}</td>
          <td class="text-right font-bold">${window.CurrencyUtil.formatRupiah(e.totalCost, false, true)}</td>
          <td class="text-right font-bold">${e.pctOfGroup ? e.pctOfGroup.toFixed(2) : '0.00'}%</td>
          <td class="text-right text-muted">${e.pctOfTotal ? e.pctOfTotal.toFixed(2) : '0.00'}%</td>
        </tr>
      `;

      eqMobileCards += `
        <div class="resource-mobile-card">
          <div class="resource-mobile-card-top">
            <span class="badge badge-secondary font-mono" style="font-size: 11px;">${e.code || 'E.' + String(idx + 1).padStart(2, '0')}</span>
            <span class="font-bold text-emerald" style="font-size: 14px;">${window.CurrencyUtil.formatRupiah(e.totalCost, false, true)}</span>
          </div>
          <div class="resource-mobile-card-name">${e.name}</div>
          <div class="resource-mobile-card-row">
            <span>Sewa: <strong>${window.CurrencyUtil.formatNumber(e.qty, 2)} ${e.unit}</strong></span>
            <span>Tarif: <strong>${window.CurrencyUtil.formatRupiah(e.price, false, true)}</strong></span>
          </div>
          <div class="d-flex justify-content-end text-muted" style="font-size: 11px; margin-top: 3px;">
            <span>Bobot Total: <strong class="text-dark">${e.pctOfTotal ? e.pctOfTotal.toFixed(2) : '0.00'}%</strong></span>
          </div>
        </div>
      `;
    });
    container.innerHTML = `
      <div class="print-only">
        ${window.PrintEngine.createPrintHeader(proj, "REKAPITULASI PENGGUNAAN BAHAN, TENAGA, DAN ALAT")}
      </div>

      <div class="page-header no-print">
        <div>
          <h2 class="page-header-title">📊 Rincian Penggunaan Sumber Daya Proyek</h2>
          <div class="page-header-sub">Kebutuhan total material fisik, tenaga kerja (OH), dan sewa alat beserta nilai persentase bobot</div>
        </div>
        <div class="page-header-actions d-flex align-items-center flex-wrap" style="gap: 8px;">
          <button class="btn btn-primary font-bold" onclick="App.printCurrentPage('panel-sumberdaya', 'Rekap_Sumber_Daya')">🖨️ Cetak / Preview A4</button>
        </div>
      </div>

      <!-- Ringkasan Kartu Eksekutif (4 Kartu Sejajar Proporsional & Tanpa Kotak Pembungkus Ganda) -->
      <div class="mb-4 no-print" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <span class="text-muted" style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; display: block;">Total Kebutuhan Material</span>
          <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 3px;">${window.CurrencyUtil.formatRupiah(res.totalMaterials, false, true)}</div>
          <span class="badge badge-light" style="font-size: 10.5px; margin-top: 5px; border: 1px solid #e2e8f0; color: #334155;">${matPct}% Porsi Biaya</span>
        </div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <span class="text-muted" style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; display: block;">Total Biaya Upah Tenaga</span>
          <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 3px;">${window.CurrencyUtil.formatRupiah(res.totalLabor, false, true)}</div>
          <span class="badge badge-light" style="font-size: 10.5px; margin-top: 5px; border: 1px solid #e2e8f0; color: #334155;">${labPct}% Porsi Biaya</span>
        </div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <span class="text-muted" style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; display: block;">Total Biaya Sewa Alat</span>
          <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 3px;">${window.CurrencyUtil.formatRupiah(res.totalEquipment, false, true)}</div>
          <span class="badge badge-light" style="font-size: 10.5px; margin-top: 5px; border: 1px solid #e2e8f0; color: #334155;">${eqPct}% Porsi Biaya</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #22c55e; border-radius: 6px; padding: 12px 14px; box-shadow: 0 1px 3px rgba(34,197,94,0.1);">
          <span class="text-muted" style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #15803d; display: block;">Total Biaya RAB (Real Cost)</span>
          <div style="font-size: 16px; font-weight: 800; color: #166534; margin-top: 3px;">${window.CurrencyUtil.formatRupiah(res.rabRealCost || res.grandTotal, false, true)}</div>
          <span class="badge badge-success" style="font-size: 10px; margin-top: 5px; font-weight: 700; background: #22c55e; color: #ffffff;">100.00% SINKRON DENGAN RAB</span>
        </div>
      </div>

      <!-- Rekonsiliasi Finansial Terpadu 100% Valid & Sinkron -->
      <div class="no-print mb-3 p-3" style="background: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 0 6px 6px 0; font-size: 12px; color: #166534; line-height: 1.6;">
        <div class="d-flex align-items-center justify-content-between flex-wrap" style="gap: 8px;">
          <div>
            <strong>✅ Rekonsiliasi Finansial 100% Terverifikasi &amp; Sinkron:</strong><br>
            Total Anggaran Sumber Daya (Biaya Langsung Material <b>${window.CurrencyUtil.formatRupiah(res.totalMaterials, false, true)}</b> + Upah <b>${window.CurrencyUtil.formatRupiah(res.totalLabor, false, true)}</b> + Sewa Alat <b>${window.CurrencyUtil.formatRupiah(res.totalEquipment, false, true)}</b> + Biaya Umum &amp; Keuntungan <b>${window.CurrencyUtil.formatRupiah(res.totalOverheadProfit, false, true)}</b>) = <b>${window.CurrencyUtil.formatRupiah(res.rabRealCost, false, true)}</b> (Identik 100% dengan Total Biaya RAB di Rekapitulasi &amp; Detail RAB).
          </div>
          ${res.includePpn ? `<div class="badge badge-primary" style="font-size: 11px; padding: 6px 12px;">Grand Total (+ PPN ${res.ppnRate}%): <strong>${window.CurrencyUtil.formatRupiah(res.rabGrandTotal, false, true)}</strong></div>` : ''}
        </div>
      </div>

      <!-- Tabel Bahan -->
      <div class="card mb-4">
        <div class="card-header"><div class="card-title">1. Rekapitulasi Kebutuhan Bahan Material Fisik</div></div>
        <div class="card-body p-0">
          <!-- Desktop Table View -->
          <div class="table-responsive d-desktop-only">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 4%">No</th>
                  <th style="width: 10%">Kode</th>
                  <th style="width: 28%">Nama Bahan Material</th>
                  <th style="width: 8%" class="th-nowrap">Satuan</th>
                  <th style="width: 11%">Total Kuantitas</th>
                  <th style="width: 13%">Harga Satuan</th>
                  <th style="width: 14%">Subtotal Biaya</th>
                  <th style="width: 6%" class="th-nowrap">% Bahan</th>
                  <th style="width: 6%" class="th-nowrap">% Total</th>
                </tr>
              </thead>
              <tbody>
                ${matRows || '<tr><td colspan="9" class="text-center text-muted p-3">Belum ada kebutuhan bahan.</td></tr>'}
              </tbody>
              <tfoot>
                <tr style="background: #f8fafc; font-weight: 700;">
                  <td colspan="6" class="text-right">Subtotal Kebutuhan Bahan:</td>
                  <td class="text-right">${window.CurrencyUtil.formatRupiah(res.totalMaterials, false, true)}</td>
                  <td class="text-right">100.00%</td>
                  <td class="text-right text-muted">${matPct}%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Mobile Touch Cards View (Zero Horizontal Scroll!) -->
          <div class="d-mobile-only p-3">
            ${matMobileCards || '<div class="text-center text-muted p-3 bg-light rounded">Belum ada kebutuhan bahan.</div>'}
            <div class="rab-mobile-div-footer-card">
              <span class="font-bold text-muted">Subtotal Bahan:</span>
              <span class="font-black text-emerald" style="font-size: 14px;">${window.CurrencyUtil.formatRupiah(res.totalMaterials, false, true)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabel Tenaga -->
      <div class="card mb-4">
        <div class="card-header"><div class="card-title">2. Rekapitulasi Kebutuhan Tenaga Kerja (Orang-Hari / OH)</div></div>
        <div class="card-body p-0">
          <!-- Desktop Table View -->
          <div class="table-responsive d-desktop-only">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 4%">No</th>
                  <th style="width: 10%">Kode</th>
                  <th style="width: 28%">Klasifikasi Tenaga</th>
                  <th style="width: 8%" class="th-nowrap">Satuan</th>
                  <th style="width: 11%">Jumlah OH</th>
                  <th style="width: 13%">Upah Harian</th>
                  <th style="width: 14%">Subtotal Biaya</th>
                  <th style="width: 6%" class="th-nowrap">% Upah</th>
                  <th style="width: 6%" class="th-nowrap">% Total</th>
                </tr>
              </thead>
              <tbody>
                ${labRows || '<tr><td colspan="9" class="text-center text-muted p-3">Belum ada data tenaga.</td></tr>'}
              </tbody>
              <tfoot>
                <tr style="background: #f8fafc; font-weight: 700;">
                  <td colspan="6" class="text-right">Subtotal Biaya Upah Tenaga:</td>
                  <td class="text-right">${window.CurrencyUtil.formatRupiah(res.totalLabor, false, true)}</td>
                  <td class="text-right">100.00%</td>
                  <td class="text-right text-muted">${labPct}%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Mobile Touch Cards View (Zero Horizontal Scroll!) -->
          <div class="d-mobile-only p-3">
            ${labMobileCards || '<div class="text-center text-muted p-3 bg-light rounded">Belum ada data tenaga.</div>'}
            <div class="rab-mobile-div-footer-card">
              <span class="font-bold text-muted">Subtotal Biaya Upah:</span>
              <span class="font-black text-emerald" style="font-size: 14px;">${window.CurrencyUtil.formatRupiah(res.totalLabor, false, true)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabel Alat -->
      <div class="card mb-4">
        <div class="card-header"><div class="card-title">3. Rekapitulasi Sewa Peralatan</div></div>
        <div class="card-body p-0">
          <!-- Desktop Table View -->
          <div class="table-responsive d-desktop-only">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 4%">No</th>
                  <th style="width: 10%">Kode</th>
                  <th style="width: 28%">Nama Peralatan</th>
                  <th style="width: 8%" class="th-nowrap">Satuan</th>
                  <th style="width: 11%">Total Sewa</th>
                  <th style="width: 13%">Tarif Sewa</th>
                  <th style="width: 14%">Subtotal Biaya</th>
                  <th style="width: 6%" class="th-nowrap">% Alat</th>
                  <th style="width: 6%" class="th-nowrap">% Total</th>
                </tr>
              </thead>
              <tbody>
                ${eqRows || '<tr><td colspan="9" class="text-center text-muted p-3">Belum ada kebutuhan alat.</td></tr>'}
              </tbody>
              <tfoot>
                <tr style="background: #f8fafc; font-weight: 700;">
                  <td colspan="6" class="text-right">Subtotal Sewa Peralatan:</td>
                  <td class="text-right">${window.CurrencyUtil.formatRupiah(res.totalEquipment, false, true)}</td>
                  <td class="text-right">100.00%</td>
                  <td class="text-right text-muted">${eqPct}%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Mobile Touch Cards View (Zero Horizontal Scroll!) -->
          <div class="d-mobile-only p-3">
            ${eqMobileCards || '<div class="text-center text-muted p-3 bg-light rounded">Belum ada kebutuhan alat.</div>'}
            <div class="rab-mobile-div-footer-card">
              <span class="font-bold text-muted">Subtotal Sewa Alat:</span>
              <span class="font-black text-emerald" style="font-size: 14px;">${window.CurrencyUtil.formatRupiah(res.totalEquipment, false, true)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }



  // 7. Kurva S View (Grid Harian & Grid Mingguan Terintegrasi Penuh Kalender)
  let kurvaSViewMode = "auto"; // "auto", "daily", "weekly"

  function setKurvaSViewMode(mode) {
    kurvaSViewMode = mode;
    renderKurvaSView();
  }

  function renderKurvaSView() {
    const container = document.getElementById("kurvaSContent");
    if (!container) return;

    const proj = window.ProjectManager.getActiveProject();
    const schedulesMeta = window.SCurveDiagram.calculateScheduleFromCalendar(proj);
    const totalDays = schedulesMeta.totalDays || (proj ? proj.durationDays : 3) || 3;
    const weeksCount = schedulesMeta.weeksCount || Math.ceil(totalDays / 7) || 1;

    // Tentukan mode aktif saat ini
    let activeMode = kurvaSViewMode;
    if (activeMode === "auto") {
      activeMode = (totalDays <= 30) ? "daily" : "weekly";
    }

    const schedule = window.SCurveDiagram.getScheduleData(activeMode);
    const isDaily = activeMode === "daily";

    // Hitung KPI Kurva S terintegrasi Kalender Proyek
    let lastActCum = null;
    let lastPlanCum = 0;
    schedule.forEach(s => {
      if (s.actCum !== null && s.actCum !== undefined) {
        lastActCum = s.actCum;
        lastPlanCum = s.planCum;
      }
    });

    const hasRealProgress = lastActCum !== null;
    const deviationVal = hasRealProgress ? (Math.round((lastActCum - lastPlanCum) * 100) / 100) : 0;
    const deviationText = hasRealProgress 
      ? (deviationVal >= 0 ? `+${deviationVal}% (Ahead)` : `${deviationVal}% (Behind)`) 
      : "Menunggu Kalender";
    const devColor = hasRealProgress 
      ? (deviationVal >= 0 ? "#059669" : "#dc2626") 
      : "#64748b";

    container.innerHTML = `
      <div class="print-only">
        ${window.PrintEngine.createLandscapePrintHeader ? window.PrintEngine.createLandscapePrintHeader(proj, `KURVA S PEKERJAAN PROYEK (${isDaily ? 'GRID HARIAN' : 'GRID MINGGUAN'})`) : window.PrintEngine.createPrintHeader(proj, `KURVA S PEKERJAAN PROYEK (${isDaily ? 'GRID HARIAN' : 'GRID MINGGUAN'})`)}
        <!-- Baris KPI Ringkas Khusus Cetak Landscape -->
        <div style="display: flex; justify-content: space-between; gap: 8px; margin-bottom: 6px; font-size: 8pt; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2.5px 6px; text-align: center;">
            <span style="font-size: 7pt; color: #64748b; text-transform: uppercase;">Target Rencana:</span>
            <strong style="color: #2563eb; margin-left: 4px;">100,00%</strong>
          </div>
          <div style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2.5px 6px; text-align: center;">
            <span style="font-size: 7pt; color: #64748b; text-transform: uppercase;">Realisasi Fisik:</span>
            <strong style="color: ${hasRealProgress ? '#059669' : '#64748b'}; margin-left: 4px;">${hasRealProgress ? `${window.CurrencyUtil.formatNumber(lastActCum, 2)}%` : '0,00%'}</strong>
          </div>
          <div style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2.5px 6px; text-align: center;">
            <span style="font-size: 7pt; color: #64748b; text-transform: uppercase;">Deviasi Jadwal:</span>
            <strong style="color: ${devColor}; margin-left: 4px;">${deviationText}</strong>
          </div>
          <div style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2.5px 6px; text-align: center;">
            <span style="font-size: 7pt; color: #64748b; text-transform: uppercase;">Total Durasi:</span>
            <strong style="color: #0891b2; margin-left: 4px;">${totalDays} Hari (${weeksCount} Mgg)</strong>
          </div>
        </div>
      </div>

      <div class="page-header no-print">
        <div>
          <h2 class="page-header-title">
            📈 Kurva S & Monitoring Progres
            <span class="badge badge-primary" style="font-size: 11px;">${isDaily ? `${schedule.length} Hari Kerja (Grid Harian)` : `${schedule.length} Minggu Pelaksanaan`}</span>
          </h2>
          <div class="page-header-sub">Sinkronisasi otomatis dengan jadwal Kalender Proyek (Target Rencana vs Realisasi Fisik)</div>
        </div>
        <div class="page-header-actions d-flex align-items-center flex-wrap" style="gap: 10px;">
          <!-- Toggle Mode Grid Harian vs Grid Mingguan -->
          <div class="btn-group" style="display: inline-flex; gap: 4px; background: #f1f5f9; padding: 4px; border-radius: 8px; border: 1px solid #cbd5e1;">
            <button class="btn btn-sm ${isDaily ? 'btn-primary' : 'btn-outline'}" 
                    style="font-size: 12px; font-weight: 700; padding: 5px 12px;" 
                    onclick="App.setKurvaSViewMode('daily')">
              📅 Grid Harian (${totalDays} Hari)
            </button>
            <button class="btn btn-sm ${!isDaily ? 'btn-primary' : 'btn-outline'}" 
                    style="font-size: 12px; font-weight: 700; padding: 5px 12px;" 
                    onclick="App.setKurvaSViewMode('weekly')">
              📆 Grid Mingguan (${weeksCount} Mgg)
            </button>
          </div>
          <button class="btn btn-primary font-bold" onclick="App.printCurrentPage('panel-kurva-s', 'Kurva_S_Proyek')">🖨️ Cetak / Preview A4</button>
        </div>
      </div>

      <!-- Tips Rotasi Layar Khusus Mobile -->
      <div class="d-mobile-only no-print mb-2" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; font-size: 11px; color: #334155; display: flex; align-items: center; gap: 6px;">
        <span>📱🔄</span>
        <span>Gunakan orientasi <strong>Landscape</strong> untuk grafik Kurva S &amp; timeline mingguan yang lebih luas.</span>
      </div>

      <!-- Sleek Compact Executive KPI Strip (Balanced & Proportional - Anti-Over Bagan) -->
      <div class="kurva-kpi-bar no-print mb-3">
        <div class="kpi-cell">
          <div class="kpi-cell-label">Target Rencana</div>
          <div class="kpi-cell-value">100,00%</div>
          <div class="kpi-cell-sub">Bobot Total Proyek</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-cell-label">Realisasi Aktual</div>
          <div class="kpi-cell-value" style="color: ${hasRealProgress ? '#059669' : '#64748b'};">
            ${hasRealProgress ? `${window.CurrencyUtil.formatNumber(lastActCum, 2)}%` : '0,00% (Belum Mulai)'}
          </div>
          <div class="kpi-cell-sub">${hasRealProgress ? 'Terverifikasi Kalender' : 'Menunggu Kalender'}</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-cell-label">Deviasi Jadwal</div>
          <div class="kpi-cell-value" style="color: ${hasRealProgress ? devColor : '#64748b'};">${deviationText}</div>
          <div class="kpi-cell-sub">${hasRealProgress ? 'Status Pelaksanaan' : 'Belum Berjalan'}</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-cell-label">Total Durasi</div>
          <div class="kpi-cell-value">${totalDays} Hari</div>
          <div class="kpi-cell-sub">${weeksCount} Minggu Kerja</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div class="card-title">
            <span>Visualisasi Kurva S Pelaksanaan Proyek (${isDaily ? 'Detail Grid Harian' : 'Grid Mingguan'})</span>
          </div>
          <div class="card-actions no-print">
            <span class="badge badge-light" style="font-size: 11px;">Skala Waktu: ${isDaily ? `Harian (1 s.d. ${totalDays})` : `Mingguan (1 s.d. ${weeksCount})`}</span>
          </div>
        </div>
        <div class="card-body">
          <!-- Kurva S SVG -->
          <div id="scurve-chart-wrapper" class="svg-print-container mb-4">
            <!-- SVG dirender di sini -->
          </div>

          <!-- Tabel Data Detail (Tercetak di Halaman 2 Bersama Kurva S) -->
          <div class="kurva-s-table-wrapper" style="page-break-before: always; break-before: page; margin-top: 16px;">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h4 style="font-size: 14px; font-weight: 700; margin: 0; color: #0f172a;">
                Tabel Rencana & Realisasi Progres ${isDaily ? 'Harian (Per Hari Kerja)' : 'Mingguan (Per Minggu)'}
              </h4>
              <div class="text-muted" style="font-size: 12px;">
                Format Waktu: <strong>${isDaily ? 'H-1 s.d. H-' + totalDays : 'M-1 s.d. M-' + weeksCount}</strong>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th style="width: 6%; text-align: center; vertical-align: middle;">${isDaily ? 'Hari Ke' : 'Minggu'}</th>
                    <th style="width: 14%; text-align: center; vertical-align: middle;">${isDaily ? 'Hari & Tanggal' : 'Periode Tanggal'}</th>
                    <th style="width: 38%; text-align: center; vertical-align: middle;">Pekerjaan / Jadwal Aktif</th>
                    <th style="width: 10%; text-align: center; vertical-align: middle;">${isDaily ? 'Bobot (%)' : 'Bobot (%)'}</th>
                    <th style="width: 11%; text-align: center; vertical-align: middle;">Rencana Kum (%)</th>
                    <th style="width: 11%; text-align: center; vertical-align: middle;">Realisasi Kum (%)</th>
                    <th style="width: 10%; text-align: center; vertical-align: middle;">Deviasi (%)</th>
                  </tr>
                </thead>
                <tbody id="scheduleTableBody">
                  <!-- Diisi loop tabel -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render SVG
    window.SCurveDiagram.renderSvgChart("scurve-chart-wrapper", schedule, { isDaily });

    // Render Tabel Progres Harian / Mingguan
    const tbody = document.getElementById("scheduleTableBody");
    if (tbody) {
      let rowsHtml = "";
      schedule.forEach(s => {
        let deviasiHtml = '<span class="text-muted">-</span>';
        if (s.actCum !== null && s.actCum !== undefined) {
          const dev = Math.round((s.actCum - s.planCum) * 100) / 100;
          const devStr = (dev > 0 ? "+" : "") + window.CurrencyUtil.formatNumber(dev, 2) + "%";
          if (dev > 0) {
            deviasiHtml = `<span class="font-bold text-success">${devStr} (Ahead)</span>`;
          } else if (dev < 0) {
            deviasiHtml = `<span class="font-bold text-danger">${devStr} (Behind)</span>`;
          } else {
            deviasiHtml = `<span class="font-bold text-info">0.00% (On Track)</span>`;
          }
        }

        const tagLabel = isDaily ? `H-${s.day}` : `M-${s.week}`;
        const dateDesc = isDaily 
          ? `${s.dayName ? s.dayName + ', ' : ''}${s.dateFormatted || s.date || '-'}`
          : (s.dateRangeFormatted || ((s.startDate || s.dateStart) ? `${s.startDate || s.dateStart} s.d. ${s.endDate || s.dateEnd}` : '-'));
        const weightVal = isDaily ? (s.planDaily || 0) : (s.planWeekly || 0);

        const activeTasksList = (s.activeTasks && s.activeTasks.length > 0)
          ? s.activeTasks.map(name => `<div class="task-active-line" style="font-size: 8pt; color: #1e293b; line-height: 1.4; padding: 1.5px 0; text-align: left; word-break: normal; white-space: normal;">&bull; ${name}</div>`).join("")
          : '<span class="text-muted" style="font-size: 8pt; font-style: italic;">(Tidak ada pekerjaan aktif)</span>';

        rowsHtml += `
          <tr>
            <td class="text-center font-bold" style="color: #1e40af; vertical-align: middle; text-align: center;">${tagLabel}</td>
            <td style="font-size: 8pt; color: #334155; font-weight: 600; vertical-align: middle; text-align: center;">
              ${dateDesc}
            </td>
            <td style="vertical-align: middle; text-align: left; padding: 4px 8px;">
              ${activeTasksList}
            </td>
            <td class="text-right font-bold" style="vertical-align: middle; text-align: right;">${window.CurrencyUtil.formatNumber(weightVal, 2)}%</td>
            <td class="text-right font-bold text-primary" style="vertical-align: middle; text-align: right;">${window.CurrencyUtil.formatNumber(s.planCum, 2)}%</td>
            <td class="text-right font-bold ${s.actCum !== null ? 'text-success' : 'text-muted'}" style="vertical-align: middle; text-align: right;">
              ${s.actCum !== null ? `${window.CurrencyUtil.formatNumber(s.actCum, 2)}%` : '-'}
            </td>
            <td class="text-center font-bold" style="vertical-align: middle; text-align: center;">${deviasiHtml}</td>
          </tr>
        `;
      });
      tbody.innerHTML = rowsHtml;
    }
  }

  // 8. Kalender Proyek 1 Tahun View
  
  function handleSyncTasksFromRab() {
    syncCalendarFromRab(true);
  }

  function confirmClearAllCalendarTasks() {
    showConfirmModal({
      title: "Konfirmasi Kosongkan Kalender Proyek",
      message: `Apakah Anda yakin ingin <strong>menghapus seluruh data jadwal</strong> di Kalender Proyek?<br><br>
        Seluruh daftar penanggalan pekerjaan fisik akan dikosongkan. Anda dapat membuat ulang jadwal kapan saja secara bersih menggunakan tombol <strong>'Muat / Refresh Jadwal dari Rincian RAB'</strong>.`,
      confirmText: "🗑️ Ya, Kosongkan Semua Jadwal",
      confirmClass: "btn-danger",
      onConfirm: () => {
        if (window.ProjectCalendar && window.ProjectCalendar.clearAllTasks) {
          const res = window.ProjectCalendar.clearAllTasks();
          renderKalenderView();
          showNotificationModal({
            title: "Kalender Berhasil Dikosongkan",
            icon: "🗑️",
            type: "info",
            contentHtml: `<div style="font-size: 13px;">Sebanyak <strong>${res.count}</strong> jadwal pekerjaan fisik telah dihapus dari kalender.<br><br>Silakan gunakan tombol <strong>'Muat / Refresh Jadwal dari Rincian RAB'</strong> untuk men-generate jadwal baru kapan saja.</div>`,
            confirmText: "Tutup"
          });
        }
      }
    });
  }

  let kalenderDivisionFilter = "ALL";

  function setKalenderDivisionFilter(divCode) {
    kalenderDivisionFilter = divCode;
    renderKalenderView();
  }

  function renderKalenderView() {
    const container = document.getElementById("kalenderContent");
    if (!container) return;

    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    let allTasks = window.ProjectCalendar ? window.ProjectCalendar.getTasks() : [];
    
    // Hanya auto-sync saat proyek baru dibuka pertama kali dan belum pernah diinisialisasi kalendernya (undefined)
    // Jika proj.calendarTasks adalah array kosong [] (telah dihapus/dikosongkan user), jangan di-auto-sync paksa!
    if (proj && proj.calendarTasks === undefined && proj.divisions && proj.divisions.some(d => d.items && d.items.length > 0)) {
      window.ProjectCalendar.syncTasksFromRabDetail();
      allTasks = window.ProjectCalendar.getTasks();
    }
    const calData = window.ProjectCalendar ? window.ProjectCalendar.renderCalendarGrid() : { html: "" };

    // Filter tasks berdasarkan divisi terpilih
    const tasks = kalenderDivisionFilter === "ALL"
      ? allTasks
      : allTasks.filter(t => t.divisionCode === kalenderDivisionFilter);

    // Grouping tasks per divisi
    const grouped = {};
    tasks.forEach(t => {
      const dCode = t.divisionCode || "I";
      const dName = t.divisionName || "Pekerjaan";
      const key = `${dCode}___${dName}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(t);
    });

    let taskRows = "";
    Object.keys(grouped).forEach(key => {
      const [dCode, dName] = key.split("___");
      const dTasks = grouped[key];
      const dSubtotal = dTasks.reduce((sum, t) => sum + (Number(t.cost) || 0), 0);
      const dCompleted = dTasks.filter(t => t.status === "Selesai").length;

      // Division Header Bar - Full Width Table (Anti Bertumpuk di Kiri & Space Kanan Termaksimalkan)
      taskRows += `
        <tr class="calendar-division-header-row" style="background: #f1f5f9; border-top: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;">
          <td colspan="7" style="padding: 8px 12px; background-color: #f1f5f9 !important;">
            <table class="calendar-div-inner-table" style="width: 100%; border-collapse: collapse; border: none; background: transparent; margin: 0; padding: 0;">
              <tr style="border: none; background: transparent;">
                <td style="text-align: left; vertical-align: middle; border: none; padding: 0; font-size: 13px; font-weight: 700; color: #0f172a; width: 52%;">
                  <span style="background: #2563eb; color: #ffffff; padding: 3px 9px; border-radius: 4px; font-size: 11px; font-weight: 700; margin-right: 8px; display: inline-block;">DIVISI ${dCode}</span>
                  <span style="font-weight: 800; font-size: 13.5px; color: #0f172a;">${dName.toUpperCase()}</span>
                  <span style="color: #64748b; font-size: 11.5px; margin-left: 8px; font-weight: 500;">(${dTasks.length} Item AHSP Fisik)</span>
                </td>
                <td style="text-align: center; vertical-align: middle; border: none; padding: 0 10px; font-size: 11.5px; white-space: nowrap; width: 23%;">
                  <span style="background: ${dCompleted === dTasks.length ? '#dcfce7' : (dCompleted > 0 ? '#fef3c7' : '#e2e8f0')}; color: ${dCompleted === dTasks.length ? '#166534' : (dCompleted > 0 ? '#92400e' : '#334155')}; padding: 3px 10px; border-radius: 4px; font-weight: 600; display: inline-block;">
                    Progres: ${dCompleted}/${dTasks.length} Selesai
                  </span>
                </td>
                <td style="text-align: right; vertical-align: middle; border: none; padding: 0; font-size: 12.5px; font-weight: 700; color: #1e40af; white-space: nowrap; width: 25%;">
                  Subtotal: <span style="font-weight: 800; color: #1e40af; font-size: 13.5px;">${window.CurrencyUtil.formatRupiah(dSubtotal, false, true)}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;

      // Item Rows
      dTasks.forEach((t, idx) => {
        let stClass = "badge-light";
        if (t.status === "Selesai") stClass = "badge-success";
        else if (t.status === "Sedang Berjalan") stClass = "badge-warning";
        else if (t.status === "Terkendala") stClass = "badge-danger";

        const isCompleted = (t.status === "Selesai");
        const stdStart = t.stdStartDate || t.startDate;
        const stdFinish = t.stdFinishDate || t.finishDate;
        const stdDur = t.stdDuration || t.duration;
        const manStart = t.manualStartDate || t.startDate;
        const manFinish = t.manualFinishDate || t.finishDate;
        const manDur = t.manualDuration || t.duration;

        taskRows += `
          <tr class="${isCompleted ? 'table-success-soft' : ''}">
            <td class="text-center font-bold" style="vertical-align: middle; width: 85px;">
              <span class="badge badge-light" style="font-family: monospace; font-size: 11.5px; border: 1px solid #cbd5e1; color: #1e293b;">
                ${t.ahspCode || t.code}
              </span>
            </td>
            <td style="vertical-align: middle;">
              <div style="font-weight: 700; color: #0f172a; font-size: 12px; line-height: 1.35;">${t.name}</div>
              <div class="text-muted d-flex align-items-center mt-1" style="font-size: 11px; gap: 8px;">
                <span>Vol: <strong>${t.volume || '-'} ${t.unit || ''}</strong></span>
                ${t.cost ? `• <span style="color: #059669; font-weight: 600;">${window.CurrencyUtil.formatRupiah(t.cost, false, true)}</span>` : ''}
                ${isCompleted ? '<span class="badge badge-success ml-1" style="font-size: 9.5px;">🔒 Terkunci Aman</span>' : ''}
              </div>
            </td>
            <td style="padding: 6px 8px;">
              <!-- Baris 1: Standar Rencana Sesuai Data Proyek -->
              <div class="schedule-2row-std" style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 11px; border-left: 3px solid #2563eb; margin-bottom: 3px;">
                <span style="color: #1e40af; font-weight: 700;">📅 Standar Rencana:</span>
                <span class="ml-1">${stdStart} s.d. ${stdFinish}</span>
                <span class="badge badge-light ml-1" style="font-size: 10px;">${stdDur < 1 ? `${stdDur} OH` : `${stdDur}h`}</span>
              </div>
              <!-- Baris 2: Penanggalan Manual Sesuai Kondisi Lapangan -->
              <div class="schedule-2row-act" style="background: #ecfdf5; padding: 4px 8px; border-radius: 4px; font-size: 11px; border-left: 3px solid #10b981;">
                <span style="color: #065f46; font-weight: 700;">📍 Realisasi Lapangan:</span>
                <span class="ml-1 font-bold">${manStart} s.d. ${manFinish}</span>
                <span class="badge badge-success ml-1" style="font-size: 10px;">${manDur < 1 ? `${manDur} OH` : `${manDur}h`}</span>
              </div>
            </td>
            <td class="text-center font-bold" style="vertical-align: middle; width: 95px;">
              <div style="font-size: 13px; color: #0f172a;">${manDur < 1 ? `${manDur} OH` : `${manDur} Hari`}</div>
              <small class="text-muted" style="font-size: 10px;">${stdDur < 1 ? `Std: ${stdDur} OH` : `Std: ${stdDur}h`}</small>
            </td>
            <td class="text-center" style="vertical-align: middle; width: 115px;">
              <span class="badge ${stClass}" style="font-size: 11px; padding: 4px 8px;">${t.status}</span>
              ${t.status === 'Sedang Berjalan' ? `<div style="font-size: 10.5px; font-weight: 700; color: #d97706; margin-top: 3px;">${t.actualProgress !== undefined ? t.actualProgress : 50}% Progres</div>` : ''}
              ${t.status === 'Selesai' ? `<div style="font-size: 10.5px; font-weight: 700; color: #059669; margin-top: 3px;">100% Tuntas</div>` : ''}
            </td>
            <td class="text-muted" style="font-size: 11px; vertical-align: middle;">${t.notes || '-'}</td>
            <td class="text-center no-print" style="vertical-align: middle; white-space: nowrap; width: 130px;">
              ${isCompleted ? `
                <button class="btn btn-sm btn-outline" onclick="App.unlockTask('${t.code}')" title="Buka kunci pekerjaan ini agar tanggal dapat diedit kembali" style="font-size: 11px; padding: 3px 7px;">🔓 Buka Kunci</button>
                <button class="btn btn-sm btn-danger" onclick="App.deleteTask('${t.code}')" title="Hapus jadwal pekerjaan ini" style="font-size: 11px; padding: 3px 7px;">🗑️ Hapus</button>
              ` : `
                <button class="btn btn-sm btn-outline" onclick="App.openEditTaskModal('${t.code}')" title="Edit tanggal atau status pekerjaan" style="font-size: 11px; padding: 3px 7px;">✏️ Edit</button>
                <button class="btn btn-sm btn-danger" onclick="App.deleteTask('${t.code}')" title="Hapus jadwal pekerjaan ini" style="font-size: 11px; padding: 3px 7px;">🗑️ Hapus</button>
              `}
            </td>
          </tr>
        `;
      });
    });

    // Options dropdown filter divisi
    const divList = (proj && proj.divisions) ? proj.divisions : [];
    let divFilterOptions = `<option value="ALL" ${kalenderDivisionFilter === "ALL" ? "selected" : ""}>Semua Divisi (${allTasks.length} Item AHSP Fisik)</option>`;
    divList.forEach(d => {
      divFilterOptions += `<option value="${d.code}" ${kalenderDivisionFilter === d.code ? "selected" : ""}>Divisi ${d.code}. ${d.name}</option>`;
    });

    container.innerHTML = `
      <div class="print-only">
        ${window.PrintEngine.createLandscapePrintHeader ? window.PrintEngine.createLandscapePrintHeader(proj, "JADWAL KALENDER PEKERJAAN PROYEK") : window.PrintEngine.createPrintHeader(proj, "JADWAL KALENDER PEKERJAAN PROYEK")}
      </div>
      <div class="page-header no-print">
        <div>
          <h2 class="page-header-title">📅 Kalender Proyek & Jadwal Pelaksanaan</h2>
          <div class="page-header-sub">Memuat detail jadwal tanggal per item pekerjaan/AHSP fisik, durasi standar versus realisasi lapangan, dan visualisasi timeline</div>
        </div>
        <div class="page-header-actions d-flex align-items-center flex-wrap" style="gap: 8px;">
          <button class="btn btn-outline-danger" onclick="App.confirmClearAllCalendarTasks()" title="Kosongkan semua data jadwal di kalender untuk di-generate ulang bersih">🗑️ Hapus Data</button>
          <button class="btn btn-primary" onclick="App.syncCalendarFromRab(true)" title="Sinkronkan & perbarui seluruh jadwal dari rincian detail divisi RAB">🔄 Sinkron RAB</button>
          <button class="btn btn-outline" onclick="App.openAddTaskModal()">+ Tambah Jadwal</button>
          <button class="btn btn-primary font-bold" onclick="App.printCurrentPage('panel-kalender', 'Kalender_Proyek')">🖨️ Cetak / Preview A4</button>
        </div>
      </div>

      <!-- Grid Kalender Proyek -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="card-title">Matriks Kalender Pelaksanaan Fisik Konstruksi</div>
        </div>
        <div class="card-body">
          ${calData.html}
        </div>
      </div>

      <!-- Filter Baris Divisi & Informasi Detail -->
      <div class="card mb-3 no-print" style="background: #f8fafc; border: 1px solid #e2e8f0;">
        <div class="card-body p-3 d-flex justify-content-between align-items-center flex-wrap" style="gap: 10px;">
          <div class="d-flex align-items-center" style="gap: 10px;">
            <label style="font-size: 12px; font-weight: 700; color: #334155; margin: 0;">Filter Divisi Pekerjaan:</label>
            <select class="form-control" style="width: auto; min-width: 260px; font-size: 12px; padding: 4px 10px;" onchange="App.setKalenderDivisionFilter(this.value)">
              ${divFilterOptions}
            </select>
          </div>
          <div style="font-size: 12px; color: #64748b;">
            Menampilkan <strong>${tasks.length}</strong> dari total <strong>${allTasks.length}</strong> detail pekerjaan fisik
          </div>
        </div>
      </div>

      <!-- Tabel Detail Pekerjaan -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div>
            <div class="card-title">Daftar Pekerjaan & Jadwal Tanggal (Start - Finish) Rinci per AHSP</div>
            <div class="text-muted" style="font-size: 11px; margin-top: 2px;">
              Memuat 2 baris penanggalan: <strong>Baris 1 (Standar Rencana)</strong> dan <strong>Baris 2 (Realisasi Lapangan Manual)</strong>. Pekerjaan <strong>Selesai</strong> otomatis terkunci aman.
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th style="width: 12%;" class="text-center">KODE AHSP</th>
                <th style="width: 28%;">URAIAN PEKERJAAN & DETAIL SPESIFIKASI</th>
                <th style="width: 28%;">PENANGGALAN (BARIS 1: STANDAR RENCANA • BARIS 2: LAPANGAN MANUAL)</th>
                <th class="text-center" style="width: 8%;">DURASI</th>
                <th class="text-center" style="width: 10%;">STATUS</th>
                <th style="width: 14%;">CATATAN KHUSUS</th>
                <th class="text-center no-print" style="width: 110px;">AKSI</th>
              </tr>
            </thead>
            <tbody>
              ${taskRows || `
                <tr>
                  <td colspan="7" class="p-0">
                    <div class="p-5 text-center" style="background: #f8fafc; border-radius: 8px;">
                      <div style="font-size: 40px; margin-bottom: 10px;">📅</div>
                      <div style="font-weight: 700; color: #1e293b; font-size: 15px; margin-bottom: 6px;">Jadwal Kalender Proyek Masih Kosong</div>
                      <div class="text-muted" style="font-size: 12.5px; max-width: 520px; margin: 0 auto 16px auto;">
                        Seluruh jadwal pekerjaan fisik telah dikosongkan. Klik tombol di bawah untuk membuat dan menyinkronkan jadwal secara otomatis berdasarkan seluruh volume dan OH dari Rincian Detail RAB.
                      </div>
                      <button class="btn btn-primary btn-md font-bold" onclick="App.syncCalendarFromRab(true)" style="padding: 9px 22px; font-size: 13px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                        🔄 Muat / Refresh Jadwal dari Rincian RAB
                      </button>
                    </div>
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      
    `;
  }

  function renderKoreksiView() {
    const container = document.getElementById("koreksiContent");
    if (!container) return;

    const proj = window.ProjectManager.getActiveProject() || {};
    const sheetHtml = window.SiteCorrection.generatePrintableSheetHtml(proj);
    container.innerHTML = `
      <div class="print-only">
        ${window.PrintEngine.createPrintHeader(proj, "LEMBAR PENGAWASAN & KOREKSI MUTU PEKERJAAN LAPANGAN")}
      </div>
      <div class="page-header no-print">
        <div>
          <h2 class="page-header-title">📝 Lembar Pengawasan & Koreksi Mutu Lapangan</h2>
          <div class="page-header-sub">Catatan temuan ketidaksesuaian mutu, instruksi perbaikan mandor, dan verifikasi paraf pengawas</div>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="App.openAddInspectionModal()">+ Catat Temuan Baru</button>
          <button class="btn btn-outline" onclick="App.printCurrentPage('panel-koreksi', 'Lembar_Koreksi_Mandor')">🖨️ Cetak A4 PDF</button>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          ${sheetHtml}
        </div>
      </div>
    `;
  }

  // 10. Berita Acara Pembayaran (BAP) View
  function createBapFromScheme(phaseIndex) {
    if (window.BapInvoicing && window.BapInvoicing.createBapFromScheme) {
      window.BapInvoicing.createBapFromScheme(phaseIndex);
      renderBapView();
      if (window.App && window.App.showLoading) {
        window.App.showLoading("Menerbitkan BAP...", "Berita Acara Pembayaran berhasil dibuat dari Skema Termin!");
        setTimeout(() => window.App.hideLoading(), 600);
      }
    }
  }

  function renderBapView() {
    const container = document.getElementById("bapContent");
    if (!container) return;

    const proj = (window.ProjectManager && window.ProjectManager.getActiveProject()) || {};
    const records = window.BapInvoicing.getBapRecords();
    const terminSchemes = (window.BapInvoicing && window.BapInvoicing.getTerminScheme)
      ? window.BapInvoicing.getTerminScheme(proj)
      : [];
    const contractTotal = (terminSchemes.length > 0 && terminSchemes[0].contractTotal) 
      ? terminSchemes[0].contractTotal 
      : ((window.RabCalculator && window.RabCalculator.calculateProjectRab(proj)) ? window.RabCalculator.calculateProjectRab(proj).grandTotal : (Number(proj.contractBudget) || 0));

    let cardsHtml = "";
    records.forEach(bap => {
      const printableBap = window.BapInvoicing.generatePrintableBapHtml(bap);
      cardsHtml += `
        <div class="card mb-4 bap-card-item" id="bap-card-${bap.id || bap.bapNumber}">
          <div class="card-header no-print d-flex justify-content-between align-items-center flex-wrap" style="background-color: #f8fafc; border-bottom: 1px solid var(--color-border); padding: 12px 18px; gap: 10px;">
            <div class="d-flex align-items-center" style="gap: 10px;">
              <span style="font-weight: 700; font-size: 15px; color: #0f172a;">${bap.phaseTitle}</span>
              <span class="badge badge-light" style="font-family: monospace; font-size: 12px;">${bap.bapNumber}</span>
              <span class="badge badge-success">${bap.status || 'Disetujui'}</span>
            </div>
            <div class="card-actions d-flex align-items-center flex-wrap" style="gap: 8px;">
              <button class="btn btn-sm btn-outline" onclick="App.openEditBapModal('${bap.id || bap.bapNumber}')" style="display: inline-flex; align-items: center; gap: 5px;">
                ✏️ Edit BAP
              </button>
              <button class="btn btn-sm btn-primary font-bold" onclick="App.printSingleBap('${bap.id || bap.bapNumber}')" style="display: inline-flex; align-items: center; gap: 5px;">
                🖨️ Cetak / Preview A4
              </button>
              <button class="btn btn-sm btn-danger" onclick="App.deleteBap('${bap.id || bap.bapNumber}')" style="display: inline-flex; align-items: center; gap: 5px;">
                🗑️ Hapus
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            ${printableBap}
          </div>
        </div>
      `;
    });

    // Rows Draft Skema Pembayaran Termin
    let totalPortion = 0;
    let schemeRowsHtml = "";
    terminSchemes.forEach((ts, sIdx) => {
      totalPortion += Number(ts.portionPercent) || 0;
      schemeRowsHtml += `
        <tr style="${ts.isIssued ? 'background: #f8fafc;' : ''}">
          <td class="text-center font-bold" style="vertical-align: middle;">${ts.phaseIndex}</td>
          <td style="vertical-align: middle;">
            <div style="font-weight: 700; color: #0f172a; font-size: 12.5px;">${ts.title}</div>
            <div class="text-muted" style="font-size: 11px; margin-top: 2px;"><strong>Tahapan Fisik:</strong> ${ts.criteria || '-'}</div>
            ${ts.notes ? `<div class="text-muted" style="font-size: 10.5px; font-style: italic; color: #475569; margin-top: 1px;">Keterangan: ${ts.notes}</div>` : ''}
          </td>
          <td class="text-center font-bold" style="vertical-align: middle;">
            <span class="badge badge-primary" style="font-size: 11.5px; padding: 4px 8px;">${ts.targetProgress}%</span>
          </td>
          <td class="text-center font-bold" style="vertical-align: middle; color: #1e40af; font-size: 12.5px;">
            ${ts.portionPercent}%
          </td>
          <td class="text-right font-bold" style="vertical-align: middle;">
            ${window.CurrencyUtil.formatRupiah(ts.grossAmount, false, true)}
          </td>
          <td class="text-right text-muted" style="vertical-align: middle; font-size: 11.5px;">
            ${ts.dpDeduction > 0 ? window.CurrencyUtil.formatRupiah(ts.dpDeduction, false, true) : '-'}
          </td>
          <td class="text-right text-muted" style="vertical-align: middle; font-size: 11.5px;">
            ${ts.retentionDeduction > 0 ? window.CurrencyUtil.formatRupiah(ts.retentionDeduction, false, true) : '-'}
          </td>
          <td class="text-right font-bold" style="vertical-align: middle; color: #059669; font-size: 13px;">
            ${window.CurrencyUtil.formatRupiah(ts.netPayable, false, true)}
          </td>
          <td class="text-center" style="vertical-align: middle;">
            <span class="badge ${ts.isIssued ? 'badge-success' : 'badge-warning'}" style="font-size: 11px;">
              ${ts.bapStatus}
            </span>
          </td>
          <td class="text-center no-print" style="vertical-align: middle; white-space: nowrap;">
            <div style="display: flex; gap: 4px; justify-content: center; align-items: center; flex-wrap: nowrap;">
              <button class="btn btn-sm ${ts.isIssued ? 'btn-outline' : 'btn-primary'}" onclick="App.createBapFromScheme(${ts.phaseIndex})" style="font-size: 11px; padding: 4px 7px;" title="${ts.isIssued ? 'Terbitkan Ulang BAP' : 'Buat BAP Otomatis'}">
                ${ts.isIssued ? '🔄 Terbit Ulang' : '⚡ BAP'}
              </button>
              <button class="btn btn-sm btn-secondary" onclick="App.openEditTerminModal(${ts.phaseIndex})" style="font-size: 11px; padding: 4px 7px;" title="Edit Porsi & Data Termin">
                ✏️ Edit
              </button>
              <button class="btn btn-sm btn-danger" onclick="App.deleteTerminScheme(${ts.phaseIndex})" style="font-size: 11px; padding: 4px 7px;" title="Hapus Termin Ini">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="page-header no-print">
        <div>
          <h2 class="page-header-title">📑 Berita Acara Pembayaran (BAP) & Skema Termin</h2>
          <div class="page-header-sub">Manajemen penagihan termin konstruksi, draft skema pembayaran resmi, pemotongan uang muka & retensi 5%</div>
        </div>
        <div class="page-header-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-sm btn-primary" onclick="App.openAddTerminModal()">+ Tambah Termin Baru</button>
          <button class="btn btn-sm btn-outline" onclick="App.resetTerminSchemeToDefault()">↺ Reset Standar PUPR</button>
          <button class="btn btn-sm btn-secondary" onclick="App.openCreateBapModal()">+ Tambah BAP Manual</button>
          <button class="btn btn-sm btn-outline" onclick="App.printAllBap()">🖨️ Cetak Semua BAP (A4)</button>
        </div>
      </div>

      <!-- KARTU DRAFT SKEMA PEMBAYARAN TERMIN OTOMATIS -->
      <div class="card mb-4 no-print" style="border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <div class="card-header d-flex justify-content-between align-items-center flex-wrap" style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 18px;">
          <div class="card-title" style="color: #0f172a; font-weight: 800; font-size: 14px; margin: 0;">
            📋 DRAFT SKEMA PEMBAGIAN TERMIN PEMBAYARAN PROYEK (STANDAR SE PUPR 2026)
          </div>
          <div class="card-actions">
            <span class="badge badge-light" style="font-size: 11px; padding: 4px 8px; border: 1px solid #e2e8f0;">
              Total Anggaran Kontrak: ${window.CurrencyUtil.formatRupiah(contractTotal, false, true)}
            </span>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-bordered mb-0" style="font-size: 12px;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="width: 4%" class="text-center">TERMIN</th>
                <th style="width: 25%">TAHAPAN & SYARAT BOBOT PRESTASI FISIK</th>
                <th style="width: 9%" class="text-center">TARGET FISIK</th>
                <th style="width: 8%" class="text-center">PORSI %</th>
                <th style="width: 14%" class="text-right">NILAI BRUTO</th>
                <th style="width: 9%" class="text-right">POT. DP</th>
                <th style="width: 9%" class="text-right">RETENSI</th>
                <th style="width: 14%" class="text-right">NETTO DIBAYAR</th>
                <th style="width: 10%" class="text-center">STATUS BAP</th>
                <th style="width: 16%" class="text-center no-print">AKSI KONTROL</th>
              </tr>
            </thead>
            <tbody>
              ${schemeRowsHtml || '<tr><td colspan="10" class="text-center p-3 text-muted">Belum ada tahapan termin. Klik "+ Tambah Termin Baru" atau "↺ Reset Standar PUPR".</td></tr>'}
            </tbody>
          </table>
        </div>
        <div class="card-footer p-2 d-flex justify-content-between align-items-center flex-wrap" style="font-size: 11.5px; background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 8px 16px;">
          <div>
            Total Porsi Kumulatif: <strong style="color: ${totalPortion === 100 ? '#16a34a' : '#d97706'}">${totalPortion}%</strong> ${totalPortion === 100 ? '✅ (Sesuai 100% Kontrak)' : '⚠️ (Perhatian: Total porsi belum 100%)'}
          </div>
          <div class="text-muted">
            💡 <em>Klik <strong>"⚡ BAP"</strong> untuk membuat BAP otomatis, <strong>"✏️ Edit"</strong> untuk mengubah persentase/kriteria termin, atau <strong>"+ Tambah Termin Baru"</strong>.</em>
          </div>
        </div>
      </div>

      <!-- DAFTAR DOKUMEN BAP RESMI TERCETAK -->
      <div class="d-flex justify-content-between align-items-center mb-3 no-print">
        <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0;">
          📄 Dokumen Berita Acara Pembayaran (BAP) Sah
        </h3>
        <span class="text-muted" style="font-size: 12px;">
          ${records.length} Dokumen BAP Terbit
        </span>
      </div>

      <div class="bap-documents-list">
        ${cardsHtml || '<div class="card p-4 text-center text-muted">Belum ada dokumen BAP diterbitkan. Silakan klik tombol "⚡ BAP" pada tabel Skema Termin di atas.</div>'}
      </div>
    `;
  }

  function renderProposalView() {
    const container = document.getElementById("proposalContent");
    if (!container) return;

    const proj = window.ProjectManager.getActiveProject() || {};
    const proposalHtml = window.ProposalGen.generateProposalHtml();

    container.innerHTML = `
      <div class="page-header no-print">
        <div>
          <h2 class="page-header-title">📖 Dokumen Proposal Rencana Anggaran Biaya</h2>
          <div class="page-header-sub">Format bundel cetak A4 lengkap: Cover eksekutif, lembar pengesahan, daftar isi, rekapitulasi & lampiran</div>
        </div>
      </div>

      <div class="proposal-preview-wrapper" style="background-color: transparent; border: none; padding: 0; margin: 0;">
        ${proposalHtml}
      </div>
    `;

    // Render S-Curve di dalam proposal
    const embedWrapper = document.getElementById("proposal-scurve-embed");
    if (embedWrapper) {
      const sched = window.SCurveDiagram.getScheduleData();
      window.SCurveDiagram.renderSvgChart("proposal-scurve-embed", sched);
    }
  }

  // 12. Manajemen Proyek View
  function renderProyekView() {
    const container = document.getElementById("proyekContent");
    if (!container) return;

    const projects = window.ProjectManager.getAllProjects();
    const active = window.ProjectManager.getActiveProject() || {};

    let rowsHtml = "";
    projects.forEach((p, idx) => {
      const isActive = active && p.id === active.id;
      rowsHtml += `
        <tr class="${isActive ? 'table-active' : ''}">
          <td class="text-center">${idx + 1}</td>
          <td>
            <strong>${p.name}</strong> ${isActive ? '<span class="badge badge-success ml-2">Sedang Dibuka</span>' : ''}
            <div class="text-muted" style="font-size: 11px;">Lokasi: ${p.location} | Mulai: ${p.startDate}</div>
          </td>
          <td>${p.owner}</td>
          <td>${p.contractor}</td>
          <td class="text-center">${p.regionName || 'Standar'}</td>
          <td class="text-center no-print">
            ${!isActive ? `<button class="btn btn-sm btn-primary" onclick="App.switchProject('${p.id}')">Buka</button>` : ''}
            <button class="btn btn-sm btn-outline" onclick="App.exportSingleProject('${p.id}')">Export JSON</button>
            <button class="btn btn-sm btn-danger" onclick="App.deleteProject('${p.id}')" ${projects.length <= 1 ? 'disabled' : ''}>Hapus</button>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>Daftar Proyek Rencana Anggaran Biaya</span>
            <span class="badge badge-light">Tersimpan di Browser LocalStorage</span>
          </div>
          <div class="card-actions no-print">
            <button class="btn btn-primary" onclick="App.openCreateProjectModal()">+ Buat Proyek Baru</button>
            <button class="btn btn-outline" onclick="App.duplicateCurrentProject()">Gandakan Proyek Ini</button>
            <button class="btn btn-outline" onclick="App.exportCurrentProject()">Export Backup JSON</button>
            <button class="btn btn-outline" onclick="document.getElementById('importProjectInput').click()">Import Proyek JSON</button>
            <input type="file" id="importProjectInput" style="display: none" accept=".json" onchange="App.handleImportProject(this)">
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 5%">No</th>
                  <th style="width: 35%">Nama Proyek & Lokasi</th>
                  <th style="width: 20%">Pemilik Proyek</th>
                  <th style="width: 20%">Kontraktor</th>
                  <th style="width: 10%">Wilayah</th>
                  <th style="width: 10%" class="no-print">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // MODAL & HANDLERS ACTIONS
  // ==========================================

    function openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) {
      m.style.display = "flex";
      setTimeout(() => m.classList.add("open"), 10);
    }
  }

  function closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) {
      m.classList.remove("open");
      setTimeout(() => {
        if (!m.classList.contains("open")) {
          m.style.display = "none";
        }
      }, 150);
    }
  }

  function togglePpn(checked) {
    const proj = window.ProjectManager.getActiveProject();
    if (proj) {
      proj.includePpn = checked;
      window.ProjectManager.updateActiveProject(proj);
      renderRekapRabView();
    }
  }

  function jumpToDivision(divId) {
    switchTab("detail-rab");
    setTimeout(() => {
      const el = document.getElementById(`div-card-${divId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function openAddDivisionModal() {
    const proj = window.ProjectManager.getActiveProject();
    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
    const nextCode = romanNumerals[proj && proj.divisions ? proj.divisions.length : 0] || `${(proj && proj.divisions ? proj.divisions.length : 0) + 1}`;

    showFormModal({
      title: "Tambah Divisi Pekerjaan Baru",
      subtitle: "Tambahkan kelompok divisi pekerjaan baru pada Rencana Anggaran Biaya",
      fields: [
        { name: "code", label: "Nomor / Kode Divisi (Angka Romawi)", type: "text", value: nextCode, required: true, placeholder: "Misal: XI atau 11", help: "Standar penomoran divisi konstruksi SE PUPR (I, II, III...)" },
        { name: "name", label: "Nama / Uraian Divisi Pekerjaan", type: "text", placeholder: "Misal: PEKERJAAN LANSEKAP & DRAINASE LINGKUNGAN", required: true, help: "Gunakan huruf kapital untuk kerapian standar pelaporan resmi" }
      ],
      submitText: "+ Tambah Divisi",
      onSubmit: (data) => {
        if (data.name && data.name.trim()) {
          const divCode = (data.code && data.code.trim()) ? data.code.trim().toUpperCase() : nextCode;
          window.RabCalculator.addDivision(data.name.trim().toUpperCase(), divCode);
          const activeP = window.ProjectManager.getActiveProject();
          if (activeP) {
            window.RabCalculator.calculateProjectRab(activeP);
          }
          renderCurrentTabContent();
        }
      }
    });
  }

  function openEditDivisionModal(divisionId) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !proj.divisions) return;
    const div = proj.divisions.find(d => d.id === divisionId);
    if (!div) return;

    showFormModal({
      title: "Edit Divisi Pekerjaan",
      subtitle: `Mengubah data Divisi ${div.code}. ${div.name}`,
      fields: [
        { name: "code", label: "Nomor / Kode Divisi (Angka Romawi)", type: "text", value: div.code, required: true, placeholder: "Contoh: I, II, X, XI" },
        { name: "name", label: "Nama / Uraian Divisi Pekerjaan", type: "text", value: div.name, required: true, placeholder: "Misal: PEKERJAAN PERSIAPAN", help: "Gunakan huruf kapital sesuai format resmi PUPR" }
      ],
      submitText: "Simpan Perubahan Divisi",
      onSubmit: (data) => {
        if (data.name && data.name.trim()) {
          window.RabCalculator.updateDivision(divisionId, {
            code: (data.code || div.code).trim().toUpperCase(),
            name: data.name.trim().toUpperCase()
          });
          const activeP = window.ProjectManager.getActiveProject();
          if (activeP) {
            window.RabCalculator.calculateProjectRab(activeP);
          }
          renderCurrentTabContent();
        }
      }
    });
  }

  function deleteDivision(divId) {
    const proj = window.ProjectManager.getActiveProject();
    const div = proj && proj.divisions ? proj.divisions.find(d => d.id === divId) : null;
    const divLabel = div ? `DIVISI ${div.code}. ${div.name}` : "divisi ini";

    showConfirmModal({
      title: "Hapus Divisi Pekerjaan",
      message: `Apakah Anda yakin ingin menghapus <strong>${divLabel}</strong> beserta seluruh baris item pekerjaan di dalamnya? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Ya, Hapus Divisi",
      onConfirm: () => {
        window.RabCalculator.removeDivision(divId);
        const activeP = window.ProjectManager.getActiveProject();
        if (activeP) {
          window.RabCalculator.calculateProjectRab(activeP);
        }
        renderCurrentTabContent();
      }
    });
  }

  function deleteRabItem(itemId) {
    showConfirmModal({
      title: "Hapus Item Pekerjaan",
      message: "Apakah Anda yakin ingin menghapus baris item pekerjaan ini dari daftar RAB?",
      confirmText: "Ya, Hapus Item",
      onConfirm: () => {
        window.RabCalculator.removeItem(itemId);
        const activeP = window.ProjectManager.getActiveProject();
        if (activeP) {
          window.RabCalculator.calculateProjectRab(activeP);
        }
        renderCurrentTabContent();
      }
    });
  }

  // Formulir Pintar Tambah & Edit Item Pekerjaan Terintegrasi AHSP PUPR No. 47/2026
  function openRabItemFormModal(targetDivisionId, existingItem = null) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !proj.divisions || proj.divisions.length === 0) {
      showNotificationModal({
        title: "Belum Ada Divisi",
        icon: "ℹ️",
        type: "info",
        contentHtml: `<div style="font-size: 13px;">Belum ada kelompok divisi pekerjaan pada proyek ini. Silakan buat divisi pekerjaan terlebih dahulu.</div>`,
        confirmText: "Buat Divisi",
        onConfirm: openAddDivisionModal
      });
      return;
    }

    const isEdit = !!existingItem;
    const title = isEdit ? "Edit Item Pekerjaan" : "Tambah Item Pekerjaan Baru";
    const subtitle = isEdit
      ? `Mengubah rincian item: ${existingItem.name}`
      : "Pustaka Resmi AHSP PUPR No. 47/SE/Dk/2026 & Spesifikasi Proyek";
    const submitText = isEdit ? "Simpan Perubahan Item" : "Tambah ke RAB";

    let divOptionsHtml = "";
    proj.divisions.forEach(d => {
      const isSelected = (d.id === targetDivisionId) || (!targetDivisionId && d === proj.divisions[0]);
      divOptionsHtml += `<option value="${d.id}" ${isSelected ? 'selected' : ''}>DIVISI ${d.code}. ${d.name}</option>`;
    });

    const categories = (window.AhspEngine && window.AhspEngine.getCategories) ? window.AhspEngine.getCategories() : [];
    let catOptionsHtml = `<option value="ALL">Semua Kategori (Pustaka ${(window.MASTER_AHSP || []).length || 2577} AHSP)</option>`;
    categories.forEach(c => {
      catOptionsHtml += `<option value="${c}">${c}</option>`;
    });

    const initCode = existingItem ? (existingItem.code || "") : "";
    const initAhspId = existingItem ? (existingItem.ahspId || "") : "";
    const initName = existingItem ? (existingItem.name || "") : "";
    const initUnit = existingItem ? (existingItem.unit || "m2") : "m2";
    const initVolume = existingItem ? (Number(existingItem.volume) || 1.0) : 1.0;
    const initPrice = existingItem ? (Number(existingItem.price) || 0) : 0;
    const initNotes = existingItem ? (existingItem.notes || "") : "";
    const initTotal = Math.round(initVolume * initPrice);

    // Initial step: If editing, default straight to Step 2 (Volume & Simpan) on mobile
    const defaultStep = isEdit ? "2" : "1";

    const customBodyHtml = `
      <div class="rab-modal-container" id="rabModalContainer" data-active-step="${defaultStep}">
        <!-- Mobile Segmented Tabs (Screens <= 860px) -->
        <div class="rab-modal-mobile-tabs" id="modalMobileTabs">
          <button type="button" class="rab-tab-btn ${defaultStep === '1' ? 'active' : ''}" id="modalTabBtnStep1">
            <span class="tab-step-num">1</span>
            <span>Pilih AHSP</span>
            <span class="tab-check-icon" id="tab1Check" style="${initCode ? 'display:inline-block;' : 'display:none;'}">✓</span>
          </button>
          <button type="button" class="rab-tab-btn ${defaultStep === '2' ? 'active' : ''}" id="modalTabBtnStep2">
            <span class="tab-step-num">2</span>
            <span>Volume & Simpan</span>
            <span class="tab-badge-indicator" id="tab2Indicator">Langkah 2</span>
          </button>
        </div>

        <!-- 2-Column Responsive Grid -->
        <div class="rab-modal-grid">
          <!-- LEFT PANEL: Pustaka AHSP Standar PUPR (Step 1) -->
          <div class="rab-modal-col rab-col-left" id="modalColLeft">
            <div class="rab-panel-card left-panel-inner">
              <div class="rab-panel-header">
                <div class="rab-panel-title">
                  <span>⚡ Pustaka AHSP PUPR No. 47/2026</span>
                </div>
                <span class="badge badge-primary" style="font-size: 10.5px; padding: 2px 7px;" id="modalAhspBadgeTotal">
                  ${(window.MASTER_AHSP || []).length || 2577} Item
                </span>
              </div>

              <!-- Filter & Search Row -->
              <div class="rab-filter-row">
                <div>
                  <select id="modalAhspCatFilter" class="form-control form-control-sm" style="font-size: 11.5px; padding: 4px 6px; height: 32px; background: #ffffff;">
                    ${catOptionsHtml}
                  </select>
                </div>
                <div class="rab-search-input-wrap">
                  <input type="text" id="modalAhspSearchInput" class="form-control form-control-sm" placeholder="🔍 Cari AHSP (plesteran, sloof, pipa...)" style="font-size: 11.5px; padding: 4px 26px 4px 8px; height: 32px; background: #ffffff;">
                  <button type="button" id="modalAhspSearchClear" class="btn-clear-search" style="display: none;">&times;</button>
                </div>
              </div>

              <!-- Interactive AHSP Card List -->
              <div class="rab-ahsp-results-wrap" id="modalAhspResultsWrap">
                <div class="rab-ahsp-card-list" id="modalAhspCardList">
                  <!-- Diisi secara dinamis -->
                </div>
              </div>

              <!-- Footer info -->
              <div class="rab-panel-footer-info">
                <span id="modalAhspHelpText" style="font-size: 11px; color: #64748b;">Memuat item AHSP...</span>
                <span style="font-size: 10.5px; color: #2563eb; font-weight: 700;">💡 Klik untuk memilih</span>
              </div>
            </div>
          </div>

          <!-- RIGHT PANEL: Divisi, Spesifikasi & Volume (Step 2) -->
          <div class="rab-modal-col rab-col-right" id="modalColRight">
            <div class="rab-panel-card right-panel-inner">
              <!-- Divisi Tujuan -->
              <div class="form-group mb-2">
                <label class="rab-field-label">
                  <span>🏛️ Divisi Pekerjaan Tujuan</span>
                  <span class="modal-field-required">*</span>
                </label>
                <select class="form-control form-control-sm font-semibold" name="divisionId" id="modalItemDivSelect" required style="font-size: 12px; height: 32px; padding: 4px 8px;">
                  ${divOptionsHtml}
                </select>
              </div>

              <!-- Selected Item Summary & Locked Badges -->
              <div class="rab-selected-item-box" id="modalSelectedItemBox">
                <div class="d-flex justify-content-between align-items-center mb-1 flex-wrap" style="gap: 4px;">
                  <div class="d-flex align-items-center gap-1">
                    <span class="rab-badge-code" id="modalItemCodeBadge">${initCode ? '[' + initCode + ']' : '[Pilih AHSP Di Kiri]'}</span>
                    <span class="badge" style="font-size: 9.5px; background: #e0e7ff; color: #3730a3;">🔒 Standar PUPR</span>
                  </div>
                  <span class="rab-badge-hsp" id="modalItemPriceBadge">
                    ${initPrice ? 'Rp ' + window.CurrencyUtil.formatNumber(initPrice, 0) + ' / ' + initUnit : 'HSP Terkunci'}
                  </span>
                </div>
                <textarea class="form-control font-bold rab-item-name-input" name="name" id="modalItemName" rows="2" required placeholder="Uraian / Nama Pekerjaan sesuai AHSP atau DED">${initName}</textarea>
                
                <!-- Hidden inputs for form submit payload -->
                <input type="hidden" name="code" id="modalItemCode" value="${initCode}">
                <input type="hidden" name="ahspId" id="modalItemAhspId" value="${initAhspId}">
                <input type="hidden" name="unit" id="modalItemUnit" value="${initUnit}">
                <input type="hidden" name="price" id="modalItemPrice" value="${initPrice}">
              </div>

              <!-- VOLUME PEKERJAAN (Compact, Refined & Balanced) -->
              <div class="rab-volume-card">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label class="rab-volume-label" for="modalItemVolume">
                    <span>Volume Kuantitas</span>
                    <span class="modal-field-required">*</span>
                  </label>
                  <span class="text-muted" style="font-size: 10.5px;">Gunakan titik (.) untuk desimal</span>
                </div>
                <div class="rab-volume-input-group">
                  <input type="number" step="any" min="0" inputmode="decimal" class="form-control rab-volume-input" name="volume" id="modalItemVolume" value="${initVolume}" required placeholder="0.00">
                  <div class="rab-volume-unit-tag" id="modalItemVolumeUnitBadge">${initUnit}</div>
                </div>
              </div>

              <!-- REAL-TIME SUBTOTAL BANNER (Sleek Emerald Accent Bar) -->
              <div class="rab-subtotal-bar" id="modalItemLiveTotalBox">
                <div>
                  <div class="rab-subtotal-bar-label">Subtotal Estimasi RAB</div>
                  <div id="modalItemFormulaText" class="rab-subtotal-bar-formula">
                    ${window.CurrencyUtil.formatNumber(initVolume, 2)} ${initUnit} &times; ${window.CurrencyUtil.formatRupiah(initPrice, false, true)}
                  </div>
                </div>
                <div id="modalItemSubtotalText" class="rab-subtotal-bar-amount">
                  ${window.CurrencyUtil.formatRupiah(initTotal, false, true)}
                </div>
              </div>

              <!-- Notes (Optional) -->
              <div class="form-group mb-0">
                <input type="text" class="form-control form-control-sm rab-notes-input" name="notes" id="modalItemNotes" value="${initNotes}" placeholder="Catatan teknis / spesifikasi lapangan (opsional, misal: Mutu K-250, Granit 60x60)">
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    showFormModal({
      title: title,
      subtitle: subtitle,
      dialogClass: "modal-rab-item",
      customBodyHtml: customBodyHtml,
      submitText: submitText,
      onRender: (modalBody) => {
        const container = modalBody.querySelector("#rabModalContainer");
        const tabBtn1 = modalBody.querySelector("#modalTabBtnStep1");
        const tabBtn2 = modalBody.querySelector("#modalTabBtnStep2");
        const tab1Check = modalBody.querySelector("#tab1Check");

        const modalDialog = modalBody.closest(".modal-dialog");
        const modalFooter = modalDialog ? modalDialog.querySelector(".modal-footer") : null;
        const cancelBtn = modalFooter ? modalFooter.querySelector("#formModalCancelBtn") : null;
        const submitBtn = modalFooter ? modalFooter.querySelector("#formModalSubmitBtn") : null;

        const catFilter = modalBody.querySelector("#modalAhspCatFilter");
        const searchInput = modalBody.querySelector("#modalAhspSearchInput");
        const searchClearBtn = modalBody.querySelector("#modalAhspSearchClear");
        const cardList = modalBody.querySelector("#modalAhspCardList");
        const helpText = modalBody.querySelector("#modalAhspHelpText");

        const itemCode = modalBody.querySelector("#modalItemCode");
        const itemAhspId = modalBody.querySelector("#modalItemAhspId");
        const itemUnit = modalBody.querySelector("#modalItemUnit");
        const itemName = modalBody.querySelector("#modalItemName");
        const itemVolume = modalBody.querySelector("#modalItemVolume");
        const itemPrice = modalBody.querySelector("#modalItemPrice");
        const itemNotes = modalBody.querySelector("#modalItemNotes");

        const itemCodeBadge = modalBody.querySelector("#modalItemCodeBadge");
        const itemPriceBadge = modalBody.querySelector("#modalItemPriceBadge");
        const volumeUnitBadge = modalBody.querySelector("#modalItemVolumeUnitBadge");
        const formulaText = modalBody.querySelector("#modalItemFormulaText");
        const subtotalText = modalBody.querySelector("#modalItemSubtotalText");

        // Sinkronisasi tombol footer modal sesuai tab aktif & ukuran layar (Anti-Tombol Ganda)
        function updateFooterButtons(stepNum) {
          if (!cancelBtn || !submitBtn) return;
          const isMobile = window.innerWidth <= 860;
          if (isMobile) {
            if (String(stepNum) === "1") {
              cancelBtn.textContent = "Batal";
              cancelBtn.onclick = (e) => { if (e) e.preventDefault(); hideFormModal(); };
              submitBtn.textContent = "Lanjut: Volume →";
              submitBtn.type = "button";
              submitBtn.onclick = (e) => {
                e.preventDefault();
                if (!itemCode.value) {
                  showNotificationModal({
                    title: "Pilih Item Pekerjaan",
                    icon: "ℹ️",
                    type: "info",
                    contentHtml: `<div style="font-size: 13px;">Silakan sentuh salah satu item pekerjaan dari daftar AHSP sebelum melanjutkan ke pengisian volume.</div>`,
                    confirmText: "Mengerti"
                  });
                  return;
                }
                setStep(2);
              };
            } else {
              cancelBtn.textContent = "← Ganti AHSP";
              cancelBtn.onclick = (e) => {
                e.preventDefault();
                setStep(1);
              };
              submitBtn.textContent = isEdit ? "✓ Simpan Perubahan" : "✓ Tambah ke RAB";
              submitBtn.type = "submit";
              submitBtn.onclick = null;
            }
          } else {
            // Desktop standard footer
            cancelBtn.textContent = "Batal";
            cancelBtn.onclick = (e) => { if (e) e.preventDefault(); hideFormModal(); };
            submitBtn.textContent = isEdit ? "Simpan Perubahan Item" : "Tambah ke RAB";
            submitBtn.type = "submit";
            submitBtn.onclick = null;
          }
        }

        // Fungsi berpindah tab pada Mobile
        function setStep(stepNum) {
          if (!container) return;
          container.setAttribute("data-active-step", String(stepNum));
          if (tabBtn1 && tabBtn2) {
            if (String(stepNum) === "1") {
              tabBtn1.classList.add("active");
              tabBtn2.classList.remove("active");
            } else {
              tabBtn1.classList.remove("active");
              tabBtn2.classList.add("active");
            }
          }
          updateFooterButtons(stepNum);
          if (String(stepNum) === "2") {
            setTimeout(() => {
              if (itemVolume) {
                itemVolume.focus();
                itemVolume.select();
              }
            }, 80);
          }
        }

        if (tabBtn1) tabBtn1.addEventListener("click", () => setStep(1));
        if (tabBtn2) tabBtn2.addEventListener("click", () => setStep(2));
        updateFooterButtons(defaultStep);

        const resizeHandler = () => {
          const currentStep = container ? container.getAttribute("data-active-step") || "1" : "1";
          updateFooterButtons(currentStep);
        };
        window.addEventListener("resize", resizeHandler);

        // Kalkulasi live subtotal
        function updateLiveSubtotal() {
          const v = parseFloat(itemVolume.value) || 0;
          const p = parseFloat(itemPrice.value) || 0;
          const u = itemUnit.value || "m2";
          const tot = Math.round(v * p);
          if (formulaText) {
            formulaText.innerHTML = `${window.CurrencyUtil.formatNumber(v, 2)} ${u} &times; ${window.CurrencyUtil.formatRupiah(p, false, true)}`;
          }
          if (subtotalText) {
            subtotalText.innerHTML = window.CurrencyUtil.formatRupiah(tot, false, true);
          }
          if (volumeUnitBadge && u) {
            volumeUnitBadge.textContent = u;
          }
          if (itemPriceBadge && p) {
            itemPriceBadge.textContent = `Rp ${window.CurrencyUtil.formatNumber(p, 0)} / ${u}`;
          }
        }

        if (itemVolume) {
          itemVolume.addEventListener("input", updateLiveSubtotal);
        }

        // Terapkan AHSP yang dipilih
        function applySelectedAhsp(ahsp) {
          if (!ahsp) return;
          const hspInfo = (window.AhspEngine && window.AhspEngine.calculateHsp)
            ? window.AhspEngine.calculateHsp(ahsp)
            : { finalHsp: ahsp.hsp || 0, subtotalTenaga: 0, subtotalBahan: 0, overheadPercent: 0, eOverhead: 0 };

          itemCode.value = ahsp.code;
          itemAhspId.value = ahsp.id;
          itemName.value = ahsp.name;
          itemUnit.value = ahsp.unit;
          itemPrice.value = hspInfo.finalHsp;

          if (itemCodeBadge) {
            itemCodeBadge.textContent = `[${ahsp.code}]`;
          }
          if (itemPriceBadge) {
            itemPriceBadge.textContent = `Rp ${window.CurrencyUtil.formatNumber(hspInfo.finalHsp, 0)} / ${ahsp.unit}`;
          }
          if (volumeUnitBadge) {
            volumeUnitBadge.textContent = ahsp.unit;
          }
          if (tab1Check) {
            tab1Check.style.display = "inline-block";
          }

          updateLiveSubtotal();

          // Highlight card di card list
          if (cardList) {
            cardList.querySelectorAll(".rab-ahsp-card").forEach(c => {
              if (c.getAttribute("data-ahsp-id") === ahsp.id) {
                c.classList.add("active");
                if (!c.querySelector(".rab-selected-chip")) {
                  const chip = document.createElement("span");
                  chip.className = "rab-selected-chip";
                  chip.textContent = "✓ Terpilih";
                  c.appendChild(chip);
                }
              } else {
                c.classList.remove("active");
                const ch = c.querySelector(".rab-selected-chip");
                if (ch) ch.remove();
              }
            });
          }

          // Otomatis pindah ke Step 2 jika di layar mobile (< 860px)
          if (window.innerWidth <= 860) {
            setTimeout(() => {
              setStep(2);
            }, 120);
          } else {
            setTimeout(() => {
              if (itemVolume) {
                itemVolume.focus();
                itemVolume.select();
              }
            }, 60);
          }
        }

        // Render card list AHSP
        function populateAhspList() {
          const q = (searchInput.value || "").toLowerCase().trim();
          const cat = catFilter.value;
          const allList = (window.MASTER_AHSP || []);

          let matches = allList;
          if (cat && cat !== "ALL") {
            matches = matches.filter(a => a.category === cat);
          }
          if (q) {
            matches = matches.filter(a =>
              (a.name && a.name.toLowerCase().includes(q)) ||
              (a.code && a.code.toLowerCase().includes(q)) ||
              (a.bidang && a.bidang.toLowerCase().includes(q)) ||
              (a.divisi && a.divisi.toLowerCase().includes(q)) ||
              (a.category && a.category.toLowerCase().includes(q)) ||
              (a.tags && Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(q)))
            );
          }

          const topItems = matches.slice(0, 50);
          if (topItems.length === 0) {
            cardList.innerHTML = `
              <div style="text-align: center; padding: 28px 12px; color: #94a3b8; font-size: 12px;">
                🔍 Tidak ditemukan item AHSP yang cocok dengan "<strong>${q}</strong>".
              </div>
            `;
          } else {
            let cardsHtml = "";
            const currentAhspId = itemAhspId.value || "";
            topItems.forEach(a => {
              const hspInfo = (window.AhspEngine && window.AhspEngine.calculateHsp) ? window.AhspEngine.calculateHsp(a) : null;
              const hspVal = hspInfo ? hspInfo.finalHsp : Math.floor(Number(a.hsp_base) || Number(a.hsp) || 0);
              const isSel = (a.id === currentAhspId) || (a.code === itemCode.value && !currentAhspId);

              let bClass = "ck";
              let bText = a.bidang || "Cipta Karya";
              if (bText.includes("Marga")) bClass = "bm";
              else if (bText.includes("Air") || bText.includes("SDA")) bClass = "sda";
              else if (bText.includes("SMKK") || bText.includes("K3")) bClass = "smkk";

              cardsHtml += `
                <div class="rab-ahsp-card ${isSel ? 'active' : ''}" data-ahsp-id="${a.id}" tabindex="0" role="button" title="Pilih [${a.code}] ${a.name}">
                  <div class="rab-ahsp-card-header">
                    <div class="d-flex align-items-center gap-1">
                      <span class="rab-card-code">${a.code}</span>
                      <span class="rab-bidang-tag ${bClass}">${bText}</span>
                    </div>
                    <span class="rab-card-price">Rp ${window.CurrencyUtil.formatNumber(hspVal)} / ${a.unit}</span>
                  </div>
                  <div class="rab-ahsp-card-name">${a.name}</div>
                  ${isSel ? '<span class="rab-selected-chip">✓ Terpilih</span>' : ''}
                </div>
              `;
            });
            cardList.innerHTML = cardsHtml;

            // Bind click & keydown ke card
            cardList.querySelectorAll(".rab-ahsp-card").forEach(card => {
              card.addEventListener("click", function() {
                const id = this.getAttribute("data-ahsp-id");
                const selectedAhsp = (window.AhspEngine && window.AhspEngine.getAhspById)
                  ? window.AhspEngine.getAhspById(id)
                  : (window.MASTER_AHSP || []).find(a => a.id === id);
                applySelectedAhsp(selectedAhsp);
              });
              card.addEventListener("keydown", function(e) {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  this.click();
                }
              });
            });
          }

          if (helpText) {
            helpText.textContent = `Ditemukan ${matches.length} item AHSP. Menampilkan ${topItems.length} teratas.`;
          }
        }

        // Event filter & search
        if (searchInput) {
          searchInput.addEventListener("input", () => {
            if (searchClearBtn) {
              searchClearBtn.style.display = searchInput.value ? "block" : "none";
            }
            populateAhspList();
          });
        }
        if (searchClearBtn) {
          searchClearBtn.addEventListener("click", () => {
            searchInput.value = "";
            searchClearBtn.style.display = "none";
            populateAhspList();
            searchInput.focus();
          });
        }
        if (catFilter) {
          catFilter.addEventListener("change", populateAhspList);
        }

        // Inisialisasi daftar
        populateAhspList();

        // Auto focus
        if (defaultStep === "2" || isEdit) {
          setTimeout(() => {
            if (itemVolume) {
              itemVolume.focus();
              itemVolume.select();
            }
          }, 100);
        } else {
          setTimeout(() => {
            if (searchInput && window.innerWidth > 860) {
              searchInput.focus();
            }
          }, 100);
        }
      },
      onSubmit: (data) => {
        const divId = data.divisionId;
        const code = (data.code || "1.1").trim();
        const ahspId = (data.ahspId || "").trim();
        const name = (data.name || "Pekerjaan Baru").trim();
        const unit = (data.unit || "m2").trim();
        const volume = Math.max(0, parseFloat(data.volume) || 0);
        const price = Math.max(0, parseFloat(data.price) || 0);
        const notes = (data.notes || "").trim();

        if (!divId) {
          showNotificationModal({
            title: "Pilih Divisi",
            icon: "⚠️",
            type: "warning",
            contentHtml: `<div style="font-size: 13px;">Silakan pilih divisi pekerjaan tujuan untuk item ini.</div>`,
            confirmText: "OK"
          });
          return;
        }
        if (!name) {
          showNotificationModal({
            title: "Uraian Pekerjaan Diperlukan",
            icon: "⚠️",
            type: "warning",
            contentHtml: `<div style="font-size: 13px;">Silakan isi nama uraian pekerjaan sebelum menyimpan.</div>`,
            confirmText: "OK"
          });
          return;
        }

        const itemPayload = {
          code: code,
          ahspId: ahspId,
          name: name,
          unit: unit,
          volume: volume,
          price: price,
          notes: notes
        };

        if (isEdit) {
          if (targetDivisionId === divId) {
            window.RabCalculator.updateItem(existingItem.id, itemPayload);
          } else {
            // Pindahkan ke divisi baru
            window.RabCalculator.removeItem(existingItem.id);
            itemPayload.id = existingItem.id;
            window.RabCalculator.addItemToDivision(divId, itemPayload);
          }
          if (window.VolumeAnalysis && window.VolumeAnalysis.saveVolume) {
            window.VolumeAnalysis.saveVolume(existingItem.id, volume, notes);
          }
        } else {
          const created = window.RabCalculator.addItemToDivision(divId, itemPayload);
          if (created && created.id && window.VolumeAnalysis && window.VolumeAnalysis.saveVolume) {
            window.VolumeAnalysis.saveVolume(created.id, volume, notes);
          }
        }

        const activeP = window.ProjectManager.getActiveProject();
        if (activeP) {
          window.RabCalculator.calculateProjectRab(activeP);
        }
        renderCurrentTabContent();
      }
    });
  }

  function openAddItemModal(divisionId) {
    openRabItemFormModal(divisionId, null);
  }

  function openEditRabItemModal(divisionId, itemId) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !proj.divisions) return;
    const div = proj.divisions.find(d => d.id === divisionId);
    if (!div) return;
    const itm = (div.items || []).find(i => i.id === itemId);
    if (!itm) return;
    openRabItemFormModal(divisionId, itm);
  }

  // Sinkronkan seluruh rincian divisi RAB ke Kalender Pelaksanaan Proyek (Matematis: OH x Volume)
  // forceReset = true memastikan data tanggal & durasi dihitung ulang murni dari data terbaru RAB
  function syncCalendarFromRab(forceReset = true) {
    if (!window.ProjectCalendar || !window.ProjectCalendar.syncTasksFromRabDetail) {
      showNotificationModal({
        title: "Modul Belum Siap",
        icon: "⚠️",
        type: "warning",
        contentHtml: `<div style="font-size: 13px;">Modul Kalender Proyek belum siap.</div>`,
        confirmText: "Tutup"
      });
      return;
    }
    const res = window.ProjectCalendar.syncTasksFromRabDetail(forceReset);
    renderCurrentTabContent();
    showNotificationModal({
      title: "Sinkronisasi Jadwal Berhasil!",
      icon: "✅",
      type: "success",
      contentHtml: `
        <div style="line-height: 1.6; font-size: 13px;">
          <p>Seluruh item pekerjaan dari Rincian Detail RAB telah berhasil disinkronkan & diperbarui ke Kalender Pelaksanaan:</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin: 10px 0;">
            <div>📅 <strong>Total Kegiatan Terjadwal:</strong> <span class="badge badge-success" style="font-size: 12px;">${res.total} Kegiatan</span></div>
            <div style="margin-top: 4px;">🔄 <strong>Jadwal Diperbarui:</strong> <span class="badge badge-primary" style="font-size: 12px;">${res.synced} Kegiatan</span></div>
            <div style="font-size: 11.5px; color: #64748b; margin-top: 6px;">Durasi dan penanggalan telah dihitung ulang berbasis alokasi Orang-Hari (OH) &times; Volume pekerjaan terkini.</div>
          </div>
          <div class="text-muted" style="font-size: 11.5px;">Kalender dan Kurva S telah diperbarui secara otomatis.</div>
        </div>
      `,
      confirmText: "Tutup & Lihat Kalender"
    });
  }

  function handleVolumeChange(itemId, val) {
    const numVol = Math.max(0, parseFloat(val) || 0);
    window.VolumeAnalysis.saveVolume(itemId, numVol);
    const proj = window.ProjectManager.getActiveProject();
    if (proj && proj.divisions) {
      proj.divisions.forEach(div => {
        (div.items || []).forEach(itm => {
          if (itm.id === itemId) itm.volume = numVol;
        });
      });
      window.ProjectManager.updateActiveProject(proj);
    }
  }

  function handleVolumeNotesChange(itemId, val) {
    const calculations = window.VolumeAnalysis.getVolumeCalculations();
    const item = calculations.find(c => c.itemId === itemId);
    const currVol = item ? item.totalVolume : 0;
    window.VolumeAnalysis.saveVolume(itemId, currVol, val);
  }

  function openEditVolumeModal(itemId) {
    const calculations = window.VolumeAnalysis.getVolumeCalculations();
    const item = calculations.find(c => c.itemId === itemId);
    if (!item) return;

    showFormModal({
      title: "Ubah Volume Pekerjaan",
      subtitle: item.itemName,
      fields: [
        { name: "name", label: "Uraian Pekerjaan", type: "text", value: item.itemName, readonly: true },
        { name: "unit", label: "Satuan", type: "text", value: item.unit, readonly: true },
        { name: "volume", label: "Volume Terukur", type: "number", step: "any", min: 0, value: item.totalVolume, required: true, help: "Ketik volume hasil perhitungan mandiri eksternal" },
        { name: "notes", label: "Catatan / Keterangan Teknis", type: "textarea", rows: 2, value: item.notes || "", placeholder: "Misal: Spesifikasi material atau catatan teknis pelaksanaan" }
      ],
      submitText: "Simpan Volume",
      onSubmit: (data) => {
        handleVolumeChange(itemId, data.volume);
        handleVolumeNotesChange(itemId, data.notes);
        renderCurrentTabContent();
      }
    });
  }

  function handleAhspSearch(val) {
    currentAhspPage = 1;
    window.AhspEngine.setSearch(val);
    renderAhspTableOnly();
  }

  function handleAhspCategory(val) {
    currentAhspPage = 1;
    window.AhspEngine.setCategory(val);
    renderAhspTableOnly();
  }

  function handleAhspBidang(val) {
    currentAhspPage = 1;
    if (window.AhspEngine && window.AhspEngine.setBidang) {
      window.AhspEngine.setBidang(val);
      window.AhspEngine.setCategory("ALL");
    }
    renderAhspView();
  }

  function changeAhspPage(p) {
    currentAhspPage = p;
    renderAhspTableOnly();
  }

  function changeAhspPageSize(sz) {
    ahspPageSize = Number(sz) || 50;
    currentAhspPage = 1;
    renderAhspTableOnly();
  }

  function toggleOnlyUsedAhsp() {
    const curr = window.AhspEngine.getOnlyUsedFilter();
    window.AhspEngine.setOnlyUsedFilter(!curr);
    renderAhspView();
  }

  function resetAhsp(ahspId) {
    handleRestoreSingleAhsp(ahspId);
  }

  function handleRestoreSingleAhsp(ahspId) {
    showConfirmModal({
      title: "Pulihkan Data Orisinal AHSP",
      message: "Apakah Anda yakin ingin memulihkan koefisien dan harga analisis ini ke nilai awal orisinal sebelum direvisi?",
      confirmText: "Ya, Pulihkan Orisinal",
      onConfirm: () => {
        window.AhspEngine.restoreOriginalAhsp(ahspId);
        renderCurrentTabContent();
        if (window.showNotificationModal) {
          window.showNotificationModal({
            title: "Data Orisinal Dipulihkan",
            subtitle: "Pemulihan Analisis Berhasil",
            icon: "↺",
            type: "success",
            contentHtml: "<p>Item AHSP telah dipulihkan ke nilai orisinal standar. Seluruh harga satuan dan rincian biaya di RAB telah disinkronkan secara otomatis.</p>"
          });
        }
      }
    });
  }

  function handleRestoreAllAhsp() {
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    const revCount = Object.keys((proj && proj.ahspOriginals) || {}).length;
    if (revCount === 0) {
      if (window.showNotificationModal) {
        window.showNotificationModal({
          title: "Tidak Ada AHSP Direvisi",
          subtitle: "Semua Data Masih Orisinal",
          icon: "ℹ️",
          type: "info",
          contentHtml: "<p>Seluruh item AHSP saat ini masih berada dalam kondisi orisinal standar tanpa ada revisi yang perlu dipulihkan.</p>"
        });
      }
      return;
    }

    showConfirmModal({
      title: "Pulihkan Seluruh AHSP ke Orisinal",
      message: `Terdapat ${revCount} item AHSP yang memiliki kode revisi. Apakah Anda yakin ingin membatalkan semua revisi dan memulihkan seluruh data ke kondisi orisinal standar?`,
      confirmText: "Ya, Pulihkan Semua",
      onConfirm: () => {
        const count = window.AhspEngine.restoreAllOriginalAhsp();
        renderCurrentTabContent();
        if (window.showNotificationModal) {
          window.showNotificationModal({
            title: "Seluruh AHSP Dipulihkan",
            subtitle: "Pemulihan Massal Selesai",
            icon: "↺",
            type: "success",
            contentHtml: `<p>Sebanyak <strong>${count} item AHSP</strong> berhasil dipulihkan ke nilai awal orisinal. Seluruh rincian biaya dan total RAB telah dihitung ulang secara akurat.</p>`
          });
        }
      }
    });
  }

  async function handleCopyAhspToFolder() {
    if (!window.ProjectManager || !window.ProjectManager.copyAhspDatabaseToProjectFolder) return;
    showLoading("Menyalin Database AHSP...", "Menyusun dan menyimpan pustaka master AHSP ke folder proyek...");
    try {
      const res = await window.ProjectManager.copyAhspDatabaseToProjectFolder();
      hideLoading();
      if (res && res.success) {
        renderCurrentTabContent();
        if (window.showNotificationModal) {
          window.showNotificationModal({
            title: "Database AHSP Disalin ke Folder",
            subtitle: "Pusat Database Mandiri Terpasang",
            icon: "📁",
            type: "success",
            contentHtml: `
              <div style="font-size: 13px; color: #1e293b; line-height: 1.55;">
                Pustaka lengkap Analisis Harga Satuan Pekerjaan berhasil disalin ke folder:<br>
                <div style="font-family: monospace; background: #eff6ff; padding: 6px 10px; border-radius: 4px; margin-top: 6px; font-weight: bold; color: #1e40af; border: 1px solid #bfdbfe;">
                  📂 ${res.folderName} / ahsp_master_database.json
                </div>
                <div style="margin-top: 8px; font-size: 12px; color: #475569;">
                  Total <strong>${res.totalItems} item AHSP</strong> dan <strong>${res.revisionsCount || 0} riwayat revisi</strong> siap digunakan mandiri tanpa bergantung pada koneksi internet.
                </div>
              </div>
            `
          });
        }
      } else if (res && res.reason !== 'no_folder') {
        alert("Gagal menyalin database AHSP ke folder: " + (res.error || res.reason));
      }
    } catch (err) {
      hideLoading();
      console.error("handleCopyAhspToFolder error:", err);
    }
  }

  function handleSelectAhspSource(source) {
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (!proj) return;
    proj.ahspDatabaseSource = source;
    window.ProjectManager.saveProjects();
    if (window.ProjectManager.autoSaveToDisk) window.ProjectManager.autoSaveToDisk();
    renderCurrentTabContent();
  }

  function deleteAhsp(ahspId) {
    showConfirmModal({
      title: "Hapus AHSP Kustom",
      message: "Apakah Anda yakin ingin menghapus item AHSP kustom ini dari daftar?",
      confirmText: "Ya, Hapus AHSP",
      onConfirm: () => {
        window.AhspEngine.deleteCustomAhsp(ahspId);
        renderCurrentTabContent();
      }
    });
  }

  function handleMaterialSearch(val) {
    currentKatalogPage = 1;
    window.CatalogPricing.setSearch(val);
    renderKatalogTableOnly();
  }

  function handleMaterialCategory(val) {
    currentKatalogPage = 1;
    window.CatalogPricing.setCategory(val);
    renderKatalogTableOnly();
  }

  function setKatalogMode(mode) {
    katalogFilterMode = (mode === 'all') ? 'all' : 'used';
    currentKatalogPage = 1;
    window.CatalogPricing.setCategory('ALL');
    window.CatalogPricing.setSearch('');
    renderKatalogView();
  }

  function changeKatalogPage(p) {
    currentKatalogPage = p;
    renderKatalogTableOnly();
  }

  function changeKatalogPageSize(sz) {
    katalogPageSize = Number(sz) || 50;
    currentKatalogPage = 1;
    renderKatalogTableOnly();
  }

  function handleRegionChange(regionId) {
    window.CatalogPricing.setRegion(regionId);
    renderCurrentTabContent();
  }

  function openEditMaterialPriceModal(matId, name, currentPrice) {
    showFormModal({
      title: "Ubah Harga Satuan Bahan / Upah",
      subtitle: name,
      fields: [
        { name: "name", label: "Nama Material / Upah", type: "text", value: name, readonly: true },
        { name: "price", label: "Harga Satuan Baru (Rp)", type: "number", step: "1", min: 0, value: currentPrice, required: true, help: "Harga satuan ini akan digunakan pada seluruh AHSP terkait" }
      ],
      submitText: "Simpan Harga",
      onSubmit: (data) => {
        const newPrice = parseFloat(data.price);
        if (!isNaN(newPrice)) {
          window.CatalogPricing.setOverridePrice(matId, newPrice);
          if (window.AhspEngine && window.AhspEngine.cascadeMaterialPrice) {
            window.AhspEngine.cascadeMaterialPrice(matId, name, newPrice);
          }
          renderCurrentTabContent();
        }
      }
    });
  }

  function openAddCustomMaterialModal() {
    const cats = window.CatalogPricing.getCategories();
    const catOpts = cats.map(c => ({ value: c, label: c }));
    catOpts.unshift({ value: "Material Kustom", label: "Material Kustom" });

    showFormModal({
      title: "Tambah Material / Upah Kustom",
      subtitle: "Tambahkan entri harga pokok baru ke katalog proyek",
      fields: [
        { name: "name", label: "Nama Material / Upah / Alat", type: "text", placeholder: "Misal: Besi Hollow 4x4 Tebal 1.6mm", required: true },
        { name: "code", label: "Kode Item", type: "text", value: "CUST", placeholder: "Misal: M.CUST.01" },
        { name: "category", label: "Kelompok Kategori", type: "select", options: catOpts, value: "Material Kustom" },
        { name: "unit", label: "Satuan", type: "text", value: "buah", placeholder: "kg, m3, m', buah, OH, hari", required: true },
        { name: "price", label: "Harga Satuan Dasar (Rp)", type: "number", step: "1", min: 0, value: "50000", required: true }
      ],
      submitText: "Tambahkan ke Katalog",
      onSubmit: (data) => {
        window.CatalogPricing.addCustomMaterial(data.name, data.unit, parseFloat(data.price) || 0, data.category, data.code);
        renderKatalogView();
      }
    });
  }

  // [Custom AHSP Full Builder Installed Below]

  function handleUpdateActualProgress(weekNum, val) {
    window.SCurveDiagram.updateWeekActual(weekNum, val);
    const schedule = window.SCurveDiagram.getScheduleData();
    window.SCurveDiagram.renderSvgChart("scurve-chart-wrapper", schedule);
  }

  function handleSaveWeekProgress(weekNum) {
    renderKurvaSView();
  }

  function regenerateCurvePrompt() {
    renderKurvaSView();
  }

  function prevMonthCal() {
    const cal = window.ProjectCalendar.prevMonth();
    document.getElementById("calMonthLabel").textContent = cal.monthLabel;
    document.getElementById("calMonthHeaderTitle").textContent = cal.monthLabel;
    document.getElementById("calendarGridCells").innerHTML = cal.cellsHtml;
  }

  function nextMonthCal() {
    const cal = window.ProjectCalendar.nextMonth();
    document.getElementById("calMonthLabel").textContent = cal.monthLabel;
    document.getElementById("calMonthHeaderTitle").textContent = cal.monthLabel;
    document.getElementById("calendarGridCells").innerHTML = cal.cellsHtml;
  }

    function openAddTaskModal() {
    const proj = window.ProjectManager.getActiveProject();
    showFormModal({
      title: "Tambah Jadwal Pekerjaan Baru",
      subtitle: "Jadwalkan item pada kalender kerja proyek",
      fields: [
        { name: "name", label: "Nama Pekerjaan", type: "text", placeholder: "Uraian pekerjaan", required: true },
        { name: "startDate", label: "Tanggal Mulai (Start)", type: "date", value: proj ? proj.startDate : "2026-04-01", required: true },
        { name: "finishDate", label: "Tanggal Selesai (Finish)", type: "date", value: proj ? proj.startDate : "2026-04-15", required: true },
        { name: "status", label: "Status Pengerjaan", type: "select", options: [
          { value: "Belum Mulai", label: "Belum Mulai" },
          { value: "Sedang Berjalan", label: "Sedang Berjalan" },
          { value: "Selesai", label: "Selesai" },
          { value: "Terkendala", label: "Terkendala" }
        ], value: "Belum Mulai" },
        { name: "notes", label: "Catatan Khusus Lapangan", type: "textarea", rows: 2, value: "-", placeholder: "Catatan metode pelaksanaan atau spesifikasi" }
      ],
      submitText: "Simpan Jadwal",
      onSubmit: (data) => {
        window.ProjectCalendar.addTask(null, data.name, data.startDate, data.finishDate, data.status, data.notes);
        renderKalenderView();
      }
    });
  }

  function openEditTaskModal(code) {
    const tasks = window.ProjectCalendar.getTasks();
    const task = tasks.find(t => t.code === code);
    if (!task) return;

    const curProgress = (task.actualProgress !== undefined && task.actualProgress !== null)
      ? Number(task.actualProgress)
      : (task.status === "Selesai" ? 100 : (task.status === "Sedang Berjalan" ? 50 : 0));

    showFormModal({
      title: "Edit Jadwal Pekerjaan",
      subtitle: `${task.code}: ${task.name}`,
      fields: [
        { name: "code", label: "Kode Jadwal", type: "text", value: task.code, readonly: true },
        { name: "name", label: "Nama Pekerjaan", type: "text", value: task.name, required: true },
        { name: "startDate", label: "Tanggal Mulai (Start)", type: "date", value: task.startDate, required: true },
        { name: "finishDate", label: "Tanggal Selesai (Finish)", type: "date", value: task.finishDate, required: true },
        { name: "status", label: "Status Pengerjaan", type: "select", options: [
          { value: "Belum Mulai", label: "Belum Mulai" },
          { value: "Sedang Berjalan", label: "Sedang Berjalan" },
          { value: "Selesai", label: "Selesai" },
          { value: "Terkendala", label: "Terkendala" }
        ], value: task.status },
        { name: "actualProgress", label: "Progres Fisik Aktual Lapangan (%)", type: "number", min: 0, max: 100, step: 1, value: curProgress, help: "Otomatis 100% jika Selesai, atau tentukan % progres riil lapangan" },
        { name: "notes", label: "Catatan Khusus Lapangan", type: "textarea", rows: 2, value: task.notes || "" }
      ],
      submitText: "Simpan Perubahan",
      onSubmit: (data) => {
        let pVal = Number(data.actualProgress);
        if (data.status === "Selesai") {
          pVal = 100;
        } else if (data.status === "Belum Mulai") {
          pVal = 0;
        } else if (data.status === "Sedang Berjalan" && (isNaN(pVal) || pVal <= 0)) {
          pVal = 50;
        }

        window.ProjectCalendar.updateTask(code, {
          name: data.name,
          startDate: data.startDate,
          finishDate: data.finishDate,
          status: data.status,
          actualProgress: pVal,
          notes: data.notes
        });
        renderKalenderView();
      }
    });
  }

  // Buka kunci pekerjaan yang telah selesai
  function unlockTask(code) {
    const tasks = window.ProjectCalendar.getTasks();
    const task = tasks.find(t => t.code === code);
    if (!task) return;

    showConfirmModal({
      title: "Buka Kunci Pekerjaan",
      message: `
        Apakah Anda ingin membuka kunci pekerjaan <strong>${task.name}</strong> (${task.code})?<br><br>
        Status pekerjaan akan dikembalikan menjadi <strong>Sedang Berjalan</strong> sehingga Anda dapat mengedit tanggal pelaksanaan atau memperbaruinya kembali sesuai kondisi lapangan.
      `,
      confirmText: "Ya, Buka Kunci",
      onConfirm: () => {
        window.ProjectCalendar.updateTask(code, {
          status: "Sedang Berjalan",
          actualProgress: 50,
          isLocked: false
        });
        renderKalenderView();
      }
    });
  }

  function deleteTask(code) {
    const tasks = window.ProjectCalendar.getTasks();
    const task = tasks.find(t => t.code === code);
    if (!task) return;

    showConfirmModal({
      title: "Hapus Jadwal Pekerjaan",
      message: `Apakah Anda yakin ingin menghapus jadwal pekerjaan <strong>${task.name}</strong> (${task.code}) dari kalender proyek?`,
      confirmText: "Ya, Hapus Jadwal",
      isDanger: true,
      onConfirm: () => {
        window.ProjectCalendar.deleteTask(code);
        renderKalenderView();
      }
    });
  }

  function openAddInspectionModal() {
    showFormModal({
      title: "Tambah Catatan Inspeksi / Defek Lapangan",
      subtitle: "Pencatatan temuan lapangan dan instruksi mandor",
      fields: [
        { name: "itemCode", label: "Kode Item Pekerjaan", type: "text", value: "3.1.2.1", placeholder: "Misal: 3.1.2.1" },
        { name: "itemName", label: "Uraian Pekerjaan", type: "text", value: "Sloof Beton Bertulang", required: true },
        { name: "findings", label: "Catatan Temuan / Defek Fisik", type: "textarea", rows: 2, value: "Selimut beton kurang tebal 1 cm.", required: true },
        { name: "action", label: "Instruksi Tindakan Perbaikan", type: "textarea", rows: 2, value: "Pasang beton decking standar 2.5 cm sebelum pengecoran.", required: true },
        { name: "targetDate", label: "Batas Waktu Perbaikan", type: "date", value: new Date().toISOString().split('T')[0], required: true },
        { name: "initial", label: "Paraf / Inisial Mandor", type: "text", value: "MDR", required: true, help: "Singkatan inisial mandor pengawas" }
      ],
      submitText: "Simpan Catatan Inspeksi",
      onSubmit: (data) => {
        window.SiteCorrection.addInspection({
          itemCode: data.itemCode,
          itemName: data.itemName,
          findings: data.findings,
          correctionAction: data.action,
          targetDate: data.targetDate,
          foremanInitial: data.initial,
          status: "In Progress"
        });
        renderKoreksiView();
      }
    });
  }

    function openCreateBapModal() {
    showFormModal({
      title: "Buat Berita Acara Pembayaran (BAP)",
      subtitle: "Klaim termin pembayaran bertahap kemajuan fisik proyek",
      fields: [
        { name: "title", label: "Uraian Termin Pembayaran", type: "text", value: "Termin Pembayaran", required: true, placeholder: "Misal: Termin II - Kemajuan Fisik 60%" },
        { name: "progress", label: "Kemajuan Fisik di Lapangan (%)", type: "number", step: "0.1", min: 0, max: 100, value: "50", required: true, help: "Realisasi fisik kumulatif lapangan saat ini" },
        { name: "claim", label: "Persentase Tagihan yang Diajukan (%)", type: "number", step: "0.1", min: 0, max: 100, value: "30", required: true, help: "Porsi bruto tagihan termin ini" },
        { name: "dp", label: "Potongan Pengembalian Uang Muka (DP) (%)", type: "number", step: "0.1", min: 0, max: 50, value: "20", help: "Potongan pengembalian DP dari nilai tagihan bruto" },
        { name: "retention", label: "Potongan Retensi Pemeliharaan (%)", type: "number", step: "0.1", min: 0, max: 20, value: "5", help: "Standar retensi pemeliharaan adalah 5%" }
      ],
      submitText: "Terbitkan Dokumen BAP",
      onSubmit: (data) => {
        window.BapInvoicing.addBapRecord({
          phaseTitle: data.title,
          physicalProgressPercent: parseFloat(data.progress) || 0,
          claimedPercent: parseFloat(data.claim) || 20,
          dpPercentDeduction: parseFloat(data.dp) || 0,
          retentionPercent: parseFloat(data.retention) || 5
        });
        renderBapView();
      }
    });
  }

  function deleteBap(bapNumber) {
    showConfirmModal({
      title: "Hapus Berita Acara Pembayaran",
      message: `Apakah Anda yakin ingin menghapus dokumen BAP nomor <strong>${bapNumber}</strong>?`,
      confirmText: "Ya, Hapus BAP",
      onConfirm: () => {
        window.BapInvoicing.deleteBapRecord(bapNumber);
        renderBapView();
      }
    });
  }

  function printSingleBap(bapId) {
    const records = (window.BapInvoicing && window.BapInvoicing.getBapRecords()) || [];
    const bap = records.find(b => b.id === bapId || b.bapNumber === bapId);
    if (!bap) {
      showNotificationModal({
        title: "BAP Tidak Ditemukan",
        subtitle: "Peringatan Dokumen BAP",
        icon: "⚠️",
        type: "warning",
        contentHtml: `<p>Data Berita Acara Pembayaran untuk termin ini tidak ditemukan dalam database sistem.</p>`
      });
      return;
    }
    const html = window.BapInvoicing.generatePrintableBapHtml(bap);
    window.PrintEngine.printViaHiddenIframe(html, " ");
  }

  function printAllBap() {
    const records = (window.BapInvoicing && window.BapInvoicing.getBapRecords()) || [];
    if (records.length === 0) {
      showNotificationModal({
        title: "Belum Ada Dokumen BAP",
        subtitle: "Peringatan Cetak Dokumen",
        icon: "ℹ️",
        type: "info",
        contentHtml: `<p>Belum ada data Berita Acara Pembayaran (BAP) yang tersimpan untuk dicetak secara massal.</p>`
      });
      return;
    }
    const allHtml = records.map(b => window.BapInvoicing.generatePrintableBapHtml(b)).join("\n");
    window.PrintEngine.printViaHiddenIframe(allHtml, " ");
  }

  function openEditBapModal(bapId) {
    const records = (window.BapInvoicing && window.BapInvoicing.getBapRecords()) || [];
    const bap = records.find(b => b.id === bapId || b.bapNumber === bapId);
    if (!bap) {
      showNotificationModal({
        title: "BAP Tidak Ditemukan",
        subtitle: "Peringatan Edit Dokumen",
        icon: "⚠️",
        type: "warning",
        contentHtml: `<p>Data Berita Acara Pembayaran yang dipilih tidak dapat ditemukan untuk disunting.</p>`
      });
      return;
    }

    showFormModal({
      title: "✏️ Edit Berita Acara Pembayaran (BAP)",
      subtitle: `Perbarui nomor dokumen, progres klaim, tanggal, atau catatan BAP (${bap.bapNumber})`,
      fields: [
        { name: "bapNumber", label: "Nomor Dokumen BAP", type: "text", value: bap.bapNumber || "", required: true },
        { name: "date", label: "Tanggal Penetapan Dokumen BAP", type: "date", value: bap.date || new Date().toISOString().split('T')[0], required: true },
        { name: "title", label: "Uraian / Tahapan Termin Pembayaran", type: "text", value: bap.phaseTitle || "", required: true },
        { name: "progress", label: "Realisasi Prestasi Fisik Lapangan (%)", type: "number", step: "0.1", min: 0, max: 100, value: bap.physicalProgressPercent || 0, required: true },
        { name: "claim", label: "Persentase Tagihan yang Diajukan (%)", type: "number", step: "0.1", min: 0, max: 100, value: bap.claimedPercent || 20, required: true },
        { name: "dp", label: "Potongan Pengembalian DP (%)", type: "number", step: "0.1", min: 0, max: 50, value: (bap.grossAmount > 0 ? Math.round(bap.dpDeduction / bap.grossAmount * 100) : 0) },
        { name: "retention", label: "Potongan Retensi Pemeliharaan (%)", type: "number", step: "0.1", min: 0, max: 20, value: (bap.grossAmount > 0 ? Math.round(bap.retentionDeduction / bap.grossAmount * 100) : 5) },
        { name: "status", label: "Status BAP", type: "select", value: bap.status || "Pengajuan", options: [
          { value: "Pengajuan", label: "Pengajuan" },
          { value: "Pengajuan Disetujui", label: "Pengajuan Disetujui" },
          { value: "Lunas / Dibayar", label: "Lunas / Dibayar" },
          { value: "Ditolak / Revisi", label: "Ditolak / Revisi" }
        ]},
        { name: "paymentDate", label: "Tanggal Realisasi Pembayaran", type: "date", value: bap.paymentDate || bap.date || "" },
        { name: "notes", label: "Catatan Resmi BAP (Input Aplikasi)", type: "textarea", rows: 2, value: bap.notes || "" },
        { name: "manualNotes", label: "Catatan Tambahan Lapangan / Manual", type: "textarea", rows: 2, value: bap.manualNotes || "", placeholder: "Catatan khusus evaluasi lapangan atau inspeksi..." }
      ],
      submitText: "Simpan Perubahan BAP",
      onSubmit: (data) => {
        window.BapInvoicing.updateBapRecord(bap.id || bap.bapNumber, {
          bapNumber: data.bapNumber,
          date: data.date,
          phaseTitle: data.title,
          physicalProgressPercent: parseFloat(data.progress) || 0,
          claimedPercent: parseFloat(data.claim) || 20,
          dpPercentDeduction: parseFloat(data.dp) || 0,
          retentionPercent: parseFloat(data.retention) || 5,
          status: data.status,
          paymentDate: data.paymentDate,
          notes: data.notes,
          manualNotes: data.manualNotes
        });
        renderBapView();
      }
    });
  }

  function openAddTerminModal() {
    const proj = (window.ProjectManager && window.ProjectManager.getActiveProject()) || {};
    const schemes = (window.BapInvoicing && window.BapInvoicing.getTerminScheme(proj)) || [];
    const nextIdx = schemes.length + 1;

    showFormModal({
      title: "➕ Tambah Termin Pembayaran Baru",
      subtitle: `Menambahkan tahapan termin ke-${nextIdx} dalam skema pembayaran kontrak proyek`,
      fields: [
        { name: "title", label: "Judul / Uraian Termin", type: "text", value: `Termin ${nextIdx} - Kemajuan Fisik`, required: true, placeholder: "Misal: Termin III - Kemajuan Fisik 75%" },
        { name: "criteria", label: "Tahapan & Syarat Bobot Prestasi Fisik (Untuk Apa)", type: "textarea", rows: 2, value: "", required: true, placeholder: "Uraikan pekerjaan fisik apa saja yang harus selesai sebelum termin ini dapat ditagihkan..." },
        { name: "targetProgress", label: "Target Bobot Fisik Lapangan (%)", type: "number", step: "1", min: 0, max: 100, value: Math.min(100, nextIdx * 20), required: true },
        { name: "portionPercent", label: "Porsi Pembayaran Termin (%)", type: "number", step: "1", min: 1, max: 100, value: 20, required: true },
        { name: "dpDeductionPercent", label: "Potongan Pengembalian DP (%)", type: "number", step: "1", min: 0, max: 50, value: nextIdx === 1 ? 0 : 20 },
        { name: "retentionPercent", label: "Potongan Retensi Pemeliharaan (%)", type: "number", step: "1", min: 0, max: 20, value: nextIdx === 1 ? 0 : 5 },
        { name: "targetDateOffsetDays", label: "Estimasi Hari Pelaksanaan dari Awal Proyek (Hari)", type: "number", step: "1", min: 1, max: 720, value: nextIdx * 35 },
        { name: "notes", label: "Catatan Tambahan Termin", type: "textarea", rows: 2, value: "", placeholder: "Keterangan tambahan mobilisasi/operasional..." }
      ],
      submitText: "Simpan Termin Baru",
      onSubmit: (data) => {
        window.BapInvoicing.addTerminScheme({
          title: data.title,
          criteria: data.criteria,
          targetProgress: parseFloat(data.targetProgress) || 0,
          portionPercent: parseFloat(data.portionPercent) || 0,
          dpDeductionPercent: parseFloat(data.dpDeductionPercent) || 0,
          retentionPercent: parseFloat(data.retentionPercent) || 0,
          targetDateOffsetDays: parseInt(data.targetDateOffsetDays, 10) || 30,
          notes: data.notes
        });
        renderBapView();
      }
    });
  }

  function openEditTerminModal(phaseIndex) {
    const proj = (window.ProjectManager && window.ProjectManager.getActiveProject()) || {};
    const schemes = (window.BapInvoicing && window.BapInvoicing.getTerminScheme(proj)) || [];
    const item = schemes.find(s => s.phaseIndex === phaseIndex);
    if (!item) {
      showNotificationModal({
        title: "Skema Termin Tidak Ditemukan",
        subtitle: "Peringatan Data Termin",
        icon: "⚠️",
        type: "warning",
        contentHtml: `<p>Data skema termin pembayaran yang dipilih tidak ditemukan dalam konfigurasi kontrak proyek.</p>`
      });
      return;
    }

    showFormModal({
      title: `✏️ Edit Skema Termin ${phaseIndex}`,
      subtitle: `Ubah persentase porsi, bobot fisik, atau uraian peruntukan termin`,
      fields: [
        { name: "title", label: "Judul / Uraian Termin", type: "text", value: item.title || "", required: true },
        { name: "criteria", label: "Tahapan & Syarat Bobot Prestasi Fisik (Untuk Apa)", type: "textarea", rows: 2, value: item.criteria || "", required: true, placeholder: "Uraikan pekerjaan fisik yang harus selesai..." },
        { name: "targetProgress", label: "Target Bobot Fisik Lapangan (%)", type: "number", step: "1", min: 0, max: 100, value: item.targetProgress || 0, required: true },
        { name: "portionPercent", label: "Porsi Pembayaran Termin (%)", type: "number", step: "1", min: 1, max: 100, value: item.portionPercent || 0, required: true },
        { name: "dpDeductionPercent", label: "Potongan Pengembalian DP (%)", type: "number", step: "1", min: 0, max: 50, value: item.dpDeductionPercent || 0 },
        { name: "retentionPercent", label: "Potongan Retensi Pemeliharaan (%)", type: "number", step: "1", min: 0, max: 20, value: item.retentionPercent || 0 },
        { name: "targetDateOffsetDays", label: "Estimasi Hari Pelaksanaan dari Awal Proyek (Hari)", type: "number", step: "1", min: 1, max: 720, value: item.targetDateOffsetDays || 30 },
        { name: "notes", label: "Catatan Tambahan Termin", type: "textarea", rows: 2, value: item.notes || "", placeholder: "Keterangan tambahan..." }
      ],
      submitText: "Simpan Perubahan Termin",
      onSubmit: (data) => {
        window.BapInvoicing.updateTerminScheme(phaseIndex, {
          title: data.title,
          criteria: data.criteria,
          targetProgress: parseFloat(data.targetProgress) || 0,
          portionPercent: parseFloat(data.portionPercent) || 0,
          dpDeductionPercent: parseFloat(data.dpDeductionPercent) || 0,
          retentionPercent: parseFloat(data.retentionPercent) || 0,
          targetDateOffsetDays: parseInt(data.targetDateOffsetDays, 10) || 30,
          notes: data.notes
        });
        renderBapView();
      }
    });
  }

  function deleteTerminScheme(phaseIndex) {
    showConfirmModal({
      title: "Hapus Tahapan Termin",
      message: `Apakah Anda yakin ingin menghapus <strong>Termin ${phaseIndex}</strong> dari skema pembayaran kontrak?`,
      confirmText: "Ya, Hapus Termin",
      onConfirm: () => {
        window.BapInvoicing.deleteTerminScheme(phaseIndex);
        renderBapView();
      }
    });
  }

  function resetTerminSchemeToDefault() {
    showConfirmModal({
      title: "Reset Skema Termin ke Standar PUPR",
      message: `Apakah Anda yakin ingin mengembalikan seluruh skema termin pembayaran ke <strong>Standar 5 Tahap SE PUPR</strong>? Perubahan kustom Anda akan diatur ulang.`,
      confirmText: "Ya, Reset ke Standar",
      onConfirm: () => {
        window.BapInvoicing.resetTerminSchemeToDefault();
        renderBapView();
      }
    });
  }

  function prevCalendarMonth() {
    if (window.ProjectCalendar && window.ProjectCalendar.prevMonth) {
      window.ProjectCalendar.prevMonth();
      renderKalenderView();
    }
  }

  function nextCalendarMonth() {
    if (window.ProjectCalendar && window.ProjectCalendar.nextMonth) {
      window.ProjectCalendar.nextMonth();
      renderKalenderView();
    }
  }

  function openCreateProjectModal() {
    showFormModal({
      title: "Buat Rencana Anggaran Biaya Proyek Baru",
      subtitle: "Inisialisasi dokumen proyek baru (Lembar Kerja Bersih & Fresh)",
      dialogClass: "modal-md",
      fields: [
        {
          name: "name",
          label: "Nama Kegiatan / Judul Proyek",
          type: "text",
          value: "Pembangunan Rumah Tinggal Baru",
          required: true,
          placeholder: "Misal: Pembangunan Rumah Tinggal Tropis Modern",
          help: "Cukup masukkan nama kegiatan proyek. Seluruh detail teknis dan biaya langsung dapat diatur di lembar kerja fresh."
        }
      ],
      submitText: "Buat Proyek",
      cancelText: "Batal",
      onSubmit: (data) => {
        const projName = (data.name && data.name.trim()) ? data.name.trim() : "Pembangunan Proyek Baru";
        const newProj = window.ProjectManager.createProject(projName, "Pemilik Proyek", "Indonesia", "std", false);
        if (newProj) {
          window.ProjectManager.updateActiveProject(newProj);
        }
        setupProjectSwitcher();
        updateProjectHeader();
        switchTab("detail-rab");
        renderCurrentTabContent();
        showNotificationModal({
          title: "Lembar Proyek Bersih Siap",
          icon: "✨",
          type: "success",
          contentHtml: `<div style="font-size: 13px; line-height: 1.6;">
            Lembar proyek <b>${projName}</b> berhasil dibuat dalam kondisi <b>bersih dan fresh</b> tanpa data sample.<br>
            Silakan mulai menambahkan divisi pekerjaan pertama Anda!
          </div>`,
          confirmText: "Mulai Pekerjaan"
        });
      }
    });
  }

  function duplicateCurrentProject() {
    showConfirmModal({
      title: "Gandakan Proyek Aktif",
      message: "Apakah Anda yakin ingin menggandakan proyek ini untuk membuat salinan baru?",
      confirmText: "Ya, Gandakan",
      onConfirm: () => {
        window.ProjectManager.duplicateCurrentProject();
        setupProjectSwitcher();
        updateProjectHeader();
        renderCurrentTabContent();
      }
    });
  }

  function deleteProject(id) {
    showConfirmModal({
      title: "Hapus Proyek",
      message: "Apakah Anda yakin ingin menghapus proyek ini secara permanen dari penyimpanan lokal browser?",
      confirmText: "Ya, Hapus Proyek",
      onConfirm: () => {
        window.ProjectManager.deleteProject(id);
        setupProjectSwitcher();
        updateProjectHeader();
        renderCurrentTabContent();
      }
    });
  }

  function openCustomIndexModal() {
    const curr = window.CatalogPricing.getCustomIndices();
    showFormModal({
      title: "Pengaturan Indeks Harga Kustom Mandiri",
      subtitle: "Sesuaikan multiplier harga bahan, upah, dan alat secara fleksibel",
      fields: [
        { name: "label", label: "Keterangan / Nama Profil Wilayah Kustom", type: "text", value: curr.label || "Indeks Penyesuaian Lapangan", required: true },
        { name: "material", label: "Indeks Pengali Bahan / Material", type: "number", step: "0.01", min: 0.1, max: 5.0, value: curr.material || 1.0, required: true, help: "Contoh: 1.10 berarti harga material naik 10%" },
        { name: "labor", label: "Indeks Pengali Upah Tenaga Kerja", type: "number", step: "0.01", min: 0.1, max: 5.0, value: curr.labor || 1.0, required: true, help: "Contoh: 1.15 berarti upah tenaga kerja naik 15%" },
        { name: "equipment", label: "Indeks Pengali Sewa Peralatan", type: "number", step: "0.01", min: 0.1, max: 5.0, value: curr.equipment || 1.0, required: true, help: "Contoh: 1.05 berarti sewa alat naik 5%" }
      ],
      submitText: "Terapkan Indeks Kustom",
      onSubmit: (data) => {
        window.CatalogPricing.setCustomIndices({
          label: data.label,
          material: parseFloat(data.material) || 1.0,
          labor: parseFloat(data.labor) || 1.0,
          equipment: parseFloat(data.equipment) || 1.0
        });
        renderCurrentTabContent();
      }
    });
  }

  function switchProject(id) {
    window.ProjectManager.setActiveProject(id);
    window.CatalogPricing.init();
    window.AhspEngine.init();
    updateProjectHeader();
    renderCurrentTabContent();
  }

  function exportCurrentProject() {
    window.ProjectManager.exportProjectJson();
  }

  function exportSingleProject(id) {
    const p = window.ProjectManager.getAllProjects().find(proj => proj.id === id);
    if (p) window.ProjectManager.exportProjectJson(p);
  }

  function sanitizeCurrentProject() {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return;
    const res = window.ProjectManager.sanitizeProjectData(proj);
    window.ProjectManager.updateActiveProject(proj);
    updateProjectHeader();
    renderCurrentTabContent();
    if (window.showNotificationModal) {
      window.showNotificationModal({
        title: "Sanitasi Berhasil",
        subtitle: "Audit Integritas Data SNI PUPR 2026",
        icon: "✅",
        type: "success",
        contentHtml: `
          <div style="line-height: 1.6; font-size: 13px;">
            <p>Sistem berhasil memvalidasi dan mensanitasi data proyek <strong>${proj.name}</strong>.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin: 10px 0;">
              <div>📋 <strong>Status Audit:</strong> 100% Sesuai Standar SNI SE PUPR 2026</div>
              <div>🛠️ <strong>Item Disanitasi:</strong> ${res.count} item (keramik, bouwplank, urugan pasir, kusen, dsb.)</div>
              <div>💰 <strong>Real Cost Bersih:</strong> ${window.CurrencyUtil.formatRupiah(proj.realCost || 0)}</div>
              <div>🏷️ <strong>Grand Total:</strong> ${window.CurrencyUtil.formatRupiah(proj.grandTotal || 0)}</div>
            </div>
            <p class="text-muted" style="font-size: 11.5px;">Seluruh nilai abnormal puluhan juta/milyar telah dikoreksi menjadi harga pasar logis dan realistis.</p>
          </div>
        `
      });
    } else {
      alert(`Sanitasi berhasil! ${res.count} item telah disesuaikan.`);
    }
  }

  function handleImportProject(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      showLoading("Mengimpor Proyek...", "Membaca dan memverifikasi data proyek JSON...");
      window.ProjectManager.importProjectJson(file, (proj) => {
        hideLoading();
        input.value = "";
        setupProjectSwitcher();
        updateProjectHeader();
        renderCurrentTabContent();
        const itemCount = (proj.divisions || []).reduce((acc, d) => acc + (d.items ? d.items.length : 0), 0);
        const taskCount = (proj.calendarTasks || []).length;
        showNotificationModal({
          title: "Proyek Berhasil Diimpor!",
          subtitle: proj.name,
          icon: "✅",
          type: "success",
          contentHtml: `
            <div style="line-height: 1.6; font-size: 13px;">
              <p>Data proyek <strong>${proj.name}</strong> telah berhasil dipulihkan secara menyeluruh ke sistem:</p>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin: 10px 0;">
                <div>👤 <strong>Pemilik / Owner:</strong> ${proj.owner || '-'}</div>
                <div>📍 <strong>Lokasi:</strong> ${proj.location || '-'}</div>
                <div>📑 <strong>Struktur RAB:</strong> ${(proj.divisions || []).length} Divisi Pekerjaan (${itemCount} Item Pekerjaan)</div>
                <div>📅 <strong>Jadwal Kalender:</strong> ${taskCount} Kegiatan Pekerjaan Terjadwal</div>
              </div>
              <div class="text-muted" style="font-size: 11.5px;">Seluruh data RAB, analisis volume, kalender 1 tahun, dan Kurva S telah disinkronkan 100%.</div>
            </div>
          `,
          confirmText: "Tutup & Buka Proyek"
        });
      });
    }
  }

  function handleImportAhsp(input) {
    if (input.files && input.files[0]) {
      const fileName = input.files[0].name;
      window.AhspEngine.importAhspJson(input.files[0], (success, count, errMsg) => {
        if (success) {
          renderAhspView();
          showNotificationModal({
            title: "Pustaka AHSP Berhasil Diimpor!",
            subtitle: fileName,
            icon: "✅",
            type: "success",
            contentHtml: `
              <div style="line-height: 1.6; font-size: 13px;">
                <p>Data pustaka AHSP dari file <strong>${fileName}</strong> telah berhasil disinkronkan:</p>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin: 10px 0;">
                  <div>📦 <strong>Total Item AHSP:</strong> <span class="badge badge-success" style="font-size: 12px;">${count} Analisis Harga Satuan</span></div>
                  <div style="font-size: 11.5px; color: #64748b; margin-top: 3px;">Standar: SE Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026</div>
                </div>
                <div class="text-muted" style="font-size: 11.5px;">Komponen bahan, tenaga kerja, alat, koefisien, dan harga satuan telah aktif untuk seluruh RAB.</div>
              </div>
            `,
            confirmText: "Tutup & Lihat AHSP"
          });
        } else {
          showNotificationModal({
            title: "Gagal Mengimpor AHSP",
            subtitle: fileName,
            icon: "❌",
            type: "error",
            contentHtml: `<div style="color: #dc2626; font-size: 13px;">${errMsg || "Format file tidak valid."}</div>`,
            confirmText: "Tutup"
          });
        }
        input.value = "";
      });
    }
  }

  // Buka rincian detail AHSP pada modal
  
  // ==========================================
  // KALENDER PROYEK VIEW CONTROLLER & HANDLERS
  // ==========================================
  function setCalendarViewMode(mode) {
    if (window.ProjectCalendar && window.ProjectCalendar.setViewMode) {
      window.ProjectCalendar.setViewMode(mode);
    }
    renderKalenderView();
  }

  function switchToMonthView(monthIndex) {
    if (window.ProjectCalendar) {
      window.ProjectCalendar.setMonthOffset(monthIndex);
      window.ProjectCalendar.setViewMode("month");
    }
    renderKalenderView();
    const el = document.getElementById("kalenderContent");
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function handleCalendarDateClick(dateStr) {
    if (!window.ProjectCalendar) return;
    const tasks = window.ProjectCalendar.getTasksOnDate(dateStr);
    
    // Format tanggal ke Bahasa Indonesia (misal: Senin, 7 September 2026)
    let formattedDate = dateStr;
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const dObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        formattedDate = dObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      }
    } catch(e) {}

    if (!tasks || tasks.length === 0) {
      showNotificationModal({
        title: "Agenda Kalender Kerja",
        subtitle: formattedDate,
        icon: "📅",
        type: "calendar",
        contentHtml: `
          <div style="text-align: center; padding: 16px 8px;">
            <div style="font-size: 32px; margin-bottom: 8px;">🏖️</div>
            <div style="font-weight: 800; color: #0f172a; font-size: 14.5px;">Tidak Ada Pekerjaan Lapangan Terjadwal</div>
            <div style="color: #64748b; font-size: 12.5px; margin-top: 6px; line-height: 1.5;">
              Tanggal <strong>${formattedDate}</strong> berstatus hari bebas / libur kerja / tidak ada kegiatan fisik aktif pada divisi yang dipilih.
            </div>
          </div>
        `,
        confirmText: "Tutup Agenda"
      });
      return;
    }

    let taskCardsHtml = "";
    tasks.forEach((t, idx) => {
      const statusBadge = (t.status === 'done')
        ? '<span class="badge badge-success" style="font-size: 10.5px;">Selesai (100%)</span>'
        : (t.status === 'in_progress')
          ? '<span class="badge badge-primary" style="font-size: 10.5px;">Sedang Berjalan</span>'
          : '<span class="badge badge-light" style="font-size: 10.5px; border: 1px solid #cbd5e1;">Belum Mulai</span>';

      taskCardsHtml += `
        <div class="calendar-popup-card">
          <div class="calendar-popup-title">
            <span>${idx + 1}. [${t.code || 'ITEM'}] ${t.name}</span>
            ${statusBadge}
          </div>
          <div class="calendar-popup-meta">
            <div>⏱️ <strong>Durasi:</strong> ${t.duration || 1} Hari (${t.startDate} s.d. ${t.finishDate})</div>
            ${t.volume ? `<div>📐 <strong>Volume:</strong> ${window.CurrencyUtil ? window.CurrencyUtil.formatNumber(t.volume, 2) : t.volume} ${t.unit || ''}</div>` : ''}
          </div>
        </div>
      `;
    });

    showNotificationModal({
      title: `Jadwal Pekerjaan Lapangan (${tasks.length} Kegiatan Aktif)`,
      subtitle: formattedDate,
      icon: "📅",
      type: "calendar",
      contentHtml: `
        <div style="margin-bottom: 12px; font-size: 12.5px; color: #475569;">
          Berikut rincian pekerjaan konstruksi aktif pada <strong>${formattedDate}</strong>:
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${taskCardsHtml}
        </div>
      `,
      confirmText: "Tutup Agenda"
    });
  }

  
  // State untuk Builder AHSP Kustom Penuh
  let activeAhspModalSnapshot = null; // Snapshot data AHSP sebelum diedit di modal
  let tempCustomBuilder = {
    code: "CUST.01",
    name: "",
    category: "Pekerjaan Kustom",
    unit: "m2",
    overhead: 0,
    components: []
  };

  function renderCustomBuilderModal() {
    let compRows = "";
    let subtotalTenaga = 0;
    let subtotalBahan = 0;
    let subtotalAlat = 0;

    tempCustomBuilder.components.forEach((c, idx) => {
      const koef = Number(c.koef) || 0;
      const price = Number(c.price) || 0;
      const tot = Math.round(koef * price * 100) / 100;
      c.total = tot;

      const sec = (c.section || "BAHAN MATERIAL").toUpperCase();
      if (sec.includes("TENAGA")) subtotalTenaga += tot;
      else if (sec.includes("ALAT") || sec.includes("PERALATAN")) subtotalAlat += tot;
      else subtotalBahan += tot;

      const badgeColor = sec.includes("TENAGA") ? "badge-primary" : (sec.includes("ALAT") ? "badge-warning" : "badge-success");

      compRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><span class="badge ${badgeColor}" style="font-size: 10px;">${c.section || 'BAHAN MATERIAL'}</span></td>
          <td><strong>${c.name}</strong></td>
          <td class="text-center font-mono" style="font-size: 11px;">${c.code || '-'}</td>
          <td class="text-center">${c.unit}</td>
          <td class="text-right">
            <input type="number" step="0.0001" style="width: 75px; text-align: right; padding: 2px 4px; border: 1px solid #cbd5e1; border-radius: 4px;" value="${c.koef}" onchange="App.handleBuilderCompKoefChange(${idx}, this.value)">
          </td>
          <td class="text-right">${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(price, false, true) : price}</td>
          <td class="text-right font-bold">${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(tot, false, true) : tot}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-danger" style="padding: 2px 6px; font-size: 11px;" title="Hapus komponen ini" onclick="App.handleBuilderDeleteComp(${idx})">🗑️ Hapus</button>
          </td>
        </tr>
      `;
    });

    const dTotal = subtotalTenaga + subtotalBahan + subtotalAlat;
    const overheadPct = Number(tempCustomBuilder.overhead) || 0;
    const eOverhead = dTotal * (overheadPct / 100);
    const finalHsp = Math.floor(dTotal + eOverhead);

    const modalBody = document.getElementById("genericModalBody");
    const modalTitle = document.getElementById("genericModalTitle");
    if (modalBody && modalTitle) {
      modalTitle.textContent = "Buat Analisis AHSP Kustom Penuh (Komprehensif)";
      modalBody.innerHTML = `
        <div class="p-2 mb-3" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
          <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">1. Parameter Utama Analisis Satuan Pekerjaan:</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
            <div>
              <label style="font-size: 11px; font-weight: 600; color: #475569;">Kode Analisis *</label>
              <input type="text" id="builderAhspCode" class="form-control" style="font-size: 12px; padding: 4px 8px;" value="${tempCustomBuilder.code}" oninput="App.handleBuilderFieldChange('code', this.value)">
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 600; color: #475569;">Satuan Pekerjaan *</label>
              <input type="text" id="builderAhspUnit" class="form-control" style="font-size: 12px; padding: 4px 8px;" value="${tempCustomBuilder.unit}" oninput="App.handleBuilderFieldChange('unit', this.value)">
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 600; color: #475569;">Overhead & Keuntungan (%)</label>
              <input type="number" step="0.5" id="builderAhspOverhead" class="form-control" style="font-size: 12px; padding: 4px 8px;" value="${tempCustomBuilder.overhead}" oninput="App.handleBuilderFieldChange('overhead', this.value)">
            </div>
          </div>
          <div class="mt-2">
            <label style="font-size: 11px; font-weight: 600; color: #475569;">Uraian Pekerjaan Kustom *</label>
            <input type="text" id="builderAhspName" class="form-control" placeholder="Misal: Pemasangan Kisi-kisi Aluminium Wood-Pattern atau Pasangan Rangka Hollow" style="font-size: 12px; padding: 4px 8px;" value="${tempCustomBuilder.name}" oninput="App.handleBuilderFieldChange('name', this.value)">
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap" style="gap: 8px;">
          <div style="font-size: 12px; font-weight: 700; color: #1e293b;">
            2. Rincian Komponen (Tenaga Kerja, Bahan Material, &amp; Peralatan):
            <span class="badge badge-light" style="font-size: 11px; margin-left: 6px;">${tempCustomBuilder.components.length} Komponen</span>
          </div>
          <button class="btn btn-sm btn-primary font-bold" onclick="App.openAddAhspCompModal(null, App.handleBuilderAddComp)" style="display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
            ➕ Tambah Komponen dari Katalog Master
          </button>
        </div>

        <div class="table-responsive">
          <table class="table" style="font-size: 12px;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="width: 4%;">No</th>
                <th style="width: 14%;">Kelompok</th>
                <th style="width: 32%;">Uraian Komponen</th>
                <th style="width: 10%;" class="text-center">Kode</th>
                <th style="width: 7%;" class="text-center">Sat.</th>
                <th style="width: 11%;" class="text-right">Koefisien</th>
                <th style="width: 13%;" class="text-right">Harga Satuan</th>
                <th style="width: 14%;" class="text-right">Jumlah Harga</th>
                <th style="width: 8%;" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${compRows || '<tr><td colspan="9" class="text-center text-muted p-4">Belum ada komponen rincian. Klik tombol <strong>+ Tambah Komponen dari Katalog Master</strong> di atas untuk memasukkan tenaga, bahan, atau alat.</td></tr>'}
              <tr class="table-active">
                <td colspan="7" class="text-right font-bold">Subtotal Tenaga Kerja (A):</td>
                <td class="text-right font-bold">${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(subtotalTenaga, false, true) : subtotalTenaga}</td>
                <td></td>
              </tr>
              <tr class="table-active">
                <td colspan="7" class="text-right font-bold">Subtotal Bahan Material (B):</td>
                <td class="text-right font-bold">${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(subtotalBahan, false, true) : subtotalBahan}</td>
                <td></td>
              </tr>
              <tr class="table-active">
                <td colspan="7" class="text-right font-bold">Subtotal Peralatan (C):</td>
                <td class="text-right font-bold">${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(subtotalAlat, false, true) : subtotalAlat}</td>
                <td></td>
              </tr>
              <tr>
                <td colspan="7" class="text-right font-bold">Jumlah Biaya Langsung (D = A + B + C):</td>
                <td class="text-right font-bold">${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(dTotal, false, true) : dTotal}</td>
                <td></td>
              </tr>
              <tr>
                <td colspan="7" class="text-right font-bold">Biaya Umum &amp; Keuntungan (${overheadPct}% x D):</td>
                <td class="text-right font-bold">${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(eOverhead, false, true) : eOverhead}</td>
                <td></td>
              </tr>
              <tr class="total-highlight-row" style="background: #f0fdf4; border-top: 2px solid #22c55e;">
                <td colspan="7" class="text-right font-bold" style="font-size: 13px; color: #15803d;">Harga Satuan Pekerjaan (D+E Dibulatkan):</td>
                <td class="text-right font-bold text-success" style="font-size: 14px;">${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(finalHsp, false, true) : finalHsp}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3 pt-3 flex-wrap" style="border-top: 1px solid #e2e8f0; gap: 8px;">
          <div class="text-muted" style="font-size: 11px;">
            🔒 <em>Wajib tekan Simpan atau Batal untuk keluar dari pop up ini.</em>
          </div>
          <div class="d-flex align-items-center" style="gap: 8px;">
            <button class="btn btn-outline" onclick="App.cancelCustomAhspBuilder()" style="padding: 7px 18px; font-weight: 600;">❌ Batal</button>
            <button class="btn btn-primary font-bold" onclick="App.submitCustomAhspBuilder()" style="padding: 7px 20px; box-shadow: 0 2px 6px rgba(37,99,235,0.3);">💾 Simpan AHSP Baru &amp; Keluar</button>
          </div>
        </div>
      `;
      const gm = document.getElementById("genericModal");
      if (gm) {
        gm.dataset.preventBackdropClose = "true";
        gm.style.display = "flex";
        const closeBtn = document.getElementById("genericModalCloseBtn");
        if (closeBtn) closeBtn.style.display = "none";
        const cancelBtn = document.getElementById("genericModalCancelBtn");
        if (cancelBtn) cancelBtn.style.display = "none";
      }
      openModal("genericModal");
    }
  }

  function openCreateCustomAhspModal() {
    tempCustomBuilder = {
      code: "CUST." + Math.floor(10 + Math.random() * 90),
      name: "",
      category: "Pekerjaan Kustom",
      unit: "m2",
      overhead: 0,
      components: []
    };
    renderCustomBuilderModal();
  }

  function handleBuilderFieldChange(field, val) {
    tempCustomBuilder[field] = val;
  }

  function handleBuilderCompKoefChange(idx, val) {
    if (tempCustomBuilder.components[idx]) {
      tempCustomBuilder.components[idx].koef = parseFloat(val) || 0;
      renderCustomBuilderModal();
    }
  }

  function handleBuilderDeleteComp(idx) {
    if (tempCustomBuilder.components[idx]) {
      tempCustomBuilder.components.splice(idx, 1);
      renderCustomBuilderModal();
    }
  }

  function handleBuilderAddComp(comp) {
    tempCustomBuilder.components.push(comp);
    renderCustomBuilderModal();
  }

  function cancelCustomAhspBuilder() {
    tempCustomBuilder = {
      code: "CUST." + Math.floor(10 + Math.random() * 90),
      name: "",
      category: "Pekerjaan Kustom",
      unit: "m2",
      overhead: 0,
      components: []
    };
    closeGenericModal();
  }

  function submitCustomAhspBuilder() {
    if (!tempCustomBuilder.name || tempCustomBuilder.name.trim() === "") {
      alert("Mohon isi Uraian Pekerjaan Kustom terlebih dahulu.");
      return;
    }
    const newAhsp = window.AhspEngine.createCustomAhsp(
      tempCustomBuilder.code,
      tempCustomBuilder.name,
      tempCustomBuilder.category || "Pekerjaan Kustom",
      tempCustomBuilder.unit || "m2",
      parseFloat(tempCustomBuilder.overhead) || 0,
      tempCustomBuilder.components
    );
    if (window.ProjectManager && window.ProjectManager.syncAhspDatabaseToFolder) {
      window.ProjectManager.syncAhspDatabaseToFolder();
    }
    tempCustomBuilder = {
      code: "CUST." + Math.floor(10 + Math.random() * 90),
      name: "",
      category: "Pekerjaan Kustom",
      unit: "m2",
      overhead: 0,
      components: []
    };
    closeGenericModal();
    renderAhspView();
    if (window.showNotificationModal) {
      window.showNotificationModal({
        title: "AHSP Baru Berhasil Didaftarkan",
        subtitle: newAhsp ? `${newAhsp.code} - ${newAhsp.name}` : "Pendaftaran Selesai",
        icon: "💾",
        type: "success",
        contentHtml: "<p>AHSP baru telah ditambahkan ke katalog aktif dan disinkronkan ke database <code>ahsp_revisi_dan_penambahan.json</code> secara instan.</p>",
        confirmText: "OK"
      });
    }
  }

  function closeGenericModal() {
    const gm = document.getElementById("genericModal");
    if (gm) {
      gm.dataset.preventBackdropClose = "false";
      const closeBtn = document.getElementById("genericModalCloseBtn");
      if (closeBtn) closeBtn.style.display = "";
      const cancelBtn = document.getElementById("genericModalCancelBtn");
      if (cancelBtn) cancelBtn.style.display = "";
      gm.classList.remove("open");
      setTimeout(() => { gm.style.display = "none"; }, 150);
    }
  }

  function cancelAhspDetailModal(ahspId) {
    if (activeAhspModalSnapshot && activeAhspModalSnapshot.id === ahspId) {
      if (window.AhspEngine && window.AhspEngine.restoreAhspSnapshot) {
        window.AhspEngine.restoreAhspSnapshot(activeAhspModalSnapshot);
      }
    }
    activeAhspModalSnapshot = null;
    closeGenericModal();
    renderAhspView();
    renderCurrentTabContent();
  }

  function saveAndCloseAhspDetailModal(ahspId) {
    const ahsp = window.AhspEngine.getAhspById(ahspId);
    if (ahsp) {
      window.AhspEngine.saveEditedAhsp(ahsp);
      if (window.ProjectManager && window.ProjectManager.syncAhspDatabaseToFolder) {
        window.ProjectManager.syncAhspDatabaseToFolder();
      }
    }
    activeAhspModalSnapshot = null;
    closeGenericModal();
    renderAhspView();
    renderCurrentTabContent();
    if (window.showNotificationModal) {
      window.showNotificationModal({
        title: "Perubahan AHSP Berhasil Disimpan",
        subtitle: ahsp ? `${ahsp.code} - ${ahsp.name}` : "AHSP Berhasil Diperbarui",
        icon: "💾",
        type: "success",
        contentHtml: "<p>Perubahan AHSP dan kode revisi telah disimpan ke file <code>ahsp_revisi_dan_penambahan.json</code> secara instan tanpa delay.</p>",
        confirmText: "Lanjutkan"
      });
    }
  }

  function openAhspDetailModal(ahspId) {
    const ahsp = window.AhspEngine.getAhspById(ahspId);
    if (!ahsp) return;

    let compRows = "";
    (ahsp.components || []).forEach((c, idx) => {
      const sec = (c.section || 'BAHAN MATERIAL').toUpperCase();
      const badgeClass = sec.includes('TENAGA') ? 'badge-primary' : (sec.includes('ALAT') ? 'badge-warning' : 'badge-success');

      compRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><span class="badge ${badgeClass}" style="font-size: 10px;">${c.section || 'BAHAN MATERIAL'}</span></td>
          <td><strong>${c.name}</strong></td>
          <td class="text-center font-mono" style="font-size: 11px;">${c.code || '-'}</td>
          <td class="text-center">${c.unit}</td>
          <td class="text-right">
            <input type="number" step="0.0001" style="width: 75px; text-align: right; padding: 2px 4px; border: 1px solid #cbd5e1; border-radius: 4px;" value="${c.koef}" onchange="App.handleCompKoefChange('${ahspId}', ${idx}, this.value)">
          </td>
          <td class="text-right">
            <input type="number" step="1" min="0" style="width: 100px; text-align: right; padding: 2px 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 600; color: #1e293b;" value="${Math.round(c.price)}" onchange="App.handleCompPriceChange('${ahspId}', ${idx}, this.value)" title="1x edit harga satuan ini otomatis memperbarui seluruh katalog dan seluruh AHSP yang menggunakannya">
          </td>
          <td class="text-right font-bold">${window.CurrencyUtil.formatRupiah(c.total, false, true)}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-danger" style="padding: 2px 6px; font-size: 11px;" title="Hapus komponen ini" onclick="App.handleDeleteAhspComponent('${ahspId}', ${idx})">🗑️ Hapus</button>
          </td>
        </tr>
      `;
    });

    const calc = window.AhspEngine.calculateHsp(ahsp);

    const modalBody = document.getElementById("genericModalBody");
    const modalTitle = document.getElementById("genericModalTitle");
    if (modalBody && modalTitle) {
      modalTitle.textContent = `Detail Analisis Harga Satuan: ${ahsp.code} - ${ahsp.name}`;
      modalBody.innerHTML = `
        <div class="mb-3 d-flex justify-content-between align-items-center flex-wrap" style="background: #f8fafc; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0; gap: 10px;">
          <div>
            <div><strong>Kategori:</strong> ${ahsp.category} | <strong>Satuan:</strong> ${ahsp.unit}</div>
            <div class="mt-1 d-flex align-items-center" style="gap: 8px;">
              <label><strong>Overhead & Profit:</strong></label>
              <input type="number" style="width: 60px; padding: 2px 6px; border: 1px solid #cbd5e1; border-radius: 4px;" value="${calc.overheadPercent}" onchange="App.handleOverheadChange('${ahspId}', this.value)"> %
              <span class="text-muted" style="font-size: 11px;">(Standar PUPR: 10% - 15%)</span>
            </div>
          </div>
          <div class="d-flex align-items-center" style="gap: 6px;">
            <button class="btn btn-sm btn-primary font-bold" onclick="App.openAddAhspCompModal('${ahspId}')" style="display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
              ➕ Tambah Komponen dari Katalog Master
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table" style="font-size: 12px;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="width: 4%;">No</th>
                <th style="width: 14%;">Kelompok</th>
                <th style="width: 32%;">Uraian Komponen</th>
                <th style="width: 10%;" class="text-center">Kode</th>
                <th style="width: 7%;" class="text-center">Sat.</th>
                <th style="width: 11%;" class="text-right">Koefisien</th>
                <th style="width: 13%;" class="text-right">Harga Satuan (Rp)</th>
                <th style="width: 14%;" class="text-right">Jumlah Harga (Rp)</th>
                <th style="width: 8%;" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${compRows || '<tr><td colspan="9" class="text-center text-muted p-4">Tidak ada komponen rincian. Klik tombol <strong>+ Tambah Komponen dari Katalog Master</strong> di atas untuk menambahkan tenaga, material, atau alat.</td></tr>'}
              <tr class="table-active">
                <td colspan="7" class="text-right font-bold">Subtotal Tenaga Kerja (A):</td>
                <td class="text-right font-bold">${window.CurrencyUtil.formatRupiah(calc.subtotalTenaga, false, true)}</td>
                <td></td>
              </tr>
              <tr class="table-active">
                <td colspan="7" class="text-right font-bold">Subtotal Bahan Material (B):</td>
                <td class="text-right font-bold">${window.CurrencyUtil.formatRupiah(calc.subtotalBahan, false, true)}</td>
                <td></td>
              </tr>
              <tr class="table-active">
                <td colspan="7" class="text-right font-bold">Subtotal Peralatan (C):</td>
                <td class="text-right font-bold">${window.CurrencyUtil.formatRupiah(calc.subtotalAlat, false, true)}</td>
                <td></td>
              </tr>
              <tr>
                <td colspan="7" class="text-right font-bold">Jumlah Biaya Langsung (D = A + B + C):</td>
                <td class="text-right font-bold">${window.CurrencyUtil.formatRupiah(calc.dTotal, false, true)}</td>
                <td></td>
              </tr>
              <tr>
                <td colspan="7" class="text-right font-bold">Biaya Umum & Keuntungan (${calc.overheadPercent}% x D):</td>
                <td class="text-right font-bold">${window.CurrencyUtil.formatRupiah(calc.eOverhead, false, true)}</td>
                <td></td>
              </tr>
              <tr class="total-highlight-row" style="background: #f0fdf4; border-top: 2px solid #22c55e;">
                <td colspan="7" class="text-right font-bold" style="font-size: 13px; color: #15803d;">Harga Satuan Pekerjaan (D+E Dibulatkan):</td>
                <td class="text-right font-bold text-success" style="font-size: 14px;">${window.CurrencyUtil.formatRupiah(calc.finalHsp, false, true)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3 pt-3 flex-wrap" style="border-top: 1px solid #e2e8f0; gap: 8px;">
          <div class="text-muted" style="font-size: 11px;">
            🔒 <em>Wajib tekan Simpan atau Batal untuk keluar dari rincian AHSP ini.</em>
          </div>
          <div class="d-flex align-items-center" style="gap: 8px;">
            <button class="btn btn-outline" onclick="App.cancelAhspDetailModal('${ahspId}')" style="padding: 7px 18px; font-weight: 600;">❌ Batal</button>
            <button class="btn btn-primary font-bold" onclick="App.saveAndCloseAhspDetailModal('${ahspId}')" style="padding: 7px 20px; box-shadow: 0 2px 6px rgba(37,99,235,0.3);">💾 Simpan Perubahan AHSP &amp; Keluar</button>
          </div>
        </div>
      `;

      if (!activeAhspModalSnapshot || activeAhspModalSnapshot.id !== ahspId) {
        activeAhspModalSnapshot = JSON.parse(JSON.stringify(ahsp));
      }

      const gm = document.getElementById("genericModal");
      if (gm) {
        gm.dataset.preventBackdropClose = "true";
        gm.style.display = "flex";
        const closeBtn = document.getElementById("genericModalCloseBtn");
        if (closeBtn) closeBtn.style.display = "none";
        const cancelBtn = document.getElementById("genericModalCancelBtn");
        if (cancelBtn) cancelBtn.style.display = "none";
      }

      openModal("genericModal");
    }
  }

  function handleCompKoefChange(ahspId, compIdx, newKoef) {
    const ahsp = window.AhspEngine.getAhspById(ahspId);
    if (ahsp && ahsp.components && ahsp.components[compIdx]) {
      ahsp.components[compIdx].koef = parseFloat(newKoef) || 0;
      window.AhspEngine.saveEditedAhsp(ahsp);
      openAhspDetailModal(ahspId);
      renderCurrentTabContent();
    }
  }

  function handleCompPriceChange(ahspId, compIdx, newPrice) {
    const ahsp = window.AhspEngine.getAhspById(ahspId);
    if (ahsp && ahsp.components && ahsp.components[compIdx]) {
      const comp = ahsp.components[compIdx];
      const parsedPrice = parseFloat(newPrice) || 0;
      // Panggil Global Price Cascade agar 1x edit berlaku pada seluruh data yang menggunakan tenaga/material/alat ini
      const result = window.AhspEngine.cascadeMaterialPrice(comp.code, comp.name, parsedPrice, ahspId);
      openAhspDetailModal(ahspId);
      renderCurrentTabContent();
      
      if (window.showNotificationModal) {
        window.showNotificationModal({
          title: "Harga Satuan Diperbarui & Disinkronkan",
          subtitle: `${comp.name} (${comp.code || '-'})`,
          icon: "⚡",
          type: "success",
          contentHtml: `
            <div style="font-size: 12.5px; line-height: 1.4; color: #334155;">
              Harga baru <strong>${window.CurrencyUtil.formatRupiah(parsedPrice, false, true)}</strong> per ${comp.unit} telah disimpan.<br><br>
              ✅ <strong>Global Price Cascade Berhasil:</strong> Perubahan otomatis diterapkan ke <strong>${result.affectedAhspCount || 1} Analisis AHSP</strong> dan <strong>${result.affectedItemCount || 0} Item RAB</strong> yang menggunakan sumber daya ini!
            </div>
          `,
          confirmText: "Lanjutkan"
        });
      }
    }
  }

  function handleDeleteAhspComponent(ahspId, compIdx) {
    window.AhspEngine.removeComponentFromAhsp(ahspId, compIdx);
    openAhspDetailModal(ahspId);
    renderCurrentTabContent();
  }

  function handleOverheadChange(ahspId, newOverhead) {
    const ahsp = window.AhspEngine.getAhspById(ahspId);
    if (ahsp) {
      ahsp.overhead_percent = parseFloat(newOverhead) || 0;
      window.AhspEngine.saveEditedAhsp(ahsp);
      openAhspDetailModal(ahspId);
      renderCurrentTabContent();
    }
  }

  // =========================================================================
  // =========================================================================
  // MODAL PEMILIH MULTI-KOMPONEN DARI MASTER KATALOG (Hingga 3 Komponen / Multi-Select)
  // Pencarian Cepat Berdasarkan Teks (Nama) atau Kode Komponen (L.xx, M.xxxx, E.xx)
  // =========================================================================
  let compPickerState = {
    category: "ALL", // "ALL", "UPAH", "BAHAN", "ALAT"
    search: "",
    selectedItems: [], // array of { id, code, name, category, unit, price, koef, section }
    ahspId: null,
    onSelectCallback: null
  };

  function openAddAhspCompModal(ahspId, callback = null) {
    compPickerState = {
      category: "ALL",
      search: "",
      selectedItems: [],
      ahspId: ahspId,
      onSelectCallback: callback
    };

    const modal = document.getElementById("compPickerModal");
    if (!modal) return;

    const searchInput = document.getElementById("compPickerSearchInput");
    if (searchInput) searchInput.value = "";

    setCompPickerCat("ALL");
    renderCompPickerItemsList();
    renderCompPickerSelectedTray();

    modal.style.display = "flex";
    setTimeout(() => {
      modal.classList.add("open");
      if (searchInput) searchInput.focus();
    }, 40);
  }

  function closeCompPickerModal() {
    const modal = document.getElementById("compPickerModal");
    if (modal) {
      modal.classList.remove("open");
      modal.style.display = "none";
    }
  }

  function setCompPickerCat(cat) {
    compPickerState.category = cat;
    const tabs = ["ALL", "UPAH", "BAHAN", "ALAT"];
    tabs.forEach(t => {
      const el = document.getElementById(`catTab${t}`);
      if (el) {
        el.className = (t === cat) ? "btn btn-sm btn-primary font-bold" : "btn btn-sm btn-outline";
      }
    });
    renderCompPickerItemsList();
  }

  function handleCompPickerSearch(val) {
    compPickerState.search = val || "";
    renderCompPickerItemsList();
  }

  function getFilteredMasterMaterials() {
    const allMaterials = window.MASTER_MATERIALS || [];
    let filtered = allMaterials;

    if (compPickerState.category === "UPAH") {
      filtered = filtered.filter(m => (m.category || "").toUpperCase().includes("UPAH") || (m.code || "").startsWith("L"));
    } else if (compPickerState.category === "ALAT") {
      filtered = filtered.filter(m => (m.category || "").toUpperCase().includes("ALAT") || (m.code || "").startsWith("E"));
    } else if (compPickerState.category === "BAHAN") {
      filtered = filtered.filter(m => !(m.category || "").toUpperCase().includes("UPAH") && !(m.category || "").toUpperCase().includes("ALAT") && !(m.code || "").startsWith("L") && !(m.code || "").startsWith("E"));
    }

    if (compPickerState.search && compPickerState.search.trim() !== "") {
      const q = compPickerState.search.toLowerCase().trim();
      filtered = filtered.filter(m => {
        const nameMatch = m.name && m.name.toLowerCase().includes(q);
        const codeMatch = m.code && m.code.toLowerCase().includes(q);
        return nameMatch || codeMatch;
      });
    }

    return filtered;
  }

  function renderCompPickerItemsList() {
    const container = document.getElementById("compPickerItemsList");
    const countBadge = document.getElementById("compPickerCountBadge");
    if (!container) return;

    const filtered = getFilteredMasterMaterials();
    if (countBadge) countBadge.textContent = `${filtered.length} Item Ditemukan`;

    const previewList = filtered.slice(0, 50);

    if (previewList.length === 0) {
      container.innerHTML = `
        <div class="p-4 text-center text-muted">
          <div style="font-size: 20px; margin-bottom: 4px;">🔍</div>
          <div>Tidak ditemukan komponen dengan kata kunci atau kode "<strong>${compPickerState.search}</strong>".</div>
          <div style="font-size: 11px; margin-top: 4px; color: #94a3b8;">Coba cari nama umum (misal: pekerja, semen, multiplek, tiang) atau kode (L.01, M.0114, E.01).</div>
        </div>
      `;
      return;
    }

    let html = "";
    previewList.forEach(m => {
      const effPrice = window.CatalogPricing ? window.CatalogPricing.getEffectivePrice(m) : m.price;
      const isSelected = compPickerState.selectedItems.some(item => item.id === m.id);
      const isUpah = (m.category || "").toUpperCase().includes("UPAH") || (m.code || "").startsWith("L");
      const isAlat = (m.category || "").toUpperCase().includes("ALAT") || (m.code || "").startsWith("E");
      const catBadge = isUpah ? "badge-primary" : (isAlat ? "badge-warning" : "badge-success");
      const catLabel = isUpah ? "TENAGA KERJA" : (isAlat ? "PERALATAN" : "BAHAN MATERIAL");

      html += `
        <div class="comp-picker-item ${isSelected ? 'selected-picker-item' : ''}" 
             style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid #f1f5f9; cursor: pointer; background: ${isSelected ? '#eff6ff' : '#ffffff'}; border-left: ${isSelected ? '4px solid #2563eb' : '4px solid transparent'}; transition: all 0.15s ease;"
             onclick="App.toggleCompPickerItem('${m.id}')">
          <div style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" style="width: 16px; height: 16px; cursor: pointer;" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); App.toggleCompPickerItem('${m.id}')">
            <div>
              <div style="font-weight: 700; font-size: 12.5px; color: #0f172a;">${m.name}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px; display: flex; align-items: center; gap: 6px;">
                <span class="badge ${catBadge}" style="font-size: 9.5px; padding: 1px 6px;">${catLabel}</span>
                <span class="font-mono font-bold" style="background: #f1f5f9; padding: 1px 6px; border-radius: 4px; color: #1e293b;">${m.code || '-'}</span>
                <span>Satuan: <strong>${m.unit}</strong></span>
              </div>
            </div>
          </div>
          <div style="text-align: right; display: flex; align-items: center; gap: 12px;">
            <div>
              <div style="font-weight: 800; font-size: 12.5px; color: #1e40af;">${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(effPrice, false, true) : effPrice}</div>
              <div style="font-size: 10px; color: #94a3b8;">per ${m.unit}</div>
            </div>
            <button type="button" class="btn btn-sm ${isSelected ? 'btn-outline-danger' : 'btn-outline-primary'}" style="padding: 3px 8px; font-size: 11px; font-weight: 700;" onclick="event.stopPropagation(); App.toggleCompPickerItem('${m.id}')">
              ${isSelected ? '✕ Batal' : '➕ Pilih'}
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function renderCompPickerSelectedTray() {
    const container = document.getElementById("compPickerSelectedTray");
    if (!container) return;

    const count = compPickerState.selectedItems.length;

    if (count === 0) {
      container.innerHTML = `
        <div class="text-center text-muted" style="padding: 12px; font-size: 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">
          👆 <strong>Belum ada komponen yang dipilih.</strong> Anda dapat memilih hingga <strong>3 komponen</strong> (Tenaga, Bahan, Alat) sekaligus dan menentukan koefisiennya di sini.
        </div>
      `;
      return;
    }

    let rowsHtml = "";
    let totalEst = 0;

    compPickerState.selectedItems.forEach((item, idx) => {
      const sub = Math.round(item.koef * item.price * 100) / 100;
      totalEst += sub;
      const isUpah = item.category.toUpperCase().includes("UPAH") || item.code.startsWith("L");
      const isAlat = item.category.toUpperCase().includes("ALAT") || item.code.startsWith("E");
      const catBadge = isUpah ? "badge-primary" : (isAlat ? "badge-warning" : "badge-success");

      rowsHtml += `
        <div style="display: grid; grid-template-columns: 28px 1fr 130px 110px 32px; gap: 8px; align-items: center; padding: 6px 8px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 6px;">
          <div style="font-weight: 800; font-size: 11px; color: #64748b; text-align: center;">${idx + 1}.</div>
          <div>
            <div style="font-weight: 700; font-size: 12px; color: #0f172a;">${item.name}</div>
            <div style="font-size: 10px; color: #64748b;">
              <span class="badge ${catBadge}" style="font-size: 8.5px; padding: 1px 4px;">${item.section}</span>
              <span class="font-mono font-bold">${item.code}</span> &bull; ${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(item.price, false, true) : item.price} / ${item.unit}
            </div>
          </div>
          <div>
            <label style="font-size: 9.5px; font-weight: 700; color: #475569; display: block; margin-bottom: 2px;">Koefisien (${item.unit})</label>
            <input type="number" step="0.0001" min="0.0001" class="form-control font-bold" value="${item.koef}" style="font-size: 12px; padding: 3px 6px; text-align: right;" oninput="App.updateCompPickerItemKoef('${item.id}', this.value)">
          </div>
          <div style="text-align: right;">
            <div style="font-size: 9.5px; color: #64748b;">Subtotal:</div>
            <div style="font-weight: 800; font-size: 12px; color: #1e40af;">${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(sub, false, true) : sub}</div>
          </div>
          <div style="text-align: center;">
            <button type="button" class="btn btn-sm btn-outline-danger" style="padding: 2px 5px; font-size: 10px;" onclick="App.removeCompPickerItem('${item.id}')" title="Hapus dari daftar pilihan">✕</button>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px 12px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="font-weight: 800; font-size: 12px; color: #166534;">
            ✅ Komponen Terpilih (${count} Komponen):
          </div>
          <div style="font-weight: 800; font-size: 12px; color: #15803d;">
            Estimasi Tambahan HSP: ${window.CurrencyUtil ? window.CurrencyUtil.formatRupiah(totalEst, false, true) : totalEst}
          </div>
        </div>
        ${rowsHtml}
      </div>
    `;
  }

  function toggleCompPickerItem(id) {
    const allMaterials = window.MASTER_MATERIALS || [];
    const item = allMaterials.find(m => m.id === id);
    if (!item) return;

    const existingIdx = compPickerState.selectedItems.findIndex(i => i.id === id);
    if (existingIdx !== -1) {
      compPickerState.selectedItems.splice(existingIdx, 1);
    } else {
      const effPrice = window.CatalogPricing ? window.CatalogPricing.getEffectivePrice(item) : item.price;
      let section = "BAHAN MATERIAL";
      const cat = (item.category || "").toUpperCase();
      if (cat.includes("UPAH") || (item.code || "").startsWith("L")) section = "TENAGA KERJA";
      else if (cat.includes("ALAT") || (item.code || "").startsWith("E")) section = "PERALATAN";

      compPickerState.selectedItems.push({
        id: item.id,
        code: item.code || "-",
        name: item.name,
        category: item.category || "MATERIAL",
        section: section,
        unit: item.unit || "unit",
        price: effPrice,
        koef: 1.0000
      });
    }

    renderCompPickerItemsList();
    renderCompPickerSelectedTray();
  }

  function updateCompPickerItemKoef(id, val) {
    const found = compPickerState.selectedItems.find(i => i.id === id);
    if (found) {
      found.koef = parseFloat(val) || 0.0001;
      renderCompPickerSelectedTray();
    }
  }

  function removeCompPickerItem(id) {
    compPickerState.selectedItems = compPickerState.selectedItems.filter(i => i.id !== id);
    renderCompPickerItemsList();
    renderCompPickerSelectedTray();
  }

  function submitCompPicker() {
    if (compPickerState.selectedItems.length === 0) {
      if (window.showNotificationModal) {
        window.showNotificationModal({
          title: "Pilih Komponen Terlebih Dahulu",
          icon: "ℹ️",
          type: "info",
          contentHtml: "<div style='font-size: 13px;'>Silakan pilih minimal 1 komponen tenaga, material, atau alat dari katalog master sebelum menambahkan.</div>",
          confirmText: "Mengerti"
        });
      } else {
        alert("Silakan pilih minimal satu komponen dari daftar katalog terlebih dahulu.");
      }
      return;
    }

    const itemsToAdd = compPickerState.selectedItems.map(item => {
      let section = "BAHAN MATERIAL";
      const cat = (item.category || "").toUpperCase();
      if (cat.includes("UPAH") || (item.code || "").startsWith("L")) section = "TENAGA KERJA";
      else if (cat.includes("ALAT") || (item.code || "").startsWith("E")) section = "PERALATAN";

      const koefVal = Number(item.koef) || 1.0;
      const priceVal = Number(item.price) || 0;

      return {
        section: section,
        name: item.name,
        code: item.code || "-",
        unit: item.unit || "unit",
        koef: koefVal,
        price: priceVal,
        total: Math.round(koefVal * priceVal * 100) / 100
      };
    });

    if (compPickerState.ahspId) {
      itemsToAdd.forEach(comp => {
        window.AhspEngine.addComponentToAhsp(compPickerState.ahspId, comp);
      });
      closeCompPickerModal();
      openAhspDetailModal(compPickerState.ahspId);
      renderCurrentTabContent();
    } else if (compPickerState.onSelectCallback) {
      itemsToAdd.forEach(comp => {
        compPickerState.onSelectCallback(comp);
      });
      closeCompPickerModal();
    } else {
      closeCompPickerModal();
    }
  }

  function changeAhspPage(newPage) {
    currentAhspPage = Number(newPage) || 1;
    renderAhspView();
  }

  function changeAhspPageSize(newSize) {
    ahspPageSize = Number(newSize) || 50;
    currentAhspPage = 1;
    renderAhspView();
  }

  function deleteInspection(id) {
    showConfirmModal({
      title: "Hapus Catatan Pemeriksaan Mutu",
      message: "Apakah Anda yakin ingin menghapus catatan temuan dan instruksi perbaikan mutu pekerjaan ini?",
      confirmText: "Ya, Hapus Catatan",
      isDanger: true,
      onConfirm: function() {
        window.SiteCorrection.deleteInspection(id);
        renderKoreksiView();
      }
    });
  }

  function printUsedAhsp() {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return;
    
    const usedCodes = window.AhspEngine.getUsedAhspCodes();
    const allMaster = (window.MASTER_AHSP || []);
    const usedList = allMaster.filter(a => usedCodes.has(a.id) || usedCodes.has(a.code));

    if (usedList.length === 0) {
      showFormModal({
        title: "Informasi AHSP",
        bodyHtml: "<p class='p-3 text-muted'>Belum ada item pekerjaan di dalam RAB yang menggunakan analisa AHSP standar.</p>",
        hideSubmit: true
      });
      return;
    }

    renderAndPrintAhspList(usedList, `${proj.name} - AHSP Terpakai`, "DAFTAR ANALISIS HARGA SATUAN PEKERJAAN (AHSP) TERPAKAI");
  }

  function printAllAhsp() {
    const proj = window.ProjectManager.getActiveProject() || {};
    const categories = window.AhspEngine.getCategories();
    
    showFormModal({
      title: "Cetak Seluruh AHSP Lengkap 2026",
      subtitle: "Pilih format dokumen cetak yang diinginkan (Standar SE No. 47/2026)",
      fields: [
        {
          name: "printFormat",
          label: "Pilihan Format Cetak",
          type: "select",
          value: "catalog",
          options: [
            { value: "catalog", label: "📋 Katalog Ringkas Master AHSP (Kode, Uraian, Satuan, HSP) — Cepat & Rapi (~45 Hal A4)" },
            { value: "category", label: "📑 Rincian Komponen per Divisi / Kategori (Pilih Divisi Tertentu)" },
            { value: "all_full", label: "⚠️ Seluruh Rincian Komponen Lengkap AHSP (Dokumen Sangat Besar)" }
          ]
        },
        {
          name: "categorySelect",
          label: "Pilih Divisi (Jika memilih opsi Rincian per Divisi)",
          type: "select",
          value: categories[0] || "Pekerjaan Persiapan",
          options: categories.map(c => ({ value: c, label: c }))
        }
      ],
      submitText: "Lanjutkan Cetak",
      onSubmit: (data) => {
        if (data.printFormat === "catalog") {
          printAhspCatalogSummary(window.MASTER_AHSP || []);
        } else if (data.printFormat === "category") {
          const filtered = (window.MASTER_AHSP || []).filter(a => a.category === data.categorySelect);
          renderAndPrintAhspList(filtered, `AHSP_${data.categorySelect}`, `DAFTAR ANALISIS HARGA SATUAN: ${data.categorySelect.toUpperCase()}`);
        } else {
          renderAndPrintAhspList(window.MASTER_AHSP || [], "Daftar_Lengkap_AHSP_2026", "DAFTAR LENGKAP ANALISIS HARGA SATUAN PEKERJAAN (AHSP) 2026");
        }
      }
    });
  }

  function printAhspCatalogSummary(list) {
    const proj = window.ProjectManager.getActiveProject() || {};
    let rowsHtml = "";
    list.forEach((item, idx) => {
      rowsHtml += `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td style="font-weight: 700;">${item.code}</td>
          <td>${item.name}</td>
          <td><span style="font-size: 8pt; color: #64748b;">${item.category}</span></td>
          <td style="text-align: center;">${item.unit}</td>
          <td style="text-align: right; font-weight: 700;">${window.CurrencyUtil.formatRupiah(item.hsp)}</td>
        </tr>
      `;
    });

    const fullHtml = `
      <div class="print-header-block">
        ${window.PrintEngine.createPrintHeader(proj, "KATALOG MASTER ANALISIS HARGA SATUAN PEKERJAAN 2026")}
        <div style="font-size: 11px; margin-top: 4px; color: #475569;">
          Total Master Analisis: <strong>${list.length} item</strong> &bull; Standar SE Bina Konstruksi No. 47/SE/Dk/2026
        </div>
      </div>
      <table class="table" style="width: 100%; font-size: 8.5pt;">
        <thead>
          <tr>
            <th style="width: 5%">No</th>
            <th style="width: 15%">Kode AHSP</th>
            <th style="width: 45%">Uraian Analisis Pekerjaan</th>
            <th style="width: 15%">Kategori / Divisi</th>
            <th style="width: 8%">Satuan</th>
            <th style="width: 12%">HSP Satuan (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      ${window.PrintEngine.createPrintFooter(proj, {
        pageStr: `Katalog Master AHSP 2026 • Total ${list.length} Item`,
        statusDoc: "Dokumen Sah Master AHSP 2026"
      })}
    `;

    window.PrintEngine.printViaHiddenIframe(fullHtml, " ");
  }

  function renderAndPrintAhspList(list, docTitle, headerTitle) {
    const proj = window.ProjectManager.getActiveProject() || {};
    
    let cardsHtml = "";
    list.forEach((item, aIdx) => {
      let compRows = "";
      (item.components || []).forEach((c, cIdx) => {
        compRows += `
          <tr>
            <td style="text-align: center; padding: 2.5px 3px;">${cIdx + 1}</td>
            <td style="padding: 2.5px 6px;">${c.name}</td>
            <td style="text-align: center; padding: 2.5px 3px; font-family: monospace; font-size: 7.5pt;">${c.code || '-'}</td>
            <td style="text-align: center; padding: 2.5px 3px;">${c.unit}</td>
            <td style="text-align: right; padding: 2.5px 4px;">${c.koef}</td>
            <td style="text-align: right; padding: 2.5px 4px; white-space: nowrap;">${window.CurrencyUtil.formatRupiah(c.price, false, true)}</td>
            <td style="text-align: right; font-weight: 700; padding: 2.5px 5px; white-space: nowrap;">${window.CurrencyUtil.formatRupiah(c.total, false, true)}</td>
          </tr>
        `;
      });

      cardsHtml += `
        <div class="ahsp-print-card" style="border: none !important; border-radius: 0 !important; padding: 0 0 10px 0 !important; margin-bottom: 16px !important; page-break-inside: avoid; break-inside: avoid; background-color: transparent !important;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5px; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; gap: 14px;">
            <div style="flex: 1; min-width: 0;">
              <span style="font-weight: 800; font-size: 10pt; color: #0f172a; word-break: break-word;">${aIdx + 1}. [${item.code}] ${item.name}</span>
              <div style="font-size: 8pt; color: #64748b; margin-top: 1px;">Kategori: <strong>${item.category || '-'}</strong> | Satuan Hasil: <strong>${item.unit}</strong></div>
            </div>
            <div style="text-align: right; flex-shrink: 0; white-space: nowrap; min-width: 220px;">
              <div style="font-size: 7.5pt; color: #64748b; margin-bottom: 2px; white-space: nowrap;">Harga Satuan Pekerjaan (HSP):</div>
              <div style="font-size: 11pt; font-weight: 800; color: #2563eb; white-space: nowrap; font-variant-numeric: tabular-nums;">
                ${window.CurrencyUtil.formatRupiah(item.hsp, false, true)} <span style="font-size: 8.5pt; font-weight: 600; color: #475569;">/ ${item.unit}</span>
              </div>
            </div>
          </div>
          <table class="table" style="font-size: 7.5pt; margin-bottom: 0; width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f1f5f9; color: #1e293b;">
                <th style="width: 4%; text-align: center; padding: 3px 2px;">No</th>
                <th style="width: 42%; padding: 3px 6px;">Uraian Bahan / Tenaga / Alat</th>
                <th style="width: 10%; text-align: center; padding: 3px 2px;">Kode</th>
                <th style="width: 8%; text-align: center; padding: 3px 2px;">Satuan</th>
                <th style="width: 10%; text-align: right; padding: 3px 4px;">Koefisien</th>
                <th style="width: 13%; text-align: right; padding: 3px 4px;">Harga Satuan (Rp)</th>
                <th style="width: 13%; text-align: right; padding: 3px 4px;">Subtotal (Rp)</th>
              </tr>
            </thead>
            <tbody>
              ${compRows || '<tr><td colspan="7" class="text-center text-muted p-2">Tidak ada rincian komponen.</td></tr>'}
            </tbody>
          </table>
        </div>
      `;
    });

    const fullHtml = `
      <div class="print-header-block" style="margin-bottom: 12px;">
        ${window.PrintEngine.createPrintHeader(proj, headerTitle)}
        <div style="font-size: 9pt; margin-top: 4px; color: #475569; display: flex; justify-content: space-between; border-bottom: 1.5px solid #0f172a; padding-bottom: 4px;">
          <div>Standar Acuan: <strong>${proj.dataSource || 'SE Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026'}</strong></div>
          <div>Total Analisis Terlampir: <strong>${list.length} item</strong></div>
        </div>
      </div>
      <div class="ahsp-cards-flow">
        ${cardsHtml}
      </div>
      ${window.PrintEngine.createPrintFooter(proj, {
        pageStr: `Katalog Rincian Komponen AHSP 2026 • Total ${list.length} Item`,
        statusDoc: "Dokumen Sah Analisis AHSP 2026"
      })}
    `;

    // Eksekusi via hidden iframe (100% terisolasi dari DOM layar utama)
    window.PrintEngine.printViaHiddenIframe(fullHtml, " ");
  }

  function printUsedMaterialsCatalog() {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return;

    const usedMaterials = (window.CatalogPricing && window.CatalogPricing.getUsedMaterialsList)
      ? window.CatalogPricing.getUsedMaterialsList(proj)
      : [];

    if (usedMaterials.length === 0) {
      showFormModal({
        title: "Informasi Katalog Harga Satuan",
        bodyHtml: "<p class='p-3 text-muted'>Belum ada item pekerjaan di dalam RAB yang menggunakan analisa AHSP atau data harga satuan upah, material, dan alat.</p>",
        hideSubmit: true
      });
      return;
    }

    const upahList = [];
    const materialList = [];
    const alatList = [];

    usedMaterials.forEach(m => {
      const cat = (m.category || m.type || '').toUpperCase();
      if (cat.includes('UPAH') || cat.includes('TENAGA') || m.type === 'upah') {
        upahList.push(m);
      } else if (cat.includes('ALAT') || cat.includes('SEWA') || m.type === 'alat') {
        alatList.push(m);
      } else {
        materialList.push(m);
      }
    });

    function generateSectionRows(list, startIndex) {
      let html = "";
      list.forEach((item, idx) => {
        const effPrice = window.CatalogPricing.getEffectivePrice(item);
        html += `
          <tr>
            <td style="text-align: center; width: 5%; padding: 4px 2px;">${startIndex + idx}</td>
            <td style="text-align: center; width: 12%; padding: 4px 4px; font-family: monospace; font-size: 8pt;">${item.code || '-'}</td>
            <td style="width: 55%; padding: 4px 8px;"><strong>${item.name}</strong></td>
            <td style="text-align: center; width: 10%; padding: 4px 4px;">${item.unit}</td>
            <td style="text-align: right; width: 18%; padding: 4px 8px; font-weight: 700;">${window.CurrencyUtil.formatRupiah(effPrice)}</td>
          </tr>
        `;
      });
      return html;
    }

    let tableRows = "";
    let curNo = 1;

    if (upahList.length > 0) {
      tableRows += `
        <tr style="background-color: #f1f5f9; font-weight: 700; border-top: 1.5px solid #cbd5e1; border-bottom: 1.5px solid #cbd5e1;">
          <td colspan="5" style="padding: 5px 8px; color: #0f172a; font-size: 8.5pt;">
            A. UPAH TENAGA KERJA (${upahList.length} Item)
          </td>
        </tr>
      `;
      tableRows += generateSectionRows(upahList, curNo);
      curNo += upahList.length;
    }

    if (materialList.length > 0) {
      tableRows += `
        <tr style="background-color: #f1f5f9; font-weight: 700; border-top: 1.5px solid #cbd5e1; border-bottom: 1.5px solid #cbd5e1;">
          <td colspan="5" style="padding: 5px 8px; color: #0f172a; font-size: 8.5pt;">
            B. MATERIAL / BAHAN BANGUNAN (${materialList.length} Item)
          </td>
        </tr>
      `;
      tableRows += generateSectionRows(materialList, curNo);
      curNo += materialList.length;
    }

    if (alatList.length > 0) {
      tableRows += `
        <tr style="background-color: #f1f5f9; font-weight: 700; border-top: 1.5px solid #cbd5e1; border-bottom: 1.5px solid #cbd5e1;">
          <td colspan="5" style="padding: 5px 8px; color: #0f172a; font-size: 8.5pt;">
            C. SEWA PERALATAN (${alatList.length} Item)
          </td>
        </tr>
      `;
      tableRows += generateSectionRows(alatList, curNo);
      curNo += alatList.length;
    }

    const sig = (proj && proj.signatories) || {};
    const sigOwnerName = (sig.ownerName && !sig.ownerName.includes('...')) ? sig.ownerName : ((proj && proj.owner) || 'Ir. Budi Santoso, M.T.');
    const sigOwnerTitle = sig.ownerTitle || 'Pemilik Proyek';
    const sigConsultantName = (sig.consultantName && !sig.consultantName.includes('...')) ? sig.consultantName : 'Ir. Bambang Hartono, S.T., M.T.';
    const sigConsultantTitle = sig.consultantCompany || sig.consultantTitle || (proj && proj.consultant) || 'CV. Architecindo Consultant';
    const sigContractorName = (sig.contractorName && !sig.contractorName.includes('...')) ? sig.contractorName : 'H. Ahmad Fauzi, S.T.';
    const sigContractorTitle = sig.contractorCompany || sig.contractorTitle || (proj && proj.contractor) || 'PT. Karya Mandiri Perkasa';

    const fullHtml = `
      <div class="print-header-block" style="margin-bottom: 14px;">
        ${window.PrintEngine.createPrintHeader(proj, "DAFTAR HARGA SATUAN UPAH, BAHAN & PERALATAN (ITEM TERPAKAI)")}
        <div style="font-size: 9pt; margin-top: 5px; color: #475569; display: flex; justify-content: space-between; border-bottom: 1.5px solid #0f172a; padding-bottom: 5px;">
          <div>Standar Acuan: <strong>${proj.dataSource || 'SE Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026'}</strong></div>
          <div>Total Sumber Daya Terpakai: <strong>${usedMaterials.length} Item</strong></div>
        </div>
      </div>

      <table class="table" style="width: 100%; font-size: 8pt; margin-bottom: 20px; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #e2e8f0; color: #0f172a; font-weight: 700; border-top: 1.5px solid #0f172a; border-bottom: 1.5px solid #0f172a;">
            <th style="width: 5%; text-align: center; padding: 5px 2px;">No</th>
            <th style="width: 12%; text-align: center; padding: 5px 4px;">Kode</th>
            <th style="width: 55%; padding: 5px 8px;">Uraian Upah / Bahan / Peralatan</th>
            <th style="width: 10%; text-align: center; padding: 5px 4px;">Satuan</th>
            <th style="width: 18%; text-align: right; padding: 5px 8px;">Harga Satuan (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <!-- Lembar Pengesahan Tiga Pihak (Bebas Titik-Titik & Sejajar 3 Kolom Horizontal) -->
      <table class="signature-clean-table" style="width: 100% !important; border-collapse: collapse !important; border: none !important; background: transparent !important; margin-top: 24pt !important; page-break-inside: avoid !important; break-inside: avoid !important;">
        <tr style="border: none !important; background: transparent !important;">
          <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 10px !important; background: transparent !important;">
            <div class="sig-title" style="font-weight: 800; font-size: 9pt; color: #1e293b; margin-bottom: 4px;">PEMBERI TUGAS / OWNER</div>
            <div style="font-size: 8pt; color: #64748b; min-height: 16px;">Menyetujui &amp; Menetapkan:</div>
            <div class="sig-space" style="height: 45px;"></div>
            <div class="sig-name" style="font-weight: 700; font-size: 9pt; color: #0f172a; text-decoration: none !important; border-bottom: none !important;">( ${sigOwnerName} )</div>
            <div class="sig-role" style="font-size: 8pt; color: #334155; margin-top: 3px;">${sigOwnerTitle}</div>
          </td>
          <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 10px !important; background: transparent !important;">
            <div class="sig-title" style="font-weight: 800; font-size: 9pt; color: #1e293b; margin-bottom: 4px;">KONSULTAN PERENCANA</div>
            <div style="font-size: 8pt; color: #64748b; min-height: 16px;">Direncanakan:</div>
            <div class="sig-space" style="height: 45px;"></div>
            <div class="sig-name" style="font-weight: 700; font-size: 9pt; color: #0f172a; text-decoration: none !important; border-bottom: none !important;">( ${sigConsultantName} )</div>
            <div class="sig-role" style="font-size: 8pt; color: #334155; margin-top: 3px;">${sigConsultantTitle}</div>
          </td>
          <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 10px !important; background: transparent !important;">
            <div class="sig-title" style="font-weight: 800; font-size: 9pt; color: #1e293b; margin-bottom: 4px;">KONTRAKTOR PELAKSANA</div>
            <div style="font-size: 8pt; color: #64748b; min-height: 16px;">Diajukan:</div>
            <div class="sig-space" style="height: 45px;"></div>
            <div class="sig-name" style="font-weight: 700; font-size: 9pt; color: #0f172a; text-decoration: none !important; border-bottom: none !important;">( ${sigContractorName} )</div>
            <div class="sig-role" style="font-size: 8pt; color: #334155; margin-top: 3px;">${sigContractorTitle}</div>
          </td>
        </tr>
      </table>
      
    `;

    window.PrintEngine.printViaHiddenIframe(fullHtml, "Katalog_Item_Terpakai");
  }

  function printAllMaterialsCatalog() {
    const proj = window.ProjectManager.getActiveProject() || {};
    const allMaterials = (window.MASTER_MATERIALS || []);

    if (allMaterials.length === 0) {
      showFormModal({
        title: "Informasi Master Katalog",
        bodyHtml: "<p class='p-3 text-muted'>Data master katalog harga satuan kosong.</p>",
        hideSubmit: true
      });
      return;
    }

    const upahList = [];
    const materialList = [];
    const alatList = [];

    allMaterials.forEach(m => {
      const cat = (m.category || m.type || '').toUpperCase();
      if (cat.includes('UPAH') || cat.includes('TENAGA') || m.type === 'upah') {
        upahList.push(m);
      } else if (cat.includes('ALAT') || cat.includes('SEWA') || m.type === 'alat') {
        alatList.push(m);
      } else {
        materialList.push(m);
      }
    });

    function generateSectionRows(list, startIndex) {
      let html = "";
      list.forEach((item, idx) => {
        const effPrice = window.CatalogPricing.getEffectivePrice(item);
        html += `
          <tr>
            <td style="text-align: center; width: 5%; padding: 4px 2px;">${startIndex + idx}</td>
            <td style="text-align: center; width: 12%; padding: 4px 4px; font-family: monospace; font-size: 8pt;">${item.code || '-'}</td>
            <td style="width: 55%; padding: 4px 8px;"><strong>${item.name}</strong></td>
            <td style="text-align: center; width: 10%; padding: 4px 4px;">${item.unit}</td>
            <td style="text-align: right; width: 18%; padding: 4px 8px; font-weight: 700;">${window.CurrencyUtil.formatRupiah(effPrice)}</td>
          </tr>
        `;
      });
      return html;
    }

    let tableRows = "";
    let curNo = 1;

    if (upahList.length > 0) {
      tableRows += `
        <tr style="background-color: #f1f5f9; font-weight: 700; border-top: 1.5px solid #cbd5e1; border-bottom: 1.5px solid #cbd5e1;">
          <td colspan="5" style="padding: 5px 8px; color: #0f172a; font-size: 8.5pt;">
            A. STANDAR UPAH TENAGA KERJA (${upahList.length} Item)
          </td>
        </tr>
      `;
      tableRows += generateSectionRows(upahList, curNo);
      curNo += upahList.length;
    }

    if (materialList.length > 0) {
      tableRows += `
        <tr style="background-color: #f1f5f9; font-weight: 700; border-top: 1.5px solid #cbd5e1; border-bottom: 1.5px solid #cbd5e1;">
          <td colspan="5" style="padding: 5px 8px; color: #0f172a; font-size: 8.5pt;">
            B. STANDAR MATERIAL / BAHAN BANGUNAN (${materialList.length} Item)
          </td>
        </tr>
      `;
      tableRows += generateSectionRows(materialList, curNo);
      curNo += materialList.length;
    }

    if (alatList.length > 0) {
      tableRows += `
        <tr style="background-color: #f1f5f9; font-weight: 700; border-top: 1.5px solid #cbd5e1; border-bottom: 1.5px solid #cbd5e1;">
          <td colspan="5" style="padding: 5px 8px; color: #0f172a; font-size: 8.5pt;">
            C. STANDAR SEWA PERALATAN (${alatList.length} Item)
          </td>
        </tr>
      `;
      tableRows += generateSectionRows(alatList, curNo);
      curNo += alatList.length;
    }

    const fullHtml = `
      <div class="print-header-block" style="margin-bottom: 14px;">
        ${window.PrintEngine.createPrintHeader(proj, "DAFTAR STANDAR HARGA SATUAN UPAH, BAHAN & PERALATAN LENGKAP")}
        <div style="font-size: 9pt; margin-top: 5px; color: #475569; display: flex; justify-content: space-between; border-bottom: 1.5px solid #0f172a; padding-bottom: 5px;">
          <div>Standar Acuan: <strong>${proj.dataSource || 'SE Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026'}</strong></div>
          <div>Total Master Sumber Daya: <strong>${allMaterials.length} Item</strong></div>
        </div>
      </div>

      <table class="table" style="width: 100%; font-size: 8pt; margin-bottom: 20px; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #e2e8f0; color: #0f172a; font-weight: 700; border-top: 1.5px solid #0f172a; border-bottom: 1.5px solid #0f172a;">
            <th style="width: 5%; text-align: center; padding: 5px 2px;">No</th>
            <th style="width: 12%; text-align: center; padding: 5px 4px;">Kode</th>
            <th style="width: 55%; padding: 5px 8px;">Uraian Upah / Bahan / Peralatan</th>
            <th style="width: 10%; text-align: center; padding: 5px 4px;">Satuan</th>
            <th style="width: 18%; text-align: right; padding: 5px 8px;">Harga Satuan (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      ${window.PrintEngine.createPrintFooter(proj, {
        pageStr: `Katalog Master Harga Satuan Lengkap 2026 • Total ${allMaterials.length} Item`,
        statusDoc: "Dokumen Sah Master Sumber Daya"
      })}
    `;

    window.PrintEngine.printViaHiddenIframe(fullHtml, "Katalog_Lengkap_Harga_Satuan");
  }

  function printSelectedAhspData() {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return;

    // 1. Ambil seluruh kode / ID AHSP yang digunakan dalam RAB aktif
    const usedCodes = (window.AhspEngine && window.AhspEngine.getUsedAhspCodes) 
      ? window.AhspEngine.getUsedAhspCodes() 
      : new Set();
    const customMap = (proj && proj.customAhsp) || {};
    const customList = Object.values(customMap).filter(a => a.is_custom);
    const allMaster = (window.MASTER_AHSP || []);
    const fullAhspPool = [...customList, ...allMaster];

    // Filter AHSP yang benar-benar dipakai di item RAB
    const usedAhspList = fullAhspPool.filter(a => usedCodes.has(a.id) || usedCodes.has(a.code));

    // 2. Ambil daftar bahan, upah, alat yang digunakan dari CatalogPricing
    const usedMaterials = (window.CatalogPricing && window.CatalogPricing.getUsedMaterialsList)
      ? window.CatalogPricing.getUsedMaterialsList(proj)
      : [];

    if (usedAhspList.length === 0 && usedMaterials.length === 0) {
      showFormModal({
        title: "Informasi AHSP & Harga Satuan",
        bodyHtml: "<p class='p-3 text-muted'>Belum ada item pekerjaan di dalam RAB yang menggunakan analisa AHSP atau data harga satuan.</p>",
        hideSubmit: true
      });
      return;
    }

    // Bangun dokumen cetak komprehensif
    let fullHtml = `
      <div class="print-header-block" style="margin-bottom: 20px;">
        ${window.PrintEngine.createPrintHeader(proj, "DAFTAR HARGA SATUAN & RINCIAN ANALISIS HARGA SATUAN PEKERJAAN (AHSP) TERPILIH")}
        <div style="font-size: 11px; margin-top: 6px; color: #475569; display: flex; justify-content: space-between; border-bottom: 1.5px solid #0f172a; padding-bottom: 6px;">
          <div>Standar Acuan: <strong>${proj.dataSource || 'SE Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026'}</strong></div>
          <div>Total: <strong>${usedAhspList.length} AHSP Terpilih</strong> &bull; <strong>${usedMaterials.length} Sumber Daya Terpakai</strong></div>
        </div>
      </div>

      <!-- BAGIAN I: DAFTAR HARGA SATUAN DASAR UPAH, MATERIAL & PERALATAN TERPAKAI -->
      <div style="margin-bottom: 25px;">
        <div style="font-weight: 800; font-size: 12pt; color: #0f172a; margin-bottom: 8px; border-bottom: 2px solid #2563eb; padding-bottom: 4px;">
          BAGIAN I: DAFTAR HARGA SATUAN UPAH, BAHAN & PERALATAN (ITEM TERPAKAI)
        </div>
        <table class="table" style="width: 100%; font-size: 8.5pt; margin-bottom: 15px;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #1e293b;">
              <th style="width: 5%; text-align: center;">No</th>
              <th style="width: 15%;">Kategori</th>
              <th style="width: 35%;">Uraian Sumber Daya (Upah / Bahan / Alat)</th>
              <th style="width: 10%; text-align: center;">Satuan</th>
              <th style="width: 15%; text-align: right;">Harga Satuan (Rp)</th>
              <th style="width: 20%;">Digunakan Pada AHSP</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (usedMaterials.length === 0) {
      fullHtml += `<tr><td colspan="6" class="text-center text-muted p-2">Tidak ada data harga satuan terpakai.</td></tr>`;
    } else {
      usedMaterials.forEach((m, idx) => {
        const catBadge = m.type === 'upah' ? 'badge-primary' : (m.type === 'alat' ? 'badge-warning' : 'badge-light');
        const usedInText = (m.usedInAhsp && m.usedInAhsp.length > 0) ? m.usedInAhsp.join(', ') : '-';
        fullHtml += `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td><span class="badge ${catBadge}" style="font-size: 7.5pt;">${m.category || m.type}</span></td>
            <td><strong>${m.name}</strong> ${m.code ? `<span style="font-size: 7.5pt; color: #64748b;">(${m.code})</span>` : ''}</td>
            <td style="text-align: center;">${m.unit}</td>
            <td style="text-align: right; font-weight: 700;">${window.CurrencyUtil.formatRupiah(m.price)}</td>
            <td style="font-size: 7.5pt; color: #475569;">${usedInText}</td>
          </tr>
        `;
      });
    }

    fullHtml += `
          </tbody>
        </table>
      </div>

      <!-- PAGE BREAK SEBELUM RINCIAN AHSP -->
      <div style="page-break-before: always; margin-top: 20px;"></div>

      <!-- BAGIAN II: RINCIAN ANALISIS HARGA SATUAN PEKERJAAN (AHSP) TERPILIH -->
      <div>
        <div style="font-weight: 800; font-size: 12pt; color: #0f172a; margin-bottom: 8px; border-bottom: 2px solid #2563eb; padding-bottom: 4px;">
          BAGIAN II: RINCIAN ANALISIS HARGA SATUAN PEKERJAAN (AHSP) YANG DIGUNAKAN
        </div>
        <div style="font-size: 9pt; color: #64748b; margin-bottom: 15px;">
          Rincian koefisien indeks, upah tenaga kerja, pemakaian bahan bangunan, dan sewa operasional alat per satuan pekerjaan sesuai RAB.
        </div>
    `;

    if (usedAhspList.length === 0) {
      fullHtml += `<p class="text-muted p-2">Tidak ada item pekerjaan RAB yang terhubung dengan AHSP.</p>`;
    } else {
      usedAhspList.forEach((item, aIdx) => {
        let compRows = "";
        let subtotalTenaga = 0;
        let subtotalBahan = 0;
        let subtotalAlat = 0;

        (item.components || []).forEach((c, cIdx) => {
          const cTotal = Number(c.total) || (Number(c.koef || 0) * Number(c.price || 0));
          const sec = (c.section || '').toUpperCase();
          if (sec.includes('TENAGA') || sec.includes('UPAH') || c.type === 'upah') {
            subtotalTenaga += cTotal;
          } else if (sec.includes('ALAT') || c.type === 'alat') {
            subtotalAlat += cTotal;
          } else {
            subtotalBahan += cTotal;
          }

          compRows += `
            <tr>
              <td style="text-align: center;">${cIdx + 1}</td>
              <td>${c.name}</td>
              <td style="text-align: center;">${c.code || '-'}</td>
              <td style="text-align: center;">${c.unit}</td>
              <td style="text-align: right;">${c.koef}</td>
              <td style="text-align: right; white-space: nowrap;">${window.CurrencyUtil.formatRupiah(c.price, false, true)}</td>
              <td style="text-align: right; font-weight: 700; white-space: nowrap;">${window.CurrencyUtil.formatRupiah(cTotal, false, true)}</td>
            </tr>
          `;
        });

        const totalBiayaLangsung = subtotalTenaga + subtotalBahan + subtotalAlat;
        const overheadPercent = Number(item.overhead_percent !== undefined ? item.overhead_percent : 0);
        const overheadValue = Math.round(totalBiayaLangsung * (overheadPercent / 100));
        const calculatedHsp = Number(item.hsp) || (totalBiayaLangsung + overheadValue);

        fullHtml += `
          <div class="ahsp-print-card" style="border: none !important; border-radius: 0 !important; padding: 0 0 10px 0 !important; margin-bottom: 16px !important; page-break-inside: avoid; background-color: transparent !important;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px; border-bottom: 1.5px solid #0f172a; padding-bottom: 4px; gap: 14px;">
              <div style="flex: 1; min-width: 0;">
                <span style="font-weight: 800; font-size: 10.5pt; color: #0f172a; word-break: break-word;">${aIdx + 1}. [${item.code}] ${item.name}</span>
                <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">
                  Divisi: <strong>${item.category || '-'}</strong> &bull; Satuan Hasil: <strong>${item.unit}</strong>
                </div>
              </div>
              <div style="text-align: right; flex-shrink: 0; white-space: nowrap; min-width: 220px;">
                <div style="font-size: 8pt; color: #64748b; margin-bottom: 2px; white-space: nowrap;">Harga Satuan Pekerjaan (HSP):</div>
                <div style="font-size: 12pt; font-weight: 800; color: #2563eb; white-space: nowrap; font-variant-numeric: tabular-nums;">
                  ${window.CurrencyUtil.formatRupiah(calculatedHsp, false, true)} <span style="font-size: 9pt; font-weight: 600; color: #475569;">/ ${item.unit}</span>
                </div>
              </div>
            </div>

            <table class="table" style="font-size: 8pt; margin-bottom: 6px; width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="width: 4%; text-align: center;">No</th>
                  <th style="width: 42%;">Uraian Bahan / Tenaga / Alat</th>
                  <th style="width: 10%; text-align: center;">Kode</th>
                  <th style="width: 8%; text-align: center;">Satuan</th>
                  <th style="width: 10%; text-align: right;">Koefisien</th>
                  <th style="width: 13%; text-align: right;">Harga Satuan (Rp)</th>
                  <th style="width: 13%; text-align: right;">Subtotal (Rp)</th>
                </tr>
              </thead>
              <tbody>
                ${compRows || '<tr><td colspan="7" class="text-center text-muted p-2">Tidak ada rincian komponen.</td></tr>'}
              </tbody>
            </table>

            <!-- Rekapitulasi Komponen Analisis -->
            <div style="display: flex; justify-content: flex-end; margin-top: 4px; font-size: 8pt;">
              <table style="width: 380px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 2px 6px; color: #475569;">A. Total Biaya Langsung Tenaga:</td>
                  <td style="padding: 2px 6px; text-align: right; font-weight: 600;">${window.CurrencyUtil.formatRupiah(subtotalTenaga)}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 6px; color: #475569;">B. Total Biaya Langsung Bahan:</td>
                  <td style="padding: 2px 6px; text-align: right; font-weight: 600;">${window.CurrencyUtil.formatRupiah(subtotalBahan)}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 6px; color: #475569;">C. Total Biaya Langsung Peralatan:</td>
                  <td style="padding: 2px 6px; text-align: right; font-weight: 600;">${window.CurrencyUtil.formatRupiah(subtotalAlat)}</td>
                </tr>
                <tr style="border-top: 1px solid #cbd5e1;">
                  <td style="padding: 2px 6px; font-weight: 700;">D. Jumlah Biaya Langsung (A+B+C):</td>
                  <td style="padding: 2px 6px; text-align: right; font-weight: 700;">${window.CurrencyUtil.formatRupiah(totalBiayaLangsung)}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 6px; color: #475569;">E. Overhead & Profit (${overheadPercent}%):</td>
                  <td style="padding: 2px 6px; text-align: right; font-weight: 600;">${window.CurrencyUtil.formatRupiah(overheadValue)}</td>
                </tr>
                <tr style="border-top: 1.5px solid #0f172a; background-color: #f1f5f9;">
                  <td style="padding: 4px 6px; font-weight: 800; color: #0f172a;">F. Total Harga Satuan (HSP):</td>
                  <td style="padding: 4px 6px; text-align: right; font-weight: 800; color: #2563eb;">${window.CurrencyUtil.formatRupiah(calculatedHsp)}</td>
                </tr>
              </table>
            </div>
          </div>
        `;
      });
    }

    fullHtml += `</div>`;
    fullHtml += window.PrintEngine.createPrintFooter(proj, {
      pageStr: `Analisis AHSP Terpilih & Harga Satuan • ${usedAhspList.length} AHSP`,
      statusDoc: "Dokumen Sah AHSP & Bahan Terpilih"
    });

    // Eksekusi via hidden iframe (100% terisolasi dari DOM layar utama)
    window.PrintEngine.printViaHiddenIframe(fullHtml, " ");
  }

  // 13. Cetak PDF Informasi & Setting Proyek (Executive A4 Profile Sheet)
  function printProjectInfo() {
    showLoading("Menyiapkan Dokumen Cetak A4...", "Menyusun lembar eksekutif informasi & setting proyek...");

    setTimeout(() => {
      try {
        const proj = window.ProjectManager.getActiveProject() || {};
        const calcRecalc = window.RabCalculator 
          ? window.RabCalculator.calculateProjectRab(proj) 
          : { totalDirectCost: 0, overheadAmount: 0, realCost: 0, ppnAmount: 0, grandTotal: 0, terbilangStr: '' };

        const rawSig = proj.signatories || {};
        const sig = {
          ownerName: (rawSig.ownerName && !rawSig.ownerName.includes('...')) ? rawSig.ownerName : (proj.owner || "Ir. Budi Santoso, M.T."),
          ownerTitle: rawSig.ownerTitle || "Kuasa Pengguna Anggaran / Pemilik",
          ownerNip: (rawSig.ownerNip && !rawSig.ownerNip.includes('...')) ? rawSig.ownerNip : "19780512 200312 1 002",
          contractorName: (rawSig.contractorName && !rawSig.contractorName.includes('...')) ? rawSig.contractorName : "H. Ahmad Fauzi, S.T.",
          contractorTitle: rawSig.contractorTitle || "Direktur Utama",
          contractorCompany: (rawSig.contractorCompany && !rawSig.contractorCompany.includes('...')) ? rawSig.contractorCompany : (proj.contractor || "PT. Karya Mandiri Perkasa"),
          consultantName: (rawSig.consultantName && !rawSig.consultantName.includes('...')) ? rawSig.consultantName : "Ir. Bambang Hartono, S.T., M.T.",
          consultantTitle: rawSig.consultantTitle || "Team Leader / Pengawas",
          consultantCompany: (rawSig.consultantCompany && !rawSig.consultantCompany.includes('...')) ? rawSig.consultantCompany : (proj.consultant || "CV. Architecindo Consultant"),
          qcInspectorName: (rawSig.qcInspectorName && !rawSig.qcInspectorName.includes('...')) ? rawSig.qcInspectorName : "Ir. M. Ridwan",
          qcInspectorRole: rawSig.qcInspectorRole || "Konsultan Pengawas / QC",
          fieldMandorName: (rawSig.fieldMandorName && !rawSig.fieldMandorName.includes('...')) ? rawSig.fieldMandorName : "Sutarji / Warsito",
          fieldMandorRole: rawSig.fieldMandorRole || "Mandor Lapangan / Pelaksana",
          siteManagerName: (rawSig.siteManagerName && !rawSig.siteManagerName.includes('...')) ? rawSig.siteManagerName : "Ir. Hendra Prasetya",
          siteManagerRole: rawSig.siteManagerRole || "Site Manager Kontraktor",
          docCity: rawSig.docCity || proj.location || "Indonesia",
          docDate: rawSig.docDate || proj.startDate || "2026-04-01"
        };

        const rawBank = proj.bankInfo || {};
        const bank = {
          bankName: rawBank.bankName || "Bank Mandiri",
          accountNumber: rawBank.accountNumber || "131-00-8899221-5",
          accountName: rawBank.accountName || sig.contractorCompany || proj.contractor || "PT. Karya Mandiri Perkasa"
        };

        const dStart = new Date(proj.startDate || "2026-04-01");
        const dFinish = new Date(proj.finishDate || "2026-09-30");
        const diffDays = Math.ceil(Math.abs(dFinish - dStart) / (1000 * 60 * 60 * 24)) || proj.durationDays || 180;
        const diffWeeks = Math.ceil(diffDays / 7);
        const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        const sheetHtml = `
          <div class="printable-bap-doc a4-portrait" style="padding: 10mm 12mm 8mm 12mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; min-height: 255mm;">
            <div>
              <!-- KOP HEADER RESMI -->
              <div style="border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                  <div style="font-size: 13pt; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">${sig.contractorCompany}</div>
                  <div style="font-size: 8pt; color: #475569;">Kontraktor Perencanaan, Estimasi Biaya &amp; Pelaksanaan Konstruksi Terpadu</div>
                </div>
                <div style="text-align: right; font-size: 8pt; color: #475569;">
                  <div><strong>No. Dokumen:</strong> ${proj.docNumber || 'RAB/SETTING/2026/01'}</div>
                  <div><strong>Tanggal Cetak:</strong> ${printDate}</div>
                </div>
              </div>

              <div style="text-align: center; margin-bottom: 14px;">
                <h2 style="font-size: 13pt; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.4px;">
                  LEMBAR INFORMASI, SETTING &amp; PARAMETER PROYEK
                </h2>
                <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">
                  Dokumen Parameter Legalitas Finansial, Rekening Bank, Jadwal &amp; Susunan Pejabat Penandatangan
                </div>
              </div>

              <!-- BAGIAN 1: IDENTITAS UMUM PROYEK -->
              <div style="font-size: 8.5pt; font-weight: 800; color: #0f172a; margin-bottom: 4px; text-transform: uppercase; border-left: 3px solid #0284c7; padding-left: 6px;">
                1. Data Identitas Umum Proyek
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 8pt; margin-bottom: 10px; border: 1px solid #cbd5e1;">
                <tr style="background-color: #f8fafc;">
                  <td style="width: 28%; padding: 4px 8px; font-weight: 700; border: 1px solid #cbd5e1; color: #334155;">Nama Pekerjaan Proyek</td>
                  <td style="width: 72%; padding: 4px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #0f172a;">${proj.name || 'Proyek Konstruksi'}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 8px; font-weight: 700; border: 1px solid #cbd5e1; color: #334155;">Lokasi Pelaksanaan</td>
                  <td style="padding: 4px 8px; border: 1px solid #cbd5e1;">${proj.location || 'Indonesia'}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 4px 8px; font-weight: 700; border: 1px solid #cbd5e1; color: #334155;">Nomor Kontrak / Registrasi</td>
                  <td style="padding: 4px 8px; border: 1px solid #cbd5e1; font-family: var(--font-mono);">${proj.docNumber || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 8px; font-weight: 700; border: 1px solid #cbd5e1; color: #334155;">Sumber Data Acuan AHSP</td>
                  <td style="padding: 4px 8px; border: 1px solid #cbd5e1;">${proj.dataSource || 'SE Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026'}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 4px 8px; font-weight: 700; border: 1px solid #cbd5e1; color: #334155;">Periode Pelaksanaan &amp; Durasi</td>
                  <td style="padding: 4px 8px; border: 1px solid #cbd5e1;">
                    ${proj.startDate || '2026-04-01'} s.d. ${proj.finishDate || '2026-09-30'} 
                    <strong>(${diffDays} Hari Kalender / ${diffWeeks} Minggu Kerja)</strong>
                  </td>
                </tr>
              </table>

              <!-- BAGIAN 2: PARAMETER FINANSIAL & KALKULASI RESMI -->
              <div style="font-size: 8.5pt; font-weight: 800; color: #0f172a; margin-bottom: 4px; text-transform: uppercase; border-left: 3px solid #16a34a; padding-left: 6px;">
                2. Ringkasan Parameter Finansial &amp; Anggaran Biaya (RAB)
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 8pt; margin-bottom: 10px; border: 1px solid #cbd5e1;">
                <thead>
                  <tr style="background-color: #f1f5f9; color: #0f172a; font-weight: 700;">
                    <th style="width: 8%; padding: 4px 6px; text-align: center; border: 1px solid #cbd5e1;">No</th>
                    <th style="width: 54%; padding: 4px 8px; text-align: left; border: 1px solid #cbd5e1;">Komponen Parameter Biaya</th>
                    <th style="width: 15%; padding: 4px 6px; text-align: center; border: 1px solid #cbd5e1;">Besaran (%)</th>
                    <th style="width: 23%; padding: 4px 8px; text-align: right; border: 1px solid #cbd5e1;">Nilai Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="text-align: center; padding: 4px 6px; border: 1px solid #cbd5e1;">1</td>
                    <td style="padding: 4px 8px; border: 1px solid #cbd5e1;">Total Biaya Langsung (Bahan, Upah &amp; Alat Murni)</td>
                    <td style="text-align: center; padding: 4px 6px; border: 1px solid #cbd5e1;">HPP Pokok</td>
                    <td style="text-align: right; font-weight: 700; padding: 4px 8px; border: 1px solid #cbd5e1; font-family: var(--font-mono);">${window.CurrencyUtil.formatRupiah(calcRecalc.totalDirectCost, false, true)}</td>
                  </tr>
                  <tr style="background-color: #f8fafc;">
                    <td style="text-align: center; padding: 4px 6px; border: 1px solid #cbd5e1;">2</td>
                    <td style="padding: 4px 8px; border: 1px solid #cbd5e1;">Biaya Umum (Overhead) &amp; Keuntungan Kontraktor</td>
                    <td style="text-align: center; font-weight: 700; padding: 4px 6px; border: 1px solid #cbd5e1; color: #166534;">${(proj.overheadRate !== undefined && proj.overheadRate !== null) ? proj.overheadRate : 0}%</td>
                    <td style="text-align: right; font-weight: 700; padding: 4px 8px; border: 1px solid #cbd5e1; font-family: var(--font-mono); color: #166534;">${window.CurrencyUtil.formatRupiah(calcRecalc.overheadAmount, false, true)}</td>
                  </tr>
                  <tr style="font-weight: 700;">
                    <td style="text-align: center; padding: 4px 6px; border: 1px solid #cbd5e1;">3</td>
                    <td style="padding: 4px 8px; border: 1px solid #cbd5e1;">Real Cost Proyek (Biaya Riil Sebelum Pajak)</td>
                    <td style="text-align: center; padding: 4px 6px; border: 1px solid #cbd5e1;">Subtotal</td>
                    <td style="text-align: right; padding: 4px 8px; border: 1px solid #cbd5e1; font-family: var(--font-mono);">${window.CurrencyUtil.formatRupiah(calcRecalc.realCost, false, true)}</td>
                  </tr>
                  <tr style="background-color: #f8fafc;">
                    <td style="text-align: center; padding: 4px 6px; border: 1px solid #cbd5e1;">4</td>
                    <td style="padding: 4px 8px; border: 1px solid #cbd5e1;">Pajak Pertambahan Nilai (PPN) Resmi</td>
                    <td style="text-align: center; font-weight: 700; padding: 4px 6px; border: 1px solid #cbd5e1; color: #854d0e;">${(proj.ppnRate !== undefined && proj.ppnRate !== null) ? proj.ppnRate : 0}%</td>
                    <td style="text-align: right; font-weight: 700; padding: 4px 8px; border: 1px solid #cbd5e1; font-family: var(--font-mono); color: #854d0e;">${window.CurrencyUtil.formatRupiah(calcRecalc.ppnAmount, false, true)}</td>
                  </tr>
                  <tr style="background-color: #f1f5f9; color: #0f172a; font-weight: 800;">
                    <td style="text-align: center; padding: 5px 6px; border: 1px solid #cbd5e1;">5</td>
                    <td style="padding: 5px 8px; border: 1px solid #cbd5e1; font-weight: 800;">GRAND TOTAL RENCANA ANGGARAN BIAYA</td>
                    <td style="text-align: center; padding: 5px 6px; border: 1px solid #cbd5e1; color: #0284c7; font-weight: 800;">FINAL</td>
                    <td style="text-align: right; padding: 5px 8px; border: 1px solid #cbd5e1; color: #0f172a; font-size: 9.5pt; font-family: var(--font-mono); font-weight: 800;">${window.CurrencyUtil.formatRupiah(calcRecalc.grandTotal, false, true)}</td>
                  </tr>
                  <tr>
                    <td colspan="4" style="background-color: #f8fafc; padding: 5px 8px; border: 1px solid #cbd5e1; font-size: 7.5pt; color: #334155;">
                      <strong>Terbilang Resmi:</strong> <em>"${calcRecalc.terbilangStr}"</em>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- BAGIAN 3: REKENING BANK & TIM LAPANGAN -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                <!-- Rekening Bank -->
                <div>
                  <div style="font-size: 8pt; font-weight: 800; color: #0f172a; margin-bottom: 4px; text-transform: uppercase; border-left: 3px solid #2563eb; padding-left: 6px;">
                    3. Rekening Bank Pembayaran (BAP)
                  </div>
                  <table style="width: 100%; border-collapse: collapse; font-size: 7.5pt; border: 1px solid #cbd5e1;">
                    <tr style="background-color: #f8fafc;">
                      <td style="width: 40%; padding: 4px 6px; font-weight: 700; border: 1px solid #cbd5e1;">Nama Bank</td>
                      <td style="width: 60%; padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: 700;">${bank.bankName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 6px; font-weight: 700; border: 1px solid #cbd5e1;">Nomor Rekening</td>
                      <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-family: var(--font-mono); font-weight: 700;">${bank.accountNumber}</td>
                    </tr>
                    <tr style="background-color: #f8fafc;">
                      <td style="padding: 4px 6px; font-weight: 700; border: 1px solid #cbd5e1;">Atas Nama</td>
                      <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${bank.accountName}</td>
                    </tr>
                  </table>
                </div>

                <!-- Tim Pengawasan Lapangan -->
                <div>
                  <div style="font-size: 8pt; font-weight: 800; color: #0f172a; margin-bottom: 4px; text-transform: uppercase; border-left: 3px solid #d97706; padding-left: 6px;">
                    4. Tim Pengawas &amp; Pelaksana Lapangan
                  </div>
                  <table style="width: 100%; border-collapse: collapse; font-size: 7.5pt; border: 1px solid #cbd5e1;">
                    <tr style="background-color: #f8fafc;">
                      <td style="width: 40%; padding: 4px 6px; font-weight: 700; border: 1px solid #cbd5e1;">Pengawas QC</td>
                      <td style="width: 60%; padding: 4px 6px; border: 1px solid #cbd5e1;">${sig.qcInspectorName} <span class="text-muted">(${sig.qcInspectorRole})</span></td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 6px; font-weight: 700; border: 1px solid #cbd5e1;">Mandor Utama</td>
                      <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${sig.fieldMandorName} <span class="text-muted">(${sig.fieldMandorRole})</span></td>
                    </tr>
                    <tr style="background-color: #f8fafc;">
                      <td style="padding: 4px 6px; font-weight: 700; border: 1px solid #cbd5e1;">Site Manager</td>
                      <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${sig.siteManagerName} <span class="text-muted">(${sig.siteManagerRole})</span></td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>

            <!-- BAGIAN 5: LEMBAR PENGESAHAN TIGA PIHAK RESMI (BEBAS TITIK-TITIK & TANPA GARIS BAWAH) -->
            <div style="margin-top: auto; page-break-inside: avoid;">
              <div style="text-align: center; font-size: 8pt; color: #475569; margin-bottom: 8px;">
                Ditetapkan di <strong>${sig.docCity}</strong>, tanggal <strong>${sig.docDate}</strong>
              </div>
              <table class="signature-clean-table" style="width: 100% !important; border-collapse: collapse !important; border: none !important; background: transparent !important; margin-top: 20pt !important; page-break-inside: avoid !important; break-inside: avoid !important;">
                <tr style="border: none !important; background: transparent !important;">
                  <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 8px !important; background: transparent !important;">
                    <div style="font-weight: 800; font-size: 8.5pt; color: #1e293b; margin-bottom: 3px; text-transform: uppercase;">PEMBERI TUGAS / OWNER</div>
                    <div style="font-size: 7.5pt; color: #64748b; min-height: 14px;">Menyetujui &amp; Menetapkan:</div>
                    <div style="height: 40px;"></div>
                    <div style="font-weight: 700; font-size: 8.5pt; color: #0f172a; text-decoration: none !important; border-bottom: none !important;">( ${sig.ownerName} )</div>
                    <div style="font-size: 7.5pt; color: #334155; margin-top: 2px;">${sig.ownerTitle}</div>
                    <div style="font-size: 7pt; color: #64748b;">NIP: ${sig.ownerNip}</div>
                  </td>
                  <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 8px !important; background: transparent !important;">
                    <div style="font-weight: 800; font-size: 8.5pt; color: #1e293b; margin-bottom: 3px; text-transform: uppercase;">KONSULTAN PERENCANA</div>
                    <div style="font-size: 7.5pt; color: #64748b; min-height: 14px;">Direncanakan:</div>
                    <div style="height: 40px;"></div>
                    <div style="font-weight: 700; font-size: 8.5pt; color: #0f172a; text-decoration: none !important; border-bottom: none !important;">( ${sig.consultantName} )</div>
                    <div style="font-size: 7.5pt; color: #334155; margin-top: 2px;">${sig.consultantTitle}</div>
                    <div style="font-size: 7pt; color: #64748b;">${sig.consultantCompany}</div>
                  </td>
                  <td style="width: 33.33% !important; text-align: center !important; vertical-align: top !important; border: none !important; padding: 0 8px !important; background: transparent !important;">
                    <div style="font-weight: 800; font-size: 8.5pt; color: #1e293b; margin-bottom: 3px; text-transform: uppercase;">KONTRAKTOR PELAKSANA</div>
                    <div style="font-size: 7.5pt; color: #64748b; min-height: 14px;">Diajukan:</div>
                    <div style="height: 40px;"></div>
                    <div style="font-weight: 700; font-size: 8.5pt; color: #0f172a; text-decoration: none !important; border-bottom: none !important;">( ${sig.contractorName} )</div>
                    <div style="font-size: 7.5pt; color: #334155; margin-top: 2px;">${sig.contractorTitle}</div>
                    <div style="font-size: 7pt; color: #64748b;">${sig.contractorCompany}</div>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        `;

        window.PrintEngine.printViaHiddenIframe(sheetHtml, "Informasi_dan_Setting_Proyek");
      } catch (err) {
        console.error("Gagal mencetak informasi proyek:", err);
        hideLoading();
        showConfirmModal({
          title: "Gagal Mencetak",
          message: "Terjadi kesalahan saat menyusun dokumen cetak: " + (err.message || err),
          confirmLabel: "Tutup",
          cancelLabel: "",
          isDanger: true
        });
      }
    }, 100);
  }

  // 14. Cetak PDF Dokumen Proposal Lengkap (9 Halaman A4 Standar SE PUPR No. 47/2026)
  function printProposal() {
    showLoading("Menyiapkan Dokumen Proposal A4...", "Mengompilasi 9 halaman dokumen proposal dan menyematkan grafik Kurva S...");

    setTimeout(() => {
      try {
        // 1. Dapatkan SVG Kurva S jika ada elemen aktif di DOM atau render via SCurveDiagram
        let svgContent = "";
        const domEmbed = document.getElementById("proposal-scurve-embed");
        if (domEmbed && domEmbed.querySelector("svg")) {
          svgContent = domEmbed.innerHTML;
        } else if (window.SCurveDiagram) {
          const tempDiv = document.createElement("div");
          tempDiv.id = "temp-scurve-generator";
          tempDiv.style.position = "absolute";
          tempDiv.style.left = "-9999px";
          document.body.appendChild(tempDiv);
          const sched = window.SCurveDiagram.getScheduleData();
          window.SCurveDiagram.renderSvgChart("temp-scurve-generator", sched);
          svgContent = tempDiv.innerHTML;
          tempDiv.remove();
        }

        // 2. Dapatkan HTML proposal lengkap
        let proposalHtml = window.ProposalGen.generateProposalHtml();

        // 3. Sematkan SVG ke dalam proposal HTML jika tersedia
        if (svgContent && proposalHtml.includes('id="proposal-scurve-embed"')) {
          proposalHtml = proposalHtml.replace(
            /(<div id="proposal-scurve-embed"[^>]*>)([\s\S]*?)(<\/div>)/,
            `$1${svgContent}$3`
          );
        }

        // 4. Eksekusi via hidden iframe (100% terisolasi dari DOM layar utama)
        window.PrintEngine.printViaHiddenIframe(proposalHtml, "Proposal_Rencana_Proyek");
      } catch (err) {
        console.error("Gagal mencetak proposal:", err);
        hideLoading();
        showConfirmModal({
          title: "Gagal Mencetak Proposal",
          message: "Terjadi kesalahan saat menyusun proposal cetak: " + (err.message || err),
          confirmLabel: "Tutup",
          cancelLabel: "",
          isDanger: true
        });
      }
    }, 100);
  }


  function handleLogoSizeChange(val) {
    const size = parseInt(val, 10) || 120;
    const labelEl = document.getElementById('logoSizeLabel');
    if (labelEl) labelEl.textContent = size + ' px';
    const hiddenEl = document.getElementById('projLogoSizeHidden');
    if (hiddenEl) hiddenEl.value = size;
    const previewEl = document.getElementById('logoSizePreviewImg');
    if (previewEl) {
      previewEl.style.maxWidth = size + 'px';
      previewEl.style.maxHeight = Math.round(size * 0.65) + 'px';
    }
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (proj) {
      proj.logoSize = size;
      if (window.ProjectManager && window.ProjectManager.saveProjects) {
        window.ProjectManager.saveProjects();
      }
    }
  }

  return {
    handleLogoSizeChange,
    init,
    downloadCurrentPagePdfDirect,
    downloadProposalPdfDirect,
    downloadSingleBapPdfDirect,
    printProjectInfo,
    printProposal,
    handleSyncTasksFromRab,
    confirmClearAllCalendarTasks,
    toggleLaborDetailInRab,
    switchTab,
    showLoading,
    hideLoading,
    printCurrentPage,
    printSelectedAhspData,
    printUsedMaterialsCatalog,
    printAllMaterialsCatalog,
    renderCurrentTabContent,
    renderAhspView,
    renderKatalogView,
    renderInfoProyekView,
    renderProposalView,
    renderProyekView,
    saveProjectInfoForm,
    handleLiveProjectSettingsChange,
    handleProjectDateChange,
    jumpToDivision,
    setCalendarViewMode,
    switchToMonthView,
    handleCalendarDateClick,
    openAddDivisionModal,
    openEditDivisionModal,
    deleteDivision,
    deleteRabItem,
    openAddItemModal,
    openEditRabItemModal,
    syncCalendarFromRab,
    openEditVolumeModal,
    handleVolumeChange,
    handleVolumeNotesChange,
    changeAhspPage,
    changeAhspPageSize,
    changeKatalogPage,
    changeKatalogPageSize,
    deleteInspection,
    printUsedAhsp,
    printAllAhsp,
    handleAhspSearch,
    handleAhspCategory,
    handleAhspBidang,
    toggleOnlyUsedAhsp,
    resetAhsp,
    deleteAhsp,
    openCreateCustomAhspModal,
    handleMaterialSearch,
    handleMaterialCategory,
    setKatalogMode,
    handleRegionChange,
    openCustomIndexModal,
    openEditMaterialPriceModal,
    openAddCustomMaterialModal,
    handleUpdateActualProgress,
    handleSaveWeekProgress,
    regenerateCurvePrompt,
    prevMonthCal,
    nextMonthCal,
    prevCalendarMonth,
    nextCalendarMonth,
    openEditBapModal,
    openAddTerminModal,
    openEditTerminModal,
    deleteTerminScheme,
    resetTerminSchemeToDefault,
    openAddTaskModal,
    openEditTaskModal,
    deleteTask,
    unlockTask,
    openAddInspectionModal,
    openCreateBapModal,
    deleteBap,
    printSingleBap,
    printAllBap,
    handleProjectTypeToggle,
    handleProjectLogoUpload,
    removeProjectLogo,
    openCreateProjectModal,
    duplicateCurrentProject,
    deleteProject,
    switchProject,
    togglePpn,
    handleOverheadChange,
    exportCurrentProject,
    exportSingleProject,
    sanitizeCurrentProject,
    handleImportAhsp,
    handleImportProject,
    handleCompKoefChange,
    createBapFromScheme,
    setKalenderDivisionFilter,
    setKurvaSViewMode,
    openAhspDetailModal,
    showFormModal,
    hideFormModal,
    showConfirmModal,
    hideConfirmModal,
    openAddAhspCompModal,
    closeCompPickerModal,
    setCompPickerCat,
    handleCompPickerSearch,
    toggleCompPickerItem,
    updateCompPickerItemKoef,
    removeCompPickerItem,
    submitCompPicker,
    handleBuilderFieldChange,
    handleBuilderCompKoefChange,
    handleBuilderDeleteComp,
    handleBuilderAddComp,
    submitCustomAhspBuilder,
    cancelCustomAhspBuilder,
    cancelAhspDetailModal,
    saveAndCloseAhspDetailModal,
    closeGenericModal,
    handleCompPriceChange,
    handleDeleteAhspComponent,
    showFirstRunFolderModal,
    closeFirstRunFolderModal,
    handleFirstRunSelectFolder,
    handleFirstRunOpenFile,
    handleFirstRunDismiss,
    updateAutoSyncIndicator,
    handleSyncBadgeClick,
    handleSaveProjectExplorer,
    handleSelectStorageFolder,
    handleOpenProjectExplorer,
    handleRestoreSingleAhsp,
    handleRestoreAllAhsp,
    handleCopyAhspToFolder,
    handleSelectAhspSource,
    showAhspDetail: function(ahspId) {
      const ahsp = window.AhspEngine.getAhspById(ahspId);
      if (!ahsp) return;
      const modal = document.getElementById("genericModal");
      const title = document.getElementById("genericModalTitle");
      const body = document.getElementById("genericModalBody");
      title.textContent = `Detail Analisis: ${ahsp.code} - ${ahsp.name}`;

      let compRows = "";
      (ahsp.components || []).forEach((c, idx) => {
        compRows += `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td><span class="badge badge-light">${c.section}</span></td>
            <td><strong>${c.name}</strong></td>
            <td class="text-center">${c.unit}</td>
            <td class="text-right font-bold">${c.koef}</td>
            <td class="text-right">${window.CurrencyUtil.formatRupiah(c.price)}</td>
            <td class="text-right font-bold text-primary">${window.CurrencyUtil.formatRupiah(c.total)}</td>
          </tr>
        `;
      });

      body.innerHTML = `
        <div class="mb-3">
          <div style="display: flex; gap: 10px; margin-bottom: 8px;">
            <span class="badge badge-primary">Satuan Hasil: ${ahsp.unit}</span>
            <span class="badge badge-warning">Overhead & Profit: ${ahsp.overhead_percent || 0}%</span>
            <span class="badge badge-success">Harga Satuan (HSP): ${window.CurrencyUtil.formatRupiah(ahsp.hsp)}</span>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 5%">No</th>
                <th style="width: 15%">Kategori</th>
                <th style="width: 35%">Uraian Bahan / Upah / Alat</th>
                <th style="width: 10%">Satuan</th>
                <th style="width: 10%">Koefisien</th>
                <th style="width: 12%">Harga Satuan</th>
                <th style="width: 13%">Jumlah Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${compRows || '<tr><td colspan="7" class="text-center text-muted p-3">Tidak ada rincian komponen.</td></tr>'}
            </tbody>
          </table>
        </div>
      `;

      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("open"), 10);
    }
  };
})();

// Bootstrap saat DOM siap atau jika DOM sudah siap
if (typeof document !== 'undefined') {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      if (window.App && typeof window.App.init === 'function') window.App.init();
    });
  } else {
    if (window.App && typeof window.App.init === 'function') window.App.init();
  }
}
