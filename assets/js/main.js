/**
 * DUTAMIK.ID - Main Script
 * Duta Media Informasi berKarya
 * Handles Theme, Navigation, Dynamic Config, Modals, Toasts, WhatsApp Widget & Social Sharing
 */

// Global Configuration (Loads saved overrides from Admin Dashboard if available)
const DUTAMIK_CONFIG = {
  adminWhatsApp: localStorage.getItem('dutamik_cfg_wa') || '6281234567890',
  gasApiUrl: localStorage.getItem('dutamik_cfg_gas_url') || 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
  adsensePubId: localStorage.getItem('dutamik_cfg_adsense_pub') || 'ca-pub-9999999999999999',
  siteUrl: window.location.origin + window.location.pathname.replace(/\/[^/]*$/, ''),
  siteTitle: 'DUTAMIK.ID - Duta Media Informasi berKarya'
};

// 1. Dark Mode / Light Mode Management
function initTheme() {
  const savedTheme = localStorage.getItem('dutamik_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateThemeIcon();
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('dutamik_theme', isDark ? 'dark' : 'light');
  updateThemeIcon();
  showToast(isDark ? 'Mode Gelap diaktifkan' : 'Mode Terang diaktifkan', 'info');
}

function updateThemeIcon() {
  const isDark = document.documentElement.classList.contains('dark');
  const icons = document.querySelectorAll('.theme-toggle-icon');
  icons.forEach(icon => {
    if (isDark) {
      icon.innerHTML = `<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`;
    } else {
      icon.innerHTML = `<svg class="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;
    }
  });
}

// 2. Toast Notification System
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg class="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg class="w-5 h-5 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`;
  } else {
    iconSvg = `<svg class="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  }

  toast.innerHTML = `${iconSvg} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 20);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// 3. Modal Manager
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    // If opening share modal, dynamically sync current page url & title
    if (modalId === 'modal-share-site') {
      const urlDisplays = modal.querySelectorAll('.font-mono.truncate, [data-share-url]');
      urlDisplays.forEach(el => {
        el.textContent = window.location.href;
      });
    }
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

// Global modal backdrop close listener
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });
});

// 4. Social Share & Copy Link Function
function shareTo(platform, customUrl = '', customText = '') {
  const targetUrl = customUrl || window.location.href;
  const pageTitle = document.title || 'DUTAMIK.ID - Duta Media Informasi berKarya';
  const url = encodeURIComponent(targetUrl);
  const text = encodeURIComponent(customText || `${pageTitle}\nTemukan beragam tool online gratis, produk digital, dan jasa profesional di DUTAMIK.ID:`);
  let shareUrl = '';

  switch (platform) {
    case 'whatsapp':
      shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
      break;
    case 'telegram':
      shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      break;
    case 'twitter':
    case 'x':
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      break;
    case 'instagram':
      navigator.clipboard.writeText(targetUrl)
        .then(() => {
          showToast('Tautan disalin! Buka Instagram untuk membagikan ke Story / DM.', 'success');
          window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
        })
        .catch(() => showToast('Gagal menyalin tautan', 'error'));
      return;
    case 'tiktok':
      navigator.clipboard.writeText(targetUrl)
        .then(() => {
          showToast('Tautan disalin! Buka TikTok untuk membagikan video / bio.', 'success');
          window.open('https://tiktok.com', '_blank', 'noopener,noreferrer');
        })
        .catch(() => showToast('Gagal menyalin tautan', 'error'));
      return;
    case 'youtube':
      navigator.clipboard.writeText(targetUrl)
        .then(() => {
          showToast('Tautan disalin! Buka YouTube untuk membagikan di deskripsi / komentar.', 'success');
          window.open('https://youtube.com', '_blank', 'noopener,noreferrer');
        })
        .catch(() => showToast('Gagal menyalin tautan', 'error'));
      return;
    case 'copy':
      navigator.clipboard.writeText(targetUrl)
        .then(() => showToast('Tautan berhasil disalin ke clipboard!', 'success'))
        .catch(() => showToast('Gagal menyalin tautan', 'error'));
      return;
  }

  if (shareUrl) {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  }
}

// 5. WhatsApp Floating Help Widget (Smooth Animated Slide & Auto-Hide Dock)
function toggleWaWidget() {
  const popover = document.getElementById('wa-widget-popover');
  if (!popover) return;
  
  if (popover.classList.contains('hidden')) {
    popover.classList.remove('hidden');
    popover.classList.add('popover-hidden');
    // Force reflow for smooth transition
    void popover.offsetWidth;
    popover.classList.remove('popover-hidden');
  } else {
    popover.classList.add('popover-hidden');
    setTimeout(() => {
      popover.classList.add('hidden');
    }, 280);
  }
}

function sendFloatingWaMessage(serviceName = '') {
  const nameInput = document.getElementById('wa-client-name');
  const msgInput = document.getElementById('wa-client-msg');
  
  const name = nameInput ? nameInput.value.trim() : '';
  const userMsg = msgInput ? msgInput.value.trim() : '';

  let message = `Halo Admin DUTAMIK.ID (Duta Media Informasi berKarya), saya ingin berkonsultasi`;
  if (serviceName) message += ` mengenai layanan: *${serviceName}*`;
  if (name) message += `\n\nNama: ${name}`;
  if (userMsg) message += `\nPesan: ${userMsg}`;
  else message += `\nMohon info detail & penawarannya. Terima kasih.`;

  const waLink = `https://api.whatsapp.com/send?phone=${DUTAMIK_CONFIG.adminWhatsApp}&text=${encodeURIComponent(message)}`;
  window.open(waLink, '_blank');
}

// 6. Mobile Navigation Menu Toggle
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

// 7. Auto-Hide Floating Help Dock on Scroll Down / Reveal on Scroll Up
let lastScrollPosition = 0;
let scrollTimeout = null;

function setupFloatingDockScroll() {
  window.addEventListener('scroll', () => {
    const dock = document.getElementById('floating-help-dock');
    if (!dock) return;

    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // If scrolled past 350px and moving downwards
    if (currentScroll > lastScrollPosition && currentScroll > 350) {
      dock.classList.add('dock-hidden');
    } else {
      dock.classList.remove('dock-hidden');
    }
    
    lastScrollPosition = currentScroll <= 0 ? 0 : currentScroll;

    // Auto-reveal when user stops scrolling
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      dock.classList.remove('dock-hidden');
    }, 1500);
  }, { passive: true });
}

// Initialize on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupFloatingDockScroll();

  // Close modals on clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.add('hidden');
        backdrop.classList.remove('flex');
        document.body.style.overflow = '';
      }
    });
  });

  // ESC key to close modal & popovers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(modal => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      });
      document.body.style.overflow = '';
      const waPopover = document.getElementById('wa-widget-popover');
      if (waPopover && !waPopover.classList.contains('hidden')) {
        toggleWaWidget();
      }
    }
  });
});
