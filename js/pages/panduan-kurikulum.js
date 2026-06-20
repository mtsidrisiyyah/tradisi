// ============================================
// TRADISI — Panduan Kurikulum Page Module
// ============================================

export async function render(contentArea, ctx) {
    const { dbService } = ctx;

    const schoolSettings = await dbService.getData('madrasah_settings') || {
        nama: "MTs Idrisiyyah Tasikmalaya",
        tahunAjaran: "2026/2027",
        semester: "Ganjil"
    };

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <div class="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-6">
                <div class="flex items-center gap-3 border-b dark:border-slate-700 pb-4">
                    <div class="p-2.5 bg-forest-600/10 rounded-xl">
                        <i class="ph ph-books text-forest-600 text-2xl"></i>
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">Kurikulum Merdeka</h3>
                        <p class="text-[11px] text-slate-400">Kurikulum aktif ${schoolSettings.nama}</p>
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
                        <i class="ph ph-star text-forest-600"></i> Prinsip Utama
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-200/50 dark:border-orange-800/30">
                            <div class="w-10 h-10 rounded-xl bg-forest-600/10 text-forest-700 flex items-center justify-center mb-3"><i class="ph ph-target text-xl"></i></div>
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
                        <i class="ph ph-list-checks text-forest-600"></i> Komponen Perangkat Ajar
                    </h4>
                    <div class="space-y-3">
                        <div class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                            <div class="w-8 h-8 rounded-lg bg-forest-600/10 text-forest-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                            <div>
                                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Capaian Pembelajaran (CP)</p>
                                <p class="text-[11px] text-slate-500">Kompetensi yang ditetapkan pemerintah per fase yang harus dicapai peserta didik.</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                            <div class="w-8 h-8 rounded-lg bg-forest-600/10 text-forest-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                            <div>
                                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Alur Tujuan Pembelajaran (ATP)</p>
                                <p class="text-[11px] text-slate-500">Urutan tujuan pembelajaran yang disusun guru dari CP sebagai panduan pembelajaran.</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                            <div class="w-8 h-8 rounded-lg bg-forest-600/10 text-forest-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                            <div>
                                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Modul Ajar (pengganti RPP)</p>
                                <p class="text-[11px] text-slate-500">Rencana pembelajaran yang lebih komprehensif: tujuan, kegiatan, dan asesmen.</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                            <div class="w-8 h-8 rounded-lg bg-forest-600/10 text-forest-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                            <div>
                                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)</p>
                                <p class="text-[11px] text-slate-500">Indikator yang menunjukkan apakah peserta didik telah mencapai tujuan pembelajaran.</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                            <div class="w-8 h-8 rounded-lg bg-forest-600/10 text-forest-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">5</div>
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
                        <i class="ph ph-steps text-forest-600"></i> Fase Pembelajaran di Madrasah
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="p-4 border-2 border-orange-500/30 rounded-2xl bg-orange-50/50 dark:bg-orange-950/10">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="bg-forest-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full">FASE D</span>
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
