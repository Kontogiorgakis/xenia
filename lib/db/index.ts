import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

declare global {

  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:dev.db" });

export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? [] : ["error"],
  });

export * from "@prisma/client";

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
