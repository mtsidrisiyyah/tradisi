// ============================================
// TRADISI — Program Semester Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, getUserProfile } = ctx;
    const items = await dbService.getData('promes');
    const userProfile = getUserProfile();

    const schoolSettings = await dbService.getData('madrasah_settings') || {
        nama: "MTs Idrisiyyah Tasikmalaya",
        tahunAjaran: "2026/2027",
        semester: "Ganjil"
    };

    const renderPromes = function(list = items) {
        const c = document.getElementById('items-list');
        if (!list.length) {
            c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-calendar text-3xl mb-2"></i><p>Belum ada Program Semester.</p></div>`;
            return;
        }
        c.innerHTML = `
            <table class="w-full text-left">
                <thead>
                    <tr class="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                        <th class="px-4 py-2">No</th>
                        <th class="px-4 py-2">Bulan</th>
                        <th class="px-4 py-2">Kegiatan</th>
                        <th class="px-4 py-2 w-20">JP</th>
                        <th class="px-4 py-2 w-16 no-print">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${list.map((d, i) => `
                        <tr class="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50/50">
                            <td class="px-4 py-3 text-xs text-slate-500">${i+1}</td>
                            <td class="px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">${d.bulan}</td>
                            <td class="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">${d.kegiatan}</td>
                            <td class="px-4 py-3 text-xs font-bold text-forest-700">${d.jp}</td>
                            <td class="px-4 py-3 no-print">
                                <button onclick="window.deleteItem('promes','${d.id}', window.renderPromesCallback, window.promesItems)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg"><i class="ph ph-trash text-base"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    };

    window.renderPromesCallback = renderPromes;
    window.promesItems = items;

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-forest-600"></i> Tambah Kegiatan Bulanan</h3>
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
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Bulan</label>
                            <select id="f-bulan" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                                <option>Juli</option>
                                <option>Agustus</option>
                                <option>September</option>
                                <option>Oktober</option>
                                <option>November</option>
                                <option>Desember</option>
                            </select>
                        </div>
                        <div class="md:col-span-1">
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kegiatan</label>
                            <input type="text" id="f-kegiatan" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">JP</label>
                            <input type="text" id="f-jp" placeholder="12" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan</button>
                    </div>
                </form>
            </div>
            
            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-list text-forest-600 mr-1"></i> PROMES ${schoolSettings.semester}</h3>
                <div id="items-list"></div>
            </div>
        </div>
    `;

    document.getElementById('item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        items.push({
            id: 'pm_' + Date.now(),
            mapel: document.getElementById('f-mapel').value,
            kelas: document.getElementById('f-kelas').value,
            semester: schoolSettings.semester,
            bulan: document.getElementById('f-bulan').value,
            kegiatan: document.getElementById('f-kegiatan').value,
            jp: document.getElementById('f-jp').value
        });
        await dbService.saveData('promes', items);
        showToast("PROMES disimpan!");
        e.target.reset();
        document.getElementById('f-mapel').value = userProfile.mapel || '';
        renderPromes();
    });

    renderPromes();
}
