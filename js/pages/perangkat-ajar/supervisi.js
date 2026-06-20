// ============================================
// TRADISI — Supervisi Akademik & Persetujuan Dokumen Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, getUserProfile, openModal, closeModal } = ctx;
    const userProfile = getUserProfile();

    // 1. Load Data
    let approvals = await dbService.getData('approvals') || [];
    let approvalHistory = await dbService.getData('approval_history') || [];
    let documents = await dbService.getData('documents') || [];
    let teachers = await dbService.getData('teachers') || [];
    const settings = await dbService.getData('madrasah_settings') || {
        nama: "MTs Idrisiyyah Tasikmalaya",
        kepala: "H. Ahmad Fauzian, M.Pd.",
        nipKepala: "197804152006041003",
        tahunAjaran: "2026/2027",
        semester: "Ganjil"
    };

    const activeRole = userProfile.activeRole;
    const isApprover = ['super_admin', 'admin_madrasah', 'kepala_madrasah', 'waka_kurikulum'].includes(activeRole);

    // Initial state: default active tab
    let activeTab = isApprover ? 'pending' : 'my_submissions';

    // RENDER BASE TEMPLATE
    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <!-- Header & Action Row -->
            <div class="bg-gradient-to-r from-forest-800 to-forest-900 p-6 md:p-8 rounded-3xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 class="text-base font-black uppercase tracking-wider text-sand-100">Supervisi Akademik & Verifikasi Berkas</h3>
                    <p class="text-xs text-sand-300/80 mt-1">Platform monitoring administrasi, verifikasi perangkat ajar, dan kepatuhan kurikulum.</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button id="btn-ajukan-baru" class="bg-sand-400 hover:bg-sand-500 text-forest-900 font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-98">
                        <i class="ph ph-plus-circle text-base"></i> Ajukan Berkas Baru
                    </button>
                    ${isApprover ? `
                        <button id="btn-print-laporan" class="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 border border-white/20 shadow-sm active:scale-98">
                            <i class="ph ph-printer text-base"></i> Cetak Laporan Bulanan
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- Stats Overview Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-container">
                <!-- Stats will load dynamically -->
            </div>

            <!-- Tab Navigation & Filters -->
            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="flex flex-col md:flex-row justify-between items-stretch md:items-center border-b border-slate-100 dark:border-slate-800 px-6 py-2 gap-4">
                    <!-- Tabs -->
                    <div class="flex gap-2" id="supervisi-tabs-nav">
                        <!-- Dynamic tabs depending on role -->
                    </div>
                    <!-- Search / Filters -->
                    <div class="flex items-center gap-2 max-w-sm w-full md:w-auto" id="filter-wrapper">
                        <div class="relative w-full">
                            <i class="ph ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                            <input type="text" id="sup-search" placeholder="Cari berkas atau guru..." class="w-full pl-9 pr-4 py-1.5 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                        <select id="sup-filter-tipe" class="px-2.5 py-1.5 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                            <option value="">Semua Berkas</option>
                            <option value="Modul Ajar">Modul Ajar</option>
                            <option value="Program Tahunan">PROTA</option>
                            <option value="Program Semester">PROMES</option>
                            <option value="Alur Tujuan Pembelajaran">ATP</option>
                            <option value="Kriteria Ketercapaian">KKTP</option>
                            <option value="Bahan Ajar & LKPD">Bahan Ajar/LKPD</option>
                            <option value="Jurnal Agenda Guru">Jurnal KBM</option>
                            <option value="Laporan Nilai">Laporan Nilai</option>
                            <option value="Rekap Absensi">Rekap Absen</option>
                        </select>
                    </div>
                </div>

                <!-- Main Content Table/List -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th class="px-6 py-3 w-12 text-center">No</th>
                                <th class="px-6 py-3">Nama Berkas & Tipe</th>
                                <th class="px-6 py-3">Pengaju (Guru)</th>
                                <th class="px-6 py-3 text-center w-36">Tgl Pengajuan</th>
                                <th class="px-6 py-3 text-center w-32">Status</th>
                                <th class="px-6 py-3 text-center w-36">Verifikator & Hasil Review</th>
                                <th class="px-6 py-3 w-32 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="supervisi-list-tbody">
                            <!-- Rows injected dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // 2. RENDER HELPER FUNCTIONS

    const renderStats = () => {
        const statsEl = document.getElementById('stats-container');
        if (!statsEl) return;

        // Calculate counts based on role
        let targetList = approvals;
        if (!isApprover) {
            targetList = approvals.filter(a => a.pengajuEmail === userProfile.email);
        }

        const total = targetList.length;
        const pending = targetList.filter(a => a.status === 'pending').length;
        const disetujui = targetList.filter(a => a.status === 'disetujui').length;
        const revisi = targetList.filter(a => a.status === 'revisi').length;

        statsEl.innerHTML = `
            <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-forest-100 dark:bg-forest-950/50 text-forest-700 dark:text-forest-400 flex items-center justify-center text-lg font-bold">
                    <i class="ph ph-files"></i>
                </div>
                <div>
                    <h5 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pengajuan</h5>
                    <p class="text-lg font-black text-slate-800 dark:text-white mt-0.5">${total}</p>
                </div>
            </div>
            <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center text-lg font-bold">
                    <i class="ph ph-clock"></i>
                </div>
                <div>
                    <h5 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Menunggu Review</h5>
                    <p class="text-lg font-black text-slate-800 dark:text-white mt-0.5">${pending}</p>
                </div>
            </div>
            <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-lg font-bold">
                    <i class="ph ph-check-circle"></i>
                </div>
                <div>
                    <h5 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telah Disetujui</h5>
                    <p class="text-lg font-black text-slate-800 dark:text-white mt-0.5">${disetujui}</p>
                </div>
            </div>
            <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 flex items-center justify-center text-lg font-bold">
                    <i class="ph ph-pencil-line"></i>
                </div>
                <div>
                    <h5 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Butuh Revisi</h5>
                    <p class="text-lg font-black text-slate-800 dark:text-white mt-0.5">${revisi}</p>
                </div>
            </div>
        `;
    };

    const renderTabsNav = () => {
        const navEl = document.getElementById('supervisi-tabs-nav');
        if (!navEl) return;

        if (isApprover) {
            navEl.innerHTML = `
                <button id="tab-pending" class="px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'pending' ? 'bg-forest-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}" onclick="window.switchSupervisiTab('pending')">
                    Antrean Verifikasi
                </button>
                <button id="tab-all" class="px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'all' ? 'bg-forest-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}" onclick="window.switchSupervisiTab('all')">
                    Semua Pengajuan
                </button>
                <button id="tab-my_submissions" class="px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'my_submissions' ? 'bg-forest-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}" onclick="window.switchSupervisiTab('my_submissions')">
                    Pengajuan Saya (Guru)
                </button>
                <button id="tab-history" class="px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'history' ? 'bg-forest-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}" onclick="window.switchSupervisiTab('history')">
                    Log Riwayat
                </button>
            `;
        } else {
            navEl.innerHTML = `
                <button id="tab-my_submissions" class="px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'my_submissions' ? 'bg-forest-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}" onclick="window.switchSupervisiTab('my_submissions')">
                    Pengajuan Saya
                </button>
                <button id="tab-history" class="px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'history' ? 'bg-forest-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}" onclick="window.switchSupervisiTab('history')">
                    Riwayat Ulasan
                </button>
            `;
        }
    };

    const renderList = () => {
        const tbody = document.getElementById('supervisi-list-tbody');
        if (!tbody) return;

        const searchQuery = document.getElementById('sup-search').value.toLowerCase().trim();
        const typeFilter = document.getElementById('sup-filter-tipe').value;

        // Determine what list to draw from
        let dataList = [];
        let isHistoryTab = activeTab === 'history';

        if (isHistoryTab) {
            dataList = approvalHistory;
        } else {
            dataList = approvals;
        }

        // Apply Tab filters
        if (!isHistoryTab) {
            if (activeTab === 'pending') {
                dataList = dataList.filter(a => a.status === 'pending');
            } else if (activeTab === 'my_submissions') {
                dataList = dataList.filter(a => a.pengajuEmail === userProfile.email);
            }
        } else {
            // For history logs tab, if not approver, show only active user's document history
            if (!isApprover) {
                dataList = dataList.filter(h => h.pengajuNama === userProfile.nama);
            }
        }

        // Apply Search & Dropdown filters
        if (searchQuery) {
            dataList = dataList.filter(item => {
                const nameMatch = item.nama && item.nama.toLowerCase().includes(searchQuery);
                const typeMatch = item.tipe && item.tipe.toLowerCase().includes(searchQuery);
                const teacherMatch = item.pengajuNama && item.pengajuNama.toLowerCase().includes(searchQuery);
                const verifierMatch = item.verifikatorNama && item.verifikatorNama.toLowerCase().includes(searchQuery);
                return nameMatch || typeMatch || teacherMatch || verifierMatch;
            });
        }
        if (typeFilter) {
            dataList = dataList.filter(item => item.tipe === typeFilter || (item.tipeDokumen === typeFilter));
        }

        // Check if empty
        if (dataList.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                        <i class="ph ph-folder-open text-3xl block mb-2 text-slate-300 dark:text-slate-700"></i>
                        Tidak ada berkas ditemukan dalam filter ini.
                    </td>
                </tr>
            `;
            return;
        }

        if (isHistoryTab) {
            // Render History Logs
            tbody.innerHTML = dataList.map((hist, idx) => {
                const actionBadgeClass = hist.action === 'disetujui' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20' 
                    : hist.action === 'revisi'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20';

                const actionLabel = hist.action === 'disetujui' 
                    ? 'Disetujui' 
                    : hist.action === 'revisi' 
                    ? 'Butuh Revisi' 
                    : 'Diajukan';

                return `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors">
                        <td class="px-6 py-3.5 text-xs text-slate-500 text-center font-bold">${idx + 1}</td>
                        <td class="px-6 py-3.5 text-xs font-bold text-slate-850 dark:text-slate-200">
                            ${hist.namaDokumen || hist.nama || '-'}
                            <span class="block text-[9px] font-semibold text-slate-400 uppercase mt-0.5">${hist.tipeDokumen || hist.tipe || '-'}</span>
                        </td>
                        <td class="px-6 py-3.5 text-xs text-slate-700 dark:text-slate-350">${hist.pengajuNama}</td>
                        <td class="px-6 py-3.5 text-xs text-center font-medium text-slate-500">${hist.tanggal}</td>
                        <td class="px-6 py-3.5 text-xs text-center">
                            <span class="px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${actionBadgeClass}">
                                ${actionLabel}
                            </span>
                        </td>
                        <td class="px-6 py-3.5 text-xs">
                            <span class="font-extrabold text-slate-850 dark:text-slate-200 block">${hist.verifikatorNama || '-'}</span>
                            <span class="block text-[9.5px] text-slate-450 dark:text-slate-500 italic mt-0.5 line-clamp-2" title="${hist.catatan || '-'}">${hist.catatan || '-'}</span>
                        </td>
                        <td class="px-6 py-3.5 text-xs text-center font-bold text-slate-400">-</td>
                    </tr>
                `;
            }).join('');
        } else {
            // Render Approvals (Submissions)
            tbody.innerHTML = dataList.map((app, idx) => {
                const statusBadgeClass = app.status === 'disetujui' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20' 
                    : app.status === 'revisi'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20';

                const statusLabel = app.status === 'disetujui' 
                    ? 'Disetujui' 
                    : app.status === 'revisi' 
                    ? 'Butuh Revisi' 
                    : 'Menunggu';

                // Display verifier if disetujui or rejected
                const verifierInfo = app.status !== 'pending' && app.verifikatorNama
                    ? `
                        <span class="font-extrabold text-slate-800 dark:text-slate-200 block">${app.verifikatorNama}</span>
                        <span class="block text-[9px] text-slate-400 dark:text-slate-500 italic line-clamp-1 mt-0.5" title="${app.catatan || ''}">${app.catatan || '-'}</span>
                    `
                    : `<span class="text-slate-400 italic text-[10px]">Belum direview</span>`;

                // Actions buttons depending on role and current item status
                let actionButtonsHtml = '';
                const isOwnSubmission = app.pengajuEmail === userProfile.email;

                if (isApprover && app.status === 'pending') {
                    // Verifier can review pending submissions
                    actionButtonsHtml = `
                        <button onclick="window.tinjauSupervisi('${app.id}')" class="px-2.5 py-1 bg-forest-750 hover:bg-forest-800 text-white font-bold rounded-lg text-[9px] flex items-center gap-1 shadow-sm"><i class="ph ph-eye"></i> Tinjau</button>
                    `;
                } else if (isOwnSubmission && app.status === 'revisi') {
                    // Teacher can resubmit a rejected document
                    actionButtonsHtml = `
                        <button onclick="window.ajukanUlangSupervisi('${app.id}')" class="px-2.5 py-1 bg-amber-650 hover:bg-amber-700 text-white font-bold rounded-lg text-[9px] flex items-center gap-1 shadow-sm"><i class="ph ph-arrow-counter-clockwise"></i> Perbaiki</button>
                    `;
                } else if (app.status === 'disetujui') {
                    // Print single approval ticket/receipt
                    actionButtonsHtml = `
                        <button onclick="window.printBuktiSupervisi('${app.id}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-650 dark:text-slate-200 font-bold rounded-lg text-[9px] flex items-center gap-1 shadow-sm"><i class="ph ph-printer"></i> Bukti</button>
                    `;
                } else {
                    actionButtonsHtml = `<button disabled class="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-400 rounded-lg text-[9px] cursor-not-allowed flex items-center gap-1"><i class="ph ph-lock"></i> Kunci</button>`;
                }

                return `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors">
                        <td class="px-6 py-3.5 text-xs text-slate-500 text-center font-bold">${idx + 1}</td>
                        <td class="px-6 py-3.5 text-xs font-bold text-slate-850 dark:text-slate-200">
                            ${app.nama}
                            <span class="block text-[9px] font-semibold text-slate-400 uppercase mt-0.5">${app.tipe}</span>
                        </td>
                        <td class="px-6 py-3.5 text-xs text-slate-700 dark:text-slate-350">${app.pengajuNama}</td>
                        <td class="px-6 py-3.5 text-xs text-center text-slate-500 font-medium">${app.tanggalPengajuan}</td>
                        <td class="px-6 py-3.5 text-xs text-center">
                            <span class="px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${statusBadgeClass}">
                                ${statusLabel}
                            </span>
                        </td>
                        <td class="px-6 py-3.5 text-xs">${verifierInfo}</td>
                        <td class="px-6 py-3.5 text-xs flex justify-center gap-1.5">${actionButtonsHtml}</td>
                    </tr>
                `;
            }).join('');
        }
    };

    // Initialize UI elements
    renderStats();
    renderTabsNav();
    renderList();

    // 3. LISTENERS & DYNAMIC HANDLERS

    // Search and filters
    document.getElementById('sup-search').addEventListener('input', renderList);
    document.getElementById('sup-filter-tipe').addEventListener('change', renderList);

    // Global switch tab action
    window.switchSupervisiTab = (tabName) => {
        activeTab = tabName;
        renderTabsNav();
        renderList();
    };

    // AJUKAN BARU (TEACHER FORM MODAL)
    document.getElementById('btn-ajukan-baru').addEventListener('click', () => {
        // Find documents available for the teacher profile to select from
        // In real terms, documents in the `documents` collection can be used
        const docOptions = documents.map(d => `<option value="${d.id}">${d.tipe} — ${d.nama} (${d.ukuran})</option>`).join('');
        
        const modalHtml = `
            <div class="space-y-4 text-left">
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Tipe Perangkat Pembelajaran</label>
                    <select id="aj-tipe" class="w-full px-3.5 py-1.5 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        <option value="Modul Ajar">Modul Ajar / RPP</option>
                        <option value="Program Tahunan">Program Tahunan (PROTA)</option>
                        <option value="Program Semester">Program Semester (PROMES)</option>
                        <option value="Alur Tujuan Pembelajaran">Alur Tujuan Pembelajaran (ATP)</option>
                        <option value="Kriteria Ketercapaian">Kriteria Ketercapaian (KKTP)</option>
                        <option value="Bahan Ajar">Bahan Ajar / Ringkasan Handout</option>
                        <option value="Lembar Kerja Peserta Didik">Lembar Kerja Peserta Didik (LKPD)</option>
                        <option value="Bank Soal">Bank Soal</option>
                        <option value="Kisi-Kisi Soal">Kisi-Kisi Soal</option>
                        <option value="Jurnal Agenda Guru">Jurnal Agenda KBM</option>
                        <option value="Laporan Nilai">Laporan Nilai Kelas</option>
                        <option value="Rekap Absensi">Rekap Absensi Bulanan</option>
                    </select>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Pilih Dokumen dari Sistem</label>
                    <select id="aj-doc-id" class="w-full px-3.5 py-1.5 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        <option value="custom">-- Masukkan Nama Berkas Baru --</option>
                        ${docOptions}
                    </select>
                </div>

                <div id="wrapper-custom-filename">
                    <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Nama Berkas Pengajuan</label>
                    <input type="text" id="aj-nama" placeholder="Contoh: Modul Ajar Informatika Kelas VII Ganjil.pdf" class="w-full px-3.5 py-1.5 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Catatan Tambahan untuk Verifikator (Opsional)</label>
                    <textarea id="aj-catatan-guru" rows="3" placeholder="Tuliskan keterangan tambahan atau permohonan khusus..." class="w-full px-3.5 py-2 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500"></textarea>
                </div>
            </div>
        `;

        openModal("Ajukan Verifikasi Berkas Akademik", modalHtml, "Kirim Pengajuan", async () => {
            const tipe = document.getElementById('aj-tipe').value;
            const docSel = document.getElementById('aj-doc-id').value;
            let nama = '';
            
            if (docSel === 'custom') {
                nama = document.getElementById('aj-nama').value.trim();
                if (!nama) {
                    showToast("Nama berkas wajib diisi!", "error");
                    return;
                }
            } else {
                const selectedDoc = documents.find(d => d.id === docSel);
                nama = selectedDoc ? selectedDoc.nama : `Dokumen ${tipe}.pdf`;
            }

            const catatanGuru = document.getElementById('aj-catatan-guru').value.trim();
            const dateStr = new Date().toISOString().split('T')[0];

            const newApproval = {
                id: 'app_' + Date.now(),
                documentId: docSel !== 'custom' ? docSel : '',
                tipe,
                nama,
                pengajuNama: userProfile.nama || "Guru Pendidik",
                pengajuEmail: userProfile.email,
                tanggalPengajuan: dateStr,
                status: 'pending',
                verifikatorNama: '',
                verifikatorEmail: '',
                tanggalVerifikasi: '',
                catatan: catatanGuru
            };

            // Log history
            const newHistory = {
                id: 'hist_' + Date.now(),
                approvalId: newApproval.id,
                tipeDokumen: tipe,
                namaDokumen: nama,
                pengajuNama: userProfile.nama || "Guru Pendidik",
                verifikatorNama: '',
                action: 'diajukan',
                tanggal: new Date().toLocaleString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
                catatan: catatanGuru ? `Keterangan: ${catatanGuru}` : 'Diajukan untuk supervisi pertama kali.'
            };

            approvals.push(newApproval);
            approvalHistory.unshift(newHistory);

            await dbService.saveData('approvals', approvals);
            await dbService.saveData('approval_history', approvalHistory);

            closeModal();
            renderStats();
            renderList();
            showToast("Pengajuan berkas baru berhasil dikirim!");
        });

        // Trigger dynamic filename visibility based on document selection dropdown
        const selectDoc = document.getElementById('aj-doc-id');
        const customWrapper = document.getElementById('wrapper-custom-filename');
        selectDoc.addEventListener('change', () => {
            if (selectDoc.value === 'custom') {
                customWrapper.classList.remove('hidden');
            } else {
                customWrapper.classList.add('hidden');
            }
        });
    });

    // VERIFICATION ACTION (TINJAU BERKAS MODAL FOR APPROVER)
    window.tinjauSupervisi = (id) => {
        const appObj = approvals.find(a => a.id === id);
        if (!appObj) return;

        const reviewHtml = `
            <div class="space-y-4 text-left">
                <!-- Info Grid -->
                <div class="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
                    <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200">Rincian Pengajuan</h5>
                    <div class="grid grid-cols-3 text-[10.5px] gap-y-1.5">
                        <span class="text-slate-400 uppercase font-semibold">Tipe Berkas</span>
                        <span class="col-span-2 text-slate-800 dark:text-slate-200 font-bold">${appObj.tipe}</span>

                        <span class="text-slate-400 uppercase font-semibold">Nama Berkas</span>
                        <span class="col-span-2 text-slate-800 dark:text-slate-200 font-bold break-all">${appObj.nama}</span>

                        <span class="text-slate-400 uppercase font-semibold">Nama Pengaju</span>
                        <span class="col-span-2 text-slate-800 dark:text-slate-200 font-bold">${appObj.pengajuNama}</span>

                        <span class="text-slate-400 uppercase font-semibold">Tgl Diajukan</span>
                        <span class="col-span-2 text-slate-800 dark:text-slate-200 font-bold">${appObj.tanggalPengajuan}</span>

                        ${appObj.catatan ? `
                            <span class="text-slate-400 uppercase font-semibold">Catatan Guru</span>
                            <span class="col-span-2 text-slate-600 dark:text-slate-400 italic">${appObj.catatan}</span>
                        ` : ''}
                    </div>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Hasil Catatan & Feedback Supervisi</label>
                    <textarea id="rev-catatan" rows="3" placeholder="Masukkan catatan koreksi, arahan revisi, atau catatan pujian kelengkapan..." class="w-full px-3.5 py-2 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500"></textarea>
                </div>

                <div class="flex border-t border-slate-100 dark:border-slate-750 pt-4 justify-between items-center gap-3">
                    <button type="button" onclick="window.submitReviewAction('${id}', 'revisi')" class="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow active:scale-98">
                        <i class="ph ph-x-circle text-base"></i> Tolak / Butuh Revisi
                    </button>
                    <button type="button" onclick="window.submitReviewAction('${id}', 'disetujui')" class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow active:scale-98">
                        <i class="ph ph-check-circle text-base"></i> Setujui Berkas
                    </button>
                </div>
            </div>
        `;

        openModal("Supervisi Akademik — Verifikasi Dokumen", reviewHtml, "Kembali", () => {
            closeModal();
        });
        
        // Hide standard modal footer buttons since we custom-rendered actions
        const modalFooter = document.getElementById('crud-modal-save-btn').parentNode;
        if (modalFooter) {
            modalFooter.classList.add('hidden');
        }

        // Restore footer class upon close
        const originalClose = window.closeModal;
        window.closeModal = () => {
            if (modalFooter) modalFooter.classList.remove('hidden');
            window.closeModal = originalClose;
            originalClose();
        };

        // Review Action Submit
        window.submitReviewAction = async (appId, actionStatus) => {
            const feedback = document.getElementById('rev-catatan').value.trim();
            const dateStr = new Date().toISOString().split('T')[0];

            const appIdx = approvals.findIndex(a => a.id === appId);
            if (appIdx === -1) return;

            // Update item status
            approvals[appIdx].status = actionStatus;
            approvals[appIdx].verifikatorNama = userProfile.nama || "Supervisi Kurikulum";
            approvals[appIdx].verifikatorEmail = userProfile.email;
            approvals[appIdx].tanggalVerifikasi = dateStr;
            approvals[appIdx].catatan = feedback || (actionStatus === 'disetujui' ? 'Dokumen disetujui tanpa catatan.' : 'Butuh perbaikan administrasi.');

            // Log action in history
            const histLog = {
                id: 'hist_' + Date.now(),
                approvalId: appId,
                tipeDokumen: approvals[appIdx].tipe,
                namaDokumen: approvals[appIdx].nama,
                pengajuNama: approvals[appIdx].pengajuNama,
                verifikatorNama: userProfile.nama || "Supervisi Kurikulum",
                action: actionStatus,
                tanggal: new Date().toLocaleString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
                catatan: feedback || (actionStatus === 'disetujui' ? 'Supervisi disetujui.' : 'Berkas dikembalikan untuk direvisi.')
            };

            approvalHistory.unshift(histLog);

            await dbService.saveData('approvals', approvals);
            await dbService.saveData('approval_history', approvalHistory);

            closeModal();
            renderStats();
            renderList();
            showToast(actionStatus === 'disetujui' ? "Dokumen berhasil disetujui & disahkan." : "Dokumen dikembalikan ke pengaju untuk direvisi.", actionStatus !== 'disetujui');
        };
    };

    // TEACHER RESUBMISSION / RESUBMIT ACTION
    window.ajukanUlangSupervisi = (appId) => {
        const appObj = approvals.find(a => a.id === appId);
        if (!appObj) return;

        ctx.showConfirmDialog(
            "Ajukan Ulang Berkas",
            `Apakah Anda yakin berkas <strong>${appObj.nama}</strong> sudah selesai direvisi dan siap diajukan kembali ke kurikulum?`,
            async () => {
                const appIdx = approvals.findIndex(a => a.id === appId);
                if (appIdx === -1) return;

                approvals[appIdx].status = 'pending';
                approvals[appIdx].tanggalPengajuan = new Date().toISOString().split('T')[0];

                const histLog = {
                    id: 'hist_' + Date.now(),
                    approvalId: appId,
                    tipeDokumen: approvals[appIdx].tipe,
                    namaDokumen: approvals[appIdx].nama,
                    pengajuNama: approvals[appIdx].pengajuNama,
                    verifikatorNama: '',
                    action: 'diajukan_ulang',
                    tanggal: new Date().toLocaleString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
                    catatan: 'Diajukan kembali setelah perbaikan/revisi berkas.'
                };

                approvalHistory.unshift(histLog);

                await dbService.saveData('approvals', approvals);
                await dbService.saveData('approval_history', approvalHistory);

                renderStats();
                renderList();
                showToast("Berkas berhasil diajukan ulang!");
            }
        );
    };

    // ============================================
    // PRINT PREVIEWS
    // ============================================

    // 1. PRINT SINGLE APPROVAL RECEIPT/TICKET (BUKTI SUPERVISI)
    window.printBuktiSupervisi = (appId) => {
        const app = approvals.find(a => a.id === appId);
        if (!app) return;

        const w = window.open('', '_blank');
        const todayStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

        w.document.write(`
            <html>
            <head>
                <title>Bukti Pengesahan Supervisi — ${app.nama}</title>
                <style>
                    body {
                        font-family: 'Times New Roman', serif;
                        padding: 40px;
                        color: #000;
                        background: #fff;
                        font-size: 12px;
                        line-height: 1.5;
                    }
                    .kop-surat {
                        display: flex;
                        align-items: center;
                        border-bottom: 3px double #000;
                        padding-bottom: 10px;
                        margin-bottom: 25px;
                    }
                    .kop-logo {
                        width: 70px;
                        height: 70px;
                        margin-right: 15px;
                        object-fit: contain;
                    }
                    .kop-text {
                        flex-grow: 1;
                        text-align: center;
                    }
                    .kop-yayasan {
                        font-size: 13px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin: 0;
                    }
                    .kop-madrasah {
                        font-size: 17px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin: 2px 0;
                    }
                    .kop-alamat {
                        font-size: 9px;
                        font-style: italic;
                        margin: 0;
                    }
                    .title-doc {
                        text-align: center;
                        font-size: 14px;
                        font-weight: bold;
                        text-decoration: underline;
                        text-transform: uppercase;
                        margin-bottom: 20px;
                    }
                    .meta-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    .meta-table td {
                        padding: 6px 8px;
                        vertical-align: top;
                    }
                    .feedback-box {
                        border: 1px solid #000;
                        background: #fafafa;
                        padding: 15px;
                        border-radius: 4px;
                        margin-bottom: 40px;
                        font-style: italic;
                    }
                    .sig-section {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 40px;
                    }
                    .sig-box {
                        text-align: center;
                        width: 220px;
                    }
                    .no-print-bar {
                        background: #1e293b;
                        padding: 10px;
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                        margin-bottom: 20px;
                        border-radius: 6px;
                    }
                    .btn-action {
                        background: #10b981;
                        color: white;
                        border: none;
                        padding: 6px 16px;
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
                    <button class="btn-action" onclick="window.print()">Cetak Bukti</button>
                    <button class="btn-action" style="background:#ef4444;" onclick="window.close()">Tutup</button>
                </div>

                <div class="kop-surat">
                    <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="kop-logo">
                    <div class="kop-text">
                        <p class="kop-yayasan">Yayasan Idrisiyyah Tasikmalaya</p>
                        <h2 class="kop-madrasah">Madrasah Tsanawiyah (MTs) Idrisiyyah</h2>
                        <p class="kop-alamat">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855 | Telp: (0265) 323456</p>
                    </div>
                </div>

                <h3 class="title-doc">SURAT PENGESAHAN DOKUMEN ADMINISTRASI AJAR</h3>
                
                <p>Menerangkan dengan sesungguhnya bahwa berkas perangkat ajar yang diajukan oleh pendidik di bawah ini telah ditelaah, disurpervisi, dan disahkan oleh Tim Kurikulum MTs Idrisiyyah Tasikmalaya:</p>

                <table class="meta-table">
                    <tr>
                        <td style="width: 25%; font-weight: bold;">Nama Pendidik</td><td style="width: 3%">:</td><td>${app.pengajuNama}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Tipe Dokumen</td><td>:</td><td>${app.tipe}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Nama File Berkas</td><td>:</td><td style="font-family: monospace;">${app.nama}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Tanggal Pengajuan</td><td>:</td><td>${app.tanggalPengajuan}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Tanggal Pengesahan</td><td>:</td><td>${app.tanggalVerifikasi}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Status Kelayakan</td><td>:</td><td><strong style="color: green;">LAYAK PAKAI (DISETUJUI)</strong></td>
                    </tr>
                </table>

                <h4 style="margin-bottom: 8px; text-transform: uppercase;">Catatan Supervisi / Rekomendasi:</h4>
                <div class="feedback-box">
                    "${app.catatan || 'Dokumen telah memenuhi seluruh rubrik penilaian kelayakan administrasi ajar dan dinyatakan sah.'}"
                </div>

                <div class="sig-section">
                    <div class="sig-box">
                        <p>Mengetahui,</p>
                        <p>Kepala Madrasah</p>
                        <div style="height: 55px;"></div>
                        <p><strong>${settings.kepala}</strong></p>
                        <p style="border-top: 1px solid #000; font-size:9.5px; padding-top: 2px;">NIP. ${settings.nipKepala}</p>
                    </div>
                    <div class="sig-box">
                        <p>Tasikmalaya, ${todayStr}</p>
                        <p>Waka Bidang Kurikulum (Verifikator)</p>
                        <div style="height: 55px;"></div>
                        <p><strong>${app.verifikatorNama || 'Ir. Hermawan, M.Pd.'}</strong></p>
                        <p style="border-top: 1px solid #000; font-size:9.5px; padding-top: 2px;">NIP. 197508212005011002</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        w.document.close();
    };

    // 2. PRINT COMPREHENSIVE SUPERVISION LOG REPORT (A4 LANDSCAPE)
    if (isApprover) {
        document.getElementById('btn-print-laporan').addEventListener('click', () => {
            const w = window.open('', '_blank');
            const todayStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

            // Generate table rows of all approvals
            const rowsHtml = approvals.map((app, idx) => {
                const statusLabel = app.status === 'disetujui' 
                    ? 'Disetujui' 
                    : app.status === 'revisi' 
                    ? 'Butuh Revisi' 
                    : 'Menunggu';

                return `
                    <tr style="border: 1px solid #000;">
                        <td style="text-align: center; border: 1px solid #000; padding: 6px;">${idx + 1}</td>
                        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${app.pengajuNama}</td>
                        <td style="border: 1px solid #000; padding: 6px;">${app.tipe}</td>
                        <td style="border: 1px solid #000; padding: 6px; font-family: monospace; font-size: 9px;">${app.nama}</td>
                        <td style="text-align: center; border: 1px solid #000; padding: 6px;">${app.tanggalPengajuan}</td>
                        <td style="text-align: center; border: 1px solid #000; padding: 6px; font-weight: bold;">${statusLabel}</td>
                        <td style="border: 1px solid #000; padding: 6px; font-size: 9px; line-height: 1.2;">
                            <strong>${app.verifikatorNama || '-'}</strong>: ${app.catatan || '-'}
                        </td>
                    </tr>
                `;
            }).join('');

            w.document.write(`
                <html>
                <head>
                    <title>Laporan Hasil Supervisi Akademik Bulanan</title>
                    <style>
                        @page { size: A4 landscape; margin: 1.5cm; }
                        body {
                            font-family: 'Times New Roman', serif;
                            font-size: 11px;
                            line-height: 1.4;
                            color: #000;
                            background: #fff;
                            padding: 0;
                            margin: 0;
                        }
                        .kop-surat {
                            display: flex;
                            align-items: center;
                            border-bottom: 3px double #000;
                            padding-bottom: 10px;
                            margin-bottom: 20px;
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
                            margin: 2px 0;
                        }
                        .kop-alamat {
                            font-size: 8.5px;
                            font-style: italic;
                            margin: 0;
                        }
                        .title-doc {
                            text-align: center;
                            font-size: 13px;
                            font-weight: bold;
                            text-transform: uppercase;
                            text-decoration: underline;
                            margin: 15px 0 5px 0;
                        }
                        .subtitle-doc {
                            text-align: center;
                            font-size: 11px;
                            margin-bottom: 15px;
                        }
                        .table-data {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 15px 0;
                        }
                        .table-data th, .table-data td {
                            border: 1px solid #000;
                            padding: 6px;
                        }
                        .table-data th {
                            background: #f3f4f6;
                            font-weight: bold;
                            text-align: center;
                            text-transform: uppercase;
                            font-size: 10px;
                        }
                        .signatures {
                            margin-top: 30px;
                            display: flex;
                            justify-content: space-between;
                            page-break-inside: avoid;
                        }
                        .sig-box {
                            text-align: center;
                            width: 220px;
                        }
                        .no-print-bar {
                            background: #1e293b;
                            padding: 10px;
                            display: flex;
                            justify-content: center;
                            gap: 10px;
                            border-bottom: 2px solid #0f172a;
                        }
                        .btn-print {
                            background: #10b981;
                            color: white;
                            border: none;
                            padding: 6px 16px;
                            font-size: 11px;
                            font-weight: bold;
                            border-radius: 4px;
                            cursor: pointer;
                        }
                        @media print {
                            .no-print-bar { display: none !important; }
                        }
                    </style>
                </head>
                <body>
                    <div class="no-print-bar">
                        <button class="btn-print" onclick="window.print()">Cetak Laporan</button>
                        <button class="btn-print" style="background:#ef4444;" onclick="window.close()">Tutup</button>
                    </div>
                    <div style="padding: 20px;">
                        <div class="kop-surat">
                            <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="kop-logo">
                            <div class="kop-text">
                                <p class="kop-yayasan">Yayasan Idrisiyyah Tasikmalaya</p>
                                <h2 class="kop-madrasah">Madrasah Tsanawiyah (MTs) Idrisiyyah</h2>
                                <p class="kop-alamat">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855 | Telp: (0265) 323456</p>
                            </div>
                        </div>

                        <h3 class="title-doc">LAPORAN HASIL SUPERVISI AKADEMIK & ADMINISTRASI AJAR GURU</h3>
                        <p class="subtitle-doc">Tahun Pelajaran: ${settings.tahunAjaran} | Semester: ${settings.semester}</p>

                        <table class="table-data">
                            <thead>
                                <tr>
                                    <th style="width: 4%">No</th>
                                    <th style="width: 20%">Nama Guru (Pendidik)</th>
                                    <th style="width: 15%">Tipe Dokumen</th>
                                    <th style="width: 25%">Nama File / Berkas</th>
                                    <th style="width: 10%">Tgl Pengajuan</th>
                                    <th style="width: 10%">Status Akhir</th>
                                    <th>Catatan Review & Pengesahan</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                        </table>

                        <div class="signatures">
                            <div class="sig-box">
                                <p>Mengetahui,</p>
                                <p>Kepala Madrasah</p>
                                <div style="height: 50px;"></div>
                                <p><strong>${settings.kepala}</strong></p>
                                <p style="border-top:1px solid #000; font-size:9px; padding-top:2px;">NIP. ${settings.nipKepala}</p>
                            </div>
                            <div class="sig-box">
                                <p>Tasikmalaya, ${todayStr}</p>
                                <p>Waka Kurikulum Bidang Supervisi</p>
                                <div style="height: 50px;"></div>
                                <p><strong>Ir. Hermawan, M.Pd.</strong></p>
                                <p style="border-top:1px solid #000; font-size:9px; padding-top:2px;">NIP. 197508212005011002</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `);
            w.document.close();
        });
    }
}
