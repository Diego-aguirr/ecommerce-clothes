# 01 — Auth (Autenticación)

## Nombre
Sistema de Autenticación

## Función
Gestiona registro, login por magic link y Google OAuth, sesiones y verificación de email automática al iniciar sesión.

## Importancia
🔴 **CRÍTICO** — Es la puerta de entrada. Sin auth funcional, nada más funciona.

## Archivos Involucrados

### Services
| Archivo | Función |
|---------|---------|
| `src/services/auth.service.ts` | Registro de usuarios (sin password), lookup de usuarios para magic link |

### Actions
| Archivo | Función |
|---------|---------|
| `src/actions/auth/register.ts` | Registro con Zod validation |
| `src/actions/auth/login.ts` | Envío de magic link (respuesta uniforme: no revela si el email existe) |
| `src/actions/auth/google.ts` | OAuth con Google |

### API Routes
| Archivo | Función |
|---------|---------|
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth handler |
| `src/app/api/auth/magic-link/route.ts` | Redirect legacy de links viejos |
| `src/app/api/auth/verify/route.ts` | Stub degradación — redirect legacy (la verificación ocurre al iniciar sesión) |

### Pages
| Ruta | Función |
|------|---------|
| `(auth)/login/page.tsx` | Formulario de login |
| `(auth)/new-account/page.tsx` | Formulario de registro |

### Modelos Relacionados
- `User` — Usuarios con roles (user/admin), estados (ACTIVE/BLOCKED/DELETED)
- `Account` — Cuentas OAuth (Google)
- `Session` — Sesiones activas
- `VerificationToken` — Tokens de magic link (Auth.js)

## Flujo de Registro

```
1. Usuario llena formulario (Zod validation)
2. action register.ts → auth.service.ts
3. Crear User en DB (sin password)
4. Redirect a login — el magic link verifica el email al iniciar sesión
```

## Flujo de Login (Magic Link)

```
1. Usuario ingresa su email en LoginForm (campo email únicamente — no hay campo password)
2. action login.ts (sendMagicLink) → NextAuth signIn("email")
3. NextAuth envía el magic link por email (Resend vía lib/mailer, TTL 5 min)
4. Usuario clickea el link → NextAuth valida el token y crea Session (JWT)
5. Redirect a home
```

> **No existe login por password**: no hay Credentials provider, el usuario nunca define
> una contraseña y no existe flujo de "olvidé mi password". Los únicos providers son
> **Magic Link (email)** y **Google OAuth**.

## Enforcement de `User.status` (fail-closed)

- **Al iniciar sesión (callback `signIn` en `auth.ts`)**: Email y Google rechazan usuarios con
  status distinto de `ACTIVE`. `BLOCKED`/`DELETED` se tratan como desconocidos: respuesta
  uniforme, sin disclosure.
- **En cada refresh del JWT (callback `jwt`)**: se relee `User.status` de la DB; si dejó de estar
  `ACTIVE`, el callback devuelve `null` y **se limpia la cookie** — un bloqueo a mitad de sesión
  surte efecto antes de que expire el token.

## Flujo Google OAuth

```
1. Usuario clickea "Continuar con Google"
2. NextAuth redirige a Google
3. Google retorna callback con code
4. NextAuth intercambia code por tokens
5. signIn callback: auto-link por email si usuario ya existe
6. Crear Account + Session
7. Redirect a home
```

## Configuración

- **Providers**: Google OAuth + Email (magic link) — sin Credentials, sin passwords
- **Secret**: `NEXTAUTH_SECRET` en .env
- **URL**: `NEXTAUTH_URL` en .env
- **Auto-link**: Si un usuario se registró por magic link y después usa Google con el mismo email, se linkea automáticamente (evita OAuthAccountNotLinked)

## Requiere Revisión

- [ ] Verificar que el auto-link funcione correctamente en producción
- [ ] Revisar que `isSuperAdmin` esté bien protegido

## Bugs Conocidos y Resueltos

- **OAuthAccountNotLinked**: Se resolvió agregando signIn callback que auto-linkea por email
- **Registro con fallo de email**: El usuario se creaba pero el error hacía parecer que falló → se creó doble registro
