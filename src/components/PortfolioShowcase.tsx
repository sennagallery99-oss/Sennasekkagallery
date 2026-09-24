import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Heart, 
  Maximize2, 
  X, 
  MessageCircle, 
  Check, 
  Tag, 
  Palette, 
  Calendar,
  Compass,
  ArrowRight,
  Eye,
  Instagram,
  ExternalLink
} from 'lucide-react';
import { GALLERY_DATA } from '../data/galleryData';
import { ADMIN_WA_NUMBER, STUDIO_INFO, INSTAGRAM_ACCOUNTS } from '../data/packagesData';
import { GalleryItem } from '../types';
import { useSewaStore } from '../store/sewaStore';
import { LazyImage } from './LazyImage';

interface PortfolioShowcaseProps {
  onNavigateToPackages?: () => void;
  initialCategory?: 'all' | 'mua' | 'decor' | 'attire';
}

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  onNavigateToPackages,
  initialCategory = 'all'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mua' | 'decor' | 'attire'>(initialCategory);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [searchTag, setSearchTag] = useState<string>('all');
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { gallery } = useSewaStore();

  // Filter items based on selected category & tag
  const filteredItems = gallery.filter(item => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchTag = searchTag === 'all' || (item.tags && item.tags.some(t => t.toLowerCase().includes(searchTag.toLowerCase())));
    return matchCategory && matchTag;
  });

  // Current item on active slide
  const currentSlideItem = filteredItems[activeSlideIndex] || filteredItems[0] || gallery[0];

  // Auto-play slideshow logic
  useEffect(() => {
    if (!isAutoPlaying || filteredItems.length <= 1) return;

    slideTimerRef.current = setInterval(() => {
      setActiveSlideIndex(prev => (prev + 1) % filteredItems.length);
    }, 5500);

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [isAutoPlaying, filteredItems.length, activeSlideIndex]);

  // Reset slide index when category changes
  const handleCategoryChange = (cat: 'all' | 'mua' | 'decor' | 'attire') => {
    setSelectedCategory(cat);
    setActiveSlideIndex(0);
    setSearchTag('all');
  };

  const handleNextSlide = () => {
    setActiveSlideIndex(prev => (prev + 1) % filteredItems.length);
  };

  const handlePrevSlide = () => {
    setActiveSlideIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleWhatsAppInquiry = (item: GalleryItem) => {
    const message = `Halo Admin Senna MUA Gallery & Sekka Design, saya sangat tertarik dengan portofolio:\n\n` +
      `• *Nama*: ${item.title}\n` +
      `• *Kategori*: ${item.categoryLabel}\n` +
      `• *Deskripsi/Spesifikasi*: ${item.specs || item.description}\n\n` +
      `Mohon info ketersediaan untuk tanggal acara saya serta jadwal konsultasi atau fitting di studio (${STUDIO_INFO.openingHours}). Terima kasih!`;
    
    const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="portfolio-showcase-page" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF0E6] border border-[#C28274]/30 text-[#A85848] text-[11px] font-medium uppercase tracking-[0.25em] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#C28274]" />
          <span>Koleksi Mahakarya Pernikahan 2026</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#241E1C] tracking-tight leading-tight">
          Portofolio Rias, Dekorasi &amp; <br className="hidden sm:inline" />
          <span className="italic font-light romantic-gradient-text">Koleksi Gaun Romantis</span>
        </h1>

        <p className="text-stone-600 text-xs sm:text-sm mt-4 leading-relaxed font-light max-w-2xl mx-auto">
          Setiap detail diabadikan dengan keanggunan sejati. Jelajahi karya rias <strong>Senna MUA Gallery</strong>, dekorasi panggung <strong>Sekka Design</strong>, serta gaun pengantin mewah yang siap di-fitting langsung di studio kami.
        </p>

        {/* Operating Hours Romantic Pill */}
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C28274]/20 shadow-xs text-xs text-stone-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Studio Fitting: <strong>{STUDIO_INFO.openingHours}</strong> (Senin &ndash; Minggu)</span>
        </div>
      </div>

      {/* Official Instagram Portfolios Banner */}
      <div className="mb-12 bg-white rounded-3xl p-6 sm:p-8 border border-[#C28274]/25 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E6] text-[#A85848] text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">
              <Instagram className="w-3.5 h-3.5 text-[#C28274]" />
              <span>Sumber Portofolio Asli</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-[#241E1C] font-normal">
              Foto Diambil Langsung dari 3 Akun Instagram Resmi
            </h3>
            <p className="text-xs text-stone-600 font-light mt-1 max-w-xl">
              Setiap karya di bawah dapat Anda cek langsung di feed &amp; reel akun Instagram masing-masing spesialisasi:
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-light">
            <span>Klik kartu untuk mengunjungi profil</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* MUA IG Card */}
          <a
            href={INSTAGRAM_ACCOUNTS.mua.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-[#FDF9F6] border border-[#C28274]/20 hover:border-[#C28274] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-[#FAF0E6] text-[#8C4A3C]">
                Make-up Artist
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#A85848] transition" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-stone-900 text-sm">{INSTAGRAM_ACCOUNTS.mua.name}</h4>
              <p className="text-xs text-stone-500 font-light mt-0.5">{INSTAGRAM_ACCOUNTS.mua.role}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-stone-200/60 flex items-center gap-2 text-xs font-semibold text-[#A85848] group-hover:text-[#241E1C]">
              <Instagram className="w-4 h-4 text-[#C28274]" />
              <span>{INSTAGRAM_ACCOUNTS.mua.handle}</span>
            </div>
          </a>

          {/* Decor IG Card */}
          <a
            href={INSTAGRAM_ACCOUNTS.decor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-[#FDF9F6] border border-[#C28274]/20 hover:border-[#C28274] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-[#FAF0E6] text-[#8C4A3C]">
                Dekorasi Pelaminan
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#A85848] transition" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-stone-900 text-sm">{INSTAGRAM_ACCOUNTS.decor.name}</h4>
              <p className="text-xs text-stone-500 font-light mt-0.5">{INSTAGRAM_ACCOUNTS.decor.role}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-stone-200/60 flex items-center gap-2 text-xs font-semibold text-[#A85848] group-hover:text-[#241E1C]">
              <Instagram className="w-4 h-4 text-[#C28274]" />
              <span>{INSTAGRAM_ACCOUNTS.decor.handle}</span>
            </div>
          </a>

          {/* Attire IG Card */}
          <a
            href={INSTAGRAM_ACCOUNTS.attire.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-[#FDF9F6] border border-[#C28274]/20 hover:border-[#C28274] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-[#FAF0E6] text-[#8C4A3C]">
                Gaun &amp; Attire
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#A85848] transition" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-stone-900 text-sm">{INSTAGRAM_ACCOUNTS.attire.name}</h4>
              <p className="text-xs text-stone-500 font-light mt-0.5">{INSTAGRAM_ACCOUNTS.attire.role}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-stone-200/60 flex items-center gap-2 text-xs font-semibold text-[#A85848] group-hover:text-[#241E1C]">
              <Instagram className="w-4 h-4 text-[#C28274]" />
              <span>{INSTAGRAM_ACCOUNTS.attire.handle}</span>
            </div>
          </a>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
        {[
          { id: 'all', label: 'Semua Koleksi', subtitle: '3 Instagram Resmi', icon: Sparkles, count: gallery.length },
          { id: 'mua', label: 'Make-up Look', subtitle: '@senna_mua_gallery', icon: Palette, count: gallery.filter(i => i.category === 'mua').length },
          { id: 'decor', label: 'Dekorasi Pelaminan', subtitle: '@sekka_designdecoration', icon: Compass, count: gallery.filter(i => i.category === 'decor').length },
          { id: 'attire', label: 'Koleksi Gaun & Attire', subtitle: '@senna_weddingattire', icon: Tag, count: gallery.filter(i => i.category === 'attire').length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              id={`filter-tab-${tab.id}`}
              onClick={() => handleCategoryChange(tab.id as any)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#241E1C] text-white shadow-md scale-102 border border-[#241E1C]'
                  : 'bg-white text-stone-700 hover:text-black border border-stone-200 hover:border-[#C28274]/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E6B8A2]' : 'text-[#C28274]'}`} />
              <div className="text-left">
                <div className="font-medium uppercase tracking-[0.14em] text-[11px] sm:text-xs leading-none">
                  {tab.label}
                </div>
                <div className={`text-[9px] mt-0.5 ${isActive ? 'text-[#F5D0C5]' : 'text-stone-400 font-light'}`}>
                  {tab.subtitle}
                </div>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ml-1 ${isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 1. INTERACTIVE CINEMATIC SLIDESHOW SHOWCASE */}
      {/* ======================================================== */}
      {currentSlideItem && (
        <div className="mb-16">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#C28274]/25 bg-[#1C1615] text-white min-h-[480px] sm:min-h-[540px] md:min-h-[580px] flex items-end">
            
            {/* Background Image with Ken Burns / Zoom Effect */}
            <div className="absolute inset-0 w-full h-full">
              <LazyImage
                src={currentSlideItem.image}
                alt={currentSlideItem.title}
                key={currentSlideItem.id}
                priority
                imageSize={1200}
                sizes="(max-width: 768px) 100vw, 1200px"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover filter brightness-[0.78] contrast-[1.05] transition-all duration-1000 ease-out scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1615] via-[#1C1615]/50 to-black/30 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1C1615]/80 via-transparent to-transparent hidden md:block pointer-events-none" />
            </div>

            {/* Slideshow Top Navigation & Controls */}
            <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 z-20 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold text-[#F5D0C5] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E6B8A2]" />
                  <span>Slideshow Sorotan: {currentSlideItem.categoryLabel}</span>
                </span>
                
                {currentSlideItem.isAvailableInStudio && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/70 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[10px] uppercase tracking-wider font-medium">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Ready di Studio</span>
                  </span>
                )}
              </div>

              {/* Slideshow Autoplay and Counter */}
              <div className="pointer-events-auto flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-xs text-white">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="p-1 hover:text-[#E6B8A2] transition cursor-pointer"
                  title={isAutoPlaying ? 'Jeda Slideshow' : 'Putar Otomatis'}
                >
                  {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <span className="text-[11px] font-mono text-stone-300">
                  {activeSlideIndex + 1} / {filteredItems.length}
                </span>
              </div>
            </div>

            {/* Slide Navigation Arrows */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
              aria-label="Slide Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
              aria-label="Slide Berikutnya"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Slide Content Overlay */}
            <div className="relative z-10 w-full p-6 sm:p-10 md:p-12 max-w-4xl">
              
              {/* Couple / Location Subtitle */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-stone-300 mb-2">
                <span className="text-[#E6B8A2] font-medium">{currentSlideItem.coupleName}</span>
                <span>•</span>
                <span className="text-stone-300">{currentSlideItem.location}</span>
                {currentSlideItem.instagramHandle && (
                  <>
                    <span>•</span>
                    <a
                      href={currentSlideItem.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#F5D0C5] hover:text-white bg-black/40 hover:bg-black/60 px-2.5 py-0.5 rounded-full border border-white/15 transition text-[11px]"
                    >
                      <Instagram className="w-3 h-3 text-[#E6B8A2]" />
                      <span>{currentSlideItem.instagramHandle}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  </>
                )}
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-normal text-white tracking-tight mb-3 leading-tight">
                {currentSlideItem.title}
              </h2>

              {/* Description */}
              <p className="text-stone-200 text-xs sm:text-sm font-light leading-relaxed mb-5 line-clamp-2 sm:line-clamp-3 max-w-2xl">
                {currentSlideItem.description}
              </p>

              {/* Specs & Colors */}
              {currentSlideItem.specs && (
                <div className="hidden sm:flex items-center gap-2 text-xs text-stone-300 mb-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 max-w-xl">
                  <Tag className="w-3.5 h-3.5 text-[#E6B8A2] shrink-0" />
                  <span className="truncate"><strong>Detail:</strong> {currentSlideItem.specs}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleWhatsAppInquiry(currentSlideItem)}
                  className="bg-[#C28274] hover:bg-[#A85848] text-white text-xs uppercase tracking-[0.18em] font-semibold px-6 py-3.5 rounded-full shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Tanya Ketersediaan via WhatsApp</span>
                </button>

                <button
                  onClick={() => setActiveLightboxItem(currentSlideItem)}
                  className="bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white text-xs uppercase tracking-[0.16em] font-medium px-5 py-3.5 rounded-full transition flex items-center gap-2 cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4 text-[#E6B8A2]" />
                  <span>Lihat Detail Foto</span>
                </button>

                <button
                  onClick={(e) => toggleLike(currentSlideItem.id, e)}
                  className={`p-3 rounded-full border transition cursor-pointer ${
                    likedItems[currentSlideItem.id]
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-black/30 border-white/20 text-white hover:bg-white/20'
                  }`}
                  title="Simpan ke Favorit"
                >
                  <Heart className={`w-4 h-4 ${likedItems[currentSlideItem.id] ? 'fill-white' : ''}`} />
                </button>
              </div>

            </div>

          </div>

          {/* Slideshow Thumbnail Strip */}
          <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {filteredItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveSlideIndex(idx)}
                className={`relative shrink-0 w-20 sm:w-24 h-14 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  activeSlideIndex === idx
                    ? 'border-[#C28274] scale-105 shadow-md'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <LazyImage
                  src={item.image}
                  alt={item.title}
                  imageSize={200}
                  sizes="96px"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                <span className="absolute bottom-1 left-1.5 text-[8px] font-bold text-white uppercase tracking-wider truncate max-w-[80px] pointer-events-none z-10">
                  {item.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CURATED GALLERY GRID WITH HOVER & INQUIRY */}
      {/* ======================================================== */}
      <div className="mt-12 sm:mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-[#C28274]/20 pb-4">
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#241E1C]">
              Katalog Lengkap Koleksi Kami
            </h3>
            <p className="text-xs text-stone-600 font-light mt-1">
              Menampilkan {filteredItems.length} mahakarya riasan, tatanan pelaminan, dan gaun pernikahan berkelas.
            </p>
          </div>

          {onNavigateToPackages && (
            <button
              onClick={onNavigateToPackages}
              className="text-xs uppercase tracking-[0.16em] font-semibold text-[#A85848] hover:text-black flex items-center gap-1.5 cursor-pointer transition"
            >
              <span>Lihat Paket Bundling Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map(item => {
            const isLiked = likedItems[item.id];
            return (
              <div
                key={item.id}
                id={`portfolio-card-${item.id}`}
                className="group romantic-card rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
              >
                {/* Image Container with Zoom */}
                <div 
                  className="relative aspect-4/3 overflow-hidden cursor-pointer bg-stone-100"
                  onClick={() => setActiveLightboxItem(item)}
                >
                  <LazyImage
                    src={item.image}
                    alt={item.title}
                    imageSize={600}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    rootMargin="250px"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-70 group-hover:opacity-90 transition-opacity pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded-full bg-[#1C1615]/80 backdrop-blur-md text-[#E6B8A2] text-[10px] uppercase tracking-wider font-semibold border border-[#C28274]/30">
                      {item.categoryLabel}
                    </span>

                    <button
                      onClick={(e) => toggleLike(item.id, e)}
                      className={`p-2 rounded-full backdrop-blur-md transition cursor-pointer ${
                        isLiked
                          ? 'bg-rose-600 text-white'
                          : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                      aria-label="Favorit"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Quick Zoom Pill on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <span className="px-4 py-2 rounded-full bg-white/90 text-stone-900 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Eye className="w-3.5 h-3.5 text-[#C28274]" />
                      <span>Lihat Detail</span>
                    </span>
                  </div>

                  {/* Bottom Image Snippet */}
                  <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none z-10">
                    <span className="text-[10px] uppercase tracking-widest text-[#E6B8A2] font-medium block">
                      {item.location}
                    </span>
                    <h4 className="font-serif text-lg font-normal leading-tight text-white drop-shadow-sm">
                      {item.title}
                    </h4>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs text-stone-600 font-light leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    {/* Specs / Tags */}
                    {item.specs && (
                      <div className="mt-3 text-[11px] text-stone-500 bg-[#FAF6F0] p-2.5 rounded-xl border border-stone-200/60 leading-snug">
                        <strong className="text-stone-700">Detail:</strong> {item.specs}
                      </div>
                    )}

                    {/* Available Color Chips */}
                    {item.availableColors && item.availableColors.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Warna:</span>
                        {item.availableColors.map(color => (
                          <span
                            key={color}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#FDF9F6] border border-[#C28274]/20 text-[#8C4A3C]"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Instagram source link */}
                    {item.instagramHandle && (
                      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                        <a
                          href={item.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#A85848] hover:text-[#241E1C] transition"
                        >
                          <Instagram className="w-3.5 h-3.5 text-[#C28274]" />
                          <span>Instagram {item.instagramHandle}</span>
                        </a>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </div>
                    )}
                  </div>

                  {/* WhatsApp Action */}
                  <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                    <button
                      onClick={() => handleWhatsAppInquiry(item)}
                      className="flex-1 bg-[#241E1C] hover:bg-black text-white text-[11px] uppercase tracking-[0.14em] font-semibold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#E6B8A2]" />
                      <span>Tanya via WA</span>
                    </button>

                    <button
                      onClick={() => setActiveLightboxItem(item)}
                      className="p-2.5 rounded-xl border border-stone-200 hover:border-black text-stone-700 hover:text-black transition cursor-pointer"
                      title="Lihat Detail Foto Penuh"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. LIGHTBOX MODAL WITH EDITORIAL DETAIL */}
      {/* ======================================================== */}
      {activeLightboxItem && (
        <div 
          id="portfolio-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setActiveLightboxItem(null)}
        >
          <div 
            className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl border border-white/20 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveLightboxItem(null)}
              className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Image View */}
            <div className="md:w-1/2 bg-[#1C1615] relative min-h-[300px] md:min-h-[500px]">
              <LazyImage
                src={activeLightboxItem.image}
                alt={activeLightboxItem.title}
                priority
                imageSize={1200}
                sizes="(max-width: 768px) 100vw, 50vw"
                containerClassName="w-full h-full bg-[#1C1615]"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none z-10">
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] uppercase tracking-wider text-[#E6B8A2] font-semibold border border-white/20">
                  {activeLightboxItem.categoryLabel}
                </span>
              </div>
            </div>

            {/* Right Details Panel */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto bg-[#FDF9F6]">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#A85848]">
                    {activeLightboxItem.coupleName} • {activeLightboxItem.location}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#241E1C] font-normal leading-tight mt-1">
                    {activeLightboxItem.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                  {activeLightboxItem.description}
                </p>

                {activeLightboxItem.specs && (
                  <div className="bg-white p-4 rounded-2xl border border-[#C28274]/20 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A85848] block">
                      Spesifikasi &amp; Detail Bahan:
                    </span>
                    <p className="text-xs text-stone-700 font-light leading-relaxed">
                      {activeLightboxItem.specs}
                    </p>
                  </div>
                )}

                {activeLightboxItem.styleNote && (
                  <div className="bg-[#FAF0E6] p-3.5 rounded-2xl border border-[#C28274]/25 text-xs text-stone-700 italic">
                    &ldquo;{activeLightboxItem.styleNote}&rdquo;
                  </div>
                )}

                {activeLightboxItem.availableColors && activeLightboxItem.availableColors.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 block mb-1.5">
                      Pilihan Palet Warna:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeLightboxItem.availableColors.map(c => (
                        <span key={c} className="text-xs px-3 py-1 rounded-full bg-white border border-[#C28274]/30 text-stone-800 font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons in Modal */}
              <div className="pt-6 border-t border-stone-200 mt-6 space-y-2.5">
                <button
                  onClick={() => handleWhatsAppInquiry(activeLightboxItem)}
                  className="w-full bg-[#241E1C] hover:bg-black text-white text-xs uppercase tracking-[0.18em] font-semibold py-3.5 px-4 rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#E6B8A2]" />
                  <span>Reservasi / Fitting Look Ini via WhatsApp</span>
                </button>

                {activeLightboxItem.instagramUrl && (
                  <a
                    href={activeLightboxItem.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-white hover:bg-[#FAF6F0] text-[#241E1C] border border-[#C28274]/40 hover:border-[#C28274] text-xs uppercase tracking-[0.16em] font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Instagram className="w-4 h-4 text-[#C28274]" />
                    <span>Buka Foto di Instagram ({activeLightboxItem.instagramHandle})</span>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                  </a>
                )}

                <p className="text-[11px] text-center text-stone-500 font-light">
                  Jam operasional studio: <strong>{STUDIO_INFO.openingHours}</strong>
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Bottom CTA Banner */}
      <div className="mt-16 bg-gradient-to-r from-[#241E1C] via-[#332624] to-[#241E1C] text-white rounded-3xl p-8 sm:p-12 border border-[#C28274]/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#E6B8A2] font-semibold">
            Konsultasi Private &amp; Fitting Eksklusif
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal">
            Ingin Mencoba Langsung Gaun atau Custom Riasan Impian?
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 font-light">
            Kunjungi studio kami di {STUDIO_INFO.street}, {STUDIO_INFO.city}. Buka setiap hari pukul <strong>09.00 - 16.30 WIB</strong>.
          </p>
        </div>

        <a
          href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin%20Senna%20MUA%20%26%20Sekka%20Design,%20saya%20ingin%20jadwalkan%20fitting%20gaun%20dan%20konsultasi%20dekorasi%20di%20studio.`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white hover:bg-stone-100 text-[#241E1C] text-xs uppercase tracking-[0.2em] font-semibold px-8 py-4 rounded-full transition shadow-lg shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-[#C28274]" />
          <span>Jadwalkan Janji Temu Studio</span>
        </a>
      </div>

    </div>
  );
};
