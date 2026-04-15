"use client";

import { useState, createContext, useContext } from "react";
import Image from "next/image";

// ─── Context ────────────────────────────────────────────────────
type Ctx = {
  selectedImage: number;
  setSelectedImage: React.Dispatch<React.SetStateAction<number>>;
  safeImages: string[];
  title: string;
};

const SlideshowContext = createContext<Ctx | null>(null);

function useCtx(): Ctx {
  const ctx = useContext(SlideshowContext);
  if (!ctx) throw new Error("Must be inside <ProductSlideshow>");
  return ctx;
}

// ─── Helpers ────────────────────────────────────────────────────
const PLACEHOLDER = "/imgs/placeholder.jpg";

function Img({
  src,
  alt,
  className,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [err, setErr] = useState(false);

  const resolved = err
    ? PLACEHOLDER
    : src.startsWith("http") || src.startsWith("/")
    ? src
    : `/products/${src}`;

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setErr(true)}
    />
  );
}

// ─── Column 1: Thumbnails ────────────────────────────────────────
export function ProductThumbnails() {
  const { safeImages, selectedImage, setSelectedImage, title } = useCtx();
  if (safeImages.length <= 1) return null;

  return (
    <div
      className="flex flex-col gap-3 overflow-y-auto py-1 scrollbar-hide"
      style={{ maxHeight: "clamp(380px, 58vh, 640px)" }}
    >
      {safeImages.map((img, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => setSelectedImage(idx)}
          onMouseEnter={() => setSelectedImage(idx)}
          aria-label={`Ver imagen ${idx + 1}`}
          className={[
            "relative w-[72px] h-[72px] shrink-0 overflow-hidden rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111]",
            selectedImage === idx
              ? "border-[#111] opacity-100 shadow-sm"
              : "border-transparent opacity-50 hover:opacity-75 hover:border-gray-200",
          ].join(" ")}
        >
          <Img src={img} alt={`${title} ${idx + 1}`} className="object-cover" sizes="72px" />
        </button>
      ))}
    </div>
  );
}

// ─── Column 2: Main Image ────────────────────────────────────────
export function ProductMainImage() {
  const { safeImages, selectedImage, title } = useCtx();
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      {/* Main image container */}
      <div
        className="relative w-full overflow-hidden cursor-zoom-in group"
        style={{ height: "clamp(380px, 58vh, 640px)" }}
        onClick={() => setFullscreen(true)}
      >
        {safeImages.map((img, idx) => (
          <div
            key={idx}
            className={[
              "absolute inset-0 transition-opacity duration-500",
              selectedImage === idx ? "opacity-100 z-10" : "opacity-0 z-0",
            ].join(" ")}
          >
            <Img
              src={img}
              alt={`${title} — vista ${idx + 1}`}
              className="object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 1024px) 100vw, 640px"
              priority={idx === 0}
            />
          </div>
        ))}
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFullscreen(false)}
        >
          <button
            className="absolute top-5 right-5 text-white text-4xl leading-none hover:text-gray-300 transition-colors z-10"
            onClick={() => setFullscreen(false)}
            aria-label="Cerrar"
          >
            ×
          </button>
          <div
            className="relative w-full max-w-4xl h-[85vh] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <Img
              src={safeImages[selectedImage]}
              alt={`${title} — pantalla completa`}
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}

// ─── Provider (default export) ──────────────────────────────────
interface Props {
  images: string[];
  title: string;
  className?: string;
  children?: React.ReactNode;
}

export default function ProductSlideshow({ images, title, className = "", children }: Props) {
  const safeImages = images.length === 0 ? [""] : images;
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <SlideshowContext.Provider value={{ selectedImage, setSelectedImage, safeImages, title }}>
      <div className={className}>{children}</div>
    </SlideshowContext.Provider>
  );
}
