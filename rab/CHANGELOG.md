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
