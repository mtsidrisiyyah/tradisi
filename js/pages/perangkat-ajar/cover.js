// ============================================
// TRADISI — Cover Administrasi Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, getUserProfile } = ctx;
    const userProfile = getUserProfile();

    const schoolSettings = await dbService.getData('madrasah_settings') || {
        nama: "MTs Idrisiyyah Tasikmalaya",
        tahunAjaran: "2026/2027",
        semester: "Ganjil"
    };

    contentArea.innerHTML = `
        <div class="fade-in grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <!-- Left: Form inputs -->
            <div class="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800 space-y-4 no-print">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <i class="ph ph-note text-forest-600 text-base"></i> Buat Cover Perangkat Pembelajaran
                </h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Judul Dokumen Utama</label>
                        <input type="text" id="cov-title" value="BUKU KERJA GURU I" class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Sub Judul Dokumen</label>
                        <input type="text" id="cov-subtitle" value="Rencana Pelaksanaan Pembelajaran (RPP)" class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Mata Pelajaran</label>
                            <input type="text" id="cov-mapel" value="${userProfile.mapel || ''}" class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Kelas / Semester</label>
                            <input type="text" id="cov-kelas" value="Kelas VII / Ganjil" class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Nama Pendidik (Guru)</label>
                            <input type="text" id="cov-guru" value="${userProfile.nama || ''}" class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">NIP / NUPTK</label>
                            <input type="text" id="cov-nip" value="${userProfile.nip || ''}" class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                        </div>
                    </div>
                </div>

                <div class="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button id="btn-print-cover" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-98">
                        <i class="ph ph-printer text-base"></i> Cetak Cover A4
                    </button>
                </div>
            </div>

            <!-- Right: Live A4 Preview Sheet -->
            <div class="bg-white text-slate-900 p-8 md:p-12 border border-slate-300 shadow-lg rounded-xl max-w-[210mm] w-full min-h-[297mm] mx-auto flex flex-col justify-between items-center text-center printable-area print-card-border" id="cover-preview-sheet">
                <div class="w-full border-[3px] border-slate-900 p-6 flex flex-col justify-between items-center min-h-[260mm]">
                    <!-- Header -->
                    <div class="space-y-2 mt-4">
                        <h2 class="text-xl md:text-2xl font-extrabold tracking-wide text-slate-900" id="p-cov-main-title">BUKU KERJA GURU I</h2>
                        <h3 class="text-sm md:text-base font-bold text-slate-800" id="p-cov-subtitle">Rencana Pelaksanaan Pembelajaran (RPP)</h3>
                        <div class="w-24 h-1 bg-slate-900 mx-auto mt-2"></div>
                    </div>

                    <!-- Logo -->
                    <div class="my-10 flex flex-col items-center">
                        <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" alt="Logo MTs Idrisiyyah" class="w-28 h-28 object-contain">
                        <span class="text-[9px] font-bold text-slate-600 tracking-wider uppercase mt-3">Madrasah Terakreditasi A</span>
                    </div>

                    <!-- Detail Grid -->
                    <div class="w-full max-w-sm space-y-4 text-left border-y-2 border-slate-900 py-6 my-4">
                        <div class="grid grid-cols-3 text-xs">
                            <span class="font-bold">MATA PELAJARAN</span>
                            <span class="text-center font-bold w-6">:</span>
                            <span class="font-semibold col-span-1" id="p-cov-mapel">Informatika</span>
                        </div>
                        <div class="grid grid-cols-3 text-xs">
                            <span class="font-bold">SATUAN PENDIDIKAN</span>
                            <span class="text-center font-bold w-6">:</span>
                            <span class="font-semibold col-span-1" id="p-cov-school">${schoolSettings.nama}</span>
                        </div>
                        <div class="grid grid-cols-3 text-xs">
                            <span class="font-bold">KELAS / SEMESTER</span>
                            <span class="text-center font-bold w-6">:</span>
                            <span class="font-semibold col-span-1" id="p-cov-kelas">Kelas VII / Ganjil</span>
                        </div>
                        <div class="grid grid-cols-3 text-xs">
                            <span class="font-bold">TAHUN PELAJARAN</span>
                            <span class="text-center font-bold w-6">:</span>
                            <span class="font-semibold col-span-1" id="p-cov-year">${schoolSettings.tahunAjaran}</span>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="space-y-4 mb-4">
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase font-bold text-slate-400">Pendidik:</p>
                            <h3 class="text-sm font-extrabold text-slate-900" id="p-cov-guru">Ir. Hermawan, M.Pd.</h3>
                            <p class="text-xs text-slate-600" id="p-cov-nip">NIP. 197508212005011002</p>
                        </div>
                        <div class="pt-4 text-xs font-bold text-slate-800">
                            YAYASAN IDRISIYYAH TASIKMALAYA<br>
                            KOTA TASIKMALAYA - JAWA BARAT
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const updateCoverPreview = function () {
        document.getElementById('p-cov-main-title').innerText = document.getElementById('cov-title').value.toUpperCase();
        document.getElementById('p-cov-subtitle').innerText = document.getElementById('cov-subtitle').value;
        document.getElementById('p-cov-mapel').innerText = document.getElementById('cov-mapel').value;
        document.getElementById('p-cov-kelas').innerText = document.getElementById('cov-kelas').value;
        document.getElementById('p-cov-guru').innerText = document.getElementById('cov-guru').value;
        document.getElementById('p-cov-nip').innerText = "NIP. " + document.getElementById('cov-nip').value;
    };

    // Attach listeners
    document.getElementById('cov-title').addEventListener('input', updateCoverPreview);
    document.getElementById('cov-subtitle').addEventListener('input', updateCoverPreview);
    document.getElementById('cov-mapel').addEventListener('input', updateCoverPreview);
    document.getElementById('cov-kelas').addEventListener('input', updateCoverPreview);
    document.getElementById('cov-guru').addEventListener('input', updateCoverPreview);
    document.getElementById('cov-nip').addEventListener('input', updateCoverPreview);
    document.getElementById('btn-print-cover').addEventListener('click', () => window.print());

    updateCoverPreview();
}
