// ============================================
// TRADISI — Penugasan Mengajar Guru Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, openModal, closeModal, showConfirmDialog } = ctx;

    // Load data
    const assignments = await dbService.getData('teacher_assignments') || [];
    const teachers = await dbService.getData('teachers') || [];
    const subjects = await dbService.getData('subjects') || [];
    const classrooms = await dbService.getData('classrooms') || [];
    const settings = await dbService.getData('madrasah_settings') || {};

    const activeTP = settings.tahunAjaran || "2026/2027";
    const activeSemester = settings.semester || "Ganjil";

    // Helper to calculate total JP assigned to a teacher
    const getTeacherTotalJp = function(guruId) {
        return assignments
            .filter(a => a.guruId === guruId && a.tahunPelajaran === activeTP && a.semester === activeSemester)
            .reduce((sum, a) => sum + Number(a.jumlahJam || 0), 0);
    };

    window.renderAssignmentsTable = function() {
        const tbody = document.getElementById('assignments-table-body');
        if (!tbody) return;

        if (assignments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-xs text-slate-500">Tidak ada data penugasan mengajar ditemukan.</td></tr>`;
            return;
        }

        // Filter assignments by active TP/Semester
        const activeAssignments = assignments.filter(a => a.tahunPelajaran === activeTP && a.semester === activeSemester);

        tbody.innerHTML = activeAssignments.map((a, idx) => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <td class="px-6 py-3.5 text-xs text-slate-500 text-center">${idx + 1}</td>
                <td class="px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">${a.guruNama}</td>
                <td class="px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">${a.mapelNama}</td>
                <td class="px-6 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-350 text-center">${a.kelasNama}</td>
                <td class="px-6 py-3.5 text-xs text-slate-650 dark:text-slate-400 text-center font-bold">${a.jumlahJam} JP</td>
                <td class="px-6 py-3.5 text-xs flex gap-2 no-print justify-center">
                    <button onclick="editAssignmentModal('${a.id}')" class="p-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg transition-colors" title="Ubah Beban"><i class="ph ph-pencil-simple text-base"></i></button>
                    <button onclick="deleteAssignment('${a.id}')" class="p-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors" title="Hapus Tugas"><i class="ph ph-trash text-base"></i></button>
                </td>
            </tr>
        `).join('');
    };

    window.renderTeachersLoad = function() {
        const loadList = document.getElementById('teachers-load-list');
        if (!loadList) return;

        if (teachers.length === 0) {
            loadList.innerHTML = `<p class="text-xs text-slate-500 text-center py-6">Belum ada data guru terdaftar.</p>`;
            return;
        }

        loadList.innerHTML = teachers.map(t => {
            const jp = getTeacherTotalJp(t.id);
            const limit = 24; // Kurikulum Merdeka Target JP
            const pct = Math.min(100, Math.round((jp / limit) * 100));
            
            // Determine visual warning colors
            let barColor = 'bg-forest-600';
            let textColor = 'text-forest-700 dark:text-forest-400 bg-forest-100 dark:bg-forest-900/30';
            let statusText = 'Normal';

            if (jp > 24) {
                barColor = 'bg-rose-600';
                textColor = 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30';
                statusText = 'Overload (>24 JP)';
            } else if (jp === 24) {
                barColor = 'bg-emerald-600';
                textColor = 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
                statusText = 'Ideal (24 JP)';
            } else if (jp > 0 && jp < 24) {
                barColor = 'bg-blue-650';
                textColor = 'text-blue-750 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
                statusText = 'Underload (<24 JP)';
            } else {
                barColor = 'bg-slate-300 dark:bg-slate-700';
                textColor = 'text-slate-500 bg-slate-100 dark:bg-slate-900';
                statusText = 'Belum Mengajar';
            }

            return `
                <div class="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850/60 space-y-2.5">
                    <div class="flex items-start justify-between gap-2">
                        <div class="text-left">
                            <h4 class="text-xs font-extrabold text-slate-850 dark:text-slate-150">${t.nama}</h4>
                            <p class="text-[9px] text-slate-400">NIP: ${t.nip || '-'}</p>
                        </div>
                        <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${textColor}">${statusText}</span>
                    </div>
                    <div class="space-y-1">
                        <div class="flex justify-between text-[10px] text-slate-500 font-bold">
                            <span>Beban Jam Pelajaran</span>
                            <span>${jp} / ${limit} JP</span>
                        </div>
                        <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div class="h-full rounded-full ${barColor} transition-all duration-500" style="width: ${pct}%"></div>
                        </div>
                    </div>
                    ${jp > 0 ? `
                        <div class="pt-1.5 flex justify-end no-print">
                            <button onclick="printSkPenugasan('${t.id}')" class="px-2.5 py-1 bg-forest-750 hover:bg-forest-800 text-white rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-sm transition-all active:scale-98">
                                <i class="ph ph-printer"></i> Cetak SK Penugasan
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    };

    contentArea.innerHTML = `
        <div class="fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Assignment List & Management (Left) -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Action bar -->
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
                    <div>
                        <h3 class="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider">Distribusi Tugas Mengajar</h3>
                        <p class="text-[10px] text-slate-400 mt-0.5">Tahun Pelajaran: <span class="font-bold text-forest-700">${activeTP}</span> | Semester: <span class="font-bold text-forest-700">${activeSemester}</span></p>
                    </div>
                    <button onclick="addAssignmentModal()" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                        <i class="ph ph-plus-circle text-base"></i> Tambah Penugasan
                    </button>
                </div>

                <!-- Main table -->
                <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-100 dark:border-slate-800 uppercase font-black text-slate-800 dark:text-slate-200 text-xs tracking-wider">
                        Daftar Pembagian Jam Pelajaran Guru
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <th class="px-6 py-3 w-12 text-center">No</th>
                                    <th class="px-6 py-3">Nama Guru</th>
                                    <th class="px-6 py-3">Mata Pelajaran</th>
                                    <th class="px-6 py-3 w-28 text-center">Kelas</th>
                                    <th class="px-6 py-3 w-28 text-center">Beban JP</th>
                                    <th class="px-6 py-3 w-28 no-print text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="assignments-table-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Teachers Load / Warnings (Right) -->
            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4 h-fit">
                <h3 class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <i class="ph ph-chart-bar-horizontal text-forest-650 text-base"></i> Beban Kerja Pendidik
                </h3>
                
                <div id="teachers-load-list" class="space-y-3.5 max-h-[500px] overflow-y-auto pr-1"></div>
            </div>
        </div>
    `;

    // Modal forms dropdown values
    const teachersOptions = teachers.map(t => `<option value="${t.id}">${t.nama}</option>`).join('');
    const subjectsOptions = subjects.map(s => `<option value="${s.id}">${s.nama} (${s.tingkat})</option>`).join('');
    const classroomsOptions = classrooms.map(c => `<option value="${c.nama}">${c.nama}</option>`).join('');

    window.addAssignmentModal = function() {
        const formBody = `
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Pilih Pendidik / Guru</label>
                    <select id="asg-guru" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                        <option value="">-- Pilih Guru --</option>
                        ${teachersOptions}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Mata Pelajaran</label>
                    <select id="asg-mapel" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                        <option value="">-- Pilih Mapel --</option>
                        ${subjectsOptions}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Pilih Kelas</label>
                        <select id="asg-kelas" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="">-- Pilih Kelas --</option>
                            ${classroomsOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Beban Jam Pelajaran (JP)</label>
                        <input type="number" id="asg-jp" min="1" max="12" value="2" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                </div>
                <div id="jp-limit-warning" class="hidden p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-[10px] text-rose-600 font-bold leading-normal"></div>
            </div>
        `;

        openModal("Tambah Penugasan Mengajar", formBody, "Tambah", async () => {
            const guruId = document.getElementById('asg-guru').value;
            const mapelId = document.getElementById('asg-mapel').value;
            const kelasVal = document.getElementById('asg-kelas').value;
            const jpVal = parseInt(document.getElementById('asg-jp').value, 10) || 2;

            if (!guruId || !mapelId || !kelasVal) {
                showToast("Semua isian formulir wajib diisi!", "error");
                return;
            }

            const guru = teachers.find(t => t.id === guruId);
            const mapel = subjects.find(s => s.id === mapelId);

            // Check if duplicate assignment exists
            if (assignments.some(a => a.guruId === guruId && a.mapelId === mapelId && a.kelasNama === kelasVal && a.tahunPelajaran === activeTP && a.semester === activeSemester)) {
                showToast(`Guru ${guru.nama} sudah ditugaskan mengajar ${mapel.nama} di kelas ${kelasVal}!`, "error");
                return;
            }

            // Regulation Warning Limit (Kurikulum Merdeka 24 JP / Nasional 40 JP)
            const currentJp = getTeacherTotalJp(guruId);
            if (currentJp + jpVal > 40) {
                showToast("Peringatan: Total beban JP melebihi 40 JP (batas maksimal Kurikulum Nasional)!", "warning");
            } else if (currentJp + jpVal > 24) {
                showToast("Beban guru ini melebihi 24 JP (target Kurikulum Merdeka).", "warning");
            }

            const newAsg = {
                id: 'ta_' + Date.now(),
                tahunPelajaran: activeTP,
                semester: activeSemester,
                guruId,
                guruNama: guru ? guru.nama : "",
                mapelId,
                mapelNama: mapel ? mapel.nama : "",
                kelasNama: kelasVal,
                jumlahJam: jpVal,
                status: 'aktif'
            };

            assignments.push(newAsg);
            await dbService.saveData('teacher_assignments', assignments);
            closeModal();
            // Re-render
            window.loadPage('Penugasan Guru');
            showToast("Penugasan mengajar guru berhasil ditambahkan!");
        });
    };

    window.editAssignmentModal = function(id) {
        const a = assignments.find(item => item.id === id);
        if (!a) return;

        const formBody = `
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Pendidik</label>
                    <input type="text" value="${a.guruNama}" disabled class="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Mata Pelajaran & Kelas</label>
                    <input type="text" value="${a.mapelNama} — Kelas ${a.kelasNama}" disabled class="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Ubah Beban Jam Pelajaran (JP)</label>
                    <input type="number" id="asg-jp" min="1" max="12" value="${a.jumlahJam}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                </div>
            </div>
        `;

        openModal("Ubah Beban Mengajar", formBody, "Perbarui", async () => {
            const jpVal = parseInt(document.getElementById('asg-jp').value, 10) || 2;
            const index = assignments.findIndex(item => item.id === id);
            if (index !== -1) {
                assignments[index].jumlahJam = jpVal;
                await dbService.saveData('teacher_assignments', assignments);
            }
            closeModal();
            window.loadPage('Penugasan Guru');
            showToast("Beban jam pelajaran diperbarui!");
        });
    };

    window.deleteAssignment = function(id) {
        const a = assignments.find(item => item.id === id);
        showConfirmDialog("Hapus Penugasan", `Hapus penugasan mengajar <strong>${a ? a.mapelNama : ''}</strong> untuk Guru <strong>${a ? a.guruNama : ''}</strong> di kelas ${a ? a.kelasNama : ''}?`, () => {
            const index = assignments.findIndex(item => item.id === id);
            if (index !== -1) {
                assignments.splice(index, 1);
                dbService.softDeleteItem('teacher_assignments', id).then(() => {
                    window.loadPage('Penugasan Guru');
                    showToast("Penugasan mengajar dihapus.");
                });
            }
        });
    };

    // Print Surat Keputusan (SK) Penugasan Mengajar
    window.printSkPenugasan = function(guruId) {
        const t = teachers.find(item => item.id === guruId);
        if (!t) return;

        // Filter assignments for this teacher
        const tAssignments = assignments.filter(a => a.guruId === guruId && a.tahunPelajaran === activeTP && a.semester === activeSemester);
        const totalJp = tAssignments.reduce((sum, a) => sum + Number(a.jumlahJam || 0), 0);

        let rowsHtml = tAssignments.map((a, i) => `
            <tr style="border: 1px solid #333;">
                <td style="padding: 6px; text-align: center; border: 1px solid #333; font-size: 11px;">${i + 1}</td>
                <td style="padding: 6px; border: 1px solid #333; font-size: 11px;">${a.mapelNama}</td>
                <td style="padding: 6px; text-align: center; border: 1px solid #333; font-size: 11px;">${a.kelasNama}</td>
                <td style="padding: 6px; text-align: center; border: 1px solid #333; font-weight: bold; font-size: 11px;">${a.jumlahJam} JP</td>
                <td style="padding: 6px; border: 1px solid #333; font-size: 11px;">Aktif mengajar</td>
            </tr>
        `).join('');

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Cetak SK Penugasan - ${t.nama}</title>
                <style>
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        padding: 30px 40px;
                        color: #000;
                        line-height: 1.4;
                    }
                    .kop-surat {
                        text-align: center;
                        border-bottom: 3px double #000;
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                    }
                    .kop-kementerian {
                        font-size: 14px;
                        font-weight: bold;
                        margin: 0;
                        text-transform: uppercase;
                    }
                    .kop-madrasah {
                        font-size: 18px;
                        font-weight: 900;
                        margin: 4px 0;
                        text-transform: uppercase;
                    }
                    .kop-alamat {
                        font-size: 10px;
                        font-style: italic;
                        margin: 0;
                        color: #444;
                    }
                    .sk-title {
                        text-align: center;
                        font-weight: bold;
                        text-decoration: underline;
                        font-size: 14px;
                        margin-top: 25px;
                        margin-bottom: 2px;
                        text-transform: uppercase;
                    }
                    .sk-nomor {
                        text-align: center;
                        font-size: 12px;
                        margin-bottom: 25px;
                    }
                    .section-table {
                        width: 100%;
                        margin-top: 15px;
                        margin-bottom: 15px;
                        border-collapse: collapse;
                    }
                    .section-table td {
                        padding: 3px 5px;
                        vertical-align: top;
                        font-size: 12px;
                    }
                    .table-data {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                    }
                    .table-data th {
                        border: 1px solid #000;
                        background: #eee;
                        padding: 8px;
                        font-size: 11px;
                        text-transform: uppercase;
                    }
                    .footer-area {
                        margin-top: 40px;
                        float: right;
                        text-align: center;
                        width: 250px;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <!-- Kop Surat Dinas -->
                <div class="kop-surat">
                    <p class="kop-kementerian">YAYASAN IDRISIYYAH TASIKMALAYA</p>
                    <h2 class="kop-madrasah">MADRASAH TSANAWIYAH (MTs) IDRISIYYAH</h2>
                    <p class="kop-alamat">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855 | Telp: (0265) 323456</p>
                </div>

                <!-- SK Header -->
                <h3 class="sk-title">SURAT KEPUTUSAN KEPALA MTs IDRISIYYAH</h3>
                <p class="sk-nomor">Nomor: MTs.I/08/KP.00.7/142/${new Date().getFullYear()}</p>
                
                <h4 style="text-align: center; font-size: 12px; margin-bottom: 20px; text-transform: uppercase;">
                    TENTANG<br>
                    PEMBAGIAN TUGAS MENGAJAR GURU DALAM PROSES BELAJAR MENGAJAR<br>
                    SEMESTER ${activeSemester.toUpperCase()} TAHUN PELAJARAN ${activeTP}
                </h4>

                <p style="font-size: 12px;">Kepala Madrasah Tsanawiyah Idrisiyyah Tasikmalaya, menimbang dan seterusnya, MEMUTUSKAN:</p>

                <!-- Diktum Ketetapan -->
                <table class="section-table">
                    <tr>
                        <td style="width: 12%; font-weight: bold;">Menetapkan</td>
                        <td style="width: 2%;">:</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">PERTAMA</td>
                        <td>:</td>
                        <td>Menugaskan guru yang namanya tercantum dalam lampiran surat keputusan ini untuk melaksanakan tugas mengajar pada Semester ${activeSemester} Tahun Pelajaran ${activeTP}.</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">KEDUA</td>
                        <td>:</td>
                        <td>Beban kerja mengajar guru diatur secara terperinci pada tabel lampiran dengan total beban jam pelajaran terlampir.</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">KETIGA</td>
                        <td>:</td>
                        <td>Keputusan ini mulai berlaku sejak tanggal ditetapkan dengan ketentuan apabila terdapat kekeliruan akan diperbaiki sebagaimana mestinya.</td>
                    </tr>
                </table>

                <div style="border-top: 1px dashed #333; margin: 25px 0;"></div>

                <!-- Lampiran Details -->
                <h4 style="font-size: 12px; text-decoration: underline; margin-bottom: 5px;">LAMPIRAN SURAT KEPUTUSAN KEPALA MTs IDRISIYYAH</h4>
                <p style="font-size: 11px; color: #333; margin: 0 0 10px 0;">Nama Pendidik: <strong>${t.nama}</strong> | NIP: ${t.nip || '-'}</p>

                <table class="table-data">
                    <thead>
                        <tr>
                            <th style="width: 5%;">No</th>
                            <th style="text-align: left;">Mata Pelajaran</th>
                            <th style="width: 15%;">Kelas</th>
                            <th style="width: 20%;">Alokasi JP</th>
                            <th style="width: 25%; text-align: left;">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                        <tr style="border: 1px solid #333; font-weight: bold; background: #fafafa;">
                            <td colspan="3" style="padding: 8px; text-align: right; border: 1px solid #333; font-size: 11px;">TOTAL BEBAN MENGAJAR:</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #333; font-size: 11px; color: #1e3a8a;">${totalJp} JP</td>
                            <td style="padding: 8px; border: 1px solid #333; font-size: 11px;">Selesai</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Tanda Tangan -->
                <div class="footer-area">
                    <p>Ditetapkan di: Tasikmalaya</p>
                    <p>Pada Tanggal: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p style="margin-top: 10px; margin-bottom: 60px;">Kepala Madrasah,</p>
                    <p><strong>${settings.kepala || 'H. Ahmad Fauzian, M.Pd.'}</strong></p>
                    <p style="border-top: 1px solid #000; font-size: 10px; padding-top: 2px;">NIP. ${settings.nipKepala || '197804152006041003'}</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    renderAssignmentsTable();
    renderTeachersLoad();
}
