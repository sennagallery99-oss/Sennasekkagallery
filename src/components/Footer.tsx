import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Clock, 
  Heart
} from 'lucide-react';
import { ADMIN_WA_NUMBER, STUDIO_INFO } from '../data/packagesData';

interface FooterProps {
  onNavigate: (view: string, hash?: string) => void;
  onOpenCodeViewer?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer id="main-footer" className="bg-[#141312] text-stone-300 pt-20 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-16 border-b border-white/10">
          
          {/* Col 1: Brand & Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex flex-col">
              <span className="font-serif text-2xl sm:text-3xl font-normal tracking-[0.25em] uppercase text-white">
                SENNA <span className="font-light italic text-[#8E8271]">&amp;</span> SEKKA
              </span>
              <span className="text-[9px] tracking-[0.35em] uppercase text-stone-400 font-light mt-1">
                MUA Gallery &amp; Design Decoration
              </span>
            </div>

            <p className="text-xs text-stone-400 font-light leading-relaxed max-w-sm">
              Vendor pernikahan terkemuka penyedia jasa makeup pengantin eksklusif, dekorasi pelaminan modern, sewa gaun pengantin mewah, dan paket pernikahan terlengkap.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={STUDIO_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-[#E5E1DA] transition cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href={`https://wa.me/${ADMIN_WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-[#E5E1DA] transition cursor-pointer"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif text-base font-normal text-white tracking-wider border-b border-[#8E8271]/30 pb-2 inline-block">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs text-stone-400 font-light">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition cursor-pointer">
                  Beranda
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home', 'about')} className="hover:text-white transition cursor-pointer">
                  Tentang Senna &amp; Sekka
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home', 'services')} className="hover:text-white transition cursor-pointer">
                  Layanan &amp; Fasilitas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home', 'gallery')} className="hover:text-white transition cursor-pointer">
                  Galeri Foto Pengantin
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('packages')} className="hover:text-white transition text-[#E5E1DA] font-semibold cursor-pointer">
                  Daftar Paket &amp; Promo 2026
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Layanan Kami (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-base font-normal text-white tracking-wider border-b border-[#8E8271]/30 pb-2 inline-block">
              Layanan Utama
            </h4>
            <ul className="space-y-2 text-xs text-stone-400 font-light">
              <li>• Makeup Pengantin Akad &amp; Resepsi</li>
              <li>• Rias Wisuda, Prewedding &amp; Lamaran</li>
              <li>• Dekorasi Pelaminan Modern &amp; Rustic</li>
              <li>• Sewa Gaun Pengantin &amp; Kebaya Adat</li>
              <li>• Paket Intimate Wedding Hemat 17.5 JT</li>
              <li>• Paket Royal Luxury Wedding 28 JT</li>
            </ul>
          </div>

          {/* Col 4: Studio & Kontak (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-base font-normal text-white tracking-wider border-b border-[#8E8271]/30 pb-2 inline-block">
              Studio &amp; Hubungi Kami
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400 font-light">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#8E8271] shrink-0 mt-0.5" />
                <a
                  href={STUDIO_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition leading-relaxed"
                >
                  {STUDIO_INFO.address}
                  <span className="block text-[10px] text-[#8E8271] mt-0.5">Buka di Google Maps &rarr;</span>
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8E8271] shrink-0" />
                <span>{STUDIO_INFO.openingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#8E8271] shrink-0" />
                <span>Hotline WA: {STUDIO_INFO.phoneRaw}</span>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-[#8E8271] shrink-0" />
                <a href={STUDIO_INFO.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  Instagram: {STUDIO_INFO.instagram}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#8E8271] shrink-0" />
                <span>Email: {STUDIO_INFO.email}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Notes */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-light">
          <p>
            &copy; {new Date().getFullYear()} Senna MUA Gallery &amp; Sekka Design Decoration. Hak Cipta Dilindungi.
          </p>

          <div className="flex items-center gap-4 text-stone-400">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-stone-300 fill-stone-300" /> for Wedding Brides
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
