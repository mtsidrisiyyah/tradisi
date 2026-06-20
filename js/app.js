// ============================================
// TRADISI — Main Application Entry Point
// Modular Architecture v2.0
// ============================================

// Core services
import { useMockDb, isFirebaseConfigured } from './config/firebase.js';
import { dbService, initializeLocalStorageSeed, hasSuperAdmin, bootstrapSuperAdmin } from './services/db.service.js';
import { login, logout, initAuthListener, getCurrentUser, getUserProfile, setUserProfile, getFirebaseAuthMessage } from './services/auth.service.js';

// Utilities
import { getGreeting, formatTanggalIndonesia, updateClock, getHariIndonesia, getTodayStr, generateId } from './utils/helpers.js';
import { showToast, openModal, closeModal, showConfirmDialog, showLoading, showEmptyState, deleteItem, initUIListeners } from './utils/ui.js';
import { registerPage, navigateTo, initRouter } from './utils/router.js';

// Components
import { renderSidebar, updateSidebarUser, initSidebarToggle, toggleSidebarCollapse, initSidebarCollapse, menuStructure } from './components/sidebar.js';

// ============================================
// 1. INITIALIZE SEED DATA
// ============================================
initializeLocalStorageSeed();

// ============================================
// 2. SHARED CONTEXT (passed to all page modules)
// ============================================
const appContext = {
    dbService,
    useMockDb,
    getGreeting,
    formatTanggalIndonesia,
    getHariIndonesia,
    getTodayStr,
    generateId,
    showToast,
    openModal,
    closeModal,
    showConfirmDialog,
    showLoading,
    showEmptyState,
    deleteItem,
    getCurrentUser,
    getUserProfile,
    setUserProfile
};

// ============================================
// 3. REGISTER ALL PAGES (lazy-loaded)
// ============================================
registerPage('Dashboard', () => import('./pages/dashboard.js'));
registerPage('Pengaturan Madrasah', () => import('./pages/settings/madrasah.js'));
registerPage('Manajemen Akses', () => import('./pages/settings/role-management.js'));
registerPage('Penugasan Guru', () => import('./pages/settings/penugasan-guru.js'));
registerPage('Supervisi Akademik', () => import('./pages/perangkat-ajar/supervisi.js'));
registerPage('Profil Saya', () => import('./pages/settings/profil.js'));
registerPage('Panduan Kurikulum', () => import('./pages/panduan-kurikulum.js'));
registerPage('Generator Administrasi', () => import('./pages/system/generator.js'));

// Data Master
registerPage('Data Siswa', () => import('./pages/master/siswa.js'));
registerPage('Data Guru', () => import('./pages/master/guru.js'));
registerPage('Mata Pelajaran', () => import('./pages/master/mapel.js'));
registerPage('Data Kelas', () => import('./pages/master/kelas.js'));
registerPage('Rombongan Belajar', () => import('./pages/master/rombel.js'));
registerPage('Jadwal Pelajaran', () => import('./pages/master/jadwal.js'));
registerPage('Kalender Pendidikan', () => import('./pages/master/kalender.js'));

// Administrasi KBM
registerPage('Absensi Siswa', () => import('./pages/kbm/absensi.js'));
registerPage('Jurnal Agenda Guru', () => import('./pages/kbm/jurnal.js'));
registerPage('Penilaian Siswa', () => import('./pages/kbm/penilaian.js'));

// Perangkat Ajar
registerPage('Cover Administrasi', () => import('./pages/perangkat-ajar/cover.js'));
registerPage('Program Tahunan', () => import('./pages/perangkat-ajar/prota.js'));
registerPage('Program Semester', () => import('./pages/perangkat-ajar/promes.js'));
registerPage('Alur Tujuan Pembelajaran', () => import('./pages/perangkat-ajar/atp.js'));
registerPage('Modul Ajar', () => import('./pages/perangkat-ajar/modul-ajar.js'));
registerPage('Bahan Ajar', () => import('./pages/perangkat-ajar/bahan-ajar.js'));
registerPage('Lembar Kerja Peserta Didik', () => import('./pages/perangkat-ajar/lkpd.js'));

// Asesmen
registerPage('Program Asesmen', () => import('./pages/asesmen/program.js'));
registerPage('Kriteria Ketercapaian Tujuan Pembelajaran', () => import('./pages/asesmen/kktp.js'));
registerPage('Bank Soal', () => import('./pages/asesmen/bank-soal.js'));
registerPage('Kisi-Kisi Soal', () => import('./pages/asesmen/kisi-kisi.js'));
registerPage('Analisis Butir Soal', () => import('./pages/asesmen/analisis.js'));
registerPage('Rapor Siswa', () => import('./pages/asesmen/rapor.js'));
registerPage('Kesiswaan & BK', () => import('./pages/kesiswaan/kesiswaan.js'));

// ============================================
// 4. INITIALIZE ROUTER
// ============================================
initRouter(appContext);

// Expose global helpers that pages need via window
window.getGreeting = getGreeting;
window.formatTanggalIndonesia = formatTanggalIndonesia;
window.deleteItem = (collection, id, renderFn, items) => deleteItem(collection, id, renderFn, items, dbService);
window.showToast = showToast;

// ============================================
// 5. DARK MODE
// ============================================
window.toggleDarkMode = function () {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('tradisi_theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
};

function updateThemeIcon() {
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
        const isDark = document.documentElement.classList.contains('dark');
        icon.className = isDark ? 'ph ph-sun text-lg' : 'ph ph-moon text-lg';
    }
}

// ============================================
// 6. UI PROFILE INFO UPDATER
// ============================================
function updateUIProfileInfo() {
    const profile = getUserProfile();
    const nama = (profile && typeof profile.nama === 'string' && profile.nama.trim() !== '') ? profile.nama : "Guru Pendidik";
    const activeRole = (profile && profile.activeRole) ? profile.activeRole : 'guru';
    const roles = (profile && profile.roles) ? profile.roles : ['guru'];

    updateSidebarUser(nama, activeRole, roles, async (newRole) => {
        profile.activeRole = newRole;
        setUserProfile(profile);
        if (getCurrentUser()) {
            await dbService.saveProfile(getCurrentUser().uid, profile);
        }
        showToast(`Hak akses dialihkan ke: ${newRole}`);
        renderSidebar(newRole);
        navigateTo('Dashboard', appContext);
    });

    const topbarName = document.getElementById('topbar-user-name');
    if (topbarName) topbarName.innerText = nama;
}

// ============================================
// 7. AUTH FLOW — LOGIN / REGISTER / LOGOUT
// ============================================
const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const authContainer = document.getElementById('auth-container');
const loginFormHtml = authContainer ? authContainer.innerHTML : '';

function onUserAuthenticated() {
    updateUIProfileInfo();
    loginView.classList.add('hidden');
    appView.classList.remove('hidden');
    
    const profile = getUserProfile();
    const activeRole = (profile && profile.activeRole) ? profile.activeRole : 'guru';
    
    renderSidebar(activeRole);
    navigateTo('Dashboard', appContext);
}

function onUserLoggedOut() {
    loginView.classList.remove('hidden');
    appView.classList.add('hidden');
    window.showLoginForm();
}

// Login form submit listener attacher
function attachLoginFormListener() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const pass = document.getElementById('password').value;
        const btn = document.getElementById('login-btn');
        const errDiv = document.getElementById('login-error');

        btn.innerHTML = `<i class="ph ph-spinner animate-spin text-base mr-2"></i> Memproses...`;
        btn.disabled = true;
        errDiv.classList.add('hidden');

        try {
            await login(email, pass);

            if (useMockDb) {
                // For mock mode, manually trigger authenticated state
                onUserAuthenticated();
            }
            // For Firebase mode, onAuthStateChanged handles the rest (including auto-promote)
        } catch (error) {
            console.error("Login gagal:", error.code || "unknown", error.message);
            const errorMessage = getFirebaseAuthMessage(error.code, error.message);
            errDiv.innerText = errorMessage;
            errDiv.classList.remove('hidden');
            btn.innerHTML = `<span>Masuk</span>`;
            btn.disabled = false;
        }
    });
}

// Global form togglers
window.showLoginForm = function() {
    if (authContainer && loginFormHtml) {
        authContainer.innerHTML = loginFormHtml;
        attachLoginFormListener();
    }
};

window.showRegisterForm = async function() {
    if (authContainer) {
        const registerModule = await import('./pages/auth/register.js');
        registerModule.render(authContainer);
    }
};

window.showSetupForm = async function() {
    if (authContainer) {
        const setupModule = await import('./pages/auth/setup-admin.js');
        setupModule.render(authContainer);
    }
};

// Logout handler
document.getElementById('logout-btn').addEventListener('click', async () => {
    await logout();
    onUserLoggedOut();
    console.log("Sesi berakhir, kembali ke halaman login.");
});

// Firebase auth state listener
initAuthListener(
    // onLogin
    async (user, profile) => {
        // Auto-promote to super_admin if no super admin exists yet (first Firebase user gets promoted)
        if (!useMockDb && isFirebaseConfigured) {
            const exists = await hasSuperAdmin();
            if (!exists && user) {
                console.log("⬆️ Mempromosikan user menjadi Super Admin pertama...");
                const promoted = await bootstrapSuperAdmin(user.uid, user.email, {
                    nama: profile.nama || 'Administrator',
                    nip: profile.nip || '-',
                    mapel: profile.mapel || '-',
                    hp: profile.hp || '-'
                });
                setUserProfile(promoted);
                showToast("Akun Anda dipromosikan menjadi Super Administrator!");
            }
        }
        onUserAuthenticated();
    },
    // onLogout
    () => {
        onUserLoggedOut();
    }
);

// ============================================
// 8.5 FIRST-RUN SUPER ADMIN SETUP CHECK
// ============================================
// In Firebase mode, if no super admin exists yet, show setup wizard instead of login
if (!useMockDb && isFirebaseConfigured) {
    // Delay slightly to let onAuthStateChanged fire first (avoids race condition)
    setTimeout(async () => {
        const exists = await hasSuperAdmin();
        if (!exists) {
            console.log("⚠️ Belum ada Super Admin. Menampilkan wizard setup...");
            window.showSetupForm();
        }
    }, 1000);
}

// ============================================
// 8. INITIALIZE UI
// ============================================
initUIListeners();
initSidebarToggle();
initSidebarCollapse();
updateThemeIcon();
attachLoginFormListener();

// Sidebar collapse button (desktop)
const collapseBtn = document.getElementById('sidebar-collapse-btn');
if (collapseBtn) {
    collapseBtn.addEventListener('click', () => toggleSidebarCollapse());
}

// Render initial guest sidebar
renderSidebar('guru');

// ============================================
// 9. GLOBAL SEARCH (Command Palette Ctrl+K)
// ============================================
const searchModal = document.getElementById('search-modal');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const searchTrigger = document.getElementById('search-trigger');
const searchOverlay = document.getElementById('search-overlay');
let searchActiveIndex = -1;
let searchItems = [];

function openSearch() {
    if (!searchModal) return;
    searchModal.classList.remove('hidden');
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    searchActiveIndex = -1;
    renderSearchResults('');
}

function closeSearch() {
    if (searchModal) searchModal.classList.add('hidden');
}

function renderSearchResults(query) {
    if (!searchResults) return;
    const q = (query || '').toLowerCase().trim();
    let html = '';
    searchItems = [];

    if (!q) {
        // Show all pages grouped by category
        menuStructure.forEach(group => {
            const profile = getUserProfile();
            const allowed = group.items.filter(item => {
                if (!profile || !profile.activeRole) return true;
                const { canAccessPage } = (() => { try { return { canAccessPage: (r, p) => true }; } catch(e) { return {}; } })();
                return true;
            });
            if (allowed.length > 0) {
                html += `<div class="search-result-group-title">${group.category}</div>`;
                allowed.forEach(item => {
                    const idx = searchItems.length;
                    searchItems.push({ type: 'page', name: item.name, icon: item.icon, category: group.category });
                    html += `<div class="search-result-item" data-index="${idx}" onclick="window.__searchNavigate(${idx})">
                        <i class="ph ${item.icon} text-base"></i>
                        <div class="flex-1 min-w-0">
                            <div class="text-xs font-semibold truncate">${item.name}</div>
                            <div class="text-[10px] text-stone-400">${group.category}</div>
                        </div>
                    </div>`;
                });
            }
        });
    } else {
        // Filter pages by query
        let found = 0;
        menuStructure.forEach(group => {
            group.items.forEach(item => {
                if (item.name.toLowerCase().includes(q) || group.category.toLowerCase().includes(q)) {
                    const idx = searchItems.length;
                    searchItems.push({ type: 'page', name: item.name, icon: item.icon, category: group.category });
                    html += `<div class="search-result-item" data-index="${idx}" onclick="window.__searchNavigate(${idx})">
                        <i class="ph ${item.icon} text-base"></i>
                        <div class="flex-1 min-w-0">
                            <div class="text-xs font-semibold truncate">${item.name}</div>
                            <div class="text-[10px] text-stone-400">${group.category}</div>
                        </div>
                    </div>`;
                    found++;
                }
            });
        });

        // Search in data collections (siswa, guru)
        const searchData = async () => {
            try {
                const siswa = await dbService.getData('siswa');
                siswa.filter(s => s.nama.toLowerCase().includes(q) || s.nisn.includes(q)).slice(0, 3).forEach(s => {
                    const idx = searchItems.length;
                    searchItems.push({ type: 'data', name: s.nama, sub: s.nisn + ' · ' + s.kelas, icon: 'ph-student' });
                    const el = document.createElement('div');
                    el.className = 'search-result-item';
                    el.setAttribute('data-index', idx);
                    el.onclick = () => window.__searchNavigate(idx);
                    el.innerHTML = `<i class="ph ph-student text-base"></i><div class="flex-1 min-w-0"><div class="text-xs font-semibold truncate">${s.nama}</div><div class="text-[10px] text-stone-400">${s.nisn} · ${s.kelas}</div></div>`;
                    searchResults.appendChild(el);
                });
            } catch (e) { /* ignore */ }
        };

        if (q.length >= 2) searchData();

        if (found === 0 && q.length < 2) {
            html = `<div class="text-center py-6 text-xs text-stone-400"><i class="ph ph-magnifying-glass text-2xl mb-2 block"></i>Tidak ditemukan hasil untuk "${query}"</div>`;
        }
    }

    if (!html && searchItems.length === 0) {
        html = `<div class="text-center py-6 text-xs text-stone-400"><i class="ph ph-magnifying-glass text-2xl mb-2 block"></i>Tidak ditemukan hasil untuk "${query}"</div>`;
    }

    searchResults.innerHTML = html;
    searchActiveIndex = -1;
}

window.__searchNavigate = function(idx) {
    const item = searchItems[idx];
    if (!item) return;
    closeSearch();
    if (item.type === 'page') {
        window.loadPage(item.name);
    }
};

function updateSearchHighlight() {
    const items = searchResults?.querySelectorAll('.search-result-item');
    if (!items) return;
    items.forEach((el, i) => {
        el.classList.toggle('active', i === searchActiveIndex);
    });
    if (searchActiveIndex >= 0 && items[searchActiveIndex]) {
        items[searchActiveIndex].scrollIntoView({ block: 'nearest' });
    }
}

// Keyboard shortcut
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        renderSearchResults(e.target.value);
    });
    searchInput.addEventListener('keydown', (e) => {
        const total = searchItems.length;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            searchActiveIndex = Math.min(searchActiveIndex + 1, total - 1);
            updateSearchHighlight();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            searchActiveIndex = Math.max(searchActiveIndex - 1, 0);
            updateSearchHighlight();
        } else if (e.key === 'Enter' && searchActiveIndex >= 0) {
            e.preventDefault();
            window.__searchNavigate(searchActiveIndex);
        }
    });
}

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
    }
    if (e.key === 'Escape' && searchModal && !searchModal.classList.contains('hidden')) {
        closeSearch();
    }
});

if (searchTrigger) searchTrigger.addEventListener('click', openSearch);
if (searchOverlay) searchOverlay.addEventListener('click', closeSearch);

// ============================================
// 10. BREADCRUMB UPDATE
// ============================================
window.updateBreadcrumb = function(pageTitle) {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;

    let category = '';
    menuStructure.forEach(group => {
        group.items.forEach(item => {
            if (item.name === pageTitle) category = group.category;
        });
    });

    let html = `<span class="breadcrumb-home cursor-pointer hover:text-forest-600 transition-colors" onclick="window.loadPage('Dashboard')">Home</span>`;
    if (category) {
        html += `<span class="breadcrumb-sep">/</span>`;
        html += `<span>${category}</span>`;
    }
    html += `<span class="breadcrumb-sep">/</span>`;
    html += `<span class="breadcrumb-current">${pageTitle}</span>`;
    breadcrumb.innerHTML = html;
};

// Start live clock
updateClock();
setInterval(updateClock, 1000);

console.log("✅ TRADISI v2.0 — Arsitektur Modular berhasil dimuat.");
