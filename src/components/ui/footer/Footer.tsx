import { titleFont } from "@/config/fonts";
import Link from "next/link";
import { FaInstagram, FaFacebookF, FaTwitter, FaTiktok } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Brand */}
          <Link href="/" className="inline-block">
            <span
              className={`${titleFont.className} text-2xl font-bold text-brand-primary`}
            >
              JAVA CREW
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              href="/"
              className="text-gray-600 hover:text-brand-accent transition-colors duration-300 font-medium"
            >
              Inicio
            </Link>
            <Link
              href="/products"
              className="text-gray-600 hover:text-brand-accent transition-colors duration-300 font-medium"
            >
              Productos
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-brand-accent transition-colors duration-300 font-medium"
            >
              Nosotros
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-brand-accent transition-colors duration-300 font-medium"
            >
              Contacto
            </Link>
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-brand-accent transition-colors duration-300 font-medium"
            >
              Privacidad
            </Link>
            <Link
              href="/terms"
              className="text-gray-600 hover:text-brand-accent transition-colors duration-300 font-medium"
            >
              Términos
            </Link>
          </div>

          {/* Social Media */}
          <div className="flex items-center space-x-4">
            <Link
              href="#"
              className="text-gray-400 hover:text-brand-accent transition-colors duration-300 p-2"
              aria-label="Instagram"
            >
              <FaInstagram className="w-5 h-5" />
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-brand-accent transition-colors duration-300 p-2"
              aria-label="Facebook"
            >
              <FaFacebookF className="w-5 h-5" />
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-brand-accent transition-colors duration-300 p-2"
              aria-label="Twitter"
            >
              <FaTwitter className="w-5 h-5" />
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-brand-accent transition-colors duration-300 p-2"
              aria-label="TikTok"
            >
              <FaTiktok className="w-5 h-5" />
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-brand-primary">
                JAVA CREW
              </span>
              . Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
