// ============================================
// TRADISI — Kesiswaan & BK Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { 
        dbService, 
        showToast, 
        openModal, 
        closeModal, 
        showConfirmDialog, 
        generateId, 
        formatTanggalIndonesia,
        getUserProfile 
    } = ctx;

    // Load data from DB service
    let students = await dbService.getData('siswa') || [];
    let teachers = await dbService.getData('teachers') || [];
    let violations = await dbService.getData('student_violations') || [];
    let achievements = await dbService.getData('student_achievements') || [];
    let extracurriculars = await dbService.getData('extracurriculars') || [];
    
    // osim_committee might be an object
    let osim = await dbService.getData('osim_committee');
    if (!osim || Array.isArray(osim)) {
        // Fallback or initialization if not found or returned as empty array
        osim = {
            tahunAjaran: "2026/2027",
            pembinaNama: "Zainal Abidin, S.Pd.",
            pengurus: [
                { jabatan: "Ketua OSIM", nama: "Ihsan Kamil", kelas: "VIII-A", siswaId: "s10" },
                { jabatan: "Wakil Ketua OSIM", nama: "Omar Hakim", kelas: "VIII-A", siswaId: "s16" },
                { jabatan: "Sekretaris I", nama: "Putri Ayu Lestari", kelas: "VIII-A", siswaId: "s17" },
                { jabatan: "Bendahara I", nama: "Raniah Dewi", kelas: "VIII-A", siswaId: "s19" }
            ],
            agenda: [
                { id: "ag_1", kegiatan: "Latihan Dasar Kepemimpinan Siswa (LDKS)", tanggal: "2026-07-20", status: "Terencana", deskripsi: "Membekali pengurus baru OSIM dengan keterampilan kepemimpinan dasar." },
                { id: "ag_2", kegiatan: "Porseni Madrasah 2026", tanggal: "2026-09-15", status: "Dalam Proses", deskripsi: "Pekan olahraga dan seni antar kelas." }
            ]
        };
    }

    // Role-based Access Control details
    const profile = getUserProfile();
    const activeRole = profile ? profile.activeRole : 'guru';
    const userEmail = profile ? profile.email : '';
    
    const currentTeacher = teachers.find(t => t.email === userEmail || t.nip === (profile ? profile.nip : ''));
    
    const isAdmin = activeRole === 'super_admin' || activeRole === 'admin_madrasah' || activeRole === 'waka_kesiswaan';
    const isWaliKelas = activeRole === 'wali_kelas';
    const isPembinaEkskul = activeRole === 'pembina_ekskul';
    const isGuru = activeRole === 'guru';

    // Get Wali Kelas homeroom
    const homerooms = await dbService.getData('homerooms') || [];
    const myHomeroom = currentTeacher ? homerooms.find(h => h.waliKelasId === currentTeacher.id) : null;
    const waliKelasClass = myHomeroom ? myHomeroom.kelas : null;

    // Local filter state
    let activeTab = 'bk';
    let bkSearchQuery = '';
    let bkClassFilter = isWaliKelas ? (waliKelasClass || 'NONE') : '';
    let prestasiSearchQuery = '';
    let prestasiClassFilter = isWaliKelas ? (waliKelasClass || 'NONE') : '';

    // Calculate cumulative violation points per student
    function getCumulativePointsMap(violationList = violations) {
        const map = {};
        students.forEach(s => { map[s.id] = 0; });
        violationList.forEach(v => {
            if (map[v.siswaId] !== undefined) {
                map[v.siswaId] += parseInt(v.poin || 0);
            }
        });
        return map;
    }

    // Determine status text/color based on points
    function getPointStatus(points) {
        if (points === 0) return { label: 'Tertib', class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' };
        if (points <= 20) return { label: 'Tertib (Poin Rendah)', class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' };
        if (points <= 50) return { label: 'Peringatan Ringan', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400' };
        if (points <= 100) return { label: 'Panggil Ortu (Kritis)', class: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400 animate-pulse' };
        return { label: 'Rekomendasi Skorsing', class: 'bg-rose-100 text-rose-850 dark:bg-rose-950/50 dark:text-rose-400 font-bold' };
    }

    // Render HTML Container
    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
                <div>
                    <h1 class="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <i class="ph ph-users text-forest-600"></i> Kesiswaan & Bimbingan Konseling (BK)
                    </h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Pusat administrasi kesiswaan: kedisiplinan BK, prestasi ekstrakurikuler, dan kepengurusan OSIM</p>
                </div>
            </div>

            <!-- Tab Navigation Buttons -->
            <div class="flex border-b border-slate-200 dark:border-slate-700/60 overflow-x-auto gap-2 scrollbar-none">
                <button id="tab-btn-bk" onclick="window.switchKesiswaanTab('bk')" class="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-forest-600 border-b-2 border-transparent transition-all flex items-center gap-1.5 whitespace-nowrap">
                    <i class="ph ph-shield-warning text-base"></i> BK & Kedisiplinan
                </button>
                <button id="tab-btn-ekskul" onclick="window.switchKesiswaanTab('ekskul')" class="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-forest-600 border-b-2 border-transparent transition-all flex items-center gap-1.5 whitespace-nowrap">
                    <i class="ph ph-soccer-ball text-base"></i> Ekstrakurikuler
                </button>
                <button id="tab-btn-prestasi" onclick="window.switchKesiswaanTab('prestasi')" class="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-forest-600 border-b-2 border-transparent transition-all flex items-center gap-1.5 whitespace-nowrap">
                    <i class="ph ph-trophy text-base"></i> Prestasi Siswa
                </button>
                <button id="tab-btn-osim" onclick="window.switchKesiswaanTab('osim')" class="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-forest-600 border-b-2 border-transparent transition-all flex items-center gap-1.5 whitespace-nowrap">
                    <i class="ph ph-users-three text-base"></i> Pengurus OSIM
                </button>
            </div>

            <!-- Content Area for Panes -->
            <div id="tab-content-bk" class="tab-pane hidden space-y-6"></div>
            <div id="tab-content-ekskul" class="tab-pane hidden space-y-6"></div>
            <div id="tab-content-prestasi" class="tab-pane hidden space-y-6"></div>
            <div id="tab-content-osim" class="tab-pane hidden space-y-6"></div>
        </div>
    `;

    // Switch active tabs
    window.switchKesiswaanTab = function(tabName) {
        activeTab = tabName;
        document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
        document.getElementById(`tab-content-${tabName}`).classList.remove('hidden');

        document.querySelectorAll('[id^="tab-btn-"]').forEach(btn => {
            btn.classList.remove('border-forest-600', 'text-forest-600', 'dark:text-forest-400', 'tab-active');
            btn.classList.add('border-transparent', 'text-slate-500', 'dark:text-slate-400');
        });

        const activeBtn = document.getElementById(`tab-btn-${tabName}`);
        if (activeBtn) {
            activeBtn.classList.remove('border-transparent', 'text-slate-500', 'dark:text-slate-400');
            activeBtn.classList.add('border-forest-600', 'text-forest-600', 'dark:text-forest-400', 'tab-active');
        }

        // Render contents of tab
        if (tabName === 'bk') renderBKTab();
        else if (tabName === 'ekskul') renderEkskulTab();
        else if (tabName === 'prestasi') renderPrestasiTab();
        else if (tabName === 'osim') renderOsimTab();
    };

    // ============================================
    // TAB 1: BK & DISIPLIN
    // ============================================
    window.renderBKTab = function() {
        const pane = document.getElementById('tab-content-bk');
        if (!pane) return;

        // Cumulative point maps
        const pointsMap = getCumulativePointsMap();

        // Calculate statistics based on filtered visibility
        let totalCases = 0;
        let panggilOrtuCount = 0;
        let skorsingCount = 0;

        const filteredList = students.filter(s => {
            // Role restrictions
            if (isWaliKelas && waliKelasClass && s.kelas !== waliKelasClass) return false;
            
            // Search filter
            const matchesSearch = s.nama.toLowerCase().includes(bkSearchQuery.toLowerCase()) || s.nisn.includes(bkSearchQuery);
            // Class filter
            const matchesClass = !bkClassFilter || s.kelas === bkClassFilter;
            
            return matchesSearch && matchesClass;
        });

        // Calculate stats on visible/filtered students
        filteredList.forEach(s => {
            const pts = pointsMap[s.id] || 0;
            const studentVils = violations.filter(v => v.siswaId === s.id);
            totalCases += studentVils.length;
            if (pts > 50 && pts <= 100) panggilOrtuCount++;
            if (pts > 100) skorsingCount++;
        });

        // Trigger alert banner if points > 50 exist
        const criticalCount = Object.keys(pointsMap).filter(sid => {
            const s = students.find(stud => stud.id === sid);
            if (isWaliKelas && waliKelasClass && s && s.kelas !== waliKelasClass) return false;
            return pointsMap[sid] > 50;
        }).length;

        const warningBannerHtml = criticalCount > 0 ? `
            <div class="p-4 bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-500 rounded-xl flex items-start gap-3">
                <i class="ph ph-warning-circle text-orange-500 text-lg mt-0.5 animate-pulse"></i>
                <div>
                    <h4 class="text-xs font-bold text-orange-850 dark:text-orange-400">Peringatan Disiplin Kritis</h4>
                    <p class="text-[11px] text-orange-700 dark:text-orange-300">Terdapat <strong>${criticalCount}</strong> siswa dengan poin pelanggaran melebihi batas aman (> 50 Poin) yang memerlukan koordinasi BK atau pemanggilan Orang Tua.</p>
                </div>
            </div>
        ` : '';

        // Class selector html
        let classSelectHtml = `<select id="bk-filter-class" onchange="window.filterBKByClass(this.value)" class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs" ${isWaliKelas ? 'disabled' : ''}>
            <option value="">Semua Kelas</option>`;
        const classes = [...new Set(students.map(s => s.kelas))].sort();
        classes.forEach(c => {
            classSelectHtml += `<option value="${c}" ${bkClassFilter === c ? 'selected' : ''}>Kelas ${c}</option>`;
        });
        classSelectHtml += `</select>`;

        pane.innerHTML = `
            ${warningBannerHtml}

            <!-- BK Stat Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="stat-card stat-card-blue bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-black text-slate-800 dark:text-slate-100">${totalCases}</div>
                        <div class="text-[10px] font-bold text-slate-400 uppercase">Total Kasus Tercatat</div>
                    </div>
                    <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl"><i class="ph ph-folder text-blue-500 text-xl"></i></div>
                </div>
                <div class="stat-card stat-card-orange bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-black text-orange-600 dark:text-orange-400">${panggilOrtuCount}</div>
                        <div class="text-[10px] font-bold text-slate-400 uppercase">Rekomendasi Panggil Ortu (>50 Poin)</div>
                    </div>
                    <div class="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-xl"><i class="ph ph-phone text-orange-500 text-xl animate-bounce"></i></div>
                </div>
                <div class="stat-card stat-card-rose bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-black text-rose-600">${skorsingCount}</div>
                        <div class="text-[10px] font-bold text-slate-400 uppercase">Usulan Skorsing (>100 Poin)</div>
                    </div>
                    <div class="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl"><i class="ph ph-shield-alert text-rose-500 text-xl"></i></div>
                </div>
            </div>

            <!-- Main Table Card -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="p-5 border-b border-slate-100 dark:border-slate-700/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div class="flex flex-col sm:flex-row flex-1 gap-2 w-full max-w-lg">
                        <div class="relative flex-1">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><i class="ph ph-magnifying-glass"></i></span>
                            <input type="text" id="bk-search-input" value="${bkSearchQuery}" oninput="window.searchBK(this.value)" placeholder="Cari nama siswa..." class="w-full pl-9 pr-4 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                        </div>
                        ${classSelectHtml}
                    </div>
                    <div class="flex gap-2 w-full md:w-auto">
                        ${isAdmin ? `
                            <button onclick="window.addViolationModal()" class="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                                <i class="ph ph-plus"></i> Tambah Pelanggaran
                            </button>
                        ` : ''}
                        <button onclick="window.printRekapDisiplin()" class="px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-350">
                            <i class="ph ph-printer"></i> Cetak Rekap Disiplin
                        </button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-700/50 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th class="px-6 py-3 text-center w-12">No</th>
                                <th class="px-6 py-3">Nama Siswa</th>
                                <th class="px-6 py-3 w-24">Kelas</th>
                                <th class="px-6 py-3 text-center w-36">Total Kasus</th>
                                <th class="px-6 py-3 text-center w-36">Poin Disiplin</th>
                                <th class="px-6 py-3 w-44">Status Kedisiplinan</th>
                                <th class="px-6 py-3 text-center w-28">Detail Log</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredList.map((s, idx) => {
                                const pts = pointsMap[s.id] || 0;
                                const status = getPointStatus(pts);
                                const count = violations.filter(v => v.siswaId === s.id).length;
                                return `
                                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/20 border-b border-slate-100 dark:border-slate-800 transition-colors">
                                        <td class="px-6 py-3.5 text-xs text-slate-500 text-center">${idx + 1}</td>
                                        <td class="px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">${s.nama}</td>
                                        <td class="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-400">${s.kelas}</td>
                                        <td class="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-400 text-center">${count} Kasus</td>
                                        <td class="px-6 py-3.5 text-xs text-center font-bold ${pts > 50 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}">${pts} Poin</td>
                                        <td class="px-6 py-3.5 text-xs">
                                            <span class="px-2.5 py-0.5 rounded-full font-bold text-[9px] ${status.class}">${status.label}</span>
                                        </td>
                                        <td class="px-6 py-3.5 text-xs text-center">
                                            <button onclick="window.showStudentViolationHistoryModal('${s.id}')" class="px-2.5 py-1 bg-forest-50 dark:bg-forest-900/10 text-forest-700 dark:text-forest-400 rounded-lg hover:bg-forest-100 transition-all font-semibold">
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                            ${filteredList.length === 0 ? `
                                <tr>
                                    <td colspan="7" class="px-6 py-8 text-center text-xs text-slate-400 dark:text-slate-500">Tidak ada data siswa ditemukan.</td>
                                </tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };

    window.filterBKByClass = function(val) {
        bkClassFilter = val;
        renderBKTab();
    };

    window.searchBK = function(val) {
        bkSearchQuery = val;
        renderBKTab();
    };

    // Modal adding violation
    window.addViolationModal = function() {
        if (!isAdmin) return;
        
        let studentOptions = '';
        students.sort((a,b) => a.nama.localeCompare(b.nama)).forEach(s => {
            studentOptions += `<option value="${s.id}">${s.nama} (Kelas ${s.kelas})</option>`;
        });

        const formBody = `
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Pilih Siswa</label>
                    <select id="v-siswa-id" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                        ${studentOptions}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tanggal Kejadian</label>
                        <input type="date" id="v-tanggal" value="${new Date().toISOString().split('T')[0]}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Kategori Pelanggaran</label>
                        <select id="v-kategori" onchange="window.adjustViolationPoints(this.value)" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="Ringan">Ringan (5 - 15 Poin)</option>
                            <option value="Sedang">Sedang (20 - 40 Poin)</option>
                            <option value="Berat">Berat (50 - 100 Poin)</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Poin Pelanggaran</label>
                        <input type="number" id="v-poin" value="5" min="1" max="150" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Pelapor (Staf/Guru)</label>
                        <input type="text" id="v-pelapor" value="${currentTeacher ? currentTeacher.nama : (profile ? profile.nama : '')}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Deskripsi Pelanggaran</label>
                    <textarea id="v-deskripsi" rows="2" placeholder="Tulis rincian pelanggaran..." required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></textarea>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tindakan Langsung</label>
                    <input type="text" id="v-tindakan" placeholder="Contoh: Pembinaan lisan, disita barang bukti..." required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                </div>
            </div>
        `;

        openModal("Catat Kasus Pelanggaran Siswa", formBody, "Simpan Kasus", async () => {
            const sid = document.getElementById('v-siswa-id').value;
            const sDoc = students.find(s => s.id === sid);
            if (!sDoc) return;

            const newViolation = {
                id: 'vil_' + generateId(),
                siswaId: sid,
                siswaNama: sDoc.nama,
                kelas: sDoc.kelas,
                tanggal: document.getElementById('v-tanggal').value,
                kategori: document.getElementById('v-kategori').value,
                poin: parseInt(document.getElementById('v-poin').value || 0),
                pelanggaran: document.getElementById('v-deskripsi').value.trim(),
                tindakan: document.getElementById('v-tindakan').value.trim(),
                pelapor: document.getElementById('v-pelapor').value.trim(),
                status: 'aktif'
            };

            violations.push(newViolation);
            await dbService.saveData('student_violations', violations);
            closeModal();
            renderBKTab();
            showToast("Kasus pelanggaran berhasil dicatat!");
        });
    };

    window.adjustViolationPoints = function(category) {
        const pointsInput = document.getElementById('v-poin');
        if (!pointsInput) return;
        if (category === 'Ringan') pointsInput.value = 5;
        else if (category === 'Sedang') pointsInput.value = 20;
        else if (category === 'Berat') pointsInput.value = 50;
    };

    // Modal view violation history
    window.showStudentViolationHistoryModal = function(studentId) {
        const s = students.find(stud => stud.id === studentId);
        if (!s) return;

        const sViolations = violations.filter(v => v.siswaId === studentId);
        const pointsMap = getCumulativePointsMap();
        const totPts = pointsMap[studentId] || 0;
        const status = getPointStatus(totPts);

        const listHtml = sViolations.length === 0 
            ? `<div class="py-6 text-center text-xs text-slate-400 dark:text-slate-500">Siswa ini tidak memiliki riwayat pelanggaran (Poin Bersih).</div>`
            : `
            <div class="max-h-[300px] overflow-y-auto pr-1">
                <table class="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr class="bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-500 font-bold uppercase border-b border-slate-100 dark:border-slate-700">
                            <th class="p-2 w-28">Tanggal</th>
                            <th class="p-2">Pelanggaran</th>
                            <th class="p-2 w-20 text-center">Kategori</th>
                            <th class="p-2 w-16 text-center">Poin</th>
                            <th class="p-2">Tindakan</th>
                            ${isAdmin ? '<th class="p-2 w-10 text-center">Hapus</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${sViolations.map(v => `
                            <tr class="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                <td class="p-2 font-mono text-[10px]">${formatTanggalIndonesia(v.tanggal)}</td>
                                <td class="p-2">${v.pelanggaran}</td>
                                <td class="p-2 text-center"><span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${v.kategori === 'Ringan' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20' : v.kategori === 'Sedang' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}">${v.kategori}</span></td>
                                <td class="p-2 text-center font-bold">${v.poin}</td>
                                <td class="p-2">${v.tindakan} <span class="block text-[9px] text-slate-400">Pekerja: ${v.pelapor}</span></td>
                                ${isAdmin ? `
                                    <td class="p-2 text-center">
                                        <button onclick="window.deleteViolation('${v.id}', '${studentId}')" class="text-rose-500 hover:text-rose-700"><i class="ph ph-trash"></i></button>
                                    </td>
                                ` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            `;

        const modalBody = `
            <div class="space-y-4">
                <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-between border border-slate-150 dark:border-slate-800">
                    <div>
                        <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200">${s.nama}</h4>
                        <div class="text-[10px] text-slate-500">Kelas ${s.kelas} | NISN ${s.nisn}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs font-bold text-slate-700 dark:text-slate-300">Total Akumulasi: <span class="text-rose-600 font-extrabold">${totPts} Poin</span></div>
                        <span class="px-2 py-0.5 rounded-full font-bold text-[8px] ${status.class}">${status.label}</span>
                    </div>
                </div>
                
                <h5 class="text-xs font-bold text-slate-700 dark:text-slate-350 border-b pb-1">Daftar Rincian Kasus</h5>
                ${listHtml}
            </div>
        `;

        openModal("Riwayat Kasus Siswa", modalBody, null, null);
    };

    window.deleteViolation = function(id, studentId) {
        if (!isAdmin) return;
        showConfirmDialog("Hapus Pelanggaran", "Apakah Anda yakin ingin menghapus catatan pelanggaran ini dari log?", async () => {
            const idx = violations.findIndex(v => v.id === id);
            if (idx !== -1) {
                violations.splice(idx, 1);
                await dbService.saveData('student_violations', violations);
                
                // Refresh log details
                closeModal();
                renderBKTab();
                showToast("Catatan pelanggaran telah dihapus.");
                // Re-open history modal if it was open
                setTimeout(() => window.showStudentViolationHistoryModal(studentId), 200);
            }
        });
    };

    // ============================================
    // TAB 2: EKSTRAKURIKULER
    // ============================================
    window.renderEkskulTab = function() {
        const pane = document.getElementById('tab-content-ekskul');
        if (!pane) return;

        pane.innerHTML = `
            <div class="flex justify-between items-center pb-2">
                <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Daftar Program Ekstrakurikuler</h3>
                ${isAdmin ? `
                    <button onclick="window.addEkskulModal()" class="px-3.5 py-1.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <i class="ph ph-plus"></i> Tambah Ekskul Baru
                    </button>
                ` : ''}
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="ekskul-cards-container"></div>
        `;

        const container = document.getElementById('ekskul-cards-container');
        if (!container) return;

        if (extracurriculars.length === 0) {
            container.innerHTML = `<div class="col-span-full py-12 text-center text-xs text-slate-400 dark:text-slate-500">Belum ada kegiatan ekstrakurikuler terdaftar.</div>`;
            return;
        }

        container.innerHTML = extracurriculars.map(ek => {
            const memberCount = (ek.siswaIds || []).length;
            const canManage = isAdmin || (isPembinaEkskul && currentTeacher && ek.pembinaId === currentTeacher.id);
            
            return `
                <div class="card-hover-lift bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-2">
                        <div class="flex justify-between items-start">
                            <span class="px-2.5 py-1 bg-forest-50 dark:bg-forest-950/20 text-forest-700 dark:text-forest-400 rounded-xl text-xs font-extrabold uppercase tracking-wider">${ek.nama}</span>
                            ${isAdmin ? `
                                <button onclick="window.deleteEkskul('${ek.id}')" class="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-all" title="Hapus"><i class="ph ph-trash"></i></button>
                            ` : ''}
                        </div>
                        <div class="space-y-1">
                            <div class="text-[11px] text-slate-500 flex items-center gap-1.5"><i class="ph ph-user"></i> Pembina: <span class="font-bold text-slate-700 dark:text-slate-300">${ek.pembinaNama || '-'}</span></div>
                            <div class="text-[11px] text-slate-500 flex items-center gap-1.5"><i class="ph ph-calendar"></i> Jadwal: <span class="font-semibold text-slate-700 dark:text-slate-300">${ek.jadwal || '-'}</span></div>
                            <div class="text-[11px] text-slate-500 flex items-center gap-1.5"><i class="ph ph-users"></i> Anggota: <span class="font-semibold text-slate-700 dark:text-slate-300">${memberCount} Siswa</span></div>
                        </div>
                    </div>
                    
                    <button onclick="window.manageEkskulModal('${ek.id}')" class="w-full py-2 ${canManage ? 'bg-forest-700 hover:bg-forest-800 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed'} rounded-xl text-xs font-bold transition-all" ${canManage ? '' : 'disabled'}>
                        ${canManage ? 'Kelola Anggota & Jadwal' : 'Lihat Anggota (Terbatas)'}
                    </button>
                </div>
            `;
        }).join('');
    };

    window.addEkskulModal = function() {
        if (!isAdmin) return;

        let pembinaOptions = '';
        teachers.sort((a,b) => a.nama.localeCompare(b.nama)).forEach(t => {
            pembinaOptions += `<option value="${t.id}">${t.nama}</option>`;
        });

        const formBody = `
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Kegiatan Ekstrakurikuler</label>
                    <input type="text" id="ekskul-name" required placeholder="Contoh: Tahfidz Qur'an, Pramuka, PMR..." class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Pilih Guru Pembina</label>
                    <select id="ekskul-pembina-id" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                        ${pembinaOptions}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Jadwal Latihan</label>
                    <input type="text" id="ekskul-jadwal" required placeholder="Contoh: Sabtu, 13:00 - 15:00" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                </div>
            </div>
        `;

        openModal("Tambah Program Ekstrakurikuler Baru", formBody, "Tambah Ekskul", async () => {
            const name = document.getElementById('ekskul-name').value.trim();
            const pembinaId = document.getElementById('ekskul-pembina-id').value;
            const pmDoc = teachers.find(t => t.id === pembinaId);
            const jadwal = document.getElementById('ekskul-jadwal').value.trim();

            if (!name || !jadwal) return;

            const newEkskul = {
                id: 'ekskul_' + generateId(),
                nama: name,
                pembinaId,
                pembinaNama: pmDoc ? pmDoc.nama : '',
                jadwal,
                siswaIds: [],
                status: 'aktif'
            };

            extracurriculars.push(newEkskul);
            await dbService.saveData('extracurriculars', extracurriculars);
            closeModal();
            renderEkskulTab();
            showToast(`Ekskul ${name} berhasil ditambahkan!`);
        });
    };

    window.manageEkskulModal = function(id) {
        const ek = extracurriculars.find(item => item.id === id);
        if (!ek) return;

        const canManage = isAdmin || (isPembinaEkskul && currentTeacher && ek.pembinaId === currentTeacher.id);

        let nonMembers = students.filter(s => !(ek.siswaIds || []).includes(s.id)).sort((a,b) => a.nama.localeCompare(b.nama));
        let selectNonMembersHtml = nonMembers.map(s => `<option value="${s.id}">${s.nama} (${s.kelas})</option>`).join('');

        window.renderEkskulMembersTable = () => {
            const mList = document.getElementById('ekskul-members-list');
            if (!mList) return;

            const mIds = ek.siswaIds || [];
            const ekMembers = students.filter(s => mIds.includes(s.id));

            if (ekMembers.length === 0) {
                mList.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-slate-400 text-xs">Belum ada anggota terdaftar.</td></tr>`;
                return;
            }

            mList.innerHTML = ekMembers.map((s, idx) => `
                <tr class="border-b border-slate-100 dark:border-slate-800/40">
                    <td class="p-2 text-center text-[11px] text-slate-500">${idx + 1}</td>
                    <td class="p-2 text-[11px] font-bold text-slate-850 dark:text-slate-200">${s.nama}</td>
                    <td class="p-2 text-[11px] text-center">${s.kelas}</td>
                    <td class="p-2 text-center">
                        ${canManage ? `
                            <button onclick="window.removeEkskulMember('${s.id}')" class="text-rose-500 hover:text-rose-700"><i class="ph ph-trash"></i></button>
                        ` : '-'}
                    </td>
                </tr>
            `).join('');
        };

        const formBody = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                    <div>
                        <div class="text-[10px] text-slate-400 font-bold uppercase">Nama Program</div>
                        <div class="text-xs font-bold text-slate-700 dark:text-slate-300">${ek.nama}</div>
                    </div>
                    <div>
                        <div class="text-[10px] text-slate-400 font-bold uppercase">Pembina</div>
                        <div class="text-xs font-bold text-slate-700 dark:text-slate-300">${ek.pembinaNama}</div>
                    </div>
                </div>

                <!-- Schedule management -->
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Ubah Jadwal Latihan</label>
                    <div class="flex gap-2">
                        <input type="text" id="ek-schedule-edit" value="${ek.jadwal || ''}" class="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none" ${canManage ? '' : 'disabled'}>
                        ${canManage ? `
                            <button onclick="window.saveEkskulSchedule()" class="px-3 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-lg text-xs font-bold">Simpan</button>
                        ` : ''}
                    </div>
                </div>

                <!-- Add Member Form section -->
                ${canManage ? `
                    <div class="border-t pt-3">
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Daftarkan Anggota Baru</label>
                        <div class="flex gap-2">
                            <select id="ek-add-student-select" class="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                                ${selectNonMembersHtml}
                            </select>
                            <button onclick="window.addEkskulMember()" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"><i class="ph ph-plus"></i></button>
                        </div>
                    </div>
                ` : ''}

                <!-- Members List Table -->
                <div class="border-t pt-3">
                    <label class="block text-xs font-semibold text-slate-500 mb-2 uppercase">Daftar Anggota Terdaftar</label>
                    <div class="max-h-[180px] overflow-y-auto border border-slate-200 dark:border-slate-700/60 rounded-xl">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr class="bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700/60">
                                    <th class="p-2 w-10 text-center">No</th>
                                    <th class="p-2">Nama</th>
                                    <th class="p-2 w-20 text-center">Kelas</th>
                                    <th class="p-2 w-14 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="ekskul-members-list"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        openModal("Kelola Kegiatan Ekstrakurikuler", formBody, null, null);
        window.renderEkskulMembersTable();

        window.saveEkskulSchedule = async () => {
            const newSchedule = document.getElementById('ek-schedule-edit').value.trim();
            if (!newSchedule) return;
            ek.jadwal = newSchedule;
            const idx = extracurriculars.findIndex(item => item.id === id);
            if (idx !== -1) {
                extracurriculars[idx] = ek;
                await dbService.saveData('extracurriculars', extracurriculars);
                renderEkskulTab();
                showToast("Jadwal latihan berhasil diperbarui!");
            }
        };

        window.addEkskulMember = async () => {
            const select = document.getElementById('ek-add-student-select');
            if (!select) return;
            const sid = select.value;
            if (!sid) return;

            if (!ek.siswaIds) ek.siswaIds = [];
            ek.siswaIds.push(sid);

            const idx = extracurriculars.findIndex(item => item.id === id);
            if (idx !== -1) {
                extracurriculars[idx] = ek;
                await dbService.saveData('extracurriculars', extracurriculars);
                
                // Update UI state
                renderEkskulTab();
                // Refresh modal content options
                nonMembers = students.filter(s => !ek.siswaIds.includes(s.id)).sort((a,b) => a.nama.localeCompare(b.nama));
                selectNonMembersHtml = nonMembers.map(s => `<option value="${s.id}">${s.nama} (${s.kelas})</option>`).join('');
                if (select) select.innerHTML = selectNonMembersHtml;
                
                window.renderEkskulMembersTable();
                showToast("Siswa berhasil terdaftar ke ekskul!");
            }
        };

        window.removeEkskulMember = async (sid) => {
            if (!ek.siswaIds) return;
            const memberIdx = ek.siswaIds.indexOf(sid);
            if (memberIdx !== -1) {
                ek.siswaIds.splice(memberIdx, 1);
                const idx = extracurriculars.findIndex(item => item.id === id);
                if (idx !== -1) {
                    extracurriculars[idx] = ek;
                    await dbService.saveData('extracurriculars', extracurriculars);
                    
                    // Update UI state
                    renderEkskulTab();
                    nonMembers = students.filter(s => !ek.siswaIds.includes(s.id)).sort((a,b) => a.nama.localeCompare(b.nama));
                    selectNonMembersHtml = nonMembers.map(s => `<option value="${s.id}">${s.nama} (${s.kelas})</option>`).join('');
                    const select = document.getElementById('ek-add-student-select');
                    if (select) select.innerHTML = selectNonMembersHtml;

                    window.renderEkskulMembersTable();
                    showToast("Anggota berhasil dihapus dari ekskul.");
                }
            }
        };
    };

    window.deleteEkskul = function(id) {
        if (!isAdmin) return;
        const ek = extracurriculars.find(item => item.id === id);
        showConfirmDialog("Hapus Ekskul", `Apakah Anda yakin ingin menghapus program ekstrakurikuler <strong>${ek ? ek.nama : ''}</strong>?`, async () => {
            const idx = extracurriculars.findIndex(item => item.id === id);
            if (idx !== -1) {
                extracurriculars.splice(idx, 1);
                await dbService.saveData('extracurriculars', extracurriculars);
                renderEkskulTab();
                showToast("Ekstrakurikuler telah dihapus.");
            }
        });
    };

    // ============================================
    // TAB 3: PRESTASI SISWA
    // ============================================
    window.renderPrestasiTab = function() {
        const pane = document.getElementById('tab-content-prestasi');
        if (!pane) return;

        let classSelectHtml = `<select id="pres-filter-class" onchange="window.filterPrestasiClass(this.value)" class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs" ${isWaliKelas ? 'disabled' : ''}>
            <option value="">Semua Kelas</option>`;
        const classes = [...new Set(students.map(s => s.kelas))].sort();
        classes.forEach(c => {
            classSelectHtml += `<option value="${c}" ${prestasiClassFilter === c ? 'selected' : ''}>Kelas ${c}</option>`;
        });
        classSelectHtml += `</select>`;

        pane.innerHTML = `
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-2">
                <div class="flex flex-col sm:flex-row flex-1 gap-2 w-full max-w-lg">
                    <div class="relative flex-1">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><i class="ph ph-magnifying-glass"></i></span>
                        <input type="text" id="pres-search-input" value="${prestasiSearchQuery}" oninput="window.searchPrestasi(this.value)" placeholder="Cari nama/jenis lomba..." class="w-full pl-9 pr-4 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                    </div>
                    ${classSelectHtml}
                </div>
                ${isAdmin ? `
                    <button onclick="window.addPrestasiModal()" class="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm w-full md:w-auto">
                        <i class="ph ph-plus"></i> Catat Prestasi
                    </button>
                ` : ''}
            </div>

            <!-- Achievements Table Card -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-700/50 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th class="px-6 py-3 text-center w-12">No</th>
                                <th class="px-6 py-3">Nama Siswa</th>
                                <th class="px-6 py-3 w-24">Kelas</th>
                                <th class="px-6 py-3 w-28">Kategori</th>
                                <th class="px-6 py-3">Nama Prestasi / Penghargaan</th>
                                <th class="px-6 py-3 w-32 text-center">Tingkat</th>
                                <th class="px-6 py-3">Penyelenggara</th>
                                <th class="px-6 py-3 w-32 text-center">Tanggal</th>
                                ${isAdmin ? '<th class="px-6 py-3 w-20 text-center">Aksi</th>' : ''}
                            </tr>
                        </thead>
                        <tbody id="prestasi-table-body"></tbody>
                    </table>
                </div>
            </div>
        `;

        window.renderPrestasiTableList();
    };

    window.renderPrestasiTableList = () => {
        const tbody = document.getElementById('prestasi-table-body');
        if (!tbody) return;

        const filtered = achievements.filter(ach => {
            if (isWaliKelas && waliKelasClass && ach.kelas !== waliKelasClass) return false;
            
            const matchSearch = ach.siswaNama.toLowerCase().includes(prestasiSearchQuery.toLowerCase()) || 
                                ach.prestasi.toLowerCase().includes(prestasiSearchQuery.toLowerCase());
            const matchClass = !prestasiClassFilter || ach.kelas === prestasiClassFilter;
            return matchSearch && matchClass;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${isAdmin ? '9' : '8'}" class="px-6 py-8 text-center text-xs text-slate-400 dark:text-slate-500">Tidak ada data prestasi ditemukan.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map((ach, idx) => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/20 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <td class="px-6 py-3.5 text-xs text-slate-500 text-center">${idx + 1}</td>
                <td class="px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">${ach.siswaNama}</td>
                <td class="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-400">${ach.kelas}</td>
                <td class="px-6 py-3.5 text-xs"><span class="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-450 font-bold text-[9px]">${ach.kategori}</span></td>
                <td class="px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">${ach.prestasi}</td>
                <td class="px-6 py-3.5 text-xs text-center font-bold text-forest-700 dark:text-forest-450">${ach.tingkat}</td>
                <td class="px-6 py-3.5 text-xs text-slate-500">${ach.penyelenggara || '-'}</td>
                <td class="px-6 py-3.5 text-xs text-center text-slate-500">${formatTanggalIndonesia(ach.tanggal)}</td>
                ${isAdmin ? `
                    <td class="px-6 py-3.5 text-xs text-center">
                        <button onclick="window.deletePrestasi('${ach.id}')" class="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"><i class="ph ph-trash text-base"></i></button>
                    </td>
                ` : ''}
            </tr>
        `).join('');
    };

    window.filterPrestasiClass = function(val) {
        prestasiClassFilter = val;
        window.renderPrestasiTableList();
    };

    window.searchPrestasi = function(val) {
        prestasiSearchQuery = val;
        window.renderPrestasiTableList();
    };

    window.addPrestasiModal = function() {
        if (!isAdmin) return;

        let studentOptions = '';
        students.sort((a,b) => a.nama.localeCompare(b.nama)).forEach(s => {
            studentOptions += `<option value="${s.id}">${s.nama} (${s.kelas})</option>`;
        });

        const formBody = `
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Pilih Siswa Berprestasi</label>
                    <select id="p-siswa-id" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                        ${studentOptions}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Kategori Prestasi</label>
                        <select id="p-kategori" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="Sains">Sains / Akademik</option>
                            <option value="Olahraga">Olahraga</option>
                            <option value="Keagamaan">Keagamaan (MHQ/MTQ)</option>
                            <option value="Seni">Seni & Budaya</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tingkat Prestasi</label>
                        <select id="p-tingkat" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="Nasional">Nasional</option>
                            <option value="Provinsi">Provinsi</option>
                            <option value="Kabupaten/Kota">Kabupaten / Kota</option>
                            <option value="Kecamatan">Kecamatan</option>
                            <option value="Internal">Internal Madrasah</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Lomba / Pencapaian Prestasi</label>
                    <input type="text" id="p-prestasi" required placeholder="Contoh: Juara 1 Olimpiade Matematika Nasional" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Penyelenggara</label>
                        <input type="text" id="p-penyelenggara" required placeholder="Contoh: Kemenag RI, Dinas Pendidikan..." class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tanggal Penerimaan Piagam</label>
                        <input type="date" id="p-tanggal" value="${new Date().toISOString().split('T')[0]}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                </div>
            </div>
        `;

        openModal("Tambah Catatan Prestasi Siswa", formBody, "Simpan Prestasi", async () => {
            const sid = document.getElementById('p-siswa-id').value;
            const sDoc = students.find(s => s.id === sid);
            if (!sDoc) return;

            const name = document.getElementById('p-prestasi').value.trim();
            const organizer = document.getElementById('p-penyelenggara').value.trim();

            if (!name || !organizer) return;

            const newAch = {
                id: 'ach_' + generateId(),
                siswaId: sid,
                siswaNama: sDoc.nama,
                kelas: sDoc.kelas,
                kategori: document.getElementById('p-kategori').value,
                tingkat: document.getElementById('p-tingkat').value,
                prestasi: name,
                penyelenggara: organizer,
                tanggal: document.getElementById('p-tanggal').value,
                status: 'aktif'
            };

            achievements.push(newAch);
            await dbService.saveData('student_achievements', achievements);
            closeModal();
            renderPrestasiTab();
            showToast("Prestasi siswa berhasil dicatat!");
        });
    };

    window.deletePrestasi = function(id) {
        if (!isAdmin) return;
        const ach = achievements.find(item => item.id === id);
        showConfirmDialog("Hapus Prestasi", `Apakah Anda yakin ingin menghapus catatan prestasi <strong>${ach ? ach.prestasi : ''}</strong>?`, async () => {
            const idx = achievements.findIndex(item => item.id === id);
            if (idx !== -1) {
                achievements.splice(idx, 1);
                await dbService.saveData('student_achievements', achievements);
                renderPrestasiTab();
                showToast("Catatan prestasi telah dihapus.");
            }
        });
    };

    // ============================================
    // TAB 4: STRUKTUR OSIM & AGENDA
    // ============================================
    window.renderOsimTab = function() {
        const pane = document.getElementById('tab-content-osim');
        if (!pane) return;

        pane.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- OSIM Committee Structure Card -->
                <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4">
                    <div class="flex justify-between items-center pb-2 border-b">
                        <div>
                            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Pengurus OSIM</h4>
                            <div class="text-[9px] font-bold text-slate-400">Periode Pelajaran ${osim.tahunAjaran || '2026/2027'}</div>
                        </div>
                        ${isAdmin ? `
                            <button onclick="window.editOsimCommitteeModal()" class="px-2.5 py-1 text-[10px] font-bold text-forest-700 bg-forest-50 dark:bg-forest-900/10 hover:bg-forest-100 rounded-lg transition-all">Ubah</button>
                        ` : ''}
                    </div>
                    
                    <div class="space-y-3.5">
                        <div class="space-y-1">
                            <div class="text-[10px] text-slate-400 font-bold uppercase">Pembina OSIM</div>
                            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">${osim.pembinaNama || '-'}</div>
                        </div>
                        <div class="space-y-2">
                            <div class="text-[10px] text-slate-400 font-bold uppercase pb-1 border-b border-dashed">Struktur Pengurus Inti</div>
                            ${osim.pengurus && osim.pengurus.length > 0 ? osim.pengurus.map(p => `
                                <div class="flex justify-between items-center text-xs">
                                    <span class="text-slate-400 font-medium">${p.jabatan}</span>
                                    <span class="font-bold text-slate-800 dark:text-slate-200 text-right">${p.nama} <span class="text-[10px] font-medium text-slate-400">(${p.kelas})</span></span>
                                </div>
                            `).join('') : '<div class="text-xs text-slate-400 italic">Belum ada pengurus diatur.</div>'}
                        </div>
                    </div>

                    <button onclick="window.printOsimSK()" class="w-full py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850/60 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 mt-4">
                        <i class="ph ph-file-text"></i> Cetak SK Pengurus OSIM
                    </button>
                </div>

                <!-- OSIM Work Plan / Agenda Card -->
                <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4">
                    <div class="flex justify-between items-center pb-2 border-b">
                        <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Program Kerja & Agenda OSIM</h4>
                        ${isAdmin ? `
                            <button onclick="window.addOsimAgendaModal()" class="px-3 py-1.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold flex items-center gap-1"><i class="ph ph-plus"></i> Tambah Agenda</button>
                        ` : ''}
                    </div>

                    <div class="overflow-x-auto border rounded-xl">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr class="bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700/60">
                                    <th class="p-3">Agenda Kegiatan</th>
                                    <th class="p-3 w-32 text-center">Tanggal</th>
                                    <th class="p-3 w-28 text-center">Status</th>
                                    ${isAdmin ? '<th class="p-3 w-24 text-center">Aksi</th>' : ''}
                                </tr>
                            </thead>
                            <tbody>
                                ${(osim.agenda || []).map(ag => `
                                    <tr class="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50">
                                        <td class="p-3">
                                            <div class="font-bold text-slate-800 dark:text-slate-250">${ag.kegiatan}</div>
                                            <div class="text-[10px] text-slate-400 mt-0.5">${ag.deskripsi || '-'}</div>
                                        </td>
                                        <td class="p-3 text-center text-slate-500 font-mono text-[10px]">${formatTanggalIndonesia(ag.tanggal)}</td>
                                        <td class="p-3 text-center">
                                            <span class="px-2 py-0.5 rounded font-bold text-[9px] ${ag.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20' : ag.status === 'Dalam Proses' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}">${ag.status}</span>
                                        </td>
                                        ${isAdmin ? `
                                            <td class="p-3 text-center space-x-1.5">
                                                <button onclick="window.editOsimAgendaModal('${ag.id}')" class="text-amber-500 hover:text-amber-700"><i class="ph ph-pencil-simple"></i></button>
                                                <button onclick="window.deleteOsimAgenda('${ag.id}')" class="text-rose-500 hover:text-rose-700"><i class="ph ph-trash"></i></button>
                                            </td>
                                        ` : ''}
                                    </tr>
                                `).join('')}
                                ${(!osim.agenda || osim.agenda.length === 0) ? `
                                    <tr>
                                        <td colspan="${isAdmin ? '4' : '3'}" class="p-6 text-center text-slate-400">Belum ada agenda program kerja terdaftar.</td>
                                    </tr>
                                ` : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    };

    window.editOsimCommitteeModal = function() {
        if (!isAdmin) return;

        let pembinaOptions = '';
        teachers.forEach(t => {
            pembinaOptions += `<option value="${t.nama}" ${osim.pembinaNama === t.nama ? 'selected' : ''}>${t.nama}</option>`;
        });

        let studentOptions = '<option value="">Pilih Siswa</option>';
        students.sort((a,b) => a.nama.localeCompare(b.nama)).forEach(s => {
            studentOptions += `<option value="${s.id}">${s.nama} (${s.kelas})</option>`;
        });

        // Initialize variables for pengurus harian
        const rolesList = ["Ketua OSIM", "Wakil Ketua OSIM", "Sekretaris I", "Bendahara I"];
        let structureForm = '';

        rolesList.forEach((roleName, rIdx) => {
            const currentObj = osim.pengurus ? osim.pengurus.find(p => p.jabatan === roleName) : null;
            structureForm += `
                <div class="grid grid-cols-2 gap-3 items-center">
                    <div class="text-xs font-bold text-slate-600">${roleName}</div>
                    <select id="osim-role-${rIdx}" class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                        ${studentOptions}
                    </select>
                </div>
            `;
        });

        const formBody = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tahun Ajaran</label>
                        <input type="text" id="osim-ta" value="${osim.tahunAjaran || '2026/2027'}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Pembina OSIM</label>
                        <select id="osim-pembina-name" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            ${pembinaOptions}
                        </select>
                    </div>
                </div>
                <div class="border-t pt-3 space-y-3">
                    <h5 class="text-xs font-bold text-slate-700 dark:text-slate-350 mb-2 uppercase">Pengurus Harian OSIM</h5>
                    ${structureForm}
                </div>
            </div>
        `;

        openModal("Ubah Struktur Organisasi OSIM", formBody, "Perbarui Struktur", async () => {
            const ta = document.getElementById('osim-ta').value.trim();
            const pembinaNama = document.getElementById('osim-pembina-name').value;
            
            const updatedPengurus = [];
            rolesList.forEach((roleName, rIdx) => {
                const sSelect = document.getElementById(`osim-role-${rIdx}`);
                const sid = sSelect ? sSelect.value : '';
                if (sid) {
                    const sDoc = students.find(s => s.id === sid);
                    if (sDoc) {
                        updatedPengurus.push({
                            jabatan: roleName,
                            nama: sDoc.nama,
                            kelas: sDoc.kelas,
                            siswaId: sid
                        });
                    }
                } else {
                    // Retain old value if none selected
                    const oldObj = osim.pengurus ? osim.pengurus.find(p => p.jabatan === roleName) : null;
                    if (oldObj) updatedPengurus.push(oldObj);
                }
            });

            osim.tahunAjaran = ta;
            osim.pembinaNama = pembinaNama;
            osim.pengurus = updatedPengurus;

            await dbService.saveData('osim_committee', osim);
            closeModal();
            renderOsimTab();
            showToast("Struktur pengurus OSIM berhasil diperbarui!");
        });

        // Pre-fill selected values in dropdowns
        setTimeout(() => {
            rolesList.forEach((roleName, rIdx) => {
                const currentObj = osim.pengurus ? osim.pengurus.find(p => p.jabatan === roleName) : null;
                const selectEl = document.getElementById(`osim-role-${rIdx}`);
                if (currentObj && selectEl) {
                    selectEl.value = currentObj.siswaId;
                }
            });
        }, 100);
    };

    window.addOsimAgendaModal = function() {
        if (!isAdmin) return;

        const formBody = `
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Kegiatan / Agenda</label>
                    <input type="text" id="ag-kegiatan" required placeholder="Contoh: Porseni Madrasah 2026..." class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tanggal Pelaksanaan</label>
                        <input type="date" id="ag-tanggal" value="${new Date().toISOString().split('T')[0]}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Status Progres</label>
                        <select id="ag-status" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="Terencana">Terencana</option>
                            <option value="Dalam Proses">Dalam Proses</option>
                            <option value="Selesai">Selesai</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Keterangan / Deskripsi Kegiatan</label>
                    <textarea id="ag-deskripsi" rows="2" placeholder="Tuliskan keterangan detail agenda..." class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></textarea>
                </div>
            </div>
        `;

        openModal("Tambah Agenda Kegiatan OSIM", formBody, "Tambah Agenda", async () => {
            const kegiatan = document.getElementById('ag-kegiatan').value.trim();
            const date = document.getElementById('ag-tanggal').value;
            const status = document.getElementById('ag-status').value;
            const deskripsi = document.getElementById('ag-deskripsi').value.trim();

            if (!kegiatan) return;

            if (!osim.agenda) osim.agenda = [];
            osim.agenda.push({
                id: 'ag_' + generateId(),
                kegiatan,
                tanggal: date,
                status,
                deskripsi
            });

            await dbService.saveData('osim_committee', osim);
            closeModal();
            renderOsimTab();
            showToast("Agenda kegiatan OSIM berhasil ditambahkan!");
        });
    };

    window.editOsimAgendaModal = function(id) {
        if (!isAdmin) return;
        const ag = osim.agenda.find(item => item.id === id);
        if (!ag) return;

        const formBody = `
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Kegiatan / Agenda</label>
                    <input type="text" id="ag-kegiatan" value="${ag.kegiatan}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tanggal Pelaksanaan</label>
                        <input type="date" id="ag-tanggal" value="${ag.tanggal}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Status Progres</label>
                        <select id="ag-status" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="Terencana" ${ag.status==='Terencana'?'selected':''}>Terencana</option>
                            <option value="Dalam Proses" ${ag.status==='Dalam Proses'?'selected':''}>Dalam Proses</option>
                            <option value="Selesai" ${ag.status==='Selesai'?'selected':''}>Selesai</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Keterangan / Deskripsi Kegiatan</label>
                    <textarea id="ag-deskripsi" rows="2" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">${ag.deskripsi || ''}</textarea>
                </div>
            </div>
        `;

        openModal("Ubah Agenda Kegiatan OSIM", formBody, "Perbarui", async () => {
            const idx = osim.agenda.findIndex(item => item.id === id);
            if (idx !== -1) {
                osim.agenda[idx] = {
                    id,
                    kegiatan: document.getElementById('ag-kegiatan').value.trim(),
                    tanggal: document.getElementById('ag-tanggal').value,
                    status: document.getElementById('ag-status').value,
                    deskripsi: document.getElementById('ag-deskripsi').value.trim()
                };

                await dbService.saveData('osim_committee', osim);
                closeModal();
                renderOsimTab();
                showToast("Agenda kegiatan OSIM berhasil diperbarui!");
            }
        });
    };

    window.deleteOsimAgenda = function(id) {
        if (!isAdmin) return;
        showConfirmDialog("Hapus Agenda", "Apakah Anda yakin ingin menghapus agenda kegiatan OSIM ini?", async () => {
            const idx = osim.agenda.findIndex(item => item.id === id);
            if (idx !== -1) {
                osim.agenda.splice(idx, 1);
                await dbService.saveData('osim_committee', osim);
                renderOsimTab();
                showToast("Agenda OSIM telah dihapus.");
            }
        });
    };

    // ============================================
    // PRINT SHEETS GENERATOR (Landscape & Portrait)
    // ============================================
    window.printRekapDisiplin = function() {
        const pointsMap = getCumulativePointsMap();
        
        // Filter students list based on current active class filters for report
        const targetStudents = students.filter(s => {
            if (isWaliKelas && waliKelasClass && s.kelas !== waliKelasClass) return false;
            return !bkClassFilter || s.kelas === bkClassFilter;
        }).sort((a,b) => a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama));

        const kopSurat = `
            <div class="kop-surat">
                <div class="kop-yayasan">YAYASAN IDRISIYYAH TASIKMALAYA</div>
                <div class="kop-madrasah">MADRASAH TSANAWIYAH (MTs) IDRISIYYAH</div>
                <div class="kop-info">STATUS: TERAKREDITASI A (SANGAT BAIK) | NSM: 121132780001 | NPSN: 20210855</div>
                <div class="kop-info">Alamat: Jl. Raya Ciawi No. 12, Tasikmalaya | Telp: (0265) 323456 | Website: https://mtsidrisiyyah.sch.id</div>
            </div>
        `;

        const titleText = bkClassFilter ? `LAPORAN REKAPITULASI POIN KEDISIPLINAN SISWA KELAS ${bkClassFilter}` : "LAPORAN REKAPITULASI POIN KEDISIPLINAN SISWA";
        const dateStr = formatTanggalIndonesia(new Date().toISOString().split('T')[0]);

        let tableRows = '';
        targetStudents.forEach((s, idx) => {
            const pts = pointsMap[s.id] || 0;
            const status = getPointStatus(pts);
            
            // Gather violation descriptions
            const sVils = violations.filter(v => v.siswaId === s.id);
            const description = sVils.map(v => `- ${v.pelanggaran} (${v.poin} Poin)`).join('<br>') || 'Tidak ada pelanggaran';
            const actionTaken = sVils.map(v => `- ${v.tindakan}`).join('<br>') || '-';

            tableRows += `
                <tr>
                    <td class="center-text">${idx + 1}</td>
                    <td class="center-text">${s.nisn}</td>
                    <td class="text-bold">${s.nama}</td>
                    <td class="center-text">${s.kelas}</td>
                    <td class="center-text">${s.jk === 'L' ? 'L' : 'P'}</td>
                    <td class="center-text text-bold" style="${pts > 50 ? 'color: red;' : ''}">${pts}</td>
                    <td>${description}</td>
                    <td>${actionTaken}</td>
                    <td class="center-text text-bold">${status.label}</td>
                </tr>
            `;
        });

        const printBody = `
            ${kopSurat}
            <div class="document-title">${titleText}</div>
            <div style="font-size: 10pt; margin-bottom: 10px; font-weight: bold;">Tahun Ajaran: ${osim.tahunAjaran || '2026/2027'}</div>
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 5%;">No</th>
                        <th style="width: 10%;">NISN</th>
                        <th style="width: 20%;">Nama Lengkap</th>
                        <th style="width: 8%;">Kelas</th>
                        <th style="width: 5%;">JK</th>
                        <th style="width: 8%;">Total Poin</th>
                        <th style="width: 20%;">Rincian Pelanggaran</th>
                        <th style="width: 15%;">Tindakan Pembinaan</th>
                        <th style="width: 12%;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div class="signature-section">
                <div class="signature-col">
                    <div>Mengetahui,</div>
                    <div>Kepala MTs Idrisiyyah,</div>
                    <div class="signature-space"></div>
                    <div class="text-bold">H. Ahmad Fauzian, M.Pd.</div>
                    <div>NIP. 197804152006041003</div>
                </div>
                <div class="signature-col">
                    <div>Tasikmalaya, ${dateStr}</div>
                    <div>Waka Kesiswaan / Staf BK,</div>
                    <div class="signature-space"></div>
                    <div class="text-bold">Zainal Abidin, S.Pd.</div>
                    <div>NIP. -</div>
                </div>
            </div>
        `;

        printDocument("Rekap_Disiplin_A4_Landscape", printBody, true);
        showToast("Membuka dialog pencetakan rekap kedisiplinan...");
    };

    window.printOsimSK = function() {
        const kopSurat = `
            <div class="kop-surat">
                <div class="kop-yayasan">YAYASAN IDRISIYYAH TASIKMALAYA</div>
                <div class="kop-madrasah">MADRASAH TSANAWIYAH (MTs) IDRISIYYAH</div>
                <div class="kop-info">STATUS: TERAKREDITASI A (SANGAT BAIK) | NSM: 121132780001 | NPSN: 20210855</div>
                <div class="kop-info">Alamat: Jl. Raya Ciawi No. 12, Tasikmalaya | Telp: (0265) 323456 | Website: https://mtsidrisiyyah.sch.id</div>
            </div>
        `;

        let committeeRows = '';
        if (osim.pengurus && osim.pengurus.length > 0) {
            osim.pengurus.forEach((p, idx) => {
                committeeRows += `
                    <tr>
                        <td class="center-text">${idx + 1}</td>
                        <td class="text-bold">${p.jabatan}</td>
                        <td>${p.nama}</td>
                        <td class="center-text">${p.kelas}</td>
                    </tr>
                `;
            });
        } else {
            committeeRows = `<tr><td colspan="4" class="center-text italic">Data pengurus belum diisi.</td></tr>`;
        }

        const dateStr = formatTanggalIndonesia(new Date().toISOString().split('T')[0]);

        const printBody = `
            ${kopSurat}
            <div class="document-title">
                KEPUTUSAN KEPALA MADRASAH TSANAWIYAH IDRISIYYAH<br>
                NOMOR: 421.3/085/MTs.02/OSIM/2026
            </div>
            <div class="sk-number">
                TENTANG<br>
                <strong>SUSUNAN PENGURUS ORGANISASI SISWA INTRA MADRASAH (OSIM)<br>
                MTs IDRISIYYAH TASIKMALAYA PERIODE ${osim.tahunAjaran || '2026/2027'}</strong>
            </div>

            <div class="sk-body">
                <div class="sk-section-title">Menimbang:</div>
                <div style="padding-left: 20px; text-indent: -20px;">a. Bahwa untuk menjamin kesinambungan kepemimpinan dan pelaksanaan program kerja OSIM, dipandang perlu untuk mengesahkan susunan pengurus OSIM MTs Idrisiyyah Tasikmalaya.</div>
                <div style="padding-left: 20px; text-indent: -20px;">b. Bahwa siswa-siswi yang namanya tercantum dalam lampiran surat keputusan ini dianggap cakap dan memenuhi syarat untuk ditunjuk sebagai pengurus OSIM.</div>

                <div class="sk-section-title">Mengingat:</div>
                <div style="padding-left: 20px; text-indent: -20px;">1. Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional.</div>
                <div style="padding-left: 20px; text-indent: -20px;">2. Peraturan Menteri Pendidikan Nasional Nomor 39 Tahun 2008 tentang Pembinaan Kesiswaan.</div>
                <div style="padding-left: 20px; text-indent: -20px;">3. Program Kerja Madrasah Bidang Kesiswaan Tahun Ajaran ${osim.tahunAjaran || '2026/2027'}.</div>

                <div class="sk-section-title" style="text-align: center; margin-top: 20px;">MEMUTUSKAN</div>
                <div class="sk-section-title">Menetapkan:</div>
                <div style="padding-left: 20px; text-indent: -20px;">PERTAMA : Mengesahkan Susunan Pengurus Organisasi Siswa Intra Madrasah (OSIM) MTs Idrisiyyah Tasikmalaya Periode ${osim.tahunAjaran || '2026/2027'} sebagaimana tercantum dalam lampiran surat keputusan ini.</div>
                <div style="padding-left: 20px; text-indent: -20px;">KEDUA : Menugaskan pengurus OSIM untuk melaksanakan kegiatan kesiswaan berpedoman pada AD/ART OSIM dan program kerja yang disetujui Pembina OSIM.</div>
                <div style="padding-left: 20px; text-indent: -20px;">KETIGA : Keputusan ini berlaku sejak tanggal ditetapkan, dan apabila terdapat kekeliruan akan diadakan perbaikan sebagaimana mestinya.</div>
            </div>

            <div style="page-break-before: always;"></div>
            ${kopSurat}
            <div class="document-title" style="font-size: 11pt; text-align: left; margin-bottom: 10px;">
                Lampiran SK Kepala MTs Idrisiyyah<br>
                Nomor : 421.3/085/MTs.02/OSIM/2026<br>
                Tanggal : 13 Juli 2026
            </div>
            
            <div class="document-title" style="margin-top: 15px;">SUSUNAN PENGURUS HARIAN OSIM MTs IDRISIYYAH</div>
            <div style="font-size: 10pt; margin-bottom: 5px;"><strong>Pembina OSIM: ${osim.pembinaNama || '-'}</strong></div>
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 10%;">No</th>
                        <th style="width: 30%;">Jabatan</th>
                        <th style="width: 45%;">Nama Pengurus</th>
                        <th style="width: 15%;">Kelas</th>
                    </tr>
                </thead>
                <tbody>
                    ${committeeRows}
                </tbody>
            </table>

            <div class="signature-section">
                <div class="signature-col">
                    <div>Ditetapkan di: Tasikmalaya</div>
                    <div>Pada tanggal: 13 Juli 2026</div>
                    <div>Kepala MTs Idrisiyyah,</div>
                    <div class="signature-space"></div>
                    <div class="text-bold">H. Ahmad Fauzian, M.Pd.</div>
                    <div>NIP. 197804152006041003</div>
                </div>
            </div>
        `;

        printDocument("SK_OSIM_A4_Portrait", printBody, false);
        showToast("Membuka dialog pencetakan Surat Keputusan OSIM...");
    };

    // Private helper for hidden iframe printing
    function printDocument(title, bodyHtml, landscape = false) {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
        
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    @page {
                        size: A4 ${landscape ? 'landscape' : 'portrait'};
                        margin: 1.5cm;
                    }
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        color: #000;
                        margin: 0;
                        padding: 0;
                        font-size: 11pt;
                        line-height: 1.4;
                    }
                    .kop-surat {
                        text-align: center;
                        border-bottom: 3px double #000;
                        padding-bottom: 8px;
                        margin-bottom: 15px;
                    }
                    .kop-yayasan {
                        font-size: 12pt;
                        font-weight: bold;
                    }
                    .kop-madrasah {
                        font-size: 16pt;
                        font-weight: bold;
                        margin: 1px 0;
                    }
                    .kop-info {
                        font-size: 9pt;
                        font-style: italic;
                    }
                    .document-title {
                        text-align: center;
                        font-weight: bold;
                        font-size: 12pt;
                        text-transform: uppercase;
                        margin-top: 10px;
                        margin-bottom: 5px;
                    }
                    .sk-number {
                        text-align: center;
                        font-size: 10pt;
                        margin-bottom: 15px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 12px 0;
                        font-size: 10pt;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 5px 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                        text-align: center;
                    }
                    .center-text {
                        text-align: center;
                    }
                    .right-text {
                        text-align: right;
                    }
                    .text-bold {
                        font-weight: bold;
                    }
                    .signature-section {
                        margin-top: 30px;
                        width: 100%;
                        display: flex;
                        justify-content: ${landscape ? 'space-between' : 'flex-end'};
                    }
                    .signature-col {
                        text-align: center;
                        width: 240px;
                    }
                    .signature-space {
                        height: 55px;
                    }
                    .sk-body {
                        font-size: 10pt;
                        margin-bottom: 15px;
                        text-align: justify;
                    }
                    .sk-section-title {
                        font-weight: bold;
                        margin-top: 10px;
                        margin-bottom: 4px;
                    }
                </style>
            </head>
            <body>
                ${bodyHtml}
            </body>
            </html>
        `);
        doc.close();
        
        iframe.contentWindow.focus();
        setTimeout(() => {
            iframe.contentWindow.print();
            document.body.removeChild(iframe);
        }, 500);
    }

    // Default load tab BK on startup
    window.switchKesiswaanTab('bk');
}
