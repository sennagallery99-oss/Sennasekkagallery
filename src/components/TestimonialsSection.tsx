import React, { useState } from 'react';
import { Star, Quote, Heart, CheckCircle2, Instagram, Plus, Sparkles, MapPin } from 'lucide-react';
import { useSewaStore } from '../store/sewaStore';
import { INSTAGRAM_ACCOUNTS } from '../data/packagesData';
import { LazyImage } from './LazyImage';
import { ReviewModal } from './ReviewModal';

export const TestimonialsSection: React.FC = () => {
  const testimonials = useSewaStore((state) => state.testimonials) || [];
  const likeTestimonial = useSewaStore((state) => state.likeTestimonial);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!likedMap[id]) {
      likeTestimonial(id);
      setLikedMap((prev) => ({ ...prev, [id]: true }));
    }
  };

  return (
    <section id="testimonials" className="py-24 sm:py-28 bg-[#F5F2ED] relative overflow-hidden border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-[#8E8271] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.35em] border-b border-[#8E8271]/40 pb-1 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kebahagiaan Pengantin &amp; Klien Kami</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#1A1A1A] mt-2 leading-[1.15]">
            Kisah Nyata Pasangan Senna &amp; Sekka
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-3 font-light leading-relaxed">
            Ulasan jujur dari pengantin dan penyewa busana yang mempercayakan hari paling bersejarah mereka kepada kami.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-stone-800 text-amber-200 text-xs font-semibold tracking-wide shadow-md transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Tulis Testimoni Anda</span>
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testi) => {
            const hasLiked = likedMap[testi.id] || false;

            return (
              <div
                key={testi.id}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-black/10 shadow-xs hover:shadow-xl hover:border-black/30 transition duration-300 flex flex-col justify-between relative group"
              >
                <Quote className="w-8 h-8 text-[#8E8271]/20 absolute top-6 right-6 group-hover:text-[#8E8271]/40 transition" />

                <div>
                  {/* Rating Stars & Location */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(Math.min(5, Math.max(1, Math.round(testi.rating || 5))))].map((_, rIdx) => (
                        <Star key={rIdx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {testi.location && (
                      <span className="text-[10px] text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span>{testi.location}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed mb-6 font-light italic">
                    "{testi.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-black/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LazyImage
                      src={
                        testi.image ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={testi.clientName}
                      imageSize={96}
                      sizes="48px"
                      containerClassName="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-[#8E8271]/40"
                      className="w-full h-full object-cover"
                    />
                    <div>
                      <h4 className="font-serif font-semibold text-[#1A1A1A] text-sm flex items-center gap-1.5">
                        <span>{testi.clientName}</span>
                        {testi.isVerified !== false && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </h4>
                      <span className="text-[10px] uppercase tracking-wider text-[#8E8271] font-semibold block line-clamp-1">
                        {testi.event}
                      </span>
                      <span className="text-[10px] text-stone-400 font-light">
                        {testi.date}
                      </span>
                    </div>
                  </div>

                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={(e) => handleLike(testi.id, e)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                      hasLiked
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-stone-50 hover:bg-red-50 text-stone-500 hover:text-red-600 border border-stone-200'
                    }`}
                    title="Bermanfaat"
                  >
                    <Heart
                      className={`w-3 h-3 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`}
                    />
                    <span>{testi.likesCount || 0}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instagram proof links */}
        <div className="mt-14 text-center">
          <p className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-700 mb-3 flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-[#8E8271] fill-[#8E8271]" />
            <span>Lihat ratusan testimoni &amp; video rias lainnya di Instagram resmi:</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
            <a
              href={INSTAGRAM_ACCOUNTS.mua.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-xs font-medium text-stone-800 transition shadow-2xs"
            >
              <Instagram className="w-3.5 h-3.5 text-[#8E8271]" />
              <span>MUA: <strong>{INSTAGRAM_ACCOUNTS.mua.handle}</strong></span>
            </a>
            <a
              href={INSTAGRAM_ACCOUNTS.decor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-xs font-medium text-stone-800 transition shadow-2xs"
            >
              <Instagram className="w-3.5 h-3.5 text-[#8E8271]" />
              <span>Dekorasi: <strong>{INSTAGRAM_ACCOUNTS.decor.handle}</strong></span>
            </a>
            <a
              href={INSTAGRAM_ACCOUNTS.attire.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-xs font-medium text-stone-800 transition shadow-2xs"
            >
              <Instagram className="w-3.5 h-3.5 text-[#8E8271]" />
              <span>Attire: <strong>{INSTAGRAM_ACCOUNTS.attire.handle}</strong></span>
            </a>
          </div>
        </div>

      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultCategory="wedding"
      />
    </section>
  );
};

