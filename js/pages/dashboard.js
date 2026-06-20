// ============================================
// TRADISI — Dashboard Page Module (Phase 3 Enhanced)
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, useMockDb, getGreeting, getUserProfile, getHariIndonesia, getTodayStr } = ctx;

    const schoolSettings = await dbService.getData('madrasah_settings').then(res => Array.isArray(res) ? res[0] || {} : res);
    const students = await dbService.getData('siswa');
    const journals = await dbService.getData('jurnal');
    const schedules = await dbService.getData('jadwal');
    const documents = await dbService.getData('documents');
    const teachers = await dbService.getData('teachers');
    const approvals = await dbService.getData('approvals');
    const userProfile = getUserProfile();

    const todayStr = getTodayStr();
    const todayJournals = journals.filter(j => j.tanggal === todayStr);
    const uniqueClasses = [...new Set(students.map(s => s.kelas))];
    const totalL = students.filter(s => s.jk === 'L').length;
    const totalP = students.filter(s => s.jk === 'P').length;
    const todayName = getHariIndonesia(new Date());
    const todaySchedules = schedules.filter(s => s.hari === todayName);
    const pendingApprovals = approvals.filter(a => a.status === 'pending');

    // Student distribution by class for donut chart
    const classDistribution = {};
    students.forEach(s => { classDistribution[s.kelas] = (classDistribution[s.kelas] || 0) + 1; });
    const classEntries = Object.entries(classDistribution).sort();
    const totalStudents = students.length || 1;
    const chartColors = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0d9488', '#e11d48', '#ea580c', '#2dd4bf'];

    // Build conic gradient for donut chart
    let gradientStops = [];
    let cumulative = 0;
    classEntries.forEach(([cls, count], i) => {
        const pct = (count / totalStudents) * 100;
        const color = chartColors[i % chartColors.length];
        gradientStops.push(`${color} ${cumulative}% ${cumulative + pct}%`);
        cumulative += pct;
    });
    const conicGradient = gradientStops.length > 0
        ? `conic-gradient(${gradientStops.join(', ')})`
        : 'conic-gradient(#e5e7eb 0% 100%)';

    // Chart legend
    const legendHtml = classEntries.map(([cls, count], i) => `
        <div class="flex items-center gap-2 text-[11px]">
            <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:${chartColors[i % chartColors.length]}"></div>
            <span class="text-stone-600 dark:text-stone-400">${cls}</span>
            <span class="font-bold text-stone-800 dark:text-stone-200 ml-auto">${count}</span>
        </div>
    `).join('');

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
                    <div class="flex gap-3 border-l-2 border-emerald-500 pl-3 py-2">
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
                <div class="flex gap-3 border-l-2 border-emerald-500 pl-3 py-2">
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
                        <div class="flex items-center gap-2.5">
                            <div class="w-9 h-9 rounded-lg bg-forest-600/10 text-forest-700 dark:text-forest-400 flex items-center justify-center text-[10px] font-bold">${s.hari.substring(0, 3)}</div>
                            <div>
                                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${s.mapel}</p>
                                <p class="text-[10px] text-slate-400">${s.kelas} · ${s.jam}</p>
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
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-lg bg-forest-600 text-white flex items-center justify-center text-[10px] font-bold">Now</div>
                        <div>
                            <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${s.mapel}</p>
                            <p class="text-[10px] text-slate-400">${s.kelas} · ${s.jam}</p>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // Build pending approvals HTML
    let approvalsHtml = '';
    if (pendingApprovals.length > 0) {
        pendingApprovals.slice(0, 3).forEach(a => {
            approvalsHtml += `
                <div class="flex items-center gap-3 p-2.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/30">
                    <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <i class="ph ph-hourglass text-base"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">${a.nama || a.tipe}</p>
                        <p class="text-[10px] text-slate-400">${a.pengajuNama || '-'} · ${a.tanggalPengajuan || ''}</p>
                    </div>
                </div>
            `;
        });
    } else {
        approvalsHtml = `<div class="text-center py-6"><i class="ph ph-check-circle text-3xl text-emerald-300 dark:text-emerald-600 mb-2"></i><p class="text-xs text-slate-400">Tidak ada persetujuan tertunda.</p></div>`;
    }

    // Notification badge
    const notifCount = pendingApprovals.length;
    const notifBadge = notifCount > 0 ? `<span class="inline-flex items-center justify-center w-5 h-5 text-[9px] font-bold bg-rose-500 text-white rounded-full">${notifCount}</span>` : '';

    contentArea.innerHTML = `
        <div class="fade-in space-y-6 max-w-7xl mx-auto">
            ${bannerDb}
            <!-- Welcome Card -->
            <div class="bg-gradient-to-r from-[#166534] to-[#14532d] text-white p-6 md:p-7 rounded-2xl shadow-lg relative overflow-hidden">
                <div class="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-x-16 -translate-y-16"></div>
                <div class="relative z-10">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <p class="text-emerald-200/70 text-xs font-semibold uppercase tracking-wider mb-1">${getGreeting()}</p>
                            <h2 class="text-xl md:text-2xl font-bold mb-1">Assalamu'alaikum, ${userProfile.nama}!</h2>
                            <p class="text-sm text-emerald-100/60">${schoolSettings.nama || 'MTs Idrisiyyah'} · TA ${schoolSettings.tahunAjaran || '-'} (${schoolSettings.semester || '-'})</p>
                        </div>
                        <div class="flex items-center gap-2.5 flex-shrink-0">
                            ${notifCount > 0 ? `<button onclick="window.loadPage('Supervisi Akademik')" class="relative p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                                <i class="ph ph-bell text-lg"></i>
                                <span class="absolute -top-1 -right-1 w-4.5 h-4.5 text-[8px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center">${notifCount}</span>
                            </button>` : ''}
                            <div class="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl">
                                <i class="ph ph-calendar-blank text-sm"></i>
                                <span class="text-xs font-medium">${todayName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stat Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div class="stat-card stat-card-blue bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800 card-hover-lift">
                    <div class="flex items-start justify-between">
                        <div>
                            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Siswa</div>
                            <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${students.length}</div>
                            <div class="flex items-center gap-1 mt-1.5">
                                <span class="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded-full">+${Math.round(totalL/totalStudents*100)}% L</span>
                                <span class="text-[9px] text-slate-400">${totalL} L / ${totalP} P</span>
                            </div>
                        </div>
                        <div class="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl"><i class="ph ph-student text-xl"></i></div>
                    </div>
                </div>
                <div class="stat-card stat-card-emerald bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800 card-hover-lift">
                    <div class="flex items-start justify-between">
                        <div>
                            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Data Guru</div>
                            <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${teachers.length}</div>
                            <div class="flex items-center gap-1 mt-1.5">
                                <span class="text-[9px] font-bold text-forest-600 bg-forest-50 dark:bg-forest-950 px-1.5 py-0.5 rounded-full">${uniqueClasses.length} Kelas</span>
                            </div>
                        </div>
                        <div class="p-2.5 bg-forest-600/10 text-forest-700 rounded-xl"><i class="ph ph-chalkboard-teacher text-xl"></i></div>
                    </div>
                </div>
                <div class="stat-card stat-card-purple bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800 card-hover-lift">
                    <div class="flex items-start justify-between">
                        <div>
                            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Jurnal</div>
                            <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${journals.length}</div>
                            <div class="flex items-center gap-1 mt-1.5">
                                <span class="text-[9px] font-bold ${todayJournals.length > 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' : 'text-slate-400 bg-stone-100 dark:bg-stone-800'} px-1.5 py-0.5 rounded-full">${todayJournals.length} hari ini</span>
                            </div>
                        </div>
                        <div class="p-2.5 bg-purple-500/10 text-purple-600 rounded-xl"><i class="ph ph-notebook text-xl"></i></div>
                    </div>
                </div>
                <div class="stat-card stat-card-teal bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800 card-hover-lift">
                    <div class="flex items-start justify-between">
                        <div>
                            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Dokumen</div>
                            <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${documents.length}</div>
                            <div class="flex items-center gap-1 mt-1.5">
                                ${pendingApprovals.length > 0 ? `<span class="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded-full">${pendingApprovals.length} pending</span>` : `<span class="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded-full">Semua OK</span>`}
                            </div>
                        </div>
                        <div class="p-2.5 bg-teal-500/10 text-teal-600 rounded-xl"><i class="ph ph-folder-open text-xl"></i></div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions Grid -->
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2.5 no-print">
                ${[
                    { page: 'Data Siswa', icon: 'ph-student', color: 'blue' },
                    { page: 'Penilaian Siswa', icon: 'ph-chart-bar', color: 'purple' },
                    { page: 'Absensi Siswa', icon: 'ph-check-square', color: 'emerald' },
                    { page: 'Modul Ajar', icon: 'ph-article', color: 'amber' },
                    { page: 'Jadwal Pelajaran', icon: 'ph-calendar', color: 'forest' },
                    { page: 'Bank Soal', icon: 'ph-stack', color: 'rose' },
                    { page: 'Rapor Siswa', icon: 'ph-identification-card', color: 'teal' },
                    { page: 'Kalender Pendidikan', icon: 'ph-calendar-dots', color: 'orange' }
                ].map(a => `
                    <button onclick="window.loadPage('${a.page}')" class="quick-action bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center group">
                        <div class="w-9 h-9 mx-auto mb-1.5 rounded-xl bg-${a.color}-500/10 text-${a.color === 'forest' ? 'forest-700' : a.color + '-600'} flex items-center justify-center group-hover:bg-${a.color}-500 group-hover:text-white transition-all"><i class="ph ${a.icon} text-lg"></i></div>
                        <p class="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-tight">${a.page.replace(' Siswa', '').replace(' Pelajaran', '')}</p>
                    </button>
                `).join('')}
            </div>

            <!-- Charts + Schedule Row -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Donut Chart: Student Distribution -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                    <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-5">
                        <i class="ph ph-chart-pie-slice text-forest-600"></i> Distribusi Siswa
                    </h3>
                    <div class="flex items-center gap-6">
                        <div class="relative flex-shrink-0">
                            <div class="donut-chart" style="background: ${conicGradient};">
                                <div class="donut-center bg-white dark:bg-slate-800">
                                    <span class="text-xl font-bold text-slate-800 dark:text-slate-100">${students.length}</span>
                                    <span class="text-[8px] text-slate-400 font-bold uppercase">Total</span>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-2 flex-1 min-w-0">${legendHtml}</div>
                    </div>
                </div>

                <!-- Today's Schedule -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                    <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                        <i class="ph ph-calendar-blank text-forest-600"></i> ${todaySchedules.length > 0 ? 'Jadwal Hari Ini' : 'Jadwal Terdekat'}
                    </h3>
                    <div class="space-y-2.5 fade-in-stagger">${jadwalHtml}</div>
                    <button onclick="window.loadPage('Jadwal Pelajaran')" class="text-[11px] text-forest-600 dark:text-forest-400 font-bold hover:underline mt-4 block">Kelola jadwal &rarr;</button>
                </div>

                <!-- Pending Approvals -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                    <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                        <i class="ph ph-hourglass text-amber-500"></i> Persetujuan
                        ${notifBadge}
                    </h3>
                    <div class="space-y-2.5 fade-in-stagger">${approvalsHtml}</div>
                    <button onclick="window.loadPage('Supervisi Akademik')" class="text-[11px] text-forest-600 dark:text-forest-400 font-bold hover:underline mt-4 block">Lihat semua &rarr;</button>
                </div>
            </div>

            <!-- Recent Journals -->
            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <i class="ph ph-notebook text-forest-600"></i> ${todayJournals.length > 0 ? 'Jurnal Hari Ini' : 'Jurnal Mengajar Terbaru'}
                    </h3>
                    <button onclick="window.loadPage('Jurnal Agenda Guru')" class="text-[11px] text-forest-600 dark:text-forest-400 font-bold hover:underline">Lihat semua &rarr;</button>
                </div>
                <div class="space-y-3 fade-in-stagger">${agendaHtml}</div>
            </div>
        </div>
    `;
}
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
