/**
 * DUTAMIK.ID - Google Apps Script (GAS) Client & Wall of Contributor Sync
 * Duta Media Informasi berKarya
 */

// 1. MASTER SEED CONTRIBUTORS LIST (SHARED BY WALL OF CONTRIBUTOR & TICKER)
const DEFAULT_KONTRIBUTOR = [
  { name: "Bpk. Hendra S. (Surabaya)", amount: 50000, message: "Jasa Remote Laptop lancar & aman!", date: "2026-08-25", category: "Jasa Remote" },
  { name: "Ibu Rina Kartika (Bandung)", amount: 100000, message: "Gambar Kerja PBG lolos verifikasi SIMBG.", date: "2026-08-24", category: "Arsitektur PBG" },
  { name: "Mas Dimas Pratama (Jakarta)", amount: 75000, message: "Aplikasi POS Kasir Sheet sangat membantu toko!", date: "2026-08-23", category: "POS Kasir Sheet" },
  { name: "CV Berkah Mandiri (Semarang)", amount: 150000, message: "Peta SHP valid langsung lolos OSS RBA.", date: "2026-08-22", category: "Peta SHP OSS" },
  { name: "Kedai Kopi Bahagia (Yogyakarta)", amount: 50000, message: "PaySheet QRIS mantap tanpa potongan bulanan!", date: "2026-08-21", category: "PaySheet QRIS" },
  { name: "Sdr. Wahyu Hidayat (Malang)", amount: 25000, message: "Traktir secangkir kopi semangat tim pengembang.", date: "2026-08-20", category: "Traktir Kopi" },
  { name: "Bpk. Agus Santoso (Medan)", amount: 250000, message: "Website UMKM cepat & gratis hosting selamanya.", date: "2026-08-19", category: "Website UMKM" },
  { name: "Komunitas UMKM Maju (Bali)", amount: 100000, message: "Apresiasi perkakas online gratis DUTAMIK.", date: "2026-08-18", category: "Dukungan Komunitas" }
];

function getCombinedKontributor() {
  const local = JSON.parse(localStorage.getItem('dutamik_kontributor') || '[]');
  return [...local, ...DEFAULT_KONTRIBUTOR];
}

function renderKontributorWall() {
  const container = document.getElementById('supporter-wall-list');
  if (!container) return;

  const list = getCombinedKontributor();
  container.innerHTML = list.map((s) => `
    <div class="contributor-slide-card glass-panel p-4 rounded-2xl glow-card flex flex-col justify-between border border-slate-200/80 dark:border-slate-800/80 transition hover:border-blue-500 shadow-sm flex-shrink-0">
      <div>
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              ${s.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">${s.name}</h4>
              <span class="text-[10px] text-slate-400 font-mono">${s.date}</span>
            </div>
          </div>
          <span class="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Rp ${Number(s.amount).toLocaleString('id-ID')}
          </span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-300 italic mt-1 bg-slate-100/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
          "${s.message}"
        </p>
      </div>
      <div class="mt-3 flex items-center justify-between text-[10px] text-blue-600 dark:text-blue-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800/50">
        <span class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/></svg>
          Verified Contributor
        </span>
        <span class="text-slate-400">${s.category || 'Supporter'}</span>
      </div>
    </div>
  `).join('');
  if (typeof initSliderEngine === 'function') initSliderEngine();
}

function renderDonationTicker() {
  const ticker = document.getElementById('donation-ticker-content');
  if (!ticker) return;

  const list = getCombinedKontributor();
  const itemsHtml = list.map(s => `
    <span class="inline-flex items-center gap-2 mx-5 text-xs font-medium text-slate-700 dark:text-slate-300 flex-shrink-0">
      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      <strong class="text-slate-900 dark:text-white font-bold">${s.name}</strong> 
      <span class="text-emerald-600 dark:text-emerald-400 font-black">Rp ${Number(s.amount).toLocaleString('id-ID')}</span>
      <span class="text-slate-500 dark:text-slate-400 italic text-[11px]">"${s.message}"</span>
    </span>
  `).join(' • ');

  ticker.innerHTML = itemsHtml + ' • ' + itemsHtml;
}

// 2. Donation & QRIS Preset Selectors
function selectDonationPreset(amount, category) {
  const customBox = document.getElementById('donasi-custom-box');
  if (customBox) customBox.classList.add('hidden');

  const amountInput = document.getElementById('donasi-custom-amount');
  if (amountInput) amountInput.value = amount;

  document.querySelectorAll('.preset-card-donasi').forEach(btn => {
    btn.classList.remove('border-blue-600', 'bg-blue-50/80', 'dark:bg-blue-900/30', 'ring-2', 'ring-blue-500/50');
    btn.classList.add('border-slate-200', 'dark:border-slate-800', 'bg-white', 'dark:bg-slate-900');
  });

  const activeBtn = event?.currentTarget || document.querySelector(`.preset-card-donasi[data-amount="${amount}"]`);
  if (activeBtn) {
    activeBtn.classList.add('border-blue-600', 'bg-blue-50/80', 'dark:bg-blue-900/30', 'ring-2', 'ring-blue-500/50');
    activeBtn.classList.remove('border-slate-200', 'dark:border-slate-800', 'bg-white', 'dark:bg-slate-900');
  }

  updateDonationQris(amount, category);
}

function updateDonationQris(amount, label) {
  const container = document.getElementById('donasi-qris-box');
  if (!container) return;

  const numAmount = parseInt(amount, 10) || 10000;
  container.innerHTML = `
    <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
      <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">QRIS Dinamis Otomatis (${label})</div>
      <div class="w-44 h-44 mx-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center" id="qris-qr-render">
      </div>
      <div class="text-sm font-black text-slate-900 dark:text-white">Rp ${numAmount.toLocaleString('id-ID')}</div>
      <p class="text-[10px] text-slate-400">Scan via BCA, BRI, Mandiri, GoPay, OVO, Dana, ShopeePay</p>
    </div>
  `;

  const qrBox = document.getElementById('qris-qr-render');
  if (qrBox && window.QRCode) {
    qrBox.innerHTML = '';
    new QRCode(qrBox, {
      text: `00020101021126580014ID.LINKAJA.WWW0118936009990000000000520458125303360540${numAmount}.005802ID5910DUTAMIK_ID6013KAB_INDRAMAYU6304ABCD`,
      width: 160,
      height: 160,
      colorDark: "#020617",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

async function handleDonationSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const donorName = form.donorAnon?.checked ? 'Hamba Allah' : (form.donorName?.value.trim() || 'Sahabat DUTAMIK');
  const donorAmount = parseInt(form.donorAmount?.value, 10) || 10000;
  const donorMessage = form.donorMessage?.value.trim() || 'Apresiasi & dukungan untuk Duta Media Informasi berKarya!';
  
  const today = new Date().toISOString().split('T')[0];
  const newDonor = {
    name: donorName,
    amount: donorAmount,
    message: donorMessage,
    date: today,
    category: "Kontribusi QRIS"
  };

  const local = JSON.parse(localStorage.getItem('dutamik_kontributor') || '[]');
  local.unshift(newDonor);
  localStorage.setItem('dutamik_kontributor', JSON.stringify(local));

  renderKontributorWall();
  renderDonationTicker();
  showToast('Terima kasih banyak! Kontribusi Anda telah dicatat di Wall of Contributor.', 'success');
  form.reset();
}

// 3. Service Consultation Modal Choreography & Handlers
function openConsultationModal() {
  const modal = document.getElementById('modal-consultation-service');
  const dock = document.getElementById('peeking-robot-dock');
  const robotSitting = document.getElementById('modal-robot-sitting');
  const robotAvatar = document.getElementById('robot-sitting-avatar');

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    if (dock) dock.style.opacity = '0';

    if (robotSitting && robotAvatar) {
      robotSitting.classList.remove('hidden');
      robotAvatar.classList.remove('robot-airplane-return-active', 'robot-drone-curious', 'robot-smooth-nod');
      void robotAvatar.offsetWidth;
      robotAvatar.classList.add('robot-airplane-landing-active');
    }
  }
}

function closeConsultationModal() {
  const modal = document.getElementById('modal-consultation-service');
  const dock = document.getElementById('peeking-robot-dock');
  const robotSitting = document.getElementById('modal-robot-sitting');
  const robotAvatar = document.getElementById('robot-sitting-avatar');

  if (robotAvatar && robotSitting) {
    robotAvatar.classList.remove('robot-airplane-landing-active', 'robot-drone-curious', 'robot-smooth-nod');
    void robotAvatar.offsetWidth;
    robotAvatar.classList.add('robot-airplane-return-active');

    setTimeout(() => {
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
      }
      if (dock) {
        dock.style.opacity = '1';
        dock.classList.add('robot-peek-reappear');
        setTimeout(() => dock.classList.remove('robot-peek-reappear'), 600);
      }
    }, 450);
  } else {
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }
    if (dock) dock.style.opacity = '1';
  }
}

function handleDropdownFocus() {
  const robotAvatar = document.getElementById('robot-sitting-avatar');
  if (robotAvatar) {
    robotAvatar.classList.add('robot-drone-curious');
  }
}

function handleDropdownBlur() {
  const robotAvatar = document.getElementById('robot-sitting-avatar');
  if (robotAvatar) {
    robotAvatar.classList.remove('robot-drone-curious');
  }
}

function handleDropdownChange(selectEl) {
  const robotAvatar = document.getElementById('robot-sitting-avatar');
  if (robotAvatar) {
    robotAvatar.classList.remove('robot-drone-curious', 'robot-smooth-nod');
    void robotAvatar.offsetWidth;
    robotAvatar.classList.add('robot-smooth-nod');
    setTimeout(() => {
      robotAvatar.classList.remove('robot-smooth-nod');
    }, 700);
  }
}

async function handleConsultationSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  const clientName = form.clientName?.value.trim() || '';
  const clientWhatsapp = form.clientWhatsapp?.value.trim() || '';
  const clientEmail = form.clientEmail?.value.trim() || '';
  const serviceType = form.serviceType?.value || 'Konsultasi Layanan';
  const projectDetails = form.projectDetails?.value.trim() || '';

  if (!clientName || !clientWhatsapp || !projectDetails) {
    showToast('Mohon lengkapi Nama, No. WhatsApp, dan Detail Kebutuhan Anda', 'error');
    return;
  }

  const payload = {
    action: "submit_consultation",
    timestamp: new Date().toISOString(),
    serviceType: serviceType,
    clientName: clientName,
    clientWhatsapp: clientWhatsapp,
    clientEmail: clientEmail,
    projectDetails: projectDetails
  };

  submitBtn.disabled = true;
  submitBtn.innerHTML = `Mengirim Permintaan...`;

  const waText = `Halo Tim Ahli DUTAMIK.ID (Duta Media Informasi berKarya),\n\nSaya ingin berkonsultasi & mengajukan pemesanan layanan:\n*Layanan:* ${serviceType}\n*Nama/Usaha:* ${clientName}\n*No. WhatsApp:* ${clientWhatsapp}\n*Email:* ${clientEmail || '-'}\n*Detail Kebutuhan:* ${projectDetails}\n\nMohon informasi estimasi waktu dan tindak lanjutnya. Terima kasih!`;
  const waUrl = `https://wa.me/${DUTAMIK_CONFIG.adminWhatsApp}?text=${encodeURIComponent(waText)}`;

  closeConsultationModal();
  form.reset();
  showToast('Permintaan berhasil dicatat! Mengalihkan ke WhatsApp...', 'success');
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}

// Auto Initialize Contributor Wall & Ticker on Load
document.addEventListener('DOMContentLoaded', () => {
  renderDonationTicker();
  renderKontributorWall();
  if (document.getElementById('donasi-qris-box')) {
    updateDonationQris(10000, 'Ngopi Santai');
  }
});

if (document.readyState !== 'loading') {
  renderDonationTicker();
  renderKontributorWall();
}
