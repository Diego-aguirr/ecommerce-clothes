import { requireAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";
import { FiDollarSign, FiShoppingCart, FiBox, FiClock } from "react-icons/fi";
import { StatCard } from "@/components/admin/dashboard/stat-card";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayOrders, pendingOrders, productsCount] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.product.count(),
  ]);

  const revenueAggr = await prisma.order.aggregate({
    _sum: { total: true },
    where: { isPaid: true },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Bienvenido al Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Aquí tienes un resumen de rendimiento en tiempo real de tu tienda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ingresos Totales (Pagados)"
          value={`$${revenueAggr._sum.total?.toFixed(2) || "0.00"}`}
          icon={<FiDollarSign size={24} />}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="Órdenes Creadas Hoy"
          value={todayOrders.toString()}
          icon={<FiShoppingCart size={24} />}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Órdenes Pendientes"
          value={pendingOrders.toString()}
          icon={<FiClock size={24} />}
          color="bg-amber-100 text-amber-600"
        />
        <StatCard
          title="Catálogo de Productos"
          value={productsCount.toString()}
          icon={<FiBox size={24} />}
          color="bg-indigo-100 text-indigo-600"
        />
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-6">
          Acciones Recomendadas
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-5 text-gray-400 border border-gray-100 shadow-inner">
            <FiBox size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Todo en orden
          </h3>
          <p className="text-gray-500 max-w-md font-medium text-sm leading-relaxed">
            Utiliza el panel lateral izquierdo para gestionar inventarios,
            bloquear usuarios, verificar pagos y autorizar despachos. Las
            auditorías están siendo registradas activamente.
          </p>
        </div>
      </div>
    </div>
  );
}
