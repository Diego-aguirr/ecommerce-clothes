import { cn } from "@/lib/utils";

type ShippingMethod = "delivery" | "pickup";

type ShippingMethodSelectorProps = {
  value: ShippingMethod;
  onChange: (method: ShippingMethod) => void;
};

const OPTIONS: {
  value: ShippingMethod;
  label: string;
  subtitle: string;
  subtitleClassName: string;
}[] = [
  {
    value: "delivery",
    label: "A domicilio",
    subtitle: "A acordar con vendedor",
    subtitleClassName: "text-muted-foreground font-medium",
  },
  {
    value: "pickup",
    label: "Retiro en local",
    subtitle: "Gratis",
    subtitleClassName: "text-muted-foreground font-medium",
  },
];

export const ShippingMethodSelector = ({
  value,
  onChange,
}: ShippingMethodSelectorProps) => {
  return (
    <div className="mb-6">
      <span className="block text-sm font-medium text-muted-foreground mb-3">
        Método de entrega
      </span>
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
className={cn(
                "flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all text-center",
                {
                  "border-border bg-card ring-1 ring-border": isSelected,
                  "border-border hover:bg-card": !isSelected,
                },
              )}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="font-semibold text-foreground">
                {option.label}
              </span>
              <span className={cn("text-xs mt-1", option.subtitleClassName)}>
                {option.subtitle}
              </span>
            </label>
          );
        })}
      </div>

      {value === "delivery" && (
        <div className="mt-3 p-3 bg-muted text-muted-foreground border border-border rounded-lg text-sm flex items-start">
          <span className="mr-2">🚚</span>
          <span>
            Coordinaremos la empresa de transporte y el costo del envío
            directamente con vos después de tu compra.
          </span>
        </div>
      )}

      {value === "pickup" && (
        <div className="mt-3 p-3 bg-muted text-muted-foreground border border-border rounded-lg text-sm flex items-start">
          <span className="mr-2">📍</span>
          <span>
            Retirás tu pedido por nuestro local central. Te avisaremos cuando
            esté listo.
          </span>
        </div>
      )}
    </div>
  );
};
