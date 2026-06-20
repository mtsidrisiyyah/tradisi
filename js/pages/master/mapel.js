// ============================================
// TRADISI — Data Mata Pelajaran Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, openModal, closeModal, showConfirmDialog } = ctx;
    const subjects = await dbService.getData('subjects') || [];

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

    window.renderSubjectsTable = function(list = subjects) {
        const tbody = document.getElementById('subjects-table-body');
        if (!tbody) return;
        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-xs text-slate-500">Tidak ada data mata pelajaran ditemukan.</td></tr>`;
            return;
        }
        tbody.innerHTML = list.map((s, idx) => {
            let kelompokBadge = '';
            if (s.kelompok === 'A') kelompokBadge = '<span class="px-2 py-0.5 rounded-full font-bold text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">A (Wajib)</span>';
            else if (s.kelompok === 'B') kelompokBadge = '<span class="px-2 py-0.5 rounded-full font-bold text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">B (Muatan Lokal)</span>';
            else kelompokBadge = '<span class="px-2 py-0.5 rounded-full font-bold text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">C (Keagamaan)</span>';

            return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors">
                    <td class="px-6 py-3.5 text-xs text-slate-500 text-center">${idx + 1}</td>
                    <td class="px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">${s.kode || '-'}</td>
                    <td class="px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">${s.nama}</td>
                    <td class="px-6 py-3.5 text-xs">${kelompokBadge}</td>
                    <td class="px-6 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-350 text-center">${s.tingkat || '-'}</td>
                    <td class="px-6 py-3.5 text-xs text-slate-650 dark:text-slate-400 text-center font-semibold">${s.alokasiJam || 0} JP</td>
                    <td class="px-6 py-3.5 text-xs flex gap-2 no-print justify-center">
                        <button onclick="editSubjectModal('${s.id}')" class="p-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg transition-colors" title="Ubah"><i class="ph ph-pencil-simple text-base"></i></button>
                        <button onclick="deleteSubject('${s.id}')" class="p-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors" title="Hapus"><i class="ph ph-trash text-base"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    };

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <!-- Header cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${subjects.length}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Mapel</div>
                </div>
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold text-blue-600">${subjects.filter(s => s.kelompok === 'A').length}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kelompok A (Wajib)</div>
                </div>
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold text-purple-600">${subjects.filter(s => s.kelompok === 'B').length}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kelompok B (Mulok)</div>
                </div>
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold text-emerald-600">${subjects.reduce((sum, s) => sum + Number(s.alokasiJam || 0), 0)}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Beban JP</div>
                </div>
            </div>

            <!-- Table Card -->
            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex flex-col sm:flex-row flex-1 gap-2.5 max-w-xl">
                        <div class="relative flex-1">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><i class="ph ph-magnifying-glass"></i></span>
                            <input type="text" id="search-subject" oninput="filterSubjects()" placeholder="Cari mapel berdasarkan nama/kode..." class="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                        </div>
                        <select id="filter-kelompok" onchange="filterSubjects()" class="px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                            <option value="">Semua Kelompok</option>
                            <option value="A">Kelompok A (Wajib)</option>
                            <option value="B">Kelompok B (Mulok)</option>
                            <option value="C">Kelompok C (Keagamaan)</option>
                        </select>
                        <select id="filter-tingkat" onchange="filterSubjects()" class="px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                            <option value="">Semua Tingkat</option>
                            <option value="VII">Tingkat VII</option>
                            <option value="VIII">Tingkat VIII</option>
                            <option value="IX">Tingkat IX</option>
                        </select>
                    </div>
                    <div class="flex flex-wrap gap-2 no-print">
                        <button onclick="addSubjectModal()" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-plus text-base"></i> Tambah Mapel
                        </button>
                        <button onclick="exportSubjectsExcel()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-file-xls text-base"></i> Export Excel
                        </button>
                        <button onclick="document.getElementById('import-excel-file').click()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-file-arrow-up text-base"></i> Import Excel
                        </button>
                        <input type="file" id="import-excel-file" accept=".xlsx, .xls" class="hidden" onchange="importSubjectsExcel(event)">
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th class="px-6 py-3 w-12 text-center">No</th>
                                <th class="px-6 py-3 w-40">Kode Mapel</th>
                                <th class="px-6 py-3">Nama Mata Pelajaran</th>
                                <th class="px-6 py-3 w-44">Kelompok</th>
                                <th class="px-6 py-3 w-28 text-center">Tingkat</th>
                                <th class="px-6 py-3 w-28 text-center">Alokasi JP</th>
                                <th class="px-6 py-3 w-28 no-print text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="subjects-table-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    window.filterSubjects = function() {
        const search = document.getElementById('search-subject').value.toLowerCase();
        const kelompok = document.getElementById('filter-kelompok').value;
        const tingkat = document.getElementById('filter-tingkat').value;

        const filtered = subjects.filter(s => {
            const matchSearch = s.nama.toLowerCase().includes(search) || (s.kode && s.kode.toLowerCase().includes(search));
            const matchKelompok = !kelompok || s.kelompok === kelompok;
            const matchTingkat = !tingkat || s.tingkat === tingkat;
            return matchSearch && matchKelompok && matchTingkat;
        });
        renderSubjectsTable(filtered);
    };

    window.addSubjectModal = function() {
        const formBody = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Kode Mapel</label>
                        <input type="text" id="sub-kode" placeholder="Contoh: MAT-7" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Mapel</label>
                        <input type="text" id="sub-nama" placeholder="Contoh: Matematika" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Kelompok</label>
                        <select id="sub-kelompok" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="A">Kelompok A (Wajib)</option>
                            <option value="B">Kelompok B (Mulok)</option>
                            <option value="C">Kelompok C (Keagamaan)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tingkat</label>
                        <select id="sub-tingkat" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="VII">VII</option>
                            <option value="VIII">VIII</option>
                            <option value="IX">IX</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Alokasi Jam (JP)</label>
                        <input type="number" id="sub-alokasi" min="1" max="10" value="2" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                </div>
            </div>
        `;
        openModal("Tambah Mata Pelajaran Baru", formBody, "Tambah", async () => {
            const newS = {
                id: 'mapel_' + Date.now(),
                kode: document.getElementById('sub-kode').value.trim().toUpperCase(),
                nama: document.getElementById('sub-nama').value.trim(),
                kelompok: document.getElementById('sub-kelompok').value,
                tingkat: document.getElementById('sub-tingkat').value,
                alokasiJam: parseInt(document.getElementById('sub-alokasi').value, 10) || 2,
                status: 'aktif'
            };
            subjects.push(newS);
            await dbService.saveData('subjects', subjects);
            closeModal();
            filterSubjects();
            showToast("Mata pelajaran baru berhasil ditambahkan!");
        });
    };

    window.editSubjectModal = function(id) {
        const s = subjects.find(item => item.id === id);
        if (!s) return;
        const formBody = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Kode Mapel</label>
                        <input type="text" id="sub-kode" value="${s.kode || ''}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Mapel</label>
                        <input type="text" id="sub-nama" value="${s.nama || ''}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Kelompok</label>
                        <select id="sub-kelompok" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="A" ${s.kelompok === 'A' ? 'selected' : ''}>Kelompok A (Wajib)</option>
                            <option value="B" ${s.kelompok === 'B' ? 'selected' : ''}>Kelompok B (Mulok)</option>
                            <option value="C" ${s.kelompok === 'C' ? 'selected' : ''}>Kelompok C (Keagamaan)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tingkat</label>
                        <select id="sub-tingkat" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="VII" ${s.tingkat === 'VII' ? 'selected' : ''}>VII</option>
                            <option value="VIII" ${s.tingkat === 'VIII' ? 'selected' : ''}>VIII</option>
                            <option value="IX" ${s.tingkat === 'IX' ? 'selected' : ''}>IX</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Alokasi Jam (JP)</label>
                        <input type="number" id="sub-alokasi" min="1" max="10" value="${s.alokasiJam || 2}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                </div>
            </div>
        `;
        openModal("Ubah Mata Pelajaran", formBody, "Perbarui", async () => {
            const index = subjects.findIndex(item => item.id === id);
            if (index !== -1) {
                subjects[index] = {
                    ...subjects[index],
                    kode: document.getElementById('sub-kode').value.trim().toUpperCase(),
                    nama: document.getElementById('sub-nama').value.trim(),
                    kelompok: document.getElementById('sub-kelompok').value,
                    tingkat: document.getElementById('sub-tingkat').value,
                    alokasiJam: parseInt(document.getElementById('sub-alokasi').value, 10) || 2
                };
                await dbService.saveData('subjects', subjects);
            }
            closeModal();
            filterSubjects();
            showToast("Mata pelajaran berhasil diperbarui!");
        });
    };

    window.deleteSubject = function(id) {
        const s = subjects.find(item => item.id === id);
        showConfirmDialog("Hapus Mata Pelajaran", `Hapus mapel <strong>${s ? s.nama : 'ini'}</strong>?`, () => {
            const index = subjects.findIndex(item => item.id === id);
            if (index !== -1) {
                subjects.splice(index, 1);
                dbService.softDeleteItem('subjects', id).then(() => {
                    filterSubjects();
                    showToast("Mata pelajaran telah dihapus.");
                });
            }
        });
    };

    // Excel Export
    window.exportSubjectsExcel = async function() {
        try {
            const xlsx = await loadXlsx();
            const exportData = subjects.map((s, i) => ({
                "No": i + 1,
                "Kode Mapel": s.kode || "",
                "Nama Mata Pelajaran": s.nama,
                "Kelompok": s.kelompok === "A" ? "Wajib" : s.kelompok === "B" ? "Mulok" : "Keagamaan",
                "Tingkat": s.tingkat || "",
                "Alokasi Jam (JP)": s.alokasiJam || 2
            }));

            const worksheet = xlsx.utils.json_to_sheet(exportData);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Daftar Mapel");
            xlsx.writeFile(workbook, "Data_Mapel_MTs_Idrisiyyah.xlsx");
            showToast("Export Excel berhasil!");
        } catch (err) {
            console.error(err);
            showToast("Gagal melakukan export Excel.", "error");
        }
    };

    // Excel Import
    window.importSubjectsExcel = async function(event) {
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
                    const nama = row["Nama Mata Pelajaran"] || row["Nama Mapel"] || row["Nama"] || row["nama"];
                    const kode = row["Kode Mapel"] || row["Kode"] || row["kode"] || "";
                    if (nama && kode) {
                        const rawKelompok = String(row["Kelompok"] || "A").toUpperCase();
                        let kelompok = 'A';
                        if (rawKelompok.includes('MULOK') || rawKelompok.includes('B') || rawKelompok.includes('MUATAN')) kelompok = 'B';
                        else if (rawKelompok.includes('C') || rawKelompok.includes('AGAMA') || rawKelompok.includes('KEAGAMAAN')) kelompok = 'C';

                        subjects.push({
                            id: 'mapel_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                            kode: String(kode).trim().toUpperCase(),
                            nama: String(nama).trim(),
                            kelompok: kelompok,
                            tingkat: String(row["Tingkat"] || "VII").trim().toUpperCase(),
                            alokasiJam: parseInt(row["Alokasi Jam (JP)"] || row["JP"] || row["alokasi"] || 2, 10) || 2,
                            status: 'aktif'
                        });
                        importedCount++;
                    }
                });

                if (importedCount > 0) {
                    await dbService.saveData('subjects', subjects);
                    filterSubjects();
                    showToast(`Berhasil mengimpor ${importedCount} data mata pelajaran!`);
                } else {
                    showToast("Tidak ada data mata pelajaran yang valid untuk diimpor.", "error");
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error(err);
            showToast("Gagal membaca file Excel.", "error");
        }
        event.target.value = '';
    };

    renderSubjectsTable();
}
