// ============================================
// TRADISI — Rombongan Belajar Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, openModal, closeModal, showConfirmDialog } = ctx;

    // Load data
    const homerooms = await dbService.getData('homerooms') || [];
    const teachers = await dbService.getData('teachers') || [];
    const students = await dbService.getData('siswa') || [];
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

    // Calculate how many students are assigned in active TP/Semester
    const assignedStudentIds = new Set();
    homerooms.forEach(r => {
        if (r.tahunPelajaran === activeTP && r.semester === activeSemester && Array.isArray(r.siswaIds)) {
            r.siswaIds.forEach(id => assignedStudentIds.add(id));
        }
    });
    const totalAssigned = assignedStudentIds.size;
    const totalUnassigned = students.length - totalAssigned;

    window.renderRombelList = function() {
        const grid = document.getElementById('rombel-grid');
        if (!grid) return;
        if (homerooms.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-12 text-center text-xs text-slate-500">
                    <i class="ph ph-users-three text-3xl text-slate-400 mb-2 block"></i>
                    Belum ada rombongan belajar dibentuk untuk periode ini.
                </div>
            `;
            return;
        }

        grid.innerHTML = homerooms.map(r => {
            const numSiswa = Array.isArray(r.siswaIds) ? r.siswaIds.length : 0;
            
            // Calculate gender counts in this rombel
            let lCount = 0;
            let pCount = 0;
            if (Array.isArray(r.siswaIds)) {
                r.siswaIds.forEach(sid => {
                    const s = students.find(item => item.id === sid);
                    if (s) {
                        if (s.jk === 'L') lCount++;
                        else if (s.jk === 'P') pCount++;
                    }
                });
            }

            return `
                <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm flex flex-col justify-between hover:border-forest-500/50 dark:hover:border-forest-500/40 transition-all duration-300">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="px-2.5 py-0.5 rounded-full font-extrabold text-[10px] bg-forest-100 text-forest-700 dark:bg-forest-900/30 dark:text-forest-400">${r.tahunPelajaran} — ${r.semester}</span>
                            <div class="flex gap-1 no-print">
                                <button onclick="editRombelModal('${r.id}')" class="p-1 text-slate-500 hover:text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Ubah Info Rombel"><i class="ph ph-pencil-simple text-base"></i></button>
                                <button onclick="deleteRombel('${r.id}')" class="p-1 text-slate-500 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Hapus Rombel"><i class="ph ph-trash text-base"></i></button>
                            </div>
                        </div>
                        <div>
                            <h3 class="text-lg font-black text-slate-800 dark:text-slate-100">${r.kelas}</h3>
                            <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                                <i class="ph ph-user-circle-gear text-sm text-slate-400"></i>
                                Wali Kelas: <span class="font-semibold text-slate-700 dark:text-slate-350">${r.waliKelasNama || 'Belum Ditugaskan'}</span>
                            </p>
                        </div>
                        <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                            <span class="flex items-center gap-1"><i class="ph ph-users text-sm text-slate-400"></i> <strong class="text-slate-750 dark:text-slate-200 text-xs">${numSiswa}</strong> Siswa</span>
                            <span class="flex gap-2">
                                <span class="text-blue-600 font-semibold">L: ${lCount}</span>
                                <span class="text-pink-600 font-semibold">P: ${pCount}</span>
                            </span>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 no-print">
                        <button onclick="manageRombelStudentsModal('${r.id}')" class="flex-1 text-center py-1.5 px-3 bg-forest-700 hover:bg-forest-800 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1">
                            <i class="ph ph-user-list text-sm"></i> Kelola Siswa
                        </button>
                        <button onclick="showRombelDetailsModal('${r.id}')" class="flex-1 text-center py-1.5 px-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1">
                            <i class="ph ph-eye text-sm"></i> Detail Anggota
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    };

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <!-- Header cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${homerooms.length}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Rombel</div>
                </div>
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${students.length}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Siswa</div>
                </div>
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold text-emerald-600">${totalAssigned}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terbagi Kelas</div>
                </div>
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold ${totalUnassigned > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-400'}">${totalUnassigned}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Belum Ada Kelas</div>
                </div>
            </div>

            <!-- Action Bar -->
            <div class="flex items-center justify-between no-print bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
                <div>
                    <h3 class="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider">Pengaturan Periode Aktif</h3>
                    <p class="text-[10px] text-slate-400 mt-0.5">Tahun Pelajaran: <span class="font-bold text-forest-700">${activeTP}</span> | Semester: <span class="font-bold text-forest-700">${activeSemester}</span></p>
                </div>
                <button onclick="addRombelModal()" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                    <i class="ph ph-plus-circle text-base"></i> Buat Rombel Baru
                </button>
            </div>

            <!-- Rombel Cards Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="rombel-grid"></div>
        </div>
    `;

    window.addRombelModal = async function() {
        const classrooms = await dbService.getData('classrooms') || [];
        const classroomsOptions = classrooms.map(c => `<option value="${c.nama}">${c.nama}</option>`).join('');
        const teachersOptions = teachers.map(t => `<option value="${t.id}">${t.nama}</option>`).join('');

        const formBody = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tahun Pelajaran</label>
                        <input type="text" id="rm-tp" value="${activeTP}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Semester</label>
                        <select id="rm-semester" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="Ganjil" ${activeSemester === 'Ganjil'?'selected':''}>Ganjil</option>
                            <option value="Genap" ${activeSemester === 'Genap'?'selected':''}>Genap</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Pilih Kelas</label>
                        <select id="rm-kelas" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            ${classroomsOptions || '<option value="">(Belum ada kelas)</option>'}
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Wali Kelas</label>
                        <select id="rm-wali" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="">-- Pilih Guru --</option>
                            ${teachersOptions}
                        </select>
                    </div>
                </div>
            </div>
        `;

        openModal("Buat Rombongan Belajar", formBody, "Tambah", async () => {
            const tp = document.getElementById('rm-tp').value.trim();
            const sem = document.getElementById('rm-semester').value;
            const kelasVal = document.getElementById('rm-kelas').value;
            const waliId = document.getElementById('rm-wali').value;
            const wali = teachers.find(t => t.id === waliId);

            if (!kelasVal) {
                showToast("Nama kelas tidak boleh kosong!", "error");
                return;
            }

            // Check if rombel for this class & TP & sem already exists
            if (homerooms.some(r => r.kelas === kelasVal && r.tahunPelajaran === tp && r.semester === sem)) {
                showToast(`Rombel untuk kelas ${kelasVal} pada periode ${tp} (${sem}) sudah terdaftar!`, "error");
                return;
            }

            const newR = {
                id: 'rombel_' + Date.now(),
                tahunPelajaran: tp,
                semester: sem,
                kelas: kelasVal,
                waliKelasId: waliId || "",
                waliKelasNama: wali ? wali.nama : "",
                siswaIds: [],
                status: 'aktif'
            };
            homerooms.push(newR);
            await dbService.saveData('homerooms', homerooms);
            closeModal();
            // Re-render
            window.loadPage('Rombongan Belajar');
            showToast("Rombel baru berhasil dibuat!");
        });
    };

    window.editRombelModal = function(id) {
        const r = homerooms.find(item => item.id === id);
        if (!r) return;

        const teachersOptions = teachers.map(t => `<option value="${t.id}" ${t.id === r.waliKelasId ? 'selected' : ''}>${t.nama}</option>`).join('');

        const formBody = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tahun Pelajaran</label>
                        <input type="text" id="rm-tp" value="${r.tahunPelajaran}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Semester</label>
                        <select id="rm-semester" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="Ganjil" ${r.semester === 'Ganjil'?'selected':''}>Ganjil</option>
                            <option value="Genap" ${r.semester === 'Genap'?'selected':''}>Genap</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Wali Kelas</label>
                    <select id="rm-wali" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                        <option value="">-- Pilih Guru --</option>
                        ${teachersOptions}
                    </select>
                </div>
            </div>
        `;

        openModal("Ubah Rombongan Belajar", formBody, "Perbarui", async () => {
            const index = homerooms.findIndex(item => item.id === id);
            if (index !== -1) {
                const waliId = document.getElementById('rm-wali').value;
                const wali = teachers.find(t => t.id === waliId);

                homerooms[index] = {
                    ...homerooms[index],
                    tahunPelajaran: document.getElementById('rm-tp').value.trim(),
                    semester: document.getElementById('rm-semester').value,
                    waliKelasId: waliId || "",
                    waliKelasNama: wali ? wali.nama : ""
                };
                await dbService.saveData('homerooms', homerooms);
            }
            closeModal();
            window.loadPage('Rombongan Belajar');
            showToast("Data rombel berhasil diperbarui!");
        });
    };

    window.deleteRombel = function(id) {
        const r = homerooms.find(item => item.id === id);
        showConfirmDialog("Hapus Rombongan Belajar", `Hapus rombel kelas <strong>${r ? r.kelas : ''}</strong>? Siswa di dalamnya tidak akan terhapus, hanya dibebaskan kelasnya.`, () => {
            const index = homerooms.findIndex(item => item.id === id);
            if (index !== -1) {
                homerooms.splice(index, 1);
                dbService.softDeleteItem('homerooms', id).then(() => {
                    window.loadPage('Rombongan Belajar');
                    showToast("Rombel telah dihapus.");
                });
            }
        });
    };

    // Modal to Manage Students in Rombel (Kelola Anggota)
    window.manageRombelStudentsModal = function(rombelId) {
        const r = homerooms.find(item => item.id === rombelId);
        if (!r) return;

        // Get currently assigned students in other classes in the same period
        const otherRombelStudentIds = new Set();
        homerooms.forEach(hr => {
            if (hr.id !== rombelId && hr.tahunPelajaran === r.tahunPelajaran && hr.semester === r.semester && Array.isArray(hr.siswaIds)) {
                hr.siswaIds.forEach(id => otherRombelStudentIds.add(id));
            }
        });

        // Current assigned students in this class
        const currentStudentIds = new Set(r.siswaIds || []);

        const renderStudentCheckboxes = function(filterUnassignedOnly = false, searchStr = '') {
            const listEl = document.getElementById('rombel-student-selector-list');
            if (!listEl) return;

            const filteredStudents = students.filter(s => {
                const isAssignedElsewhere = otherRombelStudentIds.has(s.id);
                const isAssignedHere = currentStudentIds.has(s.id);
                
                // If filterUnassignedOnly, exclude students assigned in other rombels and also those not here
                if (filterUnassignedOnly && isAssignedElsewhere) return false;
                
                const matchSearch = s.nama.toLowerCase().includes(searchStr.toLowerCase()) || 
                                    (s.nisn && s.nisn.includes(searchStr)) || 
                                    (s.nis && s.nis.includes(searchStr));
                
                return matchSearch;
            });

            if (filteredStudents.length === 0) {
                listEl.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Siswa tidak ditemukan atau sudah terbagi ke kelas lain.</p>`;
                return;
            }

            listEl.innerHTML = filteredStudents.map(s => {
                const isAssignedElsewhere = otherRombelStudentIds.has(s.id);
                const isHere = currentStudentIds.has(s.id);
                
                let statusLabel = '';
                let disabledAttr = '';
                if (isAssignedElsewhere) {
                    const otherRombelName = homerooms.find(hr => hr.siswaIds && hr.siswaIds.includes(s.id))?.kelas || 'Kelas Lain';
                    statusLabel = `<span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-500 text-[9px] rounded-full uppercase font-bold">Terdaftar di ${otherRombelName}</span>`;
                    disabledAttr = 'disabled';
                } else if (isHere) {
                    statusLabel = `<span class="px-2 py-0.5 bg-forest-100 dark:bg-forest-950 text-forest-700 dark:text-forest-400 text-[9px] rounded-full uppercase font-bold">Di Rombel Ini</span>`;
                } else {
                    statusLabel = `<span class="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-[9px] rounded-full uppercase font-bold">Belum Terbagi</span>`;
                }

                return `
                    <label class="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer select-none ${isHere ? 'bg-forest-500/5 border-forest-500/20' : ''}">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <input type="checkbox" data-student-id="${s.id}" ${isHere ? 'checked' : ''} ${disabledAttr} onchange="toggleStudentSelection('${s.id}', this.checked)" class="w-4 h-4 rounded text-forest-700 border-slate-350 focus:ring-forest-500 cursor-pointer">
                            <div class="text-left">
                                <p class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">${s.nama}</p>
                                <p class="text-[9px] text-slate-400">${s.nisn || '-'} | JK: ${s.jk}</p>
                            </div>
                        </div>
                        <div class="no-print">
                            ${statusLabel}
                        </div>
                    </label>
                `;
            }).join('');
        };

        window.toggleStudentSelection = function(sid, isChecked) {
            if (isChecked) {
                currentStudentIds.add(sid);
            } else {
                currentStudentIds.delete(sid);
            }
            // Update counter
            const cnt = document.getElementById('selected-students-count');
            if (cnt) cnt.innerText = currentStudentIds.size;
        };

        window.filterRombelStudents = function() {
            const search = document.getElementById('search-rombel-student').value;
            const filterUnassigned = document.getElementById('chk-unassigned-only').checked;
            renderStudentCheckboxes(filterUnassigned, search);
        };

        const modalBody = `
            <div class="space-y-4">
                <div class="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl">
                    <div class="text-left">
                        <h4 class="text-xs font-black text-slate-850 dark:text-slate-150">Rombel: ${r.kelas}</h4>
                        <p class="text-[10px] text-slate-400">Pilih siswa yang akan ditempatkan di rombel ini. Jumlah Terpilih: <strong id="selected-students-count" class="text-forest-700 dark:text-forest-400">${currentStudentIds.size}</strong></p>
                    </div>
                    <label class="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-650 dark:text-slate-400">
                        <input type="checkbox" id="chk-unassigned-only" onchange="filterRombelStudents()" class="rounded border-slate-350 text-forest-750 focus:ring-forest-500"> Sembunyikan Siswa Ber-Kelas
                    </label>
                </div>
                <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><i class="ph ph-magnifying-glass"></i></span>
                    <input type="text" id="search-rombel-student" oninput="filterRombelStudents()" placeholder="Cari nama siswa / NISN..." class="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                </div>
                <div class="max-h-[300px] overflow-y-auto space-y-2 pr-1" id="rombel-student-selector-list"></div>
            </div>
        `;

        openModal(`Kelola Anggota Kelas — ${r.kelas}`, modalBody, "Simpan Anggota", async () => {
            const index = homerooms.findIndex(item => item.id === rombelId);
            if (index !== -1) {
                homerooms[index].siswaIds = Array.from(currentStudentIds);
                await dbService.saveData('homerooms', homerooms);
            }
            closeModal();
            window.loadPage('Rombongan Belajar');
            showToast("Anggota rombel berhasil diperbarui!");
        });

        // Trigger initial load
        setTimeout(() => {
            renderStudentCheckboxes(false, '');
        }, 100);
    };

    // Modal to Show Rombel Details (Detail Anggota & Excel Export)
    window.showRombelDetailsModal = function(rombelId) {
        const r = homerooms.find(item => item.id === rombelId);
        if (!r) return;

        // Get student objects
        const classStudents = students.filter(s => r.siswaIds && r.siswaIds.includes(s.id));

        const listHtml = classStudents.length === 0 
            ? `<p class="text-xs text-slate-500 text-center py-6">Rombel ini belum memiliki anggota siswa.</p>`
            : `
                <div class="overflow-x-auto max-h-[320px]">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                <th class="px-4 py-2 text-center w-10">No</th>
                                <th class="px-4 py-2 w-28">NISN</th>
                                <th class="px-4 py-2">Nama Siswa</th>
                                <th class="px-4 py-2 w-24">JK</th>
                                <th class="px-4 py-2">HP Ortu</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${classStudents.map((s, i) => `
                                <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/40">
                                    <td class="px-4 py-2 text-center text-slate-500">${i + 1}</td>
                                    <td class="px-4 py-2 font-semibold text-slate-800 dark:text-slate-350">${s.nisn || '-'}</td>
                                    <td class="px-4 py-2 font-bold text-slate-700 dark:text-slate-250">${s.nama}</td>
                                    <td class="px-4 py-2">${s.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                                    <td class="px-4 py-2 text-slate-550 dark:text-slate-400">${s.hpOrtu || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

        const modalBody = `
            <div class="space-y-4">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
                    <div class="text-left">
                        <h4 class="text-base font-extrabold text-slate-800 dark:text-slate-100">${r.kelas}</h4>
                        <p class="text-xs text-slate-500">Wali Kelas: <span class="font-bold">${r.waliKelasNama || '-'}</span></p>
                        <p class="text-[10px] text-slate-400">Tahun Pelajaran: ${r.tahunPelajaran} | Semester: ${r.semester}</p>
                    </div>
                    <button onclick="exportRombelSiswaExcel('${r.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] flex items-center gap-1 shadow-sm transition-all active:scale-98">
                        <i class="ph ph-file-xls text-sm"></i> Unduh Anggota Kelas
                    </button>
                </div>
                ${listHtml}
            </div>
        `;

        openModal(`Detail Anggota Kelas — ${r.kelas}`, modalBody, "Tutup", () => {
            closeModal();
        });
    };

    // Excel Export for class members
    window.exportRombelSiswaExcel = async function(rombelId) {
        const r = homerooms.find(item => item.id === rombelId);
        if (!r) return;

        const classStudents = students.filter(s => r.siswaIds && r.siswaIds.includes(s.id));
        if (classStudents.length === 0) {
            showToast("Tidak ada siswa untuk diexport", "warning");
            return;
        }

        try {
            const xlsx = await loadXlsx();
            const exportData = classStudents.map((s, i) => ({
                "No": i + 1,
                "NIS": s.nis || "",
                "NISN": s.nisn || "",
                "Nama Lengkap": s.nama,
                "Jenis Kelamin": s.jk === "L" ? "Laki-laki" : "Perempuan",
                "Alamat": s.alamat || "",
                "No HP Ortu": s.hpOrtu || ""
            }));

            const worksheet = xlsx.utils.json_to_sheet(exportData);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, `Kelas ${r.kelas}`);
            
            // Set header info in workbook
            xlsx.writeFile(workbook, `Anggota_Kelas_${r.kelas.replace(/[^a-zA-Z0-9]/g, '_')}_${r.tahunPelajaran.replace(/\//g, '_')}.xlsx`);
            showToast("Export anggota kelas berhasil!");
        } catch (err) {
            console.error(err);
            showToast("Gagal export Excel.", "error");
        }
    };

    renderRombelList();
}
