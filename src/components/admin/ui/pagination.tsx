"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

type PaginationProps = {
  total: number;
  pageSize: number;
  currentPage: number;
};

// Componente interno que usa useSearchParams (necesita Suspense)
function PaginationInner({ total, pageSize, currentPage }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / pageSize);

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Smart ellipsis: muestra primero, último y 2 vecinos del actual
  const getPages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  const base =
    "inline-flex items-center justify-center h-9 min-w-[36px] px-3 rounded-lg text-sm font-semibold transition-all duration-150 select-none";
  const active = `${base} bg-foreground text-white shadow-sm`;
  const inactive = `${base} bg-card border border-border text-muted-foreground hover:bg-foreground hover:text-white hover:border-foreground cursor-pointer`;
  const disabledCls = `${base} bg-muted border border-muted text-border cursor-not-allowed pointer-events-none`;
  const ellipsisCls = `${base} border-0 text-muted-foreground cursor-default pointer-events-none`;

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-between pt-4 border-t border-muted mt-2"
    >
      {/* Info de registros */}
      <p className="text-xs text-muted-foreground font-medium hidden sm:block">
        Página <span className="text-foreground font-bold">{currentPage}</span> de{" "}
        <span className="text-foreground font-bold">{totalPages}</span>
        {" · "}
        <span className="text-foreground font-bold">{total}</span> registros
      </p>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* ← Anterior */}
        {currentPage > 1 ? (
          <Link href={buildHref(currentPage - 1)} className={inactive}>←</Link>
        ) : (
          <span className={disabledCls}>←</span>
        )}

        {/* Números de página */}
        {getPages().map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className={ellipsisCls}>...</span>
          ) : (
            <Link
              key={p}
              href={buildHref(p as number)}
              className={p === currentPage ? active : inactive}
            >
              {p}
            </Link>
          )
        )}

        {/* → Siguiente */}
        {currentPage < totalPages ? (
          <Link href={buildHref(currentPage + 1)} className={inactive}>→</Link>
        ) : (
          <span className={disabledCls}>→</span>
        )}
      </div>
    </nav>
  );
}

// Exportamos envuelto en Suspense para que funcione en Next.js 15 App Router
export function Pagination(props: PaginationProps) {
  return (
    <Suspense fallback={null}>
      <PaginationInner {...props} />
    </Suspense>
  );
}
