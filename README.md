# Java Crew E-Commerce

Plataforma de E-Commerce moderna construida con Next.js 15, React 19, TypeScript, Tailwind CSS v4, Prisma (PostgreSQL) y NextAuth v5.

---

## 🚀 Guía de Instalación (Entorno de Desarrollo)

Sigue esta guía paso a paso para configurar y levantar el proyecto en tu entorno local.

### 1. Clonar el repositorio y preparar dependencias

```bash
# Clona el repositorio
git clone <tu-repositorio>
cd new-ecommerce-java

# Instala todas las dependencias
pnpm install
```

### 2. Configurar Variables de Entorno

Copia el archivo template para crear tus propias variables de entorno:

```bash
cp .env.template .env
```

👉 _Recuerda abrir `.env` y asegurarte de rellenar todas las variables requeridas (URL de BD, claves secretas, NextAuth URL, etc)._

### 3. Base de Datos (PostgreSQL via Docker)

Sube el contenedor de la base de datos de forma desatendida (`-d`) utilizando Docker Compose:

```bash
docker-compose up -d
```

### 4. Prisma: Migraciones y Semilla (Seed)

Prepara el esquema de tu base de datos y llénala automáticamente con data inicial (productos, usuarios, etc) para empezar a desarrollar:

```bash
# Aplica las migraciones a la BD recién levantada
npx prisma migrate dev

# Corre el script de semilla (Seed) para inyectar datos
npx prisma db seed
```

> **💡 Opcional - Explorar los datos:**
> Para visualizar las tablas y registros fácilmente desde el navegador, puedes usar:
>
> ```bash
> npx prisma studio
> ```

### 5. Iniciar la Aplicación

Levanta el entorno de desarrollo usando TurboPack:

```bash
pnpm run dev
```

🌐 Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 🔗 Integraciones de Webhooks (Ngrok)

Si estás trabajando con pasarelas de pagos de terceros (ej. Mercado Pago) y necesitas exponer tus endpoints locales a internet, usa Ngrok:

1. Autentica tu CLI (solo requerido la primera vez):

   ```bash
   npx ngrok config add-authtoken TU_TOKEN
   ```

2. Crea el túnel público conectado a tu servidor Next.js:
   ```bash
   npx ngrok http 3000
   ```
   _(Utiliza la URL de destino final HTTPS proporcionada por Ngrok para configurar tus notificaciones y Webhooks de la pasarela)._
