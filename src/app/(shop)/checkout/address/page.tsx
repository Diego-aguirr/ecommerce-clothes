import { Title, SatoruLogo } from "@/components";
import AddressForm from "./ui/AddressForm";
import Link from "next/link";
import { auth } from "../../../../../auth";
import { redirect } from "next/dist/client/components/navigation";
import { getEmailVerificationStatus } from "@/lib/email-verification";
import prisma from "@/lib/prisma";
import { getProvincies, getUserAddress } from "@/actions";
import { FaInfoCircle } from "react-icons/fa";

export default async function AddressPage() {
  const session = await auth();
  const provinces = await getProvincies(); // Obtener provincias para el formulario de dirección
  const userAddressResponse = await getUserAddress();
  const userAddress =
    userAddressResponse.ok && userAddressResponse.data
      ? {
          ...userAddressResponse.data,
          street: userAddressResponse.data.street ?? undefined,
          zip: userAddressResponse.data.zip ?? undefined,
          city: userAddressResponse.data.city ?? undefined,
          provinceId: userAddressResponse.data.provinceId ?? undefined,
          apartment: userAddressResponse.data.apartment ?? undefined,
          description: userAddressResponse.data.description ?? undefined,
        }
      : undefined;

  // 🔒 1. No logueado → login
  if (!session?.user?.id) {
    redirect("/login?redirect=/checkout");
  }

  // 🔒 2. Usuario real
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  // 🔒 3. Email bloqueado
  const verification = getEmailVerificationStatus(user);

  if (!verification.allowed) {
    redirect("/shop"); // o página informativa
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header con logo */}
        <div className="flex justify-center mb-12">
          <SatoruLogo />
        </div>

        {/* Barra de progreso */}
        <div className="w-full max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center text-brand-primary">
              <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 font-semibold">Envío</span>
            </div>
            <div className="flex-auto border-t-2 border-gray-300 mx-4"></div>
            <div className="flex items-center text-gray-500">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2">Pago</span>
            </div>
            <div className="flex-auto border-t-2 border-gray-300 mx-4"></div>
            <div className="flex items-center text-gray-500">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2">Confirmación</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:justify-center sm:items-center mb-12 px-4 sm:px-0">
          <div className="w-full max-w-2xl flex flex-col justify-center text-left">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <Title
                title="Datos de Envío"
                subtitle="Elegí cómo recibir tu pedido y completá tus datos"
              />

              {/* Banner de Información de Logística */}
              <div className="mt-4 mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg flex items-start space-x-3">
                <FaInfoCircle
                  className="text-blue-600 mt-0.5 shrink-0"
                  size={20}
                />
                <div>
                  <h4 className="text-sm font-bold text-blue-900">
                    Sobre la Logística
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Si elegís <strong>Envío a Domicilio</strong>, el servicio de
                    transporte y el costo del mismo se coordinarán directamente
                    con nosotros luego de finalizar la compra.
                  </p>
                </div>
              </div>

              <AddressForm provinces={provinces} userAddress={userAddress} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
