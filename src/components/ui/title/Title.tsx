import { titleFont } from "@/config/fonts";

interface Props {
  title: string;
  subtitle?: string;
  className?: string;
}

export const Title = ({ title, subtitle, className }: Props) => {
  return (
    <div className={`mt-3 ${className}`}>
      <h1
        className={`${titleFont.className} antialiased text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mt-2 mb-6`}
      >
        {title}
      </h1>

      {subtitle && <h3 className="text-xl mb-5 text-muted-foreground">{subtitle}</h3>}
    </div>
  );
};
