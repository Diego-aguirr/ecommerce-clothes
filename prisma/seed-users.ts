import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * 🌱 IDEMPOTENT USER SEED — LOCAL ONLY
 *
 * Ensures the three auth test targets by unique email using upsert.
 * Never deletes or wipes anything — safe to re-run at any time.
 *
 * ⚠️ PROTECTIONS (run BEFORE any Prisma query):
 *   1. Blocks if NODE_ENV === "production"
 *   2. Blocks if DATABASE_URL points to Neon
 *   3. Blocks if DATABASE_URL is not a local/Docker URL
 *
 * Usage:
 *   docker exec <container> npx tsx prisma/seed-users.ts
 *   o
 *   pnpm seed:users
 */

// 🛡️ Guards — must run before any DB write
const env = process.env.NODE_ENV || "development";
const dbUrl = process.env.DATABASE_URL || "";

if (env === "production") {
  console.error("\n🛑 BLOCKED: NODE_ENV is 'production'");
  process.exit(1);
}

if (dbUrl.includes("neon.tech")) {
  console.error("\n🛑 BLOCKED: DATABASE_URL points to Neon (production)");
  process.exit(1);
}

const isLocalDb =
  dbUrl.includes("localhost") ||
  dbUrl.includes("127.0.0.1") ||
  dbUrl.includes("@db:") || // Docker service name
  dbUrl.includes("://db:"); // Docker internal

if (!isLocalDb) {
  console.error(
    "\n🛑 BLOCKED: DATABASE_URL does not look like a local database."
  );
  console.error("   Current URL:", dbUrl.replace(/\/\/.*@/, "//***@"));
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const seedTargets = [
  {
    where: { email: "diegoalexisaguirre2@gmail.com" },
    create: {
      id: "usr_diego_001",
      name: "Diego Alexis Aguirre",
      email: "diegoalexisaguirre2@gmail.com",
      emailVerified: new Date(),
      role: "admin" as const,
      isSuperAdmin: true,
      status: "ACTIVE" as const,
    },
    update: {
      name: "Diego Alexis Aguirre",
      emailVerified: new Date(),
      role: "admin" as const,
      isSuperAdmin: true,
      status: "ACTIVE" as const,
    },
  },
  {
    where: { email: "user@test.com" },
    create: {
      id: "usr_user_001",
      name: "Usuario Test",
      email: "user@test.com",
      emailVerified: new Date(),
      role: "user" as const,
      isSuperAdmin: false,
      status: "ACTIVE" as const,
    },
    update: {
      name: "Usuario Test",
      emailVerified: new Date(),
      role: "user" as const,
      isSuperAdmin: false,
      status: "ACTIVE" as const,
    },
  },
  {
    where: { email: "blocked@test.com" },
    create: {
      id: "usr_blocked_001",
      name: "Blocked Test",
      email: "blocked@test.com",
      emailVerified: new Date(),
      role: "user" as const,
      isSuperAdmin: false,
      status: "BLOCKED" as const,
    },
    update: {
      name: "Blocked Test",
      emailVerified: new Date(),
      role: "user" as const,
      isSuperAdmin: false,
      status: "BLOCKED" as const,
    },
  },
];

async function seedUsers() {
  console.log("🌱 Idempotent user seed — local only\n");

  for (const target of seedTargets) {
    const user = await prisma.user.upsert({
      where: target.where,
      create: target.create,
      update: target.update,
    });
    console.log(`   ✅ ${user.email} → ${user.role} / ${user.status}`);
  }

  const total = await prisma.user.count();
  console.log("\n═══════════════════════════════════════════════");
  console.log("✅ USER SEED COMPLETED");
  console.log(`   👤 Total users in DB: ${total}`);
  console.log("═══════════════════════════════════════════════\n");
}

seedUsers()
  .catch((e) => {
    console.error("❌ Error in user seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
