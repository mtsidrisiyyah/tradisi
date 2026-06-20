// ============================================
// TRADISI — Kalender Pendidikan Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, showConfirmDialog } = ctx;
    const events = await dbService.getData('events') || [];

    // Helper to get Category Classes for CSS styling
    const getCategoryStyles = function(category) {
        switch (category) {
            case 'Akademik':
                return {
                    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    border: 'border-blue-500/10 dark:border-blue-500/20',
                    leftBorder: 'border-l-4 border-l-blue-500'
                };
            case 'Ujian':
                return {
                    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                    border: 'border-amber-500/10 dark:border-amber-500/20',
                    leftBorder: 'border-l-4 border-l-amber-500'
                };
            case 'Kegiatan':
                return {
                    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                    border: 'border-purple-500/10 dark:border-purple-500/20',
                    leftBorder: 'border-l-4 border-l-purple-500'
                };
            case 'Libur':
                return {
                    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-450',
                    border: 'border-rose-500/10 dark:border-rose-500/20',
                    leftBorder: 'border-l-4 border-l-rose-500'
                };
            default:
                return {
                    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350',
                    border: 'border-slate-200/50 dark:border-slate-800',
                    leftBorder: 'border-l-4 border-l-slate-400'
                };
        }
    };

    window.renderEvents = function(list = events) {
        const container = document.getElementById('events-container');
        if (!container) return;

        if (list.length === 0) {
            container.innerHTML = `
                <div class="py-12 text-center text-xs text-slate-500">
                    <i class="ph ph-calendar-blank text-3xl mb-2 text-slate-400 block"></i>
                    Belum ada kegiatan akademik terdaftar.
                </div>
            `;
            return;
        }

        // Sort events chronologically
        const sorted = [...list].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

        container.innerHTML = sorted.map(ev => {
            const styles = getCategoryStyles(ev.kategori);
            
            // Format date for display
            let dateFormatted = ev.tanggal;
            try {
                const dateObj = new Date(ev.tanggal);
                dateFormatted = dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            } catch (e) {
                console.error("Format tanggal error:", e);
            }

            return `
                <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800/60 rounded-2xl border ${styles.border} ${styles.leftBorder} hover:shadow-sm transition-all duration-300">
                    <div class="flex items-center gap-3">
                        <div>
                            <div class="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${styles.badge} w-fit">${ev.kategori}</div>
                            <p class="text-xs font-black text-slate-800 dark:text-slate-200 mt-1.5">${ev.judul}</p>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5"><i class="ph ph-calendar-blank"></i> ${dateFormatted}</p>
                        </div>
                    </div>
                    <button onclick="deleteEvent('${ev.id}')" class="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors no-print" title="Hapus Acara"><i class="ph ph-trash text-base"></i></button>
                </div>
            `;
        }).join('');
    };

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
                <div class="flex flex-1 gap-2.5 max-w-lg">
                    <div class="relative flex-1">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><i class="ph ph-magnifying-glass"></i></span>
                        <input type="text" id="search-event" oninput="filterEvents()" placeholder="Cari kegiatan..." class="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                    </div>
                    <select id="filter-kategori" onchange="filterEvents()" class="px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                        <option value="">Semua Kategori</option>
                        <option value="Akademik">Akademik</option>
                        <option value="Ujian">Ujian</option>
                        <option value="Kegiatan">Kegiatan</option>
                        <option value="Libur">Libur</option>
                    </select>
                </div>
                <div class="flex gap-2">
                    <button onclick="printCalendarFormat()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-98">
                        <i class="ph ph-printer text-base"></i> Cetak A3/A4
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Events List Container -->
                <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <i class="ph ph-calendar-blank text-forest-650 text-base"></i> Agenda Kalender Pendidikan Aktif
                    </h3>
                    <div class="space-y-3" id="events-container"></div>
                </div>

                <!-- Add Event Form -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4 h-fit no-print">
                    <h3 class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <i class="ph ph-plus-circle text-forest-650 text-base"></i> Daftarkan Acara Baru
                    </h3>
                    <form id="event-form" class="space-y-4">
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Tanggal</label>
                            <input type="date" id="ev-date" required class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Nama Kegiatan</label>
                            <input type="text" id="ev-title" placeholder="contoh: Pembagian Rapor" required class="w-full px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Kategori</label>
                            <select id="ev-cat" class="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:border-forest-500 text-xs">
                                <option value="Akademik">Akademik</option>
                                <option value="Ujian">Ujian</option>
                                <option value="Kegiatan">Kegiatan</option>
                                <option value="Libur">Libur / Hari Libur</option>
                            </select>
                        </div>
                        <button type="submit" class="w-full bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition-all active:scale-98">Simpan Acara</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    window.filterEvents = function() {
        const search = document.getElementById('search-event').value.toLowerCase();
        const cat = document.getElementById('filter-kategori').value;

        const filtered = events.filter(ev => {
            const matchSearch = ev.judul.toLowerCase().includes(search);
            const matchCat = !cat || ev.kategori === cat;
            return matchSearch && matchCat;
        });
        renderEvents(filtered);
    };

    document.getElementById('event-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const dateVal = document.getElementById('ev-date').value;
        const titleVal = document.getElementById('ev-title').value.trim();
        const catVal = document.getElementById('ev-cat').value;

        const newEvent = {
            id: 'ev_' + Date.now(),
            tanggal: dateVal,
            judul: titleVal,
            kategori: catVal,
            status: 'aktif'
        };

        events.push(newEvent);
        await dbService.saveData('events', events);
        showToast("Kegiatan kalender berhasil disimpan!");
        document.getElementById('ev-title').value = '';
        renderEvents();
    });

    window.deleteEvent = function(id) {
        const ev = events.find(item => item.id === id);
        showConfirmDialog("Hapus Acara", `Hapus agenda kegiatan <strong>${ev ? ev.judul : ''}</strong>?`, () => {
            const idx = events.findIndex(item => item.id === id);
            if (idx !== -1) {
                events.splice(idx, 1);
                dbService.saveData('events', events).then(() => {
                    renderEvents();
                    showToast("Kegiatan kalender telah dihapus.");
                });
            }
        });
    };

    // Print Educational Calendar (Landscape Layout)
    window.printCalendarFormat = function() {
        const sortedEvents = [...events].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

        let rowsHtml = sortedEvents.map((ev, i) => {
            let dateFormatted = ev.tanggal;
            try {
                const dateObj = new Date(ev.tanggal);
                dateFormatted = dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            } catch (e) {}

            return `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px; text-align: center; font-size: 11px;">${i + 1}</td>
                    <td style="padding: 10px; font-weight: bold; font-size: 11px;">${dateFormatted}</td>
                    <td style="padding: 10px; font-size: 11px;">${ev.judul}</td>
                    <td style="padding: 10px; text-align: center; font-size: 11px; font-weight: bold; font-size: 10px;">
                        <span style="padding: 3px 8px; border-radius: 4px; ${
                            ev.kategori === 'Akademik' ? 'background: #dbeafe; color: #1e40af;' :
                            ev.kategori === 'Ujian' ? 'background: #fef3c7; color: #92400e;' :
                            ev.kategori === 'Kegiatan' ? 'background: #f3e8ff; color: #6b21a8;' :
                            'background: #fee2e2; color: #991b1b;'
                        }">${ev.kategori}</span>
                    </td>
                </tr>
            `;
        }).join('');

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Kalender Akademik MTs Idrisiyyah</title>
                <style>
                    body {
                        font-family: 'Outfit', 'Inter', sans-serif;
                        padding: 40px;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 3px double #333;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .title {
                        font-size: 20px;
                        font-weight: 900;
                        text-transform: uppercase;
                        margin: 0;
                    }
                    .subtitle {
                        font-size: 11px;
                        color: #666;
                        margin: 5px 0 0 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th {
                        background-color: #064e3b;
                        color: white;
                        padding: 12px 10px;
                        font-size: 11px;
                        text-transform: uppercase;
                    }
                    @page {
                        size: landscape;
                        margin: 1cm;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2 class="title">KALENDER PENDIDIKAN DAN KEGIATAN AKADEMIK</h2>
                    <h3 style="margin: 5px 0 0 0; font-size: 14px;">MTs IDRISIYYAH TASIKMALAYA</h3>
                    <p class="subtitle">Tahun Pelajaran: 2026/2027 | Periode: Ganjil & Genap</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%;">No</th>
                            <th style="width: 30%; text-align: left;">Hari & Tanggal</th>
                            <th style="width: 50%; text-align: left;">Nama Kegiatan / Agenda</th>
                            <th style="width: 15%;">Kategori</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml || '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #888;">Belum ada agenda akademik terdaftar.</td></tr>'}
                    </tbody>
                </table>
                <div style="margin-top: 50px; float: right; text-align: center; font-size: 11px;">
                    <p>Tasikmalaya, ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p style="margin-bottom: 60px;">Kepala Madrasah,</p>
                    <p><strong>H. Ahmad Fauzian, M.Pd.</strong></p>
                    <p style="color: #666; font-size: 10px; margin-top: 2px;">NIP. 197804152006041003</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    renderEvents();
}
