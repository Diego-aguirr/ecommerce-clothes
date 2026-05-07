import Link from "next/link";
import React from "react";
import { titleFont } from "@/config/fonts";

export const SatoruLogo = () => {
  return (
    <Link
      href="/"
      className="flex items-center group focus:outline-none focus:ring-2 focus:ring-brand-accent rounded-md px-1 transition-transform hover:scale-[1.02]"
      aria-label="Inicio SATORU"
    >
      <div className="flex flex-col">
        <span 
          className={`${titleFont.className} text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 leading-none`}
        >
          SATORU
        </span>
        <span className="text-[10px] md:text-xs font-medium tracking-[0.3em] text-gray-500 uppercase ml-1">
          Urban Wear
        </span>
      </div>
    </Link>
  );
};
