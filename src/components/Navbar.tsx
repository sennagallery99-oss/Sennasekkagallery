import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Instagram, 
  Menu, 
  X, 
  Sparkles, 
  MessageCircle,
  Clock,
  Palette,
  Lock
} from 'lucide-react';
import { ADMIN_WA_NUMBER, STUDIO_INFO, INSTAGRAM_ACCOUNTS } from '../data/packagesData';
import { SennaLogo } from './brand/SennaLogo';

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
      {/* Top Notification & Romantic Contact / Operating Hours Bar */}
      <div id="top-notification-bar" className="bg-[#1C1615] text-stone-300 text-xs py-2 px-4 border-b border-[#C28274]/20 overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          
          <div className="flex items-center gap-2.5 text-stone-300">
            <span className="inline-flex items-center gap-1 bg-[#C28274]/25 text-[#F5D0C5] border border-[#C28274]/40 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-[0.2em]">
              Promo Wedding 2026
            </span>
            <span className="hidden sm:inline text-xs font-light text-stone-300">
              Free Ring Box Terrarium &amp; Hand Bouquet Fresh Rose untuk setiap Booking Paket Wedding!
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-stone-300 tracking-wider">
            {/* Operating Hours Pill */}
            <div className="flex items-center gap-1.5 text-[#F5D0C5]">
              <Clock className="w-3.5 h-3.5 text-[#E6B8A2]" />
              <span className="font-medium">Studio: 09.00 - 16.30 WIB</span>
            </div>

            <span className="text-stone-700 hidden md:inline">|</span>

            <a 
              id="hotline-wa-top"
              href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin%20Senna%20MUA%20Gallery%20dan%20Sekka%20Design,%20saya%20ingin%20konsultasi%20paket%20wedding`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#F5D0C5] flex items-center gap-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5 text-[#C28274]" />
              <span className="hidden xs:inline">WA: {STUDIO_INFO.phoneRaw}</span>
            </a>

            <span className="text-stone-700 hidden lg:inline">|</span>

            <div className="hidden lg:flex items-center gap-2">
              <Instagram className="w-3.5 h-3.5 text-[#C28274] shrink-0" />
              <a 
                id="ig-mua-top"
                href={INSTAGRAM_ACCOUNTS.mua.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#F5D0C5] transition"
                title="Instagram Senna MUA Gallery"
              >
                {INSTAGRAM_ACCOUNTS.mua.handle}
              </a>
              <span className="text-stone-700">•</span>
              <a 
                id="ig-decor-top"
                href={INSTAGRAM_ACCOUNTS.decor.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#F5D0C5] transition"
                title="Instagram Sekka Design Decoration"
              >
                {INSTAGRAM_ACCOUNTS.decor.handle}
              </a>
              <span className="text-stone-700">•</span>
              <a 
                id="ig-attire-top"
                href={INSTAGRAM_ACCOUNTS.attire.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#F5D0C5] transition"
                title="Instagram Senna Wedding Attire"
              >
                {INSTAGRAM_ACCOUNTS.attire.handle}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Romantic Navbar */}
      <header id="main-header" className="sticky top-0 z-40 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#C28274]/20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex items-center justify-between gap-3 lg:gap-6">
            
            {/* Logo Brand: Official Gold SS Monogram & Typography */}
            <button
              id="brand-logo-btn"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0 focus:outline-none select-none"
              aria-label="Senna Sekka - Beranda"
            >
              <SennaLogo variant="full" size="sm" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-[11px] xl:text-xs font-semibold uppercase tracking-[0.14em]">
              <button
                id="nav-home-btn"
                onClick={() => handleNavClick('home')}
                className={`transition cursor-pointer whitespace-nowrap ${
                  currentView === 'home' 
                    ? 'text-[#241E1C] border-b-2 border-[#C28274] pb-0.5 font-bold' 
                    : 'text-stone-600 hover:text-[#241E1C]'
                }`}
              >
                Beranda
              </button>

              <button
                id="nav-portfolio-btn"
                onClick={() => handleNavClick('portfolio')}
                className={`transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  currentView === 'portfolio' 
                    ? 'text-[#241E1C] border-b-2 border-[#C28274] pb-0.5 font-bold' 
                    : 'text-stone-600 hover:text-[#241E1C]'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-[#C28274]" />
                <span>Portofolio &amp; Gaun</span>
                <span className="px-1.5 py-0.2 bg-[#FAF0E6] text-[#A85848] border border-[#C28274]/30 text-[9px] font-bold rounded-full">
                  Slideshow
                </span>
              </button>

              <button
                id="nav-services-btn"
                onClick={() => handleNavClick('home', 'services')}
                className="text-stone-600 hover:text-[#241E1C] transition cursor-pointer whitespace-nowrap"
              >
                Layanan
              </button>

              <button
                id="nav-about-btn"
                onClick={() => handleNavClick('home', 'about')}
                className="text-stone-600 hover:text-[#241E1C] transition cursor-pointer whitespace-nowrap"
              >
                Tentang Kami
              </button>

              <button
                id="nav-packages-btn"
                onClick={() => handleNavClick('packages')}
                className={`transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  currentView === 'packages' 
                    ? 'text-[#241E1C] border-b-2 border-[#C28274] pb-0.5 font-bold' 
                    : 'text-stone-600 hover:text-[#241E1C]'
                }`}
              >
                <span>Daftar Paket</span>
                <span className="px-1.5 py-0.2 bg-[#FAF0E6] text-[#A85848] border border-[#C28274]/30 text-[9px] font-bold rounded-full">
                  Promo
                </span>
              </button>

              {/* Menu Sewa with animated luxury highlight */}
              <Link
                id="nav-sewa-menu-btn"
                to="/sewa"
                state={{ showSplash: true }}
                className="transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap text-red-700 hover:text-red-800 font-bold bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border border-red-200/80 px-3.5 py-1.5 rounded-full shadow-2xs hover:shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                <span>Sewa Busana</span>
                <span className="px-1.5 py-0.2 bg-red-600 text-white text-[8px] font-bold uppercase tracking-wider rounded-full shadow-xs">
                  Baru
                </span>
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center gap-2">
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
          <div id="mobile-menu-drawer" className="lg:hidden bg-[#FAF6F0] border-t border-[#C28274]/20 px-4 pt-3 pb-6 space-y-3 shadow-lg">
            
            {/* Mobile Operating Hours alert */}
            <div className="p-2.5 rounded-xl bg-[#FAF0E6] border border-[#C28274]/25 text-xs text-[#8C4A3C] flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-[#C28274] shrink-0" />
              <span>Jam Operasional Studio: 09.00 - 16.30 WIB (Setiap Hari)</span>
            </div>

            <button
              onClick={() => handleNavClick('home')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-xs uppercase tracking-wider font-semibold ${
                currentView === 'home' ? 'bg-[#241E1C] text-white font-bold' : 'text-stone-700'
              }`}
            >
              Beranda
            </button>

            <button
              onClick={() => handleNavClick('portfolio')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-xs uppercase tracking-wider font-semibold flex items-center justify-between ${
                currentView === 'portfolio' ? 'bg-[#241E1C] text-white font-bold' : 'text-stone-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#C28274]" />
                <span>Portofolio, Rias &amp; Gaun</span>
              </div>
              <span className="text-[9px] bg-[#C28274] text-white px-2 py-0.5 rounded-full">Slideshow</span>
            </button>

            <button
              onClick={() => handleNavClick('packages')}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-xs uppercase tracking-wider font-semibold flex items-center justify-between ${
                currentView === 'packages' ? 'bg-[#241E1C] text-white font-bold' : 'text-stone-800'
              }`}
            >
              <span>Daftar Paket &amp; Harga</span>
              <span className="text-[9px] bg-[#A85848] text-white px-2 py-0.5 rounded-full">Populer</span>
            </button>

            {/* Sewa Busana in mobile drawer */}
            <Link
              to="/sewa"
              state={{ showSplash: true }}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left py-2.5 px-3 rounded-lg text-xs uppercase tracking-wider font-bold flex items-center justify-between bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Sewa Busana Pengantin</span>
              </div>
              <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                Katalog
              </span>
            </Link>

            <button
              onClick={() => handleNavClick('home', 'services')}
              className="w-full text-left py-2 px-3 rounded-lg text-xs uppercase tracking-wider text-stone-700 font-semibold"
            >
              Layanan Wedding &amp; MUA
            </button>

            <button
              onClick={() => handleNavClick('home', 'about')}
              className="w-full text-left py-2 px-3 rounded-lg text-xs uppercase tracking-wider text-stone-700 font-semibold"
            >
              Tentang Studio Kami
            </button>

            <div className="pt-3 border-t border-[#C28274]/20 space-y-2">
              <a
                href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin%20Senna%20MUA%20%26%20Sekka%20Design,%20saya%20ingin%20konsultasi%20paket%20wedding`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider font-semibold bg-white border border-[#C28274]/30 text-stone-800 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#C28274]" />
                <span>Konsultasi WhatsApp Admin</span>
              </a>

              <button
                onClick={() => handleNavClick('packages')}
                className="w-full text-center py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider font-semibold bg-[#241E1C] text-white"
              >
                Lihat Semua Paket Promo
              </button>

              <div className="pt-2 border-t border-[#C28274]/20 space-y-1.5 text-[11px] text-stone-600">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#A85848] block">Instagram Resmi:</span>
                <a href={INSTAGRAM_ACCOUNTS.mua.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-black transition">
                  <Instagram className="w-3 h-3 text-[#C28274]" />
                  <span>MUA: <strong>{INSTAGRAM_ACCOUNTS.mua.handle}</strong></span>
                </a>
                <a href={INSTAGRAM_ACCOUNTS.decor.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-black transition">
                  <Instagram className="w-3 h-3 text-[#C28274]" />
                  <span>Dekorasi: <strong>{INSTAGRAM_ACCOUNTS.decor.handle}</strong></span>
                </a>
                <a href={INSTAGRAM_ACCOUNTS.attire.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-black transition">
                  <Instagram className="w-3 h-3 text-[#C28274]" />
                  <span>Attire &amp; Gaun: <strong>{INSTAGRAM_ACCOUNTS.attire.handle}</strong></span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
