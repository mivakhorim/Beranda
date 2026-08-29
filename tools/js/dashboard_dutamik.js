
// [DUTABONGKAR MODULAR DATA ADAPTER]
window.__DUTABONGKAR_DATA__ = {
  "initial_app_data": {
    "system": {
      "appName": "Dutamik Pro Exploder",
      "version": "1.0.0",
      "environment": "production"
    },
    "modules": [
      {
        "id": "MOD-001",
        "name": "dashboard_dutamik.html",
        "type": "HTML Skeleton",
        "path": "/",
        "status": "active"
      },
      {
        "id": "MOD-002",
        "name": "dashboard_dutamik.css",
        "type": "CSS Stylesheet",
        "path": "/css/",
        "status": "active"
      },
      {
        "id": "MOD-003",
        "name": "dashboard_dutamik.js",
        "type": "JavaScript Engine",
        "path": "/js/",
        "status": "active"
      },
      {
        "id": "MOD-004",
        "name": "dashboard_dutamik.json",
        "type": "JSON Dataset",
        "path": "/data/",
        "status": "active"
      }
    ]
  }
};
if (!window.__DATA_LOADER_ATTACHED__) {
  window.__DATA_LOADER_ATTACHED__ = true;
  const origGetElementById = document.getElementById.bind(document);
  document.getElementById = function(id) {
    const elem = origGetElementById(id);
    if (elem) return elem;
    if (window.__DUTABONGKAR_DATA__ && window.__DUTABONGKAR_DATA__[id]) {
      return {
        id: id,
        textContent: JSON.stringify(window.__DUTABONGKAR_DATA__[id]),
        innerHTML: JSON.stringify(window.__DUTABONGKAR_DATA__[id]),
        getAttribute: () => 'application/json'
      };
    }
    return null;
  };
}
// ===== BLOK JS #1 (Diekstrak dari dashboard_dutamik.html) =====
// State Global Aplikasi
        let currentModules = [];

        // Inisialisasi Saat Dokumen Selesai Dimuat
        document.addEventListener('DOMContentLoaded', () => {
            loadInitialData();
            renderTable();
        });

        // 1. Memuat Data dari Script JSON Internal / Data Adapter
        function loadInitialData() {
            const dataTag = document.getElementById('initial_app_data');
            if (dataTag) {
                try {
                    const parsed = JSON.parse(dataTag.textContent);
                    currentModules = parsed.modules || [];
                } catch (e) {
                    console.error("Gagal parsing JSON internal:", e);
                }
            }
        }

        // 2. Render Tabel Data secara Dinamis
        function renderTable(dataToRender = currentModules) {
            const tbody = document.getElementById('tableRecordsBody');
            const badge = document.getElementById('recordCountBadge');
            if (!tbody) return;

            tbody.innerHTML = '';
            if (badge) badge.textContent = `Menampilkan ${dataToRender.length} berkas terdaftar`;

            dataToRender.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${item.id}</strong></td>
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td><code>${item.path}</code></td>
                    <td><span class="status-badge active"><i class="fa-solid fa-circle"></i> Connected</span></td>
                    <td>
                        <button class="btn-action" style="padding: 4px 8px; font-size: 11px;" onclick="inspectModule('${item.id}')">
                            <i class="fa-solid fa-eye"></i> Audit
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // 3. Filter Pencarian
        function filterRecords() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            const filtered = currentModules.filter(m => 
                m.name.toLowerCase().includes(query) || 
                m.type.toLowerCase().includes(query) ||
                m.id.toLowerCase().includes(query)
            );
            renderTable(filtered);
        }

        // 4. Navigasi Antar Seksi
        function navigateSection(sectionName) {
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            const target = event.currentTarget.parentElement;
            if (target) target.classList.add('active');

            const title = document.getElementById('pageTitle');
            const subtitle = document.getElementById('pageSubtitle');
            if (sectionName === 'dashboard') {
                title.textContent = "Executive Operations Dashboard";
                subtitle.textContent = "Monitoring arsitektur modular, status file, dan kesehatan sistem secara real-time.";
            } else if (sectionName === 'file-manager') {
                title.textContent = "File Exploder & Separation Engine";
                subtitle.textContent = "Manajemen pemisahan file HTML ke /css, /js, dan /data.";
            } else if (sectionName === 'verifier') {
                title.textContent = "Automated Verifier Suite";
                subtitle.textContent = "Audit kesehatan konektivitas 6-titik pasca pembongkaran.";
            } else {
                title.textContent = "Sistem & Konfigurasi";
                subtitle.textContent = "Pengaturan parameter ekstraksi dan format dokumen.";
            }
            showNotification(`Beralih ke tampilan: ${sectionName}`);
        }

        // 5. Penanganan Modal
        function openAddModal() {
            const modal = document.getElementById('addDataModal');
            if (modal) modal.classList.add('show');
        }

        function closeAddModal() {
            const modal = document.getElementById('addDataModal');
            if (modal) modal.classList.remove('show');
        }

        function handleFormSubmit(e) {
            e.preventDefault();
            const name = document.getElementById('moduleName').value;
            const type = document.getElementById('moduleType').value;
            const newId = `MOD-00${currentModules.length + 1}`;
            
            let path = "/";
            if (type.includes("CSS")) path = "/css/";
            else if (type.includes("JavaScript")) path = "/js/";
            else if (type.includes("JSON")) path = "/data/";

            currentModules.push({
                id: newId,
                name: name,
                type: type,
                path: path,
                status: "active"
            });

            renderTable();
            closeAddModal();
            document.getElementById('addModuleForm').reset();
            showNotification(`Modul ${name} berhasil ditambahkan!`);
        }

        function inspectModule(id) {
            const mod = currentModules.find(m => m.id === id);
            if (mod) {
                alert(`Detail Modul:\nID: ${mod.id}\nNama: ${mod.name}\nTipe: ${mod.type}\nLokasi: ${mod.path}\nStatus: Terkoneksi 100%`);
            }
        }

        // 6. Toast Notification
        function showNotification(msg) {
            const toast = document.getElementById('toast-notification');
            if (!toast) return;
            toast.textContent = msg;
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        }
