import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  Sparkles, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Heart, 
  ArrowLeft, 
  Scissors, 
  Shirt, 
  Crown,
  HelpCircle,
  History
} from 'lucide-react';
import { useSewaStore } from '../../store/sewaStore';
import { ADMIN_WA_NUMBER, STUDIO_INFO } from '../../data/packagesData';
import { SennaSewaLogo } from './SennaSewaLogo';

export const SewaNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const totalItems = useSewaStore((state) => state.getTotalItemsCount());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync search input with URL search param 'q'
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchInput(q);
    } else if (location.pathname === '/sewa/katalog') {
      setSearchInput('');
    }
  }, [location.search, location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = searchInput.trim();
    if (cleanQuery) {
      navigate(`/sewa/katalog?q=${encodeURIComponent(cleanQuery)}`);
    } else {
      navigate('/sewa/katalog');
    }
    setMobileMenuOpen(false);
  };

  const quickSearchTags = [
    { label: 'Kebaya Sage', query: 'sage' },
    { label: 'Jas Slim Fit', query: 'jas' },
    { label: 'Tuxedo Black', query: 'tuxedo' },
    { label: 'Gaun Resepsi', query: 'gaun' },
    { label: 'Beskap Sunda', query: 'beskap' },
    { label: 'Promo Fitting', query: '' },
  ];

  const categoryMenu = [
    {
      id: 'kebaya',
      title: 'Kebaya Modern & Pengantin',
      desc: 'Kutubaru, Brokat Prancis, Janggan Beludru & Ekor Pengantin',
      icon: Shirt,
      path: '/sewa/katalog?kategori=kebaya',
      count: '4 Koleksi'
    },
    {
      id: 'jas',
      title: 'Jas Formal & Beskap Pria',
      desc: 'Setelan Tuxedo Lapel Satin, Italian Wool & Beskap Adat Sunda',
      icon: Scissors,
      path: '/sewa/katalog?kategori=jas',
      count: '3 Koleksi'
    },
    {
      id: 'gaun',
      title: 'Gaun Pesta & Resepsi',
      desc: 'Evening Gown Zamrud, Mermaid Kristal & Ballgown Off-Shoulder',
      icon: Sparkles,
      path: '/sewa/katalog?kategori=gaun',
      count: '3 Koleksi'
    },
    {
      id: 'aksesoris',
      title: 'Aksesoris & Mahkota Siger',
      desc: 'Set Mahkota Siger Sunda Emas 24K Look, Dasi Sutra & Cufflinks',
      icon: Crown,
      path: '/sewa/katalog?kategori=aksesoris',
      count: '2 Koleksi'
    }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      
      {/* 1. TOP SUB-NAVBAR (Tokopedia Style Mini Top Bar with Warm Red/Orange Tone) */}
      <div className="bg-[#FFFBF8] border-b border-orange-100/70 text-[11px] text-stone-500 py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left Mini Links */}
          <div className="hidden lg:flex items-center gap-5">
            <span className="flex items-center gap-1.5 font-medium text-stone-700">
              <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
              Official Rental Gallery Senna Official
            </span>
            <span className="text-orange-200">|</span>
            <Link to="/sewa/cara-sewa" className="hover:text-red-600 transition">
              Ketentuan &amp; Syarat Sewa
            </Link>
            <span className="text-orange-200">|</span>
            <span className="text-stone-500">
              Garansi 100% Bersih &amp; Steril Dry Clean
            </span>
          </div>

          {/* Right Mini Links */}
          <div className="flex items-center gap-4 ml-auto">
            <Link 
              to="/sewa/cara-sewa" 
              className="flex items-center gap-1 hover:text-red-600 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Bantuan &amp; S&amp;K</span>
            </Link>
            <span className="text-orange-200">|</span>
            <Link 
              to="/" 
              className="flex items-center gap-1.5 text-stone-700 hover:text-red-600 font-semibold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-red-600" />
              <span>Studio Utama MUA</span>
            </Link>
          </div>

        </div>
      </div>

      {/* 2. MAIN HEADER (Red & Orange Palette) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 lg:gap-7">
        
        {/* Row 1 on Mobile: Logo (left) and Actions (right) */}
        <div className="flex items-center justify-between w-full md:w-auto shrink-0">
          <div className="shrink-0">
            <SennaSewaLogo size="md" />
          </div>

          {/* Right Actions for Mobile Only */}
          <div className="flex items-center gap-1.5 md:hidden">
            {/* Cart with Red/Orange Badge */}
            <Link
              to="/sewa/keranjang"
              className="relative p-2 rounded-xl border border-slate-200 text-stone-700 hover:text-red-600 hover:bg-rose-50/60 transition flex items-center justify-center cursor-pointer shadow-2xs bg-white"
              aria-label="Keranjang Sewa"
            >
              <div className="relative">
                <ShoppingBag className="w-4.5 h-4.5 text-red-600" />
                {totalItems > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>

            {/* Riwayat Button (Icon Only on Mobile) */}
            <Link
              to="/sewa/riwayat"
              className="p-2 rounded-xl border border-slate-200 text-stone-700 hover:text-red-600 hover:bg-rose-50/60 transition flex items-center justify-center cursor-pointer shadow-2xs bg-white"
              aria-label="Riwayat"
            >
              <History className="w-4.5 h-4.5 text-red-600" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-700 hover:bg-slate-100 transition cursor-pointer bg-white border border-slate-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Row 2 on Mobile: Kategori (hidden on mobile) and Search Bar (expanded) */}
        <div className="flex-1 flex items-center gap-3 w-full">
          {/* KATEGORI DROPDOWN (Desktop only) */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-red-600 px-2.5 py-2.5 rounded-xl hover:bg-rose-50/50 border border-slate-200 transition cursor-pointer bg-white"
            >
              <span>Kategori</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180 text-red-600' : ''}`} />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-fade-in">
                <div className="p-2 border-b border-slate-100 mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Koleksi Busana Pilihan
                  </span>
                  <Link 
                    to="/sewa/katalog" 
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="text-[11px] font-semibold text-red-600 hover:underline"
                  >
                    Semua Busana →
                  </Link>
                </div>
                <div className="space-y-1">
                  {categoryMenu.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.id}
                        to={cat.path}
                        onClick={() => setCategoryDropdownOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-orange-50/60 group transition"
                      >
                        <div className="p-2 rounded-xl bg-slate-100 text-stone-700 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-orange-500 group-hover:text-white transition shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-stone-800 group-hover:text-red-600 transition">
                              {cat.title}
                            </h4>
                            <span className="text-[10px] text-stone-400 font-medium">{cat.count}</span>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            {cat.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* SEARCH BAR */}
          <div className="flex-1 w-full">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari kebaya, jas, gaun pesta, adat..."
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-stone-800 text-xs sm:text-sm pl-4 pr-20 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition outline-hidden placeholder:text-stone-400 shadow-2xs"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      if (location.pathname === '/sewa/katalog') {
                        navigate('/sewa/katalog');
                      }
                    }}
                    className="absolute right-10 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-slate-200 transition cursor-pointer"
                    aria-label="Hapus kata kunci pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  aria-label="Cari busana"
                  className="absolute right-1.5 p-2 rounded-lg bg-slate-100 hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-500 hover:text-white text-stone-600 transition cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Hot Search Tags (Desktop only) */}
            <div className="hidden xl:flex items-center gap-3 mt-1.5 px-1 overflow-x-auto text-[11px] text-stone-500">
              <span className="text-[10px] uppercase font-bold text-stone-400 shrink-0">Populer:</span>
              {quickSearchTags.map((tag, idx) => (
                <Link
                  key={idx}
                  to={`/sewa/katalog?q=${encodeURIComponent(tag.query)}`}
                  className="hover:text-red-600 transition whitespace-nowrap"
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Right Actions: hidden on mobile, visible on md+ */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Cart with Red/Orange Badge */}
          <Link
            to="/sewa/keranjang"
            id="sewa-cart-button"
            className="relative p-2.5 rounded-xl border border-slate-200 hover:border-red-500 text-stone-700 hover:text-red-600 hover:bg-rose-50/60 transition flex items-center justify-center cursor-pointer shadow-2xs"
            aria-label="Keranjang Sewa"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-red-600" />
              {totalItems > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-xs animate-scale-in">
                  {totalItems}
                </span>
              )}
            </div>
          </Link>

          {/* Riwayat Button */}
          <Link
            to="/sewa/riwayat"
            className="px-3 py-2.5 rounded-xl border border-slate-200 hover:border-red-500 text-stone-700 hover:text-red-600 hover:bg-rose-50/60 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            aria-label="Riwayat"
          >
            <History className="w-4 h-4 text-red-600 shrink-0" />
            <span className="text-xs font-bold text-stone-800">
              Riwayat
            </span>
          </Link>
        </div>

      </div>

      {/* 3. LOCATION & FITTING STRIP (Tokopedia "Dikirim dari" Strip in Red/Orange Accents) */}
      <div className="bg-white border-t border-slate-100 py-1.5 px-4 text-[10px] sm:text-[11px] text-stone-500 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="text-stone-400">Fitting &amp; Ambil:</span>
            <span className="font-bold text-stone-800 truncate max-w-[170px] sm:max-w-none">Senna Gallery Studio, Bandar Lampung</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline text-orange-700 font-semibold bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded-md">
              Gratis Fitting &amp; Ambil di Studio / Ojek Online
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/sewa/cara-sewa" className="hover:text-red-600 font-medium transition">
              Alur Booking &amp; Pengembalian
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/sewa/katalog" className="text-red-600 font-bold hover:underline">
              Semua Koleksi Busana
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-5 space-y-4 shadow-xl animate-fade-in">
          
          {/* Quick search input in mobile drawer */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari kebaya, jas, gaun pesta..."
              className="w-full bg-slate-100 text-stone-800 text-xs pl-3 pr-16 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-red-500 focus:bg-white transition"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  if (location.pathname === '/sewa/katalog') {
                    navigate('/sewa/katalog');
                  }
                }}
                className="absolute right-8 top-2 p-1 text-stone-400 hover:text-stone-700"
                aria-label="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-2 p-1 text-stone-500 hover:text-red-600"
              aria-label="Cari"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Direct Mobile Quick Actions (No Login Required) */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/sewa/keranjang"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-red-700 bg-rose-50 border border-rose-200 rounded-xl"
            >
              <ShoppingBag className="w-4 h-4 text-red-600" />
              <span>Keranjang ({totalItems})</span>
            </Link>
            <Link
              to="/sewa/riwayat"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-stone-700 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <History className="w-4 h-4 text-red-600" />
              <span>Riwayat</span>
            </Link>
          </div>

          {/* Category List */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2">
              Kategori Busana
            </div>
            {categoryMenu.map((cat) => (
              <Link
                key={cat.id}
                to={cat.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-stone-800"
              >
                <span>{cat.title}</span>
                <span className="text-[10px] bg-slate-100 text-stone-500 px-2 py-0.5 rounded-full">
                  {cat.count}
                </span>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <Link
              to="/sewa/cara-sewa"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 text-xs font-medium text-stone-700 hover:text-red-600"
            >
              Panduan &amp; S&amp;K Sewa Busana
            </Link>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 p-2 text-xs text-stone-600 hover:text-stone-900 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Studio MUA &amp; Dekorasi</span>
            </Link>
          </div>
        </div>
      )}

    </header>
  );
};
