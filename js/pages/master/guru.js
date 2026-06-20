// ============================================
// TRADISI — Data Guru Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, openModal, closeModal, showConfirmDialog } = ctx;
    const teachers = await dbService.getData('teachers') || [];

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

    window.renderTeachersTable = function(list = teachers) {
        const tbody = document.getElementById('teachers-table-body');
        if (!tbody) return;
        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-xs text-slate-500">Tidak ada data guru ditemukan.</td></tr>`;
            return;
        }
        tbody.innerHTML = list.map((t, idx) => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <td class="px-6 py-3.5 text-xs text-slate-500 text-center">${idx + 1}</td>
                <td class="px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">${t.nip || '-'}</td>
                <td class="px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">${t.nama}</td>
                <td class="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-400">${t.jabatan || 'Guru'}</td>
                <td class="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-400">${t.statusKepegawaian || '-'}</td>
                <td class="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-400">${t.hp || '-'}</td>
                <td class="px-6 py-3.5 text-xs flex gap-2 no-print">
                    <button onclick="editTeacherModal('${t.id}')" class="p-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg transition-colors" title="Ubah"><i class="ph ph-pencil-simple text-base"></i></button>
                    <button onclick="deleteTeacher('${t.id}')" class="p-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors" title="Hapus"><i class="ph ph-trash text-base"></i></button>
                </td>
            </tr>
        `).join('');
    };

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <!-- Header cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${teachers.length}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pendidik</div>
                </div>
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold text-blue-600">${teachers.filter(t => t.jk === 'L').length}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Laki-laki</div>
                </div>
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold text-pink-600">${teachers.filter(t => t.jk === 'P').length}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perempuan</div>
                </div>
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold text-emerald-600">${teachers.filter(t => t.statusKepegawaian === 'PNS' || t.statusKepegawaian === 'P3K').length}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ASN</div>
                </div>
            </div>

            <!-- Table Card -->
            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex flex-1 gap-2.5 max-w-md">
                        <div class="relative flex-1">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><i class="ph ph-magnifying-glass"></i></span>
                            <input type="text" id="search-teacher" oninput="filterTeachers()" placeholder="Cari pendidik berdasarkan nama/NIP..." class="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-2 no-print">
                        <button onclick="addTeacherModal()" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-user-plus text-base"></i> Tambah Pendidik
                        </button>
                        <button onclick="exportTeachersExcel()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-file-xls text-base"></i> Export Excel
                        </button>
                        <button onclick="document.getElementById('import-excel-file').click()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-file-arrow-up text-base"></i> Import Excel
                        </button>
                        <input type="file" id="import-excel-file" accept=".xlsx, .xls" class="hidden" onchange="importTeachersExcel(event)">
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th class="px-6 py-3 w-12 text-center">No</th>
                                <th class="px-6 py-3 w-40">NIP</th>
                                <th class="px-6 py-3">Nama Lengkap</th>
                                <th class="px-6 py-3">Jabatan</th>
                                <th class="px-6 py-3">Status</th>
                                <th class="px-6 py-3 w-32">No HP</th>
                                <th class="px-6 py-3 w-28 no-print">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="teachers-table-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    window.filterTeachers = function() {
        const search = document.getElementById('search-teacher').value.toLowerCase();
        const filtered = teachers.filter(t => {
            return t.nama.toLowerCase().includes(search) || (t.nip && t.nip.includes(search));
        });
        renderTeachersTable(filtered);
    };

    window.addTeacherModal = function() {
        const formBody = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">NIP</label><input type="text" id="t-nip" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">NUPTK</label><input type="text" id="t-nuptk" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                </div>
                <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Lengkap</label><input type="text" id="t-nama" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Jenis Kelamin</label><select id="t-jk" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Status</label><select id="t-status" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"><option value="GTT">GTT (Honorer)</option><option value="PNS">PNS</option><option value="P3K">P3K</option></select></div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Jabatan</label><input type="text" id="t-jabatan" value="Guru Mapel" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">No HP</label><input type="text" id="t-hp" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                </div>
            </div>
        `;
        openModal("Tambah Pendidik Baru", formBody, "Tambah", async () => {
            const newT = {
                id: 't_' + Date.now(),
                nip: document.getElementById('t-nip').value.trim(),
                nuptk: document.getElementById('t-nuptk').value.trim(),
                nama: document.getElementById('t-nama').value.trim(),
                jk: document.getElementById('t-jk').value,
                statusKepegawaian: document.getElementById('t-status').value,
                jabatan: document.getElementById('t-jabatan').value.trim(),
                hp: document.getElementById('t-hp').value.trim(),
                status: 'aktif'
            };
            teachers.push(newT);
            await dbService.saveData('teachers', teachers);
            closeModal();
            filterTeachers();
            showToast("Pendidik baru berhasil ditambahkan!");
        });
    };

    window.editTeacherModal = function(id) {
        const t = teachers.find(item => item.id === id);
        if (!t) return;
        const formBody = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">NIP</label><input type="text" id="t-nip" value="${t.nip || ''}" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">NUPTK</label><input type="text" id="t-nuptk" value="${t.nuptk || ''}" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                </div>
                <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Lengkap</label><input type="text" id="t-nama" value="${t.nama}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Jenis Kelamin</label><select id="t-jk" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"><option value="L" ${t.jk==='L'?'selected':''}>Laki-laki</option><option value="P" ${t.jk==='P'?'selected':''}>Perempuan</option></select></div>
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Status</label><select id="t-status" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"><option value="GTT" ${t.statusKepegawaian==='GTT'?'selected':''}>GTT (Honorer)</option><option value="PNS" ${t.statusKepegawaian==='PNS'?'selected':''}>PNS</option><option value="P3K" ${t.statusKepegawaian==='P3K'?'selected':''}>P3K</option></select></div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Jabatan</label><input type="text" id="t-jabatan" value="${t.jabatan || 'Guru Mapel'}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">No HP</label><input type="text" id="t-hp" value="${t.hp || ''}" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                </div>
            </div>
        `;
        openModal("Ubah Data Pendidik", formBody, "Perbarui", async () => {
            const index = teachers.findIndex(item => item.id === id);
            if (index !== -1) {
                teachers[index] = {
                    ...teachers[index],
                    nip: document.getElementById('t-nip').value.trim(),
                    nuptk: document.getElementById('t-nuptk').value.trim(),
                    nama: document.getElementById('t-nama').value.trim(),
                    jk: document.getElementById('t-jk').value,
                    statusKepegawaian: document.getElementById('t-status').value,
                    jabatan: document.getElementById('t-jabatan').value.trim(),
                    hp: document.getElementById('t-hp').value.trim()
                };
                await dbService.saveData('teachers', teachers);
            }
            closeModal();
            filterTeachers();
            showToast("Data pendidik berhasil diperbarui!");
        });
    };

    window.deleteTeacher = function(id) {
        const t = teachers.find(item => item.id === id);
        showConfirmDialog("Hapus Pendidik", `Hapus data <strong>${t ? t.nama : 'pendidik ini'}</strong>?`, () => {
            const index = teachers.findIndex(item => item.id === id);
            if (index !== -1) {
                // Remove from in-memory and trigger soft delete
                teachers.splice(index, 1);
                dbService.softDeleteItem('teachers', id).then(() => {
                    filterTeachers();
                    showToast("Data pendidik dihapus.");
                });
            }
        });
    };

    // Excel Export
    window.exportTeachersExcel = async function() {
        try {
            const xlsx = await loadXlsx();
            const exportData = teachers.map((t, i) => ({
                "No": i + 1,
                "NIP": t.nip || "",
                "NUPTK": t.nuptk || "",
                "Nama Lengkap": t.nama,
                "Jenis Kelamin": t.jk === "L" ? "Laki-laki" : "Perempuan",
                "Jabatan": t.jabatan || "Guru",
                "Status Kepegawaian": t.statusKepegawaian || "GTT",
                "No HP": t.hp || ""
            }));

            const worksheet = xlsx.utils.json_to_sheet(exportData);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Daftar Guru");
            xlsx.writeFile(workbook, "Data_Guru_MTs_Idrisiyyah.xlsx");
            showToast("Export Excel berhasil!");
        } catch (err) {
            console.error(err);
            showToast("Gagal melakukan export Excel.", "error");
        }
    };

    // Excel Import
    window.importTeachersExcel = async function(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const xlsx = await loadXlsx();
            const reader = new FileReader();
            reader.onload = async function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = xlsx.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows = xlsx.utils.sheet_to_json(sheet);

                let importedCount = 0;
                rows.forEach(row => {
                    // Normalize spreadsheet row keys
                    const nama = row["Nama Lengkap"] || row["Nama"] || row["nama"];
                    if (nama) {
                        teachers.push({
                            id: 't_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                            nip: String(row["NIP"] || row["nip"] || "").trim(),
                            nuptk: String(row["NUPTK"] || row["nuptk"] || "").trim(),
                            nama: String(nama).trim(),
                            jk: String(row["Jenis Kelamin"] || row["JK"] || "L").charAt(0).toUpperCase() === 'P' ? 'P' : 'L',
                            statusKepegawaian: String(row["Status Kepegawaian"] || row["Status"] || "GTT").toUpperCase(),
                            jabatan: String(row["Jabatan"] || "Guru Mapel").trim(),
                            hp: String(row["No HP"] || row["HP"] || "").trim(),
                            status: 'aktif'
                        });
                        importedCount++;
                    }
                });

                if (importedCount > 0) {
                    await dbService.saveData('teachers', teachers);
                    filterTeachers();
                    showToast(`Berhasil mengimpor ${importedCount} data guru!`);
                } else {
                    showToast("Tidak ada data guru yang valid untuk diimpor.", "error");
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error(err);
            showToast("Gagal membaca file Excel.", "error");
        }
        // Reset input value to allow re-uploading same file name
        event.target.value = '';
    };

    renderTeachersTable();
}
