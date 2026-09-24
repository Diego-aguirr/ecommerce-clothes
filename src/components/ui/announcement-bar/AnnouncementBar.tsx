
import { FaTruck, FaShieldAlt } from "react-icons/fa";

export const AnnouncementBar = () => {
  return (
    <div
      className="bg-background text-foreground py-2.5 px-4 overflow-hidden relative border-b border-border flex items-center justify-center w-full"
    >
      <div className="animate-sway text-[10px] sm:text-xs md:text-sm text-center whitespace-nowrap font-bold tracking-wider flex-nowrap w-max">
        <FaTruck className="inline text-primary mr-1.5 -mt-0.5" />
        <span>ENVÍOS A TODO EL PAÍS</span>
        
        <span className="text-primary opacity-80 mx-3 text-[8px] sm:text-[10px] inline-block -mt-0.5">✦</span>
        
        <FaShieldAlt className="inline text-primary mr-1.5 -mt-0.5" />
        <span>PAGOS SEGUROS CON MERCADO PAGO</span>
      </div>
    </div>
  );
};
