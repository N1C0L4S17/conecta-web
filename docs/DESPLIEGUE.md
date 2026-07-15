# Despliegue en la nube (acceso desde cualquier PC)

Meta: que cualquier persona entre a una URL e inicie sesión, sin instalar nada.
Arquitectura: **Render** (API + PostgreSQL, vía blueprint) + **Vercel** (frontend).
Todo en planes gratuitos.

---

## Paso 0 · Subir el código a GitHub
```bash
git init && git add . && git commit -m "CONECTA URP"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/conecta-web.git
git push -u origin main
```

## Paso 1 · API + Base de datos (Render, ~2 clics)
El repositorio incluye `render.yaml`, así que Render aprovisiona **todo solo**:

1. Entra a https://dashboard.render.com → **New +** → **Blueprint**.
2. Conecta tu repo `conecta-web` → Render detecta `render.yaml` → **Apply**.

Render crea la base de datos, genera el `JWT_SECRET`, ejecuta el esquema
(`prisma db push`) y la carga inicial (`seed`, idempotente), y publica la API en:
```
https://conecta-api.onrender.com/api
```
Verifica que responde: abre `.../api/health` → debe decir `{"status":"ok","db":"ok"}`.
Y la documentación interactiva en `.../api/docs`.

> Nota (plan free): el servicio se “duerme” tras 15 min de inactividad; la primera
> petición tras dormir tarda ~50 s. La BD gratuita de Render caduca a los 90 días;
> para algo permanente, usa **Neon** (ver más abajo).

## Paso 2 · Frontend (Vercel, ~3 clics)
1. Entra a https://vercel.com → **Add New… → Project** → importa el repo.
2. **Root Directory**: selecciona `frontend`.
3. En **Environment Variables** agrega:
   `NEXT_PUBLIC_API_URL = https://conecta-api.onrender.com/api`
4. **Deploy**. Vercel te da la URL pública, p. ej. `https://conecta-urp.vercel.app`.

## Paso 3 · Listo — compartir
Cualquier persona entra a la URL de Vercel e inicia sesión:

| Rol | Usuario | Contraseña |
|-----|---------|-----------|
| Administrador | admin@urp.edu.pe | conecta2025 |
| Analista | analista@urp.edu.pe | conecta2025 |
| Consulta | consulta@urp.edu.pe | conecta2025 |

Crea usuarios reales desde **Usuarios** (rol ADMIN) y cambia las contraseñas demo.

---

## Alternativa: base de datos permanente con Neon
Si prefieres una BD que no caduque:
1. Crea un proyecto en https://neon.tech y copia el connection string.
2. En `render.yaml` elimina el bloque `databases:` y el `fromDatabase`, y en su
   lugar define `DATABASE_URL` con el string de Neon (o ponlo como variable de
   entorno del servicio en el panel de Render).

## Recargar / actualizar datos
- **Reejecutar carga completa**: en el Shell del servicio en Render →
  `FORCE_SEED=1 npm run seed`.
- **Importar un Excel nuevo**: inicia sesión como ADMIN → **Importar** → valida y carga.

## Variables de entorno (referencia)
| Variable | Dónde | Valor |
|----------|-------|-------|
| DATABASE_URL | API | (automática desde la BD o Neon) |
| JWT_SECRET | API | (automática, `generateValue`) |
| JWT_EXPIRES_IN | API | 8h |
| CORS_ORIGIN | API | `*` (o tu dominio de Vercel) |
| NEXT_PUBLIC_API_URL | Frontend | URL de la API `/api` |
