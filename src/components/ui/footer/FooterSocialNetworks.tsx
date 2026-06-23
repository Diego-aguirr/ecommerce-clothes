import { FaInstagram, FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";

export const FooterSocialNetworks = () => {
  return (
    <div className="flex flex-col space-y-4">
      <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wider">
        Nuestras Redes
      </h3>
      <div className="flex flex-col space-y-3 text-sm text-gray-600">
        {/* WhatsApp — solo texto informativo */}
        <div className="flex items-center">
          <FaWhatsapp className="w-5 h-5 mr-2 text-green-600" aria-hidden="true" />
          <span>WhatsApp</span>
        </div>

        {/* Instagram — solo texto informativo */}
        <div className="flex items-center">
          <FaInstagram className="w-5 h-5 mr-2 text-pink-600" aria-hidden="true" />
          <span>@tusauronstore</span>
        </div>

        {/* Dirección — solo texto informativo */}
        <div className="flex items-start text-gray-500">
          <FaMapMarkerAlt
            className="w-4 h-4 mr-2 mt-0.5 text-blue-600"
            aria-hidden="true"
          />
          <address className="not-italic">
            Av. Ejemplo 1234
            <br />
            Ciudad Autónoma, Buenos Aires
          </address>
        </div>
      </div>
    </div>
  );
};
