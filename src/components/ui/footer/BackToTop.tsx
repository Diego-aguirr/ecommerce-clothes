"use client";

import { FaArrowUp } from "react-icons/fa";

export const BackToTop = () => {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="ml-2 p-2 rounded-full hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      aria-label="Volver arriba"
    >
      <FaArrowUp className="w-4 h-4 text-gray-500" />
    </a>
  );
};
