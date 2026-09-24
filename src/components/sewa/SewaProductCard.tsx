import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, MapPin, Sparkles, Eye, X, ZoomIn, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { SewaProduct, getProductStockForSize } from '../../types/sewa';
import { useSewaStore } from '../../store/sewaStore';
import { formatDriveImageUrl } from '../../services/googleDriveService';
import { LazyImage } from '../LazyImage';

interface SewaProductCardProps {
  product: SewaProduct;
  onQuickView?: (product: SewaProduct) => void;
}

export const SewaProductCard: React.FC<SewaProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const safeSizes = Array.isArray(product.sizes) && product.sizes.length > 0 
    ? product.sizes 
    : ['S', 'M', 'L', 'XL', 'XXL'];
  const safeColors = Array.isArray(product.colors) && product.colors.length > 0 
    ? product.colors 
    : ['Default'];

  const [selectedSize, setSelectedSize] = useState<string>(safeSizes[0] || 'All Size');
  const [selectedColor] = useState<string>(safeColors[0] || 'Default');
  const [isHovered, setIsHovered] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const addToCart = useSewaStore((state) => state.addToCart);

  const sizeStockCount = getProductStockForSize(product, selectedSize);

  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (product.imageUrl) list.push(product.imageUrl);
    if (Array.isArray(product.additionalImages)) {
      product.additionalImages.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=800'];
  }, [product.imageUrl, product.additionalImages]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sizeStockCount > 0) {
      addToCart(product, selectedSize, selectedColor, 1);
    }
  };

  const formatIDR = (num: number) => {
    const val = typeof num === 'number' && !isNaN(num) ? num : 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const displayImage = isHovered && Array.isArray(product.additionalImages) && product.additionalImages.length > 1
    ? product.additionalImages[1]
    : (product.imageUrl || '');

  return (
    <>
      <div
        className="group bg-white rounded-2xl border border-slate-200 hover:border-orange-300 shadow-2xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 1. THUMBNAIL IMAGE - CLICKABLE TO OPEN HIGH-RES LIGHTBOX */}
        <div 
          className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer"
          onClick={() => {
            setActiveImageIdx(0);
            setIsImageModalOpen(true);
          }}
          title="Klik untuk melihat foto lebih besar"
        >
          <LazyImage
            src={displayImage}
            alt={product.name || 'Busana Senna'}
            containerClassName="w-full h-full"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            rootMargin="200px"
            imageSize={480}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Top Badges: Discount & Senna Properties (Renamed from Official Store) */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
            <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-xs tracking-wider">
              Senna Properties
            </span>
            {product.isFeatured && (
              <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Best Choice
              </span>
            )}
          </div>

          {/* Top Right: Discount Percent Pill */}
          {product.discountPercent && product.discountPercent > 0 && (
            <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
              <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                -{product.discountPercent}%
              </span>
            </div>
          )}

          {/* Bottom Left Badge: Bebas Laundry & Dry Clean */}
          <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
            <span className="bg-white/90 backdrop-blur-xs border border-orange-200 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              Bebas Laundry
            </span>
          </div>

          {/* Hover Overlay with View Zoom Icon & View Detail */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2 flex-wrap">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIdx(0);
                setIsImageModalOpen(true);
              }}
              className="bg-white/95 text-stone-900 hover:bg-white hover:text-red-600 p-2 rounded-full shadow-lg transition active:scale-95 cursor-pointer"
              title="Perbesar Foto"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <Link
              to={`/sewa/katalog/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-3 py-1.5 rounded-full text-[11px] font-bold shadow-lg flex items-center gap-1 transition active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Detail</span>
            </Link>
          </div>
        </div>

        {/* 2. PRODUCT INFO */}
        <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
          
          <div>
            {/* Title */}
            <Link to={`/sewa/katalog/${product.id}`} className="block">
              <h3 className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-red-600 transition line-clamp-1 leading-snug">
                {product.name || 'Busana Senna Gallery'}
              </h3>
            </Link>

            {/* Item Code (Square block styling under title) */}
            {product.code && (
              <div className="mt-1 flex">
                <span className="inline-block bg-slate-100 text-stone-800 border border-slate-200 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {product.code}
                </span>
              </div>
            )}

            {/* Pricing Section */}
            <div className="mt-1.5">
              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-bold text-stone-900">
                  {formatIDR(product.price || 0)}
                </span>
                <span className="text-[10px] text-stone-500 font-normal">
                  / 3 hari
                </span>
              </div>

              {product.originalPrice && product.originalPrice > (product.price || 0) && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold text-red-600 bg-rose-50 px-1 rounded">
                    {product.discountPercent || Math.round((1 - (product.price || 0) / product.originalPrice) * 100)}%
                  </span>
                  <span className="text-[11px] text-stone-400 line-through">
                    {formatIDR(product.originalPrice)}
                  </span>
                </div>
              )}
            </div>

            {/* Cashback / Fitting Pill */}
            <div className="mt-1.5 flex items-center gap-1">
              <span className="text-[10px] font-semibold text-orange-800 bg-orange-50 border border-orange-200/70 px-1.5 py-0.2 rounded">
                {product.cashbackPill || 'Free Fitting Studio'}
              </span>
            </div>

            {/* Location & Seller Badge */}
            <div className="mt-2 flex items-center gap-1 text-[11px] text-stone-500">
              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="truncate">{product.location || 'Bandar Lampung'}</span>
            </div>

            {/* Rating & Tersewa count */}
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-500">
              <div className="flex items-center gap-0.5 text-amber-500">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-bold text-stone-700">{product.rating || 4.9}</span>
              </div>
              <span>•</span>
              <span>Tersewa {product.totalRented || 80}+</span>
            </div>
          </div>

          {/* 3. SIZE SELECTOR & ADD TO CART ACTION */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
            
            {/* Status Keterangan & Jumlah Stok */}
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Status:</span>
              {sizeStockCount > 0 ? (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Available ({sizeStockCount} set)
                </span>
              ) : (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Disewa / Habis
                </span>
              )}
            </div>

            {/* Quick Size Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              <span className="text-[10px] text-stone-400 font-medium shrink-0 mr-0.5">Size:</span>
              {safeSizes.map((sz) => {
                const stock = getProductStockForSize(product, sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition shrink-0 cursor-pointer ${
                      selectedSize === sz
                        ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-sm'
                        : stock > 0
                          ? 'bg-slate-100 text-stone-600 hover:bg-slate-200'
                          : 'bg-stone-50 text-stone-300 line-through border border-dashed border-stone-100'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>

            {/* Red & Orange Action Button "+ Keranjang" */}
            <button
              type="button"
              disabled={sizeStockCount === 0}
              onClick={handleAddToCart}
              className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                sizeStockCount > 0
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 hover:from-red-700 hover:to-orange-600 active:scale-[0.98] text-white'
                  : 'bg-slate-100 text-stone-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{sizeStockCount > 0 ? '+ Keranjang' : 'Habis Tersewa'}</span>
            </button>

          </div>

        </div>
      </div>

      {/* 4. HIGH RESOLUTION IMAGE VIEWER MODAL (LIGHTBOX WITH TOP-RIGHT 'X' CLOSE BUTTON) */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-2xl bg-[#161413] text-white rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col max-h-[92vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close (X) Button Prominently in Top Right Corner */}
            <button
              type="button"
              onClick={() => setIsImageModalOpen(false)}
              aria-label="Tutup Foto"
              className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 border border-white/20 shadow-lg cursor-pointer hover:scale-105 active:scale-95"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Top Badge Info */}
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

            {/* Main Image Stage */}
            <div className="relative w-full flex-1 min-h-[300px] sm:min-h-[420px] max-h-[60vh] bg-black/40 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
              <img
                src={allImages[activeImageIdx] || allImages[0]}
                alt={product.name}
                className="max-h-[56vh] w-auto max-w-full object-contain rounded-2xl transition-all duration-300 shadow-2xl"
              />

              {/* Prev / Next Image Navigation (if multiple images exist) */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImageIdx((prev) => (prev - 1 + allImages.length) % allImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/15 transition cursor-pointer"
                    aria-label="Foto Sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageIdx((prev) => (prev + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/15 transition cursor-pointer"
                    aria-label="Foto Berikutnya"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Bar: Thumbnails & Actions */}
            <div className="p-4 sm:p-5 bg-stone-900 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Product Info & Thumbnails */}
              <div className="space-y-2 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                    {product.name}
                  </h4>
                  <span className="text-red-400 font-extrabold text-sm sm:text-base shrink-0">
                    {formatIDR(product.price || 0)} <span className="text-xs font-normal text-stone-400">/ 3 hari</span>
                  </span>
                </div>

                {/* Additional Images Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIdx(idx)}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                          activeImageIdx === idx ? 'border-red-500 scale-105' : 'border-stone-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Sudut ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsImageModalOpen(false);
                    navigate(`/sewa/katalog/${product.id}`);
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Lihat Detail</span>
                </button>

                <button
                  type="button"
                  disabled={sizeStockCount === 0}
                  onClick={(e) => {
                    handleAddToCart(e);
                    setIsImageModalOpen(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer ${
                    sizeStockCount > 0
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>+ Keranjang</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};

