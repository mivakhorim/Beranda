/**
 * DUTAMIK.ID - Free Online Digital Tools Engine
 * 1. WhatsApp Link Generator
 * 2. QR Code Generator
 * 3. Client-Side Image Compressor & WebP Converter
 * 4. Password & Cryptographic Hash Generator
 * 5. Text & Case Converter with Word Counter
 * 6. Quick Invoice & Receipt Maker
 */

// ==========================================
// 1. WHATSAPP LINK GENERATOR
// ==========================================
function generateWaLink() {
  const code = document.getElementById('wa-country-code')?.value || '62';
  let phone = document.getElementById('wa-input-phone')?.value.trim() || '';
  const message = document.getElementById('wa-input-message')?.value.trim() || '';
  const outputInput = document.getElementById('wa-output-link');
  const previewBox = document.getElementById('wa-link-preview');

  if (!phone) {
    if (outputInput) outputInput.value = '';
    return;
  }

  // Sanitize phone number (remove +, spaces, dashes, leading 0)
  phone = phone.replace(/\D/g, '');
  if (phone.startsWith('0')) {
    phone = phone.substring(1);
  }
  if (phone.startsWith(code)) {
    // Already has country code
  } else {
    phone = code + phone;
  }

  const encodedMsg = encodeURIComponent(message);
  const fullLink = `https://api.whatsapp.com/send?phone=${phone}${encodedMsg ? '&text=' + encodedMsg : ''}`;

  if (outputInput) outputInput.value = fullLink;
  if (previewBox) {
    previewBox.classList.remove('hidden');
    const msgPreview = document.getElementById('wa-preview-text');
    if (msgPreview) msgPreview.textContent = message || '(Pesan kosong)';
  }
}

function openGeneratedWaLink() {
  const link = document.getElementById('wa-output-link')?.value;
  if (!link) {
    showToast('Silakan masukkan nomor WhatsApp terlebih dahulu', 'error');
    return;
  }
  window.open(link, '_blank');
}

function copyWaLink() {
  const link = document.getElementById('wa-output-link')?.value;
  if (!link) {
    showToast('Tautan belum tersedia', 'error');
    return;
  }
  navigator.clipboard.writeText(link)
    .then(() => showToast('Link WhatsApp berhasil disalin!', 'success'))
    .catch(() => showToast('Gagal menyalin link', 'error'));
}

// ==========================================
// 2. QR CODE GENERATOR
// ==========================================
let qrCodeInstance = null;

function renderCustomQrCode() {
  const text = document.getElementById('qr-input-text')?.value.trim() || 'https://dutamik.id';
  const size = parseInt(document.getElementById('qr-input-size')?.value || '256', 10);
  const fgColor = document.getElementById('qr-color-fg')?.value || '#000000';
  const bgColor = document.getElementById('qr-color-bg')?.value || '#ffffff';
  const container = document.getElementById('qr-canvas-container');

  if (!container) return;
  container.innerHTML = ''; // Clear previous QR

  if (typeof QRCode !== 'undefined') {
    qrCodeInstance = new QRCode(container, {
      text: text,
      width: size,
      height: size,
      colorDark: fgColor,
      colorLight: bgColor,
      correctLevel: QRCode.CorrectLevel.H
    });
  } else {
    // Fallback using public API if library fails to load
    const img = document.createElement('img');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${fgColor.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}`;
    img.alt = 'QR Code';
    img.className = 'max-w-full rounded-lg shadow-sm';
    container.appendChild(img);
  }
}

function downloadQrCode() {
  const container = document.getElementById('qr-canvas-container');
  if (!container) return;

  const canvas = container.querySelector('canvas');
  const img = container.querySelector('img');

  if (canvas) {
    const link = document.createElement('a');
    link.download = 'dutamik-qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('QR Code berhasil diunduh (PNG)', 'success');
  } else if (img) {
    const link = document.createElement('a');
    link.download = 'dutamik-qrcode.png';
    link.href = img.src;
    link.target = '_blank';
    link.click();
    showToast('Membuka gambar QR Code...', 'info');
  } else {
    showToast('QR Code belum dibuat', 'error');
  }
}

// ==========================================
// 3. IMAGE COMPRESSOR & WEBP CONVERTER
// ==========================================
let originalImageFile = null;
let compressedImageBlob = null;

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Harap pilih file gambar (JPG, PNG, WebP)', 'error');
    return;
  }

  originalImageFile = file;
  document.getElementById('orig-img-name').textContent = file.name;
  document.getElementById('orig-img-size').textContent = formatBytes(file.size);

  const reader = new FileReader();
  reader.onload = function (e) {
    const preview = document.getElementById('orig-img-preview');
    if (preview) {
      preview.src = e.target.result;
      preview.classList.remove('hidden');
    }
    processImageCompression();
  };
  reader.readAsDataURL(file);
}

function processImageCompression() {
  if (!originalImageFile) return;

  const quality = parseFloat(document.getElementById('compress-quality')?.value || '0.75');
  const format = document.getElementById('compress-format')?.value || 'image/jpeg';
  const maxWidth = parseInt(document.getElementById('compress-max-width')?.value || '1920', 10);
  
  document.getElementById('compress-quality-val').textContent = `${Math.round(quality * 100)}%`;

  const img = new Image();
  const reader = new FileReader();

  reader.onload = function (e) {
    img.src = e.target.result;
    img.onload = function () {
      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio if maxWidth is specified
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Transparent PNG preservation if converting to PNG, else fill white for JPEG
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        function (blob) {
          if (!blob) return;
          compressedImageBlob = blob;

          const compPreview = document.getElementById('comp-img-preview');
          if (compPreview) {
            compPreview.src = URL.createObjectURL(blob);
            compPreview.classList.remove('hidden');
          }

          document.getElementById('comp-img-size').textContent = formatBytes(blob.size);
          
          const savings = Math.max(0, Math.round(((originalImageFile.size - blob.size) / originalImageFile.size) * 100));
          const savingsBadge = document.getElementById('comp-savings-badge');
          if (savingsBadge) {
            savingsBadge.textContent = `Hemat ${savings}%`;
            savingsBadge.className = savings > 0 ? 'text-xs font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-xs font-bold px-2 py-1 rounded bg-slate-500/10 text-slate-500';
          }

          document.getElementById('comp-result-box')?.classList.remove('hidden');
        },
        format,
        quality
      );
    };
  };
  reader.readAsDataURL(originalImageFile);
}

function downloadCompressedImage() {
  if (!compressedImageBlob) {
    showToast('Belum ada gambar yang dikompres', 'error');
    return;
  }
  const format = document.getElementById('compress-format')?.value || 'image/jpeg';
  const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(compressedImageBlob);
  link.download = `dutamik-compressed-${Date.now()}.${ext}`;
  link.click();
  showToast('Gambar berhasil diunduh!', 'success');
}

// ==========================================
// 4. PASSWORD & HASH GENERATOR
// ==========================================
function generateStrongPassword() {
  const length = parseInt(document.getElementById('pass-length')?.value || '16', 10);
  const useUpper = document.getElementById('pass-opt-upper')?.checked ?? true;
  const useLower = document.getElementById('pass-opt-lower')?.checked ?? true;
  const useNumbers = document.getElementById('pass-opt-nums')?.checked ?? true;
  const useSymbols = document.getElementById('pass-opt-syms')?.checked ?? true;

  document.getElementById('pass-length-val').textContent = length;

  let chars = '';
  if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (useNumbers) chars += '0123456789';
  if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

  let password = '';
  const cryptoObj = window.crypto || window.msCrypto;
  const randomValues = new Uint32Array(length);
  cryptoObj.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    password += chars[randomValues[i] % chars.length];
  }

  const output = document.getElementById('pass-output');
  if (output) output.value = password;

  calculatePasswordStrength(password);
}

function calculatePasswordStrength(pass) {
  let score = 0;
  if (!pass) score = 0;
  if (pass.length >= 8) score += 20;
  if (pass.length >= 14) score += 25;
  if (/[A-Z]/.test(pass)) score += 15;
  if (/[a-z]/.test(pass)) score += 15;
  if (/[0-9]/.test(pass)) score += 15;
  if (/[^A-Za-z0-9]/.test(pass)) score += 10;

  const bar = document.getElementById('pass-strength-bar');
  const label = document.getElementById('pass-strength-label');
  if (!bar || !label) return;

  bar.style.width = `${Math.min(100, score)}%`;

  if (score < 40) {
    bar.className = 'h-2 rounded-full bg-rose-500 transition-all duration-300';
    label.textContent = 'Kekuatan: Lemah';
    label.className = 'text-xs font-semibold text-rose-500';
  } else if (score < 75) {
    bar.className = 'h-2 rounded-full bg-amber-500 transition-all duration-300';
    label.textContent = 'Kekuatan: Sedang';
    label.className = 'text-xs font-semibold text-amber-500';
  } else {
    bar.className = 'h-2 rounded-full bg-emerald-500 transition-all duration-300';
    label.textContent = 'Kekuatan: Sangat Kuat & Aman';
    label.className = 'text-xs font-semibold text-emerald-500';
  }
}

async function generateCryptographicHash() {
  const text = document.getElementById('hash-input-text')?.value || '';
  const algo = document.getElementById('hash-algo')?.value || 'SHA-256';
  const output = document.getElementById('hash-output');

  if (!text) {
    if (output) output.value = '';
    return;
  }

  if (algo === 'MD5') {
    // Simple fast MD5 algorithm
    if (output) output.value = simpleMd5(text);
    return;
  }

  try {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest(algo, msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    if (output) output.value = hashHex;
  } catch (err) {
    if (output) output.value = 'Error generating hash';
  }
}

// Compact MD5 helper for browser
function simpleMd5(string) {
  function rotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    } else return (lResult ^ lX8 ^ lY8);
  }
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return (x ^ y ^ z); }
  function I(x, y, z) { return (y ^ (x | (~z))); }
  function FF(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  var x = [];
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11=7, S12=12, S13=17, S14=22;
  var S21=5, S22=9 , S23=14, S24=20;
  var S31=4, S32=11, S33=16, S34=23;
  var S41=6, S42=10, S43=15, S44=21;

  var str = unescape(encodeURIComponent(string));
  var nwords = ((str.length + 8) >> 6) + 1;
  for (var i = 0; i < nwords * 16; i++) x[i] = 0;
  for (var i = 0; i < str.length; i++) x[i >> 2] |= (str.charCodeAt(i) & 0xFF) << ((i % 4) * 8);
  x[i >> 2] |= 0x80 << ((i % 4) * 8);
  x[nwords * 16 - 2] = str.length * 8;

  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

  for (var i = 0; i < x.length; i += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = FF(a, b, c, d, x[i+0], S11, 0xD76AA478); d = FF(d, a, b, c, x[i+1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[i+2], S13, 0x242070DB); b = FF(b, c, d, a, x[i+3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[i+4], S11, 0xF57C0FAF); d = FF(d, a, b, c, x[i+5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[i+6], S13, 0xA8304613); b = FF(b, c, d, a, x[i+7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[i+8], S11, 0x698098D8); d = FF(d, a, b, c, x[i+9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[i+10], S13, 0xFFFF5BB1); b = FF(b, c, d, a, x[i+11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[i+12], S11, 0x6B901122); d = FF(d, a, b, c, x[i+13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[i+14], S13, 0xA679438E); b = FF(b, c, d, a, x[i+15], S14, 0x49B40821);

    a = GG(a, b, c, d, x[i+1], S21, 0xF61E2562); d = GG(d, a, b, c, x[i+6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[i+11], S23, 0x265E5A51); b = GG(b, c, d, a, x[i+0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[i+5], S21, 0xD62F105D); d = GG(d, a, b, c, x[i+10], S22, 0x2441453);
    c = GG(c, d, a, b, x[i+15], S23, 0xD8A1E681); b = GG(b, c, d, a, x[i+4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[i+9], S21, 0x21E1CDE6); d = GG(d, a, b, c, x[i+14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[i+3], S23, 0xF4D50D87); b = GG(b, c, d, a, x[i+8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[i+13], S21, 0xA9E3E905); d = GG(d, a, b, c, x[i+2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[i+7], S23, 0x676F02D9); b = GG(b, c, d, a, x[i+12], S24, 0x8D2A4C8A);

    a = HH(a, b, c, d, x[i+5], S31, 0xFFFA3942); d = HH(d, a, b, c, x[i+8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[i+11], S33, 0x6D9D6122); b = HH(b, c, d, a, x[i+14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[i+1], S31, 0xA4BEEA44); d = HH(d, a, b, c, x[i+4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[i+7], S33, 0xF6BB4B60); b = HH(b, c, d, a, x[i+10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[i+13], S31, 0x289B7EC6); d = HH(d, a, b, c, x[i+0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[i+3], S33, 0xD4EF3085); b = HH(b, c, d, a, x[i+6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[i+9], S31, 0xD9D4D039); d = HH(d, a, b, c, x[i+12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[i+15], S33, 0x1FA27CF8); b = HH(b, c, d, a, x[i+2], S34, 0xC4AC5665);

    a = II(a, b, c, d, x[i+0], S41, 0xF4292244); d = II(d, a, b, c, x[i+7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[i+14], S43, 0xAB9423A7); b = II(b, c, d, a, x[i+5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[i+12], S41, 0x655B59C3); d = II(d, a, b, c, x[i+3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[i+10], S43, 0xFFEFF47D); b = II(b, c, d, a, x[i+1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[i+8], S41, 0x6FA87E4F); d = II(d, a, b, c, x[i+15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[i+6], S43, 0xA3014314); b = II(b, c, d, a, x[i+13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[i+4], S41, 0xF7537E82); d = II(d, a, b, c, x[i+11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[i+2], S43, 0x2AD7D2BB); b = II(b, c, d, a, x[i+9], S44, 0xEB86D391);

    a = addUnsigned(a, AA); b = addUnsigned(b, BB);
    c = addUnsigned(c, CC); d = addUnsigned(d, DD);
  }

  var hex = function(n) {
    var s = "", v;
    for (var i = 0; i < 4; i++) {
      v = (n >>> (i * 8)) & 0xFF;
      s += ("0" + v.toString(16)).slice(-2);
    }
    return s;
  };
  return (hex(a) + hex(b) + hex(c) + hex(d)).toLowerCase();
}

// ==========================================
// 5. TEXT & CASE CONVERTER WITH COUNTER
// ==========================================
function updateTextAnalysis() {
  const text = document.getElementById('text-input-area')?.value || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s+/g, '').length;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
  const readingTime = Math.ceil(words / 200); // 200 wpm standard

  document.getElementById('stat-words').textContent = words;
  document.getElementById('stat-chars').textContent = chars;
  document.getElementById('stat-chars-nospace').textContent = charsNoSpaces;
  document.getElementById('stat-lines').textContent = lines;
  document.getElementById('stat-reading-time').textContent = `~${readingTime} mnt`;
}

function convertTextCase(type) {
  const textarea = document.getElementById('text-input-area');
  if (!textarea || !textarea.value) return;

  let str = textarea.value;
  switch (type) {
    case 'upper':
      str = str.toUpperCase();
      break;
    case 'lower':
      str = str.toLowerCase();
      break;
    case 'title':
      str = str.toLowerCase().replace(/(?:^|\s|-)\S/g, function(a) { return a.toUpperCase(); });
      break;
    case 'sentence':
      str = str.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, function(c) { return c.toUpperCase(); });
      break;
    case 'slug':
      str = str.toLowerCase()
               .replace(/[^a-z0-9\s-]/g, '')
               .trim()
               .replace(/\s+/g, '-');
      break;
    case 'clean':
      str = str.replace(/\s+/g, ' ').trim();
      break;
  }

  textarea.value = str;
  updateTextAnalysis();
  showToast(`Teks diubah ke ${type.toUpperCase()}`, 'info');
}

// ==========================================
// 6. SIMPLE INVOICE & RECEIPT GENERATOR
// ==========================================
function addInvoiceItemRow() {
  const tbody = document.getElementById('invoice-items-body');
  if (!tbody) return;

  const row = document.createElement('tr');
  row.className = 'border-b border-slate-200 dark:border-slate-700 invoice-item-row';
  row.innerHTML = `
    <td class="p-2"><input type="text" class="w-full bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:outline-none focus:border-blue-500 py-1 text-sm item-desc" placeholder="Nama Jasa / Produk" value="Layanan Digital"></td>
    <td class="p-2 w-20"><input type="number" min="1" class="w-full bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:outline-none text-center py-1 text-sm item-qty" value="1" oninput="calculateInvoiceTotal()"></td>
    <td class="p-2 w-32"><input type="number" min="0" step="1000" class="w-full bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:outline-none text-right py-1 text-sm item-price" value="100000" oninput="calculateInvoiceTotal()"></td>
    <td class="p-2 w-32 text-right font-medium text-sm item-subtotal">Rp 100.000</td>
    <td class="p-2 w-10 text-center no-print">
      <button type="button" onclick="this.closest('tr').remove(); calculateInvoiceTotal();" class="text-rose-500 hover:text-rose-700 text-sm font-bold">×</button>
    </td>
  `;
  tbody.appendChild(row);
  calculateInvoiceTotal();
}

function calculateInvoiceTotal() {
  let subtotal = 0;
  const rows = document.querySelectorAll('.invoice-item-row');

  rows.forEach(row => {
    const qty = parseFloat(row.querySelector('.item-qty')?.value || '0');
    const price = parseFloat(row.querySelector('.item-price')?.value || '0');
    const rowSub = qty * price;
    subtotal += rowSub;

    const subCell = row.querySelector('.item-subtotal');
    if (subCell) subCell.textContent = formatRupiah(rowSub);
  });

  const discount = parseFloat(document.getElementById('inv-discount')?.value || '0');
  const tax = parseFloat(document.getElementById('inv-tax')?.value || '0');

  const grandTotal = Math.max(0, subtotal - discount + tax);

  document.getElementById('inv-subtotal-val').textContent = formatRupiah(subtotal);
  document.getElementById('inv-grandtotal-val').textContent = formatRupiah(grandTotal);
}

function printInvoice() {
  window.print();
}

// Utility Helpers
function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}
