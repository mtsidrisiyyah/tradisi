// ============================================
// TRADISI — SPA Router Module
// ============================================
import { canAccessPage } from './rbac.js';

/**
 * Page registry — maps page titles to lazy-loaded modules
 */
const pageRegistry = {};

/**
 * Register a page module
 * @param {string} title - Page title (matches menu item text)
 * @param {Function} loaderFn - Async function that returns the page module
 */
export function registerPage(title, loaderFn) {
    pageRegistry[title] = loaderFn;
}

/**
 * Get the content area element
 */
function getContentArea() {
    return document.getElementById('content-area');
}

/**
 * Get the header title element
 */
function getHeaderTitle() {
    return document.getElementById('header-title');
}

/**
 * Navigate to a page by title
 * @param {string} pageTitle - The page to navigate to
 * @param {object} context - Shared context (dbService, userProfile, etc.)
 */
export async function navigateTo(pageTitle, context = {}) {
    const contentArea = getContentArea();
    const headerTitle = getHeaderTitle();

    // Route Guard: check permission based on active role in user profile
    const profile = context.getUserProfile ? context.getUserProfile() : null;
    const activeRole = (profile && profile.activeRole) ? profile.activeRole : 'guru';

    if (!canAccessPage(activeRole, pageTitle)) {
        if (headerTitle) headerTitle.innerText = "Akses Ditolak";
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="flex flex-col justify-center items-center h-64 text-slate-400 fade-in">
                    <div class="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center mb-4">
                        <i class="ph ph-shield-warning text-3xl text-rose-500"></i>
                    </div>
                    <p class="text-xs font-bold text-rose-500">Akses Ditolak</p>
                    <p class="text-[10px] text-slate-400 mt-1">Peran Anda saat ini (${activeRole}) tidak memiliki izin untuk membuka halaman "${pageTitle}".</p>
                </div>
            `;
        }
        return;
    }

    if (headerTitle) headerTitle.innerText = pageTitle;

    // Highlight active menu item
    document.querySelectorAll('.menu-item').forEach(el => {
        el.classList.remove('bg-slate-800/80', 'text-white', 'font-semibold');
        const bullet = el.querySelector('.bullet-indicator');
        if (bullet) {
            bullet.classList.remove('bg-forest-600', 'scale-125');
            bullet.classList.add('bg-slate-600');
        }
        if (el.getAttribute('data-page') === pageTitle) {
            el.classList.add('bg-slate-800/80', 'text-white', 'font-semibold');
            if (bullet) {
                bullet.classList.remove('bg-slate-600');
                bullet.classList.add('bg-forest-600', 'scale-125');
            }
        }
    });

    // Close sidebar on mobile
    if (window.innerWidth < 768 && typeof window.toggleSidebar === 'function') {
        window.toggleSidebar(false);
    }

    // Show loading
    if (contentArea) {
        contentArea.innerHTML = `
            <div class="flex flex-col justify-center items-center h-64 text-slate-400">
                <i class="ph ph-spinner animate-spin text-3xl text-forest-600 mb-2"></i>
                <p class="text-xs">Memuat konten...</p>
            </div>
        `;
    }

    // Load page module
    const loader = pageRegistry[pageTitle];
    if (loader) {
        try {
            const pageModule = await loader();
            if (pageModule && typeof pageModule.render === 'function') {
                await pageModule.render(contentArea, context);
            }
        } catch (err) {
            console.error(`Gagal memuat halaman "${pageTitle}":`, err);
            if (contentArea) {
                contentArea.innerHTML = `
                    <div class="flex flex-col justify-center items-center h-64 text-slate-400">
                        <i class="ph ph-warning-circle text-3xl text-rose-500 mb-2"></i>
                        <p class="text-xs text-rose-500 font-semibold">Gagal memuat halaman</p>
                        <p class="text-[10px] text-slate-400 mt-1">${err.message}</p>
                    </div>
                `;
            }
        }
    } else {
        // Fallback for unregistered pages
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="flex flex-col justify-center items-center h-64 text-slate-400">
                    <i class="ph ph-construction text-3xl mb-2"></i>
                    <p class="text-xs font-semibold">Halaman "${pageTitle}" sedang dalam pengembangan</p>
                </div>
            `;
        }
    }
}

/**
 * Expose loadPage globally for inline onclick handlers
 */
export function initRouter(context = {}) {
    window.loadPage = (pageTitle) => navigateTo(pageTitle, context);
}
