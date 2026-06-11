# Self-hosting Developer Dashboard

La app está diseñada para correr en cualquier lado que soporte Next.js + PostgreSQL.

## Vercel (recomendado)

1. **Fork** del repo en GitHub
2. Creá un proyecto en [Vercel](https://vercel.com) apuntando a tu fork
3. Agregá las **variables de entorno** en Settings → Environment Variables:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon tiene free tier) |
| `AUTH_SECRET` | `npx auth secret` o `openssl rand -hex 32` |
| `AUTH_GITHUB_ID` | Client ID de tu [GitHub OAuth App](https://github.com/settings/developers) |
| `AUTH_GITHUB_SECRET` | Client Secret de la OAuth App |
| `TOKEN_ENCRYPTION_KEY` | 32 bytes en hex: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `WAKATIME_CLIENT_ID` | (opcional) Client ID de [WakaTime App](https://wakatime.com/apps) |
| `WAKATIME_CLIENT_SECRET` | (opcional) Client Secret |
| `CRON_SECRET` | Un string aleatorio para proteger `/api/cron/sync` |
| `DEMO_MODE` | `false` |
| `NEXTAUTH_URL` | URL de tu deploy (ej. `https://devdash.tudominio.com`) |

4. **Callback URLs** de la GitHub OAuth App: `https://TU_DOMINIO/api/auth/callback/github`
5. Deploy. La primera migración la ejecutás local o vía `prisma migrate deploy` en el build.

### Cron de sync

El archivo `vercel.json` ya configura un cron que llama a `/api/cron/sync` cada hora. Vercel lo detecta automáticamente. La variable `CRON_SECRET` protege el endpoint.

## Railway / Render / Fly.io

1. Cloná el repo
2. Configurá las variables de entorno (mismas que arriba)
3. `pnpm install && pnpm db:migrate && pnpm build && pnpm start`
4. Para el cron, usá un health check externo (cron-job.org, UptimeRobot) que llame a `/api/cron/sync` con el header `Authorization: Bearer TU_CRON_SECRET`

## Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm db:migrate && pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

La imagen necesita `DATABASE_URL` y el resto de variables en runtime.

## Requisitos

- **Node.js 20+**
- **PostgreSQL 14+** (Neon, Supabase, Railway, o local)
- **pnpm** (corepack enable)

## Migraciones

```bash
# Desarrollo (crea/edita migraciones)
pnpm db:migrate

# Producción (aplica migraciones existentes)
npx prisma migrate deploy
```

## Licencia

AGPL-3.0. Podés self-hostear con el producto completo, modificarlo y redistribuirlo. Si ofrecés el producto como servicio, el código fuente debe estar disponible para tus usuarios bajo la misma licencia.
