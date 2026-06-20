// ============================================
// TRADISI — First-Time Super Admin Setup Page
// Supports: creating NEW account OR promoting EXISTING Firebase account
// ============================================
import { bootstrapSuperAdmin } from '../../services/db.service.js';
import { login } from '../../services/auth.service.js';

export function render(container) {
    container.innerHTML = `
        <!-- Setup Header -->
        <div class="mb-6 fade-in">
            <div class="flex items-center gap-3 mb-3">
                <div class="p-2.5 bg-amber-500/10 rounded-xl">
                    <i class="ph ph-shield-star text-2xl text-amber-600 dark:text-amber-400"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-stone-900 dark:text-stone-100">Setup Administrator Pertama</h2>
                    <p class="text-xs text-stone-500 dark:text-stone-400">Belum ada akun super admin. Buat sekarang untuk mengelola sistem.</p>
                </div>
            </div>
            <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <i class="ph ph-info mr-1"></i>
                Akun yang Anda buat akan memiliki <strong>akses penuh</strong> sebagai Super Administrator. Anda dapat mengelola pengguna, data master, dan seluruh konfigurasi sistem.
            </div>
        </div>

        <!-- Tab Buttons -->
        <div class="flex gap-2 mb-5 fade-in">
            <button id="tab-create" class="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all border-forest-600 bg-forest-600 text-white">
                <i class="ph ph-user-plus mr-1"></i> Buat Akun Baru
            </button>
            <button id="tab-promote" class="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-forest-500 hover:text-forest-600">
                <i class="ph ph-sign-in mr-1"></i> Pakai Akun yang Sudah Ada
            </button>
        </div>

        <!-- ========== CREATE NEW ACCOUNT FORM ========== -->
        <form id="setup-form" class="space-y-4 fade-in">
            <div>
                <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
                <input type="text" id="setup-nama" required class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="Contoh: Ir. Hermawan, M.Pd.">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">NIP / NUPTK</label>
                    <input type="text" id="setup-nip" required class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="1975...">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">Nomor HP</label>
                    <input type="tel" id="setup-hp" required class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="08...">
                </div>
            </div>

            <div>
                <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">Mata Pelajaran Utama</label>
                <input type="text" id="setup-mapel" required class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="Contoh: Informatika, Fikih, dll.">
            </div>

            <div>
                <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">Email Administrator</label>
                <input type="email" id="setup-email" required class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="admin@idrisiyyah.sch.id">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">Password</label>
                    <input type="password" id="setup-password" required minlength="8" class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="Min. 8 karakter">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">Konfirmasi</label>
                    <input type="password" id="setup-confirm" required minlength="8" class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="Ulangi password">
                </div>
            </div>

            <div id="setup-error" class="text-red-600 dark:text-red-400 text-xs hidden bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 p-3 rounded-xl"></div>

            <button type="submit" id="setup-btn" class="w-full bg-forest-700 hover:bg-forest-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-forest-700/20 active:scale-[0.98] flex justify-center items-center text-sm">
                <i class="ph ph-shield-check text-base mr-2"></i>
                <span>Buat Akun Super Admin</span>
            </button>
        </form>

        <!-- ========== PROMOTE EXISTING ACCOUNT FORM (hidden by default) ========== -->
        <form id="promote-form" class="space-y-4 fade-in hidden">
            <div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                <i class="ph ph-arrow-counter-clockwise mr-1"></i>
                Gunakan email &amp; password akun Firebase yang <strong>sudah terdaftar</strong>. Setelah berhasil masuk, akun Anda akan otomatis dipromosikan menjadi Super Administrator.
            </div>
            <div>
                <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">Email Akun Firebase</label>
                <input type="email" id="promote-email" required class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="email@yang-sudah-terdaftar.com">
            </div>
            <div>
                <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">Password</label>
                <input type="password" id="promote-password" required class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="Masukkan password akun Firebase">
            </div>
            <div id="promote-error" class="text-red-600 dark:text-red-400 text-xs hidden bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 p-3 rounded-xl"></div>
            <button type="submit" id="promote-btn" class="w-full bg-forest-700 hover:bg-forest-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-forest-700/20 active:scale-[0.98] flex justify-center items-center text-sm">
                <i class="ph ph-arrow-up text-base mr-2"></i>
                <span>Masuk &amp; Jadikan Super Admin</span>
            </button>
        </form>
    `;

    // ---- Tab switching ----
    const tabCreate = document.getElementById('tab-create');
    const tabPromote = document.getElementById('tab-promote');
    const setupForm = document.getElementById('setup-form');
    const promoteForm = document.getElementById('promote-form');

    tabCreate.addEventListener('click', () => {
        tabCreate.className = 'flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all border-forest-600 bg-forest-600 text-white';
        tabPromote.className = 'flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-forest-500 hover:text-forest-600';
        setupForm.classList.remove('hidden');
        promoteForm.classList.add('hidden');
    });

    tabPromote.addEventListener('click', () => {
        tabPromote.className = 'flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all border-forest-600 bg-forest-600 text-white';
        tabCreate.className = 'flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-forest-500 hover:text-forest-600';
        promoteForm.classList.remove('hidden');
        setupForm.classList.add('hidden');
    });

    // ---- CREATE NEW ACCOUNT form submit ----
    setupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nama = document.getElementById('setup-nama').value.trim();
        const nip = document.getElementById('setup-nip').value.trim();
        const hp = document.getElementById('setup-hp').value.trim();
        const mapel = document.getElementById('setup-mapel').value.trim();
        const email = document.getElementById('setup-email').value.trim();
        const password = document.getElementById('setup-password').value;
        const confirm = document.getElementById('setup-confirm').value;
        const errDiv = document.getElementById('setup-error');
        const btn = document.getElementById('setup-btn');

        errDiv.classList.add('hidden');

        if (password.length < 8) {
            errDiv.innerText = "Sandi minimal harus terdiri dari 8 karakter.";
            errDiv.classList.remove('hidden');
            return;
        }
        if (password !== confirm) {
            errDiv.innerText = "Konfirmasi sandi tidak cocok.";
            errDiv.classList.remove('hidden');
            return;
        }

        btn.innerHTML = `<i class="ph ph-spinner animate-spin text-base mr-2"></i> Membuat akun administrator...`;
        btn.disabled = true;

        try {
            const { createUserWithEmailAndPassword, sendEmailVerification } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
            const { auth } = await import('../../config/firebase.js');

            const credential = await createUserWithEmailAndPassword(auth, email, password);

            try { await sendEmailVerification(credential.user); } catch (vErr) {
                console.warn("Gagal mengirim email verifikasi:", vErr);
            }

            await bootstrapSuperAdmin(credential.user.uid, email, { nama, nip, hp, mapel });

            if (window.showToast) window.showToast("Akun Super Admin berhasil dibuat! Silakan login.");
            if (window.showLoginForm) window.showLoginForm();
        } catch (error) {
            console.error("Setup super admin gagal:", error);
            const messages = {
                'auth/email-already-in-use': 'Email ini sudah terdaftar. Gunakan tab "Pakai Akun yang Sudah Ada" untuk mempromosikannya.',
                'auth/invalid-email': 'Format email tidak valid.',
                'auth/weak-password': 'Password terlalu lemah. Gunakan minimal 8 karakter.',
                'auth/network-request-failed': 'Gagal terhubung ke server. Periksa koneksi internet Anda.'
            };
            errDiv.innerText = messages[error.code] || error.message || 'Terjadi kesalahan saat membuat akun.';
            errDiv.classList.remove('hidden');
            btn.innerHTML = `<i class="ph ph-shield-check text-base mr-2"></i><span>Buat Akun Super Admin</span>`;
            btn.disabled = false;
        }
    });

    // ---- PROMOTE EXISTING ACCOUNT form submit ----
    promoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('promote-email').value.trim();
        const password = document.getElementById('promote-password').value;
        const errDiv = document.getElementById('promote-error');
        const btn = document.getElementById('promote-btn');

        errDiv.classList.add('hidden');

        btn.innerHTML = `<i class="ph ph-spinner animate-spin text-base mr-2"></i> Memproses...`;
        btn.disabled = true;

        try {
            // Login with existing Firebase account
            // After login, onAuthStateChanged in app.js will detect no super admin
            // and automatically promote this user to super_admin
            await login(email, password);
            // onAuthStateChanged handles the promotion and UI transition
        } catch (error) {
            console.error("Login promosi gagal:", error);
            const messages = {
                'auth/wrong-password': 'Kata sandi salah. Silakan coba lagi.',
                'auth/user-not-found': 'Akun dengan email ini tidak ditemukan di Firebase.',
                'auth/invalid-email': 'Format email tidak valid.',
                'auth/invalid-credential': 'Email atau password salah.',
                'auth/invalid-login-credentials': 'Email atau password salah.',
                'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
                'auth/network-request-failed': 'Gagal terhubung. Periksa koneksi internet.'
            };
            errDiv.innerText = messages[error.code] || error.message || 'Gagal login ke Firebase.';
            errDiv.classList.remove('hidden');
            btn.innerHTML = `<i class="ph ph-arrow-up text-base mr-2"></i><span>Masuk &amp; Jadikan Super Admin</span>`;
            btn.disabled = false;
        }
    });
}
