# 01 — Auth (Autenticación)

## Nombre
Sistema de Autenticación

## Función
Gestiona registro, login, sesiones, recuperación de contraseña y verificación de email. Soporta autenticación con credenciales (email/password) y Google OAuth.

## Importancia
🔴 **CRÍTICO** — Es la puerta de entrada. Sin auth funcional, nada más funciona.

## Archivos Involucrados

### Services
| Archivo | Función |
|---------|---------|
| `src/services/auth.service.ts` | Registro de usuarios, validación de credenciales |

### Actions
| Archivo | Función |
|---------|---------|
| `src/actions/auth/register.ts` | Registro con Zod validation |
| `src/actions/auth/login.ts` | Login con credenciales |
| `src/actions/auth/logout.ts` | Cierre de sesión |
| `src/actions/auth/google.ts` | OAuth con Google |

### API Routes
| Archivo | Función |
|---------|---------|
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth handler |
| `src/app/api/auth/forgot-password/route.ts` | Enviar email de recuperación |
| `src/app/api/auth/reset-password/route.ts` | Restablecer contraseña |

### Pages
| Ruta | Función |
|------|---------|
| `(auth)/login/page.tsx` | Formulario de login |
| `(auth)/new-account/page.tsx` | Formulario de registro |
| `(auth)/forgot-password/page.tsx` | Solicitar recuperación |
| `(auth)/reset-password/page.tsx` | Nueva contraseña |

### Modelos Relacionados
- `User` — Usuarios con roles (user/admin), estados (ACTIVE/BLOCKED/DELETED)
- `Account` — Cuentas OAuth (Google)
- `Session` — Sesiones activas
- `VerificationToken` — Tokens de verificación de email
- `PasswordResetToken` — Tokens de recuperación de contraseña

## Flujo de Registro

```
1. Usuario llena formulario (Zod validation)
2. action register.ts → auth.service.ts
3. Crear User en DB (sin password)
4. Redirect a login — el magic link verifica el email al iniciar sesión
```

## Flujo de Login

```
1. Usuario ingresa credenciales
2. action login.ts → NextAuth signIn
3. NextAuth verifica password (bcrypt)
4. Crear Session
5. Redirect a home
```

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

- **Providers**: Google OAuth + Credentials
- **Secret**: `NEXTAUTH_SECRET` en .env
- **URL**: `NEXTAUTH_URL` en .env
- **Auto-link**: Si un usuario se registró con credenciales y después usa Google con el mismo email, se linkea automáticamente (evita OAuthAccountNotLinked)

## Requiere Revisión

- [ ] Verificar que el auto-link funcione correctamente en producción
- [ ] Testear flujo completo de recuperación de contraseña
- [ ] Revisar que `isSuperAdmin` esté bien protegido

## Bugs Conocidos y Resueltos

- **OAuthAccountNotLinked**: Se resolvió agregando signIn callback que auto-linkea por email
- **Registro con fallo de email**: El usuario se creaba pero el error hacía parecer que falló → se creó doble registro
