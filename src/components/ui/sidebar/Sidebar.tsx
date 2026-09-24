"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  IoCloseOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoShirtOutline,
  IoTicketOutline,
  IoLocationOutline,
  IoListOutline,
} from "react-icons/io5";
import { useUIStore } from "@/store";
import { useSession } from "next-auth/react";

export const Sidebar = () => {
  const isSideMenuOpen = useUIStore((state) => state.isSideMenuOpen);
  const closeMenu = useUIStore((state) => state.closeSideMenu);

  const { data: session } = useSession();

  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user?.role === "admin";

  return (
    <div>
      {/* Background black */}
      {isSideMenuOpen && (
        <div className="fixed top-0 left-0 w-screen h-screen z-[35] bg-foreground/30 opacity-30" />
      )}

      {/* Blur */}
      {isSideMenuOpen && (
        <div
          onClick={closeMenu}
          className="fade-in fixed top-0 left-0 w-screen h-screen z-[35] backdrop-filter backdrop-blur-sm"
        />
      )}

      {/* Sidemenu */}
      <nav
        className={cn(
          "fixed p-5 right-0 top-0 w-[85vw] sm:w-[400px] h-screen bg-card z-40 shadow-2xl transform transition-all duration-300 overflow-y-auto",
          {
            "translate-x-full": !isSideMenuOpen,
          }
        )}
      >
        <IoCloseOutline onClick={() => closeMenu()} />

        {/* Categorías Principales (Mobile Only) */}
        <div className="md:hidden mt-10">
          <Link
            href="/gender/men"
            onClick={() => closeMenu()}
            className="flex items-center p-2 hover:bg-muted rounded transition-all"
          >
            <span className="ml-3 text-xl font-medium">Hombre</span>
          </Link>
          <Link
            href="/gender/women"
            onClick={() => closeMenu()}
            className="flex items-center mt-2 p-2 hover:bg-muted rounded transition-all"
          >
            <span className="ml-3 text-xl font-medium">Mujer</span>
          </Link>
          <Link
            href="/gender/outfits"
            onClick={() => closeMenu()}
            className="flex items-center mt-2 p-2 hover:bg-muted rounded transition-all"
          >
            <span className="ml-3 text-xl font-medium">Outfits</span>
          </Link>
          <Link
            href="/gender/unisex"
            onClick={() => closeMenu()}
            className="flex items-center mt-2 p-2 hover:bg-muted rounded transition-all"
          >
            <span className="ml-3 text-xl font-medium">Accesorios</span>
          </Link>

          <div className="w-full h-px bg-muted my-8" />
        </div>

        {/* Menú Privado de Usuario */}
        {isAuthenticated && (
          <>
            <Link
              href="/profile"
              onClick={() => closeMenu()}
              className="flex items-center mt-5 md:mt-10 p-2 hover:bg-muted rounded transition-all"
            >
              <IoPersonOutline size={30} className="text-foreground"/>
              <span className="ml-3 text-xl">Perfil</span>
            </Link>

            <Link
              href="/orders"
              onClick={() => closeMenu()}
              className="flex items-center mt-5 p-2 hover:bg-muted rounded transition-all"
            >
              <IoTicketOutline size={30} className="text-foreground"/>
              <span className="ml-3 text-xl">Órdenes</span>
            </Link>
            
            <Link
              href="/profile/addresses"
              onClick={() => closeMenu()}
              className="flex items-center mt-5 p-2 hover:bg-muted rounded transition-all"
            >
              <IoLocationOutline size={30} className="text-foreground"/>
              <span className="ml-3 text-xl">Direcciones</span>
            </Link>
          </>
        )}

        {isAuthenticated && (
          <button
            className="flex w-full items-center mt-10 p-2 hover:bg-muted rounded transition-all"
            onClick={async () => {
              closeMenu();
              const { signOut } = await import("next-auth/react");
              await signOut({ callbackUrl: '/' });
            }}
          >
            <IoLogOutOutline size={30} />
            <span className="ml-3 text-xl">Salir</span>
          </button>
        )}

        {!isAuthenticated && (
          <>
            <Link
              href="/login"
              className="flex items-center mt-10 p-2 hover:bg-muted rounded transition-all"
              onClick={() => closeMenu()}
            >
              <IoLogInOutline size={30} />
              <span className="ml-3 text-xl">Ingresar</span>
            </Link>
          </>
        )}

        {isAdmin && (
          <>
            <div className="w-full h-px bg-muted my-10" />
            
            <Link
              href="/admin"
              onClick={() => closeMenu()}
              className="flex items-center mt-10 p-2 hover:bg-muted rounded transition-all font-semibold"
            >
              <IoPeopleOutline size={30} />
              <span className="ml-3 text-xl">Dashboard Admin</span>
            </Link>

            <Link
              href="/admin/products"
              onClick={() => closeMenu()}
              className="flex items-center mt-10 p-2 hover:bg-muted rounded transition-all"
            >
              <IoShirtOutline size={30} />
              <span className="ml-3 text-xl">Productos</span>
            </Link>

            <Link
              href="/admin/categories"
              onClick={() => closeMenu()}
              className="flex items-center mt-10 p-2 hover:bg-muted rounded transition-all"
            >
              <IoListOutline size={30} />
              <span className="ml-3 text-xl">Categorías</span>
            </Link>

            <Link
              href="/admin/orders"
              onClick={() => closeMenu()}
              className="flex items-center mt-10 p-2 hover:bg-muted rounded transition-all"
            >
              <IoTicketOutline size={30} />
              <span className="ml-3 text-xl">Ordenes</span>
            </Link>
            <Link
              href="/admin/users"
              onClick={() => closeMenu()}
              className="flex items-center mt-10 p-2 hover:bg-muted rounded transition-all"
            >
              <IoPeopleOutline size={30} />
              <span className="ml-3 text-xl">Usuarios</span>
            </Link>
          </>
        )}
      </nav>
    </div>
  );
};
