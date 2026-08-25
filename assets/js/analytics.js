/**
 * DUTAMIK.ID - Website Activity & Analytics Tracker Engine
 * Duta Media Informasi berKarya
 * Lightweight, privacy-friendly in-browser real-time event analytics.
 */

const DutamikAnalytics = {
  storageKey: 'dutamik_analytics_events',
  summaryKey: 'dutamik_analytics_summary',

  // Initialize Tracker
  init() {
    this.trackPageView();
    this.initClickListeners();
  },

  // Record an Event
  track(category, action, label = '', value = 1) {
    try {
      const now = new Date();
      const event = {
        id: 'evt_' + Math.random().toString(36).substr(2, 9),
        timestamp: now.toISOString(),
        timeFormatted: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        dateFormatted: now.toLocaleDateString('id-ID'),
        category: category, // 'pageview', 'tool_usage', 'search', 'order', 'donation', 'click'
        action: action,
        label: label,
        value: value,
        path: window.location.pathname,
        device: this.getDeviceType(),
        browser: this.getBrowser()
      };

      // 1. Save Recent Events (limit last 150 events)
      let events = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      events.unshift(event);
      if (events.length > 150) events = events.slice(0, 150);
      localStorage.setItem(this.storageKey, JSON.stringify(events));

      // 2. Update Aggregated Summary
      this.updateSummary(event);
    } catch (e) {
      console.warn('Analytics record error:', e);
    }
  },

  // Track Page View
  trackPageView() {
    let pageName = document.title.split('-')[0].trim() || 'Beranda';
    this.track('pageview', 'view_page', pageName);
  },

  // Track In-Browser Tool Execution
  trackToolUsage(toolName) {
    this.track('tool_usage', 'execute_tool', toolName);
  },

  // Track Search Query
  trackSearch(query, resultCount = 0) {
    if (!query || query.length < 2) return;
    this.track('search', 'search_query', `${query} (${resultCount} hasil)`);
  },

  // Track WhatsApp / Conversion Clicks
  trackConversion(type, detail) {
    this.track('conversion', type, detail);
  },

  // Aggregated Summary Helper
  updateSummary(event) {
    let summary = JSON.parse(localStorage.getItem(this.summaryKey) || '{}');
    if (!summary.totalPageviews) {
      summary = {
        totalPageviews: 0,
        totalToolUses: 0,
        totalSearches: 0,
        totalConversions: 0,
        pages: {},
        tools: {},
        searches: {},
        devices: { desktop: 0, mobile: 0 }
      };
    }

    if (event.category === 'pageview') {
      summary.totalPageviews = (summary.totalPageviews || 0) + 1;
      summary.pages[event.label] = (summary.pages[event.label] || 0) + 1;
    } else if (event.category === 'tool_usage') {
      summary.totalToolUses = (summary.totalToolUses || 0) + 1;
      summary.tools[event.label] = (summary.tools[event.label] || 0) + 1;
    } else if (event.category === 'search') {
      summary.totalSearches = (summary.totalSearches || 0) + 1;
      summary.searches[event.label] = (summary.searches[event.label] || 0) + 1;
    } else if (event.category === 'conversion') {
      summary.totalConversions = (summary.totalConversions || 0) + 1;
    }

    if (event.device === 'Mobile') {
      summary.devices.mobile = (summary.devices.mobile || 0) + 1;
    } else {
      summary.devices.desktop = (summary.devices.desktop || 0) + 1;
    }

    localStorage.setItem(this.summaryKey, JSON.stringify(summary));
  },

  // Get Analytics Summary for Dashboard
  getSummary() {
    let summary = JSON.parse(localStorage.getItem(this.summaryKey) || '{}');
    let events = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    return { summary, events };
  },

  // Helper Device Detection
  getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) return "Mobile";
    return "Desktop";
  },

  getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Edge")) return "Edge";
    return "Browser";
  },

  // Global Click Tracking
  initClickListeners() {
    document.addEventListener('click', (e) => {
      const waBtn = e.target.closest('a[href*="whatsapp.com"], a[href*="wa.me"]');
      if (waBtn) {
        DutamikAnalytics.trackConversion('click_whatsapp', waBtn.innerText.trim() || 'WhatsApp Link');
      }

      const qrisBtn = e.target.closest('button[onclick*="openProductCheckoutModal"], button[onclick*="selectDonationPreset"]');
      if (qrisBtn) {
        DutamikAnalytics.trackConversion('click_qris_payment', qrisBtn.innerText.trim() || 'QRIS Action');
      }
    });
  }
};

// Auto-run on load
document.addEventListener('DOMContentLoaded', () => {
  DutamikAnalytics.init();
});
