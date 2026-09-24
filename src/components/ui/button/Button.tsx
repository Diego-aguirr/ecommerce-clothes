import { cn } from "@/lib/utils";

export const Button = () => {
  return (
    <button className={cn("px-4 py-2 rounded-md bg-brand-primary text-foreground hover:bg-brand-primary/90 transition-colors")}>
      Button
    </button>
  );
};
