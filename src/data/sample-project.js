/**
 * DUTA RAB - PUSTAKA DATA AWAL BERSIH (FRESH ZERO SAMPLE - STANDAR SE PUPR 2026)
 * Seluruh data contoh masif telah dibersihkan agar tampilan proyek fresh dari 0.
 * Menyediakan 1 proyek kosong murni untuk keperluan pengujian mandiri.
 */
window.SAMPLE_EMPTY_TEST_PROJECT = {
  id: "PROJ-TEST-EMPTY",
  name: "Pembangunan Rumah Tinggal Baru",
  owner: "Orang Pertama",
  contractor: "Duta Digital Agensi",
  consultant: "Duta Digital Agensi",
  location: "Bandung",
  startDate: "2026-09-08",
  finishDate: "2027-03-08",
  durationDays: 180,
  projectType: "new",
  buildingArea: 100,
  landArea: 120,
  existingBuildingArea: 0,
  rehabArea: 0,
  docNumber: "RAB/2026/001",
  regionId: "std",
  regionName: "Standar Daerah",
  ppnRate: 0,
  includePpn: true,
  overheadRate: 0,
  bankInfo: {
    bankName: "Bank Mandiri",
    accountNumber: "xxx-xxx-xxxxxxxx-x",
    accountName: "Duta Digital Agensi"
  },
  divisions: [
    { id: "DIV-01", code: "I", name: "PEKERJAAN PERSIAPAN", items: [], subtotal: 0, weightPercent: 0 },
    { id: "DIV-02", code: "II", name: "PEKERJAAN PONDASI & STRUKTUR BETON", items: [], subtotal: 0, weightPercent: 0 },
    { id: "DIV-03", code: "III", name: "PEKERJAAN DINDING & ARSITEKTUR", items: [], subtotal: 0, weightPercent: 0 },
    { id: "DIV-04", code: "IV", name: "PEKERJAAN ATAP & PLAFON", items: [], subtotal: 0, weightPercent: 0 },
    { id: "DIV-05", code: "V", name: "PEKERJAAN MEKANIKAL, ELEKTRIKAL & FINISHING", items: [], subtotal: 0, weightPercent: 0 }
  ],
  volumeCalculations: [],
  signatories: {
    ownerName: "Orang Pertama",
    ownerTitle: "Pemilik Bangunan / Pemberi Tugas",
    ownerNip: "-",
    consultantCompany: "Duta Digital Agensi",
    consultantName: "Orang Kedua",
    consultantTitle: "Dutamik.id",
    contractorCompany: "Duta Digital Agensi",
    contractorName: "Orang Ketiga",
    contractorTitle: "Dutamik.id",
    qcInspectorName: "Orang Keempat",
    qcInspectorRole: "Site Inspector / QC",
    fieldMandorName: "Orang Keenam",
    fieldMandorRole: "Mandor Lapangan",
    siteManagerName: "Orang Kelima",
    siteManagerRole: "Site Manager",
    docCity: "Bandung",
    docDate: "2026-09-08"
  },
  scheduleWeekly: [],
  calendarTasks: [],
  terminSchemes: [],
  siteInspections: [],
  bapRecords: [],
  customPrices: {},
  customAhsp: {}
};

// Aliases dinonaktifkan untuk mencegah pencemaran data sample lama
window.SAMPLE_PROJECT_V2 = null;
window.SAMPLE_PROJECT_SUBSIDI_30 = null;
window.SAMPLE_PROJECT_HOUSE = null;
