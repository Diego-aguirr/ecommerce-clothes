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
        <h2 className="text-2xl font-bold mb-2">Aún no tienes órdenes</h2>
        <p className="text-gray-500 mb-6">
          Tus pedidos aparecerán aquí una vez que realices una compra.
        </p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-10 rounded-lg transition-all"
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
        <table className="min-w-full">
          <thead className="bg-gray-200 border-b">
            <tr>
              <th
                scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
              >
                #ID
              </th>
              <th
                scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
              >
                Nombre completo
              </th>
              <th
                scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
              >
                Estado
              </th>
              <th
                scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
              >
                Opciones
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.id.split("-").at(-1)}
                </td>
                <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                  {order.OrderAddress?.fullname}
                </td>
                <td className="flex items-center text-sm  text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                  <IoCardOutline
                    className={clsx({
                      "text-green-800": order.isPaid,
                      "text-red-800": !order.isPaid,
                    })}
                  />
                  <span
                    className={clsx("mx-2", {
                      "text-green-800": order.isPaid,
                      "text-red-800": !order.isPaid,
                    })}
                  >
                    {order.isPaid ? "Pagada" : "Pendiente de pago"}
                  </span>
                </td>
                <td className="text-sm text-gray-900 font-light px-6 ">
                  <Link href={`/orders/${order.id}`} className="hover:underline">
                    Ver orden
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

