# Developer Dashboard

> Toda tu vida como developer. Un solo dashboard.

Plataforma **open source** donde cualquier developer conecta **GitHub, LeetCode, Codeforces y WakaTime** y visualiza toda su actividad técnica en un solo lugar: commits, horas programadas, problemas resueltos, streaks, rating competitivo y más — con su historia guardada para siempre.

**[Demo en vivo →](https://devdash.app/dashboard)** · **[Perfil de ejemplo →](https://devdash.app/u/ada)**

**Estado:** Beta · 4 plataformas integradas · onboarding · perfil público · analytics · export GDPR

---

## Features

- **Dashboard unificado** — KPIs con sparklines, heatmap cross-platform, gráficos (lenguajes, horas, dificultad, rating), feed de actividad
- **4 integraciones** — GitHub (OAuth), WakaTime (OAuth), LeetCode (username), Codeforces (handle)
- **Perfil público** — `/u/tu-slug` con SEO, OG image dinámica, stats, heatmap, badges de plataformas
- **Analytics** — comparativas entre períodos, actividad por día de la semana, insights automáticos
- **Settings** — gestioná conexiones, exportá tus datos (JSON), borrá tu cuenta (GDPR)
- **Consistency Score (CCS)** — métrica propia 0-100 con fórmula pública y desglose
- **Snapshots diarios** — tu historia completa guardada para siempre (WakaTime free solo conserva 14 días)
- **Dark-first** con light mode · diseño minimalista estilo Linear/Vercel

---

## Quickstart (sin API keys)

```bash
pnpm install
pnpm dev
```

Abre http://localhost:3000. El **modo demo** carga 420 días de datos realistas generados localmente. No necesitas base de datos ni credenciales.

```bash
# Para build de producción en demo:
pnpm build    # DEMO_MODE=true por defecto si no hay DATABASE_URL
```

## Modo real

1. Copiá `.env.example` a `.env`
2. Configurá `DATABASE_URL` (PostgreSQL), `AUTH_SECRET`, `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`, `TOKEN_ENCRYPTION_KEY`
3. Para WakaTime: `WAKATIME_CLIENT_ID` y `WAKATIME_CLIENT_SECRET`
4. `DEMO_MODE=false`

```bash
pnpm db:migrate
pnpm dev
```

Al hacer login con GitHub, el primer sync importa tu último año de commits en background.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, RSC, Turbopack) + TypeScript |
| UI | Tailwind CSS 4 + shadcn/ui + Recharts + Framer Motion |
| Datos | PostgreSQL + Prisma 7 |
| Auth | Auth.js v5 (GitHub OAuth) |
| Imágenes | `@vercel/og` / `next/og` para share cards |
| Deploy | Vercel (cron de sync horario vía `/api/cron/sync`) |

## Arquitectura

```
src/
├── app/                    # App Router
│   ├── (dashboard)/        # Dashboard, analytics, settings (sidebar layout)
│   ├── onboarding/         # Flujo de conexión de plataformas
│   ├── u/[slug]/           # Perfil público
│   ├── api/
│   │   ├── auth/           # Auth.js + WakaTime OAuth callback
│   │   ├── cron/sync/      # Sincronización diaria automática
│   │   └── og/profile/     # Share cards OG dinámicas
│   └── actions/            # Server Actions (sync, connect, settings)
├── components/
│   ├── dashboard/          # Heatmap, KPIs, feed, gráficos
│   ├── charts/             # Recharts (lenguajes, rating, horas)
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── adapters/           # ⭐ PlatformAdapter: github, wakatime, leetcode, codeforces
│   ├── sync/               # Orquestador de sync (respeta rate limits)
│   ├── data/               # Pipeline: snapshots → DashboardData/ProfileData
│   └── crypto.ts           # AES-256-GCM para tokens OAuth
├── seed/                   # Datos del modo demo (420 días deterministas)
└── generated/prisma/       # Prisma Client (autogenerado)
```

### Principios

- **`PlatformAdapter`** — cada plataforma implementa una interfaz común. Añadir AtCoder o HackerRank = un archivo nuevo. *Es la unidad de contribución.*
- **`daily_snapshots`** — tabla central del producto. Los gráficos leen **siempre** de aquí, nunca de APIs externas en el request.
- **`compute.ts`** — función pura snapshots → datos del dashboard. Demo y real ejecutan el mismo código.
- **Demo-first DX** — `pnpm install && pnpm dev` y tenés todo funcionando sin configurar nada.

[PLANNING.md](PLANNING.md) tiene el diseño completo de producto, base de datos y roadmap.

---

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Landing con demo interactivo embebido |
| `/onboarding` | Conectar las 4 plataformas |
| `/dashboard` | KPIs, heatmap, gráficos, feed |
| `/analytics` | Comparativas, weekday, insights |
| `/settings` | Conexiones, export, delete, tema |
| `/u/[slug]` | Perfil público (SEO + OG image) |
| `/api/og/profile/[slug]` | Share card dinámica 1200×630 |

---

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md). El modo demo te da un entorno completo sin API keys. Issues `good first issue` en el [project board](https://github.com/thiago/devdashboard/issues).

## Self-hosting

Ver [docs/self-hosting.md](docs/self-hosting.md). Funciona en Vercel, Railway, o cualquier host que soporte Next.js + PostgreSQL.

## Licencia

[AGPL-3.0](LICENSE) — self-hostea con el producto completo, para siempre.
