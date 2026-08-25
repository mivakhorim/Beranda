# 🚀 DUTAMIK.ID - Production Build (Ready for GitHub Pages)
Duta Media Informasi berKarya

Subfolder ini berisikan seluruh berkas web yang **100% siap di-upload ke GitHub Pages** dengan dukungan **Clean URLs (tanpa ekstensi .html dan tanpa index.html)**.

---

## 🌐 Format URL Bersih (Clean URLs)
Seluruh link dan rute telah terkonfigurasi dalam format direktori bersih yang modern dan SEO-friendly:
- `https://dutamik.id/` (Beranda)
- `https://dutamik.id/katalog/` (Master Katalog)
- `https://dutamik.id/donasi/` (Wall of Kontributor)
- `https://dutamik.id/about/`, `https://dutamik.id/contact/`, `https://dutamik.id/privacy-policy/`, `https://dutamik.id/terms-of-service/`, `https://dutamik.id/disclaimer/`
- `https://dutamik.id/tools/` & sub-tools (`https://dutamik.id/tools/qr-generator/`, dll)
- `https://dutamik.id/jasa/` & sub-jasa (`https://dutamik.id/jasa/3d-modeling/`, dll)
- `https://dutamik.id/produk/` & sub-produk (`https://dutamik.id/produk/pos-sheet/`, dll)

---

## 🤖 Asisten Virtual Robot Mengintip (Peeking Robot)
- Terpasang otomatis di sisi kanan layar di seluruh halaman.
- Mengintip secara elegan di tepi layar dan dapat dibuka dengan **klik** atau **geser/cubit ke kiri** di layar sentuh ponsel.
- Menyediakan formulir konsultasi cepat yang langsung tersambung ke WhatsApp Admin resmi.

---

## ⚡ Langkah Mudah Upload & Mengaktifkan GitHub Pages (3 Menit)

### Cara 1: Upload Langsung via Web Browser GitHub (Tanpa Perlu Git CLI)
1. Buka repositori GitHub Anda (misal: `https://github.com/username/dutamik-id`).
2. Klik tombol **Add file** -> **Upload files**.
3. *Drag & drop* (seret) **seluruh isi folder `dist-github-pages/`** ke area upload GitHub.
4. Tulis pesan commit (contoh: `Deploy DUTAMIK.ID Clean URLs ke GitHub Pages`) lalu klik **Commit changes**.
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
