// ============================================
// TRADISI — Kisi-Kisi Soal Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, getUserProfile } = ctx;
    const items = await dbService.getData('kisiSoal');
    const userProfile = getUserProfile();

    const renderKS = function(list = items) {
        const c = document.getElementById('items-list');
        if (!list.length) {
            c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-table text-3xl mb-2"></i><p>Belum ada kisi-kisi.</p></div>`;
            return;
        }
        c.innerHTML = `
            <table class="w-full text-left">
                <thead>
                    <tr class="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                        <th class="px-3 py-2">No</th>
                        <th class="px-3 py-2">KD/TP</th>
                        <th class="px-3 py-2">Indikator</th>
                        <th class="px-3 py-2">Level</th>
                        <th class="px-3 py-2">Bentuk</th>
                        <th class="px-3 py-2 w-12 no-print"></th>
                    </tr>
                </thead>
                <tbody>
                    ${list.map((d, i) => `
                        <tr class="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50/50">
                            <td class="px-3 py-3 text-xs text-slate-500">${i+1}</td>
                            <td class="px-3 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">${d.kd}</td>
                            <td class="px-3 py-3 text-xs text-slate-600 dark:text-slate-400">${d.indikator}</td>
                            <td class="px-3 py-3 text-xs">
                                <span class="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 rounded-full text-[9px] font-bold">${d.level}</span>
                            </td>
                            <td class="px-3 py-3 text-xs">${d.bentuk}</td>
                            <td class="px-3 py-3 no-print">
                                <button onclick="window.deleteItem('kisiSoal','${d.id}', window.renderKSCallback, window.kisiItems)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg"><i class="ph ph-trash text-sm"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    };

    window.renderKSCallback = renderKS;
    window.kisiItems = items;

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-forest-600"></i> Tambah Kisi-Kisi Soal</h3>
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
                        <div class="md:col-span-3">
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">KD / Tujuan Pembelajaran</label>
                            <input type="text" id="f-kd" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Indikator Soal</label>
                            <input type="text" id="f-indikator" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Level Kognitif</label>
                            <select id="f-level" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                                <option>C1 (Mengingat)</option>
                                <option>C2 (Memahami)</option>
                                <option>C3 (Menerapkan)</option>
                                <option>C4 (Menganalisis)</option>
                                <option>C5 (Mengevaluasi)</option>
                                <option>C6 (Mencipta)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Bentuk Soal</label>
                            <select id="f-bentuk" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                                <option>PG</option>
                                <option>Esai</option>
                                <option>Uraian</option>
                                <option>Praktik</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan</button>
                    </div>
                </form>
            </div>
            
            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-table text-forest-600 mr-1"></i> Tabel Kisi-Kisi</h3>
                <div id="items-list"></div>
            </div>
        </div>
    `;

    document.getElementById('item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        items.push({
            id: 'ks_' + Date.now(),
            mapel: document.getElementById('f-mapel').value,
            kelas: document.getElementById('f-kelas').value,
            kd: document.getElementById('f-kd').value,
            indikator: document.getElementById('f-indikator').value,
            level: document.getElementById('f-level').value,
            bentuk: document.getElementById('f-bentuk').value
        });
        await dbService.saveData('kisiSoal', items);
        showToast("Kisi-kisi disimpan!");
        e.target.reset();
        document.getElementById('f-mapel').value = userProfile.mapel || '';
        renderKS();
    });

    renderKS();
}
