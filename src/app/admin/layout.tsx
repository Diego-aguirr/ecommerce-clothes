import { requireAdmin } from "@/lib/admin/auth-utils";
import { ReactNode } from "react";
import { AdminSidebar } from "./components/ui/admin-sidebar";

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
    <div className="flex h-screen bg-slate-50 text-gray-900 overflow-hidden font-sans">
      <AdminSidebar userRole={user.role} isSuperAdmin={user.isSuperAdmin} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <h1 className="text-lg font-bold text-gray-800 tracking-tight">
            Panel de Control General
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              Modo Administrador
            </span>
          </div>
        </header>

        {/* Main Content Scrollable */}
        <main className="flex-1 overflow-auto p-8 relative">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
