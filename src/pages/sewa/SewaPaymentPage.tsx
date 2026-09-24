import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  MessageCircle, 
  UploadCloud, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag,
  ArrowRight,
  QrCode,
  Building2,
  ExternalLink,
  Printer,
  Lock,
  XCircle,
  Download
} from 'lucide-react';
import { useSewaStore } from '../../store/sewaStore';
import { formatDriveImageUrl } from '../../services/googleDriveService';
import { generateSewaReceiptPDF } from '../../services/pdfService';
import { ADMIN_WA_NUMBER, STUDIO_INFO } from '../../data/packagesData';

export const SewaPaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();
  const { 
    orders, 
    currentOrderId, 
    getOrderById, 
    submitPaymentProof, 
    showToast,
    currentUser,
    webSettings
  } = useSewaStore();

  // Find order by URL param or currentOrderId or the latest user order
  const targetId = orderId || currentOrderId || orders[0]?.id;
  const order = orders.find((o) => o.id === targetId) || orders[0];

  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<'bca' | 'mandiri' | 'bri' | 'qris'>(
    order?.paymentMethod || 'bca'
  );
  const [uploadedProof, setUploadedProof] = useState<string | null>(order?.paymentProofUrl || null);
  const [senderAccountName, setSenderAccountName] = useState(order?.userName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  useEffect(() => {
    if (currentUser?.username && currentUser.authProvider === 'simple') {
      setShowAccountModal(true);
    }
  }, [currentUser]);

  // 2-hour countdown timer simulation
  const [timeLeft, setTimeLeft] = useState(7199); // 1h 59m 59s

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const handleCopy = (text: string, bankId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(bankId);
    showToast(`Nomor rekening ${bankId.toUpperCase()} berhasil disalin!`, 'success');
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedProof(reader.result as string);
        showToast('Bukti transfer berhasil diunggah! Klik tombol konfirmasi di bawah.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmViaWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsSubmitting(true);
    // Update order status in store to 'menunggu_konfirmasi'
    submitPaymentProof(order.id, uploadedProof || undefined);

    // Build WA message
    let msg = `*KONFIRMASI PEMBAYARAN SEWA - SENNA GALLERY*\n`;
    msg += `────────────────────────────\n`;
    msg += `🆔 *ID Pesanan:* ${order.id}\n`;
    msg += `👤 *Penyewa:* ${order.userName}\n`;
    msg += `📱 *WhatsApp:* ${order.userPhone}\n`;
    msg += `💳 *Bank Tujuan:* ${selectedBank.toUpperCase()} (a/n Desi Indah Putri)\n`;
    if (senderAccountName.trim()) {
      msg += `📝 *Nama Rekening Pengirim:* ${senderAccountName}\n`;
    }
    msg += `💰 *Total Transfer:* ${formatIDR(order.totalAmount)}\n`;
    msg += `📅 *Tanggal Pemakaian:* ${order.rentalDate} (${order.rentalDurationDays} Hari)\n`;
    msg += `📦 *Metode Pengambilan:* ${order.deliveryMethod === 'ojol_delivery' ? 'Kirim via Ojek Online (Ongkir ditanggung penyewa)' : 'Ambil ke Studio Gallery Senna'}\n`;
    msg += `📍 *Alamat / Domisili:* ${order.renterAddress}\n`;
    msg += `\n👗 *Daftar Busana:*\n`;
    order.items.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.product.name} (Size: ${item.selectedSize}, Warna: ${item.selectedColor}, ${item.quantity}x)\n`;
    });
    msg += `\n────────────────────────────\n`;
    msg += `Halo Admin Senna Gallery Official Store, saya telah melakukan transfer sewa busana di atas ke rekening a/n Desi Indah Putri. Mohon verifikasi dan approve pesanan saya. Bukti transfer saya lampirkan pada chat ini. Terima kasih!`;

    const waNumber = webSettings?.contactWhatsapp || ADMIN_WA_NUMBER;
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setIsSubmitting(false);
    }, 400);
  };

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Pesanan Tidak Ditemukan</h2>
        <p className="text-xs text-stone-500">
          Belum ada pesanan aktif yang siap dibayar. Silakan pilih busana dari katalog terlebih dahulu.
        </p>
        <Link
          to="/sewa/katalog"
          className="inline-block bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl"
        >
          Lihat Katalog Busana
        </Link>
      </div>
    );
  }

  const bankAccounts = [
    {
      id: 'bca',
      name: 'Bank Central Asia (BCA)',
      accountNumber: '8100-2828-99',
      holder: 'Desi Indah Putri',
      logo: 'BCA',
      color: 'from-blue-600 to-indigo-700'
    },
    {
      id: 'mandiri',
      name: 'Bank Mandiri',
      accountNumber: '130-00-2828999-1',
      holder: 'Desi Indah Putri',
      logo: 'MANDIRI',
      color: 'from-amber-600 to-blue-800'
    },
    {
      id: 'bri',
      name: 'Bank BRI',
      accountNumber: '0123-01-002828-50-8',
      holder: 'Desi Indah Putri',
      logo: 'BRI',
      color: 'from-blue-700 to-sky-600'
    },
    {
      id: 'qris',
      name: 'QRIS Official (Semua E-Wallet & M-Banking)',
      accountNumber: 'NMID: ID1020304050607',
      holder: 'Desi Indah Putri',
      logo: 'QRIS',
      color: 'from-rose-600 to-orange-600'
    }
  ];

  return (
    <>
      {/* Screen Wrapper (Hidden during print) */}
      <div className="print:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* 1. BREADCRUMB */}
        <nav className="flex items-center gap-2 text-xs text-stone-500">
          <Link to="/sewa" className="hover:text-red-600 transition">Beranda</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
          <Link to="/sewa/keranjang" className="hover:text-red-600 transition">Keranjang</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
          <span className="text-stone-900 font-bold">Pembayaran &amp; Konfirmasi</span>
        </nav>

        {/* 2. ORDER STATUS BANNER */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          order.status === 'disetujui' || order.status === 'dikonfirmasi' || order.status === 'diproses' || order.status === 'selesai'
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
            : order.status === 'menunggu_konfirmasi' || order.status === 'pending'
            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-orange-200 text-orange-950'
            : order.status === 'dibatalkan'
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : 'bg-gradient-to-r from-rose-50 to-orange-50 border-rose-200 text-rose-950'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-stone-500">ID Pesanan:</span>
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-900">
                {order.id}
              </span>

              {/* Status Pill */}
              {(order.status === 'disetujui' || order.status === 'dikonfirmasi') && (
                <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  DIKONFIRMASI / LUNAS
                </span>
              )}
              {order.status === 'diproses' && (
                <span className="bg-purple-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  SEDANG DIPROSES / FITTING
                </span>
              )}
              {order.status === 'selesai' && (
                <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  PESANAN SELESAI
                </span>
              )}
              {(order.status === 'menunggu_konfirmasi' || order.status === 'pending') && (
                <span className="bg-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" />
                  MENUNGGU KONFIRMASI ADMIN
                </span>
              )}
              {order.status === 'menunggu_pembayaran' && (
                <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  MENUNGGU PEMBAYARAN
                </span>
              )}
              {order.status === 'dibatalkan' && (
                <span className="bg-slate-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  DIBATALKAN
                </span>
              )}
            </div>

            <h1 className="text-base sm:text-lg font-bold text-stone-900">
              {order.status === 'disetujui' || order.status === 'dikonfirmasi'
                ? 'Selamat! Pembayaran Sewa Busana Telah Dikonfirmasi'
                : order.status === 'diproses'
                ? 'Pesanan Sedang Diproses (Fitting / Pengiriman)'
                : order.status === 'selesai'
                ? 'Transaksi & Penyewaan Busana Selesai'
                : order.status === 'dibatalkan'
                ? 'Pesanan Telah Dibatalkan'
                : order.status === 'menunggu_konfirmasi' || order.status === 'pending'
                ? 'Bukti Pembayaran Sedang Diverifikasi oleh Admin'
                : 'Selesaikan Pembayaran Sewa Busana Anda'}
            </h1>
            <p className="text-xs text-stone-600">
              {order.status === 'disetujui' || order.status === 'dikonfirmasi' || order.status === 'diproses'
                ? 'Jadwal fitting dan busana Anda telah diamankan. Busana dapat diambil di Studio Senna Gallery (Jl. RA basyid, Gg Kemuning 2 No 28, Bandar Lampung) atau dikirim via Ojek Online.'
                : order.status === 'selesai'
                ? 'Terima kasih telah menyewa busana di Senna Gallery! Sampai jumpa di acara spesial Anda berikutnya.'
                : order.status === 'dibatalkan'
                ? 'Pesanan ini dibatalkan. Silakan hubungi admin jika ingin mengaktifkan kembali atau membuat pesanan baru.'
                : order.status === 'menunggu_konfirmasi' || order.status === 'pending'
                ? 'Admin sedang memeriksa mutasi bank Anda ke rekening a/n Desi Indah Putri. Sambil menunggu, Anda bebas menjelajahi katalog busana lainnya!'
                : 'Lakukan transfer sesuai nominal total tagihan ke rekening a/n Desi Indah Putri, lalu kirim bukti pembayaran via WhatsApp.'}
            </p>
          </div>

          {/* Countdown timer badge */}
          {order.status === 'menunggu_pembayaran' && (
            <div className="shrink-0 bg-white/90 border border-rose-200 rounded-xl p-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-red-600" />
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Sisa Waktu Pembayaran:
                </span>
                <span className="text-sm font-mono font-black text-red-600">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          )}

          {/* Cetak & Unduh Bukti buttons (for confirmed/approved/processing/completed orders) */}
          {(order.status === 'disetujui' || order.status === 'dikonfirmasi' || order.status === 'diproses' || order.status === 'selesai') && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => generateSewaReceiptPDF(order)}
                className="bg-gradient-to-r from-red-600 to-orange-500 hover:opacity-95 active:scale-[0.98] text-white text-xs font-bold px-4.5 py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer border border-transparent"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Bukti PDF</span>
              </button>
              <button
                onClick={() => window.print()}
                className="bg-white hover:bg-slate-50 active:scale-[0.98] text-stone-700 hover:text-red-600 text-xs font-bold px-4.5 py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 hover:border-red-500"
              >
                <Printer className="w-4 h-4 text-red-600" />
                <span>Cetak / Print</span>
              </button>
            </div>
          )}
        </div>

      {/* 3. MAIN GRID (8 Cols Left, 4 Cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: BANK DETAILS & UPLOAD BUKTI (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB PILIHAN BANK / REKENING */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <span>Pilihan Rekening Pembayaran Resmi</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Transfer ke rekening berbadan hukum Senna Gallery Official
                </p>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                100% Aman &amp; Terverifikasi
              </span>
            </div>

            {/* Bank Selector Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {bankAccounts.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBank(b.id as any)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                    selectedBank === b.id
                      ? 'border-red-500 bg-rose-50/50 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-stone-600'
                  }`}
                >
                  <span className="text-xs font-black text-stone-900 block font-mono">
                    {b.logo}
                  </span>
                  <span className="text-[11px] font-medium text-stone-600 line-clamp-1">
                    {b.name.split('(')[0]}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Bank Card Display */}
            {(() => {
              const active = bankAccounts.find((b) => b.id === selectedBank) || bankAccounts[0];
              return (
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-stone-900 to-stone-950 text-white relative overflow-hidden shadow-md">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-rose-500/20 to-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 font-mono tracking-wider">
                        {active.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2 py-0.5 rounded text-slate-300">
                        OFFICIAL ACCOUNT
                      </span>
                    </div>

                    {selectedBank !== 'qris' ? (
                      <div className="space-y-1">
                        <span className="text-[11px] text-stone-400 block">Nomor Rekening:</span>
                        <div className="flex items-center justify-between gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10">
                          <span className="text-lg sm:text-2xl font-mono font-bold tracking-widest text-white">
                            {active.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(active.accountNumber.replace(/-/g, ''), active.id)}
                            className="bg-white hover:bg-slate-100 text-stone-900 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            {copiedBank === active.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin No. Rekening</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-300 pt-1">
                          Atas Nama: <strong className="text-white">{active.holder}</strong>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-xs border border-white/10">
                          <div className="w-28 h-28 bg-white rounded-xl p-2 shrink-0 flex items-center justify-center">
                            <img
                              src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://wa.me/6282126233519"
                              alt="QRIS Senna Gallery"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="space-y-1 text-center sm:text-left">
                            <span className="text-xs font-bold text-white block">
                              Scan QRIS Senna Wedding Gallery
                            </span>
                            <p className="text-[11px] text-stone-300">
                              Mendukung BCA Mobile, Livin Mandiri, BRImo, GoPay, OVO, ShopeePay, dan DANA.
                            </p>
                            <span className="text-[10px] font-mono text-amber-300 block">
                              {active.accountNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-stone-400 flex items-center gap-1.5 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Pastikan nominal transfer tepat sebesar: <strong className="text-amber-300 font-mono text-xs">{formatIDR(order.totalAmount)}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>

          {/* UPLOAD & KIRIM BUKTI PEMBAYARAN */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Kirim Bukti Pembayaran ke WhatsApp Admin</span>
              </h2>
              <p className="text-xs text-stone-500">
                Unggah tangkapan layar bukti transfer atau kirim langsung untuk diverifikasi dan di-approve oleh Admin
              </p>
            </div>

            <form onSubmit={handleConfirmViaWhatsApp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Nama Pemilik Rekening / Pengirim:
                  </label>
                  <input
                    type="text"
                    value={senderAccountName}
                    onChange={(e) => setSenderAccountName(e.target.value)}
                    placeholder="Contoh: Nadia Safitri"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:border-red-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Bank Pengirim:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: BCA / Mandiri / GoPay"
                    defaultValue={selectedBank.toUpperCase()}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:border-red-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Upload Bukti Box */}
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Lampirkan Bukti Transfer (Opsional):
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-red-500 rounded-2xl p-4 text-center transition bg-slate-50/60 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {uploadedProof ? (
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={uploadedProof}
                        alt="Bukti Transfer"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                      />
                      <div className="text-left">
                        <span className="text-xs font-bold text-emerald-700 block flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Bukti Transfer Terpilih
                        </span>
                        <span className="text-[11px] text-stone-500">
                          Klik untuk mengganti foto bukti transfer
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud className="w-8 h-8 text-stone-400 mx-auto" />
                      <span className="text-xs font-semibold text-stone-700 block">
                        Klik atau seret foto bukti transfer ke sini
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        Format: JPG, PNG, WebP (Maks 5MB)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 hover:from-red-700 hover:to-orange-600 active:scale-[0.99] text-white py-3.5 px-6 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? 'Menghubungkan ke Admin...' 
                      : order.status === 'menunggu_konfirmasi'
                      ? 'Kirim Ulang Bukti via WhatsApp'
                      : 'Kirim Bukti Pembayaran via WhatsApp'}
                  </span>
                </button>

                <Link
                  to="/sewa/katalog"
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-stone-700 py-3.5 px-5 rounded-xl text-xs font-bold transition text-center"
                >
                  Eksplorasi Busana Lainnya →
                </Link>
              </div>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: RINGKASAN TAGIHAN & ITEMS (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 pb-3 border-b border-slate-100">
              Rincian Tagihan Sewa
            </h3>

            {/* Price lines */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal Sewa ({order.items.length} item)</span>
                <span className="font-semibold text-stone-900">{formatIDR(order.subtotal)}</span>
              </div>

              <div className="flex justify-between text-emerald-700">
                <span>Biaya Dry Cleaning &amp; Steril</span>
                <span className="font-bold">GRATIS</span>
              </div>

              <div className="flex justify-between text-emerald-700">
                <span>Fasilitas Fitting Studio Senna</span>
                <span className="font-bold">GRATIS</span>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Total Transfer:</span>
                  <span className="text-[10px] text-stone-400">Rekening a/n Desi Indah Putri</span>
                </div>
                <span className="text-lg sm:text-xl font-black text-red-600">
                  {formatIDR(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Attire Item Preview */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Item yang Disewa:
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                    <img
                      src={formatDriveImageUrl(item.product.imageUrl)}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-white shrink-0 border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <span className="font-semibold text-stone-900 block truncate">
                        {item.product.name}
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        Size {item.selectedSize} • {item.selectedColor} • {item.quantity}x
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule & Delivery preview */}
            <div className="pt-2 text-[11px] text-stone-500 space-y-1 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Tanggal Acara:</span>
                <span className="font-semibold text-stone-800">{order.rentalDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Durasi:</span>
                <span className="font-semibold text-stone-800">{order.rentalDurationDays} Hari</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="shrink-0">Metode Pengambilan:</span>
                <span className="font-semibold text-stone-800 text-right">
                  {order.deliveryMethod === 'ojol_delivery' ? 'Kirim Ojek Online (Ongkir ditanggung penyewa)' : 'Ambil ke Studio Gallery'}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="shrink-0">Alamat / Studio:</span>
                <span className="font-semibold text-stone-800 text-right truncate max-w-[160px]">{order.renterAddress}</span>
              </div>
            </div>

          </div>

          {/* Quick Support Card */}
          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 text-xs text-orange-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>Butuh Bantuan Verifikasi Cepat?</span>
            </div>
            <p className="text-[11px] text-orange-900 font-light">
              Hubungi langsung Customer Care Senna Gallery melalui hotline WhatsApp resmi di {STUDIO_INFO.phone}.
            </p>
          </div>

          {/* Simple account credentials banner */}
          {currentUser?.username && currentUser.authProvider === 'simple' && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-orange-200 text-xs text-stone-900 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-rose-600">
                  <Lock className="w-4 h-4" />
                  <span>Akun Riwayat Aktif</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAccountModal(true)}
                  className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Tampilkan Akun 🔑
                </button>
              </div>
              <p className="text-[11px] text-stone-600 font-light leading-relaxed">
                Anda terdaftar sebagai <strong className="text-stone-900">{currentUser.username}</strong>. Simpan info akun untuk login &amp; melihat riwayat sewa di lain waktu.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>

    {/* 4. PRINTABLE RECEIPT TEMPLATE (Hidden on screen, shown ONLY during print) */}
    {order && (
      <div className="hidden print:block bg-white text-stone-900 p-8 font-serif max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            {/* Professional SVG Crown/Dress Logo */}
            <div className="w-12 h-12 rounded-xl bg-stone-950 text-white flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 fill-current text-amber-400" viewBox="0 0 24 24">
                <path d="M12 2L9.5 8.5L3 10L7.5 14.5L6.5 21L12 17.5L17.5 21L16.5 14.5L21 10L14.5 8.5L12 2Z" />
              </svg>
            </div>
            <div className="space-y-0.5">
              <h1 className="text-2xl font-black tracking-wide font-sans text-stone-900">SENNA GALLERY</h1>
              <p className="text-[10px] text-stone-500 font-sans leading-tight">
                Official Sewa Kebaya, Jas, Gaun &amp; Wedding Attire<br />
                Jl. RA basyid, Gg Kemuning 2 No 28, Bandar Lampung<br />
                WhatsApp: +62 821-2623-3519
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-right">
            <div className="space-y-1">
              <div className="inline-block border-2 border-emerald-600 rounded-lg px-2 py-1 text-center rotate-[-2deg] text-emerald-700 font-sans font-black text-xs uppercase tracking-wider bg-emerald-50">
                LUNAS &amp; DISETUJUI
              </div>
              <p className="text-[9px] text-stone-400 font-mono">Invoice #{order.id}</p>
            </div>
            {/* Real QR Code generated from online API */}
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                `Invoice: ${order.id}\nNama: ${order.userName}\nTotal: ${order.totalAmount}\nStatus: LUNAS & DISETUJUI`
              )}`} 
              className="w-14 h-14 border border-stone-200 p-1 bg-white rounded-lg shrink-0" 
              alt="QR Code Verifikasi" 
            />
          </div>
        </div>

        {/* Invoice Metadata */}
        <div className="grid grid-cols-2 gap-4 text-xs font-sans py-2">
          <div className="space-y-1">
            <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Rincian Penyewa:</span>
            <p className="font-bold text-stone-900">{order.userName}</p>
            <p className="text-stone-600">WhatsApp: {order.userPhone}</p>
            {currentUser?.username && currentUser.authProvider === 'simple' && (
              <p className="text-[10px] text-rose-600 font-mono mt-1">
                Akun Rujukan: {currentUser.username} (PIN: {currentUser.loginCode})
              </p>
            )}
          </div>
          <div className="space-y-1 text-right">
            <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Metode Penyerahan:</span>
            <p className="font-bold text-stone-900">
              {order.deliveryMethod === 'ojol_delivery' ? 'Kirim Ojek Online' : 'Ambil di Studio'}
            </p>
            <p className="text-stone-600 max-w-[250px] ml-auto truncate">{order.renterAddress}</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-2 gap-4 text-xs font-sans bg-stone-50 border border-stone-200 p-3 rounded-xl">
          <div>
            <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Tanggal Acara:</span>
            <p className="font-black text-stone-800 text-sm mt-0.5">{order.rentalDate}</p>
          </div>
          <div className="text-right">
            <span className="text-stone-400 uppercase tracking-wider text-[10px] block">Durasi Sewa:</span>
            <p className="font-black text-stone-800 text-sm mt-0.5">{order.rentalDurationDays} Hari</p>
          </div>
        </div>

        {/* Table items */}
        <div className="border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                <th className="p-3 font-bold">Nama Busana</th>
                <th className="p-3 font-bold">Ukuran</th>
                <th className="p-3 font-bold">Warna</th>
                <th className="p-3 font-bold text-center">Jumlah</th>
                <th className="p-3 font-bold text-right">Harga</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-stone-100 text-stone-800">
                  <td className="p-3 font-semibold">{item.product.name}</td>
                  <td className="p-3 font-mono">{item.selectedSize}</td>
                  <td className="p-3">{item.selectedColor}</td>
                  <td className="p-3 text-center font-mono">{item.quantity}</td>
                  <td className="p-3 text-right font-semibold">{formatIDR(item.product.price * item.quantity)}</td>
                </tr>
              ))}
              <tr className="bg-stone-50 border-t border-stone-200">
                <td colSpan={3} className="p-3 text-stone-500 font-medium">Subtotal Sewa</td>
                <td className="p-3 text-center font-mono">{order.items.length}</td>
                <td className="p-3 text-right font-black">{formatIDR(order.subtotal)}</td>
              </tr>
              <tr className="bg-stone-50">
                <td colSpan={4} className="p-3 text-emerald-700 font-bold">Biaya Dry Cleaning &amp; Steril</td>
                <td className="p-3 text-right text-emerald-700 font-black">GRATIS</td>
              </tr>
              <tr className="bg-stone-50 border-t border-stone-200">
                <td colSpan={4} className="p-3 font-black text-sm text-stone-900">Total Pembayaran (Lunas)</td>
                <td className="p-3 text-right font-black text-sm text-red-600">{formatIDR(order.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer info / S&K */}
        <div className="space-y-2 font-sans text-[10px] text-stone-500 pt-4 border-t border-stone-200">
          <p className="font-bold text-stone-700">Syarat &amp; Ketentuan Pengambilan &amp; Pengembalian:</p>
          <ol className="list-decimal pl-4 space-y-1 text-stone-600">
            <li>Pengambilan busana dilakukan pada H-1 tanggal acara dengan menunjukkan lembar bukti pembayaran digital/fisik ini.</li>
            <li>Fitting penyesuaian gratis dapat dilakukan langsung di Studio Senna Gallery.</li>
            <li>Pengembalian busana wajib dilakukan maksimal pada H+1 setelah sewa berakhir dalam kondisi tidak rusak/robek parah.</li>
            <li>Busana tidak perlu dicuci sendiri. Kami memberikan fasilitas cuci dry-clean steril gratis.</li>
            <li>Segala bentuk keterlambatan pengembalian dikenakan denda sesuai ketentuan Senna Gallery.</li>
          </ol>
          <div className="pt-4 text-center text-[9px] text-stone-400 uppercase tracking-widest font-mono">
            Dokumen ini sah dikeluarkan oleh Sistem Kasir Senna Gallery dan bersertifikat lunas.
          </div>
        </div>

        {/* Attachment Page (Page Break) for Payment Proof */}
        {order.paymentProofUrl && (
          <div className="break-before-page pt-10 space-y-6">
            <div className="border-b-2 border-stone-800 pb-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-stone-950 text-white flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 fill-current text-amber-400" viewBox="0 0 24 24">
                    <path d="M12 2L9.5 8.5L3 10L7.5 14.5L6.5 21L12 17.5L17.5 21L16.5 14.5L21 10L14.5 8.5L12 2Z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-wide font-sans text-stone-900 uppercase">LAMPIRAN BUKTI TRANSFER PEMBAYARAN</h2>
                  <p className="text-[9px] text-stone-500 font-sans">Lampiran Sah Transaksi Digital Invoice #{order.id}</p>
                </div>
              </div>
              <p className="text-[9px] font-mono text-stone-400">Lampiran Bukti Fisik / Hal 2</p>
            </div>
            
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-xs space-y-2 font-sans">
              <h3 className="font-bold text-stone-800">Detail Validasi Pembayaran Elektronik:</h3>
              <p className="text-stone-600 leading-relaxed text-[11px]">Dokumen di bawah adalah salinan bukti transfer asli yang diunggah oleh penyewa pada sistem transaksi online Senna Gallery dan telah divalidasi oleh tim admin.</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 pt-2 text-[11px] font-mono text-stone-700">
                <div>• Pengirim Terdaftar: <span className="font-bold text-stone-900">{order.userName}</span></div>
                <div>• Nomor Telepon: <span className="font-bold text-stone-900">{order.userPhone}</span></div>
                <div>• Total Nilai Sewa: <span className="font-bold text-stone-950">{formatIDR(order.totalAmount)}</span></div>
                <div>• Status Konfirmasi: <span className="font-bold text-emerald-700">VALID &amp; SUDAH DISETUJUI ADMIN</span></div>
              </div>
            </div>

            <div className="border border-stone-200 bg-stone-50 p-6 rounded-2xl flex justify-center items-center">
              <img 
                src={order.paymentProofUrl} 
                className="max-h-[500px] max-w-md rounded-lg shadow-sm object-contain border border-stone-200" 
                alt="Bukti Transfer Asli" 
              />
            </div>

            <p className="text-center text-[9px] text-stone-400 italic font-sans">
              Materi lampiran di atas ditarik langsung dari peladen basis data Senna Gallery dan dijamin integritas datanya.
            </p>
          </div>
        )}
      </div>
    )}

    {/* POPUP MODAL: Detail Akun Penyewa Anda */}
    {showAccountModal && currentUser?.username && currentUser.authProvider === 'simple' && (
      <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-orange-100 animate-scale-in flex flex-col">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50/50 border-b border-orange-100 text-center relative space-y-2">
            <button
              onClick={() => setShowAccountModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
              aria-label="Tutup"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
              🔐 Detail Akun Penyewa Anda
            </h3>
            <p className="text-xs text-stone-500 font-light leading-relaxed max-w-xs mx-auto">
              Sistem telah otomatis membuatkan akun sederhana untuk melacak pesanan dan melihat riwayat sewa Anda di masa mendatang.
            </p>
          </div>

          {/* Credentials Display */}
          <div className="p-6 space-y-4">
            
            {/* Username Box */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block">
                Username Anda
              </span>
              <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <span className="text-xs font-mono font-bold text-stone-900 select-all">
                  {currentUser.username}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentUser.username || '');
                    setCopiedUser(true);
                    showToast('Username berhasil disalin!', 'success');
                    setTimeout(() => setCopiedUser(false), 2000);
                  }}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-red-500 text-stone-500 hover:text-red-600 transition shrink-0 cursor-pointer"
                  title="Salin Username"
                >
                  {copiedUser ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* PIN Box */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block">
                Kode PIN Login
              </span>
              <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <span className="text-xs font-mono font-black text-amber-600 select-all">
                  {currentUser.loginCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentUser.loginCode || '');
                    setCopiedPin(true);
                    showToast('PIN Login berhasil disalin!', 'success');
                    setTimeout(() => setCopiedPin(false), 2000);
                  }}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-red-500 text-stone-500 hover:text-red-600 transition shrink-0 cursor-pointer"
                  title="Salin PIN"
                >
                  {copiedPin ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Directives text */}
            <div className="bg-orange-50/60 border border-orange-200/50 p-3.5 rounded-2xl text-[11px] text-orange-950 space-y-1">
              <span className="font-bold block text-orange-800">💡 Arahan Penting:</span>
              <p className="font-light leading-relaxed">
                Silakan <strong>salin</strong> atau <strong>simpan (screenshot)</strong> data akun di atas sekarang. Anda akan memerlukannya untuk login kembali ke halaman <strong>Riwayat</strong> guna memantau persetujuan fitting, bukti pembayaran, maupun cetak nota resmi di lain waktu.
              </p>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => {
                // Copy all to clipboard
                const combined = `Kredensial Sewa Senna Gallery:\nUsername: ${currentUser.username}\nPIN Login: ${currentUser.loginCode}`;
                navigator.clipboard.writeText(combined);
                showToast('Semua kredensial berhasil disalin!', 'success');
                setShowAccountModal(false);
              }}
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 hover:opacity-95 text-white text-xs font-bold py-3 px-4 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salin Semua &amp; Lanjut</span>
            </button>
            
            <button
              onClick={() => {
                setShowAccountModal(false);
                navigate('/sewa/riwayat');
              }}
              className="sm:px-4 py-3 bg-white border border-slate-200 text-stone-700 hover:text-red-600 hover:border-red-500 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Uji Coba Riwayat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    )}
  </>
);
};
