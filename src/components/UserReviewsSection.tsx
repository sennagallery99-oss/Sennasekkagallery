import React, { useState, useMemo } from 'react';
import {
  Star,
  Quote,
  Heart,
  Sparkles,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  MapPin,
  Calendar,
  Trash2,
  ThumbsUp,
  MessageCircleHeart,
  Share2
} from 'lucide-react';
import { useSewaStore } from '../store/sewaStore';
import { ReviewModal } from './ReviewModal';
import { Testimonial } from '../types';

interface UserReviewsSectionProps {
  initialCategory?: 'all' | 'wedding' | 'mua' | 'decor' | 'sewa';
  title?: string;
  subtitle?: string;
  badge?: string;
  hideFilter?: boolean;
  maxItems?: number;
  showWriteButton?: boolean;
  className?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'Semua Ulasan' },
  { id: 'sewa', label: 'Sewa Busana & Kebaya' },
  { id: 'wedding', label: 'Paket Wedding' },
  { id: 'mua', label: 'Makeup MUA' },
  { id: 'decor', label: 'Dekorasi Sekka' },
];

export const UserReviewsSection: React.FC<UserReviewsSectionProps> = ({
  initialCategory = 'all',
  title = 'Cerita Bahagia & Testimoni Klien',
  subtitle = 'Kepuasan dan senyum bahagia para pengantin serta penyewa busana adalah kehormatan tertinggi bagi tim Senna Gallery & Sekka Design.',
  badge = 'TESTIMONI & ULASAN KLIEN',
  hideFilter = false,
  maxItems,
  showWriteButton = true,
  className = ''
}) => {
  const testimonials = useSewaStore((state) => state.testimonials) || [];
  const likeTestimonial = useSewaStore((state) => state.likeTestimonial);
  const deleteTestimonial = useSewaStore((state) => state.deleteTestimonial);
  const isAdminLoggedIn = useSewaStore((state) => state.isAdminLoggedIn);

  const [activeCategory, setActiveCategory] = useState<'all' | 'wedding' | 'mua' | 'decor' | 'sewa'>(initialCategory);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  // Summary Metrics Calculation
  const metrics = useMemo(() => {
    if (testimonials.length === 0) {
      return { average: 5.0, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, satisfactionRate: 100 };
    }
    const total = testimonials.length;
    let sum = 0;
    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    testimonials.forEach((t) => {
      const r = Math.min(5, Math.max(1, Math.round(t.rating || 5)));
      sum += t.rating || 5;
      breakdown[r] = (breakdown[r] || 0) + 1;
    });

    const average = +(sum / total).toFixed(1);
    const satisfiedCount = (breakdown[5] || 0) + (breakdown[4] || 0);
    const satisfactionRate = Math.round((satisfiedCount / total) * 100);

    return { average, total, breakdown, satisfactionRate };
  }, [testimonials]);

  // Filter & Search Testimonials
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((item) => {
      // Category filter
      if (activeCategory !== 'all') {
        const itemCat = item.category || 'wedding';
        if (itemCat !== activeCategory && itemCat !== 'all') {
          return false;
        }
      }

      // Rating filter
      if (selectedRatingFilter > 0) {
        if (Math.round(item.rating) < selectedRatingFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.clientName.toLowerCase().includes(q);
        const matchesComment = item.comment.toLowerCase().includes(q);
        const matchesEvent = (item.event || '').toLowerCase().includes(q);
        const matchesLocation = (item.location || '').toLowerCase().includes(q);
        if (!matchesName && !matchesComment && !matchesEvent && !matchesLocation) {
          return false;
        }
      }

      return true;
    });
  }, [testimonials, activeCategory, selectedRatingFilter, searchQuery]);

  const displayedList = maxItems ? filteredTestimonials.slice(0, maxItems) : filteredTestimonials;

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!likedMap[id]) {
      likeTestimonial(id);
      setLikedMap((prev) => ({ ...prev, [id]: true }));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className={`py-16 md:py-24 bg-gradient-to-b from-stone-900 via-stone-950 to-black text-stone-100 relative overflow-hidden ${className}`}>
      
      {/* Background Ambience & Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-900/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{badge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
            {title}
          </h2>

          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Rating Summary Card Banner */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 mb-10 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Score Big Display */}
            <div className="md:col-span-4 text-center md:text-left flex flex-col md:flex-row items-center gap-4 md:border-r md:border-stone-800 md:pr-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/40 flex flex-col items-center justify-center text-white shrink-0 shadow-inner">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-serif">
                  {metrics.average}
                </span>
                <span className="text-[10px] text-stone-400 font-semibold">dari 5.0</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        s <= Math.round(metrics.average)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-stone-700 text-stone-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm font-bold text-white">
                  {metrics.total} Ulasan Pelanggan
                </p>
                <p className="text-xs text-emerald-400 flex items-center justify-center md:justify-start gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {metrics.satisfactionRate}% Klien Puas &amp; Rekomendasi
                </p>
              </div>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="md:col-span-5 space-y-1.5 px-0 sm:px-4">
              {[5, 4, 3, 2, 1].map((ratingNum) => {
                const count = metrics.breakdown[ratingNum] || 0;
                const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
                return (
                  <button
                    key={ratingNum}
                    onClick={() => setSelectedRatingFilter(selectedRatingFilter === ratingNum ? 0 : ratingNum)}
                    className={`w-full flex items-center gap-2 text-xs group cursor-pointer transition p-0.5 rounded ${
                      selectedRatingFilter === ratingNum ? 'bg-stone-800 ring-1 ring-amber-500' : ''
                    }`}
                  >
                    <span className="w-6 text-stone-400 font-bold group-hover:text-amber-400">
                      {ratingNum}★
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-stone-500 text-[11px] group-hover:text-stone-300">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Write Review CTA Button */}
            {showWriteButton && (
              <div className="md:col-span-3 flex flex-col items-center md:items-end justify-center text-center md:text-right gap-2">
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-red-900/40 hover:shadow-red-900/60 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tulis Testimoni Anda</span>
                </button>
                <p className="text-[11px] text-stone-400">
                  Ulasan Anda otomatis tersimpan &amp; tampil di web
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        {!hideFilter && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                      : 'bg-stone-900/80 text-stone-400 hover:text-white hover:bg-stone-800 border border-stone-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ulasan / gaun / nama..."
                className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:border-red-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

          </div>
        )}

        {/* Reviews Cards Grid */}
        {displayedList.length === 0 ? (
          <div className="text-center py-16 px-4 bg-stone-900/40 border border-stone-800 rounded-3xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
              <MessageCircleHeart className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Belum Ada Ulasan di Kategori Ini</h4>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Jadilah yang pertama memberikan testimoni pengalaman Anda bersama Senna Gallery!
              </p>
            </div>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Ulasan Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedList.map((item) => {
              const isExpanded = expandedReviews[item.id] || false;
              const isLong = item.comment.length > 170;
              const hasLiked = likedMap[item.id] || false;

              return (
                <div
                  key={item.id}
                  className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800/80 hover:border-amber-500/30 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/20 flex flex-col justify-between"
                >
                  {/* Card Header: Avatar, Name, Rating & Quote */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={
                              item.image ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                            }
                            alt={item.clientName}
                            className="w-12 h-12 rounded-2xl object-cover border border-stone-700 shadow-md group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          {item.isVerified !== false && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                            {item.clientName}
                          </h4>
                          <p className="text-[11px] text-stone-400 font-medium line-clamp-1">
                            {item.role || 'Penyewa Terverifikasi'}
                          </p>
                        </div>
                      </div>

                      <Quote className="w-7 h-7 text-stone-800 group-hover:text-amber-500/20 transition shrink-0" />
                    </div>

                    {/* Star Rating & Service Event Pill */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <div className="flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= Math.round(item.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-700'
                            }`}
                          />
                        ))}
                      </div>

                      {item.event && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700 line-clamp-1">
                          {item.event}
                        </span>
                      )}
                    </div>

                    {/* Testimonial Comment Text */}
                    <div className="text-xs text-stone-300 leading-relaxed space-y-1 mb-4">
                      <p className={!isExpanded && isLong ? 'line-clamp-4' : ''}>
                        "{item.comment}"
                      </p>
                      {isLong && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                        >
                          {isExpanded ? 'Lihat Lebih Sedikit' : 'Baca Selengkapnya...'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Date, Location, Likes & Admin Actions */}
                  <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                    <div className="flex items-center gap-2.5">
                      {item.location && (
                        <span className="flex items-center gap-1 text-stone-400">
                          <MapPin className="w-3 h-3 text-red-400" />
                          <span>{item.location}</span>
                        </span>
                      )}
                      <span className="text-stone-600">•</span>
                      <span className="text-stone-400">{item.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Helpful / Like Button */}
                      <button
                        type="button"
                        onClick={(e) => handleLike(item.id, e)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                          hasLiked
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40'
                            : 'bg-stone-800/70 hover:bg-stone-800 text-stone-400 hover:text-rose-400 border border-stone-700'
                        }`}
                        title="Tandai ulasan ini bermanfaat"
                      >
                        <Heart
                          className={`w-3 h-3 transition-transform ${
                            hasLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''
                          }`}
                        />
                        <span>{item.likesCount || 0}</span>
                      </button>

                      {/* Admin Quick Delete */}
                      {isAdminLoggedIn && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Hapus ulasan dari "${item.clientName}"?`)) {
                              deleteTestimonial(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900 border border-red-800/50 transition cursor-pointer"
                          title="Hapus ulasan (Admin)"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Interactive Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        defaultCategory={activeCategory}
      />

    </section>
  );
};
