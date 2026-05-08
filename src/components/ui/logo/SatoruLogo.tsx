import Link from "next/link";
import React from "react";

export const SatoruLogo = () => {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-brand-accent rounded-xl p-1 transition-transform hover:scale-105 group"
      aria-label="Inicio SATORU"
    >
      {/* El Círculo del Logo */}
      <div className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-black border-[3px] border-blue-600 shadow-[0_0_15px_-2px_rgba(30,64,175,0.6),inset_0_0_12px_rgba(59,130,246,0.5)]">
        {/* Anillo de Luz Interno */}
        <div className="absolute inset-1.5 border-[1px] border-blue-400/40 rounded-full"></div>

        {/* El Texto "ST" con Efectos */}
        <div className="relative z-10">
          <span className="text-2xl md:text-3xl font-black italic tracking-tighter select-none text-white drop-shadow-[0_3px_0px_#1e3a8a] [text-shadow:2px_2px_0px_#000,_-1px_-1px_0px_#1e40af,1px_-1px_0px_#1e40af,-1px_1px_0px_#1e40af,1px_1px_0px_#1e40af] transform -skew-x-12 scale-x-110 inline-block mt-0.5 md:mt-1">
            ST
          </span>

          {/* Destello Superior */}
          <div className="absolute -top-1.5 -left-1.5 md:-top-2 md:-left-2 text-white drop-shadow-[0_0_5px_#fff]">
            <svg
              className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9Z" />
            </svg>
          </div>

          {/* Destello Inferior */}
          <div className="absolute -bottom-1.5 -right-1.5 md:-bottom-2 md:-right-2 text-white drop-shadow-[0_0_5px_#fff]">
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9Z" />
            </svg>
          </div>
        </div>

        {/* Efecto de Brillo de Cristal */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none"></div>
      </div>

      {/* Texto de la Marca */}
      <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-black drop-shadow-[2px_2px_0px_rgba(37,99,235,0.2)]">
        SATORU
      </span>
    </Link>
  );
};
