import { requireAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";
import { updateOrderStatus, updateOrderNotes, updateDeliveryStatus } from "@/actions/admin/orders";
import { notFound } from "next/navigation";
import { OrderStatus, DeliveryStatus } from "@/generated/prisma/client";

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
  const markAsShipped = async (formData: FormData) => {
    "use server";
    const tracking = formData.get("trackingCode")?.toString() || "";
    await updateDeliveryStatus(order.id, "shipped", tracking);
  };

  const saveNotes = async (formData: FormData) => {
    "use server";
    const notes = formData.get("notes")?.toString() || "";
    await updateOrderNotes(order.id, notes);
  };

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
            <div className="mt-4 pt-4 border-t flex flex-col items-end gap-1 text-gray-700">
              <p>Envío: ${order.shipping}</p>
              <p>Impuestos: ${order.tax}</p>
              <p className="text-xl font-bold mt-2 text-gray-900">Total: ${order.total.toFixed(2)}</p>
            </div>
          </div>

          {/* Gestión Logística Server Action Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Gestión de Envío</h2>
            <form action={markAsShipped} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Tracking</label>
                <input 
                  type="text" 
                  name="trackingCode" 
                  defaultValue={order.trackingCode || ""}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                  placeholder="Ej: AR123456789"
                />
              </div>
              <p className="text-sm text-gray-500">
                {order.shippedAt ? `Despachado en: ${new Date(order.shippedAt).toLocaleString()}` : "Aún no despachado"}
              </p>
              <button 
                type="submit" 
                className={`px-4 py-2 rounded shadow-sm text-white font-medium focus:outline-none transition-colors
                  ${order.deliveryStatus === 'shipped' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {order.deliveryStatus === 'shipped' ? 'Actualizar Tracking' : 'Marcar como Despachado (shipped)'}
              </button>
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
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Destinatario:</strong> {order.OrderAddress.fullname}</p>
                <p><strong>DNI:</strong> {order.OrderAddress.dni}</p>
                <p><strong>Tel:</strong> {order.OrderAddress.phone}</p>
                <p><strong>Dirección:</strong> {order.OrderAddress.street} {order.OrderAddress.apartment && `Depto ${order.OrderAddress.apartment}`}</p>
                <p><strong>Ciudad:</strong> {order.OrderAddress.city}, {order.OrderAddress.zip}</p>
                <p><strong>Provincia/Región:</strong> {order.OrderAddress.provinceId}</p>
                {order.OrderAddress.description && <p><strong>Nota entrega:</strong> {order.OrderAddress.description}</p>}
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
