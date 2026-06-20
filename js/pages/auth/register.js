// ============================================
// TRADISI — Pendaftaran Akun Page Module (Neumorphic)
// ============================================
import { register, getFirebaseAuthMessage } from '../../services/auth.service.js';

export function render(container) {
    container.innerHTML = `
        <!-- Form Header -->
        <div class="mb-6 text-center fade-in">
            <div class="inline-flex p-3 bg-[#e0e5ec] dark:bg-[#2a2b45] rounded-full neu-raised-sm mb-4">
                <i class="ph ph-user-plus text-2xl text-[#6c63ff]"></i>
            </div>
            <h2 class="text-xl font-bold text-[#44476a] dark:text-[#c8c9e0] font-display">Daftar Akun Baru</h2>
            <p class="text-sm text-[#7a7d9c] mt-1">Lengkapi formulir pendaftaran di bawah ini</p>
        </div>

        <!-- Neumorphic Register Form -->
        <form id="register-form" class="neu-card space-y-5 fade-in">
            <div>
                <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">Nama Lengkap</label>
                <input type="text" id="reg-nama" required class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="Contoh: Ir. Hermawan, M.Pd.">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">NIP / NUPTK</label>
                    <input type="text" id="reg-nip" required class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="1975...">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">Nomor HP</label>
                    <input type="tel" id="reg-hp" required class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="08...">
                </div>
            </div>

            <div>
                <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">Mata Pelajaran Utama</label>
                <input type="text" id="reg-mapel" required class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="Contoh: Informatika, Fikih, dll.">
            </div>

            <div>
                <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">Email</label>
                <input type="email" id="reg-email" required class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="guru@idrisiyyah.sch.id">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">Password</label>
                    <input type="password" id="reg-password" required class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="Min. 8 karakter">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-[#44476a] dark:text-[#a0a2c0] mb-2 uppercase tracking-wider pl-1">Konfirmasi</label>
                    <input type="password" id="reg-confirm" required class="neu-input w-full px-4 py-3.5 rounded-2xl text-sm text-[#44476a] dark:text-[#c8c9e0] placeholder:text-[#7a7d9c] outline-none" placeholder="Ulangi password">
                </div>
            </div>

            <div id="reg-error" class="text-[#f44336] text-xs hidden bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30 p-3 rounded-2xl"></div>

            <div class="flex justify-center pt-2">
                <button type="submit" id="reg-btn" class="neu-btn px-10 py-4 rounded-2xl font-bold text-[#6c63ff] text-sm flex items-center justify-center gap-2">
                    <i class="ph ph-user-plus text-base"></i>
                    <span>Daftar Sekarang</span>
                </button>
            </div>
        </form>

        <!-- Footer -->
        <div class="mt-6 text-center fade-in">
            <p class="text-xs text-[#7a7d9c]">
                Sudah punya akun? <button id="btn-show-login" class="text-[#6c63ff] font-bold hover:underline">Masuk</button>
            </p>
        </div>
    `;

    // Attach form listener
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nama = document.getElementById('reg-nama').value.trim();
        const nip = document.getElementById('reg-nip').value.trim();
        const hp = document.getElementById('reg-hp').value.trim();
        const mapel = document.getElementById('reg-mapel').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;
        const errDiv = document.getElementById('reg-error');
        const btn = document.getElementById('reg-btn');

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

        btn.innerHTML = `<i class="ph ph-spinner animate-spin text-base mr-2"></i> Memproses...`;
        btn.disabled = true;

        try {
            await register(email, password, { nama, nip, hp, mapel });
            window.showToast("Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan administrator.");
            if (window.showLoginForm) window.showLoginForm();
        } catch (error) {
            console.error("Registrasi gagal:", error);
            errDiv.innerText = getFirebaseAuthMessage(error.code, error.message);
            errDiv.classList.remove('hidden');
            btn.innerHTML = `<i class="ph ph-user-plus text-base mr-2"></i><span>Daftar Sekarang</span>`;
            btn.disabled = false;
        }
    });

    document.getElementById('btn-show-login').addEventListener('click', () => {
        if (window.showLoginForm) window.showLoginForm();
    });
}
// ============================================
// TRADISI — Pendaftaran Akun Page Module
// ============================================
import { register, getFirebaseAuthMessage } from '../../services/auth.service.js';

export function render(container) {
    container.innerHTML = `
        <!-- Form Header -->
        <div class="mb-6 fade-in">
            <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">Daftar Akun Baru</h2>
            <p class="text-sm text-stone-500 dark:text-stone-400 mt-1">Lengkapi formulir pendaftaran di bawah ini</p>
        </div>

        <!-- Register Form -->
        <form id="register-form" class="space-y-4 fade-in">
            <div>
                <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
                <input type="text" id="reg-nama" required class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="Contoh: Ir. Hermawan, M.Pd.">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">NIP / NUPTK</label>
                    <input type="text" id="reg-nip" required class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="1975...">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">Nomor HP</label>
                    <input type="tel" id="reg-hp" required class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="08...">
                </div>
            </div>

            <div>
                <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">Mata Pelajaran Utama</label>
                <input type="text" id="reg-mapel" required class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="Contoh: Informatika, Fikih, dll.">
            </div>

            <div>
                <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">Email</label>
                <input type="email" id="reg-email" required class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="guru@idrisiyyah.sch.id">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">Password</label>
                    <input type="password" id="reg-password" required class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="Min. 8 karakter">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 uppercase tracking-wide">Konfirmasi</label>
                    <input type="password" id="reg-confirm" required class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 outline-none text-stone-800 dark:text-stone-200 text-sm placeholder:text-stone-400" placeholder="Ulangi password">
                </div>
            </div>

            <div id="reg-error" class="text-red-600 dark:text-red-400 text-xs hidden bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 p-3 rounded-xl"></div>

            <button type="submit" id="reg-btn" class="w-full bg-forest-700 hover:bg-forest-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-forest-700/20 active:scale-[0.98] flex justify-center items-center text-sm">
                <span>Daftar Sekarang</span>
            </button>
        </form>

        <!-- Footer -->
        <div class="mt-6 text-center fade-in">
            <p class="text-xs text-stone-400">
                Sudah punya akun? <button id="btn-show-login" class="text-forest-600 dark:text-forest-400 font-bold hover:underline">Masuk</button>
            </p>
        </div>
    `;

    // Attach form listener
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nama = document.getElementById('reg-nama').value.trim();
        const nip = document.getElementById('reg-nip').value.trim();
        const hp = document.getElementById('reg-hp').value.trim();
        const mapel = document.getElementById('reg-mapel').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;
        const errDiv = document.getElementById('reg-error');
        const btn = document.getElementById('reg-btn');

        errDiv.classList.add('hidden');

        // Validation
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

        btn.innerHTML = `<i class="ph ph-spinner animate-spin text-base mr-2"></i> Memproses...`;
        btn.disabled = true;

        try {
            await register(email, password, { nama, nip, hp, mapel });
            window.showToast("Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan administrator.");
            // Go back to login
            if (window.showLoginForm) window.showLoginForm();
        } catch (error) {
            console.error("Registrasi gagal:", error);
            errDiv.innerText = getFirebaseAuthMessage(error.code, error.message);
            errDiv.classList.remove('hidden');
            btn.innerHTML = `<span>Daftar Sekarang</span>`;
            btn.disabled = false;
        }
    });

    document.getElementById('btn-show-login').addEventListener('click', () => {
        if (window.showLoginForm) window.showLoginForm();
    });
}
