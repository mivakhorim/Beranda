/**
 * S-Curve Diagram Module (SVG Vektor Interaktif & Siap Cetak A4)
 * TERINTEGRASI PENUH DENGAN KALENDER PROYEK (ProjectCalendar)
 * Menampilkan:
 * 1. Grid Harian (H-1, H-2, ... H-n) & Grid Mingguan (M-1, M-2, ... M-w)
 * 2. Kurva Rencana Kumulatif (Target %) dari Jadwal Kalender Pekerjaan
 * 3. Kurva Realisasi Kumulatif (Progress Aktual %) dari Status Task Kalender
 * 4. Diagram Batang Bobot Harian / Mingguan (Plan vs Actual)
 * 5. Status Deviasi Waktu (Ahead / Behind Schedule)
 */

window.SCurveDiagram = (function() {
  function formatShortDateIndo(d) {
    if (!d || isNaN(d.getTime())) return "-";
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }

  function formatShortDateNoYear(d) {
    if (!d || isNaN(d.getTime())) return "-";
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    return `${day} ${month}`;
  }

  function getDayNameIndo(d) {
    if (!d || isNaN(d.getTime())) return "";
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[d.getDay()];
  }

  function parseYMD(s) {
    if (!s) return null;
    if (s instanceof Date) return new Date(s.getFullYear(), s.getMonth(), s.getDate());
    const p = String(s).split('-');
    if (p.length === 3) {
      return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function formatYMD(d) {
    if (!d || isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function addDays(d, n) {
    const res = new Date(d);
    res.setDate(res.getDate() + n);
    return res;
  }

  // Menentukan faktor progres aktual fisik (0.0 s.d. 1.0) secara konsisten dari Kalender Proyek
  function getTaskProgressFactor(t) {
    if (!t) return 0;
    const st = (t.status || "").toLowerCase().trim();

    // 1. Status Belum Mulai / Kosong / Not Started -> Mutlak 0% (0.0)
    if (!st || st.includes("belum") || st.includes("not started")) {
      return 0.0;
    }

    // 2. Status Selesai / Completed / 100% -> Mutlak 100% (1.0)
    if (st.includes("selesai") || st.includes("completed") || st.includes("100")) {
      return 1.0;
    }

    // 3. Jika ada actualProgress numerik eksplisit
    if (t.actualProgress !== undefined && t.actualProgress !== null && !isNaN(Number(t.actualProgress))) {
      const num = Number(t.actualProgress);
      if (num >= 0 && num <= 100) {
        return num / 100;
      }
    }

    // 4. Status Sedang Berjalan default 50% jika belum diatur angka spesifik
    if (st.includes("jalan") || st.includes("progress") || st.includes("proses")) {
      return 0.5;
    }

    // 5. Status Terkendala default 25% jika belum diatur angka spesifik
    if (st.includes("kendala") || st.includes("pending")) {
      return 0.25;
    }

    return 0.0;
  }

  function getScheduleData(mode = 'auto') {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return [];
    
    const schedules = calculateScheduleFromCalendar(proj);
    if (!schedules) return [];

    const totalDays = schedules.totalDays || (proj.scheduleDaily ? proj.scheduleDaily.length : 1);
    
    if (mode === 'daily') {
      return schedules.scheduleDaily || proj.scheduleDaily || [];
    }
    if (mode === 'weekly') {
      return schedules.scheduleWeekly || proj.scheduleWeekly || [];
    }

    // Mode auto: jika total hari <= 30 hari, utamakan Grid Harian agar detail dan tidak flat!
    if (totalDays <= 30) {
      return schedules.scheduleDaily || proj.scheduleDaily || [];
    }
    return schedules.scheduleWeekly || proj.scheduleWeekly || [];
  }

  // Menghitung distribusi jadwal harian dan mingguan Kurva S langsung dari Kalender Proyek (Single Source of Truth)
  function calculateScheduleFromCalendar(project = null) {
    const proj = project || window.ProjectManager.getActiveProject();
    if (!proj) return { scheduleDaily: [], scheduleWeekly: [], totalDays: 0, weeksCount: 0 };

    const tasks = (window.ProjectCalendar && window.ProjectCalendar.getTasks)
      ? window.ProjectCalendar.getTasks()
      : (proj.calendarTasks || []);

    const rabResult = window.RabCalculator ? window.RabCalculator.calculateProjectRab(proj) : null;
    const totalRabCost = (rabResult && rabResult.realCost > 0) ? rabResult.realCost : 1000000;

    const divWeights = {};
    if (proj.divisions && proj.divisions.length > 0) {
      proj.divisions.forEach(d => {
        divWeights[d.name] = Number(d.subtotal) || 0;
      });
    }

    let minD = null;
    let maxD = null;

    if (tasks.length > 0) {
      tasks.forEach(t => {
        const s = parseYMD(t.startDate || t.stdStartDate);
        const f = parseYMD(t.finishDate || t.stdFinishDate);
        if (s && (!minD || s < minD)) minD = s;
        if (f && (!maxD || f > maxD)) maxD = f;
      });
    }

    const startD = minD || parseYMD(proj.startDate) || parseYMD("2026-09-07");
    let finishD = maxD || parseYMD(proj.finishDate);
    if (!finishD || finishD < startD) {
      const durDays = Number(proj.durationDays) || 3;
      finishD = addDays(startD, Math.max(1, durDays - 1));
    }

    // Hitung total hari pelaksanaan riil
    const totalDays = Math.max(1, Math.ceil((finishD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const weeksCount = Math.max(1, Math.ceil(totalDays / 7));

    // ==========================================
    // 1. HITUNG GRID HARIAN (H-1 s.d. H-n)
    // ==========================================
    const scheduleDaily = [];
    const defaultTaskCost = tasks.length > 0 ? (totalRabCost / tasks.length) : (totalRabCost / totalDays);

    // Deteksi validasi progres riil MURNI dari status pekerjaan Kalender Proyek
    let maxActualProgressDate = null;
    let hasAnyTaskProgress = false;

    if (tasks.length > 0) {
      tasks.forEach(t => {
        const p = getTaskProgressFactor(t);
        if (p > 0) {
          hasAnyTaskProgress = true;
          const tStart = parseYMD(t.startDate || t.stdStartDate) || startD;
          const tFinish = parseYMD(t.finishDate || t.stdFinishDate) || tStart;
          const tEndInclusive = addDays(tFinish, 1);
          const dur = Math.max(1, Math.round((tEndInclusive.getTime() - tStart.getTime()) / (1000 * 60 * 60 * 24)));
          const actDays = Math.max(1, Math.ceil(dur * p));
          const taskCutoff = addDays(tStart, actDays);
          if (!maxActualProgressDate || taskCutoff > maxActualProgressDate) {
            maxActualProgressDate = taskCutoff;
          }
        }
      });
    }

    const hasRealProgress = hasAnyTaskProgress;

    for (let i = 0; i < totalDays; i++) {
      const curDate = addDays(startD, i);
      const curDateStr = formatYMD(curDate);
      const curDateIndo = formatShortDateIndo(curDate);
      const curDateShort = formatShortDateNoYear(curDate);
      const dayName = getDayNameIndo(curDate);

      let dayPlanCost = 0;
      let dayActCost = 0;
      const activeTaskNames = [];

      if (tasks.length > 0) {
        tasks.forEach(t => {
          const tStart = parseYMD(t.startDate || t.stdStartDate) || startD;
          const tFinish = parseYMD(t.finishDate || t.stdFinishDate) || tStart;
          const tEndInclusive = addDays(tFinish, 1);
          const tDurationDays = Math.max(1, Math.round((tEndInclusive.getTime() - tStart.getTime()) / (1000 * 60 * 60 * 24)));

          let taskCost = defaultTaskCost;
          if (t.cost !== undefined && Number(t.cost) > 0) {
            taskCost = Number(t.cost);
          } else if (proj.divisions) {
            const matchedDiv = proj.divisions.find(d => 
              (t.divisionName && d.name && d.name.toLowerCase() === t.divisionName.toLowerCase()) ||
              (t.divisionCode && d.code && d.code === t.divisionCode) ||
              t.name.toLowerCase().includes(d.name.toLowerCase()) || 
              d.name.toLowerCase().includes(t.name.toLowerCase())
            );
            if (matchedDiv && matchedDiv.items && matchedDiv.items.length > 0) {
              taskCost = (divWeights[matchedDiv.name] || defaultTaskCost) / matchedDiv.items.length;
            }
          }

          const costPerDay = taskCost / tDurationDays;
          const progressFactor = getTaskProgressFactor(t);

          // Cek apakah task aktif pada tanggal ini
          if (curDate >= tStart && curDate <= tFinish) {
            dayPlanCost += costPerDay;
            activeTaskNames.push(t.name || t.taskName || "Pekerjaan");

            if (progressFactor > 0) {
              const actDaysCount = Math.max(1, Math.ceil(tDurationDays * progressFactor));
              const taskActCutoff = addDays(tStart, actDaysCount - 1);
              if (curDate <= taskActCutoff) {
                dayActCost += costPerDay;
              }
            }
          }
        });
      }

      // Jika belum ada task yang teralokasi pada hari ini, beri bobot standar
      if (dayPlanCost === 0 && tasks.length === 0) {
        const x = (i - (totalDays / 2)) / (Math.max(1, totalDays / 4));
        dayPlanCost = Math.exp(-0.5 * x * x) + 0.1;
      }

      scheduleDaily.push({
        day: i + 1,
        date: curDateStr,
        dateFormatted: curDateIndo,
        dateShort: curDateShort,
        dayName: dayName,
        label: `H-${i + 1}`,
        fullLabel: `H-${i + 1} (${dayName}, ${curDateShort})`,
        planCost: dayPlanCost,
        actCost: dayActCost,
        activeTasks: activeTaskNames,
        planDaily: 0,
        planCum: 0,
        actDaily: null,
        actCum: null
      });
    }

    // Normalisasi Grid Harian
    const totalDailyPlanCost = scheduleDaily.reduce((sum, s) => sum + s.planCost, 0) || 1;
    let cumDailyPlan = 0;
    let cumDailyAct = 0;

    scheduleDaily.forEach((s, idx) => {
      const pct = (s.planCost / totalDailyPlanCost) * 100;
      cumDailyPlan += pct;
      if (idx === scheduleDaily.length - 1) cumDailyPlan = 100.0;

      s.planDaily = Math.round(pct * 100) / 100;
      s.planCum = Math.round(cumDailyPlan * 100) / 100;

      if (!hasRealProgress) {
        s.actDaily = null;
        s.actCum = null;
      } else {
        const sDate = parseYMD(s.date);
        const isBeforeCutoff = maxActualProgressDate && sDate && sDate <= maxActualProgressDate;
        if (s.actCost > 0 || isBeforeCutoff) {
          const actPct = (s.actCost / totalDailyPlanCost) * 100;
          cumDailyAct += actPct;
          s.actDaily = Math.round(actPct * 100) / 100;
          s.actCum = Math.round(Math.min(100, cumDailyAct) * 100) / 100;
        } else {
          s.actDaily = null;
          s.actCum = null;
        }
      }
    });

    // ==========================================
    // 2. HITUNG GRID MINGGUAN (M-1 s.d. M-w)
    // ==========================================
    const scheduleWeekly = [];
    const weekStartDates = [];

    for (let w = 1; w <= weeksCount; w++) {
      const wStart = addDays(startD, (w - 1) * 7);
      let wEnd = addDays(wStart, 6);
      if (wEnd > finishD && w === weeksCount) {
        wEnd = finishD;
      }
      weekStartDates.push({ start: wStart, end: addDays(wEnd, 1) });

      scheduleWeekly.push({
        week: w,
        startDate: formatYMD(wStart),
        endDate: formatYMD(wEnd),
        dateRangeFormatted: `${formatShortDateIndo(wStart)} - ${formatShortDateIndo(wEnd)}`,
        label: `M-${w}`,
        fullLabel: `Minggu ${w} (${formatShortDateNoYear(wStart)} - ${formatShortDateNoYear(wEnd)})`,
        planCost: 0,
        actCost: 0,
        activeTasks: [],
        planWeekly: 0,
        planCum: 0,
        actWeekly: null,
        actCum: null
      });
    }

    // Agregasi dari daily ke weekly agar 100% selaras dan konsisten
    scheduleDaily.forEach(d => {
      const dDate = parseYMD(d.date);
      if (!dDate) return;

      weekStartDates.forEach((wInfo, wIdx) => {
        if (dDate >= wInfo.start && dDate < wInfo.end) {
          scheduleWeekly[wIdx].planCost += d.planCost;
          if (d.actCost > 0) {
            scheduleWeekly[wIdx].actCost += d.actCost;
          }
          if (d.activeTasks && d.activeTasks.length > 0) {
            d.activeTasks.forEach(taskName => {
              if (!scheduleWeekly[wIdx].activeTasks.includes(taskName)) {
                scheduleWeekly[wIdx].activeTasks.push(taskName);
              }
            });
          }
        }
      });
    });

    const totalWeeklyPlanCost = scheduleWeekly.reduce((sum, s) => sum + s.planCost, 0) || 1;
    let cumWeeklyPlan = 0;
    let cumWeeklyAct = 0;

    scheduleWeekly.forEach((s, idx) => {
      const pct = (s.planCost / totalWeeklyPlanCost) * 100;
      cumWeeklyPlan += pct;
      if (idx === scheduleWeekly.length - 1) cumWeeklyPlan = 100.0;

      s.planWeekly = Math.round(pct * 100) / 100;
      s.planCum = Math.round(cumWeeklyPlan * 100) / 100;

      if (!hasRealProgress) {
        s.actWeekly = null;
        s.actCum = null;
      } else {
        const wStart = parseYMD(s.startDate);
        const isBeforeCutoff = maxActualProgressDate && wStart && wStart <= maxActualProgressDate;
        if (s.actCost > 0 || isBeforeCutoff) {
          const actPct = (s.actCost / totalWeeklyPlanCost) * 100;
          cumWeeklyAct += actPct;
          s.actWeekly = Math.round(actPct * 100) / 100;
          s.actCum = Math.round(Math.min(100, cumWeeklyAct) * 100) / 100;
        } else {
          s.actWeekly = null;
          s.actCum = null;
        }
      }
    });

    // Tempelkan metadata ke array
    scheduleDaily.isDaily = true;
    scheduleDaily.totalDays = totalDays;
    scheduleDaily.weeksCount = weeksCount;

    scheduleWeekly.isDaily = false;
    scheduleWeekly.totalDays = totalDays;
    scheduleWeekly.weeksCount = weeksCount;

    // Simpan ke state proyek dan simpan ke localStorage
    proj.scheduleDaily = scheduleDaily;
    proj.scheduleWeekly = scheduleWeekly;
    proj.totalDays = totalDays;
    proj.weeksCount = weeksCount;

    if (window.ProjectManager && window.ProjectManager.updateActiveProject) {
      window.ProjectManager.updateActiveProject(proj);
    }

    return {
      scheduleDaily,
      scheduleWeekly,
      totalDays,
      weeksCount
    };
  }

  // Render Diagram Kurva S berbasis SVG Murni (Mendukung Grid Harian & Grid Mingguan)
  function renderSvgChart(containerId, schedule = null, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let data = schedule;
    if (!data || !Array.isArray(data) || data.length === 0) {
      data = getScheduleData(options.viewMode || 'auto');
    }
    if (!data || data.length === 0) {
      container.innerHTML = "<div class='text-muted text-center p-4'>Tidak ada data jadwal proyek.</div>";
      return;
    }

    const isDaily = (options.isDaily !== undefined) 
      ? options.isDaily 
      : (data.isDaily !== undefined ? data.isDaily : (data.length > 0 && data[0].day !== undefined));

    const width = 920;
    const height = 340;
    const padL = 65;
    const padR = 45;
    const padT = 36;
    const padB = 66;

    const plotW = width - padL - padR;
    const plotH = height - padT - padB;
    const numPoints = data.length;

    function getX(index) {
      if (numPoints === 1) return padL + plotW / 2;
      return padL + (index / (numPoints - 1)) * plotW;
    }

    function getY(valPercent) {
      const clamped = Math.max(0, Math.min(100, valPercent));
      return padT + plotH - (clamped / 100) * plotH;
    }

    // Grid garis horizontal (0%, 20%, 40%, 60%, 80%, 100%)
    let gridLines = "";
    for (let p = 0; p <= 100; p += 20) {
      const y = getY(p);
      gridLines += `
        <line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3" />
        <text x="${padL - 12}" y="${y + 4}" font-size="11" font-family="system-ui, sans-serif" fill="#64748b" text-anchor="end">${p}%</text>
      `;
    }

    // Grid garis vertikal & Label Sumbu X
    let vertGrid = "";
    let axisLabels = "";

    if (numPoints === 1) {
      const cx = padL + plotW / 2;
      vertGrid += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#f1f5f9" stroke-width="1" />`;
      vertGrid += `<line x1="${cx}" y1="${padT}" x2="${cx}" y2="${padT + plotH}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2,2" />`;
      vertGrid += `<line x1="${padL + plotW}" y1="${padT}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="#f1f5f9" stroke-width="1" />`;
      
      const lbl = isDaily 
        ? `Hari 1 (${data[0].dateFormatted || data[0].date || 'Pelaksanaan'})`
        : `M-1 (${data[0].dateRangeFormatted || 'Minggu 1'})`;
      axisLabels += `<text x="${cx}" y="${padT + plotH + 22}" font-size="11" font-weight="700" font-family="system-ui, sans-serif" fill="#1e293b" text-anchor="middle">${lbl}</text>`;
    } else {
      data.forEach((d, idx) => {
        const x = getX(idx);
        vertGrid += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + plotH}" stroke="#f1f5f9" stroke-width="1" />`;

        // Atur kepadatan label sumbu X
        const showLabel = (numPoints <= 14) || 
                          (numPoints <= 31 && idx % 2 === 0) || 
                          (numPoints > 31 && (idx % Math.ceil(numPoints / 12) === 0 || idx === numPoints - 1));

        if (showLabel) {
          const mainTag = isDaily ? `H-${d.day}` : `M-${d.week}`;
          const subTag = isDaily ? (d.dateShort || '') : (d.startDate ? formatShortDateNoYear(parseYMD(d.startDate)) : '');
          
          axisLabels += `
            <g transform="translate(${x}, ${padT + plotH + 18})">
              <text x="0" y="0" font-size="10.5" font-weight="700" font-family="system-ui, sans-serif" fill="#1e293b" text-anchor="middle">${mainTag}</text>
              ${subTag ? `<text x="0" y="13" font-size="8.5" font-family="system-ui, sans-serif" fill="#64748b" text-anchor="middle">${subTag}</text>` : ''}
            </g>
          `;
        }
      });
    }

    // Diagram Batang Bobot Rencana (Harian / Mingguan)
    let planBars = "";
    const maxBarH = 75;
    const barWidth = numPoints === 1 
      ? 48 
      : Math.max(8, Math.min(38, (plotW / numPoints) * 0.55));

    data.forEach((d, idx) => {
      const x = getX(idx);
      const weightVal = isDaily ? (d.planDaily || 0) : (d.planWeekly || 0);
      const bH = Math.max(2, (weightVal / 100) * maxBarH);
      const bY = padT + plotH - bH;
      
      planBars += `
        <rect x="${x - barWidth/2}" y="${bY}" width="${barWidth}" height="${bH}" fill="#93c5fd" opacity="0.65" rx="3" />
      `;

      // Jika jumlah titik sedikit (misal 3 hari), tampilkan angka bobot harian langsung di atas batang
      if (numPoints <= 14 && weightVal > 0) {
        planBars += `
          <text x="${x}" y="${bY - 4}" font-size="9.5" font-weight="600" font-family="system-ui, sans-serif" fill="#1d4ed8" text-anchor="middle">${weightVal}%</text>
        `;
      }
    });

    // Jalur Garis Rencana Kumulatif (Biru Pekat #2563eb)
    let pathPlanD = "";
    let planDots = "";

    if (numPoints === 1) {
      pathPlanD = `M ${padL} ${getY(0)} L ${getX(0)} ${getY(data[0].planCum || 100)}`;
      planDots = `
        <circle cx="${padL}" cy="${getY(0)}" r="4.5" fill="#2563eb" stroke="#ffffff" stroke-width="2" />
        <circle cx="${getX(0)}" cy="${getY(data[0].planCum || 100)}" r="5.5" fill="#2563eb" stroke="#ffffff" stroke-width="2" />
        <text x="${getX(0)}" y="${getY(data[0].planCum || 100) - 10}" font-size="11" font-weight="bold" fill="#2563eb" text-anchor="middle">${data[0].planCum || 100}%</text>
      `;
    } else {
      data.forEach((d, idx) => {
        const x = getX(idx);
        const y = getY(d.planCum);
        if (idx === 0) {
          pathPlanD = `M ${x} ${y}`;
        } else {
          pathPlanD += ` L ${x} ${y}`;
        }

        // Titik bulat pada kurva target rencana
        planDots += `<circle cx="${x}" cy="${y}" r="${numPoints <= 14 ? 5 : 3.5}" fill="#2563eb" stroke="#ffffff" stroke-width="1.5" />`;
        
        if (numPoints <= 10) {
          planDots += `<text x="${x}" y="${y - 9}" font-size="10" font-weight="bold" fill="#1e40af" text-anchor="middle">${d.planCum}%</text>`;
        }
      });
    }

    // Jalur Garis Realisasi Aktual (Hijau Zamrud #059669)
    let pathActD = "";
    let actDots = "";
    let lastActIdx = -1;

    if (numPoints === 1) {
      if (data[0].actCum !== null && data[0].actCum !== undefined) {
        pathActD = `M ${padL} ${getY(0)} L ${getX(0)} ${getY(data[0].actCum)}`;
        actDots = `
          <circle cx="${getX(0)}" cy="${getY(data[0].actCum)}" r="6" fill="#059669" stroke="#ffffff" stroke-width="2" />
        `;
        lastActIdx = 0;
      }
    } else {
      data.forEach((d, idx) => {
        if (d.actCum !== null && d.actCum !== undefined) {
          const x = getX(idx);
          const y = getY(d.actCum);
          if (pathActD === "") {
            pathActD = `M ${x} ${y}`;
          } else {
            pathActD += ` L ${x} ${y}`;
          }
          actDots += `<circle cx="${x}" cy="${y}" r="${numPoints <= 14 ? 5.5 : 4}" fill="#059669" stroke="#ffffff" stroke-width="1.5" />`;
          if (numPoints <= 10) {
            actDots += `<text x="${x}" y="${y + 16}" font-size="10" font-weight="bold" fill="#047857" text-anchor="middle">${d.actCum}%</text>`;
          }
          lastActIdx = idx;
        }
      });
    }

    // Deviasi Badge
    let deviasiBadge = "";
    if (lastActIdx >= 0) {
      const lastD = data[lastActIdx];
      const lx = getX(lastActIdx);
      const ly = getY(lastD.actCum);
      const deviasi = Math.round((lastD.actCum - lastD.planCum) * 100) / 100;
      const devColor = deviasi >= 0 ? "#059669" : "#dc2626";
      const devText = deviasi >= 0 ? `+${deviasi}% (Ahead)` : `${deviasi}% (Behind)`;

      deviasiBadge = `
        <g transform="translate(${width - 255}, ${padT + 8})">
          <rect width="200" height="34" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
          <text x="12" y="21" font-size="11" font-family="system-ui, sans-serif" fill="#475569">Deviasi Progres:</text>
          <text x="110" y="21" font-size="12" font-family="system-ui, sans-serif" font-weight="bold" fill="${devColor}">${devText}</text>
        </g>
      `;
    } else {
      deviasiBadge = `
        <g transform="translate(${width - 255}, ${padT + 8})">
          <rect width="200" height="34" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
          <circle cx="16" cy="17" r="4" fill="#94a3b8" />
          <text x="28" y="21" font-size="10.5" font-family="system-ui, sans-serif" fill="#64748b">Menunggu Input Kalender</text>
        </g>
      `;
    }

    // Mode Tag Badge di Kiri Atas
    const modeBadgeText = isDaily 
      ? `GRID HARIAN (${numPoints} HARI KERJA)` 
      : `GRID MINGGUAN (${numPoints} MINGGU PELAKSANAAN)`;

    const modeBadge = `
      <g transform="translate(${padL}, ${padT - 18})">
        <rect width="220" height="22" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" />
        <circle cx="12" cy="11" r="3.5" fill="#2563eb" />
        <text x="22" y="15" font-size="9.5" font-weight="700" font-family="system-ui, sans-serif" fill="#1e293b">${modeBadgeText}</text>
      </g>
    `;

    const svgHtml = `
      <svg class="scurve-svg" viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block; font-family: system-ui, sans-serif;">
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="#ffffff" />
        
        <!-- Header Mode Badge -->
        ${modeBadge}

        <!-- Grid & Axes -->
        ${gridLines}
        ${vertGrid}
        ${axisLabels}
        <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#94a3b8" stroke-width="1.5" />
        <line x1="${padL}" y1="${padT + plotH}" x2="${width - padR}" y2="${padT + plotH}" stroke="#94a3b8" stroke-width="1.5" />

        <!-- Batang Bobot Rencana -->
        ${planBars}

        <!-- Garis Kurva Rencana -->
        <path d="${pathPlanD}" fill="none" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
        ${planDots}

        <!-- Garis Kurva Realisasi -->
        ${pathActD ? `<path d="${pathActD}" fill="none" stroke="#059669" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />` : ''}
        ${actDots}

        <!-- Deviasi Badge -->
        ${deviasiBadge}

        <!-- Legend / Keterangan -->
        <g transform="translate(${padL + 10}, ${height - 16})">
          <line x1="0" y1="0" x2="22" y2="0" stroke="#2563eb" stroke-width="3" />
          <circle cx="11" cy="0" r="3.5" fill="#2563eb" />
          <text x="28" y="4" font-size="10.5" fill="#1e293b">Target Rencana Kumulatif (${isDaily ? 'Harian' : 'Mingguan'})</text>

          <line x1="280" y1="0" x2="302" y2="0" stroke="#059669" stroke-width="3" />
          <circle cx="291" cy="0" r="3.5" fill="#059669" />
          <text x="308" y="4" font-size="10.5" fill="#1e293b">Realisasi Fisik Aktual</text>

          <rect x="470" y="-7" width="14" height="13" fill="#93c5fd" opacity="0.65" rx="2" />
          <text x="492" y="4" font-size="10.5" fill="#1e293b">Bobot Rencana ${isDaily ? 'Harian' : 'Mingguan'} (%)</text>
        </g>
      </svg>
    `;

    container.innerHTML = svgHtml;
  }

  // Update nilai progres aktual mingguan/harian
  function updateActualProgress(index, actualValue, isDaily = false) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return;

    if (isDaily && proj.scheduleDaily) {
      const item = proj.scheduleDaily.find(s => s.day === Number(index));
      if (item) {
        item.actDaily = actualValue !== null ? Number(actualValue) : null;
        let cum = 0;
        proj.scheduleDaily.forEach(s => {
          if (s.actDaily !== null) {
            cum += s.actDaily;
            s.actCum = Math.round(cum * 100) / 100;
          } else {
            s.actCum = null;
          }
        });
        window.ProjectManager.updateActiveProject(proj);
      }
    } else if (proj.scheduleWeekly) {
      const item = proj.scheduleWeekly.find(s => s.week === Number(index));
      if (item) {
        item.actWeekly = actualValue !== null ? Number(actualValue) : null;
        let cum = 0;
        proj.scheduleWeekly.forEach(s => {
          if (s.actWeekly !== null) {
            cum += s.actWeekly;
            s.actCum = Math.round(cum * 100) / 100;
          } else {
            s.actCum = null;
          }
        });
        window.ProjectManager.updateActiveProject(proj);
      }
    }
  }

  return {
    getScheduleData,
    calculateScheduleFromCalendar,
    renderSvgChart,
    updateActualProgress
  };
})();

