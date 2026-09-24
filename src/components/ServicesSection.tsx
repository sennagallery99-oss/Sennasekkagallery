import React from 'react';
import { Sparkles, Palette, Crown, Check, ArrowRight } from 'lucide-react';
import { SERVICES_DATA, ADMIN_WA_NUMBER } from '../data/packagesData';
import { LazyImage } from './LazyImage';

interface ServicesSectionProps {
  onSelectCategory: (category: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectCategory }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#8E8271]" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-[#8E8271]" />;
      case 'Crown':
      default:
        return <Crown className="w-5 h-5 text-[#8E8271]" />;
    }
  };

  return (
    <section id="services" className="py-28 bg-[#F5F2ED] border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-[#8E8271] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.35em] inline-block border-b border-[#8E8271]/40 pb-1">
            Layanan Terintegrasi
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#1A1A1A] mt-4 leading-[1.15]">
            Keahlian Kami untuk Hari Bahagia Anda
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-5 leading-relaxed font-light">
            Menghadirkan kenyamanan satu pintu untuk kebutuhan tata rias, panggung pelaminan, serta busana pengantin dan keluarga.
          </p>
        </div>

        {/* 3 Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES_DATA.map((service, idx) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl overflow-hidden border border-black/10 shadow-xs hover:border-black/30 hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Image Preview */}
              <div className="relative h-56 overflow-hidden bg-stone-200">
                <LazyImage
                  src={service.image}
                  alt={service.title}
                  imageSize={600}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700 filter brightness-[0.96]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>
                
                {/* Floating Icon */}
                <div className="absolute top-4 left-4 w-11 h-11 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg">
                  {getIcon(service.icon)}
                </div>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[9px] uppercase font-semibold text-[#E5E1DA] tracking-[0.25em]">
                    {service.subtitle}
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-white">{service.title}</h3>
                </div>
              </div>

              {/* Body Description & Highlights */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light mb-6">
                    {service.description}
                  </p>

                  <div className="space-y-2.5 mb-6">
                    <p className="text-[10px] font-semibold text-[#8E8271] uppercase tracking-[0.25em]">Keunggulan:</p>
                    {service.highlights.map((item, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2.5 text-xs text-stone-800">
                        <div className="w-4 h-4 rounded-full bg-[#F5F2ED] text-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5 border border-black/10">
                          <Check className="w-2.5 h-2.5 text-[#8E8271]" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  id={`view-service-pkg-${idx}`}
                  onClick={() => {
                    const catMap: Record<string, string> = {
                      'service-mua': 'mua',
                      'service-decor': 'decor',
                      'service-attire': 'wedding'
                    };
                    onSelectCategory(catMap[service.id] || 'all');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#1A1A1A] text-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-black transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Lihat Paket {service.title.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8E8271]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Guarantee Banner */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-[#141312] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-white/10">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-serif text-xl sm:text-2xl font-normal text-[#E5E1DA]">
              Butuh Penyesuaian Paket &amp; Budget Khusus?
            </h4>
            <p className="text-stone-300 text-xs sm:text-sm font-light">
              Kami siap mendiskusikan konsep adat tertentu, luas venue gedung/rumah, dan kebutuhan khusus keluarga Anda.
            </p>
          </div>

          <a
            href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin%20Senna%20MUA%20%26%20Sekka%20Design,%20saya%20ingin%20konsultasi%20custom%20paket%20wedding%20sesuai%20budget%20kami`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#F5F2ED] text-[#1A1A1A] hover:bg-white text-xs uppercase tracking-[0.2em] font-semibold px-7 py-3.5 rounded-full shadow hover:scale-105 transition shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <span>Konsultasi Custom Gratis</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#8E8271]" />
          </a>
        </div>

      </div>
    </section>
  );
};
