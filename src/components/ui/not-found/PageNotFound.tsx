import Link from "next/link";
import { titleFont } from "@/config/fonts";

export const PageNotFound = () => {
  return (
    <div className="flex flex-col min-h-screen w-full justify-center items-center align-middle relative overflow-hidden bg-black text-white">
      {/* Background Radial Glow mimicking the old logo's blue aura */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40 select-none pointer-events-none overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-black to-black">
      </div>

      {/* SAURON Massive Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none overflow-hidden">
        <h1 className={`${titleFont.className} text-[30vw] font-black tracking-tighter whitespace-nowrap text-blue-500`}>
          SAURON
        </h1>
      </div>

      <div className="text-center px-5 z-10 flex flex-col items-center w-full">
        
        {/* Brand Name with Logo Styling */}
        <h2 className={`${titleFont.className} text-2xl md:text-3xl font-black italic tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(37,99,235,0.8)]`}>
          SAURON <span className="text-blue-500 not-italic">{"///"}</span>
        </h2>

        {/* Glitchy 404 */}
        <div className="relative group mb-6">
          <h2 className={`${titleFont.className} antialiased text-9xl md:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-tighter leading-none relative z-10 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]`}>
            404
          </h2>
          {/* Neon Blue Glitch */}
          <h2 className={`${titleFont.className} antialiased text-9xl md:text-[180px] font-black text-blue-500 tracking-tighter leading-none absolute top-0 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-0 blur-[3px]`}>
            404
          </h2>
          {/* Cyber Red Glitch */}
          <h2 className={`${titleFont.className} antialiased text-9xl md:text-[180px] font-black text-red-600 tracking-tighter leading-none absolute top-0 -left-2 opacity-0 group-hover:opacity-100 transition-opacity z-0 blur-[2px]`}>
            404
          </h2>
        </div>
        
        {/* Neon Divider */}
        <div className="w-24 h-1 bg-blue-600 mb-8 shadow-[0_0_15px_rgba(37,99,235,0.9)] rounded-full"></div>

        <h3 className={`${titleFont.className} font-bold text-xl md:text-2xl text-gray-200 uppercase tracking-widest mb-3`}>
          Página no encontrada
        </h3>
        
        <p className="font-light text-gray-400 mb-10 max-w-md mx-auto text-sm md:text-base px-4">
          La prenda que estás buscando ya no está en nuestro catálogo o te perdiste en la tienda.
        </p>
        
        <Link 
          href="/" 
          className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-300 bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 focus:ring-offset-black rounded-sm shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.8)] hover:-translate-y-1"
        >
          <span className="relative uppercase tracking-widest text-sm">Volver a Sauron</span>
        </Link>
      </div>
    </div>
  );
};
