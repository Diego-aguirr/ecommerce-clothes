import Link from "next/link";
import { getUserAddress } from "@/actions";

interface Props {
  userId: string;
}

export const AddressDetails = async ({ userId }: Props) => {
  const result = await getUserAddress();
  const address = result.ok && result.data ? result.data : null;

  if (!address) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Dirección de Envío
          </h2>
          <Link
            href="/checkout/address"
            className="text-sm text-brand-accent hover:text-orange-600 font-medium transition-colors"
          >
            Agregar
          </Link>
        </div>
        <div className="space-y-2 text-gray-600">
          <p>No tienes una dirección configurada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Dirección de Envío</h2>
        <Link
          href="/checkout/address"
          className="text-sm text-brand-accent hover:text-orange-600 font-medium transition-colors"
        >
          Cambiar
        </Link>
      </div>
      <div className="space-y-2 text-gray-600">
        <p className="font-semibold">{address.fullname}</p>
        <p>
          {address.street} {address.apartment && `, ${address.apartment}`}
        </p>
        <p>
          {address.zip}, {address.city}
        </p>
        <p>{address.provinceId}</p>
        <p className="pt-2 text-sm">📱 {address.phone}</p>
      </div>
    </div>
  );
};
