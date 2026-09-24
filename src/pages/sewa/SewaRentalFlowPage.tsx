import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Scissors, 
  CalendarCheck, 
  RotateCcw, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  Phone,
  Sparkles,
  ShoppingBag,
  ChevronRight,
  MapPin,
  MessageCircle,
  FileText
} from 'lucide-react';
import { ADMIN_WA_NUMBER, STUDIO_INFO } from '../../data/packagesData';
import { SEWA_STORE_INFO } from '../../data/sewaProductsData';

export const SewaRentalFlowPage: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Pilih Busana Idaman',
      subtitle: 'Eksplorasi Katalog & Tentukan Look',
      description: 'Pilih model kebaya, setelan jas tuxedo pria, atau gaun pesta favorit dari katalog Senna Gallery Sewa Official. Sesuaikan warna, ukuran, dan tema pernikahan.',
      icon: ShoppingBag,
      badge: 'Langkah 1'
    },
    {
      number: '02',
      title: 'Checkout & Pembayaran',
      subtitle: 'Isi Data Diri & Transfer ke No Rekening',
      description: 'Lengkapi data diri penyewa, no WhatsApp, & tanggal acara (tanpa ribet login/daftar akun), pilih metode penyerahan busana (ambil di studio / ojek online), lalu transfer ke rekening bank resmi Senna Gallery a/n Desi Indah Putri.',
      icon: CalendarCheck,
      badge: 'Langkah 2'
    },
    {
      number: '03',
      title: 'Kirim Bukti & Verifikasi',
      subtitle: 'Konfirmasi WhatsApp & Approval Admin',
      description: 'Kirimkan bukti transfer pembayaran via WhatsApp ke admin kami. Admin segera melakukan verifikasi & approval. Sambil menunggu, Anda bebas menjelajahi fitur lainnya.',
      icon: Scissors,
      badge: 'Langkah 3'
    },
    {
      number: '04',
      title: 'Fitting & Bebas Cuci',
      subtitle: 'Kembalikan H+1 Tanpa Perlu Dicuci',
      description: 'Kunjungi studio Senna Gallery di Bandar Lampung untuk free fitting atau pilih pengiriman via Ojek Online. Kenakan di hari bahagia, lalu kembalikan H+1. Anda TIDAK PERLU mencuci, seluruh proses dry-clean steril ditangani oleh kami!',
      icon: RotateCcw,
      badge: 'Langkah 4'
    }
  ];

  const terms = [
    {
      title: 'Durasi Sewa Standar (3 Hari)',
      desc: 'Paket sewa standar berlaku selama 3 (tiga) hari: H-1 Pengambilan/Fitting akhir, Hari H Acara, dan H+1 Pengembalian busana ke studio. Bisa diperpanjang jika acara di luar kota.'
    },
    {
      title: 'Tanpa Deposit Jaminan',
      desc: 'Penyewa tidak dibebani uang jaminan deposit tunai yang memberatkan. Cukup menunjukkan KTP atau kartu identitas resmi saat serah terima busana di studio.'
    },
    {
      title: 'Bebas Biaya Cuci & Dry Cleaning',
      desc: 'Penyewa DILARANG mencuci atau menyetrika sendiri busana dengan setrika biasa. Semua biaya dry-cleaning profesional dan sterilisasi uap sudah termasuk GRATIS dalam harga sewa.'
    },
    {
      title: 'Keterlambatan Pengembalian',
      desc: 'Keterlambatan pengembalian tanpa konfirmasi sebelumnya dikenakan denda Rp 50.000 / hari / busana demi menjaga komitmen jadwal fitting penyewa berikutnya.'
    },
    {
      title: 'Perubahan Jadwal (Reschedule Fleksibel)',
      desc: 'Perubahan tanggal pemakaian diperbolehkan maksimal 7 hari sebelum jadwal awal, selama busana pengganti masih tersedia pada tanggal baru yang diinginkan.'
    },
    {
      title: 'Garansi Ukuran Pas & Nyaman',
      desc: 'Kami menyediakan fitting langsung di studio Senna Gallery Bandar Lampung dengan bantuan stylist untuk penyesuaian kancing dan kenyamanan pemakaian saat hari H.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* 1. BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/sewa" className="hover:text-red-600 transition">Beranda</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
        <span className="text-stone-900 font-bold">Pusat Bantuan &amp; Panduan Sewa</span>
      </nav>

      {/* 2. HERO BANNER */}
      <section className="bg-gradient-to-r from-stone-900 via-rose-950 to-orange-950 text-white rounded-3xl p-6 sm:p-10 shadow-md">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3 h-3" />
            <span>PANDUAN RESMI PENYEWAAN</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Alur Mudah &amp; Syarat Ketentuan Sewa Busana
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
            Pengalaman menyewa kebaya, jas, dan gaun semudah belanja online. Transparan, aman, didukung transfer rekening terverifikasi, serta garansi kebersihan dry-clean &amp; fitting studio.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/sewa/katalog"
              className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition"
            >
              Mulai Pilih Busana
            </Link>
            <a
              href={`https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent('Halo Stylist Senna Gallery, saya ingin tanya alur sewa busana.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-orange-400" />
              <span>Tanya Admin via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. 4-STEP TIMELINE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-stone-900">
              4 Langkah Mudah Menyewa di Senna Gallery
            </h2>
            <p className="text-xs text-stone-500">
              Alur dari pemesanan hingga pengembalian busana
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                      {step.number}
                    </span>
                    <span className="text-[10px] font-bold text-red-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-red-600 flex items-center justify-center border border-orange-100">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-orange-600 font-semibold mt-0.5">
                      {step.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SYARAT & KETENTUAN */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <FileText className="w-5 h-5 text-red-600" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Syarat &amp; Ketentuan Penyewaan (S&amp;K)
            </h2>
            <p className="text-xs text-stone-500">
              Panduan transparansi hak dan kewajiban penyewa busana di Senna Gallery Official
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {terms.map((term, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-stone-50 border border-slate-200 space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                <h4 className="text-xs font-bold text-stone-900">
                  {term.title}
                </h4>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed pl-6 font-light">
                {term.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. STUDIO FITTING LOCATION & FAST CHAT */}
      <section className="bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-stone-900">
              Studio Fitting Senna Gallery
            </h3>
            <p className="text-xs text-stone-600">
              {SEWA_STORE_INFO.studioAddress}
            </p>
            <p className="text-[11px] text-orange-800 font-semibold">
              Buka Setiap Hari: {SEWA_STORE_INFO.operatingHours} (Disarankan reservasi H-1 via WA)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/sewa/katalog"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-stone-800 text-xs font-bold hover:bg-slate-50 transition"
          >
            Lihat Katalog Busana
          </Link>
          <a
            href={`https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent('Halo Admin Senna Gallery, saya ingin booking jadwal fitting di studio.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Jadwalkan Fitting</span>
          </a>
        </div>
      </section>

    </div>
  );
};
