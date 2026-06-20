// ============================================
// TRADISI — Penilaian Siswa Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, getUserProfile, showConfirmDialog } = ctx;

    // Load data master
    const students = await dbService.getData('siswa') || [];
    const grades = await dbService.getData('penilaian') || [];
    const homerooms = await dbService.getData('homerooms') || [];
    const classrooms = await dbService.getData('classrooms') || [];
    const subjects = await dbService.getData('subjects') || [];
    const userProfile = getUserProfile();

    const settings = await dbService.getData('madrasah_settings') || {};
    const activeTP = settings.tahunAjaran || "2026/2027";
    const activeSemester = settings.semester || "Ganjil";

    // Dynamic weights state (with default fallback)
    let weights = {
        tugas: 20,
        ulangan: 30,
        uts: 20,
        uas: 20,
        projek: 10
    };

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

    // Get student list from active Rombel
    window.getClassStudents = function(className) {
        const activeRombel = homerooms.find(r => r.kelas === className && r.tahunPelajaran === activeTP && r.semester === activeSemester);
        if (activeRombel && Array.isArray(activeRombel.siswaIds)) {
            return students.filter(s => activeRombel.siswaIds.includes(s.id));
        }
        // Fallback to static class name matching
        return students.filter(s => s.kelas === className);
    };

    window.toggleGradeView = function(mode) {
        const inpView = document.getElementById('grade-input-view');
        const ledView = document.getElementById('grade-ledger-view');
        const btnInp = document.getElementById('btn-view-input');
        const btnLed = document.getElementById('btn-view-ledger');

        if (mode === 'input') {
            inpView.classList.remove('hidden');
            ledView.classList.add('hidden');
            btnInp.className = "px-3.5 py-1.5 bg-forest-700 text-white rounded-lg text-xs font-bold transition-all";
            btnLed.className = "px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 rounded-lg text-xs font-semibold transition-all";
        } else {
            inpView.classList.add('hidden');
            ledView.classList.remove('hidden');
            btnInp.className = "px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 rounded-lg text-xs font-semibold transition-all";
            btnLed.className = "px-3.5 py-1.5 bg-forest-700 text-white rounded-lg text-xs font-bold transition-all";
            renderLedgerTable();
        }
    };

    // Calculate dynamic Final Score based on weights configuration
    const calculateFinalScore = function(tugas, ulangan, uts, uas, projek) {
        const tW = weights.tugas / 100;
        const uW = weights.ulangan / 100;
        const utW = weights.uts / 100;
        const uaW = weights.uas / 100;
        const pW = weights.projek / 100;
        return Math.round((tugas * tW) + (ulangan * uW) + (uts * utW) + (uas * uaW) + (projek * pW));
    };

    // Predicate map
    const getPredicate = function(score) {
        if (score >= 85) return 'A';
        if (score >= 75) return 'B';
        if (score >= 60) return 'C';
        return 'D';
    };

    window.loadGradesInput = function() {
        const cls = document.getElementById('grade-kelas').value;
        const subject = document.getElementById('grade-mapel').value;
        const classStudents = getClassStudents(cls);

        const tbodyInp = document.getElementById('grade-input-body');
        if (!tbodyInp) return;

        if (classStudents.length === 0) {
            tbodyInp.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-xs text-slate-500">Tidak ada data siswa di rombel kelas ini.</td></tr>`;
            return;
        }

        tbodyInp.innerHTML = classStudents.map((s, idx) => {
            const score = grades.find(g => g.siswaId === s.id && g.kelas === cls && g.mapel === subject) || { tugas: 0, ulangan: 0, uts: 0, uas: 0, projek: 0 };
            return `
                <tr class="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50/50">
                    <td class="px-6 py-3.5 text-xs text-slate-500 text-center">${idx + 1}</td>
                    <td class="px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">${s.nama}</td>
                    <td class="px-4 py-2 text-center"><input type="number" min="0" max="100" id="tugas-${s.id}" value="${score.tugas || 0}" class="w-16 px-2 py-1 text-center border dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs"></td>
                    <td class="px-4 py-2 text-center"><input type="number" min="0" max="100" id="ulangan-${s.id}" value="${score.ulangan || 0}" class="w-16 px-2 py-1 text-center border dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs"></td>
                    <td class="px-4 py-2 text-center"><input type="number" min="0" max="100" id="uts-${s.id}" value="${score.uts || 0}" class="w-16 px-2 py-1 text-center border dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs"></td>
                    <td class="px-4 py-2 text-center"><input type="number" min="0" max="100" id="uas-${s.id}" value="${score.uas || 0}" class="w-16 px-2 py-1 text-center border dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs"></td>
                    <td class="px-4 py-2 text-center"><input type="number" min="0" max="100" id="projek-${s.id}" value="${score.projek || 0}" class="w-16 px-2 py-1 text-center border dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs"></td>
                </tr>
            `;
        }).join('');
    };

    window.renderLedgerTable = function() {
        const cls = document.getElementById('grade-kelas').value;
        const subject = document.getElementById('grade-mapel').value;
        const classStudents = getClassStudents(cls);
        const kkmVal = parseInt(document.getElementById('grade-kkm').value, 10) || 75;

        const tbodyLed = document.getElementById('grade-ledger-body');
        if (!tbodyLed) return;

        if (classStudents.length === 0) {
            tbodyLed.innerHTML = `<tr><td colspan="10" class="px-6 py-8 text-center text-xs text-slate-500">Tidak ada data rekap nilai untuk kelas ini.</td></tr>`;
            return;
        }

        let totalFinalScore = 0;
        let passCount = 0;
        let failCount = 0;
        
        let distA = 0, distB = 0, distC = 0, distD = 0;

        const rowsHtml = classStudents.map((s, idx) => {
            const score = grades.find(g => g.siswaId === s.id && g.kelas === cls && g.mapel === subject) || { tugas: 0, ulangan: 0, uts: 0, uas: 0, projek: 0 };
            
            const tugas = parseInt(score.tugas, 10) || 0;
            const ulangan = parseInt(score.ulangan, 10) || 0;
            const uts = parseInt(score.uts, 10) || 0;
            const uas = parseInt(score.uas, 10) || 0;
            const projek = parseInt(score.projek, 10) || 0;

            const finalScore = calculateFinalScore(tugas, ulangan, uts, uas, projek);
            totalFinalScore += finalScore;

            const predicate = getPredicate(finalScore);
            if (predicate === 'A') distA++;
            else if (predicate === 'B') distB++;
            else if (predicate === 'C') distC++;
            else distD++;

            const isPassed = finalScore >= kkmVal;
            if (isPassed) passCount++;
            else failCount++;

            return `
                <tr class="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50/50">
                    <td class="px-6 py-3 text-xs text-slate-500 text-center">${idx + 1}</td>
                    <td class="px-6 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200">${s.nama}</td>
                    <td class="px-4 py-3 text-xs text-center text-slate-600 dark:text-slate-400">${tugas}</td>
                    <td class="px-4 py-3 text-xs text-center text-slate-600 dark:text-slate-400">${ulangan}</td>
                    <td class="px-4 py-3 text-xs text-center text-slate-600 dark:text-slate-400">${uts}</td>
                    <td class="px-4 py-3 text-xs text-center text-slate-600 dark:text-slate-400">${uas}</td>
                    <td class="px-4 py-3 text-xs text-center text-slate-600 dark:text-slate-400">${projek}</td>
                    <td class="px-4 py-3 text-xs text-center font-black text-slate-850 dark:text-slate-100">${finalScore}</td>
                    <td class="px-4 py-3 text-xs text-center font-bold text-slate-750 dark:text-slate-200">${predicate}</td>
                    <td class="px-4 py-3 text-xs text-center">
                        <span class="px-2 py-0.5 rounded-full font-bold text-[9px] ${isPassed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-forest-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'}">${isPassed ? 'Lulus KKTP' : 'Remedial'}</span>
                    </td>
                </tr>
            `;
        }).join('');

        tbodyLed.innerHTML = rowsHtml;

        // Render visual class summaries
        const classAvg = classStudents.length ? Math.round(totalFinalScore / classStudents.length) : 0;
        const total = classStudents.length;
        const passPct = total ? Math.round((passCount / total) * 100) : 0;

        const statsHtml = `
            <!-- Avg & Pass cards -->
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                    <div class="text-2xl font-black text-forest-700 dark:text-forest-400">${classAvg}</div>
                    <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rata-rata Rombel</div>
                </div>
                <div class="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                    <div class="text-2xl font-black text-emerald-600">${passPct}%</div>
                    <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ketuntasan Klasikal</div>
                </div>
            </div>

            <!-- KKM Stats -->
            <div class="space-y-1.5 pt-2">
                <div class="flex justify-between text-xs font-bold">
                    <span class="text-emerald-600 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Lulus KKTP (${passCount}/${total})</span>
                    <span class="text-rose-600 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Remedial (${failCount}/${total})</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
                    <div class="bg-emerald-600 h-full transition-all" style="width: ${passPct}%"></div>
                    <div class="bg-rose-500 h-full transition-all" style="width: ${100 - passPct}%"></div>
                </div>
            </div>

            <!-- Grade Sebaran distributions -->
            <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p class="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Sebaran Predikat Nilai</p>
                <div class="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                    <div class="bg-blue-100 dark:bg-blue-950/40 text-blue-700 p-2 rounded-xl border border-blue-500/10">
                        <span class="block text-sm font-black">${distA}</span> Predikat A
                    </div>
                    <div class="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 p-2 rounded-xl border border-emerald-500/10">
                        <span class="block text-sm font-black">${distB}</span> Predikat B
                    </div>
                    <div class="bg-amber-100 dark:bg-amber-950/40 text-amber-700 p-2 rounded-xl border border-amber-500/10">
                        <span class="block text-sm font-black">${distC}</span> Predikat C
                    </div>
                    <div class="bg-rose-100 dark:bg-rose-950/40 text-rose-700 p-2 rounded-xl border border-rose-500/10">
                        <span class="block text-sm font-black">${distD}</span> Predikat D
                    </div>
                </div>
            </div>
        `;

        const statsContainer = document.getElementById('ledger-stats-container');
        if (statsContainer) statsContainer.innerHTML = statsHtml;
    };

    window.saveGrades = async function() {
        const cls = document.getElementById('grade-kelas').value;
        const subject = document.getElementById('grade-mapel').value;
        const classStudents = getClassStudents(cls);

        classStudents.forEach(s => {
            const tVal = parseInt(document.getElementById(`tugas-${s.id}`).value, 10) || 0;
            const uVal = parseInt(document.getElementById(`ulangan-${s.id}`).value, 10) || 0;
            const utVal = parseInt(document.getElementById(`uts-${s.id}`).value, 10) || 0;
            const uaVal = parseInt(document.getElementById(`uas-${s.id}`).value, 10) || 0;
            const pVal = parseInt(document.getElementById(`projek-${s.id}`).value, 10) || 0;

            const newScore = {
                id: `grd_${cls}_${s.id}_${Date.now()}`,
                kelas: cls,
                mapel: subject,
                siswaId: s.id,
                tugas: tVal,
                ulangan: uVal,
                uts: utVal,
                uas: uaVal,
                projek: pVal
            };

            const idx = grades.findIndex(g => g.siswaId === s.id && g.kelas === cls && g.mapel === subject);
            if (idx !== -1) {
                grades[idx] = newScore;
            } else {
                grades.push(newScore);
            }
        });

        await dbService.saveData('penilaian', grades);
        showToast("Penilaian siswa berhasil disimpan!");
        loadGradesInput();
    };

    // Open Weights Configuration Modal
    window.openWeightsConfigModal = function() {
        const modalBody = `
            <div class="space-y-4">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Konfigurasi bobot kontribusi nilai akhir (Harus berjumlah 100%):</p>
                <div class="grid grid-cols-2 gap-3.5">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Bobot Tugas (%)</label>
                        <input type="number" id="wt-tugas" min="0" max="100" value="${weights.tugas}" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Bobot Ulangan Harian (%)</label>
                        <input type="number" id="wt-ulangan" min="0" max="100" value="${weights.ulangan}" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Bobot UTS (%)</label>
                        <input type="number" id="wt-uts" min="0" max="100" value="${weights.uts}" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Bobot UAS (%)</label>
                        <input type="number" id="wt-uas" min="0" max="100" value="${weights.uas}" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Bobot Sumatif Projek (%)</label>
                    <input type="number" id="wt-projek" min="0" max="100" value="${weights.projek}" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                </div>
                <div id="weights-total-indicator" class="text-right text-xs font-bold text-forest-700">Total: 100%</div>
            </div>
        `;

        openModal("Konfigurasi Bobot Nilai Akhir", modalBody, "Terapkan", () => {
            const t = parseInt(document.getElementById('wt-tugas').value, 10) || 0;
            const u = parseInt(document.getElementById('wt-ulangan').value, 10) || 0;
            const ut = parseInt(document.getElementById('wt-uts').value, 10) || 0;
            const ua = parseInt(document.getElementById('wt-uas').value, 10) || 0;
            const p = parseInt(document.getElementById('wt-projek').value, 10) || 0;

            const sum = t + u + ut + ua + p;
            if (sum !== 100) {
                showToast(`Total bobot adalah ${sum}%. Bobot kontribusi harus berjumlah tepat 100%!`, "error");
                return;
            }

            weights = { tugas: t, ulangan: u, uts: ut, uas: ua, projek: p };
            closeModal();
            showToast("Konfigurasi bobot berhasil diterapkan!");
            renderLedgerTable();
        });
    };

    // Excel Export
    window.exportGradesExcel = async function() {
        const cls = document.getElementById('grade-kelas').value;
        const subject = document.getElementById('grade-mapel').value;
        const classStudents = getClassStudents(cls);
        const kkmVal = parseInt(document.getElementById('grade-kkm').value, 10) || 75;

        if (classStudents.length === 0) {
            showToast("Tidak ada data siswa untuk diexport", "warning");
            return;
        }

        try {
            const xlsx = await loadXlsx();
            const exportData = classStudents.map((s, idx) => {
                const score = grades.find(g => g.siswaId === s.id && g.kelas === cls && g.mapel === subject) || { tugas: 0, ulangan: 0, uts: 0, uas: 0, projek: 0 };
                
                const tugas = parseInt(score.tugas, 10) || 0;
                const ulangan = parseInt(score.ulangan, 10) || 0;
                const uts = parseInt(score.uts, 10) || 0;
                const uas = parseInt(score.uas, 10) || 0;
                const projek = parseInt(score.projek, 10) || 0;

                const finalScore = calculateFinalScore(tugas, ulangan, uts, uas, projek);
                const predicate = getPredicate(finalScore);
                const status = finalScore >= kkmVal ? "Lulus KKTP" : "Remedial";

                return {
                    "No": idx + 1,
                    "Nama Siswa": s.nama,
                    "NISN": s.nisn || "",
                    "Tugas": tugas,
                    "Ulangan": ulangan,
                    "UTS": uts,
                    "UAS": uas,
                    "Projek": projek,
                    "Nilai Akhir": finalScore,
                    "Predikat": predicate,
                    "Keterangan": status
                };
            });

            const worksheet = xlsx.utils.json_to_sheet(exportData);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Laporan Nilai");
            xlsx.writeFile(workbook, `Daftar_Nilai_Kelas_${cls}_${subject.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
            showToast("Export Excel nilai berhasil!");
        } catch (err) {
            console.error(err);
            showToast("Gagal melakukan export Excel.", "error");
        }
    };

    // Print Daftar Nilai
    window.printGradesFormat = function() {
        const cls = document.getElementById('grade-kelas').value;
        const subject = document.getElementById('grade-mapel').value;
        const classStudents = getClassStudents(cls);
        const kkmVal = parseInt(document.getElementById('grade-kkm').value, 10) || 75;

        let total = 0;
        const rowsHtml = classStudents.map((s, idx) => {
            const score = grades.find(g => g.siswaId === s.id && g.kelas === cls && g.mapel === subject) || { tugas: 0, ulangan: 0, uts: 0, uas: 0, projek: 0 };
            
            const tugas = parseInt(score.tugas, 10) || 0;
            const ulangan = parseInt(score.ulangan, 10) || 0;
            const uts = parseInt(score.uts, 10) || 0;
            const uas = parseInt(score.uas, 10) || 0;
            const projek = parseInt(score.projek, 10) || 0;

            const finalScore = calculateFinalScore(tugas, ulangan, uts, uas, projek);
            total += finalScore;

            const predicate = getPredicate(finalScore);
            const status = finalScore >= kkmVal ? "Lulus KKTP" : "Remedial";

            return `
                <tr style="border: 1px solid #333;">
                    <td style="padding: 6px; text-align: center; border: 1px solid #333; font-size: 11px;">${idx + 1}</td>
                    <td style="padding: 6px; border: 1px solid #333; font-size: 11px; font-weight: bold;">${s.nama}</td>
                    <td style="padding: 6px; text-align: center; border: 1px solid #333; font-size: 11px;">${tugas}</td>
                    <td style="padding: 6px; text-align: center; border: 1px solid #333; font-size: 11px;">${ulangan}</td>
                    <td style="padding: 6px; text-align: center; border: 1px solid #333; font-size: 11px;">${uts}</td>
                    <td style="padding: 6px; text-align: center; border: 1px solid #333; font-size: 11px;">${uas}</td>
                    <td style="padding: 6px; text-align: center; border: 1px solid #333; font-size: 11px;">${projek}</td>
                    <td style="padding: 6px; text-align: center; border: 1px solid #333; font-size: 11px; font-weight: bold; background: #eee;">${finalScore}</td>
                    <td style="padding: 6px; text-align: center; border: 1px solid #333; font-size: 11px; font-weight: bold;">${predicate}</td>
                    <td style="padding: 6px; text-align: center; border: 1px solid #333; font-size: 11px; font-weight: bold; ${finalScore >= kkmVal ? 'color: green;' : 'color: red;'}">${status}</td>
                </tr>
            `;
        }).join('');

        const classAvg = classStudents.length ? Math.round(total / classStudents.length) : 0;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Cetak Nilai - ${cls}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 30px; }
                    .kop-surat { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 25px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    th { border: 1px solid #333; background: #f2f2f2; padding: 8px; font-size: 11px; text-transform: uppercase; }
                    @page { size: landscape; margin: 1cm; }
                </style>
            </head>
            <body>
                <div class="kop-surat">
                    <p style="margin: 0; font-size: 12px; font-weight: bold;">YAYASAN IDRISIYYAH TASIKMALAYA</p>
                    <h2 style="margin: 3px 0; font-size: 16px;">MADRASAH TSANAWIYAH (MTs) IDRISIYYAH</h2>
                    <p style="margin: 0; font-size: 10px; font-style: italic;">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | Telp: (0265) 323456</p>
                </div>
                <h3 style="text-align: center; text-transform: uppercase; font-size: 13px;">LAPORAN REKAPITULASI DAFTAR NILAI SISWA</h3>
                <p style="font-size: 11px; margin: 5px 0 15px 0;">Mata Pelajaran: <strong>${subject}</strong> | Kelas: <strong>${cls}</strong> | Tahun Pelajaran: ${activeTP} | Semester: ${activeSemester}</p>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 4%;">No</th>
                            <th style="text-align: left;">Nama Siswa</th>
                            <th style="width: 8%;">Tugas</th>
                            <th style="width: 8%;">Ulangan</th>
                            <th style="width: 8%;">UTS</th>
                            <th style="width: 8%;">UAS</th>
                            <th style="width: 8%;">Projek</th>
                            <th style="width: 10%; background: #ddd;">Nilai Akhir</th>
                            <th style="width: 8%;">Predikat</th>
                            <th style="width: 15%;">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                        <tr style="font-weight: bold; background: #fafafa;">
                            <td colspan="7" style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 11px;">RATA-RATA KELAS:</td>
                            <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">${classAvg}</td>
                            <td colspan="2" style="border: 1px solid #333; padding: 8px; font-size: 11px;">KKTP: ${kkmVal}</td>
                        </tr>
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

    // Load form dynamic options
    const classroomsOptions = classrooms.map(c => `<option value="${c.nama}">${c.nama}</option>`).join('');
    const subjectsOptions = subjects.map(s => `<option value="${s.nama}">${s.nama}</option>`).join('');

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <!-- Filter & Mode Bar -->
            <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <div class="flex flex-wrap items-end gap-3.5">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Pilih Kelas</label>
                        <select id="grade-kelas" onchange="loadGradesInput(); if(!document.getElementById('grade-ledger-view').classList.contains('hidden')) renderLedgerTable();" class="px-3.5 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs w-40">
                            ${classroomsOptions || '<option value="VII-A">VII-A</option>'}
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Mata Pelajaran</label>
                        <select id="grade-mapel" onchange="loadGradesInput(); if(!document.getElementById('grade-ledger-view').classList.contains('hidden')) renderLedgerTable();" class="px-3.5 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs w-44">
                            ${subjectsOptions || `<option value="${userProfile.mapel || ''}">${userProfile.mapel || ''}</option>`}
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Kriteria Ketuntasan (KKTP)</label>
                        <input type="number" id="grade-kkm" value="75" oninput="if(!document.getElementById('grade-ledger-view').classList.contains('hidden')) renderLedgerTable();" class="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs w-24 text-center">
                    </div>
                </div>

                <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    <button id="btn-view-input" onclick="toggleGradeView('input')" class="px-3.5 py-1.5 bg-forest-700 text-white rounded-lg text-xs font-bold transition-all">Form Input</button>
                    <button id="btn-view-ledger" onclick="toggleGradeView('ledger')" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 rounded-lg text-xs font-semibold transition-all">Rekap Nilai</button>
                </div>
            </div>

            <!-- View Mode 1: Input List -->
            <div id="grade-input-view" class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-850/40">
                    <h3 class="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="ph ph-exam text-forest-650 text-base"></i> Input Nilai Siswa
                    </h3>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-250 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th class="px-6 py-3.5 w-12 text-center">No</th>
                                <th class="px-6 py-3.5">Nama Siswa</th>
                                <th class="px-4 py-3.5 text-center w-28">Tugas (w: ${weights.tugas}%)</th>
                                <th class="px-4 py-3.5 text-center w-28">Ulangan (w: ${weights.ulangan}%)</th>
                                <th class="px-4 py-3.5 text-center w-28">UTS (w: ${weights.uts}%)</th>
                                <th class="px-4 py-3.5 text-center w-28">UAS (w: ${weights.uas}%)</th>
                                <th class="px-4 py-3.5 text-center w-28">Projek (w: ${weights.projek}%)</th>
                            </tr>
                        </thead>
                        <tbody id="grade-input-body"></tbody>
                    </table>
                </div>

                <div class="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 no-print">
                    <button onclick="openWeightsConfigModal()" class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center gap-1">
                        <i class="ph ph-sliders"></i> Bobot Nilai
                    </button>
                    <button onclick="saveGrades()" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all active:scale-98">
                        Simpan Nilai Rombel
                    </button>
                </div>
            </div>

            <!-- View Mode 2: Rekap Ledger -->
            <div id="grade-ledger-view" class="grid grid-cols-1 lg:grid-cols-3 gap-6 hidden">
                <!-- Ledger Table (Left) -->
                <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div class="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-850/40">
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="ph ph-clipboard-text text-forest-650 text-base"></i> Lembar Rekapitulasi Nilai Siswa
                        </h3>
                        <div class="flex gap-2">
                            <button onclick="exportGradesExcel()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] flex items-center gap-1 shadow-sm transition-all active:scale-98">
                                <i class="ph ph-file-xls text-sm"></i> Ekspor Excel
                            </button>
                            <button onclick="printGradesFormat()" class="bg-blue-655 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] flex items-center gap-1 shadow-sm transition-all active:scale-98">
                                <i class="ph ph-printer text-sm"></i> Cetak Laporan
                            </button>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                                    <th class="px-6 py-3 w-12">No</th>
                                    <th class="px-6 py-3 text-left">Nama Siswa</th>
                                    <th class="px-4 py-3 w-14">TGS</th>
                                    <th class="px-4 py-3 w-14">UH</th>
                                    <th class="px-4 py-3 w-14">UTS</th>
                                    <th class="px-4 py-3 w-14">UAS</th>
                                    <th class="px-4 py-3 w-14">PRJ</th>
                                    <th class="px-4 py-3 w-16 bg-slate-100/50 dark:bg-slate-900/50 font-black">AKHIR</th>
                                    <th class="px-4 py-3 w-14">PRED</th>
                                    <th class="px-4 py-3 w-28">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody id="grade-ledger-body"></tbody>
                        </table>
                    </div>
                </div>

                <!-- Stats side panel (Right) -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-5 h-fit">
                    <h3 class="text-xs font-black uppercase tracking-wider text-slate-850 dark:text-slate-150 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <i class="ph ph-chart-line text-forest-650 text-base"></i> Sebaran & Capaian Kelas
                    </h3>
                    <div id="ledger-stats-container" class="space-y-4"></div>
                </div>
            </div>
        </div>
    `;

    // Load initial values
    loadGradesInput();
}
