import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Gift, 
  Phone, 
  Lock, 
  Info, 
  ArrowRight, 
  X,
  MessageCircle,
  Clock,
  ShieldCheck,
  Star
} from 'lucide-react';
import { PACKAGES_DATA, ADMIN_WA_NUMBER } from '../data/packagesData';
import { PackageItem, UserSession } from '../types';

interface PackagesSectionProps {
  user: UserSession | null;
  onOpenAuth: (redirectPackageId?: string) => void;
  onTriggerBookingSuccess: (pkg: PackageItem) => void;
  selectedCategoryFilter?: string;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  user,
  onOpenAuth,
  onTriggerBookingSuccess,
  selectedCategoryFilter = 'all'
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategoryFilter || 'all');
  const [detailModalPackage, setDetailModalPackage] = useState<PackageItem | null>(null);

  const categories = [
    { id: 'all', label: 'Semua Paket' },
    { id: 'wedding', label: 'Paket Wedding Lengkap' },
    { id: 'mua', label: 'Paket Senna MUA Only' },
    { id: 'decor', label: 'Paket Dekorasi Sekka' },
  ];

  const filteredPackages = activeCategory === 'all'
    ? PACKAGES_DATA
    : PACKAGES_DATA.filter((pkg) => pkg.category === activeCategory);

  const handleBookingClick = (pkg: PackageItem) => {
    if (!user) {
      // User is not logged in: Redirect to login modal with package memory!
      onOpenAuth(pkg.id);
    } else {
      // User is logged in: Trigger WhatsApp URL and celebratory feedback
      const clientName = user.nama_lengkap || 'Calon Pengantin';
      const textMessage = `Halo Admin Senna MUA Gallery & Sekka Design, saya ${clientName} ingin booking ${pkg.name} (${pkg.priceFormatted}). Mohon informasi jadwal ketersediaan tanggal dan jadwal konsultasi. Terima kasih!`;
      const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(textMessage)}`;
      
      onTriggerBookingSuccess(pkg);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div id="packages-page-container" className="py-20 bg-[#F5F2ED] border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/5 border border-black/10 text-[#8E8271] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.35em] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#8E8271]" />
            <span>Katalog Resmi 2026</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#1A1A1A] leading-[1.15]">
            Pilihan Paket Pernikahan Eksklusif
          </h1>

          <p className="text-stone-600 text-xs sm:text-sm mt-4 leading-relaxed font-light max-w-2xl mx-auto">
            Transparan, tanpa biaya tersembunyi. Lengkap dengan makeup artist profesional, dekorasi pelaminan modern, serta busana pengantin berkelas.
          </p>

          {/* User Auth Status Bar in Packages View */}
          <div className="mt-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-black/10 shadow-xs text-xs font-light">
            {user ? (
              <span className="text-emerald-800 font-normal flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Login sebagai: <strong>{user.nama_lengkap || user.email_hp}</strong> (Klik booking langsung terhubung ke WhatsApp Admin)
              </span>
            ) : (
              <span className="text-stone-700 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#8E8271]" />
                <span>Belum masuk akun? Klik 'Booking Sekarang' untuk login &amp; melanjutkan otomatis.</span>
              </span>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex p-1 rounded-full bg-stone-200/60 border border-black/10 flex-wrap justify-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`pkg-tab-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-[11px] uppercase tracking-[0.15em] font-semibold px-5 sm:px-6 py-2.5 rounded-full transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-stone-600 hover:text-black hover:bg-white/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              id={`package-card-${pkg.id}`}
              className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col relative group ${
                pkg.isPopular
                  ? 'border-black/30 shadow-xl ring-1 ring-black/20'
                  : 'border-black/10 shadow-xs hover:shadow-xl hover:border-black/30'
              }`}
            >
              {/* Image Preview with Badges */}
              <div className="relative h-60 overflow-hidden bg-stone-200">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700 filter brightness-[0.96]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>

                {/* Category Pill */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-[#E5E1DA] text-[9px] uppercase tracking-[0.2em] font-semibold px-3 py-1 rounded-full border border-white/20">
                  {pkg.categoryLabel}
                </div>

                {/* Popular / Best Seller Badge */}
                {pkg.isPopular && (
                  <div className="absolute top-4 right-4 bg-[#1A1A1A] border border-white/20 text-white text-[9px] uppercase tracking-[0.2em] font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Star className="w-3 h-3 text-[#8E8271] fill-[#8E8271]" />
                    <span>Paling Diminati</span>
                  </div>
                )}

                {/* Price Display on Image Bottom */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  {pkg.originalPrice && (
                    <span className="text-xs text-stone-300 line-through mr-2 font-light">
                      {pkg.originalPrice}
                    </span>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-normal text-white drop-shadow-xs">
                      {pkg.priceFormatted}
                    </span>
                    <span className="text-[10px] text-stone-300 uppercase tracking-widest font-light">/ Acara</span>
                  </div>
                </div>
              </div>

              {/* Package Details Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-serif text-2xl font-normal text-[#1A1A1A] leading-tight">
                      {pkg.name}
                    </h3>
                  </div>

                  <p className="text-xs text-stone-500 leading-relaxed mb-6 font-light">
                    {pkg.tagline}
                  </p>

                  {/* Feature Checklist Preview */}
                  <div className="space-y-2.5 mb-6 text-xs text-stone-800">
                    <p className="font-semibold text-[#8E8271] uppercase tracking-[0.25em] text-[10px]">
                      Highlight Layanan Termasuk:
                    </p>
                    {pkg.features.slice(0, 5).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-[#F5F2ED] text-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5 border border-black/10">
                          <CheckCircle2 className="w-2.5 h-2.5 text-[#8E8271]" />
                        </div>
                        <span className="line-clamp-2 text-xs text-stone-700">{feat}</span>
                      </div>
                    ))}
                    {pkg.features.length > 5 && (
                      <button
                        onClick={() => setDetailModalPackage(pkg)}
                        className="text-[10px] text-[#8E8271] uppercase tracking-wider font-semibold hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        + Lihat {pkg.features.length - 5} rincian lainnya <Info className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Special Bonus Badge */}
                  {pkg.bonus && pkg.bonus.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-[#F5F2ED] border border-black/10 text-xs text-stone-800 mb-6 flex items-start gap-2.5">
                      <Gift className="w-4 h-4 text-[#8E8271] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-[10px] uppercase tracking-[0.2em] text-[#8E8271]">Bonus Eksklusif:</span>
                        <span className="text-[11px] text-stone-700">{pkg.bonus[0]}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions: Booking Sekarang vs Lihat Detail */}
                <div className="space-y-2.5 pt-4 border-t border-black/10">
                  <button
                    id={`booking-btn-${pkg.id}`}
                    onClick={() => handleBookingClick(pkg)}
                    className="w-full text-center font-semibold text-xs uppercase tracking-[0.18em] py-3.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#1A1A1A] text-white hover:bg-black"
                  >
                    {user ? (
                      <>
                        <MessageCircle className="w-4 h-4 text-[#8E8271]" />
                        <span>Booking via WhatsApp</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-[#8E8271]" />
                        <span>Booking Sekarang</span>
                      </>
                    )}
                  </button>

                  <button
                    id={`detail-btn-${pkg.id}`}
                    onClick={() => setDetailModalPackage(pkg)}
                    className="w-full text-center text-xs uppercase tracking-wider font-semibold text-stone-600 hover:text-black py-2 transition cursor-pointer"
                  >
                    Rincian Lengkap Paket
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-16 bg-white rounded-2xl p-8 border border-black/10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-[#8E8271]" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1A1A1A]">
                Jaminan Kualitas &amp; Bebas Khawatir
              </h3>
              <p className="text-xs text-stone-600 font-light mt-0.5">
                Pemesanan disertai surat perjanjian kerja (SPK) resmi, garansi tepat waktu, dan jaminan produk kosmetik 100% original high-end.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/6282122030072?text=Halo%20Admin,%20saya%20ingin%20tanya%20prosedur%20booking%20dan%20pembayaran%20DP"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-[0.18em] font-semibold text-stone-800 hover:text-black px-6 py-3.5 rounded-full border border-black/20 hover:border-black transition shrink-0 flex items-center gap-2 cursor-pointer bg-[#F5F2ED]"
          >
            <Phone className="w-3.5 h-3.5 text-[#8E8271]" />
            <span>Tanya Prosedur DP &amp; SPK</span>
          </a>
        </div>

      </div>

      {/* Package Detail Modal */}
      {detailModalPackage && (
        <div
          id="package-detail-modal"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setDetailModalPackage(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-black/15 overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Image */}
            <div className="relative h-48 bg-[#141312]">
              <img
                src={detailModalPackage.image}
                alt={detailModalPackage.name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent"></div>
              
              <button
                onClick={() => setDetailModalPackage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-[9px] text-[#E5E1DA] font-bold uppercase tracking-[0.25em] block">
                  {detailModalPackage.categoryLabel}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white">
                  {detailModalPackage.name}
                </h3>
                <span className="font-serif text-xl font-normal text-[#E5E1DA]">
                  {detailModalPackage.priceFormatted}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-6 text-xs text-stone-700">
              <div>
                <h4 className="font-semibold text-[#8E8271] uppercase tracking-[0.25em] text-[10px] mb-2">
                  Deskripsi Paket:
                </h4>
                <p className="text-stone-600 leading-relaxed font-light">
                  {detailModalPackage.tagline}
                </p>
              </div>

              {detailModalPackage.includes.map((section, sIdx) => (
                <div key={sIdx} className="bg-[#F5F2ED] p-5 rounded-2xl border border-black/10">
                  <h4 className="font-serif text-[#1A1A1A] text-base font-normal mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8E8271]" />
                    <span>{section.title}</span>
                  </h4>
                  <ul className="space-y-2 text-stone-600 font-light">
                    {section.items.map((it, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8E8271] shrink-0 mt-0.5" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {detailModalPackage.bonus && (
                <div className="bg-[#F5F2ED] p-5 rounded-2xl border border-black/10">
                  <h4 className="font-serif text-[#1A1A1A] text-base font-normal mb-2 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#8E8271]" />
                    <span>Bonus Tambahan:</span>
                  </h4>
                  <ul className="space-y-1.5 text-stone-700">
                    {detailModalPackage.bonus.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-center gap-2 font-medium">
                        <span>• {b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer CTA */}
            <div className="p-6 bg-[#F5F2ED] border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-500 block">Total Investasi:</span>
                <span className="font-serif text-2xl font-normal text-[#1A1A1A]">
                  {detailModalPackage.priceFormatted}
                </span>
              </div>

              <button
                onClick={() => {
                  const pkg = detailModalPackage;
                  setDetailModalPackage(null);
                  handleBookingClick(pkg);
                }}
                className="w-full sm:w-auto bg-[#1A1A1A] text-white hover:bg-black font-semibold text-xs uppercase tracking-[0.18em] px-6 py-3.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {user ? (
                  <>
                    <MessageCircle className="w-4 h-4 text-[#8E8271]" />
                    <span>Booking Paket Ini (via WhatsApp)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#8E8271]" />
                    <span>Login &amp; Booking Paket Ini</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
