// ============================================
// TRADISI — Rapor Siswa Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, getUserProfile } = ctx;
    const userProfile = getUserProfile();

    // 1. Load Master & Core Data
    const classrooms = await dbService.getData('classrooms') || [];
    const homerooms = await dbService.getData('homerooms') || [];
    const subjects = await dbService.getData('subjects') || [];
    const students = await dbService.getData('siswa') || [];
    const penilaian = await dbService.getData('penilaian') || [];
    let reportCards = await dbService.getData('report_cards') || [];
    const settings = await dbService.getData('madrasah_settings') || {
        nama: "MTs Idrisiyyah Tasikmalaya",
        kepala: "H. Ahmad Fauzian, M.Pd.",
        nipKepala: "197804152006041003",
        tahunAjaran: "2026/2027",
        semester: "Ganjil"
    };

    const activeTP = settings.tahunAjaran || "2026/2027";
    const activeSemester = settings.semester || "Ganjil";

    const kelasOptions = classrooms.map(c => `<option value="${c.nama}">${c.nama}</option>`).join('');

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <!-- Header Filter Card -->
            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <h3 class="text-sm font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider">Modul Wali Kelas & Rapor</h3>
                        <p class="text-[10px] text-slate-400 mt-1">Kelola catatan perkembangan, data ekstrakurikuler, ketidakhadiran, serta cetak rapor siswa bimbingan.</p>
                    </div>
                    <div id="homeroom-info-badge" class="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Pilih Rombongan Belajar (Kelas)</label>
                        <select id="rap-kelas" class="w-full px-3 py-2 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                            ${kelasOptions}
                        </select>
                    </div>
                    <div class="md:col-span-2 text-right">
                        <span id="access-warning-badge" class="hidden text-[10px] px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20 rounded-xl"><i class="ph ph-warning mr-1"></i> Akses Terbatas: Hanya Wali Kelas & Admin yang dapat mengedit rapor kelas ini.</span>
                    </div>
                </div>
            </div>

            <!-- Student list Roster -->
            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="p-4 border-b border-slate-100 dark:border-slate-800 uppercase font-black text-slate-800 dark:text-slate-200 text-xs tracking-wider">
                    Daftar Siswa Kelas <span id="active-kelas-label" class="text-forest-700">-</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th class="px-6 py-3 w-12 text-center">No</th>
                                <th class="px-6 py-3 w-28">NISN</th>
                                <th class="px-6 py-3">Nama Lengkap</th>
                                <th class="px-6 py-3 text-center w-36">Kehadiran (S/I/A)</th>
                                <th class="px-6 py-3 text-center w-28">Ekskul</th>
                                <th class="px-6 py-3 text-center w-40">Catatan Wali Kelas</th>
                                <th class="px-6 py-3 w-40 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="students-rapor-tbody">
                            <!-- Student rows dynamically generated -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // 2. Access control and variables
    let isEditable = false;
    let selectedClass = classrooms[0] ? classrooms[0].nama : '';

    const checkEditAccess = (className) => {
        // Find homeroom record for the class
        const hr = homerooms.find(r => r.kelas === className && r.tahunPelajaran === activeTP && r.semester === activeSemester);
        const warningBadge = document.getElementById('access-warning-badge');
        const infoBadge = document.getElementById('homeroom-info-badge');

        const activeRole = userProfile.activeRole;
        const isAdmin = activeRole === 'super_admin' || activeRole === 'admin_madrasah';

        if (hr) {
            infoBadge.innerHTML = `<i class="ph ph-user-check"></i> Wali Kelas: ${hr.waliKelasNama}`;
            infoBadge.className = 'px-3.5 py-1.5 bg-forest-600/10 text-forest-700 dark:text-forest-400 rounded-xl text-xs font-bold';

            // Check if user is the homeroom teacher
            if (isAdmin || userProfile.nama === hr.waliKelasNama || userProfile.id === hr.waliKelasId) {
                isEditable = true;
                warningBadge.classList.add('hidden');
            } else {
                isEditable = false;
                warningBadge.classList.remove('hidden');
            }
        } else {
            infoBadge.innerHTML = `<i class="ph ph-warning-circle"></i> Wali Kelas Belum Diset`;
            infoBadge.className = 'px-3.5 py-1.5 bg-rose-500/10 text-rose-600 rounded-xl text-xs font-bold';
            isEditable = isAdmin;
            if (isEditable) {
                warningBadge.classList.add('hidden');
            } else {
                warningBadge.classList.remove('hidden');
            }
        }
    };

    const renderRaporTable = () => {
        selectedClass = document.getElementById('rap-kelas').value;
        document.getElementById('active-kelas-label').innerText = selectedClass;
        checkEditAccess(selectedClass);

        // Find students belonging to this class
        const activeRombel = homerooms.find(r => r.kelas === selectedClass && r.tahunPelajaran === activeTP && r.semester === activeSemester);
        let classStudents = [];
        if (activeRombel && Array.isArray(activeRombel.siswaIds)) {
            classStudents = students.filter(s => activeRombel.siswaIds.includes(s.id));
        } else {
            classStudents = students.filter(s => s.kelas === selectedClass);
        }

        const tbody = document.getElementById('students-rapor-tbody');
        if (classStudents.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-xs text-slate-500">Tidak ada siswa terdaftar di kelas ${selectedClass} untuk tahun pelajaran ini.</td></tr>`;
            return;
        }

        tbody.innerHTML = classStudents.map((s, idx) => {
            const rc = reportCards.find(r => r.siswaId === s.id && r.kelas === selectedClass && r.tahunPelajaran === activeTP && r.semester === activeSemester) || {
                kehadiran: { sakit: 0, izin: 0, alpa: 0 },
                ekskul: [],
                catatanWali: ''
            };

            const ekskulBadge = rc.ekskul.length > 0 
                ? `<span class="bg-forest-600/10 text-forest-700 font-bold text-[9px] px-2 py-0.5 rounded-full">${rc.ekskul.length} Ekskul</span>`
                : `<span class="text-slate-400 text-[9px]">-</span>`;

            return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors">
                    <td class="px-6 py-3.5 text-xs text-slate-500 text-center font-bold">${idx + 1}</td>
                    <td class="px-6 py-3.5 text-xs text-slate-650 dark:text-slate-400 font-bold">${s.nisn || '-'}</td>
                    <td class="px-6 py-3.5 text-xs font-bold text-slate-850 dark:text-slate-200">${s.nama}</td>
                    <td class="px-6 py-3.5 text-xs text-center font-bold text-slate-700 dark:text-slate-300">
                        S: <span class="text-blue-600">${rc.kehadiran.sakit}</span> | 
                        I: <span class="text-amber-600">${rc.kehadiran.izin}</span> | 
                        A: <span class="text-rose-600">${rc.kehadiran.alpa}</span>
                    </td>
                    <td class="px-6 py-3.5 text-xs text-center">${ekskulBadge}</td>
                    <td class="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-400 truncate max-w-[150px]" title="${rc.catatanWali || '-'}">${rc.catatanWali || '-'}</td>
                    <td class="px-6 py-3.5 text-xs flex justify-center gap-2">
                        ${isEditable ? `
                            <button onclick="window.manageReportCard('${s.id}')" class="px-2.5 py-1 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-lg text-[9px] flex items-center gap-1 shadow-sm"><i class="ph ph-note-pencil"></i> Kelola</button>
                        ` : `
                            <button disabled class="px-2.5 py-1 bg-slate-250 text-slate-400 rounded-lg text-[9px] cursor-not-allowed flex items-center gap-1"><i class="ph ph-lock"></i> Kelola</button>
                        `}
                        <button onclick="window.printReportCard('${s.id}')" class="px-2.5 py-1 bg-amber-650 hover:bg-amber-700 text-white font-bold rounded-lg text-[9px] flex items-center gap-1 shadow-sm"><i class="ph ph-printer"></i> Rapor</button>
                    </td>
                </tr>
            `;
        }).join('');
    };

    // Attach listener
    document.getElementById('rap-kelas').addEventListener('change', renderRaporTable);
    renderRaporTable();

    // ============================================
    // MANAGE REPORT CARD DIALOG MODAL (Wali Kelas)
    // ============================================
    window.manageReportCard = (siswaId) => {
        const sObj = students.find(s => s.id === siswaId);
        if (!sObj) return;

        // Fetch or create report card record
        let rc = reportCards.find(r => r.siswaId === siswaId && r.kelas === selectedClass && r.tahunPelajaran === activeTP && r.semester === activeSemester);
        if (!rc) {
            rc = {
                id: 'rc_' + siswaId + '_' + Date.now(),
                siswaId,
                kelas: selectedClass,
                tahunPelajaran: activeTP,
                semester: activeSemester,
                ekskul: [],
                kehadiran: { sakit: 0, izin: 0, alpa: 0 },
                catatanWali: '',
                prestasi: ''
            };
        }

        // Local copy of ekskul to manage in dialog
        let currentEkskuls = [...(rc.ekskul || [])];

        const renderEkskulList = () => {
            const listEl = document.getElementById('modal-ekskul-list');
            if (!listEl) return;
            if (currentEkskuls.length === 0) {
                listEl.innerHTML = `<p class="text-[10px] text-slate-400 text-center py-4">Belum ada kegiatan ekstrakurikuler ditambahkan.</p>`;
                return;
            }
            listEl.innerHTML = currentEkskuls.map((ek, idx) => `
                <div class="flex items-start justify-between p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl gap-2 text-[10px]">
                    <div class="text-left flex-grow">
                        <p class="font-extrabold text-slate-850 dark:text-slate-200">${ek.nama} (Nilai: <span class="text-forest-700 dark:text-forest-400">${ek.nilai}</span>)</p>
                        <p class="text-[9px] text-slate-400 leading-normal">${ek.keterangan || '-'}</p>
                    </div>
                    <button type="button" onclick="window.removeModalEkskul(${idx})" class="text-rose-500 hover:text-white p-1 hover:bg-rose-500 rounded"><i class="ph ph-trash"></i></button>
                </div>
            `).join('');
        };

        window.removeModalEkskul = (idx) => {
            currentEkskuls.splice(idx, 1);
            renderEkskulList();
        };

        const formBody = `
            <div class="space-y-4 text-left">
                <!-- Modal Tabs Header -->
                <div class="flex border-b border-slate-100 dark:border-slate-750">
                    <button type="button" id="tab-btn-catatan" class="px-4 py-2 text-xs font-bold border-b-2 border-forest-600 text-forest-700" onclick="window.switchModalTab('catatan')">Kehadiran & Catatan</button>
                    <button type="button" id="tab-btn-ekskul" class="px-4 py-2 text-xs font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-600" onclick="window.switchModalTab('ekskul')">Ekstrakurikuler & Prestasi</button>
                </div>

                <!-- Tab 1: Kehadiran & Catatan -->
                <div id="modal-tab-catatan" class="space-y-4">
                    <div class="grid grid-cols-3 gap-3">
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Sakit (Hari)</label>
                            <input type="number" id="m-sakit" min="0" value="${rc.kehadiran.sakit}" class="w-full px-3 py-1.5 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Izin (Hari)</label>
                            <input type="number" id="m-izin" min="0" value="${rc.kehadiran.izin}" class="w-full px-3 py-1.5 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Alfa (Hari)</label>
                            <input type="number" id="m-alpa" min="0" value="${rc.kehadiran.alpa}" class="w-full px-3 py-1.5 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none">
                        </div>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Catatan Wali Kelas</label>
                        <textarea id="m-catatan" rows="3" placeholder="Tulis masukan, saran perkembangan, dan motivasi siswa..." class="w-full px-3 py-2 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">${rc.catatanWali || ''}</textarea>
                    </div>
                </div>

                <!-- Tab 2: Ekskul & Prestasi -->
                <div id="modal-tab-ekskul" class="hidden space-y-4">
                    <!-- Add Ekskul Form Sub-section -->
                    <div class="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
                        <span class="text-[9px] font-bold text-slate-500 block uppercase mb-1">Tambah Kegiatan Ekstrakurikuler</span>
                        <div class="grid grid-cols-2 gap-2">
                            <select id="ek-nama" class="w-full px-2 py-1.5 border border-slate-250 dark:border-slate-750 dark:bg-slate-950 rounded-lg text-[10px] outline-none">
                                <option value="Pramuka">Pramuka (Wajib)</option>
                                <option value="PMR">PMR (Palang Merah Remaja)</option>
                                <option value="Tahfidz">Tahfidz Al-Qur'an</option>
                                <option value="Paskibra">Paskibra</option>
                                <option value="Futsal">Futsal / Olahraga</option>
                                <option value="Kaligrafi">Kaligrafi</option>
                                <option value="Seni Musik">Seni Hadroh / Musik</option>
                            </select>
                            <select id="ek-nilai" class="w-full px-2 py-1.5 border border-slate-250 dark:border-slate-750 dark:bg-slate-950 rounded-lg text-[10px] outline-none">
                                <option value="A">A (Sangat Baik)</option>
                                <option value="B" selected>B (Baik)</option>
                                <option value="C">C (Cukup)</option>
                                <option value="D">D (Kurang)</option>
                            </select>
                        </div>
                        <div>
                            <input type="text" id="ek-ket" placeholder="Deskripsi perkembangan/kegiatan ekskul..." class="w-full px-3 py-1.5 border border-slate-250 dark:border-slate-750 dark:bg-slate-950 rounded-lg text-[10px] outline-none">
                        </div>
                        <div class="flex justify-end">
                            <button type="button" onclick="window.addModalEkskul()" class="px-3 py-1 bg-forest-750 hover:bg-forest-800 text-white rounded-lg text-[9px] font-bold"><i class="ph ph-plus"></i> Tambah</button>
                        </div>
                    </div>

                    <!-- Added Ekskuls List -->
                    <div class="space-y-1.5">
                        <span class="text-[9px] font-bold text-slate-500 block uppercase">Kegiatan yang Diikuti</span>
                        <div id="modal-ekskul-list" class="space-y-1.5 max-h-[140px] overflow-y-auto pr-1"></div>
                    </div>

                    <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Prestasi Siswa (Opsional)</label>
                        <input type="text" id="m-prestasi" value="${rc.prestasi || ''}" placeholder="contoh: Juara 1 Pidato Bahasa Arab..." class="w-full px-3 py-1.5 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none">
                    </div>
                </div>
            </div>
        `;

        window.switchModalTab = (tab) => {
            const tabCatatan = document.getElementById('modal-tab-catatan');
            const tabEkskul = document.getElementById('modal-tab-ekskul');
            const btnCatatan = document.getElementById('tab-btn-catatan');
            const btnEkskul = document.getElementById('tab-btn-ekskul');

            if (tab === 'catatan') {
                tabCatatan.classList.remove('hidden');
                tabEkskul.classList.add('hidden');
                btnCatatan.className = 'px-4 py-2 text-xs font-bold border-b-2 border-forest-600 text-forest-700';
                btnEkskul.className = 'px-4 py-2 text-xs font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-600';
            } else {
                tabCatatan.classList.add('hidden');
                tabEkskul.classList.remove('hidden');
                btnCatatan.className = 'px-4 py-2 text-xs font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-600';
                btnEkskul.className = 'px-4 py-2 text-xs font-bold border-b-2 border-forest-600 text-forest-700';
                renderEkskulList();
            }
        };

        window.addModalEkskul = () => {
            const nama = document.getElementById('ek-nama').value;
            const nilai = document.getElementById('ek-nilai').value;
            const keterangan = document.getElementById('ek-ket').value.trim() || `Aktif mengikuti kegiatan ${nama} dengan pencapaian predikat ${nilai}.`;

            if (currentEkskuls.some(e => e.nama === nama)) {
                showToast(`Kegiatan ekstrakurikuler ${nama} sudah terdaftar!`, "warning");
                return;
            }

            currentEkskuls.push({ nama, nilai, keterangan });
            document.getElementById('ek-ket').value = '';
            renderEkskulList();
        };

        ctx.openModal(`Kelola Rapor — ${sObj.nama}`, formBody, "Simpan Rapor", async () => {
            const sakit = parseInt(document.getElementById('m-sakit').value, 10) || 0;
            const izin = parseInt(document.getElementById('m-izin').value, 10) || 0;
            const alpa = parseInt(document.getElementById('m-alpa').value, 10) || 0;
            const catatanWali = document.getElementById('m-catatan').value.trim();
            const prestasi = document.getElementById('m-prestasi').value.trim();

            const updatedRc = {
                id: rc.id,
                siswaId,
                kelas: selectedClass,
                tahunPelajaran: activeTP,
                semester: activeSemester,
                ekskul: currentEkskuls,
                kehadiran: { sakit, izin, alpa },
                catatanWali,
                prestasi
            };

            const idx = reportCards.findIndex(r => r.siswaId === siswaId && r.kelas === selectedClass && r.tahunPelajaran === activeTP && r.semester === activeSemester);
            if (idx !== -1) {
                reportCards[idx] = updatedRc;
            } else {
                reportCards.push(updatedRc);
            }

            await dbService.saveData('report_cards', reportCards);
            ctx.closeModal();
            renderRaporTable();
            showToast(`Data rapor ${sObj.nama} berhasil diperbarui!`);
        });
    };

    // ============================================
    // PRINT PREVIEW RAPOR siswa (A4 Portrait)
    // ============================================
    window.printReportCard = (siswaId) => {
        const student = students.find(s => s.id === siswaId);
        if (!student) return;

        // Fetch grades for this student and classroom
        const sGrades = penilaian.filter(p => p.siswaId === siswaId && p.kelas === selectedClass);

        // Fetch report card details
        const rc = reportCards.find(r => r.siswaId === siswaId && r.kelas === selectedClass && r.tahunPelajaran === activeTP && r.semester === activeSemester) || {
            kehadiran: { sakit: 0, izin: 0, alpa: 0 },
            ekskul: [],
            catatanWali: 'Pertahankan prestasi belajar Anda dan teruslah berpartisipasi aktif di kelas.',
            prestasi: '-'
        };

        // Homeroom details
        const hr = homerooms.find(r => r.kelas === selectedClass && r.tahunPelajaran === activeTP && r.semester === activeSemester) || { waliKelasNama: userProfile.nama };

        // Render academic subjects rows
        let academicRowsHtml = '';
        if (sGrades.length > 0) {
            academicRowsHtml = sGrades.map((g, idx) => {
                // Calculate average final weighted grade
                const finalScore = Math.round(
                    (Number(g.tugas || 0) * 0.3) +
                    (Number(g.ulangan || 0) * 0.2) +
                    (Number(g.uts || 0) * 0.25) +
                    (Number(g.uas || 0) * 0.25)
                );

                // Auto-generate Capaian Kompetensi description
                let competencyDesc = '';
                if (finalScore >= 88) {
                    competencyDesc = `Menunjukkan penguasaan yang sangat baik dalam memahami seluruh indikator pembelajaran mata pelajaran ${g.mapel} serta mampu mengaplikasikan teori secara praktis.`;
                } else if (finalScore >= 78) {
                    competencyDesc = `Menunjukkan penguasaan yang baik dalam menyerap inti bahasan pembelajaran ${g.mapel} dan menyelesaikan tugas terstruktur dengan tuntas.`;
                } else if (finalScore >= 68) {
                    competencyDesc = `Menunjukkan penguasaan yang cukup pada indikator pokok pembelajaran ${g.mapel}, perlu peningkatan pemahaman pada pilar-pilar dasar tertentu.`;
                } else {
                    competencyDesc = `Memerlukan bimbingan intensif dan latihan mandiri ekstra untuk memperkuat pemahaman fundamental materi ajar ${g.mapel}.`;
                }

                return `
                    <tr style="border: 1px solid #000;">
                        <td style="text-align: center; border: 1px solid #000; padding: 6px; font-size: 11px;">${idx + 1}</td>
                        <td style="border: 1px solid #000; padding: 6px; font-weight: bold; font-size: 11px;">${g.mapel}</td>
                        <td style="text-align: center; border: 1px solid #000; padding: 6px; font-weight: bold; font-size: 12px;">${finalScore}</td>
                        <td style="border: 1px solid #000; padding: 6px; font-size: 10px; text-align: justify; line-height: 1.3;">${competencyDesc}</td>
                    </tr>
                `;
            }).join('');
        } else {
            // Render nice mock template rows if no grades recorded
            const defaultSubjects = subjects.filter(s => selectedClass.startsWith(s.tingkat));
            const subjectsList = defaultSubjects.length > 0 ? defaultSubjects : [
                { nama: "Informatika" }, { nama: "Fikih" }, { nama: "Matematika" }
            ];

            academicRowsHtml = subjectsList.map((sub, idx) => `
                <tr style="border: 1px solid #000;">
                    <td style="text-align: center; border: 1px solid #000; padding: 6px; font-size: 11px;">${idx + 1}</td>
                    <td style="border: 1px solid #000; padding: 6px; font-weight: bold; font-size: 11px;">${sub.nama}</td>
                    <td style="text-align: center; border: 1px solid #000; padding: 6px; font-weight: bold; font-size: 12px; color: #666;">80</td>
                    <td style="border: 1px solid #000; padding: 6px; font-size: 10px; text-align: justify; line-height: 1.3;">Menunjukkan penguasaan yang baik dalam menyerap kompetensi dasar dan materi ajar pokok (Template).</td>
                </tr>
            `).join('');
        }

        // Render extracurriculars rows
        let ekskulRowsHtml = '';
        if (rc.ekskul && rc.ekskul.length > 0) {
            ekskulRowsHtml = rc.ekskul.map((ek, idx) => `
                <tr style="border: 1px solid #000;">
                    <td style="text-align: center; border: 1px solid #000; padding: 5px; font-size: 10px;">${idx + 1}</td>
                    <td style="border: 1px solid #000; padding: 5px; font-weight: bold; font-size: 10px;">${ek.nama}</td>
                    <td style="text-align: center; border: 1px solid #000; padding: 5px; font-weight: bold; font-size: 11px;">${ek.nilai}</td>
                    <td style="border: 1px solid #000; padding: 5px; font-size: 9.5px; text-align: justify;">${ek.keterangan}</td>
                </tr>
            `).join('');
        } else {
            ekskulRowsHtml = `
                <tr style="border: 1px solid #000;">
                    <td colspan="4" style="text-align: center; border: 1px solid #000; padding: 10px; font-size: 10px; color: #555;">Tidak mengikuti kegiatan ekstrakurikuler.</td>
                </tr>
            `;
        }

        const todayStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

        const w = window.open('', '_blank');
        w.document.write(`
            <html>
            <head>
                <title>Rapor Kurikulum Merdeka - ${student.nama}</title>
                <style>
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        padding: 30px 40px;
                        color: #000;
                        line-height: 1.35;
                        font-size: 11.5px;
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
                    .kop-yayasan {
                        font-size: 11px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin: 0;
                    }
                    .kop-madrasah {
                        font-size: 15px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin: 1px 0;
                    }
                    .kop-alamat {
                        font-size: 8.5px;
                        font-style: italic;
                        margin: 0;
                        color: #333;
                    }
                    .info-table {
                        width: 100%;
                        margin-bottom: 15px;
                        font-size: 11px;
                        border-collapse: collapse;
                    }
                    .info-table td {
                        padding: 2.5px 4px;
                        vertical-align: top;
                    }
                    .table-main {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 12px;
                    }
                    .table-main th, .table-main td {
                        border: 1px solid #000;
                        padding: 6px;
                    }
                    .table-main th {
                        background: #f2f2f2;
                        font-weight: bold;
                        text-align: center;
                        font-size: 10.5px;
                    }
                    .sect-title {
                        font-size: 12px;
                        font-weight: bold;
                        margin: 10px 0 5px 0;
                        text-transform: uppercase;
                    }
                    .sig-section {
                        margin-top: 25px;
                        display: flex;
                        justify-content: space-between;
                        font-size: 11px;
                        page-break-inside: avoid;
                    }
                    .sig-box {
                        text-align: center;
                        width: 180px;
                    }
                    .no-print-bar {
                        background: #1e293b;
                        padding: 8px 12px;
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                        border-radius: 6px;
                        margin-bottom: 15px;
                    }
                    .btn-act {
                        background: #10b981;
                        color: white;
                        border: none;
                        padding: 6px 14px;
                        font-size: 11px;
                        font-weight: bold;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    @media print {
                        .no-print-bar { display: none !important; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print-bar">
                    <button class="btn-act" onclick="window.print()">Cetak Rapor</button>
                    <button class="btn-act" style="background:#ef4444;" onclick="window.close()">Tutup</button>
                </div>

                <!-- Kop Dinas -->
                <div class="kop-surat">
                    <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="kop-logo">
                    <div class="kop-text">
                        <p class="kop-yayasan">Yayasan Idrisiyyah Tasikmalaya</p>
                        <h2 class="kop-madrasah">Madrasah Tsanawiyah (MTs) Idrisiyyah</h2>
                        <p class="kop-alamat">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855 | Telp: (0265) 323456</p>
                    </div>
                </div>

                <h3 style="text-align: center; font-size: 13px; font-weight: bold; text-decoration: underline; margin-bottom: 12px;">LAPORAN HASIL BELAJAR SISWA (RAPOR)</h3>

                <!-- Student Identity -->
                <table class="info-table">
                    <tr>
                        <td style="width: 18%; font-weight:bold;">Nama Siswa</td><td style="width: 2%">:</td><td style="width: 35%; font-weight:bold;">${student.nama.toUpperCase()}</td>
                        <td style="width: 18%; font-weight:bold;">Kelas</td><td style="width: 2%">:</td><td style="width: 25%; font-weight:bold;">${selectedClass}</td>
                    </tr>
                    <tr>
                        <td style="font-weight:bold;">NISN</td><td>:</td><td>${student.nisn || '-'}</td>
                        <td style="font-weight:bold;">Semester</td><td>:</td><td>${activeSemester}</td>
                    </tr>
                    <tr>
                        <td style="font-weight:bold;">Satuan Pendidikan</td><td>:</td><td>MTs Idrisiyyah</td>
                        <td style="font-weight:bold;">Tahun Pelajaran</td><td>:</td><td>${activeTP}</td>
                    </tr>
                </table>

                <!-- A. Intrakurikuler -->
                <h4 class="sect-title">A. PENILAIAN INTRAKURIKULER</h4>
                <table class="table-main">
                    <thead>
                        <tr>
                            <th style="width: 5%">No</th>
                            <th style="width: 25%; text-align: left;">Mata Pelajaran</th>
                            <th style="width: 12%">Nilai Akhir</th>
                            <th style="text-align: left;">Capaian Kompetensi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${academicRowsHtml}
                    </tbody>
                </table>

                <!-- B. Ekstrakurikuler -->
                <h4 class="sect-title">B. KEGIATAN EKSTRAKURIKULER</h4>
                <table class="table-main">
                    <thead>
                        <tr>
                            <th style="width: 5%">No</th>
                            <th style="width: 25%; text-align: left;">Kegiatan Ekstrakurikuler</th>
                            <th style="width: 15%">Predikat</th>
                            <th style="text-align: left;">Keterangan / Deskripsi Kemajuan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ekskulRowsHtml}
                    </tbody>
                </table>

                <div style="display: flex; gap: 20px; page-break-inside: avoid;">
                    <!-- C. Ketidakhadiran -->
                    <div style="flex: 1;">
                        <h4 class="sect-title">C. KETIDAKHADIRAN</h4>
                        <table class="table-main" style="width: 100%;">
                            <tr style="border: 1px solid #000;">
                                <td style="padding: 6px; width: 60%;">Sakit (S)</td>
                                <td style="padding: 6px; text-align: center; font-weight: bold;">${rc.kehadiran.sakit} hari</td>
                            </tr>
                            <tr style="border: 1px solid #000;">
                                <td style="padding: 6px;">Izin (I)</td>
                                <td style="padding: 6px; text-align: center; font-weight: bold;">${rc.kehadiran.izin} hari</td>
                            </tr>
                            <tr style="border: 1px solid #000;">
                                <td style="padding: 6px;">Tanpa Keterangan (A)</td>
                                <td style="padding: 6px; text-align: center; font-weight: bold;">${rc.kehadiran.alpa} hari</td>
                            </tr>
                        </table>
                    </div>

                    <!-- D. Prestasi -->
                    <div style="flex: 1;">
                        <h4 class="sect-title">D. PRESTASI SISWA</h4>
                        <div style="border: 1px solid #000; padding: 10px; min-height: 75px; border-radius: 2px; font-size: 10px; text-align: justify;">
                            ${rc.prestasi && rc.prestasi !== '-' ? `<strong>Tercatat prestasi:</strong> ${rc.prestasi}` : 'Belum ada catatan prestasi spesifik semester ini.'}
                        </div>
                    </div>
                </div>

                <!-- E. Catatan Wali -->
                <h4 class="sect-title" style="page-break-inside: avoid;">E. CATATAN WALI KELAS</h4>
                <div style="border: 1px solid #000; padding: 10px; border-radius: 2px; text-align: justify; font-size: 10.5px; page-break-inside: avoid;">
                    ${rc.catatanWali || 'Pertahankan prestasi belajar Anda dan tetaplah berpartisipasi aktif dalam berbagai kegiatan madrasah.'}
                </div>

                <!-- Signatures -->
                <div class="sig-section">
                    <div class="sig-box">
                        <p>Orang Tua / Wali Siswa,</p>
                        <div style="height: 50px;"></div>
                        <p>_____________________</p>
                    </div>
                    <div class="sig-box">
                        <p>Tasikmalaya, ${todayStr}</p>
                        <p>Wali Kelas,</p>
                        <div style="height: 50px;"></div>
                        <p><strong>${hr.waliKelasNama}</strong></p>
                        <p style="border-top: 1px solid #000; font-size: 8.5px; padding-top: 1px;">NIP. ${hr.waliKelasId === 't1' ? '197508212005011002' : '-'}</p>
                    </div>
                </div>

                <div class="sig-section" style="justify-content: center; margin-top: 15px;">
                    <div class="sig-box">
                        <p>Mengetahui,</p>
                        <p>Kepala Madrasah,</p>
                        <div style="height: 50px;"></div>
                        <p><strong>${settings.kepala || 'H. Ahmad Fauzian, M.Pd.'}</strong></p>
                        <p style="border-top: 1px solid #000; font-size: 8.5px; padding-top: 1px;">NIP. ${settings.nipKepala || '197804152006041003'}</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        w.document.close();
    };
}
