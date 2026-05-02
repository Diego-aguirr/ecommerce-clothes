import { FaInstagram, FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";

export const FooterSocialNetworks = () => {
  return (
    <div className="flex flex-col space-y-4">
      <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wider">
        Nuestras Redes
      </h3>
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
          <FaMapMarkerAlt
            className="w-4 h-4 mr-2 mt-0.5 text-blue-600"
            aria-hidden="true"
          />
          <span>
            Don Orione 773
            <br />
            Barranqueras, Chaco
          </span>
        </div>
      </div>
    </div>
  );
};
