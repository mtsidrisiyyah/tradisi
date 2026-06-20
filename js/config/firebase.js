// ============================================
// TRADISI — Firebase Configuration Module
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Default Firebase config
let firebaseConfig = {
    apiKey: "AIzaSyBKM5MkbbskFzq8z3gI8hrIeHKZ4iN0lI4",
    authDomain: "tradisi-e0a51.firebaseapp.com",
    databaseURL: "https://tradisi-e0a51-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tradisi-e0a51",
    storageBucket: "tradisi-e0a51.firebasestorage.app",
    messagingSenderId: "1096495313079",
    appId: "1:1096495313079:web:0e01fb7684cb4c56735d32"
};

// Override from external config if available
if (typeof __firebase_config !== 'undefined') {
    try {
        const parsedConfig = JSON.parse(__firebase_config);
        firebaseConfig = { ...firebaseConfig, ...parsedConfig };
    } catch (e) {
        console.warn("Gagal parsing __firebase_config, menggunakan config default:", e);
    }
}

// Validate Firebase configuration
const isFirebaseConfigured = firebaseConfig &&
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "ISI_API_KEY_ANDA" &&
    !firebaseConfig.apiKey.startsWith("ISI_") &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "ISI_PROJECT_ID_ANDA";

// Preview environment detection
const isPreviewEnv = typeof __app_id !== 'undefined';
const appId = isPreviewEnv ? __app_id : 'tradisi-app';

// Initialize Firebase or fallback to mock
let app = null;
let auth = null;
let db = null;
let useMockDb = true;

if (isFirebaseConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        useMockDb = false;
        console.log("✅ Firebase berhasil diinisialisasi (Project:", firebaseConfig.projectId + ").");
    } catch (err) {
        console.error("❌ Firebase init gagal, jatuh ke LocalStorage:", err);
        useMockDb = true;
    }
} else {
    console.log("⚠️ Menggunakan LocalStorage Mock Database (Firebase belum terkonfigurasi dengan benar).");
}

// Path helpers
export function getUserDocPath(uid) {
    return isPreviewEnv ? `artifacts/${appId}/users/${uid}/profile/data` : `users/${uid}`;
}

export function getCollectionPath(collectionName) {
    return isPreviewEnv
        ? `artifacts/${appId}/collections/${collectionName}`
        : `collections/${collectionName}`;
}

export { app, auth, db, useMockDb, isFirebaseConfigured, isPreviewEnv, appId };
