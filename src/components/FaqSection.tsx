import React, { useState } from 'react';
import { ChevronDown, Phone } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Bagaimana alur pemesanan (booking) paket di Senna MUA & Sekka Design?',
      a: 'Sangat mudah! Pilih paket yang Anda minati di halaman Daftar Paket, lalu klik "Booking Sekarang". Jika belum memiliki akun, Anda cukup mendaftar/login secara cepat (nama, email/no HP, dan password). Sistem akan langsung mengarahkan Anda ke WhatsApp Admin dengan format teks detail paket yang dipilih untuk pengecekan ketersediaan tanggal dan jadwal fitting.'
    },
    {
      q: 'Apakah bisa melakukan custom konsep dekorasi pelaminan atau penyesuaian baju adat?',
      a: 'Tentu saja! Kami sangat menyambut konsep kustom (adat Sunda Siger, Jawa Solo/Yogya, Padang/Minang, Melayu, hingga Internasional Modern). Tim Sekka Design akan membuatkan 3D moodboard tata ruang pelaminan dan tim Senna MUA akan menyesuaikan riasan serta aksesoris adat.'
    },
    {
      q: 'Bagaimana sistem pembayaran dan pengikatan tanggal (DP)?',
      a: 'Untuk mengunci tanggal sakral Anda, diperlukan Down Payment (DP) awal sebesar 20-30%. Pelunasan dapat dicicil hingga H-7 sebelum hari acara pernikahan. Semua transaksi dilengkapi dengan Surat Perjanjian Kerja (SPK) resmi bermaterai.'
    },
    {
      q: 'Apakah tersedia sesi tes makeup (makeup trial) sebelum hari H?',
      a: 'Ya, untuk Paket Intimate dan Luxury Royal, sesi konsultasi skin prep dan makeup trial dapat dijadwalkan di studio kami agar Anda merasa 100% yakin dengan look dan shade complexion di hari pernikahan.'
    },
    {
      q: 'Apakah Senna MUA & Sekka Design melayani pernikahan di luar kota?',
      a: 'Ya, kami melayani pemesanan ke seluruh Indonesia (Jabodetabek, Jawa Barat, Jawa Tengah, Jawa Timur, Bali, Sumatra, dan kota lainnya) dengan penyesuaian biaya akomodasi & transportasi tim.'
    }
  ];

  return (
    <section id="faq" className="py-28 bg-[#F5F2ED] border-b border-black/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#8E8271] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.35em] inline-block border-b border-[#8E8271]/40 pb-1">
            Pertanyaan Umum
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#1A1A1A] mt-4 leading-[1.15]">
            Seputar Layanan &amp; Booking
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-3 font-light">
            Jawaban lengkap untuk membantu rencana persiapan pernikahan Anda bersama kami.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-black/10 bg-white overflow-hidden transition shadow-xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="font-serif font-normal text-[#1A1A1A] text-base sm:text-lg">
                    {faq.q}
                  </span>
                  <div className={`p-2 rounded-full bg-[#F5F2ED] text-stone-600 transition-transform duration-300 ${isOpen ? 'rotate-180 text-black' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-stone-600 font-light leading-relaxed border-t border-black/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-white border border-black/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h4 className="font-serif font-normal text-[#1A1A1A] text-lg">Masih ada pertanyaan lain?</h4>
            <p className="text-xs text-stone-600 font-light mt-0.5">Tim representatif kami siap merespons via WhatsApp dalam hitungan menit.</p>
          </div>
          <a
            href="https://wa.me/6282122030072?text=Halo%20Admin,%20saya%20ada%20pertanyaan%20seputar%20paket%20wedding"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-[0.18em] font-semibold px-6 py-3 rounded-full shadow-xs transition shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-[#8E8271]" />
            <span>Chat WhatsApp Sekarang</span>
          </a>
        </div>

      </div>
    </section>
  );
};
