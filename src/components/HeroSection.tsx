import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Phone, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  ShieldCheck, 
  Star,
  Film,
  Clock,
  Palette,
  ShoppingBag
} from 'lucide-react';
import { CINEMATIC_VIDEOS, ADMIN_WA_NUMBER, STUDIO_INFO } from '../data/packagesData';
import { useSewaStore } from '../store/sewaStore';

interface HeroSectionProps {
  onExplorePackages: () => void;
  onExplorePortfolio?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onExplorePackages,
  onExplorePortfolio 
}) => {
  const { webSettings } = useSewaStore();
  
  const [videoIndex, setVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentVideo = CINEMATIC_VIDEOS[videoIndex] || CINEMATIC_VIDEOS[0];

  useEffect(() => {
    setVideoLoaded(false);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, [videoIndex]);

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

  // Custom values from settings
  const hasCustomBg = !!webSettings?.heroBackgroundImage;
  const customBgUrl = webSettings?.heroBackgroundImage;
  const videoSourceUrl = webSettings?.heroVideoUrl || currentVideo.url;

  return (
    <section id="hero-section" className="relative min-h-[94vh] flex items-center justify-center overflow-hidden bg-[#181312]">
      
      {/* Background Media - Image or Video */}
      {hasCustomBg ? (
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <img
            src={customBgUrl}
            alt="Hero Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover scale-105 filter brightness-[0.72] contrast-[1.08] transition-opacity duration-1000"
          />
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <video
            ref={videoRef}
            key={videoSourceUrl}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            poster={currentVideo.poster}
            className={`w-full h-full object-cover scale-105 filter brightness-[0.72] contrast-[1.08] transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-100' : 'opacity-80'
            }`}
          >
            <source src={videoSourceUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Romantic Cinematic Vignette & Warm Rose Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#181312] via-[#1C1615]/55 to-black/65 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(194,130,116,0.12),_rgba(24,19,18,0.85))] pointer-events-none" />

      {/* Hero Content Box */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center text-white">
        
        {/* Top Tagline Pill with Romantic Styling & Studio Hours */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-[#C28274]/30 text-[#F5D0C5] text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.28em] mb-8 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-[#E6B8A2] animate-pulse" />
          <span>{webSettings?.heroTaglineText || 'Vendor Pernikahan Mewah & Elegan Lampung'}</span>
          <span className="text-white/40 hidden sm:inline">•</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[#E5E1DA]">
            <Clock className="w-3 h-3 text-[#E6B8A2]" />
            Studio: 09.00 - 16.30 WIB
          </span>
        </div>

        {/* Main Headline with Editorial Romantic Serif */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight mb-6 leading-[1.08] text-balance">
          {webSettings?.heroTitleLine1 || 'Wujudkan Momen Sakral'} <br className="hidden sm:block" />
          <span className="italic font-light text-[#F7DCD3]">{webSettings?.heroTitleLine2 || 'Penuh Keanggunan & Cinta'}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-stone-300 text-xs sm:text-base max-w-2xl mx-auto font-light leading-relaxed mb-10 text-balance tracking-wide">
          {webSettings?.heroSubtitle || 'Sentuhan mahakarya riasan pengantin flawless berkelas dunia oleh Senna MUA Gallery, dekorasi pelaminan estetik & megah oleh Sekka Design, serta koleksi gaun & kebaya pengantin siap fitting di studio.'}
        </p>


        {/* CTA Buttons with High-Contrast Romantic Styling */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3.5 sm:gap-4 mb-14">
          
          <button
            id="hero-explore-packages-btn"
            onClick={onExplorePackages}
            className="w-full sm:w-auto bg-[#FAF6F0] text-[#1C1615] hover:bg-white text-xs uppercase tracking-[0.2em] font-semibold px-7 py-4 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Lihat Paket Wedding Promo</span>
            <ArrowRight className="w-4 h-4 text-[#C28274]" />
          </button>

          {/* Dedicated Sewa Busana Button in Dashboard / Main Page */}
          <Link
            id="hero-sewa-btn"
            to="/sewa"
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white text-xs uppercase tracking-[0.2em] font-bold px-7 py-4 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            <span>Sewa Busana (Kebaya &amp; Jas)</span>
            <span className="bg-white/20 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
              BARU
            </span>
          </Link>

          {onExplorePortfolio && (
            <button
              id="hero-explore-portfolio-btn"
              onClick={onExplorePortfolio}
              className="w-full sm:w-auto bg-[#C28274]/90 hover:bg-[#C28274] text-white text-xs uppercase tracking-[0.2em] font-semibold px-7 py-4 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
            >
              <Palette className="w-4 h-4 text-[#F7DCD3]" />
              <span>Slideshow &amp; Koleksi Gaun</span>
            </button>
          )}

          <a
            id="hero-wa-consult-btn"
            href={`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin%20Senna%20MUA%20%26%20Sekka%20Design,%20saya%20tertarik%20untuk%20konsultasi%20paket%20wedding%20dan%20fitting%20busana.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/25 text-white text-xs uppercase tracking-[0.2em] font-semibold px-6 py-4 rounded-full transition-all flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4 text-[#E6B8A2]" />
            <span>Chat Admin WhatsApp</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-8 border-t border-white/10 text-[11px] uppercase tracking-wider text-stone-300 font-medium">
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <Star className="w-3.5 h-3.5 text-[#E6B8A2] fill-[#E6B8A2]" />
            <span>500+ Pengantin Puas</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E6B8A2]" />
            <span>Complexion 16+ Jam</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E6B8A2]" />
            <span>Garansi Tepat Waktu</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <Clock className="w-3.5 h-3.5 text-[#E6B8A2]" />
            <span>Buka 09.00 - 16.30 WIB</span>
          </div>
        </div>
      </div>

      {/* Video Control Widget (Bottom Right) with Scene Info */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/20 text-white text-xs shadow-xl">
        <button
          onClick={togglePlay}
          className="p-2 hover:bg-white/20 rounded-full transition cursor-pointer"
          title={isPlaying ? 'Pause Video Latar' : 'Putar Video Latar'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={toggleMute}
          className="p-2 hover:bg-white/20 rounded-full transition cursor-pointer"
          title={isMuted ? 'Buka Suara' : 'Bisukan Suara'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setVideoIndex((prev) => (prev + 1) % CINEMATIC_VIDEOS.length)}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 hover:bg-white/25 transition font-semibold cursor-pointer"
          title="Ganti Scene Video Sinematik"
        >
          <Film className="w-3 h-3 text-[#E6B8A2]" />
          <span>Scene {videoIndex + 1}/{CINEMATIC_VIDEOS.length}</span>
        </button>
      </div>

      {/* Current Video Scene Tagline (Bottom Left) */}
      <div className="hidden md:flex absolute bottom-6 left-6 z-20 items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-[11px] text-stone-300">
        <span className="w-2 h-2 rounded-full bg-[#C28274] animate-ping" />
        <span className="text-white font-medium">{currentVideo.title}</span>
        <span className="text-stone-400 text-[10px]">&bull; {currentVideo.subtitle}</span>
      </div>

    </section>
  );
};
