// ============================================
// TRADISI — Program Tahunan Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, getUserProfile } = ctx;
    const items = await dbService.getData('prota');
    const userProfile = getUserProfile();

    const schoolSettings = await dbService.getData('madrasah_settings') || {
        nama: "MTs Idrisiyyah Tasikmalaya",
        tahunAjaran: "2026/2027",
        semester: "Ganjil"
    };

    const renderProta = function(list = items) {
        const c = document.getElementById('items-list');
        if (!list.length) { 
            c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-file-text text-3xl mb-2"></i><p>Belum ada Program Tahunan.</p></div>`; 
            return; 
        }
        c.innerHTML = list.map((d, i) => `
            <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-forest-600/10 text-forest-700 flex items-center justify-center"><i class="ph ph-file-text text-xl"></i></div>
                    <div>
                        <p class="text-xs font-bold text-slate-800 dark:text-slate-200">PROTA ${d.mapel} - Kelas ${d.kelas}</p>
                        <p class="text-[10px] text-slate-400">TA ${d.tahunAjaran} | Smt1: ${d.semester1} | Smt2: ${d.semester2}</p>
                    </div>
                </div>
                <button onclick="window.deleteItem('prota','${d.id}', window.renderProtaCallback, window.protaItems)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"><i class="ph ph-trash text-base"></i></button>
            </div>
        `).join('');
    };

    // Expose helpers globally or locally
    window.renderProtaCallback = renderProta;
    window.protaItems = items;

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-forest-600"></i> Tambah Program Tahunan</h3>
                <form id="item-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Mata Pelajaran</label>
                            <input type="text" id="f-mapel" value="${userProfile.mapel || ''}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kelas</label>
                            <input type="text" id="f-kelas" placeholder="VII / VIII / IX" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Alokasi Smt 1</label>
                            <input type="text" id="f-smt1" placeholder="54 JP" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Alokasi Smt 2</label>
                            <input type="text" id="f-smt2" placeholder="54 JP" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Keterangan</label>
                        <input type="text" id="f-ket" placeholder="Fase D - ..." class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan</button>
                    </div>
                </form>
            </div>
            
            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-list text-forest-600 mr-1"></i> Daftar PROTA</h3>
                <div class="space-y-3" id="items-list"></div>
            </div>
        </div>
    `;

    document.getElementById('item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        items.push({
            id: 'pr_' + Date.now(),
            mapel: document.getElementById('f-mapel').value,
            kelas: document.getElementById('f-kelas').value,
            tahunAjaran: schoolSettings.tahunAjaran,
            semester1: document.getElementById('f-smt1').value,
            semester2: document.getElementById('f-smt2').value,
            keterangan: document.getElementById('f-ket').value
        });
        await dbService.saveData('prota', items);
        showToast("PROTA disimpan!");
        e.target.reset();
        document.getElementById('f-mapel').value = userProfile.mapel || '';
        renderProta();
    });

    renderProta();
}
