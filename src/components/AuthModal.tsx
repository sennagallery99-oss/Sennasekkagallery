import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  KeyRound,
  Code
} from 'lucide-react';
import { UserSession, PackageItem } from '../types';
import { PACKAGES_DATA } from '../data/packagesData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPackageId?: string;
  onAuthSuccess: (user: UserSession, redirectPkg?: PackageItem) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  redirectPackageId,
  onAuthSuccess
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [emailHp, setEmailHp] = useState('');
  const [password, setPassword] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const targetPackage = redirectPackageId 
    ? PACKAGES_DATA.find((p) => p.id === redirectPackageId)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Basic Input Validations (mimicking PHP auth.php sanitize and validations)
    const cleanedInput = emailHp.trim();
    if (!cleanedInput) {
      setErrorMessage('Silakan masukkan Email atau Nomor WhatsApp / HP.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password minimal 6 karakter demi keamanan akun.');
      return;
    }

    setIsLoading(true);

    // Simulate PHP backend process (password_hash & session_start)
    setTimeout(() => {
      setIsLoading(false);

      const fakeSessionUser: UserSession = {
        id: Math.floor(Math.random() * 9000) + 1000,
        email_hp: cleanedInput,
        nama_lengkap: tab === 'register' ? (namaLengkap || 'Calon Pengantin') : (cleanedInput.includes('@') ? cleanedInput.split('@')[0] : 'Calon Pengantin'),
        logged_at: new Date().toISOString()
      };

      // Call onAuthSuccess with the user session and redirect target package!
      onAuthSuccess(fakeSessionUser, targetPackage || undefined);
    }, 600);
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-black/15 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Bar */}
        <div className="h-1.5 bg-[#1A1A1A]"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-[#8E8271] text-[10px] uppercase font-semibold tracking-[0.35em] block mb-1">
              Portal Booking Pengantin
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A1A1A]">
              {tab === 'login' ? 'Masuk ke Akun Anda' : 'Daftar Akun Pengantin'}
            </h3>
            
            {/* Redirect Notice Memory Alert */}
            {targetPackage ? (
              <div className="mt-3 p-3.5 rounded-xl bg-[#F5F2ED] border border-black/10 text-left flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#8E8271] shrink-0 mt-0.5" />
                <div className="text-xs text-stone-800">
                  <span className="font-semibold block text-[10px] uppercase tracking-wider text-[#8E8271]">Paket yang ingin di-booking:</span>
                  <span className="font-serif font-normal text-[#1A1A1A] text-sm">{targetPackage.name}</span> ({targetPackage.priceFormatted})
                  <p className="text-[10px] text-stone-500 font-light mt-0.5">
                    *Setelah masuk/daftar, Anda akan otomatis diteruskan ke WhatsApp Admin untuk paket ini.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500 mt-1 font-light">
                Masuk untuk menyimpan riwayat konsultasi dan direct checkout WhatsApp.
              </p>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tab Switcher (Login / Register) */}
          <div className="flex rounded-full bg-stone-100 p-1 mb-6 text-xs font-semibold">
            <button
              type="button"
              id="tab-login-btn"
              onClick={() => {
                setTab('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-full transition-all cursor-pointer text-[11px] uppercase tracking-wider ${
                tab === 'login'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              id="tab-register-btn"
              onClick={() => {
                setTab('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-full transition-all cursor-pointer text-[11px] uppercase tracking-wider ${
                tab === 'register'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Daftar (Register)
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Nama Lengkap Calon Pengantin
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    placeholder="contoh: Annisa &amp; Dimas"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Email atau Nomor WhatsApp / HP
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={emailHp}
                  onChange={(e) => setEmailHp(e.target.value)}
                  placeholder="contoh: sennagallery99@gmail.com / 082122030072"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Password {tab === 'register' && <span className="text-stone-400 font-light">(Min. 6 Karakter)</span>}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password rahasia Anda"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Demo Fill Helper */}
            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 font-light">
              <span>Demo cepat:</span>
              <button
                type="button"
                onClick={() => {
                  setEmailHp('sennagallery99@gmail.com');
                  setPassword('admin1234');
                  setNamaLengkap('Annisa Putri');
                }}
                className="text-stone-900 hover:underline font-semibold cursor-pointer"
              >
                Isi Data Pengujian Otomatis
              </button>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1A1A1A] hover:bg-black text-white font-semibold text-xs uppercase tracking-[0.18em] py-3.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Memproses Sesi...</span>
              ) : (
                <>
                  <span>{tab === 'login' ? 'Masuk & Lanjutkan' : 'Daftar & Booking'}</span>
                  <ArrowRight className="w-4 h-4 text-[#8E8271]" />
                </>
              )}
            </button>
          </form>

          {/* PHP Backend Architecture Note for Developer */}
          <div className="mt-6 pt-4 border-t border-black/10 flex items-start gap-2 text-[10px] text-stone-500 font-light">
            <Code className="w-3.5 h-3.5 text-[#8E8271] shrink-0 mt-0.5" />
            <span>
              <strong>Hostinger PHP Stack:</strong> Menggunakan <code>$_SESSION['user']</code>, sanitasi <code>filter_var()</code>, PDO prepared statements, dan <code>password_hash($pass, PASSWORD_BCRYPT)</code>.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
