/**
 * DUTAMIK.ID - QRIS Dynamic Generator & PaySheet Utility
 * Generates valid EMVCo dynamic QRIS payloads with CRC16 calculation & nominal injection.
 */

const QRIS_CONFIG = {
  // Base QRIS payload (NMID / Merchant Account Information)
  // Ganti payload base ini dengan string QRIS Statis Anda jika ada
  defaultPayload: "00020101021126580016ID.CO.DUTAMIK.WWW01189360091800000000000215000000000000000051440014ID.LINKAJA.WWW02150000000000000005204581253033605802ID5910DUTAMIK ID6007JAKARTA61051234062070703A016304",
  merchantName: "DUTAMIK.ID DIGITAL",
  merchantCity: "INDONESIA"
};

// Calculate CRC16-CCITT (0xFFFF) for QRIS specification
function calculateCRC16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  let hex = (crc & 0xFFFF).toString(16).toUpperCase();
  while (hex.length < 4) {
    hex = "0" + hex;
  }
  return hex;
}

// Convert Static QRIS to Dynamic QRIS with exact amount
function generateDynamicQrisPayload(baseQris, amount) {
  let cleanQris = (baseQris || QRIS_CONFIG.defaultPayload).trim();
  
  // Strip existing CRC if present at the end (tag 6304XXXX)
  if (cleanQris.includes("6304")) {
    cleanQris = cleanQris.substring(0, cleanQris.indexOf("6304"));
  }

  // Tag 54: Transaction Amount
  // Format: 54 + 2-digit length + amount
  const strAmount = Math.round(amount).toString();
  const lenAmount = strAmount.length.toString().padStart(2, '0');
  const tag54 = `54${lenAmount}${strAmount}`;

  // Tag 58: Country Code (ID)
  // Tag 53: Currency Code (360 - IDR)
  // Ensure 010212 (Dynamic) instead of 010211 (Static) if Tag 01 exists
  cleanQris = cleanQris.replace("010211", "010212");

  // Remove existing Tag 54 if present
  cleanQris = cleanQris.replace(/54\d{2}\d+/, '');

  // Add Tag 54 before Tag 58 or Tag 59
  if (cleanQris.includes("5802ID")) {
    cleanQris = cleanQris.replace("5802ID", `${tag54}5802ID`);
  } else {
    cleanQris += tag54;
  }

  // Append Tag 6304 and calculate CRC
  const toChecksum = cleanQris + "6304";
  const crc = calculateCRC16(toChecksum);

  return toChecksum + crc;
}

// Generate unique 3-digit payment code for PaySheet
function generateUniqueCode() {
  return Math.floor(Math.random() * 899) + 100; // e.g. 123 to 999
}

// Render QRIS Canvas with stylized frame & merchant label
function renderQrisDisplay(containerId, amount, transactionId = '', customText = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const dynamicPayload = generateDynamicQrisPayload(QRIS_CONFIG.defaultPayload, amount);
  
  container.innerHTML = `
    <div class="qris-preview-box text-slate-800 dark:text-slate-800">
      <div class="flex items-center justify-between w-full pb-2 mb-2 border-b border-slate-200">
        <div class="flex items-center gap-2">
          <span class="font-extrabold text-sm tracking-wider text-rose-600">QRIS</span>
          <span class="text-[10px] text-slate-500 font-semibold uppercase">Pembayaran Nasional</span>
        </div>
        <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">NMID: ID1020038849</span>
      </div>

      <div class="text-center my-1">
        <h4 class="font-bold text-sm text-slate-900">${QRIS_CONFIG.merchantName}</h4>
        <p class="text-[11px] text-slate-500">${customText || 'NSP: ' + (transactionId || 'DUTAMIK-' + Date.now().toString().slice(-6))}</p>
      </div>

      <div id="${containerId}-qr" class="p-2 bg-white rounded-xl my-2 flex justify-center items-center shadow-inner min-h-[200px] min-w-[200px]"></div>

      <div class="text-center mt-2 w-full pt-2 border-t border-slate-200">
        <p class="text-[11px] text-slate-500 font-medium">Total Pembayaran:</p>
        <p class="text-xl font-extrabold text-blue-600 tracking-tight">Rp ${Number(amount).toLocaleString('id-ID')}</p>
        <p class="text-[10px] text-amber-600 font-medium mt-1">⚠️ Transfer tepat hingga 3 digit terakhir untuk verifikasi instan</p>
      </div>
      
      <div class="flex flex-wrap justify-center gap-1.5 mt-3 pt-2 border-t border-slate-100 opacity-80">
        <span class="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600">BCA</span>
        <span class="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600">Mandiri</span>
        <span class="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600">BRI</span>
        <span class="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600">GoPay</span>
        <span class="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600">OVO</span>
        <span class="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600">Dana</span>
        <span class="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600">ShopeePay</span>
      </div>
    </div>
  `;

  // Render QR Code inside
  const qrInner = document.getElementById(`${containerId}-qr`);
  if (typeof QRCode !== 'undefined') {
    new QRCode(qrInner, {
      text: dynamicPayload,
      width: 190,
      height: 190,
      colorDark: '#0f172a',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  } else {
    const img = document.createElement('img');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(dynamicPayload)}`;
    img.alt = 'QRIS';
    img.className = 'rounded';
    qrInner.appendChild(img);
  }
}
