🧠 Ecommerce API Agent — Ruleset Oficial

Stack obligatorio: Next.js 15 App Router · Prisma · Zod · NextAuth v5 · TypeScript strict

AUTO-INVOKE SKILLS

Cuando el agente realice una acción debe invocar primero:

Acción Skill
Crear endpoint API next-route-handler
Validar input zod-validation
Query DB prisma-query
Enviar email email-service
Auth check nextauth-session
Crear mutación server-action
Testing endpoint api-test
Sanitizar output security-output
REGLAS CRÍTICAS — NO NEGOCIABLES
AUTH

Siempre:

usar auth() server helper

validar sesión antes de query

verificar user en DB

Nunca:

confiar en session.user sin DB lookup

usar datos client-side

exponer estado de autenticación sensible

RESPUESTAS API

Formato obligatorio:

{ ok: true, data }
{ ok: false, error }

Nunca:

strings sueltos

booleans sin objeto

null ambiguo

SEGURIDAD

Siempre:

respuesta uniforme en endpoints sensibles

evitar user enumeration

tokens criptográficamente seguros

invalidar tokens previos

logs internos solamente

Nunca:

revelar si usuario existe

revelar estados internos

devolver stack trace

VALIDACIÓN

Todo input debe pasar Zod:

body

params

headers

cookies

Sin validación → implementación inválida.

DATABASE

Siempre:

Prisma client único

queries tipadas

select minimal fields

Nunca:

raw SQL

traer columnas innecesarias

queries duplicadas

EMAIL / TOKENS

Siempre:

tokens random seguros

expiración definida

invalidar tokens viejos

URL firmada

Nunca:

tokens predecibles

tokens infinitos

almacenar tokens en texto plano (si son sensibles → hash)

LÓGICA

Separación obligatoria:

Tipo Ubicación
route handler app/api/...
business logic lib/
queries lib/db
validation lib/zod

Nunca mezclar responsabilidades.

PERFORMANCE

Endpoints deben:

usar selects parciales

no bloquear event loop

delegar tareas largas

Regla:

<100ms → endpoint

> 100ms → background job

ERRORES

Siempre manejar:

Prisma errors

JSON parse errors

missing params

expired tokens

Nunca:

throw sin catch

error sin status code

DECISION TREE — Endpoint
¿requiere auth?
sí → validar session + user DB
no → validar input

¿modifica datos?
sí → POST / PATCH / DELETE
no → GET

DECISION TREE — TOKEN FLOW
¿ya existe token activo?
sí → invalidar
no → crear

crear token
guardar
enviar email
respuesta uniforme

ESTRUCTURA OBLIGATORIA API
app/api/
auth/
forgot-password/route.ts
reset-password/route.ts
resend-verification/route.ts
checkout/
orders/
payments/

Nunca crear rutas fuera de dominio.

NAMING
Elemento Regla
Route folder kebab-case
Handler file route.ts
Functions camelCase
Constants UPPER_CASE
CHECKLIST FINAL DEL AGENTE

Antes de terminar un endpoint:

input validado

sesión validada (si auth)

DB query optimizada

tokens seguros

errores controlados

output uniforme

tipos correctos

sin console.log

sin TODO

Si algo falla → endpoint inválido.
