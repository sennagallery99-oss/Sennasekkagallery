import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Calendar, 
  Clock, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  MessageCircle, 
  AlertCircle, 
  ArrowLeft, 
  Check, 
  MapPin, 
  Heart,
  ChevronRight,
  User,
  CheckSquare,
  Square,
  CreditCard,
  Building2,
  ExternalLink,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useSewaStore } from '../../store/sewaStore';
import { formatDriveImageUrl } from '../../services/googleDriveService';
import { ADMIN_WA_NUMBER, STUDIO_INFO } from '../../data/packagesData';
import { SEWA_STORE_INFO } from '../../data/sewaProductsData';
import { getProductStockForSize } from '../../types/sewa';

export const SewaCartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    rentalDate,
    rentalDurationDays,
    renterDetails,
    removeFromCart,
    updateQuantity,
    clearCart,
    setRentalDate,
    setRentalDurationDays,
    setRenterDetails,
    getTotalItemsCount,
    getSubtotal,
    getTotalAmount,
    showToast,
    createOrder,
    orders,
    currentOrderId
  } = useSewaStore();

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [selectedPaymentBank, setSelectedPaymentBank] = useState<'bca' | 'mandiri' | 'bri' | 'qris'>('bca');

  // Check if there is an active order with 'menunggu_konfirmasi'
  const activePendingOrder = orders.find(
    (o) => o.status === 'menunggu_konfirmasi' || (o.id === currentOrderId && o.status !== 'dibatalkan')
  );

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  // Checkout Handler: Validate Form -> Checklist Persetujuan -> Redirect to Halaman Pembayaran (Guest Checkout, Tanpa Perlu Login Akun)
  const handleProceedToPayment = () => {
    // 1. Validate Renter Form
    const errors: { [key: string]: string } = {};
    if (!renterDetails.name.trim()) {
      errors.name = 'Nama lengkap penyewa wajib diisi.';
    }
    if (!renterDetails.phone.trim()) {
      errors.phone = 'Nomor WhatsApp aktif wajib diisi.';
    }
    if (!rentalDate) {
      errors.date = 'Tanggal pemakaian busana wajib dipilih.';
    }
    if (renterDetails.deliveryMethod === 'ojol_delivery' && !renterDetails.address.trim()) {
      errors.address = 'Alamat tujuan pengiriman ojek online wajib diisi.';
    }
    if (!agreedToTerms) {
      errors.terms = 'Anda wajib menyetujui syarat & ketentuan sewa busana.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Harap lengkapi data diri dan centang persetujuan sewa.', 'info');
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Create Order in Zustand store (with status 'menunggu_pembayaran')
      const order = createOrder(selectedPaymentBank, null);

      showToast('Pesanan berhasil dibuat! Mengarahkan ke halaman pembayaran...', 'success');

      // 3. Redirect to Payment Page
      setTimeout(() => {
        setIsSubmitting(false);
        navigate(`/sewa/pembayaran/${order.id}`);
      }, 300);
    } catch (err) {
      setIsSubmitting(false);
      showToast('Terjadi kesalahan, silakan coba lagi.', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/sewa" className="hover:text-red-600 transition">Beranda</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
        <span className="text-stone-900 font-bold">Keranjang &amp; Konfirmasi Sewa</span>
      </nav>

      {/* 2. PENDING ORDER BANNER (If user has an active order waiting for confirmation) */}
      {activePendingOrder && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 border border-orange-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                    STATUS: {activePendingOrder.status === 'disetujui' ? 'DISETUJUI / LUNAS' : 'MENUNGGU KONFIRMASI'}
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-700">
                    #{activePendingOrder.id}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900 mt-0.5">
                  {activePendingOrder.status === 'disetujui'
                    ? 'Pesanan Sewa Anda Telah Dikonfirmasi & Disetujui Admin!'
                    : 'Pesanan Sewa Anda Sedang Menunggu Konfirmasi Pembayaran Admin'}
                </h3>
                <p className="text-xs text-stone-600 font-light mt-0.5">
                  Admin sedang memverifikasi transfer Anda. Sambil menunggu, Anda bebas menjelajahi katalog busana lainnya di bawah ini!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <Link
                to={`/sewa/pembayaran/${activePendingOrder.id}`}
                className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Lihat Status &amp; Rekening</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. IF CART IS EMPTY */}
      {cart.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-slate-200 text-center space-y-5 max-w-2xl mx-auto shadow-2xs">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-50 to-orange-50 text-red-600 flex items-center justify-center mx-auto border border-rose-100">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              Keranjang Sewa Anda Masih Kosong
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto font-light">
              Temukan koleksi kebaya brokat Prancis, setelan jas tuxedo slim-fit, dan gaun resepsi pernikahan impian Anda.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/sewa/katalog"
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-7 py-3 rounded-xl text-xs sm:text-sm font-bold transition shadow-md flex items-center justify-center gap-2"
            >
              <span>Eksplorasi Katalog Busana</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/sewa"
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-stone-700 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      ) : (
        /* 4. ACTIVE CART & CHECKOUT FORM */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Keranjang Sewa Busana ({getTotalItemsCount()} item)
            </h1>

            {/* Guest checkout status badge */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs text-emerald-800 font-medium shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Checkout Instan • Tanpa Perlu Login</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: ITEMS & RENTER DETAILS & TERMS (8 Cols) */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* CART ITEMS GROUP */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      {SEWA_STORE_INFO.name}
                      <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                        OFFICIAL GALLERY
                      </span>
                    </span>
                    <span className="text-xs text-stone-400">• Kota Bandar Lampung</span>
                  </div>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-stone-400 hover:text-red-600 font-semibold cursor-pointer transition"
                  >
                    Kosongkan Keranjang
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {cart.map((item) => (
                    <div key={item.id} className="p-4 sm:p-5 flex gap-3 sm:gap-4">
                      {/* Product Image */}
                      <Link
                        to={`/sewa/katalog/${item.product.id}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200"
                      >
                        <img
                          src={formatDriveImageUrl(item.product.imageUrl)}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/sewa/katalog/${item.product.id}`}
                            className="text-xs sm:text-sm font-semibold text-stone-900 hover:text-red-600 transition line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-400 hover:text-red-600 p-1 cursor-pointer shrink-0"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Variants */}
                        {(() => {
                          const stockLimit = getProductStockForSize(item.product, item.selectedSize);
                          const isMaxReached = item.quantity >= stockLimit;

                          return (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                                <span className="bg-rose-50 text-red-700 border border-rose-100 px-2 py-0.5 rounded text-[11px] font-semibold">
                                  Size: {item.selectedSize}
                                </span>
                                <span className="bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded text-[11px] font-semibold">
                                  Warna: {item.selectedColor}
                                </span>
                                <span className="text-[11px] text-stone-500 font-medium">
                                  (Ready: {stockLimit} Set)
                                </span>
                              </div>

                              {/* Pricing & Counter */}
                              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <span className="text-sm sm:text-base font-bold text-stone-900">
                                    {formatIDR(item.product.price * item.quantity)}
                                  </span>
                                  <span className="text-[10px] text-stone-400 ml-1">
                                    ({formatIDR(item.product.price)} / 3 hari)
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-7 h-7 rounded-lg border border-slate-300 text-stone-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="w-8 text-center text-xs font-bold text-stone-800">
                                    {item.quantity} Set
                                  </span>
                                  <button
                                    type="button"
                                    disabled={isMaxReached}
                                    onClick={() => {
                                      if (!isMaxReached) {
                                        updateQuantity(item.id, item.quantity + 1);
                                      }
                                    }}
                                    className="w-7 h-7 rounded-lg border border-slate-300 text-stone-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                                    title={isMaxReached ? `Maksimal ${stockLimit} set untuk ukuran ${item.selectedSize}` : 'Tambah'}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {isMaxReached && (
                                <p className="text-[10px] text-orange-700 font-medium pt-0.5">
                                  *Maksimal {stockLimit} set sesuai stok barang untuk ukuran {item.selectedSize}. Butuh lebih banyak? Pilih ukuran berbeda.
                                </p>
                              )}
                            </div>
                          );
                        })()}

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FORMULIR DATA PENYEWA & JADWAL */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm sm:text-base font-bold text-stone-900">
                    Lengkapi Data Diri Penyewa &amp; Jadwal Acara
                  </h2>
                  <p className="text-xs text-stone-500 font-light">
                    Pastikan data akurat untuk pencatatan perjanjian sewa dan penjadwalan fitting studio
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">
                      Nama Lengkap Penyewa <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={renterDetails.name}
                      onChange={(e) => {
                        setRenterDetails({ name: e.target.value });
                        if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                      }}
                      placeholder="Contoh: Sarah Nadia, S.I.Kom"
                      className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-red-500 outline-hidden ${
                        formErrors.name ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-[10px] text-rose-500">{formErrors.name}</p>
                    )}
                  </div>

                  {/* No WhatsApp */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">
                      Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={renterDetails.phone}
                      onChange={(e) => {
                        setRenterDetails({ phone: e.target.value });
                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                      }}
                      placeholder="Contoh: 081234567890"
                      className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-red-500 outline-hidden ${
                        formErrors.phone ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="text-[10px] text-rose-500">{formErrors.phone}</p>
                    )}
                  </div>

                  {/* Tanggal Pemakaian */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">
                      Tanggal Acara / Pemakaian <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={rentalDate}
                      onChange={(e) => {
                        setRentalDate(e.target.value);
                        if (formErrors.date) setFormErrors({ ...formErrors, date: '' });
                      }}
                      className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-red-500 outline-hidden ${
                        formErrors.date ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.date && (
                      <p className="text-[10px] text-rose-500">{formErrors.date}</p>
                    )}
                  </div>

                  {/* Durasi Sewa */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">
                      Durasi Sewa
                    </label>
                    <select
                      value={rentalDurationDays}
                      onChange={(e) => setRentalDurationDays(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-red-500 outline-hidden cursor-pointer"
                    >
                      <option value={3}>3 Hari (Standar: Ambil H-1, Hari H, Kembali H+1)</option>
                      <option value={5}>5 Hari (Luar Kota / Acara Panjang)</option>
                      <option value={7}>7 Hari (Paket Adat Lengkap)</option>
                    </select>
                  </div>

                  {/* METODE PENYERAHAN / PENGAMBILAN BUSANA */}
                  <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-xs font-semibold text-stone-700 block">
                      Metode Penyerahan / Pengambilan Busana <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Opsi 1: Ambil di Studio Gallery Senna */}
                      <button
                        type="button"
                        onClick={() => setRenterDetails({ deliveryMethod: 'pickup_studio' })}
                        className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          (renterDetails.deliveryMethod || 'pickup_studio') === 'pickup_studio'
                            ? 'border-red-500 bg-rose-50/50 text-stone-900 shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="text-xs font-bold block text-stone-900">
                              Ambil Sendiri ke Studio Gallery Senna
                            </span>
                            <span className="text-[11px] text-emerald-700 font-medium block">
                              GRATIS • Bisa Free Fitting Langsung
                            </span>
                          </div>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            (renterDetails.deliveryMethod || 'pickup_studio') === 'pickup_studio'
                              ? 'border-red-600 bg-red-600 text-white'
                              : 'border-slate-300'
                          }`}>
                            {(renterDetails.deliveryMethod || 'pickup_studio') === 'pickup_studio' && (
                              <Check className="w-2.5 h-2.5" />
                            )}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 font-light mt-2 pt-2 border-t border-slate-200/60 leading-relaxed">
                          Jl. RA basyid, Gg Kemuning 2 No 28, Labuhan Dalam, Tanjung Senang, Kota Bandar Lampung (09.00 - 16.30 WIB).
                        </p>
                      </button>

                      {/* Opsi 2: Pengiriman Ojek Online (DISABLED / BELUM TERSEDIA) */}
                      <button
                        type="button"
                        disabled
                        className="p-3.5 rounded-xl border text-left flex flex-col justify-between border-slate-200 bg-slate-50/70 text-stone-400 cursor-not-allowed opacity-65"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="text-xs font-bold block text-stone-500">
                              Kirim via Ojek Online (GoSend / Grab) <span className="text-red-500 text-[10px] font-extrabold uppercase bg-red-50 border border-red-100 px-1 py-0.2 rounded ml-1">Belum Tersedia</span>
                            </span>
                            <span className="text-[11px] text-stone-400 font-medium block">
                              Ongkir Ditanggung Penyewa
                            </span>
                          </div>
                          <span className="w-4 h-4 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400 font-light mt-2 pt-2 border-t border-slate-200/60 leading-relaxed">
                          Opsi pengantaran ojek online saat ini belum tersedia. Silakan pilih opsi Ambil Langsung di Studio Senna Gallery.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Alamat Pengiriman Ojol (jika pilih ojol) atau catatan fitting */}
                  {renterDetails.deliveryMethod === 'ojol_delivery' ? (
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-stone-700 block">
                        Alamat Lengkap Pengiriman Ojek Online <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        value={renterDetails.address}
                        onChange={(e) => {
                          setRenterDetails({ address: e.target.value });
                          if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
                        }}
                        rows={2}
                        placeholder="Tuliskan nama jalan, nomor rumah, kelurahan, dan patokan lokasi pengantaran GoSend/Grab..."
                        className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:bg-white focus:border-red-500 outline-hidden ${
                          formErrors.address ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                        }`}
                      />
                      {formErrors.address && (
                        <p className="text-[10px] text-rose-500">{formErrors.address}</p>
                      )}
                    </div>
                  ) : (
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-stone-700 block">
                        Perkiraan Jam Fitting / Pengambilan di Studio
                      </label>
                      <input
                        type="text"
                        value={renterDetails.address}
                        onChange={(e) => setRenterDetails({ address: e.target.value })}
                        placeholder="Contoh: Rencana fitting H-2 tanggal 25 jam 11:00 WIB"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-red-500 outline-hidden"
                      />
                    </div>
                  )}

                  {/* Catatan / Custom Request */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">
                      Catatan Ukuran Khusus / Request Fitting
                    </label>
                    <textarea
                      value={renterDetails.notes}
                      onChange={(e) => setRenterDetails({ notes: e.target.value })}
                      rows={2}
                      placeholder="Contoh: Lingkar dada 90cm, mohon setelan jas disiapkan kemeja putih kerah wing tip."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:bg-white focus:border-red-500 outline-hidden"
                    />
                  </div>
                </div>

                {/* PILIHAN TUJUAN REKENING TRANSFER */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700 block">
                      Pilih Tujuan Pembayaran Transfer:
                    </label>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      a/n Desi Indah Putri
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'bca', name: 'BCA (Desi Indah Putri)' },
                      { id: 'mandiri', name: 'Mandiri (Desi Indah Putri)' },
                      { id: 'bri', name: 'BRI (Desi Indah Putri)' },
                      { id: 'qris', name: 'QRIS Official (Desi Indah Putri)' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedPaymentBank(b.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                          selectedPaymentBank === b.id
                            ? 'border-red-500 bg-rose-50/70 text-red-700 shadow-2xs'
                            : 'border-slate-200 bg-slate-50 text-stone-600 hover:bg-slate-100'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-stone-500 block">
                    Semua rekening resmi atas nama <strong>Desi Indah Putri</strong>. Nomor rekening dan petunjuk konfirmasi akan otomatis disertakan pada langkah berikutnya.
                  </span>
                </div>

                {/* CHECKLIST PERSETUJUAN SEWA (MANDATORY REQUIREMENT) */}
                <div className="pt-3 border-t border-slate-100">
                  <div
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                    className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200 flex items-start gap-3 cursor-pointer hover:bg-orange-50 transition"
                  >
                    <div className="pt-0.5 text-orange-600 shrink-0">
                      {agreedToTerms ? (
                        <CheckSquare className="w-5 h-5 text-red-600" />
                      ) : (
                        <Square className="w-5 h-5 text-stone-400" />
                      )}
                    </div>
                    <div className="space-y-0.5 text-xs text-stone-800">
                      <span className="font-bold block text-stone-900">
                        Persetujuan Syarat &amp; Ketentuan Sewa Busana Senna Gallery
                      </span>
                      <p className="text-[11px] text-stone-600 font-light">
                        Saya menyetujui ketentuan peminjaman busana Senna Gallery, menjaga kondisi busana dari noda permanen dan asap rokok, serta mengembalikan busana tepat waktu sesuai jadwal sewa (bebas biaya dry-clean &amp; cuci steril).
                      </p>
                    </div>
                  </div>
                  {formErrors.terms && (
                    <p className="text-[10px] text-rose-500 mt-1">{formErrors.terms}</p>
                  )}
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN: RINGKASAN TAGIHAN & CTA CHECKOUT (4 Cols Sticky) */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-stone-900 pb-3 border-b border-slate-100">
                  Ringkasan Belanja Sewa
                </h3>

                {/* Price Lines */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Total Tarif Sewa ({getTotalItemsCount()} item)</span>
                    <span className="font-semibold text-stone-900">{formatIDR(getSubtotal())}</span>
                  </div>

                  <div className="flex justify-between text-emerald-700">
                    <span>Biaya Laundry &amp; Dry Cleaning</span>
                    <span className="font-bold">GRATIS</span>
                  </div>

                  <div className="flex justify-between text-emerald-700">
                    <span>Fasilitas Fitting Studio Gallery Senna</span>
                    <span className="font-bold">GRATIS</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Total Tagihan:</span>
                      <span className="text-[10px] text-emerald-600 font-medium">Bebas uang jaminan deposit</span>
                    </div>
                    <span className="text-lg sm:text-xl font-black text-red-600">
                      {formatIDR(getTotalAmount())}
                    </span>
                  </div>
                </div>

                {/* PRIMARY ACTION BUTTON: LANJUT KE PEMBAYARAN (INSTANT CHECKOUT) */}
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 hover:from-red-700 hover:to-orange-600 active:scale-[0.98] text-white py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? 'Membuat Tagihan Pesanan...' 
                      : 'Lanjut ke Pembayaran & Konfirmasi'}
                  </span>
                </button>

                {/* Security badges */}
                <div className="pt-2 text-[11px] text-stone-500 space-y-1.5 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Tanpa deposit jaminan • Syarat praktis &amp; terpercaya</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Busana diserahkan dalam cover steril &amp; wangi</span>
                  </div>
                </div>

              </div>

              <Link
                to="/sewa/katalog"
                className="block text-center text-xs font-semibold text-red-600 hover:underline"
              >
                ← Lanjut Pilih Busana Lainnya
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
