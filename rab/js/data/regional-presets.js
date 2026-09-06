// Preset Indeks & Benchmark Harga Upah dan Bahan Multi-Daerah di Indonesia
// Berdasarkan Standar SE PUPR Bina Konstruksi No 47/2026 & Peraturan Remunerasi Daerah

window.REGIONAL_PRESETS = [
  {
    id: "custom",
    name: "Indeks Kustom (Disesuaikan Mandiri)",
    province: "Kustom",
    zone: "Kustom",
    indexMultiplier: 1.00,
    isCustom: true,
    benchmarks: {
      pekerja: 100000,
      tukang: 145000,
      kepalaTukang: 165000,
      mandor: 185000,
      semen50kg: 72000,
      pasirM3: 260000,
      batuBelahM3: 275000,
      bataMerahBh: 900,
      besiBetonKg: 14500
    }
  },

  {
    id: "std",
    name: "Standar Nasional (SE No. 47/SE/Dk/2026)",
    province: "Nasional",
    zone: "Basis",
    indexMultiplier: 1.00,
    benchmarks: {
      pekerja: 100000,
      tukang: 145000,
      kepalaTukang: 165000,
      mandor: 185000,
      semen50kg: 72000,
      pasirM3: 260000,
      batuBelahM3: 275000,
      bataMerahBh: 900,
      besiBetonKg: 14500
    }
  },
  {
    id: "dki",
    name: "DKI Jakarta (Jabodetabek Inti)",
    province: "DKI Jakarta",
    zone: "Jawa",
    indexMultiplier: 1.18,
    benchmarks: {
      pekerja: 135000,
      tukang: 180000,
      kepalaTukang: 200000,
      mandor: 225000,
      semen50kg: 78000,
      pasirM3: 340000,
      batuBelahM3: 350000,
      bataMerahBh: 1100,
      besiBetonKg: 16200
    }
  },
  {
    id: "jabar-bdg",
    name: "Jawa Barat - Bandung Raya & Priangan",
    province: "Jawa Barat",
    zone: "Jawa",
    indexMultiplier: 1.04,
    benchmarks: {
      pekerja: 110000,
      tukang: 155000,
      kepalaTukang: 175000,
      mandor: 195000,
      semen50kg: 74000,
      pasirM3: 280000,
      batuBelahM3: 290000,
      bataMerahBh: 950,
      besiBetonKg: 15000
    }
  },
  {
    id: "jabar-bks",
    name: "Jawa Barat - Bekasi / Karawang / Bogor / Depok",
    province: "Jawa Barat",
    zone: "Jawa",
    indexMultiplier: 1.12,
    benchmarks: {
      pekerja: 125000,
      tukang: 170000,
      kepalaTukang: 190000,
      mandor: 210000,
      semen50kg: 76000,
      pasirM3: 310000,
      batuBelahM3: 320000,
      bataMerahBh: 1050,
      besiBetonKg: 15600
    }
  },
  {
    id: "jateng",
    name: "Jawa Tengah - Semarang / Solo / Banyumas",
    province: "Jawa Tengah",
    zone: "Jawa",
    indexMultiplier: 0.94,
    benchmarks: {
      pekerja: 90000,
      tukang: 130000,
      kepalaTukang: 150000,
      mandor: 170000,
      semen50kg: 70000,
      pasirM3: 230000,
      batuBelahM3: 240000,
      bataMerahBh: 800,
      besiBetonKg: 14200
    }
  },
  {
    id: "diy",
    name: "DI Yogyakarta - Sleman / Bantul / Kota",
    province: "DI Yogyakarta",
    zone: "Jawa",
    indexMultiplier: 0.95,
    benchmarks: {
      pekerja: 92000,
      tukang: 132000,
      kepalaTukang: 152000,
      mandor: 172000,
      semen50kg: 71000,
      pasirM3: 235000,
      batuBelahM3: 245000,
      bataMerahBh: 820,
      besiBetonKg: 14300
    }
  },
  {
    id: "jatim-sby",
    name: "Jawa Timur - Surabaya / Sidoarjo / Gresik",
    province: "Jawa Timur",
    zone: "Jawa",
    indexMultiplier: 1.05,
    benchmarks: {
      pekerja: 115000,
      tukang: 160000,
      kepalaTukang: 180000,
      mandor: 200000,
      semen50kg: 73000,
      pasirM3: 275000,
      batuBelahM3: 285000,
      bataMerahBh: 900,
      besiBetonKg: 14800
    }
  },
  {
    id: "jatim-daerah",
    name: "Jawa Timur - Malang / Kediri / Madiun / Jember",
    province: "Jawa Timur",
    zone: "Jawa",
    indexMultiplier: 0.97,
    benchmarks: {
      pekerja: 95000,
      tukang: 135000,
      kepalaTukang: 155000,
      mandor: 175000,
      semen50kg: 71000,
      pasirM3: 240000,
      batuBelahM3: 250000,
      bataMerahBh: 850,
      besiBetonKg: 14400
    }
  },
  {
    id: "banten",
    name: "Banten - Serang / Cilegon / Tangerang Raya",
    province: "Banten",
    zone: "Jawa",
    indexMultiplier: 1.10,
    benchmarks: {
      pekerja: 120000,
      tukang: 165000,
      kepalaTukang: 185000,
      mandor: 205000,
      semen50kg: 75000,
      pasirM3: 300000,
      batuBelahM3: 310000,
      bataMerahBh: 1000,
      besiBetonKg: 15400
    }
  },
  {
    id: "bali",
    name: "Bali - Denpasar / Badung / Gianyar",
    province: "Bali",
    zone: "Bali-Nusa Tenggara",
    indexMultiplier: 1.12,
    benchmarks: {
      pekerja: 120000,
      tukang: 170000,
      kepalaTukang: 190000,
      mandor: 215000,
      semen50kg: 78000,
      pasirM3: 320000,
      batuBelahM3: 330000,
      bataMerahBh: 1150,
      besiBetonKg: 15800
    }
  },
  {
    id: "ntb",
    name: "Nusa Tenggara Barat - Mataram / Lombok",
    province: "Nusa Tenggara Barat",
    zone: "Bali-Nusa Tenggara",
    indexMultiplier: 1.06,
    benchmarks: {
      pekerja: 105000,
      tukang: 150000,
      kepalaTukang: 170000,
      mandor: 190000,
      semen50kg: 79000,
      pasirM3: 290000,
      batuBelahM3: 300000,
      bataMerahBh: 1000,
      besiBetonKg: 15900
    }
  },
  {
    id: "ntt",
    name: "Nusa Tenggara Timur - Kupang / Flores",
    province: "Nusa Tenggara Timur",
    zone: "Bali-Nusa Tenggara",
    indexMultiplier: 1.22,
    benchmarks: {
      pekerja: 115000,
      tukang: 165000,
      kepalaTukang: 185000,
      mandor: 210000,
      semen50kg: 89000,
      pasirM3: 350000,
      batuBelahM3: 360000,
      bataMerahBh: 1400,
      besiBetonKg: 17500
    }
  },
  {
    id: "sumut",
    name: "Sumatera Utara - Medan / Deli Serdang",
    province: "Sumatera Utara",
    zone: "Sumatera",
    indexMultiplier: 1.08,
    benchmarks: {
      pekerja: 110000,
      tukang: 155000,
      kepalaTukang: 175000,
      mandor: 195000,
      semen50kg: 76000,
      pasirM3: 290000,
      batuBelahM3: 300000,
      bataMerahBh: 950,
      besiBetonKg: 15500
    }
  },
  {
    id: "sumbar",
    name: "Sumatera Barat - Padang / Bukittinggi",
    province: "Sumatera Barat",
    zone: "Sumatera",
    indexMultiplier: 1.04,
    benchmarks: {
      pekerja: 105000,
      tukang: 150000,
      kepalaTukang: 170000,
      mandor: 190000,
      semen50kg: 74000,
      pasirM3: 280000,
      batuBelahM3: 290000,
      bataMerahBh: 920,
      besiBetonKg: 15200
    }
  },
  {
    id: "riau",
    name: "Riau - Pekanbaru / Dumai",
    province: "Riau",
    zone: "Sumatera",
    indexMultiplier: 1.14,
    benchmarks: {
      pekerja: 120000,
      tukang: 168000,
      kepalaTukang: 188000,
      mandor: 210000,
      semen50kg: 82000,
      pasirM3: 320000,
      batuBelahM3: 330000,
      bataMerahBh: 1100,
      besiBetonKg: 16500
    }
  },
  {
    id: "sumsel",
    name: "Sumatera Selatan - Palembang",
    province: "Sumatera Selatan",
    zone: "Sumatera",
    indexMultiplier: 1.06,
    benchmarks: {
      pekerja: 108000,
      tukang: 152000,
      kepalaTukang: 172000,
      mandor: 192000,
      semen50kg: 75000,
      pasirM3: 285000,
      batuBelahM3: 295000,
      bataMerahBh: 940,
      besiBetonKg: 15300
    }
  },
  {
    id: "kaltim",
    name: "Kalimantan Timur - Balikpapan / Samarinda",
    province: "Kalimantan Timur",
    zone: "Kalimantan",
    indexMultiplier: 1.22,
    benchmarks: {
      pekerja: 130000,
      tukang: 180000,
      kepalaTukang: 200000,
      mandor: 230000,
      semen50kg: 86000,
      pasirM3: 380000,
      batuBelahM3: 390000,
      bataMerahBh: 1400,
      besiBetonKg: 17200
    }
  },
  {
    id: "ikn",
    name: "Ibu Kota Nusantara (IKN Nusantara)",
    province: "Kalimantan Timur",
    zone: "Kalimantan",
    indexMultiplier: 1.28,
    benchmarks: {
      pekerja: 145000,
      tukang: 195000,
      kepalaTukang: 220000,
      mandor: 250000,
      semen50kg: 92000,
      pasirM3: 420000,
      batuBelahM3: 430000,
      bataMerahBh: 1550,
      besiBetonKg: 18000
    }
  },
  {
    id: "sulsel",
    name: "Sulawesi Selatan - Makassar / Gowa",
    province: "Sulawesi Selatan",
    zone: "Sulawesi",
    indexMultiplier: 1.05,
    benchmarks: {
      pekerja: 105000,
      tukang: 150000,
      kepalaTukang: 170000,
      mandor: 190000,
      semen50kg: 74000,
      pasirM3: 270000,
      batuBelahM3: 280000,
      bataMerahBh: 900,
      besiBetonKg: 15000
    }
  },
  {
    id: "papua",
    name: "Papua - Jayapura / Merauke",
    province: "Papua",
    zone: "Papua",
    indexMultiplier: 1.55,
    benchmarks: {
      pekerja: 160000,
      tukang: 220000,
      kepalaTukang: 250000,
      mandor: 290000,
      semen50kg: 125000,
      pasirM3: 550000,
      batuBelahM3: 580000,
      bataMerahBh: 2200,
      besiBetonKg: 22000
    }
  }
];
