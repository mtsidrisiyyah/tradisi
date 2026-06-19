import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, signInWithCustomToken, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Firebase config template
        let firebaseConfig = {
            apiKey: "AIzaSyB3EUC_8nk4DARQIRTlnClRYjdDrIzN16s",
            authDomain: "tradisi-e0a51.firebaseapp.com",
            databaseURL: "https://tradisi-e0a51-default-rtdb.firebaseio.com",
            projectId: "tradisi-e0a51",
            storageBucket: "tradisi-e0a51.firebasestorage.app",
            messagingSenderId: "1096495313079",
            appId: "1:1096495313079:web:0e01fb7684cb4c56735d32"
        };

        if (typeof __firebase_config !== 'undefined') {
            try {
                const parsedConfig = JSON.parse(__firebase_config);
                firebaseConfig = { ...firebaseConfig, ...parsedConfig };
            } catch (e) {
                console.warn("Gagal parsing __firebase_config, menggunakan config default:", e);
            }
        }

        // Memeriksa apakah konfigurasi Firebase valid
        const isFirebaseConfigured = firebaseConfig &&
            firebaseConfig.apiKey &&
            firebaseConfig.apiKey !== "ISI_API_KEY_ANDA" &&
            !firebaseConfig.apiKey.startsWith("ISI_") &&
            firebaseConfig.projectId &&
            firebaseConfig.projectId !== "ISI_PROJECT_ID_ANDA";

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
            console.log("  Periksa: apiKey, authDomain, projectId, appId pada firebaseConfig.");
        }

        const isPreviewEnv = typeof __app_id !== 'undefined';
        const appId = isPreviewEnv ? __app_id : 'tradisi-app';

        const getUserDocPath = (uid) => {
            return isPreviewEnv ? `artifacts/${appId}/users/${uid}/profile/data` : `users/${uid}`;
        };

        // 3. STRUKTUR MENU & NAVIGASI
        const menuStructure = [
            {
                category: "Menu Utama",
                icon: "ph-house",
                items: ["Dashboard", "Pengaturan Madrasah", "Panduan Kurikulum", "Profil Saya"]
            },
            {
                category: "Data Master",
                icon: "ph-database",
                items: ["Data Siswa", "Jadwal Pelajaran", "Kalender Pendidikan"]
            },
            {
                category: "Administrasi KBM",
                icon: "ph-chalkboard-teacher",
                items: ["Absensi Siswa", "Jurnal Agenda Guru", "Penilaian Siswa"]
            },
            {
                category: "Perangkat Ajar",
                icon: "ph-folder-open",
                items: ["Cover Administrasi", "Program Tahunan", "Program Semester", "Alur Tujuan Pembelajaran", "Modul Ajar", "Bahan Ajar", "Lembar Kerja Peserta Didik"]
            },
            {
                category: "Asesmen",
                icon: "ph-exam",
                items: ["Program Asesmen", "Kriteria Ketercapaian Tujuan Pembelajaran", "Bank Soal", "Kisi-Kisi Soal", "Analisis Butir Soal"]
            }
        ];

        // 4. DATA SEEDING (LocalStorage Fallback)
        const SEED_DATA = {
            madrasah_settings: {
                nama: "MTs Idrisiyyah Tasikmalaya",
                kepala: "H. Ahmad Fauzian, M.Pd.",
                nipKepala: "197804152006041003",
                tahunAjaran: "2026/2027",
                semester: "Ganjil",
                alamat: "Jl. Raya Ciawi No. 12, Tasikmalaya",
                npsn: "20210855",
                nsm: "121132780001",
                akreditasi: "A",
                email: "info@mtsidrisiyyah.sch.id",
                telepon: "(0265) 323456",
                website: "https://mtsidrisiyyah.sch.id",
                yayasan: "Yayasan Idrisiyyah Tasikmalaya"
            },
            siswa: [
                { id: "s1", nisn: "0012435091", nama: "Ahmad Fauzi", kelas: "VII-A", jk: "L" },
                { id: "s2", nisn: "0012435092", nama: "Aisyah Putri Rahma", kelas: "VII-A", jk: "P" },
                { id: "s3", nisn: "0012435093", nama: "Budi Santoso", kelas: "VII-A", jk: "L" },
                { id: "s4", nisn: "0012435094", nama: "Citra Kirana", kelas: "VII-A", jk: "P" },
                { id: "s5", nisn: "0012435095", nama: "Dedi Wijaya", kelas: "VII-A", jk: "L" },
                { id: "s6", nisn: "0012435096", nama: "Farhan Alamsyah", kelas: "VII-B", jk: "L" },
                { id: "s7", nisn: "0012435097", nama: "Fatimah Azzahra", kelas: "VII-B", jk: "P" },
                { id: "s8", nisn: "0012435098", nama: "Gibran Al-Fariz", kelas: "VII-B", jk: "L" },
                { id: "s9", nisn: "0012435099", nama: "Hani Nuraini", kelas: "VII-B", jk: "P" },
                { id: "s10", nisn: "0012435100", nama: "Ihsan Kamil", kelas: "VIII-A", jk: "L" },
                { id: "s11", nisn: "0012435101", nama: "Jasmine Putri", kelas: "VII-A", jk: "P" },
                { id: "s12", nisn: "0012435102", nama: "Khairul Anam", kelas: "VII-A", jk: "L" },
                { id: "s13", nisn: "0012435103", nama: "Laila Mardiana", kelas: "VII-B", jk: "P" },
                { id: "s14", nisn: "0012435104", nama: "Muhammad Rizki", kelas: "VII-B", jk: "L" },
                { id: "s15", nisn: "0012435105", nama: "Nabila Safira", kelas: "VII-B", jk: "P" },
                { id: "s16", nisn: "0012435106", nama: "Omar Hakim", kelas: "VIII-A", jk: "L" },
                { id: "s17", nisn: "0012435107", nama: "Putri Ayu Lestari", kelas: "VIII-A", jk: "P" },
                { id: "s18", nisn: "0012435108", nama: "Qasim Abdurrahman", kelas: "VIII-A", jk: "L" },
                { id: "s19", nisn: "0012435109", nama: "Raniah Dewi", kelas: "VIII-A", jk: "P" },
                { id: "s20", nisn: "0012435110", nama: "Syahrul Gunawan", kelas: "VIII-B", jk: "L" },
                { id: "s21", nisn: "0012435111", nama: "Tiara Permata", kelas: "VIII-B", jk: "P" },
                { id: "s22", nisn: "0012435112", nama: "Umar Faruq", kelas: "VIII-B", jk: "L" },
                { id: "s23", nisn: "0012435113", nama: "Vina Amelia", kelas: "VIII-B", jk: "P" },
                { id: "s24", nisn: "0012435114", nama: "Wahyu Hidayat", kelas: "VIII-B", jk: "L" },
                { id: "s25", nisn: "0012435115", nama: "Xena Ramadhani", kelas: "IX-A", jk: "P" },
                { id: "s26", nisn: "0012435116", nama: "Yusuf Maulana", kelas: "IX-A", jk: "L" },
                { id: "s27", nisn: "0012435117", nama: "Zahra Nabila", kelas: "IX-A", jk: "P" },
                { id: "s28", nisn: "0012435118", nama: "Abdul Malik", kelas: "IX-A", jk: "L" },
                { id: "s29", nisn: "0012435119", nama: "Bilqis Salsabila", kelas: "IX-B", jk: "P" },
                { id: "s30", nisn: "0012435120", nama: "Candra Dwi Putra", kelas: "IX-B", jk: "L" },
                { id: "s31", nisn: "0012435121", nama: "Dina Fitria", kelas: "IX-B", jk: "P" },
                { id: "s32", nisn: "0012435122", nama: "Eko Prasetyo", kelas: "IX-B", jk: "L" }
            ],
            absensi: [
                { id: "a1", kelas: "VII-A", tanggal: "2026-06-16", records: { "s1": "H", "s2": "H", "s3": "S", "s4": "H", "s5": "I", "s11": "H", "s12": "H" } },
                { id: "a2", kelas: "VII-A", tanggal: "2026-06-17", records: { "s1": "H", "s2": "H", "s3": "H", "s4": "A", "s5": "H", "s11": "H", "s12": "S" } },
                { id: "a3", kelas: "VII-A", tanggal: "2026-06-18", records: { "s1": "H", "s2": "H", "s3": "H", "s4": "H", "s5": "H", "s11": "I", "s12": "H" } },
                { id: "a4", kelas: "VII-A", tanggal: "2026-06-19", records: { "s1": "H", "s2": "H", "s3": "S", "s4": "H", "s5": "I" } },
                { id: "a5", kelas: "VII-B", tanggal: "2026-06-19", records: { "s6": "H", "s7": "H", "s8": "A", "s9": "H", "s13": "H", "s14": "H", "s15": "S" } },
                { id: "a6", kelas: "VIII-A", tanggal: "2026-06-19", records: { "s10": "H", "s16": "H", "s17": "H", "s18": "I", "s19": "H" } }
            ],
            jurnal: [
                { id: "j1", tanggal: "2026-06-16", kelas: "VII-A", jamKe: "1-2", mapel: "Informatika", materi: "Pengenalan Algoritma & Flowchart", kendala: "Beberapa siswa belum paham konsep loop", tindakLanjut: "Mengulang materi dengan simulasi visual Scratch" },
                { id: "j2", tanggal: "2026-06-16", kelas: "VII-B", jamKe: "3-4", mapel: "Informatika", materi: "Pengenalan HTML Dasar", kendala: "Listrik padam 15 menit di awal", tindakLanjut: "Lanjutkan di pertemuan berikutnya" },
                { id: "j3", tanggal: "2026-06-17", kelas: "VIII-A", jamKe: "1-2", mapel: "Informatika", materi: "Pemrograman Python: Variabel & Tipe Data", kendala: "-", tindakLanjut: "Lanjut ke percabangan (if-else)" },
                { id: "j4", tanggal: "2026-06-18", kelas: "VII-A", jamKe: "3-4", mapel: "Informatika", materi: "Struktur Logika Percabangan (if-else)", kendala: "Proyektor bermasalah", tindakLanjut: "Menggunakan modul ajar cetak" },
                { id: "j5", tanggal: "2026-06-18", kelas: "VII-B", jamKe: "5-6", mapel: "Informatika", materi: "Membuat Halaman Web Sederhana", kendala: "Siswa antusias, tidak ada kendala", tindakLanjut: "Tugas membuat halaman profil diri" },
                { id: "j6", tanggal: "2026-06-19", kelas: "VIII-A", jamKe: "1-2", mapel: "Informatika", materi: "Python: Perulangan for & while", kendala: "Beberapa siswa kesulitan logika perulangan bersarang", tindakLanjut: "Beri latihan tambahan & tutoring sebaya" },
                { id: "j7", tanggal: "2026-06-19", kelas: "VII-A", jamKe: "3-4", mapel: "Informatika", materi: "Latihan Soal Algoritma & Pseudocode", kendala: "-", tindakLanjut: "Ulangan harian minggu depan" },
                { id: "j8", tanggal: "2026-06-19", kelas: "VII-B", jamKe: "5-6", mapel: "Informatika", materi: "CSS Styling Dasar", kendala: "Koneksi internet lambat untuk demo online", tindakLanjut: "Gunakan file HTML lokal offline" }
            ],
            penilaian: [
                { id: "p1", kelas: "VII-A", mapel: "Informatika", siswaId: "s1", tugas: 90, ulangan: 85, uts: 88, uas: 90 },
                { id: "p2", kelas: "VII-A", mapel: "Informatika", siswaId: "s2", tugas: 95, ulangan: 92, uts: 90, uas: 94 },
                { id: "p3", kelas: "VII-A", mapel: "Informatika", siswaId: "s3", tugas: 75, ulangan: 70, uts: 80, uas: 78 },
                { id: "p4", kelas: "VII-A", mapel: "Informatika", siswaId: "s4", tugas: 88, ulangan: 85, uts: 84, uas: 86 },
                { id: "p5", kelas: "VII-A", mapel: "Informatika", siswaId: "s5", tugas: 80, ulangan: 78, uts: 82, uas: 80 },
                { id: "p6", kelas: "VII-A", mapel: "Informatika", siswaId: "s11", tugas: 92, ulangan: 88, uts: 91, uas: 90 },
                { id: "p7", kelas: "VII-A", mapel: "Informatika", siswaId: "s12", tugas: 70, ulangan: 65, uts: 72, uas: 68 },
                { id: "p8", kelas: "VII-B", mapel: "Informatika", siswaId: "s6", tugas: 85, ulangan: 80, uts: 82, uas: 83 },
                { id: "p9", kelas: "VII-B", mapel: "Informatika", siswaId: "s7", tugas: 93, ulangan: 90, uts: 88, uas: 92 },
                { id: "p10", kelas: "VII-B", mapel: "Informatika", siswaId: "s8", tugas: 78, ulangan: 72, uts: 75, uas: 76 },
                { id: "p11", kelas: "VIII-A", mapel: "Informatika", siswaId: "s10", tugas: 88, ulangan: 85, uts: 90, uas: 87 },
                { id: "p12", kelas: "VIII-A", mapel: "Informatika", siswaId: "s16", tugas: 95, ulangan: 92, uts: 94, uas: 93 },
                { id: "p13", kelas: "VIII-A", mapel: "Informatika", siswaId: "s17", tugas: 82, ulangan: 78, uts: 80, uas: 81 }
            ],
            jadwal: [
                { id: "jd1", hari: "Senin", jam: "07:30 - 09:00", kelas: "VII-A", mapel: "Informatika" },
                { id: "jd2", hari: "Senin", jam: "09:15 - 10:45", kelas: "VII-B", mapel: "Informatika" },
                { id: "jd3", hari: "Selasa", jam: "07:30 - 09:00", kelas: "VIII-A", mapel: "Informatika" },
                { id: "jd4", hari: "Selasa", jam: "09:15 - 10:45", kelas: "VIII-B", mapel: "Informatika" },
                { id: "jd5", hari: "Rabu", jam: "07:30 - 09:00", kelas: "IX-A", mapel: "Informatika" },
                { id: "jd6", hari: "Rabu", jam: "09:15 - 10:45", kelas: "IX-B", mapel: "Informatika" },
                { id: "jd7", hari: "Kamis", jam: "07:30 - 09:00", kelas: "VII-A", mapel: "Informatika" },
                { id: "jd8", hari: "Kamis", jam: "09:15 - 10:45", kelas: "VII-B", mapel: "Informatika" },
                { id: "jd9", hari: "Jumat", jam: "07:30 - 09:00", kelas: "VIII-A", mapel: "Informatika" },
                { id: "jd10", hari: "Sabtu", jam: "07:30 - 09:00", kelas: "IX-A", mapel: "Informatika" }
            ],
            events: [
                { id: "ev1", tanggal: "2026-07-13", judul: "Awal Masuk Tahun Pelajaran Baru", kategori: "Akademik" },
                { id: "ev2", tanggal: "2026-07-14", judul: "MPLS (Masa Pengenalan Lingkungan Sekolah)", kategori: "Kegiatan" },
                { id: "ev3", tanggal: "2026-08-17", judul: "Upacara Peringatan HUT RI ke-81", kategori: "Kegiatan" },
                { id: "ev4", tanggal: "2026-09-01", judul: "Penilaian Tengah Semester Ganjil (PTS)", kategori: "Ujian" },
                { id: "ev5", tanggal: "2026-09-14", judul: "Pekan Kreativitas & Seni Madrasah", kategori: "Kegiatan" },
                { id: "ev6", tanggal: "2026-10-05", judul: "Maulid Nabi Muhammad SAW", kategori: "Kegiatan" },
                { id: "ev7", tanggal: "2026-11-23", judul: "Penilaian Akhir Semester Ganjil (PAS)", kategori: "Ujian" },
                { id: "ev8", tanggal: "2026-12-07", judul: "Pembagian Rapor Semester Ganjil", kategori: "Akademik" },
                { id: "ev9", tanggal: "2026-12-18", judul: "Libur Semester Ganjil", kategori: "Akademik" },
                { id: "ev10", tanggal: "2027-01-05", judul: "Masuk Semester Genap", kategori: "Akademik" }
            ],
            documents: [
                { id: "doc1", tipe: "Modul Ajar", nama: "Modul Ajar Informatika Kelas VII - Berpikir Komputasional.pdf", ukuran: "2.4 MB", tanggal: "2026-06-10" },
                { id: "doc2", tipe: "Program Tahunan", nama: "PROTA Informatika Kelas VII - 2026.pdf", ukuran: "512 KB", tanggal: "2026-06-12" },
                { id: "doc3", tipe: "Program Semester", nama: "PROMES Informatika Kelas VII Ganjil.pdf", ukuran: "380 KB", tanggal: "2026-06-12" },
                { id: "doc4", tipe: "Alur Tujuan Pembelajaran", nama: "ATP Informatika Fase D Kelas VII-IX.pdf", ukuran: "1.8 MB", tanggal: "2026-06-08" },
                { id: "doc5", tipe: "Bahan Ajar", nama: "Handout Pengenalan HTML & CSS.pdf", ukuran: "3.2 MB", tanggal: "2026-06-15" },
                { id: "doc6", tipe: "Lembar Kerja Peserta Didik", nama: "LKPD Praktikum Python Dasar.pdf", ukuran: "1.1 MB", tanggal: "2026-06-16" },
                { id: "doc7", tipe: "Bank Soal", nama: "Bank Soal Informatika Kelas VII - 100 Soal PG.pdf", ukuran: "890 KB", tanggal: "2026-06-14" },
                { id: "doc8", tipe: "Kisi-Kisi Soal", nama: "Kisi-Kisi PTS Informatika Kelas VII Ganjil.pdf", ukuran: "420 KB", tanggal: "2026-06-18" }
            ],
            prota: [
                { id: "pr1", mapel: "Informatika", kelas: "VII", tahunAjaran: "2026/2027", semester1: "54 JP", semester2: "54 JP", keterangan: "Fase D - Berpikir Komputasional & Teknologi" }
            ],
            promes: [
                { id: "pm1", mapel: "Informatika", kelas: "VII", semester: "Ganjil", bulan: "Juli", kegiatan: "Pengenalan Algoritma & Flowchart", jp: "8" },
                { id: "pm2", mapel: "Informatika", kelas: "VII", semester: "Ganjil", bulan: "Agustus", kegiatan: "HTML & CSS Dasar", jp: "12" },
                { id: "pm3", mapel: "Informatika", kelas: "VII", semester: "Ganjil", bulan: "September", kegiatan: "PTS & Pemrograman Python Dasar", jp: "10" },
                { id: "pm4", mapel: "Informatika", kelas: "VII", semester: "Ganjil", bulan: "Oktober", kegiatan: "Python Lanjutan: Percabangan & Perulangan", jp: "12" },
                { id: "pm5", mapel: "Informatika", kelas: "VII", semester: "Ganjil", bulan: "November", kegiatan: "Proyek Web Sederhana & PAS", jp: "12" }
            ],
            atp: [
                { id: "atp1", fase: "D", mapel: "Informatika", cp: "Memahami konsep komputasi dan pemecahan masalah", tp: "Mendeskripsikan algoritma dalam bentuk flowchart dan pseudocode", urutan: 1 },
                { id: "atp2", fase: "D", mapel: "Informatika", cp: "Memahami konsep komputasi dan pemecahan masalah", tp: "Mengimplementasikan struktur data sederhana", urutan: 2 },
                { id: "atp3", fase: "D", mapel: "Informatika", cp: "Menerapkan teknologi digital secara bertanggung jawab", tp: "Membuat halaman web statis menggunakan HTML dan CSS", urutan: 3 }
            ],
            modulAjar: [
                { id: "ma1", mapel: "Informatika", kelas: "VII", fase: "D", alokasiWaktu: "2 x 40 menit", tujuan: "Peserta didik mampu menjelaskan konsep algoritma dan membuat flowchart sederhana", pendahuluan: "Apersepsi: Tanya jawab tentang langkah-langkah memasak nasi, Motivasi: Video tentang cara kerja komputer", inti: "Diskusi konsep algoritma, Praktik membuat flowchart di kertas, Presentasi hasil", penutup: "Refleksi pembelajaran, Penugasan membuat flowchart aktivitas sehari-hari", asesmen: "Formatif: Observasi diskusi, Sumatif: Tugas flowchart" }
            ],
            bahanAjar: [
                { id: "ba1", judul: "Pengantar Berpikir Komputasional", mapel: "Informatika", kelas: "VII", jenis: "Handout", ringkasan: "Materi pengantar tentang 4 pilar berpikir komputasional: dekomposisi, pengenalan pola, abstraksi, dan algoritma" }
            ],
            lkpd: [
                { id: "lk1", judul: "Praktikum: Membuat Flowchart Kehidupan Sehari-hari", mapel: "Informatika", kelas: "VII", tujuan: "Siswa mampu membuat flowchart untuk aktivitas sehari-hari", instruksi: "1. Pilih satu aktivitas harian\n2. Identifikasi langkah-langkah\n3. Buat flowchart menggunakan simbol standar\n4. Presentasikan di depan kelas" }
            ],
            programAsesmen: [
                { id: "pa1", mapel: "Informatika", kelas: "VII", jenis: "Formatif", teknik: "Observasi & Penugasan", waktu: "Setiap pertemuan", deskripsi: "Penilaian proses selama pembelajaran berlangsung" }
            ],
            kktp: [
                { id: "kk1", mapel: "Informatika", kelas: "VII", tp: "Mendeskripsikan algoritma dalam bentuk flowchart", kriteria: "Mampu mengidentifikasi simbol flowchart, Mampu membuat flowchart dari deskripsi masalah, Mampu menjelaskan alur logika flowchart" }
            ],
            bankSoal: [
                { id: "bs1", mapel: "Informatika", kelas: "VII", jenis: "PG", soal: "Manakah yang merupakan contoh algoritma dalam kehidupan sehari-hari?", pilihanA: "Menonton televisi", pilihanB: "Resep memasak nasi goreng", pilihanC: "Mendengarkan musik", pilihanD: "Tidur siang", kunci: "B", pembahasan: "Resep memasak mengandung langkah-langkah berurutan yang merupakan ciri algoritma." }
            ],
            kisiSoal: [
                { id: "ks1", mapel: "Informatika", kelas: "VII", jumlahSoal: "25", kd: "3.1 Memahami konsep algoritma", indikator: "Disajikan deskripsi masalah, siswa dapat membuat pseudocode sederhana", level: "C3 (Menerapkan)", bentuk: "PG" }
            ]
        };

        function initializeLocalStorageSeed() {
            Object.keys(SEED_DATA).forEach(key => {
                if (!localStorage.getItem(`tradisi_${key}`)) {
                    localStorage.setItem(`tradisi_${key}`, JSON.stringify(SEED_DATA[key]));
                }
            });
        }
        initializeLocalStorageSeed();

        // 5. DATABASE SERVICE CONTROLLER
        const dbService = {
            async getProfile(uid) {
                if (useMockDb) {
                    const data = localStorage.getItem(`tradisi_profile_${uid}`);
                    return data ? JSON.parse(data) : { nama: "Ir. Hermawan, M.Pd.", nip: "197508212005011002", mapel: "Informatika" };
                } else {
                    try {
                        const docRef = doc(db, getUserDocPath(uid));
                        const snap = await getDoc(docRef);
                        return snap.exists() ? snap.data() : { nama: "Guru Pendidik", nip: "-", mapel: "-" };
                    } catch (e) {
                        console.warn("Firestore getProfile failed, fallback to local storage:", e);
                        const data = localStorage.getItem(`tradisi_profile_${uid}`);
                        return data ? JSON.parse(data) : { nama: "Ir. Hermawan, M.Pd.", nip: "197508212005011002", mapel: "Informatika" };
                    }
                }
            },
            async saveProfile(uid, data) {
                if (useMockDb) {
                    localStorage.setItem(`tradisi_profile_${uid}`, JSON.stringify(data));
                } else {
                    try {
                        const docRef = doc(db, getUserDocPath(uid));
                        await setDoc(docRef, data, { merge: true });
                    } catch (e) {
                        console.error("Firestore saveProfile failed, fallback to local storage:", e);
                        localStorage.setItem(`tradisi_profile_${uid}`, JSON.stringify(data));
                    }
                }
            },
            async getData(collectionName) {
                if (useMockDb) {
                    const data = localStorage.getItem(`tradisi_${collectionName}`);
                    return data ? JSON.parse(data) : [];
                } else {
                    try {
                        const docRef = doc(db, getCollectionPath(collectionName));
                        const snap = await getDoc(docRef);
                        return snap.exists() ? snap.data().items || [] : [];
                    } catch (e) {
                        console.warn(`Firestore gagal membaca ${collectionName}, fallback ke lokal:`, e);
                        const data = localStorage.getItem(`tradisi_${collectionName}`);
                        return data ? JSON.parse(data) : [];
                    }
                }
            },
            async saveData(collectionName, items) {
                if (useMockDb) {
                    localStorage.setItem(`tradisi_${collectionName}`, JSON.stringify(items));
                } else {
                    try {
                        const docRef = doc(db, getCollectionPath(collectionName));
                        await setDoc(docRef, { items, updatedAt: new Date() }, { merge: true });
                    } catch (e) {
                        console.error(`Firestore gagal menyimpan ${collectionName}, fallback ke lokal:`, e);
                        localStorage.setItem(`tradisi_${collectionName}`, JSON.stringify(items));
                    }
                }
            }
        };

        const getCollectionPath = (collectionName) => {
            return isPreviewEnv
                ? `artifacts/${appId}/collections/${collectionName}`
                : `collections/${collectionName}`;
        };

        // 6. VARIABEL GLOBAL
        let currentUser = null;
        let userProfile = { nama: "Guru Pendidik", nip: "-", mapel: "-" };

        // 7. INISIALISASI UI ELEMENTS
        const loginView = document.getElementById('login-view');
        const appView = document.getElementById('app-view');
        const sidebarMenuContainer = document.getElementById('sidebar-menu-container');
        const contentArea = document.getElementById('content-area');
        const headerTitle = document.getElementById('header-title');

        // Render Sidebar Menu
        function renderSidebar() {
            let html = '';
            menuStructure.forEach(group => {
                html += `
                <div class="mb-4">
                    <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2 px-2">
                        <i class="ph ${group.icon} text-slate-400"></i> ${group.category}
                    </h3>
                    <ul class="space-y-0.5 pl-1">
                `;
                group.items.forEach(item => {
                    html += `
                        <li>
                            <button onclick="window.loadPage('${item}')" class="w-full text-left text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 py-2 px-3 rounded-lg transition-all flex items-center gap-2 menu-item" data-page="${item}">
                                <div class="w-1.5 h-1.5 rounded-full bg-slate-600 transition-all bullet-indicator"></div>
                                ${item}
                            </button>
                        </li>
                    `;
                });
                html += `</ul></div>`;
            });
            sidebarMenuContainer.innerHTML = html;
        }

        // TOAST NOTIFICATION HELPERS
        window.showToast = function (message, isError = false) {
            const toast = document.getElementById('toast');
            const toastText = document.getElementById('toast-text');
            const toastIcon = document.getElementById('toast-icon');

            toastText.innerText = message;
            if (isError) {
                toastIcon.className = "ph ph-x-circle text-rose-500 text-xl";
            } else {
                toastIcon.className = "ph ph-check-circle text-orange-500 text-xl";
            }

            toast.classList.remove('translate-y-20', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');

            setTimeout(() => {
                toast.classList.add('translate-y-20', 'opacity-0');
                toast.classList.remove('translate-y-0', 'opacity-100');
            }, 3000);
        };

        // GLOBAL MODAL HELPERS
        let modalOnConfirm = null;
        window.openModal = function (title, bodyHtml, confirmText = "Simpan", onConfirm = null) {
            document.getElementById('crud-modal-title').innerText = title;
            document.getElementById('crud-modal-body').innerHTML = bodyHtml;
            document.getElementById('crud-modal-save-btn').innerText = confirmText;
            modalOnConfirm = onConfirm;

            const modal = document.getElementById('crud-modal');
            const modalBox = document.getElementById('crud-modal-box');
            modal.classList.remove('hidden');
            setTimeout(() => {
                modalBox.classList.remove('scale-95', 'opacity-0');
                modalBox.classList.add('scale-100', 'opacity-100');
            }, 10);
        };

        window.closeModal = function () {
            const modal = document.getElementById('crud-modal');
            const modalBox = document.getElementById('crud-modal-box');
            modalBox.classList.remove('scale-100', 'opacity-100');
            modalBox.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 250);
        };

        document.getElementById('crud-modal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (modalOnConfirm) modalOnConfirm();
        });

        // CONFIRM DIALOG HELPER (replaces native confirm())
        window.showConfirmDialog = function (title, message, onConfirm) {
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
        };

        // TIME-BASED GREETING HELPER
        window.getGreeting = function () {
            const hour = new Date().getHours();
            if (hour < 11) return "Selamat Pagi";
            if (hour < 15) return "Selamat Siang";
            if (hour < 18) return "Selamat Sore";
            return "Selamat Malam";
        };

        // INDONESIAN DATE FORMAT HELPER
        window.formatTanggalIndonesia = function (dateStr) {
            const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
            const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
            const d = dateStr ? new Date(dateStr) : new Date();
            return `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
        };

        // KEYBOARD SHORTCUTS
        document.addEventListener('keydown', (e) => {
            // Escape to close modal
            if (e.key === 'Escape') {
                const modal = document.getElementById('crud-modal');
                if (!modal.classList.contains('hidden')) {
                    closeModal();
                }
            }
        });

        // GENERIC DELETE HELPER FOR PERANGKAT AJAR PAGES
        window.deleteItem = function (collection, id, renderFn, items) {
            const item = items.find(i => i.id === id);
            showConfirmDialog("Hapus Data", `Apakah Anda yakin ingin menghapus data ini?`, () => {
                const idx = items.findIndex(i => i.id === id);
                if (idx !== -1) {
                    items.splice(idx, 1);
                    dbService.saveData(collection, items).then(() => {
                        renderFn();
                        showToast("Data berhasil dihapus.");
                    });
                }
            });
        };

        // 8. SPA NAVIGATION LOGIC
        window.loadPage = async function (pageTitle) {
            headerTitle.innerText = pageTitle;

            // Highlight active menu
            document.querySelectorAll('.menu-item').forEach(el => {
                el.classList.remove('bg-slate-800/80', 'text-white', 'font-semibold');
                el.querySelector('.bullet-indicator').classList.remove('bg-orange-500', 'scale-125');
                el.querySelector('.bullet-indicator').classList.add('bg-slate-600');
                if (el.getAttribute('data-page') === pageTitle) {
                    el.classList.add('bg-slate-800/80', 'text-white', 'font-semibold');
                    el.querySelector('.bullet-indicator').classList.remove('bg-slate-600');
                    el.querySelector('.bullet-indicator').classList.add('bg-orange-500', 'scale-125');
                }
            });

            // Close sidebar on mobile after navigating
            if (window.innerWidth < 768) toggleSidebar(false);

            // Tampilkan Loading Area
            contentArea.innerHTML = `
                <div class="flex flex-col justify-center items-center h-64 text-slate-400">
                    <i class="ph ph-spinner animate-spin text-3xl text-orange-500 mb-2"></i>
                    <p class="text-xs">Memuat konten...</p>
                </div>
            `;

            // Render Page Content
            try {
                const schoolSettings = await dbService.getData('madrasah_settings').then(res => Array.isArray(res) ? res[0] || SEED_DATA.madrasah_settings : res);

                if (pageTitle === 'Dashboard') {
                    const students = await dbService.getData('siswa');
                    const journals = await dbService.getData('jurnal');
                    const schedules = await dbService.getData('jadwal');
                    const documents = await dbService.getData('documents');
                    const todayStr = new Date().toISOString().substring(0, 10);
                    const todayJournals = journals.filter(j => j.tanggal === todayStr);
                    const uniqueClasses = [...new Set(students.map(s => s.kelas))];
                    const totalL = students.filter(s => s.jk === 'L').length;
                    const totalP = students.filter(s => s.jk === 'P').length;
                    const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
                    const todayName = dayNames[new Date().getDay()];
                    const todaySchedules = schedules.filter(s => s.hari === todayName);

                    let bannerDb = '';
                    if (useMockDb) {
                        bannerDb = `
                            <div id="db-status-banner" class="banner-info bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 text-xs flex justify-between items-center rounded-2xl shadow-md mb-6">
                                <span class="flex items-center gap-2.5">
                                    <i class="ph ph-warning-circle text-lg animate-bounce"></i>
                                    <span><strong>Mode Uji Coba (Lokal):</strong> Data tersimpan di browser Anda.</span>
                                </span>
                                <button onclick="document.getElementById('db-status-banner').remove()" class="bg-white/20 hover:bg-white/30 p-1 rounded-full"><i class="ph ph-x text-sm"></i></button>
                            </div>
                        `;
                    }

                    // Agenda hari ini
                    let agendaHtml = '';
                    if (todayJournals.length === 0) {
                        const latest = journals.slice(-3).reverse();
                        if (latest.length === 0) {
                            agendaHtml = `<div class="text-center py-6"><i class="ph ph-notebook text-3xl text-slate-300 dark:text-slate-600 mb-2"></i><p class="text-xs text-slate-400">Belum ada agenda terisi.</p></div>`;
                        } else {
                            latest.forEach(j => {
                                agendaHtml += `
                                    <div class="flex gap-3 border-l-2 border-emerald-500 pl-3 py-1.5">
                                        <div class="flex-1 min-w-0">
                                            <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${j.kelas} - ${j.mapel} <span class="text-slate-400 font-normal">(${j.jamKe})</span></p>
                                            <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">${j.materi}</p>
                                            <p class="text-[10px] text-slate-400 mt-0.5">${j.tanggal}</p>
                                        </div>
                                    </div>
                                `;
                            });
                        }
                    } else {
                        todayJournals.forEach(j => {
                            agendaHtml += `
                                <div class="flex gap-3 border-l-2 border-emerald-500 pl-3 py-1.5">
                                    <div class="flex-1 min-w-0">
                                        <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${j.kelas} - ${j.mapel} <span class="text-slate-400 font-normal">(${j.jamKe})</span></p>
                                        <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">${j.materi}</p>
                                    </div>
                                    <span class="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full h-fit">Hari Ini</span>
                                </div>
                            `;
                        });
                    }

                    // Jadwal hari ini
                    let jadwalHtml = '';
                    if (todaySchedules.length === 0) {
                        const upcoming = schedules.slice(0, 4);
                        if (upcoming.length === 0) {
                            jadwalHtml = `<div class="text-center py-6"><i class="ph ph-calendar-blank text-3xl text-slate-300 dark:text-slate-600 mb-2"></i><p class="text-xs text-slate-400">Belum ada jadwal.</p></div>`;
                        } else {
                            upcoming.forEach(s => {
                                jadwalHtml += `
                                    <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                        <div class="flex items-center gap-2">
                                            <div class="w-9 h-9 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center text-[10px] font-bold">${s.hari.substring(0, 3)}</div>
                                            <div>
                                                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${s.mapel}</p>
                                                <p class="text-[10px] text-slate-400">${s.kelas} | ${s.jam}</p>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            });
                        }
                    } else {
                        todaySchedules.forEach(s => {
                            jadwalHtml += `
                                <div class="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
                                    <div class="flex items-center gap-2">
                                        <div class="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">Now</div>
                                        <div>
                                            <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${s.mapel}</p>
                                            <p class="text-[10px] text-slate-400">${s.kelas} | ${s.jam}</p>
                                        </div>
                                    </div>
                                </div>
                            `;
                        });
                    }

                    contentArea.innerHTML = `
                        <div class="fade-in space-y-6">
                            ${bannerDb}
                            <!-- Welcome Card -->
                            <div class="bg-gradient-to-br from-orange-500 via-amber-500 to-rose-600 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                                <div class="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full blur-2xl translate-x-12 -translate-y-12"></div>
                                <div class="absolute left-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-xl -translate-x-8 translate-y-8"></div>
                                <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <div class="flex items-center gap-2 mb-2">
                                            <span class="bg-white/20 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">${getGreeting()}</span>
                                            <span class="text-orange-100 text-[11px] font-medium">${formatTanggalIndonesia()}</span>
                                        </div>
                                        <h2 class="text-2xl md:text-3xl font-extrabold mb-1">Assalamu'alaikum, ${userProfile.nama}!</h2>
                                        <p class="text-sm text-orange-100/80 font-medium">${schoolSettings.nama} | TA ${schoolSettings.tahunAjaran} (${schoolSettings.semester})</p>
                                        <div class="flex items-center gap-2 mt-3">
                                            <div class="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2.5">
                                                <i class="ph ph-clock text-xl text-white"></i>
                                                <span class="text-xl font-extrabold text-white tabular-nums tracking-wide" id="dashboard-clock">--:--:--</span>
                                                <span class="text-xs text-orange-200 font-medium" id="dashboard-wib">WIB</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex gap-2 no-print">
                                        <button onclick="window.loadPage('Absensi Siswa')" class="bg-white text-orange-600 hover:bg-emerald-50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"><i class="ph ph-check-square text-base"></i> Isi Absen</button>
                                        <button onclick="window.loadPage('Jurnal Agenda Guru')" class="bg-white/15 border border-white/20 hover:bg-white/25 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5"><i class="ph ph-pencil-simple text-base"></i> Tulis Jurnal</button>
                                    </div>
                                </div>
                            </div>

                            <!-- Stat Cards -->
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                <div class="stat-card stat-card-blue bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Siswa</div>
                                            <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${students.length}</div>
                                            <div class="text-[10px] text-slate-400 mt-1">${totalL} L / ${totalP} P</div>
                                        </div>
                                        <div class="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl"><i class="ph ph-users text-xl"></i></div>
                                    </div>
                                </div>
                                <div class="stat-card stat-card-emerald bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Jadwal</div>
                                            <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${schedules.length}</div>
                                            <div class="text-[10px] text-slate-400 mt-1">${todaySchedules.length} hari ini</div>
                                        </div>
                                        <div class="p-2.5 bg-orange-500/10 text-orange-600 rounded-xl"><i class="ph ph-calendar-blank text-xl"></i></div>
                                    </div>
                                </div>
                                <div class="stat-card stat-card-purple bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Jurnal</div>
                                            <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${journals.length}</div>
                                            <div class="text-[10px] text-slate-400 mt-1">${todayJournals.length} hari ini</div>
                                        </div>
                                        <div class="p-2.5 bg-purple-500/10 text-purple-600 rounded-xl"><i class="ph ph-notebook text-xl"></i></div>
                                    </div>
                                </div>
                                <div class="stat-card stat-card-teal bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Dokumen</div>
                                            <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${documents.length}</div>
                                            <div class="text-[10px] text-slate-400 mt-1">${uniqueClasses.length} kelas</div>
                                        </div>
                                        <div class="p-2.5 bg-teal-500/10 text-teal-600 rounded-xl"><i class="ph ph-folder-open text-xl"></i></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Quick Actions -->
                            <div class="grid grid-cols-2 md:grid-cols-5 gap-3 no-print">
                                <button onclick="window.loadPage('Data Siswa')" class="quick-action bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center group">
                                    <div class="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all"><i class="ph ph-users text-xl"></i></div>
                                    <p class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Data Siswa</p>
                                </button>
                                <button onclick="window.loadPage('Penilaian Siswa')" class="quick-action bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center group">
                                    <div class="w-10 h-10 mx-auto mb-2 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all"><i class="ph ph-chart-bar text-xl"></i></div>
                                    <p class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Penilaian</p>
                                </button>
                                <button onclick="window.loadPage('Modul Ajar')" class="quick-action bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center group">
                                    <div class="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all"><i class="ph ph-book-open-text text-xl"></i></div>
                                    <p class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Modul Ajar</p>
                                </button>
                                <button onclick="window.loadPage('Jadwal Pelajaran')" class="quick-action bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center group">
                                    <div class="w-10 h-10 mx-auto mb-2 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all"><i class="ph ph-clock text-xl"></i></div>
                                    <p class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Jadwal</p>
                                </button>
                                <button onclick="window.loadPage('Kalender Pendidikan')" class="quick-action bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center group">
                                    <div class="w-10 h-10 mx-auto mb-2 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all"><i class="ph ph-calendar text-xl"></i></div>
                                    <p class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Kalender</p>
                                </button>
                            </div>

                            <!-- Detail Section -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800 space-y-4">
                                    <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <i class="ph ph-notebook text-orange-500"></i> ${todayJournals.length > 0 ? 'Jurnal Hari Ini' : 'Jurnal Mengajar Terbaru'}
                                    </h3>
                                    <div class="space-y-3 fade-in-stagger">
                                        ${agendaHtml}
                                    </div>
                                    <button onclick="window.loadPage('Jurnal Agenda Guru')" class="text-xs text-orange-500 dark:text-orange-400 font-bold hover:underline">Lihat semua jurnal &rarr;</button>
                                </div>
                                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800 space-y-4">
                                    <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <i class="ph ph-calendar-blank text-orange-500"></i> ${todaySchedules.length > 0 ? 'Jadwal Hari Ini (' + todayName + ')' : 'Jadwal Terdekat'}
                                    </h3>
                                    <div class="space-y-2.5 fade-in-stagger">
                                        ${jadwalHtml}
                                    </div>
                                    <button onclick="window.loadPage('Jadwal Pelajaran')" class="text-xs text-orange-500 dark:text-orange-400 font-bold hover:underline">Kelola jadwal &rarr;</button>
                                </div>
                            </div>
                        </div>
                    `;
                }

                else if (pageTitle === 'Pengaturan Madrasah') {
                    contentArea.innerHTML = `
                        <div class="fade-in space-y-6 max-w-3xl">
                            <div class="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                                <h3 class="text-base font-bold border-b dark:border-slate-700 pb-3 mb-5 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                    <i class="ph ph-buildings text-orange-500 text-lg"></i> Identitas Madrasah
                                </h3>
                                <form id="school-settings-form" class="space-y-4">
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Nama Madrasah / Sekolah</label>
                                        <input type="text" id="school-name" value="${schoolSettings.nama}" required class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">NPSN</label>
                                            <input type="text" id="school-npsn" value="${schoolSettings.npsn || ''}" maxlength="10" pattern="[0-9]{10}" placeholder="10 digit angka" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">NSM</label>
                                            <input type="text" id="school-nsm" value="${schoolSettings.nsm || ''}" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Akreditasi</label>
                                            <select id="school-akreditasi" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                                <option value="A" ${schoolSettings.akreditasi === 'A' ? 'selected' : ''}>A (Unggul)</option>
                                                <option value="B" ${schoolSettings.akreditasi === 'B' ? 'selected' : ''}>B (Baik)</option>
                                                <option value="C" ${schoolSettings.akreditasi === 'C' ? 'selected' : ''}>C (Cukup)</option>
                                                <option value="Belum" ${schoolSettings.akreditasi === 'Belum' ? 'selected' : ''}>Belum Terakreditasi</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Kepala Madrasah</label>
                                            <input type="text" id="school-head" value="${schoolSettings.kepala}" required class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">NIP Kepala Madrasah</label>
                                            <input type="text" id="school-head-nip" value="${schoolSettings.nipKepala}" required class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Tahun Pelajaran</label>
                                            <input type="text" id="school-year" value="${schoolSettings.tahunAjaran}" placeholder="contoh: 2026/2027" required class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Semester</label>
                                            <select id="school-semester" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                                <option value="Ganjil" ${schoolSettings.semester === 'Ganjil' ? 'selected' : ''}>Ganjil</option>
                                                <option value="Genap" ${schoolSettings.semester === 'Genap' ? 'selected' : ''}>Genap</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Nama Yayasan</label>
                                        <input type="text" id="school-yayasan" value="${schoolSettings.yayasan || ''}" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Alamat Madrasah</label>
                                        <textarea id="school-address" rows="2" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">${schoolSettings.alamat || ''}</textarea>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Email</label>
                                            <input type="email" id="school-email" value="${schoolSettings.email || ''}" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Telepon</label>
                                            <input type="text" id="school-phone" value="${schoolSettings.telepon || ''}" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Website</label>
                                            <input type="url" id="school-website" value="${schoolSettings.website || ''}" class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                        </div>
                                    </div>
                                    <div class="pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-98 text-xs uppercase tracking-wider flex items-center gap-2">
                                            <i class="ph ph-floppy-disk text-base"></i> Simpan Pengaturan
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    `;

                    document.getElementById('school-settings-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const btn = e.target.querySelector('button[type="submit"]');
                        btn.innerHTML = `<i class="ph ph-spinner animate-spin text-base"></i> Menyimpan...`;

                        const newSettings = {
                            nama: document.getElementById('school-name').value,
                            npsn: document.getElementById('school-npsn').value,
                            nsm: document.getElementById('school-nsm').value,
                            akreditasi: document.getElementById('school-akreditasi').value,
                            kepala: document.getElementById('school-head').value,
                            nipKepala: document.getElementById('school-head-nip').value,
                            tahunAjaran: document.getElementById('school-year').value,
                            semester: document.getElementById('school-semester').value,
                            yayasan: document.getElementById('school-yayasan').value,
                            alamat: document.getElementById('school-address').value,
                            email: document.getElementById('school-email').value,
                            telepon: document.getElementById('school-phone').value,
                            website: document.getElementById('school-website').value
                        };

                        await dbService.saveData('madrasah_settings', [newSettings]);
                        showToast("Pengaturan madrasah berhasil diperbarui!");
                        btn.innerHTML = `<i class="ph ph-floppy-disk text-base"></i> Simpan Pengaturan`;
                    });
                }

                else if (pageTitle === 'Profil Saya') {
                    const allStudents = await dbService.getData('siswa');
                    const allSchedules = await dbService.getData('jadwal');
                    const uniqueClasses = [...new Set(allSchedules.map(s => s.kelas))];
                    const studentsCount = allStudents.filter(s => uniqueClasses.includes(s.kelas)).length;

                    contentArea.innerHTML = `
                        <div class="fade-in space-y-6 max-w-2xl">
                            <!-- Profile Header Card -->
                            <div class="bg-gradient-to-r from-orange-500 to-amber-600 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
                                <div class="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-xl translate-x-8 -translate-y-8"></div>
                                <div class="flex items-center gap-4 relative z-10">
                                    <div class="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-extrabold shadow-lg">${userProfile.nama ? userProfile.nama.charAt(0).toUpperCase() : 'G'}</div>
                                    <div>
                                        <h2 class="text-xl font-extrabold">${userProfile.nama || 'Guru Pendidik'}</h2>
                                        <p class="text-emerald-100 text-xs font-medium">${userProfile.mapel || '-'} | NIP: ${userProfile.nip || '-'}</p>
                                        <p class="text-emerald-200/70 text-[10px] mt-0.5">${userProfile.jabatan || 'Guru Mata Pelajaran'}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Stats -->
                            <div class="grid grid-cols-3 gap-3">
                                <div class="stat-card stat-card-blue bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                                    <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${uniqueClasses.length}</div>
                                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Kelas Diampu</div>
                                </div>
                                <div class="stat-card stat-card-emerald bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                                    <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${studentsCount}</div>
                                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Siswa</div>
                                </div>
                                <div class="stat-card stat-card-purple bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                                    <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">${allSchedules.length}</div>
                                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Sesi/Minggu</div>
                                </div>
                            </div>

                            <!-- Edit Form -->
                            <div class="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800">
                                <h3 class="text-sm font-bold border-b dark:border-slate-700 pb-3 mb-5 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                    <i class="ph ph-pencil-simple text-orange-500"></i> Edit Profil
                                </h3>
                                <form id="profile-form" class="space-y-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Nama Lengkap & Gelar</label>
                                            <input type="text" id="prof-nama" value="${userProfile.nama}" required class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">NIP / NUPTK</label>
                                            <input type="text" id="prof-nip" value="${userProfile.nip}" required class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Mata Pelajaran Diampu</label>
                                            <input type="text" id="prof-mapel" value="${userProfile.mapel}" required class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Jabatan</label>
                                            <select id="prof-jabatan" class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                                <option value="Guru Mata Pelajaran" ${(userProfile.jabatan||'') === 'Guru Mata Pelajaran' ? 'selected' : ''}>Guru Mata Pelajaran</option>
                                                <option value="Wali Kelas" ${(userProfile.jabatan||'') === 'Wali Kelas' ? 'selected' : ''}>Wali Kelas</option>
                                                <option value="Wakil Kepala Madrasah" ${(userProfile.jabatan||'') === 'Wakil Kepala Madrasah' ? 'selected' : ''}>Wakil Kepala Madrasah</option>
                                                <option value="Kepala Madrasah" ${(userProfile.jabatan||'') === 'Kepala Madrasah' ? 'selected' : ''}>Kepala Madrasah</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Pangkat / Golongan</label>
                                            <input type="text" id="prof-pangkat" value="${userProfile.pangkat || ''}" placeholder="contoh: Pembina / IV-a" class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Pendidikan Terakhir</label>
                                            <input type="text" id="prof-pendidikan" value="${userProfile.pendidikan || ''}" placeholder="contoh: S2 - Teknik Informatika" class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">No. Handphone</label>
                                            <input type="tel" id="prof-hp" value="${userProfile.hp || ''}" placeholder="08xxxxxxxxxx" class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Email</label>
                                            <input type="email" id="prof-email" value="${userProfile.email || (currentUser ? currentUser.email || '' : '')}" placeholder="guru@idrisiyyah.sch.id" class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-sm">
                                        </div>
                                    </div>
                                    <div class="pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-98 text-xs uppercase tracking-wider flex items-center gap-2">
                                            <i class="ph ph-floppy-disk text-base"></i> Simpan Perubahan
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    `;

                    document.getElementById('profile-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const btn = e.target.querySelector('button[type="submit"]');
                        btn.innerHTML = `<i class="ph ph-spinner animate-spin text-base"></i> Menyimpan...`;

                        const updatedProfile = {
                            nama: document.getElementById('prof-nama').value,
                            nip: document.getElementById('prof-nip').value,
                            mapel: document.getElementById('prof-mapel').value,
                            jabatan: document.getElementById('prof-jabatan').value,
                            pangkat: document.getElementById('prof-pangkat').value,
                            pendidikan: document.getElementById('prof-pendidikan').value,
                            hp: document.getElementById('prof-hp').value,
                            email: document.getElementById('prof-email').value
                        };

                        try {
                            await dbService.saveProfile(currentUser ? currentUser.uid : 'demo-user', updatedProfile);
                            userProfile = updatedProfile;
                            updateUIProfileInfo();
                            showToast("Profil berhasil disimpan!");
                        } catch (err) {
                            showToast("Gagal menyimpan profil: " + err.message, true);
                        } finally {
                            btn.innerHTML = `<i class="ph ph-floppy-disk text-base"></i> Simpan Perubahan`;
                        }
                    });
                }

                else if (pageTitle === 'Data Siswa') {
                    const students = await dbService.getData('siswa');

                    window.renderStudentsTable = function (filteredList = students) {
                        const tbody = document.getElementById('students-table-body');
                        if (filteredList.length === 0) {
                            tbody.innerHTML = `
                                <tr>
                                    <td colspan="5" class="px-6 py-8 text-center text-xs text-slate-500 dark:text-slate-400">Tidak ada data siswa ditemukan.</td>
                                </tr>
                            `;
                            return;
                        }

                        tbody.innerHTML = filteredList.map((s, idx) => `
                            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors">
                                <td class="px-6 py-3.5 text-xs text-slate-500">${idx + 1}</td>
                                <td class="px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">${s.nisn}</td>
                                <td class="px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">${s.nama}</td>
                                <td class="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-400">${s.kelas}</td>
                                <td class="px-6 py-3.5 text-xs">
                                    <span class="px-2 py-0.5 rounded-full font-bold text-[10px] ${s.jk === 'L' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'}">${s.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                </td>
                                <td class="px-6 py-3.5 text-xs flex gap-2">
                                    <button onclick="editStudentModal('${s.id}')" class="p-1 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg transition-colors" title="Ubah"><i class="ph ph-pencil-simple text-base"></i></button>
                                    <button onclick="deleteStudent('${s.id}')" class="p-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors" title="Hapus"><i class="ph ph-trash text-base"></i></button>
                                </td>
                            </tr>
                        `).join('');
                    };

                    const totalL = students.filter(s => s.jk === 'L').length;
                    const totalP = students.filter(s => s.jk === 'P').length;
                    const classCounts = {};
                    students.forEach(s => { classCounts[s.kelas] = (classCounts[s.kelas] || 0) + 1; });

                    contentArea.innerHTML = `
                        <div class="fade-in space-y-6">
                            <!-- Statistics Cards -->
                            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                                <div class="stat-card stat-card-blue bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                                    <div class="text-xl font-bold text-slate-800 dark:text-slate-100">${students.length}</div>
                                    <div class="text-[10px] font-bold text-slate-400 uppercase">Total Siswa</div>
                                </div>
                                <div class="stat-card stat-card-emerald bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                                    <div class="text-xl font-bold text-blue-600">${totalL}</div>
                                    <div class="text-[10px] font-bold text-slate-400 uppercase">Laki-laki</div>
                                </div>
                                <div class="stat-card stat-card-rose bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                                    <div class="text-xl font-bold text-pink-600">${totalP}</div>
                                    <div class="text-[10px] font-bold text-slate-400 uppercase">Perempuan</div>
                                </div>
                                <div class="stat-card stat-card-purple bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                                    <div class="text-xl font-bold text-slate-800 dark:text-slate-100">${Object.keys(classCounts).length}</div>
                                    <div class="text-[10px] font-bold text-slate-400 uppercase">Kelas</div>
                                </div>
                                <div class="stat-card stat-card-teal bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center col-span-2 md:col-span-1">
                                    <div class="text-xl font-bold text-slate-800 dark:text-slate-100">${students.length ? Math.round(totalL/students.length*100) : 0}%</div>
                                    <div class="text-[10px] font-bold text-slate-400 uppercase">Rasio L</div>
                                </div>
                            </div>

                            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                                <!-- Table Header Actions -->
                                <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div class="flex flex-1 gap-2.5 max-w-md">
                                        <div class="relative flex-1">
                                            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><i class="ph ph-magnifying-glass"></i></span>
                                            <input type="text" id="search-student" oninput="filterStudents()" placeholder="Cari siswa berdasarkan nama/NISN..." class="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                        </div>
                                        <select id="filter-class" onchange="filterStudents()" class="px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                            <option value="">Semua Kelas</option>
                                            <option value="VII-A">VII-A</option>
                                            <option value="VII-B">VII-B</option>
                                            <option value="VIII-A">VIII-A</option>
                                            <option value="VIII-B">VIII-B</option>
                                            <option value="IX-A">IX-A</option>
                                            <option value="IX-B">IX-B</option>
                                        </select>
                                    </div>
                                    <div class="flex gap-2 no-print">
                                        <button onclick="addStudentModal()" class="btn bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all active:scale-98">
                                            <i class="ph ph-plus text-base"></i> Tambah Siswa
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Table Layout -->
                                <div class="overflow-x-auto">
                                    <table class="w-full text-left border-collapse">
                                        <thead>
                                            <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                <th class="px-6 py-3 w-12">No</th>
                                                <th class="px-6 py-3 w-32">NISN</th>
                                                <th class="px-6 py-3">Nama Lengkap</th>
                                                <th class="px-6 py-3 w-28">Kelas</th>
                                                <th class="px-6 py-3 w-32">Jenis Kelamin</th>
                                                <th class="px-6 py-3 w-24">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody id="students-table-body">
                                            <!-- List Renders here -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    `;

                    window.filterStudents = function () {
                        const search = document.getElementById('search-student').value.toLowerCase();
                        const kelas = document.getElementById('filter-class').value;
                        const filtered = students.filter(s => {
                            const matchSearch = s.nama.toLowerCase().includes(search) || s.nisn.includes(search);
                            const matchClass = !kelas || s.kelas === kelas;
                            return matchSearch && matchClass;
                        });
                        renderStudentsTable(filtered);
                    };

                    window.addStudentModal = function () {
                        const formBody = `
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Nomor Induk Siswa Nasional (NISN)</label>
                                <input type="text" id="stud-nisn" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-orange-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Nama Lengkap</label>
                                <input type="text" id="stud-nama" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-orange-500 outline-none">
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Kelas</label>
                                    <select id="stud-kelas" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-orange-500 outline-none">
                                        <option value="VII-A">VII-A</option>
                                        <option value="VII-B">VII-B</option>
                                        <option value="VIII-A">VIII-A</option>
                                        <option value="VIII-B">VIII-B</option>
                                        <option value="IX-A">IX-A</option>
                                        <option value="IX-B">IX-B</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Jenis Kelamin</label>
                                    <select id="stud-jk" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-orange-500 outline-none">
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                            </div>
                        `;

                        openModal("Tambah Siswa Baru", formBody, "Tambah", async () => {
                            const newStudent = {
                                id: 'stud_' + Date.now(),
                                nisn: document.getElementById('stud-nisn').value,
                                nama: document.getElementById('stud-nama').value,
                                kelas: document.getElementById('stud-kelas').value,
                                jk: document.getElementById('stud-jk').value
                            };

                            students.push(newStudent);
                            await dbService.saveData('siswa', students);
                            closeModal();
                            filterStudents();
                            showToast("Siswa baru berhasil ditambahkan!");
                        });
                    };

                    window.editStudentModal = function (id) {
                        const s = students.find(item => item.id === id);
                        if (!s) return;

                        const formBody = `
                            <input type="hidden" id="stud-id" value="${s.id}">
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Nomor Induk Siswa Nasional (NISN)</label>
                                <input type="text" id="stud-nisn" value="${s.nisn}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-orange-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Nama Lengkap</label>
                                <input type="text" id="stud-nama" value="${s.nama}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-orange-500 outline-none">
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Kelas</label>
                                    <select id="stud-kelas" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-orange-500 outline-none">
                                        <option value="VII-A" ${s.kelas === 'VII-A' ? 'selected' : ''}>VII-A</option>
                                        <option value="VII-B" ${s.kelas === 'VII-B' ? 'selected' : ''}>VII-B</option>
                                        <option value="VIII-A" ${s.kelas === 'VIII-A' ? 'selected' : ''}>VIII-A</option>
                                        <option value="VIII-B" ${s.kelas === 'VIII-B' ? 'selected' : ''}>VIII-B</option>
                                        <option value="IX-A" ${s.kelas === 'IX-A' ? 'selected' : ''}>IX-A</option>
                                        <option value="IX-B" ${s.kelas === 'IX-B' ? 'selected' : ''}>IX-B</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Jenis Kelamin</label>
                                    <select id="stud-jk" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-orange-500 outline-none">
                                        <option value="L" ${s.jk === 'L' ? 'selected' : ''}>Laki-laki</option>
                                        <option value="P" ${s.jk === 'P' ? 'selected' : ''}>Perempuan</option>
                                    </select>
                                </div>
                            </div>
                        `;

                        openModal("Ubah Data Siswa", formBody, "Perbarui", async () => {
                            const index = students.findIndex(item => item.id === id);
                            if (index !== -1) {
                                students[index] = {
                                    ...students[index],
                                    nisn: document.getElementById('stud-nisn').value,
                                    nama: document.getElementById('stud-nama').value,
                                    kelas: document.getElementById('stud-kelas').value,
                                    jk: document.getElementById('stud-jk').value
                                };
                                await dbService.saveData('siswa', students);
                            }
                            closeModal();
                            filterStudents();
                            showToast("Data siswa berhasil diperbarui!");
                        });
                    };

                    window.deleteStudent = function (id) {
                        const s = students.find(item => item.id === id);
                        showConfirmDialog("Hapus Siswa", `Apakah Anda yakin ingin menghapus data <strong>${s ? s.nama : 'siswa ini'}</strong>?`, () => {
                            const index = students.findIndex(item => item.id === id);
                            if (index !== -1) {
                                students.splice(index, 1);
                                dbService.saveData('siswa', students).then(() => {
                                    filterStudents();
                                    showToast("Siswa telah dihapus.");
                                });
                            }
                        });
                    };

                    renderStudentsTable();
                }

                else if (pageTitle === 'Absensi Siswa') {
                    const students = await dbService.getData('siswa');
                    const attendances = await dbService.getData('absensi');

                    contentArea.innerHTML = `
                        <div class="fade-in space-y-6">
                            <!-- Filter Section -->
                            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800 flex flex-wrap gap-4 items-end">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Pilih Kelas</label>
                                    <select id="absen-kelas" onchange="loadAttendanceList()" class="px-3.5 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs w-44">
                                        <option value="VII-A">VII-A</option>
                                        <option value="VII-B">VII-B</option>
                                        <option value="VIII-A">VIII-A</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Pilih Tanggal</label>
                                    <input type="date" id="absen-tanggal" value="${new Date().toISOString().substring(0, 10)}" onchange="loadAttendanceList()" class="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs w-44">
                                </div>
                            </div>

                            <!-- Attendance Content -->
                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <div class="p-5 bg-slate-50 dark:bg-slate-850/40 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Lembar Kehadiran Siswa</h3>
                                        <span id="absen-stat-badge" class="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold py-1 px-3 rounded-full">Belum Disimpan</span>
                                    </div>
                                    
                                    <div class="p-2 overflow-x-auto">
                                        <table class="w-full text-left">
                                            <thead>
                                                <tr class="text-[10px] font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
                                                    <th class="px-4 py-2 w-12 text-center">No</th>
                                                    <th class="px-4 py-2">Nama Siswa</th>
                                                    <th class="px-4 py-2 text-center w-56">Status Presensi</th>
                                                </tr>
                                            </thead>
                                            <tbody id="absen-table-body">
                                                <!-- List here -->
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                        <button onclick="saveAttendance()" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md active:scale-98">
                                            Simpan Absensi
                                        </button>
                                    </div>
                                </div>

                                <!-- Attendance Summary -->
                                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4">
                                    <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <i class="ph ph-chart-pie text-orange-500"></i> Statistik Hari Ini
                                    </h3>
                                    
                                    <div class="space-y-3.5" id="absen-summary-container">
                                        <!-- Stats renders here -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    window.loadAttendanceList = function () {
                        const selectedClass = document.getElementById('absen-kelas').value;
                        const selectedDate = document.getElementById('absen-tanggal').value;

                        const classStudents = students.filter(s => s.kelas === selectedClass);
                        const existingRecord = attendances.find(a => a.kelas === selectedClass && a.tanggal === selectedDate);

                        const badge = document.getElementById('absen-stat-badge');
                        if (existingRecord) {
                            badge.className = "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-orange-400 text-[10px] font-bold py-1 px-3 rounded-full";
                            badge.innerText = "Sudah Disimpan";
                        } else {
                            badge.className = "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold py-1 px-3 rounded-full";
                            badge.innerText = "Belum Disimpan";
                        }

                        const tbody = document.getElementById('absen-table-body');
                        if (classStudents.length === 0) {
                            tbody.innerHTML = `<tr><td colspan="3" class="px-6 py-8 text-center text-xs text-slate-500">Tidak ada siswa di kelas ini.</td></tr>`;
                            return;
                        }

                        tbody.innerHTML = classStudents.map((s, idx) => {
                            const val = existingRecord && existingRecord.records[s.id] ? existingRecord.records[s.id] : 'H';
                            return `
                                <tr class="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                                    <td class="px-4 py-3 text-xs text-slate-500 text-center">${idx + 1}</td>
                                    <td class="px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200">${s.nama}</td>
                                    <td class="px-4 py-3 text-xs text-center">
                                        <div class="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900">
                                            <input type="radio" name="status-${s.id}" id="H-${s.id}" value="H" ${val === 'H' ? 'checked' : ''} class="hidden peer/h">
                                            <label for="H-${s.id}" class="px-3.5 py-1 text-[11px] font-bold text-slate-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 peer-checked/h:bg-orange-500 peer-checked/h:text-white transition-all select-none">H</label>

                                            <input type="radio" name="status-${s.id}" id="S-${s.id}" value="S" ${val === 'S' ? 'checked' : ''} class="hidden peer/s">
                                            <label for="S-${s.id}" class="px-3.5 py-1 text-[11px] font-bold text-slate-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 peer-checked/s:bg-amber-500 peer-checked/s:text-white border-l border-slate-200 dark:border-slate-750 transition-all select-none">S</label>

                                            <input type="radio" name="status-${s.id}" id="I-${s.id}" value="I" ${val === 'I' ? 'checked' : ''} class="hidden peer/i">
                                            <label for="I-${s.id}" class="px-3.5 py-1 text-[11px] font-bold text-slate-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 peer-checked/i:bg-blue-500 peer-checked/i:text-white border-l border-slate-200 dark:border-slate-750 transition-all select-none">I</label>

                                            <input type="radio" name="status-${s.id}" id="A-${s.id}" value="A" ${val === 'A' ? 'checked' : ''} class="hidden peer/a">
                                            <label for="A-${s.id}" class="px-3.5 py-1 text-[11px] font-bold text-slate-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 peer-checked/a:bg-rose-500 peer-checked/a:text-white border-l border-slate-200 dark:border-slate-750 transition-all select-none">A</label>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('');

                        renderAttendanceSummary(classStudents, existingRecord);
                    };

                    window.renderAttendanceSummary = function (classStudents, record) {
                        let h = 0, s = 0, i = 0, a = 0;
                        const total = classStudents.length;

                        if (record) {
                            classStudents.forEach(stud => {
                                const status = record.records[stud.id] || 'H';
                                if (status === 'H') h++;
                                else if (status === 'S') s++;
                                else if (status === 'I') i++;
                                else if (status === 'A') a++;
                            });
                        } else {
                            // Default all present
                            h = total;
                        }

                        const p_h = total ? Math.round((h / total) * 100) : 0;
                        const p_s = total ? Math.round((s / total) * 100) : 0;
                        const p_i = total ? Math.round((i / total) * 100) : 0;
                        const p_a = total ? Math.round((a / total) * 100) : 0;

                        document.getElementById('absen-summary-container').innerHTML = `
                            <div class="space-y-1">
                                <div class="flex justify-between text-xs font-semibold">
                                    <span class="text-orange-500 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Hadir (${h}/${total})</span>
                                    <span>${p_h}%</span>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div class="bg-orange-500 h-full" style="width: ${p_h}%"></div>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <div class="flex justify-between text-xs font-semibold">
                                    <span class="text-amber-500 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Sakit (${s}/${total})</span>
                                    <span>${p_s}%</span>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div class="bg-amber-500 h-full" style="width: ${p_s}%"></div>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <div class="flex justify-between text-xs font-semibold">
                                    <span class="text-blue-500 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Izin (${i}/${total})</span>
                                    <span>${p_i}%</span>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div class="bg-blue-500 h-full" style="width: ${p_i}%"></div>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <div class="flex justify-between text-xs font-semibold">
                                    <span class="text-rose-500 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Alpa (${a}/${total})</span>
                                    <span>${p_a}%</span>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div class="bg-rose-500 h-full" style="width: ${p_a}%"></div>
                                </div>
                            </div>
                        `;
                    };

                    window.saveAttendance = async function () {
                        const selectedClass = document.getElementById('absen-kelas').value;
                        const selectedDate = document.getElementById('absen-tanggal').value;
                        const classStudents = students.filter(s => s.kelas === selectedClass);

                        const records = {};
                        classStudents.forEach(s => {
                            const radio = document.querySelector(`input[name="status-${s.id}"]:checked`);
                            records[s.id] = radio ? radio.value : 'H';
                        });

                        const existingIdx = attendances.findIndex(a => a.kelas === selectedClass && a.tanggal === selectedDate);

                        if (existingIdx !== -1) {
                            attendances[existingIdx].records = records;
                        } else {
                            attendances.push({
                                id: 'abs_' + Date.now(),
                                kelas: selectedClass,
                                tanggal: selectedDate,
                                records: records
                            });
                        }

                        await dbService.saveData('absensi', attendances);
                        showToast("Presensi berhasil disimpan!");
                        loadAttendanceList();
                    };

                    loadAttendanceList();
                }

                else if (pageTitle === 'Jurnal Agenda Guru') {
                    const journals = await dbService.getData('jurnal');

                    window.renderJournalTable = function (filtered = journals) {
                        const tbody = document.getElementById('jurnal-table-body');
                        if (filtered.length === 0) {
                            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-xs text-slate-500">Belum ada catatan agenda kelas.</td></tr>`;
                            return;
                        }

                        tbody.innerHTML = filtered.map((j, idx) => `
                            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors">
                                <td class="px-4 py-3 text-xs text-slate-500 text-center">${idx + 1}</td>
                                <td class="px-4 py-3 text-xs text-slate-800 dark:text-slate-200 font-semibold">${j.tanggal}</td>
                                <td class="px-4 py-3 text-xs text-slate-800 dark:text-slate-200 font-bold">${j.kelas}</td>
                                <td class="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 text-center">${j.jamKe}</td>
                                <td class="px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200">${j.mapel}</td>
                                <td class="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title="${j.materi}">${j.materi}</td>
                                <td class="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-[150px] truncate" title="${j.kendala}">${j.kendala || '-'}</td>
                                <td class="px-4 py-3 text-xs flex gap-2 no-print">
                                    <button onclick="deleteJournal('${j.id}')" class="p-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors" title="Hapus"><i class="ph ph-trash text-base"></i></button>
                                </td>
                            </tr>
                        `).join('');
                    };

                    contentArea.innerHTML = `
                        <div class="fade-in space-y-6">
                            <!-- Add Form -->
                            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                                <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <i class="ph ph-plus-circle text-orange-500 text-base"></i> Catat Agenda Kelas Baru
                                </h3>
                                
                                <form id="jurnal-form" class="space-y-4">
                                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Tanggal</label>
                                            <input type="date" id="jur-tanggal" value="${new Date().toISOString().substring(0, 10)}" required class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                        </div>
                                        <div>
                                            <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Pilih Kelas</label>
                                            <select id="jur-kelas" class="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                                <option value="VII-A">VII-A</option>
                                                <option value="VII-B">VII-B</option>
                                                <option value="VIII-A">VIII-A</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Jam Ke</label>
                                            <input type="text" id="jur-jam" placeholder="contoh: 1-2" required class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                        </div>
                                        <div>
                                            <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Mata Pelajaran</label>
                                            <input type="text" id="jur-mapel" value="${userProfile.mapel}" required class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div class="md:col-span-1">
                                            <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Uraian Materi Pembelajaran</label>
                                            <textarea id="jur-materi" rows="2" placeholder="Tuliskan materi ajar yang disampaikan..." required class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs"></textarea>
                                        </div>
                                        <div>
                                            <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Hambatan / Catatan Kelas</label>
                                            <textarea id="jur-kendala" rows="2" placeholder="Hambatan/siswa tidak masuk..." class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs"></textarea>
                                        </div>
                                        <div>
                                            <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Tindak Lanjut</label>
                                            <textarea id="jur-tindaklanjut" rows="2" placeholder="Solusi/rencana pertemuan selanjutnya..." class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs"></textarea>
                                        </div>
                                    </div>

                                    <div class="flex justify-end">
                                        <button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-xl text-xs transition-all shadow-md active:scale-98">
                                            Simpan Agenda Mengajar
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <!-- List Jurnal -->
                            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden printable-area">
                                <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center no-print">
                                    <div class="flex gap-2 max-w-xs">
                                        <select id="jur-filter-kelas" onchange="filterJournals()" class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                            <option value="">Semua Kelas</option>
                                            <option value="VII-A">VII-A</option>
                                            <option value="VII-B">VII-B</option>
                                            <option value="VIII-A">VIII-A</option>
                                        </select>
                                    </div>
                                    <button onclick="window.print()" class="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 hover:bg-slate-200">
                                        <i class="ph ph-printer"></i> Cetak Laporan Jurnal
                                    </button>
                                </div>

                                <!-- Printable Header -->
                                <div class="hidden print:block text-center mb-6">
                                    <h2 class="text-lg font-bold uppercase">JURNAL AGENDA HARIAN MENGAJAR GURU</h2>
                                    <p class="text-xs">${schoolSettings.nama} | Tahun Pelajaran ${schoolSettings.tahunAjaran}</p>
                                    <p class="text-xs">Guru: ${userProfile.nama} | NIP: ${userProfile.nip}</p>
                                    <hr class="border-black mt-3">
                                </div>

                                <div class="overflow-x-auto">
                                    <table class="w-full text-left print-card-border">
                                        <thead>
                                            <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                <th class="px-4 py-2.5 w-12 text-center">No</th>
                                                <th class="px-4 py-2.5 w-28">Tanggal</th>
                                                <th class="px-4 py-2.5 w-20">Kelas</th>
                                                <th class="px-4 py-2.5 w-20 text-center">Jam Ke</th>
                                                <th class="px-4 py-2.5 w-32">Mapel</th>
                                                <th class="px-4 py-2.5">Materi</th>
                                                <th class="px-4 py-2.5">Hambatan / Kendala</th>
                                                <th class="px-4 py-2.5 w-20 no-print">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody id="jurnal-table-body">
                                            <!-- list -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    `;

                    document.getElementById('jurnal-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const newLog = {
                            id: 'jur_' + Date.now(),
                            tanggal: document.getElementById('jur-tanggal').value,
                            kelas: document.getElementById('jur-kelas').value,
                            jamKe: document.getElementById('jur-jam').value,
                            mapel: document.getElementById('jur-mapel').value,
                            materi: document.getElementById('jur-materi').value,
                            kendala: document.getElementById('jur-kendala').value,
                            tindakLanjut: document.getElementById('jur-tindaklanjut').value
                        };

                        journals.push(newLog);
                        await dbService.saveData('jurnal', journals);
                        showToast("Agenda mengajar berhasil dicatat!");
                        document.getElementById('jur-materi').value = '';
                        document.getElementById('jur-kendala').value = '';
                        document.getElementById('jur-tindaklanjut').value = '';
                        filterJournals();
                    });

                    window.filterJournals = function () {
                        const val = document.getElementById('jur-filter-kelas').value;
                        const filtered = val ? journals.filter(j => j.kelas === val) : journals;
                        renderJournalTable(filtered);
                    };

                    window.deleteJournal = function (id) {
                        const j = journals.find(jr => jr.id === id);
                        showConfirmDialog("Hapus Jurnal", `Hapus agenda mengajar <strong>${j ? j.kelas + ' - ' + j.materi.substring(0, 40) + '...' : 'ini'}</strong>?`, () => {
                            const idx = journals.findIndex(jr => jr.id === id);
                            if (idx !== -1) {
                                journals.splice(idx, 1);
                                dbService.saveData('jurnal', journals).then(() => {
                                    filterJournals();
                                    showToast("Agenda dihapus.");
                                });
                            }
                        });
                    };

                    renderJournalTable();
                }

                else if (pageTitle === 'Penilaian Siswa') {
                    const students = await dbService.getData('siswa');
                    const grades = await dbService.getData('penilaian');

                    contentArea.innerHTML = `
                        <div class="fade-in space-y-6">
                            <!-- Filters -->
                            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800 flex flex-wrap gap-4 items-end no-print">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Pilih Kelas</label>
                                    <select id="grade-kelas" onchange="loadGrades()" class="px-3.5 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs w-44">
                                        <option value="VII-A">VII-A</option>
                                        <option value="VII-B">VII-B</option>
                                        <option value="VIII-A">VIII-A</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Mata Pelajaran</label>
                                    <input type="text" id="grade-mapel" value="${userProfile.mapel}" oninput="loadGrades()" class="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs w-44">
                                </div>
                                <div class="flex gap-2">
                                    <button onclick="toggleGradeView('input')" id="btn-view-input" class="bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl border border-emerald-600">Form Input</button>
                                    <button onclick="toggleGradeView('ledger')" id="btn-view-ledger" class="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-xl">Rekap Nilai</button>
                                </div>
                            </div>

                            <!-- Input Mode -->
                            <div id="grade-input-view" class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div class="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 class="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Input Nilai Perangkat</h3>
                                </div>
                                
                                <div class="p-2 overflow-x-auto">
                                    <table class="w-full text-left">
                                        <thead>
                                            <tr class="text-[10px] font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800 uppercase">
                                                <th class="px-6 py-2.5 w-12 text-center">No</th>
                                                <th class="px-6 py-2.5">Nama Siswa</th>
                                                <th class="px-4 py-2.5 text-center w-24">Tugas</th>
                                                <th class="px-4 py-2.5 text-center w-24">Ulangan</th>
                                                <th class="px-4 py-2.5 text-center w-24">UTS</th>
                                                <th class="px-4 py-2.5 text-center w-24">UAS</th>
                                            </tr>
                                        </thead>
                                        <tbody id="grade-input-body">
                                            <!-- inputs -->
                                        </tbody>
                                    </table>
                                </div>

                                <div class="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                    <button onclick="saveGrades()" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all active:scale-98">
                                        Simpan Nilai Siswa
                                    </button>
                                </div>
                            </div>

                            <!-- Ledger Mode -->
                            <div id="grade-ledger-view" class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden hidden printable-area">
                                <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center no-print">
                                    <h3 class="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Lembar Rekapitulasi Nilai Siswa</h3>
                                    <button onclick="window.print()" class="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl font-semibold"><i class="ph ph-printer"></i> Cetak Laporan Nilai</button>
                                </div>

                                <div class="hidden print:block text-center mb-6">
                                    <h2 class="text-lg font-bold uppercase">REKAPITULASI DAFTAR NILAI SISWA</h2>
                                    <p class="text-xs" id="print-ledger-info"></p>
                                    <hr class="border-black mt-3">
                                </div>

                                <div class="overflow-x-auto">
                                    <table class="w-full text-left print-card-border">
                                        <thead>
                                            <tr class="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                <th class="px-6 py-2.5 w-12 text-center">No</th>
                                                <th class="px-6 py-2.5">Nama Siswa</th>
                                                <th class="px-4 py-2.5 text-center">Tugas</th>
                                                <th class="px-4 py-2.5 text-center">Ulangan</th>
                                                <th class="px-4 py-2.5 text-center">UTS</th>
                                                <th class="px-4 py-2.5 text-center">UAS</th>
                                                <th class="px-4 py-2.5 text-center">Rata-rata</th>
                                                <th class="px-4 py-2.5 text-center w-24">Predikat</th>
                                                <th class="px-4 py-2.5 text-center w-28">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody id="grade-ledger-body">
                                            <!-- ledger -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    `;

                    window.toggleGradeView = function (mode) {
                        const inpView = document.getElementById('grade-input-view');
                        const ledView = document.getElementById('grade-ledger-view');
                        const btnInp = document.getElementById('btn-view-input');
                        const btnLed = document.getElementById('btn-view-ledger');

                        if (mode === 'input') {
                            inpView.classList.remove('hidden');
                            ledView.classList.add('hidden');
                            btnInp.className = "bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl border border-emerald-600";
                            btnLed.className = "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-xl";
                        } else {
                            inpView.classList.add('hidden');
                            ledView.classList.remove('hidden');
                            btnInp.className = "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-xl";
                            btnLed.className = "bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl border border-emerald-600";
                        }
                    };

                    window.loadGrades = function () {
                        const cls = document.getElementById('grade-kelas').value;
                        const subject = document.getElementById('grade-mapel').value;
                        const classStudents = students.filter(s => s.kelas === cls);

                        document.getElementById('print-ledger-info').innerText = `${schoolSettings.nama} | Mata Pelajaran: ${subject} | Kelas: ${cls} | TA: ${schoolSettings.tahunAjaran}`;

                        // Render Input Form
                        const tbodyInp = document.getElementById('grade-input-body');
                        if (classStudents.length === 0) {
                            tbodyInp.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-xs text-slate-500">Tidak ada data siswa.</td></tr>`;
                        } else {
                            tbodyInp.innerHTML = classStudents.map((s, idx) => {
                                const score = grades.find(g => g.siswaId === s.id && g.kelas === cls && g.mapel === subject) || { tugas: 0, ulangan: 0, uts: 0, uas: 0 };
                                return `
                                    <tr class="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50/50">
                                        <td class="px-6 py-2 text-xs text-slate-500 text-center">${idx + 1}</td>
                                        <td class="px-6 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200">${s.nama}</td>
                                        <td class="px-4 py-2"><input type="number" min="0" max="100" id="tugas-${s.id}" value="${score.tugas}" class="w-20 px-2 py-1 text-center border dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs"></td>
                                        <td class="px-4 py-2"><input type="number" min="0" max="100" id="ulangan-${s.id}" value="${score.ulangan}" class="w-20 px-2 py-1 text-center border dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs"></td>
                                        <td class="px-4 py-2"><input type="number" min="0" max="100" id="uts-${s.id}" value="${score.uts}" class="w-20 px-2 py-1 text-center border dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs"></td>
                                        <td class="px-4 py-2"><input type="number" min="0" max="100" id="uas-${s.id}" value="${score.uas}" class="w-20 px-2 py-1 text-center border dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs"></td>
                                    </tr>
                                `;
                            }).join('');
                        }

                        // Render Ledger (Rekap Nilai)
                        const tbodyLed = document.getElementById('grade-ledger-body');
                        if (classStudents.length === 0) {
                            tbodyLed.innerHTML = `<tr><td colspan="9" class="px-6 py-8 text-center text-xs text-slate-500">Tidak ada data nilai.</td></tr>`;
                        } else {
                            tbodyLed.innerHTML = classStudents.map((s, idx) => {
                                const score = grades.find(g => g.siswaId === s.id && g.kelas === cls && g.mapel === subject) || { tugas: 0, ulangan: 0, uts: 0, uas: 0 };
                                const avg = Math.round((parseInt(score.tugas) + parseInt(score.ulangan) + parseInt(score.uts) + parseInt(score.uas)) / 4);

                                let grade = 'E';
                                if (avg >= 85) grade = 'A';
                                else if (avg >= 75) grade = 'B';
                                else if (avg >= 60) grade = 'C';
                                else if (avg >= 45) grade = 'D';

                                const pass = avg >= 75;

                                return `
                                    <tr class="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50/50">
                                        <td class="px-6 py-3 text-xs text-slate-500 text-center">${idx + 1}</td>
                                        <td class="px-6 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200">${s.nama}</td>
                                        <td class="px-4 py-3 text-xs text-center">${score.tugas}</td>
                                        <td class="px-4 py-3 text-xs text-center">${score.ulangan}</td>
                                        <td class="px-4 py-3 text-xs text-center">${score.uts}</td>
                                        <td class="px-4 py-3 text-xs text-center">${score.uas}</td>
                                        <td class="px-4 py-3 text-xs text-center font-bold">${avg}</td>
                                        <td class="px-4 py-3 text-xs text-center"><span class="font-bold">${grade}</span></td>
                                        <td class="px-4 py-3 text-xs text-center">
                                            <span class="px-2 py-0.5 rounded-full font-bold text-[9px] ${pass ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-orange-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'}">${pass ? 'Lulus KKM' : 'Remedial'}</span>
                                        </td>
                                    </tr>
                                `;
                            }).join('');
                        }
                    };

                    window.saveGrades = async function () {
                        const cls = document.getElementById('grade-kelas').value;
                        const subject = document.getElementById('grade-mapel').value;
                        const classStudents = students.filter(s => s.kelas === cls);

                        classStudents.forEach(s => {
                            const newScore = {
                                id: 'grd_' + cls + '_' + s.id + '_' + Date.now(),
                                kelas: cls,
                                mapel: subject,
                                siswaId: s.id,
                                tugas: parseInt(document.getElementById(`tugas-${s.id}`).value) || 0,
                                ulangan: parseInt(document.getElementById(`ulangan-${s.id}`).value) || 0,
                                uts: parseInt(document.getElementById(`uts-${s.id}`).value) || 0,
                                uas: parseInt(document.getElementById(`uas-${s.id}`).value) || 0
                            };

                            const idx = grades.findIndex(g => g.siswaId === s.id && g.kelas === cls && g.mapel === subject);
                            if (idx !== -1) {
                                grades[idx] = newScore;
                            } else {
                                grades.push(newScore);
                            }
                        });

                        await dbService.saveData('penilaian', grades);
                        showToast("Nilai berhasil disimpan!");
                        loadGrades();
                    };

                    loadGrades();
                }

                else if (pageTitle === 'Cover Administrasi') {
                    contentArea.innerHTML = `
                        <div class="fade-in grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <!-- Left: Form inputs -->
                            <div class="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800 space-y-4 no-print">
                                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <i class="ph ph-note text-orange-500 text-base"></i> Buat Cover Perangkat Pembelajaran
                                </h3>
                                
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Judul Dokumen Utama</label>
                                        <input type="text" id="cov-title" value="BUKU KERJA GURU I" oninput="updateCoverPreview()" class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Sub Judul Dokumen</label>
                                        <input type="text" id="cov-subtitle" value="Rencana Pelaksanaan Pembelajaran (RPP)" oninput="updateCoverPreview()" class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Mata Pelajaran</label>
                                            <input type="text" id="cov-mapel" value="${userProfile.mapel}" oninput="updateCoverPreview()" class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Kelas / Semester</label>
                                            <input type="text" id="cov-kelas" value="Kelas VII / Ganjil" oninput="updateCoverPreview()" class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Nama Pendidik (Guru)</label>
                                            <input type="text" id="cov-guru" value="${userProfile.nama}" oninput="updateCoverPreview()" class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">NIP / NUPTK</label>
                                            <input type="text" id="cov-nip" value="${userProfile.nip}" oninput="updateCoverPreview()" class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                        </div>
                                    </div>
                                </div>

                                <div class="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                    <button onclick="window.print()" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-98">
                                        <i class="ph ph-printer text-base"></i> Cetak Cover A4
                                    </button>
                                </div>
                            </div>

                            <!-- Right: Live A4 Preview Sheet -->
                            <div class="bg-white text-slate-900 p-8 md:p-12 border border-slate-300 shadow-lg rounded-xl max-w-[210mm] w-full min-h-[297mm] mx-auto flex flex-col justify-between items-center text-center printable-area print-card-border" id="cover-preview-sheet">
                                <div class="w-full border-[3px] border-slate-900 p-6 flex flex-col justify-between items-center min-h-[260mm]">
                                    <!-- Header -->
                                    <div class="space-y-2 mt-4">
                                        <h2 class="text-xl md:text-2xl font-extrabold tracking-wide text-slate-900" id="p-cov-main-title">BUKU KERJA GURU I</h2>
                                        <h3 class="text-sm md:text-base font-bold text-slate-800" id="p-cov-subtitle">Rencana Pelaksanaan Pembelajaran (RPP)</h3>
                                        <div class="w-24 h-1 bg-slate-900 mx-auto mt-2"></div>
                                    </div>

                                    <!-- Logo -->
                                    <div class="my-10 flex flex-col items-center">
                                        <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" alt="Logo MTs Idrisiyyah" class="w-28 h-28 object-contain">
                                        <span class="text-[9px] font-bold text-slate-600 tracking-wider uppercase mt-3">Madrasah Terakreditasi A</span>
                                    </div>

                                    <!-- Detail Grid -->
                                    <div class="w-full max-w-sm space-y-4 text-left border-y-2 border-slate-900 py-6 my-4">
                                        <div class="grid grid-cols-3 text-xs">
                                            <span class="font-bold">MATA PELAJARAN</span>
                                            <span class="text-center font-bold w-6">:</span>
                                            <span class="font-semibold col-span-1" id="p-cov-mapel">Informatika</span>
                                        </div>
                                        <div class="grid grid-cols-3 text-xs">
                                            <span class="font-bold">SATUAN PENDIDIKAN</span>
                                            <span class="text-center font-bold w-6">:</span>
                                            <span class="font-semibold col-span-1" id="p-cov-school">${schoolSettings.nama}</span>
                                        </div>
                                        <div class="grid grid-cols-3 text-xs">
                                            <span class="font-bold">KELAS / SEMESTER</span>
                                            <span class="text-center font-bold w-6">:</span>
                                            <span class="font-semibold col-span-1" id="p-cov-kelas">Kelas VII / Ganjil</span>
                                        </div>
                                        <div class="grid grid-cols-3 text-xs">
                                            <span class="font-bold">TAHUN PELAJARAN</span>
                                            <span class="text-center font-bold w-6">:</span>
                                            <span class="font-semibold col-span-1" id="p-cov-year">${schoolSettings.tahunAjaran}</span>
                                        </div>
                                    </div>

                                    <!-- Footer -->
                                    <div class="space-y-4 mb-4">
                                        <div class="space-y-1">
                                            <p class="text-[10px] uppercase font-bold text-slate-400">Pendidik:</p>
                                            <h3 class="text-sm font-extrabold text-slate-900" id="p-cov-guru">Ir. Hermawan, M.Pd.</h3>
                                            <p class="text-xs text-slate-600" id="p-cov-nip">NIP. 197508212005011002</p>
                                        </div>
                                        <div class="pt-4 text-xs font-bold text-slate-800">
                                            YAYASAN IDRISIYYAH TASIKMALAYA<br>
                                            KOTA TASIKMALAYA - JAWA BARAT
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    window.updateCoverPreview = function () {
                        document.getElementById('p-cov-main-title').innerText = document.getElementById('cov-title').value.toUpperCase();
                        document.getElementById('p-cov-subtitle').innerText = document.getElementById('cov-subtitle').value;
                        document.getElementById('p-cov-mapel').innerText = document.getElementById('cov-mapel').value;
                        document.getElementById('p-cov-kelas').innerText = document.getElementById('cov-kelas').value;
                        document.getElementById('p-cov-guru').innerText = document.getElementById('cov-guru').value;
                        document.getElementById('p-cov-nip').innerText = "NIP. " + document.getElementById('cov-nip').value;
                    };

                    updateCoverPreview();
                }

                else if (pageTitle === 'Jadwal Pelajaran') {
                    const schedules = await dbService.getData('jadwal');

                    window.renderSchedule = function () {
                        const container = document.getElementById('schedule-list-container');
                        if (schedules.length === 0) {
                            container.innerHTML = `<p class="text-xs text-slate-500 text-center py-8">Belum ada jadwal terdaftar.</p>`;
                            return;
                        }
                        container.innerHTML = schedules.map(s => `
                            <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-sm">${s.hari.substring(0, 3)}</div>
                                    <div>
                                        <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${s.mapel}</p>
                                        <p class="text-[10px] text-slate-400">${s.kelas} | Jam ${s.jam}</p>
                                    </div>
                                </div>
                                <button onclick="deleteSchedule('${s.id}')" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"><i class="ph ph-trash text-base"></i></button>
                            </div>
                        `).join('');
                    };

                    contentArea.innerHTML = `
                        <div class="fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4">
                                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <i class="ph ph-calendar text-orange-500 text-base"></i> Daftar Jadwal Pembelajaran Anda
                                </h3>
                                <div class="space-y-3" id="schedule-list-container"></div>
                            </div>
                            
                            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4">
                                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <i class="ph ph-plus-circle text-orange-500 text-base"></i> Tambah Jadwal Baru
                                </h3>
                                <form id="sched-form" class="space-y-4">
                                    <div>
                                        <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Hari</label>
                                        <select id="sc-hari" class="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                            <option value="Senin">Senin</option>
                                            <option value="Selasa">Selasa</option>
                                            <option value="Rabu">Rabu</option>
                                            <option value="Kamis">Kamis</option>
                                            <option value="Jumat">Jumat</option>
                                            <option value="Sabtu">Sabtu</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Jam Pelajaran</label>
                                        <input type="text" id="sc-jam" placeholder="contoh: 07:30 - 09:00" required class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Kelas</label>
                                        <input type="text" id="sc-kelas" placeholder="contoh: VII-A" required class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Mata Pelajaran</label>
                                        <input type="text" id="sc-mapel" value="${userProfile.mapel}" required class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                    </div>
                                    <button type="submit" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition-all active:scale-98">Simpan Jadwal</button>
                                </form>
                            </div>
                        </div>
                    `;

                    document.getElementById('sched-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const newSched = {
                            id: 'sch_' + Date.now(),
                            hari: document.getElementById('sc-hari').value,
                            jam: document.getElementById('sc-jam').value,
                            kelas: document.getElementById('sc-kelas').value,
                            mapel: document.getElementById('sc-mapel').value
                        };
                        schedules.push(newSched);
                        await dbService.saveData('jadwal', schedules);
                        showToast("Jadwal mengajar disimpan!");
                        document.getElementById('sc-jam').value = '';
                        document.getElementById('sc-kelas').value = '';
                        renderSchedule();
                    });

                    window.deleteSchedule = function (id) {
                        const idx = schedules.findIndex(s => s.id === id);
                        if (idx !== -1) {
                            schedules.splice(idx, 1);
                            dbService.saveData('jadwal', schedules).then(() => {
                                renderSchedule();
                                showToast("Jadwal dihapus.");
                            });
                        }
                    };

                    renderSchedule();
                }

                else if (pageTitle === 'Kalender Pendidikan') {
                    const events = await dbService.getData('events');

                    window.renderEvents = function () {
                        const container = document.getElementById('events-container');
                        if (events.length === 0) {
                            container.innerHTML = `<p class="text-xs text-slate-500 text-center py-8">Belum ada kegiatan akademik.</p>`;
                            return;
                        }
                        container.innerHTML = events.map(ev => `
                            <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850">
                                <div class="flex items-center gap-3">
                                    <div class="px-2 py-1 rounded-lg text-[9px] font-bold uppercase ${ev.kategori === 'Akademik' ? 'bg-blue-100 text-blue-700' : ev.kategori === 'Ujian' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}">${ev.kategori}</div>
                                    <div>
                                        <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${ev.judul}</p>
                                        <p class="text-[10px] text-slate-400"><i class="ph ph-calendar-blank"></i> ${ev.tanggal}</p>
                                    </div>
                                </div>
                                <button onclick="deleteEvent('${ev.id}')" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"><i class="ph ph-trash text-base"></i></button>
                            </div>
                        `).join('');
                    };

                    contentArea.innerHTML = `
                        <div class="fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4">
                                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <i class="ph ph-calendar-blank text-orange-500 text-base"></i> Kalender Kegiatan Akademik
                                </h3>
                                <div class="space-y-3" id="events-container"></div>
                            </div>
                            
                            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4">
                                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <i class="ph ph-plus-circle text-orange-500 text-base"></i> Tambah Acara Baru
                                </h3>
                                <form id="event-form" class="space-y-4">
                                    <div>
                                        <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Tanggal Acara</label>
                                        <input type="date" id="ev-date" required class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Nama Kegiatan</label>
                                        <input type="text" id="ev-title" placeholder="contoh: Pembagian Rapor Semester Ganjil" required class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Kategori</label>
                                        <select id="ev-cat" class="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-orange-500 text-xs">
                                            <option value="Akademik">Akademik</option>
                                            <option value="Ujian">Ujian</option>
                                            <option value="Kegiatan">Kegiatan Sekolah</option>
                                        </select>
                                    </div>
                                    <button type="submit" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition-all active:scale-98">Simpan Acara</button>
                                </form>
                            </div>
                        </div>
                    `;

                    document.getElementById('event-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const newEv = {
                            id: 'ev_' + Date.now(),
                            tanggal: document.getElementById('ev-date').value,
                            judul: document.getElementById('ev-title').value,
                            kategori: document.getElementById('ev-cat').value
                        };
                        events.push(newEv);
                        await dbService.saveData('events', events);
                        showToast("Kegiatan kalender disimpan!");
                        document.getElementById('ev-title').value = '';
                        renderEvents();
                    });

                    window.deleteEvent = function (id) {
                        const idx = events.findIndex(ev => ev.id === id);
                        if (idx !== -1) {
                            events.splice(idx, 1);
                            dbService.saveData('events', events).then(() => {
                                renderEvents();
                                showToast("Kegiatan dihapus.");
                            });
                        }
                    };

                    renderEvents();
                }

                else if (pageTitle === 'Panduan Kurikulum') {
                    contentArea.innerHTML = `
                        <div class="fade-in space-y-6">
                            <div class="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-6">
                                <div class="flex items-center gap-3 border-b dark:border-slate-700 pb-4">
                                    <div class="p-2.5 bg-orange-500/10 rounded-xl">
                                        <i class="ph ph-books text-orange-500 text-2xl"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">Kurikulum Merdeka</h3>
                                        <p class="text-[11px] text-slate-400">Kurikulum aktif MTs Idrisiyyah Tasikmalaya</p>
                                    </div>
                                </div>

                                <!-- Overview -->
                                <div class="p-5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl border border-orange-200/50 dark:border-orange-800/30">
                                    <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                        <strong class="text-slate-800 dark:text-slate-200">Kurikulum Merdeka</strong> adalah kurikulum dengan pembelajaran yang mengoptimalkan pengembangan karakter, kompetensi esensial, dan fleksibilitas bagi guru untuk melakukan pembelajaran berdiferensiasi sesuai kebutuhan peserta didik. Di madrasah, kurikulum ini diperkaya dengan nilai-nilai keislaman melalui <strong>Profil Pelajar Pancasila Rahmatan Lil Alamin (P5-PPRA)</strong>.
                                    </p>
                                </div>

                                <!-- Prinsip Utama -->
                                <div>
                                    <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                        <i class="ph ph-star text-orange-500"></i> Prinsip Utama
                                    </h4>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div class="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-200/50 dark:border-orange-800/30">
                                            <div class="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-3"><i class="ph ph-target text-xl"></i></div>
                                            <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Fokus Materi Esensial</h5>
                                            <p class="text-[11px] text-slate-500">Mengurangi kepadatan materi agar siswa dapat mendalami konsep secara bermakna.</p>
                                        </div>
                                        <div class="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/30">
                                            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3"><i class="ph ph-arrows-split text-xl"></i></div>
                                            <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Pembelajaran Berdiferensiasi</h5>
                                            <p class="text-[11px] text-slate-500">Guru menyesuaikan metode pembelajaran berdasarkan kebutuhan dan minat siswa.</p>
                                        </div>
                                        <div class="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200/50 dark:border-rose-800/30">
                                            <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-3"><i class="ph ph-heart text-xl"></i></div>
                                            <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Pengembangan Karakter</h5>
                                            <p class="text-[11px] text-slate-500">P5-PPRA: Projek Penguatan Profil Pelajar Pancasila Rahmatan Lil Alamin.</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Komponen Pembelajaran -->
                                <div>
                                    <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                        <i class="ph ph-list-checks text-orange-500"></i> Komponen Perangkat Ajar
                                    </h4>
                                    <div class="space-y-3">
                                        <div class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                                            <div class="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                                            <div>
                                                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Capaian Pembelajaran (CP)</p>
                                                <p class="text-[11px] text-slate-500">Kompetensi yang ditetapkan pemerintah per fase yang harus dicapai peserta didik.</p>
                                            </div>
                                        </div>
                                        <div class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                                            <div class="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                                            <div>
                                                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Alur Tujuan Pembelajaran (ATP)</p>
                                                <p class="text-[11px] text-slate-500">Urutan tujuan pembelajaran yang disusun guru dari CP sebagai panduan pembelajaran.</p>
                                            </div>
                                        </div>
                                        <div class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                                            <div class="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                                            <div>
                                                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Modul Ajar (pengganti RPP)</p>
                                                <p class="text-[11px] text-slate-500">Rencana pembelajaran yang lebih komprehensif: tujuan, kegiatan, dan asesmen.</p>
                                            </div>
                                        </div>
                                        <div class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                                            <div class="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                                            <div>
                                                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)</p>
                                                <p class="text-[11px] text-slate-500">Indikator yang menunjukkan apakah peserta didik telah mencapai tujuan pembelajaran.</p>
                                            </div>
                                        </div>
                                        <div class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                                            <div class="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">5</div>
                                            <div>
                                                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Asesmen Formatif & Sumatif</p>
                                                <p class="text-[11px] text-slate-500">Penilaian proses (formatif) dan hasil akhir (sumatif) untuk mengukur capaian belajar.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Fase -->
                                <div>
                                    <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                        <i class="ph ph-steps text-orange-500"></i> Fase Pembelajaran di Madrasah
                                    </h4>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div class="p-4 border-2 border-orange-500/30 rounded-2xl bg-orange-50/50 dark:bg-orange-950/10">
                                            <div class="flex items-center gap-2 mb-2">
                                                <span class="bg-orange-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full">FASE D</span>
                                                <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Kelas VII - IX (MTs/SMP)</span>
                                            </div>
                                            <ul class="text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
                                                <li>Penguatan literasi & numerasi</li>
                                                <li>Pengenalan berpikir komputasional</li>
                                                <li>Projek P5-PPRA terintegrasi</li>
                                                <li>Pembelajaran berbasis projek</li>
                                            </ul>
                                        </div>
                                        <div class="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl">
                                            <div class="flex items-center gap-2 mb-2">
                                                <span class="bg-slate-400 text-white font-bold text-[10px] px-2.5 py-1 rounded-full">FASE E</span>
                                                <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Kelas X (MA/SMA)</span>
                                            </div>
                                            <ul class="text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
                                                <li>Pengembangan kompetensi lebih mendalam</li>
                                                <li>Pemilihan mata pelajaran pilihan</li>
                                                <li>Projek lanjutan & riset mandiri</li>
                                                <li>Persiapan karir dan pendidikan lanjut</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }

                // === PERANGKAT AJAR PAGES ===
                else if (pageTitle === 'Program Tahunan') {
                    const items = await dbService.getData('prota');
                    window.renderProta = function(list = items) {
                        const c = document.getElementById('items-list');
                        if (!list.length) { c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-file-text text-3xl mb-2"></i><p>Belum ada Program Tahunan.</p></div>`; return; }
                        c.innerHTML = list.map((d, i) => `<div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850">
                            <div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center"><i class="ph ph-file-text text-xl"></i></div>
                            <div><p class="text-xs font-bold text-slate-800 dark:text-slate-200">PROTA ${d.mapel} - Kelas ${d.kelas}</p><p class="text-[10px] text-slate-400">TA ${d.tahunAjaran} | Smt1: ${d.semester1} | Smt2: ${d.semester2}</p></div></div>
                            <button onclick="deleteItem('prota','${d.id}',renderProta,items)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"><i class="ph ph-trash text-base"></i></button></div>`).join('');
                    };
                    contentArea.innerHTML = `<div class="fade-in space-y-6">
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                            <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-orange-500"></i> Tambah Program Tahunan</h3>
                            <form id="item-form" class="space-y-4"><div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Mata Pelajaran</label><input type="text" id="f-mapel" value="${userProfile.mapel}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kelas</label><input type="text" id="f-kelas" placeholder="VII / VIII / IX" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Alokasi Smt 1</label><input type="text" id="f-smt1" placeholder="54 JP" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Alokasi Smt 2</label><input type="text" id="f-smt2" placeholder="54 JP" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                            </div><div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Keterangan</label><input type="text" id="f-ket" placeholder="Fase D - ..." class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                            <div class="flex justify-end"><button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan</button></div></form>
                        </div>
                        <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6"><h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-list text-orange-500 mr-1"></i> Daftar PROTA</h3><div class="space-y-3" id="items-list"></div></div></div>`;
                    document.getElementById('item-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        items.push({ id: 'pr_' + Date.now(), mapel: document.getElementById('f-mapel').value, kelas: document.getElementById('f-kelas').value, tahunAjaran: schoolSettings.tahunAjaran, semester1: document.getElementById('f-smt1').value, semester2: document.getElementById('f-smt2').value, keterangan: document.getElementById('f-ket').value });
                        await dbService.saveData('prota', items); showToast("PROTA disimpan!"); e.target.reset(); document.getElementById('f-mapel').value = userProfile.mapel; renderProta();
                    });
                    renderProta();
                }

                else if (pageTitle === 'Program Semester') {
                    const items = await dbService.getData('promes');
                    window.renderPromes = function(list = items) {
                        const c = document.getElementById('items-list');
                        if (!list.length) { c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-calendar text-3xl mb-2"></i><p>Belum ada Program Semester.</p></div>`; return; }
                        c.innerHTML = `<table class="w-full text-left"><thead><tr class="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800"><th class="px-4 py-2">No</th><th class="px-4 py-2">Bulan</th><th class="px-4 py-2">Kegiatan</th><th class="px-4 py-2 w-20">JP</th><th class="px-4 py-2 w-16 no-print">Aksi</th></tr></thead><tbody>${list.map((d, i) => `<tr class="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50/50"><td class="px-4 py-3 text-xs text-slate-500">${i+1}</td><td class="px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">${d.bulan}</td><td class="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">${d.kegiatan}</td><td class="px-4 py-3 text-xs font-bold text-orange-600">${d.jp}</td><td class="px-4 py-3 no-print"><button onclick="deleteItem('promes','${d.id}',renderPromes,items)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg"><i class="ph ph-trash text-base"></i></button></td></tr>`).join('')}</tbody></table>`;
                    };
                    contentArea.innerHTML = `<div class="fade-in space-y-6">
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                            <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-orange-500"></i> Tambah Kegiatan Bulanan</h3>
                            <form id="item-form" class="space-y-4"><div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Mapel</label><input type="text" id="f-mapel" value="${userProfile.mapel}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kelas</label><input type="text" id="f-kelas" placeholder="VII" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Bulan</label><select id="f-bulan" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"><option>Juli</option><option>Agustus</option><option>September</option><option>Oktober</option><option>November</option><option>Desember</option></select></div>
                                <div class="md:col-span-1"><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kegiatan</label><input type="text" id="f-kegiatan" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">JP</label><input type="text" id="f-jp" placeholder="12" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                            </div><div class="flex justify-end"><button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan</button></div></form>
                        </div>
                        <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6"><h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-list text-orange-500 mr-1"></i> PROMES ${schoolSettings.semester}</h3><div id="items-list"></div></div></div>`;
                    document.getElementById('item-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        items.push({ id: 'pm_' + Date.now(), mapel: document.getElementById('f-mapel').value, kelas: document.getElementById('f-kelas').value, semester: schoolSettings.semester, bulan: document.getElementById('f-bulan').value, kegiatan: document.getElementById('f-kegiatan').value, jp: document.getElementById('f-jp').value });
                        await dbService.saveData('promes', items); showToast("PROMES disimpan!"); e.target.reset(); document.getElementById('f-mapel').value = userProfile.mapel; renderPromes();
                    });
                    renderPromes();
                }

                else if (pageTitle === 'Alur Tujuan Pembelajaran') {
                    const items = await dbService.getData('atp');
                    window.renderAtp = function(list = items) {
                        const c = document.getElementById('items-list');
                        if (!list.length) { c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-path text-3xl mb-2"></i><p>Belum ada ATP.</p></div>`; return; }
                        const sorted = [...list].sort((a,b) => a.urutan - b.urutan);
                        c.innerHTML = sorted.map((d, i) => `<div class="flex gap-3 border-l-2 border-emerald-500 pl-4 py-3">
                            <div class="flex-1"><div class="flex items-center gap-2 mb-1"><span class="bg-emerald-100 dark:bg-emerald-950 text-orange-600 font-bold text-[10px] px-2 py-0.5 rounded-full">#${d.urutan}</span><span class="bg-blue-100 dark:bg-blue-950 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-full">Fase ${d.fase}</span></div>
                            <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${d.tp}</p><p class="text-[10px] text-slate-400 mt-0.5">CP: ${d.cp}</p></div>
                            <button onclick="deleteItem('atp','${d.id}',renderAtp,items)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg h-fit"><i class="ph ph-trash text-base"></i></button></div>`).join('');
                    };
                    contentArea.innerHTML = `<div class="fade-in space-y-6">
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                            <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-orange-500"></i> Tambah Alur Tujuan Pembelajaran</h3>
                            <form id="item-form" class="space-y-4"><div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Fase</label><select id="f-fase" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"><option value="D">D (Kelas VII-IX)</option><option value="E">E (Kelas X-XII)</option></select></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Mapel</label><input type="text" id="f-mapel" value="${userProfile.mapel}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Urutan</label><input type="number" id="f-urutan" value="${items.length + 1}" min="1" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                            </div>
                            <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Capaian Pembelajaran (CP)</label><textarea id="f-cp" rows="2" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500" placeholder="Capaian Pembelajaran dari kurikulum..."></textarea></div>
                            <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Tujuan Pembelajaran (TP)</label><textarea id="f-tp" rows="2" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500" placeholder="Tujuan Pembelajaran yang diturunkan dari CP..."></textarea></div>
                            <div class="flex justify-end"><button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan</button></div></form>
                        </div>
                        <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6"><h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-path text-orange-500 mr-1"></i> Alur Pembelajaran</h3><div class="space-y-3" id="items-list"></div></div></div>`;
                    document.getElementById('item-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        items.push({ id: 'atp_' + Date.now(), fase: document.getElementById('f-fase').value, mapel: document.getElementById('f-mapel').value, cp: document.getElementById('f-cp').value, tp: document.getElementById('f-tp').value, urutan: parseInt(document.getElementById('f-urutan').value) });
                        await dbService.saveData('atp', items); showToast("ATP disimpan!"); e.target.reset(); document.getElementById('f-mapel').value = userProfile.mapel; document.getElementById('f-urutan').value = items.length + 1; renderAtp();
                    });
                    renderAtp();
                }

                else if (pageTitle === 'Modul Ajar') {
                    const items = await dbService.getData('modulAjar');
                    window.renderModul = function(list = items) {
                        const c = document.getElementById('items-list');
                        if (!list.length) { c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-book-open-text text-3xl mb-2"></i><p>Belum ada Modul Ajar.</p></div>`; return; }
                        c.innerHTML = list.map(d => `<div class="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850">
                            <div class="flex items-start justify-between"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center"><i class="ph ph-book-open-text text-xl"></i></div>
                            <div><p class="text-xs font-bold text-slate-800 dark:text-slate-200">${d.mapel} - Kelas ${d.kelas} (Fase ${d.fase})</p><p class="text-[10px] text-slate-400">${d.alokasiWaktu}</p></div></div>
                            <button onclick="deleteItem('modulAjar','${d.id}',renderModul,items)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg"><i class="ph ph-trash text-base"></i></button></div>
                            <p class="text-[10px] text-slate-500 mt-2 line-clamp-2">${d.tujuan}</p></div>`).join('');
                    };
                    contentArea.innerHTML = `<div class="fade-in space-y-6">
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                            <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-orange-500"></i> Buat Modul Ajar</h3>
                            <form id="item-form" class="space-y-4">
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Mapel</label><input type="text" id="f-mapel" value="${userProfile.mapel}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kelas</label><input type="text" id="f-kelas" placeholder="VII" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Fase</label><select id="f-fase" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"><option value="D">D</option><option value="E">E</option></select></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Alokasi Waktu</label><input type="text" id="f-alokasi" placeholder="2 x 40 menit" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                            </div>
                            <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Tujuan Pembelajaran</label><textarea id="f-tujuan" rows="2" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500" placeholder="Peserta didik mampu..."></textarea></div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Pendahuluan</label><textarea id="f-pendahuluan" rows="3" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500" placeholder="Apersepsi, motivasi..."></textarea></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kegiatan Inti</label><textarea id="f-inti" rows="3" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500" placeholder="Diskusi, praktik..."></textarea></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Penutup</label><textarea id="f-penutup" rows="3" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500" placeholder="Refleksi, penugasan..."></textarea></div>
                            </div>
                            <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Asesmen</label><input type="text" id="f-asesmen" placeholder="Formatif: ..., Sumatif: ..." class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                            <div class="flex justify-end"><button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan Modul</button></div></form>
                        </div>
                        <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6"><h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-list text-orange-500 mr-1"></i> Daftar Modul Ajar</h3><div class="space-y-3" id="items-list"></div></div></div>`;
                    document.getElementById('item-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        items.push({ id: 'ma_' + Date.now(), mapel: document.getElementById('f-mapel').value, kelas: document.getElementById('f-kelas').value, fase: document.getElementById('f-fase').value, alokasiWaktu: document.getElementById('f-alokasi').value, tujuan: document.getElementById('f-tujuan').value, pendahuluan: document.getElementById('f-pendahuluan').value, inti: document.getElementById('f-inti').value, penutup: document.getElementById('f-penutup').value, asesmen: document.getElementById('f-asesmen').value });
                        await dbService.saveData('modulAjar', items); showToast("Modul Ajar disimpan!"); e.target.reset(); document.getElementById('f-mapel').value = userProfile.mapel; renderModul();
                    });
                    renderModul();
                }

                else if (pageTitle === 'Bahan Ajar') {
                    const items = await dbService.getData('bahanAjar');
                    window.renderBA = function(list = items) {
                        const c = document.getElementById('items-list');
                        if (!list.length) { c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-book-open text-3xl mb-2"></i><p>Belum ada Bahan Ajar.</p></div>`; return; }
                        c.innerHTML = list.map(d => `<div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850">
                            <div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center"><i class="ph ph-book-open text-xl"></i></div>
                            <div><p class="text-xs font-bold text-slate-800 dark:text-slate-200">${d.judul}</p><p class="text-[10px] text-slate-400">${d.mapel} | Kelas ${d.kelas} | ${d.jenis}</p></div></div>
                            <button onclick="deleteItem('bahanAjar','${d.id}',renderBA,items)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg"><i class="ph ph-trash text-base"></i></button></div>`).join('');
                    };
                    contentArea.innerHTML = `<div class="fade-in space-y-6">
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                            <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-orange-500"></i> Tambah Bahan Ajar</h3>
                            <form id="item-form" class="space-y-4"><div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Judul</label><input type="text" id="f-judul" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Mapel</label><input type="text" id="f-mapel" value="${userProfile.mapel}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kelas</label><input type="text" id="f-kelas" placeholder="VII" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Jenis</label><select id="f-jenis" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"><option>Handout</option><option>LKS</option><option>Modul</option><option>Presentasi</option></select></div>
                            </div><div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Ringkasan Materi</label><textarea id="f-ringkasan" rows="3" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></textarea></div>
                            <div class="flex justify-end"><button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan</button></div></form>
                        </div>
                        <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6"><h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-list text-orange-500 mr-1"></i> Daftar Bahan Ajar</h3><div class="space-y-3" id="items-list"></div></div></div>`;
                    document.getElementById('item-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        items.push({ id: 'ba_' + Date.now(), judul: document.getElementById('f-judul').value, mapel: document.getElementById('f-mapel').value, kelas: document.getElementById('f-kelas').value, jenis: document.getElementById('f-jenis').value, ringkasan: document.getElementById('f-ringkasan').value });
                        await dbService.saveData('bahanAjar', items); showToast("Bahan Ajar disimpan!"); e.target.reset(); document.getElementById('f-mapel').value = userProfile.mapel; renderBA();
                    });
                    renderBA();
                }

                else if (pageTitle === 'Lembar Kerja Peserta Didik') {
                    const items = await dbService.getData('lkpd');
                    window.renderLKPD = function(list = items) {
                        const c = document.getElementById('items-list');
                        if (!list.length) { c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-clipboard-text text-3xl mb-2"></i><p>Belum ada LKPD.</p></div>`; return; }
                        c.innerHTML = list.map(d => `<div class="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850">
                            <div class="flex items-start justify-between"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center"><i class="ph ph-clipboard-text text-xl"></i></div>
                            <div><p class="text-xs font-bold text-slate-800 dark:text-slate-200">${d.judul}</p><p class="text-[10px] text-slate-400">${d.mapel} | Kelas ${d.kelas}</p></div></div>
                            <button onclick="deleteItem('lkpd','${d.id}',renderLKPD,items)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg"><i class="ph ph-trash text-base"></i></button></div>
                            <p class="text-[10px] text-slate-500 mt-2">${d.tujuan}</p></div>`).join('');
                    };
                    contentArea.innerHTML = `<div class="fade-in space-y-6">
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                            <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-orange-500"></i> Buat LKPD</h3>
                            <form id="item-form" class="space-y-4"><div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Judul LKPD</label><input type="text" id="f-judul" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Mapel</label><input type="text" id="f-mapel" value="${userProfile.mapel}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kelas</label><input type="text" id="f-kelas" placeholder="VII" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                            </div>
                            <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Tujuan Pembelajaran</label><textarea id="f-tujuan" rows="2" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></textarea></div>
                            <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Instruksi Kegiatan</label><textarea id="f-instruksi" rows="4" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500" placeholder="1. Langkah pertama...\n2. Langkah kedua..."></textarea></div>
                            <div class="flex justify-end"><button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan LKPD</button></div></form>
                        </div>
                        <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6"><h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-list text-orange-500 mr-1"></i> Daftar LKPD</h3><div class="space-y-3" id="items-list"></div></div></div>`;
                    document.getElementById('item-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        items.push({ id: 'lk_' + Date.now(), judul: document.getElementById('f-judul').value, mapel: document.getElementById('f-mapel').value, kelas: document.getElementById('f-kelas').value, tujuan: document.getElementById('f-tujuan').value, instruksi: document.getElementById('f-instruksi').value });
                        await dbService.saveData('lkpd', items); showToast("LKPD disimpan!"); e.target.reset(); document.getElementById('f-mapel').value = userProfile.mapel; renderLKPD();
                    });
                    renderLKPD();
                }

                else if (pageTitle === 'Program Asesmen') {
                    const items = await dbService.getData('programAsesmen');
                    window.renderPA = function(list = items) {
                        const c = document.getElementById('items-list');
                        if (!list.length) { c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-exam text-3xl mb-2"></i><p>Belum ada Program Asesmen.</p></div>`; return; }
                        c.innerHTML = list.map(d => `<div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850">
                            <div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-${d.jenis === 'Formatif' ? 'emerald' : 'amber'}-500/10 text-${d.jenis === 'Formatif' ? 'emerald' : 'amber'}-600 flex items-center justify-center"><i class="ph ph-exam text-xl"></i></div>
                            <div><p class="text-xs font-bold text-slate-800 dark:text-slate-200">${d.mapel} - Kelas ${d.kelas}</p><p class="text-[10px] text-slate-400">${d.jenis} | ${d.teknik} | ${d.waktu}</p></div></div>
                            <button onclick="deleteItem('programAsesmen','${d.id}',renderPA,items)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg"><i class="ph ph-trash text-base"></i></button></div>`).join('');
                    };
                    contentArea.innerHTML = `<div class="fade-in space-y-6">
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                            <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-orange-500"></i> Tambah Program Asesmen</h3>
                            <form id="item-form" class="space-y-4"><div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Mapel</label><input type="text" id="f-mapel" value="${userProfile.mapel}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kelas</label><input type="text" id="f-kelas" placeholder="VII" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Jenis</label><select id="f-jenis" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"><option>Formatif</option><option>Sumatif</option><option>Diagnostik</option></select></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Teknik</label><input type="text" id="f-teknik" placeholder="Observasi, Tes Tulis..." required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Waktu</label><input type="text" id="f-waktu" placeholder="Setiap pertemuan" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                            </div>
                            <div class="flex justify-end"><button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan</button></div></form>
                        </div>
                        <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6"><h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-list text-orange-500 mr-1"></i> Daftar Program Asesmen</h3><div class="space-y-3" id="items-list"></div></div></div>`;
                    document.getElementById('item-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        items.push({ id: 'pa_' + Date.now(), mapel: document.getElementById('f-mapel').value, kelas: document.getElementById('f-kelas').value, jenis: document.getElementById('f-jenis').value, teknik: document.getElementById('f-teknik').value, waktu: document.getElementById('f-waktu').value });
                        await dbService.saveData('programAsesmen', items); showToast("Program Asesmen disimpan!"); e.target.reset(); document.getElementById('f-mapel').value = userProfile.mapel; renderPA();
                    });
                    renderPA();
                }

                else if (pageTitle === 'Kriteria Ketercapaian Tujuan Pembelajaran') {
                    const items = await dbService.getData('kktp');
                    window.renderKKTP = function(list = items) {
                        const c = document.getElementById('items-list');
                        if (!list.length) { c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-check-square text-3xl mb-2"></i><p>Belum ada KKTP.</p></div>`; return; }
                        c.innerHTML = list.map(d => `<div class="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850">
                            <div class="flex items-start justify-between"><div><p class="text-xs font-bold text-slate-800 dark:text-slate-200">${d.mapel} - Kelas ${d.kelas}</p><p class="text-[10px] text-orange-600 font-semibold mt-0.5">TP: ${d.tp}</p></div>
                            <button onclick="deleteItem('kktp','${d.id}',renderKKTP,items)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg"><i class="ph ph-trash text-base"></i></button></div>
                            <p class="text-[10px] text-slate-500 mt-2">${d.kriteria}</p></div>`).join('');
                    };
                    contentArea.innerHTML = `<div class="fade-in space-y-6">
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                            <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-orange-500"></i> Tambah KKTP</h3>
                            <form id="item-form" class="space-y-4"><div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Mapel</label><input type="text" id="f-mapel" value="${userProfile.mapel}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div class="md:col-span-2"><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kelas</label><input type="text" id="f-kelas" placeholder="VII" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                            </div>
                            <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Tujuan Pembelajaran</label><textarea id="f-tp" rows="2" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></textarea></div>
                            <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kriteria / Indikator Ketercapaian</label><textarea id="f-kriteria" rows="3" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500" placeholder="Pisahkan dengan koma untuk beberapa kriteria..."></textarea></div>
                            <div class="flex justify-end"><button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan KKTP</button></div></form>
                        </div>
                        <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6"><h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-list text-orange-500 mr-1"></i> Daftar KKTP</h3><div class="space-y-3" id="items-list"></div></div></div>`;
                    document.getElementById('item-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        items.push({ id: 'kk_' + Date.now(), mapel: document.getElementById('f-mapel').value, kelas: document.getElementById('f-kelas').value, tp: document.getElementById('f-tp').value, kriteria: document.getElementById('f-kriteria').value });
                        await dbService.saveData('kktp', items); showToast("KKTP disimpan!"); e.target.reset(); document.getElementById('f-mapel').value = userProfile.mapel; renderKKTP();
                    });
                    renderKKTP();
                }

                // === ASESMEN PAGES ===
                else if (pageTitle === 'Bank Soal') {
                    const items = await dbService.getData('bankSoal');
                    window.renderBS = function(list = items) {
                        const c = document.getElementById('items-list');
                        if (!list.length) { c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-question text-3xl mb-2"></i><p>Belum ada soal.</p></div>`; return; }
                        c.innerHTML = list.map((d, i) => `<div class="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850">
                            <div class="flex items-start justify-between mb-2"><div class="flex items-center gap-2"><span class="bg-emerald-100 dark:bg-emerald-950 text-orange-600 font-bold text-[10px] px-2 py-0.5 rounded-full">${d.jenis}</span><span class="text-[10px] text-slate-400">${d.mapel} | Kelas ${d.kelas}</span></div>
                            <button onclick="deleteItem('bankSoal','${d.id}',renderBS,items)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg"><i class="ph ph-trash text-base"></i></button></div>
                            <p class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">${d.soal}</p>
                            ${d.jenis === 'PG' ? `<div class="grid grid-cols-2 gap-1 text-[10px]"><span class="p-1.5 rounded ${d.kunci === 'A' ? 'bg-emerald-100 text-emerald-700 font-bold' : 'text-slate-500'}">A. ${d.pilihanA}</span><span class="p-1.5 rounded ${d.kunci === 'B' ? 'bg-emerald-100 text-emerald-700 font-bold' : 'text-slate-500'}">B. ${d.pilihanB}</span></div>` : ''}
                            ${d.pembahasan ? `<p class="text-[10px] text-slate-400 mt-2 italic">Pembahasan: ${d.pembahasan}</p>` : ''}</div>`).join('');
                    };
                    contentArea.innerHTML = `<div class="fade-in space-y-6">
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                            <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-orange-500"></i> Tambah Soal</h3>
                            <form id="item-form" class="space-y-4"><div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Mapel</label><input type="text" id="f-mapel" value="${userProfile.mapel}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kelas</label><input type="text" id="f-kelas" placeholder="VII" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Jenis Soal</label><select id="f-jenis" onchange="togglePGFields()" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"><option value="PG">Pilihan Ganda</option><option value="Esai">Esai</option><option value="Uraian">Uraian</option></select></div>
                            </div>
                            <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Soal</label><textarea id="f-soal" rows="2" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></textarea></div>
                            <div id="pg-fields" class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Pilihan A</label><input type="text" id="f-a" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div><div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Pilihan B</label><input type="text" id="f-b" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div></div>
                            <div class="grid grid-cols-2 gap-4"><div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kunci Jawaban</label><input type="text" id="f-kunci" placeholder="A/B/C/D atau teks" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div><div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Pembahasan</label><input type="text" id="f-pembahasan" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div></div>
                            <div class="flex justify-end"><button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan Soal</button></div></form>
                        </div>
                        <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6"><h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-list text-orange-500 mr-1"></i> Bank Soal</h3><div class="space-y-3" id="items-list"></div></div></div>`;
                    window.togglePGFields = function() { const pg = document.getElementById('pg-fields'); pg.style.display = document.getElementById('f-jenis').value === 'PG' ? '' : 'none'; };
                    document.getElementById('item-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        items.push({ id: 'bs_' + Date.now(), mapel: document.getElementById('f-mapel').value, kelas: document.getElementById('f-kelas').value, jenis: document.getElementById('f-jenis').value, soal: document.getElementById('f-soal').value, pilihanA: document.getElementById('f-a').value, pilihanB: document.getElementById('f-b').value, kunci: document.getElementById('f-kunci').value, pembahasan: document.getElementById('f-pembahasan').value });
                        await dbService.saveData('bankSoal', items); showToast("Soal disimpan!"); e.target.reset(); document.getElementById('f-mapel').value = userProfile.mapel; renderBS();
                    });
                    renderBS();
                }

                else if (pageTitle === 'Kisi-Kisi Soal') {
                    const items = await dbService.getData('kisiSoal');
                    window.renderKS = function(list = items) {
                        const c = document.getElementById('items-list');
                        if (!list.length) { c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-table text-3xl mb-2"></i><p>Belum ada kisi-kisi.</p></div>`; return; }
                        c.innerHTML = `<table class="w-full text-left"><thead><tr class="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800"><th class="px-3 py-2">No</th><th class="px-3 py-2">KD/TP</th><th class="px-3 py-2">Indikator</th><th class="px-3 py-2">Level</th><th class="px-3 py-2">Bentuk</th><th class="px-3 py-2 w-12 no-print"></th></tr></thead><tbody>${list.map((d, i) => `<tr class="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50/50"><td class="px-3 py-3 text-xs text-slate-500">${i+1}</td><td class="px-3 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">${d.kd}</td><td class="px-3 py-3 text-xs text-slate-600 dark:text-slate-400">${d.indikator}</td><td class="px-3 py-3 text-xs"><span class="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 rounded-full text-[9px] font-bold">${d.level}</span></td><td class="px-3 py-3 text-xs">${d.bentuk}</td><td class="px-3 py-3 no-print"><button onclick="deleteItem('kisiSoal','${d.id}',renderKS,items)" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg"><i class="ph ph-trash text-sm"></i></button></td></tr>`).join('')}</tbody></table>`;
                    };
                    contentArea.innerHTML = `<div class="fade-in space-y-6">
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                            <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-orange-500"></i> Tambah Kisi-Kisi Soal</h3>
                            <form id="item-form" class="space-y-4"><div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Mapel</label><input type="text" id="f-mapel" value="${userProfile.mapel}" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kelas</label><input type="text" id="f-kelas" placeholder="VII" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div class="md:col-span-3"><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">KD / Tujuan Pembelajaran</label><input type="text" id="f-kd" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                            </div><div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Indikator Soal</label><input type="text" id="f-indikator" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Level Kognitif</label><select id="f-level" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"><option>C1 (Mengingat)</option><option>C2 (Memahami)</option><option>C3 (Menerapkan)</option><option>C4 (Menganalisis)</option><option>C5 (Mengevaluasi)</option><option>C6 (Mencipta)</option></select></div>
                                <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Bentuk Soal</label><select id="f-bentuk" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"><option>PG</option><option>Esai</option><option>Uraian</option><option>Praktik</option></select></div>
                            </div>
                            <div class="flex justify-end"><button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan</button></div></form>
                        </div>
                        <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6"><h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-table text-orange-500 mr-1"></i> Tabel Kisi-Kisi</h3><div id="items-list"></div></div></div>`;
                    document.getElementById('item-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        items.push({ id: 'ks_' + Date.now(), mapel: document.getElementById('f-mapel').value, kelas: document.getElementById('f-kelas').value, kd: document.getElementById('f-kd').value, indikator: document.getElementById('f-indikator').value, level: document.getElementById('f-level').value, bentuk: document.getElementById('f-bentuk').value });
                        await dbService.saveData('kisiSoal', items); showToast("Kisi-kisi disimpan!"); e.target.reset(); document.getElementById('f-mapel').value = userProfile.mapel; renderKS();
                    });
                    renderKS();
                }

                else if (pageTitle === 'Analisis Butir Soal') {
                    contentArea.innerHTML = `<div class="fade-in space-y-6">
                        <div class="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
                            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b dark:border-slate-700 pb-3 mb-5"><i class="ph ph-chart-bar text-orange-500 text-lg"></i> Analisis Butir Soal</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase">Input Kunci Jawaban</h4>
                                    <div class="space-y-3">
                                        <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Jumlah Soal</label><input type="number" id="anal-jumlah" value="20" min="5" max="50" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></div>
                                        <div><label class="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Kunci Jawaban (pisahkan koma)</label><textarea id="anal-kunci" rows="3" placeholder="A,B,C,D,A,B,C,D,A,B..." class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-orange-500"></textarea></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase">Panduan Interpretasi</h4>
                                    <div class="space-y-2 text-[11px]">
                                        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-orange-500"></span><span class="text-slate-600 dark:text-slate-400"><strong>Tingkat Kesukaran:</strong> 0.3 - 0.7 (Baik)</span></div>
                                        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-500"></span><span class="text-slate-600 dark:text-slate-400"><strong>Daya Beda:</strong> > 0.3 (Diterima)</span></div>
                                        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-500"></span><span class="text-slate-600 dark:text-slate-400"><strong>Pengecoh:</strong> Minimal 25% memilih</span></div>
                                    </div>
                                    <div class="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/30">
                                        <p class="text-[10px] text-amber-700 dark:text-amber-400"><i class="ph ph-info mr-1"></i> Fitur analisis butir soal akan tersedia setelah data jawaban siswa diintegrasikan. Saat ini Anda dapat menginput kunci jawaban sebagai referensi.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                }

                // Default Fallback Repository for document/assessment listings
                else {
                    const docs = await dbService.getData('documents');

                    window.renderDocs = function () {
                        const container = document.getElementById('docs-list-container');
                        if (docs.length === 0) {
                            container.innerHTML = `<p class="text-xs text-slate-500 text-center py-8">Belum ada berkas terunggah.</p>`;
                            return;
                        }
                        const filtered = docs.filter(d => d.tipe === pageTitle || pageTitle === 'Bank Soal' || pageTitle === 'Kisi-Kisi Soal');
                        container.innerHTML = filtered.map(d => `
                            <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center"><i class="ph ph-file-pdf text-xl"></i></div>
                                    <div>
                                        <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${d.nama}</p>
                                        <p class="text-[10px] text-slate-400">${d.ukuran} | Diunggah pada ${d.tanggal}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <a href="#" onclick="alert('Mengunduh berkas...')" class="p-1 bg-orange-500/10 text-orange-600 hover:bg-orange-500 hover:text-white rounded-lg transition-colors" title="Unduh"><i class="ph ph-download text-base"></i></a>
                                    <button onclick="deleteDoc('${d.id}')" class="p-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors" title="Hapus"><i class="ph ph-trash text-base"></i></button>
                                </div>
                            </div>
                        `).join('');
                    };

                    contentArea.innerHTML = `
                        <div class="fade-in space-y-6">
                            <div class="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-6">
                                <div class="flex justify-between items-center border-b dark:border-slate-700 pb-3">
                                    <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <i class="ph ph-folder text-orange-500 text-lg"></i> Berkas Perangkat Ajar: ${pageTitle}
                                    </h3>
                                    <button onclick="uploadDocModal()" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-1.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                                        <i class="ph ph-upload text-base"></i> Unggah Berkas Baru
                                    </button>
                                </div>

                                <div class="space-y-3.5" id="docs-list-container">
                                    <!-- Files list -->
                                </div>
                            </div>
                        </div>
                    `;

                    window.uploadDocModal = function () {
                        const formBody = `
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Nama Berkas Perangkat</label>
                                <input type="text" id="doc-upload-name" placeholder="contoh: Modul Ajar Informatika VII Ganjil" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-xs focus:border-orange-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Simulasi Pilih Berkas PDF/DOC</label>
                                <input type="file" disabled class="w-full px-3 py-2 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                                <p class="text-[10px] text-slate-400 mt-1">Hanya mendukung PDF, Word, Excel maksimal 10MB.</p>
                            </div>
                        `;

                        openModal("Unggah Berkas Baru", formBody, "Unggah", async () => {
                            const newDoc = {
                                id: 'doc_' + Date.now(),
                                tipe: pageTitle,
                                nama: document.getElementById('doc-upload-name').value + '.pdf',
                                ukuran: '1.2 MB',
                                tanggal: new Date().toISOString().substring(0, 10)
                            };

                            docs.push(newDoc);
                            await dbService.saveData('documents', docs);
                            closeModal();
                            renderDocs();
                            showToast("Berkas perangkat pembelajaran berhasil diunggah!");
                        });
                    };

                    window.deleteDoc = function (id) {
                        const idx = docs.findIndex(d => d.id === id);
                        if (idx !== -1) {
                            docs.splice(idx, 1);
                            dbService.saveData('documents', docs).then(() => {
                                renderDocs();
                                showToast("Berkas dihapus.");
                            });
                        }
                    };

                    renderDocs();
                }
            } catch (e) {
                console.error("Gagal merender konten halaman:", e);
                contentArea.innerHTML = `
                    <div class="fade-in bg-rose-50 dark:bg-rose-950/20 p-6 rounded-3xl border border-rose-200 dark:border-rose-800 text-center py-10 max-w-lg mx-auto">
                        <i class="ph ph-warning-octagon text-rose-500 text-4xl mb-3"></i>
                        <h4 class="font-bold text-rose-800 dark:text-rose-200 mb-2">Terjadi Kesalahan</h4>
                        <p class="text-xs text-rose-600 dark:text-rose-400 mb-4">Gagal meload modul halaman ${pageTitle}. Pastikan database lokal tidak korup.</p>
                        <button onclick="window.loadPage('${pageTitle}')" class="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Coba Lagi</button>
                    </div>
                `;
            }
        };

        // 9. LOGIC AUTENTIKASI
        function getFirebaseAuthMessage(errorCode, defaultMessage) {
            const messages = {
                'auth/user-not-found': 'Akun dengan email ini belum terdaftar. Hubungi administrator.',
                'auth/wrong-password': 'Kata sandi yang Anda masukkan salah.',
                'auth/invalid-email': 'Format alamat email tidak valid.',
                'auth/user-disabled': 'Akun ini telah dinonaktifkan oleh administrator.',
                'auth/too-many-requests': 'Terlalu banyak percobaan gagal. Silakan tunggu beberapa menit.',
                'auth/network-request-failed': 'Tidak ada koneksi internet. Periksa jaringan Anda.',
                'auth/invalid-credential': 'Email atau password salah. Pastikan kredensial Anda benar.',
                'auth/operation-not-allowed': 'Login dengan email/password belum diaktifkan di Firebase Console.',
                'auth/internal-error': 'Terjadi kesalahan internal server. Silakan coba lagi.',
            };
            return messages[errorCode] || defaultMessage || 'Terjadi kesalahan tidak terduga.';
        }

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const pass = document.getElementById('password').value;
            const btn = document.getElementById('login-btn');
            const errDiv = document.getElementById('login-error');

            btn.innerHTML = `<i class="ph ph-spinner animate-spin text-xl"></i>`;
            btn.disabled = true;
            errDiv.classList.add('hidden');

            try {
                if (useMockDb) {
                    // Bypass login di mode Demo / LocalStorage
                    currentUser = { uid: 'demo-user', email: email };
                    userProfile = await dbService.getProfile('demo-user');
                    console.log("Login berhasil (mode Lokal). User:", email);
                    onUserAuthenticated();
                } else {
                    if (isPreviewEnv && typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        console.log("Login via Custom Token (preview environment)...");
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } else if (isPreviewEnv) {
                        console.log("Login via Anonymous (preview environment)...");
                        await signInAnonymously(auth);
                    } else {
                        console.log("Login via Email/Password...");
                        const credential = await signInWithEmailAndPassword(auth, email, pass);
                        console.log("Login berhasil (Firebase). UID:", credential.user.uid);
                    }
                }
            } catch (error) {
                console.error("Login gagal:", error.code || "unknown", error.message);
                const errorMessage = getFirebaseAuthMessage(error.code, error.message);
                errDiv.innerText = errorMessage;
                errDiv.classList.remove('hidden');
                btn.innerHTML = `<span>Masuk</span>`;
                btn.disabled = false;
            }
        });

        document.getElementById('logout-btn').addEventListener('click', async () => {
            if (auth) {
                try {
                    await signOut(auth);
                    console.log("User berhasil logout dari Firebase.");
                } catch (e) {
                    console.error("SignOut gagal:", e);
                }
            }
            useMockDb = !isFirebaseConfigured; // Reset ke state semula
            currentUser = null;
            onUserLoggedOut();
            console.log("Sesi berakhir, kembali ke halaman login.");
        });

        if (!useMockDb && auth) {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    console.log("Auth state: User login terdeteksi. UID:", user.uid, "Email:", user.email || "(anonim)");
                    currentUser = user;
                    try {
                        userProfile = await dbService.getProfile(user.uid);
                    } catch (e) {
                        console.warn("Gagal load profil user, gunakan default:", e);
                        userProfile = { nama: "Guru Pendidik", nip: "-", mapel: "-" };
                    }
                    onUserAuthenticated();
                } else {
                    console.log("Auth state: Tidak ada user yang login.");
                    currentUser = null;
                    onUserLoggedOut();
                }
            });
        } else {
            console.log("Mode lokal aktif - auth state listener tidak diperlukan.");
        }

        function onUserAuthenticated() {
            updateUIProfileInfo();
            loginView.classList.add('hidden');
            appView.classList.remove('hidden');

            renderSidebar();
            window.loadPage('Dashboard');
        }

        function onUserLoggedOut() {
            loginView.classList.remove('hidden');
            appView.classList.add('hidden');
            document.getElementById('login-btn').innerHTML = `<span>Masuk</span>`;
            document.getElementById('login-btn').disabled = false;
        }

        function updateUIProfileInfo() {
            const nama = (userProfile && typeof userProfile.nama === 'string' && userProfile.nama.trim() !== '') ? userProfile.nama : "Guru Pendidik";
            
            const sidebarName = document.getElementById('sidebar-user-name');
            if (sidebarName) sidebarName.innerText = nama;
            
            const topbarName = document.getElementById('topbar-user-name');
            if (topbarName) topbarName.innerText = nama;
            
            const userInitial = document.getElementById('user-initial');
            if (userInitial) userInitial.innerText = nama.charAt(0).toUpperCase();
        }

        // 10. DARK MODE TOGGLE & INITIALIZATION
        window.toggleDarkMode = function () {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('tradisi_theme', isDark ? 'dark' : 'light');
            updateThemeIcon();
        };

        function updateThemeIcon() {
            const icon = document.getElementById('theme-toggle-icon');
            if (icon) {
                const isDark = document.documentElement.classList.contains('dark');
                icon.className = isDark ? 'ph ph-sun text-lg' : 'ph ph-moon text-lg';
            }
        }
        updateThemeIcon();

        // 11. MOBILE SIDEBAR INTERACTION
        const sidebar = document.getElementById('sidebar');
        const mobileOverlay = document.getElementById('mobile-overlay');

        window.toggleSidebar = function (show) {
            if (show) {
                sidebar.classList.remove('-translate-x-full');
                mobileOverlay.classList.remove('hidden');
            } else {
                sidebar.classList.add('-translate-x-full');
                mobileOverlay.classList.add('hidden');
            }
        };

        document.getElementById('open-sidebar').addEventListener('click', () => toggleSidebar(true));
        document.getElementById('close-sidebar').addEventListener('click', () => toggleSidebar(false));
        mobileOverlay.addEventListener('click', () => toggleSidebar(false));

        renderSidebar();