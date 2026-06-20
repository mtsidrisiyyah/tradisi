// ============================================
// TRADISI — Absensi Siswa Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, getTodayStr, showConfirmDialog } = ctx;

    // Load data
    const students = await dbService.getData('siswa') || [];
    const attendances = await dbService.getData('absensi') || [];
    const homerooms = await dbService.getData('homerooms') || [];
    const classrooms = await dbService.getData('classrooms') || [];
    const settings = await dbService.getData('madrasah_settings') || {};

    const activeTP = settings.tahunAjaran || "2026/2027";
    const activeSemester = settings.semester || "Ganjil";

    // Helper to dynamically load XLSX library
    const loadXlsx = async function() {
        if (window.XLSX) return window.XLSX;
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
            script.onload = () => resolve(window.XLSX);
            script.onerror = () => reject(new Error("Gagal memuat pustaka XLSX"));
            document.head.appendChild(script);
        });
    };

    // Helper to get students belonging to a class' active rombel
    window.getClassStudents = function(className) {
        const activeRombel = homerooms.find(r => r.kelas === className && r.tahunPelajaran === activeTP && r.semester === activeSemester);
        if (activeRombel && Array.isArray(activeRombel.siswaIds)) {
            return students.filter(s => activeRombel.siswaIds.includes(s.id));
        }
        // Fallback to static class name matching
        return students.filter(s => s.kelas === className);
    };

    window.loadAttendanceList = function() {
        const selectedClass = document.getElementById('absen-kelas').value;
        const selectedDate = document.getElementById('absen-tanggal').value;
        
        const classStudents = getClassStudents(selectedClass);
        const existingRecord = attendances.find(a => a.kelas === selectedClass && a.tanggal === selectedDate);
        
        const badge = document.getElementById('absen-stat-badge');
        if (badge) {
            if (existingRecord) {
                badge.className = "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-forest-400 text-[10px] font-bold py-1 px-3 rounded-full";
                badge.innerText = "Sudah Disimpan";
            } else {
                badge.className = "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold py-1 px-3 rounded-full";
                badge.innerText = "Belum Disimpan";
            }
        }

        const tbody = document.getElementById('absen-table-body');
        if (!tbody) return;

        if (classStudents.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="px-6 py-8 text-center text-xs text-slate-500">Tidak ada siswa di kelas ini.</td></tr>`;
            return;
        }

        tbody.innerHTML = classStudents.map((s, idx) => {
            const val = existingRecord && existingRecord.records[s.id] ? existingRecord.records[s.id] : 'H';
            return `
                <tr class="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td class="px-4 py-3 text-xs text-slate-500 text-center">${idx + 1}</td>
                    <td class="px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200">${s.nama}</td>
                    <td class="px-4 py-3 text-xs text-center">
                        <div class="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900">
                            <input type="radio" name="status-${s.id}" id="H-${s.id}" value="H" ${val === 'H' ? 'checked' : ''} class="hidden peer/h">
                            <label for="H-${s.id}" class="px-3.5 py-1 text-[11px] font-bold text-slate-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 peer-checked/h:bg-forest-600 peer-checked/h:text-white transition-all select-none">H</label>
                            
                            <input type="radio" name="status-${s.id}" id="S-${s.id}" value="S" ${val === 'S' ? 'checked' : ''} class="hidden peer/s">
                            <label for="S-${s.id}" class="px-3.5 py-1 text-[11px] font-bold text-slate-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 peer-checked/s:bg-amber-500 peer-checked/s:text-white border-l border-slate-200 dark:border-slate-750 transition-all select-none">S</label>
                            
                            <input type="radio" name="status-${s.id}" id="I-${s.id}" value="I" ${val === 'I' ? 'checked' : ''} class="hidden peer/i">
                            <label for="I-${s.id}" class="px-3.5 py-1 text-[11px] font-bold text-slate-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 peer-checked/i:bg-blue-500 peer-checked/i:text-white border-l border-slate-200 dark:border-slate-750 transition-all select-none">I</label>
                            
                            <input type="radio" name="status-${s.id}" id="A-${s.id}" value="A" ${val === 'A' ? 'checked' : ''} class="hidden peer/a">
                            <label for="A-${s.id}" class="px-3.5 py-1 text-[11px] font-bold text-slate-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 peer-checked/a:bg-rose-500 peer-checked/a:text-white border-l border-slate-200 dark:border-slate-750 transition-all select-none">A</label>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        renderAttendanceSummary(classStudents, existingRecord);
    };

    window.renderAttendanceSummary = function(classStudents, record) {
        const container = document.getElementById('absen-summary-container');
        if (!container) return;

        let h = 0, s = 0, i = 0, a = 0;
        const total = classStudents.length;

        if (record) {
            classStudents.forEach(stud => {
                const status = record.records[stud.id] || 'H';
                if (status === 'H') h++;
                else if (status === 'S') s++;
                else if (status === 'I') i++;
                else if (status === 'A') a++;
            });
        } else {
            h = total;
        }

        const p_h = total ? Math.round((h / total) * 100) : 0;
        const p_s = total ? Math.round((s / total) * 100) : 0;
        const p_i = total ? Math.round((i / total) * 100) : 0;
        const p_a = total ? Math.round((a / total) * 100) : 0;

        container.innerHTML = `
            <div class="space-y-1.5">
                <div class="flex justify-between text-xs font-semibold">
                    <span class="text-forest-750 dark:text-forest-400 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-forest-600"></span> Hadir (${h}/${total})</span>
                    <span>${p_h}%</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div class="bg-forest-650 h-full transition-all duration-500" style="width:${p_h}%"></div>
                </div>
            </div>
            <div class="space-y-1.5">
                <div class="flex justify-between text-xs font-semibold">
                    <span class="text-amber-600 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Sakit (${s}/${total})</span>
                    <span>${p_s}%</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div class="bg-amber-500 h-full transition-all duration-500" style="width:${p_s}%"></div>
                </div>
            </div>
            <div class="space-y-1.5">
                <div class="flex justify-between text-xs font-semibold">
                    <span class="text-blue-600 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Izin (${i}/${total})</span>
                    <span>${p_i}%</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div class="bg-blue-500 h-full transition-all duration-500" style="width:${p_i}%"></div>
                </div>
            </div>
            <div class="space-y-1.5">
                <div class="flex justify-between text-xs font-semibold">
                    <span class="text-rose-600 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Alpa (${a}/${total})</span>
                    <span>${p_a}%</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div class="bg-rose-500 h-full transition-all duration-500" style="width:${p_a}%"></div>
                </div>
            </div>
        `;
    };

    window.saveAttendance = async function() {
        const selectedClass = document.getElementById('absen-kelas').value;
        const selectedDate = document.getElementById('absen-tanggal').value;
        const classStudents = getClassStudents(selectedClass);
        const records = {};

        classStudents.forEach(s => {
            const radio = document.querySelector(`input[name="status-${s.id}"]:checked`);
            records[s.id] = radio ? radio.value : 'H';
        });

        const existingIdx = attendances.findIndex(a => a.kelas === selectedClass && a.tanggal === selectedDate);
        if (existingIdx !== -1) {
            attendances[existingIdx].records = records;
        } else {
            attendances.push({
                id: 'abs_' + Date.now(),
                kelas: selectedClass,
                tanggal: selectedDate,
                records
            });
        }

        await dbService.saveData('absensi', attendances);
        showToast("Presensi harian berhasil disimpan!");
        loadAttendanceList();
    };

    window.renderMonthlyRekap = function() {
        const selectedClass = document.getElementById('absen-kelas').value;
        const yearMonth = document.getElementById('rekap-bulan').value; // format "YYYY-MM"
        const [year, month] = yearMonth.split('-');

        const classStudents = getClassStudents(selectedClass);
        const numDays = new Date(year, month, 0).getDate();
        
        // Filter attendance records of this class and month
        const monthlyRecords = attendances.filter(a => a.kelas === selectedClass && a.tanggal.startsWith(yearMonth));

        const thead = document.getElementById('rekap-table-head');
        const tbody = document.getElementById('rekap-table-body');
        if (!thead || !tbody) return;

        if (classStudents.length === 0) {
            thead.innerHTML = '';
            tbody.innerHTML = `<tr><td class="px-6 py-8 text-center text-xs text-slate-500">Tidak ada siswa di kelas ini.</td></tr>`;
            return;
        }

        // Header days
        let headerDaysHtml = '';
        for (let d = 1; d <= numDays; d++) {
            headerDaysHtml += `<th class="border border-slate-200 dark:border-slate-800 p-1 text-center w-6 font-bold text-[9px]">${d}</th>`;
        }

        thead.innerHTML = `
            <tr class="bg-slate-50 dark:bg-slate-850/60 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                <th class="border border-slate-200 dark:border-slate-800 p-2 w-10">No</th>
                <th class="border border-slate-200 dark:border-slate-800 p-2 text-left min-w-[150px]">Nama Siswa</th>
                ${headerDaysHtml}
                <th class="border border-slate-200 dark:border-slate-800 p-1 w-10 text-emerald-600 font-bold">H</th>
                <th class="border border-slate-200 dark:border-slate-800 p-1 w-10 text-amber-500 font-bold">S</th>
                <th class="border border-slate-200 dark:border-slate-800 p-1 w-10 text-blue-500 font-bold">I</th>
                <th class="border border-slate-200 dark:border-slate-800 p-1 w-10 text-rose-500 font-bold">A</th>
                <th class="border border-slate-200 dark:border-slate-800 p-2 w-14 font-extrabold text-slate-700 dark:text-slate-200">%</th>
            </tr>
        `;

        tbody.innerHTML = classStudents.map((s, idx) => {
            let cellsHtml = '';
            let h = 0, sCount = 0, i = 0, a = 0;
            let totalActiveDays = 0;

            for (let d = 1; d <= numDays; d++) {
                const dayStr = String(d).padStart(2, '0');
                const fullDate = `${yearMonth}-${dayStr}`;
                const dayRecord = monthlyRecords.find(r => r.tanggal === fullDate);
                
                let cellVal = '-';
                let cellColorClass = 'text-slate-300 dark:text-slate-700';

                if (dayRecord && dayRecord.records) {
                    const status = dayRecord.records[s.id] || 'H';
                    cellVal = status;
                    totalActiveDays++;

                    if (status === 'H') {
                        h++;
                        cellColorClass = 'text-emerald-600 font-bold';
                    } else if (status === 'S') {
                        sCount++;
                        cellColorClass = 'text-amber-500 font-bold';
                    } else if (status === 'I') {
                        i++;
                        cellColorClass = 'text-blue-500 font-bold';
                    } else if (status === 'A') {
                        a++;
                        cellColorClass = 'text-rose-500 font-bold';
                    }
                }

                cellsHtml += `<td class="border border-slate-200 dark:border-slate-850 p-1 text-center text-[10px] ${cellColorClass}">${cellVal}</td>`;
            }

            const pct = totalActiveDays ? Math.round((h / totalActiveDays) * 100) : 100;

            return `
                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-colors">
                    <td class="border border-slate-200 dark:border-slate-850 p-2 text-center text-slate-550">${idx + 1}</td>
                    <td class="border border-slate-200 dark:border-slate-850 p-2 font-semibold text-slate-800 dark:text-slate-250 truncate max-w-[150px]">${s.nama}</td>
                    ${cellsHtml}
                    <td class="border border-slate-200 dark:border-slate-850 p-1 text-center font-bold text-emerald-600 bg-emerald-500/5">${h}</td>
                    <td class="border border-slate-200 dark:border-slate-850 p-1 text-center font-bold text-amber-500 bg-amber-500/5">${sCount}</td>
                    <td class="border border-slate-200 dark:border-slate-850 p-1 text-center font-bold text-blue-500 bg-blue-500/5">${i}</td>
                    <td class="border border-slate-200 dark:border-slate-850 p-1 text-center font-bold text-rose-500 bg-rose-500/5">${a}</td>
                    <td class="border border-slate-200 dark:border-slate-850 p-2 text-center font-extrabold text-slate-750 dark:text-slate-250">${pct}%</td>
                </tr>
            `;
        }).join('');
    };

    window.switchAbsensiTab = function(tab) {
        const btnInput = document.getElementById('tab-input-btn');
        const btnRekap = document.getElementById('tab-rekap-btn');
        const inputView = document.getElementById('absensi-input-view');
        const rekapView = document.getElementById('absensi-rekap-view');

        if (tab === 'input') {
            btnInput.className = "px-3.5 py-1.5 bg-forest-700 text-white rounded-lg text-xs font-bold transition-all";
            btnRekap.className = "px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 rounded-lg text-xs font-semibold transition-all";
            inputView.classList.remove('hidden');
            rekapView.classList.add('hidden');
            loadAttendanceList();
        } else {
            btnRekap.className = "px-3.5 py-1.5 bg-forest-700 text-white rounded-lg text-xs font-bold transition-all";
            btnInput.className = "px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 rounded-lg text-xs font-semibold transition-all";
            inputView.classList.add('hidden');
            rekapView.classList.remove('hidden');
            renderMonthlyRekap();
        }
    };

    // Excel Export
    window.exportAbsensiExcel = async function() {
        const selectedClass = document.getElementById('absen-kelas').value;
        const yearMonth = document.getElementById('rekap-bulan').value;
        const [year, month] = yearMonth.split('-');
        const classStudents = getClassStudents(selectedClass);
        const numDays = new Date(year, month, 0).getDate();
        const monthlyRecords = attendances.filter(a => a.kelas === selectedClass && a.tanggal.startsWith(yearMonth));

        if (classStudents.length === 0) {
            showToast("Tidak ada data siswa untuk diexport", "warning");
            return;
        }

        try {
            const xlsx = await loadXlsx();
            const exportData = classStudents.map((s, idx) => {
                const rowObj = {
                    "No": idx + 1,
                    "Nama Siswa": s.nama,
                    "NISN": s.nisn || ""
                };

                let h = 0, sCount = 0, i = 0, a = 0;
                let activeDays = 0;

                for (let d = 1; d <= numDays; d++) {
                    const dayStr = String(d).padStart(2, '0');
                    const fullDate = `${yearMonth}-${dayStr}`;
                    const dayRecord = monthlyRecords.find(r => r.tanggal === fullDate);
                    
                    let val = "-";
                    if (dayRecord && dayRecord.records) {
                        const status = dayRecord.records[s.id] || "H";
                        val = status;
                        activeDays++;
                        if (status === 'H') h++;
                        else if (status === 'S') sCount++;
                        else if (status === 'I') i++;
                        else if (status === 'A') a++;
                    }
                    rowObj[`Tanggal ${d}`] = val;
                }

                rowObj["Hadir (H)"] = h;
                rowObj["Sakit (S)"] = sCount;
                rowObj["Izin (I)"] = i;
                rowObj["Alpha (A)"] = a;
                rowObj["Persentase Kehadiran (%)"] = activeDays ? `${Math.round((h / activeDays) * 100)}%` : "100%";

                return rowObj;
            });

            const worksheet = xlsx.utils.json_to_sheet(exportData);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Rekap Absensi");
            xlsx.writeFile(workbook, `Rekap_Absensi_Kelas_${selectedClass}_Bulan_${yearMonth}.xlsx`);
            showToast("Export Excel Rekap Absensi berhasil!");
        } catch (err) {
            console.error(err);
            showToast("Gagal melakukan export Excel.", "error");
        }
    };

    // Print Rekap bulanan
    window.printAbsensiFormat = function() {
        const selectedClass = document.getElementById('absen-kelas').value;
        const yearMonth = document.getElementById('rekap-bulan').value;
        const [year, month] = yearMonth.split('-');
        const classStudents = getClassStudents(selectedClass);
        const numDays = new Date(year, month, 0).getDate();
        const monthlyRecords = attendances.filter(a => a.kelas === selectedClass && a.tanggal.startsWith(yearMonth));

        const getMonthName = function(mStr) {
            const m = parseInt(mStr, 10);
            const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
            return months[m - 1] || "";
        };

        let thDaysHtml = '';
        for (let d = 1; d <= numDays; d++) {
            thDaysHtml += `<th style="border: 1px solid #333; padding: 4px; font-size: 8px; width: 18px; text-align: center;">${d}</th>`;
        }

        let rowsHtml = classStudents.map((s, idx) => {
            let cells = '';
            let h = 0, sCount = 0, i = 0, a = 0;
            let activeDays = 0;

            for (let d = 1; d <= numDays; d++) {
                const dayStr = String(d).padStart(2, '0');
                const fullDate = `${yearMonth}-${dayStr}`;
                const dayRecord = monthlyRecords.find(r => r.tanggal === fullDate);
                
                let val = '-';
                if (dayRecord && dayRecord.records) {
                    const status = dayRecord.records[s.id] || 'H';
                    val = status;
                    activeDays++;
                    if (status === 'H') h++;
                    else if (status === 'S') sCount++;
                    else if (status === 'I') i++;
                    else if (status === 'A') a++;
                }
                cells += `<td style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px;">${val}</td>`;
            }

            const pct = activeDays ? Math.round((h / activeDays) * 100) : 100;

            return `
                <tr style="border: 1px solid #333;">
                    <td style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 9px;">${idx + 1}</td>
                    <td style="border: 1px solid #333; padding: 4px; font-size: 9px; font-weight: bold;">${s.nama}</td>
                    ${cells}
                    <td style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold; background: #e8f5e9;">${h}</td>
                    <td style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold; background: #fff8e1;">${sCount}</td>
                    <td style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold; background: #e3f2fd;">${i}</td>
                    <td style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold; background: #ffebee;">${a}</td>
                    <td style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 9px; font-weight: bold;">${pct}%</td>
                </tr>
            `;
        }).join('');

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Cetak Rekap Presensi - ${selectedClass}</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; color: #000; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    @page { size: landscape; margin: 1cm; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2 style="margin: 0; font-size: 16px; text-transform: uppercase;">REKAPITULASI PRESENSI BULANAN SISWA</h2>
                    <h3 style="margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase;">MTs IDRISIYYAH TASIKMALAYA</h3>
                    <p style="margin: 5px 0 0 0; font-size: 10px; font-style: italic;">Kelas: ${selectedClass} | Bulan: ${getMonthName(month)} ${year} | TP: ${activeTP}</p>
                </div>
                <table>
                    <thead>
                        <tr style="background: #eee;">
                            <th style="border: 1px solid #333; padding: 6px; font-size: 9px; width: 3%;">No</th>
                            <th style="border: 1px solid #333; padding: 6px; font-size: 9px; text-align: left; width: 18%;">Nama Siswa</th>
                            ${thDaysHtml}
                            <th style="border: 1px solid #333; padding: 4px; font-size: 8px; width: 2.5%; text-align: center;">H</th>
                            <th style="border: 1px solid #333; padding: 4px; font-size: 8px; width: 2.5%; text-align: center;">S</th>
                            <th style="border: 1px solid #333; padding: 4px; font-size: 8px; width: 2.5%; text-align: center;">I</th>
                            <th style="border: 1px solid #333; padding: 4px; font-size: 8px; width: 2.5%; text-align: center;">A</th>
                            <th style="border: 1px solid #333; padding: 6px; font-size: 9px; width: 4%; text-align: center;">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    // Load class dynamic options
    const classroomsOptions = classrooms.map(c => `<option value="${c.nama}">${c.nama}</option>`).join('');

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <!-- Filter Bar & Tabs Selector -->
            <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <div class="flex flex-wrap items-end gap-3.5">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Pilih Kelas</label>
                        <select id="absen-kelas" onchange="loadAttendanceList(); if(!document.getElementById('absensi-rekap-view').classList.contains('hidden')) renderMonthlyRekap();" class="px-3.5 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs w-40">
                            ${classroomsOptions || '<option value="VII-A">VII-A</option>'}
                        </select>
                    </div>
                    <div id="date-selector-container">
                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Pilih Tanggal</label>
                        <input type="date" id="absen-tanggal" value="${getTodayStr()}" onchange="loadAttendanceList()" class="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs w-44">
                    </div>
                </div>

                <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    <button id="tab-input-btn" onclick="switchAbsensiTab('input')" class="px-3.5 py-1.5 bg-forest-700 text-white rounded-lg text-xs font-bold transition-all">Input Harian</button>
                    <button id="tab-rekap-btn" onclick="switchAbsensiTab('rekap')" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 rounded-lg text-xs font-semibold transition-all">Rekap Bulanan</button>
                </div>
            </div>

            <!-- Tab View 1: Input Presensi -->
            <div id="absensi-input-view" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div class="p-5 bg-slate-50 dark:bg-slate-850/40 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="ph ph-notepad-bold text-forest-650 text-base"></i> Lembar Kehadiran Kelas
                        </h3>
                        <span id="absen-stat-badge" class="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold py-1 px-3 rounded-full">Belum Disimpan</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="text-[10px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800 uppercase bg-slate-50/50 dark:bg-slate-850/20">
                                    <th class="px-6 py-3.5 w-12 text-center">No</th>
                                    <th class="px-6 py-3.5">Nama Siswa</th>
                                    <th class="px-6 py-3.5 text-center w-56">Status Presensi</th>
                                </tr>
                            </thead>
                            <tbody id="absen-table-body"></tbody>
                        </table>
                    </div>
                    <div class="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end no-print">
                        <button onclick="saveAttendance()" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md active:scale-98">Simpan Absensi</button>
                    </div>
                </div>
                
                <!-- Side Statistics Panel -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4 h-fit">
                    <h3 class="text-xs font-black uppercase tracking-wider text-slate-850 dark:text-slate-150 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <i class="ph ph-chart-pie text-forest-650 text-base"></i> Statistik Hari Ini
                    </h3>
                    <div class="space-y-4" id="absen-summary-container"></div>
                </div>
            </div>

            <!-- Tab View 2: Rekap Bulanan Matrix -->
            <div id="absensi-rekap-view" class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-6 hidden">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div class="flex items-center gap-3">
                        <h3 class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Matriks Rekapitulasi Presensi
                        </h3>
                        <div class="flex items-center gap-1.5">
                            <label class="text-[10px] font-bold text-slate-450 uppercase">Bulan:</label>
                            <input type="month" id="rekap-bulan" value="2026-06" onchange="renderMonthlyRekap()" class="px-2.5 py-1 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg outline-none focus:border-forest-500 text-xs w-36">
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="exportAbsensiExcel()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-file-xls text-base"></i> Ekspor Rekap (Excel)
                        </button>
                        <button onclick="printAbsensiFormat()" class="bg-blue-650 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-printer text-base"></i> Cetak Rekap
                        </button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse border border-slate-200 dark:border-slate-850">
                        <thead id="rekap-table-head"></thead>
                        <tbody id="rekap-table-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Initialize list load
    loadAttendanceList();
}
