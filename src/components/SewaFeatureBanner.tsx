import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Scissors, ShieldCheck, ShoppingBag, Star, Check } from 'lucide-react';
import { useSewaStore } from '../store/sewaStore';
import { formatDriveImageUrl } from '../services/googleDriveService';
import { LazyImage } from './LazyImage';

export const SewaFeatureBanner: React.FC = () => {
  const products = useSewaStore((s) => s.products);
  // Take 4 featured preview products from live store (MySQL)
  const previewProducts = products.slice(0, 4);

  return (
    <section id="sewa-feature" className="py-24 bg-[#FAF6F0] relative overflow-hidden border-b border-[#C28274]/20">
      
      {/* Decorative subtle background elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#C28274]/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#B28E5C]/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Card Container */}
        <div className="bg-[#1C1615] rounded-3xl p-8 sm:p-12 lg:p-16 text-white border border-[#C28274]/30 shadow-2xl relative overflow-hidden">
          
          {/* Subtle floral watermark */}
          <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-serif select-none pointer-events-none">
            Sewa
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Content (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C28274]/25 border border-[#C28274]/40 text-[#F5D0C5] text-xs font-semibold uppercase tracking-[0.25em]">
                <Sparkles className="w-3.5 h-3.5 text-[#E6B8A2]" />
                <span>Fitur Baru • Senna Gallery Sewa</span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-[1.15] text-white">
                Layanan Sewa Kebaya, Jas &amp; Gaun Premium
              </h2>

              {/* Description */}
              <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                Kini Anda dapat menyewa koleksi busana pengantin dan formal wear eksklusif langsung dari Senna Gallery! Lengkap dengan layanan <strong>Free Fitting di studio</strong>, sterilisasi uap anti-bakteri, serta checkout keranjang praktis via WhatsApp.
              </p>

              {/* Feature Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-stone-200">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-[#C28274]/30 text-[#E6B8A2]">
                    <Scissors className="w-3.5 h-3.5" />
                  </div>
                  <span>Free Fitting di Studio</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-[#C28274]/30 text-[#E6B8A2]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>100% Steril Dry Cleaned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-[#C28274]/30 text-[#E6B8A2]">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <span>Paket Standar Sewa 3 Hari</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-[#C28274]/30 text-[#E6B8A2]">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span>Desain Haute-Couture Mewah</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  to="/sewa"
                  id="main-home-enter-sewa-button"
                  className="w-full sm:w-auto bg-[#C28274] hover:bg-[#A85848] text-white px-8 py-4 rounded-full text-xs uppercase tracking-[0.2em] font-semibold transition shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Masuk ke Platform Sewa Busana</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/sewa/katalog"
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-4 rounded-full text-xs uppercase tracking-[0.16em] font-medium transition text-center"
                >
                  Lihat Katalog Busana
                </Link>
              </div>

            </div>

            {/* Right Showcase: 4 Visual Cards Grid (6 cols) */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {previewProducts.map((item) => (
                  <Link
                    key={item.id}
                    to={`/sewa/katalog/${item.id}`}
                    className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-stone-800 border border-white/15 shadow-md hover:border-[#C28274] transition duration-300"
                  >
                    <LazyImage
                      src={item.imageUrl}
                      alt={item.name}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 filter brightness-90"
                      imageSize={480}
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-3 text-white pointer-events-none">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#F5D0C5] block">
                        {item.categoryLabel.split(' ')[0]}
                      </span>
                      <h4 className="font-serif text-xs sm:text-sm text-white line-clamp-1 group-hover:text-[#F5D0C5] transition">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-stone-300 font-semibold mt-0.5">
                        {item.priceFormatted}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Tag under grid */}
              <div className="mt-4 text-center">
                <Link
                  to="/sewa/katalog"
                  className="text-xs text-[#E6B8A2] hover:text-white inline-flex items-center gap-1 font-semibold uppercase tracking-wider transition"
                >
                  <span>Lihat semua 12+ koleksi kebaya, jas &amp; gaun →</span>
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
