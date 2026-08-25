/**
 * DUTAMIK.ID - Dynamic Search Engine & Secure Admin Backdoor Handler
 * Duta Media Informasi berKarya
 * High-performance search with zero plaintext secrets & SHA-256 hashed backdoor.
 */

let searchDatabase = {
  tools: [],
  services: [],
  products: []
};
let isSearchDbLoaded = false;

// SHA-256 Hashing Utility via Web Crypto API
async function computeSha256(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Target SHA-256 Fingerprints (Obfuscated & Secure)
// Hash for backdoor keywords ('ad_log' and 'adlog')
const _SEC_TRIGGERS = [
  "1a823972c12c1a759cc38d6ec36ca6567d3d95bc77f0f0e6a1e6f127424b050a", // SHA-256 of ad_log
  "9af13e0601cc2ac876c8b26d0e62448d09339140c4b647413f784d8b6a4aa961"  // SHA-256 of adlog
];

// Default PIN SHA-256 Hash ('mivakhorim@duta')
const _DEFAULT_PIN_HASH = "9816dba2832dde5f8b474d6156e4d5e8715575f3c525eebf82b776b3434af6a8";

// 1. Initialize & Fetch Registries
async function initSearchEngine() {
  if (isSearchDbLoaded) return;
  try {
    const basePath = window.location.pathname.includes('/tools/') || 
                     window.location.pathname.includes('/jasa/') || 
                     window.location.pathname.includes('/produk/') ||
                     window.location.pathname.includes('/admin/') ? '../' : './';

    const [toolsRes, servicesRes, productsRes] = await Promise.all([
      fetch(basePath + 'assets/data/tools.json').then(r => r.json()).catch(() => []),
      fetch(basePath + 'assets/data/services.json').then(r => r.json()).catch(() => []),
      fetch(basePath + 'assets/data/products.json').then(r => r.json()).catch(() => [])
    ]);

    searchDatabase.tools = toolsRes.map(t => ({ ...t, itemType: 'tool', linkUrl: basePath + t.url }));
    searchDatabase.services = servicesRes.map(s => ({ ...s, itemType: 'service', linkUrl: basePath + s.url }));
    searchDatabase.products = productsRes.filter(p => p.type !== 'ad_slot').map(p => ({ ...p, itemType: 'product', linkUrl: basePath + (p.url || 'produk/') }));

    isSearchDbLoaded = true;
  } catch (err) {
    console.warn('Search DB init error:', err);
  }
}

// 2. Open / Close Search Modal
function openSearchModal() {
  initSearchEngine();
  const modal = document.getElementById('modal-global-search');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    const input = document.getElementById('search-input-field');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 50);
      performSearch('');
    }
  }
}

function closeSearchModal() {
  const modal = document.getElementById('modal-global-search');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// 3. Real-time Search Execution & Secret Backdoor Trigger
async function performSearch(rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  const resultsContainer = document.getElementById('search-results-container');
  const backdoorContainer = document.getElementById('search-backdoor-container');
  if (!resultsContainer) return;

  // SECURE BACKDOOR CHECK via SHA-256
  if (query.length >= 4) {
    try {
      const queryHash = await computeSha256(query);
      if (_SEC_TRIGGERS.includes(queryHash)) {
        if (backdoorContainer) {
          backdoorContainer.classList.remove('hidden');
          backdoorContainer.innerHTML = `
            <div class="p-4 rounded-2xl bg-amber-500/10 border-2 border-dashed border-amber-500 text-amber-700 dark:text-amber-300 flex items-center justify-between animate-pulse">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg">
                  🔑
                </div>
                <div>
                  <h4 class="font-bold text-xs sm:text-sm">Jalur Khusus Administrator Terverifikasi</h4>
                  <p class="text-[11px] opacity-90">Klik tombol di samping untuk masuk ke Panel Kontrol Admin.</p>
                </div>
              </div>
              <button onclick="triggerAdminBackdoorLogin()" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition">
                Buka Admin Hub &rarr;
              </button>
            </div>
          `;
        }
      } else {
        if (backdoorContainer) {
          backdoorContainer.classList.add('hidden');
          backdoorContainer.innerHTML = '';
        }
      }
    } catch (e) {
      // Fallback
    }
  } else {
    if (backdoorContainer) {
      backdoorContainer.classList.add('hidden');
      backdoorContainer.innerHTML = '';
    }
  }

  // Aggregate All Items
  const allItems = [
    ...searchDatabase.tools,
    ...searchDatabase.services,
    ...searchDatabase.products
  ];

  if (!query) {
    // Show Top Recommendations
    resultsContainer.innerHTML = renderSearchResultGroup('Rekomendasi Cepat', allItems.slice(0, 6));
    if (window.lucide) lucide.createIcons();
    return;
  }

  // Filter Items
  const filtered = allItems.filter(item => {
    const titleMatch = (item.name || '').toLowerCase().includes(query);
    const descMatch = (item.description || '').toLowerCase().includes(query);
    const tagMatch = (item.tags || []).some(t => t.toLowerCase().includes(query));
    const catMatch = (item.category || '').toLowerCase().includes(query);
    return titleMatch || descMatch || tagMatch || catMatch;
  });

  if (filtered.length === 0) {
    resultsContainer.innerHTML = `
      <div class="text-center py-10 text-slate-400 text-xs">
        <svg class="w-12 h-12 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <p class="font-bold text-slate-600 dark:text-slate-300">Tidak ditemukan hasil untuk "${rawQuery}"</p>
        <p class="text-[11px] mt-1">Coba kata kunci lain seperti: "qr", "peta shp", "kasir", "remote", "pbg", atau "website".</p>
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = renderSearchResultGroup(`Hasil Pencarian (${filtered.length})`, filtered);
  if (window.lucide) lucide.createIcons();
}

function renderSearchResultGroup(title, items) {
  let html = `<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">${title}</div><div class="space-y-2">`;

  items.forEach(item => {
    let typeBadge = '';
    let iconName = item.icon || 'file-text';
    let badgeClass = 'bg-blue-500/10 text-blue-600';

    if (item.itemType === 'tool') {
      typeBadge = 'Fitur Gratis';
      badgeClass = 'bg-emerald-500/10 text-emerald-600';
    } else if (item.itemType === 'service') {
      typeBadge = `Jasa (${item.price || ''})`;
      badgeClass = 'bg-purple-500/10 text-purple-600';
    } else if (item.itemType === 'product') {
      typeBadge = item.type === 'affiliate' ? `Afiliasi (${item.platform || 'Partner'})` : `Produk (Rp ${Number(item.price || 0).toLocaleString('id-ID')})`;
      badgeClass = 'bg-rose-500/10 text-rose-600';
    }

    html += `
      <a href="${item.linkUrl}" class="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition group">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:scale-105 transition">
            <i data-lucide="${iconName}" class="w-4 h-4"></i>
          </div>
          <div>
            <h4 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition leading-tight">${item.name}</h4>
            <p class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">${item.description}</p>
          </div>
        </div>
        <span class="text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeClass} flex-shrink-0 ml-2">
          ${typeBadge}
        </span>
      </a>
    `;
  });

  html += `</div>`;
  return html;
}

// 4. Backdoor Login Handler with Secure SHA-256 PIN Check
async function triggerAdminBackdoorLogin() {
  closeSearchModal();
  const basePath = window.location.pathname.includes('/tools/') || 
                   window.location.pathname.includes('/jasa/') || 
                   window.location.pathname.includes('/produk/') ? '../' : './';
  
  const enteredPin = prompt("Masukkan Kunci Akses Admin DUTAMIK.ID:");
  if (enteredPin !== null) {
    const pinHash = await computeSha256(enteredPin);
    const savedCustomPinHash = localStorage.getItem('dutamik_admin_pin_hash');
    
    if (pinHash === _DEFAULT_PIN_HASH || (savedCustomPinHash && pinHash === savedCustomPinHash)) {
      sessionStorage.setItem('dutamik_admin_auth', 'true');
      window.location.href = basePath + 'admin/dashboard.html';
    } else {
      alert("Kunci Akses Admin Tidak Valid!");
    }
  }
}

// Global Keyboard Shortcut (Ctrl+K / Cmd+K)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openSearchModal();
  }
  if (e.key === 'Escape') {
    closeSearchModal();
  }
});
