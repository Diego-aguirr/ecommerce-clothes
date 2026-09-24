import { FooterSocialNetworks } from "./FooterSocialNetworks";
import { FooterLinksColumn } from "./FooterLinksColumn";
import { FooterConsumerDefense } from "./FooterConsumerDefense";
import { FooterTrustBar } from "./FooterTrustBar";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <FooterSocialNetworks />
          
          <FooterLinksColumn 
            title="Historia"
            links={[
              { label: "Quiénes Somos", href: "/about" },
              { label: "Contacto", href: "/contact" },
            ]}
          />
          
          <FooterLinksColumn 
            title="Enlaces Útiles"
            links={[
              { label: "Términos y Condiciones", href: "/terms" },
              { label: "Políticas de Privacidad", href: "/privacy" },
              { label: "Métodos de Envío", href: "/envios" },
            ]}
          />
          
          <FooterConsumerDefense />
        </div>

        <FooterTrustBar />
      </div>
    </footer>
  );
};
