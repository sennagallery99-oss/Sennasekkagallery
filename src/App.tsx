import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { GallerySection } from './components/GallerySection';
import { PackagesSection } from './components/PackagesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';
import { DashboardView } from './components/DashboardView';
import { AuthModal } from './components/AuthModal';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { Footer } from './components/Footer';
import { UserSession, BookingLog, PackageItem } from './types';
import { CheckCircle2, Sparkles, MessageCircle, X } from 'lucide-react';
import { ADMIN_WA_NUMBER } from './data/packagesData';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [user, setUser] = useState<UserSession | null>(null);
  const [bookingLogs, setBookingLogs] = useState<BookingLog[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRedirectPackageId, setAuthRedirectPackageId] = useState<string | undefined>(undefined);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Initialize session state from localStorage simulation
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('senna_user_session');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      const savedLogs = localStorage.getItem('senna_booking_logs');
      if (savedLogs) {
        setBookingLogs(JSON.parse(savedLogs));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenAuth = (redirectPackageId?: string) => {
    setAuthRedirectPackageId(redirectPackageId);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser: UserSession, redirectPkg?: PackageItem) => {
    setUser(authenticatedUser);
    localStorage.setItem('senna_user_session', JSON.stringify(authenticatedUser));
    setAuthModalOpen(false);

    if (redirectPkg) {
      // User came from clicking "Booking Sekarang" on a package:
      // Trigger automatic booking redirect to WhatsApp Admin with pre-filled message!
      showToast(`Login berhasil! Meneruskan booking "${redirectPkg.name}" ke WhatsApp Admin...`, 'success');
      
      const newLog: BookingLog = {
        id: 'book-' + Date.now(),
        packageId: redirectPkg.id,
        packageName: redirectPkg.name,
        price: redirectPkg.priceFormatted,
        createdAt: new Date().toISOString(),
        status: 'Pending WA'
      };

      const updatedLogs = [newLog, ...bookingLogs];
      setBookingLogs(updatedLogs);
      localStorage.setItem('senna_booking_logs', JSON.stringify(updatedLogs));

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      // Open WhatsApp
      setTimeout(() => {
        const clientName = authenticatedUser.nama_lengkap || 'Calon Pengantin';
        const textMessage = `Halo Admin Senna MUA Gallery & Sekka Design, saya ${clientName} ingin booking ${redirectPkg.name} (${redirectPkg.priceFormatted}). Mohon informasi jadwal ketersediaan tanggal dan jadwal konsultasi.`;
        const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(textMessage)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }, 700);

      setCurrentView('packages');
    } else {
      showToast(`Selamat datang kembali, ${authenticatedUser.nama_lengkap}!`, 'success');
      if (currentView === 'home') {
        setCurrentView('dashboard');
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('senna_user_session');
    showToast('Sesi login telah diakhiri (Logout berhasil).', 'info');
    if (currentView === 'dashboard') {
      setCurrentView('home');
    }
  };

  const handleTriggerBookingSuccess = (pkg: PackageItem) => {
    const newLog: BookingLog = {
      id: 'book-' + Date.now(),
      packageId: pkg.id,
      packageName: pkg.name,
      price: pkg.priceFormatted,
      createdAt: new Date().toISOString(),
      status: 'Pending WA'
    };

    const updatedLogs = [newLog, ...bookingLogs];
    setBookingLogs(updatedLogs);
    localStorage.setItem('senna_booking_logs', JSON.stringify(updatedLogs));

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}

    showToast(`Membuka WhatsApp Admin untuk ${pkg.name}...`, 'success');
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
            className="text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
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
            user={user}
            onOpenAuth={handleOpenAuth}
            onTriggerBookingSuccess={handleTriggerBookingSuccess}
            selectedCategoryFilter={selectedCategoryFilter}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            user={user}
            bookingLogs={bookingLogs}
            onLogout={handleLogout}
            onNavigateToPackages={() => {
              setCurrentView('packages');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAuth={() => handleOpenAuth()}
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

      {/* Auth Modal (Login / Register Simulation) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        redirectPackageId={authRedirectPackageId}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
