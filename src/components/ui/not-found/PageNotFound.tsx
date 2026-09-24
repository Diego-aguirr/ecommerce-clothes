import Link from "next/link";
import { titleFont } from "@/config/fonts";

export const PageNotFound = () => {
  return (
    <div className="flex flex-col min-h-screen w-full justify-center items-center align-middle relative overflow-hidden bg-foreground text-background">
      {/* Background Radial Glow mimicking the old logo's blue aura */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-40 select-none pointer-events-none overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at center, rgba(30,58,138,0.3) 0%, #000 70%)",
        }}
      >
      </div>

      {/* SAURON Massive Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none overflow-hidden">
        <h1 className={`${titleFont.className} text-[30vw] font-black tracking-tighter whitespace-nowrap text-background`}>
          SAURON
        </h1>
      </div>

      <div className="text-center px-5 z-10 flex flex-col items-center w-full">
        
        {/* Brand Name with Logo Styling */}
        <h2 className={`${titleFont.className} text-2xl md:text-3xl font-black italic tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(37,99,235,0.8)]`}>
          SAURON <span className="text-background not-italic">{"///"}</span>
        </h2>

        {/* Glitchy 404 */}
        <div className="relative group mb-6">
          <h2 className={`${titleFont.className} antialiased text-9xl md:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-b from-background to-muted-foreground tracking-tighter leading-none relative z-10 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]`}>
            404
          </h2>
          {/* Neon Blue Glitch */}
          <h2 className={`${titleFont.className} antialiased text-9xl md:text-[180px] font-black text-background tracking-tighter leading-none absolute top-0 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-0 blur-[3px]`}>
            404
          </h2>
          {/* Cyber Red Glitch */}
          <h2 className={`${titleFont.className} antialiased text-9xl md:text-[180px] font-black text-red-600 tracking-tighter leading-none absolute top-0 -left-2 opacity-0 group-hover:opacity-100 transition-opacity z-0 blur-[2px]`}>
            404
          </h2>
        </div>
        
        {/* Neon Divider */}
        <div className="w-24 h-1 bg-foreground mb-8 shadow-[0_0_15px_rgba(37,99,235,0.9)] rounded-full"></div>

        <h3 className={`${titleFont.className} font-bold text-xl md:text-2xl text-muted-foreground uppercase tracking-widest mb-3`}>
          Página no encontrada
        </h3>
        
        <p className="font-light text-muted-foreground mb-10 max-w-md mx-auto text-sm md:text-base px-4">
          La prenda que estás buscando ya no está en nuestro catálogo o te perdiste en la tienda.
        </p>
        
        <Link 
          href="/" 
          className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-background transition-all duration-300 bg-foreground hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground focus:ring-offset-black rounded-sm shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.8)] hover:-translate-y-1"
        >
          <span className="relative uppercase tracking-widest text-sm">Volver a Sauron</span>
        </Link>
      </div>
    </div>
  );
};
