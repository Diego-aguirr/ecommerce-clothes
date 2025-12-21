"use client";
import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  IoSearch,
  IoCartOutline,
  IoPersonOutline,
  IoMenu,
} from "react-icons/io5";
import { useCartStore, useUIStore } from "@/store";

export const TopMenu = () => {
  const openSideMenu = useUIStore((state) => state.openSideMenu);
  const cart = useCartStore((state) => state.cart);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  return (
    <nav className="bg-brand-primary py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Brand Name */}
        <Link
          href="/"
          className="text-xl font-bold hover:text-brand-accent transition-colors"
        >
          JAVA CREW
        </Link>

        {/* Center Navigation - Hidden on small, visible on medium and up */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/gender/men"
            className="hover:text-brand-accent transition-colors"
          >
            Hombre
          </Link>
          <Link
            href="/gender/women/"
            className="hover:text-brand-accent transition-colors"
          >
            Mujer
          </Link>
          <Link
            href="/gender/kid"
            className="hover:text-brand-accent transition-colors"
          >
            Niños
          </Link>
          <Link
            href="/gender/unisex"
            className="hover:text-brand-accent transition-colors"
          >
            Accesorios
          </Link>
        </div>

        {/* Search, Cart, Profile Icons */}
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-brand-secondary/20 transition-colors">
            <IoSearch size={24} />
          </button>

          <Link
            href="/cart"
            className="relative p-2 rounded-full hover:bg-brand-secondary/20 transition-colors"
          >
            {loaded && totalItems > 0 && (
              <span
                className={`
      absolute -top-2 -right-1 
      bg-black text-white text-xs 
      px-1.5 min-w-5 h-5 
      rounded-full flex items-center justify-center 
      font-bold
      ${totalItems > 99 ? "text-[10px] px-1" : ""}
    `}
              >
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
            <IoCartOutline size={24} />
          </Link>

          <Link
            href="/profile"
            className="p-2 rounded-full hover:bg-brand-secondary/20 transition-colors"
          >
            <IoPersonOutline size={24} />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={openSideMenu}
            className="md:hidden p-2 rounded-full hover:bg-brand-secondary/20 transition-colors"
          >
            <IoMenu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};
