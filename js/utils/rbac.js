// ============================================
// TRADISI — Role-Based Access Control (RBAC) Module
// ============================================

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN_MADRASAH: 'admin_madrasah',
    KEPALA_MADRASAH: 'kepala_madrasah',
    OPERATOR: 'operator',
    WAKA_KURIKULUM: 'waka_kurikulum',
    WAKA_KESISWAAN: 'waka_kesiswaan',
    GURU: 'guru',
    WALI_KEMAS: 'wali_kelas',
    PEMBINA_EKSKUL: 'pembina_ekskul'
};

// Maps roles to human readable labels
export const ROLE_LABELS = {
    'super_admin': 'Super Admin',
    'admin_madrasah': 'Admin Madrasah',
    'kepala_madrasah': 'Kepala Madrasah',
    'operator': 'Operator',
    'waka_kurikulum': 'Waka Kurikulum',
    'waka_kesiswaan': 'Waka Kesiswaan',
    'guru': 'Guru / Pendidik',
    'wali_kelas': 'Wali Kelas',
    'pembina_ekskul': 'Pembina Ekskul'
};

// Allowed roles for each page
const pageAccessMatrix = {
    'Dashboard': ['super_admin', 'admin_madrasah', 'kepala_madrasah', 'operator', 'waka_kurikulum', 'waka_kesiswaan', 'guru', 'wali_kelas', 'pembina_ekskul'],
    'Pengaturan Madrasah': ['super_admin', 'admin_madrasah'],
    'Profil Saya': ['super_admin', 'admin_madrasah', 'kepala_madrasah', 'operator', 'waka_kurikulum', 'waka_kesiswaan', 'guru', 'wali_kelas', 'pembina_ekskul'],
    'Panduan Kurikulum': ['super_admin', 'admin_madrasah', 'kepala_madrasah', 'operator', 'waka_kurikulum', 'waka_kesiswaan', 'guru', 'wali_kelas', 'pembina_ekskul'],
    
    // Data Master
    'Data Siswa': ['super_admin', 'admin_madrasah', 'operator', 'kepala_madrasah', 'waka_kesiswaan'],
    'Data Guru': ['super_admin', 'admin_madrasah', 'operator', 'kepala_madrasah', 'waka_kurikulum'],
    'Mata Pelajaran': ['super_admin', 'admin_madrasah', 'operator', 'kepala_madrasah', 'waka_kurikulum'],
    'Data Kelas': ['super_admin', 'admin_madrasah', 'operator', 'kepala_madrasah', 'waka_kurikulum'],
    'Rombongan Belajar': ['super_admin', 'admin_madrasah', 'operator', 'kepala_madrasah', 'waka_kurikulum', 'waka_kesiswaan'],
    'Jadwal Pelajaran': ['super_admin', 'admin_madrasah', 'operator', 'guru', 'kepala_madrasah'],
    'Kalender Pendidikan': ['super_admin', 'admin_madrasah', 'operator', 'guru', 'kepala_madrasah', 'waka_kurikulum'],
    
    // Administrasi KBM
    'Absensi Siswa': ['super_admin', 'admin_madrasah', 'guru', 'wali_kelas'],
    'Jurnal Agenda Guru': ['super_admin', 'admin_madrasah', 'guru'],
    'Penilaian Siswa': ['super_admin', 'admin_madrasah', 'guru'],
    
    // Perangkat Ajar
    'Cover Administrasi': ['super_admin', 'admin_madrasah', 'guru'],
    'Program Tahunan': ['super_admin', 'admin_madrasah', 'guru', 'waka_kurikulum'],
    'Program Semester': ['super_admin', 'admin_madrasah', 'guru', 'waka_kurikulum'],
    'Alur Tujuan Pembelajaran': ['super_admin', 'admin_madrasah', 'guru', 'waka_kurikulum'],
    'Modul Ajar': ['super_admin', 'admin_madrasah', 'guru', 'waka_kurikulum'],
    'Bahan Ajar': ['super_admin', 'admin_madrasah', 'guru'],
    'Lembar Kerja Peserta Didik': ['super_admin', 'admin_madrasah', 'guru'],
    
    // Asesmen
    'Program Asesmen': ['super_admin', 'admin_madrasah', 'guru', 'waka_kurikulum'],
    'Kriteria Ketercapaian Tujuan Pembelajaran': ['super_admin', 'admin_madrasah', 'guru', 'waka_kurikulum'],
    'Bank Soal': ['super_admin', 'admin_madrasah', 'guru'],
    'Kisi-Kisi Soal': ['super_admin', 'admin_madrasah', 'guru'],
    'Analisis Butir Soal': ['super_admin', 'admin_madrasah', 'guru'],
    'Rapor Siswa': ['super_admin', 'admin_madrasah', 'kepala_madrasah', 'waka_kurikulum', 'guru', 'wali_kelas'],
    
    // Settings
    'Manajemen Akses': ['super_admin', 'admin_madrasah'],
    'Penugasan Guru': ['super_admin', 'admin_madrasah', 'operator', 'kepala_madrasah', 'waka_kurikulum'],
    'Supervisi Akademik': ['super_admin', 'admin_madrasah', 'kepala_madrasah', 'waka_kurikulum', 'guru'],
    'Kesiswaan & BK': ['super_admin', 'admin_madrasah', 'kepala_madrasah', 'waka_kesiswaan', 'pembina_ekskul', 'guru', 'wali_kelas'],
    'Generator Administrasi': ['super_admin', 'admin_madrasah', 'operator', 'guru', 'kepala_madrasah', 'waka_kurikulum']
};

/**
 * Checks if a role is authorized to access a specific page
 * @param {string} role - The user's active role
 * @param {string} pageTitle - The page name
 * @returns {boolean}
 */
export function canAccessPage(role, pageTitle) {
    // If no access configuration exists for this page, deny by default
    if (!pageAccessMatrix[pageTitle]) return false;
    
    // Super admin can access anything
    if (role === ROLES.SUPER_ADMIN) return true;
    
    return pageAccessMatrix[pageTitle].includes(role);
}

/**
 * Get pages allowed for a specific role
 * @param {string} role - User role
 * @returns {string[]}
 */
export function getPagesForRole(role) {
    if (role === ROLES.SUPER_ADMIN) {
        return Object.keys(pageAccessMatrix);
    }
    return Object.keys(pageAccessMatrix).filter(page => pageAccessMatrix[page].includes(role));
}

/**
 * Check if the active user profile has a specific role
 * @param {object} profile - User profile document
 * @param {string} role - Role code to check
 * @returns {boolean}
 */
export function hasRole(profile, role) {
    if (!profile || !profile.roles) return false;
    return profile.roles.includes(role);
}
