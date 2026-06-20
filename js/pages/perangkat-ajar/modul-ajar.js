// ============================================
// TRADISI — Modul Ajar Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, getUserProfile } = ctx;
    const items = await dbService.getData('modulAjar');
    const userProfile = getUserProfile();

    const renderModul = function(list = items) {
        const c = document.getElementById('items-list');
        if (!list.length) {
            c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-book-open-text text-3xl mb-2"></i><p>Belum ada Modul Ajar.</p></div>`;
            return;
        }
        c.innerHTML = list.map(d => `
            <div class="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center"><i class="ph ph-book-open-text text-xl"></i></div>
                        <div>
                            <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${d.mapel} - Kelas ${d.kelas} (Fase ${d.fase})</p>
                            <p class="text-[10px] text-slate-400">${d.alokasiWaktu}</p>
                        </div>
                    </div>
                    <button onclick="window.deleteItem('modulAjar','${d.id}', window.renderModulCallback, window.modulItems)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg"><i class="ph ph-trash text-base"></i></button>
                </div>
                <p class="text-[10px] text-slate-500 mt-2 line-clamp-2">${d.tujuan}</p>
            </div>
        `).join('');
    };

    window.renderModulCallback = renderModul;
    window.modulItems = items;

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-forest-600"></i> Buat Modul Ajar</h3>
                <form id="item-form" class="space-y-4">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Mapel</label>
                            <input type="text" id="f-mapel" value="${userProfile.mapel || ''}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kelas</label>
                            <input type="text" id="f-kelas" placeholder="VII" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Fase</label>
                            <select id="f-fase" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                                <option value="D">D</option>
                                <option value="E">E</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Alokasi Waktu</label>
                            <input type="text" id="f-alokasi" placeholder="2 x 40 menit" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Tujuan Pembelajaran</label>
                        <textarea id="f-tujuan" rows="2" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500" placeholder="Peserta didik mampu..."></textarea>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Pendahuluan</label>
                            <textarea id="f-pendahuluan" rows="3" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500" placeholder="Apersepsi, motivasi..."></textarea>
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kegiatan Inti</label>
                            <textarea id="f-inti" rows="3" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500" placeholder="Diskusi, praktik..."></textarea>
                        </div>
                        <div>
                            <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Penutup</label>
                            <textarea id="f-penutup" rows="3" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500" placeholder="Refleksi, penugasan..."></textarea>
                        </div>
                    </div>
                    <div>
                        <label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Asesmen</label>
                        <input type="text" id="f-asesmen" placeholder="Formatif: ..., Sumatif: ..." class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan Modul</button>
                    </div>
                </form>
            </div>
            
            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-list text-forest-600 mr-1"></i> Daftar Modul Ajar</h3>
                <div class="space-y-3" id="items-list"></div>
            </div>
        </div>
    `;

    document.getElementById('item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        items.push({
            id: 'ma_' + Date.now(),
            mapel: document.getElementById('f-mapel').value,
            kelas: document.getElementById('f-kelas').value,
            fase: document.getElementById('f-fase').value,
            alokasiWaktu: document.getElementById('f-alokasi').value,
            tujuan: document.getElementById('f-tujuan').value,
            pendahuluan: document.getElementById('f-pendahuluan').value,
            inti: document.getElementById('f-inti').value,
            penutup: document.getElementById('f-penutup').value,
            asesmen: document.getElementById('f-asesmen').value
        });
        await dbService.saveData('modulAjar', items);
        showToast("Modul Ajar disimpan!");
        e.target.reset();
        document.getElementById('f-mapel').value = userProfile.mapel || '';
        renderModul();
    });

    renderModul();
}
