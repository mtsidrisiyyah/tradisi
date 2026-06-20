// ============================================
// TRADISI — First-Time Super Admin Setup Page (Neumorphic)
// Supports: creating NEW account OR promoting EXISTING Firebase account
// ============================================
import { bootstrapSuperAdmin } from '../../services/db.service.js';
import { login } from '../../services/auth.service.js';

export function render(container) {
    container.innerHTML = `
        <!-- Setup Header -->
        <div class="mb-6 text-center fade-in">
            <div class="inline-flex p-3 bg-[#e0e5ec] dark:bg-[#2a2b45] rounded-full neu-raised-sm mb-4">
                <i class="ph ph-shield-star text-2xl text-[#6c63ff]"></i>
            </div>
            <h2 class="text-xl font-bold text-[#44476a] dark:text-[#c8c9e0] font-display">Setup Administrator Pertama</h2>
            <p class="text-xs text-[#7a7d9c] mt-1.5 max-w-sm mx-auto">Belum ada akun super admin. Buat sekarang atau gunakan akun Firebase yang sudah ada.</p>
        </div>

        <!-- Neumorphic Info Box -->
        <div class="neu-info-box mb-5 fade-in">
            <i class="ph ph-info text-[#6c63ff] text-lg flex-shrink-0 mt-0.5"></i>
            <p class="text-xs text-[#44476a] dark:text-[#a0a2c0] leading-relaxed">
                Akun yang Anda buat akan memiliki <strong>akses penuh</strong> sebagai Super Administrator.
            </p>
        </div>

        <!-- Neumorphic Tab Buttons -->
        <div class="flex gap-3 mb-5 fade-in">
            <button id="tab-create" class="neu-tab neu-tab-active flex-1 py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5">
                <i class="ph ph-user-plus"></i> Buat Baru
            </button>
            <button id="tab-promote" class="neu-tab flex-1 py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5">
                <i class="ph ph-sign-in"></i> Akun Lama
            </button>
        </div>

        <!-- ========== CREATE NEW ACCOUNT FORM ========== -->
        <form id="setup-form" class="neu-card space-y-4 fade-in">
            <div>
                <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">Nama Lengkap</label>
                <input type="text" id="setup-nama" required class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="Contoh: Ir. Hermawan, M.Pd.">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">NIP / NUPTK</label>
                    <input type="text" id="setup-nip" required class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="1975...">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">Nomor HP</label>
                    <input type="tel" id="setup-hp" required class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="08...">
                </div>
            </div>

            <div>
                <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">Mata Pelajaran</label>
                <input type="text" id="setup-mapel" required class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="Contoh: Informatika">
            </div>

            <div>
                <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">Email Administrator</label>
                <input type="email" id="setup-email" required class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="admin@idrisiyyah.sch.id">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">Password</label>
                    <input type="password" id="setup-password" required minlength="8" class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="Min. 8 karakter">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">Konfirmasi</label>
                    <input type="password" id="setup-confirm" required minlength="8" class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="Ulangi password">
                </div>
            </div>

            <div id="setup-error" class="text-[#f44336] text-xs hidden bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30 p-3 rounded-2xl"></div>

            <div class="flex justify-center pt-2">
                <button type="submit" id="setup-btn" class="neu-btn px-8 py-4 rounded-2xl font-bold text-[#6c63ff] text-sm flex items-center justify-center gap-2">
                    <i class="ph ph-shield-check text-base"></i>
                    <span>Buat Super Admin</span>
                </button>
            </div>
        </form>

        <!-- ========== PROMOTE EXISTING ACCOUNT FORM ========== -->
        <form id="promote-form" class="neu-card space-y-4 fade-in hidden">
            <div class="neu-info-box">
                <i class="ph ph-arrow-counter-clockwise text-[#6c63ff] text-lg flex-shrink-0 mt-0.5"></i>
                <p class="text-xs text-[#44476a] dark:text-[#a0a2c0] leading-relaxed">
                    Gunakan email & password akun Firebase yang <strong>sudah terdaftar</strong>. Akun akan otomatis dipromosikan menjadi Super Admin.
                </p>
            </div>
            <div>
                <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">Email Akun Firebase</label>
                <input type="email" id="promote-email" required class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="email@yang-sudah-terdaftar.com">
            </div>
            <div>
                <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">Password</label>
                <input type="password" id="promote-password" required class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="Masukkan password akun Firebase">
            </div>
            <div id="promote-error" class="text-[#f44336] text-xs hidden bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30 p-3 rounded-2xl"></div>
            <div class="flex justify-center pt-2">
                <button type="submit" id="promote-btn" class="neu-btn px-8 py-4 rounded-2xl font-bold text-[#6c63ff] text-sm flex items-center justify-center gap-2">
                    <i class="ph ph-arrow-up text-base"></i>
                    <span>Masuk & Jadikan Super Admin</span>
                </button>
            </div>
        </form>
    `;

    // ---- Tab switching ----
    const tabCreate = document.getElementById('tab-create');
    const tabPromote = document.getElementById('tab-promote');
    const setupForm = document.getElementById('setup-form');
    const promoteForm = document.getElementById('promote-form');

    function setActiveTab(active, inactive) {
        active.classList.add('neu-tab-active');
        inactive.classList.remove('neu-tab-active');
    }

    tabCreate.addEventListener('click', () => {
        setActiveTab(tabCreate, tabPromote);
        setupForm.classList.remove('hidden');
        promoteForm.classList.add('hidden');
    });

    tabPromote.addEventListener('click', () => {
        setActiveTab(tabPromote, tabCreate);
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

        if (password.length < 8) { errDiv.innerText = "Sandi minimal 8 karakter."; errDiv.classList.remove('hidden'); return; }
        if (password !== confirm) { errDiv.innerText = "Konfirmasi sandi tidak cocok."; errDiv.classList.remove('hidden'); return; }

        btn.innerHTML = `<i class="ph ph-spinner animate-spin text-base mr-2"></i> Memproses...`;
        btn.disabled = true;

        try {
            const { createUserWithEmailAndPassword, sendEmailVerification } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
            const { auth } = await import('../../config/firebase.js');

            const credential = await createUserWithEmailAndPassword(auth, email, password);
            try { await sendEmailVerification(credential.user); } catch (vErr) { console.warn("Gagal kirim verifikasi:", vErr); }

            await bootstrapSuperAdmin(credential.user.uid, email, { nama, nip, hp, mapel });

            if (window.showToast) window.showToast("Akun Super Admin berhasil dibuat! Silakan login.");
            if (window.showLoginForm) window.showLoginForm();
        } catch (error) {
            console.error("Setup gagal:", error);
            const msgs = {
                'auth/email-already-in-use': 'Email sudah terdaftar. Gunakan tab "Akun Lama".',
                'auth/invalid-email': 'Format email tidak valid.',
                'auth/weak-password': 'Password terlalu lemah.',
                'auth/network-request-failed': 'Gagal terhubung ke server.'
            };
            errDiv.innerText = msgs[error.code] || error.message || 'Terjadi kesalahan.';
            errDiv.classList.remove('hidden');
            btn.innerHTML = `<i class="ph ph-shield-check text-base mr-2"></i><span>Buat Super Admin</span>`;
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
            await login(email, password);
        } catch (error) {
            console.error("Login promosi gagal:", error);
            const msgs = {
                'auth/wrong-password': 'Kata sandi salah.',
                'auth/user-not-found': 'Akun tidak ditemukan.',
                'auth/invalid-credential': 'Email atau password salah.',
                'auth/invalid-login-credentials': 'Email atau password salah.',
                'auth/too-many-requests': 'Terlalu banyak percobaan.',
                'auth/network-request-failed': 'Gagal terhubung.'
            };
            errDiv.innerText = msgs[error.code] || error.message || 'Gagal login.';
            errDiv.classList.remove('hidden');
            btn.innerHTML = `<i class="ph ph-arrow-up text-base mr-2"></i><span>Masuk & Jadikan Super Admin</span>`;
            btn.disabled = false;
        }
    });
}
