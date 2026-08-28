import React, { useState } from 'react';
import { Sparkles, MapPin, Heart, X, ZoomIn, ArrowRight } from 'lucide-react';
import { GALLERY_DATA } from '../data/galleryData';
import { GalleryItem } from '../types';

interface GallerySectionProps {
  onExplorePackages: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onExplorePackages }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const categories = [
    { id: 'all', label: 'Semua Karya' },
    { id: 'mua', label: 'MUA & Hairdo' },
    { id: 'decor', label: 'Dekorasi Pelaminan' },
    { id: 'attire', label: 'Busana Pengantin' },
    { id: 'intimate', label: 'Intimate Wedding' },
  ];

  const filteredItems = activeCategory === 'all' 
    ? GALLERY_DATA 
    : GALLERY_DATA.filter((item) => item.category === activeCategory);

  return (
    <section id="gallery" className="py-28 bg-[#F5F2ED] border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-[#8E8271] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.35em] inline-block border-b border-[#8E8271]/40 pb-1">
              Portofolio &amp; Inspirasi
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#1A1A1A] mt-4 leading-[1.15]">
              Galeri Mahakarya Kami
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-3 font-light">
              Koleksi dokumentasi nyata riasan Senna MUA Gallery dan instalasi Sekka Design Decoration.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`filter-cat-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-[11px] uppercase tracking-wider font-semibold px-4 py-2 rounded-full transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-black/15 hover:border-black'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-stone-200 cursor-pointer border border-black/10 shadow-xs hover:shadow-xl hover:border-black/30 transition duration-500"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700 filter brightness-[0.97]"
                loading="lazy"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5 text-white">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase font-bold tracking-[0.2em] px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[#E5E1DA] border border-white/20">
                    {item.categoryLabel}
                  </span>
                  <div className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  {item.coupleName && (
                    <span className="text-xs font-semibold text-[#E5E1DA] block flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-[#8E8271] text-[#8E8271]" /> {item.coupleName}
                    </span>
                  )}
                  <h4 className="font-serif text-xl font-normal leading-snug">{item.title}</h4>
                  {item.location && (
                    <p className="text-[10px] uppercase tracking-wider text-stone-300 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3 h-3 text-[#8E8271] shrink-0" />
                      <span>{item.location}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA to Packages */}
        <div className="mt-16 text-center">
          <button
            id="gallery-book-now-cta"
            onClick={onExplorePackages}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-[#1A1A1A] hover:text-black px-7 py-3.5 rounded-full border border-black/20 bg-white hover:border-black transition shadow-xs cursor-pointer"
          >
            <span>Tertarik dengan karya kami? Lihat Daftar Paket &amp; Promo</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#8E8271]" />
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
            className="relative max-w-4xl w-full bg-[#141312] rounded-2xl overflow-hidden border border-white/15 shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
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
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Info Column */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between text-white overflow-y-auto">
              <div>
                <span className="text-[10px] font-bold text-[#8E8271] uppercase tracking-[0.25em] block mb-2">
                  {selectedPhoto.categoryLabel}
                </span>
                
                <h3 className="font-serif text-2xl font-normal mb-3 text-[#E5E1DA]">{selectedPhoto.title}</h3>

                {selectedPhoto.coupleName && (
                  <p className="text-xs text-stone-300 flex items-center gap-1.5 mb-2">
                    <Heart className="w-3.5 h-3.5 text-[#8E8271] fill-[#8E8271]" />
                    <span>Pasangan: <strong>{selectedPhoto.coupleName}</strong></span>
                  </p>
                )}

                {selectedPhoto.location && (
                  <p className="text-xs text-stone-400 flex items-center gap-1.5 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-[#8E8271]" />
                    <span>{selectedPhoto.location}</span>
                  </p>
                )}

                <p className="text-xs text-stone-300 font-light leading-relaxed pt-3 border-t border-white/10">
                  {selectedPhoto.description}
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 space-y-3">
                <button
                  onClick={() => {
                    setSelectedPhoto(null);
                    onExplorePackages();
                  }}
                  className="w-full bg-[#F5F2ED] text-[#1A1A1A] hover:bg-white text-xs uppercase tracking-[0.18em] font-semibold py-3 rounded-xl transition cursor-pointer"
                >
                  Pilih Paket Wedding Ini
                </button>
                <a
                  href={`https://wa.me/6282122030072?text=Halo%20Admin,%20saya%20tertarik%20dengan%20portofolio%20${encodeURIComponent(selectedPhoto.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-[0.18em] font-semibold py-3 rounded-xl transition text-center block"
                >
                  Tanya Admin via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
