import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Cliente Prisma perezoso: solo se instancia si hay DATABASE_URL.
 * En modo demo ningún código debería llegar aquí — si pasa, el error
 * lo dice claramente en lugar de fallar en un sitio raro.
 */
export function getDb(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL no está configurada. La app está en modo demo; " +
        "configura la base de datos en .env para usar datos reales.",
    );
  }
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({ connectionString: url });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

export function isDbEnabled(): boolean {
  return !!process.env.DATABASE_URL;
}
