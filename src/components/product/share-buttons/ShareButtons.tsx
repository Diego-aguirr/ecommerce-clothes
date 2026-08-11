"use client";

import { FaWhatsapp, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import { IoShareOutline, IoLinkOutline } from "react-icons/io5";
import { useState, useEffect } from "react";

interface Props {
  title: string;
  slug: string;
  imageUrl?: string;
}

export const ShareButtons = ({ title, slug, imageUrl }: Props) => {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/product/${slug}`);
  }, [slug]);

  const text = `${title} — Mira este producto`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
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
        url,
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
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
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
        className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
        aria-label="Compartir por Facebook"
      >
        <FaFacebookF size={16} />
      </a>

      {/* Twitter/X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-10 h-10 bg-black hover:bg-gray-800 text-white rounded-full transition-colors"
        aria-label="Compartir por X"
      >
        <FaXTwitter size={16} />
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          copied
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`}
        aria-label={copied ? "Link copiado" : "Copiar link"}
      >
        <IoLinkOutline size={16} />
        <span className="hidden sm:inline">{copied ? "Copiado" : "Copiar"}</span>
      </button>
    </div>
  );
};
