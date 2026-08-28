import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { GallerySection } from './components/GallerySection';
import { PackagesSection } from './components/PackagesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { Footer } from './components/Footer';
import { PackageItem } from './types';
import { Sparkles, X } from 'lucide-react';
import { ADMIN_WA_NUMBER } from './data/packagesData';

export default function App() {
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
            <HeroSection onExplorePackages={() => handleExplorePackages('all')} />
            <AboutSection />
            <ServicesSection onSelectCategory={handleExplorePackages} />
            <GallerySection onExplorePackages={() => handleExplorePackages('all')} />
            <TestimonialsSection />
            <FaqSection />
          </>
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
