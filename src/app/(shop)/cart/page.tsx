import OrderSummary from "./ui/OrderSummary";
import { ProductIncard } from "./ui/ProductIncard";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título principal */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Tu Carrito de Compra
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Revisá tus productos antes de continuar
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Sección de Items del Carrito */}
          <div className="lg:col-span-8 xl:col-span-8">
            <ProductIncard />
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-4 xl:col-span-4">
            <div className="sticky top-24">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
