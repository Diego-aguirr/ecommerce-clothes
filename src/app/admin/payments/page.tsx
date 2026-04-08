import { requireSuperAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";

export const metadata = { title: "SuperAdmin | Pagos Registrados" };

export default async function AdminPaymentsPage() {
  await requireSuperAdmin();
  
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { order: { select: { id: true, user: { select: { email: true } } } } }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-700">Pagos en el Sistema (SuperAdmin)</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Proveedor / ID</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Orden Vinculada</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map(payment => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {new Date(payment.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="block font-medium text-gray-900 capitalize">{payment.provider}</span>
                  <span className="block text-xs font-mono text-gray-400">{payment.providerPaymentId || "Sin ID"}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  ${payment.amount.toFixed(2)} {payment.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${payment.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                      payment.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}
                  `}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="block font-mono text-xs text-indigo-600">{payment.order?.id?.split('-')[0]}...</span>
                  <span className="block text-xs text-gray-500">{payment.order?.user?.email}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No hay pagos registrados.
          </div>
        )}
      </div>
    </div>
  );
}
