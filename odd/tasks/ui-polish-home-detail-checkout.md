# UI Polish — Home, Producto, Checkout + Fix Logo

## Objective
Modernizar el aspecto de home, detalle de producto y checkout del cliente sin cambiar la estructura/diseño original: mejor jerarquía tipográfica, elevación sutil, spacing consistente. Arreglar bugs visuales introducidos por la migración Tailwind v4.

## Why
El usuario considera home/detail/checkout "feos, grandes"; la S del logo Satoru no se ve; se detectaron clases rotas por la migración.

## Scope
- IN: logo, Title, home, grid de productos, detalle (columna info + CTA), checkout confirmación + PlaceOrder, cart (mínimo), padding móvil del home
- OUT: dark mode (no se necesita), nuevos componentes, rediseño de estructura, colores de estado (red/green) — fuera de alcance por decisión del usuario

## Constraints
- NO cambiar el diseño original: solo pulir (tamaños, sombras, bordes, jerarquía, bugs)
- NO agregar features ni componentes nuevos
- Tokens semánticos Tailwind v4 (`text-foreground`, `bg-card`, etc.)
- Clases dinámicas con `cn()` (nunca `var()` ni hex en className)

## Checklist

- [x] T1 — Fix logo: `SatoruLogo.tsx` → `S` con `text-background` (visible sobre `bg-brand-secondary`)
- [x] T2 — Fix checkout: `checkout/(checkout)/page.tsx` → breadcrumbs `text-brand-primary` → `text-foreground`; pulir h1 (tracking-tight)
- [x] T3 — Fix PlaceOrder: typo `bg-mutedoreground` → `bg-foreground`; `clsx` → `cn()`; CTA con hover sutil
- [x] T4 — Title.tsx: h1 `text-foreground` (jerarquía; hoy todo es muted), márgenes menos dispares (`my-7` → `mb-6 mt-2`)
- [x] T5 — Home: wrapper con `px-4 sm:px-0` (hoy en móvil el contenido toca los bordes; layout tiene `px-0 sm:px-10`)
- [x] T6 — ProductGridItem: elevación de card sutil (`bg-card border border-border rounded-xl` + `hover:shadow-md transition-shadow`) sin romper hover de imagen
- [x] T7 — ProductPageClient: columna info más ancha (`[1fr_300px]/[1fr_340px]` → `[1fr_320px]/[1fr_360px]`); precio `text-4xl` → `text-3xl lg:text-4xl font-medium` (menos "grande")
- [x] T8 — AddToCart: CTA `h-14` → `h-12` (menos pesado); "Ir a Pagar" `bg-indigo-600` → `bg-foreground text-background` (sin colores random)
- [x] T9 — cart/page.tsx: título con `tracking-tight` (mínimo)
- [x] T10 — Verificación: `npx tsc --noEmit` + `pnpm run build` + curl de home/detalle/cart en dev server

## Route declaration
- Delegated direct (writer trigger: 8+ archivos no triviales); fallback inline si el runtime de sub-agentes falla (explore falló con error de free tier).

## Verification
- `npx tsc --noEmit` → 0 errores
- `pnpm run build` → OK
- curl home/producto/cart → 200 con clases nuevas presentes

## Progress
- [x] T1–T9 completadas vía writer; verificación T10 OK (tsc + build + curl 200)

## Closed
- Listo para review visual del usuario.

## Next step
T1–T9 vía un solo writer; después verificación T10.
