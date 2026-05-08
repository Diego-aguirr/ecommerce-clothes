"use client";

import Link from "next/link";
import clsx from "clsx";

import {
  IoCloseOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoSearchOutline,
  IoShirtOutline,
  IoTicketOutline,
  IoLocationOutline,
} from "react-icons/io5";
import { useUIStore } from "@/store";
import { logout } from "@/actions";
import { useSession } from "next-auth/react";

export const Sidebar = () => {
  const isSideMenuOpen = useUIStore((state) => state.isSideMenuOpen);
  const closeMenu = useUIStore((state) => state.closeSideMenu);

  const { data: session } = useSession();

  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user.role === "admin";

  return (
    <div>
      {/* Background black */}
      {isSideMenuOpen && (
        <div className="fixed top-0 left-0 w-screen h-screen z-10 bg-black opacity-30" />
      )}

      {/* Blur */}
      {isSideMenuOpen && (
        <div
          onClick={closeMenu}
          className="fade-in fixed top-0 left-0 w-screen h-screen z-10 backdrop-filter backdrop-blur-sm"
        />
      )}

      {/* Sidemenu */}
      <nav
        className={clsx(
          "fixed p-5 right-0 top-0 w-[85vw] sm:w-[400px] h-screen bg-white z-20 shadow-2xl transform transition-all duration-300 overflow-y-auto",
          {
            "translate-x-full": !isSideMenuOpen,
          }
        )}
      >
        <IoCloseOutline onClick={() => closeMenu()} />

        {/* Input */}
        <div className="relative mt-14">
          <IoSearchOutline size={20} className="absolute top-2 left-2" />
          <input
            type="text"
            placeholder="Buscar"
            className="w-full bg-gray-50 rounded pl-10 py-1 pr-10 border-b-2 text-xl border-gray-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Categorías Principales (Mobile Only) */}
        <div className="md:hidden mt-10">
          <Link
            href="/gender/men"
            onClick={() => closeMenu()}
            className="flex items-center p-2 hover:bg-gray-100 rounded transition-all"
          >
            <span className="ml-3 text-xl font-medium">Hombre</span>
          </Link>
          <Link
            href="/gender/women"
            onClick={() => closeMenu()}
            className="flex items-center mt-2 p-2 hover:bg-gray-100 rounded transition-all"
          >
            <span className="ml-3 text-xl font-medium">Mujer</span>
          </Link>
          <Link
            href="/gender/outfits"
            onClick={() => closeMenu()}
            className="flex items-center mt-2 p-2 hover:bg-gray-100 rounded transition-all"
          >
            <span className="ml-3 text-xl font-medium">Outfits</span>
          </Link>
          <Link
            href="/gender/unisex"
            onClick={() => closeMenu()}
            className="flex items-center mt-2 p-2 hover:bg-gray-100 rounded transition-all"
          >
            <span className="ml-3 text-xl font-medium">Accesorios</span>
          </Link>

          <div className="w-full h-px bg-gray-200 my-8" />
        </div>

        {/* Menú Privado de Usuario */}
        {isAuthenticated && (
          <>
            <Link
              href="/profile"
              onClick={() => closeMenu()}
              className="flex items-center mt-5 md:mt-10 p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoPersonOutline size={30} color="black"/>
              <span className="ml-3 text-xl">Perfil</span>
            </Link>

            <Link
              href="/orders"
              onClick={() => closeMenu()}
              className="flex items-center mt-5 p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoTicketOutline size={30} color="black"/>
              <span className="ml-3 text-xl">Órdenes</span>
            </Link>
            
            <Link
              href="/profile/addresses"
              onClick={() => closeMenu()}
              className="flex items-center mt-5 p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoLocationOutline size={30} color="black"/>
              <span className="ml-3 text-xl">Direcciones</span>
            </Link>
          </>
        )}

        {isAuthenticated && (
          <button
            className="flex w-full items-center mt-10 p-2 hover:bg-gray-100 rounded transition-all"
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
              className="flex items-center mt-10 p-2 hover:bg-gray-100 rounded transition-all"
              onClick={() => closeMenu()}
            >
              <IoLogInOutline size={30} />
              <span className="ml-3 text-xl">Ingresar</span>
            </Link>
          </>
        )}

        {isAdmin && (
          <>
            <div className="w-full h-px bg-gray-200 my-10" />
            
            <Link
              href="/admin"
              onClick={() => closeMenu()}
              className="flex items-center mt-10 p-2 hover:bg-gray-100 rounded transition-all font-semibold"
            >
              <IoPeopleOutline size={30} />
              <span className="ml-3 text-xl">Dashboard Admin</span>
            </Link>

            <Link
              href="/admin/products"
              onClick={() => closeMenu()}
              className="flex items-center mt-10 p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoShirtOutline size={30} />
              <span className="ml-3 text-xl">Productos</span>
            </Link>

            <Link
              href="/admin/orders"
              onClick={() => closeMenu()}
              className="flex items-center mt-10 p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoTicketOutline size={30} />
              <span className="ml-3 text-xl">Ordenes</span>
            </Link>
            <Link
              href="/admin/users"
              onClick={() => closeMenu()}
              className="flex items-center mt-10 p-2 hover:bg-gray-100 rounded transition-all"
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
