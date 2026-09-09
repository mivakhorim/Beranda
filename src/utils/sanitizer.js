/**
 * DutaSanitizer — HTML Sanitization & Security Utilities
 * Proteksi XSS untuk seluruh modul Duta RAB S1
 * 
 * @version 1.0.0
 * @since 2026-09-09
 */
window.DutaSanitizer = (function() {
  'use strict';

  /**
   * Escape HTML entities untuk mencegah XSS injection.
   * Wajib digunakan saat menyisipkan variabel ke template HTML.
   * @param {*} str - String yang akan di-escape
   * @returns {string} String yang aman untuk dimasukkan ke HTML
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Escape string untuk digunakan di dalam atribut HTML.
   * Lebih ketat dari escapeHtml — juga escape backtick dan newlines.
   * @param {*} str - String yang akan di-escape
   * @returns {string} String yang aman untuk dimasukkan ke atribut HTML
   */
  function escapeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/`/g, '&#96;')
      .replace(/\n/g, '&#10;')
      .replace(/\r/g, '&#13;');
  }

  /**
   * Validasi URL logo — hanya izinkan data URI gambar atau path relatif aman.
   * Menolak javascript:, data:text/html, dan URL berbahaya lainnya.
   * @param {string} url - URL yang akan divalidasi
   * @param {string} fallback - URL fallback jika validasi gagal
   * @returns {string} URL yang aman atau fallback
   */
  function sanitizeImageSrc(url, fallback) {
    if (!url || typeof url !== 'string') return fallback || '';
    var trimmed = url.trim();

    // Izinkan data URI gambar
    if (/^data:image\/(png|jpeg|jpg|gif|svg\+xml|webp|bmp|ico);base64,/i.test(trimmed)) {
      return trimmed;
    }

    // Izinkan data URI SVG inline (utf8)
    if (/^data:image\/svg\+xml;utf8,/i.test(trimmed)) {
      return trimmed;
    }

    // Izinkan path relatif sederhana (tanpa protocol)
    if (/^[a-zA-Z0-9_.\/\-]+\.(png|jpg|jpeg|gif|svg|webp|bmp|ico)$/i.test(trimmed)) {
      return trimmed;
    }

    // Izinkan blob URL
    if (/^blob:/i.test(trimmed)) {
      return trimmed;
    }

    // Tolak semua lainnya (javascript:, data:text/html, URL remote, dll)
    return fallback || '';
  }

  /**
   * Sanitasi nama file/folder untuk Windows File System API.
   * Mencegah path traversal dan reserved device names.
   * @param {string} name - Nama yang akan disanitasi
   * @returns {string} Nama yang aman untuk filesystem
   */
  function sanitizeFileName(name) {
    if (!name) return 'proyek';
    var clean = String(name)
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/\.+$/, '')    // Hapus trailing dots
      .replace(/^\.+/, '')    // Hapus leading dots
      .trim();

    // Cek reserved Windows device names
    var reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
    if (!clean || reserved.test(clean)) {
      clean = 'proyek_' + (clean || 'data');
    }

    return clean;
  }

  /**
   * Sanitasi teks kaya — strip semua tag HTML.
   * Berguna untuk input teks biasa yang tidak boleh mengandung markup.
   * @param {*} str - String yang akan dibersihkan
   * @returns {string} String tanpa tag HTML
   */
  function stripTags(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/<[^>]*>/g, '');
  }

  // Public API — di-freeze agar tidak bisa di-monkey-patch
  var api = {
    escapeHtml: escapeHtml,
    escapeAttr: escapeAttr,
    sanitizeImageSrc: sanitizeImageSrc,
    sanitizeFileName: sanitizeFileName,
    stripTags: stripTags
  };

  return Object.freeze(api);
})();
