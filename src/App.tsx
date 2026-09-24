import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { SewaFeatureBanner } from './components/SewaFeatureBanner';
import { GallerySection } from './components/GallerySection';
import { PortfolioShowcase } from './components/PortfolioShowcase';
import { PackagesSection } from './components/PackagesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { SennaAIChatFloating } from './components/SennaAIChatFloating';
import { PackageItem } from './types';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { ADMIN_WA_NUMBER } from './data/packagesData';
import { initAutoCacheUpdater } from './services/cacheManager';
import { forceRefreshAllLiveStores } from './store/sewaStore';

// Sewa Rental Platform Pages - Core layout & Home
import { SewaLayout } from './pages/sewa/SewaLayout';
import { SewaHomePage } from './pages/sewa/SewaHomePage';

// Lazy-loaded pages for high-speed initial bundle loading
const SewaCatalogPage = lazy(() => import('./pages/sewa/SewaCatalogPage').then(m => ({ default: m.SewaCatalogPage })));
const SewaProductDetailPage = lazy(() => import('./pages/sewa/SewaProductDetailPage').then(m => ({ default: m.SewaProductDetailPage })));
const SewaRentalFlowPage = lazy(() => import('./pages/sewa/SewaRentalFlowPage').then(m => ({ default: m.SewaRentalFlowPage })));
const SewaCartPage = lazy(() => import('./pages/sewa/SewaCartPage').then(m => ({ default: m.SewaCartPage })));
const SewaPaymentPage = lazy(() => import('./pages/sewa/SewaPaymentPage').then(m => ({ default: m.SewaPaymentPage })));
const SewaAdminPage = lazy(() => import('./pages/sewa/SewaAdminPage').then(m => ({ default: m.SewaAdminPage })));
const SewaHistoryPage = lazy(() => import('./pages/sewa/SewaHistoryPage').then(m => ({ default: m.SewaHistoryPage })));

// Minimalist fast loading fallback
const PageLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-stone-400">
    <Loader2 className="w-7 h-7 animate-spin text-[#8E8271] mb-2" />
    <span className="text-xs tracking-wider uppercase font-semibold">Memuat Halaman...</span>
  </div>
);

// Main Studio View Wrapper
function MainStudioApp() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleTriggerBooking = (pkg: PackageItem) => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 }
      });
    } catch (e) {}

    showToast(`Membuka WhatsApp Admin untuk ${pkg.name}...`, 'success');

    // Create tailored message for the specific selected package
    const textMessage = `Halo Admin Senna MUA Gallery & Sekka Design, saya ingin booking / konsultasi:\n\n` +
      `• *Nama Paket*: ${pkg.name}\n` +
      `• *Kategori*: ${pkg.categoryLabel}\n` +
      `• *Investasi*: ${pkg.priceFormatted}\n` +
      `• *Tagline*: ${pkg.tagline}\n\n` +
      `Mohon informasi ketersediaan tanggal dan jadwal konsultasi/fitting busana pengantin di studio. Terima kasih!`;

    const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(textMessage)}`;
    
    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }, 300);
  };

  const handleExplorePackages = (category = 'all') => {
    setSelectedCategoryFilter(category);
    setCurrentView('packages');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2724] relative">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <aside aria-label="Notification" className="fixed top-24 right-4 z-50 max-w-md bg-white border border-[#D4AF37] rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-fade-in">
          <div className="p-1 rounded-full bg-[#FAF5EA] text-[#8C6608] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs text-stone-800">
            <span className="font-bold block text-[11px] uppercase tracking-wider text-[#8C6608]">
              Pemberitahuan Sistem
            </span>
            <p className="mt-0.5">{toastMessage.text}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <HeroSection 
              onExplorePackages={() => handleExplorePackages('all')}
              onExplorePortfolio={() => {
                setCurrentView('portfolio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <AboutSection />
            <ServicesSection onSelectCategory={handleExplorePackages} />
            
            {/* NEW FEATURE: Fitur Sewa Busana Banner linking to /sewa */}
            <SewaFeatureBanner />

            <GallerySection 
              onExplorePackages={() => handleExplorePackages('all')}
              onExplorePortfolio={() => {
                setCurrentView('portfolio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <TestimonialsSection />
            <FaqSection />
          </>
        )}

        {currentView === 'portfolio' && (
          <PortfolioShowcase 
            onNavigateToPackages={() => handleExplorePackages('all')}
          />
        )}

        {currentView === 'packages' && (
          <PackagesSection
            onTriggerBooking={handleTriggerBooking}
            selectedCategoryFilter={selectedCategoryFilter}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(view, hash) => {
          setCurrentView(view);
          if (hash) {
            setTimeout(() => {
              const el = document.getElementById(hash);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

      {/* WhatsApp Floating Hotline */}
      <WhatsAppFloatingButton />
    </div>
  );
}

export default function App() {
  // Auto-clear stale browser caches & trigger instant live update when user opens the website
  useEffect(() => {
    initAutoCacheUpdater(() => {
      forceRefreshAllLiveStores();
    });
  }, []);

  return (
    <>
      <ScrollToTop />
      <SennaAIChatFloating />
      <Routes>
        {/* Senna Gallery Sewa Platform Sub-routes */}
        <Route path="/sewa" element={<SewaLayout />}>
          <Route index element={<SewaHomePage />} />
          <Route path="katalog" element={<Suspense fallback={<PageLoadingFallback />}><SewaCatalogPage /></Suspense>} />
          <Route path="katalog/:id" element={<Suspense fallback={<PageLoadingFallback />}><SewaProductDetailPage /></Suspense>} />
          <Route path="cara-sewa" element={<Suspense fallback={<PageLoadingFallback />}><SewaRentalFlowPage /></Suspense>} />
          <Route path="keranjang" element={<Suspense fallback={<PageLoadingFallback />}><SewaCartPage /></Suspense>} />
          <Route path="pembayaran" element={<Suspense fallback={<PageLoadingFallback />}><SewaPaymentPage /></Suspense>} />
          <Route path="pembayaran/:orderId" element={<Suspense fallback={<PageLoadingFallback />}><SewaPaymentPage /></Suspense>} />
          <Route path="riwayat" element={<Suspense fallback={<PageLoadingFallback />}><SewaHistoryPage /></Suspense>} />
          <Route path="admin" element={<Suspense fallback={<PageLoadingFallback />}><SewaAdminPage /></Suspense>} />
        </Route>

        {/* Alias for case-insensitive URL requested by user: sennagallery.com/Sewa */}
        <Route path="/Sewa" element={<Navigate to="/sewa" replace />} />
        <Route path="/Sewa/*" element={<Navigate to="/sewa" replace />} />

        {/* Redirect /admin directly to /sewa/admin */}
        <Route path="/admin" element={<Navigate to="/sewa/admin" replace />} />
        <Route path="/admin/*" element={<Navigate to="/sewa/admin" replace />} />

        {/* Main Wedding Studio Website */}
        <Route path="/*" element={<MainStudioApp />} />
      </Routes>
    </>
  );
}
