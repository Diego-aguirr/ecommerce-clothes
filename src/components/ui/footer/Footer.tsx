import Link from "next/link";
import { FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaLock } from "react-icons/fa";
import { SiMercadopago, SiVisa, SiMastercard } from "react-icons/si";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Col 1: Atención al Cliente */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wider">Atención al Cliente</h3>
            <div className="flex flex-col space-y-3 text-sm text-gray-600">
              <a 
                href="https://wa.me/5493624024624" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-green-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded w-fit"
              >
                <FaWhatsapp className="w-5 h-5 mr-2" aria-hidden="true" />
                +54 9 362 402-4624
              </a>
              <a 
                href="https://www.instagram.com/satoru_ind/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-pink-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded w-fit"
              >
                <FaInstagram className="w-5 h-5 mr-2" aria-hidden="true" />
                @satoru_ind
              </a>
              <div className="flex items-start text-gray-500">
                <FaMapMarkerAlt className="w-4 h-4 mr-2 mt-0.5 text-blue-600" aria-hidden="true" />
                <span>Don Orione 773<br/>Barranqueras, Chaco</span>
              </div>
            </div>
          </div>

          {/* Col 2: Historia */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wider">Historia</h3>
            <nav className="flex flex-col space-y-3 text-sm">
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded w-fit">Quiénes Somos</Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded w-fit">Contacto</Link>
            </nav>
          </div>

          {/* Col 3: Enlaces Útiles */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wider">Enlaces Útiles</h3>
            <nav className="flex flex-col space-y-3 text-sm">
              <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded w-fit">Términos y Condiciones</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded w-fit">Políticas de Privacidad</Link>
            </nav>
          </div>

          {/* Col 4: Defensa del Consumidor */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wider">Defensa del Consumidor</h3>
            <a 
              href="https://autogestion.produccion.gob.ar/consumidores" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full max-w-xs text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-50 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-100 hover:text-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm"
              aria-label="Defensa del Consumidor"
            >
              Defensa del Consumidor
            </a>
          </div>

        </div>

        {/* Bottom Bar: Trust & Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} <span className="font-bold text-gray-900">SATORU</span>. Todos los derechos reservados.
          </div>
          
          <div className="flex items-center gap-4 text-gray-400">
            <div className="flex items-center gap-1 text-xs font-medium mr-2">
              <FaLock className="text-green-600" aria-hidden="true" /> Compra Segura
            </div>
            <SiMercadopago className="w-8 h-8 hover:text-[#009EE3] transition-colors" aria-hidden="true" />
            <SiVisa className="w-8 h-8 hover:text-[#1434CB] transition-colors" aria-hidden="true" />
            <SiMastercard className="w-8 h-8 hover:text-[#EB001B] transition-colors" aria-hidden="true" />
          </div>
        </div>

      </div>
    </footer>
  );
};
