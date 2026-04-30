import { FaLock } from "react-icons/fa";
import { SiMercadopago, SiVisa, SiMastercard } from "react-icons/si";

export const FooterTrustBar = () => {
  return (
    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-sm text-gray-400">
        © {new Date().getFullYear()}{" "}
        <span className="font-bold text-gray-900">SATORU</span>. Todos los
        derechos reservados.
      </div>

      <div className="flex items-center gap-4 text-gray-400">
        <div className="flex items-center gap-1 text-xs font-medium mr-2">
          <FaLock className="text-green-600" aria-hidden="true" /> Compra Segura
        </div>
        <SiMercadopago
          className="w-8 h-8 hover:text-[#009EE3] transition-colors"
          aria-hidden="true"
        />
        <SiVisa
          className="w-8 h-8 hover:text-[#1434CB] transition-colors"
          aria-hidden="true"
        />
        <SiMastercard
          className="w-8 h-8 hover:text-[#EB001B] transition-colors"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
