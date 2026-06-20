// ============================================
// TRADISI — Jadwal Pelajaran Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, showConfirmDialog } = ctx;

    // Load data master
    const schedules = await dbService.getData('jadwal') || [];
    const teachers = await dbService.getData('teachers') || [];
    const subjects = await dbService.getData('subjects') || [];
    const classrooms = await dbService.getData('classrooms') || [];

    const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const JAM_SLOTS = [
        { kode: "1-2", label: "Jam 1-2 (07:30 - 09:00)" },
        { kode: "3-4", label: "Jam 3-4 (09:15 - 10:45)" },
        { kode: "5-6", label: "Jam 5-6 (11:00 - 12:30)" },
        { kode: "7-8", label: "Jam 7-8 (13:00 - 14:30)" }
    ];

    window.renderScheduleList = function() {
        const listContainer = document.getElementById('schedule-list-container');
        if (!listContainer) return;

        if (schedules.length === 0) {
            listContainer.innerHTML = `<p class="text-xs text-slate-500 text-center py-8">Belum ada jadwal pelajaran terdaftar.</p>`;
            return;
        }

        // Sort by hari index, then jam slot
        const sorted = [...schedules].sort((a, b) => {
            const hA = HARI_LIST.indexOf(a.hari);
            const hB = HARI_LIST.indexOf(b.hari);
            if (hA !== hB) return hA - hB;
            return String(a.jam).localeCompare(String(b.jam));
        });

        listContainer.innerHTML = sorted.map(s => {
            const teacherName = s.guruNama || 'Belum ditunjuk';
            return `
                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850 hover:shadow-sm transition-all">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl bg-forest-650/10 dark:bg-forest-950/20 text-forest-700 dark:text-forest-400 flex flex-col items-center justify-center font-extrabold text-[10px] uppercase leading-none">
                            <span>${s.hari.substring(0, 3)}</span>
                            <span class="text-xs mt-1 font-black">${s.jam}</span>
                        </div>
                        <div>
                            <p class="text-xs font-black text-slate-800 dark:text-slate-200">${s.mapel}</p>
                            <p class="text-[10px] text-slate-550 dark:text-slate-400">Kelas: <strong class="text-slate-750 dark:text-slate-350">${s.kelas}</strong> | Guru: <span class="font-semibold text-slate-700 dark:text-slate-350">${teacherName}</span></p>
                        </div>
                    </div>
                    <button onclick="deleteSchedule('${s.id}')" class="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors no-print" title="Hapus Jadwal"><i class="ph ph-trash text-base"></i></button>
                </div>
            `;
        }).join('');
    };

    window.renderWeeklyGrid = function() {
        const gridContainer = document.getElementById('schedule-grid-container');
        if (!gridContainer) return;

        let html = `
            <div class="overflow-x-auto print-full-width">
                <table class="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-800 min-w-[700px]">
                    <thead>
                        <tr class="bg-slate-55 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase text-center">
                            <th class="border border-slate-200 dark:border-slate-850 px-3 py-2.5 w-40">Jam Ke / Waktu</th>
                            ${HARI_LIST.map(h => `<th class="border border-slate-200 dark:border-slate-850 px-3 py-2.5">${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;

        JAM_SLOTS.forEach(slot => {
            html += `
                <tr class="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td class="border border-slate-200 dark:border-slate-850 px-3 py-4 text-center font-bold text-slate-700 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-900/50">
                        ${slot.label}
                    </td>
            `;

            HARI_LIST.forEach(hari => {
                // Find all schedules in this Day & Slot
                const scheds = schedules.filter(s => s.hari === hari && s.jam === slot.kode);

                html += `
                    <td class="border border-slate-200 dark:border-slate-850 px-2 py-2 vertical-align-top min-h-[80px]">
                        <div class="space-y-1.5">
                            ${scheds.map(s => `
                                <div class="p-2 rounded-xl bg-forest-500/5 dark:bg-forest-950/25 border border-forest-500/10 dark:border-forest-500/20 text-[10px] leading-snug">
                                    <div class="font-extrabold text-slate-850 dark:text-slate-100">${s.mapel}</div>
                                    <div class="text-slate-550 dark:text-slate-400 font-bold">Kelas: ${s.kelas}</div>
                                    <div class="text-slate-400 mt-0.5 truncate" title="${s.guruNama}">${s.guruNama || '-'}</div>
                                </div>
                            `).join('')}
                            ${scheds.length === 0 ? `<div class="text-slate-300 dark:text-slate-700 text-center py-4 select-none">-</div>` : ''}
                        </div>
                    </td>
                `;
            });

            html += `</tr>`;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
        gridContainer.innerHTML = html;
    };

    window.switchJadwalTab = function(tabName) {
        const tabListBtn = document.getElementById('tab-list-btn');
        const tabGridBtn = document.getElementById('tab-grid-btn');
        const listView = document.getElementById('schedule-list-view');
        const gridView = document.getElementById('schedule-grid-view');

        if (tabName === 'list') {
            tabListBtn.className = "px-3.5 py-1.5 bg-forest-700 text-white rounded-lg text-xs font-bold transition-all";
            tabGridBtn.className = "px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all";
            listView.classList.remove('hidden');
            gridView.classList.add('hidden');
            renderScheduleList();
        } else {
            tabGridBtn.className = "px-3.5 py-1.5 bg-forest-700 text-white rounded-lg text-xs font-bold transition-all";
            tabListBtn.className = "px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all";
            listView.classList.add('hidden');
            gridView.classList.remove('hidden');
            renderWeeklyGrid();
        }
    };

    // Load form select options
    const classroomsOptions = classrooms.map(c => `<option value="${c.nama}">${c.nama}</option>`).join('');
    const subjectsOptions = subjects.map(s => `<option value="${s.nama}">${s.nama} (${s.kode})</option>`).join('');
    const teachersOptions = teachers.map(t => `<option value="${t.id}">${t.nama}</option>`).join('');

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
                <div class="flex items-center gap-1 bg-slate-150 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                    <button id="tab-list-btn" onclick="switchJadwalTab('list')" class="px-3.5 py-1.5 bg-forest-700 text-white rounded-lg text-xs font-bold transition-all">List View</button>
                    <button id="tab-grid-btn" onclick="switchJadwalTab('grid')" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all">Mingguan Grid</button>
                </div>
                <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                    <i class="ph ph-printer text-base"></i> Cetak Jadwal
                </button>
            </div>

            <!-- List View and Add Schedule Pane -->
            <div id="schedule-list-view" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <i class="ph ph-calendar text-forest-650 text-base"></i> Jurnal Daftar Jadwal Mengajar
                    </h3>
                    <div class="space-y-3" id="schedule-list-container"></div>
                </div>

                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4 h-fit no-print">
                    <h3 class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <i class="ph ph-plus-circle text-forest-650 text-base"></i> Daftarkan Jadwal
                    </h3>
                    <form id="sched-form" class="space-y-3.5">
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Hari</label>
                            <select id="sc-hari" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                                ${HARI_LIST.map(h => `<option value="${h}">${h}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Jam Pelajaran</label>
                            <select id="sc-jam" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                                ${JAM_SLOTS.map(slot => `<option value="${slot.kode}">${slot.label}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Kelas</label>
                            <select id="sc-kelas" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                                <option value="">-- Pilih Kelas --</option>
                                ${classroomsOptions || '<option value="">(Belum ada kelas)</option>'}
                            </select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Mata Pelajaran</label>
                            <select id="sc-mapel" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                                <option value="">-- Pilih Mapel --</option>
                                ${subjectsOptions || '<option value="">(Belum ada mapel)</option>'}
                            </select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Guru Pengampu</label>
                            <select id="sc-guru" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                                <option value="">-- Pilih Guru --</option>
                                ${teachersOptions}
                            </select>
                        </div>

                        <!-- Collision Alert Area -->
                        <div id="collision-alert" class="hidden p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-[10px] text-rose-600 font-bold leading-normal"></div>

                        <button type="submit" class="w-full bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition-all active:scale-98">Simpan Jadwal</button>
                    </form>
                </div>
            </div>

            <!-- Visual weekly timetable grid view -->
            <div id="schedule-grid-view" class="hidden bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4">
                <h3 class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <i class="ph ph-grid-four text-forest-650 text-base"></i> Visual Timetable Mingguan
                </h3>
                <div id="schedule-grid-container"></div>
            </div>
        </div>
    `;

    document.getElementById('sched-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const hari = document.getElementById('sc-hari').value;
        const jam = document.getElementById('sc-jam').value;
        const kelas = document.getElementById('sc-kelas').value;
        const mapel = document.getElementById('sc-mapel').value;
        const guruId = document.getElementById('sc-guru').value;
        const guru = teachers.find(t => t.id === guruId);

        const alertEl = document.getElementById('collision-alert');
        alertEl.classList.add('hidden');

        if (!kelas || !mapel || !guruId) {
            showToast("Harap lengkapi semua isian formulir!", "error");
            return;
        }

        // ============================================
        // CONFLICT DETECTION
        // ============================================
        
        // 1. Check if Teacher is busy at this slot
        const teacherConflict = schedules.find(s => s.hari === hari && s.jam === jam && s.guruId === guruId);
        if (teacherConflict) {
            alertEl.innerHTML = `<i class="ph ph-warning-circle text-sm inline-block mr-1"></i> Bentrok: Guru <strong>${guru.nama}</strong> sudah terjadwal mengajar kelas <strong>${teacherConflict.kelas}</strong> (${teacherConflict.mapel}) pada hari ${hari} jam ke-${jam}!`;
            alertEl.classList.remove('hidden');
            showToast("Tabrakan jadwal terdeteksi untuk Guru!", "error");
            return;
        }

        // 2. Check if Class/Room is busy at this slot
        const classConflict = schedules.find(s => s.hari === hari && s.jam === jam && s.kelas === kelas);
        if (classConflict) {
            alertEl.innerHTML = `<i class="ph ph-warning-circle text-sm inline-block mr-1"></i> Bentrok: Kelas <strong>${kelas}</strong> sudah memiliki jadwal pelajaran <strong>${classConflict.mapel}</strong> bersama Guru <strong>${classConflict.guruNama || ''}</strong> pada hari ${hari} jam ke-${jam}!`;
            alertEl.classList.remove('hidden');
            showToast("Tabrakan jadwal terdeteksi untuk Kelas!", "error");
            return;
        }

        // No collision, save!
        const newSched = {
            id: 'sch_' + Date.now(),
            hari,
            jam,
            kelas,
            mapel,
            guruId,
            guruNama: guru ? guru.nama : ""
        };

        schedules.push(newSched);
        await dbService.saveData('jadwal', schedules);
        showToast("Jadwal mengajar berhasil ditambahkan!");
        renderScheduleList();
    });

    window.deleteSchedule = function(id) {
        const s = schedules.find(item => item.id === id);
        showConfirmDialog("Hapus Jadwal", `Hapus jadwal <strong>${s ? s.mapel : 'ini'}</strong> di kelas ${s ? s.kelas : ''}?`, () => {
            const idx = schedules.findIndex(item => item.id === id);
            if (idx !== -1) {
                schedules.splice(idx, 1);
                dbService.saveData('jadwal', schedules).then(() => {
                    renderScheduleList();
                    showToast("Jadwal telah dihapus.");
                });
            }
        });
    };

    renderScheduleList();
}
