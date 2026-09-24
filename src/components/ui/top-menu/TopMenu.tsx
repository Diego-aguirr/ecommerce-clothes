"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  IoCartOutline,
  IoPersonOutline,
  IoMenu,
  IoChevronDownOutline,
} from "react-icons/io5";
import { useCartStore, useUIStore } from "@/store";
import { useSession } from "next-auth/react";
import { SatoruLogo } from "@/components";
import { cn } from "@/lib/utils";

export const TopMenu = () => {
  const openSideMenu = useUIStore((state) => state.openSideMenu);
  const cart = useCartStore((state) => state.cart);
  const { data: session } = useSession();

  const [loaded, setLoaded] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
        <SatoruLogo />

        {/* Center Navigation - Hidden on small, visible on medium and up */}
        <div 
          className="hidden md:flex items-center space-x-8" 
          role="navigation" 
          aria-label="Categorías principales"
        >
          <Link
            href="/gender/men"
            className="hover:text-muted-foreground transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-muted-foreground rounded px-1"
          >
            Hombre
          </Link>
          <Link
            href="/gender/women"
            className="hover:text-muted-foreground transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-muted-foreground rounded px-1"
          >
            Mujer
          </Link>
          <Link
            href="/gender/outfits"
            className="hover:text-muted-foreground transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-muted-foreground rounded px-1"
          >
            Outfits
          </Link>
          <Link
            href="/gender/unisex"
            className="hover:text-muted-foreground transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-muted-foreground rounded px-1"
          >
            Accesorios
          </Link>
        </div>

        {/* Cart, Profile Icons */}
        <div className="flex items-center space-x-2 sm:space-x-4">
           <Link
             href={totalItems === 0 && loaded ? "/empty" : "/cart"}
             className="relative p-2 rounded-full hover:bg-brand-secondary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-muted-foreground"
             aria-label={loaded && totalItems > 0 ? `Carrito con ${totalItems} artículos` : "Carrito vacío"}
           >
             {loaded && totalItems > 0 && (
               <span
                 className={`fade-in absolute -top-1 -right-1 bg-foreground text-background text-xs px-1.5 min-w-5 h-5 rounded-full flex items-center justify-center font-bold ${totalItems > 99 ? "text-[10px] px-1" : ""}`}
               >
                 {totalItems > 99 ? "99+" : totalItems}
               </span>
             )}
             <IoCartOutline size={22} className="text-foreground"/>
           </Link>

          {/* Desktop User Menu */}
          <div className="hidden md:inline-block relative text-left min-w-[40px] h-[40px]" ref={userMenuRef}>
            {loaded ? (
              isAuthenticated ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onKeyDown={handleKeyDown}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-brand-secondary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-muted-foreground group"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  aria-label="Menú de usuario"
                >
                  <div className="flex items-center gap-1">
                     <span className="text-sm font-medium hidden lg:block text-foreground">
                       Hola, {session?.user?.name?.split(' ')[0] || "Usuario"}
                     </span>
                     <IoPersonOutline size={22} className="text-foreground" />
                     <IoChevronDownOutline 
                       size={16} 
                       className={`transition-transform duration-200 text-foreground ${isUserMenuOpen ? "rotate-180" : ""}`} 
                     />
                   </div>
                </button>
              ) : (
                <Link
                   href="/login"
                   className="flex items-center p-2 rounded-full hover:bg-brand-secondary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-muted-foreground"
                   aria-label="Ingresar a mi cuenta"
                   title="Ingresar"
                 >
                   <IoPersonOutline size={22} className="text-foreground"/>
                 </Link>
              )
            ) : (
              <div className="w-10 h-10 rounded-full animate-pulse bg-foreground/30" />
            )}

            {/* Dropdown User Menu */}
            {loaded && isUserMenuOpen && isAuthenticated && (
              <div 
                className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card ring-1 ring-border ring-opacity-5 focus:outline-none z-50 fade-in"
                role="menu"
                aria-orientation="vertical"
                tabIndex={-1}
              >
                <div className="py-1" role="none">
                  <div className="block px-4 py-3 text-sm text-foreground border-b border-border font-bold bg-muted">
                    Mi Cuenta
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus:bg-muted focus:outline-none"
                    role="menuitem"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Mi perfil
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus:bg-muted focus:outline-none"
                    role="menuitem"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Mis órdenes
                  </Link>
                  <Link
                    href="/profile/addresses"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus:bg-muted focus:outline-none"
                    role="menuitem"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Direcciones
                  </Link>
                  
                  {isAdmin && (
                    <>
                      <div className="border-t border-border"></div>
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted font-semibold focus:bg-muted focus:outline-none transition-colors"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Panel de Administración
                      </Link>
                    </>
                  )}

                  <div className="border-t border-border"></div>
                  
                  <button
                    onClick={async () => {
                      setIsUserMenuOpen(false);
                      // Usar el signOut nativo de cliente fuerza refresco de sesión
                      const { signOut } = await import("next-auth/react");
                      await signOut({ callbackUrl: '/' });
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-none"
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
            className="md:hidden p-2 rounded-full hover:bg-brand-secondary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-muted-foreground"
            aria-label="Abrir menú de navegación lateral"
            aria-expanded="false"
          >
             <IoMenu size={24} className="text-foreground"/>
          </button>
        </div>
      </div>
    </nav>
  );
};
