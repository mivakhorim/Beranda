/**
 * Project Calendar Module (Kalender Proyek 1 Tahun Penuh / 12 Bulan)
 * Dimulai dari tanggal 1 pada bulan awal rencana proyek sampai 1 tahun ke depan
 * Memuat: Grid Kalender Bulanan Interaktif & Tabel Daftar Pekerjaan
 * (Kode, Tanggal Awal, Selesai, Jumlah Hari, Status, dan Catatan)
 */

window.ProjectCalendar = (function() {
  let currentMonthOffset = 0; // 0 s.d. 11 (Bulan ke-1 s.d. Bulan ke-12)

  
  // Helper manipulasi tanggal lokal presisi tanpa timezone offset bug
  function addDays(date, days) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + days);
    return d;
  }

  function formatYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function parseYMD(str) {
    if (!str) return new Date();
    const parts = String(str).split('T')[0].split('-');
    if (parts.length < 3) return new Date();
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function getProjectStartDate() {
    const proj = window.ProjectManager.getActiveProject();
    if (proj && proj.startDate) {
      return new Date(proj.startDate);
    }
    return new Date();
  }

  // Tanggal 1 pada bulan awal proyek
  function getCalendarStartMonth() {
    const d = getProjectStartDate();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  // 12 Bulan Kalender Proyek
  function getTwelveMonths() {
    const start = getCalendarStartMonth();
    const months = [];
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    for (let i = 0; i < 12; i++) {
      const mDate = new Date(start.getFullYear(), start.getMonth() + i, 1);
      months.push({
        index: i,
        year: mDate.getFullYear(),
        month: mDate.getMonth(),
        label: `${monthNames[mDate.getMonth()]} ${mDate.getFullYear()}`,
        dateObj: mDate
      });
    }
    return months;
  }

  function getTasks() {
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;
    if (!proj) return [];
    if (!proj.calendarTasks || proj.calendarTasks.length === 0) {
      if (proj.divisions && proj.divisions.some(d => d.items && d.items.length > 0)) {
        syncTasksFromRabDetail();
      } else {
        proj.calendarTasks = [];
      }
    }
    return proj.calendarTasks || [];
  }

  function addTask(code, name, startDate, finishDate, status = "Belum Mulai", notes = "") {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return null;
    if (!proj.calendarTasks) proj.calendarTasks = [];

    const dStart = new Date(startDate);
    const dFinish = new Date(finishDate);
    const diffTime = Math.abs(dFinish - dStart);
    const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newTask = {
      code: code || `TSK-${proj.calendarTasks.length + 1}`,
      name: name,
      startDate: startDate,
      finishDate: finishDate,
      duration: duration || 1,
      status: status,
      notes: notes
    };
    proj.calendarTasks.push(newTask);
    window.ProjectManager.updateActiveProject(proj);
    if (window.SCurveDiagram) {
      window.SCurveDiagram.calculateScheduleFromCalendar(proj);
    }

    return newTask;
  }

  function updateProjectDatesFromTasks(proj) {
    if (!proj || !proj.calendarTasks || proj.calendarTasks.length === 0) return;
    let minTaskStart = null;
    let maxTaskFinish = null;
    proj.calendarTasks.forEach(t => {
      const s = parseYMD(t.startDate || t.stdStartDate);
      const f = parseYMD(t.finishDate || t.stdFinishDate);
      if (s && (!minTaskStart || s < minTaskStart)) minTaskStart = s;
      if (f && (!maxTaskFinish || f > maxTaskFinish)) maxTaskFinish = f;
    });

    if (minTaskStart && maxTaskFinish) {
      const totalSpanDays = Math.max(1, Math.ceil((maxTaskFinish.getTime() - minTaskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      proj.startDate = formatYMD(minTaskStart);
      proj.finishDate = formatYMD(maxTaskFinish);
      proj.durationDays = totalSpanDays;
    }
  }

  function updateTask(code, updatedFields) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !proj.calendarTasks) return false;

    const task = proj.calendarTasks.find(t => t.code === code);
    if (task) {
      if (task.isLocked && task.status === "Selesai" && updatedFields.status === "Selesai" && updatedFields.isLocked !== false) {
        console.warn(`Pekerjaan ${code} telah Selesai dan terkunci dari modifikasi jadwal.`);
      }

      // Sinkronisasi status dan progres fisik aktual secara otomatis
      let finalStatus = updatedFields.status || task.status;
      let finalProgress = task.actualProgress;

      if (finalStatus === "Selesai") {
        finalStatus = "Selesai";
        finalProgress = 100;
        task.isLocked = true;
      } else if (finalStatus === "Sedang Berjalan") {
        task.isLocked = false;
        if (updatedFields.actualProgress !== undefined && updatedFields.actualProgress !== null && !isNaN(Number(updatedFields.actualProgress))) {
          finalProgress = Math.max(1, Math.min(99, Number(updatedFields.actualProgress)));
        } else if (!finalProgress || finalProgress <= 0 || finalProgress >= 100) {
          finalProgress = 50;
        }
      } else if (finalStatus === "Belum Mulai") {
        finalStatus = "Belum Mulai";
        finalProgress = 0;
        task.isLocked = false;
      } else if (finalStatus === "Terkendala") {
        task.isLocked = false;
        if (updatedFields.actualProgress !== undefined && updatedFields.actualProgress !== null && !isNaN(Number(updatedFields.actualProgress))) {
          finalProgress = Math.max(1, Math.min(99, Number(updatedFields.actualProgress)));
        } else if (!finalProgress || finalProgress <= 0) {
          finalProgress = 25;
        }
      }

      Object.assign(task, updatedFields);
      task.status = finalStatus;
      task.actualProgress = finalProgress;

      if (task.startDate && task.finishDate) {
        task.manualStartDate = task.startDate;
        task.manualFinishDate = task.finishDate;
        const dStart = parseYMD(task.startDate);
        const dFinish = parseYMD(task.finishDate);
        if (dFinish < dStart) {
          task.finishDate = task.startDate;
          task.manualFinishDate = task.startDate;
        }
        const diffDays = Math.max(0, Math.round((parseYMD(task.finishDate) - parseYMD(task.startDate)) / (1000 * 60 * 60 * 24)));
        task.duration = diffDays === 0 ? (task.totalOH && task.totalOH < 1 ? Number(task.totalOH.toFixed(2)) : 1) : (diffDays + 1);
        task.manualDuration = task.duration;
      }

      updateProjectDatesFromTasks(proj);
      window.ProjectManager.updateActiveProject(proj);

      if (window.SCurveDiagram) {
        window.SCurveDiagram.calculateScheduleFromCalendar(proj);
      }

      return true;
    }
    return false;
  }

    // Sinkronisasi jadwal otomatis dari Rincian Detail RAB
  // Menghasilkan 2 baris tanggal: Standar Rencana & Penanggalan Lapangan Manual
  // Data yang berstatus 'Selesai' DIKUNCI (tidak dapat diubah atau di-refresh)
  // Menghasilkan detail jadwal per item pekerjaan / AHSP fisik yang digunakan di proyek
  // forceReset: jika true, seluruh data penanggalan & durasi dihitung ulang murni dari data terbaru RAB
  function syncTasksFromRabDetail(forceReset = false) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !proj.divisions || proj.divisions.length === 0) return { synced: 0, locked: 0, total: 0 };

    const pStart = parseYMD(proj.startDate || "2026-04-01");
    const oldTasks = proj.calendarTasks || [];
    let syncedCount = 0;
    let lockedCount = 0;
    const newTasks = [];

    // Siapkan map AHSP untuk ekstraksi koefisien tenaga kerja
    const ahspMap = {};
    if (window.MASTER_AHSP) {
      window.MASTER_AHSP.forEach(a => {
        if (a.id) ahspMap[a.id] = a;
        if (a.code) ahspMap[a.code] = a;
      });
    }

    let currentWorkDay = new Date(pStart);
    let currentDayAccumulatedOH = 0.0;

    proj.divisions.forEach((div, dIdx) => {
      const items = div.items || [];
      // Jika berganti divisi dan hari sebelumnya telah ada akumulasi pekerjaan,
      // lanjutkan fase divisi berikutnya pada hari berikutnya untuk memisahkan tahapan fisik
      if (dIdx > 0 && currentDayAccumulatedOH > 0) {
        currentWorkDay = addDays(currentWorkDay, 1);
        currentDayAccumulatedOH = 0.0;
      }

      items.forEach((item, iIdx) => {
        const itemCode = item.code || `${div.code}.${iIdx + 1}`;
        const taskCode = itemCode;
        const taskName = item.name;

        // Ambil AHSP dan hitung total kebutuhan OH = unit_labor_oh * volume
        let ahsp = null;
        if (window.AhspEngine && window.AhspEngine.getAhspById) {
          ahsp = window.AhspEngine.getAhspById(item.ahspId || item.code);
        }
        if (!ahsp) {
          ahsp = ahspMap[item.ahspId] || ahspMap[item.code] || ahspMap[item.id];
        }

        let totalItemOH = 0;
        if (window.ResourceUsage && window.ResourceUsage.getItemLaborDetails) {
          const laborDetails = window.ResourceUsage.getItemLaborDetails(
            item.volume,
            ahsp,
            item.total || ((Number(item.volume) || 0) * (Number(item.price) || 0))
          );
          totalItemOH = laborDetails.totalLaborQty || 0;
        } else if (ahsp && ahsp.components) {
          ahsp.components.forEach(c => {
            const sec = (c.section || "").toUpperCase();
            const cName = (c.name || "").toLowerCase();
            const isLabor = sec.includes("TENAGA") || cName.includes("pekerja") || cName.includes("tukang") || cName.includes("mandor");
            if (isLabor) {
              totalItemOH += (Number(c.koef) || 0) * (Number(item.volume) || 0);
            }
          });
        }

        const rawOH = Math.round(totalItemOH * 100) / 100;
        let taskStart = new Date(currentWorkDay);
        let taskFinish = new Date(currentWorkDay);
        let calculatedDuration = 1;
        let crewSize = 1;

        if (rawOH <= 0) {
          // Pekerjaan non-tenaga / pengadaan bahan / sewa alat (0 OH):
          // Dikerjakan pada hari kerja berjalan tanpa membebani kapasitas OH
          calculatedDuration = 1;
          crewSize = 1;
          taskStart = new Date(currentWorkDay);
          taskFinish = new Date(currentWorkDay);
        } else if (rawOH < 1.0) {
          // Pekerjaan sepele / ringan (< 1.0 OH):
          // Jika total akumulasi pada hari kerja ini belum melampaui 1.0 OH,
          // WAJIB DIKERJAKAN PADA HARI YANG SAMA (startDate === finishDate)
          if (currentDayAccumulatedOH + rawOH <= 1.05) {
            taskStart = new Date(currentWorkDay);
            taskFinish = new Date(currentWorkDay);
            calculatedDuration = rawOH; // Nilai durasi riil 0.x OH
            crewSize = 1;
            currentDayAccumulatedOH += rawOH;
            if (currentDayAccumulatedOH >= 0.95) {
              currentWorkDay = addDays(currentWorkDay, 1);
              currentDayAccumulatedOH = 0.0;
            }
          } else {
            // Jika kapasitas hari ini sudah terisi dan tidak muat, geser ke hari berikutnya
            if (currentDayAccumulatedOH > 0) {
              currentWorkDay = addDays(currentWorkDay, 1);
              currentDayAccumulatedOH = 0.0;
            }
            taskStart = new Date(currentWorkDay);
            taskFinish = new Date(currentWorkDay);
            calculatedDuration = rawOH;
            crewSize = 1;
            currentDayAccumulatedOH = rawOH;
            if (currentDayAccumulatedOH >= 0.95) {
              currentWorkDay = addDays(currentWorkDay, 1);
              currentDayAccumulatedOH = 0.0;
            }
          }
        } else {
          // Pekerjaan besar / mandiri (>= 1.0 OH):
          // Mulai pada hari bersih baru jika hari ini sudah terisi sebagian
          if (currentDayAccumulatedOH > 0) {
            currentWorkDay = addDays(currentWorkDay, 1);
            currentDayAccumulatedOH = 0.0;
          }
          if (rawOH <= 8) crewSize = 2;
          else if (rawOH <= 25) crewSize = 3;
          else if (rawOH <= 60) crewSize = 4;
          else crewSize = Math.min(8, Math.max(4, Math.ceil(rawOH / 14)));

          const daysNeeded = Math.max(1, Math.ceil(rawOH / crewSize));
          taskStart = new Date(currentWorkDay);
          taskFinish = addDays(currentWorkDay, daysNeeded - 1);
          calculatedDuration = daysNeeded;

          // Jadwal pekerjaan berikutnya dimulai setelah pekerjaan ini tuntas
          currentWorkDay = addDays(taskFinish, 1);
          currentDayAccumulatedOH = 0.0;
        }

        const stdStartStr = formatYMD(taskStart);
        const stdFinishStr = formatYMD(taskFinish);

        // Cek data lama jika ada
        const existing = oldTasks.find(t => t.code === taskCode || t.code === `TSK-${taskCode}` || t.name === taskName);

        let manualStart = stdStartStr;
        let manualFinish = stdFinishStr;
        let manualDur = calculatedDuration;
        let isLocked = false;
        let status = "Belum Mulai";
        let actualProgress = 0;

        if (existing && !forceReset) {
          status = existing.status || "Belum Mulai";
          isLocked = existing.isLocked || false;
          if (status === "Selesai") {
            actualProgress = 100;
            isLocked = true;
          } else if (status === "Sedang Berjalan") {
            actualProgress = (existing.actualProgress !== undefined && existing.actualProgress !== null && Number(existing.actualProgress) > 0)
              ? Number(existing.actualProgress)
              : (existing.progress || 50);
          } else {
            actualProgress = 0;
          }
          manualStart = existing.manualStartDate || existing.startDate || stdStartStr;
          manualFinish = existing.manualFinishDate || existing.finishDate || stdFinishStr;
          manualDur = existing.manualDuration !== undefined ? existing.manualDuration : calculatedDuration;
          if (isLocked) lockedCount++;
        } else {
          // Mode forceReset atau item baru: hitung ulang murni dari data terbaru RAB
          status = "Belum Mulai";
          actualProgress = 0;
          isLocked = false;
          manualStart = stdStartStr;
          manualFinish = stdFinishStr;
          manualDur = calculatedDuration;
        }

        const itemCost = (Number(item.volume) || 0) * (Number(item.price) || 0);
        const laborNote = rawOH > 0
          ? (rawOH < 1 ? `Beban: ${rawOH.toFixed(2)} OH (Pekerjaan Sepele)` : `Beban: ${rawOH.toFixed(1)} OH (${crewSize} Pekerja/Hari)`)
          : `Pengadaan/Alat`;

        newTasks.push({
          code: taskCode,
          ahspCode: item.code || taskCode,
          name: taskName,
          divisionCode: div.code,
          divisionName: div.name,
          volume: item.volume,
          unit: item.unit,
          price: item.price,
          cost: itemCost,
          totalOH: rawOH,
          crewSize: crewSize,
          stdStartDate: stdStartStr,
          stdFinishDate: stdFinishStr,
          stdDuration: calculatedDuration,
          manualStartDate: manualStart,
          manualFinishDate: manualFinish,
          manualDuration: manualDur,
          startDate: manualStart,
          finishDate: manualFinish,
          duration: manualDur,
          status: status,
          actualProgress: actualProgress,
          isLocked: isLocked,
          notes: `Vol: ${item.volume} ${item.unit} • ${laborNote}`
        });

        syncedCount++;
      });
    });

    // Sinkronisasi total durasi dan tanggal akhir proyek secara dinamis dari rentang jadwal tugas
    let minTaskStart = null;
    let maxTaskFinish = null;
    newTasks.forEach(t => {
      const s = parseYMD(t.startDate || t.stdStartDate);
      const f = parseYMD(t.finishDate || t.stdFinishDate);
      if (s && (!minTaskStart || s < minTaskStart)) minTaskStart = s;
      if (f && (!maxTaskFinish || f > maxTaskFinish)) maxTaskFinish = f;
    });

    if (minTaskStart && maxTaskFinish) {
      const totalSpanDays = Math.max(1, Math.ceil((maxTaskFinish.getTime() - minTaskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      proj.startDate = formatYMD(minTaskStart);
      proj.finishDate = formatYMD(maxTaskFinish);
      proj.durationDays = totalSpanDays;
    }

    // Perbarui daftar pekerjaan kalender
    proj.calendarTasks = newTasks;
    window.ProjectManager.updateActiveProject(proj);

    if (window.SCurveDiagram) {
      window.SCurveDiagram.calculateScheduleFromCalendar(proj);
    }

    return { synced: syncedCount, locked: lockedCount, total: newTasks.length };
  }

  function deleteTask(code) {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj || !proj.calendarTasks) return false;

    const task = proj.calendarTasks.find(t => t.code === code);
    if (task && task.status === "Selesai") {
      console.warn(`Pekerjaan ${code} telah Selesai dan terkunci (tidak dapat dihapus).`);
      return false;
    }

    const prevLen = proj.calendarTasks.length;
    proj.calendarTasks = proj.calendarTasks.filter(t => t.code !== code);
    if (proj.calendarTasks.length < prevLen) {
      window.ProjectManager.updateActiveProject(proj);
      if (window.SCurveDiagram) {
        window.SCurveDiagram.calculateScheduleFromCalendar(proj);
      }
      return true;
    }
    return false;
  }

  // Hapus SEMUA jadwal tugas di Kalender Proyek (Mengosongkan kalender untuk re-generate bersih)
  function clearAllTasks() {
    const proj = window.ProjectManager.getActiveProject();
    if (!proj) return { cleared: false, count: 0 };

    const count = (proj.calendarTasks || []).length;
    proj.calendarTasks = [];
    window.ProjectManager.updateActiveProject(proj);

    if (window.SCurveDiagram && window.SCurveDiagram.calculateScheduleFromCalendar) {
      window.SCurveDiagram.calculateScheduleFromCalendar(proj);
    }

    return { cleared: true, count };
  }

  // Dapatkan pekerjaan yang aktif pada tanggal spesifik YYYY-MM-DD
  function getTasksOnDate(dateStr) {
    const tasks = getTasks();
    const target = new Date(dateStr).getTime();
    return tasks.filter(t => {
      const s = new Date(t.startDate).getTime();
      const f = new Date(t.finishDate).getTime();
      return target >= s && target <= f;
    });
  }

  let currentViewMode = "year"; // Default: 1 Tahun Penuh (12 Bulan)

  // Render Kalender Full 1 Tahun (12 Bulan Sekaligus)
  function renderFullYearCalendarGrid() {
    const months = getTwelveMonths();
    const allTasks = getTasks();
    const proj = window.ProjectManager ? window.ProjectManager.getActiveProject() : null;

    // Pre-map tanggal ke pekerjaan untuk performa tinggi tanpa lag
    const dateTaskMap = {};
    const monthTaskCounts = new Array(12).fill(0);
    const monthTaskSets = Array.from({ length: 12 }, () => new Set());

    allTasks.forEach(t => {
      if (!t.startDate || !t.finishDate) return;
      let cur = parseYMD(t.startDate);
      const end = parseYMD(t.finishDate);
      // Batasi loop pengaman 400 hari
      let safety = 0;
      while (cur <= end && safety < 400) {
        safety++;
        const dStr = formatYMD(cur);
        if (!dateTaskMap[dStr]) dateTaskMap[dStr] = [];
        dateTaskMap[dStr].push(t);

        // Catat ke bulan kalender
        months.forEach((mObj, mIdx) => {
          if (cur.getFullYear() === mObj.year && cur.getMonth() === mObj.month) {
            monthTaskSets[mIdx].add(t.code);
          }
        });

        cur = addDays(cur, 1);
      }
    });

    let page1Cards = "";
    let page2Cards = "";
    let page3Cards = "";
    let page4Cards = "";

    months.forEach((mObj, mIdx) => {
      const year = mObj.year;
      const month = mObj.month;
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const totalDays = lastDay.getDate();

      // Sesuaikan agar Senin = 0, Minggu = 6 (Standar Indonesia)
      let startDayIdx = firstDay.getDay() - 1;
      if (startDayIdx === -1) startDayIdx = 6;

      let cellsHtml = "";

      // Sel kosong sebelum tanggal 1
      for (let i = 0; i < startDayIdx; i++) {
        cellsHtml += `<div class="year-cal-cell year-cal-empty"></div>`;
      }

      let activeDaysInMonth = 0;

      // Sel tanggal 1 sampai totalDays
      for (let day = 1; day <= totalDays; day++) {
        const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const activeTasks = dateTaskMap[dayStr] || [];
        const isSunday = (startDayIdx + day - 1) % 7 === 6;

        let dotClass = "";
        let tooltipText = "";

        if (activeTasks.length > 0) {
          activeDaysInMonth++;
          // Cek status dominan
          const hasBlocked = activeTasks.some(t => t.status === "Terkendala");
          const hasRunning = activeTasks.some(t => t.status === "Sedang Berjalan");
          const allDone = activeTasks.every(t => t.status === "Selesai");

          if (hasBlocked) dotClass = "dot-blocked";
          else if (hasRunning) dotClass = "dot-progress";
          else if (allDone) dotClass = "dot-done";
          else dotClass = "dot-pending";

          tooltipText = `${dayStr}: ${activeTasks.length} pekerjaan aktif (${activeTasks.map(t => t.code).join(', ')})`;
        }

        cellsHtml += `
          <div class="year-cal-cell ${isSunday ? 'year-cal-weekend' : ''} ${activeTasks.length > 0 ? 'year-cal-active' : ''}" 
               title="${tooltipText || dayStr}" 
               data-date="${dayStr}"
               onclick="App.handleCalendarDateClick('${dayStr}')">
            <span class="year-cal-day-num">${day}</span>
            ${activeTasks.length > 0 ? `<span class="year-cal-indicator ${dotClass}"></span>` : ''}
          </div>
        `;
      }

      const totalTasksInMonth = monthTaskSets[mIdx].size;

      const singleCardHtml = `
        <div class="year-month-card">
          <div class="year-month-header">
            <div>
              <div class="year-month-title">📅 ${mObj.label}</div>
              <div class="year-month-sub">Bulan ke-${mIdx + 1} dari 12</div>
            </div>
            <div class="year-month-badge ${totalTasksInMonth > 0 ? 'badge-active' : 'badge-idle'}">
              ${totalTasksInMonth > 0 ? `${totalTasksInMonth} Pekerjaan` : 'Libur/Siap'}
            </div>
          </div>
          <div class="year-cal-day-headers">
            <div>Sen</div>
            <div>Sel</div>
            <div>Rab</div>
            <div>Kam</div>
            <div>Jum</div>
            <div>Sab</div>
            <div style="color: #ef4444; font-weight: 700;">Min</div>
          </div>
          <div class="year-cal-grid">
            ${cellsHtml}
          </div>
          <div class="year-month-footer">
            <span>${activeDaysInMonth} hari aktif kerja</span>
            <button type="button" class="btn-focus-month" onclick="App.switchToMonthView(${mIdx})" title="Lihat detail bulan ini">
              🔍 Rincian
            </button>
          </div>
        </div>
      `;

      if (mIdx < 2) {
        page1Cards += singleCardHtml;
      } else if (mIdx < 6) {
        page2Cards += singleCardHtml;
      } else if (mIdx < 10) {
        page3Cards += singleCardHtml;
      } else {
        page4Cards += singleCardHtml;
      }
    });

    const monthCardsHtml = `
      <div class="cal-print-page cal-print-page-1">
        ${page1Cards}
      </div>
      <div class="cal-print-page cal-print-page-2">
        ${page2Cards}
      </div>
      <div class="cal-print-page cal-print-page-3">
        ${page3Cards}
      </div>
      <div class="cal-print-page cal-print-page-4">
        ${page4Cards}
      </div>
    `;

    // Ringkasan Statistik Kalender 1 Tahun
    const completedTasksCount = allTasks.filter(t => t.status === "Selesai").length;
    const inProgressTasksCount = allTasks.filter(t => t.status === "Sedang Berjalan").length;
    const pendingTasksCount = allTasks.filter(t => t.status === "Belum Mulai").length;

    const fullHtml = `
      <div class="calendar-master-container">
        <!-- Toolbar Kontrol Tampilan Kalender -->
        <div class="calendar-top-controls">
          <div class="cal-control-left">
            <div class="btn-group" role="group">
              <button type="button" class="btn btn-sm ${currentViewMode === 'year' ? 'btn-primary' : 'btn-outline'}" onclick="App.setCalendarViewMode('year')">
                📅 Tampilan Kalender Lengkap (12 Bulan)
              </button>
              <button type="button" class="btn btn-sm ${currentViewMode === 'month' ? 'btn-primary' : 'btn-outline'}" onclick="App.setCalendarViewMode('month')">
                🔍 Tampilan Fokus 1 Bulan
              </button>
            </div>
          </div>
          <div class="cal-control-right">
            <span class="badge badge-light" style="font-size: 11.5px; padding: 5px 10px; border: 1px solid #cbd5e1;">
              Total: <strong>${allTasks.length} Item Jadwal</strong> &bull; Selesai: <strong style="color: #15803d;">${completedTasksCount}</strong> &bull; Aktif: <strong style="color: #1d4ed8;">${inProgressTasksCount}</strong> &bull; Rencana: <strong style="color: #64748b;">${pendingTasksCount}</strong>
            </span>
          </div>
        </div>

        <!-- Matrix Grid 12 Bulan Kalender Proyek -->
        <div class="year-calendar-grid">
          ${monthCardsHtml}
        </div>

        <!-- Legend / Keterangan Status Warna -->
        <div class="calendar-legend-bar">
          <div class="legend-item"><span class="year-cal-indicator dot-pending"></span> Rencana Belum Mulai</div>
          <div class="legend-item"><span class="year-cal-indicator dot-progress"></span> Sedang Dikerjakan (Aktif)</div>
          <div class="legend-item"><span class="year-cal-indicator dot-done"></span> Selesai (Terkunci Aman)</div>
          <div class="legend-item"><span class="year-cal-indicator dot-blocked"></span> Terkendala Lapangan</div>
          <div class="legend-item" style="color: #ef4444; font-weight: 600;">⚠️ Hari Minggu: Libur Pekerja</div>
        </div>
      </div>
    `;

    return {
      viewMode: "year",
      totalMonths: 12,
      months: months,
      html: fullHtml
    };
  }

  // Render Grid Kalender untuk bulan terpilih (0 s.d. 11)
  function renderMonthlyGrid(monthOffset = null) {
    if (monthOffset !== null) {
      currentMonthOffset = Math.max(0, Math.min(11, monthOffset));
    }
    const months = getTwelveMonths();
    const activeMonth = months[currentMonthOffset];
    const year = activeMonth.year;
    const month = activeMonth.month;

    // Hari pertama dalam bulan (0 = Minggu, 1 = Senin, ...)
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Sesuaikan agar Senin = 0, Minggu = 6 (Standar Indonesia)
    let startDayIdx = firstDay.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6;

    let cellsHtml = "";

    // Sel kosong sebelum tanggal 1
    for (let i = 0; i < startDayIdx; i++) {
      cellsHtml += `<div class="cal-cell cal-empty"></div>`;
    }

    // Sel tanggal 1 sampai totalDays
    for (let day = 1; day <= totalDays; day++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const activeTasks = getTasksOnDate(dayStr);
      const isSunday = (startDayIdx + day - 1) % 7 === 6;

      let taskBadges = "";
      activeTasks.slice(0, 3).forEach(t => {
        let stClass = "st-pending";
        if (t.status === "Selesai") stClass = "st-done";
        else if (t.status === "Sedang Berjalan") stClass = "st-progress";
        else if (t.status === "Terkendala") stClass = "st-blocked";

        taskBadges += `
          <div class="cal-task-pill ${stClass}" title="${t.code}: ${t.name} (${t.status})">
            ${t.code}
          </div>
        `;
      });
      if (activeTasks.length > 3) {
        taskBadges += `<div class="cal-more">+${activeTasks.length - 3} lainnya</div>`;
      }

      cellsHtml += `
        <div class="cal-cell ${isSunday ? 'cal-weekend' : ''} ${activeTasks.length > 0 ? 'has-tasks' : ''}" data-date="${dayStr}">
          <div class="cal-day-num">${day}</div>
          <div class="cal-task-container">${taskBadges}</div>
        </div>
      `;
    }

    const fullHtml = `
      <div class="calendar-master-container">
        <div class="calendar-top-controls mb-3">
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-outline" onclick="App.setCalendarViewMode('year')">
              📅 Tampilan Kalender Lengkap (12 Bulan)
            </button>
            <button type="button" class="btn btn-sm btn-primary" onclick="App.setCalendarViewMode('month')">
              🔍 Tampilan Fokus 1 Bulan
            </button>
          </div>
        </div>

        <div class="calendar-wrapper">
          <div class="calendar-header-bar">
            <button class="btn btn-sm btn-secondary" onclick="App.prevCalendarMonth()">◀ Bulan Sebelumnya</button>
            <div style="font-weight: 700; font-size: 14px; color: var(--color-primary-dark, #1e3a8a);">
              📅 ${activeMonth.label} <span style="font-size: 12px; font-weight: normal; color: var(--color-text-secondary);">(Bulan ke-${currentMonthOffset + 1} dari 12)</span>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="App.nextCalendarMonth()">Bulan Berikutnya ▶</button>
          </div>
          <div class="calendar-day-headers">
            <div>SENIN</div>
            <div>SELASA</div>
            <div>RABU</div>
            <div>KAMIS</div>
            <div>JUMAT</div>
            <div>SABTU</div>
            <div style="color: #ef4444;">MINGGU</div>
          </div>
          <div class="calendar-grid-cells">
            ${cellsHtml}
          </div>
        </div>
        <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: center; font-size: 12px; color: var(--color-text-secondary);">
          <span style="display: flex; align-items: center; gap: 6px;"><span class="cal-task-pill st-pending" style="padding: 2px 6px;">Belum Mulai</span> Rencana</span>
          <span style="display: flex; align-items: center; gap: 6px;"><span class="cal-task-pill st-progress" style="padding: 2px 6px;">Sedang Berjalan</span> Fisik Aktif</span>
          <span style="display: flex; align-items: center; gap: 6px;"><span class="cal-task-pill st-done" style="padding: 2px 6px;">Selesai</span> Terkunci/Final</span>
          <span style="display: flex; align-items: center; gap: 6px;"><span class="cal-task-pill st-blocked" style="padding: 2px 6px;">Terkendala</span> Perlu Evaluasi</span>
          <span style="display: flex; align-items: center; gap: 6px; color: #ef4444; font-weight: 600;">⚠️ Hari Minggu: Libur Lapangan</span>
        </div>
      </div>
    `;

    return {
      viewMode: "month",
      monthLabel: activeMonth.label,
      monthIndex: currentMonthOffset,
      totalMonths: 12,
      cellsHtml: cellsHtml,
      html: fullHtml
    };
  }

  // Render Grid Kalender Utama (Menyesuaikan View Mode)
  function renderCalendarGrid(monthOffset = null, viewMode = null) {
    if (viewMode) currentViewMode = viewMode;
    if (monthOffset !== null) currentMonthOffset = Math.max(0, Math.min(11, monthOffset));

    if (currentViewMode === "month") {
      return renderMonthlyGrid(currentMonthOffset);
    }
    return renderFullYearCalendarGrid();
  }

  function nextMonth() {
    if (currentMonthOffset < 11) {
      currentMonthOffset++;
    }
    return renderCalendarGrid(currentMonthOffset, "month");
  }

  function prevMonth() {
    if (currentMonthOffset > 0) {
      currentMonthOffset--;
    }
    return renderCalendarGrid(currentMonthOffset, "month");
  }

  function setMonthOffset(offset) {
    currentMonthOffset = Math.max(0, Math.min(11, offset));
    return renderCalendarGrid(currentMonthOffset, "month");
  }

  function setViewMode(mode) {
    currentViewMode = (mode === "month") ? "month" : "year";
    return renderCalendarGrid();
  }

  function getViewMode() {
    return currentViewMode;
  }

  return {
    getTwelveMonths,
    syncTasksFromRabDetail,
    clearAllTasks,
    getTasks,
    addTask,
    updateTask,
    deleteTask,
    getTasksOnDate,
    renderCalendarGrid,
    renderFullYearCalendarGrid,
    renderMonthlyGrid,
    nextMonth,
    prevMonth,
    setMonthOffset,
    setViewMode,
    getViewMode,
    getCurrentMonthOffset: () => currentMonthOffset
  };
})();
