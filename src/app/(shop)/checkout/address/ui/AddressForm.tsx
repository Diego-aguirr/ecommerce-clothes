"use client";


import { FaShieldAlt, FaLock, FaCheckCircle } from "react-icons/fa";

import { AddressFormValues, Province } from "@/interfaces";
import { useAddressStore } from "@/store";
import { ShippingMethodSelector } from "@/components";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { deleteUserAddress } from "@/actions/address/delete-user-address";
import { setUserAddress } from "@/actions/address/set-user-address";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { setUserAddressSchema } from "@/lib/schemas/address.schema";

interface AddressFormProps {
  provinces: Province[];
  userId?: string;
  userAddress?: Partial<AddressFormValues>;
}

export default function AddressForm({
  provinces,
  userAddress,
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { isValid },
    reset,
    setValue,
    watch,
  } = useForm<AddressFormValues>({
    mode: "onChange",
    resolver: zodResolver(setUserAddressSchema),
    defaultValues: {
      ...userAddress,
      shippingMethod: userAddress?.shippingMethod ?? "delivery",
    },
  }); // Use useForm hook to manage form state and validation

  const router = useRouter();

  useSession({
    required: true,
  });

  const setAddress = useAddressStore((state) => state.setAddress);
  const address = useAddressStore((state) => state.address);
  const globalShippingMethod = useAddressStore((state) => state.shippingMethod);
  const setShippingMethod = useAddressStore((state) => state.setShippingMethod);

  // Observamos el valor local del formulario para renderizado rápido
  const formShippingMethod = watch("shippingMethod");
  const currentShippingMethod = formShippingMethod || globalShippingMethod;
  const isDelivery = currentShippingMethod === "delivery";

  useEffect(() => {
    // Si hay una dirección guardada en el store (del usuario local), precargar el formulario con esos datos.
    if (address && address.fullname) {
      reset(address); 
      setValue("shippingMethod", globalShippingMethod);
    }
  }, [address, reset, globalShippingMethod, setValue]);

  const onSubmit = async (data: AddressFormValues) => {
    const { rememberAddress, ...rest } = data;
    setAddress(data);
    setShippingMethod(data.shippingMethod); // Aseguramos que el store global se entere

    if (rememberAddress) {
      await setUserAddress(rest);
    } else {
      await deleteUserAddress();
    }

    router.push("/checkout");
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
      {/* Selector de Método de Envío */}
      <ShippingMethodSelector
        value={currentShippingMethod}
        onChange={(method) => {
          setShippingMethod(method); // Update global
          setValue("shippingMethod", method, { shouldValidate: true }); // Update form
        }}
      />

      {/* Nombre completo */}
      <div>
        <label
          htmlFor="fullname"
          className="block text-sm font-medium text-gray-700"
        >
          Nombre y Apellido
        </label>
        <input
          type="text"
          id="fullname"
          placeholder="Juan Pérez"
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
          {...register("fullname", { required: true })}
        />
      </div>

      {/* Campos de dirección - Solo visibles en modo delivery */}
      {isDelivery && (
        <>
          {/* Dirección */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="street"
                className="block text-sm font-medium text-gray-700"
              >
                Calle y Número
              </label>
              <input
                type="text"
                id="street"
                placeholder="Av. Corrientes 1234"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
                {...register("street", { required: isDelivery })}
              />
            </div>
            <div>
              <label
                htmlFor="apartment"
                className="block text-sm font-medium text-gray-700"
              >
                Piso, Depto, Timbre{" "}
                <span className="text-gray-500 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                id="apartment"
                placeholder="5B"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
                {...register("apartment")}
              />
            </div>
          </div>

          {/* Código postal y ciudad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="zip"
                className="block text-sm font-medium text-gray-700"
              >
                Código Postal
              </label>
              <input
                type="text"
                id="zip"
                placeholder="C1043AAS"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
                {...register("zip", { required: isDelivery })}
              />
            </div>
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                Ciudad
              </label>
              <input
                type="text"
                id="city"
                placeholder="Resistencia"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
                {...register("city", { required: isDelivery })}
              />
            </div>
          </div>

          {/* Provincia */}
          <div>
            <label
              htmlFor="province"
              className="block text-sm font-medium text-gray-700"
            >
              Provincia
            </label>
            <select
              id="province"
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
              {...register("provinceId", { required: isDelivery })}
            >
              <option value="">Selecciona una provincia</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Teléfono y DNI - Siempre visibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            placeholder="11 2345-6789"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
            {...register("phone", { required: true })}
          />
          <p className="mt-1 text-xs text-gray-500">
            {isDelivery
              ? "Para que el repartidor pueda contactarte"
              : "Para avisarte cuando tu pedido esté listo"}
          </p>
        </div>
        <div>
          <label
            htmlFor="dni"
            className="block text-sm font-medium text-gray-700"
          >
            DNI
          </label>
          <input
            type="text"
            id="dni"
            placeholder="12.345.678"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
            {...register("dni", { required: true })}
          />
          <p className="mt-1 text-xs text-gray-500">
            Requerido para la facturación
          </p>
        </div>
      </div>

      {/* Descripción opcional - Solo en delivery */}
      {isDelivery && (
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Descripción adicional{" "}
            <span className="text-gray-500 font-normal">(Opcional)</span>
          </label>
          <textarea
            id="description"
            placeholder="Ej: Casa con reja negra, timbre roto, dejar paquete en portería..."
            rows={3}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300 resize-none"
            {...register("description")}
          />
          <p className="mt-1 text-xs text-gray-500">
            Información adicional que ayude al repartidor a encontrar tu
            domicilio
          </p>
        </div>
      )}

      {/* Recordar dirección checkbox - Solo en delivery */}
      {isDelivery && (
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="rememberAddress"
            className="mr-2 h-4 w-4 text-brand-primary focus:ring-brand-accent border-gray-300 rounded"
            {...register("rememberAddress")}
          />
          <label
            htmlFor="rememberAddress"
            className="text-sm font-medium text-gray-700"
          >
            Recordar dirección?
          </label>
        </div>
      )}

      {/* Sección de Confianza / Seguridad */}
      <div className="flex flex-wrap justify-center items-center gap-6 py-6 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
        <div className="flex items-center text-gray-500 text-xs">
          <FaShieldAlt className="text-green-600 mr-2" size={16} />
          <span>Compra 100% Segura</span>
        </div>
        <div className="flex items-center text-gray-500 text-xs">
          <FaLock className="text-gray-400 mr-2" size={14} />
          <span>Datos Protegidos</span>
        </div>
        <div className="flex items-center text-gray-500 text-xs">
          <FaCheckCircle className="text-blue-500 mr-2" size={14} />
          <span>Garantía Satoru</span>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="pt-8 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Botones izquierda */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href="/cart"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300 hover:border-gray-400"
            >
              ← Volver al carrito
            </a>
          </div>

          {/* Botón principal derecha */}
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg text-white transition-all duration-300 shadow-sm hover:shadow-md ${!isValid ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400" : "bg-black hover:bg-gray-900"}`}
          >
            Continuar al Pago
          </button>
        </div>
      </div>
    </form>
  );
}
