# 010 - Vista de detalle de Caso (pestaña Demanda)

## Contexto

Hasta ahora solo existe el listado de Casos (dashboard). Se necesita una **vista de detalle por Caso**, organizada en pestañas por "etapa": **Datos del Caso**, **Medida Precautoria (MP)**, y **Demanda**. Estas pestañas son secciones de la misma pantalla de detalle, no dependen de ningún campo existente (`Caso: Tipo` es un dato de clasificación aparte, no decide qué pestaña se muestra) — se van a ir completando en specs futuros. Este spec construye **solo el contenido de la pestaña Demanda**; las otras dos quedan como placeholder "Próximamente".

Mapeos de campos confirmados para esta pestaña (todos ya existen en el modelo `Caso`, no se agrega nada al schema):

| Dato pedido | Campo | Notas |
|---|---|---|
| OT | `ot` | |
| Cliente | `nombreContacto` | |
| RUT | `rut` | |
| Localidad | `localidadComunaRegion` | Se muestra el texto combinado tal cual (ej. `"REGION METROPOLITANA,RECOLETA,ÑUÑOA"`) — no se separa el tercer valor, sigue fuera de alcance como en specs 001/004/006. |
| Monto reclamado | `montoTotalSuspendidoClp` | Mismo campo mostrado en el dashboard como "Monto suspendido (CLP)" (spec 007) — acá se etiqueta "Monto reclamado". |
| Fecha reclamo | `fechaRecepcion` | La fecha de recepción del CSV de Denuncias Fiscalía (spec 009), no una fecha nueva. |
| Estado de la denuncia | `estadoFiscalia` | Mismo campo que "Estado Denuncia" en el dashboard (spec 009). |

## Alcance

1. Nueva ruta de detalle **`/casos/[ot]`** (protegida, mismo patrón `auth.protect()`). Si la OT no corresponde a ningún Caso, la página responde 404 (`notFound()`).
2. La OT en la tabla del dashboard principal (`/`) pasa a ser un link a `/casos/[ot]`.
3. La pantalla de detalle tiene:
   - Encabezado simple con la OT y el nombre del contacto, y un link para volver al listado.
   - **3 pestañas**: "Datos del Caso", "Medida Precautoria (MP)", "Demanda". Las primeras dos muestran un placeholder ("Próximamente"). La pestaña activa por defecto es **Demanda** (es la única con contenido en este spec).
   - Pestaña **Demanda**: muestra OT, Cliente, RUT, Localidad, Monto reclamado (formateado como CLP), Fecha reclamo (formateada), y Estado de la denuncia — con guion (`—`) para cualquiera que venga `null`.

**Fuera de alcance:**
- Contenido real de las pestañas "Datos del Caso" y "Medida Precautoria (MP)" (specs futuros).
- Editar datos desde esta pantalla — es solo lectura.
- Separar la Localidad en Región/Comuna/Localidad propia — sigue fuera de alcance general.
- Cualquier otro dato del Caso que no esté en la tabla de mapeos de arriba (aunque exista en el modelo).

## Criterios de aceptación

- [x] Entrar a `/casos/<OT válida>` muestra la pantalla de detalle con la pestaña Demanda activa por defecto y los 7 datos mapeados arriba, correctos. Verificado visualmente contra un Caso real.
- [x] Entrar a `/casos/<OT inexistente>` devuelve 404. Verificado visualmente.
- [x] Las pestañas "Datos del Caso" y "Medida Precautoria (MP)" existen y muestran un placeholder, sin romper nada al hacer clic en ellas. Verificado visualmente.
- [x] La OT de cada fila en la tabla del dashboard (`/`) es un link que lleva a `/casos/<esa OT>`.
- [x] `npm run build` y `npm run lint` pasan sin errores (no aplica TDD, es UI/dashboard de solo lectura).
