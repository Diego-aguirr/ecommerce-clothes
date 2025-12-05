import { Title } from "@/components";
import Link from "next/link";

export default function AddressPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header con logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-brand-primary">
            URBANWEAR
          </Link>
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
                title="Dirección de Envío"
                subtitle="Completa tus datos para recibir tu pedido"
              />

              <form className="mt-6 space-y-6">
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
                    name="fullname"
                    placeholder="Juan Pérez"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
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
                      name="street"
                      placeholder="Av. Corrientes 1234"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="apartment"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Piso, Depto, Timbre{" "}
                      <span className="text-gray-500 font-normal">
                        (Opcional)
                      </span>
                    </label>
                    <input
                      type="text"
                      id="apartment"
                      name="apartment"
                      placeholder="5B"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
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
                      name="zip"
                      placeholder="C1043AAS"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
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
                      name="city"
                      placeholder="Resistencia"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
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
                    name="province"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
                  >
                    <option value="Buenos Aires">Buenos Aires</option>
                    <option value="Catamarca">Catamarca</option>
                    <option value="Chaco">Chaco</option>
                    <option value="Chubut">Chubut</option>
                    <option value="Ciudad Autónoma de Buenos Aires">
                      Ciudad Autónoma de Buenos Aires
                    </option>
                    <option value="Córdoba">Córdoba</option>
                    <option value="Corrientes">Corrientes</option>
                    <option value="Entre Ríos">Entre Ríos</option>
                    <option value="Formosa">Formosa</option>
                    <option value="Jujuy">Jujuy</option>
                    <option value="La Pampa">La Pampa</option>
                    <option value="La Rioja">La Rioja</option>
                    <option value="Mendoza">Mendoza</option>
                    <option value="Misiones">Misiones</option>
                    <option value="Neuquén">Neuquén</option>
                    <option value="Río Negro">Río Negro</option>
                    <option value="Salta">Salta</option>
                    <option value="San Juan">San Juan</option>
                    <option value="San Luis">San Luis</option>
                    <option value="Santa Cruz">Santa Cruz</option>
                    <option value="Santa Fe">Santa Fe</option>
                    <option value="Santiago del Estero">
                      Santiago del Estero
                    </option>
                    <option value="Tierra del Fuego">Tierra del Fuego</option>
                    <option value="Tucumán">Tucumán</option>
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
                      name="phone"
                      placeholder="11 2345-6789"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
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
                      name="dni"
                      placeholder="12.345.678"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300"
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
                    <span className="text-gray-500 font-normal">
                      (Opcional)
                    </span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Ej: Casa con reja negra, timbre roto, dejar paquete en portería..."
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300 resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Información adicional que ayude al repartidor a encontrar tu
                    domicilio
                  </p>
                </div>

                {/* Botones de navegación - MEJORADO */}
                <div className="pt-8 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    {/* Botones izquierda */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <Link
                        href="/cart"
                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300 hover:border-gray-400"
                      >
                        ← Volver al carrito
                      </Link>
                      <Link
                        href="/checkout"
                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300 hover:border-gray-400"
                      >
                        Checkout Rápido
                      </Link>
                    </div>

                    {/* Botón principal derecha */}
                    <Link
                      href="/checkout"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-brand-primary hover:bg-brand-accent transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      Continuar al Pago
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
