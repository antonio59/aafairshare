import { useState, useEffect } from 'react';

interface ImageSize {
  width: number;
  height: number;
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

interface ImageSource {
  srcSet: string;
  type: string;
}

const generateSrcSet = (src: string, sizes: number[]): string => {
  return sizes
    .map(size => `${src}?width=${size} ${size}w`)
    .join(', ');
};

const generateWebPSource = (src: string): ImageSource => ({
  srcSet: generateSrcSet(src, [640, 750, 828, 1080, 1200, 1920, 2048, 3840]),
  type: 'image/webp',
});

const generateFallbackSource = (src: string): ImageSource => ({
  srcSet: generateSrcSet(src, [640, 750, 828, 1080, 1200, 1920, 2048, 3840]),
  type: 'image/jpeg',
});

export function OptimizedImage({
  src,
  alt,
  sizes = '100vw',
  className = '',
  priority = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSize({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  if (!src || error) {
    return (
      <div 
        className={`bg-gray-200 ${className}`}
        role="img"
        aria-label={alt}
      />
    );
  }

  const webPSource = generateWebPSource(src);
  const fallbackSource = generateFallbackSource(src);

  return (
    <picture>
      <source {...webPSource} sizes={sizes} />
      <source {...fallbackSource} sizes={sizes} />
      <img
        src={src}
        alt={alt}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        width={imageSize?.width}
        height={imageSize?.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
      />
    </picture>
  );
}
