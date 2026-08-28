import React from 'react';
import { Heart, Sparkles, Award, Palette, CheckCircle2, Shield, MapPin, Clock, Navigation, ExternalLink } from 'lucide-react';
import { STUDIO_INFO, ADMIN_WA_NUMBER } from '../data/packagesData';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-28 bg-[#F5F2ED] relative overflow-hidden border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-[#8E8271] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.35em] inline-block border-b border-[#8E8271]/40 pb-1">
            Profil Vendor Pernikahan
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#1A1A1A] mt-4 leading-[1.15]">
            Sentuhan Seni Rias &amp; Dekorasi Bernilai Tinggi
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-5 leading-relaxed font-light max-w-2xl mx-auto">
            Menyatukan keahlian riasan makeup pengantin berkelas internasional dengan dekorasi pelaminan tematik yang memadukan keindahan flora dan arsitektur modern.
          </p>
        </div>

        {/* 2 Column Layout with Story & Images */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          
          {/* Left: Imagery Montage */}
          <div className="lg:col-span-5 relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl border border-black/10 bg-stone-200">
              <img
                src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
                alt="Senna MUA dan Sekka Design"
                className="w-full h-[480px] object-cover hover:scale-105 transition duration-700 filter brightness-[0.97]"
              />
            </div>

            {/* Overlapping Floating Badge */}
            <div className="absolute -bottom-6 -right-4 sm:-right-6 z-20 bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-black/10 max-w-[240px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-[#8E8271]" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-[#1A1A1A] text-sm leading-tight">Certified MUA &amp; Decorator</h4>
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mt-0.5">Official Wedding Partner</p>
                </div>
              </div>
            </div>

            {/* Backdrop subtle ambient */}
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-[#8E8271]/10 rounded-full blur-3xl -z-10"></div>
          </div>

          {/* Right: Detailed Story of Both Brands */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Senna MUA Block */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/10 shadow-xs hover:border-black/30 transition duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-[#F5F2ED] text-[#1A1A1A] border border-black/5">
                  <Sparkles className="w-4 h-4 text-[#8E8271]" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-normal text-[#1A1A1A]">Senna MUA Gallery</h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8E8271] font-semibold">Bridal Makeup Artist &amp; Beauty Specialist</p>
                </div>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
                Dikelola dengan standar rias haute couture, Senna MUA mengutamakan teknik complexion yang tipis, glowing, namun tahan hingga lebih dari 12 jam. Menggunakan produk premium seperti Dior, MAC, Charlotte Tilbury, dan Make Up For Ever untuk memastikan kulit pengantin tetap nyaman dan tampak paripurna di hadapan kamera serta tamu undangan.
              </p>
            </div>

            {/* Sekka Design Block */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/10 shadow-xs hover:border-black/30 transition duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-[#F5F2ED] text-[#1A1A1A] border border-black/5">
                  <Palette className="w-4 h-4 text-[#8E8271]" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-normal text-[#1A1A1A]">Sekka Design Decoration</h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8E8271] font-semibold">Modern Aesthetic Wedding Decoration &amp; Concept</p>
                </div>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
                Sekka Design menciptakan panggung pelaminan tematik yang personal. Mulai dari konsep Classic Romance, Modern Botanical Glasshouse, hingga Megah Adat Kontemporer. Setiap detail ditata secara teliti dengan komposisi bunga segar, penataan lampu ambience dramatis, dan photo booth interaktif.
              </p>
            </div>

            {/* 4 Value Points */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                <CheckCircle2 className="w-4 h-4 text-[#8E8271] shrink-0" />
                <span>Konsultasi &amp; Moodboard Gratis</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                <CheckCircle2 className="w-4 h-4 text-[#8E8271] shrink-0" />
                <span>Fitting Busana Langsung di Studio</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                <CheckCircle2 className="w-4 h-4 text-[#8E8271] shrink-0" />
                <span>Fleksibilitas Custom Sesuai Budget</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                <CheckCircle2 className="w-4 h-4 text-[#8E8271] shrink-0" />
                <span>Tim Profesional Standby di Hari H</span>
              </div>
            </div>

          </div>
        </div>

        {/* Counter Stats Section */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-black/10 shadow-xs mb-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-black/10">
            <div className="pt-4 lg:pt-0">
              <span className="font-serif text-4xl sm:text-5xl font-normal text-[#1A1A1A] block">500+</span>
              <p className="text-xs font-semibold text-stone-900 uppercase tracking-wider mt-2">Pengantin Bahagia</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Sejak tahun 2018 di berbagai kota</p>
            </div>

            <div className="pt-4 lg:pt-0">
              <span className="font-serif text-4xl sm:text-5xl font-normal text-[#1A1A1A] block">8+</span>
              <p className="text-xs font-semibold text-stone-900 uppercase tracking-wider mt-2">Tahun Pengalaman</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Vendor pernikahan terpercaya</p>
            </div>

            <div className="pt-4 lg:pt-0">
              <span className="font-serif text-4xl sm:text-5xl font-normal text-[#1A1A1A] block">100%</span>
              <p className="text-xs font-semibold text-stone-900 uppercase tracking-wider mt-2">Kepuasan Klien</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Ulasan bintang 5 dari pasangan</p>
            </div>

            <div className="pt-4 lg:pt-0">
              <span className="font-serif text-4xl sm:text-5xl font-normal text-[#1A1A1A] block">50+</span>
              <p className="text-xs font-semibold text-stone-900 uppercase tracking-wider mt-2">Koleksi Busana Mewah</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Gaun internasional &amp; kebaya adat</p>
            </div>
          </div>
        </div>

        {/* Studio & Gallery Location Card */}
        <div className="bg-[#141312] text-white rounded-2xl p-8 sm:p-12 border border-white/10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-light tracking-[0.25em] text-[#E5E1DA]">
                <MapPin className="w-3.5 h-3.5 text-[#8E8271]" />
                <span>Studio &amp; Gallery Center</span>
              </div>
              
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white">
                Kunjungi Studio Senna MUA Gallery &amp; Sekka Design
              </h3>

              <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed max-w-2xl">
                Tersedia ruang konsultasi private, area fitting gaun &amp; kebaya pengantin, serta katalog display tema dekorasi pelaminan terkini.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-stone-300">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[#8E8271] font-semibold block">Alamat Lengkap:</span>
                  <p className="font-medium text-white text-xs leading-relaxed">
                    {STUDIO_INFO.address}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[#8E8271] font-semibold block">Jam Operasional Studio:</span>
                  <p className="font-medium text-white text-xs">
                    {STUDIO_INFO.openingHours}
                  </p>
                  <p className="text-[11px] text-stone-400 font-light">
                    *Disarankan membuat janji temu via WhatsApp terlebih dahulu
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
              <a
                href={STUDIO_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-stone-100 text-[#1A1A1A] text-xs uppercase tracking-[0.18em] font-semibold py-4 px-6 rounded-full transition flex items-center justify-center gap-2 shadow-xs cursor-pointer text-center"
              >
                <Navigation className="w-4 h-4 text-[#8E8271]" />
                <span>Petunjuk Arah Google Maps</span>
              </a>

              <a
                href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin%20Senna%20Gallery,%20saya%20ingin%20jadwalkan%20kunjungan%20ke%20studio%20di%20${encodeURIComponent(STUDIO_INFO.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white/5 hover:bg-white/15 border border-white/20 text-white text-xs uppercase tracking-[0.18em] font-light py-4 px-6 rounded-full transition flex items-center justify-center gap-2 text-center"
              >
                <span>Jadwalkan Janji Temu Studio</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#8E8271]" />
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
