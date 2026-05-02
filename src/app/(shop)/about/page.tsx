export const metadata = {
  title: "Sobre Nosotros | SATORU",
  description: "Conocé la historia detrás de SATORU, tu tienda de moda exclusiva.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">
        Quiénes Somos
      </h1>
      
      <div className="prose prose-lg text-gray-600">
        <p className="mb-6">
          ¡Bienvenidos a <strong>SATORU</strong>! Somos una pequeña empresa familiar nacida y criada con mucha pasión. Lo que empezó como una idea entre charlas, hoy es el espacio donde acercamos las mejores tendencias en moda masculina y femenina.
        </p>
        
        <p className="mb-6">
          Nuestro lema es simple: <em>Exclusividad, calidad y buen precio.</em> Creemos que vestirse bien y sentirse seguro no debería ser un lujo inalcanzable. Por eso, seleccionamos personalmente cada prenda, buscando siempre ese equilibrio perfecto que nos caracteriza.
        </p>

        <p className="mb-6">
          Nos podés encontrar en nuestro local físico ubicado en <strong>Don Orione 773, Barranqueras</strong>. Nos encanta recibir a nuestros clientes, asesorarlos y que se lleven no solo una prenda, sino una experiencia de compra cercana y cálida, como solo una familia sabe dar.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8 rounded-r-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-2">La Visión SATORU</h2>
          <p className="text-gray-700 italic">
            &quot;Queremos que cada persona que use SATORU sienta que lleva puesta una pieza exclusiva sin haber pagado de más.&quot;
          </p>
        </div>

        <p>
          Gracias por elegirnos y ser parte de nuestra familia. ¡Te esperamos!
        </p>
      </div>
    </div>
  );
}
