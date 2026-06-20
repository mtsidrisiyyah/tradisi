// ============================================
// TRADISI — Generator Administrasi Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, getUserProfile, showToast } = ctx;
    const userProfile = getUserProfile();

    // 1. Fetch Master Data
    const teachers = await dbService.getData('teachers') || [];
    const subjects = await dbService.getData('subjects') || [];
    const classrooms = await dbService.getData('classrooms') || [];
    const settings = await dbService.getData('madrasah_settings') || {
        nama: "MTs Idrisiyyah Tasikmalaya",
        kepala: "H. Ahmad Fauzian, M.Pd.",
        nipKepala: "197804152006041003",
        tahunAjaran: "2026/2027",
        semester: "Ganjil"
    };

    // 2. Fetch Document Collections for Availability Checks
    const collections = {
        prota: await dbService.getData('prota') || [],
        promes: await dbService.getData('promes') || [],
        atp: await dbService.getData('atp') || [],
        kktp: await dbService.getData('kktp') || [],
        modulAjar: await dbService.getData('modulAjar') || [],
        bahanAjar: await dbService.getData('bahanAjar') || [],
        lkpd: await dbService.getData('lkpd') || [],
        jadwal: await dbService.getData('jadwal') || [],
        jurnal: await dbService.getData('jurnal') || [],
        penilaian: await dbService.getData('penilaian') || [],
        absensi: await dbService.getData('absensi') || [],
        siswa: await dbService.getData('siswa') || [],
        approvals: await dbService.getData('approvals') || []
    };

    // Render Filter Form
    const teachersOptions = teachers.map(t => `<option value="${t.id}" ${t.nama === userProfile.nama ? 'selected' : ''}>${t.nama}</option>`).join('');
    const subjectsOptions = subjects.map(s => `<option value="${s.nama}" ${s.nama === userProfile.mapel ? 'selected' : ''}>${s.nama} (${s.tingkat})</option>`).join('');
    const classroomsOptions = classrooms.map(c => `<option value="${c.nama}">${c.nama}</option>`).join('');

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <!-- Filter Banner -->
            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h3 class="text-sm font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider">Pusat Generator Administrasi Guru</h3>
                        <p class="text-[10px] text-slate-400 mt-1">Konfigurasikan guru, mata pelajaran, dan kelas untuk menghasilkan dokumen administrasi siap cetak.</p>
                    </div>
                    <div class="px-3 py-1.5 bg-forest-600/10 text-forest-700 dark:text-forest-400 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <i class="ph ph-calendar"></i> TA: ${settings.tahunAjaran} | Smt: ${settings.semester}
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Pilih Guru Pendidik</label>
                        <select id="gen-guru" class="w-full px-3 py-2 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                            ${teachersOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Mata Pelajaran</label>
                        <select id="gen-mapel" class="w-full px-3 py-2 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                            ${subjectsOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Kelas Rombel</label>
                        <select id="gen-kelas" class="w-full px-3 py-2 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                            ${classroomsOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Bulan Laporan (Untuk Absen)</label>
                        <select id="gen-bulan" class="w-full px-3 py-2 border border-slate-250 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                            <option value="6" selected>Juni 2026</option>
                            <option value="7">Juli 2026</option>
                            <option value="8">Agustus 2026</option>
                            <option value="9">September 2026</option>
                            <option value="10">Oktober 2026</option>
                            <option value="11">November 2026</option>
                            <option value="12">Desember 2026</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Documents Grid -->
            <div>
                <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-1 flex items-center gap-1.5">
                    <i class="ph ph-files"></i> Daftar 11 Berkas Administrasi Utama
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="documents-container">
                    <!-- Cards will be dynamically rendered here -->
                </div>
            </div>
        </div>
    `;

    // 3. Document Definitions & Checks
    const documentMeta = [
        {
            id: 1,
            title: "Cover Buku Kerja Guru",
            desc: "Halaman sampul resmi dokumen Buku Kerja Guru bermaterai / bernilai formal.",
            check: (filters) => ({ status: 'ditemukan', count: 1, text: 'Data Siap' }),
            print: (filters, data) => printCover(filters, data)
        },
        {
            id: 2,
            title: "Program Tahunan (PROTA)",
            desc: "Rencana alokasi waktu pembelajaran selama satu tahun untuk mencapai Capaian Pembelajaran.",
            check: (filters) => {
                const count = collections.prota.filter(d => d.mapel === filters.mapel && filters.kelas.startsWith(d.kelas)).length;
                return count > 0 ? { status: 'ditemukan', count, text: `Ditemukan (${count} data)` } : { status: 'kosong', count: 0, text: 'Data Kosong (Pakai Template)' };
            },
            print: (filters, data) => printProta(filters, data)
        },
        {
            id: 3,
            title: "Program Semester (PROMES)",
            desc: "Rincian alokasi waktu dan jadwal pelaksanaan materi ajar per bulan selama satu semester.",
            check: (filters) => {
                const count = collections.promes.filter(d => d.mapel === filters.mapel && filters.kelas.startsWith(d.kelas)).length;
                return count > 0 ? { status: 'ditemukan', count, text: `Ditemukan (${count} data)` } : { status: 'kosong', count: 0, text: 'Data Kosong (Pakai Template)' };
            },
            print: (filters, data) => printPromes(filters, data)
        },
        {
            id: 4,
            title: "Alur Tujuan Pembelajaran (ATP)",
            desc: "Alur perencanaan pembelajaran terstruktur dari awal hingga akhir fase kelas terkait.",
            check: (filters) => {
                const count = collections.atp.filter(d => d.mapel === filters.mapel).length;
                return count > 0 ? { status: 'ditemukan', count, text: `Ditemukan (${count} TP)` } : { status: 'kosong', count: 0, text: 'Data Kosong (Pakai Template)' };
            },
            print: (filters, data) => printAtp(filters, data)
        },
        {
            id: 5,
            title: "Kriteria Ketercapaian (KKTP)",
            desc: "Dokumen kriteria penentu ketercapaian tujuan pembelajaran peserta didik.",
            check: (filters) => {
                const count = collections.kktp.filter(d => d.mapel === filters.mapel).length;
                return count > 0 ? { status: 'ditemukan', count, text: `Ditemukan (${count} kriteria)` } : { status: 'kosong', count: 0, text: 'Data Kosong (Pakai Template)' };
            },
            print: (filters, data) => printKktp(filters, data)
        },
        {
            id: 6,
            title: "Rencana Pelaksanaan / Modul Ajar (MA)",
            desc: "Panduan operasional harian pelaksanaan KBM di dalam kelas terintegrasi kurikulum.",
            check: (filters) => {
                const count = collections.modulAjar.filter(d => d.mapel === filters.mapel).length;
                return count > 0 ? { status: 'ditemukan', count, text: `Ditemukan (${count} Modul)` } : { status: 'kosong', count: 0, text: 'Data Kosong (Pakai Template)' };
            },
            print: (filters, data) => printModulAjar(filters, data)
        },
        {
            id: 7,
            title: "Bahan Ajar & LKPD",
            desc: "Lembar panduan tugas praktikum (LKPD) serta rangkuman ringkasan materi ajar siswa.",
            check: (filters) => {
                const countBa = collections.bahanAjar.filter(d => d.mapel === filters.mapel).length;
                const countLk = collections.lkpd.filter(d => d.mapel === filters.mapel).length;
                const total = countBa + countLk;
                return total > 0 ? { status: 'ditemukan', count: total, text: `Ditemukan (${countBa} BA, ${countLk} LKPD)` } : { status: 'kosong', count: 0, text: 'Data Kosong (Pakai Template)' };
            },
            print: (filters, data) => printBahanLkpd(filters, data)
        },
        {
            id: 8,
            title: "Jadwal Pelajaran Guru",
            desc: "Jadwal dan alokasi waktu mengajar guru untuk mata pelajaran dan kelas terpilih.",
            check: (filters) => {
                const count = collections.jadwal.filter(d => d.mapel === filters.mapel && d.kelas === filters.kelas).length;
                return count > 0 ? { status: 'ditemukan', count, text: `Terjadwal (${count} Hari)` } : { status: 'kosong', count: 0, text: 'Tidak Terjadwal (Pakai Template)' };
            },
            print: (filters, data) => printJadwal(filters, data)
        },
        {
            id: 9,
            title: "Rekap Jurnal Agenda KBM",
            desc: "Catatan log pelaksanaan harian KBM, kendala lapangan, serta rencana tindak lanjut.",
            check: (filters) => {
                const count = collections.jurnal.filter(d => d.kelas === filters.kelas && d.mapel === filters.mapel).length;
                return count > 0 ? { status: 'ditemukan', count, text: `Ditemukan (${count} catatan)` } : { status: 'kosong', count: 0, text: 'Jurnal Kosong' };
            },
            print: (filters, data) => printJurnal(filters, data)
        },
        {
            id: 10,
            title: "Laporan Nilai Rombel",
            desc: "Daftar nilai tugas, ulangan, PTS, PAS beserta perhitungan nilai akhir dan predikat.",
            check: (filters) => {
                const count = collections.penilaian.filter(d => d.kelas === filters.kelas && d.mapel === filters.mapel).length;
                return count > 0 ? { status: 'ditemukan', count, text: `Ditemukan (${count} Nilai Siswa)` } : { status: 'kosong', count: 0, text: 'Nilai Kosong' };
            },
            print: (filters, data) => printLaporanNilai(filters, data)
        },
        {
            id: 11,
            title: "Rekap Absensi Bulanan",
            desc: "Rekapitulasi persentase kehadiran siswa (H, S, I, A) selama satu bulan penuh.",
            check: (filters) => {
                const count = collections.absensi.filter(d => d.kelas === filters.kelas).length;
                return count > 0 ? { status: 'ditemukan', count, text: `Ditemukan (${count} absensi)` } : { status: 'kosong', count: 0, text: 'Absensi Kosong' };
            },
            print: (filters, data) => printRekapAbsensi(filters, data)
        }
    ];

    // Get Active Filters
    const getFilters = () => {
        const guruId = document.getElementById('gen-guru').value;
        const teacher = teachers.find(t => t.id === guruId) || { nama: userProfile.nama || "Guru Pendidik", nip: userProfile.nip || "-" };
        
        return {
            guruId,
            guruNama: teacher.nama,
            guruNip: teacher.nip || "-",
            mapel: document.getElementById('gen-mapel').value,
            kelas: document.getElementById('gen-kelas').value,
            bulan: parseInt(document.getElementById('gen-bulan').value, 10),
            bulanNama: document.getElementById('gen-bulan').options[document.getElementById('gen-bulan').selectedIndex].text
        };
    };

    // Render Cards Function
    const renderCards = () => {
        const container = document.getElementById('documents-container');
        if (!container) return;

        const filters = getFilters();

        container.innerHTML = documentMeta.map(doc => {
            const checkRes = doc.check(filters);
            
            const badgeClass = checkRes.status === 'ditemukan' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
            
            const iconClass = checkRes.status === 'ditemukan' ? 'ph-check-circle text-emerald-600' : 'ph-warning text-amber-600';

            // Find matching approval for the selected teacher (by name)
            let approvalType = "";
            if (doc.title.includes("Cover")) approvalType = "Cover Administrasi";
            else if (doc.title.includes("PROTA")) approvalType = "Program Tahunan";
            else if (doc.title.includes("PROMES")) approvalType = "Program Semester";
            else if (doc.title.includes("ATP")) approvalType = "Alur Tujuan Pembelajaran";
            else if (doc.title.includes("KKTP")) approvalType = "Kriteria Ketercapaian";
            else if (doc.title.includes("Modul Ajar")) approvalType = "Modul Ajar";
            else if (doc.title.includes("Bahan Ajar")) approvalType = "Bahan Ajar";
            else if (doc.title.includes("Jadwal")) approvalType = "Jadwal Pelajaran";
            else if (doc.title.includes("Jurnal")) approvalType = "Jurnal Agenda Guru";
            else if (doc.title.includes("Laporan Nilai")) approvalType = "Laporan Nilai";
            else if (doc.title.includes("Absensi")) approvalType = "Rekap Absensi";

            const app = (collections.approvals || []).find(a => 
                a.pengajuNama === filters.guruNama && a.tipe === approvalType
            );

            let approvalStatusHtml = "";
            if (app) {
                if (app.status === 'disetujui') {
                    approvalStatusHtml = `<p class="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1"><i class="ph ph-check-circle"></i> Berkas Disetujui Supervisi</p>`;
                } else if (app.status === 'pending') {
                    approvalStatusHtml = `<p class="text-[9px] text-amber-600 dark:text-amber-400 font-bold mt-1.5 flex items-center gap-1"><i class="ph ph-warning"></i> Sedang Disupervisi (Belum Disetujui)</p>`;
                } else if (app.status === 'revisi') {
                    approvalStatusHtml = `<p class="text-[9px] text-rose-600 dark:text-rose-450 font-bold mt-1.5 flex items-center gap-1" title="${app.catatan}"><i class="ph ph-x-circle"></i> Butuh Revisi: ${app.catatan}</p>`;
                }
            } else {
                approvalStatusHtml = `<p class="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1"><i class="ph ph-info"></i> Belum Diajukan ke Supervisi</p>`;
            }

            return `
                <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 flex flex-col justify-between min-h-[210px] shadow-sm hover:shadow-md transition-shadow">
                    <div>
                        <div class="flex justify-between items-start gap-2 mb-2">
                            <h4 class="text-xs font-bold text-slate-850 dark:text-slate-200">${doc.title}</h4>
                            <span class="text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${badgeClass}">
                                <i class="ph ${iconClass}"></i> ${checkRes.text}
                            </span>
                        </div>
                        <p class="text-[10px] text-slate-400 dark:text-slate-500 leading-normal line-clamp-3">${doc.desc}</p>
                        ${approvalStatusHtml}
                    </div>
                    <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button onclick="window.triggerPrint(${doc.id})" class="px-3.5 py-1.5 bg-forest-750 hover:bg-forest-800 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all active:scale-98">
                            <i class="ph ph-printer text-xs"></i> Cetak A4 / PDF
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    };

    // Attach Change Observers
    document.getElementById('gen-guru').addEventListener('change', renderCards);
    document.getElementById('gen-mapel').addEventListener('change', renderCards);
    document.getElementById('gen-kelas').addEventListener('change', renderCards);
    document.getElementById('gen-bulan').addEventListener('change', renderCards);

    // Initial Render
    renderCards();

    // Trigger Print Global Function
    window.triggerPrint = (id) => {
        const filters = getFilters();
        const docObj = documentMeta.find(d => d.id === id);
        if (docObj) {
            docObj.print(filters, collections);
        } else {
            showToast("Dokumen tidak valid!", "error");
        }
    };

    // ============================================
    // PRINT PREVIEW GENERATORS (HTML WRITERS)
    // ============================================

    function openPrintWindow(title, orientation = 'portrait') {
        const w = window.open('', '_blank');
        w.document.write(`
            <html>
            <head>
                <title>${title}</title>
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
                <style>
                    @page {
                        size: A4 ${orientation};
                        margin: 1.5cm 1.5cm 2cm 1.5cm;
                    }
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        font-size: 11px;
                        line-height: 1.4;
                        color: #000;
                        background: #fff;
                        padding: 0;
                        margin: 0;
                    }
                    .no-print-bar {
                        background: #1e293b;
                        padding: 10px;
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                        border-bottom: 2px solid #0f172a;
                    }
                    .btn-print {
                        background: #10b981;
                        color: white;
                        border: none;
                        padding: 6px 16px;
                        font-size: 11px;
                        font-family: 'Outfit', sans-serif;
                        font-weight: bold;
                        border-radius: 6px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }
                    .btn-print:hover {
                        background: #059669;
                    }
                    .btn-close {
                        background: #ef4444;
                        color: white;
                        border: none;
                        padding: 6px 16px;
                        font-size: 11px;
                        font-family: 'Outfit', sans-serif;
                        font-weight: bold;
                        border-radius: 6px;
                        cursor: pointer;
                    }
                    .btn-close:hover {
                        background: #dc2626;
                    }
                    .sheet {
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    .kop-surat {
                        display: flex;
                        align-items: center;
                        border-bottom: 3px double #000;
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                    }
                    .kop-logo {
                        width: 70px;
                        height: 70px;
                        margin-right: 15px;
                        object-fit: contain;
                    }
                    .kop-text {
                        flex-grow: 1;
                        text-align: center;
                    }
                    .kop-yayasan {
                        font-size: 12px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin: 0;
                    }
                    .kop-madrasah {
                        font-size: 16px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin: 2px 0;
                    }
                    .kop-alamat {
                        font-size: 9px;
                        font-style: italic;
                        margin: 0;
                        color: #444;
                    }
                    .doc-title {
                        text-align: center;
                        font-size: 14px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin: 15px 0 5px 0;
                        text-decoration: underline;
                    }
                    .doc-subtitle {
                        text-align: center;
                        font-size: 11px;
                        margin-bottom: 20px;
                    }
                    .identitas-grid {
                        width: 100%;
                        margin-bottom: 15px;
                        font-size: 11px;
                    }
                    .identitas-grid td {
                        padding: 2px 4px;
                    }
                    .table-data {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    .table-data th, .table-data td {
                        border: 1px solid #000;
                        padding: 6px;
                        font-size: 10px;
                    }
                    .table-data th {
                        background: #f3f4f6;
                        font-weight: bold;
                        text-align: center;
                        text-transform: uppercase;
                    }
                    .signatures {
                        margin-top: 40px;
                        display: flex;
                        justify-content: space-between;
                        font-size: 11px;
                        page-break-inside: avoid;
                    }
                    .sig-box {
                        text-align: center;
                        width: 220px;
                    }
                    @media print {
                        .no-print-bar {
                            display: none !important;
                        }
                        body {
                            padding: 0;
                            margin: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="no-print-bar">
                    <button class="btn-print" onclick="window.print()"><svg width="12" height="12" viewBox="0 0 256 256" fill="white" style="margin-right:4px;"><path d="M224,112a16,16,0,0,0-16-16H176V48a16,16,0,0,0-16-16H96A16,16,0,0,0,80,48V96H48a16,16,0,0,0-16,16v80a8,8,0,0,0,8,8H80v32a16,16,0,0,0,16,16h64a16,16,0,0,0,16-16V200h32a8,8,0,0,0,8-8ZM96,48h64V96H96Zm64,176H96V176h64Zm48-32H176V160a16,16,0,0,0-16-16H96a16,16,0,0,0-16,16v32H48V112H208v80Z"></path></svg> Cetak Dokumen</button>
                    <button class="btn-close" onclick="window.close()">Tutup</button>
                </div>
                <div class="sheet">
        `);
        return w;
    }

    function closePrintWindow(w, filters) {
        const todayStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        w.document.write(`
                    <!-- Signatures -->
                    <div class="signatures">
                        <div class="sig-box">
                            <p>Mengetahui,</p>
                            <p>Kepala Madrasah</p>
                            <div style="height: 55px;"></div>
                            <p><strong>${settings.kepala}</strong></p>
                            <p style="border-top:1px solid #000; font-size:9px; padding-top:2px;">NIP. ${settings.nipKepala}</p>
                        </div>
                        <div class="sig-box">
                            <p>Tasikmalaya, ${todayStr}</p>
                            <p>Guru Mata Pelajaran</p>
                            <div style="height: 55px;"></div>
                            <p><strong>${filters.guruNama}</strong></p>
                            <p style="border-top:1px solid #000; font-size:9px; padding-top:2px;">NIP. ${filters.guruNip}</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `);
        w.document.close();
    }

    // 1. Cover Buku Kerja Guru
    function printCover(filters, data) {
        const w = window.open('', '_blank');
        w.document.write(`
            <html>
            <head>
                <title>Cover Buku Kerja Guru</title>
                <style>
                    @page { size: A4 portrait; margin: 1.5cm; }
                    body {
                        font-family: 'Times New Roman', serif;
                        color: #000;
                        background: #fff;
                        padding: 0;
                        margin: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }
                    .border-double {
                        border: 4px double #000;
                        padding: 30px;
                        width: 175mm;
                        height: 250mm;
                        box-sizing: border-box;
                        display: flex;
                        flex-col;
                        flex-direction: column;
                        justify-content: space-between;
                        align-items: center;
                        text-align: center;
                    }
                    .header-title {
                        font-size: 22px;
                        font-weight: bold;
                        letter-spacing: 1px;
                        margin-bottom: 5px;
                    }
                    .header-sub {
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 20px;
                    }
                    .divider {
                        width: 120px;
                        height: 2px;
                        background: #000;
                        margin: 10px auto;
                    }
                    .logo-img {
                        width: 110px;
                        height: 110px;
                        object-fit: contain;
                        margin: 30px 0;
                    }
                    .meta-table {
                        width: 85%;
                        border-collapse: collapse;
                        margin: 30px auto;
                        font-size: 13px;
                    }
                    .meta-table td {
                        padding: 6px 4px;
                        vertical-align: top;
                    }
                    .footer-school {
                        font-size: 15px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    .footer-year {
                        font-size: 13px;
                        margin-top: 5px;
                        font-weight: bold;
                    }
                    .no-print-bar {
                        position: absolute;
                        top: 10px;
                        left: 10px;
                        background: #1e293b;
                        padding: 6px 12px;
                        border-radius: 6px;
                    }
                    .btn-print {
                        background: #10b981;
                        color: white;
                        border: none;
                        padding: 4px 10px;
                        font-size: 11px;
                        font-weight: bold;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    @media print {
                        .no-print-bar { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print-bar">
                    <button class="btn-print" onclick="window.print()">Cetak</button>
                    <button class="btn-print" style="background:#ef4444; margin-left:5px;" onclick="window.close()">Tutup</button>
                </div>
                <div class="border-double">
                    <div>
                        <div class="header-title">BUKU KERJA GURU I</div>
                        <div class="header-sub">ADMINISTRASI PEMBELAJARAN</div>
                        <div class="divider"></div>
                    </div>

                    <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="logo-img" alt="Logo MTs">

                    <table class="meta-table">
                        <tr>
                            <td style="width: 40%; font-weight: bold; text-align: left;">MATA PELAJARAN</td>
                            <td style="width: 5%; text-align: center;">:</td>
                            <td style="text-align: left; font-weight: bold;">${filters.mapel.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold; text-align: left;">KELAS / SEMESTER</td>
                            <td style="text-align: center;">:</td>
                            <td style="text-align: left; font-weight: bold;">${filters.kelas.toUpperCase()} / ${settings.semester.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold; text-align: left;">NAMA GURU</td>
                            <td style="text-align: center;">:</td>
                            <td style="text-align: left; font-weight: bold;">${filters.guruNama.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold; text-align: left;">NIP / NUPTK</td>
                            <td style="text-align: center;">:</td>
                            <td style="text-align: left;">${filters.guruNip}</td>
                        </tr>
                    </table>

                    <div style="margin-bottom: 20px;">
                        <div class="footer-school">MADRASAH TSANAWIYAH IDRISIYYAH</div>
                        <div style="font-size: 11px;">KECAMATAN CIAWI KABUPATEN TASIKMALAYA</div>
                        <div class="footer-year">TAHUN PELAJARAN ${settings.tahunAjaran}</div>
                    </div>
                </div>
            </body>
            </html>
        `);
        w.document.close();
    }

    // 2. Program Tahunan (PROTA)
    function printProta(filters, data) {
        const w = openPrintWindow("Program Tahunan (PROTA)", "portrait");
        
        // Write KOP
        w.document.write(`
            <div class="kop-surat">
                <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="kop-logo">
                <div class="kop-text">
                    <p class="kop-yayasan">Yayasan Idrisiyyah Tasikmalaya</p>
                    <h2 class="kop-madrasah">Madrasah Tsanawiyah (MTs) Idrisiyyah</h2>
                    <p class="kop-alamat">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855 | Telp: (0265) 323456</p>
                </div>
            </div>
            <h3 class="doc-title">Program Tahunan (PROTA)</h3>
            <p class="doc-subtitle">Tahun Pelajaran: ${settings.tahunAjaran}</p>

            <table class="identitas-grid">
                <tr>
                    <td style="width:15%">Mata Pelajaran</td><td style="width:2%">:</td><td style="width:33%">${filters.mapel}</td>
                    <td style="width:15%">Kelas</td><td style="width:2%">:</td><td style="width:33%">${filters.kelas}</td>
                </tr>
                <tr>
                    <td>Guru Pengampu</td><td>:</td><td>${filters.guruNama}</td>
                    <td>NIP</td><td>:</td><td>${filters.guruNip}</td>
                </tr>
            </table>

            <table class="table-data">
                <thead>
                    <tr>
                        <th style="width: 5%">No</th>
                        <th style="width: 25%">Semester</th>
                        <th style="width: 30%">Alokasi Jam Pelajaran (JP)</th>
                        <th>Keterangan</th>
                    </tr>
                </thead>
                <tbody>
        `);

        const protaList = collections.prota.filter(d => d.mapel === filters.mapel && filters.kelas.startsWith(d.kelas));
        if (protaList.length > 0) {
            protaList.forEach((d, idx) => {
                w.document.write(`
                    <tr>
                        <td style="text-align:center;">${idx + 1}</td>
                        <td>Semester Ganjil (1)</td>
                        <td style="text-align:center; font-weight:bold;">${d.semester1 || '54 JP'}</td>
                        <td>${d.keterangan || '-'}</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">${idx + 1 + protaList.length}</td>
                        <td>Semester Genap (2)</td>
                        <td style="text-align:center; font-weight:bold;">${d.semester2 || '54 JP'}</td>
                        <td>${d.keterangan || '-'}</td>
                    </tr>
                `);
            });
        } else {
            // Default Template Rows
            w.document.write(`
                <tr>
                    <td style="text-align:center;">1</td>
                    <td>Semester Ganjil (1)</td>
                    <td style="text-align:center; font-weight:bold;">54 JP</td>
                    <td>Template default (Kurikulum Merdeka)</td>
                </tr>
                <tr>
                    <td style="text-align:center;">2</td>
                    <td>Semester Genap (2)</td>
                    <td style="text-align:center; font-weight:bold;">54 JP</td>
                    <td>Template default (Kurikulum Merdeka)</td>
                </tr>
            `);
        }

        w.document.write(`
                </tbody>
            </table>
        `);

        closePrintWindow(w, filters);
    }

    // 3. Program Semester (PROMES)
    function printPromes(filters, data) {
        const w = openPrintWindow("Program Semester (PROMES)", "landscape");
        
        w.document.write(`
            <div class="kop-surat">
                <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="kop-logo">
                <div class="kop-text">
                    <p class="kop-yayasan">Yayasan Idrisiyyah Tasikmalaya</p>
                    <h2 class="kop-madrasah">Madrasah Tsanawiyah (MTs) Idrisiyyah</h2>
                    <p class="kop-alamat">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855 | Telp: (0265) 323456</p>
                </div>
            </div>
            <h3 class="doc-title">Program Semester (PROMES)</h3>
            <p class="doc-subtitle">Semester: ${settings.semester} | Tahun Pelajaran: ${settings.tahunAjaran}</p>

            <table class="identitas-grid">
                <tr>
                    <td style="width:15%">Mata Pelajaran</td><td style="width:2%">:</td><td style="width:33%">${filters.mapel}</td>
                    <td style="width:15%">Kelas</td><td style="width:2%">:</td><td style="width:33%">${filters.kelas}</td>
                </tr>
                <tr>
                    <td>Nama Guru</td><td>:</td><td>${filters.guruNama}</td>
                    <td>NIP</td><td>:</td><td>${filters.guruNip}</td>
                </tr>
            </table>

            <table class="table-data">
                <thead>
                    <tr>
                        <th style="width: 5%">No</th>
                        <th style="width: 15%">Bulan</th>
                        <th style="text-align: left;">Materi Kegiatan / Tujuan Pembelajaran</th>
                        <th style="width: 12%">Alokasi JP</th>
                        <th style="width: 30%">Ket. Pelaksanaan</th>
                    </tr>
                </thead>
                <tbody>
        `);

        const promesList = collections.promes.filter(d => d.mapel === filters.mapel && filters.kelas.startsWith(d.kelas) && d.semester === settings.semester);
        if (promesList.length > 0) {
            promesList.forEach((d, idx) => {
                w.document.write(`
                    <tr>
                        <td style="text-align:center;">${idx + 1}</td>
                        <td style="text-align:center; font-weight:bold;">${d.bulan}</td>
                        <td>${d.kegiatan}</td>
                        <td style="text-align:center; font-weight:bold;">${d.jp} JP</td>
                        <td>Sesuai kalender akademik</td>
                    </tr>
                `);
            });
        } else {
            // Default template based on standard semester months
            const defaultMonths = settings.semester === 'Ganjil' 
                ? ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
                : ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'];

            defaultMonths.forEach((bln, idx) => {
                w.document.write(`
                    <tr>
                        <td style="text-align:center;">${idx + 1}</td>
                        <td style="text-align:center; font-weight:bold;">${bln}</td>
                        <td>Tujuan Pembelajaran Pokok Bahasan Ke-${idx + 1} (Template)</td>
                        <td style="text-align:center; font-weight:bold;">8 JP</td>
                        <td>Draft Rencana Kegiatan</td>
                    </tr>
                `);
            });
        }

        w.document.write(`
                </tbody>
            </table>
        `);

        closePrintWindow(w, filters);
    }

    // 4. Alur Tujuan Pembelajaran (ATP)
    function printAtp(filters, data) {
        const w = openPrintWindow("Alur Tujuan Pembelajaran (ATP)", "portrait");
        
        w.document.write(`
            <div class="kop-surat">
                <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="kop-logo">
                <div class="kop-text">
                    <p class="kop-yayasan">Yayasan Idrisiyyah Tasikmalaya</p>
                    <h2 class="kop-madrasah">Madrasah Tsanawiyah (MTs) Idrisiyyah</h2>
                    <p class="kop-alamat">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855 | Telp: (0265) 323456</p>
                </div>
            </div>
            <h3 class="doc-title">Alur Tujuan Pembelajaran (ATP)</h3>
            <p class="doc-subtitle">Mata Pelajaran: ${filters.mapel} | Fase D</p>

            <table class="table-data">
                <thead>
                    <tr>
                        <th style="width: 5%">No</th>
                        <th style="width: 45%; text-align: left;">Capaian Pembelajaran (CP)</th>
                        <th style="width: 40%; text-align: left;">Tujuan Pembelajaran (TP)</th>
                        <th style="width: 10%">Urutan</th>
                    </tr>
                </thead>
                <tbody>
        `);

        const atpList = collections.atp.filter(d => d.mapel === filters.mapel);
        if (atpList.length > 0) {
            atpList.forEach((d, idx) => {
                w.document.write(`
                    <tr>
                        <td style="text-align:center;">${idx + 1}</td>
                        <td>${d.cp}</td>
                        <td>${d.tp}</td>
                        <td style="text-align:center; font-weight:bold;">${d.urutan}</td>
                    </tr>
                `);
            });
        } else {
            w.document.write(`
                <tr>
                    <td style="text-align:center;">1</td>
                    <td>Memahami konsep komputasi dan pemecahan masalah secara logis. (Template)</td>
                    <td>Mendeskripsikan langkah-langkah algoritma dalam bentuk flowchart.</td>
                    <td style="text-align:center;">1</td>
                </tr>
                <tr>
                    <td style="text-align:center;">2</td>
                    <td>Menerapkan prinsip informatika untuk membuat proyek berbasis web. (Template)</td>
                    <td>Membuat halaman profile pribadi sederhana menggunakan HTML dasar.</td>
                    <td style="text-align:center;">2</td>
                </tr>
            `);
        }

        w.document.write(`
                </tbody>
            </table>
        `);

        closePrintWindow(w, filters);
    }

    // 5. KKTP
    function printKktp(filters, data) {
        const w = openPrintWindow("Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)", "portrait");
        
        w.document.write(`
            <div class="kop-surat">
                <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="kop-logo">
                <div class="kop-text">
                    <p class="kop-yayasan">Yayasan Idrisiyyah Tasikmalaya</p>
                    <h2 class="kop-madrasah">Madrasah Tsanawiyah (MTs) Idrisiyyah</h2>
                    <p class="kop-alamat">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855 | Telp: (0265) 323456</p>
                </div>
            </div>
            <h3 class="doc-title">KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)</h3>
            <p class="doc-subtitle">Mata Pelajaran: ${filters.mapel} | Kelas: ${filters.kelas}</p>

            <table class="table-data">
                <thead>
                    <tr>
                        <th style="width: 5%">No</th>
                        <th style="width: 45%; text-align: left;">Tujuan Pembelajaran (TP)</th>
                        <th style="width: 50%; text-align: left;">Kriteria Ketuntasan (Deskripsi Bukti)</th>
                    </tr>
                </thead>
                <tbody>
        `);

        const kktpList = collections.kktp.filter(d => d.mapel === filters.mapel);
        if (kktpList.length > 0) {
            kktpList.forEach((d, idx) => {
                const criteriaRows = d.kriteria.split(',').map(c => `<li>${c.trim()}</li>`).join('');
                w.document.write(`
                    <tr>
                        <td style="text-align:center; vertical-align: top;">${idx + 1}</td>
                        <td style="vertical-align: top; font-weight: bold;">${d.tp}</td>
                        <td><ul style="margin: 0; padding-left: 15px;">${criteriaRows}</ul></td>
                    </tr>
                `);
            });
        } else {
            w.document.write(`
                <tr>
                    <td style="text-align:center; vertical-align: top;">1</td>
                    <td style="vertical-align: top; font-weight: bold;">Mampu membuat flowchart logika dengan benar (Template)</td>
                    <td>
                        <ul style="margin:0; padding-left:15px;">
                            <li>Mengidentifikasi seluruh simbol diagram alur formal</li>
                            <li>Mengurutkan alur logika percabangan if-else dengan tepat</li>
                            <li>Menggambar diagram alur rapi menggunakan aplikasi diagram</li>
                        </ul>
                    </td>
                </tr>
            `);
        }

        w.document.write(`
                </tbody>
            </table>
        `);

        closePrintWindow(w, filters);
    }

    // 6. Rencana Pelaksanaan / Modul Ajar (MA)
    function printModulAjar(filters, data) {
        const w = openPrintWindow("Modul Ajar / Rencana Pembelajaran", "portrait");
        
        w.document.write(`
            <div class="kop-surat">
                <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="kop-logo">
                <div class="kop-text">
                    <p class="kop-yayasan">Yayasan Idrisiyyah Tasikmalaya</p>
                    <h2 class="kop-madrasah">Madrasah Tsanawiyah (MTs) Idrisiyyah</h2>
                    <p class="kop-alamat">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855 | Telp: (0265) 323456</p>
                </div>
            </div>
            <h3 class="doc-title" style="text-decoration:none;">MODUL AJAR KURIKULUM MERDEKA</h3>
            <p class="doc-subtitle" style="margin-bottom:10px;">Mata Pelajaran: ${filters.mapel} | Kelas: ${filters.kelas}</p>
        `);

        const maList = collections.modulAjar.filter(d => d.mapel === filters.mapel);
        const ma = maList.length > 0 ? maList[0] : {
            mapel: filters.mapel,
            kelas: filters.kelas,
            fase: "D",
            alokasiWaktu: "2 JP (2 x 40 Menit)",
            tujuan: "Peserta didik dapat memahami konsep computational thinking dan memformulasikan algoritma dasar dalam kehidupan sehari-hari.",
            pendahuluan: "1. Guru mengawali dengan salam pembuka dan doa bersama.\n2. Apersepsi: Tanya jawab seputar aktivitas teratur seperti langkah menyeduh teh manis.",
            inti: "1. Guru mendemonstrasikan bagan flowchart.\n2. Siswa secara berkelompok merancang flowchart aktivitas sederhana.\n3. Perwakilan kelompok mempresentasikan desainnya.",
            penutup: "1. Guru bersama siswa menyimpulkan inti pembelajaran.\n2. Refleksi evaluasi materi dan menutup kelas dengan doa.",
            asesmen: "Formatif: Keaktifan kelas dan lembar LKPD | Sumatif: Tugas mandiri pembuatan flowchart."
        };

        w.document.write(`
            <div style="border: 1px solid #000; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; border-bottom: 1px solid #000; pb-4; font-size:12px;">A. INFORMASI UMUM (IDENTITAS)</h4>
                <table style="width: 100%; font-size: 11px;">
                    <tr><td style="width: 25%; font-weight:bold;">Nama Penyusun</td><td style="width: 3%">:</td><td>${filters.guruNama}</td></tr>
                    <tr><td style="font-weight:bold;">Satuan Pendidikan</td><td>:</td><td>MTs Idrisiyyah</td></tr>
                    <tr><td style="font-weight:bold;">Mata Pelajaran / Fase</td><td>:</td><td>${ma.mapel} / Fase ${ma.fase || 'D'}</td></tr>
                    <tr><td style="font-weight:bold;">Kelas / Alokasi Waktu</td><td>:</td><td>${ma.kelas} / ${ma.alokasiWaktu}</td></tr>
                </table>
            </div>

            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 5px 0; font-size:11px; font-weight:bold; border-bottom: 1px solid #ddd;">B. TUJUAN PEMBELAJARAN (TP)</h4>
                <p style="margin: 0 0 10px 0; text-align:justify;">${ma.tujuan}</p>
            </div>

            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 5px 0; font-size:11px; font-weight:bold; border-bottom: 1px solid #ddd;">C. KEGIATAN PEMBELAJARAN</h4>
                <p style="margin: 3px 0; font-weight:bold; text-decoration:underline;">1. Pendahuluan</p>
                <div style="white-space: pre-line; margin-bottom: 8px; padding-left: 10px;">${ma.pendahuluan}</div>
                
                <p style="margin: 3px 0; font-weight:bold; text-decoration:underline;">2. Kegiatan Inti</p>
                <div style="white-space: pre-line; margin-bottom: 8px; padding-left: 10px;">${ma.inti}</div>
                
                <p style="margin: 3px 0; font-weight:bold; text-decoration:underline;">3. Penutup</p>
                <div style="white-space: pre-line; margin-bottom: 8px; padding-left: 10px;">${ma.penutup}</div>
            </div>

            <div style="margin-bottom: 25px;">
                <h4 style="margin: 0 0 5px 0; font-size:11px; font-weight:bold; border-bottom: 1px solid #ddd;">D. ASESMEN / PENILAIAN</h4>
                <p style="margin: 0;">${ma.asesmen}</p>
            </div>
        `);

        closePrintWindow(w, filters);
    }

    // 7. Bahan Ajar & LKPD
    function printBahanLkpd(filters, data) {
        const w = openPrintWindow("Bahan Ajar & LKPD", "portrait");
        
        w.document.write(`
            <div class="kop-surat">
                <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="kop-logo">
                <div class="kop-text">
                    <p class="kop-yayasan">Yayasan Idrisiyyah Tasikmalaya</p>
                    <h2 class="kop-madrasah">Madrasah Tsanawiyah (MTs) Idrisiyyah</h2>
                    <p class="kop-alamat">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855 | Telp: (0265) 323456</p>
                </div>
            </div>
            <h3 class="doc-title" style="text-decoration:none;">LEMBAR KERJA PESERTA DIDIK & BAHAN AJAR</h3>
            <p class="doc-subtitle" style="margin-bottom:15px;">Mata Pelajaran: ${filters.mapel} | Kelas: ${filters.kelas}</p>
        `);

        const baList = collections.bahanAjar.filter(d => d.mapel === filters.mapel);
        const lkList = collections.lkpd.filter(d => d.mapel === filters.mapel);

        const ba = baList.length > 0 ? baList[0] : {
            judul: "Pengenalan Algoritma Dasar",
            ringkasan: "Algoritma adalah deretan langkah logis terstruktur yang dituliskan untuk memecahkan suatu masalah. Kriteria algoritma yang baik: memiliki input, memiliki proses yang jelas, memiliki output akhir, dan bersifat finit (berakhir)."
        };

        const lk = lkList.length > 0 ? lkList[0] : {
            judul: "Menggambar Bagan Flowchart Logika Mandiri",
            tujuan: "Peserta didik dapat merakit diagram flowchart formal berdasarkan narasi kasus kehidupan sehari-hari.",
            instruksi: "1. Pilihlah satu studi kasus sederhana (contoh: proses merebus mie instan).\n2. Tuliskan teks algoritma langkah demi langkah.\n3. Gambar diagram flowchart menggunakan simbol standar (terminator, proses, keputusan, input/output)."
        };

        w.document.write(`
            <div style="border: 2px solid #000; padding: 12px; margin-bottom: 20px;">
                <h4 style="margin:0 0 8px 0; text-transform:uppercase; font-size:12px; border-bottom:1px solid #000; pb-2;">I. RINGKASAN MATERI (BAHAN AJAR)</h4>
                <p style="font-weight:bold; margin: 4px 0;">Topik: ${ba.judul}</p>
                <p style="text-align:justify; margin: 0;">${ba.ringkasan}</p>
            </div>

            <div style="border: 2px solid #000; padding: 12px; margin-bottom: 20px; background: #fafafa;">
                <h4 style="margin:0 0 8px 0; text-transform:uppercase; font-size:12px; border-bottom:1px solid #000; pb-2;">II. LEMBAR KERJA PESERTA DIDIK (LKPD)</h4>
                <p style="font-weight:bold; margin: 4px 0;">Tugas Praktik: ${lk.judul}</p>
                
                <p style="margin: 4px 0; font-weight:bold;">Tujuan Tugas:</p>
                <p style="margin: 0 0 10px 0;">${lk.tujuan}</p>

                <p style="margin: 4px 0; font-weight:bold;">Langkah-Langkah & Instruksi:</p>
                <div style="white-space: pre-line; line-height: 1.5; padding-left: 10px;">${lk.instruksi}</div>
            </div>
        `);

        closePrintWindow(w, filters);
    }

    // 8. Jadwal Pelajaran Guru
    function printJadwal(filters, data) {
        const w = openPrintWindow("Jadwal Pelajaran", "portrait");
        
        w.document.write(`
            <div class="kop-surat">
                <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="kop-logo">
                <div class="kop-text">
                    <p class="kop-yayasan">Yayasan Idrisiyyah Tasikmalaya</p>
                    <h2 class="kop-madrasah">Madrasah Tsanawiyah (MTs) Idrisiyyah</h2>
                    <p class="kop-alamat">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855 | Telp: (0265) 323456</p>
                </div>
            </div>
            <h3 class="doc-title">Jadwal Mengajar Pendidik</h3>
            <p class="doc-subtitle">Guru: ${filters.guruNama} | Mapel: ${filters.mapel}</p>

            <table class="table-data">
                <thead>
                    <tr>
                        <th style="width: 5%">No</th>
                        <th style="width: 25%">Hari</th>
                        <th style="width: 30%">Waktu / Jam Ke</th>
                        <th style="width: 20%">Kelas</th>
                        <th>Keterangan</th>
                    </tr>
                </thead>
                <tbody>
        `);

        const jList = collections.jadwal.filter(d => d.mapel === filters.mapel && d.kelas === filters.kelas);
        if (jList.length > 0) {
            jList.forEach((d, idx) => {
                w.document.write(`
                    <tr>
                        <td style="text-align:center;">${idx + 1}</td>
                        <td style="text-align:center; font-weight:bold;">${d.hari}</td>
                        <td style="text-align:center;">${d.jam || '07:30 - 09:00'}</td>
                        <td style="text-align:center; font-weight:bold;">${d.kelas}</td>
                        <td>Mengajar ${filters.mapel}</td>
                    </tr>
                `);
            });
        } else {
            w.document.write(`
                <tr>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:center; font-weight:bold;">Senin</td>
                    <td style="text-align:center;">07:30 - 09:00 (Jam 1-2)</td>
                    <td style="text-align:center; font-weight:bold;">${filters.kelas}</td>
                    <td>Template Default Penjadwalan</td>
                </tr>
            `);
        }

        w.document.write(`
                </tbody>
            </table>
        `);

        closePrintWindow(w, filters);
    }

    // 9. Rekap Jurnal Agenda KBM
    function printJurnal(filters, data) {
        const w = openPrintWindow("Rekap Jurnal Agenda KBM", "landscape");
        
        w.document.write(`
            <div class="kop-surat">
                <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="kop-logo">
                <div class="kop-text">
                    <p class="kop-yayasan">Yayasan Idrisiyyah Tasikmalaya</p>
                    <h2 class="kop-madrasah">Madrasah Tsanawiyah (MTs) Idrisiyyah</h2>
                    <p class="kop-alamat">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855 | Telp: (0265) 323456</p>
                </div>
            </div>
            <h3 class="doc-title">JURNAL AGENDA HARIAN MENGAJAR GURU</h3>
            <p class="doc-subtitle">Kelas: ${filters.kelas} | Mapel: ${filters.mapel} | Semester: ${settings.semester}</p>

            <table class="table-data">
                <thead>
                    <tr>
                        <th style="width: 5%">No</th>
                        <th style="width: 12%">Tanggal</th>
                        <th style="width: 8%">Jam Ke</th>
                        <th style="width: 30%; text-align: left;">Materi Pembelajaran</th>
                        <th style="width: 25%; text-align: left;">Kendala / Hambatan</th>
                        <th style="text-align: left;">Tindak Lanjut Pembelajaran</th>
                    </tr>
                </thead>
                <tbody>
        `);

        const jrList = collections.jurnal.filter(d => d.kelas === filters.kelas && d.mapel === filters.mapel);
        if (jrList.length > 0) {
            jrList.forEach((d, idx) => {
                w.document.write(`
                    <tr>
                        <td style="text-align:center;">${idx + 1}</td>
                        <td style="text-align:center;">${d.tanggal}</td>
                        <td style="text-align:center;">${d.jamKe}</td>
                        <td>${d.materi}</td>
                        <td style="color: #c2410c;">${d.kendala || '-'}</td>
                        <td style="color: #047857;">${d.tindakLanjut || '-'}</td>
                    </tr>
                `);
            });
        } else {
            w.document.write(`
                <tr>
                    <td colspan="6" style="text-align:center; padding: 20px; color:#555;">Tidak ada catatan jurnal. Dokumen template jurnal agenda kosong disiapkan.</td>
                </tr>
            `);
        }

        w.document.write(`
                </tbody>
            </table>
        `);

        closePrintWindow(w, filters);
    }

    // 10. Laporan Nilai Rombel
    function printLaporanNilai(filters, data) {
        const w = openPrintWindow("Laporan Nilai Siswa Rombel", "portrait");
        
        w.document.write(`
            <div class="kop-surat">
                <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="kop-logo">
                <div class="kop-text">
                    <p class="kop-yayasan">Yayasan Idrisiyyah Tasikmalaya</p>
                    <h2 class="kop-madrasah">Madrasah Tsanawiyah (MTs) Idrisiyyah</h2>
                    <p class="kop-alamat">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855 | Telp: (0265) 323456</p>
                </div>
            </div>
            <h3 class="doc-title">REKAPITULASI NILAI HASIL BELAJAR SISWA</h3>
            <p class="doc-subtitle">Mata Pelajaran: ${filters.mapel} | Kelas: ${filters.kelas} | TA: ${settings.tahunAjaran}</p>

            <table class="table-data">
                <thead>
                    <tr>
                        <th style="width: 5%">No</th>
                        <th style="width: 15%">NISN</th>
                        <th style="text-align: left;">Nama Siswa</th>
                        <th style="width: 10%">Tugas (30%)</th>
                        <th style="width: 10%">Ulangan (20%)</th>
                        <th style="width: 10%">UTS (25%)</th>
                        <th style="width: 10%">PAS (25%)</th>
                        <th style="width: 10%">Rata-rata</th>
                        <th style="width: 10%">Predikat</th>
                    </tr>
                </thead>
                <tbody>
        `);

        const classStudents = collections.siswa.filter(s => s.kelas === filters.kelas);
        const grades = collections.penilaian.filter(p => p.kelas === filters.kelas && p.mapel === filters.mapel);

        if (classStudents.length > 0) {
            classStudents.forEach((student, idx) => {
                const sGrade = grades.find(g => g.siswaId === student.id) || { tugas: 0, ulangan: 0, uts: 0, uas: 0 };
                
                // Final Grade calculation
                const finalScore = Math.round(
                    (Number(sGrade.tugas || 0) * 0.3) +
                    (Number(sGrade.ulangan || 0) * 0.2) +
                    (Number(sGrade.uts || 0) * 0.25) +
                    (Number(sGrade.uas || sGrade.uas === 0 ? sGrade.uas : 0) * 0.25)
                );

                // Letter Grade Predikat
                let pred = 'E';
                if (finalScore >= 88) pred = 'A';
                else if (finalScore >= 78) pred = 'B';
                else if (finalScore >= 68) pred = 'C';
                else if (finalScore >= 60) pred = 'D';

                w.document.write(`
                    <tr>
                        <td style="text-align:center;">${idx + 1}</td>
                        <td style="text-align:center;">${student.nisn || '-'}</td>
                        <td style="font-weight:bold;">${student.nama}</td>
                        <td style="text-align:center;">${sGrade.tugas || 0}</td>
                        <td style="text-align:center;">${sGrade.ulangan || 0}</td>
                        <td style="text-align:center;">${sGrade.uts || 0}</td>
                        <td style="text-align:center;">${sGrade.uas || 0}</td>
                        <td style="text-align:center; font-weight:bold; background: #fafafa;">${finalScore}</td>
                        <td style="text-align:center; font-weight:bold;">${pred}</td>
                    </tr>
                `);
            });
        } else {
            w.document.write(`
                <tr>
                    <td colspan="9" style="text-align:center; padding: 20px; color:#555;">Tidak ada data siswa terdaftar di kelas ${filters.kelas}.</td>
                </tr>
            `);
        }

        w.document.write(`
                </tbody>
            </table>
        `);

        closePrintWindow(w, filters);
    }

    // 11. Rekap Absensi Bulanan
    function printRekapAbsensi(filters, data) {
        const w = openPrintWindow("Rekapitulasi Absensi Rombel", "landscape");
        
        // Month calculations (e.g. June 2026 has 30 days)
        const daysInMonth = 30; // standard mock June
        
        let dayHeadersHtml = '';
        for (let i = 1; i <= daysInMonth; i++) {
            dayHeadersHtml += `<th style="width: 2%; padding:2px; font-size: 8px;">${i}</th>`;
        }

        w.document.write(`
            <div class="kop-surat">
                <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="kop-logo">
                <div class="kop-text">
                    <p class="kop-yayasan">Yayasan Idrisiyyah Tasikmalaya</p>
                    <h2 class="kop-madrasah">Madrasah Tsanawiyah (MTs) Idrisiyyah</h2>
                    <p class="kop-alamat">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855 | Telp: (0265) 323456</p>
                </div>
            </div>
            <h3 class="doc-title">REKAPITULASI PRESENSI KEHADIRAN SISWA BULANAN</h3>
            <p class="doc-subtitle">Kelas: ${filters.kelas} | Periode: ${filters.bulanNama} | Tahun Pelajaran: ${settings.tahunAjaran}</p>

            <table class="table-data" style="margin-top: 10px;">
                <thead>
                    <tr>
                        <th rowspan="2" style="width: 3%">No</th>
                        <th rowspan="2" style="text-align: left; width: 18%">Nama Siswa</th>
                        <th colspan="${daysInMonth}" style="font-size: 9px; padding:2px;">Tanggal Pertemuan / Kehadiran Harian</th>
                        <th colspan="4" style="font-size: 9px; padding:2px; width: 8%">Rekap</th>
                    </tr>
                    <tr>
                        ${dayHeadersHtml}
                        <th style="padding:2px; font-size:8px; width:2%">H</th>
                        <th style="padding:2px; font-size:8px; width:2%">S</th>
                        <th style="padding:2px; font-size:8px; width:2%">I</th>
                        <th style="padding:2px; font-size:8px; width:2%">A</th>
                    </tr>
                </thead>
                <tbody>
        `);

        const classStudents = collections.siswa.filter(s => s.kelas === filters.kelas);
        const absensiRecords = collections.absensi.filter(a => a.kelas === filters.kelas);

        if (classStudents.length > 0) {
            classStudents.forEach((student, idx) => {
                let daysCellsHtml = '';
                let hCount = 0, sCount = 0, iCount = 0, aCount = 0;

                // Loop through 30 days
                for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `2026-06-${day.toString().padStart(2, '0')}`;
                    const dailyRecord = absensiRecords.find(r => r.tanggal === dateStr);
                    let status = '-';
                    
                    if (dailyRecord && dailyRecord.records && dailyRecord.records[student.id]) {
                        status = dailyRecord.records[student.id];
                        if (status === 'H') hCount++;
                        else if (status === 'S') sCount++;
                        else if (status === 'I') iCount++;
                        else if (status === 'A') aCount++;
                    }

                    // Format visually
                    let cellVal = status;
                    if (status === '-') cellVal = '';
                    
                    daysCellsHtml += `<td style="text-align:center; padding: 2px; font-size: 9px; font-weight: bold;">${cellVal}</td>`;
                }

                w.document.write(`
                    <tr>
                        <td style="text-align:center;">${idx + 1}</td>
                        <td style="font-weight:bold; font-size: 9px;">${student.nama}</td>
                        ${daysCellsHtml}
                        <td style="text-align:center; font-weight:bold; background:#ecfdf5; color:#047857;">${hCount || ''}</td>
                        <td style="text-align:center; font-weight:bold; background:#eff6ff; color:#1d4ed8;">${sCount || ''}</td>
                        <td style="text-align:center; font-weight:bold; background:#fffbeb; color:#b45309;">${iCount || ''}</td>
                        <td style="text-align:center; font-weight:bold; background:#fef2f2; color:#b91c1c;">${aCount || ''}</td>
                    </tr>
                `);
            });
        } else {
            w.document.write(`
                <tr>
                    <td colspan="${daysInMonth + 6}" style="text-align:center; padding: 20px; color:#555;">Tidak ada data siswa terdaftar di kelas ${filters.kelas}.</td>
                </tr>
            `);
        }

        w.document.write(`
                </tbody>
            </table>
        `);

        closePrintWindow(w, filters);
    }
}
