import { cn } from "@/lib/utils";

export const Input = () => {
  return (
    <input
      type="text"
      className={cn("border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring")}
      placeholder="Input"
    />
  );
};
