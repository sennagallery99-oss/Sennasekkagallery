import React, { useState } from 'react';
import { 
  Sparkles, 
  Phone, 
  Instagram, 
  Menu, 
  X, 
  Calendar,
  MessageCircle
} from 'lucide-react';
import { ADMIN_WA_NUMBER, STUDIO_INFO } from '../data/packagesData';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string, hash?: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Notification & Contact Bar */}
      <div id="top-notification-bar" className="bg-[#141312] text-stone-300 text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-stone-300">
            <span className="inline-flex items-center gap-1 bg-[#8E8271]/25 text-[#E5E1DA] border border-[#8E8271]/40 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-[0.2em]">
              Wedding Promo 2026
            </span>
            <span className="hidden sm:inline text-xs font-light text-stone-300">
              Bonus Free Ring Box Terrarium &amp; Hand Bouquet Fresh Rose untuk setiap Booking Paket Intimate!
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-300 tracking-wider">
            <a 
              id="hotline-wa-top"
              href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin%20Senna%20MUA%20Gallery%20dan%20Sekka%20Design,%20saya%20ingin%20konsultasi%20paket%20wedding`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#E5E1DA] flex items-center gap-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5 text-[#8E8271]" />
              <span>Admin WA: {STUDIO_INFO.phoneRaw}</span>
            </a>
            <span className="text-stone-700 hidden md:inline">|</span>
            <a 
              id="ig-link-top"
              href={STUDIO_INFO.instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#E5E1DA] hidden md:flex items-center gap-1 transition"
            >
              <Instagram className="w-3.5 h-3.5 text-[#8E8271]" />
              <span>{STUDIO_INFO.instagram}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header id="main-header" className="sticky top-0 z-40 bg-[#F5F2ED]/95 backdrop-blur-md border-b border-black/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            
            {/* Logo Brand */}
            <button
              id="brand-logo-btn"
              onClick={() => handleNavClick('home')}
              className="flex flex-col text-left group cursor-pointer shrink-0 focus:outline-none select-none"
            >
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-serif text-lg sm:text-xl md:text-2xl font-normal tracking-[0.14em] text-[#1A1A1A] group-hover:text-[#8E8271] transition whitespace-nowrap">
                  SENNA <span className="font-light italic text-[#8E8271] font-serif">&amp;</span> SEKKA
                </span>
              </div>
              <span className="text-[7.5px] sm:text-[8.5px] tracking-[0.26em] uppercase text-[#8E8271] font-semibold mt-0.5 whitespace-nowrap leading-tight">
                MUA Gallery &amp; Design Decoration
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-[11px] xl:text-xs font-semibold uppercase tracking-[0.16em]">
              <button
                id="nav-home-btn"
                onClick={() => handleNavClick('home')}
                className={`transition cursor-pointer whitespace-nowrap ${
                  currentView === 'home' 
                    ? 'text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5' 
                    : 'text-stone-600 hover:text-[#1A1A1A]'
                }`}
              >
                Beranda
              </button>

              <button
                id="nav-about-btn"
                onClick={() => handleNavClick('home', 'about')}
                className="text-stone-600 hover:text-[#1A1A1A] transition cursor-pointer whitespace-nowrap"
              >
                Tentang Kami
              </button>

              <button
                id="nav-services-btn"
                onClick={() => handleNavClick('home', 'services')}
                className="text-stone-600 hover:text-[#1A1A1A] transition cursor-pointer whitespace-nowrap"
              >
                Layanan
              </button>

              <button
                id="nav-gallery-btn"
                onClick={() => handleNavClick('home', 'gallery')}
                className="text-stone-600 hover:text-[#1A1A1A] transition cursor-pointer whitespace-nowrap"
              >
                Galeri Portofolio
              </button>

              <button
                id="nav-packages-btn"
                onClick={() => handleNavClick('packages')}
                className={`transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  currentView === 'packages' 
                    ? 'text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5' 
                    : 'text-stone-600 hover:text-[#1A1A1A]'
                }`}
              >
                <span>Daftar Paket</span>
                <span className="px-1.5 py-0.2 bg-[#8E8271]/20 text-[#1A1A1A] text-[9px] font-bold rounded-full">
                  Promo
                </span>
              </button>
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden md:flex items-center space-x-3 shrink-0">
              {/* Direct WhatsApp Consultation */}
              <a
                id="nav-wa-direct-btn"
                href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin%20Senna%20MUA%20%26%20Sekka%20Design,%20saya%20ingin%20konsultasi%20dan%20tanya%20paket%20wedding.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold px-4 py-2 rounded-full border border-black/20 text-stone-800 bg-white hover:border-black transition cursor-pointer shadow-xs whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#8E8271]" />
                <span>Chat Admin WA</span>
              </a>

              {/* Booking CTA Button */}
              <button
                id="booking-header-cta"
                onClick={() => handleNavClick('packages')}
                className="bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-full shadow hover:bg-black transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Calendar className="w-3.5 h-3.5 text-[#8E8271]" />
                <span>Pilih Paket</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                id="mobile-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-stone-800 hover:bg-black/5 focus:outline-none cursor-pointer"
                aria-label="Menu Navigasi"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div id="mobile-menu-drawer" className="md:hidden bg-[#F5F2ED] border-t border-black/10 px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs uppercase tracking-wider font-semibold ${
                currentView === 'home' ? 'bg-[#1A1A1A] text-white font-bold' : 'text-stone-700'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => handleNavClick('home', 'about')}
              className="w-full text-left py-2 px-3 rounded-lg text-xs uppercase tracking-wider text-stone-700 font-semibold"
            >
              Tentang Kami
            </button>
            <button
              onClick={() => handleNavClick('home', 'services')}
              className="w-full text-left py-2 px-3 rounded-lg text-xs uppercase tracking-wider text-stone-700 font-semibold"
            >
              Layanan Wedding &amp; MUA
            </button>
            <button
              onClick={() => handleNavClick('home', 'gallery')}
              className="w-full text-left py-2 px-3 rounded-lg text-xs uppercase tracking-wider text-stone-700 font-semibold"
            >
              Galeri Portofolio
            </button>
            <button
              onClick={() => handleNavClick('packages')}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs uppercase tracking-wider font-semibold flex items-center justify-between ${
                currentView === 'packages' ? 'bg-[#1A1A1A] text-white font-bold' : 'text-stone-800'
              }`}
            >
              <span>Daftar Paket &amp; Harga</span>
              <span className="text-[9px] bg-[#8E8271] text-white px-2 py-0.5 rounded-full">Populer</span>
            </button>

            <div className="pt-3 border-t border-black/10 space-y-2">
              <a
                href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin%20Senna%20MUA%20%26%20Sekka%20Design,%20saya%20ingin%20konsultasi%20paket%20wedding`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider font-semibold bg-white border border-black/15 text-stone-800 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#8E8271]" />
                <span>Konsultasi WhatsApp Admin</span>
              </a>

              <button
                onClick={() => handleNavClick('packages')}
                className="w-full text-center py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider font-semibold bg-[#1A1A1A] text-white"
              >
                Lihat Semua Paket Promo
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
