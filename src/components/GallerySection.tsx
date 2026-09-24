import React, { useState } from 'react';
import { Sparkles, MapPin, Heart, X, ZoomIn, ArrowRight, Palette, Tag, Check, MessageCircle, Instagram, ExternalLink } from 'lucide-react';
import { GALLERY_DATA } from '../data/galleryData';
import { ADMIN_WA_NUMBER, STUDIO_INFO, INSTAGRAM_ACCOUNTS } from '../data/packagesData';
import { GalleryItem } from '../types';
import { useSewaStore } from '../store/sewaStore';
import { LazyImage } from './LazyImage';

interface GallerySectionProps {
  onExplorePackages: () => void;
  onExplorePortfolio?: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ 
  onExplorePackages,
  onExplorePortfolio 
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const { gallery } = useSewaStore();

  const categories = [
    { id: 'all', label: 'Semua Karya' },
    { id: 'mua', label: '💄 Make-up Look' },
    { id: 'decor', label: '🌸 Dekorasi Pelaminan' },
    { id: 'attire', label: '👗 Busana & Gaun' },
  ];

  const filteredItems = activeCategory === 'all' 
    ? gallery 
    : gallery.filter((item) => item.category === activeCategory);

  const handleDirectWhatsApp = (item: GalleryItem) => {
    const text = `Halo Admin Senna MUA Gallery & Sekka Design, saya tertarik dengan portofolio "${item.title}" (${item.categoryLabel}). Mohon info paket dan ketersediaan jadwal fitting di studio.`;
    window.open(`https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="gallery" className="py-24 sm:py-28 bg-[#FAF6F0] border-b border-[#C28274]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <span className="text-[#A85848] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.35em] inline-block border-b border-[#C28274]/40 pb-1">
              Portofolio &amp; Inspirasi Pengantin
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#241E1C] mt-4 leading-[1.15]">
              Galeri Mahakarya Kami
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-3 font-light max-w-xl">
              Dokumentasi nyata riasan flawless <strong>Senna MUA</strong>, instalasi pelaminan megah <strong>Sekka Design</strong>, serta koleksi gaun pengantin eksklusif <strong>Senna Wedding Attire</strong>.
            </p>
          </div>

          {/* Action & Filter Pills */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {onExplorePortfolio && (
              <button
                onClick={onExplorePortfolio}
                className="bg-[#241E1C] hover:bg-black text-white text-xs uppercase tracking-[0.16em] font-semibold px-5 py-2.5 rounded-full shadow transition flex items-center gap-2 cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5 text-[#E6B8A2]" />
                <span>Buka Mode Slideshow</span>
              </button>
            )}

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  id={`filter-cat-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-[11px] uppercase tracking-wider font-semibold px-4 py-2 rounded-full transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#C28274] text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-[#C28274]/25 hover:border-[#C28274]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.slice(0, 8).map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-stone-200 cursor-pointer border border-[#C28274]/20 shadow-xs hover:shadow-2xl hover:border-[#C28274]/50 transition duration-500"
            >
              <LazyImage
                src={item.image}
                alt={item.title}
                containerClassName="w-full h-full"
                className="w-full h-full object-cover group-hover:scale-108 transition duration-700 filter brightness-[0.96]"
                rootMargin="200px"
                imageSize={600}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1615]/95 via-[#1C1615]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5 text-white">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase font-bold tracking-[0.2em] px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#F5D0C5] border border-white/20">
                    {item.categoryLabel}
                  </span>
                  <div className="p-2 rounded-full bg-black/50 text-white backdrop-blur-md">
                    <ZoomIn className="w-3.5 h-3.5 text-[#E6B8A2]" />
                  </div>
                </div>

                <div>
                  {item.coupleName && (
                    <span className="text-xs font-semibold text-[#F5D0C5] block flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-[#C28274] text-[#C28274]" /> {item.coupleName}
                    </span>
                  )}
                  <h4 className="font-serif text-lg font-normal leading-snug mt-1 text-white drop-shadow-xs">{item.title}</h4>
                  {item.instagramHandle && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#F5D0C5]">
                      <Instagram className="w-3 h-3 text-[#E6B8A2]" />
                      <span>{item.instagramHandle}</span>
                    </div>
                  )}
                  {item.location && (
                    <p className="text-[10px] uppercase tracking-wider text-stone-300 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3 h-3 text-[#E6B8A2] shrink-0" />
                      <span>{item.location}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA to Packages and Portfolio */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          {onExplorePortfolio && (
            <button
              onClick={onExplorePortfolio}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-white bg-[#C28274] hover:bg-[#A85848] px-8 py-4 rounded-full shadow-lg transition cursor-pointer"
            >
              <Palette className="w-4 h-4 text-[#F7DCD3]" />
              <span>Jelajahi Portofolio Lengkap &amp; Slideshow</span>
            </button>
          )}

          <button
            id="gallery-book-now-cta"
            onClick={onExplorePackages}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-[#241E1C] hover:text-black px-8 py-4 rounded-full border border-[#C28274]/30 bg-white hover:border-[#C28274] transition shadow-xs cursor-pointer"
          >
            <span>Lihat Paket Bundling Promo 2026</span>
            <ArrowRight className="w-4 h-4 text-[#C28274]" />
          </button>
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          id="photo-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#1C1615] rounded-3xl overflow-hidden border border-[#C28274]/30 shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo Column */}
            <div className="md:w-3/5 bg-black flex items-center justify-center overflow-hidden max-h-[50vh] md:max-h-[80vh]">
              <LazyImage
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                priority
                containerClassName="w-full h-full flex items-center justify-center bg-black"
                className="w-full h-full object-contain"
                imageSize={1200}
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>

            {/* Info Column */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between text-white overflow-y-auto">
              <div>
                <span className="text-[10px] font-bold text-[#E6B8A2] uppercase tracking-[0.25em] block mb-2">
                  {selectedPhoto.categoryLabel}
                </span>
                
                <h3 className="font-serif text-2xl font-normal mb-3 text-[#F7DCD3]">{selectedPhoto.title}</h3>

                {selectedPhoto.instagramHandle && (
                  <a
                    href={selectedPhoto.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-[#F5D0C5] mb-3 transition"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#E6B8A2]" />
                    <span>Instagram: {selectedPhoto.instagramHandle}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}

                {selectedPhoto.coupleName && (
                  <p className="text-xs text-stone-300 flex items-center gap-1.5 mb-2">
                    <Heart className="w-3.5 h-3.5 text-[#C28274] fill-[#C28274]" />
                    <span>Pasangan: <strong>{selectedPhoto.coupleName}</strong></span>
                  </p>
                )}

                {selectedPhoto.location && (
                  <p className="text-xs text-stone-400 flex items-center gap-1.5 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-[#E6B8A2]" />
                    <span>{selectedPhoto.location}</span>
                  </p>
                )}

                <p className="text-xs text-stone-300 font-light leading-relaxed pt-3 border-t border-white/10">
                  {selectedPhoto.description}
                </p>

                {selectedPhoto.specs && (
                  <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-stone-300">
                    <span className="text-[10px] text-[#E6B8A2] uppercase font-semibold block">Spesifikasi:</span>
                    {selectedPhoto.specs}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 space-y-3">
                <button
                  onClick={() => handleDirectWhatsApp(selectedPhoto)}
                  className="w-full bg-[#C28274] hover:bg-[#A85848] text-white text-xs uppercase tracking-[0.18em] font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Tanya Look Ini via WhatsApp</span>
                </button>
                {selectedPhoto.instagramUrl && (
                  <a
                    href={selectedPhoto.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs uppercase tracking-[0.14em] font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#E6B8A2]" />
                    <span>Buka Foto di Instagram ({selectedPhoto.instagramHandle})</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
                <button
                  onClick={() => {
                    setSelectedPhoto(null);
                    onExplorePackages();
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-[0.18em] font-semibold py-3 rounded-xl transition cursor-pointer text-center"
                >
                  Lihat Paket Wedding Promo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
