// ============================================
// TRADISI — Generic CRUD Page Factory
// Reusable factory for simple list+form pages
// ============================================

/**
 * Creates a standard CRUD page with form + list
 * @param {object} config - Page configuration
 */
export function createCrudPage(config) {
    return {
        async render(contentArea, ctx) {
            const { dbService, showToast, getUserProfile } = ctx;
            const items = await dbService.getData(config.collection);
            const userProfile = getUserProfile();

            const renderFn = function(list = items) {
                const c = document.getElementById('items-list');
                if (!list.length) {
                    c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ${config.emptyIcon || 'ph-file-text'} text-3xl mb-2"></i><p>${config.emptyText || 'Belum ada data.'}</p></div>`;
                    return;
                }
                c.innerHTML = list.map((d, i) => config.renderItem(d, i, items)).join('');
            };

            // Expose render function globally
            window[config.renderFnName] = renderFn;

            // Build form fields HTML
            const formFieldsHtml = config.fields.map(f => {
                if (f.type === 'select') {
                    const options = f.options.map(o => `<option value="${o}">${o}</option>`).join('');
                    return `<div${f.colSpan ? ` class="md:col-span-${f.colSpan}"` : ''}><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">${f.label}</label><select id="f-${f.id}" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">${options}</select></div>`;
                }
                if (f.type === 'textarea') {
                    return `<div${f.colSpan ? ` class="md:col-span-${f.colSpan}"` : ''}><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">${f.label}</label><textarea id="f-${f.id}" rows="${f.rows || 2}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''} class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500"></textarea></div>`;
                }
                const defaultVal = f.defaultFromProfile ? userProfile[f.defaultFromProfile] || '' : (f.default || '');
                return `<div${f.colSpan ? ` class="md:col-span-${f.colSpan}"` : ''}><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">${f.label}</label><input type="${f.type || 'text'}" id="f-${f.id}" value="${defaultVal}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''} class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500"></div>`;
            }).join('');

            contentArea.innerHTML = `
                <div class="fade-in space-y-6">
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                        <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-forest-600"></i> ${config.formTitle}</h3>
                        <form id="item-form" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-${config.gridCols || 4} gap-4">${formFieldsHtml}</div>
                            <div class="flex justify-end"><button type="submit" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan</button></div>
                        </form>
                    </div>
                    <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6">
                        <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ${config.listIcon || 'ph-list'} text-forest-600 mr-1"></i> ${config.listTitle}</h3>
                        <div id="items-list"></div>
                    </div>
                </div>`;

            document.getElementById('item-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const newItem = config.buildItem(userProfile);
                items.push(newItem);
                await dbService.saveData(config.collection, items);
                showToast(config.saveMessage || 'Data disimpan!');
                e.target.reset();
                // Restore defaults from profile
                config.fields.filter(f => f.defaultFromProfile).forEach(f => {
                    const el = document.getElementById(`f-${f.id}`);
                    if (el) el.value = userProfile[f.defaultFromProfile] || '';
                });
                renderFn();
            });

            // Expose delete for window.deleteItem calls
            window.deleteItem = function(collection, id, renderCallback, itemsArr) {
                ctx.showConfirmDialog("Hapus Data", "Apakah Anda yakin ingin menghapus data ini?", () => {
                    const idx = itemsArr.findIndex(i => i.id === id);
                    if (idx !== -1) {
                        itemsArr.splice(idx, 1);
                        dbService.saveData(collection, itemsArr).then(() => { renderCallback(); showToast("Data berhasil dihapus."); });
                    }
                });
            };

            renderFn();
        }
    };
}
