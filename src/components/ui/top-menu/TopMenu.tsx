"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  IoCartOutline,
  IoPersonOutline,
  IoMenu,
  IoChevronDownOutline,
} from "react-icons/io5";
import { useCartStore, useUIStore } from "@/store";
import { useSession } from "next-auth/react";
import { logout } from "@/actions";

export const TopMenu = () => {
  const openSideMenu = useUIStore((state) => state.openSideMenu);
  const cart = useCartStore((state) => state.cart);
  const { data: session } = useSession();

  const [loaded, setLoaded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // Closes the user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user?.role === "admin";

  // Cierra el menú al apretar Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-brand-primary py-3 px-6 shadow-md relative z-30">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Brand Name */}
        <Link
          href="/"
          className="text-xl font-bold hover:text-brand-accent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent rounded"
          aria-label="Inicio"
        >
          JAVA CREW
        </Link>

        {/* Center Navigation - Hidden on small, visible on medium and up */}
        <div 
          className="hidden md:flex items-center space-x-8" 
          role="navigation" 
          aria-label="Categorías principales"
        >
          <Link
            href="/gender/men"
            className="hover:text-brand-accent transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent rounded px-1"
          >
            Hombre
          </Link>
          <Link
            href="/gender/women"
            className="hover:text-brand-accent transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent rounded px-1"
          >
            Mujer
          </Link>
          <Link
            href="/gender/kid"
            className="hover:text-brand-accent transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent rounded px-1"
          >
            Niños
          </Link>
          <Link
            href="/gender/unisex"
            className="hover:text-brand-accent transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent rounded px-1"
          >
            Accesorios
          </Link>
        </div>

        {/* Cart, Profile Icons */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link
            href={totalItems === 0 && loaded ? "/empty" : "/cart"}
            className="relative p-2 rounded-full hover:bg-brand-secondary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
            aria-label={loaded && totalItems > 0 ? `Carrito con ${totalItems} artículos` : "Carrito vacío"}
          >
            {loaded && totalItems > 0 && (
              <span
                className={`fade-in absolute -top-1 -right-1 bg-black text-white text-xs px-1.5 min-w-5 h-5 rounded-full flex items-center justify-center font-bold ${totalItems > 99 ? "text-[10px] px-1" : ""}`}
              >
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
            <IoCartOutline size={22} color="black"/>
          </Link>

          {/* Desktop User Menu */}
          <div className="hidden md:inline-block relative text-left min-w-[40px] h-[40px]" ref={userMenuRef}>
            {loaded ? (
              isAuthenticated ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onKeyDown={handleKeyDown}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-brand-secondary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent group"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  aria-label="Menú de usuario"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium hidden lg:block text-black">
                      Hola, {session?.user?.name?.split(' ')[0] || "Usuario"}
                    </span>
                    <IoPersonOutline size={22} color="black" />
                    <IoChevronDownOutline 
                      size={16} 
                      className={`transition-transform duration-200 text-black ${isUserMenuOpen ? "rotate-180" : ""}`} 
                    />
                  </div>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center p-2 rounded-full hover:bg-brand-secondary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  aria-label="Ingresar a mi cuenta"
                  title="Ingresar"
                >
                  <IoPersonOutline size={22} color="black"/>
                </Link>
              )
            ) : (
              <div className="w-10 h-10 rounded-full animate-pulse bg-gray-200/60" />
            )}

            {/* Dropdown User Menu */}
            {loaded && isUserMenuOpen && isAuthenticated && (
              <div 
                className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 fade-in"
                role="menu"
                aria-orientation="vertical"
                tabIndex={-1}
              >
                <div className="py-1" role="none">
                  <div className="block px-4 py-3 text-sm text-gray-900 border-b border-gray-100 font-bold bg-gray-50">
                    Mi Cuenta
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:outline-none"
                    role="menuitem"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Mi perfil
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:outline-none"
                    role="menuitem"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Mis órdenes
                  </Link>
                  <Link
                    href="/profile/addresses"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:outline-none"
                    role="menuitem"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Direcciones
                  </Link>
                  
                  {isAdmin && (
                    <>
                      <div className="border-t border-gray-100"></div>
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-brand-accent hover:bg-gray-100 font-semibold focus:bg-gray-100 focus:outline-none transition-colors"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Panel de Administración
                      </Link>
                    </>
                  )}

                  <div className="border-t border-gray-100"></div>
                  
                  <button
                    onClick={async () => {
                      setIsUserMenuOpen(false);
                      // Usar el signOut nativo de cliente fuerza refresco de sesión
                      const { signOut } = await import("next-auth/react");
                      await signOut({ callbackUrl: '/' });
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                    role="menuitem"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={openSideMenu}
            className="md:hidden p-2 rounded-full hover:bg-brand-secondary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
            aria-label="Abrir menú de navegación lateral"
            aria-expanded="false"
          >
            <IoMenu size={24} color="black"/>
          </button>
        </div>
      </div>
    </nav>
  );
};
