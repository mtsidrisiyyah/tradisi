// ============================================
// TRADISI — Analisis Butir Soal Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, getUserProfile } = ctx;
    const userProfile = getUserProfile();

    // 1. Load Master Data
    const subjects = await dbService.getData('subjects') || [];
    const classrooms = await dbService.getData('classrooms') || [];
    const siswa = await dbService.getData('siswa') || [];
    const settings = await dbService.getData('madrasah_settings') || {};

    const mapelOptions = subjects.map(s => `<option value="${s.nama}">${s.nama} (${s.tingkat})</option>`).join('');
    const kelasOptions = classrooms.map(c => `<option value="${c.nama}">${c.nama}</option>`).join('');

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <!-- Filter & Config Card -->
            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
                <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <i class="ph ph-chart-bar text-forest-600 text-base"></i> Konfigurasi Analisis Butir Soal
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Pilih Mata Pelajaran</label>
                        <select id="an-mapel" class="w-full px-3 py-2 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                            ${mapelOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Pilih Rombel / Kelas</label>
                        <select id="an-kelas" class="w-full px-3 py-2 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                            ${kelasOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Kunci Jawaban (Contoh: ABCDAABCDA)</label>
                        <input type="text" id="an-key" value="ABCDAABCDA" placeholder="ABCDAABCDA" class="w-full px-3 py-2 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none uppercase tracking-widest focus:border-forest-500">
                    </div>
                </div>

                <div class="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-750">
                    <span class="text-[10px] text-slate-400 font-medium">Lakukan pengisian manual atau klik "Simulasi Pengisian" untuk menguji analisis.</span>
                    <div class="flex gap-2">
                        <button id="btn-simulasi" class="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs flex items-center gap-1">
                            <i class="ph ph-magic-wand"></i> Simulasi Pengisian
                        </button>
                        <button id="btn-hitung" class="px-5 py-2 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-md">
                            <i class="ph ph-calculator"></i> Hitung Analisis
                        </button>
                    </div>
                </div>
            </div>

            <!-- Main Work Area -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left 2 Cols: Student Answers Input -->
                <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4">
                    <h4 class="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                        <span>Respon Jawaban Siswa</span>
                        <span id="student-count-badge" class="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold text-[9px]">0 Siswa</span>
                    </h4>
                    
                    <div class="overflow-y-auto max-h-[420px] pr-2 space-y-2.5" id="students-input-list">
                        <!-- Student input rows will be rendered dynamically -->
                    </div>
                </div>

                <!-- Right 1 Col: Interpretation Guide -->
                <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4 h-fit">
                    <h4 class="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-750 pb-2">Panduan Interpretasi Psikometrik</h4>
                    <div class="space-y-3.5 text-[10px]">
                        <div>
                            <span class="font-bold text-slate-750 dark:text-slate-300 block mb-0.5">1. TINGKAT KESUKARAN (P)</span>
                            <p class="text-slate-400 leading-normal mb-1.5">Rasio jawaban benar per butir soal.</p>
                            <ul class="space-y-1 pl-3 list-disc text-slate-500 dark:text-slate-400">
                                <li><strong class="text-emerald-600">Mudah</strong> : P &gt; 0.70</li>
                                <li><strong class="text-blue-600">Sedang</strong> : 0.30 &le; P &le; 0.70</li>
                                <li><strong class="text-rose-600">Sukar</strong> : P &lt; 0.30</li>
                            </ul>
                        </div>
                        <div>
                            <span class="font-bold text-slate-750 dark:text-slate-300 block mb-0.5">2. DAYA PEMBEDA (D)</span>
                            <p class="text-slate-400 leading-normal mb-1.5">Selisih proporsi benar kelompok atas (Top 50%) vs kelompok bawah (Bottom 50%).</p>
                            <ul class="space-y-1 pl-3 list-disc text-slate-500 dark:text-slate-400">
                                <li><strong class="text-emerald-600">Sangat Baik</strong> : D &ge; 0.40</li>
                                <li><strong class="text-emerald-500">Baik</strong> : 0.30 &le; D &lt; 0.40</li>
                                <li><strong class="text-amber-500">Cukup</strong> : 0.20 &le; D &lt; 0.30</li>
                                <li><strong class="text-rose-500">Jelek</strong> : D &lt; 0.20</li>
                            </ul>
                        </div>
                        <div>
                            <span class="font-bold text-slate-750 dark:text-slate-300 block mb-0.5">3. REKOMENDASI BUTIR</span>
                            <ul class="space-y-1 pl-3 list-disc text-slate-500 dark:text-slate-400">
                                <li><strong>Diterima</strong> : Daya Pembeda &ge; 0.30</li>
                                <li><strong>Direvisi</strong> : Daya Pembeda 0.20 - 0.29</li>
                                <li><strong>Dibuang</strong> : Daya Pembeda &lt; 0.20</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Calculation Output Area -->
            <div id="analysis-results-section" class="hidden space-y-6">
                <!-- Statistics Summary & KR-20 -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- KR-20 Card -->
                    <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div>
                            <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Reliabilitas Tes (KR-20)</h4>
                            <div class="flex items-baseline gap-2 mt-1">
                                <span class="text-3xl font-black text-slate-800 dark:text-slate-100" id="stat-kr20">0.00</span>
                                <span class="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10" id="stat-kr20-badge">Reliabel</span>
                            </div>
                        </div>
                        <p class="text-[9px] text-slate-400 leading-normal mt-3">Koefisien &ge; 0.70 menunjukkan tes memiliki reliabilitas konsistensi internal yang tinggi.</p>
                    </div>

                    <!-- Statistics Card -->
                    <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-3">
                        <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statistik Deskriptif</h4>
                        <div class="grid grid-cols-2 gap-4 text-xs font-semibold">
                            <div class="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl">
                                <span class="text-[9px] text-slate-400 block mb-0.5">RATA-RATA SKOR</span>
                                <span class="text-slate-850 dark:text-slate-100 font-extrabold" id="stat-mean">0.00</span>
                            </div>
                            <div class="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl">
                                <span class="text-[9px] text-slate-400 block mb-0.5">VARIANSI SKOR</span>
                                <span class="text-slate-850 dark:text-slate-100 font-extrabold" id="stat-variance">0.00</span>
                            </div>
                        </div>
                    </div>

                    <!-- Recommendation Card -->
                    <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-3">
                        <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status Butir Soal</h4>
                        <div class="flex items-center gap-3 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            <span class="flex items-center gap-1"><i class="ph ph-check-circle text-emerald-600"></i> Diterima: <strong id="stat-accept-count">0</strong></span>
                            <span class="flex items-center gap-1"><i class="ph ph-warning text-amber-600"></i> Direvisi: <strong id="stat-revise-count">0</strong></span>
                            <span class="flex items-center gap-1"><i class="ph ph-x-circle text-rose-600"></i> Dibuang: <strong id="stat-reject-count">0</strong></span>
                        </div>
                        <button id="btn-print-analisis" class="w-full bg-forest-750 hover:bg-forest-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-printer"></i> Cetak Laporan Analisis
                        </button>
                    </div>
                </div>

                <!-- Analysis Details Table -->
                <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-100 dark:border-slate-800 uppercase font-black text-slate-800 dark:text-slate-200 text-xs tracking-wider">
                        Rincian Parameter Butir Soal
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <th class="px-6 py-3 text-center w-16">No Soal</th>
                                    <th class="px-6 py-3 text-center w-20">Kunci</th>
                                    <th class="px-6 py-3 text-center w-28">Jumlah Benar</th>
                                    <th class="px-6 py-3 text-center w-36">Tingkat Kesukaran (P)</th>
                                    <th class="px-6 py-3 text-center w-36">Daya Pembeda (D)</th>
                                    <th class="px-6 py-3 text-center w-36">Rekomendasi</th>
                                </tr>
                            </thead>
                            <tbody id="analysis-table-body">
                                <!-- Computed rows rendered dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 2. Load Active Classroom Students list
    let activeStudents = [];
    
    const updateStudentsList = () => {
        const kelas = document.getElementById('an-kelas').value;
        activeStudents = siswa.filter(s => s.kelas === kelas);

        document.getElementById('student-count-badge').innerText = `${activeStudents.length} Siswa`;

        const container = document.getElementById('students-input-list');
        if (activeStudents.length === 0) {
            container.innerHTML = `<p class="text-xs text-slate-500 text-center py-8 font-medium">Tidak ada data siswa terdaftar di kelas ${kelas}.</p>`;
            return;
        }

        container.innerHTML = activeStudents.map((s, idx) => `
            <div class="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-850 rounded-2xl gap-4">
                <div class="text-left flex-grow">
                    <span class="text-[10px] font-bold text-forest-700 dark:text-forest-400 bg-forest-600/10 px-2 py-0.5 rounded mr-1">${idx + 1}</span>
                    <strong class="text-xs text-slate-800 dark:text-slate-200">${s.nama}</strong>
                    <span class="text-[9px] text-slate-400 block mt-0.5">NISN: ${s.nisn || '-'}</span>
                </div>
                <div class="w-48">
                    <input type="text" id="ans-${s.id}" placeholder="Respon Jawaban" class="w-full px-3 py-1.5 border border-slate-250 dark:border-slate-750 dark:bg-slate-900 rounded-xl text-xs outline-none text-right uppercase tracking-widest font-mono font-bold focus:border-forest-500 student-ans-input">
                </div>
            </div>
        `).join('');
    };

    document.getElementById('an-kelas').addEventListener('change', updateStudentsList);
    updateStudentsList();

    // 3. Simulation Data Generator
    document.getElementById('btn-simulasi').addEventListener('click', () => {
        const key = document.getElementById('an-key').value.trim().toUpperCase();
        if (!key) {
            showToast("Masukkan kunci jawaban terlebih dahulu!", "error");
            return;
        }

        activeStudents.forEach(s => {
            const el = document.getElementById(`ans-${s.id}`);
            if (el) {
                // Generate a simulated response that is 60%-95% similar to the key
                let ans = '';
                for (let i = 0; i < key.length; i++) {
                    if (Math.random() < 0.75) {
                        ans += key[i]; // Correct
                    } else {
                        // Incorrect choice (A, B, C, or D differing from correct key)
                        const choices = ['A', 'B', 'C', 'D'].filter(c => c !== key[i]);
                        ans += choices[Math.floor(Math.random() * choices.length)];
                    }
                }
                el.value = ans;
            }
        });
        showToast("Data simulasi diisi dengan representasi realistis!");
    });

    // 4. Calculations & Calculations Engine
    let lastAnalysisReport = null;

    document.getElementById('btn-hitung').addEventListener('click', () => {
        const key = document.getElementById('an-key').value.trim().toUpperCase();
        if (!key) {
            showToast("Kunci jawaban wajib diisi!", "error");
            return;
        }

        // Gather student scores
        let valid = true;
        const studentsResponses = activeStudents.map(s => {
            const el = document.getElementById(`ans-${s.id}`);
            const val = el ? el.value.trim().toUpperCase() : '';
            if (val.length !== key.length) {
                valid = false;
            }
            return {
                id: s.id,
                nama: s.nama,
                nisn: s.nisn,
                response: val
            };
        });

        if (!valid) {
            showToast(`Pastikan panjang respon seluruh siswa tepat ${key.length} karakter sesuai kunci!`, "error");
            return;
        }

        const K = key.length; // Number of questions
        const N = studentsResponses.length; // Total students

        if (N < 2) {
            showToast("Minimal butuh data 2 siswa untuk kalkulasi psikometri!", "error");
            return;
        }

        // Calculate score per student
        studentsResponses.forEach(student => {
            let correctCount = 0;
            const detailScores = [];
            for (let i = 0; i < K; i++) {
                const isCorrect = student.response[i] === key[i] ? 1 : 0;
                correctCount += isCorrect;
                detailScores.push(isCorrect);
            }
            student.totalScore = correctCount;
            student.scores = detailScores; // binary array [1, 0, 1...]
        });

        // 1. STATS: Mean & Variance of Total Scores
        const totalSum = studentsResponses.reduce((sum, s) => sum + s.totalScore, 0);
        const mean = totalSum / N;
        const sumSquareDiff = studentsResponses.reduce((sum, s) => sum + Math.pow(s.totalScore - mean, 2), 0);
        const variance = sumSquareDiff / (N - 1); // Sample variance

        // 2. Split Groups for Daya Pembeda (D)
        // Sort students descending by score
        const sortedStudents = [...studentsResponses].sort((a,b) => b.totalScore - a.totalScore);
        const splitSize = Math.ceil(N / 2);
        const groupAtas = sortedStudents.slice(0, splitSize);
        const groupBawah = sortedStudents.slice(splitSize);

        const Na = groupAtas.length;
        const Nb = groupBawah.length;

        // 3. Calculate Parameters per Question Item
        const itemAnalysis = [];
        let sumPq = 0;

        let acceptCount = 0;
        let reviseCount = 0;
        let rejectCount = 0;

        for (let i = 0; i < K; i++) {
            // Count total correct for item i
            const correctTotal = studentsResponses.filter(s => s.scores[i] === 1).length;
            const p = correctTotal / N; // Difficulty Index
            const q = 1 - p;
            sumPq += (p * q);

            // Count correct in group atas & group bawah
            const Ba = groupAtas.filter(s => s.scores[i] === 1).length;
            const Bb = groupBawah.filter(s => s.scores[i] === 1).length;

            const d = (Ba / Na) - (Bb / Nb); // Discrimination Index

            // Classifications
            let difficultyLabel = 'Sedang';
            let difficultyColor = 'text-blue-600 bg-blue-500/10 border-blue-500/20';
            if (p > 0.70) {
                difficultyLabel = 'Mudah';
                difficultyColor = 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
            } else if (p < 0.30) {
                difficultyLabel = 'Sukar';
                difficultyColor = 'text-rose-600 bg-rose-500/10 border-rose-500/20';
            }

            let descriminantLabel = 'Jelek';
            let descriminantColor = 'text-rose-600 bg-rose-500/10 border-rose-500/20';
            if (d >= 0.40) {
                descriminantLabel = 'Sangat Baik';
                descriminantColor = 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
            } else if (d >= 0.30) {
                descriminantLabel = 'Baik';
                descriminantColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            } else if (d >= 0.20) {
                descriminantLabel = 'Cukup';
                descriminantColor = 'text-amber-600 bg-amber-500/10 border-amber-500/20';
            }

            // Recommendation Status
            let recommendation = 'Dibuang';
            let recColor = 'bg-rose-500/10 text-rose-600';
            if (d >= 0.30) {
                recommendation = 'Diterima';
                recColor = 'bg-emerald-500/10 text-emerald-600';
                acceptCount++;
            } else if (d >= 0.20) {
                recommendation = 'Direvisi';
                recColor = 'bg-amber-500/10 text-amber-600';
                reviseCount++;
            } else {
                rejectCount++;
            }

            itemAnalysis.push({
                itemNo: i + 1,
                correctCount,
                p: p.toFixed(2),
                difficultyLabel,
                difficultyColor,
                d: d.toFixed(2),
                descriminantLabel,
                descriminantColor,
                recommendation,
                recColor
            });
        }

        // 4. KR-20 Reliability Coefficient
        let kr20 = 0;
        if (variance > 0 && K > 1) {
            kr20 = (K / (K - 1)) * (1 - (sumPq / variance));
        }
        if (kr20 < 0) kr20 = 0; // Boundary

        // Update UI Summary Panel
        document.getElementById('stat-kr20').innerText = kr20.toFixed(3);
        const krBadge = document.getElementById('stat-kr20-badge');
        if (kr20 >= 0.70) {
            krBadge.innerText = 'RELIABEL';
            krBadge.className = 'text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10';
        } else {
            krBadge.innerText = 'TIDAK RELIABEL';
            krBadge.className = 'text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-rose-600 bg-rose-500/10';
        }

        document.getElementById('stat-mean').innerText = mean.toFixed(2);
        document.getElementById('stat-variance').innerText = variance.toFixed(2);
        document.getElementById('stat-accept-count').innerText = acceptCount;
        document.getElementById('stat-revise-count').innerText = reviseCount;
        document.getElementById('stat-reject-count').innerText = rejectCount;

        // Render rows
        const tbody = document.getElementById('analysis-table-body');
        tbody.innerHTML = itemAnalysis.map(row => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <td class="px-6 py-3.5 text-xs text-slate-500 text-center font-bold">${row.itemNo}</td>
                <td class="px-6 py-3.5 text-xs font-bold text-center text-slate-800 dark:text-slate-200">${key[row.itemNo - 1]}</td>
                <td class="px-6 py-3.5 text-xs text-center text-slate-650 dark:text-slate-400 font-bold">${row.correctCount} Siswa</td>
                <td class="px-6 py-3.5 text-xs text-center font-bold">
                    <div class="flex flex-col items-center gap-0.5">
                        <span class="text-slate-850 dark:text-slate-150">${row.p}</span>
                        <span class="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase border ${row.difficultyColor}">${row.difficultyLabel}</span>
                    </div>
                </td>
                <td class="px-6 py-3.5 text-xs text-center font-bold">
                    <div class="flex flex-col items-center gap-0.5">
                        <span class="text-slate-850 dark:text-slate-150">${row.d}</span>
                        <span class="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase border ${row.descriminantColor}">${row.descriminantLabel}</span>
                    </div>
                </td>
                <td class="px-6 py-3.5 text-xs text-center font-bold">
                    <span class="px-2 py-1 rounded-full text-[9px] font-bold uppercase ${row.recColor}">${row.recommendation}</span>
                </td>
            </tr>
        `).join('');

        // Store Report for Print
        lastAnalysisReport = {
            mapel: document.getElementById('an-mapel').value,
            kelas: document.getElementById('an-kelas').value,
            kr20: kr20.toFixed(3),
            isReliable: kr20 >= 0.70 ? 'RELIABEL' : 'TIDAK RELIABEL',
            mean: mean.toFixed(2),
            variance: variance.toFixed(2),
            items: itemAnalysis,
            key
        };

        document.getElementById('analysis-results-section').classList.remove('hidden');
        showToast("Psikometrik analisis butir soal & KR-20 berhasil dikalkulasi!");
    });

    // 5. Print Laporan Analisis
    document.getElementById('btn-print-analisis').addEventListener('click', () => {
        if (!lastAnalysisReport) return;

        const w = window.open('', '_blank');
        w.document.write(`
            <html>
            <head>
                <title>Laporan Analisis Butir Soal - ${lastAnalysisReport.mapel}</title>
                <style>
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        padding: 30px 40px;
                        font-size: 11px;
                        line-height: 1.4;
                        color: #000;
                    }
                    .kop-surat {
                        display: flex;
                        align-items: center;
                        border-bottom: 3px double #000;
                        padding-bottom: 8px;
                        margin-bottom: 15px;
                    }
                    .kop-logo {
                        width: 60px;
                        height: 60px;
                        margin-right: 15px;
                    }
                    .kop-text {
                        flex-grow: 1;
                        text-align: center;
                    }
                    .doc-title {
                        text-align: center;
                        font-size: 13px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin-bottom: 2px;
                    }
                    .stat-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                    }
                    .stat-table td {
                        padding: 4px;
                        border: 1px solid #ddd;
                    }
                    .table-data {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    .table-data th, .table-data td {
                        border: 1px solid #000;
                        padding: 5px;
                        text-align: center;
                    }
                    .table-data th {
                        background: #eee;
                        font-weight: bold;
                    }
                    .no-print {
                        background: #1e293b;
                        padding: 8px;
                        text-align: center;
                        margin-bottom: 15px;
                        border-radius: 4px;
                    }
                    .btn-act {
                        background: #10b981;
                        color: white;
                        border: none;
                        padding: 5px 12px;
                        font-size: 11px;
                        font-weight: bold;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    .signatures {
                        margin-top: 30px;
                        display: flex;
                        justify-content: space-between;
                    }
                    .sig-box {
                        text-align: center;
                        width: 200px;
                    }
                    @media print {
                        .no-print { display: none !important; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print">
                    <button class="btn-act" onclick="window.print()">Cetak Laporan</button>
                    <button class="btn-act" style="background:#ef4444;" onclick="window.close()">Tutup</button>
                </div>

                <div class="kop-surat">
                    <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="kop-logo">
                    <div class="kop-text">
                        <span style="font-size:11px; font-weight:bold; text-transform:uppercase;">Yayasan Idrisiyyah Tasikmalaya</span><br>
                        <span style="font-size:14px; font-weight:bold; text-transform:uppercase;">Madrasah Tsanawiyah (MTs) Idrisiyyah</span><br>
                        <span style="font-size:8px; font-style:italic;">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855</span>
                    </div>
                </div>

                <h3 class="doc-title">LAPORAN HASIL ANALISIS BUTIR SOAL & REKOMENDASI</h3>
                <p style="text-align:center; font-size:10px; margin-top:-5px; margin-bottom: 15px;">Mata Pelajaran: <strong>${lastAnalysisReport.mapel}</strong> | Rombel: <strong>${lastAnalysisReport.kelas}</strong></p>

                <!-- Stats summary -->
                <table class="stat-table">
                    <tr style="background:#fafafa; font-weight:bold;">
                        <td style="width:25%">Koefisien Reliabilitas (KR-20)</td>
                        <td style="width:25%; font-size: 12px; color:#166534;">${lastAnalysisReport.kr20} (${lastAnalysisReport.isReliable})</td>
                        <td style="width:25%">Rata-rata Skor Tes</td>
                        <td style="width:25%">${lastAnalysisReport.mean}</td>
                    </tr>
                    <tr style="background:#fafafa; font-weight:bold;">
                        <td>Variansi Skor Siswa</td>
                        <td>${lastAnalysisReport.variance}</td>
                        <td>Kunci Jawaban Referensi</td>
                        <td style="font-family:monospace; font-size:12px; tracking-wide:1px;">${lastAnalysisReport.key}</td>
                    </tr>
                </table>

                <table class="table-data">
                    <thead>
                        <tr>
                            <th style="width:10%">No Soal</th>
                            <th style="width:10%">Kunci</th>
                            <th style="width:25%">Indeks Kesukaran (P)</th>
                            <th style="width:25%">Daya Pembeda (D)</th>
                            <th style="width:30%">Status Rekomendasi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lastAnalysisReport.items.map(row => `
                            <tr>
                                <td style="font-weight:bold;">${row.itemNo}</td>
                                <td style="font-weight:bold; font-size:12px;">${lastAnalysisReport.key[row.itemNo - 1]}</td>
                                <td>${row.p} (${row.difficultyLabel})</td>
                                <td>${row.d} (${row.descriminantLabel})</td>
                                <td style="font-weight:bold; text-transform:uppercase;">${row.recommendation}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <!-- Signatures -->
                <div class="signatures">
                    <div class="sig-box">
                        <p>Mengetahui,</p>
                        <p>Kepala Madrasah</p>
                        <div style="height: 50px;"></div>
                        <p><strong>${settings.kepala || 'H. Ahmad Fauzian, M.Pd.'}</strong></p>
                        <p style="border-top:1px solid #000; font-size:9px; padding-top:2px;">NIP. ${settings.nipKepala || '-'}</p>
                    </div>
                    <div class="sig-box">
                        <p>Tasikmalaya, ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p>Guru Evaluator</p>
                        <div style="height: 50px;"></div>
                        <p><strong>${userProfile.nama}</strong></p>
                        <p style="border-top:1px solid #000; font-size:9px; padding-top:2px;">NIP. ${userProfile.nip || '-'}</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        w.document.close();
    });
}
