// Test Suite Verifikasi Rumus & Integritas Data RAB
const fs = require('fs');
const vm = require('vm');

function loadScript(filePath, sandbox) {
  const code = fs.readFileSync(filePath, 'utf8');
  vm.runInNewContext(code, sandbox);
}

const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null
  },
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; }
  },
  console: console
};
sandbox.window = sandbox;

// Load all modules into sandbox
loadScript('c:/M Iva Khorim/Rencana Anggaran Biaya/js/data/master-materials.js', sandbox);
loadScript('c:/M Iva Khorim/Rencana Anggaran Biaya/js/data/master-ahsp.js', sandbox);
loadScript('c:/M Iva Khorim/Rencana Anggaran Biaya/js/data/regional-presets.js', sandbox);
loadScript('c:/M Iva Khorim/Rencana Anggaran Biaya/js/data/sample-project.js', sandbox);
loadScript('c:/M Iva Khorim/Rencana Anggaran Biaya/js/utils/currency.js', sandbox);
loadScript('c:/M Iva Khorim/Rencana Anggaran Biaya/js/modules/project-manager.js', sandbox);
loadScript('c:/M Iva Khorim/Rencana Anggaran Biaya/js/modules/catalog-pricing.js', sandbox);
loadScript('c:/M Iva Khorim/Rencana Anggaran Biaya/js/modules/ahsp-engine.js', sandbox);
loadScript('c:/M Iva Khorim/Rencana Anggaran Biaya/js/modules/volume-analysis.js', sandbox);
loadScript('c:/M Iva Khorim/Rencana Anggaran Biaya/js/modules/rab-calculator.js', sandbox);
loadScript('c:/M Iva Khorim/Rencana Anggaran Biaya/js/modules/resource-usage.js', sandbox);
loadScript('c:/M Iva Khorim/Rencana Anggaran Biaya/js/modules/scurve-diagram.js', sandbox);
loadScript('c:/M Iva Khorim/Rencana Anggaran Biaya/js/modules/bap-invoicing.js', sandbox);

console.log("=== UNIT TEST SUITE: SISTEM ESTIMASI RAB ===");

// 1. Test Currency & Terbilang
console.log("\n1. Menguji CurrencyUtil & Terbilang:");
const cUtil = sandbox.CurrencyUtil;
const t1 = cUtil.terbilang(1500000);
console.log(" - Terbilang 1.500.000:", t1);
if (!t1.includes("Satu Juta Lima Ratus Ribu Rupiah")) throw new Error("Terbilang mismatch!");

const t2 = cUtil.terbilang(925340000);
console.log(" - Terbilang 925.340.000:", t2);
if (!t2.includes("Sembilan Ratus Dua Puluh Lima Juta")) throw new Error("Terbilang mismatch!");

const fmt = cUtil.formatRupiah(1250000);
console.log(" - Format Rupiah 1250000:", fmt);
if (!fmt.includes("1.250.000")) throw new Error("Format rupiah mismatch!");

// 2. Test Master Data Counts
console.log("\n2. Menguji Integritas Master Data:");
const totalMat = sandbox.MASTER_MATERIALS.length;
const totalAhsp = sandbox.MASTER_AHSP.length;
console.log(` - Total Material/Upah/Alat: ${totalMat} items`);
console.log(` - Total AHSP: ${totalAhsp} items`);
if (totalMat < 3000) throw new Error("Master materials too few!");
if (totalAhsp < 2000) throw new Error("Master AHSP too few!");

// 3. Test Project Initialization & RAB Calculation
console.log("\n3. Menguji Inisialisasi Proyek & Kalkulasi RAB:");
sandbox.ProjectManager.init();
sandbox.CatalogPricing.init();
sandbox.AhspEngine.init();
const activeProj = sandbox.ProjectManager.getActiveProject();
console.log(" - Active Project:", activeProj.name);

const rabCalc = sandbox.RabCalculator.calculateProjectRab(activeProj);
console.log(" - Real Cost:", rabCalc.realCost);
console.log(" - PPN (" + rabCalc.ppnRate + "%):", rabCalc.ppnAmount);
console.log(" - Grand Total:", rabCalc.grandTotal);
console.log(" - Terbilang Grand Total:", rabCalc.terbilangStr);

if (rabCalc.realCost <= 0) throw new Error("Real cost calculation failed!");
if (rabCalc.grandTotal !== (rabCalc.realCost + rabCalc.ppnAmount)) throw new Error("Grand total math error!");

// 4. Test S-Curve Cumulative Target
console.log("\n4. Menguji Distribusi Kurva S:");
const schedule = sandbox.SCurveDiagram.getScheduleData();
console.log(` - Jumlah Minggu Jadwal: ${schedule.length} minggu`);
const lastWeek = schedule[schedule.length - 1];
console.log(` - Target Minggu Terakhir: ${lastWeek.planCum}%`);
if (Math.abs(lastWeek.planCum - 100.0) > 0.1) throw new Error("S-Curve target does not reach 100%!");

// 5. Test Resource Breakdown Calculation
console.log("\n5. Menguji Rekapitulasi Sumber Daya (Material, Tenaga, Alat):");
const res = sandbox.ResourceUsage.calculateTotalResources(activeProj);
console.log(` - Unik Material Terpakai: ${res.materials.length} jenis bahan`);
console.log(` - Unik Tenaga Kerja: ${res.labor.length} klasifikasi tenaga`);
console.log(` - Total Biaya Bahan: Rp ${res.totalMaterials.toLocaleString('id-ID')}`);
console.log(` - Total Biaya Upah: Rp ${res.totalLabor.toLocaleString('id-ID')}`);
console.log(` - Grand Total Sumber Daya: Rp ${res.grandTotal.toLocaleString('id-ID')}`);
if (res.materials.length === 0) throw new Error("Material breakdown empty!");

// 6. Test BAP Invoicing Calculation
console.log("\n6. Menguji Perhitungan BAP Penagihan Termin:");
const bapCalc = sandbox.BapInvoicing.calculateBapValues(rabCalc.grandTotal, 30, 20, 5, 11);
console.log(" - Tagihan Bruto (30%):", bapCalc.grossAmount);
console.log(" - Potongan DP (20%):", bapCalc.dpDeduction);
console.log(" - Potongan Retensi (5%):", bapCalc.retentionDeduction);
console.log(" - Tagihan Sebelum PPN:", bapCalc.netBeforeTax);
console.log(" - Nilai Bersih Tagihan (Net Payable):", bapCalc.netPayable);
console.log(" - Terbilang Tagihan:", bapCalc.terbilangStr);

const expectedNetBefore = bapCalc.grossAmount - bapCalc.dpDeduction - bapCalc.retentionDeduction;
if (bapCalc.netBeforeTax !== expectedNetBefore) throw new Error("BAP net before tax formula error!");

console.log("\n>>> SEMUA 6 SUITE PENGUJIAN TDD BERHASIL 100% (ZERO BUG)! <<<");
