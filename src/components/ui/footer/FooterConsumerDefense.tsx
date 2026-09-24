export const FooterConsumerDefense = () => {
  return (
    <div className="flex flex-col space-y-4">
      <h3 className="font-bold text-foreground uppercase text-sm tracking-wider">
        Defensa del Consumidor
      </h3>
      <a
        href="https://autogestion.produccion.gob.ar/consumidores"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full max-w-xs text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border rounded-lg py-3 px-4 hover:bg-muted hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm"
        aria-label="Sitio oficial de Defensa del Consumidor (abre en nueva ventana)"
      >
        Defensa del Consumidor
      </a>
    </div>
  );
};
