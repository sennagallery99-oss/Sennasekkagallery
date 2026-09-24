import React from 'react';
import { SearchX, Sparkles, MessageCircle, RefreshCw, X, ArrowRight } from 'lucide-react';
import { ADMIN_WA_NUMBER } from '../../data/packagesData';

interface SearchNotFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSelectSuggestion: (query: string) => void;
  onResetSearch: () => void;
}

export const SearchNotFoundModal: React.FC<SearchNotFoundModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSelectSuggestion,
  onResetSearch,
}) => {
  if (!isOpen) return null;

  const popularSuggestions = [
    { label: 'Kebaya Pengantin', query: 'kebaya' },
    { label: 'Gaun Resepsi', query: 'gaun' },
    { label: 'Jas Slim Fit', query: 'jas' },
    { label: 'Tuxedo Hitam', query: 'tuxedo' },
    { label: 'Baju Adat Tradisional', query: 'adat' },
    { label: 'Aksesoris & Tiara', query: 'aksesoris' },
    { label: 'Kebaya Sage', query: 'sage' },
    { label: 'Beskap Sunda', query: 'beskap' },
  ];

  const handleWhatsAppConsult = () => {
    const text = `Halo Admin Senna MUA Gallery & Sekka Design, saya mencari busana "${searchQuery}" di katalog sewa tapi belum menemukan yang cocok. Apakah ada koleksi terbaru atau model serupa yang tersedia di studio?`;
    const url = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="not-found-modal-title"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 overflow-hidden transform transition-all animate-scale-in">
        
        {/* Decorative corner background element */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-rose-200/40 via-orange-100/30 to-transparent rounded-full blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Tutup Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          
          {/* Icon Badge */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-rose-50 border border-rose-100 text-red-600 flex items-center justify-center shadow-inner">
            <SearchX className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 animate-pulse" />
          </div>

          {/* Title & Query Display */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full inline-block">
              Pencarian Tidak Ditemukan
            </span>
            <h3 id="not-found-modal-title" className="text-lg sm:text-xl font-bold text-stone-900 leading-tight">
              Busana yang Dicari Belum Tersedia
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
              Kami tidak menemukan busana yang cocok untuk kata kunci:{' '}
              <strong className="text-stone-900 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/70 inline-block mt-1">
                "{searchQuery}"
              </strong>
            </p>
          </div>

          {/* Popular Suggestions Strip */}
          <div className="pt-2 text-left bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Rekomendasi Pencarian Populer:</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {popularSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onSelectSuggestion(item.query);
                    onClose();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-500 hover:text-white text-stone-700 text-xs font-semibold border border-slate-200 hover:border-transparent transition shadow-2xs cursor-pointer flex items-center gap-1 group"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            
            {/* Reset to see all catalog */}
            <button
              type="button"
              onClick={() => {
                onResetSearch();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Lihat Semua Koleksi Busana</span>
            </button>

            {/* Direct WhatsApp Ask Admin */}
            <button
              type="button"
              onClick={handleWhatsAppConsult}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Tanya Admin via WhatsApp untuk Model Ini</span>
            </button>

            {/* Change keyword button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-stone-400 hover:text-stone-600 transition cursor-pointer"
            >
              Ubah Kata Kunci Pencarian
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
