import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SewaNavbar } from '../../components/sewa/SewaNavbar';
import { SewaFooter } from '../../components/sewa/SewaFooter';
import { SewaSplashScreen } from '../../components/sewa/SewaSplashScreen';
import { useSewaStore } from '../../store/sewaStore';
import { Sparkles, X } from 'lucide-react';
import { ADMIN_WA_NUMBER } from '../../data/packagesData';

export const SewaLayout: React.FC = () => {
  const location = useLocation();
  const toast = useSewaStore((state) => state.toast);
  const showToast = useSewaStore((state) => state.showToast);
  const webSettings = useSewaStore((state) => state.webSettings);
  const refreshDataLive = useSewaStore((state) => state.refreshDataLive);
  const waNumber = webSettings?.contactWhatsapp || ADMIN_WA_NUMBER;

  // Auto-sync web data with database on page mount
  useEffect(() => {
    refreshDataLive(false);
  }, []);

  // Show luxury splash screen every time user opens or enters Sewa web (including on back / re-entry)
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    // If navigation passes showSplash state, ensure it triggers
    if (location.state && (location.state as any).showSplash) {
      setShowSplash(true);
    }
  }, [location.state, location.pathname]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#212121] antialiased relative">
      {/* Luxury Animated Splash Screen */}
      {showSplash && (
        <SewaSplashScreen onComplete={handleSplashComplete} durationMs={2000} />
      )}

      {/* Toast Notification (Red & Orange Theme) */}
      {toast && (
        <aside
          aria-label="Notification"
          className="fixed top-20 right-4 z-[120] max-w-sm bg-white border border-rose-500/30 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3 animate-fade-in"
        >
          <div className="p-1.5 rounded-xl bg-rose-50 text-red-600 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs text-stone-800">
            <span className="font-bold block text-[11px] text-red-600">
              Senna Gallery Sewa Official
            </span>
            <p className="mt-0.5 text-stone-600">{toast.message}</p>
          </div>
          <button
            onClick={() => showToast('', 'info')}
            className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Persistent Navigation */}
      <SewaNavbar />

      {/* Main Outlet for Sewa sub-routes */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Persistent Footer */}
      <SewaFooter />

      {/* WhatsApp Floating Contact Button */}
      <a
        href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Admin Senna Gallery Sewa Official, saya ingin berkonsultasi mengenai ketersediaan busana kebaya/jas/gaun.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[100] bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white p-3.5 sm:p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        aria-label="Chat WhatsApp Admin"
      >
        {/* Animated radar rings behind button */}
        <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-45 group-hover:opacity-0 transition-opacity"></span>
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7 fill-current relative z-10"
          viewBox="0 0 24 24"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.407 9.862-9.83.001-2.628-1.02-5.1-2.871-6.955C16.612 1.975 14.138 1.954 12.01 1.954c-5.438 0-9.863 4.409-9.865 9.833-.001 1.744.471 3.447 1.365 4.966l-.999 3.648 3.73-.978zm11.567-5.282c-.313-.156-1.854-.915-2.131-1.015-.277-.1-.478-.15-.678.15-.2.3-.778.98-.952 1.18-.174.2-.347.225-.66.069-.313-.156-1.322-.486-2.518-1.553-.93-.829-1.558-1.854-1.74-2.165-.182-.313-.019-.481.137-.636.141-.139.313-.365.47-.547.156-.182.208-.313.313-.522.105-.208.052-.391-.026-.547-.078-.156-.678-1.634-.93-2.24-.244-.587-.492-.507-.678-.517-.174-.009-.373-.01-.572-.01-.2 0-.522.075-.796.373-.274.3-.1.952.1 2.165.2 1.216 1.196 2.392 1.354 2.6.158.208 2.35 3.59 5.69 5.03.795.343 1.416.548 1.901.703.8.254 1.528.218 2.103.132.64-.096 1.854-.759 2.115-1.453.26-.694.26-1.29.182-1.413-.077-.123-.277-.199-.59-.356z" />
        </svg>
      </a>
    </div>
  );
};

