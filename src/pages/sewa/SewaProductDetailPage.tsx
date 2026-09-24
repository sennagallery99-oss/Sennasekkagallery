import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Heart, 
  ShieldCheck, 
  Scissors, 
  Sparkles, 
  Check, 
  Phone, 
  Calendar, 
  Clock, 
  Star, 
  ChevronRight, 
  MapPin, 
  MessageCircle,
  CheckCircle2,
  Share2,
  HelpCircle,
  Plus,
  Minus,
  X,
  ZoomIn,
  ChevronLeft
} from 'lucide-react';
import { SEWA_STORE_INFO } from '../../data/sewaProductsData';
import { useSewaStore } from '../../store/sewaStore';
import { ADMIN_WA_NUMBER } from '../../data/packagesData';
import { SewaProductCard } from '../../components/sewa/SewaProductCard';
import { getProductStockForSize, getTotalProductStock } from '../../types/sewa';
import { formatDriveImageUrl } from '../../services/googleDriveService';
import { LazyImage } from '../../components/LazyImage';
import { useProductSEO } from '../../services/seoService';

export const SewaProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToCart = useSewaStore((state) => state.addToCart);
  const showToast = useSewaStore((state) => state.showToast);
  const products = useSewaStore((state) => state.products);

  const product = products.find((p) => p.id === id);

  // Dynamically update meta tags (title, description, canonical link, social cards, JSON-LD)
  useProductSEO(product);

  // If product not found
  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Busana Tidak Ditemukan</h2>
        <p className="text-stone-600 text-xs sm:text-sm">Produk busana yang Anda cari mungkin telah dipindah atau kodenya tidak sesuai.</p>
        <Link
          to="/sewa/katalog"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog Busana</span>
        </Link>
      </div>
    );
  }

  // Gallery of multiple images with Google Drive CDN formatting
  const galleryImages = Array.from(
    new Set([product.imageUrl, ...(product.additionalImages || [])].filter(Boolean))
  ).map((url) => formatDriveImageUrl(url));

  const [activeImage, setActiveImage] = useState<string>(formatDriveImageUrl(product.imageUrl));
  const [selectedSize, setSelectedSize] = useState<string>((product.sizes || [])[0] || 'All Size');
  const [selectedColor, setSelectedColor] = useState<string>((product.colors || [])[0] || 'Default');
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  useEffect(() => {
    if (product) {
      setActiveImage(formatDriveImageUrl(product.imageUrl));
      setSelectedSize((product.sizes || [])[0] || 'All Size');
      setSelectedColor((product.colors || [])[0] || 'Default');
      setQuantity(1);
    }
  }, [product]);

  // Stock calculations for selected size
  const availableStockForSize = getProductStockForSize(product, selectedSize);
  const totalStockAllSizes = getTotalProductStock(product);
  const isOutOfStock = availableStockForSize <= 0;

  const handleSelectSize = (sz: string) => {
    setSelectedSize(sz);
    const szStock = getProductStockForSize(product, sz);
    if (szStock > 0 && quantity > szStock) {
      setQuantity(szStock);
    } else if (szStock <= 0) {
      setQuantity(1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast(`Maaf, ukuran ${selectedSize} sedang habis. Silakan pilih ukuran lainnya.`, 'info');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleDirectRent = () => {
    if (isOutOfStock) {
      showToast(`Maaf, ukuran ${selectedSize} sedang habis. Silakan pilih ukuran lainnya.`, 'info');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('/sewa/keranjang');
  };

  const handleWhatsAppConsult = () => {
    const text = `Halo Official Stylist Senna Gallery Sewa, saya tertarik menyewa busana berikut:\n\n` +
      `• *Nama Busana*: ${product.name}\n` +
      `• *Kategori*: ${product.categoryLabel}\n` +
      `• *Ukuran*: ${selectedSize}\n` +
      `• *Warna*: ${selectedColor}\n` +
      `• *Harga Sewa*: ${product.priceFormatted}\n\n` +
      `Apakah busana ini ready untuk tanggal acara saya? Saya ingin konsultasi fitting di Studio Bandar Lampung.`;
    window.open(`https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Tautan produk berhasil disalin!', 'info');
  };

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* 1. BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 overflow-x-auto whitespace-nowrap">
        <Link to="/sewa" className="hover:text-red-600 transition">Beranda</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />
        <Link to="/sewa/katalog" className="hover:text-red-600 transition">Fashion &amp; Wedding</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />
        <Link to={`/sewa/katalog?kategori=${product.category}`} className="hover:text-red-600 transition">
          {product.categoryLabel}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />
        <span className="text-stone-900 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 2. 3-COLUMN PDP LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN 1: IMAGE GALLERY */}
        <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-28">
          
          {/* Big Photo Container */}
          <div 
            className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs cursor-pointer group"
            onClick={() => setIsLightboxOpen(true)}
            onMouseEnter={() => setIsZooming(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsZooming(false)}
            title="Klik untuk membuka galeri foto layar penuh"
          >
            <LazyImage
              src={activeImage}
              alt={product.name}
              priority
              imageSize={1000}
              sizes="(max-width: 1024px) 100vw, 40vw"
              containerClassName="w-full h-full"
              className={`w-full h-full object-cover object-center transition-transform duration-300 ${
                isZooming ? 'scale-[2.0]' : 'scale-100'
              }`}
              style={isZooming ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
            />
            {product.isNewArrival && (
              <span className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-xs z-10">
                New Arrival
              </span>
            )}
            {product.discountPercent && product.discountPercent > 0 && (
              <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded shadow-xs z-10">
                -{product.discountPercent}%
              </span>
            )}

            {/* Zoom Icon indicator */}
            <div className="absolute bottom-3 right-3 z-10 bg-black/60 backdrop-blur-xs text-white p-2 rounded-full opacity-80 group-hover:opacity-100 transition shadow">
              <ZoomIn className="w-4 h-4" />
            </div>
          </div>

          {/* Thumbnails (Multiple Angles / Details) */}
          {galleryImages.length > 1 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500 font-semibold">
                  Galeri Foto Busana:
                </span>
                <span className="text-orange-700 font-bold bg-orange-50 px-1.5 py-0.5 rounded text-[10px]">
                  {galleryImages.length} Sudut / Detail
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      activeImage === img ? 'border-red-600 ring-2 ring-red-500/30' : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <LazyImage
                      src={img}
                      alt={`Sudut ${idx + 1}`}
                      imageSize={150}
                      sizes="64px"
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Social actions & share */}
          <div className="pt-2 flex items-center justify-between text-xs text-stone-600 px-1">
            <button
              type="button"
              onClick={() => {
                setIsWishlisted(!isWishlisted);
                showToast(isWishlisted ? 'Dihapus dari favorit' : 'Disimpan ke favorit', 'info');
              }}
              className="flex items-center gap-1.5 hover:text-red-600 transition cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-600 text-red-600' : ''}`} />
              <span>{isWishlisted ? 'Tersimpan' : 'Tambah ke Wishlist'}</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-red-600 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan</span>
            </button>
          </div>

        </div>

        {/* COLUMN 2: PRODUCT INFORMATION */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Title & Official Badge */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded shadow-2xs">
                Senna Properties
              </span>
              <span className="text-[11px] text-orange-800 font-semibold bg-orange-50 px-2 py-0.5 rounded">
                {product.categoryLabel}
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-bold text-stone-900 leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Terjual count */}
            <div className="flex items-center gap-3 text-xs text-stone-500 pt-1">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-stone-800">{product.rating || 4.9}</span>
                <span className="text-stone-400">({product.reviewCount || 48} ulasan)</span>
              </div>
              <span>•</span>
              <span>Tersewa <strong>{product.totalRented || 95}+</strong> kali</span>
              <span>•</span>
              <span className="text-red-600 font-semibold">Ready Stock</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-stone-900">
                {formatIDR(product.price)}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                / periode sewa 3 hari
              </span>
            </div>

            {product.originalPrice && product.originalPrice > product.price && (
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-xs font-bold text-red-600 bg-rose-100 px-1.5 py-0.5 rounded">
                  Diskon {product.discountPercent}%
                </span>
                <span className="text-xs text-stone-400 line-through">
                  {formatIDR(product.originalPrice)}
                </span>
              </div>
            )}

            {/* Benefit pill */}
            <div className="pt-2 flex items-center gap-2">
              <span className="text-[11px] font-bold text-orange-900 bg-orange-100 border border-orange-300 px-2 py-0.5 rounded">
                {product.cashbackPill || 'Free Fitting Studio'}
              </span>
              <span className="text-[11px] text-stone-500">
                + Bebas Biaya Cuci (Free Dry Cleaning)
              </span>
            </div>
          </div>

          {/* Variant Selectors: Size & Color */}
          <div className="space-y-4 pt-2">
            
            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Pilih Ukuran: <span className="text-red-600">{selectedSize}</span>
                </span>
                <span className="text-[11px] text-orange-700 font-semibold bg-orange-50 px-2 py-0.5 rounded">
                  Total {totalStockAllSizes} Set Tersedia
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => {
                  const szStock = getProductStockForSize(product, sz);
                  const isSzOutOfStock = szStock <= 0;
                  const isSelected = selectedSize === sz;

                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleSelectSize(sz)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                        isSelected
                          ? 'border-red-600 bg-rose-50 text-red-600 ring-2 ring-red-500/20 shadow-xs'
                          : isSzOutOfStock
                          ? 'border-slate-200 bg-stone-100 text-stone-400 cursor-not-allowed opacity-60'
                          : 'border-slate-200 bg-white text-stone-700 hover:border-slate-400'
                      }`}
                    >
                      <span>{sz}</span>
                      <span className={`text-[10px] font-normal px-1 py-0.2 rounded ${
                        isSelected 
                          ? 'bg-rose-200/60 text-red-700 font-semibold' 
                          : isSzOutOfStock 
                          ? 'bg-stone-200 text-stone-500' 
                          : 'bg-slate-100 text-stone-500'
                      }`}>
                        {isSzOutOfStock ? 'Habis' : `${szStock} set`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Selector */}
            <div>
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
                Pilihan Warna: <span className="text-stone-600">{selectedColor}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {(product.colors || ['Default']).map((clr) => (
                  <button
                    key={clr}
                    type="button"
                    onClick={() => setSelectedColor(clr)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
                      selectedColor === clr
                        ? 'border-red-600 bg-rose-50 text-red-600 font-bold'
                        : 'border-slate-200 bg-white text-stone-700 hover:border-slate-400'
                    }`}
                  >
                    {clr}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Specifications & Description Tabs */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Detail &amp; Spesifikasi Busana
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-xs text-stone-600">
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-stone-400 block text-[10px]">Kondisi</span>
                <span className="font-bold text-stone-800">100% Steril &amp; Siap Pakai</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-stone-400 block text-[10px]">Material</span>
                <span className="font-bold text-stone-800">{product.material}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-stone-400 block text-[10px]">Durasi Standar</span>
                <span className="font-bold text-stone-800">3 Hari Sewa (Bisa Diperpanjang)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-stone-400 block text-[10px]">Jaminan Sewa</span>
                <span className="font-bold text-emerald-700">Tanpa Uang Deposit</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-800">Deskripsi:</h4>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* Inclusions */}
            {product.inclusions && product.inclusions.length > 0 && (
              <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-2">
                <h4 className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  Kelengkapan Paket yang Didapat:
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {product.inclusions.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Official Store Mini Banner */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 text-white flex items-center justify-center font-bold text-lg">
                  S
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-stone-900">{SEWA_STORE_INFO.name}</h4>
                    <span className="bg-gradient-to-r from-red-100 to-orange-100 text-red-800 text-[9px] font-bold px-1 rounded font-mono">
                      OFFICIAL
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-600" />
                    <span>{SEWA_STORE_INFO.studioAddress}</span>
                  </p>
                  <span className="text-[10px] text-orange-700 font-semibold">Online 5 menit lalu</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleWhatsAppConsult}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 border border-red-600 hover:bg-rose-50 transition cursor-pointer flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
            </div>

          </div>

        </div>

        {/* COLUMN 3: FLOATING CHECKOUT CARD */}
        <div className="lg:col-span-3 lg:sticky lg:top-28 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Atur Pemesanan Sewa
            </h3>

            {/* Selected item summary */}
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between text-stone-500">
                <span>Ukuran Terpilih:</span>
                <span className="font-bold text-stone-800 bg-slate-100 px-2 py-0.5 rounded">
                  Size {selectedSize}
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Warna Terpilih:</span>
                <span className="font-bold text-stone-800">{selectedColor}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Stok Ukuran Ini:</span>
                <span className={`font-bold ${isOutOfStock ? 'text-rose-600' : 'text-stone-800'}`}>
                  {isOutOfStock ? 'Stok Habis' : `${availableStockForSize} Set Ready`}
                </span>
              </div>
            </div>

            {/* Quantity Selector with Max Set Limit Enforcement */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700 block">Jumlah Set:</span>
                <span className="text-[11px] font-bold text-stone-500">
                  Maks. {availableStockForSize} Set
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white text-stone-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm shadow-2xs cursor-pointer transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="text-center">
                  <span className="text-xs font-bold text-stone-900">{quantity}</span>
                  <span className="text-[10px] text-stone-500 block leading-none mt-0.5">Set</span>
                </div>

                <button
                  type="button"
                  disabled={quantity >= availableStockForSize || isOutOfStock}
                  onClick={() => {
                    if (quantity < availableStockForSize) {
                      setQuantity(quantity + 1);
                    } else {
                      showToast(`Maksimal ${availableStockForSize} set untuk ukuran ${selectedSize}. Jika butuh set tambahan, silakan pilih variasi ukuran lainnya.`, 'info');
                    }
                  }}
                  className="w-8 h-8 rounded-lg bg-white text-stone-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm shadow-2xs cursor-pointer transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Requirement 4 Explanation: Jumlah set maksimal hanya sesuai dengan jumlah barang, kecuali jika ukurannya berbeda */}
              <p className="text-[10px] text-stone-500 leading-tight pt-1">
                *Jumlah set maksimal hanya sesuai dengan jumlah barang ({availableStockForSize} set untuk ukuran <strong>{selectedSize}</strong>), kecuali jika ukurannya berbeda.
              </p>
            </div>

            {/* Subtotal Calculation */}
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Subtotal Sewa:</span>
                <span className="text-base font-black text-stone-900">
                  {formatIDR(totalPrice)}
                </span>
              </div>
              <p className="text-[10px] text-orange-700 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3 text-red-600" /> Bebas Biaya Cuci &amp; Free Fitting Studio
              </p>
            </div>

            {/* Action Buttons: Add to Cart & Rent Now */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Ukuran Ini Sedang Habis' : '+ Keranjang Sewa'}</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleDirectRent}
                className="w-full bg-white hover:bg-rose-50 border border-red-600 text-red-600 disabled:border-stone-200 disabled:text-stone-400 disabled:hover:bg-white disabled:cursor-not-allowed py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
              >
                <span>{isOutOfStock ? 'Tidak Tersedia' : 'Sewa Langsung'}</span>
              </button>
            </div>

            {/* WhatsApp Direct Consult Button */}
            <button
              type="button"
              onClick={handleWhatsAppConsult}
              className="w-full pt-1 flex items-center justify-center gap-1.5 text-xs text-stone-500 hover:text-red-600 transition cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-orange-600" />
              <span>Kontak Admin via WhatsApp</span>
            </button>

          </div>
        </div>

      </div>

      {/* 3. RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Pilihan Busana Serupa Lainnya
            </h2>
            <Link to="/sewa/katalog" className="text-xs font-bold text-red-600 hover:underline">
              Lihat Semua →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((p) => (
              <SewaProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 4. FULLSCREEN HIGH RESOLUTION LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div 
            className="relative w-full max-w-4xl bg-[#141211] text-white rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col max-h-[92vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close (X) Button in Top-Right Corner */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Tutup Foto"
              className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 border border-white/20 shadow-lg cursor-pointer hover:scale-105 active:scale-95"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Top Info */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
              <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md">
                Senna Properties
              </span>
              {product.code && (
                <span className="bg-black/60 backdrop-blur-sm text-stone-200 text-[10px] font-mono font-bold px-2 py-1 rounded-full border border-white/10">
                  {product.code}
                </span>
              )}
            </div>

            {/* Main Stage */}
            <div className="relative w-full flex-1 min-h-[360px] sm:min-h-[500px] max-h-[68vh] bg-black/40 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
              <img
                src={activeImage}
                alt={product.name}
                className="max-h-[64vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
              />

              {/* Prev / Next Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const currIdx = galleryImages.indexOf(activeImage);
                      const prevIdx = (currIdx - 1 + galleryImages.length) % galleryImages.length;
                      setActiveImage(galleryImages[prevIdx]);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/15 transition cursor-pointer"
                    aria-label="Foto Sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currIdx = galleryImages.indexOf(activeImage);
                      const nextIdx = (currIdx + 1) % galleryImages.length;
                      setActiveImage(galleryImages[nextIdx]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/15 transition cursor-pointer"
                    aria-label="Foto Berikutnya"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Gallery Strip */}
            <div className="p-4 bg-stone-900 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      activeImage === img ? 'border-red-500 ring-2 ring-red-500/40 scale-105' : 'border-stone-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-stone-400">Harga Sewa</p>
                  <p className="text-sm font-extrabold text-white">{formatIDR(product.price || 0)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLightboxOpen(false);
                    handleAddToCart();
                  }}
                  disabled={isOutOfStock}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer ${
                    !isOutOfStock
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Habis' : '+ Tambah ke Keranjang'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
