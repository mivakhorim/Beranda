/**
 * DUTAMIK.ID - Master Catalog Database & Universal Engine
 * Duta Media Informasi berKarya
 * 
 * Works 100% on both local file:// protocol and production web servers without CORS issues.
 */

// Helper to determine relative URL prefix to website root dynamically
function getDutamikRelPrefix() {
  if (typeof window.DUTAMIK_REL_PREFIX === 'string') {
    return window.DUTAMIK_REL_PREFIX;
  }
  const fullPath = window.location.pathname;
  if (/\/(jasa|produk|tools)\/[^/]+(\/|$)/i.test(fullPath)) {
    return '../../';
  } else if (/\/(katalog|jasa|produk|tools|donasi|about|contact|privacy-policy|terms-of-service|disclaimer|admin)(\/|$)/i.test(fullPath)) {
    return '../';
  }
  return './';
}

const DUTAMIK_TOOLS_DATA = [
  {
    id: "tool_qr_generator",
    name: "Custom QR Code Generator",
    slug: "qr-generator",
    urlPath: "tools/qr-generator/",
    itemType: "tool",
    category: "tool",
    categoryLabel: "Fitur Gratis",
    badge: "100% Gratis",
    badgeColor: "emerald",
    icon: "qr-code",
    iconColor: "blue",
    thumbnail: "assets/images/thumbnails/produk-paysheet-engine.svg",
    description: "Buat kode QR kustom untuk URL website, teks bebas, kontak vCard, atau koneksi Wi-Fi instan dengan pilihan warna dan download PNG jernih.",
    features: ["Kustomisasi Warna Hex", "Download Resolusi Tinggi PNG", "100% Private In-Browser"]
  },
  {
    id: "tool_wa_link",
    name: "Direct WhatsApp Link Maker",
    slug: "wa-link-generator",
    urlPath: "tools/wa-link-generator/",
    itemType: "tool",
    category: "tool",
    categoryLabel: "Fitur Gratis",
    badge: "Populer",
    badgeColor: "blue",
    icon: "message-circle",
    iconColor: "emerald",
    thumbnail: "assets/images/thumbnails/jasa-remote-pc.svg",
    description: "Generate tautan chat WhatsApp instan dengan template pesan terformat tanpa perlu menyimpan nomor tujuan ke kontak handphone.",
    features: ["Format Teks Bold/Italic", "Validasi Nomor Otomatis", "Tombol Copy & Test Link"]
  },
  {
    id: "tool_img_compressor",
    name: "Image Compressor & WebP Converter",
    slug: "image-compressor",
    urlPath: "tools/image-compressor/",
    itemType: "tool",
    category: "tool",
    categoryLabel: "Fitur Gratis",
    badge: "Hemat 80%",
    badgeColor: "emerald",
    icon: "image",
    iconColor: "purple",
    thumbnail: "assets/images/thumbnails/jasa-3d-modeling.svg",
    description: "Kompres ukuran foto/gambar secara instan dan konversi format ke WebP modern tanpa mengurangi ketajaman visual gambar.",
    features: ["Kompresi Batch Cepat", "Konversi Format WebP", "Zero Server Upload"]
  },
  {
    id: "tool_pwd_hash",
    name: "Password Hash & Crypto Key Generator",
    slug: "password-hash-generator",
    urlPath: "tools/password-hash-generator/",
    itemType: "tool",
    category: "tool",
    categoryLabel: "Fitur Gratis",
    badge: "Keamanan Tinggi",
    badgeColor: "blue",
    icon: "shield-check",
    iconColor: "cyan",
    thumbnail: "assets/images/thumbnails/jasa-peta-shp-oss.svg",
    description: "Hasilkan kata sandi acak dengan standar kriptografi militer serta kalkulasi nilai hash SHA-256 dan MD5 langsung di browser.",
    features: ["Kriptografi WebCrypto API", "Hash SHA-256 Real-time", "Tanpa Rekam Jejak"]
  },
  {
    id: "tool_invoice_maker",
    name: "Auto Invoice & Kwitansi Maker",
    slug: "invoice-maker",
    urlPath: "tools/invoice-maker/",
    itemType: "tool",
    category: "tool",
    categoryLabel: "Fitur Gratis",
    badge: "Siap Cetak PDF",
    badgeColor: "purple",
    icon: "file-text",
    iconColor: "amber",
    thumbnail: "assets/images/thumbnails/produk-pos-sheet.svg",
    description: "Buat faktur tagihan, invoice profesional, dan kwitansi pembayaran lengkap dengan kalkulasi pajak dan cetak PDF langsung.",
    features: ["Kalkulasi Otomatis", "Template Cetak Standar", "Simpan Template Lokal"]
  },
  {
    id: "tool_text_case",
    name: "Text Case & Character Counter",
    slug: "text-case-converter",
    urlPath: "tools/text-case-converter/",
    itemType: "tool",
    category: "tool",
    categoryLabel: "Fitur Gratis",
    badge: "Utilitas Praktis",
    badgeColor: "blue",
    icon: "type",
    iconColor: "indigo",
    thumbnail: "assets/images/thumbnails/jasa-nib-oss.svg",
    description: "Ubah format teks ke UPPERCASE, lowercase, Title Case, camelCase, slug URL, serta hitung jumlah karakter dan perkiraan waktu baca.",
    features: ["6 Mode Konversi Teks", "Hitung Kata & Karakter", "One-Click Copy"]
  }
];

const DUTAMIK_SERVICES_DATA = [
  {
    id: "svc_remote_pc",
    name: "Optimasi Laptop & PC Remote",
    slug: "remote-pc",
    urlPath: "jasa/remote-pc/",
    itemType: "service",
    category: "service",
    categoryLabel: "Layanan Jasa",
    price: 50000,
    priceFormatted: "Rp 50.000",
    unit: "1 Jam Selesai",
    badge: "Garansi Lancar",
    badgeColor: "blue",
    icon: "laptop",
    iconColor: "blue",
    thumbnail: "assets/images/thumbnails/jasa-remote-pc.svg",
    description: "Percepat kinerja laptop/PC lambat, pembersihan virus & malware mendalam, perbaikan error registry, dan pemasangan software esensial via UltraViewer/AnyDesk.",
    features: ["Pembersihan Junk & Virus", "Optimasi Startup & RAM", "Garansi Sampai Normal"]
  },
  {
    id: "svc_3d_modeling",
    name: "3D Modeling Bangunan & Rumah",
    slug: "3d-modeling",
    urlPath: "jasa/3d-modeling/",
    itemType: "service",
    category: "service",
    categoryLabel: "Layanan Jasa",
    price: 150000,
    priceFormatted: "Rp 150.000",
    unit: "Mulai dari",
    badge: "Ultra HD Render",
    badgeColor: "purple",
    icon: "box",
    iconColor: "purple",
    thumbnail: "assets/images/thumbnails/jasa-3d-modeling.svg",
    description: "Visualisasi 3D arsitektur fotorealistik tampak fasad eksterior dan interior ruangan detail format SketchUp + render resolusi tinggi siap presentasi.",
    features: ["3 View Render Resolusi HD", "File Master .SKP Lengkap", "Revisi Proporsional"]
  },
  {
    id: "svc_gambar_pbg",
    name: "Gambar PBG SIMBG PUPR Lengkap",
    slug: "gambar-pbg",
    urlPath: "jasa/gambar-pbg/",
    itemType: "service",
    category: "service",
    categoryLabel: "Layanan Jasa",
    price: 300000,
    priceFormatted: "Rp 300.000",
    unit: "Siap Upload SIMBG",
    badge: "Standar PUPR",
    badgeColor: "emerald",
    icon: "drafting-compass",
    iconColor: "emerald",
    thumbnail: "assets/images/thumbnails/jasa-gambar-pbg.svg",
    description: "Penyusunan gambar kerja arsitektur 2D DED lengkap (Denah, Tampak, Potongan, Detail Struktur & MEP) berstandar verifikasi sistem SIMBG PUPR.",
    features: ["Format PDF & DWG Siap Upload", "Format Surat Pernyataan", "Garansi Lolos Verifikasi"]
  },
  {
    id: "svc_peta_shp",
    name: "Peta SHP / ZIP Validasi OSS",
    slug: "peta-shp-oss",
    urlPath: "jasa/peta-shp-oss/",
    itemType: "service",
    category: "service",
    categoryLabel: "Layanan Jasa",
    price: 100000,
    priceFormatted: "Rp 100.000",
    unit: "Format ESRI Polygon",
    badge: "Valid Sistem OSS",
    badgeColor: "cyan",
    icon: "map-pin",
    iconColor: "cyan",
    thumbnail: "assets/images/thumbnails/jasa-peta-shp-oss.svg",
    description: "Pembuatan shapefile geospasial poligon berkoordinat WGS 84 / UTM format ZIP resmi untuk verifikasi KKPR / PKKPR di portal OSS RBA dan AMDALNET.",
    features: ["Sistem Koordinat Presisi WGS84", "Lengkap SHP, SHX, DBF, PRJ", "Langsung Lolos Validasi OSS"]
  },
  {
    id: "svc_nib_oss",
    name: "Pendampingan NIB Usaha Mikro OSS",
    slug: "nib-oss",
    urlPath: "jasa/nib-oss/",
    itemType: "service",
    category: "service",
    categoryLabel: "Layanan Jasa",
    price: 75000,
    priceFormatted: "Rp 75.000",
    unit: "Terbit Resmi BKPM",
    badge: "Resmi Pemerintah",
    badgeColor: "amber",
    icon: "file-check-2",
    iconColor: "amber",
    thumbnail: "assets/images/thumbnails/jasa-nib-oss.svg",
    description: "Pendampingan pembuatan Nomor Induk Berusaha (NIB) berbasis risiko BKPM RI resmi untuk UMKM lengkap dengan pemilihan KBLI yang tepat dan izin dasar.",
    features: ["KBLI Sesuai Bidang Usaha", "File NIB Resmi & Barcode BKPM", "Edukasi Izin Lanjutan"]
  },
  {
    id: "svc_web_umkm",
    name: "Pembuatan Website UMKM & Profil",
    slug: "web-umkm",
    urlPath: "jasa/web-umkm/",
    itemType: "service",
    category: "service",
    categoryLabel: "Layanan Jasa",
    price: 250000,
    priceFormatted: "Rp 250.000",
    unit: "Tanpa Sewa Server",
    badge: "Serverless Gratis",
    badgeColor: "rose",
    icon: "globe",
    iconColor: "rose",
    thumbnail: "assets/images/thumbnails/jasa-web-umkm.svg",
    description: "Pembuatan landing page profesional berkecepatan tinggi, responsif di HP, terintegrasi form order Google Sheet, tombol chat WhatsApp, dan tanpa biaya sewa server tahunan.",
    features: ["Hosting Gratis Selamanya", "Form Masuk Google Sheet", "Domain Kustom & SSL Aktif"]
  }
];

const DUTAMIK_PRODUCTS_DATA = [
  {
    id: "prod_pos_sheet",
    name: "Aplikasi Kasir POS Google Sheet Otomatis",
    slug: "pos-sheet",
    urlPath: "produk/pos-sheet/",
    itemType: "product",
    category: "product",
    categoryLabel: "Produk PaySheet",
    price: 75000,
    originalPrice: 250000,
    discountBadge: "Hemat 70%",
    rating: "4.9",
    badge: "Best Seller",
    badgeColor: "emerald",
    icon: "layout-grid",
    thumbnail: "assets/images/thumbnails/produk-pos-sheet.svg",
    description: "Template kasir digital berbasis spreadsheet terotomasi. Pencatatan transaksi kilat, cetak nota struk thermal, laporan laba rugi otomatis tanpa biaya langganan bulanan.",
    features: ["Cetak Struk Thermal Bluetooth", "Manajemen Stok Real-time", "Akses Multi-Device"]
  },
  {
    id: "prod_rumah_2d3d",
    name: "Paket Gambar 2D Rumah Lengkap + 3D Fasad",
    slug: "rumah-2d3d",
    urlPath: "produk/rumah-2d3d/",
    itemType: "product",
    category: "product",
    categoryLabel: "Produk PaySheet",
    price: 75000,
    originalPrice: 250000,
    discountBadge: "Hemat 70%",
    rating: "4.9",
    badge: "Paket Favorit",
    badgeColor: "purple",
    icon: "home",
    thumbnail: "assets/images/thumbnails/produk-rumah-2d3d.svg",
    description: "Paket komplit gambar kerja arsitektur, denah tata ruang, tampak bangunan, potongan melintang, rencana struktur pondasi, RAB Excel, dan 3 view render fasad 3D HD.",
    features: ["File Master DWG & PDF Siap Bangun", "Estimasi Rencana Anggaran Biaya (RAB)", "Bisa Langsung Diberikan ke Tukang"]
  },
  {
    id: "prod_template_web",
    name: "Template Website UMKM & Landing Page",
    slug: "template-web",
    urlPath: "produk/template-web/",
    itemType: "product",
    category: "product",
    categoryLabel: "Produk PaySheet",
    price: 49000,
    originalPrice: 150000,
    discountBadge: "Hemat 67%",
    rating: "4.8",
    badge: "Mudah Edit",
    badgeColor: "blue",
    icon: "layout-template",
    thumbnail: "assets/images/thumbnails/produk-template-web.svg",
    description: "Source code website modern responsif HTML5 + Tailwind CSS, terintegrasi form order Google Sheet, dark mode otomatis, widget WhatsApp, dan siap deploy gratis ke GitHub Pages.",
    features: ["Responsif Seluler & Tablet", "Dark / Light Mode Toggle", "Integrasi Form Google Sheet"]
  },
  {
    id: "prod_paysheet_engine",
    name: "PaySheet - Dynamic QRIS Payment Engine",
    slug: "paysheet-engine",
    urlPath: "produk/paysheet-engine/",
    itemType: "product",
    category: "product",
    categoryLabel: "Produk PaySheet",
    price: 99000,
    originalPrice: 350000,
    discountBadge: "Hemat 72%",
    rating: "5.0",
    badge: "Teknologi Cerdas",
    badgeColor: "amber",
    icon: "qr-code",
    thumbnail: "assets/images/thumbnails/produk-paysheet-engine.svg",
    description: "Modul JavaScript + Google Apps Script untuk generate dynamic QRIS dengan CRC16 checksum dan verifikasi transaksi digital otomatis tanpa fee bulanan payment gateway.",
    features: ["CRC16 Checksum Standar BI (QRIS)", "Notifikasi Real-time WhatsApp", "Zero Biaya Bulanan Gateway"]
  },
  {
    id: "prod_ebook_gas",
    name: "E-Book Mastering Google Apps Script",
    slug: "ebook-gas",
    urlPath: "produk/ebook-gas/",
    itemType: "product",
    category: "product",
    categoryLabel: "Produk PaySheet",
    price: 39000,
    originalPrice: 120000,
    discountBadge: "Hemat 68%",
    rating: "4.8",
    badge: "Panduan Lengkap",
    badgeColor: "rose",
    icon: "book-open",
    thumbnail: "assets/images/thumbnails/produk-ebook-gas.svg",
    description: "Panduan praktis Google Apps Script bahasa Indonesia. Dilengkapi 20+ contoh skrip automasi spreadsheet, web app tanpa server, dan bot notifikasi WhatsApp.",
    features: ["Format PDF 180+ Halaman", "20+ Template Script Siap Pakai", "Grup Tanya Jawab Pemula"]
  }
];

const DUTAMIK_AFFILIATE_DATA = [
  {
    id: "aff_thermal_printer",
    name: "Printer Kasir Thermal Bluetooth 58mm",
    urlPath: "https://shopee.co.id",
    isExternal: true,
    itemType: "affiliate",
    category: "affiliate",
    categoryLabel: "Afiliasi & Hardware",
    price: 145000,
    originalPrice: 220000,
    discountBadge: "Diskon 34%",
    badge: "Hardware Kasir",
    badgeColor: "amber",
    rating: "4.9",
    thumbnail: "assets/images/thumbnails/produk-pos-sheet.svg",
    description: "Printer thermal nirkabel kompatibel dengan aplikasi kasir POS Sheet DUTAMIK.ID dan smartphone Android/PC.",
    features: ["Koneksi Bluetooth & USB", "Baterai Tahan Seharian", "Garansi Toko Resmi"]
  },
  {
    id: "aff_barcode_scanner",
    name: "Barcode Scanner Wireless 1D/2D QR",
    urlPath: "https://shopee.co.id",
    isExternal: true,
    itemType: "affiliate",
    category: "affiliate",
    categoryLabel: "Afiliasi & Hardware",
    price: 189000,
    originalPrice: 280000,
    discountBadge: "Diskon 32%",
    badge: "Hardware Kasir",
    badgeColor: "amber",
    rating: "4.8",
    thumbnail: "assets/images/thumbnails/produk-paysheet-engine.svg",
    description: "Pemindai barcode nirkabel plug-and-play untuk input produk kilat ke spreadsheet dan POS kasir.",
    features: ["Scan Barcode & QR Code", "Plug & Play Tanpa Driver", "Jangkauan Sinyal Luas"]
  }
];

// Global registries
window.DUTAMIK_TOOLS_DATA = DUTAMIK_TOOLS_DATA;
window.DUTAMIK_SERVICES_DATA = DUTAMIK_SERVICES_DATA;
window.DUTAMIK_PRODUCTS_DATA = DUTAMIK_PRODUCTS_DATA;
window.DUTAMIK_AFFILIATE_DATA = DUTAMIK_AFFILIATE_DATA;

// ==============================================================================
// MASTER CATALOG FILTER & RENDER ENGINE
// ==============================================================================

let currentCatalogCategory = 'all';

function getAllCatalogItems() {
  return [
    ...DUTAMIK_TOOLS_DATA,
    ...DUTAMIK_SERVICES_DATA,
    ...DUTAMIK_PRODUCTS_DATA,
    ...DUTAMIK_AFFILIATE_DATA
  ];
}

function updateCatalogCounters() {
  const cAll = document.getElementById('count-all');
  const cTool = document.getElementById('count-tool');
  const cSvc = document.getElementById('count-service');
  const cProd = document.getElementById('count-product');
  const cAff = document.getElementById('count-affiliate');

  if (cAll) cAll.textContent = getAllCatalogItems().length;
  if (cTool) cTool.textContent = DUTAMIK_TOOLS_DATA.length;
  if (cSvc) cSvc.textContent = DUTAMIK_SERVICES_DATA.length;
  if (cProd) cProd.textContent = DUTAMIK_PRODUCTS_DATA.length;
  if (cAff) cAff.textContent = DUTAMIK_AFFILIATE_DATA.length;
}

function setCatalogCategory(cat) {
  currentCatalogCategory = cat;
  
  // Update tab button active states
  const tabs = document.querySelectorAll('#catalog-category-tabs .cat-tab-btn');
  tabs.forEach(btn => {
    btn.classList.remove('active', 'bg-blue-600', 'text-white', 'shadow');
    btn.classList.add('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-300');
  });

  const activeBtn = event?.currentTarget || document.querySelector(`#catalog-category-tabs button[onclick*="'${cat}'"]`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'bg-blue-600', 'text-white', 'shadow');
    activeBtn.classList.remove('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-300');
  }

  handleCatalogFilter();
}

function handleCatalogFilter() {
  const searchInput = document.getElementById('catalog-search-input');
  const sortSelect = document.getElementById('catalog-sort-select');
  const query = (searchInput?.value || '').toLowerCase().trim();
  const sort = sortSelect?.value || 'default';

  let items = getAllCatalogItems();

  // 1. Filter by category
  if (currentCatalogCategory !== 'all') {
    items = items.filter(item => item.category === currentCatalogCategory);
  }

  // 2. Filter by search query
  if (query) {
    items = items.filter(item => {
      const nameMatch = (item.name || '').toLowerCase().includes(query);
      const descMatch = (item.description || '').toLowerCase().includes(query);
      const catMatch = (item.categoryLabel || '').toLowerCase().includes(query);
      const featMatch = (item.features || []).some(f => f.toLowerCase().includes(query));
      return nameMatch || descMatch || catMatch || featMatch;
    });
  }

  // 3. Sorting
  if (sort === 'name_asc') {
    items.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'price_low') {
    items.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sort === 'price_high') {
    items.sort((a, b) => (b.price || 0) - (a.price || 0));
  }

  renderCatalogGridCards(items);
}

function renderCatalogGridCards(items) {
  const container = document.getElementById('catalog-grid-container');
  if (!container) return;

  const rel = getDutamikRelPrefix();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 mx-auto flex items-center justify-center font-bold text-xl">🔍</div>
        <h4 class="font-bold text-sm text-slate-900 dark:text-white">Tidak ada item yang sesuai</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400">Coba ubah kata kunci pencarian atau pilih kategori lain di atas.</p>
        <button onclick="setCatalogCategory('all')" class="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow mt-2">Reset Filter</button>
      </div>
    `;
    return;
  }

  let html = '';
  items.forEach(item => {
    const isExt = item.isExternal;
    const finalUrl = isExt ? item.urlPath : (rel + item.urlPath);
    const thumbUrl = rel + item.thumbnail;
    const targetAttr = isExt ? 'target="_blank" rel="noopener"' : '';
    
    // Price / Badge display
    let priceSnippet = '';
    if (item.itemType === 'tool') {
      priceSnippet = `<span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">Gratis 100% In-Browser</span>`;
    } else if (item.price) {
      priceSnippet = `
        <div>
          <span class="text-[10px] text-slate-400 font-semibold block">${item.unit || 'Harga'}</span>
          <span class="text-xs font-black text-slate-900 dark:text-white">Rp ${item.price.toLocaleString('id-ID')}</span>
        </div>
      `;
    }

    const featurePills = (item.features || []).slice(0, 2).map(f => 
      `<span class="text-[10px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold truncate max-w-[130px]">${f}</span>`
    ).join('');

    html += `
      <div class="glass-panel rounded-3xl glow-card flex flex-col justify-between border border-slate-200/80 dark:border-slate-800/80 transition-all hover:-translate-y-1.5 shadow-sm overflow-hidden group">
        <div class="relative w-full h-36 sm:h-44 bg-slate-950 overflow-hidden border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center">
          <img src="${thumbUrl}" alt="${item.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          <span class="absolute top-3 right-3 text-[10px] bg-${item.badgeColor || 'blue'}-600 text-white px-2.5 py-1 rounded-full font-bold shadow-md backdrop-blur-md">${item.badge}</span>
        </div>
        <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div class="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">${item.categoryLabel}</div>
            <h3 class="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug group-hover:text-blue-500 transition-colors">${item.name}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">${item.description}</p>
            <div class="mt-3 flex flex-wrap gap-1.5">${featurePills}</div>
          </div>
          <div class="pt-3.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
            ${priceSnippet}
            <a href="${finalUrl}" ${targetAttr} class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow">
              <span>${isExt ? 'Beli di Shopee' : 'Buka / Order'}</span>
              <i data-lucide="${isExt ? 'external-link' : 'arrow-right'}" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

// Auto Initialize Catalog on Page Load
document.addEventListener('DOMContentLoaded', () => {
  updateCatalogCounters();
  if (document.getElementById('catalog-grid-container')) {
    handleCatalogFilter();
  }
});
