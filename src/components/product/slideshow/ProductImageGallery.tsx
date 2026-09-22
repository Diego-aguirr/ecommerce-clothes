"use client";

import { useState } from "react";
import Image from "next/image";
import { resolveImageSrc, PLACEHOLDER } from "@/lib/image-utils";

// ─── Types ──────────────────────────────────────────────────────
interface ProductImageGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

// ─── Subcomponent: Single image with error handling ─────────────
function GalleryImage({
  src,
  alt,
  className,
  sizes,
  priority = false,
  onError,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onError?: () => void;
}) {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = hasError ? PLACEHOLDER : resolveImageSrc(src);

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => {
        setHasError(true);
        onError?.();
      }}
    />
  );
}

// ─── Layout: Single Image (1 image) ─────────────────────────────
function SingleImageLayout({ images, title }: { images: string[]; title: string }) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      {/* Main image - full width */}
      <div
        className="relative w-full overflow-hidden cursor-zoom-in group rounded-2xl"
        style={{ height: "clamp(400px, 60vh, 700px)" }}
        onClick={() => setFullscreen(true)}
      >
        <GalleryImage
          src={images[0]}
          alt={title}
          className="object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 100vw, 640px"
          priority
        />
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <FullscreenModal
          images={images}
          selectedIndex={0}
          title={title}
          onClose={() => setFullscreen(false)}
        />
      )}
    </>
  );
}

// ─── Layout: Two Images (2 images) ──────────────────────────────
function TwoImageLayout({ images, title }: { images: string[]; title: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-[72px_1fr] lg:grid-cols-[80px_1fr] gap-3">
        {/* Thumbnails */}
        <div className="flex flex-col gap-2 overflow-y-auto py-1 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              onMouseEnter={() => setSelectedIndex(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
              className={[
                "relative w-[72px] h-[72px] shrink-0 overflow-hidden rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111]",
                selectedIndex === idx
                  ? "border-[#111] opacity-100 shadow-sm"
                  : "border-transparent opacity-50 hover:opacity-75 hover:border-gray-200",
              ].join(" ")}
            >
              <GalleryImage
                src={img}
                alt={`${title} miniatura ${idx + 1}`}
                className="object-cover"
                sizes="72px"
              />
            </button>
          ))}
        </div>

        {/* Main image */}
        <div
          className="relative w-full overflow-hidden cursor-zoom-in group rounded-2xl"
          style={{ height: "clamp(380px, 58vh, 640px)" }}
          onClick={() => setFullscreen(true)}
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              className={[
                "absolute inset-0 transition-opacity duration-500",
                selectedIndex === idx ? "opacity-100 z-10" : "opacity-0 z-0",
              ].join(" ")}
            >
              <GalleryImage
                src={img}
                alt={`${title} — vista ${idx + 1}`}
                className="object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                sizes="(max-width: 1024px) 100vw, 640px"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <FullscreenModal
          images={images}
          selectedIndex={selectedIndex}
          title={title}
          onClose={() => setFullscreen(false)}
          onNavigate={setSelectedIndex}
        />
      )}
    </>
  );
}

// ─── Layout: Multiple Images (3+ images) ────────────────────────
function MultiImageLayout({ images, title }: { images: string[]; title: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-[72px_1fr] lg:grid-cols-[80px_1fr] gap-3">
        {/* Thumbnails */}
        <div
          className="flex flex-col gap-2 overflow-y-auto py-1 scrollbar-hide"
          style={{ maxHeight: "clamp(380px, 58vh, 640px)" }}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              onMouseEnter={() => setSelectedIndex(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
              className={[
                "relative w-[72px] h-[72px] shrink-0 overflow-hidden rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111]",
                selectedIndex === idx
                  ? "border-[#111] opacity-100 shadow-sm"
                  : "border-transparent opacity-50 hover:opacity-75 hover:border-gray-200",
              ].join(" ")}
            >
              <GalleryImage
                src={img}
                alt={`${title} miniatura ${idx + 1}`}
                className="object-cover"
                sizes="72px"
              />
            </button>
          ))}
        </div>

        {/* Main image */}
        <div
          className="relative w-full overflow-hidden cursor-zoom-in group rounded-2xl"
          style={{ height: "clamp(380px, 58vh, 640px)" }}
          onClick={() => setFullscreen(true)}
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              className={[
                "absolute inset-0 transition-opacity duration-500",
                selectedIndex === idx ? "opacity-100 z-10" : "opacity-0 z-0",
              ].join(" ")}
            >
              <GalleryImage
                src={img}
                alt={`${title} — vista ${idx + 1}`}
                className="object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                sizes="(max-width: 1024px) 100vw, 640px"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <FullscreenModal
          images={images}
          selectedIndex={selectedIndex}
          title={title}
          onClose={() => setFullscreen(false)}
          onNavigate={setSelectedIndex}
        />
      )}
    </>
  );
}

// ─── Fullscreen Modal ───────────────────────────────────────────
function FullscreenModal({
  images,
  selectedIndex,
  title,
  onClose,
  onNavigate,
}: {
  images: string[];
  selectedIndex: number;
  title: string;
  onClose: () => void;
  onNavigate?: (index: number) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);

  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    onNavigate?.(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    onNavigate?.(newIndex);
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-5 right-5 text-white text-4xl leading-none hover:text-gray-300 transition-colors z-10"
        onClick={onClose}
        aria-label="Cerrar"
      >
        ×
      </button>

      {/* Navigation arrows (only for multiple images) */}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-5xl leading-none hover:text-gray-300 transition-colors z-10 p-2"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Imagen anterior"
          >
            ‹
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-5xl leading-none hover:text-gray-300 transition-colors z-10 p-2"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Imagen siguiente"
          >
            ›
          </button>
        </>
      )}

      {/* Image container */}
      <div
        className="relative w-full max-w-4xl h-[85vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <GalleryImage
          src={images[currentIndex]}
          alt={`${title} — pantalla completa`}
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 896px"
          priority
        />
      </div>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────
export const ProductImageGallery = ({
  images,
  title,
  className = "",
}: ProductImageGalleryProps) => {
  // Garantizar al menos 1 imagen (placeholder si está vacío)
  const safeImages = images.length === 0 ? [""] : images;
  const imageCount = safeImages.length;

  return (
    <div className={className}>
      {imageCount === 1 && <SingleImageLayout images={safeImages} title={title} />}
      {imageCount === 2 && <TwoImageLayout images={safeImages} title={title} />}
      {imageCount >= 3 && <MultiImageLayout images={safeImages} title={title} />}
    </div>
  );
}
