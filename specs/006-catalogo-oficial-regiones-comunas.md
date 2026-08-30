# 006 - Catálogo oficial de Región/Comuna (reemplaza el crecimiento orgánico)

## Alcance

Reemplaza el catálogo "orgánico" de Región/Comuna del spec 004 (que crea una entrada nueva por cada texto distinto que aparece en el CSV) por uno basado en la **lista oficial de las 16 regiones y ~346 comunas de Chile**, precargada una sola vez. El import deja de crear regiones/comunas nuevas a partir de lo que trae el archivo — en vez de eso, intenta *matchear* el texto del CSV contra esa lista oficial fija.

**Por qué no usar IA para esto**: el universo de respuestas correctas es fijo y conocido (16 regiones, ~346 comunas) — no es un problema de texto libre abierto. Comparar contra una lista oficial con normalización de mayúsculas/acentos y coincidencia aproximada (fuzzy matching) es determinístico, rápido, gratis, y no depende de que un modelo "adivine" bien en miles de filas por importación. La IA queda como opción para lo que sobre sin resolver (ver criterios de aceptación), no como mecanismo principal.

**Fuera de alcance:**
- Una pantalla para que la experta revise manualmente los casos que quedan sin Región/Comuna resuelta — por ahora quedan igual que hoy: sin vincular (`regionId`/`comunaId` en `null`), sin romper el import.
- Resolver casos con IA en este spec — se deja como posible spec futuro si después de la lista oficial + matching aproximado sigue quedando un volumen relevante de casos sin resolver.
- Cambios a la lógica de Localidad (el tercer valor del campo combinado) — sigue fuera de alcance como en el spec 004.
- Adaptar el catálogo automáticamente si Chile cambia su división administrativa en el futuro (pasó la última vez en 2018 con la Región de Ñuble) — se trata como mantenimiento manual si llega a ocurrir.

## Qué debe hacer la feature

1. **Semilla de datos oficiales**: cargar las 16 regiones y ~346 comunas de Chile (cada comuna asociada a su única región oficial), tomadas de una fuente pública autoritativa (ej. SUBDERE/INE), no de memoria — hay que verificarlas contra una fuente real antes de cargarlas, dado que son datos que se van a usar para reportes reales. Cada región además guarda sus alias oficiales conocidos (ej. "REGION METROPOLITANA" ↔ "RM" ↔ "XIII REGION"; "REGION DE VALPARAISO" ↔ "V REGION"), porque el número romano y la abreviación son formas oficiales alternativas, no errores de tipeo — no los va a agarrar ningún matching por similitud de texto.
2. **Migración de los datos ya importados**: los Casos que ya están vinculados a una Región/Comuna "orgánica" (creada por el spec 004 a partir de texto libre) se vuelven a resolver contra el catálogo oficial nuevo. Las entradas orgánicas que queden sin ningún Caso vinculado después de la migración se eliminan (el catálogo oficial pasa a ser el único).
3. **Resolución de cada fila al importar** (reemplaza `resolveUbicacion`/`resolveUbicacionesBatch` del spec 004): dado el texto crudo de región y comuna de una fila,
   - Normaliza (mayúsculas, sin tildes, espacios recortados) y busca coincidencia **exacta** contra el nombre oficial o sus alias.
   - Si no hay coincidencia exacta, intenta una coincidencia **aproximada** (tolerando errores de tipeo chicos) contra los nombres oficiales.
   - La comuna se busca **dentro de la región ya resuelta** (si la región no se pudo resolver, la comuna tampoco se resuelve — para no adivinar entre comunas de regiones distintas con nombres parecidos).
   - **Fallback región-es-en-realidad-comuna**: si el texto de región no matchea ninguna región (ni por alias ni por similitud), se prueba si en realidad es el nombre de una comuna real de cualquier región, y si es así se usa la región a la que pertenece esa comuna. Cubre una anomalía real encontrada en producción: la fuente a veces pone el nombre de una comuna (ej. "Talcahuano") también en el campo de región.
   - Si no hay ninguna coincidencia razonable, el Caso queda sin Región/Comuna (`null`), igual que hoy — no se crea una entrada nueva en el catálogo.
4. **Dashboard**: los selects de Región y Comuna muestran solo las que efectivamente tienen algún Caso asociado (no las 346 comunas completas si la mayoría no tiene datos todavía) — mismo comportamiento de hoy, pero ahora sobre el catálogo oficial.

## Criterios de aceptación

- [x] Las 16 regiones oficiales de Chile están cargadas, cada una con sus alias conocidos (número romano, ordinal en palabras, abreviaciones comunes). Fuente de datos: [climoralesg/api-regiones-provincias-comunas-Chile](https://github.com/climoralesg/api-regiones-provincias-comunas-Chile), verificada contra el conteo oficial (16 regiones, 346 comunas) antes de cargarla — ver `src/lib/casos/regiones-comunas-oficial.ts`.
- [x] Las 346 comunas oficiales están cargadas, cada una asociada a su región oficial correcta. Sembrado vía `prisma/seed.ts` (`npx prisma db seed`, idempotente).
- [x] Importar una fila con `"RM,RECOLETA,"` la vincula a la Región Metropolitana oficial (por el alias "RM"), no crea una región nueva.
- [x] Importar una fila con una variante de mayúsculas/tildes de una comuna ya oficial (ej. "ñuñoa" en vez de "ÑUÑOA") la vincula a la comuna oficial correcta.
- [x] Importar una fila con un error de tipeo chico en una comuna real la vincula igual a la comuna correcta vía coincidencia aproximada (distancia de Levenshtein, umbral de similitud 0.82).
- [x] Importar una fila con un texto que no se parece a ninguna región/comuna real no crea una entrada nueva en el catálogo — el Caso queda sin Región/Comuna vinculada.
- [x] **Migración real ejecutada** contra los 11.879 Casos de producción: se encontraron y borraron 19 variantes orgánicas de región (incluyendo formas con las que no había contado exactamente, como "DECIMA SEXTA REGION" con espacio en vez de "DECIMOSEXTA REGION" — las agarró igual el matching aproximado) y 338 comunas orgánicas. El catálogo final quedó exactamente en 16 regiones / 346 comunas, sin duplicados. De los 11.879 Casos, 11.842 quedaron re-vinculados en la primera pasada; los 37 restantes tenían el mismo valor exacto (`"Talcahuano,Talcahuano,"` — el nombre de la comuna puesto también en el campo de región) y quedaron resueltos al agregar el fallback región-es-comuna descrito arriba. **Los 11.879 Casos (100%) terminaron vinculados** a su Región/Comuna oficial correcta.
- [x] Los selects de Región/Comuna del dashboard muestran solo las que tienen Casos asociados (326 de las 346 comunas oficiales tienen datos reales), no las 346 completas.
- [x] `npm run build`, `npm run lint` y los 46 tests pasan. La normalización, la distancia de edición, y el matching (exacto, por alias, aproximado, y el fallback región-es-comuna) están cubiertos con TDD en `ubicacion.test.ts`.
