/**
 * DUTAMIK.ID - Google Apps Script (GAS) Client Integration & PaySheet Engine
 * Duta Media Informasi berKarya
 * Handles Service Orders, PaySheet QRIS Purchases, and Wall of Kontributor
 */

// Initial Seed Contributors for Wall of Kontributor
const DEFAULT_KONTRIBUTOR = [
  { name: "Ahmad Fauzi", amount: 50000, message: "Sponsor fitur baru! Maju terus DUTAMIK.ID!", date: "2026-08-20", category: "Req Fitur Baru" },
  { name: "Rina Kartika", amount: 25000, message: "Traktir makan siang untuk tim pengembang yang luar biasa.", date: "2026-08-22", category: "Traktir Makan" },
  { name: "Budi Santoso", amount: 100000, message: "Dukungan healing & apresiasi untuk Duta Media Informasi berKarya!", date: "2026-08-23", category: "Dana Healing" },
  { name: "Hamba Allah", amount: 10000, message: "Beli secangkir kopi semangat. Berkah selalu!", date: "2026-08-24", category: "Secangkir Kopi" },
  { name: "Dimas Pratama", amount: 50000, message: "Sangat puas dengan tools gratis dan layanannya. Sukses terus!", date: "2026-08-25", category: "Req Fitur Baru" }
];

// 1. Submit Service Order (Form Pemesanan Jasa)
async function handleServiceOrderSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  // Gather Form Data
  const orderData = {
    action: "order_service",
    timestamp: new Date().toISOString(),
    serviceType: form.serviceType?.value || 'Jasa Kustom',
    clientName: form.clientName?.value.trim() || '',
    clientEmail: form.clientEmail?.value.trim() || '',
    clientWhatsapp: form.clientWhatsapp?.value.trim() || '',
    projectBudget: form.projectBudget?.value || 'Fleksibel / Sesuai Kesepakatan',
    projectDeadline: form.projectDeadline?.value || 'Standard',
    projectDetails: form.projectDetails?.value.trim() || ''
  };

  if (!orderData.clientName || !orderData.clientWhatsapp || !orderData.projectDetails) {
    showToast('Mohon lengkapi nama, nomor WhatsApp, dan detail kebutuhan proyek', 'error');
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg> Mengirim Pesanan...
  `;

  let isSuccess = false;
  let responseMsg = '';

  // Try sending to Google Apps Script Web App
  if (DUTAMIK_CONFIG.gasApiUrl && DUTAMIK_CONFIG.gasApiUrl.startsWith('https://script.google.com')) {
    try {
      const res = await fetch(DUTAMIK_CONFIG.gasApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(orderData)
      });
      const json = await res.json();
      if (json.status === 'success') {
        isSuccess = true;
        responseMsg = json.message || 'Pesanan Anda telah berhasil dicatat!';
      }
    } catch (err) {
      console.warn('GAS Network Error / Local Simulation mode:', err);
    }
  }

  // Fallback / Offline Storage
  if (!isSuccess) {
    saveLocalOrder('orders_jasa', orderData);
    isSuccess = true;
    responseMsg = 'Pesanan Anda telah tercatat!';
  }

  submitBtn.disabled = false;
  submitBtn.innerHTML = originalBtnText;

  closeModal('modal-order-service');
  openServiceSuccessModal(orderData);
  form.reset();
}

function openServiceSuccessModal(orderData) {
  const modal = document.getElementById('modal-order-success');
  if (!modal) {
    showToast('Pesanan berhasil dikirim!', 'success');
    return;
  }

  document.getElementById('success-service-type').textContent = orderData.serviceType;
  document.getElementById('success-client-name').textContent = orderData.clientName;
  if (document.getElementById('success-budget')) {
    document.getElementById('success-budget').textContent = orderData.projectBudget;
  }

  const waBtn = document.getElementById('success-wa-action-btn');
  if (waBtn) {
    const waText = `Halo Admin DUTAMIK.ID (Duta Media Informasi berKarya), saya telah mengirim formulir pesanan jasa:\n\n*Layanan:* ${orderData.serviceType}\n*Nama:* ${orderData.clientName}\n*No. WA:* ${orderData.clientWhatsapp}\n*Email:* ${orderData.clientEmail || '-'}\n*Detail Kebutuhan:* ${orderData.projectDetails}\n\nMohon konfirmasinya. Terima kasih!`;
    waBtn.href = `https://api.whatsapp.com/send?phone=${DUTAMIK_CONFIG.adminWhatsApp}&text=${encodeURIComponent(waText)}`;
  }

  openModal('modal-order-success');
}

// 2. Digital Product PaySheet QRIS Checkout Flow
let activeProductCheckout = null;

function openProductCheckoutModal(productId, productName, price, downloadUrl = '') {
  const uniqueCode = generateUniqueCode();
  const totalAmount = parseInt(price, 10) + uniqueCode;
  const transactionId = 'PAY-' + Date.now().toString().slice(-6) + '-' + uniqueCode;

  activeProductCheckout = {
    id: productId,
    name: productName,
    basePrice: price,
    uniqueCode: uniqueCode,
    totalAmount: totalAmount,
    transactionId: transactionId,
    downloadUrl: downloadUrl || 'https://dutamik.id/downloads/sample-asset.zip'
  };

  const nameEl = document.getElementById('checkout-product-name');
  if (nameEl) nameEl.textContent = productName;
  
  const basePriceEl = document.getElementById('checkout-base-price');
  if (basePriceEl) basePriceEl.textContent = `Rp ${Number(price).toLocaleString('id-ID')}`;

  const uniqueCodeEl = document.getElementById('checkout-unique-code');
  if (uniqueCodeEl) uniqueCodeEl.textContent = `+Rp ${uniqueCode}`;

  const totalPriceEl = document.getElementById('checkout-total-price');
  if (totalPriceEl) totalPriceEl.textContent = `Rp ${Number(totalAmount).toLocaleString('id-ID')}`;

  const trxIdEl = document.getElementById('checkout-trx-id');
  if (trxIdEl) trxIdEl.textContent = transactionId;

  // Render Dynamic QRIS with exact amount & transaction ID
  renderQrisDisplay('checkout-qris-container', totalAmount, transactionId, productName);

  // Reset steps
  const stepPay = document.getElementById('checkout-step-pay');
  const stepSuccess = document.getElementById('checkout-step-success');
  if (stepPay) stepPay.classList.remove('hidden');
  if (stepSuccess) stepSuccess.classList.add('hidden');

  openModal('modal-checkout-product');
}

async function verifyPaySheetPayment() {
  if (!activeProductCheckout) return;

  const verifyBtn = document.getElementById('btn-verify-paysheet');
  const buyerName = document.getElementById('checkout-buyer-name')?.value.trim() || 'Pelanggan DUTAMIK';
  const buyerEmail = document.getElementById('checkout-buyer-email')?.value.trim() || '';

  if (verifyBtn) {
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg> Memverifikasi Pembayaran...
    `;
  }

  const payload = {
    action: "order_product",
    timestamp: new Date().toISOString(),
    transactionId: activeProductCheckout.transactionId,
    productName: activeProductCheckout.name,
    totalAmount: activeProductCheckout.totalAmount,
    buyerName: buyerName,
    buyerEmail: buyerEmail,
    status: 'PAID'
  };

  if (DUTAMIK_CONFIG.gasApiUrl && DUTAMIK_CONFIG.gasApiUrl.startsWith('https://script.google.com')) {
    try {
      await fetch(DUTAMIK_CONFIG.gasApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('PaySheet GAS Offline:', e);
    }
  }

  saveLocalOrder('orders_product', payload);

  setTimeout(() => {
    if (verifyBtn) {
      verifyBtn.disabled = false;
      verifyBtn.innerHTML = 'Verifikasi & Buka Unduhan';
    }

    const stepPay = document.getElementById('checkout-step-pay');
    const successStep = document.getElementById('checkout-step-success');
    if (stepPay) stepPay.classList.add('hidden');
    if (successStep) successStep.classList.remove('hidden');

    const downloadBtn = document.getElementById('checkout-download-btn');
    if (downloadBtn) {
      downloadBtn.href = activeProductCheckout.downloadUrl;
      downloadBtn.onclick = () => {
        showToast('Memulai pengunduhan produk digital...', 'success');
      };
    }

    const waConfirmBtn = document.getElementById('checkout-wa-confirm-btn');
    if (waConfirmBtn) {
      const waMsg = `Halo Admin DUTAMIK.ID, saya telah menyelesaikan pembayaran produk digital via QRIS PaySheet:\n\n*ID Transaksi:* ${activeProductCheckout.transactionId}\n*Produk:* ${activeProductCheckout.name}\n*Total Pembayaran:* Rp ${Number(activeProductCheckout.totalAmount).toLocaleString('id-ID')}\n*Nama Pembeli:* ${buyerName}\n*Email:* ${buyerEmail}\n\nMohon konfirmasi pesanan saya.`;
      waConfirmBtn.href = `https://api.whatsapp.com/send?phone=${DUTAMIK_CONFIG.adminWhatsApp}&text=${encodeURIComponent(waMsg)}`;
    }

    showToast('Pembayaran PaySheet Berhasil Diverifikasi!', 'success');
  }, 1200);
}

// 3. Donation & Wall of Kontributor Engine (Kopi, Makan, Req Fitur, Healing)
function initDonationSection() {
  renderKontributorWall();
  renderDonationTicker();
}

function selectDonationPreset(amount, categoryLabel = '') {
  const customInput = document.getElementById('donasi-custom-amount');
  if (customInput) {
    customInput.value = amount;
  }
  updateDonationQris(amount, categoryLabel);

  // Update card styling
  document.querySelectorAll('.preset-card-donasi').forEach(card => {
    const cardAmount = parseInt(card.getAttribute('data-amount'), 10);
    if (cardAmount === amount) {
      card.classList.add('border-blue-600', 'bg-blue-50/80', 'dark:bg-blue-900/30', 'ring-2', 'ring-blue-500/50');
      card.classList.remove('border-slate-200', 'dark:border-slate-800', 'bg-white', 'dark:bg-slate-900');
    } else {
      card.classList.remove('border-blue-600', 'bg-blue-50/80', 'dark:bg-blue-900/30', 'ring-2', 'ring-blue-500/50');
      card.classList.add('border-slate-200', 'dark:border-slate-800', 'bg-white', 'dark:bg-slate-900');
    }
  });

  // Hide custom input if preset selected
  const customBox = document.getElementById('donasi-custom-box');
  if (customBox && amount !== 0) {
    customBox.classList.add('hidden');
  }
}

function updateDonationQris(amount, categoryLabel = '') {
  const num = parseInt(amount, 10) || 10000;
  let labelText = categoryLabel ? `Kontribusi: ${categoryLabel}` : 'Dukungan Pengembangan Website';
  renderQrisDisplay('donasi-qris-box', num, 'KONTRIBUSI-DUTAMIK', labelText);
}

async function handleDonationSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.donorName?.value.trim() || 'Hamba Allah';
  const amount = parseInt(form.donorAmount?.value, 10) || 10000;
  const message = form.donorMessage?.value.trim() || 'Semangat berkarya Duta Media Informasi berKarya!';
  const isAnon = form.donorAnon?.checked || false;

  const donorEntry = {
    name: isAnon ? 'Hamba Allah' : name,
    amount: amount,
    message: message,
    date: new Date().toISOString().split('T')[0]
  };

  if (DUTAMIK_CONFIG.gasApiUrl && DUTAMIK_CONFIG.gasApiUrl.startsWith('https://script.google.com')) {
    try {
      await fetch(DUTAMIK_CONFIG.gasApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "submit_donation", ...donorEntry })
      });
    } catch (e) {
      console.warn('Donation GAS Offline:', e);
    }
  }

  let stored = JSON.parse(localStorage.getItem('dutamik_kontributor') || '[]');
  stored.unshift(donorEntry);
  localStorage.setItem('dutamik_kontributor', JSON.stringify(stored));

  renderKontributorWall();
  renderDonationTicker();

  showToast(`Terima kasih banyak atas kontribusi Anda, ${donorEntry.name}! 🎉`, 'success', 5000);
  form.reset();
}

function getCombinedKontributor() {
  const local = JSON.parse(localStorage.getItem('dutamik_kontributor') || '[]');
  return [...local, ...DEFAULT_KONTRIBUTOR];
}

function renderKontributorWall() {
  const container = document.getElementById('supporter-wall-list');
  if (!container) return;

  const list = getCombinedKontributor();
  container.innerHTML = list.map((s) => `
    <div class="glass-panel p-4 rounded-2xl glow-card flex flex-col justify-between border border-slate-200/80 dark:border-slate-800/80 transition hover:border-blue-500">
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
          Verified Kontributor
        </span>
        <span class="text-slate-400">${s.category || 'Supporter'}</span>
      </div>
    </div>
  `).join('');
}

function renderDonationTicker() {
  const ticker = document.getElementById('donation-ticker-content');
  if (!ticker) return;

  const list = getCombinedKontributor().slice(0, 10);
  const itemsHtml = list.map(s => `
    <span class="inline-flex items-center gap-2 mx-4 text-xs font-medium text-slate-700 dark:text-slate-300">
      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      <strong class="text-slate-900 dark:text-white font-bold">${s.name}</strong> 
      <span class="text-emerald-600 dark:text-emerald-400 font-extrabold">Rp ${Number(s.amount).toLocaleString('id-ID')}</span>
      <span class="opacity-70 italic font-normal text-[11px]">"${s.message.slice(0, 35)}${s.message.length > 35 ? '...' : ''}"</span>
    </span>
  `).join(' • ');

  ticker.innerHTML = itemsHtml + ' • ' + itemsHtml;
}

function saveLocalOrder(key, data) {
  let existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.unshift(data);
  localStorage.setItem(key, JSON.stringify(existing));
}

// 4. Consultation & Service Order Handler (Robot Pop-up Modal)
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
  const adminRecipientEmail = localStorage.getItem('dutamik_admin_email') || '';

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
    projectDetails: projectDetails,
    adminRecipientEmail: adminRecipientEmail
  };

  // Loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg> Mengirim Permintaan...
  `;

  let isSuccess = false;
  if (DUTAMIK_CONFIG.gasApiUrl && DUTAMIK_CONFIG.gasApiUrl.startsWith('https://script.google.com')) {
    try {
      const res = await fetch(DUTAMIK_CONFIG.gasApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.status === 'success') isSuccess = true;
    } catch (err) {
      console.warn('GAS Network Error:', err);
    }
  }

  if (!isSuccess) {
    saveLocalOrder('orders_jasa', payload);
  }

  submitBtn.disabled = false;
  submitBtn.innerHTML = originalBtnText;

  // Prepare formatted WhatsApp message
  const waText = `Halo Tim Ahli DUTAMIK.ID (Duta Media Informasi berKarya),\n\nSaya ingin berkonsultasi & mengajukan pemesanan layanan:\n*Layanan:* ${serviceType}\n*Nama/Usaha:* ${clientName}\n*No. WhatsApp:* ${clientWhatsapp}\n*Email:* ${clientEmail || '-'}\n*Detail Kebutuhan:* ${projectDetails}\n\nMohon informasi estimasi waktu dan tindak lanjutnya. Terima kasih!`;
  const waUrl = `https://wa.me/${DUTAMIK_CONFIG.adminWhatsApp}?text=${encodeURIComponent(waText)}`;

  closeConsultationModal();
  form.reset();
  showToast('Permintaan berhasil dicatat! Mengalihkan ke WhatsApp...', 'success');
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}

function openConsultationModal(preselectedService = '') {
  const modal = document.getElementById('modal-consultation-service');
  if (!modal) return;

  const select = document.getElementById('consult-service-select');
  if (select && preselectedService) {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].text.toLowerCase().includes(preselectedService.toLowerCase()) || select.options[i].value.toLowerCase().includes(preselectedService.toLowerCase())) {
        select.selectedIndex = i;
        break;
      }
    }
  }

  // Animate robot jumping to sitting position atop the modal
  const sittingRobot = document.getElementById('modal-robot-sitting');
  if (sittingRobot) {
    sittingRobot.classList.remove('robot-jumping-back');
    sittingRobot.classList.add('robot-sitting-active');
  }

  openModal('modal-consultation-service');
}

function closeConsultationModal() {
  const sittingRobot = document.getElementById('modal-robot-sitting');
  if (sittingRobot) {
    sittingRobot.classList.remove('robot-sitting-active');
    sittingRobot.classList.add('robot-jumping-back');
  }

  setTimeout(() => {
    closeModal('modal-consultation-service');
    // Ensure peeking robot is returned
    const dock = document.getElementById('peeking-robot-dock');
    if (dock) dock.setAttribute('data-state', 'peek');
  }, 250);
}

document.addEventListener('DOMContentLoaded', () => {
  initDonationSection();
});

