"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FiHome,
  FiBox,
  FiShoppingCart,
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiList,
  FiMenu,
  FiX,
} from "react-icons/fi";

export function AdminSidebar({
  userRole,
  isSuperAdmin,
}: {
  userRole: string;
  isSuperAdmin: boolean;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const links = [
    { name: "Dashboard", href: "/admin", icon: <FiHome />, exact: true },
    { name: "Productos", href: "/admin/products", icon: <FiBox /> },
    { name: "Categorías", href: "/admin/categories", icon: <FiList /> },
    { name: "Órdenes", href: "/admin/orders", icon: <FiShoppingCart /> },
  ];

  const superAdminLinks = [
    { name: "Usuarios", href: "/admin/users", icon: <FiUsers /> },
    { name: "Pagos", href: "/admin/payments", icon: <FiDollarSign /> },
    { name: "Auditoría", href: "/admin/audit", icon: <FiFileText /> },
  ];

  const checkHover = (href: string, exact: boolean = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && href !== "/admin";
  };

  const sidebarContent = (
    <>
      <div>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="inline-block transition-transform hover:scale-105 px-2"
            >
              <h2 className="text-2xl font-black tracking-tighter text-gray-900">
                STORE<span className="text-blue-600">.</span>
              </h2>
            </Link>
            {/* Close button - mobile only */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Cerrar menú"
            >
              <FiX size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="mt-6 flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold text-xs uppercase border border-blue-100">
              {userRole.substring(0, 2)}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800 capitalize leading-none">
                {userRole}
              </span>
              {isSuperAdmin && (
                <span className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-wider">
                  Super Admin
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1" aria-label="Menú principal">
          {links.map((link) => {
            const isActive = checkHover(link.href, link.exact);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span aria-hidden="true" className={isActive ? "text-blue-600" : "text-gray-400"}>
                  {link.icon}
                </span>
                {link.name}
              </Link>
            );
          })}

          {isSuperAdmin && (
            <div className="pt-6 mt-6 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest px-3" id="security-nav-heading">
                Seguridad
              </p>
              <nav aria-labelledby="security-nav-heading" className="space-y-1">
                {superAdminLinks.map((link) => {
                  const isActive = checkHover(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 shadow-sm"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={isActive ? "text-indigo-600" : "text-gray-400"}
                      >
                        {link.icon}
                      </span>
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400 font-medium">
          Salir a la{" "}
          <Link href="/" onClick={() => setIsOpen(false)} className="text-blue-600 hover:underline">
            tienda virtual
          </Link>
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Hamburger button - mobile only */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Abrir menú"
      >
        <FiMenu size={20} className="text-gray-700" />
      </button>

      {/* Desktop sidebar - always visible */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 shadow-sm flex-col justify-between shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar - slide in/out */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar panel */}
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
