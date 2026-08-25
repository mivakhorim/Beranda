/**
 * DUTAMIK.ID - Enterprise Visual Post Generator & Freeform Layout Builder
 * Duta Media Informasi berKarya
 * 
 * Capabilities:
 * - Freeform Layout Architecture (1 Full-width row, 2/3/4 Column Grid, Images, Procedural Step Flowchart, Checklist, CTA, FAQ, Custom HTML)
 * - Real-time Live Preview with Desktop / Tablet / Mobile Viewport Switcher
 * - 1-Click Standalone HTML Code Generator matching DUTAMIK.ID standard
 * - Download .html file & Save Drafts in LocalStorage
 * - One-Click Git Commit to GitHub Repository
 */

// Global State
let postBuilderState = {
  meta: {
    title: "Layanan Pendampingan Teknis & Gambar PBG SIMBG",
    subtitle: "Penyusunan gambar kerja arsitektur DED 2D & 3D lengkap berstandar teknis SIMBG PUPR untuk kemudahan perizinan bangunan Anda.",
    category: "jasa",
    targetFolder: "jasa",
    slug: "gambar-pbg-simbg-lengkap",
    badgeText: "Standar SIMBG PUPR",
    badgeColor: "emerald",
    price: "Rp 350.000",
    priceNote: "Paket DED Lengkap",
    ctaType: "whatsapp", // 'whatsapp' | 'paysheet' | 'link'
    ctaLabel: "Konsultasi & Ajukan Order",
    ctaTarget: "https://wa.me/6281234567890",
    metaDesc: "Layanan penyusunan gambar PBG SIMBG PUPR lengkap, terverifikasi, dan bergaransi teknis dari Duta Media Informasi berKarya."
  },
  blocks: [
    {
      id: "b_hero",
      type: "hero",
      title: "Gambar Kerja PBG SIMBG PUPR Lengkap & Bergaransi",
      leadText: "Kami mendampingi proses penyusunan berkas teknis arsitektur hingga terbit persetujuan resmi SIMBG dengan standar ketelitian tinggi.",
      bgStyle: "gradient-blue",
      badgeText: "Verifikasi Cepat & Tepat",
      ctaPrimaryText: "Konsultasi Gratis via WhatsApp",
      ctaPrimaryLink: "#kontak",
      ctaSecondaryText: "Lihat Bagan Prosedur",
      ctaSecondaryLink: "#prosedur"
    },
    {
      id: "b_image_grid_3",
      type: "image_grid_3",
      sectionTitle: "Galeri Output Desain & Gambar Kerja",
      sectionSubtitle: "Contoh hasil pengerjaan gambar teknis berstandar dokumen DED arsitektur.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
          title: "Desain Fasad 3D Fotorealistik",
          caption: "Visualisasi 3 dimensi eksterior resolusi tinggi untuk kelengkapan berkas."
        },
        {
          url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80",
          title: "Gambar Kerja Denah & Tata Ruang 2D",
          caption: "Denah arsitektur detail dengan notasi ukuran dan fungsi ruang presisi."
        },
        {
          url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
          title: "Potongan Struktur & Denah MEP",
          caption: "Rencana instalasi sanitasi air, kelistrikan, dan struktur pondasi aman."
        }
      ]
    },
    {
      id: "b_procedural_steps",
      type: "procedural_steps",
      sectionTitle: "Bagan Prosedur & Tahapan Pengerjaan",
      sectionSubtitle: "Alur kerja transparan, terstruktur, dan terukur dari awal konsultasi hingga berkas terbit resmi.",
      steps: [
        {
          stepNumber: "01",
          title: "Konsultasi & Pengumpulan Dokumen",
          desc: "Diskusi kebutuhan desain, pengukuran lahan/bangunan, dan pengumpulan dokumen legalitas awal pemohon.",
          icon: "message-square"
        },
        {
          stepNumber: "02",
          title: "Penyusunan Gambar Kerja DED & 3D",
          desc: "Proses drafting gambar arsitektur 2D komplit, perhitungan struktur, dan render visualisasi 3D fasad.",
          icon: "drafting-compass"
        },
        {
          stepNumber: "03",
          title: "Review & Asistensi Revisi",
          desc: "Pengecekan bersama dengan pemohon secara interaktif untuk memastikan gambar sesuai keinginan sebelum diunggah ke SIMBG.",
          icon: "check-square"
        },
        {
          stepNumber: "04",
          title: "Serah Terima Berkas & Verifikasi",
          desc: "Penyerahan file gambar format PDF & DWG siap unggah, didampingi hingga lolos verifikasi dinas terkait.",
          icon: "award"
        }
      ]
    },
    {
      id: "b_full_width_highlight",
      type: "full_width_card",
      title: "Mengapa Memilih Layanan Pendampingan DUTAMIK.ID?",
      contentHtml: `<p class="mb-3">Setiap dokumen teknis yang kami susun mengacu pada pedoman standar <strong>Permen PUPR</strong> dan sistem perizinan terintegrasi <strong>SIMBG</strong>.</p><p>Anda tidak perlu khawatir dengan revisi berulang atau kendala administratif berkas yang tidak sesuai format standar perizinan daerah.</p>`,
      highlightBadge: "Jaminan Kualitas",
      bgColor: "dark-glass"
    },
    {
      id: "b_specs_checklist",
      type: "specs_checklist",
      sectionTitle: "Rincian Dokumen & Persyaratan",
      sectionSubtitle: "Kelengkapan berkas yang akan Anda dapatkan beserta syarat administrasi awal.",
      leftTitle: "Rincian Berkas yang Diterima",
      leftItems: [
        "Gambar Denah Arsitektur & Tata Ruang",
        "Gambar Tampak (Depan, Samping, Belakang)",
        "Gambar Potongan Melintang & Memanjang (A-A, B-B)",
        "Rencana Pondasi, Kolom & Struktur Atap",
        "Rencana Sanitasi, Air Bersih, Air Kotor & Resapan",
        "Rencana Kelistrikan & Titik Lampu",
        "3 View Gambar Render 3D Fasad HD",
        "Format Berkas DWG (AutoCAD) & Dokumen PDF Siap Cetak"
      ],
      rightTitle: "Syarat Awal Pemohon",
      rightItems: [
        "Salinan KTP & NPWP Pemohon / Pemilik Lahan",
        "Bukti Kepemilikan Tanah (SHM / Girik / Surat Perjanjian)",
        "Informasi Ukuran Dimensi Batas Tanah",
        "Rencana Penggunaan Bangunan (Rumah Tinggal / Usaha)"
      ]
    },
    {
      id: "b_faq",
      type: "faq",
      sectionTitle: "Pertanyaan yang Sering Diajukan (FAQ)",
      faqs: [
        {
          q: "Berapa lama estimasi waktu pengerjaan paket gambar PBG?",
          a: "Pengerjaan paket gambar kerja standar berkisar antara 3 hingga 7 hari kerja tergantung pada luas bangunan dan kelengkapan data awal."
        },
        {
          q: "Apakah disediakan garansi revisi jika ada catatan dari dinas verifikator?",
          a: "Ya, kami memberikan garansi pendampingan revisi teknis gambar sampai berkas diterima dan terverifikasi pada sistem SIMBG."
        },
        {
          q: "Bagaimana cara melakukan pembayaran dan pemesanan?",
          a: "Pemesanan dapat diajukan langsung melalui tombol konsultasi WhatsApp. Pembayaran fleksibel dapat menggunakan QRIS atau transfer bank resmi."
        }
      ]
    },
    {
      id: "b_cta_pricing",
      type: "cta_pricing",
      title: "Siap Mewujudkan Bangunan Berizin Resmi?",
      subtitle: "Hubungi tim konsultan kami sekarang untuk konsultasi awal gratis tanpa komitmen.",
      price: "Rp 350.000",
      normalPrice: "Rp 600.000",
      discountBadge: "Diskon 42%",
      ctaButtonText: "Konsultasikan via WhatsApp Sekarang",
      ctaButtonLink: "https://wa.me/6281234567890"
    }
  ]
};

// Available Block Definitions
const BLOCK_DEFINITIONS = {
  hero: {
    name: "Hero Header Banner",
    icon: "layout-top",
    description: "Bagian atas dengan judul besar, subjudul persuasif, badge, dan tombol aksi ganda."
  },
  image_grid_2: {
    name: "2 Kolom Gambar / Mockup",
    icon: "columns-2",
    description: "2 baris/kolom gambar berdampingan dengan bingkai dan takarir (caption)."
  },
  image_grid_3: {
    name: "3 Kolom Gambar / Kartu Visual",
    icon: "columns-3",
    description: "3 baris/kolom gambar atau kartu preview portofolio beresolusi tinggi."
  },
  procedural_steps: {
    name: "Bagan Prosedur Step-by-Step",
    icon: "git-commit",
    description: "Bagan alur tahapan kerja terstruktur berurutan (Step 1, Step 2, Step 3, Step 4)."
  },
  full_width_card: {
    name: "1 Jalur Penuh (Highlight Container)",
    icon: "maximize-2",
    description: "Kontainer selebar layar dengan aksen gradien/glassmorphism untuk pesan penting."
  },
  specs_checklist: {
    name: "2-Kolom: Checklist Fitur & Syarat",
    icon: "check-check",
    description: "Daftar rincian benefit (kolom kiri) dan syarat/spesifikasi (kolom kanan)."
  },
  faq: {
    name: "FAQ Accordion (Tanya Jawab)",
    icon: "help-circle",
    description: "Daftar pertanyaan dan jawaban interaktif yang dapat diperluas."
  },
  cta_pricing: {
    name: "Kotak Tarif & Tombol CTA Order",
    icon: "shopping-cart",
    description: "Blok harga, rincian diskon, dan tombol order WhatsApp / PaySheet QRIS."
  },
  custom_html: {
    name: "Custom HTML / Bebas Tanpa Batas",
    icon: "code",
    description: "Sisipkan kode HTML, iframe, tabel, atau komponen bebas apa saja."
  }
};

/**
 * Initialize Post Builder Interface
 */
function initPostGenerator() {
  renderMetaControls();
  renderBlockEditors();
  updateLivePreview();
}

/**
 * Render Metadata Form Controls
 */
function renderMetaControls() {
  const titleInput = document.getElementById('gen-meta-title');
  const slugInput = document.getElementById('gen-meta-slug');
  const catSelect = document.getElementById('gen-meta-category');
  const folderSelect = document.getElementById('gen-meta-folder');
  const badgeTextInput = document.getElementById('gen-meta-badge-text');
  const badgeColorSelect = document.getElementById('gen-meta-badge-color');
  const priceInput = document.getElementById('gen-meta-price');
  const ctaTypeSelect = document.getElementById('gen-meta-cta-type');
  const metaDescInput = document.getElementById('gen-meta-desc');

  if (titleInput) titleInput.value = postBuilderState.meta.title;
  if (slugInput) slugInput.value = postBuilderState.meta.slug;
  if (catSelect) catSelect.value = postBuilderState.meta.category;
  if (folderSelect) folderSelect.value = postBuilderState.meta.targetFolder;
  if (badgeTextInput) badgeTextInput.value = postBuilderState.meta.badgeText;
  if (badgeColorSelect) badgeColorSelect.value = postBuilderState.meta.badgeColor;
  if (priceInput) priceInput.value = postBuilderState.meta.price;
  if (ctaTypeSelect) ctaTypeSelect.value = postBuilderState.meta.ctaType;
  if (metaDescInput) metaDescInput.value = postBuilderState.meta.metaDesc;
}

/**
 * Auto-generate slug from title
 */
function handleTitleChange(val) {
  postBuilderState.meta.title = val;
  const slug = val.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  postBuilderState.meta.slug = slug;
  const slugInput = document.getElementById('gen-meta-slug');
  if (slugInput) slugInput.value = slug;
  
  updateLivePreview();
}

function handleMetaChange(field, val) {
  postBuilderState.meta[field] = val;
  updateLivePreview();
}

/**
 * Render Block Editors List in Left Pane
 */
function renderBlockEditors() {
  const container = document.getElementById('generator-blocks-list');
  if (!container) return;

  if (postBuilderState.blocks.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center border-2 border-dashed border-slate-700 rounded-3xl text-slate-500">
        <i data-lucide="layers" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
        <p class="text-xs font-semibold">Belum ada blok konten. Klik tombol "Tambah Blok Baru" di bawah.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = postBuilderState.blocks.map((block, idx) => {
    const def = BLOCK_DEFINITIONS[block.type] || { name: block.type, icon: 'box' };
    return `
      <div class="p-4 rounded-2xl bg-dark-900 border border-slate-800 space-y-3 transition-all hover:border-slate-700" id="block-editor-${block.id}">
        
        <!-- Block Header & Reorder Controls -->
        <div class="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">${idx + 1}</span>
            <i data-lucide="${def.icon}" class="w-4 h-4 text-slate-400"></i>
            <span class="font-bold text-xs text-white">${def.name}</span>
          </div>
          
          <div class="flex items-center gap-1">
            <button onclick="moveBlock(${idx}, -1)" title="Pindah Ke Atas" class="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition ${idx === 0 ? 'opacity-30 cursor-not-allowed' : ''}">
              <i data-lucide="arrow-up" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="moveBlock(${idx}, 1)" title="Pindah Ke Bawah" class="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition ${idx === postBuilderState.blocks.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}">
              <i data-lucide="arrow-down" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="duplicateBlock(${idx})" title="Duplikasi Blok" class="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="removeBlock(${idx})" title="Hapus Blok" class="p-1 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <!-- Block Specific Inputs -->
        <div class="space-y-2 text-xs">
          ${renderBlockFormFields(block, idx)}
        </div>

      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

/**
 * Render Dynamic Form Fields for Each Block Type
 */
function renderBlockFormFields(block, idx) {
  if (block.type === 'hero') {
    return `
      <div>
        <label class="block text-[11px] text-slate-400 mb-0.5">Judul Utama Hero:</label>
        <input type="text" value="${escapeHtml(block.title || '')}" oninput="updateBlockField(${idx}, 'title', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
      </div>
      <div>
        <label class="block text-[11px] text-slate-400 mb-0.5">Subjudul / Paragraf:</label>
        <textarea rows="2" oninput="updateBlockField(${idx}, 'leadText', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white">${escapeHtml(block.leadText || '')}</textarea>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[11px] text-slate-400 mb-0.5">Teks Badge Hero:</label>
          <input type="text" value="${escapeHtml(block.badgeText || '')}" oninput="updateBlockField(${idx}, 'badgeText', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-0.5">Tema Warna Banner:</label>
          <select onchange="updateBlockField(${idx}, 'bgStyle', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white">
            <option value="gradient-blue" ${block.bgStyle === 'gradient-blue' ? 'selected' : ''}>Biru Gradien Modern</option>
            <option value="gradient-purple" ${block.bgStyle === 'gradient-purple' ? 'selected' : ''}>Ungu Gradien Elegan</option>
            <option value="gradient-emerald" ${block.bgStyle === 'gradient-emerald' ? 'selected' : ''}>Hijau Emerald Segar</option>
            <option value="dark-glass" ${block.bgStyle === 'dark-glass' ? 'selected' : ''}>Dark Glass Transparan</option>
          </select>
        </div>
      </div>
    `;
  }

  if (block.type === 'image_grid_2' || block.type === 'image_grid_3') {
    const images = block.images || [];
    return `
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[11px] text-slate-400 mb-0.5">Judul Seksi:</label>
          <input type="text" value="${escapeHtml(block.sectionTitle || '')}" oninput="updateBlockField(${idx}, 'sectionTitle', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-0.5">Sub-keterangan:</label>
          <input type="text" value="${escapeHtml(block.sectionSubtitle || '')}" oninput="updateBlockField(${idx}, 'sectionSubtitle', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
        </div>
      </div>
      <div class="space-y-2 pt-1">
        <label class="block text-[11px] font-bold text-slate-300">Daftar Gambar (${images.length} item):</label>
        ${images.map((img, imgIdx) => `
          <div class="p-2 rounded-xl bg-dark-950 border border-slate-800 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-blue-400">Gambar #${imgIdx + 1}</span>
              <button onclick="removeImageFromGrid(${idx}, ${imgIdx})" class="text-[10px] text-rose-400 hover:underline">Hapus</button>
            </div>
            <input type="text" placeholder="URL Gambar (https://... atau ../assets/images/...)" value="${escapeHtml(img.url || '')}" oninput="updateImageField(${idx}, ${imgIdx}, 'url', this.value)" class="w-full px-2 py-1 rounded bg-dark-900 border border-slate-700 text-white text-[11px]" />
            <input type="text" placeholder="Judul Gambar" value="${escapeHtml(img.title || '')}" oninput="updateImageField(${idx}, ${imgIdx}, 'title', this.value)" class="w-full px-2 py-1 rounded bg-dark-900 border border-slate-700 text-white text-[11px]" />
            <input type="text" placeholder="Keterangan / Caption" value="${escapeHtml(img.caption || '')}" oninput="updateImageField(${idx}, ${imgIdx}, 'caption', this.value)" class="w-full px-2 py-1 rounded bg-dark-900 border border-slate-700 text-white text-[11px]" />
          </div>
        `).join('')}
        <button onclick="addImageToGrid(${idx})" class="w-full py-1.5 rounded-lg border border-dashed border-slate-700 text-blue-400 hover:bg-blue-500/10 text-[11px] font-semibold transition">
          + Tambah Gambar
        </button>
      </div>
    `;
  }

  if (block.type === 'procedural_steps') {
    const steps = block.steps || [];
    return `
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[11px] text-slate-400 mb-0.5">Judul Seksi Bagan:</label>
          <input type="text" value="${escapeHtml(block.sectionTitle || '')}" oninput="updateBlockField(${idx}, 'sectionTitle', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-0.5">Sub-keterangan Bagan:</label>
          <input type="text" value="${escapeHtml(block.sectionSubtitle || '')}" oninput="updateBlockField(${idx}, 'sectionSubtitle', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
        </div>
      </div>
      <div class="space-y-2 pt-1">
        <label class="block text-[11px] font-bold text-slate-300">Tahapan Prosedur (${steps.length} Langkah):</label>
        ${steps.map((st, sIdx) => `
          <div class="p-2.5 rounded-xl bg-dark-950 border border-slate-800 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-emerald-400">Step ${st.stepNumber || (sIdx + 1)}</span>
              <button onclick="removeStepItem(${idx}, ${sIdx})" class="text-[10px] text-rose-400 hover:underline">Hapus Step</button>
            </div>
            <div class="grid grid-cols-4 gap-1.5">
              <input type="text" placeholder="No (01)" value="${escapeHtml(st.stepNumber || '')}" oninput="updateStepField(${idx}, ${sIdx}, 'stepNumber', this.value)" class="px-2 py-1 rounded bg-dark-900 border border-slate-700 text-white text-[11px] text-center" />
              <input type="text" placeholder="Nama Step" value="${escapeHtml(st.title || '')}" oninput="updateStepField(${idx}, ${sIdx}, 'title', this.value)" class="col-span-3 px-2 py-1 rounded bg-dark-900 border border-slate-700 text-white text-[11px]" />
            </div>
            <textarea rows="2" placeholder="Penjelasan tahapan detail..." oninput="updateStepField(${idx}, ${sIdx}, 'desc', this.value)" class="w-full px-2 py-1 rounded bg-dark-900 border border-slate-700 text-white text-[11px]">${escapeHtml(st.desc || '')}</textarea>
          </div>
        `).join('')}
        <button onclick="addStepItem(${idx})" class="w-full py-1.5 rounded-lg border border-dashed border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-[11px] font-semibold transition">
          + Tambah Langkah Prosedur
        </button>
      </div>
    `;
  }

  if (block.type === 'full_width_card') {
    return `
      <div>
        <label class="block text-[11px] text-slate-400 mb-0.5">Judul Highlight:</label>
        <input type="text" value="${escapeHtml(block.title || '')}" oninput="updateBlockField(${idx}, 'title', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
      </div>
      <div>
        <label class="block text-[11px] text-slate-400 mb-0.5">Teks Badge:</label>
        <input type="text" value="${escapeHtml(block.highlightBadge || '')}" oninput="updateBlockField(${idx}, 'highlightBadge', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
      </div>
      <div>
        <label class="block text-[11px] text-slate-400 mb-0.5">Isi Konten (HTML / Teks Bebas):</label>
        <textarea rows="4" oninput="updateBlockField(${idx}, 'contentHtml', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white font-mono text-[11px]">${escapeHtml(block.contentHtml || '')}</textarea>
      </div>
    `;
  }

  if (block.type === 'specs_checklist') {
    return `
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[11px] text-slate-400 mb-0.5">Judul Kolom Kiri (Benefit):</label>
          <input type="text" value="${escapeHtml(block.leftTitle || '')}" oninput="updateBlockField(${idx}, 'leftTitle', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
          <label class="block text-[10px] text-slate-500 mt-1">Item Kiri (1 baris = 1 item):</label>
          <textarea rows="4" oninput="updateListField(${idx}, 'leftItems', this.value)" class="w-full px-2 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white text-[11px]">${(block.leftItems || []).join('\n')}</textarea>
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-0.5">Judul Kolom Kanan (Syarat):</label>
          <input type="text" value="${escapeHtml(block.rightTitle || '')}" oninput="updateBlockField(${idx}, 'rightTitle', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
          <label class="block text-[10px] text-slate-500 mt-1">Item Kanan (1 baris = 1 item):</label>
          <textarea rows="4" oninput="updateListField(${idx}, 'rightItems', this.value)" class="w-full px-2 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white text-[11px]">${(block.rightItems || []).join('\n')}</textarea>
        </div>
      </div>
    `;
  }

  if (block.type === 'faq') {
    const faqs = block.faqs || [];
    return `
      <div>
        <label class="block text-[11px] text-slate-400 mb-0.5">Judul Seksi FAQ:</label>
        <input type="text" value="${escapeHtml(block.sectionTitle || '')}" oninput="updateBlockField(${idx}, 'sectionTitle', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
      </div>
      <div class="space-y-2 pt-1">
        ${faqs.map((f, fIdx) => `
          <div class="p-2 rounded-xl bg-dark-950 border border-slate-800 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-amber-400">Tanya Jawab #${fIdx + 1}</span>
              <button onclick="removeFaqItem(${idx}, ${fIdx})" class="text-[10px] text-rose-400 hover:underline">Hapus</button>
            </div>
            <input type="text" placeholder="Pertanyaan..." value="${escapeHtml(f.q || '')}" oninput="updateFaqField(${idx}, ${fIdx}, 'q', this.value)" class="w-full px-2 py-1 rounded bg-dark-900 border border-slate-700 text-white text-[11px]" />
            <textarea rows="2" placeholder="Jawaban..." oninput="updateFaqField(${idx}, ${fIdx}, 'a', this.value)" class="w-full px-2 py-1 rounded bg-dark-900 border border-slate-700 text-white text-[11px]">${escapeHtml(f.a || '')}</textarea>
          </div>
        `).join('')}
        <button onclick="addFaqItem(${idx})" class="w-full py-1.5 rounded-lg border border-dashed border-amber-500/40 text-amber-400 hover:bg-amber-500/10 text-[11px] font-semibold transition">
          + Tambah Pertanyaan FAQ
        </button>
      </div>
    `;
  }

  if (block.type === 'cta_pricing') {
    return `
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[11px] text-slate-400 mb-0.5">Judul CTA:</label>
          <input type="text" value="${escapeHtml(block.title || '')}" oninput="updateBlockField(${idx}, 'title', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-0.5">Subjudul:</label>
          <input type="text" value="${escapeHtml(block.subtitle || '')}" oninput="updateBlockField(${idx}, 'subtitle', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="block text-[11px] text-slate-400 mb-0.5">Harga Promo:</label>
          <input type="text" value="${escapeHtml(block.price || '')}" oninput="updateBlockField(${idx}, 'price', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-0.5">Harga Normal:</label>
          <input type="text" value="${escapeHtml(block.normalPrice || '')}" oninput="updateBlockField(${idx}, 'normalPrice', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-0.5">Badge Diskon:</label>
          <input type="text" value="${escapeHtml(block.discountBadge || '')}" oninput="updateBlockField(${idx}, 'discountBadge', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[11px] text-slate-400 mb-0.5">Teks Tombol Aksi:</label>
          <input type="text" value="${escapeHtml(block.ctaButtonText || '')}" oninput="updateBlockField(${idx}, 'ctaButtonText', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-0.5">Target Link / WA:</label>
          <input type="text" value="${escapeHtml(block.ctaButtonLink || '')}" oninput="updateBlockField(${idx}, 'ctaButtonLink', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white" />
        </div>
      </div>
    `;
  }

  if (block.type === 'custom_html') {
    return `
      <div>
        <label class="block text-[11px] text-slate-400 mb-0.5">Kode HTML Kustom (Komponen Bebas Tanpa Batas):</label>
        <textarea rows="6" oninput="updateBlockField(${idx}, 'htmlCode', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white font-mono text-[11px]">${escapeHtml(block.htmlCode || '<div class="glass-panel p-6 rounded-3xl text-center"><h3 class="font-bold text-lg text-white">Komponen Kustom</h3><p class="text-xs text-slate-400 mt-2">Sisipkan struktur HTML apa pun di sini.</p></div>')}</textarea>
      </div>
    `;
  }

  return '';
}

/**
 * Block Mutation Handlers
 */
function updateBlockField(blockIdx, field, val) {
  if (postBuilderState.blocks[blockIdx]) {
    postBuilderState.blocks[blockIdx][field] = val;
    updateLivePreview();
  }
}

function updateListField(blockIdx, field, rawText) {
  if (postBuilderState.blocks[blockIdx]) {
    postBuilderState.blocks[blockIdx][field] = rawText.split('\n').map(s => s.trim()).filter(Boolean);
    updateLivePreview();
  }
}

function updateImageField(blockIdx, imgIdx, field, val) {
  if (postBuilderState.blocks[blockIdx] && postBuilderState.blocks[blockIdx].images[imgIdx]) {
    postBuilderState.blocks[blockIdx].images[imgIdx][field] = val;
    updateLivePreview();
  }
}

function addImageToGrid(blockIdx) {
  if (postBuilderState.blocks[blockIdx]) {
    if (!postBuilderState.blocks[blockIdx].images) postBuilderState.blocks[blockIdx].images = [];
    postBuilderState.blocks[blockIdx].images.push({
      url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
      title: "Judul Gambar Baru",
      caption: "Keterangan deskripsi gambar."
    });
    renderBlockEditors();
    updateLivePreview();
  }
}

function removeImageFromGrid(blockIdx, imgIdx) {
  if (postBuilderState.blocks[blockIdx] && postBuilderState.blocks[blockIdx].images) {
    postBuilderState.blocks[blockIdx].images.splice(imgIdx, 1);
    renderBlockEditors();
    updateLivePreview();
  }
}

function updateStepField(blockIdx, sIdx, field, val) {
  if (postBuilderState.blocks[blockIdx] && postBuilderState.blocks[blockIdx].steps[sIdx]) {
    postBuilderState.blocks[blockIdx].steps[sIdx][field] = val;
    updateLivePreview();
  }
}

function addStepItem(blockIdx) {
  if (postBuilderState.blocks[blockIdx]) {
    if (!postBuilderState.blocks[blockIdx].steps) postBuilderState.blocks[blockIdx].steps = [];
    const num = (postBuilderState.blocks[blockIdx].steps.length + 1).toString().padStart(2, '0');
    postBuilderState.blocks[blockIdx].steps.push({
      stepNumber: num,
      title: "Tahapan Pekerjaan Baru",
      desc: "Rincian prosedur yang dilakukan pada tahapan ini.",
      icon: "check-circle"
    });
    renderBlockEditors();
    updateLivePreview();
  }
}

function removeStepItem(blockIdx, sIdx) {
  if (postBuilderState.blocks[blockIdx] && postBuilderState.blocks[blockIdx].steps) {
    postBuilderState.blocks[blockIdx].steps.splice(sIdx, 1);
    renderBlockEditors();
    updateLivePreview();
  }
}

function updateFaqField(blockIdx, fIdx, field, val) {
  if (postBuilderState.blocks[blockIdx] && postBuilderState.blocks[blockIdx].faqs[fIdx]) {
    postBuilderState.blocks[blockIdx].faqs[fIdx][field] = val;
    updateLivePreview();
  }
}

function addFaqItem(blockIdx) {
  if (postBuilderState.blocks[blockIdx]) {
    if (!postBuilderState.blocks[blockIdx].faqs) postBuilderState.blocks[blockIdx].faqs = [];
    postBuilderState.blocks[blockIdx].faqs.push({
      q: "Pertanyaan baru seputar layanan?",
      a: "Penjelasan jawaban rinci dan solutif untuk membantu pemohon."
    });
    renderBlockEditors();
    updateLivePreview();
  }
}

function moveBlock(idx, direction) {
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= postBuilderState.blocks.length) return;
  const item = postBuilderState.blocks.splice(idx, 1)[0];
  postBuilderState.blocks.splice(targetIdx, 0, item);
  renderBlockEditors();
  updateLivePreview();
}

function duplicateBlock(idx) {
  const clone = JSON.parse(JSON.stringify(postBuilderState.blocks[idx]));
  clone.id = 'b_' + Date.now().toString(36);
  postBuilderState.blocks.splice(idx + 1, 0, clone);
  renderBlockEditors();
  updateLivePreview();
}

function removeBlock(idx) {
  if (confirm('Hapus blok konten ini?')) {
    postBuilderState.blocks.splice(idx, 1);
    renderBlockEditors();
    updateLivePreview();
  }
}

function openAddBlockModal() {
  const modal = document.getElementById('modal-add-block-picker');
  if (modal) modal.classList.remove('hidden'), modal.classList.add('flex');
}

function insertNewBlock(type) {
  const id = 'b_' + Date.now().toString(36);
  let newBlock = { id, type };

  if (type === 'hero') {
    newBlock.title = postBuilderState.meta.title || "Judul Halaman Hero";
    newBlock.leadText = postBuilderState.meta.subtitle || "Deskripsi pengantar layanan atau produk unggulan.";
    newBlock.bgStyle = "gradient-blue";
    newBlock.badgeText = "Layanan Unggulan";
    newBlock.ctaPrimaryText = "Konsultasi Sekarang";
    newBlock.ctaPrimaryLink = "#order";
  } else if (type === 'image_grid_2') {
    newBlock.sectionTitle = "Preview Hasil & Portofolio";
    newBlock.sectionSubtitle = "Visualisasi 2 kolom gambar beresolusi tinggi.";
    newBlock.images = [
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80", title: "Tampak Depan HD", caption: "Visualisasi eksterior modern." },
      { url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80", title: "Denah Tata Ruang", caption: "Gambar kerja arsitektur 2D." }
    ];
  } else if (type === 'image_grid_3') {
    newBlock.sectionTitle = "Galeri Portofolio & Desain";
    newBlock.sectionSubtitle = "Pilihan visual 3 kolom rapi dan interaktif.";
    newBlock.images = [
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80", title: "View 1", caption: "Render 3D Fasad." },
      { url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80", title: "View 2", caption: "Denah Rinci." },
      { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80", title: "View 3", caption: "Struktur Fondasi." }
    ];
  } else if (type === 'procedural_steps') {
    newBlock.sectionTitle = "Alur Kerja & Prosedur Layanan";
    newBlock.sectionSubtitle = "Tahapan transparan dan sistematis hingga berkas selesai.";
    newBlock.steps = [
      { stepNumber: "01", title: "Konsultasi Kebutuhan", desc: "Diskusi awal dan penyerahan data.", icon: "message-square" },
      { stepNumber: "02", title: "Pengerjaan Dokumen", desc: "Proses drafting teknis.", icon: "drafting-compass" },
      { stepNumber: "03", title: "Review & Asistensi", desc: "Pemeriksaan bersama sebelum final.", icon: "check-circle" },
      { stepNumber: "04", title: "Serah Terima Berkas", desc: "Penerbitan file siap pakai.", icon: "award" }
    ];
  } else if (type === 'full_width_card') {
    newBlock.title = "Keunggulan Standar Layanan Kami";
    newBlock.highlightBadge = "Standar Resmi";
    newBlock.contentHtml = "<p>Layanan didukung tenaga berpengalaman dengan garansi pendampingan tuntas.</p>";
  } else if (type === 'specs_checklist') {
    newBlock.leftTitle = "Benefit & Dokumen Diterima";
    newBlock.leftItems = ["Item Benefit 1", "Item Benefit 2", "Item Benefit 3"];
    newBlock.rightTitle = "Syarat & Ketentuan";
    newBlock.rightItems = ["Syarat Administrasi 1", "Syarat Administrasi 2"];
  } else if (type === 'faq') {
    newBlock.sectionTitle = "Pertanyaan Umum (FAQ)";
    newBlock.faqs = [
      { q: "Berapa lama proses pengerjaannya?", a: "Pengerjaan memakan waktu 3-7 hari kerja." }
    ];
  } else if (type === 'cta_pricing') {
    newBlock.title = "Mulai Pemesanan Hari Ini";
    newBlock.subtitle = "Hubungi kami via WhatsApp untuk respon cepat.";
    newBlock.price = postBuilderState.meta.price || "Rp 150.000";
    newBlock.normalPrice = "Rp 300.000";
    newBlock.discountBadge = "Hemat 50%";
    newBlock.ctaButtonText = "Hubungi Kami via WhatsApp";
    newBlock.ctaButtonLink = "https://wa.me/6281234567890";
  } else if (type === 'custom_html') {
    newBlock.htmlCode = `<div class="glass-panel p-8 rounded-3xl text-center glow-card"><h3 class="font-extrabold text-xl text-white">Komponen Konten Bebas</h3><p class="text-xs text-slate-400 mt-2">Didesain dengan standar UI DUTAMIK.ID yang soft dan elegan.</p></div>`;
  }

  postBuilderState.blocks.push(newBlock);
  closeModal('modal-add-block-picker');
  renderBlockEditors();
  updateLivePreview();
}

/**
 * Generate Real-time Preview HTML Body
 */
function generateBlocksHtmlMarkup(isForStandaloneExport = false) {
  const assetPrefix = isForStandaloneExport 
    ? (postBuilderState.meta.targetFolder === 'root' ? 'assets/' : '../assets/')
    : '../assets/';

  return postBuilderState.blocks.map(block => {
    
    // 1. HERO HEADER
    if (block.type === 'hero') {
      return `
        <!-- BLOCK: HERO HEADER -->
        <section class="relative rounded-3xl overflow-hidden glass-panel p-6 sm:p-10 lg:p-12 border border-slate-700/60 shadow-2xl mb-8">
          <div class="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
          <div class="relative z-10 max-w-3xl space-y-4">
            ${block.badgeText ? `<div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold bg-blue-500/15 text-blue-400 border border-blue-500/30 uppercase tracking-wider">${escapeHtml(block.badgeText)}</div>` : ''}
            <h1 class="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">${escapeHtml(block.title || '')}</h1>
            <p class="text-slate-300 text-xs sm:text-base leading-relaxed">${escapeHtml(block.leadText || '')}</p>
            <div class="pt-2 flex flex-wrap gap-3">
              ${block.ctaPrimaryText ? `<a href="${escapeHtml(block.ctaPrimaryLink || '#')}" class="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-xl transition transform active:scale-95 flex items-center gap-2"><span>${escapeHtml(block.ctaPrimaryText)}</span> &rarr;</a>` : ''}
              ${block.ctaSecondaryText ? `<a href="${escapeHtml(block.ctaSecondaryLink || '#')}" class="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition">${escapeHtml(block.ctaSecondaryText)}</a>` : ''}
            </div>
          </div>
        </section>
      `;
    }

    // 2. 2-COLUMN IMAGE GRID
    if (block.type === 'image_grid_2') {
      const images = block.images || [];
      return `
        <!-- BLOCK: 2-COLUMN IMAGE GRID -->
        <section class="space-y-5 mb-8">
          ${block.sectionTitle ? `
            <div class="text-center max-w-2xl mx-auto space-y-1">
              <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">${escapeHtml(block.sectionTitle)}</h2>
              ${block.sectionSubtitle ? `<p class="text-xs sm:text-sm text-slate-400">${escapeHtml(block.sectionSubtitle)}</p>` : ''}
            </div>
          ` : ''}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            ${images.map(img => `
              <div class="glass-panel rounded-3xl overflow-hidden glow-card border border-slate-800 flex flex-col justify-between">
                <div class="aspect-[16/9] w-full overflow-hidden bg-slate-900">
                  <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.title || 'Gambar')}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
                </div>
                <div class="p-5 space-y-1 bg-slate-900/60 border-t border-slate-800">
                  <h3 class="font-bold text-sm sm:text-base text-white">${escapeHtml(img.title || '')}</h3>
                  <p class="text-xs text-slate-400 leading-relaxed">${escapeHtml(img.caption || '')}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }

    // 3. 3-COLUMN IMAGE GRID
    if (block.type === 'image_grid_3') {
      const images = block.images || [];
      return `
        <!-- BLOCK: 3-COLUMN IMAGE GRID -->
        <section class="space-y-5 mb-8">
          ${block.sectionTitle ? `
            <div class="text-center max-w-2xl mx-auto space-y-1">
              <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">${escapeHtml(block.sectionTitle)}</h2>
              ${block.sectionSubtitle ? `<p class="text-xs sm:text-sm text-slate-400">${escapeHtml(block.sectionSubtitle)}</p>` : ''}
            </div>
          ` : ''}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            ${images.map(img => `
              <div class="glass-panel rounded-3xl overflow-hidden glow-card border border-slate-800 flex flex-col justify-between">
                <div class="aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.title || 'Gambar')}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
                </div>
                <div class="p-4 sm:p-5 space-y-1 bg-slate-900/60 border-t border-slate-800">
                  <h3 class="font-bold text-sm sm:text-base text-white">${escapeHtml(img.title || '')}</h3>
                  <p class="text-xs text-slate-400 leading-relaxed line-clamp-2">${escapeHtml(img.caption || '')}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }

    // 4. PROCEDURAL STEP-BY-STEP FLOWCHART
    if (block.type === 'procedural_steps') {
      const steps = block.steps || [];
      return `
        <!-- BLOCK: PROCEDURAL STEP-BY-STEP FLOWCHART -->
        <section class="space-y-5 mb-8" id="prosedur">
          ${block.sectionTitle ? `
            <div class="text-center max-w-2xl mx-auto space-y-1.5">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                <i data-lucide="git-commit" class="w-3.5 h-3.5"></i>
                <span>Alur Kerja Prosedural</span>
              </div>
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">${escapeHtml(block.sectionTitle)}</h2>
              ${block.sectionSubtitle ? `<p class="text-xs sm:text-sm text-slate-400">${escapeHtml(block.sectionSubtitle)}</p>` : ''}
            </div>
          ` : ''}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${steps.map((st, sIdx) => `
              <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800/90 glow-card relative flex flex-col justify-between hover:border-emerald-500/40 transition">
                <div>
                  <div class="flex items-center justify-between mb-3.5">
                    <span class="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 font-mono font-black text-xs">Tahap ${escapeHtml(st.stepNumber || ('0' + (sIdx + 1)))}</span>
                    <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <i data-lucide="check-circle-2" class="w-4 h-4"></i>
                    </div>
                  </div>
                  <h3 class="font-bold text-sm sm:text-base text-white leading-snug mb-1.5">${escapeHtml(st.title || '')}</h3>
                  <p class="text-xs text-slate-400 leading-relaxed">${escapeHtml(st.desc || '')}</p>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-semibold text-emerald-400 flex items-center justify-between">
                  <span>Tahap ${sIdx + 1} Beres</span>
                  <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }

    // 5. 1 JALUR PENUH (FULL WIDTH HIGHLIGHT CARD)
    if (block.type === 'full_width_card') {
      return `
        <!-- BLOCK: 1 JALUR PENUH (FULL-WIDTH HIGHLIGHT) -->
        <section class="glass-panel rounded-3xl p-6 sm:p-8 lg:p-10 border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-indigo-950/40 glow-card mb-8 shadow-2xl relative overflow-hidden">
          <div class="relative z-10 space-y-3">
            ${block.highlightBadge ? `<span class="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">${escapeHtml(block.highlightBadge)}</span>` : ''}
            <h2 class="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-snug">${escapeHtml(block.title || '')}</h2>
            <div class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl space-y-2">
              ${block.contentHtml || ''}
            </div>
          </div>
        </section>
      `;
    }

    // 6. 2-COLUMN SPECS & CHECKLIST
    if (block.type === 'specs_checklist') {
      const leftItems = block.leftItems || [];
      const rightItems = block.rightItems || [];
      return `
        <!-- BLOCK: 2-COLUMN SPECS & CHECKLIST -->
        <section class="space-y-5 mb-8">
          ${block.sectionTitle ? `
            <div class="text-center max-w-2xl mx-auto space-y-1">
              <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">${escapeHtml(block.sectionTitle)}</h2>
              ${block.sectionSubtitle ? `<p class="text-xs sm:text-sm text-slate-400">${escapeHtml(block.sectionSubtitle)}</p>` : ''}
            </div>
          ` : ''}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <!-- Left: What You Get -->
            <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-3 glow-card">
              <div class="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
                <div class="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                  <i data-lucide="package-check" class="w-4 h-4"></i>
                </div>
                <h3 class="font-extrabold text-sm sm:text-base text-white">${escapeHtml(block.leftTitle || 'Yang Anda Dapatkan')}</h3>
              </div>
              <ul class="space-y-2 text-xs text-slate-300">
                ${leftItems.map(item => `
                  <li class="flex items-start gap-2">
                    <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5"></i>
                    <span>${escapeHtml(item)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
            
            <!-- Right: Requirements -->
            <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-3 glow-card">
              <div class="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
                <div class="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                  <i data-lucide="file-text" class="w-4 h-4"></i>
                </div>
                <h3 class="font-extrabold text-sm sm:text-base text-white">${escapeHtml(block.rightTitle || 'Syarat & Dokumen Awal')}</h3>
              </div>
              <ul class="space-y-2 text-xs text-slate-300">
                ${rightItems.map(item => `
                  <li class="flex items-start gap-2">
                    <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5"></i>
                    <span>${escapeHtml(item)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        </section>
      `;
    }

    // 7. FAQ ACCORDION
    if (block.type === 'faq') {
      const faqs = block.faqs || [];
      return `
        <!-- BLOCK: FAQ ACCORDION -->
        <section class="space-y-5 mb-8 max-w-3xl mx-auto">
          ${block.sectionTitle ? `
            <div class="text-center space-y-1">
              <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">${escapeHtml(block.sectionTitle)}</h2>
              <p class="text-xs sm:text-sm text-slate-400">Jawaban atas hal-hal yang sering ditanyakan seputar layanan ini.</p>
            </div>
          ` : ''}
          <div class="space-y-2.5">
            ${faqs.map((f, fIdx) => `
              <details class="glass-panel rounded-2xl border border-slate-800/80 p-4 transition group">
                <summary class="font-bold text-xs sm:text-sm text-white cursor-pointer list-none flex justify-between items-center select-none">
                  <span>${escapeHtml(f.q || '')}</span>
                  <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform"></i>
                </summary>
                <div class="pt-2.5 mt-2 border-t border-slate-800/60 text-xs text-slate-300 leading-relaxed">
                  ${escapeHtml(f.a || '')}
                </div>
              </details>
            `).join('')}
          </div>
        </section>
      `;
    }

    // 8. CTA & PRICING
    if (block.type === 'cta_pricing') {
      return `
        <!-- BLOCK: CTA & PRICING -->
        <section class="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-700 glow-card text-center space-y-5 mb-8 shadow-2xl" id="kontak">
          <div class="max-w-xl mx-auto space-y-1.5">
            <h2 class="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">${escapeHtml(block.title || 'Mulai Konsultasi')}</h2>
            <p class="text-xs sm:text-sm text-slate-400">${escapeHtml(block.subtitle || '')}</p>
          </div>
          
          <div class="inline-flex items-baseline gap-3 p-3.5 rounded-2xl bg-dark-900 border border-slate-800">
            ${block.normalPrice ? `<span class="text-xs sm:text-sm text-slate-400 line-through">${escapeHtml(block.normalPrice)}</span>` : ''}
            <span class="text-2xl sm:text-4xl font-black text-white">${escapeHtml(block.price || 'Rp 0')}</span>
            ${block.discountBadge ? `<span class="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">${escapeHtml(block.discountBadge)}</span>` : ''}
          </div>

          <div>
            <a href="${escapeHtml(block.ctaButtonLink || '#')}" class="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-xl transition transform active:scale-95">
              <i data-lucide="message-circle" class="w-4 h-4 sm:w-5 sm:h-5"></i>
              <span>${escapeHtml(block.ctaButtonText || 'Ajukan Konsultasi Sekarang')}</span>
            </a>
          </div>
        </section>
      `;
    }

    // 9. CUSTOM HTML
    if (block.type === 'custom_html') {
      return `
        <!-- BLOCK: CUSTOM HTML -->
        <section class="mb-8">
          ${block.htmlCode || ''}
        </section>
      `;
    }

    return '';
  }).join('\n');
}

/**
 * Generate Preview Document HTML for iFrame Viewport
 */
function generatePreviewDocumentHtml() {
  const meta = postBuilderState.meta;
  const blocksHtml = generateBlocksHtmlMarkup(false);

  return `<!DOCTYPE html>
<html lang="id" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0284c7', 600: '#2563eb', 700: '#1d4ed8', 900: '#0f172a' }
          }
        }
      }
    }
  </script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #030712;
      color: #f8fafc;
      margin: 0;
      padding: 1.25rem;
      box-sizing: border-box;
    }
    .glass-panel {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(51, 65, 85, 0.4);
    }
    .glow-card {
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .glow-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(96, 165, 250, 0.25);
    }
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #0b1120;
    }
    ::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 4px;
    }
  </style>
</head>
<body class="space-y-6 antialiased">
  ${blocksHtml}
  <script>lucide.createIcons();</script>
</body>
</html>`;
}

/**
 * Update Live Preview Pane via True Viewport iFrame
 */
function updateLivePreview() {
  const iframe = document.getElementById('preview-live-iframe');
  if (!iframe) return;

  const fullHtml = generatePreviewDocumentHtml();
  iframe.srcdoc = fullHtml;
}

/**
 * Device Switcher for Preview Frame
 */
function switchPreviewDevice(device) {
  const iframe = document.getElementById('preview-live-iframe');
  const btnDesk = document.getElementById('btn-prev-desk');
  const btnTab = document.getElementById('btn-prev-tab');
  const btnMob = document.getElementById('btn-prev-mob');

  [btnDesk, btnTab, btnMob].forEach(b => {
    if (b) {
      b.classList.remove('bg-blue-600', 'text-white');
      b.classList.add('text-slate-400');
    }
  });

  if (!iframe) return;

  if (device === 'desktop') {
    iframe.style.width = '100%';
    if (btnDesk) {
      btnDesk.classList.add('bg-blue-600', 'text-white');
      btnDesk.classList.remove('text-slate-400');
    }
  } else if (device === 'tablet') {
    iframe.style.width = '768px';
    if (btnTab) {
      btnTab.classList.add('bg-blue-600', 'text-white');
      btnTab.classList.remove('text-slate-400');
    }
  } else if (device === 'mobile') {
    iframe.style.width = '390px';
    if (btnMob) {
      btnMob.classList.add('bg-blue-600', 'text-white');
      btnMob.classList.remove('text-slate-400');
    }
  }
}

/**
 * Generate Complete Standalone HTML Document
 */
function generateCompleteHtmlDocument() {
  const meta = postBuilderState.meta;
  const isSubfolder = meta.targetFolder !== 'root';
  const prefix = isSubfolder ? '../' : '';
  const blocksHtml = generateBlocksHtmlMarkup(true);

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.title)} - DUTAMIK.ID</title>
  <meta name="description" content="${escapeHtml(meta.metaDesc)}" />
  
  <meta property="og:title" content="${escapeHtml(meta.title)} - DUTAMIK.ID" />
  <meta property="og:description" content="${escapeHtml(meta.metaDesc)}" />
  <meta property="og:image" content="https://dutamik.id/assets/images/og-image.jpg" />
  <link rel="icon" type="image/svg+xml" href="${prefix}assets/images/logo.svg" />

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0284c7', 600: '#2563eb', 700: '#1d4ed8', 900: '#0f172a' }
          }
        }
      }
    }
  </script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="stylesheet" href="${prefix}assets/css/style.css" />
</head>
<body class="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white">

  <!-- NAVBAR -->
  <header class="navbar-sticky sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 sm:h-20">
        <a href="${prefix}index.html" class="flex items-center gap-2">
          <img src="${prefix}assets/images/logo.svg" alt="DUTAMIK.ID" class="h-8 sm:h-10 w-auto" />
        </a>
        <nav class="hidden md:flex items-center gap-6 text-xs font-bold text-slate-700 dark:text-slate-200">
          <a href="${prefix}index.html" class="hover:text-blue-600 transition">Beranda</a>
          <a href="${prefix}katalog.html" class="hover:text-blue-600 transition">Master Katalog</a>
          <a href="${prefix}tools/" class="hover:text-blue-600 transition">Tool Gratis</a>
          <a href="${prefix}jasa/" class="hover:text-blue-600 transition">Layanan Jasa</a>
          <a href="${prefix}produk/" class="hover:text-blue-600 transition">Produk Digital</a>
          <a href="${prefix}about.html" class="hover:text-blue-600 transition">Tentang Kami</a>
        </nav>
        <div class="flex items-center gap-2">
          <a href="${meta.ctaTarget || 'https://wa.me/6281234567890'}" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5">
            <i data-lucide="message-circle" class="w-4 h-4"></i>
            <span>${escapeHtml(meta.ctaLabel || 'Konsultasi')}</span>
          </a>
        </div>
      </div>
    </div>
  </header>

  <!-- BREADCRUMBS -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
    <nav class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      <a href="${prefix}index.html" class="hover:text-blue-600">Beranda</a>
      <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
      <a href="${prefix}${meta.targetFolder}/" class="hover:text-blue-600 capitalize">${meta.targetFolder}</a>
      <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
      <span class="text-slate-800 dark:text-slate-200 font-bold truncate max-w-xs">${escapeHtml(meta.title)}</span>
    </nav>
  </div>

  <!-- MAIN POST CONTENT -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
${blocksHtml}
  </main>

  <!-- FOOTER -->
  <footer class="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="space-y-3">
          <a href="${prefix}index.html" class="inline-block">
            <img src="${prefix}assets/images/logo.svg" alt="DUTAMIK.ID" class="h-9 w-auto brightness-200" />
          </a>
          <p class="text-xs text-slate-400 leading-relaxed">
            <strong class="text-slate-200 font-bold">Duta Media Informasi berKarya</strong> menghadirkan solusi teknologi digital terpadu, akses tool online gratis, dan layanan pendampingan profesional untuk kemajuan usaha Anda.
          </p>
        </div>
        <div>
          <h4 class="text-white font-bold text-xs uppercase tracking-wider mb-3.5">Halaman Legal</h4>
          <ul class="space-y-2 text-xs">
            <li><a href="${prefix}about.html" class="hover:text-white transition">Tentang Kami</a></li>
            <li><a href="${prefix}privacy-policy.html" class="hover:text-white transition">Kebijakan Privasi</a></li>
            <li><a href="${prefix}terms-of-service.html" class="hover:text-white transition">Syarat &amp; Ketentuan</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-bold text-xs uppercase tracking-wider mb-3.5">Klasifikasi Layanan</h4>
          <ul class="space-y-2 text-xs">
            <li><a href="${prefix}tools/" class="hover:text-white transition">Tool Online Gratis</a></li>
            <li><a href="${prefix}jasa/" class="hover:text-white transition">Layanan Jasa &amp; PBG</a></li>
            <li><a href="${prefix}produk/" class="hover:text-white transition">Produk Digital Mandiri</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-bold text-xs uppercase tracking-wider mb-3.5">Dukungan Komunitas</h4>
          <a href="${prefix}donasi.html" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl text-xs font-bold transition shadow-lg">
            <i data-lucide="heart" class="w-3.5 h-3.5 fill-white"></i>
            <span>Wall of Kontributor</span>
          </a>
        </div>
      </div>
      <div class="mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>&copy; 2026 <a href="https://dutamik.id" class="text-blue-400 font-bold hover:underline">Duta Media Informasi berKarya</a> (DUTAMIK.ID). Seluruh Hak Cipta Dilindungi.</p>
      </div>
    </div>
  </footer>

  <script src="${prefix}assets/js/catalog-data.js"></script>
  <script src="${prefix}assets/js/main.js"></script>
  <script src="${prefix}assets/js/analytics.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      if (window.lucide) lucide.createIcons();
    });
  </script>
</body>
</html>`;
}

/**
 * Copy HTML Code to Clipboard
 */
function copyGeneratedHtml() {
  const fullHtml = generateCompleteHtmlDocument();
  navigator.clipboard.writeText(fullHtml).then(() => {
    alert('Kode HTML lengkap berhasil disalin ke clipboard! Siap disimpan sebagai file .html.');
  }).catch(err => {
    console.error('Copy failed:', err);
    alert('Gagal menyalin otomatis. Anda dapat mengunduh file langsung.');
  });
}

/**
 * Download Standalone .html File
 */
function downloadGeneratedHtmlFile() {
  const fullHtml = generateCompleteHtmlDocument();
  const slug = postBuilderState.meta.slug || 'halaman-baru';
  const filename = `${slug}.html`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Save / Load Draft Templates
 */
function saveDraftTemplate() {
  localStorage.setItem('dutamik_generator_draft', JSON.stringify(postBuilderState));
  alert('Draft tata letak berhasil disimpan secara lokal!');
}

function loadDraftTemplate() {
  const saved = localStorage.getItem('dutamik_generator_draft');
  if (!saved) {
    alert('Tidak ada draft tersimpan.');
    return;
  }
  try {
    postBuilderState = JSON.parse(saved);
    renderMetaControls();
    renderBlockEditors();
    updateLivePreview();
    alert('Draft tata letak berhasil dimuat!');
  } catch (e) {
    alert('Format draft rusak.');
  }
}

/**
 * Load Presets
 */
function loadPresetTemplate(type) {
  if (!confirm('Terapkan preset ini? Blok yang belum disimpan akan digantikan.')) return;

  if (type === 'jasa_prosedural') {
    postBuilderState.meta.title = "Layanan Desain Arsitektur & Gambar PBG SIMBG";
    postBuilderState.meta.category = "jasa";
    postBuilderState.meta.targetFolder = "jasa";
    postBuilderState.meta.slug = "gambar-pbg-simbg-lengkap";
    postBuilderState.meta.badgeText = "Standar SIMBG PUPR";
    postBuilderState.meta.price = "Rp 350.000";
    postBuilderState.blocks = [
      { id: "b1", type: "hero", title: "Gambar Kerja PBG SIMBG PUPR Lengkap & Bergaransi", leadText: "Kami mendampingi proses penyusunan berkas teknis arsitektur hingga terbit persetujuan resmi SIMBG.", badgeText: "Verifikasi Cepat & Tepat" },
      { id: "b2", type: "image_grid_3", sectionTitle: "Galeri Output Desain & Gambar Kerja", sectionSubtitle: "Dokumen teknis DED arsitektur komplit.", images: [
        { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80", title: "Fasad 3D Fotorealistik", caption: "Render eksterior HD." },
        { url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80", title: "Denah 2D", caption: "Denah tata ruang lengkap." },
        { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80", title: "Potongan & MEP", caption: "Struktur dan instalasi air/listrik." }
      ]},
      { id: "b3", type: "procedural_steps", sectionTitle: "Bagan Prosedur & Tahapan Pengerjaan", sectionSubtitle: "Alur kerja transparan dan terukur.", steps: [
        { stepNumber: "01", title: "Konsultasi & Pengumpulan Dokumen", desc: "Diskusi kebutuhan desain dan pengukuran batas lahan." },
        { stepNumber: "02", title: "Penyusunan Gambar Kerja & 3D", desc: "Proses drafting arsitektur 2D dan visualisasi 3D." },
        { stepNumber: "03", title: "Review & Asistensi Revisi", desc: "Pengecekan bersama pemohon sebelum finalisasi." },
        { stepNumber: "04", title: "Serah Terima Berkas & Verifikasi", desc: "Penerbitan file PDF & DWG bergaransi verifikasi." }
      ]},
      { id: "b4", type: "full_width_card", title: "Garansi Pendampingan Sampai Terbit", highlightBadge: "Kualitas Terjamin", contentHtml: "<p>Kami mendampingi setiap tahapan revisi teknis verifikator hingga berkas disetujui resmi.</p>" },
      { id: "b5", type: "specs_checklist", sectionTitle: "Rincian Dokumen & Syarat", leftTitle: "Berkas yang Diterima", leftItems: ["Denah Arsitektur", "Tampak 4 Sisi", "Potongan Struktur", "Rencana Sanitasi & MEP", "Render 3D Fasad HD"], rightTitle: "Syarat Awal Pemohon", rightItems: ["KTP/NPWP Pemohon", "Bukti Hak Tanah", "Ukuran Dimensi Lahan"] },
      { id: "b6", type: "cta_pricing", title: "Konsultasikan Kebutuhan Bangunan Anda", subtitle: "Respon cepat via WhatsApp langsung dengan konsultan kami.", price: "Rp 350.000", normalPrice: "Rp 600.000", discountBadge: "Hemat 42%" }
    ];
  } else if (type === 'produk_digital') {
    postBuilderState.meta.title = "Aplikasi Kasir POS Google Sheet Otomatis";
    postBuilderState.meta.category = "produk";
    postBuilderState.meta.targetFolder = "produk";
    postBuilderState.meta.slug = "pos-sheet-otomatis";
    postBuilderState.meta.badgeText = "Tanpa Biaya Bulanan";
    postBuilderState.meta.price = "Rp 75.000";
    postBuilderState.blocks = [
      { id: "b1", type: "hero", title: "Aplikasi Kasir Spreadsheet Otomatis & Praktis", leadText: "Solusi kasir digital tanpa biaya langganan bulanan. Cetak nota struk, pantau stok, dan laporan laba rugi otomatis.", badgeText: "Solusi Kasir UMKM" },
      { id: "b2", type: "image_grid_2", sectionTitle: "Preview Tampilan Dashboard & Nota", sectionSubtitle: "Antarmuka bersih, cepat, dan mudah digunakan.", images: [
        { url: "https://images.unsplash.com/photo-1556742049-0a67c55c5df3?w=800&auto=format&fit=crop&q=80", title: "Dashboard Transaksi POS", caption: "Form kasir responsif barcode scanner." },
        { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80", title: "Laporan Keuangan Otomatis", caption: "Grafik omset dan profit real-time." }
      ]},
      { id: "b3", type: "full_width_card", title: "100% Milik Anda Seumur Hidup", highlightBadge: "Sekali Bayar", contentHtml: "<p>Tidak ada biaya per bulan atau batasan jumlah transaksi. Sistem berjalan di Google Drive pribadi Anda dengan aman.</p>" },
      { id: "b4", type: "specs_checklist", sectionTitle: "Fitur Unggulan & Kompatibilitas", leftTitle: "Fitur Aplikasi Kasir", leftItems: ["Database Produk Tak Terbatas", "Cetak Nota Thermal Bluetooth & USB", "Scan Barcode Cepat", "Laporan Penjualan Harian/Bulanan", "Perhitungan Laba Bersih Otomatis"], rightTitle: "Kompatibilitas Perangkat", rightItems: ["Laptop & PC (Windows/Mac)", "Smartphone Android & iPhone", "Tablet & iPad", "Printer Kasir 58mm & 80mm"] },
      { id: "b5", type: "cta_pricing", title: "Dapatkan Akses Penuh Sekarang", subtitle: "Unduh file template instan setelah verifikasi QRIS PaySheet.", price: "Rp 75.000", normalPrice: "Rp 250.000", discountBadge: "Hemat 70%" }
    ];
  } else if (type === 'custom_freeform') {
    postBuilderState.meta.title = "Studi Kasus & Portofolio Khusus";
    postBuilderState.meta.category = "portfolio";
    postBuilderState.meta.targetFolder = "jasa";
    postBuilderState.meta.slug = "portofolio-proyek-khusus";
    postBuilderState.blocks = [
      { id: "b1", type: "hero", title: "Portofolio Proyek Transformasi Digital", leadText: "Dokumentasi pengerjaan solusi teknis kustom terintegrasi.", badgeText: "Studi Kasus" },
      { id: "b2", type: "image_grid_3", sectionTitle: "Dokumentasi Visual Hasil Pengerjaan", images: [
        { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80", title: "Tahap 1", caption: "Analisis Arsitektur Sistem." },
        { url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80", title: "Tahap 2", caption: "Implementasi & Pengujian." },
        { url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80", title: "Tahap 3", caption: "Pelatihan & Serah Terima." }
      ]},
      { id: "b3", type: "full_width_card", title: "Ringkasan Pencapaian & Metrik", highlightBadge: "Hasil Terukur", contentHtml: "<p>Efisiensi operasional meningkat hingga 65% dengan pemangkasan alur manual yang digantikan sistem otomatis.</p>" }
    ];
  }

  renderMetaControls();
  renderBlockEditors();
  updateLivePreview();
}

/**
 * Helper: Escape HTML
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

// Auto Initialize if DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('generator-blocks-list')) initPostGenerator();
  });
} else {
  if (document.getElementById('generator-blocks-list')) initPostGenerator();
}
