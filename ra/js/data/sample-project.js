/**
 * CONTOH PROYEK TERPADU MULTI-BIDANG SE NO 47/SE/Dk/2026
 * Meliputi: Jalan Akses, Jembatan Girder, Jaringan Irigasi, Gedung Kantor Operasional, dan SMKK
 */
window.SAMPLE_PROJECT_V2 = {
  "id": "PROJ-SE47-2026-MULTI",
  "name": "Pembangunan Jalan Akses, Jembatan Girder, Jaringan Irigasi, Gedung Kantor Operasional, dan Penerapan SMKK",
  "owner": "Pejabat Pembuat Komitmen (PPK) Pembangunan Infrastruktur Terpadu",
  "ministry": "Kementerian Pekerjaan Umum Republik Indonesia",
  "contractor": "PT. Wijaya Bangun Perkasa (Persero) Tbk",
  "consultant": "PT. Virama Karya Engineering Consultant",
  "location": "Kawasan Strategis Nasional, Jawa Barat / Kaltim",
  "startDate": "2026-05-01",
  "finishDate": "2026-12-31",
  "durationDays": 245,
  "docNumber": "KTR/PU-SE47/2026/05-001",
  "regionId": "jabar-bdg",
  "regionName": "Jawa Barat - Bandung Raya & Priangan",
  "ppnRate": 11,
  "includePpn": true,
  "overheadRate": 10,
  "divisions": [
    {
      "id": "DIV-SMKK",
      "code": "DIVISI 1",
      "name": "BIAYA PENERAPAN SISTEM MANAJEMEN KESELAMATAN KONSTRUKSI (SMKK)",
      "bidang": "SMKK",
      "items": [
        {
          "id": "ITM-SMKK-01",
          "code": "SMKK-01.01",
          "ahspId": "AHSP-SMKK-0101",
          "name": "Penyusunan dan Pembuatan Dokumen RKK",
          "unit": "set",
          "volume": 1,
          "price": 3000000,
          "notes": "Dokumen RKK Pelaksanaan Lengkap"
        },
        {
          "id": "ITM-SMKK-02",
          "code": "SMKK-02.01",
          "ahspId": "AHSP-SMKK-0201",
          "name": "Induksi Keselamatan (Safety Induction) dan TBM",
          "unit": "bulan",
          "volume": 8,
          "price": 2200000,
          "notes": "Pelaksanaan rutin bulanan"
        },
        {
          "id": "ITM-SMKK-03",
          "code": "SMKK-03.01",
          "ahspId": "AHSP-SMKK-0301",
          "name": "Jaring Pengaman (Safety Net)",
          "unit": "m2",
          "volume": 450,
          "price": 38850,
          "notes": "Proteksi area jembatan & lereng"
        },
        {
          "id": "ITM-SMKK-04",
          "code": "SMKK-03.03",
          "ahspId": "AHSP-SMKK-0303",
          "name": "Paket APD Standar Pekerja Lapangan",
          "unit": "set",
          "volume": 85,
          "price": 399000,
          "notes": "Helm, Rompi, Sepatu Safety, Sarung Tangan, Kacamata"
        },
        {
          "id": "ITM-SMKK-05",
          "code": "SMKK-05.01",
          "ahspId": "AHSP-SMKK-0501",
          "name": "Honorarium Ahli Muda Keselamatan Konstruksi",
          "unit": "OB",
          "volume": 8,
          "price": 9500000,
          "notes": "Personel K3 stand by penuh waktu"
        }
      ]
    },
    {
      "id": "DIV-JALAN",
      "code": "DIVISI 2",
      "name": "PEKERJAAN JALAN AKSES (BINA MARGA)",
      "bidang": "Bina Marga",
      "items": [
        {
          "id": "ITM-BM-01",
          "code": "3.1.(1a)",
          "ahspId": "AHSP-BM-0301",
          "name": "Galian Biasa untuk Badan Jalan",
          "unit": "m3",
          "volume": 4200,
          "price": 52029,
          "notes": "Galian trase jalan akses"
        },
        {
          "id": "ITM-BM-02",
          "code": "3.2.(1a)",
          "ahspId": "AHSP-BM-0302",
          "name": "Timbunan Biasa Dipadatkan dari Quarry",
          "unit": "m3",
          "volume": 2800,
          "price": 157311,
          "notes": "Timbunan badan jalan padat"
        },
        {
          "id": "ITM-BM-03",
          "code": "3.5.(1a)",
          "ahspId": "AHSP-BM-0303",
          "name": "Geotekstil Filter Separator Non-Woven",
          "unit": "m2",
          "volume": 3600,
          "price": 40645,
          "notes": "Pemisah tanah dasar lunak"
        },
        {
          "id": "ITM-BM-04",
          "code": "5.1.(1)",
          "ahspId": "AHSP-BM-0501",
          "name": "Lapis Pondasi Agregat Kelas A",
          "unit": "m3",
          "volume": 950,
          "price": 576444,
          "notes": "Tebal padat 15 cm"
        },
        {
          "id": "ITM-BM-05",
          "code": "6.1.(1a)",
          "ahspId": "AHSP-BM-0601",
          "name": "Lapis Resap Pengikat (Prime Coat)",
          "unit": "liter",
          "volume": 4800,
          "price": 18707,
          "notes": "Penyemprotan merata atas LPA"
        },
        {
          "id": "ITM-BM-06",
          "code": "6.3.(5a)",
          "ahspId": "AHSP-BM-0603",
          "name": "Laston Lapis Aus (AC-WC)",
          "unit": "ton",
          "volume": 720,
          "price": 1488126,
          "notes": "Lapis permukaan jalan tebal 4 cm"
        },
        {
          "id": "ITM-BM-07",
          "code": "10.1.(21)",
          "ahspId": "AHSP-BM-1002",
          "name": "Pengecatan Marka Termoplastik Manik Kaca",
          "unit": "m2",
          "volume": 320,
          "price": 253193,
          "notes": "Garis tepi dan putus-putus"
        }
      ]
    },
    {
      "id": "DIV-JEMBATAN",
      "code": "DIVISI 3",
      "name": "PEKERJAAN JEMBATAN GELAGAR BETON (BINA MARGA)",
      "bidang": "Bina Marga",
      "items": [
        {
          "id": "ITM-JMB-01",
          "code": "7.6.(1)",
          "ahspId": "AHSP-BM-0703",
          "name": "Tiang Pancang Pratekan Dia 500 mm (Spun Pile)",
          "unit": "M",
          "volume": 360,
          "price": 1215285,
          "notes": "Fondasi dalam abutment jembatan"
        },
        {
          "id": "ITM-JMB-02",
          "code": "7.1.(5a)",
          "ahspId": "AHSP-BM-0701",
          "name": "Beton Struktur fc 30 MPa untuk Abutment & Gelagar",
          "unit": "m3",
          "volume": 280,
          "price": 1494515,
          "notes": "K-350 struktur utama"
        },
        {
          "id": "ITM-JMB-03",
          "code": "7.3.(1)",
          "ahspId": "AHSP-BM-0702",
          "name": "Baja Tulangan Sirip BjTS 420B",
          "unit": "kg",
          "volume": 38500,
          "price": 20092,
          "notes": "Pembesian abutment dan lantai jembatan"
        },
        {
          "id": "ITM-JMB-04",
          "code": "2.2.(1)",
          "ahspId": "AHSP-BM-0202",
          "name": "Pasangan Batu dengan Mortar Sayap Abutment",
          "unit": "m3",
          "volume": 140,
          "price": 1175618,
          "notes": "Dinding penahan tanah jembatan"
        }
      ]
    },
    {
      "id": "DIV-IRIGASI",
      "code": "DIVISI 4",
      "name": "PEKERJAAN SALURAN IRIGASI & PINTU AIR (SUMBER DAYA AIR)",
      "bidang": "Sumber Daya Air",
      "items": [
        {
          "id": "ITM-SDA-01",
          "code": "A.3.01.a.1",
          "ahspId": "AHSP-SDA-0301",
          "name": "Galian Tanah Biasa Saluran dengan Excavator",
          "unit": "m3",
          "volume": 3100,
          "price": 46877,
          "notes": "Galian profil saluran irigasi sekunder"
        },
        {
          "id": "ITM-SDA-02",
          "code": "A.1.02.a.1",
          "ahspId": "AHSP-SDA-0104",
          "name": "Pasangan Batu Kali 1:3 Lining Saluran",
          "unit": "m3",
          "volume": 650,
          "price": 1213160,
          "notes": "Lining dinding dan lantai saluran"
        },
        {
          "id": "ITM-SDA-03",
          "code": "A.1.03.a.1",
          "ahspId": "AHSP-SDA-0105",
          "name": "Pemasangan Bronjong Kawat Pabrikasi",
          "unit": "m3",
          "volume": 180,
          "price": 751928,
          "notes": "Perkuatan tebing hilir saluran"
        },
        {
          "id": "ITM-SDA-04",
          "code": "A.3.02.a.1",
          "ahspId": "AHSP-SDA-0303",
          "name": "Pintu Air Sorong Baja Biconcave 1.0 x 1.5 m",
          "unit": "unit",
          "volume": 2,
          "price": 39396500,
          "notes": "Bangunan bagi sadap saluran"
        }
      ]
    },
    {
      "id": "DIV-GEDUNG",
      "code": "DIVISI 5",
      "name": "GEDUNG KANTOR OPERASIONAL & POS JAGA (CIPTA KARYA)",
      "bidang": "Cipta Karya",
      "items": [
        {
          "id": "ITM-CK-01",
          "code": "1.1.1.1",
          "ahspId": "AHSP-0001",
          "name": "Pembuatan Pagar Sementara Kayu Tinggi 2 Meter",
          "unit": "m'",
          "volume": 60,
          "price": 823188,
          "notes": "Pagar keliling tapak kantor"
        },
        {
          "id": "ITM-CK-02",
          "code": "1.1.2.1",
          "ahspId": "AHSP-0007",
          "name": "Pengukuran dan Pemasangan Bouwplank",
          "unit": "m'",
          "volume": 48,
          "price": 136500,
          "notes": "Titik as bangunan"
        },
        {
          "id": "ITM-CK-03",
          "code": "2.1.1.1",
          "ahspId": "AHSP-0173",
          "name": "Pekerjaan Galian Pondasi Gedung",
          "unit": "m3",
          "volume": 85,
          "price": 78500,
          "notes": "Galian pondasi footplat"
        },
        {
          "id": "ITM-CK-04",
          "code": "2.2.1.2",
          "ahspId": "AHSP-0195",
          "name": "Pondasi Batu Kali 1:4 Gedung",
          "unit": "m3",
          "volume": 42,
          "price": 1145000,
          "notes": "Pondasi menerus"
        },
        {
          "id": "ITM-CK-05",
          "code": "3.1.1.1",
          "ahspId": "AHSP-0380",
          "name": "Dinding Pasangan Bata Ringan Mortar Tebal 10 cm",
          "unit": "m2",
          "volume": 240,
          "price": 168000,
          "notes": "Dinding kantor operasional"
        }
      ]
    }
  ],
  "signatories": {
    "ownerName": "Pejabat Pembuat Komitmen (PPK)",
    "ownerTitle": "PPK Pembangunan Infrastruktur Terpadu Kementerian PU",
    "ownerNip": "19820315 200812 1 001",
    "consultantCompany": "PT. Virama Karya Engineering Consultant",
    "consultantName": "Ir. Bambang Hartono, S.T., M.T.",
    "consultantTitle": "Team Leader / Supervisi Lapangan",
    "contractorCompany": "PT. Wijaya Bangun Perkasa (Persero) Tbk",
    "contractorName": "Ir. H. Ahmad Fauzi, S.T., M.M.",
    "contractorTitle": "Direktur Proyek Infrastruktur",
    "qcInspectorName": "Ir. M. Ridwan",
    "qcInspectorRole": "Quality Assurance & QC Engineer",
    "fieldMandorName": "Sutarji / Warsito",
    "fieldMandorRole": "Koordinator Lapangan & K3 Konstruksi",
    "siteManagerName": "Ir. Hendra Prasetya, S.T.",
    "siteManagerRole": "General Site Manager",
    "docCity": "Bandung",
    "docDate": "2026-05-01"
  },
  "bankInfo": {
    "bankName": "Bank Mandiri (Persero) Tbk",
    "accountNumber": "131-00-8899221-5",
    "accountName": "PT Wijaya Bangun Perkasa (Persero) Tbk"
  }
};

// 100% Backward-Compatibility Alias
window.SAMPLE_PROJECT = window.SAMPLE_PROJECT_V2;
