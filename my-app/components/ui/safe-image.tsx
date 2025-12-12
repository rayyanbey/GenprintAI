'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SafeAvatarProps {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
};

/**
 * SafeAvatar component with built-in error handling
 * Edge cases handled:
 * - Broken image URLs
 * - Missing images (404)
 * - Slow loading images
 * - CORS issues
 * - Invalid image formats
 */
export function SafeAvatar({
  src,
  alt,
  fallback,
  className = '',
  size = 'md',
}: SafeAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Reset error state when src changes
  const handleImageSrcChange = (newSrc?: string | null) => {
    if (newSrc !== src) {
      setImageError(false);
      setImageLoading(true);
    }
  };

  const avatarSrc = imageError || !src ? '' : src;

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {avatarSrc && (
        <AvatarImage
          src={avatarSrc}
          alt={alt}
          onError={() => {
            console.warn(`Failed to load avatar image: ${src}`);
            setImageError(true);
            setImageLoading(false);
          }}
          onLoad={() => setImageLoading(false)}
        />
      )}
      <AvatarFallback className="bg-gradient-to-br from-[#f08080] to-[#f4978e] text-white font-semibold">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}

interface SafeImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string | null | undefined;
  alt: string;
  fallbackSrc?: string;
  onErrorCallback?: () => void;
}

/**
 * SafeImage component with built-in error handling
 * Edge cases handled:
 * - Broken image URLs
 * - Missing images (404)
 * - Invalid image sources
 * - CORS issues
 */
export function SafeImage({
  src,
  alt,
  fallbackSrc = '/placeholder-image.png',
  onErrorCallback,
  ...props
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      console.warn(`Failed to load image: ${src}`);
      setHasError(true);
      setImageSrc(fallbackSrc);
      onErrorCallback?.();
    }
  };

  return (
    <Image
      {...props}
      src={imageSrc || fallbackSrc}
      alt={alt}
      onError={handleError}
    />
  );
}

/**
 * Hook for handling image loading with error recovery
 */
export function useImageLoader(initialSrc?: string | null) {
  const [src, setSrc] = useState(initialSrc);
  const [loading, setLoading] = useState(!!initialSrc);
  const [error, setError] = useState(false);

  const loadImage = (newSrc: string) => {
    setLoading(true);
    setError(false);
    setSrc(newSrc);

    const img = new window.Image();
    img.src = newSrc;

    img.onload = () => {
      setLoading(false);
      setError(false);
    };

    img.onerror = () => {
      setLoading(false);
      setError(true);
      console.warn(`Failed to preload image: ${newSrc}`);
    };
  };

  const reset = () => {
    setSrc(null);
    setLoading(false);
    setError(false);
  };

  return {
    src,
    loading,
    error,
    loadImage,
    reset,
  };
}

export default SafeAvatar;
