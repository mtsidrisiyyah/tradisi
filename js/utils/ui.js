// ============================================
// TRADISI — UI Utilities Module (Enhanced Phase 2)
// ============================================

// ============================================
// TOAST NOTIFICATION SYSTEM (Enhanced)
// ============================================
let toastQueue = [];
let toastCounter = 0;

/**
 * Show toast notification with type support and stacking
 * @param {string} message - Message to display
 * @param {object|boolean} options - Options or isError boolean (backwards compat)
 */
export function showToast(message, options = {}) {
    // Backwards compatibility: showToast(msg, true) = error toast
    if (typeof options === 'boolean') {
        options = { type: options ? 'error' : 'success' };
    }

    const { type = 'success', duration = 3500, dismissable = true } = options;

    const toastId = `toast-${++toastCounter}`;
    const icons = {
        success: 'ph-check-circle text-forest-600',
        error: 'ph-x-circle text-rose-500',
        warning: 'ph-warning text-amber-500',
        info: 'ph-info text-blue-500'
    };
    const bgColors = {
        success: 'bg-white dark:bg-stone-800',
        error: 'bg-white dark:bg-stone-800',
        warning: 'bg-white dark:bg-stone-800',
        info: 'bg-white dark:bg-stone-800'
    };
    const progressColors = {
        success: 'bg-forest-500',
        error: 'bg-rose-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500'
    };

    const toastEl = document.createElement('div');
    toastEl.id = toastId;
    toastEl.className = `toast-item ${bgColors[type]} transform translate-y-4 opacity-0 transition-all duration-300 flex items-start gap-3 py-3 px-4 rounded-2xl shadow-2xl max-w-sm border border-stone-200 dark:border-stone-700 relative overflow-hidden`;
    toastEl.innerHTML = `
        <i class="ph ${icons[type]} text-xl mt-0.5 flex-shrink-0"></i>
        <div class="flex-1 min-w-0">
            <div class="text-xs font-semibold text-stone-800 dark:text-stone-200">${message}</div>
        </div>
        ${dismissable ? `<button class="toast-dismiss text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5 flex-shrink-0" onclick="window.__dismissToast('${toastId}')"><i class="ph ph-x text-sm"></i></button>` : ''}
        <div class="toast-progress absolute bottom-0 left-0 h-0.5 ${progressColors[type]} rounded-full" style="width: 100%; transition: width ${duration}ms linear;"></div>
    `;

    // Find or create toast container
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-5 right-5 z-50 flex flex-col-reverse gap-2';
        document.body.appendChild(container);
    }

    container.appendChild(toastEl);
    toastQueue.push(toastId);

    // Animate in
    requestAnimationFrame(() => {
        toastEl.classList.remove('translate-y-4', 'opacity-0');
        toastEl.classList.add('translate-y-0', 'opacity-100');
        // Start progress bar
        const progress = toastEl.querySelector('.toast-progress');
        if (progress) {
            requestAnimationFrame(() => { progress.style.width = '0%'; });
        }
    });

    // Auto-dismiss
    const timer = setTimeout(() => window.__dismissToast(toastId), duration);
    toastEl._timer = timer;

    // Keep max 3 visible
    while (toastQueue.length > 3) {
        const oldest = toastQueue.shift();
        window.__dismissToast(oldest);
    }
}

window.__dismissToast = function(toastId) {
    const el = document.getElementById(toastId);
    if (!el) return;
    clearTimeout(el._timer);
    el.classList.add('translate-y-4', 'opacity-0');
    el.classList.remove('translate-y-0', 'opacity-100');
    setTimeout(() => {
        el.remove();
        toastQueue = toastQueue.filter(id => id !== toastId);
    }, 300);
};

// Legacy compatibility
window.showToast = showToast;

// ============================================
// MODAL SYSTEM
// ============================================
let modalOnConfirm = null;

export function openModal(title, bodyHtml, confirmText = "Simpan", onConfirm = null) {
    document.getElementById('crud-modal-title').innerText = title;
    document.getElementById('crud-modal-body').innerHTML = bodyHtml;
    document.getElementById('crud-modal-save-btn').innerText = confirmText;
    document.getElementById('crud-modal-save-btn').className = "px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-xl shadow-md transition-colors";
    modalOnConfirm = onConfirm;

    const modal = document.getElementById('crud-modal');
    const modalBox = document.getElementById('crud-modal-box');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modalBox.classList.remove('scale-95', 'opacity-0');
        modalBox.classList.add('scale-100', 'opacity-100');
    }, 10);
}

export function closeModal() {
    const modal = document.getElementById('crud-modal');
    const modalBox = document.getElementById('crud-modal-box');
    modalBox.classList.remove('scale-100', 'opacity-100');
    modalBox.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 250);
}

export function showConfirmDialog(title, message, onConfirm) {
    const bodyHtml = `
        <div class="text-center py-2">
            <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                <i class="ph ph-warning text-rose-500 text-2xl"></i>
            </div>
            <h4 class="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2">${title}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">${message}</p>
        </div>
    `;
    openModal(title, bodyHtml, "Ya, Lanjutkan", () => {
        closeModal();
        if (onConfirm) onConfirm();
    });
    const saveBtn = document.getElementById('crud-modal-save-btn');
    saveBtn.className = "px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors";
}

window.openModal = openModal;
window.closeModal = closeModal;
window.showConfirmDialog = showConfirmDialog;

// ============================================
// LOADING SPINNER (Legacy)
// ============================================
export function showLoading(container) {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (el) {
        el.innerHTML = `
            <div class="flex flex-col justify-center items-center h-64 text-slate-400">
                <i class="ph ph-spinner animate-spin text-3xl text-forest-600 mb-2"></i>
                <p class="text-xs">Memuat konten...</p>
            </div>
        `;
    }
}

// ============================================
// LOADING SKELETON (Phase 2 Enhanced)
// ============================================
const skeletonBase = `<div class="skeleton rounded-xl animate-pulse"></div>`;

export function showSkeleton(container, type = 'table') {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) return;

    const skel = (w, h) => `<div class="skeleton rounded-lg animate-pulse" style="width:${w};height:${h}"></div>`;

    if (type === 'table') {
        el.innerHTML = `
            <div class="fade-in space-y-4 p-2">
                <div class="flex gap-3">${skel('120px', '36px')}${skel('200px', '36px')}${skel('flex-1', '36px')}</div>
                ${Array(6).fill(0).map(() => `<div class="flex gap-4 items-center py-3 border-b border-stone-100 dark:border-stone-800">
                    ${skel('40px', '16px')}${skel('15%', '14px')}${skel('25%', '14px')}${skel('15%', '14px')}${skel('12%', '14px')}${skel('80px', '28px')}
                </div>`).join('')}
            </div>`;
    } else if (type === 'cards') {
        el.innerHTML = `
            <div class="fade-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                ${Array(4).fill(0).map(() => `<div class="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200/50 dark:border-stone-800 p-5 space-y-3">
                    ${skel('100%', '20px')}${skel('60%', '14px')}${skel('80%', '14px')}${skel('40%', '24px')}
                </div>`).join('')}
            </div>`;
    } else if (type === 'dashboard') {
        el.innerHTML = `
            <div class="fade-in space-y-6">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${Array(4).fill(0).map(() => `<div class="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200/50 dark:border-stone-800 p-5 space-y-3">
                        ${skel('50%', '16px')}${skel('30%', '28px')}${skel('70%', '12px')}
                    </div>`).join('')}
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200/50 dark:border-stone-800 p-6 space-y-4">
                        ${skel('40%', '20px')}${skel('100%', '180px')}
                    </div>
                    <div class="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200/50 dark:border-stone-800 p-6 space-y-3">
                        ${skel('50%', '18px')}${Array(4).fill(0).map(() => skel('100%', '40px')).join('')}
                    </div>
                </div>
            </div>`;
    } else if (type === 'form') {
        el.innerHTML = `
            <div class="fade-in max-w-lg space-y-5">
                ${Array(4).fill(0).map(() => `<div class="space-y-2">${skel('30%', '12px')}${skel('100%', '42px')}</div>`).join('')}
                ${skel('140px', '42px')}
            </div>`;
    }
}

// ============================================
// EMPTY STATE (Phase 2 Enhanced)
// ============================================
export function showEmptyState(container, config = {}) {
    // Backwards compat: showEmptyState(el, icon, message)
    if (typeof config === 'string') {
        config = { icon: config, title: arguments[2] || 'Belum ada data.' };
    }

    const { icon = 'ph-file-dashed', title = 'Belum ada data', description = '', actionLabel = '', onAction = null } = config;
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) return;

    el.innerHTML = `
        <div class="flex flex-col justify-center items-center h-64 text-slate-400 fade-in">
            <div class="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4 empty-state-icon">
                <i class="ph ${icon} text-4xl text-stone-300 dark:text-stone-600"></i>
            </div>
            <p class="text-sm font-bold text-stone-500 dark:text-stone-400 mb-1">${title}</p>
            ${description ? `<p class="text-xs text-stone-400 dark:text-stone-500 max-w-xs text-center mb-4">${description}</p>` : ''}
            ${actionLabel && onAction ? `<button class="empty-state-action mt-2 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-xl shadow-md transition-colors">${actionLabel}</button>` : ''}
        </div>
    `;

    if (actionLabel && onAction) {
        el.querySelector('.empty-state-action')?.addEventListener('click', onAction);
    }
}

// ============================================
// ERROR STATE (Phase 2)
// ============================================
export function showErrorState(container, config = {}) {
    const { title = 'Terjadi Kesalahan', message = 'Gagal memuat data. Silakan coba lagi.', retryAction = null } = config;
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) return;

    el.innerHTML = `
        <div class="flex flex-col justify-center items-center h-64 text-slate-400 fade-in">
            <div class="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mb-4">
                <i class="ph ph-warning-octagon text-4xl text-rose-400 dark:text-rose-500"></i>
            </div>
            <p class="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1">${title}</p>
            <p class="text-xs text-stone-400 dark:text-stone-500 max-w-xs text-center mb-4">${message}</p>
            ${retryAction ? `<button class="error-retry-btn mt-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2">
                <i class="ph ph-arrow-clockwise"></i> Coba Lagi
            </button>` : ''}
        </div>
    `;

    if (retryAction) {
        el.querySelector('.error-retry-btn')?.addEventListener('click', retryAction);
    }
}

// ============================================
// ENHANCED DATA TABLES (Phase 2)
// ============================================
/**
 * Create a reusable data table with sorting, pagination, and search
 * @param {HTMLElement|string} container - Container element or ID
 * @param {object} config - Table configuration
 * @param {Array} config.columns - Column definitions: { key, label, sortable, render }
 * @param {Array} config.data - Initial data array
 * @param {number} [config.perPage=10] - Items per page
 * @param {string} [config.searchPlaceholder] - Search input placeholder
 * @param {Function} [config.onRowClick] - Row click handler
 * @param {string} [config.emptyMessage] - Message when no data
 */
export function createDataTable(container, config) {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) return null;

    const { columns, data, perPage = 10, searchPlaceholder = 'Cari data...', emptyMessage = 'Tidak ada data ditemukan.', actions = null } = config;

    let state = {
        items: [...data],
        filtered: [...data],
        page: 1,
        perPage: perPage,
        sortKey: null,
        sortDir: 'asc',
        searchQuery: ''
    };

    function applyFilters() {
        let result = [...state.items];

        // Search
        if (state.searchQuery) {
            const q = state.searchQuery.toLowerCase();
            result = result.filter(item => {
                return columns.some(col => {
                    const val = item[col.key];
                    return val && String(val).toLowerCase().includes(q);
                });
            });
        }

        // Sort
        if (state.sortKey) {
            result.sort((a, b) => {
                const aVal = a[state.sortKey] ?? '';
                const bVal = b[state.sortKey] ?? '';
                const cmp = String(aVal).localeCompare(String(bVal), 'id', { numeric: true });
                return state.sortDir === 'asc' ? cmp : -cmp;
            });
        }

        state.filtered = result;
        state.page = 1;
    }

    function render() {
        const totalItems = state.filtered.length;
        const totalPages = Math.ceil(totalItems / state.perPage) || 1;
        if (state.page > totalPages) state.page = totalPages;
        const start = (state.page - 1) * state.perPage;
        const pageItems = state.filtered.slice(start, start + state.perPage);

        // Build header
        const headerHtml = columns.map(col => {
            const sortIcon = state.sortKey === col.key
                ? (state.sortDir === 'asc' ? 'ph-caret-up' : 'ph-caret-down')
                : 'ph-caret-up';
            const sortClass = state.sortKey === col.key ? 'text-forest-600 dark:text-forest-400' : 'text-stone-300 dark:text-stone-600';
            return `<th class="px-5 py-3 text-left text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider whitespace-nowrap ${col.sortable !== false ? 'cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 select-none' : ''}" ${col.sortable !== false ? `data-sort-key="${col.key}"` : ''}>
                <span class="flex items-center gap-1.5">${col.label}${col.sortable !== false ? `<i class="ph ${sortIcon} text-xs ${sortClass}"></i>` : ''}</span>
            </th>`;
        }).join('');

        // Build body
        let bodyHtml;
        if (pageItems.length === 0) {
            bodyHtml = `<tr><td colspan="${columns.length + (actions ? 1 : 0)}" class="px-6 py-10 text-center text-xs text-stone-400">${emptyMessage}</td></tr>`;
        } else {
            bodyHtml = pageItems.map((item, idx) => {
                const cells = columns.map(col => {
                    const val = col.render ? col.render(item[col.key], item) : (item[col.key] ?? '-');
                    return `<td class="px-5 py-3.5 text-xs text-stone-700 dark:text-stone-300">${val}</td>`;
                }).join('');
                const actionCell = actions ? `<td class="px-5 py-3.5 text-xs">${actions(item)}</td>` : '';
                return `<tr class="hover:bg-stone-50 dark:hover:bg-stone-800/40 border-b border-stone-100 dark:border-stone-800 transition-colors">${cells}${actionCell}</tr>`;
            }).join('');
        }

        el.innerHTML = `
            <div class="dt-wrapper fade-in">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div class="relative max-w-xs flex-1">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400"><i class="ph ph-magnifying-glass text-sm"></i></span>
                        <input type="text" class="dt-search w-full pl-9 pr-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-700 dark:text-stone-300 outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all" placeholder="${searchPlaceholder}" value="${state.searchQuery}">
                    </div>
                    <div class="flex items-center gap-2">
                        <select class="dt-perpage bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-600 dark:text-stone-400 px-2 py-2 outline-none focus:ring-2 focus:ring-forest-500/20">
                            ${[10, 25, 50].map(n => `<option value="${n}" ${n === state.perPage ? 'selected' : ''}>${n} / halaman</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
                    <table class="w-full min-w-[600px]">
                        <thead class="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-700">
                            <tr>${headerHtml}</tr>
                        </thead>
                        <tbody>${bodyHtml}</tbody>
                    </table>
                </div>
                <div class="flex items-center justify-between mt-4 text-xs text-stone-500 dark:text-stone-400">
                    <span>Menampilkan ${totalItems === 0 ? 0 : start + 1}-${Math.min(start + state.perPage, totalItems)} dari ${totalItems} data</span>
                    <div class="flex items-center gap-1">
                        <button class="dt-prev px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ${state.page <= 1 ? 'opacity-40 pointer-events-none' : ''}" ${state.page <= 1 ? 'disabled' : ''}>
                            <i class="ph ph-caret-left"></i>
                        </button>
                        <span class="px-3 py-1.5 font-semibold">Halaman ${state.page} / ${totalPages}</span>
                        <button class="dt-next px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ${state.page >= totalPages ? 'opacity-40 pointer-events-none' : ''}" ${state.page >= totalPages ? 'disabled' : ''}>
                            <i class="ph ph-caret-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Attach event listeners
        el.querySelector('.dt-search')?.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            applyFilters();
            render();
        });

        el.querySelector('.dt-perpage')?.addEventListener('change', (e) => {
            state.perPage = parseInt(e.target.value) || 10;
            state.page = 1;
            render();
        });

        el.querySelector('.dt-prev')?.addEventListener('click', () => {
            if (state.page > 1) { state.page--; render(); }
        });

        el.querySelector('.dt-next')?.addEventListener('click', () => {
            const totalPages = Math.ceil(state.filtered.length / state.perPage) || 1;
            if (state.page < totalPages) { state.page++; render(); }
        });

        // Sort headers
        el.querySelectorAll('[data-sort-key]').forEach(th => {
            th.addEventListener('click', () => {
                const key = th.getAttribute('data-sort-key');
                if (state.sortKey === key) {
                    state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
                } else {
                    state.sortKey = key;
                    state.sortDir = 'asc';
                }
                applyFilters();
                render();
            });
        });
    }

    // Public API
    const table = {
        render,
        setData(newData) { state.items = [...newData]; applyFilters(); render(); },
        getState() { return state; },
        refresh() { render(); }
    };

    render();
    return table;
}

// ============================================
// GENERIC DELETE HELPER
// ============================================
export function deleteItem(collection, id, renderFn, items, dbService) {
    showConfirmDialog("Hapus Data", `Apakah Anda yakin ingin menghapus data ini?`, async () => {
        if (dbService && typeof dbService.softDeleteItem === 'function') {
            await dbService.softDeleteItem(collection, id);
            const idx = items.findIndex(i => i.id === id);
            if (idx !== -1) items.splice(idx, 1);
            renderFn();
            showToast("Data berhasil dihapus.");
        } else {
            const idx = items.findIndex(i => i.id === id);
            if (idx !== -1) {
                items.splice(idx, 1);
                dbService.saveData(collection, items).then(() => {
                    renderFn();
                    showToast("Data berhasil dihapus.");
                });
            }
        }
    });
}

// ============================================
// UI EVENT LISTENERS
// ============================================
export function initUIListeners() {
    document.getElementById('crud-modal-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (modalOnConfirm) modalOnConfirm();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('crud-modal');
            if (!modal.classList.contains('hidden')) closeModal();
        }
    });
}
// ============================================
// TRADISI — UI Utilities Module
// ============================================

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {boolean} isError - Whether this is an error toast
 */
export function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    const toastIcon = document.getElementById('toast-icon');

    toastText.innerText = message;
    if (isError) {
        toastIcon.className = "ph ph-x-circle text-rose-500 text-xl";
    } else {
        toastIcon.className = "ph ph-check-circle text-forest-600 text-xl";
    }

    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3000);
}

// Store modal confirm callback
let modalOnConfirm = null;

/**
 * Open the global CRUD modal
 */
export function openModal(title, bodyHtml, confirmText = "Simpan", onConfirm = null) {
    document.getElementById('crud-modal-title').innerText = title;
    document.getElementById('crud-modal-body').innerHTML = bodyHtml;
    document.getElementById('crud-modal-save-btn').innerText = confirmText;
    // Reset button style to default
    document.getElementById('crud-modal-save-btn').className = "px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-xl shadow-md transition-colors";
    modalOnConfirm = onConfirm;

    const modal = document.getElementById('crud-modal');
    const modalBox = document.getElementById('crud-modal-box');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modalBox.classList.remove('scale-95', 'opacity-0');
        modalBox.classList.add('scale-100', 'opacity-100');
    }, 10);
}

/**
 * Close the global CRUD modal
 */
export function closeModal() {
    const modal = document.getElementById('crud-modal');
    const modalBox = document.getElementById('crud-modal-box');
    modalBox.classList.remove('scale-100', 'opacity-100');
    modalBox.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 250);
}

/**
 * Show a confirm dialog using the modal
 */
export function showConfirmDialog(title, message, onConfirm) {
    const bodyHtml = `
        <div class="text-center py-2">
            <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                <i class="ph ph-warning text-rose-500 text-2xl"></i>
            </div>
            <h4 class="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2">${title}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">${message}</p>
        </div>
    `;
    openModal(title, bodyHtml, "Ya, Lanjutkan", () => {
        closeModal();
        if (onConfirm) onConfirm();
    });
    // Change confirm button style to danger
    const saveBtn = document.getElementById('crud-modal-save-btn');
    saveBtn.className = "px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors";
}

/**
 * Show loading spinner in content area
 */
export function showLoading(container) {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (el) {
        el.innerHTML = `
            <div class="flex flex-col justify-center items-center h-64 text-slate-400">
                <i class="ph ph-spinner animate-spin text-3xl text-forest-600 mb-2"></i>
                <p class="text-xs">Memuat konten...</p>
            </div>
        `;
    }
}

/**
 * Show empty state in container
 */
export function showEmptyState(container, icon = 'ph-file-text', message = 'Belum ada data.') {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (el) {
        el.innerHTML = `
            <div class="text-center py-8 text-xs text-slate-400">
                <i class="ph ${icon} text-3xl mb-2"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

/**
 * Generic delete helper for collection items
 */
export function deleteItem(collection, id, renderFn, items, dbService) {
    showConfirmDialog("Hapus Data", `Apakah Anda yakin ingin menghapus data ini?`, async () => {
        if (dbService && typeof dbService.softDeleteItem === 'function') {
            await dbService.softDeleteItem(collection, id);
            const idx = items.findIndex(i => i.id === id);
            if (idx !== -1) {
                items.splice(idx, 1);
            }
            renderFn();
            showToast("Data berhasil dihapus.");
        } else {
            const idx = items.findIndex(i => i.id === id);
            if (idx !== -1) {
                items.splice(idx, 1);
                dbService.saveData(collection, items).then(() => {
                    renderFn();
                    showToast("Data berhasil dihapus.");
                });
            }
        }
    });
}

/**
 * Initialize UI event listeners (modal form submit, keyboard shortcuts)
 */
export function initUIListeners() {
    // Modal form submit
    document.getElementById('crud-modal-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (modalOnConfirm) modalOnConfirm();
    });

    // Escape to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('crud-modal');
            if (!modal.classList.contains('hidden')) {
                closeModal();
            }
        }
    });
}

// Expose to window for inline onclick handlers in HTML templates
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.showConfirmDialog = showConfirmDialog;
