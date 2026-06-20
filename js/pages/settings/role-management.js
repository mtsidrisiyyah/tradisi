// ============================================
// TRADISI — Manajemen Akses Page Module
// ============================================
import { ROLE_LABELS } from '../../utils/rbac.js';

export async function render(contentArea, ctx) {
    const { dbService, showToast, showConfirmDialog } = ctx;
    
    // Fetch all profiles from the mock or Firebase db
    // In mock DB, we store user profiles under the 'profiles' collection
    const profiles = await dbService.getData('profiles') || [];
    
    const renderUsers = function() {
        const listContainer = document.getElementById('users-list-container');
        if (!profiles.length) {
            listContainer.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-xs text-slate-400">
                        <i class="ph ph-users text-3xl mb-2"></i>
                        <p>Belum ada data pengguna.</p>
                    </td>
                </tr>
            `;
            return;
        }

        listContainer.innerHTML = profiles.map((p, idx) => {
            const statusBadge = p.status === 'aktif' 
                ? '<span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-semibold">Aktif</span>'
                : p.status === 'menunggu_persetujuan'
                ? '<span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-semibold">Menunggu Persetujuan</span>'
                : '<span class="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 text-[10px] font-semibold">Nonaktif</span>';

            const userRoles = (p.roles || ['guru']).map(r => ROLE_LABELS[r] || r).join(', ');

            return `
                <tr class="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td class="px-6 py-4 text-xs text-slate-500 text-center">${idx + 1}</td>
                    <td class="px-6 py-4">
                        <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${p.nama || 'Guru Pendidik'}</p>
                        <p class="text-[10px] text-slate-400">${p.email || '-'}</p>
                    </td>
                    <td class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">${p.nip || '-'}</td>
                    <td class="px-6 py-4 text-xs text-slate-600 dark:text-slate-300 font-medium">${userRoles}</td>
                    <td class="px-6 py-4 text-center">${statusBadge}</td>
                    <td class="px-6 py-4 text-center">
                        <div class="flex items-center justify-center gap-2">
                            ${p.status === 'menunggu_persetujuan' ? `
                                <button onclick="window.approveUser('${p.id}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all"><i class="ph ph-check"></i> Setujui</button>
                            ` : ''}
                            <button onclick="window.editUserRoles('${p.id}')" class="p-1.5 bg-forest-600/10 text-forest-700 hover:bg-forest-600 hover:text-white rounded-lg transition-colors" title="Kelola Role"><i class="ph ph-shield-check text-base"></i></button>
                            ${p.status === 'aktif' ? `
                                <button onclick="window.toggleUserStatus('${p.id}', 'nonaktif')" class="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors" title="Nonaktifkan"><i class="ph ph-user-minus text-base"></i></button>
                            ` : p.status === 'nonaktif' ? `
                                <button onclick="window.toggleUserStatus('${p.id}', 'aktif')" class="p-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors" title="Aktifkan"><i class="ph ph-user-plus text-base"></i></button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    };

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Manajemen Pengguna & Hak Akses</h3>
                        <p class="text-[10px] text-slate-400 mt-0.5">Kelola status keaktifan akun dan hak akses peran (roles) untuk guru & staf madrasah.</p>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th class="px-6 py-3 w-12 text-center">No</th>
                                <th class="px-6 py-3">Nama Lengkap / Email</th>
                                <th class="px-6 py-3">NIP / NUPTK</th>
                                <th class="px-6 py-3">Hak Akses Peran (Roles)</th>
                                <th class="px-6 py-3 text-center w-28">Status</th>
                                <th class="px-6 py-3 text-center w-40 no-print">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="users-list-container">
                            <!-- users list -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Action: Approve user
    window.approveUser = async function(id) {
        showConfirmDialog("Setujui Pendaftaran", "Setujui akun ini untuk masuk ke dalam sistem?", async () => {
            const user = profiles.find(p => p.id === id);
            if (user) {
                user.status = 'aktif';
                await dbService.saveData('profiles', profiles);
                showToast("Pendaftaran disetujui!");
                renderUsers();
            }
        });
    };

    // Action: Change status (aktif/nonaktif)
    window.toggleUserStatus = async function(id, newStatus) {
        const title = newStatus === 'aktif' ? "Aktifkan Akun" : "Nonaktifkan Akun";
        const message = newStatus === 'aktif' 
            ? "Apakah Anda yakin ingin mengaktifkan kembali akun ini?"
            : "Apakah Anda yakin ingin menonaktifkan akun ini? Pengguna tidak akan bisa masuk.";

        showConfirmDialog(title, message, async () => {
            const user = profiles.find(p => p.id === id);
            if (user) {
                user.status = newStatus;
                await dbService.saveData('profiles', profiles);
                showToast(`Status akun berhasil diperbarui.`);
                renderUsers();
            }
        });
    };

    // Action: Edit user roles modal
    window.editUserRoles = function(id) {
        const user = profiles.find(p => p.id === id);
        if (!user) return;

        const currentRoles = user.roles || ['guru'];
        
        const formBody = `
            <div class="space-y-3">
                <p class="text-xs text-slate-500 font-medium">Pilih satu atau lebih hak akses untuk: <strong class="text-slate-800 dark:text-slate-200">${user.nama}</strong></p>
                <div class="grid grid-cols-2 gap-3 pt-2">
                    ${Object.entries(ROLE_LABELS).map(([code, label]) => `
                        <label class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 dark:bg-slate-950/40 text-xs cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-800/20">
                            <input type="checkbox" name="user-role" value="${code}" ${currentRoles.includes(code) ? 'checked' : ''} class="w-4 h-4 rounded text-forest-600 focus:ring-forest-500">
                            <span class="font-medium text-slate-700 dark:text-slate-300">${label}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        ctx.openModal("Kelola Hak Akses Peran", formBody, "Simpan", async () => {
            const checkedBoxes = document.querySelectorAll('input[name="user-role"]:checked');
            const selectedRoles = Array.from(checkedBoxes).map(cb => cb.value);
            
            if (selectedRoles.length === 0) {
                showToast("Pengguna harus memiliki minimal satu peran!", "error");
                return;
            }

            user.roles = selectedRoles;
            // Set default activeRole if the current one is not in the new roles
            if (!selectedRoles.includes(user.activeRole)) {
                user.activeRole = selectedRoles[0];
            }

            await dbService.saveData('profiles', profiles);
            ctx.closeModal();
            showToast("Peran pengguna berhasil diperbarui.");
            renderUsers();
        });
    };

    renderUsers();
}
