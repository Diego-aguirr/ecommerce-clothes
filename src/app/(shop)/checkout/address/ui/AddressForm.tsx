"use client";

import { AddressFormValues, Province } from "@/interfaces";
import { useAddressStore } from "@/store";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { deleteUserAddress, setUserAddress } from "@/actions";
import { useSession } from "next-auth/react";

interface AddressFormProps {
  provinces: Province[];
  userId: string;
}

export default function AddressForm({ provinces }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { isValid },
    reset,
  } = useForm<AddressFormValues>({
    defaultValues: {},
  }); // Use useForm hook to manage form state and validation

  const { data: session } = useSession({
    required: true,
  });

  const setAddress = useAddressStore((state) => state.setAddress);
  const address = useAddressStore((state) => state.address);

  useEffect(() => {
    // Si hay una dirección guardada en el store, precargar el formulario con esos datos
    if (address && address.fullname) {
      reset(address); // Preload form with saved address
    }
  }, [address, reset]);

  const onSubmit = (data: AddressFormValues) => {
    setAddress(data);

    // Aquí puedes agregar lógica para guardar la dirección o avanzar al siguiente paso
    const { rememberAddress, ...rest } = data;
    if (rememberAddress) {
      setUserAddress(rest);
    } else {
      deleteUserAddress();
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
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
            {...register("street", { required: true })}
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
            {...register("zip", { required: true })}
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
            {...register("city", { required: true })}
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
          {...register("provinceId", { required: true })}
        >
          <option value="">Selecciona una provincia</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      {/* Teléfono y DNI */}
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
            Para que el repartidor pueda contactarte
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
            Requerido por algunas empresas de correo
          </p>
        </div>
      </div>

      {/* Descripción opcional - Ahora al final */}
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
          Información adicional que ayude al repartidor a encontrar tu domicilio
        </p>
      </div>

      {/* Recordar dirección checkbox */}
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

      {/* Botones de navegación - MEJORADO */}
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
