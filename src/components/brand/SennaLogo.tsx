import React from 'react';
import { useSewaStore } from '../../store/sewaStore';

interface SennaLogoProps {
  variant?: 'full' | 'emblem' | 'horizontal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'gold' | 'light' | 'dark';
}

/**
 * Official Brand Logo Component for SENNA SEKKA
 * Recreates the luxury gold interlocking "SS" monogram with central needle, 
 * diamond sparkle stars, and elegant serif typography.
 */
export const SennaLogo: React.FC<SennaLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  theme = 'gold',
}) => {
  const store = useSewaStore();
  const webLogoUrl = store?.webSettings?.webLogoUrl;
  const webName = store?.webSettings?.webName || 'SENNA';

  const sizeStyles = {
    xs: { emblem: 'w-6 h-6', full: 'h-7', text: 'text-xs tracking-[0.2em]' },
    sm: { emblem: 'w-8 h-8', full: 'h-9', text: 'text-sm tracking-[0.22em]' },
    md: { emblem: 'w-11 h-11', full: 'h-12', text: 'text-base sm:text-lg tracking-[0.25em]' },
    lg: { emblem: 'w-14 h-14', full: 'h-16', text: 'text-xl sm:text-2xl tracking-[0.28em]' },
    xl: { emblem: 'w-20 h-20', full: 'h-24', text: 'text-2xl sm:text-3xl tracking-[0.3em]' },
  };

  const isLight = theme === 'light';

  // If a custom image logo exists, use that directly!
  if (webLogoUrl) {
    const heightMap = { xs: 'h-6', sm: 'h-8', md: 'h-11', lg: 'h-14', xl: 'h-20' };
    return (
      <div className={`inline-flex items-center gap-2 group select-none ${className}`}>
        <img 
          src={webLogoUrl} 
          alt={webName} 
          referrerPolicy="no-referrer"
          className={`${heightMap[size] || 'h-11'} object-contain transition-transform duration-300 group-hover:scale-105`}
        />
        {variant !== 'emblem' && (
          <span className={`font-serif uppercase tracking-widest font-bold ${isLight ? 'text-white' : 'text-[#8C5C1B]'}`}>
            {webName}
          </span>
        )}
      </div>
    );
  }

  // Emblem Vector: Interlocking 'SS' Monogram + Vertical Needle + Diamond Sparkles
  const emblemSvg = (
    <svg
      viewBox="0 0 400 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-sm select-none"
      aria-label="Senna Sekka SS Monogram"
    >
      <defs>
        {/* Luxury 3D Gold Gradients matching uploaded Senna.png */}
        <linearGradient id="sennaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C99738" />
          <stop offset="22%" stopColor="#FFF4D0" />
          <stop offset="45%" stopColor="#E2B452" />
          <stop offset="68%" stopColor="#8C5C1B" />
          <stop offset="85%" stopColor="#F9E29D" />
          <stop offset="100%" stopColor="#B37C24" />
        </linearGradient>

        <linearGradient id="sennaGoldShine" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFBE6" />
          <stop offset="25%" stopColor="#DEAB41" />
          <stop offset="60%" stopColor="#F5DC88" />
          <stop offset="100%" stopColor="#7A4D12" />
        </linearGradient>

        <linearGradient id="sennaNeedleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C99738" />
          <stop offset="50%" stopColor="#FFF9E0" />
          <stop offset="100%" stopColor="#B37C24" />
        </linearGradient>

        {/* Subtle drop shadow */}
        <filter id="sennaGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#452605" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter="url(#sennaGlow)">
        {/* Central Vertical Needle Axis */}
        <line
          x1="200"
          y1="25"
          x2="200"
          y2="455"
          stroke="url(#sennaNeedleGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Top Needle Star Finial */}
        <path
          d="M200 12 L204 22 L214 25 L204 28 L200 38 L196 28 L186 25 L196 22 Z"
          fill="url(#sennaGoldShine)"
        />

        {/* Bottom Needle Star Finial */}
        <path
          d="M200 442 L204 452 L214 455 L204 458 L200 468 L196 458 L186 455 L196 452 Z"
          fill="url(#sennaGoldShine)"
        />

        {/* Left Letter 'S' */}
        <path
          d="M 215 138
             C 215 138 215 105 175 105
             C 135 105 130 142 150 168
             C 172 195 240 235 240 295
             C 240 355 178 375 125 350
             C 85 330 82 285 82 285
             C 82 285 92 280 100 295
             C 112 322 145 342 178 335
             C 212 328 220 290 200 265
             C 178 238 110 200 110 148
             C 110 92 165 75 212 92
             Z"
          fill="url(#sennaGoldGrad)"
          stroke="url(#sennaGoldShine)"
          strokeWidth="1.5"
        />

        {/* Upper serif finial for left 'S' */}
        <path
          d="M 212 90 L 215 140 L 202 120 Z"
          fill="url(#sennaGoldShine)"
        />

        {/* Left 'S' sweeping outer bottom loop (classic couture ribbon loop) */}
        <path
          d="M 125 350
             C 70 320 62 250 105 218
             C 128 200 152 205 160 215
             C 142 215 118 225 100 248
             C 80 272 85 315 125 350 Z"
          fill="url(#sennaGoldGrad)"
          opacity="0.85"
        />

        {/* Right Letter 'S' - Interlocking through Left 'S' */}
        <path
          d="M 270 200
             C 270 170 250 152 215 152
             C 195 152 180 162 175 172
             C 170 182 178 190 188 185
             C 198 180 208 175 220 175
             C 245 175 258 192 255 215
             C 250 248 195 285 185 315
             C 175 348 185 390 215 408
             C 250 425 285 395 288 355
             C 290 325 280 305 280 305
             C 280 305 272 312 270 325
             C 268 348 248 375 225 375
             C 205 375 198 355 202 338
             C 208 315 252 280 272 250
             C 285 230 288 212 270 200 Z"
          fill="url(#sennaGoldShine)"
          stroke="url(#sennaGoldGrad)"
          strokeWidth="1.2"
        />

        {/* Right 'S' Upper Elegant Serif Horn */}
        <path
          d="M 270 198 L 272 152 L 255 175 Z"
          fill="url(#sennaGoldGrad)"
        />

        {/* Right 'S' Lower Elegant Tail Descender */}
        <path
          d="M 185 348 L 182 410 L 198 385 Z"
          fill="url(#sennaGoldShine)"
        />

        {/* Center Sparkle Star inside Monogram loop */}
        <path
          d="M 200 260 L 204 272 L 216 276 L 204 280 L 200 292 L 196 280 L 184 276 L 196 272 Z"
          fill="url(#sennaGoldShine)"
        />

        {/* Second smaller diamond facet */}
        <path
          d="M 200 230 L 202 236 L 208 238 L 202 240 L 200 246 L 198 240 L 192 238 L 198 236 Z"
          fill="url(#sennaGoldGrad)"
          opacity="0.9"
        />
      </g>
    </svg>
  );

  // Emblem Only View
  if (variant === 'emblem') {
    return (
      <div className={`inline-flex items-center justify-center ${sizeStyles[size].emblem} ${className}`}>
        {emblemSvg}
      </div>
    );
  }

  // Horizontal Compact Lockup: [Emblem] SENNA & SEKKA
  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
        <div className={`shrink-0 ${sizeStyles[size].emblem}`}>
          {emblemSvg}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-serif uppercase font-medium tracking-[0.22em] ${
                isLight ? 'text-white' : 'text-[#2D2013]'
              }`}
              style={{
                background: isLight
                  ? undefined
                  : 'linear-gradient(135deg, #7A4D12 0%, #C99738 45%, #8C5C1B 100%)',
                WebkitBackgroundClip: isLight ? undefined : 'text',
                WebkitTextFillColor: isLight ? undefined : 'transparent',
              }}
            >
              SENNA SEKKA
            </span>
          </div>
          <span
            className={`text-[8px] sm:text-[9px] uppercase tracking-[0.28em] font-semibold ${
              isLight ? 'text-stone-300' : 'text-[#8C5C1B]'
            }`}
          >
            MUA Gallery &amp; Couture
          </span>
        </div>
      </div>
    );
  }

  // Full Lockup matching the exact uploaded image layout:
  // "SENNA" [ Interlocking SS Monogram with Needle & Stars ] "SEKKA"
  return (
    <div className={`inline-flex items-center justify-center gap-2 sm:gap-3.5 group select-none ${className}`}>
      {/* Left Typography: SENNA */}
      <span
        className={`font-serif font-normal uppercase ${sizeStyles[size].text} ${
          isLight ? 'text-white' : 'text-[#8C5C1B]'
        }`}
        style={{
          fontFamily: "'Cinzel', 'Playfair Display', 'Cormorant Garamond', 'Didot', serif",
          background: isLight
            ? undefined
            : 'linear-gradient(135deg, #7A4D12 0%, #C99738 50%, #8C5C1B 100%)',
          WebkitBackgroundClip: isLight ? undefined : 'text',
          WebkitTextFillColor: isLight ? undefined : 'transparent',
        }}
      >
        SENNA
      </span>

      {/* Center SS Monogram with vertical needle and stars */}
      <div className={`shrink-0 ${sizeStyles[size].emblem} transition-transform duration-300 group-hover:scale-105`}>
        {emblemSvg}
      </div>

      {/* Right Typography: SEKKA */}
      <span
        className={`font-serif font-normal uppercase ${sizeStyles[size].text} ${
          isLight ? 'text-white' : 'text-[#8C5C1B]'
        }`}
        style={{
          fontFamily: "'Cinzel', 'Playfair Display', 'Cormorant Garamond', 'Didot', serif",
          background: isLight
            ? undefined
            : 'linear-gradient(135deg, #7A4D12 0%, #C99738 50%, #8C5C1B 100%)',
          WebkitBackgroundClip: isLight ? undefined : 'text',
          WebkitTextFillColor: isLight ? undefined : 'transparent',
        }}
      >
        SEKKA
      </span>
    </div>
  );
};
