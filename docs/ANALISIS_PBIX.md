# Análisis del PBIX original

El reporte `CONECTA_2025.pbix` tiene **1 página** con **9 objetos visuales**
sobre la tabla del modelo `Form_Responses3` (1,357 encuestados, campaña 2025).

## Medidas (7 tarjetas KPI)

Las medidas DAX vienen comprimidas en el DataModel (formato ABF), pero su lógica
se reconstruyó desde las hojas resumen del Excel y se **validó numéricamente**
contra los datos crudos:

| KPI | Fórmula | Valor 2025 |
|-----|---------|-----------|
| Tasa de empleo | Trabajando="Sí" / Total | 83.05% |
| Empleo formal (privada) | Privada / Empleados | 84.74% |
| Sector privado | Empresa Privada / Empleados | 84.92% |
| Adecuación profesional | (Totalmente + Mucho) / Empleados | 84.12% |
| Satisfacción laboral | Promedio(1–5) / 5 | 83.12% (4.16/5) |
| Empleo < 6 meses | (≤3m + 3–6m) / Empleados con dato | 82.87% |
| Empleo < 12 meses | (≤3m + 3–6m + 6–12m) / Empleados con dato | 91.48% |

## Gráficos (2 barras agrupadas)

- **% Distribución por Rubro** → columna `RUBRO`
- **% Distribución por Cargo** → columna `Cargo_Estandarizado`

## Decisiones de normalización / mejora

1. **PII excluida** (Ley 29733): DNI, nombres, celular y correos no se cargan.
   El dashboard es 100% analítico y no los necesita.
2. **Género omitido**: la columna `IngresesuGénero2` está 100% vacía en la hoja
   del modelo; se dejó el campo preparado para cuando exista dato.
3. **`tipoEmpleo` vs `tipoEmpresa`**: se conservaron ambos para respetar los 2
   KPIs originales, aunque miden lo mismo (difieren en 2 registros).
4. **Dimensiones normalizadas** (Escuela, Rubro, NivelCargo, Campania) en vez de
   texto repetido → filtros más rápidos y multi-campaña desde el diseño.
