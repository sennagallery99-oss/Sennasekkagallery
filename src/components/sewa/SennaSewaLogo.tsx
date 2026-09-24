import React from 'react';
import { Link } from 'react-router-dom';
import { useSewaStore } from '../../store/sewaStore';

interface SennaSewaLogoProps {
  variant?: 'default' | 'compact' | 'vertical' | 'icon-only' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withLink?: boolean;
  className?: string;
  useTitleCase?: boolean;
}

/**
 * Official Brand Logo Component for "Senna Sewa"
 * Modern, Simple & Representative:
 * 1. Clean squircle emblem with vibrant Crimson-to-Tangerine Orange gradient
 * 2. Vector mark intertwining the iconic 'S' with couture atelier hanger silhouette & sparkle accent
 * 3. Modern, legible typography pairing Senna & Sewa in high-contrast red-orange harmony
 */
export const SennaSewaLogo: React.FC<SennaSewaLogoProps> = ({
  variant = 'default',
  size = 'md',
  withLink = true,
  className = '',
  useTitleCase = true,
}) => {
  const store = useSewaStore();
  const webLogoUrl = store?.webSettings?.webLogoUrl;
  const webName = store?.webSettings?.webName || 'Senna';

  // Dimensions based on size prop
  const emblemSizes = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 sm:w-11 sm:h-11 rounded-2xl',
    lg: 'w-13 h-13 sm:w-14 sm:h-14 rounded-2xl',
    xl: 'w-16 h-16 sm:w-18 sm:h-18 rounded-3xl',
  };

  if (webLogoUrl) {
    const isWhite = variant === 'white';
    const heightMap = { sm: 'h-8', md: 'h-10 sm:h-11', lg: 'h-13 sm:h-14', xl: 'h-16 sm:h-18' };
    const content = (
      <div className={`flex items-center gap-2.5 group select-none ${className}`}>
        <img 
          src={webLogoUrl} 
          alt={webName} 
          referrerPolicy="no-referrer"
          className={`${heightMap[size] || 'h-10'} object-contain transition-transform duration-300 group-hover:scale-105`}
        />
        {variant !== 'icon-only' && (
          <span className={`font-serif uppercase tracking-widest font-black text-xs sm:text-sm ${isWhite ? 'text-white' : 'text-stone-900'}`}>
            {webName}
          </span>
        )}
      </div>
    );

    if (withLink) {
      return (
        <Link to="/sewa" className="inline-flex items-center cursor-pointer focus:outline-none" aria-label="Senna Sewa">
          {content}
        </Link>
      );
    }
    return content;
  }

  const titleSizes = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px] sm:text-[11px]',
    lg: 'text-xs',
    xl: 'text-xs sm:text-sm',
  };

  const isWhite = variant === 'white';
  const isVertical = variant === 'vertical';
  const isCompact = variant === 'compact';
  const isIconOnly = variant === 'icon-only';

  // Red & Orange Couture Vector Emblem
  const emblem = (
    <div
      className={`relative ${emblemSizes[size]} shrink-0 bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 p-2 shadow-sm shadow-red-600/25 ring-1 ring-white/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 overflow-hidden`}
    >
      {/* Subtle top-left gloss sheen */}
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-white/20 rounded-full blur-[2px] pointer-events-none" />

      {/* Modern Couture Hanger + 'S' Monogram SVG Vector */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] select-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sennaSewaWhiteFlow" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FFF5EB" />
            <stop offset="100%" stopColor="#FED7AA" />
          </linearGradient>
          <linearGradient id="sennaHangerGlow" x1="30" y1="20" x2="70" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFEDD5" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* 1. Atelier Hanger Hook at the apex */}
        <path
          d="M 50 17 C 44 17 42 23 45 26.5 C 47.5 29 50 30.5 50 33"
          stroke="url(#sennaHangerGlow)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* 2. Couture Hanger Shoulders */}
        <path
          d="M 23 42 C 34 35.5 44 33.5 50 33.5 C 56 33.5 66 35.5 77 42"
          stroke="url(#sennaHangerGlow)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* 3. Modern Stylized 'S' Monogram Ribbon */}
        <path
          d="M 68 46.5 C 68 46.5 57 39 46 39 C 36 39 30.5 45 30.5 51.5 C 30.5 61.5 69.5 57.5 69.5 71.5 C 69.5 81.5 59.5 86.5 47 86.5 C 36 86.5 28 81 28 81"
          stroke="url(#sennaSewaWhiteFlow)"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 4. Luxury Sparkle Star Accent */}
        <path
          d="M 72 32 L 73.6 35.8 L 77.5 37.4 L 73.6 39 L 72 42.8 L 70.4 39 L 66.5 37.4 L 70.4 35.8 Z"
          fill="#FFFFFF"
        />

        {/* 5. Minimalist Accent Dot */}
        <circle cx="31" cy="74" r="2.2" fill="#FED7AA" />
      </svg>
    </div>
  );

  if (isIconOnly) {
    if (withLink) {
      return (
        <Link to="/sewa" className={`inline-block group ${className}`} aria-label="Senna Sewa Official">
          {emblem}
        </Link>
      );
    }
    return <div className={className}>{emblem}</div>;
  }

  // Modern Typography Lockup
  const textLockup = (
    <div
      className={`font-sans ${isVertical ? 'text-center mt-2' : 'flex flex-col justify-center'}`}
    >
      {/* Brand Title: Senna Sewa */}
      <div
        className={`flex items-baseline gap-1.5 leading-none tracking-tight ${titleSizes[size]}`}
      >
        <span
          className={`font-black tracking-tight ${
            isWhite ? 'text-white' : 'text-stone-900'
          }`}
        >
          {useTitleCase ? 'Senna' : 'senna'}
        </span>
        <span
          className={`font-black tracking-tight ${
            isWhite
              ? 'text-orange-200'
              : 'bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent'
          }`}
        >
          {useTitleCase ? 'Sewa' : 'sewa'}
        </span>
      </div>

      {/* Subtitle / Category Tagline */}
      {!isCompact && (
        <div
          className={`items-center gap-1.5 mt-1 leading-none ${
            isVertical ? 'justify-center' : ''
          } hidden sm:flex`}
        >
          <span
            className={`font-extrabold uppercase px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] tracking-wider ${
              isWhite
                ? 'bg-white/20 text-orange-100 border border-white/30'
                : 'bg-red-50 text-red-700 border border-red-200/80 font-bold'
            }`}
          >
            OFFICIAL
          </span>
          <span
            className={`font-medium tracking-normal ${subtitleSizes[size]} ${
              isWhite ? 'text-stone-300' : 'text-stone-500'
            }`}
          >
            Rental Busana &amp; Atelier
          </span>
        </div>
      )}
    </div>
  );

  const content = (
    <div
      className={`flex ${isVertical ? 'flex-col items-center' : 'items-center gap-2.5 sm:gap-3'} group select-none ${className}`}
    >
      {emblem}
      {textLockup}
    </div>
  );

  if (withLink) {
    return (
      <Link
        to="/sewa"
        id="senna-sewa-brand-logo"
        className="inline-flex items-center cursor-pointer focus:outline-none"
        aria-label="Senna Sewa - Halaman Utama Rental Busana"
      >
        {content}
      </Link>
    );
  }

  return content;
};

