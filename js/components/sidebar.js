// ============================================
// TRADISI — Sidebar Component Module
// ============================================
import { canAccessPage, ROLE_LABELS } from '../utils/rbac.js';

/**
 * Menu structure definition
 */
const menuStructure = [
    {
        category: "Menu Utama",
        icon: "ph-house",
        items: ["Dashboard", "Pengaturan Madrasah", "Manajemen Akses", "Penugasan Guru", "Supervisi Akademik", "Generator Administrasi", "Panduan Kurikulum", "Profil Saya"]
    },
    {
        category: "Data Master",
        icon: "ph-database",
        items: ["Data Siswa", "Data Guru", "Mata Pelajaran", "Data Kelas", "Rombongan Belajar", "Jadwal Pelajaran", "Kalender Pendidikan"]
    },
    {
        category: "Administrasi KBM",
        icon: "ph-chalkboard-teacher",
        items: ["Absensi Siswa", "Jurnal Agenda Guru", "Penilaian Siswa"]
    },
    {
        category: "Perangkat Ajar",
        icon: "ph-folder-open",
        items: ["Cover Administrasi", "Program Tahunan", "Program Semester", "Alur Tujuan Pembelajaran", "Modul Ajar", "Bahan Ajar", "Lembar Kerja Peserta Didik"]
    },
    {
        category: "Asesmen",
        icon: "ph-exam",
        items: ["Program Asesmen", "Kriteria Ketercapaian Tujuan Pembelajaran", "Bank Soal", "Kisi-Kisi Soal", "Analisis Butir Soal", "Rapor Siswa"]
    },
    {
        category: "Kesiswaan",
        icon: "ph-users",
        items: ["Kesiswaan & BK"]
    }
];

/**
 * Render the sidebar menu filtered by active role permissions
 * @param {string} activeRole - User's active role
 */
export function renderSidebar(activeRole = 'guru') {
    const container = document.getElementById('sidebar-menu-container');
    if (!container) return;

    let html = '';
    menuStructure.forEach(group => {
        const allowedItems = group.items.filter(item => canAccessPage(activeRole, item));
        
        if (allowedItems.length > 0) {
            html += `
            <div class="mb-4">
                <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2 px-2">
                    <i class="ph ${group.icon} text-slate-400"></i> ${group.category}
                </h3>
                <ul class="space-y-0.5 pl-1">
            `;
            allowedItems.forEach(item => {
                html += `
                    <li>
                        <button onclick="window.loadPage('${item}')" class="w-full text-left text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 py-2 px-3 rounded-lg transition-all flex items-center gap-2 menu-item" data-page="${item}">
                            <div class="w-1.5 h-1.5 rounded-full bg-slate-600 transition-all bullet-indicator"></div>
                            ${item}
                        </button>
                    </li>
                `;
            });
            html += `</ul></div>`;
        }
    });
    container.innerHTML = html;
}

/**
 * Update sidebar user info display and active role dropdown selector
 * @param {string} name - User's display name
 * @param {string} activeRole - User's active role
 * @param {string[]} roles - All roles assigned to user
 * @param {Function} onRoleChange - Callback when role is changed
 */
export function updateSidebarUser(name, activeRole = 'guru', roles = ['guru'], onRoleChange = null) {
    const sidebarName = document.getElementById('sidebar-user-name');
    if (sidebarName) sidebarName.innerText = name || 'Guru Pendidik';

    const sidebarRoleContainer = document.getElementById('sidebar-user-role');
    if (sidebarRoleContainer) {
        if (roles.length > 1) {
            const options = roles.map(r => `<option value="${r}" ${r === activeRole ? 'selected' : ''}>${ROLE_LABELS[r] || r}</option>`).join('');
            sidebarRoleContainer.innerHTML = `
                <select id="sidebar-role-select" class="bg-forest-800 dark:bg-slate-800 text-[10px] text-sand-400 font-semibold uppercase tracking-wider py-0.5 px-1.5 rounded cursor-pointer border-none outline-none focus:ring-1 focus:ring-forest-500 max-w-[150px]">
                    ${options}
                </select>
            `;
            // Add listener to the dropdown
            const selectEl = document.getElementById('sidebar-role-select');
            if (selectEl && onRoleChange) {
                // Remove previous listener and attach new one
                selectEl.onchange = (e) => {
                    onRoleChange(e.target.value);
                };
            }
        } else {
            sidebarRoleContainer.innerText = ROLE_LABELS[activeRole] || activeRole || 'Guru / Pendidik';
        }
    }

    const userInitial = document.getElementById('user-initial');
    if (userInitial) userInitial.innerText = name ? name.charAt(0).toUpperCase() : 'G';
}

/**
 * Initialize mobile sidebar toggle
 */
export function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');

    window.toggleSidebar = function (show) {
        if (show) {
            sidebar.classList.remove('-translate-x-full');
            mobileOverlay.classList.remove('hidden');
        } else {
            sidebar.classList.add('-translate-x-full');
            mobileOverlay.classList.add('hidden');
        }
    };

    document.getElementById('open-sidebar').addEventListener('click', () => window.toggleSidebar(true));
    document.getElementById('close-sidebar').addEventListener('click', () => window.toggleSidebar(false));
    mobileOverlay.addEventListener('click', () => window.toggleSidebar(false));
}

export { menuStructure };
