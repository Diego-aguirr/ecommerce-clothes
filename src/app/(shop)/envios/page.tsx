import Link from "next/link";
import { FiTruck, FiMapPin, FiBox } from "react-icons/fi";

export const metadata = {
  title: "Métodos de Envío | SAURON",
  description: "Información sobre nuestros métodos de envío, retiros y costos logísticos.",
};

export default function EnviosPage() {
  return (
<div className="min-h-screen bg-muted py-16">
       <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
           <h1 className="text-4xl font-black text-foreground tracking-tight mb-4">
             Métodos de <span className="text-primary">Envío</span>
           </h1>
           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Queremos que tus productos lleguen de forma segura y rápida. Conocé nuestras opciones de logística.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tarjeta 1: Envíos Nacionales */}
<div className="bg-background rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
             <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
               <FiTruck size={28} />
             </div>
             <h3 className="text-xl font-bold text-foreground mb-3">
               Envíos a todo el país
             </h3>
             <p className="text-muted-foreground leading-relaxed mb-4">
              Trabajamos con servicios de preferencia y despachamos a cualquier punto del territorio nacional de forma segura.
            </p>
<div className="bg-primary/10 p-4 rounded-lg mt-auto">
               <span className="block text-sm font-semibold text-foreground">Costo aproximado</span>
               <span className="block text-2xl font-black text-primary mt-1">$23.000</span>
            </div>
          </div>

          {/* Tarjeta 2: Uber Local */}
<div className="bg-background rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
             <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
               <FiMapPin size={28} />
             </div>
             <h3 className="text-xl font-bold text-foreground mb-3">
               Envíos por Uber
             </h3>
             <p className="text-muted-foreground leading-relaxed mb-4">
              Disponible exclusivamente para la zona del <strong>Gran Resistencia</strong> para que tengas tu paquete en el día.
            </p>
            <div className="bg-indigo-50 p-4 rounded-lg mt-auto border border-indigo-100">
              <span className="block text-sm font-semibold text-indigo-900">Coordinación</span>
              <span className="block font-bold text-indigo-700 mt-1">A acordar con el vendedor</span>
            </div>
          </div>

          {/* Tarjeta 3: Retiro en Local */}
<div className="bg-background rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow border-t-4 border-t-green-500">
             <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
               <FiBox size={28} />
             </div>
             <h3 className="text-xl font-bold text-foreground mb-3">
               Retiro en local
             </h3>
             <p className="text-muted-foreground leading-relaxed mb-4">
              Podés pasar a buscar tu compra directamente por nuestra sucursal una vez que te confirmemos que tu pedido está preparado.
            </p>
<div className="bg-muted p-4 rounded-lg mt-auto">
               <span className="block text-sm font-semibold text-muted-foreground">Costo</span>
               <span className="block text-2xl font-black text-green-600 mt-1">¡Gratis!</span>
            </div>
          </div>
        </div>

        {/* Nota Final */}
<div className="mt-12 bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
           <p className="text-primary font-medium">
             ¿Tenés alguna duda sobre los envíos? <Link href="/contact" className="underline font-bold hover:text-primary">Contactanos</Link> y lo resolvemos.
           </p>
         </div>

        <div className="mt-8 text-center">
           <Link
             href="/"
             className="inline-flex items-center text-sm text-primary/80 hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded transition-colors"
           >
             Ir a comprar →
           </Link>
         </div>
      </div>
    </div>
  );
}
