# CONECTA URP · Plataforma de Analítica de Egresados

Sistema web que reemplaza el dashboard de Power BI de la Encuesta de Egresados
CONECTA URP. Toda la información proviene de **PostgreSQL** vía **API REST**;
el `.pbix` solo sirvió como referencia de la lógica de negocio.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) · React · TypeScript · TailwindCSS · Apache ECharts |
| Backend | NestJS · Prisma ORM · JWT |
| Base de datos | PostgreSQL (Neon) |
| Hosting | Vercel (front) · Render/Railway (back) · Neon (BD) |

## Estructura

```
conecta-web/
├─ backend/          API NestJS + Prisma (schema, seed, módulos)
├─ frontend/         App Next.js (dashboard, login, componentes)
├─ preview/          Dashboard autónomo (abrir index.html en el navegador)
├─ tools/            ETL que normaliza el Excel → seed-data.json
└─ docs/             Análisis del PBIX, arquitectura, modelo, despliegue
```

## Ver el resultado ya mismo (sin instalar nada)

Abre `preview/index.html` en tu navegador. Es el dashboard completo con tus
**datos reales 2025** embebidos, los 7 KPIs y los 2 gráficos, con **filtros
interactivos** — replica la misma lógica del backend.

## Levantar en local

### 1. Base de datos + API
```bash
cd backend
cp .env.example .env          # coloca tu DATABASE_URL de Neon y un JWT_SECRET
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed                  # carga dimensiones + 1357 respuestas + usuarios demo
npm run start:dev             # http://localhost:4000/api
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm install
npm run dev                   # http://localhost:3000
```

### Usuarios demo
| Rol | Email | Password |
|-----|-------|----------|
| Administrador | admin@urp.edu.pe | conecta2025 |
| Analista | analista@urp.edu.pe | conecta2025 |
| Consulta | consulta@urp.edu.pe | conecta2025 |

## Regenerar el seed desde un Excel nuevo
```bash
python tools/etl_seed.py ruta/al/DATA_CONECTA.xlsx
```

Ver `docs/` para el análisis del PBIX, el modelo de datos y la guía de despliegue.
```
```
El sistema cubre: BD normalizada, seed real, API de KPIs/filtros/respuestas,
autenticación JWT con roles, dashboard, **exportación de reportes (Excel/PDF/CSV)**,
**administración de usuarios** e **importador de Excel**. Roadmap restante en
`docs/ARQUITECTURA.md`.

## ⚠ Tras actualizar (campo nuevo `tieneNegocio`)
Si ya tenías la BD creada, aplica la migración y recarga:
```bash
cd backend
npx prisma migrate dev --name emprendimiento
npm run seed
```

## Compartir el dashboard con un clic (sin instalar nada)
`preview/conecta-dashboard.html` es un **único archivo** con los datos reales
embebidos, los 8 KPIs y los 2 gráficos, con filtros multi-selección. Para que
cualquiera lo abra desde cualquier PC:
- **Local**: doble clic al archivo.
- **URL pública en 1 minuto**: entra a https://app.netlify.com/drop y arrastra
  el archivo → obtienes un enlace que puedes compartir. (También sirve GitHub Pages.)
