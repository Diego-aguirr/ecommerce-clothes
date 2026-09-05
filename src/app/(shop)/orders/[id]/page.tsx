import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import clsx from "clsx";
import { IoCardOutline } from "react-icons/io5";

import { getOrderById } from "@/actions/order/get-order-by-id";
import { MercadoPagoButton } from "@/components";
import { currencyFormat } from "@/utils";

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    status?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Orden #${id.split("-").at(-1)}`,
    description: `Detalle de la orden de compra #${id}`,
  };
}

export default async function OrderPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { status } = await searchParams;

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

  const isSuccess = status === "success";
  const isPending = status === "pending";
  const isFailure = status === "failure";
  const cashPayment = order.payments?.find(
    (p) => p.provider === "cash" && p.status === "CREATED"
  );

  return (
    <div className="flex justify-center items-center mb-40 px-5 sm:px-0">
      <div className="flex flex-col w-full max-w-[1000px]">
        {/* Feedback Banner */}
        {isSuccess && !order.isPaid && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900">Pago procesado</p>
              <p className="text-sm text-blue-700 mt-0.5">Estamos confirmando tu pago. Esta página se actualizará automáticamente.</p>
            </div>
          </div>
        )}

        {isSuccess && order.isPaid && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-900">¡Pago confirmado!</p>
              <p className="text-sm text-green-700 mt-0.5">Tu orden fue pagada exitosamente. Recibirás un email con los detalles.</p>
            </div>
          </div>
        )}

        {isPending && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-yellow-900">Pago pendiente</p>
              <p className="text-sm text-yellow-700 mt-0.5">Tu pago está siendo procesado. Te notificaremos cuando se confirme.</p>
            </div>
          </div>
        )}

        {isFailure && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-900">Pago no completado</p>
              <p className="text-sm text-red-700 mt-0.5">Hubo un problema con tu pago. Podés intentarlo nuevamente.</p>
            </div>
          </div>
        )}

        {/* Banner de instrucciones para pago en efectivo/transferencia */}
        {cashPayment && (
          <div className="mt-6 mb-2 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h3 className="text-base font-bold text-amber-900 mb-2">
              Instrucciones de pago
            </h3>
            <p className="text-sm text-amber-800 mb-3">
              Para completar tu compra, realizá una transferencia bancaria o
              aboná en efectivo al momento de retirar.
            </p>
            <div className="text-sm text-amber-900 space-y-1 bg-white/60 rounded-lg p-3">
              <p>
                <span className="font-semibold">Orden:</span> #{id.split("-").at(-1)}
              </p>
              <p>
                <span className="font-semibold">Total a abonar:</span>{" "}
                {currencyFormat(order.total)}
              </p>
              <p>
                <span className="font-semibold">CBU:</span>{" "}
                <span className="font-mono">0000000000000000000000</span>
              </p>
              <p>
                <span className="font-semibold">Alias:</span>{" "}
                <span className="font-mono">ALIAS.EJEMPLO</span>
              </p>
            </div>
            <p className="text-xs text-amber-700 mt-3">
              Una vez realizada la transferencia, envianos el comprobante por
              WhatsApp para acelerar la preparación de tu pedido.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 antialiased">
            Orden #{id.split("-").at(-1)}
          </h1>

          {/* Premium Status Pill */}
          <div
            className={clsx(
              "flex items-center w-fit rounded-full py-2 px-4 text-sm font-semibold border shadow-sm",
              {
                "bg-red-50 text-red-800 border-red-200": !order.isPaid,
                "bg-green-50 text-green-800 border-green-200": order.isPaid,
              },
            )}
          >
            <IoCardOutline size={20} className="mr-2" />
            <span>{order.isPaid ? "Orden Pagada" : "Pendiente de Pago"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
          {/* Columna Izquierda: Artículos */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-3">
              Artículos comprados
            </h2>
            <div className="flex flex-col gap-5">
              {order.OrderItem.map((item) => (
                <div
                  key={item.product.slug + "-" + item.size}
                  className="flex items-center gap-5 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <Image
                    src={item.product.ProductImage[0].url.startsWith('http') 
                      ? item.product.ProductImage[0].url 
                      : `/products/${item.product.ProductImage[0].url}`}
                    width={90}
                    height={90}
                    alt={item.product.title}
                    className="rounded-lg object-cover bg-gray-50 aspect-square"
                  />

                  <div className="flex-1 flex flex-col">
                    <p className="font-semibold text-gray-900 leading-tight">
                      {item.product.title}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Talle: {item.size}
                      </span>
                      {item.color && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                          {item.color.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {currencyFormat(item.price)}{" "}
                      <span className="mx-1">×</span> {item.quantity} un.
                    </p>
                    <p className="font-bold text-gray-900 mt-2">
                      {currencyFormat(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Resumen y Dirección */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-8 h-fit">
            {order.shippingMethod === "pickup" ? (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-brand-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Retiro en local
                </h2>
                <div className="text-sm text-gray-600 space-y-1.5 mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="font-semibold text-blue-900 text-base mb-2">
                    ¡Tu pedido te espera!
                  </p>
                  <p className="text-blue-800">
                    Retira a nombre de: <strong>{address.fullname}</strong>
                  </p>
                  <p className="text-blue-800">DNI: {address.dni}</p>
                  <p className="text-blue-800 mt-2">
                    📍 Dirigite a nuestro local central con tu DNI para retirar la compra.
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Dirección de entrega
                </h2>
                <div className="text-sm text-gray-600 space-y-1.5 mb-8">
                  <p className="font-semibold text-gray-900 text-base">
                    {address.fullname}
                  </p>
                  <p>
                    {address.street}{" "}
                    {address.apartment && `- Dpto: ${address.apartment}`}
                  </p>
                  <p>
                    {address.city}, {address.province?.name ?? "N/A"}
                  </p>
                  <p>CP: {address.zip}</p>
                  <p>Tel: {address.phone}</p>
                  <p>DNI: {address.dni}</p>
                  {address.description && (
                    <p className="pt-2 text-gray-500 italic">
                      &quot; {address.description} &quot;
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Divider */}
            <div className="w-full h-px border-t border-dashed border-gray-200 mb-8" />

            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Resumen de cuenta
            </h2>

            <div className="flex flex-col gap-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Productos ({order.itemsInOrder})</span>
                <span className="font-medium text-gray-900">
                  {currencyFormat(order.total)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Envío</span>
                {order.shippingMethod === "pickup" ? (
                  <span className="font-medium text-green-600">Gratis</span>
                ) : (
                  <span className="font-medium text-blue-600">
                    A acordar con vendedor
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-2">
                <span className="text-base font-bold text-gray-900">
                  Total a pagar
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {currencyFormat(order.total)}
                </span>
              </div>
              <p className="text-xs text-gray-400 -mt-2">
                IVA incluido: {currencyFormat(order.total - order.total / 1.21)}
              </p>
            </div>

            <div className="mt-8">
              {order.isPaid ? (
                <div className="flex items-center justify-center w-full rounded-xl py-3.5 px-4 text-sm font-bold text-white bg-green-600 shadow-sm">
                  <IoCardOutline size={22} className="mr-2" />
                  <span>Transacción completada</span>
                </div>
              ) : cashPayment ? (
                <div className="flex items-center justify-center w-full rounded-xl py-3.5 px-4 text-sm font-bold text-amber-800 bg-amber-100 border border-amber-200 shadow-sm">
                  <IoCardOutline size={22} className="mr-2" />
                  <span>Pago pendiente — Efectivo / Transferencia</span>
                </div>
              ) : (
                <div className="w-full pt-2">
                  <MercadoPagoButton orderId={order.id} amount={order.total} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
