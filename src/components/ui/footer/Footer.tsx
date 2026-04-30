import { titleFont } from "@/config/fonts";
import Link from "next/link";
import { FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaLock } from "react-icons/fa";
import { SiMercadopago, SiVisa, SiMastercard } from "react-icons/si";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Story */}
          <div className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              aria-label="Ir a inicio de SATORU"
            >
              <span className={`${titleFont.className} text-3xl font-black italic tracking-tighter text-black`}>
                ST <span className="text-blue-600 text-lg align-middle not-italic font-bold">SATORU</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Exclusividad, calidad y buen precio. Somos una familia apasionada por la moda masculina y femenina.
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wider">Contacto</h3>
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

          {/* Navigation Links */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wider">Enlaces Útiles</h3>
            <nav className="flex flex-col space-y-3 text-sm">
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded w-fit">Nuestra Historia</Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded w-fit">Contacto</Link>
              <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded w-fit">Términos y Condiciones</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded w-fit">Políticas de Privacidad</Link>
            </nav>
          </div>

          {/* CRO: Newsletter & Trust Signals */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wider">¿10% OFF en tu compra?</h3>
            <p className="text-xs text-gray-500">Suscribite a nuestro newsletter y enterate de las exclusividades antes que nadie.</p>
            <form className="flex mt-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="tu@email.com" 
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Email para newsletter"
              />
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 text-sm font-bold rounded-r-lg hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Suscribir
              </button>
            </form>
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
