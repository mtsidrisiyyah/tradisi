// ============================================
// TRADISI — Profil Saya Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, getCurrentUser, getUserProfile, setUserProfile } = ctx;
    const userProfile = getUserProfile();
    const currentUser = getCurrentUser();

    contentArea.innerHTML = `
        <div class="fade-in space-y-6 max-w-2xl">
            <div class="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                <h3 class="text-base font-bold border-b dark:border-slate-700 pb-3 mb-5 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <i class="ph ph-user-circle text-forest-600 text-lg"></i> Profil Pendidik
                </h3>
                <form id="profile-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Nama Lengkap</label>
                            <input type="text" id="prof-nama" value="${userProfile.nama || ''}" required class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">NIP / NUPTK</label>
                            <input type="text" id="prof-nip" value="${userProfile.nip || ''}" class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Mata Pelajaran</label>
                            <input type="text" id="prof-mapel" value="${userProfile.mapel || ''}" class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Jabatan</label>
                            <input type="text" id="prof-jabatan" value="${userProfile.jabatan || ''}" placeholder="contoh: Guru Mapel" class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Pangkat / Golongan</label>
                            <input type="text" id="prof-pangkat" value="${userProfile.pangkat || ''}" placeholder="contoh: III/b" class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Pendidikan Terakhir</label>
                            <input type="text" id="prof-pendidikan" value="${userProfile.pendidikan || ''}" placeholder="contoh: S2 - Teknik Informatika" class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">No. Handphone</label>
                            <input type="tel" id="prof-hp" value="${userProfile.hp || ''}" placeholder="08xxxxxxxxxx" class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Email</label>
                            <input type="email" id="prof-email" value="${userProfile.email || (currentUser ? currentUser.email || '' : '')}" placeholder="guru@idrisiyyah.sch.id" class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-sm">
                        </div>
                    </div>
                    <div class="pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button type="submit" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-98 text-xs uppercase tracking-wider flex items-center gap-2">
                            <i class="ph ph-floppy-disk text-base"></i> Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.innerHTML = `<i class="ph ph-spinner animate-spin text-base"></i> Menyimpan...`;

        const updatedProfile = {
            nama: document.getElementById('prof-nama').value,
            nip: document.getElementById('prof-nip').value,
            mapel: document.getElementById('prof-mapel').value,
            jabatan: document.getElementById('prof-jabatan').value,
            pangkat: document.getElementById('prof-pangkat').value,
            pendidikan: document.getElementById('prof-pendidikan').value,
            hp: document.getElementById('prof-hp').value,
            email: document.getElementById('prof-email').value
        };

        try {
            await dbService.saveProfile(currentUser ? currentUser.uid : 'demo-user', updatedProfile);
            setUserProfile(updatedProfile);
            // Update sidebar/topbar name
            const sidebarName = document.getElementById('sidebar-user-name');
            if (sidebarName) sidebarName.innerText = updatedProfile.nama;
            const topbarName = document.getElementById('topbar-user-name');
            if (topbarName) topbarName.innerText = updatedProfile.nama;
            showToast("Profil berhasil disimpan!");
        } catch (err) {
            showToast("Gagal menyimpan profil: " + err.message, true);
        } finally {
            btn.innerHTML = `<i class="ph ph-floppy-disk text-base"></i> Simpan Perubahan`;
        }
    });
}
