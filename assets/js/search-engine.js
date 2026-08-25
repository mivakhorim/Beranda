/**
 * DUTAMIK.ID - In-Memory Search Engine & Secure Admin Backdoor
 * Duta Media Informasi berKarya
 * High-speed search with zero fetch dependencies and SHA-256 protected backdoor.
 */

// SHA-256 Hashing Utility via Web Crypto API
async function computeSha256(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const _SEC_TRIGGERS = [
  "1a823972c12c1a759cc38d6ec36ca6567d3d95bc77f0f0e6a1e6f127424b050a", // ad_log
  "9af13e0601cc2ac876c8b26d0e62448d09339140c4b647413f784d8b6a4aa961"  // adlog
];

function openSearchModal() {
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

async function performSearch(rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  const resultsContainer = document.getElementById('search-results-container');
  const backdoorContainer = document.getElementById('search-backdoor-container');
  if (!resultsContainer) return;

  const rel = getDutamikRelPrefix();

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
                <div class="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg">🔑</div>
                <div>
                  <h4 class="font-bold text-xs sm:text-sm">Jalur Khusus Administrator Terverifikasi</h4>
                  <p class="text-[11px] opacity-90">Klik tombol untuk membuka Panel Kontrol Admin.</p>
                </div>
              </div>
              <a href="${rel}admin/" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition">
                Buka Admin Hub &rarr;
              </a>
            </div>
          `;
        }
      } else {
        if (backdoorContainer) {
          backdoorContainer.classList.add('hidden');
          backdoorContainer.innerHTML = '';
        }
      }
    } catch (e) {}
  } else {
    if (backdoorContainer) {
      backdoorContainer.classList.add('hidden');
      backdoorContainer.innerHTML = '';
    }
  }

  // Get In-Memory Items
  const allItems = typeof getAllCatalogItems === 'function' ? getAllCatalogItems() : [
    ...(window.DUTAMIK_TOOLS_DATA || []),
    ...(window.DUTAMIK_SERVICES_DATA || []),
    ...(window.DUTAMIK_PRODUCTS_DATA || [])
  ];

  let filtered = allItems;
  if (query) {
    filtered = allItems.filter(item => {
      const titleMatch = (item.name || '').toLowerCase().includes(query);
      const descMatch = (item.description || '').toLowerCase().includes(query);
      const catMatch = (item.categoryLabel || '').toLowerCase().includes(query);
      const featMatch = (item.features || []).some(f => f.toLowerCase().includes(query));
      return titleMatch || descMatch || catMatch || featMatch;
    });
  }

  if (filtered.length === 0) {
    resultsContainer.innerHTML = `
      <div class="py-8 text-center text-xs text-slate-400">
        Tidak ditemukan hasil untuk "<strong>${rawQuery}</strong>". Coba kata kunci lain.
      </div>
    `;
    return;
  }

  let html = '';
  filtered.slice(0, 8).forEach(item => {
    const isExt = item.isExternal;
    const finalUrl = isExt ? item.urlPath : (rel + item.urlPath);
    const thumbUrl = rel + item.thumbnail;
    const targetAttr = isExt ? 'target="_blank" rel="noopener"' : '';

    html += `
      <a href="${finalUrl}" ${targetAttr} class="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
        <div class="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden flex-shrink-0 border border-slate-700">
          <img src="${thumbUrl}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">${item.categoryLabel || 'Layanan'}</span>
            <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">${item.badge || ''}</span>
          </div>
          <h4 class="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-blue-500 transition">${item.name}</h4>
          <p class="text-[10px] text-slate-400 truncate">${item.description}</p>
        </div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition flex-shrink-0"></i>
      </a>
    `;
  });

  resultsContainer.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}
