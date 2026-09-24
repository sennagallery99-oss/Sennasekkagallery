import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Crown, ArrowRight, ShieldCheck, Gem } from 'lucide-react';
import { SennaLogo } from '../brand/SennaLogo';

interface SewaSplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const SewaSplashScreen: React.FC<SewaSplashScreenProps> = ({
  onComplete,
  durationMs = 1800,
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Smooth progress increment
    const interval = 20;
    const step = 100 / (durationMs / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 400);
          }, 200);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [durationMs, onComplete]);

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onComplete, 200);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="senna-sewa-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(8px)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#151211] text-white select-none overflow-hidden"
        >
          {/* Ambient Luxury Background Lights & Radial Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(194,130,116,0.25),rgba(21,18,17,0.95))]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#C28274]/15 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[350px] h-[150px] bg-[#B28E5C]/15 rounded-full blur-[80px] pointer-events-none" />

          {/* Subtle Golden Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(245, 208, 197, 0.8) 1px, transparent 1px)`,
              backgroundSize: '28px 28px'
            }}
          />

          {/* Skip Button in Top Right */}
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-semibold text-stone-300 hover:text-white uppercase tracking-wider backdrop-blur-md transition cursor-pointer"
          >
            <span>Lewati</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {/* Central Animated Content Card */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg mx-auto">
            
            {/* 1. Animated Monogram Logo with Pulsing Glow Ring */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-6"
            >
              {/* Outer Golden Glow Rings */}
              <motion.div
                animate={{
                  scale: [1, 1.18, 1],
                  opacity: [0.35, 0.75, 0.35],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -inset-4 rounded-full bg-gradient-to-tr from-[#D4AF37]/30 via-[#C28274]/30 to-[#F5D0C5]/20 blur-md pointer-events-none"
              />

              <div className="relative p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#251D1B] to-[#1C1615] border border-[#C28274]/40 shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                <SennaLogo variant="emblem" size="xl" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_4px_12px_rgba(212,175,55,0.4)]" />
              </div>

              {/* Floating Sparkle Icon */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-1 -right-1 p-1 rounded-full bg-[#D4AF37] text-stone-900 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </motion.div>
            </motion.div>

            {/* 2. Brand Tagline Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C28274]/20 border border-[#C28274]/40 text-[#F5D0C5] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] mb-3"
            >
              <Crown className="w-3 h-3 text-[#E6B8A2]" />
              <span>Official Bridal Rental Atelier</span>
            </motion.div>

            {/* 3. Main Brand Title: SENNA SEWA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-1.5"
            >
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E9] via-[#F5D0C5] to-[#D4AF37] drop-shadow-sm">
                SENNA SEWA
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 font-light tracking-wider max-w-xs sm:max-w-sm mx-auto">
                Katalog Penyewaan Kebaya, Jas &amp; Gaun Pengantin Premium
              </p>
            </motion.div>

            {/* 4. Luxury Animated Progress Bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="w-48 sm:w-64 mt-8 space-y-2"
            >
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10 backdrop-blur-xs">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#C28274] via-[#E6B8A2] to-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.7)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'linear' }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-400 tracking-wider">
                <span className="flex items-center gap-1 text-[#E6B8A2]">
                  <Gem className="w-2.5 h-2.5" /> Menyiapkan Koleksi...
                </span>
                <span className="font-mono font-semibold text-stone-300">{Math.round(progress)}%</span>
              </div>
            </motion.div>

            {/* 5. Trust Guarantee Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-6 flex items-center justify-center gap-4 text-[10px] text-stone-400"
            >
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Free Fitting Studio
              </span>
              <span>•</span>
              <span>100% Steril Dry Clean</span>
              <span>•</span>
              <span>Bandar Lampung</span>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
