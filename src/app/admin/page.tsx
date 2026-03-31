import { requireAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";
import { FiDollarSign, FiShoppingCart, FiBox, FiClock } from "react-icons/fi";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todayOrders,
    pendingOrders,
    productsCount,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.product.count(),
  ]);

  const revenueAggr = await prisma.order.aggregate({
    _sum: { total: true },
    where: { isPaid: true }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard General</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ventas (Pagadas)" 
          value={`$${revenueAggr._sum.total?.toFixed(2) || "0.00"}`} 
          icon={<FiDollarSign size={24} />} 
          color="bg-green-100 text-green-600" 
        />
        <StatCard 
          title="Órdenes Hoy" 
          value={todayOrders.toString()} 
          icon={<FiShoppingCart size={24} />} 
          color="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          title="Órdenes Pendientes" 
          value={pendingOrders.toString()} 
          icon={<FiClock size={24} />} 
          color="bg-yellow-100 text-yellow-600" 
        />
        <StatCard 
          title="Total Productos" 
          value={productsCount.toString()} 
          icon={<FiBox size={24} />} 
          color="bg-purple-100 text-purple-600" 
        />
      </div>

      <div className="mt-12 bg-white rounded-lg shadow-sm border p-6 flex flex-col justify-center items-center min-h-[300px] text-gray-400">
        <p className="text-lg">Selecciona un módulo en el menú lateral para operar.</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
      <div className={`p-4 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
