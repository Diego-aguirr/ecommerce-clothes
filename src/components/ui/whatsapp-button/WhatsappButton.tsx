"use client";

import Link from "next/link";
import { IoLogoWhatsapp } from "react-icons/io5";
import { useState, useEffect } from "react";

export const WhatsappButton = () => {
  const [showBubble, setShowBubble] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const waLink = "https://wa.me/";

  useEffect(() => {
    // Mostrar burbuja por 6 segundos, luego desaparece con animación
    const hideTimer = setTimeout(() => {
      setShowBubble(false);
    }, 6000);

    return () => clearTimeout(hideTimer);
  }, []);

  const handleClose = () => {
    setShowBubble(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed z-40 bottom-24 md:bottom-8 right-4 md:right-8 flex flex-col items-end gap-3">
      {/* Burbuja de chat animada */}
      <div
        className={`
          relative bg-white text-gray-800 p-4 rounded-2xl rounded-br-md shadow-lg 
          max-w-[280px] transition-all duration-500 ease-out transform
          ${showBubble 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
          }
        `}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-xs transition-colors"
          aria-label="Cerrar mensaje"
        >
          ✕
        </button>
        
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center shrink-0">
            <IoLogoWhatsapp className="text-white text-xl" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 mb-1">SAURON Store</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              ¿En qué podemos ayudarte? 😊
            </p>
          </div>
        </div>
        
        {/* Flecha de la burbuja */}
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45" />
      </div>

      {/* Botón de WhatsApp con animación de pulso */}
      <Link
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="
          relative flex items-center justify-center p-3 sm:p-4 
          text-white bg-[#25D366] hover:bg-[#128C7E] 
          rounded-full shadow-lg 
          transition-all duration-300 hover:scale-110 active:scale-95 
          animate-bounce-slow
        "
      >
        {/* Efecto de pulso */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse opacity-10" />
        
        <IoLogoWhatsapp className="text-3xl sm:text-4xl relative z-10" />
      </Link>
    </div>
  );
};
