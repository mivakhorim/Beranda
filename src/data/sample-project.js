/**
 * DUTA RAB - PUSTAKA DATA AWAL BERSIH (FRESH ZERO SAMPLE - STANDAR SE PUPR 2026)
 * Seluruh data contoh masif telah dibersihkan agar tampilan proyek fresh dari 0.
 * Menyediakan 1 proyek kosong murni untuk keperluan pengujian mandiri.
 */
window.SAMPLE_EMPTY_TEST_PROJECT = {
  id: "PROJ-TEST-EMPTY",
  name: "Pembangunan Rumah Tinggal Baru",
  owner: "Pemilik Proyek",
  contractor: "PT. Duta Konstruksi Pratama",
  consultant: "PT. Architekta Desain Studio",
  location: "Indonesia",
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
    accountNumber: "131-00-8899221-5",
    accountName: "PT. Duta Konstruksi Pratama"
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
    ownerName: "Pemilik Proyek",
    ownerTitle: "Pemilik Bangunan / Pemberi Tugas",
    ownerNip: "-",
    consultantCompany: "PT. Architekta Desain Studio",
    consultantName: "Ir. Bambang Hartono, S.T., MT",
    consultantTitle: "Konsultan Perencana / Team Leader",
    contractorCompany: "PT. Duta Konstruksi Pratama",
    contractorName: "H. Ahmad Fauzi, S.T.",
    contractorTitle: "Direktur Utama",
    qcInspectorName: "Ir. M. Ridwan",
    qcInspectorRole: "Site Inspector / QC",
    fieldMandorName: "Sutarji / Warsito",
    fieldMandorRole: "Mandor Lapangan",
    siteManagerName: "Ir. Hendra Prasetya",
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
