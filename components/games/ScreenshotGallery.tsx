'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScreenshotGalleryProps {
  screenshots: string[];
  gameTitle: string;
}

export function ScreenshotGallery({ screenshots, gameTitle }: ScreenshotGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openModal = (index: number) => {
    setSelectedIndex(index);
  };

  const closeModal = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + screenshots.length) % screenshots.length);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % screenshots.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  return (
    <>
      {/* Screenshot Grid */}
      <div className="grid grid-cols-2 gap-4">
        {screenshots.map((screenshot, index) => (
          <div
            key={index}
            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group transition-transform hover:scale-[1.02]"
            onClick={() => openModal(index)}
          >
            <Image
              src={screenshot}
              alt={`${gameTitle} screenshot ${index + 1}`}
              fill
              className="object-cover transition-opacity group-hover:opacity-80"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
            {/* Overlay hint */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-semibold px-3 py-1 rounded-full"
                style={{
                  background: "rgba(0, 0, 0, 0.6)",
                  backdropFilter: "blur(4px)",
                }}
              >
                Click to enlarge
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal/Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-[10000] p-2 rounded-full transition-all hover:scale-110"
            style={{
              background: "rgba(100, 200, 100, 0.2)",
              border: "1px solid rgba(200, 240, 200, 0.3)",
              color: "rgba(200, 240, 200, 0.95)",
            }}
            aria-label="Close"
          >
            <X size={24} />
          </button>

          {/* Previous Button */}
          {screenshots.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 z-[10000] p-3 rounded-full transition-all hover:scale-110"
              style={{
                background: "rgba(100, 200, 100, 0.2)",
                border: "1px solid rgba(200, 240, 200, 0.3)",
                color: "rgba(200, 240, 200, 0.95)",
              }}
              aria-label="Previous screenshot"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Image Container */}
          <div
            className="relative max-w-7xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={screenshots[selectedIndex]}
                alt={`${gameTitle} screenshot ${selectedIndex + 1}`}
                width={1920}
                height={1080}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                style={{
                  boxShadow: "0 0 40px rgba(100, 200, 100, 0.3)",
                }}
              />
            </div>
            
            {/* Image Counter */}
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: "rgba(0, 0, 0, 0.7)",
                border: "1px solid rgba(200, 240, 200, 0.2)",
                color: "rgba(200, 240, 200, 0.95)",
                backdropFilter: "blur(4px)",
              }}
            >
              {selectedIndex + 1} / {screenshots.length}
            </div>
          </div>

          {/* Next Button */}
          {screenshots.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 z-[10000] p-3 rounded-full transition-all hover:scale-110"
              style={{
                background: "rgba(100, 200, 100, 0.2)",
                border: "1px solid rgba(200, 240, 200, 0.3)",
                color: "rgba(200, 240, 200, 0.95)",
              }}
              aria-label="Next screenshot"
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      )}
    </>
  );
}

