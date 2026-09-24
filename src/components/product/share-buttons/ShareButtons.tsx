"use client";

import { FaWhatsapp, FaFacebookF, FaInstagram } from "react-icons/fa6";
import { IoShareOutline, IoLinkOutline } from "react-icons/io5";
import { useState } from "react";

interface Props {
  title: string;
  slug: string;
  imageUrl?: string;
  productUrl: string;
}

export const ShareButtons = ({ title, slug, imageUrl, productUrl }: Props) => {
  const [copied, setCopied] = useState(false);

  const text = `${title} — Mira este producto`;
  const encodedUrl = encodeURIComponent(productUrl);
  const encodedText = encodeURIComponent(text);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = productUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text,
        url: productUrl,
        ...(imageUrl ? { image: imageUrl } : {}),
      });
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Web Share API (mobile native) */}
      {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-border rounded-lg text-sm font-medium text-foreground transition-colors"
          aria-label="Compartir"
        >
          <IoShareOutline size={18} />
          <span className="hidden sm:inline">Compartir</span>
        </button>
      )}

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
        aria-label="Compartir por WhatsApp"
      >
        <FaWhatsapp size={18} />
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full transition-colors"
        aria-label="Compartir por Facebook"
      >
        <FaFacebookF size={16} />
      </a>

      {/* Instagram */}
      <a
        href={`https://www.instagram.com/`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-10 h-10 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 hover:opacity-90 text-white rounded-full transition-colors"
        aria-label="Compartir por Instagram"
      >
        <FaInstagram size={16} />
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          copied
            ? "bg-green-100 text-green-700"
            : "bg-secondary hover:bg-border text-foreground"
        }`}
        aria-label={copied ? "Link copiado" : "Copiar link"}
      >
        <IoLinkOutline size={16} />
        <span className="hidden sm:inline">{copied ? "Copiado" : "Copiar"}</span>
      </button>
    </div>
  );
};
