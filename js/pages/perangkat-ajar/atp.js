// ============================================
// TRADISI — Alur Tujuan Pembelajaran (ATP) Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, getUserProfile } = ctx;
    const items = await dbService.getData('atp');
    const userProfile = getUserProfile();

    const renderAtp = function(list = items) {
        const c = document.getElementById('items-list');
        if (!list.length) {
            c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-path text-3xl mb-2"></i><p>Belum ada ATP.</p></div>`;
            return;
        }
        const sorted = [...list].sort((a,b) => a.urutan - b.urutan);
        c.innerHTML = sorted.map((d, i) => `
            <div class="flex gap-3 border-l-2 border-emerald-500 pl-4 py-3">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="bg-emerald-100 dark:bg-emerald-950 text-forest-700 font-bold text-[10px] px-2 py-0.5 rounded-full">#${d.urutan}</span>
                        <span class="bg-blue-100 dark:bg-blue-950 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-full">Fase ${d.fase}</span>
                    </div>
                    <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${d.tp}</p>
                    <p class="text-[10px] text-slate-400 mt-0.5">CP: ${d.cp}</p>
                </div>
                <button onclick="window.deleteItem('atp','${d.id}', window.renderAtpCallback, window.atpItems)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg h-fit"><i class="ph ph-trash text-base"></i></button>
            </div>
        `).join('');
    };

    window.renderAtpCallback = renderAtp;
    window.atpItems = items;

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-forest-600"></i> Tambah Alur Tujuan Pembelajaran</h3>
                <form id="item-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Fase</label>
                            <select id="f-fase" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                                <option value="D">D (Kelas VII-IX)</option>
                                <option value="E">E (Kelas X-XII)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Mapel</label>
                            <input type="text" id="f-mapel" value="${userProfile.mapel || ''}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Urutan</label>
                            <input type="number" id="f-urutan" value="${items.length + 1}" min="1" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Capaian Pembelajaran (CP)</label>
                        <textarea id="f-cp" rows="2" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500" placeholder="Capaian Pembelajaran dari kurikulum..."></textarea>
                    </div>
                    <div>
                        <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Tujuan Pembelajaran (TP)</label>
                        <textarea id="f-tp" rows="2" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500" placeholder="Tujuan Pembelajaran yang diturunkan dari CP..."></textarea>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan</button>
                    </div>
                </form>
            </div>
            
            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-path text-forest-600 mr-1"></i> Alur Pembelajaran</h3>
                <div class="space-y-3" id="items-list"></div>
            </div>
        </div>
    `;

    document.getElementById('item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        items.push({
            id: 'atp_' + Date.now(),
            fase: document.getElementById('f-fase').value,
            mapel: document.getElementById('f-mapel').value,
            cp: document.getElementById('f-cp').value,
            tp: document.getElementById('f-tp').value,
            urutan: parseInt(document.getElementById('f-urutan').value)
        });
        await dbService.saveData('atp', items);
        showToast("ATP disimpan!");
        e.target.reset();
        document.getElementById('f-mapel').value = userProfile.mapel || '';
        document.getElementById('f-urutan').value = items.length + 1;
        renderAtp();
    });

    renderAtp();
}
