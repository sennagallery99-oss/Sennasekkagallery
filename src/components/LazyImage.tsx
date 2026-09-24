import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon } from 'lucide-react';
import { formatDriveImageUrl, getDriveImageFallbacks, generateResponsiveSrcSet } from '../services/googleDriveService';

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  srcSet?: string;
  sizes?: string;
  responsiveWidths?: number[];
  enableSrcSet?: boolean;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
  placeholderColor?: string;
  rootMargin?: string;
  threshold?: number;
  priority?: boolean;
  blurEffect?: boolean;
  imageSize?: number;
  onLoadComplete?: () => void;
  fallbackIcon?: React.ReactNode;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  srcSet,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  responsiveWidths = [320, 480, 640, 800, 1024, 1280],
  enableSrcSet = true,
  className = '',
  containerClassName = '',
  aspectRatio,
  placeholderColor = 'bg-[#EDE4DC]/50',
  rootMargin = '300px',
  threshold = 0.01,
  priority = false,
  blurEffect = true,
  imageSize = 600,
  onLoadComplete,
  fallbackIcon,
  ...props
}) => {
  const [isInView, setIsInView] = useState<boolean>(priority);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fallback URLs array
  const fallbackUrls = React.useMemo(() => {
    if (!src) return [];
    return getDriveImageFallbacks(src, imageSize);
  }, [src, imageSize]);

  // Compute responsive srcset
  const computedSrcSet = React.useMemo(() => {
    if (srcSet) return srcSet;
    if (!enableSrcSet || !src) return undefined;
    // Only generate srcset on the primary format (index 0) to avoid mixing fallback patterns
    if (currentUrlIndex > 0) return undefined;
    return generateResponsiveSrcSet(src, responsiveWidths);
  }, [srcSet, enableSrcSet, src, responsiveWidths, currentUrlIndex]);

  const activeSrc = fallbackUrls[currentUrlIndex] || formatDriveImageUrl(src, imageSize);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    // Fallback if IntersectionObserver is not supported
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [priority, rootMargin, threshold]);

  // Reset states if src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setCurrentUrlIndex(0);
  }, [src, imageSize]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    if (onLoadComplete) {
      onLoadComplete();
    }
  };

  const handleImageError = () => {
    // Attempt next fallback in array if available
    if (currentUrlIndex < fallbackUrls.length - 1) {
      setCurrentUrlIndex((prev) => prev + 1);
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${placeholderColor} ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Shimmer Placeholder Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-r from-stone-200/60 via-stone-100 to-stone-200/60 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
      )}

      {/* Actual Image when in viewport */}
      {isInView && !hasError && activeSrc && (
        <img
          key={activeSrc}
          src={activeSrc}
          srcSet={computedSrcSet}
          sizes={computedSrcSet ? sizes : undefined}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          referrerPolicy="no-referrer"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            isLoaded 
              ? 'opacity-100 scale-100 filter-none' 
              : `opacity-0 scale-102 ${blurEffect ? 'blur-xs' : ''}`
          } ${className}`}
          {...props}
        />
      )}

      {/* Fallback View on Error or Empty */}
      {(hasError || (!activeSrc && isInView)) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-stone-100/90 text-stone-400 text-center">
          {fallbackIcon || <ImageIcon className="w-8 h-8 opacity-40 mb-1" />}
          <span className="text-[10px] font-medium tracking-wider uppercase text-stone-400 line-clamp-1">
            {alt || 'Foto Senna Gallery'}
          </span>
        </div>
      )}
    </div>
  );
};
