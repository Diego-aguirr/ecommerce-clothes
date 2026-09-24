import { requireAdmin } from "@/lib/admin/auth-utils";
import { getDashboardStats } from "@/services/admin.service";
import { FiDollarSign, FiShoppingCart, FiBox, FiClock } from "react-icons/fi";
import { StatCard } from "@/components/admin/dashboard/stat-card";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-8">
<h1 className="text-3xl font-bold tracking-tight text-foreground">
           Bienvenido al Dashboard
         </h1>
         <p className="text-muted-foreground mt-1">
          Aquí tienes un resumen de rendimiento en tiempo real de tu tienda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ingresos Totales (Pagados)"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={<FiDollarSign size={24} />}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="Órdenes Creadas Hoy"
          value={stats.todayOrders.toString()}
          icon={<FiShoppingCart size={24} />}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          title="Órdenes Pendientes"
          value={stats.pendingOrders.toString()}
          icon={<FiClock size={24} />}
          color="bg-amber-100 text-amber-600"
        />
        <StatCard
          title="Catálogo de Productos"
          value={stats.productsCount.toString()}
          icon={<FiBox size={24} />}
          color="bg-indigo-100 text-indigo-600"
        />
      </div>

      <div className="mt-12">
<h2 className="text-xl font-bold tracking-tight text-foreground mb-6">
           Acciones Recomendadas
         </h2>
         <div className="bg-background rounded-2xl shadow-sm border border-border p-12 flex flex-col justify-center items-center text-center">
           <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-5 text-muted-foreground border border-border shadow-inner">
             <FiBox size={32} />
           </div>
           <h3 className="text-xl font-bold text-foreground mb-2">
             Todo en orden
           </h3>
           <p className="text-muted-foreground max-w-md font-medium text-sm leading-relaxed">
            Utiliza el panel lateral izquierdo para gestionar inventarios,
            bloquear usuarios, verificar pagos y autorizar despachos. Las
            auditorías están siendo registradas activamente.
          </p>
        </div>
      </div>
    </div>
  );
}
