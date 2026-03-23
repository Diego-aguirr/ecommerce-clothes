import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import clsx from "clsx";
import { IoCardOutline } from "react-icons/io5";

import { getOrderById } from "@/actions";
import { Title, MercadoPagoButton } from "@/components";
import { currencyFormat } from "@/utils";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Orden #${id.split("-").at(-1)}`,
    description: `Detalle de la orden de compra #${id}`,
  };
}

export default async function OrderPage({ params }: Props) {
  const { id } = await params;

  // 🛡️ Validar que el ID sea un UUID válido antes de llamar al servidor
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUuid) {
    notFound();
  }

  // 🔒 Llamar al server action (valida sesión y propiedad)
  const { ok, order } = await getOrderById(id);

  if (!ok) {
    redirect("/auth/login");
  }

  if (!order) {
    notFound();
  }

  const address = order.OrderAddress;

  if (!address) {
    notFound();
  }

  return (
    <div className="flex justify-center items-center mb-72 px-10 sm:px-0">
      <div className="flex flex-col w-[1000px]">
        <Title title={`Orden #${id.split("-").at(-1)}`} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Carrito */}
          <div className="flex flex-col mt-5">
            <div
              className={clsx(
                "flex items-center rounded-lg py-2 px-3.5 text-xs font-bold text-white mb-5",
                {
                  "bg-red-500": !order.isPaid,
                  "bg-green-700": order.isPaid,
                },
              )}
            >
              <IoCardOutline size={30} />
              <span className="mx-2">
                {order.isPaid ? "Pagada" : "Pendiente de pago"}
              </span>
            </div>

            {/* Items */}
            {order.OrderItem.map((item) => (
              <div
                key={item.product.slug + "-" + item.size}
                className="flex mb-5"
              >
                <Image
                  src={`/products/${item.product.ProductImage[0].url}`}
                  width={100}
                  height={100}
                  style={{
                    width: "100px",
                    height: "100px",
                  }}
                  alt={item.product.title}
                  className="mr-5 rounded"
                />

                <div>
                  <p>{item.product.title}</p>
                  <p>
                    {currencyFormat(item.price)} x {item.quantity}
                  </p>
                  <p className="font-bold">
                    Subtotal: {currencyFormat(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout - Resumen de orden */}
          <div className="bg-white rounded-xl shadow-xl p-7">
            <h2 className="text-2xl mb-2">Dirección de entrega</h2>
            <div className="mb-10 text-gray-700">
              <p className="text-xl font-bold">{address.fullname}</p>
              <p>{address.street}</p>
              {address.apartment && <p>Dpto: {address.apartment}</p>}
              <p>
                {address.city}, {address.province.name}
              </p>
              <p>CP: {address.zip}</p>
              <p>Tel: {address.phone}</p>
              <p>DNI: {address.dni}</p>
              {address.description && (
                <p className="mt-2 italic">Ref: {address.description}</p>
              )}
            </div>

            {/* Divider */}
            <div className="w-full h-0.5 rounded bg-gray-200 mb-10" />

            <h2 className="text-2xl mb-2">Resumen de orden</h2>

            <div className="grid grid-cols-2 text-gray-700">
              <span>No. Productos</span>
              <span className="text-right">
                {order.itemsInOrder === 1
                  ? "1 artículo"
                  : `${order.itemsInOrder} artículos`}
              </span>

              <span>Subtotal</span>
              <span className="text-right">
                {currencyFormat(order.subTotal)}
              </span>

              <span>Impuestos (21%)</span>
              <span className="text-right">{currencyFormat(order.tax)}</span>

              <span>Costo de envío</span>
              <span className="text-right">
                {order.shipping === 0
                  ? "Envío Gratis"
                  : currencyFormat(order.shipping)}
              </span>

              <span className="mt-5 text-2xl font-bold">Total:</span>
              <span className="mt-5 text-2xl text-right font-bold">
                {currencyFormat(order.total)}
              </span>
            </div>

            <div className="mt-5 mb-2 w-full">
              {order.isPaid ? (
                <div className="flex items-center rounded-lg py-2 px-3.5 text-xs font-bold text-white mb-5 bg-green-700">
                  <IoCardOutline size={30} />
                  <span className="mx-2">Pagada</span>
                </div>
              ) : (
                <MercadoPagoButton orderId={order.id} amount={order.total} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
