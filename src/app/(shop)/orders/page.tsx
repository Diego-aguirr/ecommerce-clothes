import { Title } from "@/components";
import { Pagination } from "@/components/ui/pagination/pagination";

import Link from "next/link";
import { redirect } from "next/navigation";
import { IoCardOutline } from "react-icons/io5";
import clsx from "clsx";

import { getOrdersByUser } from "@/actions/order/get-orders-by-user";

const PAGE_SIZE = 10;

type Props = { searchParams: Promise<{ page?: string }> };

export default async function OrdersPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const result = await getOrdersByUser(currentPage, PAGE_SIZE);

  if (!result.ok) {
    return redirect("/auth/login");
  }

  const { orders, totalPages } = result;

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <IoCardOutline size={80} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          Aún no tienes órdenes
        </h2>
        <p className="text-muted-foreground mb-6 text-center max-w-sm">
          Tus pedidos aparecerán aquí una vez que realices una compra.
        </p>
        <Link
          href="/"
          className="bg-mutedoreground hover:bg-muted-foreground text-background py-3 px-10 rounded-lg transition-all shadow-sm font-medium"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <>
      <Title title="Mis Órdenes" />

      <div className="mb-10 px-2 sm:px-0">
        {/* ── VISTA DESKTOP (TABLA) ── */}
<div className="hidden md:block overflow-x-auto bg-background rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-border">
           <table className="min-w-full">
             <thead className="bg-muted border-b border-border">
              <tr>
                <th
                  scope="col"
                  className="text-sm font-semibold text-foreground px-6 py-4 text-left"
                >
                  #ID
                </th>
                <th
                  scope="col"
                  className="text-sm font-semibold text-foreground px-6 py-4 text-left"
                >
                  Nombre completo
                </th>
                <th
                  scope="col"
                  className="text-sm font-semibold text-foreground px-6 py-4 text-left"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="text-sm font-semibold text-foreground px-6 py-4 text-left"
                >
                  Opciones
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="bg-background border-b border-border transition duration-300 ease-in-out hover:bg-muted"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                    {order.id.split("-").at(-1)}
                  </td>
                  <td className="text-sm text-foreground px-6 py-4 whitespace-nowrap">
                    {order.OrderAddress?.fullname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={clsx(
                        "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full w-fit",
                        {
                          "bg-green-100 text-green-800": order.isPaid,
                          "bg-red-100 text-red-800": !order.isPaid,
                        },
                      )}
                    >
                      <IoCardOutline size={16} />
                      {order.isPaid ? "Pagada" : "Pendiente de pago"}
                    </span>
                  </td>
                  <td className="text-sm px-6">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-foreground hover:underline font-medium"
                      aria-label={`Ver detalle de la orden terminada en ${order.id.split("-").at(-1)}`}
                    >
                      Ver orden
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── VISTA MOBILE (TARJETAS APILADAS) ── */}
        <div className="md:hidden flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-background rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-border p-5 flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                    Orden ID
                  </span>
                  <span className="font-bold text-foreground text-sm mt-0.5">
                    {order.id.split("-").at(-1)}
                  </span>
                </div>

                <span
                  className={clsx(
                    "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
                    {
                      "bg-green-100 text-green-800": order.isPaid,
                      "bg-red-100 text-red-800": !order.isPaid,
                    },
                  )}
                >
                  <IoCardOutline />
                  {order.isPaid ? "Pagada" : "Pendiente"}
                </span>
              </div>

              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                  Destinatario
                </span>
                <p className="text-foreground font-medium text-sm mt-0.5">
                  {order.OrderAddress?.fullname}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href={`/orders/${order.id}`}
                  className="w-full block text-center bg-mutedoreground hover:bg-muted-foreground text-background py-2.5 rounded-lg shadow-sm font-medium text-sm transition-all"
                >
                  Ver detalle de orden
                </Link>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && <Pagination totalPages={totalPages} />}
      </div>
    </>
  );
}
