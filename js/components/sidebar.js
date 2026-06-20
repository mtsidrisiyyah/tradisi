// ============================================
// TRADISI — Sidebar Component Module
// ============================================
import { canAccessPage, ROLE_LABELS } from '../utils/rbac.js';

/**
 * Menu structure definition with per-item icons
 */
const menuStructure = [
    {
        category: "Menu Utama",
        icon: "ph-house",
        items: [
            { name: "Dashboard", icon: "ph-squares-four" },
            { name: "Pengaturan Madrasah", icon: "ph-gear" },
            { name: "Manajemen Akses", icon: "ph-shield-check" },
            { name: "Penugasan Guru", icon: "ph-clipboard-text" },
            { name: "Supervisi Akademik", icon: "ph-eye" },
            { name: "Generator Administrasi", icon: "ph-magic-wand" },
            { name: "Panduan Kurikulum", icon: "ph-book-open" },
            { name: "Profil Saya", icon: "ph-user-circle" }
        ]
    },
    {
        category: "Data Master",
        icon: "ph-database",
        items: [
            { name: "Data Siswa", icon: "ph-student" },
            { name: "Data Guru", icon: "ph-chalkboard-teacher" },
            { name: "Mata Pelajaran", icon: "ph-book-bookmark" },
            { name: "Data Kelas", icon: "ph-buildings" },
            { name: "Rombongan Belajar", icon: "ph-users-three" },
            { name: "Jadwal Pelajaran", icon: "ph-calendar" },
            { name: "Kalender Pendidikan", icon: "ph-calendar-dots" }
        ]
    },
    {
        category: "Administrasi KBM",
        icon: "ph-chalkboard-teacher",
        items: [
            { name: "Absensi Siswa", icon: "ph-check-square" },
            { name: "Jurnal Agenda Guru", icon: "ph-notebook" },
            { name: "Penilaian Siswa", icon: "ph-chart-bar" }
        ]
    },
    {
        category: "Perangkat Ajar",
        icon: "ph-folder-open",
        items: [
            { name: "Cover Administrasi", icon: "ph-image" },
            { name: "Program Tahunan", icon: "ph-calendar-plus" },
            { name: "Program Semester", icon: "ph-calendar-check" },
            { name: "Alur Tujuan Pembelajaran", icon: "ph-path" },
            { name: "Modul Ajar", icon: "ph-article" },
            { name: "Bahan Ajar", icon: "ph-file-text" },
            { name: "Lembar Kerja Peserta Didik", icon: "ph-file-dashed" }
        ]
    },
    {
        category: "Asesmen",
        icon: "ph-exam",
        items: [
            { name: "Program Asesmen", icon: "ph-list-checks" },
            { name: "Kriteria Ketercapaian Tujuan Pembelajaran", icon: "ph-target" },
            { name: "Bank Soal", icon: "ph-stack" },
            { name: "Kisi-Kisi Soal", icon: "ph-table" },
            { name: "Analisis Butir Soal", icon: "ph-chart-line-up" },
            { name: "Rapor Siswa", icon: "ph-identification-card" }
        ]
    },
    {
        category: "Kesiswaan",
        icon: "ph-users",
        items: [
            { name: "Kesiswaan & BK", icon: "ph-heart" }
        ]
    }
];

/**
 * Get collapsed sidebar state from localStorage
 */
function isSidebarCollapsed() {
    return localStorage.getItem('tradisi_sidebar_collapsed') === 'true';
}

/**
 * Render the sidebar menu filtered by active role permissions
 * Supports collapsed mode (icons only) and expanded mode (full labels)
 * @param {string} activeRole - User's active role
 */
export function renderSidebar(activeRole = 'guru') {
    const container = document.getElementById('sidebar-menu-container');
    if (!container) return;

    const collapsed = isSidebarCollapsed();
    let html = '';

    menuStructure.forEach(group => {
        const allowedItems = group.items.filter(item => canAccessPage(activeRole, item.name));

        if (allowedItems.length > 0) {
            html += `<div class="mb-4 sidebar-group">`;

            // Category header
            if (collapsed) {
                html += `<div class="sidebar-category-header flex items-center justify-center mb-2 px-1">
                    <i class="ph ${group.icon} text-slate-500 text-base sidebar-cat-icon"></i>
                    <span class="sidebar-cat-text text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <i class="ph ${group.icon} text-slate-400"></i> ${group.category}
                    </span>
                </div>`;
            } else {
                html += `<h3 class="sidebar-category-header text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2 px-2">
                    <i class="ph ${group.icon} text-slate-400"></i> ${group.category}
                </h3>`;
            }

            html += `<ul class="space-y-0.5 ${collapsed ? 'pl-0' : 'pl-1'}">`;

            allowedItems.forEach(item => {
                if (collapsed) {
                    html += `
                        <li>
                            <button onclick="window.loadPage('${item.name}')"
                                class="sidebar-menu-btn w-full text-center text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 py-2.5 px-0 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 menu-item relative group"
                                data-page="${item.name}" title="${item.name}">
                                <i class="ph ${item.icon} text-lg sidebar-item-icon"></i>
                                <span class="sidebar-item-label text-[9px] leading-tight hidden">${item.name.length > 10 ? item.name.substring(0, 9) + '…' : item.name}</span>
                                <span class="sidebar-tooltip absolute left-full ml-2 px-2.5 py-1.5 bg-stone-900 text-white text-[11px] rounded-lg shadow-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">${item.name}</span>
                            </button>
                        </li>`;
                } else {
                    html += `
                        <li>
                            <button onclick="window.loadPage('${item.name}')"
                                class="sidebar-menu-btn w-full text-left text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 py-2 px-3 rounded-lg transition-all flex items-center gap-2.5 menu-item"
                                data-page="${item.name}">
                                <i class="ph ${item.icon} text-base sidebar-item-icon text-slate-500"></i>
                                <span class="sidebar-item-label">${item.name}</span>
                                <div class="w-1.5 h-1.5 rounded-full bg-slate-600 transition-all bullet-indicator hidden"></div>
                            </button>
                        </li>`;
                }
            });

            html += `</ul></div>`;
        }
    });
    container.innerHTML = html;

    // Re-apply active page highlight
    const currentPage = document.getElementById('header-title')?.innerText;
    if (currentPage) {
        document.querySelectorAll('.menu-item').forEach(el => {
            if (el.getAttribute('data-page') === currentPage) {
                el.classList.add('bg-slate-800/80', 'text-white', 'font-semibold');
                const icon = el.querySelector('.sidebar-item-icon');
                if (icon) icon.classList.add('text-forest-400');
            }
        });
    }
}

/**
 * Update sidebar user info display and active role dropdown selector
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
            const selectEl = document.getElementById('sidebar-role-select');
            if (selectEl && onRoleChange) {
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
 * Toggle sidebar collapse state (desktop only)
 * @param {boolean} [forceState] - Optional: true=collapse, false=expand, undefined=toggle
 */
export function toggleSidebarCollapse(forceState) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const currentlyCollapsed = isSidebarCollapsed();
    const shouldCollapse = forceState !== undefined ? forceState : !currentlyCollapsed;

    localStorage.setItem('tradisi_sidebar_collapsed', shouldCollapse);

    if (shouldCollapse) {
        sidebar.classList.add('sidebar-collapsed');
        sidebar.classList.remove('w-72');
        sidebar.classList.add('w-[68px]');
    } else {
        sidebar.classList.remove('sidebar-collapsed');
        sidebar.classList.remove('w-[68px]');
        sidebar.classList.add('w-72');
    }

    // Update toggle button icon
    const toggleIcon = document.getElementById('sidebar-collapse-icon');
    if (toggleIcon) {
        toggleIcon.className = shouldCollapse
            ? 'ph ph-sidebar-simple text-lg'
            : 'ph ph-sidebar text-lg';
    }

    // Re-render menu for current role
    const roleSelect = document.getElementById('sidebar-role-select');
    const currentRole = roleSelect ? roleSelect.value : 'guru';
    renderSidebar(currentRole);
}

/**
 * Initialize sidebar collapse state from localStorage
 */
export function initSidebarCollapse() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    if (isSidebarCollapsed()) {
        sidebar.classList.add('sidebar-collapsed');
        sidebar.classList.remove('w-72');
        sidebar.classList.add('w-[68px]');

        const toggleIcon = document.getElementById('sidebar-collapse-icon');
        if (toggleIcon) {
            toggleIcon.className = 'ph ph-sidebar-simple text-lg';
        }
    }
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
