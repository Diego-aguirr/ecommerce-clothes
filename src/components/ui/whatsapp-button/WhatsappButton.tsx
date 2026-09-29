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
    <div className="fixed z-40 bottom-[calc(24px+env(safe-area-inset-bottom))] md:bottom-[calc(8px+env(safe-area-inset-bottom))] right-[calc(4px+env(safe-area-inset-right))] md:right-[calc(8px+env(safe-area-inset-right))] flex flex-col items-end gap-3">
      {/* Burbuja de chat animada */}
      <div
        className={`
          relative bg-card text-foreground p-4 rounded-2xl rounded-br-md shadow-lg 
          max-w-[90vw] sm:max-w-[280px] transition-all duration-500 ease-out transform
          ${showBubble 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
          }
        `}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 w-6 h-6 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center text-foreground text-xs transition-colors"
          aria-label="Cerrar mensaje"
        >
          ✕
        </button>
        
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center shrink-0">
            <IoLogoWhatsapp className="text-white text-xl" />
          </div>
          <div>
<p className="font-semibold text-sm text-foreground mb-1">SAURON Store</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
              ¿En qué podemos ayudarte? 😊
            </p>
          </div>
        </div>
        
        {/* Flecha de la burbuja */}
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card rotate-45" />
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
