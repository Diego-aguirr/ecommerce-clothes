import { FaWhatsapp, FaInstagram, FaMapMarkerAlt } from "react-icons/fa";

export const metadata = {
  title: "Contacto | SAURON",
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
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
            <FaMapMarkerAlt size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Nuestro Local</h2>
          <p className="text-gray-600 mb-4">
            Vení a probarte todo lo que quieras. Te esperamos en Ciudad Autónoma.
          </p>
          <p className="font-semibold text-gray-900 text-lg">
            Av. Ejemplo 1234
          </p>
        </div>

        {/* WhatsApp */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
            <FaWhatsapp size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">WhatsApp</h2>
          <p className="text-gray-600 mb-4">
            Respondemos rápido. Escribinos para coordinar envíos o consultar stock.
          </p>
          <p className="font-semibold text-gray-900 text-lg">
            WhatsApp
          </p>
        </div>

        {/* Instagram */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center md:col-span-2">
          <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mb-6">
            <FaInstagram size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Instagram</h2>
          <p className="text-gray-600 mb-4">
            Seguinos para enterarte de los últimos ingresos, promos y sorteos.
          </p>
          <p className="font-semibold text-gray-900 text-lg">
            @tusauronstore
          </p>
        </div>

      </div>
    </div>
  );
}
