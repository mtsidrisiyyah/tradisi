// ============================================
// TRADISI — Main Application Entry Point
// Modular Architecture v2.0
// ============================================

// Core services
import { useMockDb, isFirebaseConfigured } from './config/firebase.js';
import { dbService, initializeLocalStorageSeed, hasSuperAdmin } from './services/db.service.js';
import { login, logout, initAuthListener, getCurrentUser, getUserProfile, setUserProfile, getFirebaseAuthMessage } from './services/auth.service.js';

// Utilities
import { getGreeting, formatTanggalIndonesia, updateClock, getHariIndonesia, getTodayStr, generateId } from './utils/helpers.js';
import { showToast, openModal, closeModal, showConfirmDialog, showLoading, showEmptyState, deleteItem, initUIListeners } from './utils/ui.js';
import { registerPage, navigateTo, initRouter } from './utils/router.js';

// Components
import { renderSidebar, updateSidebarUser, initSidebarToggle } from './components/sidebar.js';

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
            // For Firebase mode, onAuthStateChanged handles the rest
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
    (user, profile) => {
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
updateThemeIcon();
attachLoginFormListener();

// Render initial guest sidebar
renderSidebar('guru');

// Start live clock
updateClock();
setInterval(updateClock, 1000);

console.log("✅ TRADISI v2.0 — Arsitektur Modular berhasil dimuat.");
