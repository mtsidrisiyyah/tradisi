// ============================================
// TRADISI — Program Asesmen Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, getUserProfile } = ctx;
    const items = await dbService.getData('programAsesmen');
    const userProfile = getUserProfile();

    const renderPA = function(list = items) {
        const c = document.getElementById('items-list');
        if (!list.length) {
            c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-exam text-3xl mb-2"></i><p>Belum ada Program Asesmen.</p></div>`;
            return;
        }
        c.innerHTML = list.map(d => `
            <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-${d.jenis === 'Formatif' ? 'emerald' : 'amber'}-500/10 text-${d.jenis === 'Formatif' ? 'emerald' : 'amber'}-600 flex items-center justify-center"><i class="ph ph-exam text-xl"></i></div>
                    <div>
                        <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${d.mapel} - Kelas ${d.kelas}</p>
                        <p class="text-[10px] text-slate-400">${d.jenis} | ${d.teknik} | ${d.waktu}</p>
                    </div>
                </div>
                <button onclick="window.deleteItem('programAsesmen','${d.id}', window.renderPACallback, window.paItems)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg"><i class="ph ph-trash text-base"></i></button>
            </div>
        `).join('');
    };

    window.renderPACallback = renderPA;
    window.paItems = items;

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-forest-600"></i> Tambah Program Asesmen</h3>
                <form id="item-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Mapel</label>
                            <input type="text" id="f-mapel" value="${userProfile.mapel || ''}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kelas</label>
                            <input type="text" id="f-kelas" placeholder="VII" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Jenis</label>
                            <select id="f-jenis" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                                <option>Formatif</option>
                                <option>Sumatif</option>
                                <option>Diagnostik</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Teknik</label>
                            <input type="text" id="f-teknik" placeholder="Observasi, Tes Tulis..." required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Waktu</label>
                            <input type="text" id="f-waktu" placeholder="Setiap pertemuan" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan</button>
                    </div>
                </form>
            </div>
            
            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-list text-forest-600 mr-1"></i> Daftar Program Asesmen</h3>
                <div class="space-y-3" id="items-list"></div>
            </div>
        </div>
    `;

    document.getElementById('item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        items.push({
            id: 'pa_' + Date.now(),
            mapel: document.getElementById('f-mapel').value,
            kelas: document.getElementById('f-kelas').value,
            jenis: document.getElementById('f-jenis').value,
            teknik: document.getElementById('f-teknik').value,
            waktu: document.getElementById('f-waktu').value
        });
        await dbService.saveData('programAsesmen', items);
        showToast("Program Asesmen disimpan!");
        e.target.reset();
        document.getElementById('f-mapel').value = userProfile.mapel || '';
        renderPA();
    });

    renderPA();
}
