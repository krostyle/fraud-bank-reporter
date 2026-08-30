# 004 - Normalizar Región y Comuna

## Alcance

Esta feature separa el campo combinado `Caso: Localidad / Comuna / Región` (hoy guardado tal cual en `localidadComunaRegion`, spec 001) en dos catálogos propios, **Región** y **Comuna**, que se van poblando solos con los valores que aparecen en cada CSV importado — no existe un listado oficial de regiones/comunas de Chile cargado de antemano.

**Fuera de alcance:**
- La "Localidad" (el tercer valor del campo, ej. `NUEVA AURORA`, `CASAS VIEJAS DE PUENTE ALTO`) no se normaliza ni se guarda en un catálogo — sigue existiendo solo dentro del campo crudo `localidadComunaRegion`, que no se toca ni se borra.
- Catálogo para "Tribunal" u otros campos de texto libre — no forma parte de este spec (se evalúa aparte si hace falta).
- Validar los nombres contra una lista oficial de regiones/comunas de Chile — el catálogo confía en lo que venga en el CSV, tal cual.

## Orden del campo combinado (confirmado)

El campo trae hasta 3 valores separados por coma, en este orden: **Región, Comuna, Localidad**. Región y Comuna siempre están presentes; Localidad es opcional.

```
"REGION METROPOLITANA,RECOLETA,"              -> Región: REGION METROPOLITANA | Comuna: RECOLETA           | Localidad: (vacío)
"QUINTA REGION,VINA DEL MAR,NUEVA AURORA"     -> Región: QUINTA REGION        | Comuna: VINA DEL MAR        | Localidad: NUEVA AURORA
```

## Qué debe hacer la feature

1. **Catálogos nuevos**: tabla `Region` (nombre único) y tabla `Comuna` (nombre + referencia a su `Region`, única por región). Ninguna se siembra de antemano — se crean sobre la marcha.
2. **Al importar un CSV** (extiende `parseCasosCsv`/`syncCasos` del spec 001): por cada fila, se separa el campo combinado por comas (posición 1 = Región, posición 2 = Comuna). Si la Región y/o la Comuna de esa fila no existen todavía en el catálogo, se crean; si ya existen, se reutilizan (sin duplicar). El match es por texto exacto (recortando espacios), sin normalizar mayúsculas/acentos — si el mismo lugar viniera escrito distinto en otro import (ej. `Recoleta` vs `RECOLETA`), quedaría como una entrada separada. No se resuelve eso en este spec.
3. **El Caso queda vinculado** a su Región y Comuna (relación, no texto suelto), además de seguir guardando el campo crudo `localidadComunaRegion` como hasta ahora (no se borra ni se reemplaza, por compatibilidad con spec 001).
4. Si a una fila le falta la Región o la Comuna (caso raro, fuera de lo esperado según el spec 001), el Caso queda sin Región/Comuna vinculada — no se cae la importación.
5. **Dashboard** (reemplaza el filtro de texto libre "Región / Comuna" del spec 003): dos selects — uno de Región y otro de Comuna, poblados con lo que ya existe en los catálogos (no con texto libre). Elegir una Región filtra la lista de Comunas a las de esa región.
6. Los 22 Casos ya cargados en la base de desarrollo se re-vinculan automáticamente la próxima vez que se reimporte el mismo CSV (el import es upsert por OT, así que no hace falta una migración de datos aparte).

## Criterios de aceptación

- [ ] Al importar una fila con `"REGION METROPOLITANA,RECOLETA,"`, se crea (o reutiliza) la Región "REGION METROPOLITANA" y la Comuna "RECOLETA" asociada a ella, y el Caso queda vinculado a ambas.
- [ ] Importar dos filas con la misma Región/Comuna no crea entradas duplicadas en los catálogos.
- [ ] Importar una fila con una Región/Comuna nueva (no vista antes) la agrega al catálogo automáticamente.
- [ ] El campo `localidadComunaRegion` sigue guardándose igual que en el spec 001 (no se elimina).
- [ ] En el dashboard, el select de Región muestra las regiones existentes en el catálogo; elegir una filtra el select de Comuna a las comunas de esa región.
- [ ] Filtrar el listado de Casos por Región y/o Comuna devuelve solo los Casos vinculados a esa Región/Comuna.
- [ ] `npm run build` y `npm run lint` pasan sin errores. Como esto modifica lógica de importación (spec 001), el parseo del campo combinado se cubre con TDD (parte de "el parser de CSV", ya bajo esa regla en CLAUDE.md).
