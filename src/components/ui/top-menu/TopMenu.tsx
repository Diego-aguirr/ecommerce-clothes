"use client";
import React from "react";
import Link from "next/link";
import {
  IoSearch,
  IoCartOutline,
  IoPersonOutline,
  IoMenu,
} from "react-icons/io5";
import { useUIStore } from "@/store";

interface TopMenuProps {
  // Define props here if needed
}

export const TopMenu = ({}: TopMenuProps) => {
  const openSideMenu = useUIStore((state) => state.openSideMenu);
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
            href="/category/men"
            className="hover:text-brand-accent transition-colors"
          >
            Hombre
          </Link>
          <Link
            href="/category/women/"
            className="hover:text-brand-accent transition-colors"
          >
            Mujer
          </Link>
          <Link
            href="/category/kid"
            className="hover:text-brand-accent transition-colors"
          >
            Niños
          </Link>
          <Link
            href="/category/unisex"
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
            className="p-2 rounded-full hover:bg-brand-secondary/20 transition-colors"
          >
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
