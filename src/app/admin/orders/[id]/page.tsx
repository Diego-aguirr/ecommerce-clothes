import { requireAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";
import { markAsShippedFormAction, markAsDeliveredFormAction, saveNotesFormAction, approvePaymentFormAction } from "@/actions/admin/orders";
import { notFound } from "next/navigation";
import { FiPackage, FiTruck, FiCheckCircle } from "react-icons/fi";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Admin | Orden ${id.split("-")[0]}` };
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const orderId = (await params).id;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      OrderAddress: { include: { province: true } },
      OrderItem: true,
      payments: true
    }
  });

  if (!order) return notFound();

  // Next.js 15 Native Server Actions bound forms
  const markAsShipped = markAsShippedFormAction.bind(null, order.id);
  const markAsDelivered = markAsDeliveredFormAction.bind(null, order.id, order.trackingCode || "");
  const saveNotes = saveNotesFormAction.bind(null, order.id);
  const approvePayment = approvePaymentFormAction.bind(null, order.id);

  const cashPayment = order.payments.find(p => p.provider === 'cash' && (p.status === 'CREATED' || p.status === 'PENDING'));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orden: {order.id}</h1>
        <div className="flex gap-2">
          <span className={`px-4 py-2 rounded-lg font-bold ${order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            PAGO: {order.status}
          </span>
          <span className={`px-4 py-2 rounded-lg font-bold ${order.deliveryStatus === 'shipped' || order.deliveryStatus === 'delivered' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
            ENVÍO: {order.deliveryStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Detalles de Productos */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Productos ({order.itemsInOrder})</h2>
            <div className="space-y-4">
              {order.OrderItem.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <div>
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">Talle: {item.size} • Cantidad: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-gray-900 border-l pl-4">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex flex-col gap-2">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal (Neto):</span>
                <span>${order.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>IVA (21% Incluido):</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Envío:</span>
                <span>{order.shipping === 0 ? "Gratis" : `$${order.shipping}`}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2 mt-2">
                <span>Total Facturado:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Estado Bancario Detallado */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Intentos de Pago (Gateway)</h2>
            {order.payments.length === 0 ? (
              <p className="text-gray-500">Aún no se generó link de pago.</p>
            ) : (
              <div className="space-y-3">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 border rounded shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold uppercase">{payment.provider}</span>
                      <span className="text-xs text-gray-500">ID: {payment.providerPaymentId || "Sin procesar"}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      <span className="font-bold text-gray-900">${Number(payment.amount).toFixed(2)}</span>
                      <span className={`px-3 py-1 rounded w-fit text-xs font-bold text-white
                        ${payment.status === 'APPROVED' ? 'bg-green-600' :
                        payment.status === 'REJECTED' ? 'bg-red-600' : 
                        payment.status === 'PENDING' ? 'bg-orange-500' : 
                        payment.status === 'CANCELLED' ? 'bg-gray-600' : 'bg-gray-800'}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cashPayment && (
              <form action={approvePayment} className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Pago en Efectivo / Transferencia</p>
                    <p className="text-xs text-amber-700">${Number(cashPayment.amount).toFixed(2)} — Pendiente de confirmación</p>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                  >
                    <FiCheckCircle size={16} />
                    Confirmar pago recibido
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Gestión Logística UI - Stepper Moderno */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-6 text-gray-900 border-b pb-3">Estado de Preparación y Envío</h2>
            
            {/* Visual Stepper */}
            <div className="relative flex items-center justify-between w-full mb-8 px-2">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
              
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full z-0 transition-all duration-500 ease-in-out bg-indigo-600" 
                style={{ width: order.deliveryStatus === 'pending' ? '0%' : order.deliveryStatus === 'shipped' ? '50%' : '100%' }}>
              </div>

              {/* Step 1: Preparando */}
              <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                  ${order.deliveryStatus === 'pending' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-indigo-600 border-indigo-600 text-white'}`}>
                  <FiPackage size={18} />
                </div>
                <span className="text-xs font-bold text-gray-700">Preparando</span>
              </div>

              {/* Step 2: Despachado */}
              <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                  ${order.deliveryStatus === 'pending' ? 'bg-white border-gray-200 text-gray-300' : 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'}`}>
                  <FiTruck size={18} />
                </div>
                <span className={`text-xs font-bold ${order.deliveryStatus === 'pending' ? 'text-gray-400' : 'text-gray-700'}`}>Despachado</span>
              </div>

              {/* Step 3: Entregado */}
              <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                  ${order.deliveryStatus === 'delivered' ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-200' : 'bg-white border-gray-200 text-gray-300'}`}>
                  <FiCheckCircle size={18} />
                </div>
                <span className={`text-xs font-bold ${order.deliveryStatus === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>Entregado</span>
              </div>
            </div>

            {/* Operaciones de Formulario */}
            <form action={markAsShipped} className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  1. Cargar Código de Seguimiento (Tracking)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiTruck className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    name="trackingCode" 
                    defaultValue={order.trackingCode || ""}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                    placeholder="Ej: Correo Argentino / Andreani..."
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-200 border-dashed">
                <span className="text-sm font-medium text-gray-500">
                  {order.shippedAt ? `Salida confirmada: ${new Date(order.shippedAt).toLocaleString()}` : "Paquete sin mover."}
                </span>

                <div className="flex gap-2">
                  {order.deliveryStatus === 'shipped' && (
                    <button
                      formAction={markAsDelivered}
                      className="px-5 py-2.5 rounded-lg shadow-sm text-white font-bold text-sm focus:outline-none transition-all bg-green-600 hover:bg-green-700 hover:shadow-lg flex items-center gap-2"
                    >
                      ✅ Marcar Entregado
                    </button>
                  )}
                  {order.deliveryStatus !== 'delivered' && (
                    <button 
                      type="submit" 
                      disabled={!order.isPaid && order.status !== "paid"}
                      className={`px-5 py-2.5 rounded-lg shadow-sm text-white font-bold text-sm focus:outline-none transition-all flex items-center gap-2
                        ${order.deliveryStatus === 'shipped' ? 'bg-gray-800 hover:bg-black' : 
                          !order.isPaid && order.status !== "paid" ? 'bg-gray-300 cursor-not-allowed opacity-70' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}
                    >
                      {order.deliveryStatus === 'shipped' ? 'Actualizar N° Envío' : '➡️ Pasar a Despachado'}
                    </button>
                  )}
                </div>
              </div>
              
              {(!order.isPaid && order.status !== "paid") && (
                <p className="text-xs text-red-500 font-medium font-mono text-right mt-1">
                  * Traba de seguridad: No podés despachar si la orden no está cobrada.
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="space-y-6">
          {/* Cliente y Dirección */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Cliente y Destino</h2>
            <p className="font-bold">{order.user.name}</p>
            <p className="text-gray-500 text-sm mb-4">{order.user.email}</p>
            
            {order.OrderAddress && (
              <div className="text-sm text-gray-700 space-y-1 mt-4 pt-4 border-t border-gray-100">
                <div className="mb-3">
                  <span className={`px-2.5 py-1 inline-flex text-xs font-bold uppercase rounded-md ${order.shippingMethod === 'pickup' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                    {order.shippingMethod === 'pickup' ? '🏪 Retiro en Local' : '🚚 Envío a Domicilio'}
                  </span>
                </div>
                <p><strong>Destinatario:</strong> {order.OrderAddress.fullname}</p>
                <p><strong>DNI:</strong> {order.OrderAddress.dni}</p>
                <p><strong>Tel:</strong> {order.OrderAddress.phone}</p>

                {order.shippingMethod === 'delivery' && (
                  <>
                    <p><strong>Dirección:</strong> {order.OrderAddress.street} {order.OrderAddress.apartment && `Depto ${order.OrderAddress.apartment}`}</p>
                    <p><strong>Ciudad:</strong> {order.OrderAddress.city}, {order.OrderAddress.zip}</p>
                    <p><strong>Provincia/Región:</strong> {order.OrderAddress.provinceId}</p>
                  </>
                )}
                
                {order.OrderAddress.description && (
                  <p className="mt-2 bg-yellow-50 p-2 rounded text-yellow-800 border border-yellow-200">
                    <strong>Nota del cliente:</strong> {order.OrderAddress.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Notas Operativas Server Action Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Notas Operativas (Interno)</h2>
            <form action={saveNotes} className="space-y-4">
              <textarea 
                name="notes"
                defaultValue={order.notes || ""}
                rows={4}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                placeholder="Notas internas para el equipo..."
              />
              <button 
                type="submit" 
                className="w-full bg-gray-800 text-white px-4 py-2 rounded shadow-sm hover:bg-gray-900 transition-colors"
              >
                Guardar Notas
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
