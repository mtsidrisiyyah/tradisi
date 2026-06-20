// ============================================
// TRADISI — Bank Soal Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService, showToast, getUserProfile } = ctx;
    const items = await dbService.getData('bankSoal') || [];
    const userProfile = getUserProfile();

    // Load master data
    const subjects = await dbService.getData('subjects') || [];
    const classrooms = await dbService.getData('classrooms') || [];
    const settings = await dbService.getData('madrasah_settings') || {};

    const renderBS = function(list = items) {
        const c = document.getElementById('items-list');
        if (!list.length) {
            c.innerHTML = `<div class="text-center py-8 text-xs text-slate-400"><i class="ph ph-question text-3xl mb-2"></i><p>Belum ada soal.</p></div>`;
            return;
        }
        c.innerHTML = list.map((d, i) => `
            <div class="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">${d.jenis}</span>
                        <span class="text-[10px] text-slate-550 dark:text-slate-400 font-bold">${d.mapel} | Kelas ${d.kelas}</span>
                    </div>
                    <button onclick="window.deleteItem('bankSoal','${d.id}', window.renderBSCallback, window.bsItems)" class="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"><i class="ph ph-trash text-base"></i></button>
                </div>
                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${d.soal}</p>
                ${d.jenis === 'PG' ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] pt-1">
                        <span class="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 ${d.kunci === 'A' ? 'border border-emerald-500 text-emerald-600 font-extrabold' : 'text-slate-500'}">A. ${d.pilihanA || ''}</span>
                        <span class="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 ${d.kunci === 'B' ? 'border border-emerald-500 text-emerald-600 font-extrabold' : 'text-slate-500'}">B. ${d.pilihanB || ''}</span>
                        <span class="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 ${d.kunci === 'C' ? 'border border-emerald-500 text-emerald-600 font-extrabold' : 'text-slate-500'}">C. ${d.pilihanC || ''}</span>
                        <span class="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 ${d.kunci === 'D' ? 'border border-emerald-500 text-emerald-600 font-extrabold' : 'text-slate-500'}">D. ${d.pilihanD || ''}</span>
                    </div>
                ` : ''}
                ${d.pembahasan ? `<div class="text-[10px] bg-slate-200/50 dark:bg-slate-800 p-2.5 rounded-xl text-slate-600 dark:text-slate-400 mt-2 font-medium italic"><i class="ph ph-info mr-1"></i>Pembahasan: ${d.pembahasan}</div>` : ''}
            </div>
        `).join('');
    };

    window.renderBSCallback = renderBS;
    window.bsItems = items;

    // Build Dropdown Options
    const mapelOptions = subjects.map(s => `<option value="${s.nama}">${s.nama} (${s.tingkat})</option>`).join('');
    const kelasOptions = classrooms.map(c => `<option value="${c.nama}">${c.nama}</option>`).join('');

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                <!-- Form Tambah Soal (Left 2 cols) -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm no-print">
                        <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-plus-circle text-forest-600"></i> Tambah Soal Baru</h3>
                        <form id="item-form" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-[10px] font-semibold text-slate-550 mb-1 uppercase tracking-wider">Mata Pelajaran</label>
                                    <select id="f-mapel" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                                        <option value="">-- Pilih Mapel --</option>
                                        ${mapelOptions}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-[10px] font-semibold text-slate-550 mb-1 uppercase tracking-wider">Kelas / Rombel</label>
                                    <select id="f-kelas" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                                        <option value="">-- Pilih Kelas --</option>
                                        ${kelasOptions}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-[10px] font-semibold text-slate-550 mb-1 uppercase tracking-wider">Jenis Soal</label>
                                    <select id="f-jenis" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                                        <option value="PG">Pilihan Ganda</option>
                                        <option value="Esai">Esai</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] font-semibold text-slate-550 mb-1 uppercase tracking-wider">Pertanyaan / Soal</label>
                                <textarea id="f-soal" rows="3" required placeholder="Masukkan butir soal di sini..." class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500"></textarea>
                            </div>
                            
                            <!-- PG Fields -->
                            <div id="pg-fields" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-[10px] font-semibold text-slate-550 mb-1 uppercase tracking-wider">Pilihan A</label>
                                    <input type="text" id="f-a" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-semibold text-slate-550 mb-1 uppercase tracking-wider">Pilihan B</label>
                                    <input type="text" id="f-b" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-semibold text-slate-550 mb-1 uppercase tracking-wider">Pilihan C</label>
                                    <input type="text" id="f-c" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-semibold text-slate-550 mb-1 uppercase tracking-wider">Pilihan D</label>
                                    <input type="text" id="f-d" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-[10px] font-semibold text-slate-550 mb-1 uppercase tracking-wider">Kunci Jawaban</label>
                                    <select id="f-kunci" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-[10px] font-semibold text-slate-550 mb-1 uppercase tracking-wider">Pembahasan (Opsional)</label>
                                    <input type="text" id="f-pembahasan" placeholder="Pembahasan singkat..." class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none focus:border-forest-500">
                                </div>
                            </div>
                            <div class="flex justify-end">
                                <button type="submit" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-sm"><i class="ph ph-floppy-disk mr-1"></i> Simpan Soal</button>
                            </div>
                        </form>
                    </div>

                    <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-6">
                        <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200"><i class="ph ph-list text-forest-600 mr-1"></i> Daftar Soal di Database</h3>
                        <div class="space-y-3" id="items-list"></div>
                    </div>
                </div>

                <!-- Generator Paket Soal Acak (Right side) -->
                <div class="space-y-6">
                    <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
                        <h3 class="text-xs font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i class="ph ph-shuffle text-forest-650"></i> Generator Paket Soal</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Pilih Mapel</label>
                                <select id="g-mapel" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none">
                                    ${mapelOptions}
                                </select>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Pilih Kelas</label>
                                <select id="g-kelas" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none">
                                    ${kelasOptions}
                                </select>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Jumlah Soal</label>
                                    <input type="number" id="g-jumlah" min="1" max="50" value="5" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Tipe Soal</label>
                                    <select id="g-jenis" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs outline-none">
                                        <option value="SEMUA">Semua Tipe</option>
                                        <option value="PG">Pilihan Ganda</option>
                                        <option value="Esai">Esai</option>
                                    </select>
                                </div>
                            </div>
                            <button id="btn-generate-paket" class="w-full bg-forest-750 hover:bg-forest-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all">
                                <i class="ph ph-sparkle"></i> Acak & Buat Paket Soal
                            </button>
                        </div>
                    </div>

                    <!-- generated packet result -->
                    <div id="packet-result-panel" class="hidden bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4">
                        <div class="border-b border-slate-100 dark:border-slate-750 pb-2">
                            <h4 class="text-xs font-bold text-slate-850 dark:text-slate-200">Hasil Paket Soal</h4>
                            <p class="text-[9px] text-slate-400" id="packet-meta-desc"></p>
                        </div>
                        <div id="packet-preview-list" class="space-y-3 max-h-[220px] overflow-y-auto pr-1"></div>
                        <div class="grid grid-cols-2 gap-2">
                            <button id="btn-print-soal" class="bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 px-3 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all"><i class="ph ph-printer"></i> Cetak Soal</button>
                            <button id="btn-print-kunci" class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all"><i class="ph ph-key"></i> Cetak Kunci</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;

    const togglePGFields = function() {
        const pg = document.getElementById('pg-fields');
        const kunci = document.getElementById('f-kunci');
        if (document.getElementById('f-jenis').value === 'PG') {
            pg.classList.remove('hidden');
            kunci.disabled = false;
        } else {
            pg.classList.add('hidden');
            kunci.disabled = true;
        }
    };

    document.getElementById('f-jenis').addEventListener('change', togglePGFields);

    document.getElementById('item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        items.push({
            id: 'bs_' + Date.now(),
            mapel: document.getElementById('f-mapel').value,
            kelas: document.getElementById('f-kelas').value,
            jenis: document.getElementById('f-jenis').value,
            soal: document.getElementById('f-soal').value,
            pilihanA: document.getElementById('f-a').value || '',
            pilihanB: document.getElementById('f-b').value || '',
            pilihanC: document.getElementById('f-c').value || '',
            pilihanD: document.getElementById('f-d').value || '',
            kunci: document.getElementById('f-kunci').value,
            pembahasan: document.getElementById('f-pembahasan').value || ''
        });
        await dbService.saveData('bankSoal', items);
        showToast("Soal berhasil disimpan ke bank soal!");
        e.target.reset();
        togglePGFields();
        renderBS();
    });

    // ============================================
    // RANDOM SHUFFLE GENERATION LOGIC
    // ============================================
    let generatedPacket = [];

    document.getElementById('btn-generate-paket').addEventListener('click', () => {
        const mapel = document.getElementById('g-mapel').value;
        const kelas = document.getElementById('g-kelas').value;
        const limit = parseInt(document.getElementById('g-jumlah').value, 10) || 5;
        const jenis = document.getElementById('g-jenis').value;

        // Filter matched items
        let matched = items.filter(d => d.mapel === mapel && kelas.startsWith(d.kelas));
        if (jenis !== 'SEMUA') {
            matched = matched.filter(d => d.jenis === jenis);
        }

        if (matched.length === 0) {
            showToast("Tidak ada butir soal di database yang cocok dengan kriteria!", "error");
            document.getElementById('packet-result-panel').classList.add('hidden');
            return;
        }

        // Shuffle matched array
        const shuffled = [...matched].sort(() => Math.random() - 0.5);
        generatedPacket = shuffled.slice(0, limit);

        // Render preview list
        const preview = document.getElementById('packet-preview-list');
        document.getElementById('packet-meta-desc').innerText = `Terpilih ${generatedPacket.length} soal dari total ${matched.length} yang tersedia`;
        preview.innerHTML = generatedPacket.map((q, idx) => `
            <div class="p-2.5 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px]">
                <span class="font-extrabold text-forest-700 dark:text-forest-400">Soal ${idx + 1}.</span> ${q.soal}
            </div>
        `).join('');

        document.getElementById('packet-result-panel').classList.remove('hidden');
        showToast(`Paket soal acak berhasil dirakit!`);
    });

    // Print Soal
    document.getElementById('btn-print-soal').addEventListener('click', () => {
        if (!generatedPacket.length) return;
        const mapel = document.getElementById('g-mapel').value;
        const kelas = document.getElementById('g-kelas').value;

        const w = window.open('', '_blank');
        w.document.write(`
            <html>
            <head>
                <title>Cetak Lembar Soal Ujian</title>
                <style>
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        padding: 30px 40px;
                        font-size: 12px;
                        line-height: 1.5;
                    }
                    .kop-surat {
                        display: flex;
                        align-items: center;
                        border-bottom: 3px double #000;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                    }
                    .kop-logo {
                        width: 65px;
                        height: 65px;
                        margin-right: 15px;
                    }
                    .kop-text {
                        flex-grow: 1;
                        text-align: center;
                    }
                    .info-header {
                        width: 100%;
                        border: 1px solid #000;
                        padding: 8px;
                        margin-bottom: 20px;
                        border-collapse: collapse;
                    }
                    .info-header td {
                        padding: 3px 6px;
                        font-size: 11px;
                    }
                    .petunjuk {
                        font-size: 10px;
                        border: 1px dashed #444;
                        padding: 8px;
                        margin-bottom: 20px;
                        background: #fbfbfb;
                    }
                    .soal-item {
                        margin-bottom: 15px;
                        page-break-inside: avoid;
                    }
                    .pilihan-container {
                        margin-left: 15px;
                        margin-top: 4px;
                    }
                    .pilihan-col {
                        display: inline-block;
                        width: 48%;
                        margin-bottom: 2px;
                    }
                    .no-print {
                        background: #1e293b;
                        padding: 8px;
                        margin-bottom: 15px;
                        border-radius: 4px;
                        text-align: center;
                    }
                    .btn-act {
                        background: #10b981;
                        color: white;
                        border: none;
                        padding: 5px 12px;
                        font-size: 11px;
                        font-weight: bold;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    @media print {
                        .no-print { display: none !important; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print">
                    <button class="btn-act" onclick="window.print()">Cetak Lembar Soal</button>
                    <button class="btn-act" style="background:#ef4444;" onclick="window.close()">Tutup</button>
                </div>
                
                <div class="kop-surat">
                    <img src="https://i.postimg.cc/YChZPb1f/LOGO-MTS.png" class="kop-logo">
                    <div class="kop-text">
                        <span style="font-size:11px; font-weight:bold;">YAYASAN IDRISIYYAH TASIKMALAYA</span><br>
                        <span style="font-size:15px; font-weight:bold;">MADRASAH TSANAWIYAH (MTs) IDRISIYYAH</span><br>
                        <span style="font-size:9px; font-style:italic;">Jl. Raya Ciawi No. 12, Tasikmalaya, Jawa Barat | NPSN: 20210855</span>
                    </div>
                </div>

                <h4 style="text-align:center; margin: 0 0 10px 0; text-transform:uppercase;">LEMBAR SOAL UJIAN AKHIR SEMESTER</h4>

                <table class="info-header" border="1">
                    <tr>
                        <td style="width: 15%; font-weight:bold;">Mata Pelajaran</td><td style="width: 2%">:</td><td style="width: 33%">${mapel}</td>
                        <td style="width: 15%; font-weight:bold;">Hari / Tanggal</td><td style="width: 2%">:</td><td style="width: 33%">${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    </tr>
                    <tr>
                        <td style="font-weight:bold;">Kelas</td><td>:</td><td>${kelas}</td>
                        <td style="font-weight:bold;">Waktu</td><td>:</td><td>90 Menit</td>
                    </tr>
                </table>

                <div class="petunjuk">
                    <strong>PETUNJUK UMUM:</strong>
                    <ol style="margin: 3px 0 0 0; padding-left: 15px;">
                        <li>Tuliskan identitas nama dan nomor peserta Anda pada lembar jawaban yang disediakan.</li>
                        <li>Bacalah setiap butir soal dengan teliti sebelum menjawab.</li>
                        <li>Dahulukan menjawab soal-soal yang Anda anggap mudah.</li>
                        <li>Periksa kembali lembar jawaban Anda sebelum diserahkan kepada pengawas ujian.</li>
                    </ol>
                </div>

                <div class="soal-list">
                    ${generatedPacket.map((q, idx) => `
                        <div class="soal-item">
                            <table>
                                <tr>
                                    <td style="vertical-align:top; padding-right:5px; font-weight:bold;">${idx + 1}.</td>
                                    <td>${q.soal}</td>
                                </tr>
                            </table>
                            ${q.jenis === 'PG' ? `
                                <div class="pilihan-container">
                                    <div class="pilihan-col">A. ${q.pilihanA}</div>
                                    <div class="pilihan-col">B. ${q.pilihanB}</div>
                                    <div class="pilihan-col">C. ${q.pilihanC || ''}</div>
                                    <div class="pilihan-col">D. ${q.pilihanD || ''}</div>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </body>
            </html>
        `);
        w.document.close();
    });

    // Print Kunci
    document.getElementById('btn-print-kunci').addEventListener('click', () => {
        if (!generatedPacket.length) return;
        const mapel = document.getElementById('g-mapel').value;
        const kelas = document.getElementById('g-kelas').value;

        const w = window.open('', '_blank');
        w.document.write(`
            <html>
            <head>
                <title>Cetak Lembar Kunci Jawaban & Pembahasan</title>
                <style>
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        padding: 30px 40px;
                        font-size: 12px;
                        line-height: 1.5;
                    }
                    .no-print {
                        background: #1e293b;
                        padding: 8px;
                        margin-bottom: 15px;
                        border-radius: 4px;
                        text-align: center;
                    }
                    .btn-act {
                        background: #10b981;
                        color: white;
                        border: none;
                        padding: 5px 12px;
                        font-size: 11px;
                        font-weight: bold;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    .table-kunci {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                    }
                    .table-kunci th, .table-kunci td {
                        border: 1px solid #000;
                        padding: 6px 10px;
                    }
                    .table-kunci th {
                        background: #f2f2f2;
                    }
                    @media print {
                        .no-print { display: none !important; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print">
                    <button class="btn-act" onclick="window.print()">Cetak Kunci</button>
                    <button class="btn-act" style="background:#ef4444;" onclick="window.close()">Tutup</button>
                </div>
                
                <h3 style="text-align:center; text-transform:uppercase;">KUNCI JAWABAN & PEMBAHASAN UJIAN</h3>
                <p style="text-align:center; font-size:11px; margin-top:-10px;">Mata Pelajaran: <strong>${mapel}</strong> | Kelas: <strong>${kelas}</strong></p>

                <table class="table-kunci">
                    <thead>
                        <tr>
                            <th style="width: 8%; text-align:center;">No</th>
                            <th style="width: 10%; text-align:center;">Tipe</th>
                            <th style="width: 15%; text-align:center;">Kunci</th>
                            <th style="text-align:left;">Pembahasan / Uraian Jawaban</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generatedPacket.map((q, idx) => `
                            <tr>
                                <td style="text-align:center; font-weight:bold;">${idx + 1}</td>
                                <td style="text-align:center; font-size:10px;">${q.jenis}</td>
                                <td style="text-align:center; font-weight:bold; font-size: 14px; color:#15803d;">${q.kunci}</td>
                                <td style="font-size:11px;">${q.pembahasan || 'Cukup jelas.'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        w.document.close();
    });

    togglePGFields();
    renderBS();
}
