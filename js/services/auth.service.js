// ============================================
// TRADISI — Authentication Service Module
// ============================================
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, signInWithCustomToken, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth, useMockDb, isFirebaseConfigured } from '../config/firebase.js';
import { dbService } from './db.service.js';

// Global user state
let currentUser = null;
let userProfile = { nama: "Guru Pendidik", nip: "-", mapel: "-", roles: ["guru"], activeRole: "guru" };

/**
 * Firebase auth error message translator
 */
function getFirebaseAuthMessage(code, fallback) {
    const messages = {
        'auth/wrong-password': 'Kata sandi salah. Silakan coba lagi.',
        'auth/user-not-found': 'Akun dengan email ini tidak ditemukan.',
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/user-disabled': 'Akun ini telah dinonaktifkan.',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
        'auth/network-request-failed': 'Gagal terhubung ke server. Periksa koneksi internet Anda.',
        'auth/invalid-credential': 'Email atau kata sandi salah.',
        'auth/invalid-login-credentials': 'Email atau kata sandi salah.',
        'auth/email-already-in-use': 'Alamat email ini sudah terdaftar oleh pengguna lain.'
    };
    return messages[code] || fallback || 'Terjadi kesalahan saat login.';
}

/**
 * Handle login — supports mock, anonymous, custom token, and email/password
 */
async function login(email, password) {
    if (useMockDb) {
        const profiles = await dbService.getData('profiles');
        const emailLower = (email || '').toLowerCase().trim();
        
        // Find matching profile by email
        const found = profiles.find(p => p.email && p.email.toLowerCase().trim() === emailLower);
        
        if (found) {
            if (found.status === 'menunggu_persetujuan') {
                throw { code: 'auth/user-disabled', message: 'Akun Anda sedang menunggu persetujuan administrator.' };
            }
            if (found.status === 'nonaktif') {
                throw { code: 'auth/user-disabled', message: 'Akun Anda telah dinonaktifkan.' };
            }
            currentUser = { uid: found.id, email: found.email };
            userProfile = { ...found };
            // Ensure role fields always present
            if (!userProfile.roles || !userProfile.roles.length) userProfile.roles = ['guru'];
            if (!userProfile.activeRole) userProfile.activeRole = userProfile.roles[0] || 'guru';
            if (!userProfile.status) userProfile.status = 'aktif';
            return { user: currentUser, profile: userProfile };
        }
        
        // Default demo-user fallback
        if (emailLower === 'demo@tradisi.app' || !email) {
            const demo = profiles.find(p => p.id === 'demo-user') || { 
                id: 'demo-user', 
                email: 'demo@tradisi.app', 
                nama: "Ir. Hermawan, M.Pd.", 
                nip: "197508212005011002", 
                mapel: "Informatika", 
                roles: ["super_admin", "guru"], 
                activeRole: "super_admin", 
                status: "aktif" 
            };
            currentUser = { uid: demo.id, email: demo.email };
            userProfile = { ...demo };
            return { user: currentUser, profile: userProfile };
        }

        throw { code: 'auth/user-not-found', message: 'Akun dengan email ini tidak ditemukan.' };
    }

    // Firebase mode
    const isPreviewEnv = typeof __app_id !== 'undefined';

    if (isPreviewEnv && typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
    } else if (!email && !password) {
        await signInAnonymously(auth);
    } else {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        
        // Load profile and verify status immediately
        const profile = await dbService.getProfile(credential.user.uid);
        if (profile) {
            // Safety net: ensure role fields
            if (!profile.roles || !profile.roles.length) profile.roles = ['guru'];
            if (!profile.activeRole) profile.activeRole = profile.roles[0] || 'guru';
            if (!profile.status) profile.status = 'aktif';
            
            if (profile.status === 'menunggu_persetujuan') {
                await signOut(auth);
                throw { code: 'auth/user-disabled', message: 'Akun Anda sedang menunggu persetujuan administrator.' };
            }
            if (profile.status === 'nonaktif') {
                await signOut(auth);
                throw { code: 'auth/user-disabled', message: 'Akun Anda telah dinonaktifkan.' };
            }
            
            // Set profile immediately so onAuthStateChanged has it
            userProfile = profile;
            currentUser = credential.user;
        }
    }

    // onAuthStateChanged will handle the rest (including auto-promote)
    return { user: auth.currentUser };
}

/**
 * Handle user registration
 */
async function register(email, password, profileData) {
    if (useMockDb) {
        const profiles = await dbService.getData('profiles');
        const emailLower = (email || '').toLowerCase().trim();
        const existing = profiles.find(p => p.email && p.email.toLowerCase().trim() === emailLower);
        
        if (existing) {
            throw { code: 'auth/email-already-in-use', message: 'Alamat email ini sudah terdaftar oleh pengguna lain.' };
        }
        
        const newProfile = {
            id: 'u_' + Date.now(),
            email: emailLower,
            status: 'menunggu_persetujuan',
            roles: ['guru'],
            activeRole: 'guru',
            createdAt: new Date().toISOString(),
            ...profileData
        };
        
        profiles.push(newProfile);
        await dbService.saveData('profiles', profiles);
        return { user: { uid: newProfile.id, email: newProfile.email }, profile: newProfile };
    } else {
        const { createUserWithEmailAndPassword, sendEmailVerification } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        
        try {
            await sendEmailVerification(credential.user);
        } catch (err) {
            console.warn("Gagal mengirim email verifikasi:", err);
        }

        const profile = {
            id: credential.user.uid,
            email: email,
            status: 'menunggu_persetujuan',
            roles: ['guru'],
            activeRole: 'guru',
            createdAt: new Date().toISOString(),
            ...profileData
        };

        await dbService.saveProfile(credential.user.uid, profile);
        return { user: credential.user, profile };
    }
}

/**
 * Handle logout
 */
async function logout() {
    if (auth) {
        try {
            await signOut(auth);
            console.log("User berhasil logout dari Firebase.");
        } catch (e) {
            console.error("SignOut gagal:", e);
        }
    }
    currentUser = null;
    userProfile = { nama: "Guru Pendidik", nip: "-", mapel: "-", roles: ["guru"], activeRole: "guru" };
}

/**
 * Set up auth state listener — calls onLogin/onLogout callbacks
 */
function initAuthListener(onLogin, onLogout) {
    if (!useMockDb && auth) {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("Auth state: User login terdeteksi. UID:", user.uid, "Email:", user.email || "(anonim)");
                currentUser = user;
                try {
                    userProfile = await dbService.getProfile(user.uid);
                    
                    // Safety net: ensure profile always has roles, activeRole, and status
                    if (!userProfile.roles || !userProfile.roles.length) userProfile.roles = ['guru'];
                    if (!userProfile.activeRole) userProfile.activeRole = userProfile.roles[0] || 'guru';
                    if (!userProfile.status) userProfile.status = 'aktif';
                    
                    // Double check status block on auth state changes
                    if (userProfile.status === 'menunggu_persetujuan' || userProfile.status === 'nonaktif') {
                        await logout();
                        if (onLogout) onLogout();
                        return;
                    }
                } catch (e) {
                    console.warn("Gagal load profil user, gunakan default:", e);
                    userProfile = { nama: "Guru Pendidik", nip: "-", mapel: "-", roles: ["guru"], activeRole: "guru" };
                }
                if (onLogin) onLogin(currentUser, userProfile);
            } else {
                console.log("Auth state: Tidak ada user yang login.");
                currentUser = null;
                if (onLogout) onLogout();
            }
        });
    } else {
        console.log("Mode lokal aktif - auth state listener tidak diperlukan.");
    }
}

/**
 * Get current user
 */
function getCurrentUser() {
    return currentUser;
}

/**
 * Get current user profile
 */
function getUserProfile() {
    return userProfile;
}

/**
 * Set user profile (when updated from profile page)
 */
function setUserProfile(profile) {
    userProfile = profile;
}

export {
    login,
    register,
    logout,
    initAuthListener,
    getCurrentUser,
    getUserProfile,
    setUserProfile,
    getFirebaseAuthMessage,
    currentUser,
    userProfile
};
