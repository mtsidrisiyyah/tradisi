// ============================================
// TRADISI — SPA Router Module
// ============================================
import { canAccessPage } from './rbac.js';
import { showSkeleton, showErrorState, showEmptyState } from './ui.js';

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

    // Update breadcrumb
    if (window.updateBreadcrumb) window.updateBreadcrumb(pageTitle);

    // Highlight active menu item and its icon
    document.querySelectorAll('.menu-item').forEach(el => {
        el.classList.remove('bg-slate-800/80', 'text-white', 'font-semibold');
        const bullet = el.querySelector('.bullet-indicator');
        const icon = el.querySelector('.sidebar-item-icon');
        if (bullet) {
            bullet.classList.remove('bg-forest-600', 'scale-125');
            bullet.classList.add('bg-slate-600');
        }
        if (icon) {
            icon.classList.remove('text-forest-400');
            icon.classList.add('text-slate-500');
        }
        if (el.getAttribute('data-page') === pageTitle) {
            el.classList.add('bg-slate-800/80', 'text-white', 'font-semibold');
            if (bullet) {
                bullet.classList.remove('bg-slate-600');
                bullet.classList.add('bg-forest-600', 'scale-125');
            }
            if (icon) {
                icon.classList.remove('text-slate-500');
                icon.classList.add('text-forest-400');
            }
        }
    });

    // Close sidebar on mobile
    if (window.innerWidth < 768 && typeof window.toggleSidebar === 'function') {
        window.toggleSidebar(false);
    }

    // Update mobile bottom nav active state
    document.querySelectorAll('#mobile-bottom-nav button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-page') === pageTitle) {
            btn.classList.add('active');
        }
    });

    // Show skeleton loading
    if (contentArea) {
        showSkeleton(contentArea, 'dashboard');
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
                showErrorState(contentArea, {
                    title: 'Gagal Memuat Halaman',
                    message: err.message || 'Terjadi kesalahan saat memuat konten.',
                    retryAction: () => navigateTo(pageTitle, context)
                });
            }
        }
    } else {
        // Fallback for unregistered pages
        if (contentArea) {
            showEmptyState(contentArea, {
                icon: 'ph-wrench',
                title: 'Halaman Dalam Pengembangan',
                description: `Halaman "${pageTitle}" belum tersedia.`
            });
        }
    }
}

/**
 * Expose loadPage globally for inline onclick handlers
 */
export function initRouter(context = {}) {
    window.loadPage = (pageTitle) => navigateTo(pageTitle, context);
}
