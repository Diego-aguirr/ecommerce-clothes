import { FaWhatsapp, FaInstagram, FaMapMarkerAlt } from "react-icons/fa";

export const metadata = {
  title: "Contacto | SATORU",
  description: "Comunicate con nosotros vía WhatsApp o visitanos en nuestro local.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
        Contacto
      </h1>
      <p className="text-gray-600 mb-12 text-lg">
        ¿Tenés alguna duda o querés asesoramiento personalizado? Escribinos o pasá a visitarnos.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Local físico */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
            <FaMapMarkerAlt size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Nuestro Local</h2>
          <p className="text-gray-600 mb-4">
            Vení a probarte todo lo que quieras. Te esperamos en Barranqueras.
          </p>
          <p className="font-semibold text-gray-900 text-lg">
            Don Orione 773
          </p>
        </div>

        {/* WhatsApp */}
        <a 
          href="https://wa.me/5493624024624"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:border-green-400 hover:shadow-md transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-colors">
            <FaWhatsapp size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">WhatsApp</h2>
          <p className="text-gray-600 mb-4">
            Respondemos rápido. Escribinos para coordinar envíos o consultar stock.
          </p>
          <p className="font-semibold text-gray-900 text-lg">
            362 402-4624
          </p>
        </a>

        {/* Instagram */}
        <a 
          href="https://www.instagram.com/satoru_ind/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:border-pink-400 hover:shadow-md transition-all group md:col-span-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
        >
          <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-gradient-to-tr group-hover:from-yellow-400 group-hover:via-pink-500 group-hover:to-purple-600 group-hover:text-white transition-all">
            <FaInstagram size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Instagram</h2>
          <p className="text-gray-600 mb-4">
            Seguinos para enterarte de los últimos ingresos, promos y sorteos.
          </p>
          <p className="font-semibold text-gray-900 text-lg">
            @satoru_ind
          </p>
        </a>

      </div>
    </div>
  );
}
