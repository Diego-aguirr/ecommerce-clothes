import { Title } from "@/components";

import Link from "next/link";
import { redirect } from "next/navigation";
import { IoCardOutline } from "react-icons/io5";
import clsx from "clsx";

import { getOrdersByUser } from "@/actions";

export default async function OrdersPage() {
  const { ok, orders = [] } = await getOrdersByUser();

  if (!ok) {
    redirect("/auth/login");
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <IoCardOutline size={80} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gray-900">
          Aún no tienes órdenes
        </h2>
        <p className="text-gray-500 mb-6 text-center max-w-sm">
          Tus pedidos aparecerán aquí una vez que realices una compra.
        </p>
        <Link
          href="/"
          className="bg-[#111] hover:bg-[#333] text-white py-3 px-10 rounded-lg transition-all shadow-sm font-medium"
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
        <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <table className="min-w-full">
            <thead className="bg-[#f8f9fa] border-b border-gray-200">
              <tr>
                <th
                  scope="col"
                  className="text-sm font-semibold text-gray-900 px-6 py-4 text-left"
                >
                  #ID
                </th>
                <th
                  scope="col"
                  className="text-sm font-semibold text-gray-900 px-6 py-4 text-left"
                >
                  Nombre completo
                </th>
                <th
                  scope="col"
                  className="text-sm font-semibold text-gray-900 px-6 py-4 text-left"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="text-sm font-semibold text-gray-900 px-6 py-4 text-left"
                >
                  Opciones
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="bg-white border-b border-gray-100 transition duration-300 ease-in-out hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {order.id.split("-").at(-1)}
                  </td>
                  <td className="text-sm text-gray-700 px-6 py-4 whitespace-nowrap">
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
                      className="text-[#111] hover:underline font-medium"
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
              className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-5 flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                    Orden ID
                  </span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5">
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
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                  Destinatario
                </span>
                <p className="text-gray-800 font-medium text-sm mt-0.5">
                  {order.OrderAddress?.fullname}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href={`/orders/${order.id}`}
                  className="w-full block text-center bg-[#111] hover:bg-[#333] text-white py-2.5 rounded-lg shadow-sm font-medium text-sm transition-all"
                >
                  Ver detalle de orden
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
