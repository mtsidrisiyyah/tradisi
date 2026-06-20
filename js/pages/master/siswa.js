// ============================================
// TRADISI — Data Siswa Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, openModal, closeModal, showConfirmDialog } = ctx;
    const students = await dbService.getData('siswa');

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

    window.renderStudentsTable = function (filteredList = students) {
        const tbody = document.getElementById('students-table-body');
        if (!tbody) return;
        if (filteredList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-xs text-slate-500 dark:text-slate-400">Tidak ada data siswa ditemukan.</td></tr>`;
            return;
        }
        tbody.innerHTML = filteredList.map((s, idx) => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <td class="px-6 py-3.5 text-xs text-slate-500 text-center">${idx + 1}</td>
                <td class="px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">${s.nisn}</td>
                <td class="px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">${s.nama}</td>
                <td class="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-400">${s.kelas}</td>
                <td class="px-6 py-3.5 text-xs">
                    <span class="px-2 py-0.5 rounded-full font-bold text-[10px] ${s.jk === 'L' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'}">${s.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                </td>
                <td class="px-6 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400">${s.hpOrtu || '-'}</td>
                <td class="px-6 py-3.5 text-xs flex gap-2 no-print">
                    <button onclick="printStudentCard('${s.id}')" class="p-1.5 bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-colors" title="Cetak Kartu Siswa"><i class="ph ph-cardholder text-base"></i></button>
                    <button onclick="editStudentModal('${s.id}')" class="p-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg transition-colors" title="Ubah"><i class="ph ph-pencil-simple text-base"></i></button>
                    <button onclick="deleteStudent('${s.id}')" class="p-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors" title="Hapus"><i class="ph ph-trash text-base"></i></button>
                </td>
            </tr>
        `).join('');
    };

    const totalL = students.filter(s => s.jk === 'L').length;
    const totalP = students.filter(s => s.jk === 'P').length;
    const classCounts = {};
    students.forEach(s => { classCounts[s.kelas] = (classCounts[s.kelas] || 0) + 1; });

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div class="stat-card stat-card-blue bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                    <div class="text-xl font-bold text-slate-800 dark:text-slate-100">${students.length}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase">Total Siswa</div>
                </div>
                <div class="stat-card stat-card-emerald bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                    <div class="text-xl font-bold text-blue-600">${totalL}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase">Laki-laki</div>
                </div>
                <div class="stat-card stat-card-rose bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                    <div class="text-xl font-bold text-pink-600">${totalP}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase">Perempuan</div>
                </div>
                <div class="stat-card stat-card-purple bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                    <div class="text-xl font-bold text-slate-800 dark:text-slate-100">${Object.keys(classCounts).length}</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase">Kelas</div>
                </div>
                <div class="stat-card stat-card-teal bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center col-span-2 md:col-span-1">
                    <div class="text-xl font-bold text-slate-800 dark:text-slate-100">${students.length ? Math.round(totalL/students.length*100) : 0}%</div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase">Rasio L</div>
                </div>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div class="flex flex-col sm:flex-row flex-1 gap-2.5 max-w-xl">
                        <div class="relative flex-1">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><i class="ph ph-magnifying-glass"></i></span>
                            <input type="text" id="search-student" oninput="filterStudents()" placeholder="Cari nama/NIS/NISN..." class="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                        </div>
                        <select id="filter-class" onchange="filterStudents()" class="px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                            <option value="">Semua Kelas</option>
                            <option value="VII-A">VII-A</option><option value="VII-B">VII-B</option>
                            <option value="VIII-A">VIII-A</option><option value="VIII-B">VIII-B</option>
                            <option value="IX-A">IX-A</option><option value="IX-B">IX-B</option>
                        </select>
                        <select id="filter-jk" onchange="filterStudents()" class="px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                            <option value="">Semua Jenis Kelamin</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                    </div>
                    <div class="flex flex-wrap gap-2 no-print">
                        <button onclick="addStudentModal()" class="btn bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-plus text-base"></i> Tambah Siswa
                        </button>
                        <button onclick="exportStudentsExcel()" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-file-xls text-base"></i> Export Excel
                        </button>
                        <button onclick="document.getElementById('import-excel-file').click()" class="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-file-arrow-up text-base"></i> Import Excel
                        </button>
                        <input type="file" id="import-excel-file" accept=".xlsx, .xls" class="hidden" onchange="importStudentsExcel(event)">
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th class="px-6 py-3 w-12 text-center">No</th>
                                <th class="px-6 py-3 w-28">NISN</th>
                                <th class="px-6 py-3">Nama Lengkap</th>
                                <th class="px-6 py-3 w-20">Kelas</th>
                                <th class="px-6 py-3 w-28">Jenis Kelamin</th>
                                <th class="px-6 py-3 w-32">HP Ortu</th>
                                <th class="px-6 py-3 w-36 no-print">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="students-table-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    window.filterStudents = function () {
        const search = document.getElementById('search-student').value.toLowerCase();
        const kelas = document.getElementById('filter-class').value;
        const jk = document.getElementById('filter-jk').value;
        
        const filtered = students.filter(s => {
            const matchSearch = s.nama.toLowerCase().includes(search) || 
                                (s.nisn && s.nisn.includes(search)) || 
                                (s.nis && s.nis.includes(search));
            const matchClass = !kelas || s.kelas === kelas;
            const matchJk = !jk || s.jk === jk;
            return matchSearch && matchClass && matchJk;
        });
        renderStudentsTable(filtered);
    };

    const kelasOptions = `<option value="VII-A">VII-A</option><option value="VII-B">VII-B</option><option value="VIII-A">VIII-A</option><option value="VIII-B">VIII-B</option><option value="IX-A">IX-A</option><option value="IX-B">IX-B</option>`;

    window.addStudentModal = function () {
        const formBody = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">NIS</label><input type="text" id="stud-nis" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">NISN</label><input type="text" id="stud-nisn" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                </div>
                <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Lengkap</label><input type="text" id="stud-nama" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Kelas</label><select id="stud-kelas" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">${kelasOptions}</select></div>
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Jenis Kelamin</label><select id="stud-jk" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
                </div>
                <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Alamat Lengkap</label><textarea id="stud-alamat" rows="2" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></textarea></div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Ayah</label><input type="text" id="stud-ayah" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Ibu</label><input type="text" id="stud-ibu" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                </div>
                <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">No HP Orang Tua</label><input type="text" id="stud-hportu" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
            </div>`;
        openModal("Tambah Siswa Baru", formBody, "Tambah", async () => {
            students.push({
                id: 'stud_' + Date.now(),
                nis: document.getElementById('stud-nis').value.trim(),
                nisn: document.getElementById('stud-nisn').value.trim(),
                nama: document.getElementById('stud-nama').value.trim(),
                kelas: document.getElementById('stud-kelas').value,
                jk: document.getElementById('stud-jk').value,
                alamat: document.getElementById('stud-alamat').value.trim(),
                namaAyah: document.getElementById('stud-ayah').value.trim(),
                namaIbu: document.getElementById('stud-ibu').value.trim(),
                hpOrtu: document.getElementById('stud-hportu').value.trim(),
                status: 'aktif'
            });
            await dbService.saveData('siswa', students);
            closeModal(); 
            filterStudents(); 
            showToast("Siswa baru berhasil ditambahkan!");
        });
    };

    window.editStudentModal = function (id) {
        const s = students.find(item => item.id === id);
        if (!s) return;
        const formBody = `
            <div class="space-y-4">
                <input type="hidden" id="stud-id" value="${s.id}">
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">NIS</label><input type="text" id="stud-nis" value="${s.nis || ''}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">NISN</label><input type="text" id="stud-nisn" value="${s.nisn || ''}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                </div>
                <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Lengkap</label><input type="text" id="stud-nama" value="${s.nama}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Kelas</label><select id="stud-kelas" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"><option value="VII-A" ${s.kelas==='VII-A'?'selected':''}>VII-A</option><option value="VII-B" ${s.kelas==='VII-B'?'selected':''}>VII-B</option><option value="VIII-A" ${s.kelas==='VIII-A'?'selected':''}>VIII-A</option><option value="VIII-B" ${s.kelas==='VIII-B'?'selected':''}>VIII-B</option><option value="IX-A" ${s.kelas==='IX-A'?'selected':''}>IX-A</option><option value="IX-B" ${s.kelas==='IX-B'?'selected':''}>IX-B</option></select></div>
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Jenis Kelamin</label><select id="stud-jk" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"><option value="L" ${s.jk==='L'?'selected':''}>Laki-laki</option><option value="P" ${s.jk==='P'?'selected':''}>Perempuan</option></select></div>
                </div>
                <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Alamat Lengkap</label><textarea id="stud-alamat" rows="2" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none">${s.alamat || ''}</textarea></div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Ayah</label><input type="text" id="stud-ayah" value="${s.namaAyah || ''}" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                    <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nama Ibu</label><input type="text" id="stud-ibu" value="${s.namaIbu || ''}" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
                </div>
                <div><label class="block text-xs font-semibold text-slate-500 mb-1 uppercase">No HP Orang Tua</label><input type="text" id="stud-hportu" value="${s.hpOrtu || ''}" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-forest-500 outline-none"></div>
            </div>`;
        openModal("Ubah Data Siswa", formBody, "Perbarui", async () => {
            const index = students.findIndex(item => item.id === id);
            if (index !== -1) {
                students[index] = { 
                    ...students[index], 
                    nis: document.getElementById('stud-nis').value.trim(),
                    nisn: document.getElementById('stud-nisn').value.trim(), 
                    nama: document.getElementById('stud-nama').value.trim(), 
                    kelas: document.getElementById('stud-kelas').value, 
                    jk: document.getElementById('stud-jk').value,
                    alamat: document.getElementById('stud-alamat').value.trim(),
                    namaAyah: document.getElementById('stud-ayah').value.trim(),
                    namaIbu: document.getElementById('stud-ibu').value.trim(),
                    hpOrtu: document.getElementById('stud-hportu').value.trim()
                };
                await dbService.saveData('siswa', students);
            }
            closeModal(); 
            filterStudents(); 
            showToast("Data siswa berhasil diperbarui!");
        });
    };

    window.deleteStudent = function (id) {
        const s = students.find(item => item.id === id);
        showConfirmDialog("Hapus Siswa", `Hapus data <strong>${s ? s.nama : 'siswa ini'}</strong>?`, () => {
            const index = students.findIndex(item => item.id === id);
            if (index !== -1) {
                students.splice(index, 1);
                dbService.softDeleteItem('siswa', id).then(() => { 
                    filterStudents(); 
                    showToast("Siswa telah dihapus."); 
                });
            }
        });
    };

    // Print Student Card Modal (Cetak Kartu Siswa)
    window.printStudentCard = function(id) {
        const s = students.find(item => item.id === id);
        if (!s) return;

        const printBody = `
            <div class="p-4 flex flex-col items-center">
                <div id="student-card-printable" class="w-[85mm] h-[55mm] bg-gradient-to-br from-forest-800 to-forest-950 text-white rounded-2xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden border border-forest-700">
                    <!-- Background shapes -->
                    <div class="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/5"></div>
                    <div class="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-sand-500/5"></div>
                    
                    <!-- Header -->
                    <div class="flex items-center gap-2 border-b border-white/20 pb-1.5">
                        <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" alt="Logo" class="w-7 h-7 object-contain">
                        <div class="text-left">
                            <h4 class="text-[9px] font-bold tracking-wide uppercase leading-tight">KARTU TANDA PELAJAR</h4>
                            <p class="text-[6px] text-forest-200 tracking-wider leading-none">MTS IDRISIYYAH TASIKMALAYA</p>
                        </div>
                    </div>
                    
                    <!-- Main Body -->
                    <div class="flex gap-3 items-center my-auto">
                        <!-- Photo placeholder -->
                        <div class="w-14 h-18 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center flex-shrink-0 text-center">
                            <i class="ph ph-user text-2xl text-forest-300"></i>
                        </div>
                        
                        <!-- Details -->
                        <div class="text-left space-y-0.5 min-w-0">
                            <h3 class="text-[10px] font-extrabold truncate uppercase">${s.nama}</h3>
                            <p class="text-[7px] text-forest-200">NIS / NISN: <span class="font-semibold text-white">${s.nis || '-'} / ${s.nisn}</span></p>
                            <p class="text-[7px] text-forest-200">Kelas: <span class="font-semibold text-white">${s.kelas}</span></p>
                            <p class="text-[7px] text-forest-200">Alamat: <span class="font-semibold text-white truncate block max-w-[150px]">${s.alamat || '-'}</span></p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="flex justify-between items-end border-t border-white/10 pt-1">
                        <p class="text-[5px] text-forest-300">Berlaku Selama Menjadi Siswa aktif</p>
                        <p class="text-[5px] text-sand-400 font-bold uppercase tracking-wider">MTS IDRISIYYAH</p>
                    </div>
                </div>
                
                <div class="mt-4 text-center">
                    <button onclick="printCardElement()" class="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"><i class="ph ph-printer"></i> Cetak Kartu</button>
                </div>
            </div>
            
            <script>
                window.printCardElement = function() {
                    const printable = document.getElementById('student-card-printable');
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write('<html><head><title>Cetak Kartu Pelajar</title>');
                    printWindow.document.write('<script src="https://cdn.tailwindcss.com"></s' + 'cript>');
                    printWindow.document.write('<style>body{display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#fff;}</style>');
                    printWindow.document.write('</head><body>');
                    printWindow.document.write(printable.outerHTML);
                    printWindow.document.write('</body></html>');
                    printWindow.document.close();
                    setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                    }, 500);
                }
            </script>
        `;
        
        openModal("Kartu Pelajar Siswa", printBody, "Tutup", () => {
            closeModal();
        });
    };

    // Excel Export
    window.exportStudentsExcel = async function() {
        try {
            const xlsx = await loadXlsx();
            const exportData = students.map((s, i) => ({
                "No": i + 1,
                "NIS": s.nis || "",
                "NISN": s.nisn || "",
                "Nama Lengkap": s.nama,
                "Kelas": s.kelas,
                "Jenis Kelamin": s.jk === "L" ? "Laki-laki" : "Perempuan",
                "Alamat": s.alamat || "",
                "Nama Ayah": s.namaAyah || "",
                "Nama Ibu": s.namaIbu || "",
                "No HP Ortu": s.hpOrtu || ""
            }));

            const worksheet = xlsx.utils.json_to_sheet(exportData);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Daftar Siswa");
            xlsx.writeFile(workbook, "Data_Siswa_MTs_Idrisiyyah.xlsx");
            showToast("Export Excel berhasil!");
        } catch (err) {
            console.error(err);
            showToast("Gagal melakukan export Excel.", "error");
        }
    };

    // Excel Import
    window.importStudentsExcel = async function(event) {
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
                    const nama = row["Nama Lengkap"] || row["Nama"] || row["nama"];
                    const nisn = row["NISN"] || row["nisn"] || "";
                    if (nama && nisn) {
                        students.push({
                            id: 'stud_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                            nis: String(row["NIS"] || row["nis"] || "").trim(),
                            nisn: String(nisn).trim(),
                            nama: String(nama).trim(),
                            kelas: String(row["Kelas"] || row["kelas"] || "VII-A").trim().toUpperCase(),
                            jk: String(row["Jenis Kelamin"] || row["JK"] || "L").charAt(0).toUpperCase() === 'P' ? 'P' : 'L',
                            alamat: String(row["Alamat"] || row["alamat"] || "").trim(),
                            namaAyah: String(row["Nama Ayah"] || row["Ayah"] || "").trim(),
                            namaIbu: String(row["Nama Ibu"] || row["Ibu"] || "").trim(),
                            hpOrtu: String(row["No HP Ortu"] || row["HP Ortu"] || "").trim(),
                            status: 'aktif'
                        });
                        importedCount++;
                    }
                });

                if (importedCount > 0) {
                    await dbService.saveData('siswa', students);
                    filterStudents();
                    showToast(`Berhasil mengimpor ${importedCount} data siswa!`);
                } else {
                    showToast("Tidak ada data siswa yang valid untuk diimpor.", "error");
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error(err);
            showToast("Gagal membaca file Excel.", "error");
        }
        event.target.value = '';
    };

    renderStudentsTable();
}
