import Link from "next/link";
import { ReactNode } from "react";

interface LinkItem {
  label: string;
  href: string;
}

interface Props {
  title: string;
  links: LinkItem[];
  children?: ReactNode;
}

export const FooterLinksColumn = ({ title, links, children }: Props) => {
  return (
    <div className="flex flex-col space-y-4">
      <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wider">
        {title}
      </h3>
      <nav className="flex flex-col space-y-3 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-gray-600 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded w-fit"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};
