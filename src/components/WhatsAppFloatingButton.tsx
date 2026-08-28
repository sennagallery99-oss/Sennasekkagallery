import React from 'react';
import { MessageCircle } from 'lucide-react';
import { ADMIN_WA_NUMBER } from '../data/packagesData';

export const WhatsAppFloatingButton: React.FC = () => {
  return (
    <aside aria-label="WhatsApp Hotline" className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Floating Prompt Bubble */}
      <a
        id="floating-wa-bubble"
        href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin%20Senna%20MUA%20Gallery%20%26%20Sekka%20Design,%20saya%20ingin%20konsultasi%20paket%20wedding`}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex items-center gap-2 bg-[#F5F2ED]/95 backdrop-blur-md py-2 px-3.5 rounded-full border border-black/10 shadow-lg text-[11px] font-medium tracking-wider uppercase text-stone-900 hover:text-black hover:border-black/30 transition group"
      >
        <span className="w-2 h-2 rounded-full bg-[#8E8271] animate-ping"></span>
        <span>Konsultasi Cepat Admin</span>
      </a>

      {/* Main WhatsApp Button */}
      <a
        id="floating-wa-btn"
        href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin%20Senna%20MUA%20Gallery%20%26%20Sekka%20Design,%20saya%20ingin%20konsultasi%20paket%20wedding`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-[#1A1A1A] hover:bg-black text-white flex items-center justify-center shadow-2xl hover:scale-105 transition duration-300 relative border border-white/20 group"
        aria-label="Chat WhatsApp Admin"
      >
        <MessageCircle className="w-6 h-6 fill-white text-transparent" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8E8271] border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">
          1
        </span>
      </a>
    </aside>
  );
};
