import Link from "next/link";
export const SatoruLogo = () => {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-lg p-1 transition-transform hover:scale-105 group"
      aria-label="Inicio SAURON"
    >
      {/* Icono rústico — cuadrado plano */}
      <div className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-stone-900 border-2 border-stone-700 rounded-md select-none">
        <span className="text-xl md:text-2xl font-black tracking-tighter text-stone-200 font-serif">
          S
        </span>
      </div>

      {/* Texto de la marca — limpio y plano */}
      <span className="text-2xl md:text-3xl font-black tracking-tight text-stone-900 font-serif">
        SAURON
      </span>
    </Link>
  );
};
