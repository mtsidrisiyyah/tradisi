// ============================================
// TRADISI — Dashboard Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, useMockDb, getGreeting, getUserProfile, getHariIndonesia, getTodayStr } = ctx;

    const schoolSettings = await dbService.getData('madrasah_settings').then(res => Array.isArray(res) ? res[0] || {} : res);
    const students = await dbService.getData('siswa');
    const journals = await dbService.getData('jurnal');
    const schedules = await dbService.getData('jadwal');
    const documents = await dbService.getData('documents');
    const userProfile = getUserProfile();

    const todayStr = getTodayStr();
    const todayJournals = journals.filter(j => j.tanggal === todayStr);
    const uniqueClasses = [...new Set(students.map(s => s.kelas))];
    const totalL = students.filter(s => s.jk === 'L').length;
    const totalP = students.filter(s => s.jk === 'P').length;
    const todayName = getHariIndonesia(new Date());
    const todaySchedules = schedules.filter(s => s.hari === todayName);

    let bannerDb = '';
    if (useMockDb) {
        bannerDb = `
            <div id="db-status-banner" class="banner-info bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 text-xs flex justify-between items-center rounded-2xl shadow-md mb-6">
                <span class="flex items-center gap-2.5">
                    <i class="ph ph-warning-circle text-lg animate-bounce"></i>
                    <span><strong>Mode Uji Coba (Lokal):</strong> Data tersimpan di browser Anda.</span>
                </span>
                <button onclick="document.getElementById('db-status-banner').remove()" class="bg-white/20 hover:bg-white/30 p-1 rounded-full"><i class="ph ph-x text-sm"></i></button>
            </div>
        `;
    }

    // Build agenda HTML
    let agendaHtml = '';
    if (todayJournals.length === 0) {
        const latest = journals.slice(-3).reverse();
        if (latest.length === 0) {
            agendaHtml = `<div class="text-center py-6"><i class="ph ph-notebook text-3xl text-slate-300 dark:text-slate-600 mb-2"></i><p class="text-xs text-slate-400">Belum ada agenda terisi.</p></div>`;
        } else {
            latest.forEach(j => {
                agendaHtml += `
                    <div class="flex gap-3 border-l-2 border-emerald-500 pl-3 py-1.5">
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${j.kelas} - ${j.mapel} <span class="text-slate-400 font-normal">(${j.jamKe})</span></p>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">${j.materi}</p>
                            <p class="text-[10px] text-slate-400 mt-0.5">${j.tanggal}</p>
                        </div>
                    </div>
                `;
            });
        }
    } else {
        todayJournals.forEach(j => {
            agendaHtml += `
                <div class="flex gap-3 border-l-2 border-emerald-500 pl-3 py-1.5">
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${j.kelas} - ${j.mapel} <span class="text-slate-400 font-normal">(${j.jamKe})</span></p>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">${j.materi}</p>
                    </div>
                    <span class="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-forest-700 dark:text-forest-400 px-2 py-0.5 rounded-full h-fit">Hari Ini</span>
                </div>
            `;
        });
    }

    // Build schedule HTML
    let jadwalHtml = '';
    if (todaySchedules.length === 0) {
        const upcoming = schedules.slice(0, 4);
        if (upcoming.length === 0) {
            jadwalHtml = `<div class="text-center py-6"><i class="ph ph-calendar-blank text-3xl text-slate-300 dark:text-slate-600 mb-2"></i><p class="text-xs text-slate-400">Belum ada jadwal.</p></div>`;
        } else {
            upcoming.forEach(s => {
                jadwalHtml += `
                    <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                        <div class="flex items-center gap-2">
                            <div class="w-9 h-9 rounded-lg bg-forest-600/10 text-forest-700 dark:text-forest-400 flex items-center justify-center text-[10px] font-bold">${s.hari.substring(0, 3)}</div>
                            <div>
                                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${s.mapel}</p>
                                <p class="text-[10px] text-slate-400">${s.kelas} | ${s.jam}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    } else {
        todaySchedules.forEach(s => {
            jadwalHtml += `
                <div class="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
                    <div class="flex items-center gap-2">
                        <div class="w-9 h-9 rounded-lg bg-forest-600 text-white flex items-center justify-center text-[10px] font-bold">Now</div>
                        <div>
                            <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${s.mapel}</p>
                            <p class="text-[10px] text-slate-400">${s.kelas} | ${s.jam}</p>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            ${bannerDb}
            <!-- Welcome Card -->
            <div class="bg-gradient-to-br from-forest-700 via-forest-600 to-forest-800 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div class="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full blur-2xl translate-x-12 -translate-y-12"></div>
                <div class="absolute left-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-xl -translate-x-8 translate-y-8"></div>
                <div class="relative z-10">
                    <span class="inline-block bg-white/20 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider mb-3">${getGreeting()}</span>
                    <h2 class="text-2xl md:text-3xl font-extrabold mb-1">Assalamu'alaikum, ${userProfile.nama}!</h2>
                    <p class="text-sm text-forest-100/80 font-medium">${schoolSettings.nama || 'MTs Idrisiyyah'} | TA ${schoolSettings.tahunAjaran || '-'} (${schoolSettings.semester || '-'})</p>
                </div>
            </div>

            <!-- Stat Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div class="stat-card stat-card-blue bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Siswa</div>
                            <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${students.length}</div>
                            <div class="text-[10px] text-slate-400 mt-1">${totalL} L / ${totalP} P</div>
                        </div>
                        <div class="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl"><i class="ph ph-users text-xl"></i></div>
                    </div>
                </div>
                <div class="stat-card stat-card-emerald bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Jadwal</div>
                            <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${schedules.length}</div>
                            <div class="text-[10px] text-slate-400 mt-1">${todaySchedules.length} hari ini</div>
                        </div>
                        <div class="p-2.5 bg-forest-600/10 text-forest-700 rounded-xl"><i class="ph ph-calendar-blank text-xl"></i></div>
                    </div>
                </div>
                <div class="stat-card stat-card-purple bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Jurnal</div>
                            <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${journals.length}</div>
                            <div class="text-[10px] text-slate-400 mt-1">${todayJournals.length} hari ini</div>
                        </div>
                        <div class="p-2.5 bg-purple-500/10 text-purple-600 rounded-xl"><i class="ph ph-notebook text-xl"></i></div>
                    </div>
                </div>
                <div class="stat-card stat-card-teal bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Dokumen</div>
                            <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${documents.length}</div>
                            <div class="text-[10px] text-slate-400 mt-1">${uniqueClasses.length} kelas</div>
                        </div>
                        <div class="p-2.5 bg-teal-500/10 text-teal-600 rounded-xl"><i class="ph ph-folder-open text-xl"></i></div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3 no-print">
                <button onclick="window.loadPage('Data Siswa')" class="quick-action bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center group">
                    <div class="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all"><i class="ph ph-users text-xl"></i></div>
                    <p class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Data Siswa</p>
                </button>
                <button onclick="window.loadPage('Penilaian Siswa')" class="quick-action bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center group">
                    <div class="w-10 h-10 mx-auto mb-2 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all"><i class="ph ph-chart-bar text-xl"></i></div>
                    <p class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Penilaian</p>
                </button>
                <button onclick="window.loadPage('Modul Ajar')" class="quick-action bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center group">
                    <div class="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all"><i class="ph ph-book-open-text text-xl"></i></div>
                    <p class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Modul Ajar</p>
                </button>
                <button onclick="window.loadPage('Jadwal Pelajaran')" class="quick-action bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center group">
                    <div class="w-10 h-10 mx-auto mb-2 rounded-xl bg-forest-600/10 text-forest-700 flex items-center justify-center group-hover:bg-forest-600 group-hover:text-white transition-all"><i class="ph ph-clock text-xl"></i></div>
                    <p class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Jadwal</p>
                </button>
                <button onclick="window.loadPage('Kalender Pendidikan')" class="quick-action bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center group">
                    <div class="w-10 h-10 mx-auto mb-2 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all"><i class="ph ph-calendar text-xl"></i></div>
                    <p class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Kalender</p>
                </button>
            </div>

            <!-- Detail Section -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800 space-y-4">
                    <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <i class="ph ph-notebook text-forest-600"></i> ${todayJournals.length > 0 ? 'Jurnal Hari Ini' : 'Jurnal Mengajar Terbaru'}
                    </h3>
                    <div class="space-y-3 fade-in-stagger">
                        ${agendaHtml}
                    </div>
                    <button onclick="window.loadPage('Jurnal Agenda Guru')" class="text-xs text-forest-600 dark:text-forest-400 font-bold hover:underline">Lihat semua jurnal &rarr;</button>
                </div>
                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800 space-y-4">
                    <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <i class="ph ph-calendar-blank text-forest-600"></i> ${todaySchedules.length > 0 ? 'Jadwal Hari Ini (' + todayName + ')' : 'Jadwal Terdekat'}
                    </h3>
                    <div class="space-y-2.5 fade-in-stagger">
                        ${jadwalHtml}
                    </div>
                    <button onclick="window.loadPage('Jadwal Pelajaran')" class="text-xs text-forest-600 dark:text-forest-400 font-bold hover:underline">Kelola jadwal &rarr;</button>
                </div>
            </div>
        </div>
    `;
}
