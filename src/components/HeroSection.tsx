import React, { useRef, useState } from 'react';
import { Sparkles, ArrowRight, Phone, Volume2, VolumeX, Play, Pause, ShieldCheck, Star } from 'lucide-react';
import { CINEMATIC_VIDEOS, ADMIN_WA_NUMBER } from '../data/packagesData';

interface HeroSectionProps {
  onExplorePackages: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplorePackages }) => {
  const [videoIndex, setVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentVideo = CINEMATIC_VIDEOS[videoIndex] || CINEMATIC_VIDEOS[0];

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section id="hero-section" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#141312]">
      {/* Background Video Cinematic Pendek */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <video
          ref={videoRef}
          key={currentVideo.url}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          poster={currentVideo.poster}
          className="w-full h-full object-cover scale-105 filter brightness-[0.7] contrast-[1.05] transition-opacity duration-1000"
        >
          <source src={currentVideo.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Cinematic Vignette & Editorial Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141312] via-black/40 to-black/60 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/75 pointer-events-none"></div>

      {/* Hero Content Box */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white">
        
        {/* Top Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#E5E1DA] text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.35em] mb-8">
          <Sparkles className="w-3.5 h-3.5 text-[#8E8271]" />
          <span>Vendor Pernikahan Mewah & Terpercaya</span>
        </div>

        {/* Main Headline with Editorial Serif */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight mb-6 leading-[1.08] text-balance">
          Wujudkan Momen Sakral <br className="hidden sm:block" />
          <span className="italic font-light text-[#E5E1DA]">Penuh Keanggunan & Kemegahan</span>
        </h1>

        {/* Subtitle */}
        <p className="text-stone-300 text-xs sm:text-base max-w-2xl mx-auto font-light leading-relaxed mb-12 text-balance tracking-wide">
          Sentuhan mahakarya riasan pengantin flawless berkelas dunia oleh{' '}
          <strong className="text-white font-normal underline decoration-[#8E8271] underline-offset-4">Senna MUA Gallery</strong> serta dekorasi pelaminan megah & estetik oleh{' '}
          <strong className="text-white font-normal underline decoration-[#8E8271] underline-offset-4">Sekka Design</strong>.
        </p>

        {/* CTA Buttons with High-Contrast Editorial Styling */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            id="hero-explore-packages-btn"
            onClick={onExplorePackages}
            className="w-full sm:w-auto bg-[#F5F2ED] text-[#1A1A1A] hover:bg-white text-xs uppercase tracking-[0.2em] font-semibold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Lihat Paket Wedding</span>
            <ArrowRight className="w-4 h-4 text-[#8E8271]" />
          </button>

          <a
            id="hero-wa-consult-btn"
            href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin%20Senna%20MUA%20%26%20Sekka%20Design,%20saya%20tertarik%20untuk%20konsultasi%20paket%20pernikahan%202026.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/25 text-white text-xs uppercase tracking-[0.2em] font-semibold px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4 text-[#8E8271]" />
            <span>Konsultasi WhatsApp Admin</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-8 border-t border-white/10 text-[11px] uppercase tracking-wider text-stone-300 font-medium">
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <Star className="w-3.5 h-3.5 text-[#8E8271] fill-[#8E8271]" />
            <span>500+ Pengantin Puas</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#8E8271]" />
            <span>Complexion 12+ Jam</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8E8271]" />
            <span>Garansi Tepat Waktu</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="font-serif font-bold text-[#8E8271] text-xs">3D</span>
            <span>Custom Decor Concept</span>
          </div>
        </div>
      </div>

      {/* Video Control Widget (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md p-1.5 rounded-full border border-white/15 text-white text-xs">
        <button
          onClick={togglePlay}
          className="p-1.5 hover:bg-white/20 rounded-full transition cursor-pointer"
          title={isPlaying ? 'Pause Video' : 'Play Video'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={toggleMute}
          className="p-1.5 hover:bg-white/20 rounded-full transition cursor-pointer"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setVideoIndex((prev) => (prev + 1) % CINEMATIC_VIDEOS.length)}
          className="text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 transition font-semibold cursor-pointer"
          title="Ganti Scene Video Cinematic"
        >
          Scene {videoIndex + 1}/{CINEMATIC_VIDEOS.length}
        </button>
      </div>
    </section>
  );
};
