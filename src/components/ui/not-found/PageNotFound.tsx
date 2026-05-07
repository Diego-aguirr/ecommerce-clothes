import Link from "next/link";
import { titleFont } from "@/config/fonts";

export const PageNotFound = () => {
  return (
    <div className="flex flex-col h-[70vh] w-full justify-center items-center align-middle relative overflow-hidden bg-white">
      {/* Gran fondo tipográfico animado */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none overflow-hidden">
        <h1 className={`${titleFont.className} text-[30vw] font-black tracking-tighter whitespace-nowrap`}>
          404 404 404
        </h1>
      </div>

      <div className="text-center px-5 z-10 flex flex-col items-center">
        {/* Número 404 Principal */}
        <div className="relative group">
          <h2 className={`${titleFont.className} antialiased text-8xl md:text-[150px] font-black text-gray-900 tracking-tighter leading-none mb-2 relative z-10`}>
            404
          </h2>
          {/* Glitch Effect sutil en hover */}
          <h2 className={`${titleFont.className} antialiased text-8xl md:text-[150px] font-black text-brand-accent tracking-tighter leading-none absolute top-0 left-1 opacity-0 group-hover:opacity-100 transition-opacity z-0 blur-[2px]`}>
            404
          </h2>
          <h2 className={`${titleFont.className} antialiased text-8xl md:text-[150px] font-black text-red-500 tracking-tighter leading-none absolute top-0 -left-1 opacity-0 group-hover:opacity-100 transition-opacity z-0 blur-[1px]`}>
            404
          </h2>
        </div>
        
        {/* Divider urbano */}
        <div className="w-16 h-1.5 bg-brand-accent mb-6"></div>

        <h3 className={`${titleFont.className} font-bold text-2xl md:text-3xl text-gray-900 uppercase tracking-widest mb-2`}>
          Página no encontrada
        </h3>
        
        <p className="font-light text-gray-500 mb-8 max-w-md mx-auto text-sm md:text-base">
          La prenda que estás buscando ya no está en nuestro catálogo o el enlace está roto.
        </p>
        
        <Link 
          href="/" 
          className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-gray-900 font-pj hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        >
          <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
          <span className="relative uppercase tracking-widest text-sm">Volver al Inicio</span>
        </Link>
      </div>
    </div>
  );
};
