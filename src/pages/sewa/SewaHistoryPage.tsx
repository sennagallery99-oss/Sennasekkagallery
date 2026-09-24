import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  History, 
  User, 
  Lock, 
  ArrowRight, 
  ChevronRight, 
  Calendar, 
  Printer, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageCircle, 
  Phone,
  LogOut,
  ShoppingBag,
  ExternalLink,
  Download,
  Search,
  KeyRound
} from 'lucide-react';
import { useSewaStore } from '../../store/sewaStore';
import { formatDriveImageUrl } from '../../services/googleDriveService';
import { generateSewaReceiptPDF } from '../../services/pdfService';
import { STUDIO_INFO, ADMIN_WA_NUMBER } from '../../data/packagesData';

export const SewaHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    loginSimpleUser, 
    logout, 
    getUserOrders, 
    showToast,
    orders,
    registeredUsers
  } = useSewaStore();

  const [loginMode, setLoginMode] = useState<'credentials' | 'quickSearch'>('credentials');
  const [usernameInput, setUsernameInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [quickSearchInput, setQuickSearchInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [lookupResults, setLookupResults] = useState<typeof orders | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !pinInput.trim()) {
      showToast('Harap isi username dan PIN kode login Anda.', 'info');
      return;
    }

    setIsLoggingIn(true);
    const success = loginSimpleUser(usernameInput, pinInput);
    setIsLoggingIn(false);

    if (!success) {
      showToast('Username atau PIN login salah. Silakan periksa kembali.', 'info');
    }
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickSearchInput.trim();
    if (!query) {
      showToast('Masukkan Nomor WhatsApp atau ID Pesanan Anda.', 'info');
      return;
    }

    const cleanQuery = query.replace(/\D/g, ''); // digits only for phone
    const cleanId = query.toLowerCase();

    // Match in orders
    const matched = orders.filter((o) => {
      const matchId = o.id.toLowerCase().includes(cleanId);
      const matchPhone = cleanQuery.length >= 6 && o.userPhone.replace(/\D/g, '').includes(cleanQuery);
      return matchId || matchPhone;
    });

    if (matched.length > 0) {
      setLookupResults(matched);
      showToast(`Ditemukan ${matched.length} pesanan sewa!`, 'success');
    } else {
      setLookupResults([]);
      showToast('Tidak ada pesanan yang sesuai dengan nomor atau ID tersebut.', 'info');
    }
  };

  const handleLogout = () => {
    logout();
    setUsernameInput('');
    setPinInput('');
    setLookupResults(null);
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const displayedOrders = currentUser ? getUserOrders() : (lookupResults || []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/sewa" className="hover:text-red-600 transition">Beranda</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
        <span className="text-stone-900 font-bold">Riwayat Sewa Saya</span>
      </nav>

      {/* 2. HEADER */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-red-600" />
          <span>Riwayat &amp; Status Penyewaan</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-light">
          Pantau status fitting, verifikasi pembayaran, dan cetak bukti penyewaan resmi Anda di sini.
        </p>
      </div>

      {/* 3. MAIN SECTION */}
      {!currentUser && lookupResults === null ? (
        /* NOT LOGGED IN: Tabbed Login & Quick Search */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs max-w-md mx-auto overflow-hidden">
          {/* Mode Switcher */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => setLoginMode('credentials')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'credentials'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-red-600" />
              <span>Login Akun / PIN</span>
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('quickSearch')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'quickSearch'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-red-600" />
              <span>Cek No. WA / ID</span>
            </button>
          </div>

          {loginMode === 'credentials' ? (
            <div>
              <div className="p-5 sm:p-6 bg-[#FFFBF8] border-b border-orange-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-stone-900">Masuk Akun Sewa</h2>
                  <p className="text-[11px] text-stone-500 font-light">
                    Gunakan kredensial yang dibuat otomatis setelah checkout terakhir Anda.
                  </p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="p-5 sm:p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">
                    Username Akun
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SarahNadia#8X4KD"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-red-500 outline-hidden"
                  />
                  <span className="text-[10px] text-stone-400 font-light block leading-relaxed">
                    *Menggunakan format [NamaTanpaSpasi]#[5KodeUnik].
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">
                    Kode PIN Login (5 Karakter)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: K9X2P"
                    maxLength={5}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-red-500 outline-hidden font-mono uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold py-3 rounded-xl transition shadow-sm hover:opacity-95 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  <span>{isLoggingIn ? 'Memvalidasi...' : 'Masuk &amp; Lihat Riwayat'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-4 border-t border-slate-100 text-center space-y-2">
                  <p className="text-[10px] text-stone-400">
                    Lupa PIN? Anda juga bisa menggunakan tab <strong>Cek No. WA / ID</strong> di atas atau hubungi admin.
                  </p>
                  <a
                    href={`https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent('Halo Admin Senna Gallery, saya lupa username/PIN login untuk mengecek status riwayat penyewaan saya. Mohon bantuannya ya.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hubungi Admin Senna Gallery</span>
                  </a>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className="p-5 sm:p-6 bg-[#FFFBF8] border-b border-orange-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-stone-900">Lacak Pesanan Cepat</h2>
                  <p className="text-[11px] text-stone-500 font-light">
                    Cari pesanan Anda langsung tanpa perlu mengingat PIN login.
                  </p>
                </div>
              </div>

              <form onSubmit={handleQuickSearch} className="p-5 sm:p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">
                    Nomor WhatsApp / ID Pesanan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 081234567890 atau ORD-SNA-123456"
                    value={quickSearchInput}
                    onChange={(e) => setQuickSearchInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-red-500 outline-hidden"
                  />
                  <span className="text-[10px] text-stone-400 font-light block leading-relaxed">
                    Masukkan nomor WhatsApp yang Anda daftarkan saat checkout sewa busana.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold py-3 rounded-xl transition shadow-sm hover:opacity-95 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <Search className="w-4 h-4" />
                  <span>Cari Riwayat Pesanan</span>
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        /* LOGGED IN or QUICK LOOKUP: Show History */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Sidebar / Profile Card (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 text-white flex items-center justify-center font-black text-base shrink-0">
                  {(currentUser?.name || lookupResults?.[0]?.userName || 'P').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wide">
                    {currentUser ? 'Penyewa Terdaftar' : 'Hasil Pencarian'}
                  </h3>
                  <p className="text-sm font-black text-stone-950 truncate">
                    {currentUser?.name || lookupResults?.[0]?.userName || 'Pelanggan Senna'}
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">
                    {currentUser?.phone || lookupResults?.[0]?.userPhone || '-'}
                  </p>
                </div>
              </div>

              {currentUser?.username && (
                <div className="bg-[#FFFBF8] border border-orange-100 p-3 rounded-xl space-y-1.5 text-[11px]">
                  <span className="font-bold text-red-600 block">🔑 Kredensial Riwayat Anda</span>
                  <div className="font-mono text-stone-700 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Username:</span>
                      <span className="font-bold text-stone-900">{currentUser.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PIN Login:</span>
                      <span className="font-bold text-amber-600">{currentUser.loginCode}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-stone-600 hover:text-red-600 rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{currentUser ? 'Keluar Akun' : 'Cari Nomor Lain'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/60 text-[11px] text-orange-950 space-y-1.5">
              <span className="font-bold block text-orange-800">Alur Pengambilan &amp; Fitting</span>
              <p className="font-light leading-relaxed">
                Pengambilan busana dilakukan pada H-1 tanggal acara dengan membawa bukti penyewaan digital/cetak. Fitting gratis tersedia di studio kami!
              </p>
            </div>
          </div>

          {/* Main List (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-bold text-stone-400">
              Daftar Pesanan Sewa Anda ({displayedOrders.length})
            </h2>

            {displayedOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-slate-50 text-stone-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-xs mx-auto">
                  <p className="text-xs font-bold text-stone-950">Belum Ada Riwayat Pesanan</p>
                  <p className="text-[11px] text-stone-500 font-light">
                    Tidak ditemukan riwayat pesanan aktif untuk akun atau nomor telepon ini.
                  </p>
                </div>
                <Link
                  to="/sewa/katalog"
                  className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:opacity-95 transition"
                >
                  <span>Mulai Cari Busana</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedOrders.map((ord) => (
                  <div 
                    key={ord.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden hover:border-slate-300 transition flex flex-col"
                  >
                    {/* Upper Bar */}
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-stone-900 bg-white border border-stone-200 px-2 py-0.5 rounded-lg text-[11px]">
                          #{ord.id}
                        </span>
                        <span className="text-stone-400">•</span>
                        <span className="text-stone-500 flex items-center gap-1 font-light">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          Acara: {ord.rentalDate} ({ord.rentalDurationDays} hari)
                        </span>
                      </div>

                      {/* Status badge */}
                      {(ord.status === 'disetujui' || ord.status === 'dikonfirmasi') && (
                        <span className="bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          DIKONFIRMASI / LUNAS
                        </span>
                      )}
                      {ord.status === 'diproses' && (
                        <span className="bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                          SEDANG DIPROSES / FITTING
                        </span>
                      )}
                      {ord.status === 'selesai' && (
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          PESANAN SELESAI
                        </span>
                      )}
                      {(ord.status === 'menunggu_konfirmasi' || ord.status === 'pending') && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          PENDING / MENUNGGU KONFIRMASI
                        </span>
                      )}
                      {ord.status === 'menunggu_pembayaran' && (
                        <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-red-600" />
                          MENUNGGU PEMBAYARAN
                        </span>
                      )}
                      {ord.status === 'dibatalkan' && (
                        <span className="bg-slate-100 text-stone-600 border border-stone-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-stone-500" />
                          DIBATALKAN
                        </span>
                      )}
                    </div>

                    {/* Middle items list */}
                    <div className="p-4 sm:p-5 flex-1 divide-y divide-slate-100 space-y-3">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 pt-3 first:pt-0">
                          <img
                            src={formatDriveImageUrl(item.product.imageUrl)}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-stone-800 truncate">{item.product.name}</h4>
                            <p className="text-[10px] text-stone-400 mt-0.5">
                              Size {item.selectedSize} • {item.selectedColor} • {item.quantity}x
                            </p>
                          </div>
                          <span className="text-xs font-bold text-stone-900 shrink-0 self-center">
                            {formatIDR(item.product.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Panel */}
                    <div className="p-4 bg-[#FFFBF8] border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-stone-400 font-light block">Total Tagihan:</span>
                        <span className="text-sm font-black text-red-600">{formatIDR(ord.totalAmount)}</span>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* Lanjut Pembayaran atau Upload Bukti */}
                        {ord.status === 'menunggu_pembayaran' && (
                          <Link
                            to={`/sewa/pembayaran/${ord.id}`}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>Bayar &amp; Konfirmasi</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {(ord.status === 'menunggu_konfirmasi' || ord.status === 'pending') && (
                          <Link
                            to={`/sewa/pembayaran/${ord.id}`}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>Cek Status Verifikasi</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {/* Approved / Disetujui / Diproses / Selesai -> PRINT PROOF! */}
                        {(ord.status === 'disetujui' || ord.status === 'dikonfirmasi' || ord.status === 'diproses' || ord.status === 'selesai') && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => generateSewaReceiptPDF(ord)}
                              className="bg-gradient-to-r from-red-600 to-orange-500 hover:opacity-95 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh PDF</span>
                            </button>
                            <Link
                              to={`/sewa/pembayaran/${ord.id}`}
                              className="bg-slate-100 hover:bg-slate-200 text-stone-700 hover:text-red-600 border border-slate-200 text-[11px] font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 text-red-600" />
                              <span>Detail &amp; Cetak</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

