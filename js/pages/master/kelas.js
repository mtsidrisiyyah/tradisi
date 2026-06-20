// ============================================
// TRADISI — Data Kelas Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, openModal, closeModal, showConfirmDialog } = ctx;
    const classrooms = await dbService.getData('classrooms') || [];

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

    window.renderClassroomsTable = function(list = classrooms) {
        const tbody = document.getElementById('classrooms-table-body');
        if (!tbody) return;
        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-xs text-slate-500">Tidak ada data kelas ditemukan.</td></tr>`;
            return;
        }
        tbody.innerHTML = list.map((c, idx) => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <td class="px-6 py-3.5 text-xs text-slate-500 text-center">${idx + 1}</td>
                <td class="px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">${c.nama}</td>
                <td class="px-6 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-350">${c.tingkat}</td>
                <td class="px-6 py-3.5 text-xs text-slate-650 dark:text-slate-400 font-semibold">${c.kapasitas || 32} Siswa</td>
                <td class="px-6 py-3.5 text-xs flex gap-2 no-print">
                    <button onclick="editClassroomModal('${c.id}')" class="p-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg transition-colors" title="Ubah"><i class="ph ph-pencil-simple text-base"></i></button>
                    <button onclick="deleteClassroom('${c.id}')" class="p-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors" title="Hapus"><i class="ph ph-trash text-base"></i></button>
                </td>
            </tr>
        `).join('');
    };

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <!-- Header cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${classrooms.length}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Kelas</div>
                </div>
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold text-blue-600">${classrooms.filter(c => c.tingkat === 'VII').length}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tingkat VII</div>
                </div>
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold text-purple-600">${classrooms.filter(c => c.tingkat === 'VIII').length}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tingkat VIII</div>
                </div>
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-center">
                    <div class="text-2xl font-bold text-emerald-600">${classrooms.filter(c => c.tingkat === 'IX').length}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tingkat IX</div>
                </div>
            </div>

            <!-- Table Card -->
            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex flex-col sm:flex-row flex-1 gap-2.5 max-w-xl">
                        <div class="relative flex-1">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><i class="ph ph-magnifying-glass"></i></span>
                            <input type="text" id="search-classroom" oninput="filterClassrooms()" placeholder="Cari kelas berdasarkan nama..." class="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                        </div>
                        <select id="filter-tingkat" onchange="filterClassrooms()" class="px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                            <option value="">Semua Tingkat</option>
                            <option value="VII">Tingkat VII</option>
                            <option value="VIII">Tingkat VIII</option>
                            <option value="IX">Tingkat IX</option>
                        </select>
                    </div>
                    <div class="flex flex-wrap gap-2 no-print">
                        <button onclick="addClassroomModal()" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-plus text-base"></i> Tambah Kelas
                        </button>
                        <button onclick="autoGenerateClassesModal()" class="bg-purple-650 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98" title="Auto-generate kelas VII, VIII, IX">
                            <i class="ph ph-sparkle text-base"></i> Auto-Generate
                        </button>
                        <button onclick="exportClassroomsExcel()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-file-xls text-base"></i> Export Excel
                        </button>
                        <button onclick="document.getElementById('import-excel-file').click()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-file-arrow-up text-base"></i> Import Excel
                        </button>
                        <input type="file" id="import-excel-file" accept=".xlsx, .xls" class="hidden" onchange="importClassroomsExcel(event)">
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th class="px-6 py-3 w-12 text-center">No</th>
                                <th class="px-6 py-3">Nama Kelas / Ruang</th>
                                <th class="px-6 py-3">Tingkat</th>
                                <th class="px-6 py-3">Kapasitas</th>
                                <th class="px-6 py-3 w-28 no-print">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="classrooms-table-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    window.filterClassrooms = function() {
        const search = document.getElementById('search-classroom').value.toLowerCase();
        const tingkat = document.getElementById('filter-tingkat').value;

        const filtered = classrooms.filter(c => {
            const matchSearch = c.nama.toLowerCase().includes(search);
            const matchTingkat = !tingkat || c.tingkat === tingkat;
            return matchSearch && matchTingkat;
        });
        renderClassroomsTable(filtered);
    };

    window.addClassroomModal = function() {
        const formBody = `
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Kelas</label>
                    <input type="text" id="cls-nama" placeholder="Contoh: VII-C" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tingkat</label>
                        <select id="cls-tingkat" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="VII">VII</option>
                            <option value="VIII">VIII</option>
                            <option value="IX">IX</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Kapasitas Siswa</label>
                        <input type="number" id="cls-kapasitas" min="1" max="50" value="32" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                </div>
            </div>
        `;
        openModal("Tambah Kelas Baru", formBody, "Tambah", async () => {
            const nameInput = document.getElementById('cls-nama').value.trim();
            if (classrooms.some(c => c.nama.toUpperCase() === nameInput.toUpperCase())) {
                showToast("Kelas dengan nama tersebut sudah terdaftar!", "error");
                return;
            }
            const newC = {
                id: 'cls_' + Date.now(),
                nama: nameInput.toUpperCase(),
                tingkat: document.getElementById('cls-tingkat').value,
                kapasitas: parseInt(document.getElementById('cls-kapasitas').value, 10) || 32,
                status: 'aktif'
            };
            classrooms.push(newC);
            await dbService.saveData('classrooms', classrooms);
            closeModal();
            filterClassrooms();
            showToast("Kelas baru berhasil ditambahkan!");
        });
    };

    window.editClassroomModal = function(id) {
        const c = classrooms.find(item => item.id === id);
        if (!c) return;
        const formBody = `
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Kelas</label>
                    <input type="text" id="cls-nama" value="${c.nama}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tingkat</label>
                        <select id="cls-tingkat" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="VII" ${c.tingkat === 'VII' ? 'selected' : ''}>VII</option>
                            <option value="VIII" ${c.tingkat === 'VIII' ? 'selected' : ''}>VIII</option>
                            <option value="IX" ${c.tingkat === 'IX' ? 'selected' : ''}>IX</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Kapasitas Siswa</label>
                        <input type="number" id="cls-kapasitas" min="1" max="50" value="${c.kapasitas || 32}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                </div>
            </div>
        `;
        openModal("Ubah Kelas / Ruangan", formBody, "Perbarui", async () => {
            const nameInput = document.getElementById('cls-nama').value.trim().toUpperCase();
            const index = classrooms.findIndex(item => item.id === id);
            if (index !== -1) {
                // Check duplicate if name is changing
                if (classrooms[index].nama !== nameInput && classrooms.some(cls => cls.nama === nameInput)) {
                    showToast("Kelas dengan nama tersebut sudah terdaftar!", "error");
                    return;
                }
                classrooms[index] = {
                    ...classrooms[index],
                    nama: nameInput,
                    tingkat: document.getElementById('cls-tingkat').value,
                    kapasitas: parseInt(document.getElementById('cls-kapasitas').value, 10) || 32
                };
                await dbService.saveData('classrooms', classrooms);
            }
            closeModal();
            filterClassrooms();
            showToast("Data kelas berhasil diperbarui!");
        });
    };

    window.deleteClassroom = function(id) {
        const c = classrooms.find(item => item.id === id);
        showConfirmDialog("Hapus Kelas", `Hapus kelas <strong>${c ? c.nama : 'ini'}</strong>? Semua rombel terkait akan terkena dampak.`, () => {
            const index = classrooms.findIndex(item => item.id === id);
            if (index !== -1) {
                classrooms.splice(index, 1);
                dbService.softDeleteItem('classrooms', id).then(() => {
                    filterClassrooms();
                    showToast("Kelas telah dihapus.");
                });
            }
        });
    };

    // Auto-generate Modal
    window.autoGenerateClassesModal = function() {
        const formBody = `
            <div class="space-y-4">
                <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Pilih tingkat dan masukkan daftar paralel (pisahkan dengan koma):</p>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tingkat</label>
                        <select id="gen-tingkat" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                            <option value="VII">VII</option>
                            <option value="VIII">VIII</option>
                            <option value="IX">IX</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Kapasitas Standar</label>
                        <input type="number" id="gen-kapasitas" min="1" max="50" value="32" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Suffix Paralel</label>
                    <input type="text" id="gen-suffix" value="A, B, C, D" placeholder="Contoh: A, B, C" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">
                    <p class="text-[9px] text-slate-400 mt-1">Kelas akan dibuat dengan format: [Tingkat]-[Suffix] (contoh: VII-A, VII-B, dst.)</p>
                </div>
            </div>
        `;
        openModal("Auto-Generate Kelas Paralel", formBody, "Hasilkan", async () => {
            const tingkat = document.getElementById('gen-tingkat').value;
            const kapasitas = parseInt(document.getElementById('gen-kapasitas').value, 10) || 32;
            const suffixStr = document.getElementById('gen-suffix').value;
            const suffixes = suffixStr.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);

            if (suffixes.length === 0) {
                showToast("Suffix paralel tidak boleh kosong!", "error");
                return;
            }

            let countCreated = 0;
            let countDuplicates = 0;

            suffixes.forEach(suffix => {
                const className = `${tingkat}-${suffix}`;
                // Check duplicates
                if (classrooms.some(c => c.nama === className)) {
                    countDuplicates++;
                } else {
                    classrooms.push({
                        id: 'cls_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                        nama: className,
                        tingkat: tingkat,
                        kapasitas: kapasitas,
                        status: 'aktif'
                    });
                    countCreated++;
                }
            });

            if (countCreated > 0) {
                await dbService.saveData('classrooms', classrooms);
                filterClassrooms();
                showToast(`Berhasil menghasilkan ${countCreated} kelas paralel! ${countDuplicates ? `(${countDuplicates} duplikat dilewati)` : ''}`);
            } else {
                showToast("Semua kelas paralel yang diinput sudah ada.", "warning");
            }
            closeModal();
        });
    };

    // Excel Export
    window.exportClassroomsExcel = async function() {
        try {
            const xlsx = await loadXlsx();
            const exportData = classrooms.map((c, i) => ({
                "No": i + 1,
                "Nama Kelas / Ruang": c.nama,
                "Tingkat": c.tingkat,
                "Kapasitas (Siswa)": c.kapasitas || 32
            }));

            const worksheet = xlsx.utils.json_to_sheet(exportData);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Daftar Kelas");
            xlsx.writeFile(workbook, "Data_Kelas_MTs_Idrisiyyah.xlsx");
            showToast("Export Excel berhasil!");
        } catch (err) {
            console.error(err);
            showToast("Gagal melakukan export Excel.", "error");
        }
    };

    // Excel Import
    window.importClassroomsExcel = async function(event) {
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
                    const nama = row["Nama Kelas / Ruang"] || row["Nama Kelas"] || row["Nama"] || row["nama"];
                    if (nama) {
                        const namaClean = String(nama).trim().toUpperCase();
                        // Prevent duplicates
                        if (!classrooms.some(c => c.nama === namaClean)) {
                            let tingkat = "VII";
                            if (namaClean.startsWith("VIII") || namaClean.startsWith("8")) tingkat = "VIII";
                            else if (namaClean.startsWith("IX") || namaClean.startsWith("9")) tingkat = "IX";

                            classrooms.push({
                                id: 'cls_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                                nama: namaClean,
                                tingkat: tingkat,
                                kapasitas: parseInt(row["Kapasitas (Siswa)"] || row["Kapasitas"] || row["kapasitas"] || 32, 10) || 32,
                                status: 'aktif'
                            });
                            importedCount++;
                        }
                    }
                });

                if (importedCount > 0) {
                    await dbService.saveData('classrooms', classrooms);
                    filterClassrooms();
                    showToast(`Berhasil mengimpor ${importedCount} data kelas!`);
                } else {
                    showToast("Tidak ada data kelas baru yang valid untuk diimpor.", "error");
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error(err);
            showToast("Gagal membaca file Excel.", "error");
        }
        event.target.value = '';
    };

    renderClassroomsTable();
}
