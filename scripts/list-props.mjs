import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PrismaLibSql } = require("@prisma/adapter-libsql");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:dev.db" });
const prisma = new PrismaClient({ adapter });

const locations = await prisma.location.findMany({
  include: {
    properties: {
      include: { _count: { select: { reservations: true } } },
    },
  },
});

for (const l of locations) {
  console.log(`\n[${l.id}] ${l.name} (${l.isSingleUnit ? "single" : "complex"})`);
  for (const p of l.properties) {
    console.log(`  - [${p.id}] ${p.name}  (${p._count.reservations} reservations)`);
  }
}
await prisma.$disconnect();
