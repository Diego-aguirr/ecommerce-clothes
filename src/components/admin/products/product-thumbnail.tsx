"use client";

const FALLBACK = "/imgs/placeholder.jpg";

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
};

export function ProductThumbnail({ src, alt = "Producto", className }: Props) {
  return (
    <img
      src={src || FALLBACK}
      alt={alt}
      className={className}
      onError={(e) => {
        // Si Cloudinary falla o la URL está rota, mostramos el placeholder local
        e.currentTarget.src = FALLBACK;
        e.currentTarget.onerror = null; // Previene loop infinito si el placeholder también falla
      }}
    />
  );
}
