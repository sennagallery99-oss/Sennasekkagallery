import React from 'react';
import { Star, Quote, Heart, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data/packagesData';

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="py-28 bg-[#F5F2ED] relative overflow-hidden border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-[#8E8271] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.35em] inline-block border-b border-[#8E8271]/40 pb-1">
            Kebahagiaan Pengantin Kami
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#1A1A1A] mt-4 leading-[1.15]">
            Kisah Nyata Pasangan Senna &amp; Sekka
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-3 font-light">
            Ulasan jujur dari pengantin yang mempercayakan hari paling bersejarah mereka kepada kami.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS_DATA.map((testi) => (
            <div
              key={testi.id}
              className="bg-white rounded-2xl p-8 border border-black/10 shadow-xs hover:shadow-xl hover:border-black/30 transition duration-300 flex flex-col justify-between relative"
            >
              <Quote className="w-8 h-8 text-[#8E8271]/25 absolute top-6 right-6" />

              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-[#8E8271] mb-5">
                  {[...Array(testi.rating)].map((_, rIdx) => (
                    <Star key={rIdx} className="w-3.5 h-3.5 fill-[#8E8271]" />
                  ))}
                </div>

                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed mb-6 font-light italic">
                  "{testi.comment}"
                </p>
              </div>

              <div className="pt-5 border-t border-black/10 flex items-center gap-3.5">
                <img
                  src={testi.image}
                  alt={testi.clientName}
                  className="w-12 h-12 rounded-full object-cover border border-[#8E8271]/40"
                />
                <div>
                  <h4 className="font-serif font-normal text-[#1A1A1A] text-base flex items-center gap-1.5">
                    <span>{testi.clientName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8E8271]" />
                  </h4>
                  <span className="text-[10px] uppercase tracking-wider text-[#8E8271] font-semibold block">
                    {testi.event}
                  </span>
                  <span className="text-[10px] text-stone-400 font-light">
                    {testi.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram proof link */}
        <div className="mt-14 text-center">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-semibold text-stone-700 hover:text-black hover:underline"
          >
            <Heart className="w-4 h-4 text-stone-800 fill-stone-800" />
            <span>Lihat ratusan testimoni &amp; video rias lainnya di Instagram @sennamuagallery</span>
          </a>
        </div>

      </div>
    </section>
  );
};
