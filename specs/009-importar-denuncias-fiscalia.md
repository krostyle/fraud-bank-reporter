# 009 - Importar Denuncias de Fiscalía (CSV secundario, actualiza Casos existentes)

## Contexto

Un segundo reporte, distinto del CSV principal de Casos (specs 001/007), exportado con estas columnas:

```
"Case","Caso fiscalía: Número del caso","Caso fiscalía: Nombre / Razón social",
"Caso fiscalía: Fecha/Hora de apertura","Caso fiscalía: Fecha Envío Fiscalía","Documento",
"Estado","Fecha recepcion","Caso fiscalía: Dolo","Caso fiscalía: Localidad / Comuna / Región",
"CaseDocument: Nombre del propietario","Caso fiscalía: Sub Status"
```

A diferencia del import principal, este **no reemplaza ni reconcilia la lista completa de Casos** — es un archivo más chico y acotado (solo denuncias) que **enriquece Casos que ya existen**, actualizando 3 campos puntuales. Confirmado con el usuario:

- **Match**: `Caso fiscalía: Número del caso` = la misma OT (`Caso.ot`).
- **Campos a agregar/actualizar** en el Caso encontrado:
  - `Case` → **OT UR** (`otUr`): el número de OT relacionado con la Unidad de Reclamos. Texto libre, sin validación.
  - `Fecha recepcion` → **Fecha Recepción** (`fechaRecepcion`), fecha.
  - `Estado` → **Estado Fiscalía** (`estadoFiscalia`), texto libre — es un campo **nuevo y distinto** de `Estado Acción Legal` (que ya existe y no se toca acá).
- **Filtro**: de este archivo solo se procesan las filas donde `Documento` = `"Denuncia"` (exacto). El resto de las filas se ignora por completo.
- **OT sin match**: si la OT de una fila (ya filtrada por Documento=Denuncia) no corresponde a ningún Caso existente, esa fila se ignora — no crea un Caso nuevo. Se informa cuántas filas quedaron sin match para que se pueda revisar.
- Las demás columnas del archivo (`Nombre / Razón social`, `Fecha/Hora de apertura`, `Caso fiscalía: Fecha Envío Fiscalía`, `Dolo`, `Localidad / Comuna / Región`, `Nombre del propietario`, `Sub Status`) **no se usan** — se ignoran, no hace falta que estén presentes en el archivo.
- **Sin reconciliación de `activo`**: este import nunca marca Casos como inactivos ni crea Casos nuevos — es puramente una actualización condicionada a que la OT ya exista.

## Alcance

1. **Parser** (`src/lib/casos/denuncias-fiscalia.ts`): lee el CSV (reutiliza `fixMojibake`/`decodeCsvBuffer` existentes), matchea columnas **por nombre de cabecera** (mismo enfoque que spec 007, robusto a reordenamientos futuros) exigiendo solo las 4 cabeceras que realmente se usan (`Case`, `Caso fiscalía: Número del caso`, `Documento`, `Estado`, `Fecha recepcion` — error claro si falta alguna). Filtra por `Documento = "Denuncia"`, y si la misma OT se repite dentro del archivo ya filtrado, se queda con la última fila (misma regla defensiva que spec 001).
2. **Sincronización** (`src/lib/casos/denuncias-sync.ts`): dado el listado de filas parseadas, busca qué OTs ya existen como Caso; actualiza `otUr`, `fechaRecepcion`, `estadoFiscalia` solo en los que matchean; cuenta cuántas filas no matchearon ningún Caso.
3. **Schema**: agrega `otUr String?`, `fechaRecepcion DateTime?`, `estadoFiscalia String?` al modelo `Caso`. Migración.
4. **UI**: un segundo botón **"Importar Denuncias Fiscalía"** en la barra superior, junto al botón de import de Casos existente — mismo patrón de diálogo con preview/confirmación y subida a Vercel Blob (spec 005), pero con su propio Server Action y su propio texto de preview (actualizados / sin match, sin las columnas de creados/desactivados que no aplican acá).
5. **Dashboard**: se agregan `OT UR`, `Fecha Recepción`, y `Estado Fiscalía` como columnas visibles en la tabla de Casos (sin nuevos filtros por ahora — fuera de alcance, se puede pedir después si hace falta).

**Fuera de alcance:**
- Filtros/búsqueda por los 3 campos nuevos en el dashboard.
- Cualquier lógica de reconciliación (crear, desactivar) a partir de este archivo.
- Deduplicar u ofrecer edición manual de las OT sin match — solo se informa la cantidad.

## Criterios de aceptación

- [x] Parsear un CSV con las 12 columnas de arriba, filtrando solo filas con `Documento = "Denuncia"`, produce filas `{ ot, otUr, fechaRecepcion, estadoFiscalia }` correctas; las filas con otro `Documento` no aparecen.
- [x] Si falta alguna de las 4 cabeceras usadas (`Case`, `Caso fiscalía: Número del caso`, `Documento`, `Estado`, `Fecha recepcion`), el parser falla con un error claro.
- [x] Si la misma OT se repite dentro de las filas ya filtradas por Denuncia, se usa la última.
- [x] Al sincronizar, un Caso cuya OT matchea se actualiza en `otUr`/`fechaRecepcion`/`estadoFiscalia`, sin tocar ningún otro campo (ej. `estadoAccionLegal` queda intacto).
- [x] Al sincronizar, una fila cuya OT no existe como Caso no crea nada y se cuenta como "sin match".
- [x] Este import nunca cambia el campo `activo` de ningún Caso.
- [x] La UI tiene un botón separado "Importar Denuncias Fiscalía" con su propio preview (actualizados / sin match) y confirmación, reutilizando la subida a Vercel Blob existente. Verificado visualmente (diálogo y columnas nuevas); la subida real a Blob requiere el deploy real por la limitación de CORS ya documentada en spec 005.
- [x] El dashboard muestra `OT UR`, `Fecha Recepción`, y `Estado Fiscalía` como columnas de la tabla.
- [x] TDD para el parser y la lógica de sincronización (son parseo + reconciliación por OT, igual que specs 001/007). `npm run build`, `npm run lint`, y los tests (68) pasan en verde.
