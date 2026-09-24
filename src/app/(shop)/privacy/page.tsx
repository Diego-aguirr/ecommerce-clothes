export const metadata = {
  title: "Políticas de Privacidad | SAURON",
  description: "Políticas de Privacidad de SAURON.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-black text-foreground mb-8 tracking-tight">
        Políticas de Privacidad
      </h1>
      
      <div className="prose prose-lg text-muted-foreground">
        <p className="mb-4">Última actualización: {new Date().getFullYear()}</p>
        
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Recopilación de Información</h2>
        <p className="mb-4">
          En SAURON respetamos tu privacidad. Solo recopilamos los datos estrictamente necesarios para procesar tus compras y realizar envíos (nombre, dirección, email, teléfono). 
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Uso de los Datos</h2>
        <p className="mb-4">
          La información que nos proporcionás es utilizada exclusivamente para:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Gestionar y enviar tus pedidos.</li>
          <li>Enviarte actualizaciones sobre el estado de tu compra.</li>
          <li>Comunicarnos con vos en caso de algún inconveniente con el stock o envío.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Protección de Información</h2>
        <p className="mb-4">
          No compartimos, vendemos ni alquilamos tu información personal a terceros. Los pagos son procesados de forma encriptada a través de plataformas seguras (como Mercado Pago), por lo que SAURON no almacena en ningún momento los datos de tus tarjetas de crédito o débito.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Consentimiento</h2>
        <p className="mb-4">
          Al utilizar nuestro sitio web y realizar una compra, aceptás nuestras políticas de privacidad.
        </p>
      </div>
    </div>
  );
}
