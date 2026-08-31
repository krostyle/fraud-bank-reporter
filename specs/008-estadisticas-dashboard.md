# 008 - Estadísticas (dashboard informativo con gráficos)

## Contexto

Definido junto a la experta de negocio (ver respuestas a las preguntas del spec anterior). Cubre 4 gráficos + 2 métricas adicionales que pidió, todos en una página nueva.

## Alcance

Nueva página **"Estadísticas"** (`/estadisticas`), dentro del layout protegido, con un link en el header junto al dashboard principal. Incluye:

1. **Evolución temporal**: casos nuevos por mes (agrupados/comparables por año). La fecha usada por caso depende del tipo:
   - Si `tipoCaso` es "MP" (Medida Precautoria) → `Caso: Fecha Envío Fiscalía`.
   - En cualquier otro caso (ej. "Demanda") → `Fecha Presentación`.
   - Un Caso sin la fecha correspondiente no entra en este gráfico (no se puede ubicar en el tiempo).
2. **Distribución geográfica**: cantidad de Casos y monto total suspendido (CLP), agrupado por Región. Si el filtro de Región tiene una región seleccionada, el gráfico pasa a mostrar el desglose por Comuna **dentro de esa región** en vez de por región (mismo comportamiento dependiente que ya tiene el filtro Región→Comuna del dashboard).
3. **Resultado de los tribunales**: gráfico de torta/dona con la proporción de `Resolución del Tribunal`, agrupada en **Acoge / Rechaza / Otros**, calculada solo sobre Casos que ya tienen una resolución (no `null`). Se muestra aparte, como dato de contexto (no como parte de la torta), la cantidad de Casos todavía sin resolución.
4. **Carga por responsable**: gráfico de barras con cantidad de Casos por `Abogado Asignado`, ordenado de mayor a menor. Cada barra es un link que lleva al dashboard principal (`/`) ya filtrado por ese abogado (reutiliza el filtro de Abogado del spec 007 — cubre el pedido de "y qué casos" sin duplicar la tabla acá).
5. **Estado de la Acción Legal**: gráfico de torta/barras con la distribución de `Estado Acción Legal` (mismo dato que hoy se ve como badges en el dashboard principal, acá como gráfico propio).
6. **Tiempo promedio de asignación → presentación (solo MP)**: tarjeta con el promedio de días entre `Acción Legal: Fecha de creación` y `Fecha Presentación`, calculado solo sobre Casos con `tipoCaso` = "MP" que tengan ambas fechas.

### Filtros

- La página tiene la **misma barra de filtros** que el dashboard principal (Buscar, Región, Comuna, Estado, Sub Status, Propietario, Abogado, Mostrar activo/inactivo/todos) — se reutiliza el componente `CasosFilters` ya existente. Todos los gráficos responden a estos filtros.
- Se agrega un filtro nuevo, propio de esta página: **Período** — "Año en curso" (default), "Último año", "Todo el histórico". Determina qué Casos entran en los gráficos, usando la misma "fecha de referencia" por caso definida en el punto 1 (Fecha Envío Fiscalía para MP, Fecha Presentación para el resto). Un Caso sin esa fecha queda fuera de cualquier período que no sea "Todo el histórico" (en ese caso si entra, ya que no hay corte de fecha).

### Fuera de alcance

- Exportar los gráficos (imagen/PDF/Excel).
- Selector de rango de fechas personalizado (solo los 3 períodos predefinidos).
- Mapa geográfico real (el punto 2 es un gráfico de barras, no un mapa).
- Cualquier drill-down interactivo más allá del link de "Carga por responsable" → tabla filtrada.
- Guardar/recordar la configuración de filtros entre visitas.

## Criterios de aceptación

- [x] La página `/estadisticas` existe, está protegida (mismo patrón `auth.protect()` que el resto de `(app)`), y tiene un link visible desde el dashboard principal (y viceversa).
- [x] Los 4 gráficos y las 2 métricas adicionales muestran datos reales calculados con Prisma, respetando los filtros compartidos con el dashboard y el filtro de Período propio de esta página. Verificado visualmente contra los 11.878 Casos reales ya importados.
- [x] Evolución temporal usa Fecha Envío Fiscalía para Casos MP y Fecha Presentación para el resto; un Caso sin la fecha correspondiente no aparece en el gráfico. **Hallazgo pendiente**: los datos reales usan `tipoCaso` = "TNR" / "T CREDITO", no "MP"/"Demanda" como se asumió al definir este spec — por ahora ningún Caso matchea "MP" literal, así que todos caen en la rama de Fecha Presentación. El usuario pidió dejarlo así y revisar el mapeo real más adelante (no bloquea este spec).
- [x] Distribución geográfica muestra por Región cuando no hay región filtrada, y por Comuna de esa región cuando sí la hay.
- [x] Resultado de tribunales agrupa en Acoge/Rechaza/Otros sobre Casos con resolución, y muestra aparte la cantidad de Casos sin resolución.
- [x] Cada barra de "Carga por responsable" navega a `/` con el filtro Abogado ya aplicado.
- [x] El promedio de días asignación→presentación solo considera Casos MP con ambas fechas presentes (hoy siempre "Sin datos suficientes" por el mismo hallazgo de `tipoCaso` de arriba — la lógica está implementada y testeada, falta el mapeo real de "MP").
- [x] El filtro Período cambia los datos de los gráficos como corresponde ("Año en curso" por defecto al entrar a la página).
- [x] `npm run build`, `npm run lint`, y los tests (59) pasan sin errores.
