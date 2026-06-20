// ============================================
// TRADISI — Utility Helpers Module
// ============================================

/**
 * Time-based greeting (Indonesian)
 */
export function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
}

/**
 * Format date to Indonesian long format
 * e.g., "Jumat, 20 Juni 2026"
 */
export function formatTanggalIndonesia(dateStr) {
    const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const d = dateStr ? new Date(dateStr) : new Date();
    return `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Get Indonesian day name from Date
 */
export function getHariIndonesia(date) {
    const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const d = date instanceof Date ? date : new Date();
    return hari[d.getDay()];
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
export function getTodayStr() {
    return new Date().toISOString().substring(0, 10);
}

/**
 * Generate unique ID with optional prefix
 */
export function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Debounce function — delays execution until after wait ms of inactivity
 */
export function debounce(fn, wait = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), wait);
    };
}

/**
 * Update live clock elements on page
 */
export function updateClock() {
    const now = new Date();
    const jam = String(now.getHours()).padStart(2, '0');
    const menit = String(now.getMinutes()).padStart(2, '0');
    const detik = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${jam}:${menit}:${detik}`;
    const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const dateStr = `${hari[now.getDay()]}, ${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()}`;

    // Topbar clock
    const clockEl = document.getElementById('topbar-clock');
    if (clockEl) clockEl.textContent = timeStr;
    const dateEl = document.getElementById('topbar-date');
    if (dateEl) dateEl.textContent = dateStr;

    // Dashboard clock
    const dashClock = document.getElementById('dashboard-clock');
    if (dashClock) dashClock.textContent = timeStr;

    // Login page clock
    const loginClock = document.getElementById('login-clock');
    if (loginClock) loginClock.textContent = timeStr;
    const loginDate = document.getElementById('login-date');
    if (loginDate) loginDate.textContent = `· ${dateStr}`;
}
