# TRADISI
## Transformasi Digital Administrasi MTs Idrisiyyah

### Tagline
"Satu Platform Terpadu untuk Seluruh Administrasi Guru, Kurikulum, KBM, Kesiswaan, Asesmen, dan Arsip Digital Madrasah"

---

# 1. VISI SISTEM

TRADISI adalah platform administrasi madrasah terpadu yang dirancang untuk mengintegrasikan seluruh proses administrasi akademik, kurikulum, pembelajaran, asesmen, kesiswaan, wali kelas, dan pengelolaan dokumen digital dalam satu sistem berbasis web.

Sistem harus mampu:

* Mengurangi pekerjaan administrasi manual.
* Menghilangkan duplikasi input data.
* Menjadi pusat data tunggal (Single Source of Truth).
* Mendukung Kurikulum Merdeka dan Kurikulum Nasional.
* Mempermudah supervisi dan monitoring.
* Mendukung akreditasi madrasah.
* Mendukung audit dan pelaporan.
* Memiliki skalabilitas minimal 10 tahun tanpa perubahan struktur utama.

---

# 2. TEKNOLOGI WAJIB

## Frontend

* HTML5
* Tailwind CSS
* JavaScript ES6 Module

## Library

* DataTables
* SweetAlert2
* Chart.js
* Flatpickr
* PDFMake
* XLSX
* DayJS

## Backend

* Firebase Authentication
* Firebase Firestore
* Firebase Storage

## Hosting

* GitHub Pages

## Deployment

* GitHub Actions

## Arsitektur

* Modular Architecture
* Component Based Architecture
* Clean Code
* Mobile First
* Progressive Web App Ready

---

# 3. STANDAR KEAMANAN

## Authentication

* Login Email dan Password
* Registrasi Akun
* Lupa Password
* Remember Me
* Session Management
* Auto Logout Saat Idle
* Email Verification
* Password Change Required Setelah Reset

## Password Policy

Minimal:

* 8 Karakter
* Huruf Besar
* Huruf Kecil
* Angka
* Simbol

## Security

* Role Based Access Control (RBAC)
* Route Protection
* Firestore Rules
* Storage Rules
* Session Validation
* Activity Monitoring
* Audit Logging

## Soft Delete

Data tidak boleh langsung dihapus.

Status:

* Aktif
* Nonaktif
* Arsip

Hanya Super Admin yang dapat menghapus permanen.

---

# 4. HALAMAN LOGIN

## Form Login

Field:

* Email
* Password
* Remember Me

Fitur:

* Login
* Lupa Password
* Tampilkan/Sembunyikan Password

---

## Form Registrasi

Field:

* Nama Lengkap
* NIP/NUPTK
* Email
* Nomor HP
* Mata Pelajaran
* Password
* Konfirmasi Password

Status:

Menunggu Persetujuan Admin

Akun tidak dapat digunakan sebelum disetujui Admin.

---

# 5. STRUKTUR ROLE

## Super Admin

Akses penuh seluruh sistem.

---

## Admin Madrasah

Mengelola seluruh data.

---

## Kepala Madrasah

Monitoring dan laporan.

---

## Operator

Data Master dan konfigurasi akademik.

---

## Waka Kurikulum

Monitoring pembelajaran dan administrasi guru.

---

## Waka Kesiswaan

Monitoring kesiswaan.

---

## Guru

Administrasi pembelajaran.

---

## Wali Kelas

Administrasi kelas.

---

## Pembina Ekskul

Administrasi ekstrakurikuler.

---

# 6. SISTEM MULTI ROLE

Satu akun dapat memiliki lebih dari satu role.

Contoh:

* Guru
* Guru + Wali Kelas
* Guru + Pembina Ekskul
* Guru + Waka Kurikulum
* Guru + Waka Kesiswaan
* Guru + Wali Kelas + Pembina Ekskul

Menu otomatis menyesuaikan role aktif.

---

# 7. MANAJEMEN HAK AKSES

Setiap role memiliki hak akses:

* View
* Add
* Edit
* Delete
* Print
* Export
* Approve

Pengaturan dilakukan oleh Admin.

---

# 8. PENGATURAN MADRASAH

## Profil Madrasah

* Nama Madrasah
* NSM
* NPSN
* Alamat
* Telepon
* Email
* Website

## Struktur Organisasi

* Kepala Madrasah
* Waka Kurikulum
* Waka Kesiswaan
* Waka Sarpras
* Waka Humas
* Operator
* Bendahara
* Guru

## Tahun Pelajaran

* Tambah
* Aktifkan
* Arsipkan

## Semester

* Ganjil
* Genap

## Hari Aktif

* Senin
* Selasa
* Rabu
* Kamis
* Jumat
* Sabtu

## Jam Pelajaran

Jam ke-1 sampai Jam ke-n.

---

# 9. DATA MASTER

## Data Guru

Field:

* NIP
* NUPTK
* Nama Lengkap
* Jenis Kelamin
* Tempat Lahir
* Tanggal Lahir
* Pendidikan
* Status Kepegawaian
* Jabatan
* Nomor HP
* Email

Fitur:

* CRUD
* Import Excel
* Export Excel
* Cetak

---

## Data Siswa

Field:

* NIS
* NISN
* Nama Lengkap
* Kelas
* Jenis Kelamin
* Tempat Lahir
* Tanggal Lahir
* Alamat
* Nama Ayah
* Nama Ibu
* Nomor HP

---

## Mata Pelajaran

Field:

* Kode Mapel
* Nama Mapel
* Kelompok
* Tingkat
* Alokasi Jam

---

## Kelas

Field:

* Nama Kelas
* Tingkat
* Kapasitas

---

## Rombel

Field:

* Tahun Pelajaran
* Semester
* Kelas
* Wali Kelas

---

## Jadwal Pelajaran

Field:

* Hari
* Jam
* Kelas
* Mata Pelajaran
* Guru

---

## Kalender Pendidikan

Field:

* Tanggal
* Nama Kegiatan
* Jenis Kegiatan
* Keterangan

---

# 10. PENUGASAN GURU

Dikelola Admin.

Field:

* Tahun Pelajaran
* Semester
* Guru
* Mata Pelajaran
* Kelas
* Jumlah Jam

Output:

* Beban Mengajar
* Rekap Jam Mengajar
* Distribusi Jam Mengajar

---

# 11. ADMINISTRASI KBM

## Absensi Siswa

Status:

* Hadir
* Sakit
* Izin
* Alpha

Fitur:

* Input Massal
* Rekap Harian
* Bulanan
* Semester

---

## Jurnal Agenda Guru

Field:

* Tanggal
* Kelas
* Mata Pelajaran
* Materi
* Tujuan Pembelajaran
* Catatan

---

## Penilaian Siswa

Jenis:

* Tugas
* Harian
* Sumatif
* Projek

---

# 12. MODUL WALI KELAS

## Dashboard Wali Kelas

* Jumlah Siswa
* Kehadiran
* Prestasi
* Pelanggaran

## Rekap Absensi Kelas

## Catatan Kasus Siswa

## Bimbingan dan Pembinaan

## Komunikasi Orang Tua

## Prestasi Siswa

## Pelanggaran Siswa

## Rekap Nilai Kelas

## Catatan Wali Kelas

## Legger Nilai

## Kenaikan Kelas

## Rapor Siswa

---

# 13. KESISWAAN

## Kokurikuler

* Program
* Jadwal
* Pembina

## Ekstrakurikuler

* Ekskul
* Anggota
* Presensi
* Laporan

## Portofolio Prestasi

* Prestasi Akademik
* Prestasi Non Akademik

---

# 14. PERANGKAT AJAR

## Cover Administrasi

## Program Tahunan

## Program Semester

## ATP

## Modul Ajar

## Bahan Ajar

## LKPD

Semua dokumen:

* CRUD
* Cetak
* PDF
* Approval

---

# 15. ASESMEN

## Program Asesmen

## KKTP

## Bank Soal

Jenis Soal:

* Pilihan Ganda
* Isian
* Uraian

## Kisi-Kisi

## Analisis Butir Soal

Output:

* Validitas
* Reliabilitas
* Daya Pembeda
* Tingkat Kesukaran

---

# 16. GENERATOR ADMINISTRASI GURU

Input sekali digunakan seluruh sistem.

Output otomatis:

* Cover Administrasi
* Prota
* Promes
* ATP
* Modul Ajar
* KKTP
* Kisi-Kisi
* Analisis Soal
* Jurnal Guru
* Rekap Nilai
* Rekap Absensi

---

# 17. SUPERVISI AKADEMIK

Role:

* Kepala Madrasah
* Waka Kurikulum

Fitur:

* Supervisi Guru
* Catatan Supervisi
* Tindak Lanjut

---

# 18. MONITORING KINERJA GURU

Indikator:

* Kehadiran
* Jurnal
* Nilai
* Absensi
* Kelengkapan Administrasi

Output:

* Skor Kinerja
* Ranking Guru
* Grafik Kinerja

---

# 19. SISTEM APPROVAL

Workflow:

Guru
↓
Submit
↓
Admin Verifikasi
↓
Kepala Madrasah Approval
↓
Final

Status:

* Draft
* Revisi
* Menunggu Verifikasi
* Disetujui
* Final

---

# 20. PUSAT NOTIFIKASI

Notifikasi otomatis:

* Jadwal Mengajar
* Jurnal Belum Diisi
* Absensi Belum Diisi
* Nilai Belum Diisi
* Approval Dokumen
* Revisi Dokumen

---

# 21. PENGUMUMAN

Kategori:

* Umum
* Guru
* Wali Kelas
* Ekskul

Status:

* Draft
* Publish
* Arsip

---

# 22. ARSIP DIGITAL MADRASAH

Struktur Arsip:

Tahun Pelajaran
↓
Semester
↓
Guru
↓
Jenis Dokumen

Jenis Dokumen:

* Cover Administrasi
* Prota
* Promes
* ATP
* Modul Ajar
* Bahan Ajar
* LKPD
* Jurnal
* Nilai
* Analisis Soal
* Supervisi
* Rapor

Fitur:

* Pencarian Cepat
* Filter
* Arsip Otomatis
* Export

---

# 23. DASHBOARD BERDASARKAN ROLE

## Dashboard Guru

* Jadwal Hari Ini
* Jurnal Belum Diisi
* Absensi Belum Diisi
* Nilai Belum Diisi

## Dashboard Wali Kelas

* Kehadiran Kelas
* Prestasi
* Pelanggaran
* Rapor

## Dashboard Waka Kurikulum

* Monitoring Guru
* Monitoring Perangkat Ajar
* Supervisi

## Dashboard Waka Kesiswaan

* Prestasi
* Pelanggaran
* Ekskul

## Dashboard Kepala Madrasah

* Statistik Guru
* Statistik Siswa
* Monitoring KBM
* Monitoring Administrasi

## Dashboard Admin

* Approval Akun
* Approval Dokumen
* Aktivitas Sistem
* Monitoring Guru

---

# 24. AUDIT LOG

Catat seluruh aktivitas:

* Login
* Logout
* Registrasi
* Tambah Data
* Edit Data
* Hapus Data
* Export
* Print
* Approval

Informasi:

* User
* Role
* Waktu
* IP
* Aktivitas

---

# 25. DATABASE COLLECTION

users
roles
permissions
teachers
students
subjects
classrooms
homerooms
schedules
academic_years
semesters
attendance
teaching_journal
student_scores
teacher_assignments
teacher_workloads
cocurricular
extracurricular
achievement_portfolio
annual_program
semester_program
atp
teaching_modules
teaching_materials
lkpd
assessment_program
kktp
question_bank
question_blueprint
item_analysis
report_cards
supervision
approvals
approval_history
announcements
notifications
audit_logs
archives
settings

---

# 26. UI/UX

* Modern Education Dashboard
* Responsive Mobile
* Responsive Desktop
* Sidebar Collapse
* Search Global
* Breadcrumb
* Dark Mode
* Light Mode
* DataTables
* Toast Notification
* Loading Skeleton
* Empty State
* Error State

---

# 27. TARGET SKALABILITAS

Minimal mampu menangani:

* 500 Guru
* 5.000 Siswa
* 100.000 Absensi
* 500.000 Nilai
* 50.000 Dokumen

Tanpa perubahan struktur database utama.

---

# 28. OUTPUT WAJIB DARI AI DEVELOPER

1. Struktur Folder Lengkap
2. Firebase Configuration
3. Authentication System
4. Multi Role RBAC
5. Firestore Rules
6. Dashboard Semua Role
7. CRUD Semua Modul
8. Approval System
9. Audit Log
10. Arsip Digital
11. Generator Administrasi Guru
12. Export PDF
13. Export Excel
14. GitHub Actions Auto Deploy
15. Mobile First
16. PWA Ready
17. Production Ready
18. Dokumentasi Instalasi
19. Dokumentasi Database
20. Dokumentasi API Internal
21. Dokumentasi Role & Permission
22. Clean Architecture
23. Reusable Components
24. Maintainable Code
25. Siap Dikembangkan 5–10 Tahun Ke Depan
