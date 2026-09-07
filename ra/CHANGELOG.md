# Catatan Rilis & Riwayat Perubahan (Changelog)

## [Version 0.45] - 2026-09-08 (Release Status: STABLE / VALIDATED)
### 🏛️ Precision A4 Print Engine, Monochromatic Button Design & Anti-Over Bagan Kurva S
- **Engine Cetak PDF Presisi A4 Terisolasi (Precision Sandboxed A4 Print Engine)**:
  - Mengatasi kendala hasil cetakan PDF yang sebelumnya tidak presisi, menangkap kartu ponsel, menyertakan tombol aksi layar, atau kehilangan Kop Resmi PUPR saat diunduh via peramban seluler.
  - Mengembangkan sistem **Off-Screen Dedicated Sandboxing**:
    - Kontainer cetak diisolasi pada dimensi eksak piksel A4 standar 96 DPI: Portrait `794px` (210mm) dan Landscape `1123px` (297mm).
    - DOM dikloning dan disterilkan dari seluruh elemen interaktif (`.no-print`, `.btn`, `.page-header-actions`, `.d-mobile-only`, `input`, `select`).
    - Memaksa seluruh elemen `.print-only` tampil penuh (`display: block !important; opacity: 1`) dan tabel `.d-desktop-only` aktif (`display: table`).
    - Standarisasi garis batas tabel teknik sipil presisi (garis tepi halus `#cbd5e1`, header `#f1f5f9`, font finansial tajam).
    - Deteksi Kop Resmi otomatis: Menginjeksikan Kop Resmi Standar PUPR SE No. 47/2026 secara dinamis apabila dokumen belum memuat kop surat.
- **Sistem Tombol Monokromatik Arsitektural (Eliminasi Warna-Warni / Anti-Pelangi)**:
  - Menjawab masukan pengguna untuk mengurangi warna-warni pada tombol agar berpenampilan eksekutif, berwibawa, dan elegan standar konsultan rekayasa sipil:
    - **Aksi Utama (Primary Action)**: Obsidian Slate Navy (`#0f172a` dengan hover `#1e293b`), teks putih kontras tinggi, bayangan mikro lembut.
    - **Aksi Sekunder (Secondary Action)**: Crisp White (`#ffffff`) dengan garis tepi slate netral (`#cbd5e1`), teks gelap (`#334155`), hover latar `#f8fafc`.
    - **Eliminasi Total `btn-primary-gradient`**: Gradien biru elektrik dihapus dari seluruh komponen aplikasi dan dialihkan ke Obsidian Slate solid.
    - **Eliminasi Tombol Hijau / Kuning / Cyan**: Mengganti tombol hijau `.btn-success` pada bilah aksi menjadi Obsidian Slate, tombol `.btn-warning` menjadi `.btn-outline`, dan menghapus inline style `#0284c7`.
    - **Tombol Hapus / Destruktif**: Didesain ulang menjadi outline halus elegan berlatar putih dengan teks merah marun (`#b91c1c`) dan hover lembut (`#fef2f2`), bukan blok merah masif yang mengganggu visual.
- **Bilah Metrik KPI Ramping (Anti-Over Bagan pada Kurva S & Dashboard)**:
  - Mengatasi kendala 4 kartu KPI raksasa bertingkat dengan border warna tebal (`3px solid #2563eb`, `#059669`, `#0891b2`) yang sebelumnya memakan ruang vertikal 400px sebelum pengguna dapat melihat diagram Kurva S.
  - Menggantikannya dengan **`.kurva-kpi-bar` (Executive Compact KPI Strip)**:
    - Ketinggian sangat ramping (~50px di desktop) dengan 4 sel metrik bergaris batas pemisah halus (Target Rencana, Realisasi Aktual, Deviasi Jadwal, dan Total Durasi).
    - Responsif adaptif pada ponsel dalam konfigurasi grid 2x2 rapi (~96px tinggi) tanpa membuang ruang layar.
    - Grafik vektor Kurva S dan tabel jadwal langsung terlihat seketika saat tab dibuka tanpa perlu scroll berlebih.
- **Penyempurnaan Strict @media print CSS**:
  - Menegakkan `table.d-desktop-only { display: table !important; }` dan `.d-mobile-only { display: none !important; }` untuk menjamin hasil cetak browser maupun cetak fisik 100% menggunakan format tabel resmi PUPR.
- **Zero-Regression Guarantee**:
  - 100% 6 suite kalkulasi RAB matematis lulus (`node test_verification.js`).
  - 100% 14 suite pengujian modal proporsional lulus (`scratch/test_modal_v44_proportional.js`).
  - 100% 23 suite pengujian presisi cetak & desain monokromatik lulus (`scratch/test_v45_precision_and_design.js`).

---

## [Version 0.44] - 2026-09-08 (Release Status: STABLE / VALIDATED)
### 🎨 Redesain Proporsional Dialog Input RAB: Rapi, Elegan, Tanpa Tombol Ganda & Skala Seimbang
- **Eliminasi Total Tombol Aksi Ganda (Single-Source Footer Ergonomics)**:
  - Mengatasi kendala munculnya dua tombol "Tambah ke RAB" yang bertumpuk pada tampilan ponsel (`#modalMobileQuickAction` di dalam kartu dan `.modal-footer` di dasar dialog).
  - Menyatukan kendali aksi secara eksklusif pada bilah *Footer Modal Tunggal*:
    - **Tahap 1 (Pilih AHSP)**: Tombol kiri `[ Batal ]` (menutup modal) dan tombol kanan `[ Lanjut: Volume → ]` (berpindah ke input volume bila AHSP telah dipilih).
    - **Tahap 2 (Volume & Simpan)**: Tombol kiri `[ ← Ganti AHSP ]` (kembali ke pemilihan AHSP dengan mulus) dan tombol kanan `[ ✓ Tambah ke RAB / Simpan Perubahan ]` (menyimpan item ke RAB).
    - **Mode Desktop**: Tombol kiri `[ Batal ]` dan tombol kanan `[ Tambah ke RAB ]`.
- **Penyeimbangan Skala & Proporsi Elemen (Anti-Oversized / Tidak Terlalu Besar)**:
  - **Hero Volume Input**: Disederhanakan dari border biru tebal 2px dan font raksasa 22px menjadi kartu kuantitas modern berukuran proporsional (tinggi `35px`, font `16px bold`, border `1px solid #cbd5e1`). Menghapus badge bising `⭐ Satu-Satunya Input Manual` agar tampilan bersih dan profesional.
  - **Kalkulasi Subtotal RAB**: Menggantikan banner hijau gelap tebal (~70px) menjadi *Sleek Emerald Accent Bar* yang ramping (~40px) berlatar hijau lembut `#f0fdf4` dengan label ringkas dan nominal tegas.
  - **Uraian / Nama AHSP**: Mengeliminasi textarea kaku ber-scrollbar panah ganda `▲ ▼`. Menggunakan area teks berukuran pas dengan *thin scrollbar*, border halus, dan badge kode standar PUPR yang rapi.
  - **Segmented Tabs Ponsel**: Mengurangi ketebalan tab bar menjadi bilah segmented kontrol modern setinggi 34px dengan pill putih berbayang halus saat aktif.
- **Penyempurnaan Dimensi Modal**:
  - Desktop: Lebar modal dioptimalkan menjadi `980px` (sebelumnya 1060px) sehingga pas proporsional di tengah layar monitor 14"-27".
  - Mobile: Lebar modal diatur `95vw` (maks. `440px`) terpusat dengan padding proporsional (10px 12px) tanpa scrollbar ganda.
- **Zero-Regression Guarantee**:
  - 100% lulus 6 suite pengujian TDD (`test_verification.js`), 16 pengujian responsive mobile (`test_mobile_responsive.js`), dan 14 pengujian proporsional modal (`test_modal_v44_proportional.js`).

---

## [Version 0.43] - 2026-09-08 (Release Status: STABLE / VALIDATED)
### 📱 Arsitektur Kartu Data Adaptif Zero-Horizontal-Scroll & Direct Client-Side PDF Engine
- **Eliminasi Total Scroll Horizontal pada Ponsel (Zero Horizontal Scroll)**:
  - Mengatasi kendala tabel data lebar (6 s.d. 9 kolom) pada layar smartphone yang sebelumnya membutuhkan geser kanan-kiri (*overflow-x drag*).
  - Mengimplementasikan sistem **Dual-Mode Rendering**:
    - **Desktop Mode (`.d-desktop-only`)**: Menyajikan tabel tabular lengkap standar PUPR untuk layar desktop, laptop, dan media cetak A4 fisik.
    - **Mobile Touch Cards Mode (`.d-mobile-only`)**: Bertransformasi otomatis pada resolusi `< 768px` menjadi kartu sentuh vertikal modular yang memanfaatkan 100% lebar layar ponsel.
  - Tampilan yang diperbarui dengan kartu adaptif:
    - **Rincian Detail RAB**: Kartu item pekerjaan (`.rab-mobile-item-card`) lengkap dengan badge kode AHSP, kuantitas volume heroik, harga satuan, subtotal emerald, rincian upah tenaga, serta tombol jempol "✏️ Ubah Item" dan "🗑️ Hapus". Ditutup dengan kartu Subtotal Divisi emerald.
    - **Rekapitulasi RAB**: Kartu divisi (`.rekap-mobile-card`) dengan badge jumlah item, bobot persen progress bar, total divisi, tombol navigasi "📋 Buka Rincian Divisi", serta *Hero Grand Total Card* bergradien hijau zamrud lengkap dengan Real Cost, PPN 11%, dan teks Terbilang resmi.
    - **Rincian Penggunaan Sumber Daya**: Kartu kebutuhan bahan fisik, tenaga kerja (OH), dan sewa alat (`.resource-mobile-card`) dengan porsi biaya kelompok (%) dan bobot total proyek (%).
    - **Kurva S & Kalender Proyek**: Dilengkapi banner edukatif tips rotasi otomatis ponsel (*landscape tip banner*) untuk visibilitas matriks mingguan yang lega.
- **Engine Unduh File PDF Langsung pada Ponsel (Direct PDF Download)**:
  - Mengintegrasikan perpustakaan *client-side* lokal offline `html2pdf.bundle.min.js` (885 KB) di `js/lib/` tanpa ketergantungan koneksi internet (100% offline).
  - Menghadirkan fungsi `window.PrintEngine.downloadPdfDirect(targetElementId, filename, orientation)` yang merender DOM menjadi canvas dan mengompilasinya langsung menjadi file `.pdf` asli yang tersimpan otomatis ke folder *Download* ponsel/komputer dalam 1 ketukan tombol.
  - Memasang tombol **"📥 Unduh PDF"** berdesain *primary-gradient* pada:
    - **Bilah Menu Utama (Topbar)**: Mengunduh tab dokumen yang sedang aktif.
    - **Rincian Detail RAB**: Mengunduh seluruh rincian divisi dan item pekerjaan.
    - **Rekapitulasi RAB**: Mengunduh rekapitulasi divisi, PPN, dan grand total.
    - **Rincian Sumber Daya**: Mengunduh rekapitulasi material, upah, dan alat.
    - **Kurva S & Jadwal**: Mengunduh diagram Kurva S dalam orientasi landscape.
    - **Kalender Proyek**: Mengunduh jadwal tanggal dan timeline pelaksanaan.
    - **Dokumen Proposal**: Mengunduh dokumen proposal tender lengkap A4.
    - **Penagihan BAP**: Mengunduh lembar berita acara penagihan termin per termin.
- **Penataan Tipografi & UX Teks Bebas Potong**:
  - Penegakan `word-break: break-word` dan `overflow-wrap: anywhere` pada nama item pekerjaan agar tidak terpotong atau menimbulkan ruang hampa.
  - Hirarki ukuran teks proporsional (judul 13.5px bold, badge 10px-11px mono, nominal uang bold 14px-15px emerald).
- **Zero-Regression Guarantee**:
  - 100% formula matematis, 2.577 item AHSP SE 47/2026, preset 38 provinsi, dan 6 test suite TDD tervalidasi lulus tanpa galat (`node test_verification.js` dan `test_mobile_responsive.js`).

---

## [Version 0.42] - 2026-09-08 (Release Status: STABLE / VALIDATED)
### 🎨 Redesain Responsif Dialog Input Item RAB: Zero Scrollbar Desktop & 100% Mobile Touch Flow
- **Eliminasi Total Scrollbar Dialog pada Layar Laptop / Desktop (Zero Scrollbar)**:
  - Merestrukturisasi tata letak modal dari bentuk tumpukan vertikal (790px) menjadi arsitektur **2-Kolom Grid Responsif (`modal-rab-item`, lebar 1060px)** dengan tinggi terkontrol (~410px).
  - **Kolom Kiri (48%)**: Pustaka AHSP Standar PUPR SE 47/2026 (2.577 item), filter kategori cepat, kotak pencarian dengan tombol pembersih otomatis (*clear search* `×`), dan daftar kartu pekerjaan interaktif dengan rel *scrollbar* internal mandiri.
  - **Kolom Kanan (52%)**: Pilihan Divisi Pekerjaan Tujuan, ringkasan spesifikasi & badge kode/satuan/HSP terkunci, *Hero Volume Input* berukuran besar, banner estimasi subtotal *emerald gradient*, dan catatan teknis lapangan.
  - Pengguna dapat melihat seluruh elemen mulai dari pencarian, pemilihan AHSP, pengetikan volume, kalkulasi subtotal, hingga tombol "Tambah ke RAB" dalam **satu tampilan utuh tanpa perlu menggulir (scroll) dialog**.
- **100% Dukungan Antarmuka Ponsel (< 860px) Berbasis Wizard Tabs (Thumb Ergonomics)**:
  - Menyediakan bilah navigasi tab 2 tahap di bagian atas:
    - **Tab 1: 🔍 1. Pilih AHSP**: Menampilkan pencarian dan kartu pekerjaan berukuran sentuh jempol (tinggi min. 52px) dengan label bidang pekerjaan (CK, BM, SDA, SMKK). Seketika kartu disentuh/dipilih, sistem otomatis mengunci data dan berpindah ke Tab 2 secara mulus (*auto-advance*).
    - **Tab 2: ✏️ 2. Volume & Simpan**: Menampilkan ringkasan pekerjaan terpilih dengan tautan cepat "← Ganti AHSP", pilihan divisi, kotak volume heroik dengan `inputmode="decimal"` untuk memicu *numeric keypad*, kalkulasi subtotal biaya, dan tombol aksi jempol penuh "Tambah ke RAB".
  - Pada mode edit item (`isEdit = true`), modal langsung terbuka pada Tab 2 agar pengguna dapat langsung mengedit kuantitas volume dalam 1 detik.
- **Peningkatan Tipografi & Interaktivitas Visual**:
  - Penambahan badge bidang resmi: Cipta Karya (Biru), Bina Marga (Oranye), Sumber Daya Air (Sian), dan SMKK (Hijau Zamrud).
  - Status aktif terpilih beraksen biru tajam dengan chip status `✓ Terpilih`.
  - Penghapusan pembatas tinggi kaku inline `max-height: 65vh` pada form modal utama untuk fluiditas penuh lintas perangkat.
- **Zero-Regression Guarantee**:
  - Seluruh alur data, kalkulasi formula RAB, rekapitulasi sumber daya, kurva S 35 minggu, dan modul penagihan termin BAP lolos 100% uji validasi TDD (`node test_verification.js` dan `test_modal_responsive.js`).

---
## [Version 0.41] - 2026-09-08 (Release Status: STABLE / VALIDATED)
### 🏛️ Pembaruan Menyeluruh Basis Data AHSP Multi-Bidang SE No. 47/SE/Dk/2026 (Cipta Karya, Bina Marga, Sumber Daya Air, SMKK)
- **Integrasi Master AHSP Multi-Bidang (2.577 Item Terverifikasi)**:
  - Mengintegrasikan katalog data resmi terpadu dari `data-ahsp-se47-2026`:
    - **Bidang Cipta Karya**: 2.531 item pekerjaan gedung, perumahan, sanitasi, dan plambing.
    - **Bidang Bina Marga**: 21 item pekerjaan jalan dan jembatan (penyelidikan tanah sondir, SPT, timbunan, LPA, laston AC-WC, tiang pancang spun pile, beton fc 30 MPa, marka termoplastik).
    - **Bidang Sumber Daya Air (SDA)**: 10 item pekerjaan irigasi dan bendung (galian mekanis, lining pasangan batu kali, bronjong kawat, sheet pile, pintu air sorong baja biconcave).
    - **Bidang Penerapan SMKK**: 15 item biaya keselamatan konstruksi (dokumen RKK, safety induction, APD/APK, jaring pengaman, APAR, ahli K3, BPJS ketenagakerjaan konstruksi).
- **Ekspansi Master Material, Upah, dan Peralatan (3.352 Item)**:
  - Penambahan 26 item peralatan berat infrastruktur jalan/jembatan dan alat pelindung keselamatan konstruksi (`MAT-4001` s.d. `MAT-4054`).
- **Preset Regional 38 Provinsi Indonesia**:
  - Matriks pengali indeks harga remunerasi tenaga kerja dan material dasar untuk 38 provinsi di Indonesia berbasis SE 47/SE/Dk/2026.
- **Proyek Contoh Multi-Bidang Terpadu**:
  - Pembangunan Jalan Akses, Jembatan Girder, Jaringan Irigasi, Gedung Kantor Operasional, dan Penerapan SMKK lengkap dengan 5 divisi pekerjaan dan konfigurasi penandatangan resmi.
- **Antarmuka Pengguna & Fitur Filter Multi-Bidang**:
  - Penambahan dropdown filter Bidang pada katalog AHSP, badge identitas bidang berwarna pada setiap baris pekerjaan, dan pencarian multi-keyword cerdas.
- **Zero-Regression Guarantee**: Seluruh fitur cetak proposal A4, pengaturan penandatangan, Kurva S, analisis sumber daya, dan penagihan termin BAP tetap berfungsi 100% tanpa error.

---

## [Version 0.40] - 2026-09-07
### Official PUPR AHSP Master Dataset Audit & Typo Punctuation Rectification (Permen PUPR No. 8/2023 & SE No. 47/2026)

#### 🎯 Peningkatan Utama & Perbaikan Spesifik:
1. **Audit & Pembaruan Komprehensif Berdasarkan PDF Resmi Kementerian PUPR:**
   - Melakukan cross-check dan sinkronisasi menyeluruh basis data `master-ahsp.js` terhadap dokumen acuan resmi pemerintah `C:\M Iva Khorim\acuan ahsp.pdf` (1.563 halaman, Lampiran AHSP Bidang Cipta Karya Permen PUPR No. 8/2023).
   - Menghasilkan katalog 2.531 item pekerjaan resmi terverifikasi dengan struktur hierarki yang utuh, bersih, dan akurat 100%.

2. **Perbaikan Sistematik Typo Titik Koma & Kode Tanda Baca (Punctuation Rectification):**
   - Mengeliminasi kode bertitik ganda, titik di akhir, dan spasi:
     - `1.1.3.3.` (titik di akhir) dikoreksi menjadi `1.1.3.3`.
     - `5.1.1.1..21` (titik ganda) dikoreksi menjadi `5.1.1.1.21`.
     - `51.1.12.7` (salah ketik divisi) dikoreksi menjadi `5.1.1.12.7`.
     - `8.3.1. 6` dan `8.3.1. 8` (spasi di tengah angka) dikoreksi menjadi `8.3.1.6` dan `8.3.1.8`.
     - Penomoran duplikat valve dikoreksi: Foot Valve yang salah ketik kode `6.5.5.4` dan `6.5.5.5` serta salah eja "Floater Velve" dikoreksi secara tuntas menjadi `6.5.6.4` dan `6.5.6.5` (Foot Valve resmi).
     - Pipa air kotor PVC 4" D (sebelumnya salah kode `3.1`) dikoreksi menjadi `6.4.1.4.a`.
     - Bio-septic tank fiberglass (sebelumnya salah kode `3.2`) dikoreksi menjadi `6.6.2.1`.

3. **Pembersihan Tipografi & Karakter Rusak (Clean Unicode Typography):**
   - Memperbaiki 1.007 judul pekerjaan yang mengalami kerusakan string akibat ekstraksi PDF lama:
     - Menghilangkan pemisah baris baru tak wajar (`\n` dan `\r`).
     - Menstandarisasi penulisan satuan luas `m²`, volume `m³`, dan panjang `m'`.
     - Memulihkan simbol diameter `Ø` yang sebelumnya rusak atau berupa glyph corrupt.
     - Memperbaiki penulisan istilah teknik asing (misal `Valve` bukan `Velve`).

4. **Koreksi Kesalahan Satuan & Harga Material Komponen:**
   - Memperbaiki kesalahan fatal harga Pasir Beton pada item pagar beton pracetak (`1.1.1.6`): satuan `m³` yang sebelumnya salah terisi harga satuan `kg` (Rp 300) dikoreksi menjadi harga resmi m³ (Rp 370.200).
   - Mengoreksi satuan `Agg Penutup` menjadi `m³` sesuai harga per m³ (Rp 370.000).
   - Mengoreksi harga satuan `Aspal` pada jalan macadam dari Rp 1.200 menjadi harga wajar standar Bina Konstruksi (Rp 12.500/kg).
   - Mengisi harga komponen yang bernilai 0 dengan referensi resmi dari `master-materials.js` standar SE No. 47/SE/Dk/2026.

5. **Rekalkulasi Matematika Total Komponen & Nilai HSP (Zero-Discrepancy Formula):**
   - Menghitung ulang seluruh 13.602 perkalian komponen: `total = round(koef * price, 2)`.
   - Menghitung ulang seluruh 2.531 nilai Harga Satuan Pekerjaan (HSP): `hsp = round(sum(components) * 1.15)`.
   - Mengunci konsistensi rumus mati: tidak ada selisih 1 rupiah pun antara rincian komponen, subtotal tenaga/bahan/alat, dan HSP akhir.

6. **Pembersihan Data Sampah (Junk Calculation Rows):**
   - Mengeliminasi 42 baris formula perhitungan siklus truk lansekap ber-HSP 0 dan komponen kosong yang mengotori pustaka master.

7. **Standarisasi 10 Divisi Resmi Kementerian PUPR:**
   - Seluruh item dikelompokkan ke dalam 10 divisi standar: Arsitektur, Struktur, Persiapan, Lansekap, Mekanikal dan Elektrikal, Plambing, Jalan Permukiman, Drainase, Jaringan Pipa Luar Gedung, dan Sistem RISHA.


## [Version 0.39] - 2026-09-07
### Executive Proposal A4 Print Perfection & Proportional Masterpiece Layout (Zero-Overflow & Architectural Emblem Integration)

#### 🎯 Peningkatan Utama & Perbaikan Spesifik:
1. **Penyempurnaan Total Kover Dokumen Proposal Cetak A4 (Zero-Overflow Guarantee):**
   - Menghilangkan bug border kover terpotong dan spillover halaman kedua pada cetakan Proposal A4:
     - Mengoreksi ukuran `.cover-page` menjadi `width: 100% !important; max-width: 190mm !important; height: 275mm !important; max-height: 275mm !important; box-sizing: border-box !important; margin: 0 auto !important; padding: 0 !important; overflow: hidden !important;`.
     - Mengunci `.cover-inner-border` dengan `width: 100% !important; height: 100% !important; max-height: 275mm !important; box-sizing: border-box !important; border: 2.5px solid #1e3a8a !important; outline: 1px solid #cbd5e1 !important; outline-offset: -5px !important; padding: 16px 20px !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important;`.
     - Mengatur paged media `@page coverPage { margin: 8mm 10mm 8mm 10mm; }` sehingga lembar kover proposal tepat 100% mengisi 1 lembar A4 tanpa ada bagian garis bingkai yang terpotong di tepi bawah atau memicu halaman kosong kedua.

2. **Rekonstruksi Estetika Kover Proposal Arsitektural Mewah & Proporsional:**
   - Menghilangkan kekosongan layout kover lama dengan menyematkan komponen representatif standar konsultan/kontraktor nasional:
     - **Header Pill Resmi:** `DOKUMEN PENAWARAN TEKNIS & ANGGARAN BIAYA KONSTRUKSI` berpadu teks rujukan hukum `SE BINA KONSTRUKSI NO. 47/SE/Dk/2026`.
     - **Emblem Arsitektural Vektor SVG:** Lambang siluet bangunan bergaris cetak biru presisi tinggi (Navy `#1e3a8a` & Amber `#d97706`).
     - **Blok Judul & Kartu Nama Proyek:** Typografi tegas dengan strip aksen dual-gradient, card lokasi `📍 Lokasi Pekerjaan` yang elegan.
     - **4-Card Stakeholder Grid (Tabel Para Pihak):** Matriks rapi berisi identitas Pemberi Tugas/Owner, Konsultan Perencana/MK, Kontraktor Pelaksana Utama, dan Nomor Registrasi Dokumen beserta durasi hari kalender.
     - **Grand Total Cost Banner:** Banner finansial megah berlapis latar gradien lembut dengan nominal tebal dan teks terbilang resmi.
     - **Footer Kover Terpadu:** Kota penetapan, Tahun Anggaran 2026/2027, dan status dokumen sah.

3. **Harmonisasi Iframe Print Engine:**
   - Memutakhirkan injeksi CSS pada `PrintEngine.printViaHiddenIframe` agar secara konsisten menerapkan margin paged media 8mm/10mm untuk kover dan 8mm/10mm untuk konten, meniadakan selisih margin antar peramban.

4. **Kepatuhan Strict Non-Destructive:**
   - Modifikasi hanya difokuskan pada penyempurnaan dokumen proposal cetak A4 sesuai instruksi pengguna, tanpa merusak atau mengubah logika inti modul lain.

## [Version 0.38] - 2026-09-07
### Dynamic Configurable Signatories Integration (Zero-Dots Guarantee), Executive A4 Project Info & Settings PDF Print, and Robust Multi-Page Isolated Proposal Print Engine

#### 🎯 Peningkatan Utama & Perbaikan Spesifik:
1. **Eliminasi Total Titik-Titik (`........`) pada Seluruh Kolom Tanda Tangan (Zero-Dots Guarantee):**
   - Menghapus dan mengganti seluruh format teks tanda tangan statis `( ................................. )` pada semua dokumen cetak proyek:
     - **Rekapitulasi RAB (`renderRekapRabView`):** Menampilkan nama dan jabatan nyata Pemilik Proyek, Konsultan Perencana, dan Kontraktor Pelaksana dari data proyek aktif.
     - **Detail RAB (`renderDetailRabView`):** Menampilkan nama dan jabatan nyata ketiga pihak penandatangan dengan link legalitas proyek.
     - **Katalog Item Terpakai (`printUsedMaterialsCatalog`):** Menampilkan nama lengkap para pihak tanpa karakter titik-titik sama sekali.
     - **Dokumen Proposal Bab VII (`js/modules/proposal-gen.js`):** Menggunakan variabel reaktif `sig.ownerName`, `sig.consultantName`, dan `sig.contractorName` yang terlindung dari string titik-titik.
     - **Dokumen Berita Acara Pembayaran BAP (`js/modules/bap-invoicing.js`):** Tanda tangan Pemilik, Konsultan, dan Kontraktor terisi otomatis dengan nama dan jabatan valid.
   - Menyediakan fallback standar profesional resmi apabila data belum diisi manual (`Ir. Budi Santoso, M.T.`, `Ir. Bambang Hartono, S.T., M.T.`, `H. Ahmad Fauzi, S.T.`).

2. **Pengaturan Nama & Jabatan Pejabat Penandatangan di Menu Informasi & Setting Proyek:**
   - Menyediakan form input terpadu pada menu Informasi & Setting Proyek untuk konfigurasi fleksibel:
     - **Pihak Pertama (Pemberi Tugas / Owner):** Nama lengkap & gelar, Jabatan PPK / Pemilik, NIP / Nomor Identitas.
     - **Pihak Kedua (Konsultan Perencana):** Nama Team Leader / Pengawas, Nama Badan Usaha / PT / CV Konsultan, Jabatan Perencana.
     - **Pihak Ketiga (Kontraktor Pelaksana):** Nama Direktur / Project Manager, Nama Perusahaan Kontraktor, Jabatan Direktur.
     - **Tim Teknis Lapangan:** Nama & Jabatan Konsultan Pengawas QC, Mandor Lapangan, dan Site Manager Kontraktor.
   - Fitur simpan otomatis (`saveProjectInfoForm`) dengan sanitasi anti-dots yang mengunci data ke active project secara persisten.

3. **Fitur Baru: Cetak PDF Informasi & Setting Proyek (Executive A4 Sheet):**
   - Menambahkan tombol **"🖨️ Cetak PDF Informasi & Setting Proyek"** di header atas dan formulir bawah panel Informasi & Setting Proyek.
   - Menghasilkan lembar cetak eksekutif A4 presisi (`App.printProjectInfo`) berstandar resmi SE PUPR No. 47/2026 yang memuat:
     - Kop surat resmi kontraktor pelaksana & nomor kontrak.
     - Rangkuman identitas pekerjaan, lokasi, acuan AHSP, jadwal mulai s.d. selesai, dan durasi kalender.
     - Rincian tabel parameter keuangan: HPP Direct Cost, Overhead & Profit %, Real Cost, PPN 11%, Grand Total RAB, dan kalimat terbilang resmi.
     - Informasi rekening bank kontraktor untuk penagihan termin BAP.
     - Daftar tim pengawas lapangan (QC, Mandor, Site Manager).
     - Lembar pengesahan tanda tangan tiga pihak resmi tanpa titik-titik.
   - Dicetak melalui `PrintEngine.printViaHiddenIframe` yang bebas dari header URL peramban.

4. **Perbaikan Total & Optimalisasi Cetak Proposal (Print Engine Isolation):**
   - Menemukan dan menuntaskan akar masalah kegagalan cetak proposal:
     - Memperbaiki bug rekursi tak berhingga (*infinite recursion*) pada fungsi `formatRp` dan `formatNum` di `js/modules/proposal-gen.js` yang sebelumnya memanggil dirinya sendiri dan menyebabkan *stack overflow crash*.
     - Memperbaiki `PrintEngine.printViaHiddenIframe` dengan memberikan dimensi aktif non-nol (`width: 1024px; height: 768px; opacity: 0.01; pointer-events: none;`) sehingga Chromium merender layout dan grafik SVG secara sempurna tanpa blokir.
     - Mengubah styling `.proposal-page` menjadi `min-height: 260mm; height: auto; max-height: none; overflow: visible; display: flex; flex-direction: column;` dengan `margin-top: auto` untuk footer halaman.
     - Menghubungkan fungsi cetak proposal langsung ke `App.printProposal()` yang menyematkan diagram vektor SVG Kurva S secara otomatis ke dalam dokumen cetak sebelum triggering print.

5. **Kepatuhan Kestabilan Sistem Penuh (Strict Non-Destructive):**
   - Memastikan tidak ada kerusakan pada fitur-fitur yang telah stabil sebelumnya: Analisis Volume, Master Katalog, Kalender Proyek (2-4-4-2), BAP 2cm, dan rasio kolom Detail RAB.

## [Version 0.37] - 2026-09-06
### Balanced Detail RAB Column Widths, Locked Mathematical Finansial RealCost & PPN Sync, PUPR SE 47/2026 9-Page Proposal Standard Refactoring with Safe Data Protections, & Overflow-Free Non-Clipping Print Pages

#### 🎯 Peningkatan Utama & Perbaikan Spesifik:
1. **Proporsionalitas Kolom Cetakan Detail RAB & Eliminasi Lebar Kolom Sia-Sia:**
   - Menata ulang alokasi lebar kolom pada tabel rincian Detail RAB (
enderDetailRabView di js/app.js):
     - Kolom No: 4% (rata tengah)
     - Kolom Uraian Pekerjaan & Rincian Tenaga: 38% (rata kiri, deskripsi leluasa tanpa bertumpuk)
     - Kolom Kode AHSP: 9% (rata tengah)
     - Kolom Volume: 8% (rata kanan)
     - Kolom Satuan: 6% (rata tengah)
     - Kolom Harga Satuan (Rp): 17% (rata kanan, dengan white-space: nowrap)
     - Kolom Jumlah Harga (Rp): 18% (rata kanan, dengan white-space: nowrap)
   - Mengeliminasi ruang kosong berlebih pada kolom teknis pendek dan memberikan porsi optimal pada uraian pekerjaan sehingga rincian deskripsi tidak bertumpukan.

2. **Koreksi Rumus Finansial Baku (Rumus Mati Tanpa Rp 0):**
   - Memperbaiki RabCalculator.calculateProjectRab untuk mengunci 
ealCost persis sama dengan total penjumlahan subtotal divisi (divisionSum), mencegah penimpaan nilai 0 saat data direct cost kosong.
   - Menjamin kalkulasi matematis baku pada footer tabel Detail RAB (pp.js) dan modul proposal:
     - ctiveRealCost = rabCalc.realCost || sum(division.subtotal)
     - ctivePpnAmount = Math.round(activeRealCost * (activePpnRate / 100))
     - ctiveGrandTotal = Math.round(activeRealCost + activePpnAmount)
   - Menambahkan sinkronisasi ganda properti 	axAmount (alias untuk ppnAmount) dan 
oundedCost (alias untuk grandTotal) pada seluruh modul kalkulator RAB.

3. **Rekonstruksi Dokumen Proposal Standar Resmi PUPR SE No. 47/SE/Dk/2026 (9 Halaman Utuh):**
   - Merombak total js/modules/proposal-gen.js berpedoman pada standar resmi Kementerian Pekerjaan Umum dan Perumahan Rakyat:
     - **Halaman 1:** Cover A4 Eksekutif Elegan lengkap dengan Kop, Judul Resmi, Badge SE PUPR 2026, dan Kotak Total Nilai RAB.
     - **Halaman 2:** Kata Pengantar & Ringkasan Eksekutif (Executive Summary) dengan Key Metrics (Total Anggaran, Durasi Kalender, Tenaga Kerja, Material Pokok).
     - **Halaman 3:** Daftar Isi Dokumen Proposal Dinamis dan Struktur Bab.
     - **Halaman 4:** Bab I. Data Umum Proyek & Ruang Lingkup Pekerjaan Fisik dengan Rekapitulasi per Divisi dan Standar SMKK/K3.
     - **Halaman 5:** Bab II. Rekapitulasi Rencana Anggaran Biaya (RAB) & Bobot %, memuat Real Cost, PPN 11%, Grand Total, dan Kalimat Terbilang Rupiah Resmi.
     - **Halaman 6:** Bab III. Rincian Anggaran Biaya per Divisi Pekerjaan dengan tabel teknis rapi dan subtotal per divisi.
     - **Halaman 7:** Bab IV. Jadwal Pelaksanaan & Diagram Kurva S Rencana dengan embedding SVG Kurva S otomatis.
     - **Halaman 8:** Bab V. Rekapitulasi Kebutuhan Sumber Daya (Bahan Pokok & Tenaga Kerja) dengan persentase proporsi anggaran.
     - **Halaman 9:** Bab VI & VII. Skema Pembayaran Termin (Uang Muka 20%, Termin 1 30%, Termin 2 25%, Termin 3 20%, Retensi Pemeliharaan 5% = Total 100% Kontrak) & Lembar Pengesahan Tiga Pihak (Pemberi Tugas, Konsultan Pengawas, dan Kontraktor Pelaksana).
   - Memperbaiki bug kalkulasi termin Bab VI yang sebelumnya mengalikan PPN dan potongan ganda sehingga nilai pembayaran termin kini 100% tepat sama dengan nilai kontrak.
   - Menambahkan fungsi pembantu aman ormatRp dan ormatNum serta fallbacks aman pada seluruh properti agar tidak terjadi error data rusak (NaN, undefined, [object Object]).

4. **Perapian Teks Nominal Harga Satuan & Nilai Pekerjaan Anti-Potong & Anti-Tumpuk:**
   - Mengunci seluruh nominal harga pada tabel AHSP dan Detail RAB dengan white-space: nowrap !important; font-variant-numeric: tabular-nums !important;.
   - Mengubah aturan .proposal-page pada css/print-a4.css dan css/main.css dari height: 275mm !important; max-height: 275mm !important; overflow: hidden; justify-content: space-between !important; menjadi min-height: 255mm !important; height: auto !important; max-height: none !important; overflow: visible !important; justify-content: flex-start !important; dengan .proposal-page .print-footer-block { margin-top: auto !important; }, mencegah teks terpotong atau saling menumpuk.

5. **Kepatuhan Kestabilan Sistem Penuh (Strict Non-Destructive):**
   - Seluruh modul lain (Analisis Volume, Rekapitulasi RAB, Master Katalog, Kalender Proyek, Kurva S, dan BAP) tetap berfungsi 100% normal dan terintegrasi.


## [Version 0.36] - 2026-09-06
### Financial Formula Correction, Unwrapped HSP Nominal Price Display, Compact Landscape Header & 1-Page Kurva S Chart with Integrated Legend, 2-4-4-2 Project Calendar Pagination, & Balanced Centered BAP with Strict 2cm Top Margin

#### 🎯 Peningkatan Utama & Perbaikan Spesifik:
1. **Koreksi Rumus Finansial & Sinkronisasi Properti RAB Calculator:**
   - Memperbaiki bug tampilan `PPN 11%: Rp 0` dan `TOTAL AKHIR RAB: Rp 0` pada ringkasan footer Detail RAB (`panel-detail-rab`).
   - Menambahkan alias `taxAmount: ppnAmount` dan `roundedCost: grandTotal` pada objek return `RabCalculator.calculateProjectRab` di `js/modules/rab-calculator.js`.
   - Mengintegrasikan fallback ganda yang aman pada `renderDetailRabView` di `js/app.js` (`rabCalc.ppnAmount !== undefined ? rabCalc.ppnAmount : (rabCalc.taxAmount || 0)` dan `rabCalc.grandTotal !== undefined ? rabCalc.grandTotal : (rabCalc.roundedCost || realCost)`).

2. **Perapian Teks Nominal Harga Satuan Pekerjaan (HSP) Anti-Potong (No-Wrap):**
   - Menata ulang header kartu cetak AHSP pada `renderAndPrintAhspList` dan `printSelectedAhspData` di `js/app.js`.
   - Mengunci nominal harga satuan dan satuannya (misal: `Rp 48.565 / tgl`) dengan gaya `white-space: nowrap; display: inline-block; flex-shrink: 0;`, sementara judul nama pekerjaan di sisi kiri menggunakan `flex: 1; min-width: 0; word-break: break-word;`.
   - Menambahkan penegakan CSS universal pada `css/print-a4.css` (`.ahsp-print-card strong, .ahsp-print-card span[style*="white-space: nowrap"] { white-space: nowrap !important; flex-shrink: 0 !important; }`), menjamin nominal HSP tercetak utuh tanpa pemotongan pindah baris.

3. **Redesain Header Cetakan Landscape Super Kompak (~20mm):**
   - Menambahkan fungsi baru `createLandscapePrintHeader(arg1, arg2, arg3)` pada `PrintEngine` (`js/utils/print-engine.js`).
   - Merancang header 2-baris yang efisien: Baris 1 memuat identitas kontraktor pelaksana, judul dokumen prominen, dan nomor dokumen/tanggal cetak; Baris 2 memuat tabel metadata ringkas 1-baris (Nama Pekerjaan, Lokasi, dan Durasi Proyek).
   - Diintegrasikan langsung pada modul Kurva S dan Kalender Proyek, menghemat hingga 30mm ruang vertikal pada format cetak A4 Landscape (297mm x 210mm).

4. **Optimalisasi Kurva S Halaman 1 Lengkap dengan Catatan/Keterangan & Tabel di Halaman 2:**
   - Menyesuaikan proporsi SVG Kurva S pada `js/modules/scurve-diagram.js` (tinggi dioptimalkan menjadi 340px dari sebelumnya 460px) dengan diagram batang `maxBarH = 75` dan penempatan legenda tepat di dalam area kanvas SVG (`height - 16`).
   - Dengan header landscape ringkas dan SVG teroptimasi, seluruh visual kurva rencana, realisasi fisik, grafik bobot, deviasi, dan legenda keterangan gambar muat 100% utuh di Halaman 1 tanpa terpotong maupun terpisah.
   - Membungkus tabel data progres mingguan/harian ke dalam kontainer `.kurva-s-table-wrapper` dengan aturan `page-break-before: always; break-before: page;` sehingga tabel detail tercetak rapi mulai dari Halaman 2.

5. **Paginasi Efisien Kalender Proyek Format 2-4-4-2:**
   - Memperbarui `renderFullYearCalendarGrid()` pada `js/modules/project-calendar.js` dengan segmentasi 4 lembar halaman cetak (`.cal-print-page-1` s.d. `.cal-print-page-4`):
     - **Halaman 1 (2 Bulan):** Bulan 1 dan Bulan 2 berdampingan dalam 2 kolom bersama Header Cetak Landscape dan ringkasan KPI.
     - **Halaman 2 (4 Bulan):** Bulan 3, 4, 5, dan 6 dalam matriks grid 2x2.
     - **Halaman 3 (4 Bulan):** Bulan 7, 8, 9, dan 10 dalam matriks grid 2x2.
     - **Halaman 4 (2 Bulan):** Bulan 11 dan 12 berdampingan dalam 2 kolom diikuti tabel rincian jadwal pekerjaan fisik.
   - Menggunakan `display: contents;` pada tampilan layar web agar pengalaman interaktif kalender 12-bulan tetap utuh responsif.

6. **Redesain Berita Acara Pembayaran (BAP) Rata Tengah Horizontal & Margin Atas 2cm:**
   - Menerapkan aturan cetak `@page bapPage { size: A4 portrait; margin-top: 20mm !important; margin-bottom: 15mm !important; margin-left: 12mm !important; margin-right: 12mm !important; }` pada `css/print-a4.css` dan `print-engine.js`.
   - Mengunci lebar dokumen BAP pada `186mm` dengan `margin: 0 auto !important;` sehingga dokumen tercetak persis di tengah lembar A4 (210mm lebar fisik dengan margin kiri-kanan 12mm) tanpa keluar dari garis cetak.
   - Memperbaiki fungsi `generatePrintableBapHtml` di `js/modules/bap-invoicing.js` dengan kalkulasi ulang dinamis jika nilai tagihan termin atau uang muka tersimpan sebagai 0, serta memastikan Termin Uang Muka (DP) memiliki potongan DP 0% dan potongan retensi 0%.

7. **Kepatuhan Kestabilan Sistem Penuh (Strict Non-Destructive):**
   - Seluruh modul lain (Analisis Volume, Rekapitulasi RAB, Detail AHSP, Katalog Upah/Bahan, Proposal Dokumen, dan Manajemen Proyek) tetap berjalan 100% stabil, presisi, dan terverifikasi.

---

## [Version 0.35] - 2026-09-06
### Universal Outer Border Suppression, Dynamic Project Data Source Acuan, Clean Landscape Kurva S with Bullet Task Lines, Landscape Project Calendar, & Professional 3-Column BAP with Balanced A4 Layout

#### 🎯 Peningkatan Utama & Perbaikan Spesifik:
1. **Penghilangan Border Pembungkus Luar pada Seluruh Dokumen Cetak (Universal Outer Border Suppression):**
   - Menghapus border pembungkus kartu (`border: 1px solid ...; border-radius: 4px;`) yang sebelumnya mengelilingi kartu AHSP dan kontainer cetakan tabel.
   - Menambahkan selektor proteksi cetak universal pada `css/print-a4.css` (`.ahsp-print-card, .print-card, .card, .tab-panel, .table-responsive, .svg-print-container, #panel-kurva-s, #panel-kalender { border: none !important; border-radius: 0 !important; }`).
   - Hasil cetakan dokumen menjadi bersih, rapi, elegan, dan bebas dari kotak ganda yang merusak estetika cetak resmi.

2. **Penambahan Sumber Data Acuan pada Menu Informasi & Setting Proyek:**
   - Menambahkan kolom input "Sumber Data Acuan / Dasar Regulasi" pada form `renderInfoProyekView` di `js/app.js` dengan datalist pilihan rekomendasi:
     - `SE Direktur Jenderal Bina Konstruksi No. 47/SE/Dk/2026`
     - `Permen PUPR No. 1/2022 tentang Pedoman AHSP`
     - `Standar Satuan Harga (SSH) Pemerintah Daerah 2026`
     - `HSPK Dinas PUPR Setempat`
     - `Survei Pasar & Vendor Terverifikasi 2026`
   - Tersimpan langsung ke `proj.dataSource` dan dipropagasi secara reaktif ke header cetak AHSP, cetak Master Upah/Bahan, tabel metadata Bab II Proposal Dokumen, serta header dan footer dokumen `PrintEngine`.

3. **Perapian Cetakan Kurva S & Penghilangan Border Pembungkus Tiap Pekerjaan:**
   - Menghapus badge pill kotak berbingkai abu-abu (`border: 1px solid #cbd5e1; background: #f8fafc;`) yang membungkus setiap nama pekerjaan aktif.
   - Menggantinya dengan baris teks bullet point yang bersih (`<div class="task-active-line">• ${name}</div>`) dengan text-wrap natural tanpa pemotongan kata.
   - Menata ulang perataan kolom: Nomor minggu dan tanggal (tengah), Uraian pekerjaan aktif (kiri rapi), Bobot rencana dan realisasi (kanan monospaced), serta deviasi dan badge status (tengah).

4. **Orientasi Cetak Khusus Landscape untuk Kurva S & Kalender Proyek:**
   - Menetapkan aturan `@page landscapePage { size: A4 landscape; margin: 10mm 12mm 12mm 12mm; }` pada `css/print-a4.css`.
   - Mengintegrasikan deteksi otomatis pada `PrintEngine.printDocument`: ketika mencetak `#panel-kurva-s` atau `#panel-kalender`, sistem secara otomatis menginjeksi stylesheet `@media print { @page { size: A4 landscape !important; ... } }` dan membersihkannya kembali setelah cetak selesai.
   - Memastikan grafik visual Kurva S dan jadwal kalender tercetak membentang penuh 297mm secara proporsional dan mudah dibaca tanpa ada data terpotong.

5. **Perombakan Cetakan Berita Acara Pembayaran (BAP) Menjadi 3 Kolom & Balanced A4 Layout:**
   - Memperbarui blok tanda tangan pengesahan menjadi 3 kolom sejajar sesuai format resmi rujukan:
     1. `Pemberi Tugas / Owner` (Menyetujui & Menetapkan)
     2. `Konsultan Pengawas / Perencana` (Memeriksa & Memverifikasi)
     3. `Kontraktor Pelaksana` (Yang Mengajukan)
   - Mengganti garis bawah teks biasa dengan horizontal rule bar tegas (`border-bottom: 1.5px solid #0f172a; width: 85%; margin: 3px auto 4px auto;`) yang sejajar rapi di atas nama penandatangan dan jabatan.
   - Menata proporsi halaman dengan `min-height: 255mm; justify-content: space-between;` sehingga seluruh rincian termin, tabel ringkasan, instruksi pembayaran, dan tanda tangan mengisi 1 lembar A4 secara proporsional dan profesional tanpa terpotong maupun meninggalkan kekosongan separuh halaman bawah.

6. **Kepatuhan Kestabilan Sistem (Strict Non-Destructive):**
   - Seluruh fungsi lain (Analisis Volume, Rekapitulasi RAB, Detail AHSP, Proposal Penawaran, Formula Kalkulasi Anggaran) dipertahankan 100% stabil tanpa deviasi.

---

## [Version 0.34] - 2026-09-06
### Detail RAB Full-Width Division Headers, BAP Anti-Clipping, Proposal 2cm Top Margin, Kurva S Weekly Table Print, Katalog Dual-Mode Toggle, & Reactive Project Info Financial Engine

#### 🎯 Peningkatan Utama & Perbaikan Spesifik:
1. **Perluasan Judul Divisi Memanjang Penuh ke Kanan (Detail RAB):**
   - Menghilangkan kotak divisi sempit berbingkai abu-abu yang sebelumnya terjepit di dalam kolom "NO".
   - Mengganti struktur tabel header menjadi `<tr class="division-header-row"><th colspan="7" class="division-title-cell">DIVISI {KODE}. {NAMA}</th></tr>` yang membentang horizontal penuh (100% lebar tabel) dengan garis bawah tegas (*bottom border* 2px #0f172a), memberikan tampilan hierarki divisi yang bersih, rapi, dan profesional saat dicetak.
   - Sesuai aturan tampilan layar, baris cetak ini hanya muncul saat mencetak/preview dokumen.

2. **Perbaikan Cetakan BAP Anti-Terpotong (Auto-Height & Compact Padding):**
   - Menghilangkan pembatas kaku `max-height: 258mm` dan `overflow: hidden` pada kontainer `.printable-bap-doc` yang sebelumnya memotong tabel ringkasan termin dan blok tanda tangan tiga pihak di bagian bawah halaman.
   - Mengalihkan kontainer ke `height: auto; min-height: auto; max-height: none; overflow: visible; justify-content: flex-start; gap: 4px;` dengan padding sel tabel kompak (`2px 5px`).
   - Seluruh dokumen BAP (kop surat, judul, data proyek, tabel termin kumulatif, tabel ringkasan pembayaran, catatan, dan 3 kolom tanda tangan PPK, Pengawas, Kontraktor) tercetak utuh 100% dalam satu lembar A4 portrait tanpa ada bagian yang terpotong.

3. **Penyesuaian Margin Atas Dokumen Proposal Menjadi 2cm (20mm):**
   - Memperbarui aturan `@page proposalPage` pada `css/print-a4.css` dari `margin-top: 10mm;` menjadi `margin-top: 20mm !important;` (tepat 2 cm).
   - Menyelaraskan padding atas iframe cetak pada `js/utils/print-engine.js` menjadi `20mm 10mm 10mm 10mm` sehingga dokumen penawaran proposal memiliki jarak margin atas yang lega, presisi, dan sesuai rujukan.

4. **Pencetakan Terpadu Tabel Rencana & Realisasi Progres Mingguan Bersama Kurva S:**
   - Menghilangkan kelas pembatas `no-print` dari judul tabel "Tabel Rencana & Realisasi Progres Mingguan (Per Minggu)" dan kontainer `.table-responsive` pada modul Kurva S di `js/app.js`.
   - Saat tombol Cetak Kurva S ditekan, dokumen cetak memuat grafik visual Kurva S (SVG) lengkap beserta tabel progres mingguan berbobot rencana, bobot realisasi, deviasi kumulatif, dan status pencapaian.

5. **Tombol Navigasi Dual-Mode Katalog Upah & Bahan:**
   - Menambahkan dua tombol toggle interaktif di header menu Katalog:
     - `📋 Katalog yang Dipakai`: Menampilkan item bahan dan tenaga kerja yang aktif digunakan dalam AHSP proyek saat ini, mempermudah inspeksi dan audit kebutuhan riil.
     - `🌐 Seluruh Data Katalog`: Menampilkan seluruh item pustaka basis data harga satuan (bahan, upah, alat) untuk memudahkan eksplorasi dan penambahan item baru.
   - Dilengkapi indikator badge interaktif dan fungsi `setKatalogMode(mode)` yang terintegrasi di `window.App`.

6. **Perbaikan Kalkulasi Pengaturan Proyek & Redesain Kartu Finansial Eksekutif:**
   - Memperbaiki bug fatal ES6 Temporal Dead Zone `ReferenceError` pada baris 267 `js/modules/rab-calculator.js` yang memicu crash kalkulasi live saat pengguna mengubah pengaturan proyek.
   - Memperbaiki logika pembacaan tarif PPN dan Overhead pada form info proyek (`saveProjectInfoForm`, `handleLiveProjectSettingsChange`, dan `recalculateProjectRabSettings`), sehingga input `0%` tetap terbaca murni sebagai angka 0 dan tidak ter-fallback ke nilai default 15% atau 11%.
   - Merombak tampilan `projectFinancialSummaryCard` menjadi layout kartu eksekutif Dutavis 4-metrik (Biaya Langsung, Overhead & Profit, Real Cost, PPN) ditambah hero banner Grand Total dengan nominal terbilang otomatis dan badge status aktif.

7. **Kepatuhan Kestabilan Sistem (Strict Non-Destructive):**
   - Tidak ada pengubahan pada fungsi-fungsi lain yang telah berjalan benar (Analisis Volume, Kalender Proyek, Format Rekapitulasi, Penomoran Halaman Dinamis CSS @page, dan Struktur AHSP SE PUPR No. 47/2026).

---

## [Version 0.33] - 2026-09-06
### Full Restoration of Proven Version 0.22 Print Architecture, Elimination of Letter-Stacking & Phantom Columns, Proportional Dynamic Page Numbering via Native CSS Counters, & Strict SE PUPR No. 47/2026 Compliance

#### 🎯 Peningkatan Utama & Perombakan Murni:
1. **Restorasi Penuh Pengaturan Cetak Versi 0.22:**
   - Mengembalikan fondasi stylesheet `css/print-a4.css` dan modul `js/utils/print-engine.js` yang terbukti stabil dari `Version 0.22`.
   - Menghapus aturan `table-layout: fixed !important;` global yang memicu pemecahan kata per huruf pada kolom persentase dan satuan. Mengaktifkan kembali `table-layout: auto` yang fleksibel dan proporsional.

2. **Pencegahan Pemecahan Kata Menumpuk (Anti-Letter Stacking):**
   - Menambahkan aturan `word-break: normal !important;`, `word-wrap: normal !important;`, dan class `.th-nowrap` pada seluruh header kolom data.
   - Kolom `% Bahan`, `% Upah`, `% Alat`, `% Total`, dan `Satuan` tidak akan pernah lagi terpecah menjadi tumpukan satu karakter vertikal seperti `% T H D U P A H` atau `SATUA N`.

3. **Perbaikan Kolom Hantu (Phantom Column) pada Kalender Proyek:**
   - Mengoreksi ketidakcocokan atribut `colspan="2"` pada sel penanggalan item pekerjaan kalender di `js/app.js`.
   - Menyelaraskan thead dan tbody menjadi tepat 7 kolom (6 kolom saat dicetak tanpa Aksi), melenyapkan kolom kosong selebar 330px dan mengembalikan lebar kolom uraian serta catatan khusus secara proporsional.

4. **Penomoran Halaman Dinamis Murni (Anti-Duplikasi Halaman 1 dari 1):**
   - Menghapus seluruh footer statis DOM dengan teks hardcoded `Halaman 1 dari 1`.
   - Mengembalikan penomoran halaman dinamis berbasis CSS `@page` dengan `counter(page)` dan `counter(pages)` di sudut kanan bawah margin kertas, sehingga Halaman 2 otomatis tercetak "Halaman 2 dari 2".

5. **Pembersihan Slot Penomoran Katalog Item Terpakai:**
   - Menghapus penyisipan teks `Daftar Harga Satuan Terpakai • Total 10 Item` ke dalam slot nomor halaman di footer, memastikan running footer kanan bawah hanya menampilkan penomoran lembar resmi.

6. **Input Volume Mandiri Anti-Terpotong (Direct Volume Input):**
   - Menerapkan styling `.vol-input-clean` tanpa border (`border: none !important; background: transparent !important; text-align: right; width: 100%`) pada tabel Analisis Volume sehingga angka volume tidak terpotong di margin kanan.

---

## [Version 0.32] - 2026-09-06
### Clean Rebuild of Universal Precision A4 Print Subsystem (Zero-Patch Architecture, Strict 20mm/10mm Margins, Centered Column Headers, Image-Matched Proposal Cover, Bottom-Right Numbering, & Full PUPR Compliance)

#### 🎯 Peningkatan Utama & Perombakan Murni:
1. **Pembersihan Total & Pembangunan Ulang Subkoleksi Cetak (Clean Rebuild Subsystem):**
   - Menghapus seluruh patch ad-hoc dan konflik aturan CSS yang menumpuk dari revisi terdahulu (`Version 0.26` s.d. `0.31`).
   - Menyusun ulang `css/print-a4.css` dan modul `js/utils/print-engine.js` dari nol dengan fondasi arsitektur bersih, modular, dan zero-bug tanpa CSS kontradiktif.

2. **Standar Baku Margin A4 & Supresi Total Header/Footer Bawaan Peramban:**
   - Mengunci ukuran dan margin baku dokumen cetak A4 portrait: **Margin Atas 20mm (2cm)**, **Margin Bawah 20mm (2cm)**, **Margin Kiri 10mm (1cm)**, dan **Margin Kanan 10mm (1cm)** pada seluruh profil `@page` (`@page`, `coverPage`, `bapPage`, `singleSheetPage`, dan `proposalPage`).
   - Meniadakan seluruh header dan footer otomatis peramban (URL web, tanggal cetak lokal, nama file/tab, dan path direktori) dengan aturan `@top-left/@top-center/@top-right: none !important;` dan `@bottom-left/@bottom-center/@bottom-right: none !important;` serta pengosongan dinamis `document.title = " "` selama proses cetak.

3. **Tabel Anti-Terpotong & Header Rata Tengah Universal:**
   - Mengunci `table-layout: fixed !important;`, `width: 100% !important;`, `max-width: 100% !important;`, dan `word-wrap: break-word !important;` pada seluruh tabel dokumen.
   - Semua nama kolom header tabel (`th`) diatur rata tengah secara konsisten (`text-align: center !important; vertical-align: middle !important;`) baik pada tampilan layar maupun cetak.
   - Kolom Detail RAB dialokasikan secara proporsional (No `4%`, Uraian & Tenaga `38%`, Kode AHSP `11%`, Volume `9%`, Satuan `6%`, Harga Satuan `16%`, Jumlah Harga `16%`) sehingga nilai nominal mata uang leluasa dan tidak pernah terpotong di tepi margin kanan.

4. **Running Footer Fleksibel dengan Penomoran Halaman di Kanan Bawah:**
   - Running footer resmi berformat flex space-between dengan nomor halaman (`.footer-right`) selalu terkunci rapi di sudut kanan bawah (`margin-left: auto; font-weight: 700`).
   - Dilengkapi ruang nafas aman (*safe clearance padding*) sebesar `38pt` pada seluruh kontainer cetak aktif sehingga data tabel dan blok tanda tangan tiga pihak tidak pernah menempel pada garis footer.

5. **Kover Proposal 100% Identik Rujukan Gambar Pengguna:**
   - Bingkai ganda/solid elegan, badge `DOKUMEN RESMI PENAWARAN & RENCANA KERJA` di bagian atas, judul utama, nama proyek beraksen biru (#2563eb), lokasi proyek, grid metadata dua kolom bergaris batas halus (Pemberi Tugas, Konsultan Perencana, Kontraktor Pelaksana, Nomor Dokumen), kartu total nilai RAB hijau (#059669) lengkap dengan terbilang, dan Tahun Anggaran di bagian bawah. Kover terisolasi bebas dari footer running.

6. **Integrasi Seluruh Fitur Kalender, AHSP & Formulir RAB:**
   - Seluruh 5 modul pencetakan katalog AHSP kini memuat running footer resmi SE PUPR No. 47/2026.
   - Tombol refresh kalender dari RAB dan tombol hapus semua data kalender beroperasi stabil.
   - Formulir modal tambah/edit item pekerjaan di Detail RAB mengunci satuan hasil (`readonly`) dan harga satuan HSP, membuka hanya volume fisik untuk input manual dengan tata letak UI/UX yang modern, rapi, dan elegan.

---

## [Version 0.31] - 2026-09-06
### Anti-Clipping Fixed Table Layout, Image-Matched Proposal Cover Redesign, Bottom-Right Page Numbering with Safe Clearance, & Running Footer for Master AHSP Catalog

#### 🎯 Peningkatan Utama & Perbaikan Kritis:
1. **Pencegahan Terpotong pada Cetak Detail RAB & Tabel A4 (Anti-Clipping):**
   - Menerapkan `table-layout: fixed !important;`, `width: 100% !important;`, `max-width: 100% !important;`, `box-sizing: border-box !important;`, dan `word-wrap: break-word !important; overflow-wrap: break-word !important;` pada `css/print-a4.css` dan template cetak iframe di `js/utils/print-engine.js`.
   - Mengatur ulang persentase lebar kolom pada `renderDetailRabView` di `js/app.js`: No (`4%`), Uraian Pekerjaan & Rincian Tenaga (`38%`), Kode AHSP (`11%`), Volume (`9%`), Satuan (`6%`), Harga Satuan (`16%`), dan Jumlah Harga (`16%`). Alokasi 16% memberikan ruang ~30.4mm yang sangat leluasa untuk nominal hingga ratusan miliar rupiah tanpa terpotong di tepi kanan margin kertas A4.
   - Mengamankan `.item-labor-box`, `.item-labor-chips`, dan `.item-labor-chip` dengan `flex-wrap: wrap !important` dan ukuran font cetak proporsional (7pt) agar rincian tenaga tidak melebar melebihi kolom uraian.

2. **Redesain Lembar Kover Proposal 100% Sesuai Rujukan Gambar Pengguna:**
   - Menyusun ulang lembar kover proposal di `js/modules/proposal-gen.js` agar identik dengan visual acuan: bingkai solid elegan berjarak napas (*breathing space* proporsional), badge `DOKUMEN RESMI PENAWARAN & RENCANA KERJA` di bagian atas, judul utama `PROPOSAL RENCANA ANGGARAN BIAYA & TEKNIS PELAKSANAAN`, nama proyek beraksen biru (#2563eb), dan lokasi proyek.
   - Grid metadata dua kolom bergaris halus atas-bawah: Kolom Kiri memuat *PEMBERI TUGAS / PEMILIK* dan *KONSULTAN PERENCANA*, Kolom Kanan memuat *KONTRAKTOR PELAKSANA* dan *NOMOR DOKUMEN*.
   - Kartu total nilai RAB di bagian bawah berlatar hijau lembut (#f8fafc / #e2e8f0) dengan nominal tebal berwarna zamrud (#059669) dan terbilang rupiah di dalam tanda kurung miring, diakhiri dengan teks `Tahun Anggaran 2026 / 2027`.

3. **Penempatan Penomoran Halaman di Kanan Bawah Footer & Ruang Bebas Aman (Anti-Menempel Data):**
   - Menyelaraskan seluruh running footer (`.print-footer-block`) dengan `display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important;`.
   - Mengunci elemen nomor halaman (`.footer-right`) selalu berada di sebelah kanan bawah kertas (`text-align: right !important; margin-left: auto !important; font-weight: 700 !important;`), sementara informasi kontraktor dan SE PUPR No. 47/2026 berada di kiri bawah.
   - Menambahkan ruang bebas aman (*safe clearance padding*) sebesar `38pt` pada seluruh kontainer cetak aktif (`.tab-panel.active, .printable-document, .card-body, #printableAhspBatchArea`) sehingga data tabel dan blok tanda tangan pengesahan tidak pernah menempel pada footer.

4. **Penambahan Running Footer & Penomoran Dokumen pada Seluruh Cetakan Katalog AHSP:**
   - Mengintegrasikan fungsi `createPrintFooter` ke dalam 5 fungsi pencetakan katalog di `js/app.js`: `printAhspCatalogSummary`, `renderAndPrintAhspList`, `printUsedMaterialsCatalog`, `printAllMaterialsCatalog`, dan `printSelectedAhspData`.
   - Seluruh lembar cetak katalog master AHSP, rincian komponen per divisi, dan standar harga satuan kini memuat running footer resmi SE PUPR 2026 serta keterangan jumlah item dan halaman di sudut kanan bawah.

---

## [Version 0.30] - 2026-09-06
### Fixed-Bottom Running Footer Precision, 2cm/1cm Universal Margin Standard, Centered Table Column Headers, Corporate Proposal Governance, & Active Schedule Task Naming

#### 🎯 Peningkatan Utama & Perbaikan Kritis:
1. **Perbaikan Peletakan Running Footer di Bawah Margin & Eliminasi Footer Nyasar (Anti-Orphan Footer):**
   - Mengunci posisi running footer `.print-footer-block` secara `fixed` pada bagian bawah halaman cetak (`bottom: 0 !important`) di `css/print-a4.css` dan `js/utils/print-engine.js`.
   - Mengeliminasi footer dalam flow normal yang sebelumnya terdorong ke halaman baru kosong (seperti pada Detail RAB di mana halaman 2 hanya memuat satu baris footer).
   - Menambahkan ruang nafas bawah (*safe clearance padding* sebesar `22pt`) pada kontainer dokumen cetak, sehingga seluruh baris tabel dan tanda tangan tidak bertabrakan dengan footer.
   - Menjaga footer proposal tetap `position: static; margin-top: auto` di dalam kontainer flexbox berukuran pasti 257mm.

2. **Standardisasi Baku Margin Dokumen Cetak A4 (Atas-Bawah 2cm, Kanan-Kiri 1cm):**
   - Menyelaraskan seluruh deklarasi `@page` pada `css/print-a4.css` dan `js/utils/print-engine.js`:
     - **Margin Atas**: `20mm !important;` (2 cm)
     - **Margin Bawah**: `20mm !important;` (2 cm)
     - **Margin Kiri**: `10mm !important;` (1 cm)
     - **Margin Kanan**: `10mm !important;` (1 cm)
   - Berlaku mutlak pada `@page` utama, `@page coverPage`, `@page bapPage`, `@page singleSheetPage`, dan `@page proposalPage`.

3. **Perapian Seluruh Nama Kolom Data Tabel Rata Tengah (Centered Headers):**
   - Menerapkan aturan global `.table th, .table thead th, table thead th, .print-table thead th, .table-header-row th` dengan `text-align: center !important; vertical-align: middle !important;` pada `css/main.css`, `css/print-a4.css`, dan template iframe cetak.
   - Menghapus atribut inline `text-align: right` atau `text-align: left` pada seluruh tag `<th>` di lembar Proposal, Analisis Volume, dan AHSP sehingga nama kolom tabel di seluruh aplikasi tampil rapi dan presisi di tengah.

4. **Pemberian Nama Progres Pekerjaan Aktif pada Tabel Kurva S:**
   - Menambahkan kolom **"Pekerjaan / Jadwal Aktif"** pada tabel rencana & realisasi progres di `js/app.js` (baik mode harian H-1 s.d. H-N maupun mingguan M-1 s.d. M-W).
   - Memperbarui engine `js/modules/scurve-diagram.js` agar mengakumulasikan daftar pekerjaan fisik yang aktif (`activeTasks`) ke dalam `scheduleWeekly` dari `scheduleDaily` tanpa duplikasi.
   - Menampilkan badge pekerjaan aktif (misal `🔹 Gali dan cabut...`) secara informatif per tanggal atau periode kalender.

5. **Peningkatan Standar Proposal Tata Kelola Perusahaan Profesional & Penomoran Halaman Lengkap:**
   - Mengoptimalkan modul `js/modules/proposal-gen.js` (Bab I s.d. Bab VII) sesuai tata kelola perusahaan: kop surat resmi, penomoran halaman dinamis (`Halaman X dari 9`), serta info jumlah lembar pada dokumen Detail RAB (`Halaman 1 dari 1` atau `Halaman 1 s.d. N`).
   - Merapikan blok tanda tangan tiga pihak (`.signature-clean-grid`) dengan tinggi proporsional dan proteksi mutlak `page-break-inside: avoid !important; break-inside: avoid !important;` agar terhindar dari pemisahan halaman yang canggung.

---

## [Version 0.29] - 2026-09-06
### Print Header/Footer Privacy Sanitizer, Calendar Live Force-Refresh Engine, Calendar Bulk Clear, & Dutavis Locked-Unit RAB Modal

#### 🎯 Peningkatan Utama & Perbaikan Bug Kritis:
1. **Pembersihan Total Metadata Cetak (Privacy Sanitizer):**
   - Menghilangkan secara mutlak tampilan "Tanggal Cetak", nama file, serta path direktori folder pada dokumen hasil cetak PDF A4 di `js/utils/print-engine.js`.
   - Mengganti label tanggal cetak dengan status resmi: `<div><strong>Status Dokumen:</strong> Dokumen Sah Terverifikasi</div>`.
   - Mengosongkan `document.title = " "` dan menyelaraskan `@page` browser print margin boxes sehingga peramban tidak memunculkan footer/header otomatis bawaan peramban (URL atau path lokal).

2. **Perbaikan Fungsi Refresh Kalender Proyek (Live Force-Reset Recalculation):**
   - Menyempurnakan metode `syncTasksFromRabDetail(forceReset = false)` pada `js/modules/project-calendar.js`.
   - Pada pemanggilan tombol "Muat / Refresh Jadwal dari Rincian RAB" (`syncCalendarFromRab(true)`), sistem mengeksekusi mode `forceReset = true` yang menghitung ulang tanggal mulai, tanggal selesai, dan durasi kerja murni berdasarkan kuantitas volume & koefisien tenaga kerja (OH) terkini dari RAB tanpa tertahan oleh data manual usang.
   - Durasi dan bobot Kurva S otomatis terkalibrasi selaras seketika.

3. **Penambahan Tombol & Fitur Hapus Semua Data Kalender (Bulk Clear):**
   - Menyematkan tombol aksi `[ 🗑️ Hapus Semua Data Kalender ]` pada toolbar antarmuka Kalender Proyek.
   - Dilengkapi dialog konfirmasi protektif: `confirmClearAllCalendarTasks()`. Saat dikonfirmasi, seluruh jadwal pekerjaan fisik dikosongkan secara bersih (`proj.calendarTasks = []`) melalui metode `ProjectCalendar.clearAllTasks()`.
   - Menampilkan kartu panduan aksi (*rich empty state*) yang elegan di dalam tabel kalender dengan tombol besar `[ 🔄 Muat / Refresh Jadwal dari Rincian RAB ]` untuk men-generate jadwal baru secara bersih kapan saja.

4. **Pencegahan Auto-Sync Paksa pada Kalender yang Dikosongkan:**
   - Memperbaiki logika inisialisasi pada `renderKalenderView()`. Sistem hanya menjalankan sinkronisasi otomatis saat proyek baru pertama kali dibuka (`proj.calendarTasks === undefined`).
   - Apabila kalender sengaja dikosongkan oleh pengguna (`proj.calendarTasks` adalah array kosong `[]`), sistem tidak melakukan auto-sync paksa sehingga status kalender tetap bersih sesuai keinginan pengguna.

5. **Redesain Modal Tambah Item RAB dengan Satuan Terkunci & Hero Volume (Dutavis Frontend Engine):**
   - Mengubah antarmuka pop-up `openRabItemFormModal` pada `js/app.js` menjadi 4 tahapan alur visual yang rapi, modern, dan ergonomis:
     - **Tahap 1:** Panel Pustaka AHSP Standar PUPR No. 47/2026 dengan pencarian cerdas dan filter kategori.
     - **Tahap 2:** Detail Spesifikasi & Harga Terkunci. Satuan Hasil (`modalItemUnit`) dikunci secara mutlak (`readonly`, background `#f8fafc`, kursor `not-allowed`, badge `🔒 Terkunci Standar AHSP`). Kode AHSP dan Harga Satuan (HSP) juga terkunci standar acuan PUPR.
     - **Tahap 3:** Hero Manual Field untuk Volume Pekerjaan (`modalItemVolume`) dengan garis batas biru tegas (`border: 2px solid #3b82f6`), badge `⭐ Satu-Satunya Input Manual`, pill satuan dinamis, dan auto-focus instan saat item dipilih.
     - **Tahap 4:** Kartu Estimasi Biaya & Kalkulasi Subtotal Item berbasis gradient emerald (`#065f46` s.d. `#047857`) yang merespons ketikan volume secara *real-time*.

---

## [Version 0.28] - 2026-09-06
### A4 Zero-Leak Tab Isolation Engine, Anti-Duplicate Margin Box Suppressor, & Proposal Single-Sheet Lock

#### 🎯 Peningkatan Utama & Perbaikan Bug Kritis:
1. **Eliminasi Kebocoran Data Massal Antar-Tab (Strict Zero-Leak Tab Isolation):**
   - Menghapus aturan selektor ID panel massal (`#panel-rekap-rab, #panel-detail-rab, #panel-volume, #panel-sumberdaya, #panel-kalender, #panel-koreksi, #panel-kurva-s, #panel-bap`) pada `css/print-a4.css` yang sebelumnya memaksa seluruh tab panel menampilkan `display: block !important` secara simultan saat cetak.
   - Menerapkan arsitektur isolasi tab mutlak: `.tab-panel { display: none !important; }` secara default, dan HANYA menampilkan `body:not(.printing-target) .tab-panel.active` saat cetak langsung (`Ctrl+P`) atau `body.printing-target .tab-panel.is-print-target` saat dicetak via tombol aksi menu.
   - Seluruh 11 modul dokumen (Rekap RAB, Detail RAB, Volume, Sumber Daya, Kalender, Lembar Koreksi, Kurva S, BAP, Proposal, Katalog, AHSP) kini tercetak 100% mandiri tanpa kebocoran atau tumpukan data dari modul lain.

2. **Supresi Total Duplikasi Footer (Margin Box @page vs HTML .print-footer-block):**
   - Menyetel `@bottom-left { content: none !important; }` dan `@bottom-right { content: none !important; }` pada deklarasi `@page` utama di `css/print-a4.css`.
   - Mengeliminasi duplikasi teks footer bertumpuk di tepi bawah kertas, sehingga footer resmi yang tampil murni berasal dari blok HTML `.print-footer-block` yang memuat nama kontraktor, nomor dokumen resmi, standar SE PUPR No. 47/2026, dan penomoran halaman dinamis.

3. **Penambahan Penutup Footer Resmi pada Rincian Detail RAB:**
   - Menyematkan blok `window.PrintEngine.createPrintFooter(...)` resmi berlabel `Dokumen Sah Detail RAB` pada modul `renderDetailRabView()` di `js/app.js`, melengkapi seluruh lembar kerja dengan segel penutup berstandar PUPR.

4. **Kunci Ketinggian Presisi Proposal & BAP (Anti-Halaman Kosong):**
   - Mengunci ketinggian maksimal `.proposal-page` dan `.printable-bap-doc` pada `max-height: 258mm !important;` (sesuai area cetak A4 297mm dikurangi margin atas 20mm dan bawah 18mm = 259mm).
   - Mengeliminasi keluarnya lembar kosong atau halaman tambahan tak sengaja pada setiap bab dokumen Proposal dan Berita Acara Pembayaran (BAP).

5. **Penguatan Logika Target Cetak pada PrintEngine:**
   - Menyempurnakan metode `printDocument()` pada `js/utils/print-engine.js` dengan penandaan ketat `targetEl.classList.add("is-print-target")` dan `document.body.classList.add("printing-target")`, pembersihan otomatis via `afterprint` dan timeout cadangan, serta fallback mulus ke `printViaHiddenIframe()` jika terjadi kendala pada peramban.

---

## [Version 0.27] - 2026-09-06
### Kurva S Adaptive Daily Grid Engine, Proposal Independent Multi-Chapter Pagination, & A4 Footer Margin Clearance

#### 🎯 Peningkatan Utama & Perbaikan Bug Kritis:
1. **Kurva S Adaptive Daily Grid Engine (Grid Harian H-1 s.d. H-n):**
   - Mengimplementasikan sistem perhitungan dan visualisasi Kurva S berbasis Grid Harian beresolusi tinggi untuk proyek durasi pendek ($\le 30$ hari, termasuk proyek 3 hari kalender).
   - Setiap hari kerja ($H_1, H_2, H_3 \dots$) memiliki garis grid vertikal mandiri, diagram batang bobot rencana harian (%), kurva S kumulatif harian (%), titik lingkaran capaian, serta kalkulasi deviasi progres aktual fisik harian sehingga tidak lagi menjadi satu garis diagonal datar satu minggu.
2. **Toggle Dual-Mode Grid Harian / Mingguan di UI:**
   - Menambahkan tombol switch interaktif `[ 📅 Grid Harian (${totalDays} Hari) ]` dan `[ 📆 Grid Mingguan (${weeksCount} Mgg) ]` pada tampilan antarmuka tab Kurva S & Monitoring Progres.
   - Tabel data di bawah grafik Kurva S secara otomatis beradaptasi menampilkan rincian kolom harian (`Hari Ke`, `Hari & Tanggal`, `Bobot Rencana Harian %`, `Rencana Kumulatif %`, `Realisasi Kumulatif %`, `Deviasi %`) atau kolom mingguan.
3. **Pelepasan & Isolasi Halaman Antar-Bab Proposal (Zero-Page Bleed):**
   - Menetapkan aturan `page-break-before: always !important; page-break-after: always !important; break-before: page !important; break-after: page !important;` pada setiap kontainer `.proposal-page`.
   - Mengeliminasi tumpukan Bab II (Rekapitulasi RAB) dan Bab III (Rincian Detail RAB) pada halaman yang sama saat dicetak ke PDF A4. Setiap bab kini dimulai secara terisolasi pada lembar halaman baru.
4. **Penyempurnaan Margin Bawah & Clearance Footer Cetak A4:**
   - Menyesuaikan margin bawah `@page` menjadi `18mm` (1.8 cm) pada `css/print-a4.css` dan `js/utils/print-engine.js`.
   - Menambahkan garis pemisah halus (`border-top: 0.75pt solid #cbd5e1`) dan padding lega pada `.print-footer-block` di seluruh lembar cetak dan halaman proposal sehingga footer tidak lagi mepet atau menabrak garis batas bawah.

---

## [Version 0.26] - 2026-09-06
### Single-Page BAP Precision, Kurva S Single Source of Truth Zero-Cache Reset, & Uniform A4 Margin Harmonizer

#### 🎯 Peningkatan Utama & Perbaikan Bug Kritis:
1. **Eliminasi Circular Cache & Perbaikan Kurva S (Single Source of Truth dari Kalender Proyek):**
   - Memperbaiki fungsi `calculateScheduleFromCalendar()` di `js/modules/scurve-diagram.js` dengan menghapus pembacaan `existingSchedule` dari `proj.scheduleWeekly` sendiri.
   - Status 'Belum Mulai' secara ketat mengembalikan faktor `0.00` dan mengunci realisasi mingguan/kumulatif bernilai `null` jika belum ada pekerjaan yang berjalan.
   - Tampilan KPI Kurva S menampilkan `0,00% (Belum Mulai)` dan deviasi `Menunggu Kalender` (abu-abu netral), mengeliminasi bug angka 50% palsu dan deviasi -50% (Behind).

2. **Garansi Dokumen BAP Tepat 1 Halaman A4 (Max 1 Lembar):**
   - Mengeliminasi duplikasi elemen HTML pada blok `Catatan & Rekomendasi Mutu Lapangan` di `js/modules/bap-invoicing.js`.
   - Mengoptimalkan padding sel tabel dan merampingkan spasi baris kosong serta kolom tanda tangan (tinggi 32px).
   - Menghapus padding berlebih pada `.printable-bap-doc` dan menguncinya pada `max-height: 265mm` di `@media print` sehingga pas di area cetak A4 tanpa tumpah ke halaman 2.

3. **Standarisasi Margin Cetak Seragam Seluruh Dokumen (Top 2cm, Kanan 1cm, Bawah 1cm, Kiri 1cm):**
   - Menyelaraskan seluruh deklarasi `@page` pada `css/print-a4.css` dan `js/utils/print-engine.js`:
     `margin-top: 20mm !important; margin-right: 10mm !important; margin-bottom: 10mm !important; margin-left: 10mm !important;`
   - Meliputi seluruh lembar cetak:
     * Lembar Pengawasan & Koreksi Mutu Pekerjaan Lapangan (`panel-koreksi`)
     * Kalender Proyek & Jadwal Pelaksanaan (`panel-kalender`)
     * Rincian Penggunaan Sumber Daya Proyek (`panel-sumberdaya`)
     * Daftar Volume Pekerjaan Proyek (`panel-volume`)
     * Rincian Detail Rencana Anggaran Biaya (`panel-detail-rab`)
     * Rekapitulasi Rencana Anggaran Biaya (`panel-rekap-rab`)
     * Kurva S Proyek (`panel-kurva-s`)
     * Berita Acara Pembayaran (`panel-bap`)

4. **Pembersihan Padding Pembungkus Layar Saat Cetak:**
   - Mereset padding dan margin seluruh `.tab-panel`, `.card`, `.card-body`, dan ID wrapper ke `0 !important` saat mode print aktif agar tidak menggandakan margin kertas.

5. **Penambahan Tanda Tangan Tiga Pihak & Running Footer Standar PUPR:**
   - Menambahkan blok tanda tangan formal (Owner, Konsultan Perencana, Kontraktor) dan running footer pada Rekapitulasi RAB, Rekap Sumber Daya, Analisis Volume, dan Lembar Koreksi Mutu.

---

# Changelog — Duta RAB S1 (SE Bina Konstruksi No. 47/2026)

## [Version 0.25] - 2026-09-06
### ⏱️ Penjadwalan Proporsional Harian 0,x OH (Same-Day Multi-Task Scheduling)
- **Aturan Pekerjaan Sepele (< 1.0 OH)**: Pekerjaan dengan bobot Orang-Hari (OH) pecahan (`0,x OH`) yang total akumulasinya belum mencapai 1.0 OH (`accumulatedDayOH + rawOH <= 1.05 OH`) dijadwalkan pada **HARI YANG SAMA** (`startDate === finishDate`).
- **Eliminasi Pemborosan Hari Kalender**: Pekerjaan persiapan ringan (seperti pembersihan lahan 0,2 OH, pematokan 0,3 OH, dan papan nama proyek 0,4 OH dengan total 0,9 OH) selesai tuntas dalam 1 hari kalender kerja yang sama (misal 2026-04-01), tidak lagi terpecah berhari-hari secara berlebihan.
- **Peralihan Hari Kerja Akumulatif**: Hanya ketika total beban kerja harian mencapai 1.0 OH (atau pekerjaan besar $\ge$ 1.0 OH dimulai), penanggalan pekerjaan berikutnya bergulir ke hari kerja selanjutnya.
- **Format Durasi Presisi**: Menampilkan durasi tugas berbobot rendah sebagai `0,x OH` (misal `0.2 OH`, `0.3 OH`) pada kalender kerja, dengan catatan beban tenaga kerja yang transparan.

### 📈 Sinkronisasi Real-Time Kurva S dari Kalender Proyek (Live Actual Progress)
- **Eliminasi Masalah 'Menunggu Kalender Proyek'**: Memperbaiki prioritas evaluasi progres aktual fisik pada modul Kurva S. Status `Sedang Berjalan` otomatis mengaktifkan progres aktual riil (default 50% atau sesuai persentase lapangan), dan status `Selesai` otomatis mengunci progres 100%.
- **Dukungan Pekerjaan Hari yang Sama (Same-Day Inclusive Boundary)**: Memperbaiki kalkulasi overlap rentang tanggal mingguan Kurva S (`tEndInclusive = addDays(tFinish, 1)`), sehingga pekerjaan yang mulai dan selesai pada hari yang sama (`startDate === finishDate`) tetap dihitung secara penuh ke dalam bobot rencana mingguan dan realisasi aktual Kurva S (tidak lagi bernilai 0%).
- **Input Progres Aktual pada Modal Edit**: Menambahkan kolom input `Progres Fisik Aktual Lapangan (%)` pada modal edit pekerjaan di Kalender Proyek (0-100%), memudahkan pelaksana lapangan mencatat progres riil kapan saja.
- **Visualisasi Grafis & Badge Deviasi Instan**: Seketika pekerjaan diubah menjadi `Sedang Berjalan` atau `Selesai`, Kurva S langsung menggambar garis realisasi hijau zamrud (`#059669`), menampilkan titik capaian, menghitung deviasi jadwal (`+x% Ahead` / `-x% Behind`), serta memperbarui kartu KPI eksekutif secara dinamis.

---

## [Version 0.24] - 2026-09-06
### 💰 Koreksi Akurasi Matematis Finansial (Overhead & Profit Exact Math)
- **Perhitungan Proporsional Presisi**: Menghitung nilai rupiah Overhead & Profit langsung dari Biaya Langsung proyek (`Math.round(totalDirectCost * (overheadRate / 100))`) tanpa menyerap deviasi pembulatan harga satuan item individual.
- **Konsistensi Total 100%**: Mengeliminasi selisih Rp 2 pada contoh proyek (sebelumnya Rp 35.956 menjadi **Rp 35.958** pada Rp 1.438.337 × 2.5%), sehingga Biaya Langsung (Rp 1.438.337) + Overhead (Rp 35.958) = Biaya Riil (Rp 1.474.295), ditambah PPN 11% (Rp 162.172) = Grand Total (Rp 1.636.467) tepat secara matematis tanpa selisih 1 rupiah pun.

### 📊 Pembersihan Elemen Tidak Penting pada Tabel Kurva S
- **Eliminasi Input Manual & Tombol Aksi**: Menghapus kolom input teks `Realisasi Aktual Mgg (%)` dan tombol aksi centang `[✓]` dari tabel Kurva S yang tidak memiliki fungsi real/nyata di lapangan konstruksi.
- **Tabel Monitoring Eksekutif Murni**: Menampilkan tabel monitoring 6 kolom standar manajemen konstruksi: `Minggu` (M1, M2, ...), `Periode Tanggal`, `Bobot Rencana Mgg (%)`, `Rencana Kumulatif (%)`, `Realisasi Kumulatif (%)` (otomatis dari Kalender Proyek), dan `Deviasi (%)` ber-badge status warna (Ahead, Behind, On Track).

### 🛠️ Restorasi Kode & Judul Master AHSP yang Rusak
- **Perbaikan Kode Digit Tunggal**: Memperbaiki 20 item AHSP yang sebelumnya mengalami kerusakan data berkode '1' atau salah judul.
- **Pemulihan Item Bench Mark**: Item 35 dikembalikan menjadi kode baku `1.1.4.5` dengan judul *"Pembuatan 1 buah tugu patok titik acuan (Bench Mark) ukuran 10 x 10 cm (marmer graphir)"* satuan buah; Item 36 menjadi kode `1.1.4.6` *"Pembuatan 1 buah tugu patok titik acuan (Bench Mark) ukuran 12 x 12 cm (marmer graphir)"* satuan buah.
- **Enrichment Kode Komponen Material**: Memperkaya 12.922 komponen material di dalam master AHSP dengan kode material unik yang sesuai dengan database harga bahan nasional.

### 🏷️ Standarisasi Kode Item Katalog Harga per Satuan
- **Zero Missing / Dash Codes**: Memastikan setiap item bahan/upah/alat pada katalog harga memiliki kode unik yang sah dan terbaca jelas (tidak pernah kosong atau strip `-`).
- **Pembeda Kode Berdasarkan Satuan**: Item material yang memiliki nama sama namun beda satuan (misal Pasir Beton dalam `kg` vs `m3`) secara otomatis diberikan kode item terpisah (misal `M.0046` vs `M.0047` atau ekstensi kode satuan baku) untuk ketertiban basis data dan inventori proyek.

### ⏱️ Penjadwalan Proposional Beban Tenaga Kerja (OH) Kalender Proyek
- **Eliminasi Lompatan Interval Buatan**: Menghapus aturan lompatan interval buatan (`Math.max(7, ...)` dan `Math.max(12, ...)`) yang sebelumnya memaksa jeda antar divisi hingga berminggu-minggu tanpa dasar teknis.
- **Penyelesaian Proyek 2,4 OH dalam 2 Hari (1 Minggu)**: Mengintegrasikan durasi pekerjaan murni dari formula beban kerja fisik: $\text{Durasi} = \lceil \text{OH} / \text{Crew Size} \rceil$. Untuk proyek kecil dengan beban 2,4 OH dan 2 tenaga kerja, proyek terjadwal selesai dalam 2 hari kalender dan terdistribusi tuntas dalam 1 minggu (M1), bukan 2 minggu.
- **Sinkronisasi Durasi Proyek Otomatis**: Properti `durationDays` dan `finishDate` proyek disinkronkan secara otomatis mengikuti rentang tanggal riil pekerjaan pada kalender.

---

## [Version 0.23] - 2026-09-06
### 🔒 Lock Input Kode AHSP/Item & HSP + Live Thousand Separator Dots
- **Proteksi Seleksi Perpustakaan**: Saat memilih item dari perpustakaan AHSP, input `Kode AHSP / Item` dan `Harga Satuan Pekerjaan (HSP)` dikunci secara otomatis (`readonly` dan penanda badge `🔒 Terkunci dari AHSP`) untuk mencegah ketidaksinkronan data referensi.
- **Pemisah Ribuan Titik Otomatis**: Input harga satuan pekerjaan memformat titik ribuan secara live (misalnya `3.129.324`) saat diketik atau dipilih dari perpustakaan, mempermudah inspeksi nominal secara visual tanpa kekeliruan digit nol.
- **Eliminasi String Tag HTML Literal**: Memperbaiki render kotak subtotal perhitungan modal dengan menetapkan `.innerHTML` pada wadah subtotal, menuntaskan rendering tag `<span class="rupiah-nowrap">...</span>` menjadi badge moneter yang rapi dan benar.
- **Fleksibilitas Override**: Disediakan tombol toggle `[🔓 Buka Kunci Input]` untuk membuka kembali proteksi jika pengguna menghendaki penyesuaian nilai harga atau kode item manual secara bebas.

### 🧹 Eliminasi Box Pembungkus Berlebihan & Perapian Layout
- **Perbaikan Division Header Print RAB**: Memperbaiki bug judul divisi sempit 3 baris di sisi kiri cetakan A4 RAB (akibat konflik `.print-only { display: block }`) dengan menegakkan `tr.division-header-row { display: table-row !important; width: 100% !important; }` dan `th { display: table-cell !important; }`. Judul divisi kini merentang penuh selebar 7 kolom secara proporsional.
- **BAP Tagihan Proyek Bebas Kotak Abu-Abu**: Menghilangkan border kotak abu-abu pada data Pihak Pertama & Kedua, Terbilang & Rekening Transfer Bank, serta Catatan Mutu BAP menjadi dokumen kedinasan yang polos, bersih, dan formal. Mengganti akronim dokumen dummy `CGN` menjadi akronim dinamis kontraktor (misalnya `BAP/AP/...`).
- **Rekap Sumber Daya Seimbang**: Mengganti nested outer card menjadi susunan 4 kartu KPI yang seimbang dalam 1 baris (`repeat(auto-fit, minmax(210px, 1fr))`) tanpa ruang kosong mubazir.

### 📐 Standarisasi Universal Margin Cetak A4
- **Margin Baku Kedinasan**: Mengunci seluruh dokumen cetak (RAB Detail, Rekapitulasi, Analisis Volume, BAP, Proposal, Katalog Upah & Bahan, Kurva S, Kalender Proyek) pada margin baku: **Atas 20mm (2cm), Kanan 10mm (1cm), Bawah 10mm (1cm), Kiri 10mm (1cm)** pada `css/print-a4.css`, `js/utils/print-engine.js`, dan semua styling `@page`.

### 🧭 Perapian Nama Menu & Istilah
- **Penyederhanaan Nama Navigasi**: Mengubah `Kurva S Diagram SVG` menjadi `Kurva S` dan `Kalender Proyek 1 Tahun` menjadi `Kalender Proyek` di sidebar, panel header, header cetak, dan proposal.
- **Pembersihan Judul Kop**: Menghapus kata "Diagram SVG" pada header Kurva S dan menghapus keterangan "1 Tahun" pada header matriks Kalender Proyek.

### 📈 Integrasi Penuh Kalender Proyek & Kurva S (Standar Ilmu Teknik Sipil)
- **Kurva Rencana Kumulatif Dinamis**: Bobot rencana dihitung 100% dari durasi tanggal per item pekerjaan pada Kalender Proyek dan nilai riil item pada RAB.
- **Proteksi Realisasi Fisik Aktual**: Mengeliminasi pengisian otomatis / dummy pada progres aktual. Jika belum ada progres yang dicatat di Kalender Proyek, kurva realisasi fisik dibiarkan kosong (`null`), garis hijau tidak digambar, dan status menampilkan `Menunggu Kalender Proyek`.
- **4 Kartu KPI Monitoring Progres**: Menambahkan ringkasan eksekutif Target Rencana Kumulatif (100%), Realisasi Fisik Aktual, Deviasi Jadwal (Ahead/Behind), dan Total Durasi Pelaksanaan di bagian atas halaman Kurva S.

---

## [Version 0.22] - 2026-09-06
### 🛡️ 100% Penghapusan 'PT. CIPTA GRAHA NUSANTARA' & Perusahaan Dummy
- **Data Sah Bersumber Dinamis**: Menghapus seluruh teks hardcoded 'PT. CIPTA GRAHA NUSANTARA' dari running footer halaman proposal A4, penanda tangan BAP termin, pengaturan proyek baru, kop cetak, dan template sample project.
- **Konsistensi Proyek**: Seluruh nama perusahaan kontraktor, konsultan perencana, dan pemilik proyek yang tercetak kini 100% bersumber dari data sah yang dikonfigurasi melalui formulir `Informasi & Setting Proyek`.

### ✍️ Lembar Pengesahan Polos Bebas Border (Authentic Formal Signatures)
- **Desain Minimalis Elegan**: Menghilangkan seluruh border kotak pembungkus (`border: none !important; background: transparent !important;`) pada blok penanda tangan tiga pihak di BAB VII Proposal, Rincian Detail RAB, dan Katalog Harga Satuan.
- **Standar Dokumen Kedinasan Formal**: Menyajikan garis bawah tunggal yang rapi untuk nama pejabat penanda tangan tanpa border card berlebihan yang tampak kaku.

### 📐 Pembersihan & Rebalancing Tabel Analisis Volume Pekerjaan
- **Pembersihan Judul Kop Cetak**: Menghapus keterangan `(PERHITUNGAN MANDIRI)` dari judul kop cetak dokumen menjadi `DAFTAR ANALISIS VOLUME PEKERJAAN`.
- **Penghapusan Kolom Catatan**: Menghapus seluruh kolom `Catatan Sumber Hitungan` dari tabel dan header.
- **Proporsi Kolom Ideal**: Memperlebar kolom `Uraian Pekerjaan` menjadi 63% agar leluasa dibaca, merampingkan kolom `Volume Pekerjaan` menjadi 12% rata kanan, serta memformat angka volume saat dicetak secara borderless dan menyatu dengan tabel.

### 📑 Dua Tombol Cetak Khusus pada Menu Katalog
- **Cetak Item yang Terpakai**: Tombol `🖨️ Cetak Item yang Terpakai` (`App.printUsedMaterialsCatalog()`) mencetak daftar harga satuan upah tenaga kerja, material bahan, dan sewa alat yang digunakan pada proyek aktif dengan format kompak 1 baris per item (tanpa kolom AHSP yang memicu pembengkakan baris).
- **Cetak Seluruh Katalog**: Tombol `📑 Cetak Seluruh Katalog` (`App.printAllMaterialsCatalog()`) mencetak master database nasional SE Bina Konstruksi No. 47/2026 secara lengkap per kategori (Upah, Bahan, Alat).

### 🖨️ Perbaikan Cetakan A4 AHSP (Eliminasi Ruang Kosong 45%)
- **Fluid Card Flow Pagination**: Menghilangkan batasan kaku `itemsPerPage = 3` dan pembungkus `.print-page-wrapper` yang memicu kekosongan 45% di halaman 1.
- **Optimasi Lembar A4**: Menerapkan alur alami dengan `page-break-inside: avoid` per kartu dan padding kompak (6px 10px), sehingga browser secara optimal memuat 2-3 analisa penuh per lembar A4 tanpa jeda kosong yang janggal.

### 📑 Penyempurnaan Cetakan Rincian Detail RAB
- **Judul Divisi Tercetak**: Menambahkan baris judul divisi yang dicetak jelas (`DIVISI [kode]. [NAMA DIVISI]`) pada setiap tabel divisi.
- **Baris Subtotal Divisi**: Menambahkan baris subtotal di akhir setiap divisi.
- **Grand Total & Pengesahan**: Menambahkan ringkasan Grand Total RAB (Biaya Fisik, PPN 11%, Total Akhir) dan lembar pengesahan tiga pihak polos di akhir lembar cetak.

---

## [Version 0.21] - 2026-09-06
### 🖨️ Cetak Seluruh Data AHSP yang Dipilih (Tanpa Pemotongan Paginasi)
- **Penggantian Fitur Cetak Katalog**: Mengganti tombol cetak pada menu Katalog Upah & Bahan menjadi `🖨️ Cetak Seluruh Data AHSP yang Dipilih`.
- **Bundel Cetak Komprehensif**:
  - **Bagian I: Daftar Harga Satuan Upah, Bahan & Peralatan (Item Terpakai)**: Menampilkan seluruh harga satuan upah tenaga kerja, material bahan, dan sewa alat yang digunakan pada AHSP aktif proyek lengkap dengan kolom kode, satuan, harga satuan, dan item AHSP pengguna.
  - **Bagian II: Rincian Analisis Harga Satuan Pekerjaan (AHSP) yang Digunakan**: Menampilkan seluruh rincian komponen AHSP terpilih (koefisien indeks, harga satuan, subtotal, rekapitulasi Biaya Langsung Tenaga/Bahan/Alat, Overhead & Keuntungan, dan HSP akhir) tanpa pemotongan paginasi.
  - **Routing Otomatis**: Tombol dan pemanggilan cetak pada panel katalog secara otomatis mengarah ke dokumen komprehensif ini via iframe terisolasi.

### 📦 Katalog Upah & Bahan Khusus Item Pekerjaan Terpakai
- **Fokus Sumber Daya Terpakai**: Menu Katalog Upah, Bahan, dan Alat kini secara default hanya menampilkan sumber daya yang digunakan oleh AHSP di dalam RAB proyek yang sedang aktif (`onlyUsed = true`).
- **Penyaringan Kategori Dinamis**: Kategori dropdown disesuaikan secara otomatis hanya dengan kategori sumber daya yang benar-benar ada di proyek (`CatalogPricing.getUsedCategories()`).
- **Pelacakan Komponen AHSP**: Menampilkan badge kategori dan catatan teks spesifik yang menerangkan item pekerjaan AHSP mana saja yang mengonsumsi material/upah tersebut.

### 📄 Anchored Print Footer (Anti-Footer Menggambang)
- **Struktur Flexbox Halaman Proposal A4**: Mengunci kontainer `.proposal-page` pada ketinggian presisi `height: 275mm; min-height: 275mm; max-height: 275mm; display: flex; flex-direction: column; justify-content: space-between;` baik pada preview layar maupun cetak A4.
- **Pinning Footer ke Dasar Margin Lembar**: Menetapkan `.print-footer-block { margin-top: auto !important; flex-shrink: 0 !important; }` pada seluruh 8 halaman isi proposal, sehingga halaman dengan isi singkat (seperti Halaman 2: Kata Pengantar & Ringkasan Eksekutif) tidak lagi mengalami footer naik ke tengah lembar fisik.

### 🧹 Pembersihan Teks "Dokumen Sah Proposal"
- **Penomoran Bersih & Rapi**: Menghapus seluruh 8 teks ` • Dokumen Sah Proposal` dari footer halaman proposal, sehingga footer kini hanya menampilkan penomoran murni yang elegan: `Halaman X dari 9`.

---

## [Version 0.20] - 2026-09-06
### ⚙️ Perbaikan Kalkulasi Live RAB & Eliminasi Bug Teks HTML Literal
- **Penghapusan Nested Duplicate Functions**: Menghapus duplikasi internal `previewProjectRecalculation` & `recalculateProjectRabSettings` di dalam `calculateProjectRab` pada `js/modules/rab-calculator.js`.
- **Perbaikan Initial Load Biaya Langsung & Overhead**: Menghitung langsung `totalDirectCost` dan `overheadAmount` pada saat pembukaan proyek sehingga nilai tidak lagi menampilkan Rp 0.
- **Eliminasi String HTML Literal pada Live Input**: Mengganti penugasan `.textContent = CurrencyUtil.formatRupiah(...)` menjadi `.innerHTML = ...` pada penanganan input live PPN (%) dan Overhead (%) di `js/app.js`, sehingga elemen `<span class="rupiah-nowrap">...</span>` ter-render sempurna sebagai badge moneter tanpa teks kode mentah.

### 📚 Ekspor / Impor Full Database AHSP 2.573 Item Lengkap
- **Ekspor AHSP Komprehensif**: Fungsi `exportAhspJson()` kini menyusun seluruh database 2.573 item pekerjaan standar SNI/PUPR SE No. 47/2026 yang digabung dengan penyesuaian custom pengguna, lengkap dengan rincian koefisien bahan, upah tenaga kerja, sewa alat, dan Harga Satuan Pekerjaan (HSP) terhitung.
- **Parser Impor Fleksibel**: `importAhspJson()` kini mampu membedakan format berkas array penuh (pustaka master) maupun format peta kustom (`customAhspMap`), serta memvalidasi dan memutakhirkan pustaka secara aman tanpa kerangka kosong.

### 📄 Penyelarasan Penomoran Halaman Proposal & Pembersihan Garis
- **Sinkronisasi Daftar Isi & Penomoran Halaman**: Mengaktifkan kembali footer penomoran halaman standar proposal ("Halaman X dari 9") yang sepenuhnya cocok dengan nomor halaman pada Daftar Isi Bab.
- **Pembersihan Garis Akhir Bab & Border Konten**: Menghilangkan garis horizontal abu-abu (`border-top: 1.5px solid #94a3b8`) di setiap akhir bab proposal dan menghapus border margin tipis di sekitar kontainer proposal (`.proposal-preview-wrapper`).

### 🖨️ Restorasi Penomoran Lembar Cetak Multi-Halaman ("Halaman X dari Y")
- **Penomoran Multi-Lembar Presisi**: Dokumen cetak yang memiliki lebih dari 2 lembar (Detail RAB, Katalog AHSP, Rekap Sumber Daya) kembali menampilkan `"Halaman X dari Y"` via CSS `@page` margin box.
- **Isolasi Dokumen Lembar Tunggal**: Lembar BAP (tepat 1 lembar fisik A4), Cover Proposal, dan dokumen tunggal lainnya secara ketat diproteksi (`content: none !important;`) sehingga tidak menampilkan penomoran halaman.

### 🎨 Sistem Pop-up Modal Eksekutif Modern (Bebas Alert Bawaan)
- **Penggantian window.alert() 100%**: Mengganti semua pemanggilan `alert()` bawaan browser dengan `#notificationModal` bergaya eksekutif modern dengan backdrop blur glassmorphism, soft shadow, badge icon dinamis, dan kartu kalender terstruktur.
- **Akses Global**: Menyediakan `window.showNotificationModal()` dan `window.hideNotificationModal()` dengan dukungan interaksi tombol Enter/Escape dan klik backdrop.

---

## [Version 0.19] - 2026-09-06
### 📦 Ekspor / Impor Proyek JSON 100% Utuh (Bebas Kerangka Kosong)
- Memperbaiki engine serialisasi exportProjectJson:
  - Mengonsolidasikan seluruh state aktif: Divisi & rincian item pekerjaan AHSP, analisis volume (*take-off*), jadwal kalender pekerjaan, bobot Kurva S, skema termin pembayaran, dan catatan BAP.
  - Melampirkan metadata _meta yang memuat ringkasan jumlah divisi, total item, jadwal pekerjaan, tanggal ekspor, dan spesifikasi SE PUPR No. 47/2026.
- Memperbaiki parser importProjectJson:
  - Mendukung pembacaan payload berstruktur wrapper maupun langsung, menetapkan ID unik baru agar tidak bentrok, dan memulihkan seluruh engine data (CatalogPricing, AhspEngine, ProjectCalendar, SCurveDiagram).
  - Pembersihan otomatis data lama seperti sisa konfigurasi watermark.
  - Menampilkan ringkasan dialog konfirmasi berisi rincian nama proyek, jumlah divisi, jumlah item RAB, dan jadwal kalender yang berhasil dipulihkan.
- Menambahkan pilihan template saat membuat proyek baru:
  - **Template Standar Lengkap (Rekomendasi)**: Menginisialisasi 10 kelompok divisi pekerjaan standar rumah tinggal, item AHSP, volume, kalender, dan Kurva S siap pakai.
  - **Kerangka Kosong**: Memulai dari nol untuk pengguna yang ingin menginput divisi dan item secara manual.

### 🚫 Penghapusan Total Fitur Watermark
- Menghapus 100% tombol watermark dari topbar navigasi dan kartu pengaturan di tab Informasi & Setting Proyek.
- Menghapus modal formulir pengaturan watermark (watermarkModal), fungsi render modal, dan event listener terkait dari js/app.js.
- Menghapus seluruh CSS overlay watermark (.print-watermark-overlay, .print-watermark-text, .print-watermark-img) dari css/main.css dan css/print-a4.css.
- Membersihkan injeksi watermark dari modul cetak PrintEngine, proposal cetak ProposalGen, dan penagihan BapInvoicing.

### 📅 Kalender Proyek Full 1 Tahun (12 Bulan Sekaligus)
- Merestrukturisasi tata letak tab **Kalender Proyek & Jadwal Pelaksanaan**:
  - Menempatkan **Matriks Kalender 12 Bulan Penuh (Full 1 Tahun)** di bagian paling atas halaman sebagai tampilan utama default (currentViewMode: 'year').
  - Menampilkan 12 kartu bulan (3x4 responsive grid) lengkap dengan hari 1 s.d. 31, offset hari Senin-Minggu standar Indonesia, penanda hari libur Minggu, dan pil badge status pekerjaan aktif.
  - Menyediakan tombol pintasan untuk membuka fokus bulan tertentu dan tombol beralih kembali ke mode 1 tahun.
  - Menempatkan tabel rincian jadwal divisi, komparasi durasi standar rencana vs realisasi lapangan, dan status pekerjaan di bawah kalender tahunan dengan dropdown filter divisi.

### 📈 Peningkatan Akurasi Kurva S (S-Curve Engine)
- Menghitung distribusi bobot mingguan Kurva S secara langsung dari biaya riil per item kalender (	.cost), bukan lagi mengalikan total divisi secara global.
- Menormalisasi bobot rencana agar kurva kumulatif rencana mendarat tepat pada **100.0%**.
- Menghitung progres kumulatif aktual berdasarkan status riil pekerjaan lapangan (*Selesai* = 100%, *Sedang Berjalan* = 50%, *Belum Mulai* = 0%).
- Menyimpan jadwal mingguan langsung ke state aktif proyek (proj.scurveSchedule).

### 📖 Kompilasi Buku Panduan Manual PDF A4 Edisi Rilis Versi 0.19
- Mengompilasi Buku_Panduan_Manual_RAB_2026.pdf dengan tata letak A4 resmi ReportLab: Cover Eksekutif, Ringkasan Fitur Versi 0.19, Diagram Alur Ekspor/Impor & Kalender 1 Tahun, Panduan Operasional Lengkap, serta Top 5 Troubleshooting Masalah & Solusi.

---

## [Version 0.18] - 2026-09-06
### 🖨️ Pembersihan Total Header Peramban & Footage Jam (A4 Zero-Footage Print Engine)
- Menghapus sepenuhnya judul menu (seperti *Proposal_Rencana_Proyek*, *Rekapitulasi_RAB*, *Katalog_Master_AHSP*) dan footage jam / tanggal peramban dari header cetakan PDF A4.
- Mekanisme supresi ganda:
  - Pengosongan instan `document.title = " "` selama eksekusi pencetakan dan pemulihan otomatis setelah dialog cetak selesai.
  - Penerapan CSS `@page { margin: 0; }` dan pembersihan margin box peramban (`@top-left`, `@top-right`, `@bottom-left`, `@bottom-right` diset ke `none !important`), sehingga peramban Chromium/WebKit tidak mengalokasikan ruang header bawaan.
  - Tata letak dokumen diatur mandiri dengan margin presisi di dalam kontainer dokumen cetak (`padding: 12mm 12mm`).

### 📄 Restrukturisasi & Penguncian Dokumen BAP Tepat 1 Lembar A4
- Menata ulang dokumen Berita Acara Pembayaran (BAP) termin agar ringkas, padat, dan terkunci **TEPAT 1 HALAMAN FISIK A4** (`height: 275mm; max-height: 275mm; overflow: hidden; page-break-inside: avoid !important`):
  - **Kop Surat Ganda & Judul**: Header terpadu kontraktor pelaksana, nomor registrasi BAP, dan tanggal resmi.
  - **Data Pihak 2 Kolom**: Ringkasan Pihak Pertama (Pemberi Tugas/Owner) dan Pihak Kedua (Kontraktor Pelaksana) berdampingan secara efisien.
  - **Tabel Nilai Tagihan Presisi**: Tabel berukuran font 8pt dan cell-padding 2.5px menampilkan nilai kontrak, progres fisik %, porsi tagihan %, bruto, potongan DP, potongan retensi 5%, jumlah sebelum PPN, PPN 11%, dan Grand Total Net Payable.
  - **Integrasi Terbilang & Rekening Bank**: Kotak terpadu kalimat terbilang rupiah dan instruksi transfer bank (Bank, No. Rekening, dan Atas Nama).
  - **Catatan Evaluasi Mutu Lapangan**: Ruang catatan resmi dan garis catatan manual lapangan.
  - **Tanda Tangan 2 Pihak Proporsional**: Kolom tanda tangan Pihak Pertama dan Pihak Kedua dengan tinggi 38px yang proporsional untuk stempel basah.
  - **Running Footer**: Indikator sah "Halaman 1 dari 1 • Dokumen Sah Berita Acara Pembayaran".

### 💧 Watermark Mengapung di ATAS Semua Konten Dokumen (`z-index: 999999`)
- Mengatasi kendala watermark yang sebelumnya tertutup oleh tabel atau kartu berlatar putih:
  - Reposisi elemen `.print-watermark-overlay` ke urutan DOM paling akhir di setiap lembar A4 Proposal (`.proposal-page`) dan BAP (`.printable-bap-doc`).
  - Penetapan `position: absolute !important; inset: 0; z-index: 999999 !important; pointer-events: none !important;` sehingga watermark mengapung sempurna di atas seluruh lapisan teks, kartu, dan sel tabel.
  - Teks dan angka di bawahnya tetap 100% terbaca jelas dengan transparansi transparan elegan (5% s.d. 60%).
  - Injeksi otomatis watermark pada seluruh mode cetak tunggal (`printDocument`) maupun batch iframe (`printViaHiddenIframe`).

### 📖 Kompilasi Buku Panduan Manual PDF A4 Edisi Rilis Versi 0.18
- Mengompilasi `Buku_Panduan_Manual_RAB_2026.pdf` dengan tata letak A4 resmi ReportLab: Cover, Ringkasan Eksekutif Versi 0.18, Diagram Alur Mesin Cetak Bebas Footage, Panduan Operasional Watermark & BAP, serta Top 5 Troubleshooting Masalah & Solusi.

---

## [Version 0.17] - 2026-09-05
### ✍️ Lembar Pengesahan Tiga Pihak Terstruktur (BAB VII Proposal)
- Menambahkan formulir terstruktur pada tab Informasi & Setting Proyek untuk tiga pihak penandatangan:
  - **Pihak Pertama: Pemberi Tugas / Owner** (Nama & Gelar, Jabatan/PPK, NIP/No. Identitas)
  - **Pihak Kedua: Konsultan Perencana** (Nama & Gelar, Nama Kantor Konsultan, Jabatan Team Leader)
  - **Pihak Ketiga: Kontraktor Pelaksana** (Nama Direktur, Nama Perusahaan PT/CV, Jabatan)
  - **Kota & Tanggal Penetapan Dokumen Proposal**
- Menghubungkan seluruh data secara dinamis ke **BAB VII Lembar Pengesahan Proposal A4**, menggantikan nilai statis/hardcoded sebelumnya dengan tabel 3 kolom yang proporsional dan bersih.

### 🧹 Pembersihan Total Teks "Status Dokumen: SAH / RESMI"
- Menghilangkan label "Status Dokumen: SAH / RESMI" dari surat penawaran resmi (Kata Pengantar Proposal Halaman 2) dan kop cetakan A4 (`print-engine.js`), menghasilkan tata letak dokumen yang formal, bersih, dan netral.

### 💧 Engine Watermark Dokumen & Cetakan Transparan (Teks & Logo Gambar)
- Menambahkan fitur Watermark Dokumen & Cetakan:
  - Pilihan mode **Teks Kustom** (dengan preset cepat: DRAFT, PROPOSAL RESMI, CONFIDENTIAL, CONTOH ESTIMASI).
  - Pilihan mode **Gambar / Logo Perusahaan** dengan upload file (PNG, JPG, WEBP, SVG).
  - Opsi warna gambar: **Berwarna Asli (Full Color)** atau **Hitam Putih (Grayscale)**.
  - Slider **Transparansi (Opacity)** presisi dari 5% s.d. 60% dengan display persentase real-time.
  - Pilihan **Orientasi / Sudut Kemiringan** (Miring Diagonal -30°, Mendatar 0°, Miring Tajam -45°).
  - Dilengkapi kotak **Simulasi Tampilan Lembar A4 (Live Mini Preview)** di dalam modal pengaturan.
  - Watermark otomatis dirender di tengah latar belakang seluruh lembar proposal A4 dan cetakan BAP.

### 📅 Kalender Proyek Matematis (Durasi Berbasis OH x Volume)
- Menghitung durasi setiap pekerjaan secara eksak dan ilmiah dari akumulasi koefisien tenaga kerja AHSP dikali volume pekerjaan (`totalItemOH = sum(koef_tenaga) * volume`).
- Alokasi jumlah tenaga kerja riil per regu harian (`crewSize` = 2 s.d. 8 pekerja) yang proporsional sesuai beban OH.
- Memperbaiki perhitungan tanggal sekuensial bebas dari offset UTC/timezone lokal:
  - `finishDate = addDays(startDate, duration - 1)`.
  - **100% Bebas Tanggal Mundur**: Dijamin `finishDate >= startDate`.
- Kolom catatan menampilkan rincian beban OH dan jumlah pekerja per hari (contoh: `Beban: 50.5 OH (4 Pekerja/Hari)`).
- Mengoreksi referensi AHSP plin lantai homogeneous tile (ITM-025) ke `AHSP-0535` standar.

---
## [Version 0.16] - 2026-09-05
### 🎨 Desain Korporat Minimalis & Anti-Alay
- Menghapus seluruh dekorasi garis tebal warna-warni (`border-left: 4px solid ...`) pada kartu ringkasan, financial summary card, termin pembayaran, info proyek, dan box terbilang.
- Warna murni dikhususkan hanya untuk elemen fungsional teknis: Kurva S diagram SVG dan bar task pada kalender pelaksanaan.
- Menambahkan style CSS resmi `.dashboard-grid` dan `.stat-card` dengan palet slate netral arsitektur (#0f172a, #e2e8f0, background #ffffff) dengan kontras tinggi dan rapi.

### 🔍 Perbaikan Total Pencarian AHSP & Katalog Harga (Reaktif & Zero Focus Loss)
- Memperbaiki bug hilangnya kursor / input ter-reset saat mengetik pencarian di tabel AHSP dan Katalog Bahan/Upah.
- Mengimplementasikan Targeted DOM Replacement (`#ahspTableBody` dan `#katalogTableBody`) sehingga input tetap aktif terfokus dan tabel terfilter secara real-time.
- Menambahkan modul API `getSearch()` dan `getCategory()` pada `AhspEngine` dan `CatalogPricing` untuk persistensi state query.
- Menambahkan kontrol paginasi lengkap pada Katalog Upah & Bahan (25, 50, 100, 250 per halaman).

### 🏷️ Standarisasi Kode Seluruh Material & Alat (3.326 Item)
- Melengkapi seluruh database master materials dengan kode baku:
  - Tenaga Kerja: `L.01` s.d. `L.45`
  - Sewa Peralatan / Alat: `E.01` s.d. `E.34`
  - Material / Bahan Fisik: `M.0001` s.d. `M.3247`
- Menambahkan kolom **Kode** pada tabel Rekapitulasi Sumber Daya (Material, Tenaga, dan Alat) serta Katalog Upah & Bahan.

### 🏢 Re-Branding Resmi Aplikasi
- Mengubah nama sistem menjadi **Duta RAB S1**.
- Mengubah footer pengembang menjadi **Dikembangkan: Duta Digital Agensi**.
- Mengubah informasi legalitas menjadi **Dutamik.id | Duta Media Informasi berKarya**.

---

## [Version 0.15] - 2026-09-05
- Draft Skema Pembayaran Termin Otomatis (Standar SE PUPR 2026).
- Penjadwalan Detail per Item AHSP pada Kalender Proyek 1 Tahun.
- Pilihan Cepat Input AHSP pada Detail RAB & Otomatisasi Harga Satuan.
- Modal Pengeditan BAP & Catatan Lapangan Manual.
- Sinkronisasi Dinamis Header Proyek & Buka Kunci Edit Jadwal.
