# 007 - Corrección del formato de CSV (nuevo orden de columnas + Abogado, Tipo, Monto en CLP)

## Contexto

El sistema de origen actualizó su plantilla de exportación. El spec 001 fijó el parseo **por posición** (columna N siempre es tal campo) en base al archivo real usado en ese momento. Esa plantilla queda obsoleta: de ahora en adelante el archivo va a venir con este orden de columnas (confirmado por el usuario):

```
"Caso: Número del caso","Caso: RUT (Cliente)","Caso: Nombre del contacto","Estado Acción Legal",
"Caso: Sub Status","Caso: Fecha Envío Fiscalía","Fecha Presentación","Año Presentación","Rol",
"Fecha Resolución del Tribunal","Fecha Notificación Resolución Tribunal","Resolución del Tribunal",
"Número del Tribunal","Tribunal","Caso: Localidad / Comuna / Región","Caso: Propietario del caso",
"Caso: Monto Total Suspendido","Acción Legal: Última modificación por","Abogado Asignado",
"Acción Legal: Fecha de creación","Caso: Tipo"
```

Diferencias respecto al formato viejo (spec 001):
- **"Estado Acción Legal" cambió de posición**: antes era la última columna (18), ahora es la 4ª (justo después de "Nombre del contacto", antes de "Sub Status").
- **"Caso: Monto Total Reclamado UF" se renombra a "Caso: Monto Total Suspendido"**, y deja de ser UF: el usuario confirmó que ahora viene **en pesos chilenos (CLP)**, y así debe mostrarse en la UI.
- **3 columnas nuevas** que no existían: **"Abogado Asignado"**, **"Acción Legal: Fecha de creación"**, **"Caso: Tipo"**.

El usuario confirmó explícitamente:
1. Este formato de 21 columnas **reemplaza** al anterior — no hace falta seguir soportando el de 18 columnas en paralelo.
2. "Monto Total Suspendido" viene en **CLP**, no UF, y debe mostrarse como peso chileno en la UI.

**Importante — esto NO es una corrección de datos históricos.** El archivo real usado para importar los 11.879 Casos de producción (specs 001/005/006) sí tenía el orden viejo (fue verificado columna por columna contra una muestra real en su momento) — el parser no leyó mal esas filas. Lo que cambió es la plantilla que el sistema de origen va a exportar **de ahora en adelante**. La única consecuencia práctica sobre datos ya importados: el valor numérico que hoy está guardado en el monto (en UF, del último import viejo) va a quedar bajo un campo que ahora se interpreta y se muestra como CLP, hasta que ese Caso se vuelva a importar con el archivo nuevo. Para cualquier Caso que siga activo y siga apareciendo en los próximos imports, esto se corrige solo (upsert por OT sobrescribe el monto). Solo quedaría "desactualizado" un Caso que ya esté inactivo y no vuelva a aparecer nunca más en un import — se documenta acá, no se resuelve en este spec (no hay forma de saber el CLP real de un caso cerrado sin el archivo nuevo).

## Alcance

1. Cambiar el parser de CSV (`src/lib/casos/csv.ts`) para que **matchee columnas por el nombre de su cabecera** (ya normalizada por `fixMojibake`/`decodeCsvBuffer`), no por posición fija. Esto es lo que realmente se rompió acá — el orden cambió una vez y nada garantiza que no cambie de nuevo — y evita que este mismo problema se repita en el futuro. Si falta una cabecera esperada, el import falla con un error claro (mejor que adivinar/desalinear columnas silenciosamente).
2. Agregar 3 campos nuevos al modelo `Caso` y al import:
   - `abogadoAsignado` (texto libre, mismo tratamiento que `propietarioCaso`).
   - `fechaCreacionAccionLegal` (fecha, mismo formato/parser que las demás fechas — `dd-mm-aaaa` o `dd-mm-aaaa, HH:mm`; se ajusta si el primer archivo real viene distinto).
   - `tipoCaso` (texto libre — probablemente distingue "Medida Precautoria" vs "Demanda", la distinción que ya había aparecido en spec 001 al investigar OTs duplicadas, pero se guarda como texto libre sin asumir valores fijos).
3. Renombrar `montoTotalReclamadoUf` → `montoTotalSuspendidoClp`, y cambiar su parseo/formato de UF (coma decimal) a CLP. Como todavía no hay un archivo real nuevo para confirmar el formato exacto del número (con o sin separador de miles, con o sin decimales), el parser acepta enteros y decimales con separador de miles `.` y decimal `,` (formato chileno estándar, ej. `"1.234.567"` → `1234567`, `"1.234.567,5"` → `1234567.5`), y se ajusta si el primer archivo real lo requiere.
4. Actualizar el dashboard:
   - KPI "Monto total reclamado (UF)" → "Monto total suspendido (CLP)", formateado como peso chileno (`Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" })`).
   - Nuevo filtro **Abogado Asignado** (select, mismo patrón que Propietario/Sub Status).
   - Nueva columna **Abogado Asignado** en la tabla.
5. Actualizar specs/tests existentes que asumían el orden viejo de columnas (fixtures de `csv.test.ts`, `import.test.ts`, `sync.test.ts`) al nuevo orden de 21 columnas — se actualizan explícitamente porque el formato de origen cambió, no para forzar que un test pase.

**Fuera de alcance:**
- Backfill/corrección retroactiva del monto de Casos inactivos con el valor CLP real (no hay forma de obtenerlo sin un archivo nuevo que los incluya).
- Cualquier validación o lista fija de valores posibles para `tipoCaso` (se guarda como texto libre, igual que Sub Status/Estado).
- Migrar automáticamente los ~11.879 Casos existentes para poblar los 3 campos nuevos — quedan en `null` hasta que cada Caso se vuelva a importar con el archivo nuevo (comportamiento normal de upsert, no requiere trabajo extra).

## Criterios de aceptación

- [x] Un CSV con las 21 columnas en el orden de arriba se parsea correctamente sin importar la posición, matcheando por nombre de cabecera.
- [x] Si al archivo le falta alguna cabecera esperada, el import falla con un mensaje de error claro (no se importa a ciegas con columnas desalineadas).
- [x] `estadoAccionLegal` y `subStatus` se leen del valor correcto en el nuevo orden (columna 4 y 5 respectivamente), verificado con un CSV de prueba donde ambos valores son claramente distinguibles.
- [x] `abogadoAsignado`, `fechaCreacionAccionLegal`, y `tipoCaso` se parsean y se guardan correctamente; vacíos se guardan como `null`.
- [x] `montoTotalSuspendidoClp` reemplaza a `montoTotalReclamadoUf` en el schema, el import, y el dashboard (KPI y tabla), mostrado como CLP.
- [x] El dashboard tiene un filtro por Abogado Asignado y una columna Abogado Asignado en la tabla.
- [x] Los tests existentes de `csv.ts`/`sync.ts`/import se actualizan al nuevo formato de 21 columnas (TDD: se explica el cambio, no se fuerza que pasen).
- [x] `npx prisma migrate dev` corre limpio sobre la base real (Neon) sin pérdida de datos en las columnas que no cambian de tipo (la base ya estaba vacía de Casos por decisión del usuario, ver commit de borrado de datos de prueba).
- [x] `npm run build`, `npm run lint`, y los tests (49) pasan en verde.
