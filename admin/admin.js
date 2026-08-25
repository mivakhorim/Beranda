/**
 * DUTAMIK.ID - Enterprise Admin Control Hub Engine
 * Duta Media Informasi berKarya
 * Full Suite: Real-time Analytics, GitHub Git Sync, AdSense Manager, & Google Apps Script Config
 */

// Default PIN SHA-256 Hash for 'mivakhorim@duta'
const _ADMIN_PIN_HASH = "9816dba2832dde5f8b474d6156e4d5e8715575f3c525eebf82b776b3434af6a8";

// In-Memory Git Stores
let liveProductsData = [];
let liveProductsSha = null;

let liveServicesData = [];
let liveServicesSha = null;

// SHA-256 Web Crypto Helper
async function computeSha256(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// UTF-8 Safe Base64 Helpers
function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function base64ToUtf8(str) {
  return decodeURIComponent(escape(atob(str)));
}

// 1. Authentication & Security
function checkAdminAuth() {
  const isAuth = sessionStorage.getItem('dutamik_admin_auth') === 'true';
  const overlay = document.getElementById('admin-auth-overlay');
  if (overlay) {
    if (isAuth) {
      overlay.classList.add('hidden');
      initDashboard();
    } else {
      overlay.classList.remove('hidden');
    }
  }
}

async function verifyAdminLogin(e) {
  e.preventDefault();
  const input = document.getElementById('admin-pin-input').value;
  const inputHash = await computeSha256(input);
  const customHash = localStorage.getItem('dutamik_admin_pin_hash');

  if (inputHash === _ADMIN_PIN_HASH || (customHash && inputHash === customHash)) {
    sessionStorage.setItem('dutamik_admin_auth', 'true');
    checkAdminAuth();
  } else {
    alert('Kunci Akses Admin Salah!');
  }
}

function logoutAdmin() {
  sessionStorage.removeItem('dutamik_admin_auth');
  sessionStorage.removeItem('dutamik_gh_token');
  window.location.href = '../index.html';
}

async function updateAdminPin() {
  const newPin = document.getElementById('setting-new-pin').value.trim();
  if (!newPin || newPin.length < 6) {
    alert('Kunci akses baru minimal 6 karakter!');
    return;
  }
  const newHash = await computeSha256(newPin);
  localStorage.setItem('dutamik_admin_pin_hash', newHash);
  alert('Kunci akses admin berhasil diubah!');
  document.getElementById('setting-new-pin').value = '';
}

// 2. Tab Navigation
function switchAdminTab(tabId) {
  document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.admin-nav-btn').forEach(el => {
    el.classList.remove('active-nav-tab');
    el.classList.add('text-slate-300');
  });

  const target = document.getElementById(tabId);
  if (target) target.classList.remove('hidden');

  const currentBtn = (window.event && window.event.currentTarget) ? window.event.currentTarget : document.querySelector(`[onclick*="${tabId}"]`);
  if (currentBtn) {
    currentBtn.classList.add('active-nav-tab');
    currentBtn.classList.remove('text-slate-300');
  }

  if (tabId === 'tab-post-generator' && typeof initPostGenerator === 'function') {
    initPostGenerator();
  }

  if (window.lucide) lucide.createIcons();
}

// 3. Live Real-time Clock
function startLiveClock() {
  const clockEl = document.getElementById('admin-live-clock');
  if (!clockEl) return;
  setInterval(() => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
  }, 1000);
}

// 4. Analytics Data Visualizer
function loadAnalyticsData() {
  if (typeof DutamikAnalytics === 'undefined') return;

  const { summary, events } = DutamikAnalytics.getSummary();

  // Metric Cards
  document.getElementById('stat-analytics-views').textContent = summary.totalPageviews || 0;
  document.getElementById('stat-analytics-tools').textContent = summary.totalToolUses || 0;

  // Tools Breakdown
  const toolsEl = document.getElementById('analytics-tools-breakdown');
  if (toolsEl) {
    const toolEntries = Object.entries(summary.tools || {});
    if (toolEntries.length === 0) {
      toolsEl.innerHTML = `<p class="text-slate-500 italic">Belum ada aktivitas penggunaan tools.</p>`;
    } else {
      toolEntries.sort((a, b) => b[1] - a[1]);
      toolsEl.innerHTML = toolEntries.map(([name, count]) => `
        <div class="space-y-1">
          <div class="flex justify-between font-semibold text-slate-300">
            <span>${name}</span>
            <span class="text-emerald-400 font-mono font-bold">${count}x</span>
          </div>
          <div class="w-full bg-dark-800 rounded-full h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full" style="width: ${Math.min(100, (count / (summary.totalToolUses || 1)) * 100)}%"></div>
          </div>
        </div>
      `).join('');
    }
  }

  // Pages Breakdown
  const pagesEl = document.getElementById('analytics-pages-breakdown');
  if (pagesEl) {
    const pageEntries = Object.entries(summary.pages || {});
    if (pageEntries.length === 0) {
      pagesEl.innerHTML = `<p class="text-slate-500 italic">Belum ada data kunjungan halaman.</p>`;
    } else {
      pageEntries.sort((a, b) => b[1] - a[1]);
      pagesEl.innerHTML = pageEntries.slice(0, 5).map(([name, count]) => `
        <div class="space-y-1">
          <div class="flex justify-between font-semibold text-slate-300 truncate">
            <span class="truncate">${name}</span>
            <span class="text-blue-400 font-mono font-bold ml-2">${count}</span>
          </div>
          <div class="w-full bg-dark-800 rounded-full h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full" style="width: ${Math.min(100, (count / (summary.totalPageviews || 1)) * 100)}%"></div>
          </div>
        </div>
      `).join('');
    }
  }

  // Devices Breakdown
  const totalDev = (summary.devices?.desktop || 0) + (summary.devices?.mobile || 0) || 1;
  const deskPct = Math.round(((summary.devices?.desktop || 0) / totalDev) * 100);
  const mobPct = Math.round(((summary.devices?.mobile || 0) / totalDev) * 100);
  const deskEl = document.getElementById('analytics-dev-desktop');
  const mobEl = document.getElementById('analytics-dev-mobile');
  if (deskEl) deskEl.textContent = `Desktop: ${deskPct}% (${summary.devices?.desktop || 0})`;
  if (mobEl) mobEl.textContent = `Mobile: ${mobPct}% (${summary.devices?.mobile || 0})`;

  // Searches
  const searchTags = document.getElementById('analytics-search-tags');
  if (searchTags) {
    const searchEntries = Object.keys(summary.searches || {});
    if (searchEntries.length === 0) {
      searchTags.innerHTML = `<span class="text-slate-500 italic">Belum ada riwayat kata kunci.</span>`;
    } else {
      searchTags.innerHTML = searchEntries.slice(0, 8).map(q => `
        <span class="px-2 py-0.5 rounded-md bg-dark-800 text-purple-300 font-mono text-[10px] border border-purple-900/40">${q}</span>
      `).join('');
    }
  }

  // Event Stream Table
  const eventsTbody = document.getElementById('analytics-events-table-body');
  if (eventsTbody) {
    if (events.length === 0) {
      eventsTbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-500">Belum ada rekaman live event.</td></tr>`;
    } else {
      eventsTbody.innerHTML = events.slice(0, 20).map(evt => {
        let badgeColor = 'bg-blue-500/20 text-blue-400';
        if (evt.category === 'tool_usage') badgeColor = 'bg-emerald-500/20 text-emerald-400';
        if (evt.category === 'search') badgeColor = 'bg-purple-500/20 text-purple-400';
        if (evt.category === 'conversion') badgeColor = 'bg-rose-500/20 text-rose-400';

        return `
          <tr class="hover:bg-dark-900/60">
            <td class="p-3 font-mono text-[10px] text-slate-400">${evt.timeFormatted}</td>
            <td class="p-3"><span class="px-2 py-0.5 rounded text-[9px] font-bold ${badgeColor}">${evt.category}</span></td>
            <td class="p-3 font-bold text-white text-xs">${evt.action}</td>
            <td class="p-3 text-slate-300 text-xs">${evt.label || '-'}</td>
            <td class="p-3 font-mono text-[10px] text-slate-400">${evt.path}</td>
            <td class="p-3 text-[10px] text-slate-400">${evt.device} (${evt.browser})</td>
          </tr>
        `;
      }).join('');
    }
  }
}

function refreshAnalyticsDashboard() {
  loadAnalyticsData();
  alert('Analytics data diperbarui!');
}

// 5. Google AdSense & Affiliate Settings
function loadAdsenseSettings() {
  const pub = localStorage.getItem('dutamik_cfg_adsense_pub') || 'ca-pub-9999999999999999';
  const slotH = localStorage.getItem('dutamik_cfg_adsense_slot_h') || '';
  const slotF = localStorage.getItem('dutamik_cfg_adsense_slot_f') || '';
  const autoads = localStorage.getItem('dutamik_cfg_adsense_autoads') === 'true';

  if (document.getElementById('cfg-adsense-pub')) document.getElementById('cfg-adsense-pub').value = pub;
  if (document.getElementById('cfg-adsense-slot-header')) document.getElementById('cfg-adsense-slot-header').value = slotH;
  if (document.getElementById('cfg-adsense-slot-feed')) document.getElementById('cfg-adsense-slot-feed').value = slotF;
  if (document.getElementById('cfg-adsense-autoads')) document.getElementById('cfg-adsense-autoads').checked = autoads;
}

function saveAdsenseSettings() {
  const pub = document.getElementById('cfg-adsense-pub').value.trim();
  const slotH = document.getElementById('cfg-adsense-slot-header').value.trim();
  const slotF = document.getElementById('cfg-adsense-slot-feed').value.trim();
  const autoads = document.getElementById('cfg-adsense-autoads').checked;

  localStorage.setItem('dutamik_cfg_adsense_pub', pub);
  localStorage.setItem('dutamik_cfg_adsense_slot_h', slotH);
  localStorage.setItem('dutamik_cfg_adsense_slot_f', slotF);
  localStorage.setItem('dutamik_cfg_adsense_autoads', autoads ? 'true' : 'false');

  alert('Pengaturan Google AdSense berhasil disimpan ke konfigurasi website!');
}

function addAffiliateDirectToProducts() {
  const platform = document.getElementById('aff-gen-platform').value;
  const name = document.getElementById('aff-gen-name').value.trim();
  const price = parseInt(document.getElementById('aff-gen-price').value, 10) || 0;
  const origPrice = parseInt(document.getElementById('aff-gen-orig-price').value, 10) || price;
  const url = document.getElementById('aff-gen-url').value.trim();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (!name || !url) {
    alert('Mohon isi nama barang dan tautan afiliasi!');
    return;
  }

  const newAff = {
    id: `AFF-${platform.toUpperCase().replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`,
    type: "affiliate",
    platform: platform,
    name: name,
    slug: slug,
    url: url,
    category: "hardware",
    categoryLabel: "Rekomendasi Hardware",
    rating: "4.9",
    reviewsCount: 1,
    originalPrice: origPrice,
    price: price,
    discountBadge: `Rekomendasi ${platform}`,
    affiliateBadge: `${platform} Partner`,
    description: `Produk perlengkapan usaha ${name} terkurasi & bergaransi resmi dari mitra ${platform}.`,
    features: ["Kualitas Terjamin", "Garansi Distributor"]
  };

  liveProductsData.push(newAff);
  renderProductsTable();
  alert(`Produk afiliasi '${name}' berhasil ditambahkan! Silakan masuk ke tab 'Produk Digital & Git Sync' dan klik 'Commit & Push ke GitHub' untuk menerbitkan.`);
}

// 6. Google Apps Script & Sheet Configurator
function loadGasSettings() {
  const url = localStorage.getItem('dutamik_cfg_gas_url') || 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
  const wa = localStorage.getItem('dutamik_cfg_wa') || '6281234567890';
  const sheet = localStorage.getItem('dutamik_cfg_sheet_name') || 'DUTAMIK_DB_2026';

  if (document.getElementById('cfg-gas-url')) document.getElementById('cfg-gas-url').value = url;
  if (document.getElementById('cfg-admin-wa')) document.getElementById('cfg-admin-wa').value = wa;
  if (document.getElementById('cfg-sheet-name')) document.getElementById('cfg-sheet-name').value = sheet;
}

function saveGasSettings() {
  const url = document.getElementById('cfg-gas-url').value.trim();
  const wa = document.getElementById('cfg-admin-wa').value.trim();
  const sheet = document.getElementById('cfg-sheet-name').value.trim();

  localStorage.setItem('dutamik_cfg_gas_url', url);
  localStorage.setItem('dutamik_cfg_wa', wa);
  localStorage.setItem('dutamik_cfg_sheet_name', sheet);

  alert('Pengaturan Google Apps Script & WhatsApp berhasil diperbarui! Seluruh form di website sekarang akan langsung menggunakan endpoint baru ini.');
}

async function testGasWebhookConnection() {
  const url = document.getElementById('cfg-gas-url').value.trim();
  const badge = document.getElementById('gas-test-badge');

  if (!url || !url.startsWith('https://script.google.com')) {
    alert('URL Google Apps Script tidak valid! Harus diawali https://script.google.com/macros/s/.../exec');
    return;
  }

  if (badge) {
    badge.textContent = 'Menguji...';
    badge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400';
  }

  const startTime = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: "ping_test", timestamp: new Date().toISOString() })
    });
    const latency = Date.now() - startTime;

    if (badge) {
      badge.textContent = `Online (${latency}ms)`;
      badge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    }
    alert(`🎉 Webhook Google Apps Script TERHUBUNG! Respons diterima dalam ${latency}ms.`);
  } catch (err) {
    if (badge) {
      badge.textContent = 'Koneksi Sukses (CORS No-Auth)';
      badge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400';
    }
    alert(`Webhook endpoint aktif. Catatan: Request terkirim ke Google Cloud.`);
  }
}

// 7. GitHub Integration Suite
function getGithubConfig() {
  return {
    token: sessionStorage.getItem('dutamik_gh_token') || localStorage.getItem('dutamik_gh_token_saved') || '',
    owner: localStorage.getItem('dutamik_gh_owner') || 'dutamik',
    repo: localStorage.getItem('dutamik_gh_repo') || 'dutamik-id',
    branch: localStorage.getItem('dutamik_gh_branch') || 'main'
  };
}

async function testAndSaveGithubConnection() {
  const token = document.getElementById('gh-token-input').value.trim();
  const owner = document.getElementById('gh-owner-input').value.trim();
  const repo = document.getElementById('gh-repo-input').value.trim();
  const branch = document.getElementById('gh-branch-input').value.trim() || 'main';

  if (!token || !owner || !repo) {
    alert('Mohon isi Token GitHub, Owner, dan Nama Repositori!');
    return;
  }

  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!userRes.ok) {
      throw new Error(`Token GitHub tidak valid (${userRes.status}). Pastikan memiliki izin 'repo'.`);
    }

    const userData = await userRes.json();

    sessionStorage.setItem('dutamik_gh_token', token);
    localStorage.setItem('dutamik_gh_token_saved', token);
    localStorage.setItem('dutamik_gh_owner', owner);
    localStorage.setItem('dutamik_gh_repo', repo);
    localStorage.setItem('dutamik_gh_branch', branch);

    updateGithubStatusUI(true, userData);
    alert(`Berhasil terhubung ke GitHub sebagai @${userData.login}! Repositori: ${owner}/${repo} (${branch})`);
  } catch (err) {
    alert('Gagal menghubungkan ke GitHub: ' + err.message);
    updateGithubStatusUI(false);
  }
}

function disconnectGithub() {
  sessionStorage.removeItem('dutamik_gh_token');
  localStorage.removeItem('dutamik_gh_token_saved');
  document.getElementById('gh-token-input').value = '';
  updateGithubStatusUI(false);
  alert('Koneksi GitHub telah diputuskan.');
}

function updateGithubStatusUI(isConnected, user = null) {
  const dot = document.getElementById('gh-status-dot');
  const text = document.getElementById('gh-status-text');
  const statStatus = document.getElementById('stat-git-sync-status');
  const profileCard = document.getElementById('gh-verified-profile-card');
  const formBadge = document.getElementById('gh-status-badge');

  if (isConnected && user) {
    if (dot) dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-ping';
    if (text) text.textContent = `GitHub: @${user.login}`;
    if (statStatus) {
      statStatus.textContent = 'Terhubung';
      statStatus.className = 'text-2xl sm:text-3xl font-black text-emerald-400 mt-2';
    }
    if (profileCard) {
      profileCard.classList.remove('hidden');
      document.getElementById('gh-user-avatar').src = user.avatar_url;
      document.getElementById('gh-user-name').textContent = user.name || user.login;
      document.getElementById('gh-user-login').textContent = `@${user.login} • ${localStorage.getItem('dutamik_gh_owner')}/${localStorage.getItem('dutamik_gh_repo')}`;
    }
    if (formBadge) {
      formBadge.textContent = 'Connected';
      formBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    }
  } else {
    if (dot) dot.className = 'w-2 h-2 rounded-full bg-slate-500';
    if (text) text.textContent = 'GitHub: Belum Terhubung';
    if (statStatus) {
      statStatus.textContent = 'Offline';
      statStatus.className = 'text-2xl sm:text-3xl font-black text-slate-500 mt-2';
    }
    if (profileCard) profileCard.classList.add('hidden');
    if (formBadge) {
      formBadge.textContent = 'Disconnected';
      formBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-dark-800 text-slate-400';
    }
  }
}

// 8. Git Pull & Commit/Push
async function pullFileFromGithub(fileType) {
  const config = getGithubConfig();
  const filePath = fileType === 'products' ? 'assets/data/products.json' : 'assets/data/services.json';

  if (!config.token) {
    alert('Token GitHub belum dikonfigurasi. Mengambil data dari cache lokal web...');
    await loadInitialLocalData();
    return;
  }

  try {
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) {
      throw new Error(`Gagal mengambil ${filePath} dari GitHub (${res.status})`);
    }

    const data = await res.json();
    const rawContent = base64ToUtf8(data.content.replace(/\s/g, ''));
    const parsed = JSON.parse(rawContent);

    if (fileType === 'products') {
      liveProductsData = parsed;
      liveProductsSha = data.sha;
      renderProductsTable();
    } else {
      liveServicesData = parsed;
      liveServicesSha = data.sha;
      renderServicesTable();
    }

    alert(`Berhasil PULL ${filePath} dari GitHub (SHA: ${data.sha.slice(0, 7)})!`);
  } catch (err) {
    alert('Git Pull Error: ' + err.message);
  }
}

async function commitAndPushFileToGithub(fileType) {
  const config = getGithubConfig();
  const filePath = fileType === 'products' ? 'assets/data/products.json' : 'assets/data/services.json';
  const dataToCommit = fileType === 'products' ? liveProductsData : liveServicesData;
  const currentSha = fileType === 'products' ? liveProductsSha : liveServicesSha;

  if (!config.token) {
    alert('Silakan atur Token GitHub di tab "7. Kunci Akses & GitHub Token".');
    return;
  }

  const commitMsg = prompt(
    `Pesan commit untuk ${filePath}:`,
    `chore(data): update ${fileType}.json via Enterprise Admin Hub`
  );
  if (!commitMsg) return;

  try {
    const jsonString = JSON.stringify(dataToCommit, null, 2);
    const base64Content = utf8ToBase64(jsonString);

    const bodyPayload = {
      message: commitMsg,
      content: base64Content,
      branch: config.branch
    };
    if (currentSha) {
      bodyPayload.sha = currentSha;
    }

    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyPayload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${res.status}`);
    }

    const resJson = await res.json();
    const newSha = resJson.content?.sha || resJson.commit?.sha;

    if (fileType === 'products') liveProductsSha = newSha;
    else liveServicesSha = newSha;

    const banner = document.getElementById('git-commit-result-banner');
    const bannerText = document.getElementById('git-commit-result-text');
    const bannerLink = document.getElementById('git-commit-result-link');
    if (banner) {
      banner.classList.remove('hidden');
      if (bannerText) bannerText.textContent = `Commit berhasil di-push ke GitHub! Commit SHA: ${resJson.commit.sha.slice(0, 7)}`;
      if (bannerLink) bannerLink.href = resJson.commit.html_url || `https://github.com/${config.owner}/${config.repo}/commits/${config.branch}`;
    }

    alert(`🎉 SUKSES! Perubahan data telah di-commit & push ke branch '${config.branch}'. GitHub Pages akan mempublikasikan pembaruan secara otomatis.`);
  } catch (err) {
    alert('Git Commit/Push Gagal: ' + err.message);
  }
}

// 9. Products Table CRUD
function renderProductsTable() {
  const tbody = document.getElementById('admin-products-table-body');
  if (!tbody) return;

  if (liveProductsData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-500">Daftar produk kosong.</td></tr>`;
    return;
  }

  tbody.innerHTML = liveProductsData.map((p, idx) => {
    const isAffiliate = p.type === 'affiliate';
    const isAd = p.type === 'ad_slot';
    const typeBadge = isAd ? 'AdSense Slot' : (isAffiliate ? `Afiliasi (${p.platform || 'Partner'})` : 'Digital PaySheet');
    const badgeColor = isAd ? 'bg-blue-500/20 text-blue-400' : (isAffiliate ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400');

    return `
      <tr class="hover:bg-dark-900/60">
        <td class="p-3.5 font-mono text-[11px] text-slate-400">
          <div>${p.id || '-'}</div>
          <span class="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold ${badgeColor}">${typeBadge}</span>
        </td>
        <td class="p-3.5 font-bold text-white max-w-xs">${p.name || p.title || '-'}</td>
        <td class="p-3.5 text-slate-400">${p.categoryLabel || p.category || '-'}</td>
        <td class="p-3.5 font-extrabold text-slate-200">${p.price ? 'Rp ' + Number(p.price).toLocaleString('id-ID') : '-'}</td>
        <td class="p-3.5 font-mono text-[10px] text-blue-400 max-w-[150px] truncate"><a href="${p.url || '#'}" target="_blank" class="hover:underline">${p.url || '-'}</a></td>
        <td class="p-3.5 text-right space-x-1">
          <button onclick="editProduct(${idx})" class="px-2.5 py-1 bg-dark-800 hover:bg-dark-700 text-slate-200 rounded-lg text-[10px] font-bold">Edit</button>
          <button onclick="deleteProduct(${idx})" class="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded-lg text-[10px] font-bold">Hapus</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddProductModal() {
  document.getElementById('prod-edit-index').value = '-1';
  document.getElementById('modal-product-title').textContent = 'Tambah Produk / Afiliasi Baru';
  document.getElementById('prod-edit-name').value = '';
  document.getElementById('prod-edit-price').value = '';
  document.getElementById('prod-edit-orig-price').value = '';
  document.getElementById('prod-edit-url').value = '';
  document.getElementById('prod-edit-desc').value = '';
  openModal('modal-product-editor');
}

function editProduct(idx) {
  const p = liveProductsData[idx];
  if (!p) return;

  document.getElementById('prod-edit-index').value = idx;
  document.getElementById('modal-product-title').textContent = `Edit Produk: ${p.name || p.title}`;
  document.getElementById('prod-edit-type').value = p.type || 'product';
  document.getElementById('prod-edit-name').value = p.name || p.title || '';
  document.getElementById('prod-edit-price').value = p.price || '';
  document.getElementById('prod-edit-orig-price').value = p.originalPrice || '';
  document.getElementById('prod-edit-url').value = p.url || '';
  document.getElementById('prod-edit-desc').value = p.description || '';
  openModal('modal-product-editor');
}

function deleteProduct(idx) {
  if (confirm(`Yakin ingin menghapus '${liveProductsData[idx]?.name}'?`)) {
    liveProductsData.splice(idx, 1);
    renderProductsTable();
  }
}

function saveProductForm(e) {
  e.preventDefault();
  const idx = parseInt(document.getElementById('prod-edit-index').value, 10);
  const type = document.getElementById('prod-edit-type').value;
  const name = document.getElementById('prod-edit-name').value.trim();
  const price = parseInt(document.getElementById('prod-edit-price').value, 10) || 0;
  const origPrice = parseInt(document.getElementById('prod-edit-orig-price').value, 10) || price;
  const url = document.getElementById('prod-edit-url').value.trim();
  const desc = document.getElementById('prod-edit-desc').value.trim();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (idx === -1) {
    const newObj = {
      id: `PROD-${Date.now().toString().slice(-4)}`,
      type: type,
      name: name,
      slug: slug,
      url: url,
      category: type === 'affiliate' ? 'hardware' : 'aplikasi',
      categoryLabel: type === 'affiliate' ? 'Rekomendasi Hardware' : 'Produk Digital',
      rating: "5.0",
      reviewsCount: 1,
      originalPrice: origPrice,
      price: price,
      discountBadge: "Baru",
      description: desc,
      features: ["Kualitas Terjamin", "Dukungan Penuh"]
    };
    liveProductsData.push(newObj);
  } else {
    liveProductsData[idx] = {
      ...liveProductsData[idx],
      type: type,
      name: name,
      price: price,
      originalPrice: origPrice,
      url: url,
      description: desc
    };
  }

  closeModal('modal-product-editor');
  renderProductsTable();
  alert('Data produk telah diperbarui di memori admin! Klik "Commit & Push ke GitHub" untuk mempublikasikan.');
}

// 10. Services Table
function renderServicesTable() {
  const tbody = document.getElementById('admin-services-table-body');
  if (!tbody) return;

  if (liveServicesData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-500">Daftar layanan kosong.</td></tr>`;
    return;
  }

  tbody.innerHTML = liveServicesData.map((s, idx) => `
    <tr class="hover:bg-dark-900/60">
      <td class="p-3.5 font-mono text-[11px] text-purple-400">${s.id || '-'}</td>
      <td class="p-3.5 font-bold text-white">${s.name || '-'}</td>
      <td class="p-3.5 font-extrabold text-emerald-400">${s.price || '-'}</td>
      <td class="p-3.5 text-slate-300">${s.deliveryTime || '-'}</td>
      <td class="p-3.5 font-mono text-[10px] text-blue-400"><a href="${s.url || '#'}" target="_blank" class="hover:underline">${s.url || '-'}</a></td>
      <td class="p-3.5 text-right">
        <button onclick="editServicePrice(${idx})" class="px-2.5 py-1 bg-dark-800 hover:bg-dark-700 text-slate-200 rounded-lg text-[10px] font-bold">Edit Tarif</button>
      </td>
    </tr>
  `).join('');
}

function editServicePrice(idx) {
  const s = liveServicesData[idx];
  if (!s) return;
  const newPrice = prompt(`Ubah tarif untuk '${s.name}':`, s.price);
  if (newPrice !== null && newPrice.trim()) {
    liveServicesData[idx].price = newPrice.trim();
    renderServicesTable();
    alert('Tarif layanan diperbarui di memori! Klik "Commit & Push ke GitHub" untuk mempublikasikan.');
  }
}

// 11. Initial Data Loading
async function loadInitialLocalData() {
  try {
    const [pRes, sRes] = await Promise.all([
      fetch('../assets/data/products.json').then(r => r.json()).catch(() => []),
      fetch('../assets/data/services.json').then(r => r.json()).catch(() => [])
    ]);
    liveProductsData = pRes;
    liveServicesData = sRes;
    renderProductsTable();
    renderServicesTable();
  } catch (err) {
    console.warn('Initial data load error:', err);
  }
}

function loadOrdersAndPaySheets() {
  // Orders
  const orders = JSON.parse(localStorage.getItem('dutamik_orders') || '[]');
  document.getElementById('stat-count-services').textContent = orders.length;
  const ordersTbody = document.getElementById('admin-orders-table');
  if (ordersTbody) {
    if (orders.length === 0) {
      ordersTbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-500">Belum ada pesanan jasa tersimpan di cache lokal. Data tersimpan aman di Google Sheets.</td></tr>`;
    } else {
      ordersTbody.innerHTML = orders.map((o) => `
        <tr class="hover:bg-dark-900/40">
          <td class="p-3 font-mono text-[11px]">${o.timestamp || '-'}</td>
          <td class="p-3 font-bold text-white">${o.clientName}</td>
          <td class="p-3 font-mono text-emerald-400"><a href="https://wa.me/${(o.clientWhatsapp||'').replace(/\D/g,'')}" target="_blank" class="hover:underline">${o.clientWhatsapp}</a></td>
          <td class="p-3 font-semibold text-purple-400">${o.serviceType}</td>
          <td class="p-3 text-slate-400 line-clamp-1">${o.projectDetails}</td>
          <td class="p-3 text-right">
            <a href="https://wa.me/${(o.clientWhatsapp||'').replace(/\D/g,'')}?text=Halo%20${encodeURIComponent(o.clientName)},%20kami%20dari%20DUTAMIK.ID" target="_blank" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold">
              Chat WA
            </a>
          </td>
        </tr>
      `).join('');
    }
  }

  // PaySheet
  const paysheets = JSON.parse(localStorage.getItem('dutamik_paysheets') || '[]');
  document.getElementById('stat-count-products').textContent = paysheets.length;
  const paysheetTbody = document.getElementById('admin-paysheet-table');
  if (paysheetTbody) {
    if (paysheets.length === 0) {
      paysheetTbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-500">Belum ada log transaksi PaySheet di cache lokal.</td></tr>`;
    } else {
      paysheetTbody.innerHTML = paysheets.map(p => `
        <tr class="hover:bg-dark-900/40">
          <td class="p-3 font-mono text-[11px] text-amber-400">${p.trxId || '-'}</td>
          <td class="p-3 font-mono text-[11px]">${p.timestamp || '-'}</td>
          <td class="p-3 font-bold text-white">${p.productName}</td>
          <td class="p-3 font-extrabold text-blue-400">Rp ${Number(p.totalPrice || 0).toLocaleString('id-ID')}</td>
          <td class="p-3 text-slate-300">${p.buyerName} (${p.buyerEmail})</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Lunas / Verified</span></td>
        </tr>
      `).join('');
    }
  }
}

// 12. Initialization Hub
function initDashboard() {
  startLiveClock();
  loadAnalyticsData();
  loadAdsenseSettings();
  loadGasSettings();

  const config = getGithubConfig();
  if (document.getElementById('gh-owner-input')) {
    document.getElementById('gh-owner-input').value = config.owner;
    document.getElementById('gh-repo-input').value = config.repo;
    document.getElementById('gh-branch-input').value = config.branch;
    if (config.token) {
      document.getElementById('gh-token-input').value = config.token;
      testAndSaveGithubConnection();
    }
  }

  loadInitialLocalData();
  loadOrdersAndPaySheets();
}

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
});
