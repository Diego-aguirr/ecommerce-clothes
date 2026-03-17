## Correr en dev

1.  Clonar el respositorio
2.  Crear una copia .evn.templete y renombralo a .env y cambiar las variables de entorno
3.  Instalar dependencias pnpm
4.  Levatanr base de datos Docker compose up -d
5.  Correr las migraciones de prisma 'npx prisma migrate dev'
6.  Ejecutar npx prisma db seed
7.  Correr el proyecto pnpm run dev
