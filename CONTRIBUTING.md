# Contribuir a Developer Dashboard

Gracias por querer contribuir. Este proyecto está diseñado desde el día 1 para que contribuir sea fácil y gratificante.

## Setup en 5 minutos

```bash
pnpm install
pnpm dev
```

Listo. La app arranca en **modo demo** con 420 días de datos realistas. No necesitas base de datos, API keys, ni configurar absolutamente nada.

Para trabajar con base de datos real (solo si vas a tocar el orquestador de sync o el adapter de GitHub):

```bash
cp .env.example .env
# Editá .env con DATABASE_URL, AUTH_SECRET, AUTH_GITHUB_ID, etc.
pnpm db:migrate
pnpm dev
```

## Dónde contribuir

### Nivel principiante — `good first issue`

- **Badges y achievements** — añadir uno nuevo es ~20 líneas declarativas en `src/lib/scores/`
- **Insights automáticos** — reglas nuevas en `computeInsights()`
- **Estados vacíos** — mejorar el UX cuando una plataforma no está conectada
- **Temas de share cards** — colores, layouts nuevos en `/api/og/`

### Nivel intermedio

- **Mejoras de UI** — animaciones, tooltips, responsividad
- **i18n** — traducciones (empezá con tu idioma)
- **Gráficos nuevos** — añadir visualizaciones al dashboard o analytics

### Nivel avanzado — adapters

- **Nueva plataforma** — implementar la interfaz `PlatformAdapter` en `src/lib/adapters/`
- Leé `src/lib/adapters/types.ts` y mirá `github.ts` como ejemplo (~180 líneas)
- Plataformas pedidas: AtCoder, HackerRank, GitLab, Kaggle, Exercism, Advent of Code

El adapter de ejemplo en `src/lib/adapters/github.ts` está comentado y muestra el patrón completo.

## Arquitectura en 1 minuto

```
src/lib/adapters/types.ts     ← Interfaz PlatformAdapter (el contrato)
src/lib/adapters/github.ts    ← Ejemplo de adapter (~180 líneas)
src/lib/sync/orchestrator.ts  ← Orquestador: ejecuta adapters, persiste snapshots
src/lib/data/compute.ts       ← Función pura: snapshots → datos del dashboard
src/seed/demo-data.ts         ← Datos del modo demo (PRNG determinista)
```

El orquestador no conoce los detalles de cada API. Solo itera sobre adapters que implementan la interfaz.

## Flujo de PR

1. **Issue primero** — abrí un issue para discutir qué querés hacer
2. **Fork + branch** — `feature/nombre-descriptivo`
3. **Código** — seguí las convenciones del proyecto (TypeScript, ESLint, Tailwind, sin comentarios innecesarios)
4. **Verificá** — `pnpm typecheck && pnpm lint && pnpm build`
5. **PR** — descripción clara, screenshots si es UI, referencia al issue

## Convenciones

- **Sin comentarios** a menos que expliquen *por qué*, no *qué*
- **Números en Geist Mono** con `stat-number` class y `font-variant-numeric: tabular-nums`
- **Dark-first** — el diseño default es oscuro; light mode es secundario
- **Estados vacíos que venden** — si una feature requiere una plataforma no conectada, mostrá un CTA para conectarla
- **Fórmulas transparentes** — cualquier score o métrica debe mostrar su desglose

## Necesitás ayuda?

Abrí un [issue](https://github.com/thiago/devdashboard/issues) o preguntá en [Discord](https://discord.gg/devdash). Respondemos en <24h.
