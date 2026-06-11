import { defineConfig } from "prisma/config";

// La CLI de Prisma 7 ya no carga .env automáticamente.
// Node 24 puede cargarlo sin dependencias externas.
try {
  process.loadEnvFile();
} catch {
  // sin .env (p. ej. CI) — las vars vienen del entorno
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Solo necesaria para migrate/studio; `prisma generate` no la usa.
    url: process.env.DATABASE_URL ?? "",
  },
});
