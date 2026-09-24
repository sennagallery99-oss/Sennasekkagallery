import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Clock, Phone, ShieldCheck, Heart, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useSewaStore } from '../../store/sewaStore';
import { ADMIN_WA_NUMBER } from '../../data/packagesData';
import { SEWA_STORE_INFO } from '../../data/sewaProductsData';
import { SennaSewaLogo } from './SennaSewaLogo';

export const SewaFooter: React.FC = () => {
  const store = useSewaStore();
  const webSettings = store?.webSettings;
  const waNumber = webSettings?.contactWhatsapp || ADMIN_WA_NUMBER;
  const addressText = webSettings?.contactAddress || SEWA_STORE_INFO.studioAddress;

  return (
    <footer className="bg-white border-t border-slate-200 text-stone-600 pt-12 pb-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-200">
          
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-3">
            <SennaSewaLogo size="md" />
            <p className="text-xs text-stone-500 leading-relaxed font-light">
              Platform sewa busana pengantin, kebaya modern, dan jas pria resmi persembahan Senna Gallery dengan standar butik dan kepraktisan checkout modern.
            </p>
            <div className="space-y-1 text-xs text-stone-700 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                <span>100% Steril &amp; Bebas Biaya Cuci</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                <span>Free Fitting Langsung di Studio</span>
              </div>
            </div>
          </div>

          {/* Col 2: Kategori Sewa */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-900 tracking-wider uppercase">
              Koleksi Sewa Busana
            </h4>
            <ul className="space-y-2 text-xs text-stone-500">
              <li>
                <Link to="/sewa/katalog?kategori=kebaya" className="hover:text-red-600 transition">
                  Kebaya Modern &amp; Pengantin
                </Link>
              </li>
              <li>
                <Link to="/sewa/katalog?kategori=jas" className="hover:text-red-600 transition">
                  Setelan Jas &amp; Beskap Adat
                </Link>
              </li>
              <li>
                <Link to="/sewa/katalog?kategori=gaun" className="hover:text-red-600 transition">
                  Gaun Resepsi &amp; Evening Gown
                </Link>
              </li>
              <li>
                <Link to="/sewa/katalog?kategori=aksesoris" className="hover:text-red-600 transition">
                  Set Siger Sunda &amp; Aksesoris
                </Link>
              </li>
              <li>
                <Link to="/sewa/katalog" className="hover:text-red-600 font-semibold text-red-600 transition">
                  Semua Koleksi Busana →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Layanan & Bantuan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-900 tracking-wider uppercase">
              Layanan Pelanggan
            </h4>
            <ul className="space-y-2 text-xs text-stone-500">
              <li>
                <Link to="/sewa/cara-sewa" className="hover:text-red-600 transition">
                  Panduan Alur &amp; S&amp;K Sewa
                </Link>
              </li>
              <li>
                <Link to="/sewa/cara-sewa" className="hover:text-red-600 transition">
                  Ketentuan &amp; Kebijakan Sewa
                </Link>
              </li>
              <li>
                <Link to="/sewa/keranjang" className="hover:text-red-600 transition">
                  Keranjang &amp; Status Pesanan
                </Link>
              </li>
              <li className="pt-1">
                <Link to="/" className="text-stone-800 hover:text-red-600 font-medium flex items-center gap-1 transition">
                  <span>Ke Studio MUA &amp; Dekorasi Utama</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Lokasi & Hubungi Toko */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-900 tracking-wider uppercase">
              Studio Fitting &amp; Kontak
            </h4>
            <div className="space-y-2 text-xs text-stone-500">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <span>{addressText}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <Clock className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-800">Buka Setiap Hari:</span>
                  <span className="block text-stone-500">{SEWA_STORE_INFO.operatingHours}</span>
                </div>
              </div>
              <div className="pt-1">
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Stylist Senna Gallery Sewa Official, saya ingin konsultasi fitting busana.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-rose-50 text-red-600 hover:bg-rose-100 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Chat WhatsApp Toko</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3">
          <p>© {new Date().getFullYear()} Senna Gallery Sewa Official Store. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[11px] text-stone-500">
            <span>Dirancang dengan cinta untuk momen berharga pernikahan Anda</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </div>
        </div>

      </div>
    </footer>
  );
};
