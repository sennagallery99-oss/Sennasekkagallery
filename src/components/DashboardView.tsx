import React, { useState } from 'react';
import { 
  UserSession, 
  BookingLog, 
  PackageItem 
} from '../types';
import { 
  User, 
  ShieldCheck, 
  ShoppingBag, 
  MessageCircle, 
  LogOut, 
  Sparkles, 
  Calendar, 
  Gift, 
  ArrowRight,
  Clock,
  Heart,
  Phone,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { ADMIN_WA_NUMBER, PACKAGES_DATA } from '../data/packagesData';

interface DashboardViewProps {
  user: UserSession | null;
  bookingLogs: BookingLog[];
  onLogout: () => void;
  onNavigateToPackages: () => void;
  onOpenAuth: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  bookingLogs,
  onLogout,
  onNavigateToPackages,
  onOpenAuth
}) => {
  const [weddingDate, setWeddingDate] = useState<string>('2026-11-20');

  // If user is not logged in, show protected access screen (mimicking PHP session guard)
  if (!user) {
    return (
      <div className="py-24 bg-[#F5F2ED] min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center border border-black/10 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-900 flex items-center justify-center mx-auto mb-4 border border-black/10">
            <ShieldCheck className="w-8 h-8 text-[#8E8271]" />
          </div>
          <h2 className="font-serif text-2xl font-normal text-[#1A1A1A] mb-2">
            Halaman Dashboard Terproteksi
          </h2>
          <p className="text-xs text-stone-600 mb-6 font-light leading-relaxed">
            Halaman ini membutuhkan sesi login aktif (<code>$_SESSION['user']</code>). Anda belum masuk ke sistem.
          </p>
          <button
            onClick={() => onOpenAuth()}
            className="w-full bg-[#1A1A1A] hover:bg-black text-white font-semibold text-xs uppercase tracking-[0.18em] py-3.5 rounded-full shadow-xs transition"
          >
            Masuk / Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  // Calculate days remaining to wedding date
  const calculateDaysLeft = () => {
    if (!weddingDate) return 0;
    const target = new Date(weddingDate).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysLeft = calculateDaysLeft();

  return (
    <div id="user-dashboard-container" className="py-16 bg-[#F5F2ED] min-h-[85vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Banner */}
        <div className="bg-[#141312] text-white rounded-2xl p-8 sm:p-10 mb-10 shadow-xl border border-white/10 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-[#E5E1DA] text-[10px] font-light uppercase tracking-[0.25em] mb-2 border border-white/10">
                <Sparkles className="w-3 h-3 text-[#8E8271]" />
                <span>Portal Calon Pengantin Senna &amp; Sekka</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-wide">
                Selamat Datang, {user.nama_lengkap}!
              </h1>
              <p className="text-xs sm:text-sm text-stone-400 mt-2 font-light flex items-center gap-2">
                <span>ID Akun: #{user.id}</span>
                <span>•</span>
                <span>Kontak Terdaftar: <strong className="text-stone-200 font-normal">{user.email_hp}</strong></span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onNavigateToPackages}
                className="bg-white text-[#1A1A1A] hover:bg-stone-100 text-xs font-semibold uppercase tracking-wider px-5 py-3 rounded-full transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#8E8271]" />
                <span>Eksplor Katalog Paket</span>
              </button>

              <button
                onClick={onLogout}
                className="bg-white/5 hover:bg-white/15 border border-white/20 text-white text-xs font-light tracking-wider uppercase px-4 py-3 rounded-full transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Sesi</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Overview Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Card 1: WhatsApp Hotline Status */}
          <div className="bg-white rounded-2xl p-6 border border-black/10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#F5F2ED] text-stone-900 border border-black/5 flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5 text-[#8E8271]" />
              </div>
              <h3 className="font-serif text-lg font-normal text-[#1A1A1A] mb-1">
                WhatsApp Admin Terhubung
              </h3>
              <p className="text-xs text-stone-500 font-light mb-4 leading-relaxed">
                Akun Anda telah tersinkronisasi. Klik booking di paket mana saja untuk auto-chat format detail.
              </p>
            </div>
            <a
              href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin,%20saya%20${encodeURIComponent(user.nama_lengkap)}%20ingin%20konsultasi%20jadwal%20wedding`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#1A1A1A] font-semibold hover:underline flex items-center gap-1 uppercase tracking-wider text-[11px]"
            >
              <span>Chat Admin (+62 821-2203-0072)</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8E8271]" />
            </a>
          </div>

          {/* Card 2: Wedding Countdown */}
          <div className="bg-white rounded-2xl p-6 border border-black/10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#F5F2ED] text-stone-900 border border-black/5 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5 text-[#8E8271]" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">
                  Hitung Mundur Hari H
                </h3>
                <span className="font-serif text-2xl font-normal text-[#1A1A1A]">
                  {daysLeft} Hari
                </span>
              </div>
              <p className="text-xs text-stone-500 font-light mb-3">
                Atur tanggal rencana pernikahan Anda:
              </p>
            </div>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-700 focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
            />
          </div>

          {/* Card 3: Exclusive Promo Voucher */}
          <div className="bg-white rounded-2xl p-6 border border-black/10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#F5F2ED] text-stone-900 border border-black/5 flex items-center justify-center mb-4">
                <Gift className="w-5 h-5 text-[#8E8271]" />
              </div>
              <h3 className="font-serif text-lg font-normal text-[#1A1A1A] mb-1">
                Voucher Bonus 2026
              </h3>
              <p className="text-xs text-stone-500 font-light mb-2 leading-relaxed">
                Gunakan kode voucher saat konfirmasi WhatsApp untuk klaim Free Terrarium Ring Box.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F5F2ED] border border-black/10 flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[#1A1A1A] tracking-widest">SENNAWED2026</span>
              <span className="text-[10px] text-stone-500 font-light uppercase tracking-wider">Tersedia</span>
            </div>
          </div>

        </div>

        {/* Recent Booking Requests / Inquiries Table */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/10 shadow-xs mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl font-normal text-[#1A1A1A]">
                Riwayat Pengajuan Booking &amp; Konsultasi
              </h2>
              <p className="text-xs text-stone-500 font-light mt-1">
                Daftar paket yang telah Anda ajukan via WhatsApp Admin Senna MUA Gallery &amp; Sekka Design.
              </p>
            </div>

            <button
              onClick={onNavigateToPackages}
              className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>+ Booking Paket Baru</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8E8271]" />
            </button>
          </div>

          {bookingLogs.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-stone-200 rounded-xl bg-[#F5F2ED]/50">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-600 font-normal">
                Belum ada riwayat booking dalam sesi ini.
              </p>
              <p className="text-[11px] text-stone-400 font-light mt-1">
                Silakan jelajahi daftar paket dan klik 'Booking Sekarang'.
              </p>
              <button
                onClick={onNavigateToPackages}
                className="mt-4 text-xs font-semibold uppercase tracking-wider bg-[#1A1A1A] hover:bg-black text-white px-5 py-2.5 rounded-full shadow-xs transition"
              >
                Pilih Paket Wedding
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-widest text-[10px]">
                    <th className="pb-3 font-medium">Nama Paket</th>
                    <th className="pb-3 font-medium">Total Harga</th>
                    <th className="pb-3 font-medium">Waktu Pengajuan</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {bookingLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3.5 font-medium text-[#1A1A1A]">
                        {log.packageName}
                      </td>
                      <td className="py-3.5 font-semibold text-[#1A1A1A]">
                        {log.price}
                      </td>
                      <td className="py-3.5 text-stone-500 font-light">
                        {new Date(log.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200 text-[10px] font-medium">
                          <CheckCircle2 className="w-3 h-3 text-[#8E8271]" />
                          <span>{log.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <a
                          href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin,%20saya%20${encodeURIComponent(user.nama_lengkap)}%20ingin%20follow%20up%20booking%20${encodeURIComponent(log.packageName)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1A1A1A] hover:underline font-semibold flex items-center justify-end gap-1"
                        >
                          <span>Chat Ulang WA</span>
                          <MessageCircle className="w-3 h-3 text-[#8E8271]" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recommended Packages Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/10 shadow-xs">
          <h3 className="font-serif text-xl font-normal text-[#1A1A1A] mb-4">
            Rekomendasi Paket Lainnya untuk Anda
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PACKAGES_DATA.slice(0, 2).map((pkg) => (
              <div key={pkg.id} className="p-4 rounded-xl bg-[#F5F2ED] border border-black/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={pkg.image} alt={pkg.name} className="w-14 h-14 rounded-lg object-cover" />
                  <div>
                    <h4 className="font-serif font-normal text-[#1A1A1A] text-sm">{pkg.name}</h4>
                    <span className="text-xs font-semibold text-[#8E8271]">{pkg.priceFormatted}</span>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin,%20saya%20${encodeURIComponent(user.nama_lengkap)}%20mau%20booking%20${encodeURIComponent(pkg.name)}%20(${pkg.priceFormatted})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full transition shrink-0"
                >
                  Booking WA
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
