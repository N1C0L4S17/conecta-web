# Modelo de datos

Diseño en estrella: un hecho (`RespuestaEncuesta`) rodeado de dimensiones.

## Diagrama ER (lógico)

```
        ┌───────────┐      ┌─────────┐      ┌────────────┐
        │ Campania  │      │ Escuela │      │   Rubro    │
        │ id, anio  │      │ id,     │      │ id, nombre │
        └─────┬─────┘      │ nombre, │      └──────┬─────┘
              │            │ facultad│             │
              │            └────┬────┘             │
              │                 │                  │
              ▼                 ▼                  ▼
        ┌──────────────────────────────────────────────────┐
        │              RespuestaEncuesta (hecho)            │
        │  id, campaniaId(FK), escuelaId(FK), rubroId(FK),  │
        │  nivelCargoId(FK), anioEgreso, trabajando,        │
        │  tipoEmpleo, tipoEmpresa, correspondencia,        │
        │  satisfaccion, tiempoPrimerEmpleo, cargoTexto…    │
        └───────────────────────┬──────────────────────────┘
                                │
                                ▼
                         ┌────────────┐        ┌──────────┐
                         │ NivelCargo │        │ Usuario  │  (auth, rol)
                         │ id, nombre │        └──────────┘
                         └────────────┘
```

## Tablas

- **Campania** — encuesta por año (2025, futuras). PK `id`, único `anio`.
- **Escuela** — escuela + facultad derivada. Único `nombre`, índice `facultad`.
- **Rubro** — sector económico del empleador.
- **NivelCargo** — cargo estandarizado (Profesional, Mando medio…).
- **RespuestaEncuesta** — hecho analítico. Índices en las columnas de filtro.
- **Usuario** — cuentas con rol (ADMIN / ANALISTA / CONSULTA).

## Enums
`Rol`, `TipoEmpleo` (PRIVADA/PUBLICA), `Correspondencia` (TOTALMENTE/MUCHO/POCO/NADA),
`TiempoEmpleo` (MENOS_3M/ENTRE_3_6M/ENTRE_6_12M/ENTRE_1_2A/MAS_2A).

El detalle exacto está en `backend/prisma/schema.prisma`.
