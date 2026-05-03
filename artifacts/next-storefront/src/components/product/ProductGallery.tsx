'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/types/woocommerce';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  overrideImage?: ProductImage | null;
}

export default function ProductGallery({ images, productName, overrideImage }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (overrideImage) {
      setActiveIndex(-1);
    } else {
      setActiveIndex(0);
    }
  }, [overrideImage]);

  const activeImage = activeIndex === -1 ? overrideImage : (images[activeIndex] ?? images[0]);

  if (images.length === 0 && !overrideImage) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-3xl bg-neutral-100">
        <div className="flex h-full w-full items-center justify-center">
          <svg
            className="h-20 w-20 text-neutral-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-neutral-100 shadow-sm ring-1 ring-neutral-100">
        {activeImage?.src ? (
          <Image
            key={activeImage.src}
            src={activeImage.src}
            alt={activeImage.alt || productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain transition-opacity duration-200"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-20 w-20 text-neutral-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Thumbnails — always show product images */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image.id}-${index}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100 ring-2 transition-all',
                activeIndex === index
                  ? 'ring-accent-500'
                  : 'ring-transparent hover:ring-neutral-300'
              )}
              aria-label={image.alt || `${productName} ${index + 1}`}
            >
              <Image
                src={image.src}
                alt={image.alt || `${productName} ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
