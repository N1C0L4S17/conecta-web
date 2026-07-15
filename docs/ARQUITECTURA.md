# Arquitectura y roadmap

## Capas

```
Navegador ─HTTP/JWT─> Next.js (Vercel) ─REST─> NestJS (Render) ─Prisma─> PostgreSQL (Neon)
```

- **Frontend**: App Router, componentes cliente para el dashboard; ECharts para
  visualización; `sessionStorage` para el token; cliente `api.ts` centralizado.
- **Backend**: arquitectura modular NestJS (módulos Auth, Dashboard, Respuestas),
  DTOs con `class-validator`, guards JWT + Roles, `PrismaService` global.
- **Datos**: dimensiones normalizadas; toda métrica se consulta por API, nunca
  desde el Excel (el Excel solo alimenta el seed inicial vía el ETL).

## Principios aplicados

- **SOLID / capas**: controller → service → Prisma. Sin lógica en controllers.
- **Filtros unificados**: `FiltrosDto` se comparte entre dashboard y listado, y
  se traduce a un único `where` de Prisma → una sola fuente de verdad.
- **Escalable a multi-campaña**: la tabla `Campania` permite cargar 2026, 2027…
  sin tocar el modelo.

## Estado del sistema

✅ BD normalizada + migraciones + seed con datos reales
✅ API REST: `/auth`, `/dashboard/kpis|rubro|cargo|filtros`, `/respuestas`
✅ 7 KPIs + 2 gráficos + filtros dinámicos
✅ JWT con 3 roles
✅ Dashboard Next.js + preview autónomo
✅ **Módulo Reportes** — exportación server-side a Excel / PDF / CSV (roles ADMIN/ANALISTA)
✅ **Módulo Administración** — CRUD de usuarios y roles (solo ADMIN)
✅ **Importador de Excel** — subida → validación (dry-run) → carga transaccional (solo ADMIN)

## Endpoints nuevos

- `GET  /api/reports/{csv|excel|pdf}` — exporta respetando los filtros activos
- `GET/POST/PATCH/DELETE /api/admin/usuarios` — gestión de usuarios
- `POST /api/import/excel?dryRun=true|false` — validar o cargar un Excel

## Mejoras de producción implementadas

✅ Health check `/api/health` (usado por Render)
✅ Seguridad: `helmet` + rate limiting (120 req/min por IP)
✅ Documentación interactiva Swagger en `/api/docs`
✅ Seed idempotente (no borra datos en re-deploy; `FORCE_SEED=1` para forzar)
✅ Gráfico "Tasa de empleo por año de egreso" (líneas)
✅ Blueprint `render.yaml` (despliegue casi de un clic) + `vercel.json`
✅ Saneo de años fuera de rango [1961–2025]

## Roadmap restante

1. **Nuevos gráficos**: tasa de empleo por año/escuela (líneas), matriz
   satisfacción × adecuación, mapa por ubicación.
2. **Analítica avanzada**: predicción de empleabilidad (ML), alertas por umbral.
3. **Power BI Embedded / Microsoft 365** como integración opcional.
