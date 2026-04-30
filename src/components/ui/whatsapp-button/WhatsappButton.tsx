import Link from "next/link";
import { IoLogoWhatsapp } from "react-icons/io5";

export const WhatsappButton = () => {
  // Número mockeado (debe reemplazarse por variable de entorno)
  const phoneNumber = "5493624024624"; 
  const message = "Hola! Me interesa obtener más información.";
  const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <Link
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed z-40 flex items-center justify-center p-3 sm:p-4 text-white bg-[#25D366] hover:bg-[#128C7E] rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 group bottom-24 md:bottom-8 right-4 md:right-8"
    >
      <IoLogoWhatsapp className="text-3xl sm:text-4xl" />
      
      {/* Tooltip opcional en Desktop al hacer hover */}
      <span className="absolute right-full mr-4 bg-[#111] text-white text-sm whitespace-nowrap py-1.5 px-3 rounded shadow-md opacity-0 font-medium pointer-events-none transition-opacity duration-300 group-hover:opacity-100 hidden md:block">
        ¿Necesitás ayuda?
      </span>
    </Link>
  );
};
