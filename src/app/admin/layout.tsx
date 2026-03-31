import { requireAdmin } from "@/lib/admin/auth-utils";
import Link from "next/link";
import { ReactNode } from "react";
import { 
  FiHome, FiBox, FiShoppingCart, FiUsers, FiFileText, FiDollarSign 
} from "react-icons/fi";

export const metadata = {
  title: "Admin Panel | E-Commerce",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Panel
          </h2>
          <p className="text-sm text-gray-500 mt-1 capitalize">
            {user.role} {user.isSuperAdmin && "(Super)"}
          </p>
        </div>
        
        <nav className="p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
            <FiHome /> Dashboard
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
            <FiBox /> Productos
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
            <FiShoppingCart /> Órdenes
          </Link>
          
          {user.isSuperAdmin && (
            <div className="pt-4 mt-4 border-t">
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider px-3">Super Admin</p>
              <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                <FiUsers /> Usuarios
              </Link>
              <Link href="/admin/payments" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                <FiDollarSign /> Pagos
              </Link>
              <Link href="/admin/audit" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                <FiFileText /> Auditoría
              </Link>
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
