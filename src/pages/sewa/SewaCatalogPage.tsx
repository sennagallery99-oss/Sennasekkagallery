import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Sparkles, 
  Check, 
  MapPin, 
  Star, 
  ChevronRight, 
  RefreshCcw,
  ShieldCheck,
  Scissors,
  CheckCircle2,
  Crown,
  Shirt,
  Heart,
  SearchX,
  MessageCircle
} from 'lucide-react';
import { SEWA_CATEGORIES, SEWA_SIZES } from '../../data/sewaProductsData';
import { SewaProductCard } from '../../components/sewa/SewaProductCard';
import { SearchNotFoundModal } from '../../components/sewa/SearchNotFoundModal';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useSewaStore, getItemTimestamp } from '../../store/sewaStore';
import { ADMIN_WA_NUMBER } from '../../data/packagesData';

export const SewaCatalogPageContent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('kategori') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const products = useSewaStore((state) => state.products);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSize, setSelectedSize] = useState('All');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [filterBebasLaundry, setFilterBebasLaundry] = useState(false);
  const [filterFreeFitting, setFilterFreeFitting] = useState(false);
  const [filterDiscountOnly, setFilterDiscountOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'featured' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isNotFoundModalOpen, setIsNotFoundModalOpen] = useState(false);

  // Sync category & search params
  useEffect(() => {
    const cat = searchParams.get('kategori');
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    } else if (!cat && selectedCategory !== 'all') {
      setSelectedCategory('all');
    }

    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
      setSearchInput(q);
    } else if (searchQuery !== '') {
      setSearchQuery('');
      setSearchInput('');
    }
  }, [searchParams]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('kategori');
    } else {
      searchParams.set('kategori', catId);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handlePageSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = searchInput.trim();
    setSearchQuery(clean);
    if (clean) {
      searchParams.set('q', clean);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSize('All');
    setMinPrice('');
    setMaxPrice('');
    setFilterBebasLaundry(false);
    setFilterFreeFitting(false);
    setFilterDiscountOnly(false);
    setMinRating(0);
    setSortBy('featured');
    setIsNotFoundModalOpen(false);
    setSearchParams({}, { replace: true });
  };

  const handleSelectSuggestion = (suggestedQuery: string) => {
    setSearchInput(suggestedQuery);
    setSearchQuery(suggestedQuery);
    searchParams.set('q', suggestedQuery);
    setSearchParams(searchParams, { replace: true });
    setIsNotFoundModalOpen(false);
  };

  const handleResetSearchOnly = () => {
    setSearchInput('');
    setSearchQuery('');
    searchParams.delete('q');
    setSearchParams(searchParams, { replace: true });
    setIsNotFoundModalOpen(false);
  };

  // Filter & Sort Logic using dynamic products from store
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.filter((product) => {
      if (!product) return false;

      // 1. Search Query filter (tokenized, multiple words safe, searches code, name, description, material, category, colors, sizes)
      if (searchQuery.trim()) {
        const queryTokens = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
        
        const nameStr = (product.name || '').toLowerCase();
        const codeStr = (product.code || '').toLowerCase();
        const descStr = (product.description || '').toLowerCase();
        const materialStr = (product.material || '').toLowerCase();
        const catStr = (product.category || '').toLowerCase();
        const catLabelStr = (product.categoryLabel || '').toLowerCase();
        const locationStr = (product.location || '').toLowerCase();
        const fittingStr = (product.fittingNotes || '').toLowerCase();
        const inclusionsStr = Array.isArray(product.inclusions) ? product.inclusions.join(' ').toLowerCase() : '';
        const colorsStr = Array.isArray(product.colors) ? product.colors.join(' ').toLowerCase() : '';
        const sizesStr = Array.isArray(product.sizes) ? product.sizes.join(' ').toLowerCase() : '';

        const searchableText = `${nameStr} ${codeStr} ${descStr} ${materialStr} ${catStr} ${catLabelStr} ${locationStr} ${fittingStr} ${inclusionsStr} ${colorsStr} ${sizesStr}`;

        const matchesAllTokens = queryTokens.every(token => searchableText.includes(token));
        if (!matchesAllTokens) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && (product.category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // 3. Size filter
      if (selectedSize !== 'All') {
        const prodSizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['All Size'];
        if (!prodSizes.includes(selectedSize) && !prodSizes.includes('All Size')) {
          return false;
        }
      }

      // 4. Price range
      const price = typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0;
      if (minPrice !== '' && price < Number(minPrice)) {
        return false;
      }
      if (maxPrice !== '' && price > Number(maxPrice)) {
        return false;
      }

      // 5. Discount only
      if (filterDiscountOnly && (!product.discountPercent || product.discountPercent <= 0)) {
        return false;
      }

      // 6. Rating
      if (minRating > 0 && (product.rating || 0) < minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = typeof a.price === 'number' && !isNaN(a.price) ? a.price : 0;
      const priceB = typeof b.price === 'number' && !isNaN(b.price) ? b.price : 0;
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'featured') {
        const featDiff = (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        if (featDiff !== 0) return featDiff;
      }
      
      // Default / 'newest': Always prioritize highest timestamp first
      const timeA = getItemTimestamp(a);
      const timeB = getItemTimestamp(b);
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [products, searchQuery, selectedCategory, selectedSize, minPrice, maxPrice, filterDiscountOnly, minRating, sortBy]);

  const displayedProducts = filteredProducts;

  // Open "Search Not Found" modal automatically when user searches and 0 items match
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed && filteredProducts.length === 0 && Array.isArray(products) && products.length > 0) {
      setIsNotFoundModalOpen(true);
    }
  }, [searchQuery, filteredProducts.length, products.length]);

  const isAnyFilterActive =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedSize !== 'All' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    filterBebasLaundry ||
    filterFreeFitting ||
    filterDiscountOnly ||
    minRating > 0 ||
    sortBy !== 'featured';

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'kebaya': return <Shirt className="w-3.5 h-3.5 shrink-0" />;
      case 'jas': return <Scissors className="w-3.5 h-3.5 shrink-0" />;
      case 'gaun': return <Heart className="w-3.5 h-3.5 shrink-0" />;
      case 'aksesoris': return <Crown className="w-3.5 h-3.5 shrink-0" />;
      default: return <Sparkles className="w-3.5 h-3.5 shrink-0" />;
    }
  };

  const handleWhatsAppConsultGeneral = () => {
    const text = `Halo Admin Senna MUA Gallery & Sekka Design, saya sedang mencari busana "${searchQuery || 'koleksi terbaru'}" di katalog sewa. Apakah bisa dibantu rekomendasi yang cocok dan jadwal fitting?`;
    const url = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      
      {/* 1. BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/sewa" className="hover:text-red-600 transition">Beranda</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
        <Link to="/sewa/katalog" className="hover:text-red-600 transition">Fashion &amp; Wedding</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
        <span className="text-stone-900 font-bold">Katalog Sewa Busana</span>
      </nav>

      {/* 1.5. HORIZONTAL CATEGORY SLIDER */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider block px-1">
          Kategori Busana Pilihan
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SEWA_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white border-transparent shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-stone-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-stone-500'
                }`}>
                  {cat.id === 'all' 
                    ? products.length 
                    : products.filter(p => p.category === cat.id).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN LAYOUT: LEFT SIDEBAR FILTERS + RIGHT PRODUCT LIST */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-5 sticky top-28">
            
            {/* Header with Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-red-600" />
                Filter Busana
              </span>
              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Kategori List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Kategori Busana
              </span>
              <div className="space-y-1">
                {SEWA_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-rose-50 text-red-700 font-bold border border-rose-200'
                        : 'text-stone-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[10px] bg-slate-100 text-stone-500 px-2 py-0.5 rounded-full font-semibold">
                      {cat.id === 'all' 
                        ? products.length 
                        : products.filter(p => p.category === cat.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Studio Location Badge */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Lokasi Studio &amp; Pengiriman
              </span>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-stone-700">
                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                <div>
                  <span className="font-bold block text-stone-900">Bandar Lampung (Studio Senna)</span>
                  <span className="text-[10px] text-stone-400">Tersedia Fitting &amp; Kirim Instan</span>
                </div>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Rentang Harga Sewa
              </span>
              
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-semibold">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Harga Minimum"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:border-red-500 outline-hidden transition"
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-semibold">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Harga Maksimum"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:border-red-500 outline-hidden transition"
                  />
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => { setMinPrice(''); setMaxPrice(450000); }}
                    className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-stone-600 transition text-center cursor-pointer"
                  >
                    &lt; Rp 450rb
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMinPrice(450000); setMaxPrice(650000); }}
                    className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-stone-600 transition text-center cursor-pointer"
                  >
                    450rb - 650rb
                  </button>
                </div>
              </div>
            </div>

            {/* Size Chips */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Ukuran (Size)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SEWA_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedSize === size
                        ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-xs'
                        : 'bg-slate-100 text-stone-600 hover:bg-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Offers */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Penawaran Khusus
              </span>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterDiscountOnly}
                    onChange={(e) => setFilterDiscountOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <span>Diskon &amp; Promo Spesial</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterBebasLaundry}
                    onChange={(e) => setFilterBebasLaundry(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-600" /> Bebas Biaya Cuci
                  </span>
                </label>
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterFreeFitting}
                    onChange={(e) => setFilterFreeFitting(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <span className="flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5 text-red-600" /> Free Fitting Studio
                  </span>
                </label>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Rating Busana
              </span>
              <div className="space-y-1">
                {[
                  { value: 5, label: '⭐ 5 Bintang' },
                  { value: 4, label: '⭐ 4 Bintang ke atas' },
                  { value: 0, label: 'Semua Rating' },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setMinRating(r.value)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                      minRating === r.value ? 'bg-orange-50 text-orange-800 font-bold' : 'text-stone-600 hover:bg-slate-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* RIGHT COLUMN: SEARCH, SORT BAR & PRODUCT LIST */}
        <div className="flex-1 w-full space-y-4">
          
          {/* IN-PAGE DEDICATED SEARCH BAR */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
            <form onSubmit={handlePageSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari kebaya, gaun pesta, tuxedo, jas slim fit, baju adat..."
                className="w-full bg-slate-50 hover:bg-white focus:bg-white text-stone-900 text-xs sm:text-sm pl-4 pr-24 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition outline-hidden placeholder:text-stone-400 shadow-inner"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleResetSearchOnly}
                  className="absolute right-14 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-slate-200 transition cursor-pointer"
                  title="Hapus pencarian"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 py-2 px-3.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cari</span>
              </button>
            </form>

            {/* Quick Popular Keywords */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none text-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Tren:
              </span>
              {[
                { label: 'Kebaya Pengantin', q: 'kebaya' },
                { label: 'Jas Slim Fit', q: 'jas' },
                { label: 'Gaun Resepsi', q: 'gaun' },
                { label: 'Tuxedo', q: 'tuxedo' },
                { label: 'Baju Adat', q: 'adat' },
                { label: 'Aksesoris Tiara', q: 'aksesoris' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item.q)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    searchQuery.toLowerCase() === item.q.toLowerCase()
                      ? 'bg-red-50 text-red-700 border border-red-200 font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-stone-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Top Control Bar: Total found & Sort dropdown */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden p-2 bg-slate-100 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Filter className="w-4 h-4 text-red-600" />
                <span>Filter</span>
              </button>

              <div className="text-xs text-stone-600">
                Menampilkan <strong className="text-stone-900">{filteredProducts.length}</strong> busana untuk:{' '}
                <span className="font-semibold text-red-600">
                  {searchQuery ? `"${searchQuery}"` : selectedCategory === 'all' ? 'Semua Kategori' : selectedCategory}
                </span>
              </div>
            </div>

            {/* Sort options */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs text-stone-400 font-medium">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold text-stone-700 rounded-xl px-3 py-1.5 outline-hidden focus:border-red-500 cursor-pointer"
              >
                <option value="featured">Paling Sesuai / Rekomendasi</option>
                <option value="newest">Terbaru / New Arrival</option>
                <option value="price-asc">Harga Sewa: Terendah</option>
                <option value="price-desc">Harga Sewa: Tertinggi</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>

          </div>

          {/* ACTIVE FILTER PILLS */}
          {isAnyFilterActive && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] text-stone-400 font-medium shrink-0">Filter Aktif:</span>
              
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-red-700 text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
                  Kategori: {selectedCategory}
                  <button onClick={() => handleCategoryChange('all')} className="hover:text-red-900 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-red-700 text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
                  Kata Kunci: "{searchQuery}"
                  <button onClick={handleResetSearchOnly} className="hover:text-red-900 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}

              {selectedSize !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-red-700 text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
                  Size: {selectedSize}
                  <button onClick={() => setSelectedSize('All')} className="hover:text-red-900 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}

              {(minPrice !== '' || maxPrice !== '') && (
                <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-red-700 text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
                  Harga: {minPrice ? formatIDR(Number(minPrice)) : 'Rp 0'} - {maxPrice ? formatIDR(Number(maxPrice)) : 'Max'}
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:text-red-900 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-red-600 hover:underline font-bold whitespace-nowrap ml-1 cursor-pointer"
              >
                Hapus Semua Filter
              </button>
            </div>
          )}

          {/* PRODUCT GRID / NOT FOUND STATE */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center space-y-5 border border-slate-200 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-red-600 flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
                <SearchX className="w-8 h-8 text-red-600" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  {searchQuery 
                    ? `Tidak ada busana yang sesuai dengan "${searchQuery}"`
                    : 'Tidak ada busana yang cocok dengan filter yang dipilih'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                  Coba kurangi filter pencarian, periksa ejaan, atau gunakan kata kunci populer seperti "kebaya", "jas", "gaun pesta", atau "adat".
                </p>
              </div>

              {/* Action options */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl transition shadow-sm cursor-pointer active:scale-95"
                >
                  Lihat Semua Koleksi Busana
                </button>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setIsNotFoundModalOpen(true)}
                    className="bg-rose-50 hover:bg-rose-100 text-red-700 border border-rose-200 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Buka Saran &amp; Alternatif
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleWhatsAppConsultGeneral}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Tanya Admin WhatsApp</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {displayedProducts.map((product) => (
                  <SewaProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* MOBILE FILTER DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileFilterOpen(false)}></div>
          
          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-50 animate-slide-in-right">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-red-600" />
                Filter Busana
              </span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Tutup Filter"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* Kategori Busana */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Kategori Busana
                </span>
                <div className="space-y-1">
                  {SEWA_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-rose-50 text-red-700 font-bold border border-rose-200'
                          : 'text-stone-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(cat.id)}
                        <span>{cat.label}</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-stone-500 px-2 py-0.5 rounded-full font-semibold">
                        {cat.id === 'all' 
                          ? products.length 
                          : products.filter(p => p.category === cat.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rentang Harga Sewa */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Rentang Harga Sewa
                </span>
                <div className="space-y-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-semibold">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Harga Minimum"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:border-red-500 outline-hidden transition"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-semibold">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Harga Maksimum"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:border-red-500 outline-hidden transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => { setMinPrice(''); setMaxPrice(450000); }}
                      className="px-2 py-1.5 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-stone-600 transition text-center cursor-pointer"
                    >
                      &lt; Rp 450rb
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMinPrice(450000); setMaxPrice(650000); }}
                      className="px-2 py-1.5 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-stone-600 transition text-center cursor-pointer"
                    >
                      450rb - 650rb
                    </button>
                  </div>
                </div>
              </div>

              {/* Ukuran (Size) */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Ukuran (Size)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SEWA_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedSize === size
                          ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-xs'
                          : 'bg-slate-100 text-stone-600 hover:bg-slate-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Penawaran Khusus */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Penawaran Khusus
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterDiscountOnly}
                      onChange={(e) => setFilterDiscountOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <span>Diskon &amp; Promo Spesial</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterBebasLaundry}
                      onChange={(e) => setFilterBebasLaundry(e.target.checked)}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-orange-600" /> Bebas Biaya Cuci
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterFreeFitting}
                      onChange={(e) => setFilterFreeFitting(e.target.checked)}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <span className="flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5 text-red-600" /> Free Fitting Studio
                    </span>
                  </label>
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2.5 border border-slate-200 hover:border-red-500 text-stone-700 hover:text-red-600 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm text-center"
              >
                Terapkan ({filteredProducts.length})
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SEARCH NOT FOUND MODAL */}
      <SearchNotFoundModal
        isOpen={isNotFoundModalOpen}
        onClose={() => setIsNotFoundModalOpen(false)}
        searchQuery={searchQuery}
        onSelectSuggestion={handleSelectSuggestion}
        onResetSearch={handleResetSearchOnly}
      />

    </div>
  );
};

export const SewaCatalogPage: React.FC = () => {
  return (
    <ErrorBoundary 
      fallbackTitle="Kendala Memuat Katalog Busana" 
      fallbackMessage="Terjadi kendala saat memuat atau memfilter data katalog busana. Anda dapat me-refresh halaman atau mereset filter."
    >
      <SewaCatalogPageContent />
    </ErrorBoundary>
  );
};
