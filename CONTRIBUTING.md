# Guía de Contribución

¡Gracias por tu interés en contribuir! Este documento explica cómo proponer cambios, reportar problemas y seguir los estándares del proyecto.

---

## Cómo contribuir

### 1. Reportar un bug
- Usá el template **Bug Report** en GitHub Issues
- Incluí: pasos para reproducir, comportamiento esperado vs actual, entorno (Node, pnpm, OS), logs relevantes
- Si es un bug de seguridad, leé **SECURITY.md** primero

### 2. Proponer una feature
- Abrí un **Feature Request** en Issues antes de codear
- Explicá el problema que resuelve, alternativas consideradas y alcance
- Esperá feedback del maintainer antes de empezar

### 3. Pull Requests
- **Una feature/fix por PR** — PRs grandes se piden que se dividan
- Seguí la **convención de commits** (ver abajo)
- Tests y lint deben pasar: `pnpm run test:run && npx tsc --noEmit && pnpm run lint`
- Documentá cambios de comportamiento en el PR description
- Actualizá docs si toca (`docs/`, README, comentarios de código)

---

## Setup de desarrollo

```bash
# Requisitos: Node 24.x, pnpm >=10 (ver package.json → engines)
git clone https://github.com/Diego-aguirr/ecommerce-clothes.git
cd ecommerce-clothes
pnpm install

# Configurar env (ver README → Instalación)
cp .env.example .env  # completá las variables requeridas

# Levantar con Docker (recomendado)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# O sin Docker (requiere PostgreSQL local)
pnpm run dev
```

---

## Convención de Commits

Usamos **Conventional Commits**:

```
<type>(<scope>): <descripción corta>

[cuerpo opcional]

[footer opcional]
```

### Types
| Tipo      | Cuándo usar                          |
|-----------|--------------------------------------|
| `feat`    | Nueva funcionalidad                  |
| `fix`     | Corrección de bug                    |
| `docs`    | Solo documentación                   |
| `refactor`| Refactor sin cambio de comportamiento|
| `perf`    | Mejora de performance                |
| `test`    | Tests (agregar, corregir)            |
| `chore`   | Build, deps, tooling, CI             |
| `ci`      | Cambios en CI/CD                     |

### Scope (opcional)
Dominio afectado: `auth`, `orders`, `payments`, `webhook`, `checkout`, `cart`, `admin`, `products`, `db`, `ui`, `docs`, `config`, `deps`.

### Ejemplos
```
feat(webhook): add idempotency key check for duplicate MP deliveries
fix(checkout): correct IVA calculation to extract from inclusive total
docs(readme): document MERCADOPAGO_WEBHOOK_SECRET as required
refactor(order): extract stock reservation to separate function
test(webhook): add amountsMatch tolerance edge cases
```

---

## Estándares de Código

### TypeScript
- **Strict mode** siempre
- Tipos explícitos en funciones públicas y exports
- `type` over `interface` (flat, composable)
- Const assertions: `const X = { A: "a" } as const`
- Discriminated unions para estados
- Nunca `any`, nunca `@ts-ignore` sin justificación en comment

### React / Next.js
- **Server Components por defecto** — Client Components solo si: interacción usuario, browser APIs, animaciones, Zustand, form state
- Next.js 16 App Router patterns
- React 19 — no `useMemo`/`useCallback` (React Compiler)
- Server Actions para mutaciones (thin orchestrators → Services)
- Zod v4 para validación (`z.email()`, `z.uuid()`)

### Estilo
- **Tailwind v4** — `cn()` utility, no `var()` en className
- Single class: `className="bg-slate-800 text-white"`
- Merge: `cn(BASE, variant && "variant-class")`
- Dinámico: `style={{ width: "50%" }}`

### Testing
- Vitest (node environment)
- Unit tests para lógica pura (services, lib, utils)
- Tests en `*.test.ts` junto al código
- `pnpm run test:run` para CI

### Lint / Types
```bash
pnpm run lint        # ESLint
npx tsc --noEmit     # Type check
pnpm run test:run    # Tests
```

---

## Arquitectura (recordatorio)

```
UI (Server Components)
  │
  ▼
Actions (thin orchestrators)
  • Auth, Zod validation, error handling → { ok, error, data }
  • 0 Prisma queries direct
  │
  ▼
Services (business logic + Prisma)
  • server-only
  • Throw errors (no return { ok: false })
  │
  ▼
Prisma → PostgreSQL
```

### Reglas no negociables
- Actions = orchestrators (0 Prisma directo)
- Services = business logic + Prisma
- Validación Zod en **todo input externo**
- `server-only` en services
- Error handling uniforme: `{ ok: true, data }` / `{ ok: false, error }`

---

## Pull Request Checklist

Antes de abrir PR:

- [ ] `npx tsc --noEmit` pasa
- [ ] `pnpm run lint` pasa (0 errors)
- [ ] `pnpm run test:run` pasa (35/35)
- [ ] `pnpm run build` pasa
- [ ] Commits siguen Conventional Commits
- [ ] No `console.log`, no `TODO`, no código comentado
- [ ] Documentación actualizada (`docs/`, README, comments)
- [ ] Breaking changes documentados en PR description

---

## Código de Conducta

Ver **CODE_OF_CONDUCT.md**. Se aplica a todos los espacios del proyecto (Issues, PRs, Discussions).

---

## Preguntas

Si tenés dudas sobre arquitectura, dónde poner código, o cómo resolver algo: abrí un **Discussion** o preguntá en el Issue/PR correspondiente. Preferimos claridad antes que velocidad.