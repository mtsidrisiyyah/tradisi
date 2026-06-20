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
