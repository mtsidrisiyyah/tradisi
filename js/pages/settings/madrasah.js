// ============================================
// TRADISI — Pengaturan Madrasah Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast } = ctx;
    const SEED = (await import('../../services/db.service.js')).SEED_DATA;
    const schoolSettings = await dbService.getData('madrasah_settings').then(res => Array.isArray(res) ? res[0] || SEED.madrasah_settings : res);

    contentArea.innerHTML = `
        <div class="fade-in space-y-6 max-w-3xl">
            <div class="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                <h3 class="text-base font-bold border-b dark:border-slate-700 pb-3 mb-5 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <i class="ph ph-buildings text-forest-600 text-lg"></i> Identitas Madrasah
                </h3>
                <form id="school-settings-form" class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Nama Madrasah / Sekolah</label>
                        <input type="text" id="school-name" value="${schoolSettings.nama}" required class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">NPSN</label>
                            <input type="text" id="school-npsn" value="${schoolSettings.npsn || ''}" maxlength="10" pattern="[0-9]{10}" placeholder="10 digit angka" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">NSM</label>
                            <input type="text" id="school-nsm" value="${schoolSettings.nsm || ''}" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Akreditasi</label>
                            <select id="school-akreditasi" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                                <option value="A" ${schoolSettings.akreditasi === 'A' ? 'selected' : ''}>A (Unggul)</option>
                                <option value="B" ${schoolSettings.akreditasi === 'B' ? 'selected' : ''}>B (Baik)</option>
                                <option value="C" ${schoolSettings.akreditasi === 'C' ? 'selected' : ''}>C (Cukup)</option>
                                <option value="Belum" ${schoolSettings.akreditasi === 'Belum' ? 'selected' : ''}>Belum Terakreditasi</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Kepala Madrasah</label>
                            <input type="text" id="school-head" value="${schoolSettings.kepala}" required class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">NIP Kepala Madrasah</label>
                            <input type="text" id="school-head-nip" value="${schoolSettings.nipKepala}" required class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Tahun Pelajaran</label>
                            <input type="text" id="school-year" value="${schoolSettings.tahunAjaran}" placeholder="contoh: 2026/2027" required class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Semester</label>
                            <select id="school-semester" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                                <option value="Ganjil" ${schoolSettings.semester === 'Ganjil' ? 'selected' : ''}>Ganjil</option>
                                <option value="Genap" ${schoolSettings.semester === 'Genap' ? 'selected' : ''}>Genap</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Nama Yayasan</label>
                        <input type="text" id="school-yayasan" value="${schoolSettings.yayasan || ''}" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Alamat Madrasah</label>
                        <textarea id="school-address" rows="2" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">${schoolSettings.alamat || ''}</textarea>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Email</label>
                            <input type="email" id="school-email" value="${schoolSettings.email || ''}" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Telepon</label>
                            <input type="text" id="school-phone" value="${schoolSettings.telepon || ''}" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Website</label>
                            <input type="url" id="school-website" value="${schoolSettings.website || ''}" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                    </div>
                    <div class="pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button type="submit" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-98 text-xs uppercase tracking-wider flex items-center gap-2">
                            <i class="ph ph-floppy-disk text-base"></i> Simpan Pengaturan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('school-settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.innerHTML = `<i class="ph ph-spinner animate-spin text-base"></i> Menyimpan...`;

        const newSettings = {
            nama: document.getElementById('school-name').value,
            npsn: document.getElementById('school-npsn').value,
            nsm: document.getElementById('school-nsm').value,
            akreditasi: document.getElementById('school-akreditasi').value,
            kepala: document.getElementById('school-head').value,
            nipKepala: document.getElementById('school-head-nip').value,
            tahunAjaran: document.getElementById('school-year').value,
            semester: document.getElementById('school-semester').value,
            yayasan: document.getElementById('school-yayasan').value,
            alamat: document.getElementById('school-address').value,
            email: document.getElementById('school-email').value,
            telepon: document.getElementById('school-phone').value,
            website: document.getElementById('school-website').value
        };

        await dbService.saveData('madrasah_settings', [newSettings]);
        showToast("Pengaturan madrasah berhasil diperbarui!");
        btn.innerHTML = `<i class="ph ph-floppy-disk text-base"></i> Simpan Pengaturan`;
    });
}
