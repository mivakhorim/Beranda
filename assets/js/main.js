/**
 * DUTAMIK.ID - Main Application Engine & Theme Manager
 * Duta Media Informasi berKarya
 */

// Clean URL Bar Formatter: Strips .html, index.html, and trailing slashes from browser address bar
function cleanBrowserUrlBar() {
  try {
    if (window.location.protocol.startsWith('http')) {
      let path = window.location.pathname;
      let cleanPath = path.replace(/\/index\.html$/i, '').replace(/\.html$/i, '');
      if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
        cleanPath = cleanPath.slice(0, -1);
      }
      if (cleanPath !== path && cleanPath !== '') {
        const newUrl = window.location.origin + cleanPath + window.location.search + window.location.hash;
        window.history.replaceState(null, '', newUrl);
      }
    }
  } catch (e) {}
}

cleanBrowserUrlBar();

const DUTAMIK_CONFIG = {
  adminWhatsApp: localStorage.getItem('dutamik_cfg_wa') || '6281234567890',
  gasApiUrl: localStorage.getItem('dutamik_cfg_gas_url') || 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
  adsensePubId: localStorage.getItem('dutamik_cfg_adsense_pub') || 'ca-pub-9999999999999999',
  siteUrl: window.location.origin + window.location.pathname.replace(/\/[^/]*$/, ''),
  siteTitle: 'DUTAMIK.ID - Duta Media Informasi berKarya'
};

const SUN_SVG = `<svg class="w-4 h-4 text-amber-400 inline-block flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

const MOON_SVG = `<svg class="w-4 h-4 text-slate-700 dark:text-slate-300 inline-block flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

// 1. BULLETPROOF THEME SWITCHER (DIRECT ROOT + ICON SYNC)
function initTheme() {
  const saved = localStorage.getItem('dutamik_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved === 'dark' || (!saved && prefersDark);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateThemeIcons(isDark);
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('dutamik_theme', isDark ? 'dark' : 'light');
  updateThemeIcons(isDark);
  if (typeof showToast === 'function') {
    showToast(isDark ? 'Mode Gelap diaktifkan' : 'Mode Terang diaktifkan', 'info');
  }
}

function toggleDarkMode() {
  toggleTheme();
}

function updateThemeIcons(isDark) {
  const icons = document.querySelectorAll('.theme-toggle-icon');
  icons.forEach(icon => {
    icon.innerHTML = isDark ? SUN_SVG : MOON_SVG;
  });
}

window.toggleTheme = toggleTheme;
window.toggleDarkMode = toggleTheme;
window.initTheme = initTheme;

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
  // Guarantee floating robot dock is 100% visible and interactive
  const dock = document.getElementById('peeking-robot-dock');
  if (dock) {
    dock.style.opacity = '1';
    dock.style.display = 'block';
    dock.style.pointerEvents = 'auto';
  }
}

// 4. Social Sharing System
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
    case 'tiktok':
    case 'youtube':
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

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

function toggleRobotAssistant() {
  if (typeof openConsultationModal === 'function') {
    openConsultationModal();
  } else {
    openModal('modal-consultation-service');
  }
}

// 5. ULTRA-SMOOTH AUTO-SLIDE & DIRECT DRAG-TO-SCROLL ENGINE
function initSliderEngine() {
  const sliders = document.querySelectorAll('.snap-x, .horizontal-drag-slider, [data-drag-scroll]');
  
  sliders.forEach(slider => {
    if (slider.dataset.sliderReady) return;
    slider.dataset.sliderReady = 'true';

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let isDragging = false;
    let autoTimer = null;

    // A. MOUSE DRAG TO SCROLL
    slider.addEventListener('mousedown', (e) => {
      if (['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      isDown = true;
      isDragging = false;
      startX = e.pageX - slider.offsetLeft;
      scrollStart = slider.scrollLeft;
      stopAuto();
    });

    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove('is-dragging');
      setTimeout(startAuto, 2500);
    };

    slider.addEventListener('mouseleave', endDrag);
    slider.addEventListener('mouseup', endDrag);

    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX);
      
      if (Math.abs(walk) > 5) {
        if (!isDragging) {
          isDragging = true;
          slider.classList.add('is-dragging');
        }
        slider.scrollLeft = scrollStart - (walk * 1.5);
      }
    });

    slider.addEventListener('click', (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // B. SMOOTH STEP AUTO-SLIDE
    function startAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(() => {
        if (isDown || isDragging) return;
        if (slider.scrollWidth > slider.clientWidth + 10) {
          const firstCard = slider.querySelector('.mobile-slide-card, .contributor-slide-card, div, a');
          const step = firstCard ? (firstCard.offsetWidth + 16) : 296;
          const maxLeft = slider.scrollWidth - slider.clientWidth;

          slider.style.scrollBehavior = 'smooth';
          if (slider.scrollLeft >= maxLeft - 20) {
            slider.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            slider.scrollBy({ left: step, behavior: 'smooth' });
          }
        }
      }, 3800);
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('touchstart', stopAuto, { passive: true });
    slider.addEventListener('touchend', () => setTimeout(startAuto, 2500), { passive: true });

    startAuto();
  });
}

window.initSliderEngine = initSliderEngine;
window.initDragToScroll = initSliderEngine;

// Immediate Theme & Event Bindings
initTheme();
document.addEventListener('DOMContentLoaded', () => {
  cleanBrowserUrlBar();
  initTheme();
  initSliderEngine();
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });
});
