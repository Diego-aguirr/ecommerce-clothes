import React from "react";

export const Marquee = () => {
  return (
    <div className="bg-[#111] text-white py-2.5 overflow-hidden relative shadow-sm mb-8 rounded-none sm:rounded-lg -mx-4 sm:mx-0">
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker {
          display: inline-block;
          white-space: nowrap;
          animation: ticker 25s linear infinite;
        }
      `}</style>
      <div className="animate-ticker text-xs sm:text-sm font-bold tracking-widest uppercase flex gap-12 items-center w-full">
        <span>⚡ Envíos a todo el país</span>
        <span>🔥 Cuotas sin interés</span>
        <span>📦 Cambios y devoluciones gratis</span>
        <span>⚡ Envíos a todo el país</span>
      </div>
    </div>
  );
};
