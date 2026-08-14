/**
 * Prisma Seed — Entry Point
 *
 * Ejecuta: pnpm seed
 * Lógica completa: src/seed/index.ts
 *
 * ⚠️ REGLA: En Docker, correr con: docker exec <container> npx tsx prisma/seed.ts
 */

import { seed, prisma } from "@/seed/index";

const env = process.env.NODE_ENV;
const url = process.env.DATABASE_URL || "";

// 🛡️ BLOQUEAR si apunta a producción
if (env === "production" || url.includes("neon.tech")) {
  console.error(
    "\n🛑 SEED BLOQUEADO\n" +
    "   No se puede correr seed contra producción.\n\n" +
    "   En Docker:  docker exec <container> npx tsx prisma/seed.ts\n" +
    "   En local:   pnpm seed (solo si .env apunta a DB local)\n"
  );
  process.exit(1);
}

console.log(`\n⚠️  MODE: ${env || "development"}\n`);

seed()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
