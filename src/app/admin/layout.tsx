import { requireAdmin } from "@/lib/admin/auth-utils";
import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/ui/admin-sidebar";
import { AdminProviders } from "@/components/admin/admin-providers";

export const metadata = {
  title: "Admin Panel | E-Commerce",
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <AdminProviders>
      <div className="flex h-screen bg-slate-50 text-gray-900 overflow-hidden font-sans">
        <AdminSidebar userRole={user.role} isSuperAdmin={user.isSuperAdmin} />

        <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {/* Spacer for hamburger button on mobile */}
            <div className="md:hidden w-10" />
            <h1 className="text-lg font-bold text-gray-800 tracking-tight hidden sm:block">
              Panel de Control General
            </h1>
            <h1 className="text-lg font-bold text-gray-800 tracking-tight sm:hidden">
              Admin
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              Modo Administrador
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">{user.name || user.email}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                {(user.name || user.email || "A").substring(0, 1)}
              </span>
            </div>
          </div>
        </header>

          {/* Main Content Scrollable */}
          <main className="flex-1 overflow-auto p-4 md:p-8 relative">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AdminProviders>
  );
}
