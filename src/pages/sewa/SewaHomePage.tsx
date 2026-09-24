import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Scissors, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Flame, 
  Tag, 
  CheckCircle2, 
  MessageCircle,
  Shirt,
  Crown,
  Heart,
  TrendingUp,
  MapPin,
  Check,
  Settings
} from 'lucide-react';
import { SEWA_STORE_INFO } from '../../data/sewaProductsData';
import { SewaProductCard } from '../../components/sewa/SewaProductCard';
import { ADMIN_WA_NUMBER } from '../../data/packagesData';
import { useSewaStore } from '../../store/sewaStore';
import { formatDriveImageUrl } from '../../services/googleDriveService';
import { LazyImage } from '../../components/LazyImage';
import { UserReviewsSection } from '../../components/UserReviewsSection';

export const SewaHomePage: React.FC = () => {
  const navigate = useNavigate();
  const showToast = useSewaStore((state) => state.showToast);
  const products = useSewaStore((state) => state.products);
  const webSettings = useSewaStore((state) => state.webSettings);
  const waNumber = webSettings?.contactWhatsapp || ADMIN_WA_NUMBER;

  // 1. CAROUSEL STATE (Optional - only renders if admin has set active banners)
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = useSewaStore((state) => state.banners);
  const validBanners = useMemo(() => {
    return (banners || []).filter((b) => b && b.image && b.image.trim() !== '');
  }, [banners]);

  // Auto rotate carousel if multiple banners exist
  useEffect(() => {
    if (validBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % validBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [validBanners.length]);

  // 2. FLASH SALE COUNTDOWN TIMER
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 18 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. CATEGORY ICONS (Red & Orange Accents)
  const categoryIcons = [
    { label: 'Kebaya Modern', path: '/sewa/katalog?kategori=kebaya', icon: Shirt, color: 'bg-rose-50 text-red-600' },
    { label: 'Jas & Tuxedo', path: '/sewa/katalog?kategori=jas', icon: Scissors, color: 'bg-orange-50 text-orange-600' },
    { label: 'Gaun Pesta', path: '/sewa/katalog?kategori=gaun', icon: Sparkles, color: 'bg-amber-50 text-amber-600' },
    { label: 'Mahkota Siger', path: '/sewa/katalog?kategori=aksesoris', icon: Crown, color: 'bg-red-50 text-red-700' },
    { label: 'Kejar Diskon', path: '/sewa/katalog', icon: Flame, color: 'bg-rose-50 text-red-600', badge: 'Hot' },
    { label: 'Free Fitting', path: '/sewa/cara-sewa', icon: Scissors, color: 'bg-orange-50 text-orange-600' },
    { label: 'Bebas Laundry', path: '/sewa/cara-sewa', icon: ShieldCheck, color: 'bg-rose-50 text-red-600' },
    { label: 'Kontak Admin', href: `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Admin Senna Gallery, saya butuh informasi & rekomendasi busana untuk acara saya.')}`, icon: MessageCircle, color: 'bg-orange-50 text-orange-600' }
  ];

  // 4. FLASH SALE ITEMS
  const flashSaleItems = products.filter((p) => p.discountPercent && p.discountPercent >= 20).slice(0, 4);

  // 5. RECOMMENDATION TABS
  const [activeTab, setActiveTab] = useState<'all' | 'kebaya' | 'jas' | 'gaun' | 'aksesoris'>('all');
  const filteredRecommendations = (activeTab === 'all' 
    ? products 
    : products.filter((p) => p.category === activeTab)).slice(0, 16);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* 1. HERO CAROUSEL BANNER (Optional: only displayed if banners exist) */}
      {validBanners.length > 0 && (
        <section className="relative rounded-3xl overflow-hidden bg-stone-900 shadow-md">
          <div className="relative aspect-[21/9] sm:aspect-[24/9] min-h-[260px] sm:min-h-[320px] w-full">
            {validBanners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <LazyImage
                  src={banner.image}
                  alt={banner.title}
                  priority={index === 0}
                  imageSize={1200}
                  sizes="(max-width: 768px) 100vw, 1200px"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover object-center filter brightness-[0.85]"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${banner.bgGradient} flex items-center px-6 sm:px-12 lg:px-16 pointer-events-none`}>
                  <div className="max-w-xl text-white space-y-3">
                    {banner.tag && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        <span>{banner.tag}</span>
                      </div>
                    )}
                    <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                      {banner.headline || banner.title}
                    </h1>
                    {banner.subtext && (
                      <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 sm:line-clamp-none font-light leading-relaxed">
                        {banner.subtext}
                      </p>
                    )}
                    <div className="pt-2">
                      <Link
                        to={banner.ctaLink || '/sewa/katalog'}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-lg transition active:scale-95"
                      >
                        <span>{banner.ctaText || 'Lihat Katalog'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Prev/Next Carousel Arrows (only if multiple banners) */}
            {validBanners.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + validBanners.length) % validBanners.length)}
                  aria-label="Slide sebelumnya"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center shadow-md transition cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % validBanners.length)}
                  aria-label="Slide berikutnya"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center shadow-md transition cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                  {validBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      aria-label={`Ke slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentSlide ? 'w-6 bg-gradient-to-r from-red-600 to-orange-500' : 'w-2 bg-white/60 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* 2. TOP CATEGORY ICONS */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <h2 className="text-sm sm:text-base font-bold text-stone-900">
              Kategori Pilihan &amp; Layanan Butik
            </h2>
          </div>
          <Link to="/sewa/katalog" className="text-xs font-bold text-red-600 hover:underline">
            Lihat Semua →
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
          {categoryIcons.map((item, idx) => {
            const Icon = item.icon;
            const content = (
              <div className="flex flex-col items-center text-center group cursor-pointer">
                <div className="relative">
                  <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl ${item.color} flex items-center justify-center group-hover:scale-105 group-hover:shadow-md transition-all duration-200 border border-slate-100`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-1 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-stone-700 group-hover:text-red-600 transition mt-2 leading-tight">
                  {item.label}
                </span>
              </div>
            );

            if (item.href) {
              return (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={idx} to={item.path || '/sewa/katalog'} className="block">
                {content}
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. FLASH SALE / KEJAR DISKON SEWA (Red & Orange Signature Banner) */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Flash Sale Banner Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 text-white px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>KEJAR DISKON SEWA</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-white/80 hidden sm:inline">Berakhir dalam:</span>
              <div className="flex items-center gap-1 font-mono font-bold text-xs">
                <span className="bg-black/40 px-2 py-0.5 rounded">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-black/40 px-2 py-0.5 rounded">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-black/40 px-2 py-0.5 rounded">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/sewa/katalog"
            className="text-xs font-bold text-white hover:text-amber-200 transition flex items-center gap-1 self-end sm:self-center"
          >
            <span>Lihat Semua Promo</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Flash Sale Products Grid */}
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {flashSaleItems.map((product) => (
              <div key={product.id} className="flex flex-col">
                <SewaProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. OFFICIAL STORE BADGE */}
      <section className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-orange-500 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-sm">
            S
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                {SEWA_STORE_INFO.name}
              </h2>
              <span className="bg-gradient-to-r from-red-100 to-orange-100 text-red-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                <Check className="w-3 h-3" /> Official Store
              </span>
              <span className="text-xs text-orange-700 font-semibold bg-orange-50 px-2 py-0.5 rounded">
                Online Sekarang
              </span>
            </div>
            <p className="text-xs text-stone-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>{SEWA_STORE_INFO.studioAddress} • {SEWA_STORE_INFO.operatingHours}</span>
            </p>
            <div className="flex items-center gap-4 text-xs text-stone-600 pt-1">
              <span>⭐ <strong>{SEWA_STORE_INFO.rating}</strong> ({SEWA_STORE_INFO.totalRatingCount} ulasan)</span>
              <span>•</span>
              <span>Tersewa <strong>{SEWA_STORE_INFO.totalItemsRented}</strong></span>
              <span>•</span>
              <span className="text-orange-700 font-semibold">{SEWA_STORE_INFO.responseRate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/sewa/cara-sewa"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-700 border border-slate-300 hover:bg-slate-50 transition"
          >
            Ketentuan Sewa
          </Link>
          <a
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Senna Gallery Official Store, saya ingin tanya ketersediaan sewa busana.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white transition flex items-center gap-1.5 shadow-2xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat Toko</span>
          </a>
        </div>
      </section>

      {/* 6. PRODUCT RECOMMENDATION TABS */}
      <section className="space-y-4">
        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-base sm:text-lg font-bold text-stone-900 mr-2 shrink-0">
              Koleksi Pilihan:
            </span>
            {[
              { id: 'all', label: 'Semua Busana' },
              { id: 'kebaya', label: 'Kebaya Modern' },
              { id: 'jas', label: 'Jas & Beskap' },
              { id: 'gaun', label: 'Gaun Pesta' },
              { id: 'aksesoris', label: 'Aksesoris' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link
            to="/sewa/katalog"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline shrink-0"
          >
            <span>Katalog Lengkap ({products.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredRecommendations.map((product) => (
            <SewaProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="pt-6 text-center">
          <Link
            to="/sewa/katalog"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-stone-800 text-xs sm:text-sm font-bold px-8 py-3 rounded-xl shadow-2xs hover:shadow-md transition active:scale-95"
          >
            <span>Lihat Semua Koleksi Busana di Katalog</span>
            <ArrowRight className="w-4 h-4 text-red-600" />
          </Link>
        </div>
      </section>

      {/* 7. KEUNGGULAN SEWA DI SENNA */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
        <div className="text-center max-w-xl mx-auto mb-6">
          <h2 className="text-base sm:text-xl font-bold text-stone-900">
            Kenapa Menyewa Busana di Senna Gallery?
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-light">
            Standar pelayanan butik eksklusif dengan kenyamanan transaksi aman dan transparan
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-red-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-stone-800">100% Bersih &amp; Steril</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Setiap busana melewati proses dry cleaning profesional dan disterilkan dengan uap panas sebelum diserahkan.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-stone-800">Gratis Fitting di Studio</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Dapat mencoba langsung di studio kami di Bandar Lampung dengan panduan penyesuaian kancing dan ukuran oleh stylist.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-stone-800">Bebas Biaya Cuci</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Setelah acara selesai, kembalikan busana apa adanya. Kami yang mengurus pencucian tanpa biaya tambahan.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-stone-800">Tanpa Deposit Jaminan</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Sewa busana nyaman tanpa uang jaminan deposit yang memberatkan. Cukup tunjukkan KTP atau kartu identitas resmi saat serah terima.
            </p>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONI & ULASAN KLIEN (Connected to Database) */}
      <UserReviewsSection
        initialCategory="sewa"
        title="Ulasan & Pengalaman Penyewa"
        subtitle="Dengarkan cerita jujur para pelanggan yang telah menyewa kebaya, gaun, dan jas di Senna Gallery."
        className="rounded-3xl shadow-xl overflow-hidden mt-6"
      />

    </div>
  );
};
