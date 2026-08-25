# 🚀 DUTAMIK.ID - Production Build (Ready for GitHub Pages)
Duta Media Informasi berKarya

Subfolder ini berisikan seluruh berkas web yang **100% siap di-upload ke GitHub Pages** tanpa perlu konfigurasi build server yang rumit.

---

## 📁 Struktur Berkas Siap Deploy
- `index.html` : Halaman Utama Website
- `katalog.html` : Master Katalog Ekosistem Terpadu
- `donasi.html` : Halaman Donasi & Wall of Kontributor PaySheet QRIS
- `about.html`, `contact.html`, `privacy-policy.html`, `terms-of-service.html`, `disclaimer.html` : Halaman Legal & Informasi
- `tools/` : 6 Tool Online Gratis (QR Generator, WA Link, Image Compressor, Password Hash, Invoice Maker, Text Case)
- `jasa/` : 6 Halaman Detail Layanan Jasa (3D Modeling, PBG PUPR, Peta SHP OSS, NIB OSS, Remote PC, Web Serverless)
- `produk/` : 5 Halaman Detail Produk Digital (Kasir POS, Rumah 2D/3D, Template Web, E-Book GAS, PaySheet Engine)
- `admin/` : Enterprise Hub Dashboard Admin & Visual Post Generator
- `assets/` : File CSS Tailwind, JavaScript Vanilla, Logo SVG, dan Ikon
- `dokumentasi-pdf/` : 5 Modul Buku Panduan PDF Lengkap
- `.nojekyll` : Memastikan GitHub Pages menyajikan seluruh file dan aset statis secara langsung tanpa proses filtering Jekyll.

---

## ⚡ Langkah Mudah Upload & Mengaktifkan GitHub Pages (3 Menit)

### Cara 1: Upload Langsung via Web Browser GitHub (Tanpa Perlu Git CLI)
1. Buka repositori GitHub Anda (misal: `https://github.com/username/dutamik-id`).
2. Klik tombol **Add file** -> **Upload files**.
3. *Drag & drop* (seret) **seluruh isi folder `dist-github-pages/`** ke area upload GitHub.
4. Tulis pesan commit (contoh: `Deploy DUTAMIK.ID ke GitHub Pages`) lalu klik **Commit changes**.
5. Masuk ke menu tab **Settings** di repositori GitHub Anda.
6. Pada sidebar kiri, pilih menu **Pages**.
7. Pada bagian **Build and deployment**:
   - Source: Pilih **Deploy from a branch**
   - Branch: Pilih branch **main** / **master**, folder **/ (root)**
   - Klik tombol **Save**.
8. Dalam waktu 1-2 menit, website Anda sudah aktif dan online di URL `https://username.github.io/dutamik-id/` (atau domain kustom Anda `https://dutamik.id`).

---

### Cara 2: Push Menggunakan Git Command Line
```bash
# Masuk ke folder dist-github-pages
cd dist-github-pages

# Inisialisasi git dan push ke branch gh-pages atau main
git init
git add .
git commit -m "Deploy production release DUTAMIK.ID"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main --force
```

---

## 🔄 Cara Memperbarui Data di Masa Depan
Jika Anda melakukan perubahan teks atau harga di web utama, cukup jalankan perintah:
```bash
python build_github_pages_ready.py
```
Seluruh data terbaru akan otomatis di-copy ulang ke folder `dist-github-pages/` ini secara instan!
