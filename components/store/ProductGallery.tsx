'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[] | null;
  productName: string;
  isLoading?: boolean;
}

export function ProductGallery({ images, productName, isLoading = false }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const imageArray = images && images.length > 0 ? images : [];

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Main image skeleton */}
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
        {/* Thumbnails skeleton */}
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 w-20 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (imageArray.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center text-6xl">📦</div>
    );
  }

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? imageArray.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === imageArray.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden group">
        <img
          src={imageArray[selectedIndex]}
          alt={`${productName} ${selectedIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {imageArray.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded text-sm">
              {selectedIndex + 1} / {imageArray.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imageArray.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {imageArray.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                selectedIndex === index
                  ? 'border-primary-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
