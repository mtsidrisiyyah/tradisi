// ============================================
// TRADISI — Database Service Module
// ============================================
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { db, useMockDb, getUserDocPath, getCollectionPath } from '../config/firebase.js';

// Seed data for LocalStorage fallback
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
    profiles: [
        { id: "demo-user", email: "demo@tradisi.app", nama: "Ir. Hermawan, M.Pd.", nip: "197508212005011002", mapel: "Informatika", roles: ["super_admin", "guru"], activeRole: "super_admin", status: "aktif" },
        { id: "u2", email: "ahmads@idrisiyyah.sch.id", nama: "Ahmad Sufyan, S.Ag.", nip: "198009122008021004", mapel: "Fikih", roles: ["guru"], activeRole: "guru", status: "aktif" },
        { id: "u3", email: "operator@idrisiyyah.sch.id", nama: "Novi Haryati, S.Kom.", nip: "199201082015032001", mapel: "Informatika", roles: ["operator"], activeRole: "operator", status: "aktif" },
        { id: "u4", email: "calonguru@idrisiyyah.sch.id", nama: "Zainal Abidin, S.Pd.", nip: "-", mapel: "Matematika", roles: ["guru"], activeRole: "guru", status: "menunggu_persetujuan" }
    ],
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
        { id: "p13", kelas: "VIII-A", mapel: "Informatika", siswaId: "s17", tugas: 82, py: 78, uts: 80, uas: 81 }
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
    ],
    teachers: [
        { id: "t1", nip: "197508212005011002", nuptk: "1234567890123456", nama: "Ir. Hermawan, M.Pd.", jk: "L", statusKepegawaian: "PNS", jabatan: "Waka Kurikulum", hp: "081234567890", email: "demo@tradisi.app", status: "aktif" },
        { id: "t2", nip: "198009122008021004", nuptk: "9876543210987654", nama: "Ahmad Sufyan, S.Ag.", jk: "L", statusKepegawaian: "PNS", jabatan: "Guru Fikih", hp: "081298765432", email: "ahmads@idrisiyyah.sch.id", status: "aktif" },
        { id: "t3", nip: "199201082015032001", nuptk: "-", nama: "Novi Haryati, S.Kom.", jk: "P", statusKepegawaian: "P3K", jabatan: "Operator", hp: "085678901234", email: "operator@idrisiyyah.sch.id", status: "aktif" },
        { id: "t4", nip: "-", nuptk: "-", nama: "Zainal Abidin, S.Pd.", jk: "L", statusKepegawaian: "GTT", jabatan: "Guru Matematika", hp: "089012345678", email: "calonguru@idrisiyyah.sch.id", status: "aktif" }
    ],
    subjects: [
        { id: "mapel_1", kode: "INF-7", nama: "Informatika", kelompok: "A", tingkat: "VII", alokasiJam: 2, status: "aktif" },
        { id: "mapel_2", kode: "FIQ-7", nama: "Fikih", kelompok: "A", tingkat: "VII", alokasiJam: 2, status: "aktif" },
        { id: "mapel_3", kode: "MAT-7", nama: "Matematika", kelompok: "A", tingkat: "VII", alokasiJam: 4, status: "aktif" },
        { id: "mapel_4", kode: "BIN-7", nama: "Bahasa Indonesia", kelompok: "A", tingkat: "VII", alokasiJam: 4, status: "aktif" },
        { id: "mapel_5", kode: "IPA-7", nama: "IPA", kelompok: "A", tingkat: "VII", alokasiJam: 4, status: "aktif" },
        { id: "mapel_6", kode: "MUL-7", nama: "Tahfidz Al-Qur'an", kelompok: "B", tingkat: "VII", alokasiJam: 2, status: "aktif" }
    ],
    classrooms: [
        { id: "c1", nama: "VII-A", tingkat: "VII", kapasitas: 32, status: "aktif" },
        { id: "c2", nama: "VII-B", tingkat: "VII", kapasitas: 32, status: "aktif" },
        { id: "c3", nama: "VIII-A", tingkat: "VIII", kapasitas: 32, status: "aktif" },
        { id: "c4", nama: "VIII-B", tingkat: "VIII", kapasitas: 32, status: "aktif" },
        { id: "c5", nama: "IX-A", tingkat: "IX", kapasitas: 32, status: "aktif" },
        { id: "c6", nama: "IX-B", tingkat: "IX", kapasitas: 32, status: "aktif" }
    ],
    homerooms: [
        { id: "r1", tahunPelajaran: "2026/2027", semester: "Ganjil", kelas: "VII-A", waliKelasId: "t1", waliKelasNama: "Ir. Hermawan, M.Pd.", siswaIds: ["s1", "s2", "s3", "s4", "s5", "s11", "s12"], status: "aktif" },
        { id: "r2", tahunPelajaran: "2026/2027", semester: "Ganjil", kelas: "VII-B", waliKelasId: "t2", waliKelasNama: "Ahmad Sufyan, S.Ag.", siswaIds: ["s6", "s7", "s8", "s9", "s13", "s14", "s15"], status: "aktif" },
        { id: "r3", tahunPelajaran: "2026/2027", semester: "Ganjil", kelas: "VIII-A", waliKelasId: "t3", waliKelasNama: "Novi Haryati, S.Kom.", siswaIds: ["s10", "s16", "s17", "s18", "s19"], status: "aktif" }
    ],
    teacher_assignments: [
        { id: "ta1", tahunPelajaran: "2026/2027", semester: "Ganjil", guruId: "t1", guruNama: "Ir. Hermawan, M.Pd.", mapelId: "mapel_1", mapelNama: "Informatika", kelasNama: "VII-A", jumlahJam: 2, status: "aktif" },
        { id: "ta2", tahunPelajaran: "2026/2027", semester: "Ganjil", guruId: "t2", guruNama: "Ahmad Sufyan, S.Ag.", mapelId: "mapel_2", mapelNama: "Fikih", kelasNama: "VII-A", jumlahJam: 2, status: "aktif" },
        { id: "ta3", tahunPelajaran: "2026/2027", semester: "Ganjil", guruId: "t4", guruNama: "Zainal Abidin, S.Pd.", mapelId: "mapel_3", mapelNama: "Matematika", kelasNama: "VII-A", jumlahJam: 4, status: "aktif" }
    ],
    report_cards: [
        {
            id: "rc_s1",
            siswaId: "s1",
            kelas: "VII-A",
            tahunPelajaran: "2026/2027",
            semester: "Ganjil",
            ekskul: [
                { nama: "Pramuka", nilai: "A", keterangan: "Sangat aktif dalam latihan dasar kepemimpinan dan teknik kepramukaan." },
                { nama: "PMR", nilai: "B", keterangan: "Aktif dalam materi penanganan pertama pertolongan medis." }
            ],
            kehadiran: { sakit: 1, izin: 2, alpa: 0 },
            catatanWali: "Selamat! Pertahankan prestasi belajar Anda. Tingkatkan ketekunan di semester berikutnya.",
            prestasi: "Juara 3 Turnamen Futsal Madrasah Cup"
        },
        {
            id: "rc_s2",
            siswaId: "s2",
            kelas: "VII-A",
            tahunPelajaran: "2026/2027",
            semester: "Ganjil",
            ekskul: [
                { nama: "Tahfidz", nilai: "A", keterangan: "Sangat baik dalam hafalan juz 30 dengan tajwid yang tepat." }
            ],
            kehadiran: { sakit: 0, izin: 1, alpa: 0 },
            catatanWali: "Sangat baik dalam segala aspek pembelajaran. Teruslah berkontribusi aktif di kelas.",
            prestasi: "Harapan 1 Musabaqah Hifzhil Qur'an (MHQ) Tasikmalaya"
        }
    ],
    approvals: [
        { id: "app_1", documentId: "doc1", tipe: "Modul Ajar", nama: "Modul Ajar Informatika Kelas VII - Berpikir Komputasional.pdf", pengajuNama: "Ir. Hermawan, M.Pd.", pengajuEmail: "demo@tradisi.app", tanggalPengajuan: "2026-06-15", status: "disetujui", verifikatorNama: "H. Ahmad Fauzian, M.Pd.", verifikatorEmail: "kepala@idrisiyyah.sch.id", tanggalVerifikasi: "2026-06-16", catatan: "Sangat baik dan lengkap, sesuai dengan standar Kurikulum Merdeka." },
        { id: "app_2", documentId: "doc2", tipe: "Program Tahunan", nama: "PROTA Informatika Kelas VII - 2026.pdf", pengajuNama: "Ir. Hermawan, M.Pd.", pengajuEmail: "demo@tradisi.app", tanggalPengajuan: "2026-06-16", status: "pending", verifikatorNama: "", verifikatorEmail: "", tanggalVerifikasi: "", catatan: "" },
        { id: "app_3", documentId: "doc3", tipe: "Program Semester", nama: "PROMES Informatika Kelas VII Ganjil.pdf", pengajuNama: "Ir. Hermawan, M.Pd.", pengajuEmail: "demo@tradisi.app", tanggalPengajuan: "2026-06-16", status: "revisi", verifikatorNama: "Ir. Hermawan, M.Pd.", verifikatorEmail: "demo@tradisi.app", tanggalVerifikasi: "2026-06-17", catatan: "Alokasi waktu di bulan Oktober perlu ditinjau kembali, sesuaikan dengan hari libur nasional." },
        { id: "app_4", documentId: "doc4", tipe: "Alur Tujuan Pembelajaran", nama: "ATP Informatika Fase D Kelas VII-IX.pdf", pengajuNama: "Ahmad Sufyan, S.Ag.", pengajuEmail: "ahmads@idrisiyyah.sch.id", tanggalPengajuan: "2026-06-18", status: "pending", verifikatorNama: "", verifikatorEmail: "", tanggalVerifikasi: "", catatan: "" }
    ],
    approval_history: [
        { id: "hist_1", approvalId: "app_1", tipeDokumen: "Modul Ajar", namaDokumen: "Modul Ajar Informatika Kelas VII - Berpikir Komputasional.pdf", pengajuNama: "Ir. Hermawan, M.Pd.", verifikatorNama: "H. Ahmad Fauzian, M.Pd.", action: "disetujui", tanggal: "2026-06-16 14:30", catatan: "Sangat baik dan lengkap, sesuai dengan standar Kurikulum Merdeka." },
        { id: "hist_2", approvalId: "app_3", tipeDokumen: "Program Semester", namaDokumen: "PROMES Informatika Kelas VII Ganjil.pdf", pengajuNama: "Ir. Hermawan, M.Pd.", verifikatorNama: "Ir. Hermawan, M.Pd.", action: "revisi", tanggal: "2026-06-17 09:15", catatan: "Alokasi waktu di bulan Oktober perlu ditinjau kembali, sesuaikan dengan hari libur nasional." }
    ],
    extracurriculars: [
        { id: "ekskul_1", nama: "Pramuka", pembinaId: "t1", pembinaNama: "Ir. Hermawan, M.Pd.", jadwal: "Sabtu, 13:00 - 15:00", siswaIds: ["s1", "s3", "s5", "s10"] },
        { id: "ekskul_2", nama: "PMR", pembinaId: "t2", pembinaNama: "Ahmad Sufyan, S.Ag.", jadwal: "Kamis, 15:30 - 17:00", siswaIds: ["s1", "s4", "s6"] },
        { id: "ekskul_3", nama: "Tahfidz", pembinaId: "t2", pembinaNama: "Ahmad Sufyan, S.Ag.", jadwal: "Selasa & Rabu, 16:00 - 17:30", siswaIds: ["s2", "s7", "s9"] },
        { id: "ekskul_4", nama: "Paskibra", pembinaId: "t4", pembinaNama: "Zainal Abidin, S.Pd.", jadwal: "Sabtu, 08:00 - 10:00", siswaIds: ["s8", "s12"] },
        { id: "ekskul_5", nama: "Kaligrafi", pembinaId: "t1", pembinaNama: "Ir. Hermawan, M.Pd.", jadwal: "Jumat, 14:00 - 15:30", siswaIds: ["s11", "s13"] }
    ],
    student_violations: [
        { id: "v_1", siswaId: "s1", siswaNama: "Ahmad Fauzi", kelas: "VII-A", tanggal: "2026-06-10", kategori: "Ringan", pelanggaran: "Terlambat masuk sekolah", poin: 5, tindakan: "Peringatan lisan oleh Guru Piket", pelapor: "Novi Haryati, S.Kom." },
        { id: "v_2", siswaId: "s3", siswaNama: "Budi Santoso", kelas: "VII-A", tanggal: "2026-06-12", kategori: "Sedang", pelanggaran: "Tidak memakai seragam sesuai atribut lengkap", poin: 20, tindakan: "Tugas membersihkan halaman", pelapor: "Zainal Abidin, S.Pd." },
        { id: "v_3", siswaId: "s5", siswaNama: "Dedi Wijaya", kelas: "VII-A", tanggal: "2026-06-15", kategori: "Berat", pelanggaran: "Membawa Handphone ke kelas tanpa izin KBM", poin: 55, tindakan: "Pemanggilan orang tua & penyitaan HP selama 1 minggu", pelapor: "Ahmad Sufyan, S.Ag." },
        { id: "v_4", siswaId: "s10", siswaNama: "Ihsan Kamil", kelas: "VIII-A", tanggal: "2026-06-16", kategori: "Berat", pelanggaran: "Membawa rokok ke lingkungan madrasah", poin: 110, tindakan: "Pemberian Surat Peringatan (SP) 1 & Skorsing 3 hari", pelapor: "Ir. Hermawan, M.Pd." }
    ],
    student_achievements: [
        { id: "ach_1", siswaId: "s1", siswaNama: "Ahmad Fauzi", kelas: "VII-A", tanggal: "2026-05-20", kategori: "Olahraga", prestasi: "Juara 3 Turnamen Futsal Madrasah Cup", tingkat: "Kabupaten/Kota", penyelenggara: "Kemenag Kabupaten Tasikmalaya" },
        { id: "ach_2", siswaId: "s2", siswaNama: "Aisyah Putri Rahma", kelas: "VII-A", tanggal: "2026-06-05", kategori: "Keagamaan", prestasi: "Harapan 1 Musabaqah Hifzhil Qur'an (MHQ) Tasikmalaya", tingkat: "Provinsi", penyelenggara: "LPTQ Jawa Barat" },
        { id: "ach_3", siswaId: "s10", siswaNama: "Ihsan Kamil", kelas: "VIII-A", tanggal: "2026-06-12", kategori: "Sains", prestasi: "Juara 1 Kompetisi Sains Madrasah (KSM) Matematika Terintegrasi", tingkat: "Nasional", penyelenggara: "Kementerian Agama RI" }
    ],
    osim_committee: {
        tahunAjaran: "2026/2027",
        pembinaNama: "Zainal Abidin, S.Pd.",
        pengurus: [
            { jabatan: "Ketua OSIM", nama: "Ihsan Kamil", kelas: "VIII-A", siswaId: "s10" },
            { jabatan: "Wakil Ketua OSIM", nama: "Omar Hakim", kelas: "VIII-A", siswaId: "s16" },
            { jabatan: "Sekretaris I", nama: "Putri Ayu Lestari", kelas: "VIII-A", siswaId: "s17" },
            { jabatan: "Bendahara I", nama: "Raniah Dewi", kelas: "VIII-A", siswaId: "s19" }
        ],
        agenda: [
            { id: "ag_1", kegiatan: "Latihan Dasar Kepemimpinan Siswa (LDKS)", tanggal: "2026-07-20", status: "Terencana", deskripsi: "Membekali pengurus baru OSIM dengan keterampilan kepemimpinan dasar." },
            { id: "ag_2", kegiatan: "Porseni Madrasah 2026", tanggal: "2026-09-15", status: "Dalam Proses", deskripsi: "Pekan olahraga dan seni antar kelas." },
            { id: "ag_3", kegiatan: "Bakti Sosial Ramadan", tanggal: "2027-03-20", status: "Terencana", deskripsi: "Pembagian sembako ke masyarakat sekitar madrasah." }
        ]
    }
};

/**
 * Initialize seed data in localStorage (only if not yet seeded)
 */
export function initializeLocalStorageSeed() {
    Object.keys(SEED_DATA).forEach(key => {
        if (!localStorage.getItem(`tradisi_${key}`)) {
            localStorage.setItem(`tradisi_${key}`, JSON.stringify(SEED_DATA[key]));
        }
    });
}

/**
 * Database Service — unified interface for Firestore and LocalStorage
 */
const dbService = {
    async getProfile(uid) {
        if (useMockDb) {
            const data = localStorage.getItem(`tradisi_profile_${uid}`);
            if (data) return JSON.parse(data);
            
            // Check profiles collection
            const profiles = await this.getData('profiles');
            const found = profiles.find(p => p.id === uid);
            if (found) return found;

            // Default demo profile fallback
            return { id: uid, nama: "Ir. Hermawan, M.Pd.", nip: "197508212005011002", mapel: "Informatika", roles: ["super_admin", "guru"], activeRole: "super_admin", status: "aktif" };
        } else {
            const defaultProfile = { id: uid, nama: "Guru Pendidik", nip: "-", mapel: "-", roles: ["guru"], activeRole: "guru", status: "aktif" };
            try {
                const docRef = doc(db, getUserDocPath(uid));
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    // Patch missing role fields with safe defaults
                    if (!data.roles || !data.roles.length) data.roles = ['guru'];
                    if (!data.activeRole) data.activeRole = data.roles[0] || 'guru';
                    if (!data.status) data.status = 'aktif';
                    return data;
                }
                return defaultProfile;
            } catch (e) {
                console.warn("Firestore getProfile failed, fallback to local storage:", e);
                const data = localStorage.getItem(`tradisi_profile_${uid}`);
                return data ? JSON.parse(data) : defaultProfile;
            }
        }
    },

    async saveProfile(uid, data) {
        if (useMockDb) {
            localStorage.setItem(`tradisi_profile_${uid}`, JSON.stringify(data));
            // Also sync in profiles collection
            const profiles = await this.getData('profiles');
            const idx = profiles.findIndex(p => p.id === uid);
            if (idx !== -1) {
                profiles[idx] = { ...profiles[idx], ...data };
            } else {
                profiles.push({ id: uid, ...data });
            }
            localStorage.setItem('tradisi_profiles', JSON.stringify(profiles));
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

    async getData(collectionName, includeArchived = false) {
        let items = [];
        if (useMockDb) {
            const data = localStorage.getItem(`tradisi_${collectionName}`);
            items = data ? JSON.parse(data) : [];
        } else {
            try {
                const docRef = doc(db, getCollectionPath(collectionName));
                const snap = await getDoc(docRef);
                items = snap.exists() ? snap.data().items || [] : [];
            } catch (e) {
                console.warn(`Firestore gagal membaca ${collectionName}, fallback ke lokal:`, e);
                const data = localStorage.getItem(`tradisi_${collectionName}`);
                items = data ? JSON.parse(data) : [];
            }
        }
        
        // Soft delete filter: filter out status === 'arsip' unless specifically requested
        if (!includeArchived && Array.isArray(items)) {
            return items.filter(item => item && item.status !== 'arsip');
        }
        return items;
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
    },

    async softDeleteItem(collectionName, id) {
        // Retrieve raw items including soft-deleted ones to avoid losing them during save
        let items = [];
        if (useMockDb) {
            const data = localStorage.getItem(`tradisi_${collectionName}`);
            items = data ? JSON.parse(data) : [];
        } else {
            try {
                const docRef = doc(db, getCollectionPath(collectionName));
                const snap = await getDoc(docRef);
                items = snap.exists() ? snap.data().items || [] : [];
            } catch (e) {
                const data = localStorage.getItem(`tradisi_${collectionName}`);
                items = data ? JSON.parse(data) : [];
            }
        }

        const idx = items.findIndex(item => item.id === id);
        if (idx !== -1) {
            items[idx].status = 'arsip';
            items[idx].deletedAt = new Date().toISOString();
            await this.saveData(collectionName, items);
            return true;
        }
        return false;
    }
};

export { dbService, SEED_DATA };

/**
 * Check if any super_admin account exists
 * Checks both collections/profiles AND users/ documents
 * Returns true if at least one profile has 'super_admin' in roles and status 'aktif'
 */
async function hasSuperAdmin() {
    if (useMockDb) {
        return true;
    }
    try {
        // Check collections/profiles first
        const profiles = await dbService.getData('profiles');
        const foundInCollection = profiles.some(p =>
            p.roles && p.roles.includes('super_admin') && p.status === 'aktif'
        );
        if (foundInCollection) return true;

        // Also check if current logged-in user has super_admin role in their user doc
        const { getAuth } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
        const authInstance = getAuth();
        if (authInstance.currentUser) {
            const userProfile = await dbService.getProfile(authInstance.currentUser.uid);
            if (userProfile && userProfile.roles && userProfile.roles.includes('super_admin') && userProfile.status === 'aktif') {
                return true;
            }
        }
        return false;
    } catch (e) {
        console.warn("Gagal cek super admin:", e);
        return false;
    }
}

/**
 * Bootstrap the first super admin account (Firebase mode only)
 * Creates a profile with super_admin role and status 'aktif' (bypasses approval)
 * Writes to BOTH users/{uid} AND collections/profiles for consistency
 */
async function bootstrapSuperAdmin(uid, email, profileData) {
    const superAdminProfile = {
        id: uid,
        email: email,
        roles: ['super_admin', 'guru'],
        activeRole: 'super_admin',
        status: 'aktif',
        createdAt: new Date().toISOString(),
        ...profileData
    };
    // Save to users/{uid}
    await dbService.saveProfile(uid, superAdminProfile);

    // Also save to collections/profiles so hasSuperAdmin() can find it
    if (!useMockDb) {
        try {
            const profiles = await dbService.getData('profiles');
            const existing = profiles.findIndex(p => p.id === uid);
            if (existing !== -1) {
                profiles[existing] = { ...profiles[existing], ...superAdminProfile };
            } else {
                profiles.push({ ...superAdminProfile });
            }
            await dbService.saveData('profiles', profiles);
        } catch (e) {
            console.warn("Gagal sync ke collections/profiles:", e);
        }
    }

    return superAdminProfile;
}

export { hasSuperAdmin, bootstrapSuperAdmin };
