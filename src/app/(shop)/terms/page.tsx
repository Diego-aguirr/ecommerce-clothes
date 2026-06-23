export const metadata = {
  title: "Términos y Condiciones | SAURON",
  description: "Términos y condiciones de uso y compra en SAURON.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">
        Términos y Condiciones
      </h1>
      
      <div className="prose prose-lg text-gray-600">
        <p className="mb-4">Bienvenido a la tienda online de SAURON. Al navegar y comprar en nuestro sitio, aceptás los siguientes términos:</p>
        
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Políticas de Cambio</h2>
        <p className="mb-4">
          Los cambios se pueden realizar dentro de los 30 días de realizada la compra, siempre y cuando la prenda se encuentre en las mismas condiciones en las que fue entregada (sin uso, sin lavar y con etiquetas puestas).
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Envíos y Retiros</h2>
        <p className="mb-4">
          Ofrecemos la opción de retiro en nuestro local ubicado en <strong>Av. Ejemplo 1234, Ciudad Autónoma</strong>, o envíos a coordinar. Los tiempos de envío dependen del transporte seleccionado al momento de la compra.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Disponibilidad de Stock</h2>
        <p className="mb-4">
          Nuestro stock online está sincronizado, pero al ser prendas exclusivas de mucha rotación, en caso de ocurrir una falla de sistema y comprar un producto sin stock, nos pondremos en contacto inmediato para ofrecerte una prenda de recambio o el reintegro total del dinero.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Métodos de Pago</h2>
        <p className="mb-4">
          Aceptamos pagos a través de plataformas seguras (Mercado Pago), efectivo (en nuestro local), y transferencias bancarias. En caso de elegir transferencia, el pedido se armará una vez que el pago esté impactado en nuestra cuenta.
        </p>
      </div>
    </div>
  );
}
