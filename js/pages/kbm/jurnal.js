// ============================================
// TRADISI — Jurnal Agenda Guru Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, getUserProfile, getTodayStr, showConfirmDialog } = ctx;

    // Load data
    const journals = await dbService.getData('jurnal') || [];
    const schedules = await dbService.getData('jadwal') || [];
    const teachers = await dbService.getData('teachers') || [];
    const atpList = await dbService.getData('atp') || [];
    const classrooms = await dbService.getData('classrooms') || [];
    const userProfile = getUserProfile();

    // Identify current teacher based on userProfile email
    const currentTeacher = teachers.find(t => t.email === userProfile.email) || {};

    const HARI_MAP = {
        0: "Minggu",
        1: "Senin",
        2: "Selasa",
        3: "Rabu",
        4: "Kamis",
        5: "Jumat",
        6: "Sabtu"
    };

    window.renderJournalTable = function() {
        const tbody = document.getElementById('jurnal-table-body');
        if (!tbody) return;

        // Filter journals written by the current teacher (or matching email)
        const myJournals = journals.filter(j => j.guruId === currentTeacher.id || j.guruEmail === userProfile.email);

        if (myJournals.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-8 text-center text-xs text-slate-500">Belum ada catatan agenda kelas yang Anda tulis.</td></tr>';
            return;
        }

        // Sort journals by date descending
        const sorted = [...myJournals].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

        tbody.innerHTML = sorted.map((j, idx) => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <td class="px-4 py-3 text-xs text-slate-500 text-center">${idx + 1}</td>
                <td class="px-4 py-3 text-xs font-semibold text-slate-850 dark:text-slate-200">${j.tanggal}</td>
                <td class="px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">${j.kelas}</td>
                <td class="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 text-center font-bold">${j.jamKe}</td>
                <td class="px-4 py-3 text-xs font-semibold text-slate-850 dark:text-slate-200">${j.mapel}</td>
                <td class="px-4 py-3 text-xs text-slate-650 dark:text-slate-400 max-w-[200px] truncate" title="${j.materi}">
                    <strong class="block text-[10px] text-forest-700 dark:text-forest-400">${j.tujuanPembelajaran || '-'}</strong>
                    ${j.materi}
                </td>
                <td class="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-[150px] truncate" title="${j.kendala}">${j.kendala || '-'}</td>
                <td class="px-4 py-3 text-xs flex gap-2 no-print">
                    <button onclick="deleteJournal('${j.id}')" class="p-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors" title="Hapus"><i class="ph ph-trash text-base"></i></button>
                </td>
            </tr>
        `).join('');
    };

    // Render visual dashboard checklist of schedule items today
    window.renderDailyMonitoring = function() {
        const monitoringContainer = document.getElementById('daily-monitoring-container');
        if (!monitoringContainer) return;

        const dateVal = document.getElementById('jur-tanggal').value;
        const dayOfWeek = HARI_MAP[new Date(dateVal).getDay()];

        // Filter teacher's schedule for this day
        const todaySchedules = schedules.filter(s => s.guruId === currentTeacher.id && s.hari === dayOfWeek);

        if (todaySchedules.length === 0) {
            monitoringContainer.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">Tidak ada jadwal mengajar terdaftar untuk Anda pada hari ${dayOfWeek}.</p>`;
            return;
        }

        let html = '<div class="space-y-2.5">';
        todaySchedules.forEach(s => {
            // Check if journal entry exists for this class, subject, and time on this date
            const exists = journals.some(j => j.tanggal === dateVal && j.kelas === s.kelas && j.jamKe === s.jam && j.mapel === s.mapel);

            const badge = exists
                ? `<span class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-forest-400 text-[9px] rounded-full uppercase font-bold flex items-center gap-1"><i class="ph ph-check-circle"></i> Terisi</span>`
                : `<span class="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-[9px] rounded-full uppercase font-bold flex items-center gap-1"><i class="ph ph-warning-circle"></i> Belum Diisi</span>`;

            html += `
                <div class="p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div class="text-left">
                        <p class="text-xs font-extrabold text-slate-800 dark:text-slate-200">${s.mapel}</p>
                        <p class="text-[9px] text-slate-400">Kelas: <strong class="text-slate-600 dark:text-slate-350">${s.kelas}</strong> | Jam Ke: <strong class="text-slate-600 dark:text-slate-350">${s.jam}</strong></p>
                    </div>
                    <div>
                        ${badge}
                    </div>
                </div>
            `;
        });
        html += '</div>';

        monitoringContainer.innerHTML = html;
        
        // Populate the quick schedule fill dropdown
        const suggestSelect = document.getElementById('jur-schedules-suggest');
        if (suggestSelect) {
            let optionsHtml = '<option value="">-- Pilih Jadwal Pembelajaran Hari Ini --</option>';
            todaySchedules.forEach(s => {
                optionsHtml += `<option value="${s.id}">${s.jam} | ${s.kelas} — ${s.mapel}</option>`;
            });
            suggestSelect.innerHTML = optionsHtml;
        }
    };

    // Auto-fill form when schedule suggest is selected
    window.autoFillFromSchedule = function(scheduleId) {
        if (!scheduleId) return;

        const s = schedules.find(item => item.id === scheduleId);
        if (!s) return;

        document.getElementById('jur-kelas').value = s.kelas;
        document.getElementById('jur-jam').value = s.jam;
        document.getElementById('jur-mapel').value = s.mapel;

        // Trigger TP update for this mapel
        updateTpDropdown(s.mapel);
        showToast(`Form diisi otomatis untuk ${s.mapel} kelas ${s.kelas}!`);
    };

    // Fetch and populate Tujuan Pembelajaran based on subject
    window.updateTpDropdown = function(mapelName) {
        const tpSelect = document.getElementById('jur-tp');
        if (!tpSelect) return;

        // Filter ATP matching subject name
        const matchTps = atpList.filter(item => item.mapel.toLowerCase().trim() === mapelName.toLowerCase().trim());

        if (matchTps.length === 0) {
            tpSelect.innerHTML = '<option value="">-- Tidak ada TP terdaftar --</option>';
            return;
        }

        tpSelect.innerHTML = '<option value="">-- Pilih Tujuan Pembelajaran (TP) --</option>' + 
            matchTps.map(item => `<option value="${item.tp}">${item.tp}</option>`).join('');
    };

    // Class dynamic options
    const classroomsOptions = classrooms.map(c => `<option value="${c.nama}">${c.nama}</option>`).join('');

    contentArea.innerHTML = `
        <div class="fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Jurnal Form & History (Left) -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Form Card -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                    <h3 class="text-xs font-black uppercase tracking-wider mb-4 text-slate-850 dark:text-slate-150 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <i class="ph ph-note-pencil text-forest-650 text-base"></i> Catat Agenda Kelas Baru
                    </h3>
                    <form id="jurnal-form" class="space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Tanggal KBM</label>
                                <input type="date" id="jur-tanggal" value="${getTodayStr()}" onchange="renderDailyMonitoring()" required class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Pilih Kelas</label>
                                <select id="jur-kelas" class="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                                    ${classroomsOptions || '<option value="VII-A">VII-A</option>'}
                                </select>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Jam Ke</label>
                                <input type="text" id="jur-jam" placeholder="contoh: 1-2" required class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Mata Pelajaran</label>
                                <input type="text" id="jur-mapel" value="${userProfile.mapel || ''}" oninput="updateTpDropdown(this.value)" required class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                            </div>
                        </div>

                        <!-- TP Selection Dynamic -->
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Tujuan Pembelajaran (TP) ATP</label>
                            <select id="jur-tp" class="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                                <option value="">-- Masukkan Mapel untuk memuat TP --</option>
                            </select>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Uraian Materi Pembelajaran</label>
                                <textarea id="jur-materi" rows="2" placeholder="Tulis rincian materi..." required class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs"></textarea>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Hambatan / Kendala KBM</label>
                                <textarea id="jur-kendala" rows="2" placeholder="Hambatan yang dihadapi..." class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs"></textarea>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Solusi / Tindak Lanjut</label>
                                <textarea id="jur-tindaklanjut" rows="2" placeholder="Solusi tindak lanjut..." class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs"></textarea>
                            </div>
                        </div>

                        <div class="flex justify-end pt-2">
                            <button type="submit" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-sm transition-all active:scale-98 flex items-center gap-1.5">
                                <i class="ph ph-floppy-disk text-base"></i> Simpan Jurnal Agenda
                            </button>
                        </div>
                    </form>
                </div>

                <!-- History Table Card -->
                <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div class="p-5 bg-slate-50 dark:bg-slate-850/40 border-b border-slate-200 dark:border-slate-700">
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Riwayat Jurnal Agenda Anda</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="text-[10px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/20 uppercase tracking-wider">
                                    <th class="px-4 py-3 w-12 text-center">No</th>
                                    <th class="px-4 py-3 w-28">Tanggal</th>
                                    <th class="px-4 py-3 w-16">Kelas</th>
                                    <th class="px-4 py-3 w-16 text-center">Jam</th>
                                    <th class="px-4 py-3 w-28">Mapel</th>
                                    <th class="px-4 py-3">Materi & TP</th>
                                    <th class="px-4 py-3 w-32">Kendala</th>
                                    <th class="px-4 py-3 w-16 no-print">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="jurnal-table-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Monitoring Checklist & Quick Suggest Fill (Right) -->
            <div class="space-y-6 h-fit">
                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 class="text-xs font-black uppercase tracking-wider text-slate-850 dark:text-slate-150 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <i class="ph ph-calendar-check text-forest-650 text-base"></i> Monitoring Mengajar Hari Ini
                    </h3>
                    
                    <!-- Quick select suggestion -->
                    <div class="no-print space-y-1">
                        <label class="block text-[9px] font-bold text-slate-400 uppercase">Tarik dari Jadwal:</label>
                        <select id="jur-schedules-suggest" onchange="autoFillFromSchedule(this.value)" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                            <option value="">-- Pilih Jadwal Pembelajaran --</option>
                        </select>
                    </div>

                    <div id="daily-monitoring-container" class="space-y-2.5"></div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('jurnal-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const tanggal = document.getElementById('jur-tanggal').value;
        const kelas = document.getElementById('jur-kelas').value;
        const jamKe = document.getElementById('jur-jam').value;
        const mapel = document.getElementById('jur-mapel').value;
        const tpVal = document.getElementById('jur-tp').value;
        const materi = document.getElementById('jur-materi').value;
        const kendala = document.getElementById('jur-kendala').value;
        const tindakLanjut = document.getElementById('jur-tindaklanjut').value;

        const newJournal = {
            id: 'jur_' + Date.now(),
            tanggal,
            kelas,
            jamKe,
            mapel,
            tujuanPembelajaran: tpVal,
            materi,
            kendala,
            tindakLanjut,
            guruId: currentTeacher.id || "",
            guruEmail: userProfile.email || "",
            status: 'aktif'
        };

        journals.push(newJournal);
        await dbService.saveData('jurnal', journals);
        showToast("Jurnal agenda harian berhasil disimpan!");

        // Reset
        document.getElementById('jur-jam').value = '';
        document.getElementById('jur-materi').value = '';
        document.getElementById('jur-kendala').value = '';
        document.getElementById('jur-tindaklanjut').value = '';
        document.getElementById('jur-schedules-suggest').value = '';

        // Re-render
        renderJournalTable();
        renderDailyMonitoring();
    });

    window.deleteJournal = function(id) {
        const j = journals.find(item => item.id === id);
        showConfirmDialog("Hapus Jurnal", `Hapus agenda jurnal tanggal <strong>${j ? j.tanggal : ''}</strong> untuk kelas ${j ? j.kelas : ''}?`, () => {
            const idx = journals.findIndex(item => item.id === id);
            if (idx !== -1) {
                journals.splice(idx, 1);
                dbService.saveData('jurnal', journals).then(() => {
                    renderJournalTable();
                    renderDailyMonitoring();
                    showToast("Jurnal agenda dihapus.");
                });
            }
        });
    };

    // Trigger initial values
    renderJournalTable();
    renderDailyMonitoring();
    
    // Initial TP loads
    updateTpDropdown(userProfile.mapel || '');
}
