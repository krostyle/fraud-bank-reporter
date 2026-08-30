# 001 - Importar Casos desde CSV (parseo + sincronización por OT)

## Alcance

Esta feature cubre **solo** la lógica de:

1. Parsear un archivo CSV de casos (con su encoding corrupto) a filas de datos limpias.
2. Sincronizar esas filas contra la base de datos: crear casos nuevos, actualizar existentes, y marcar como inactivos los que ya no aparecen.

**Fuera de alcance de este spec** (van en specs separados más adelante):
- La pantalla/endpoint para subir el archivo (UI de importación).
- Separar el campo combinado Región/Comuna/Localidad en columnas independientes.
- Validación del dígito verificador del RUT chileno.
- Dashboards o reportes que consuman estos datos.

## Qué debe hacer la feature

Dado un archivo CSV exportado desde el sistema de origen, la feature debe:

1. Leer el archivo y **normalizar su encoding** (ver "Encoding" abajo) antes de parsear.
2. Parsear cada fila a un registro con las 18 columnas del CSV (ver "Columnas").
3. Por cada fila con una OT (Caso: Número del caso):
   - Si la OT no existe en la base → crear un Caso nuevo, `activo = true`.
   - Si la OT ya existe → actualizar sus campos con los valores de la fila, `activo = true`.
4. Cualquier Caso existente en la base cuya OT **no** aparezca en el archivo importado → marcarlo `activo = false`. Nunca se borra un registro.
5. Si la misma OT aparece más de una vez dentro del mismo archivo (ver "Duplicados dentro de un mismo archivo"), aplicar la regla de resolución antes de sincronizar, de forma que quede **un solo** Caso por OT al final.

## Columnas del CSV

| # | Columna origen | Contenido / notas |
|---|---|---|
| 1 | Caso: Número del caso | **OT**, clave única. Numérica en la muestra, pero se trata como texto (no se hacen operaciones aritméticas con ella). |
| 2 | Caso: RUT (Cliente) | RUT chileno sin guión, puede terminar en `K`, puede venir vacío. |
| 3 | Caso: Nombre del contacto | Texto libre. |
| 4 | Caso: Sub Status | Ej. `Acoge Sin Pago`, `Anulado`, `MP Terminada`, o vacío. |
| 5 | Caso: Fecha Envío Fiscalía | Fecha + hora, formato `dd-mm-aaaa, HH:mm`. |
| 6 | Fecha Presentación | Fecha, formato `dd-mm-aaaa`. Puede venir vacía. |
| 7 | Año Presentación | Año de 4 dígitos, texto. Puede venir vacío. |
| 8 | Rol | Identificador del rol judicial, formato libre (ej. `11236 26`, `258.365`). Se trata como texto. |
| 9 | Fecha Resolución del Tribunal | Fecha `dd-mm-aaaa`. Puede venir vacía. |
| 10 | Fecha Notificación Resolución Tribunal | Fecha `dd-mm-aaaa`. Puede venir vacía. |
| 11 | Resolución del Tribunal | Ej. `Rechaza`, `Acoge`, o vacío. |
| 12 | Número del Tribunal | Texto corto (ej. `1`, `5`), puede venir vacío. |
| 13 | Tribunal | Nombre del tribunal, texto libre. |
| 14 | Caso: Localidad / Comuna / Región | **Un solo campo** con hasta 3 valores separados por coma dentro de él (ej. `REGION METROPOLITANA,NUNOA,NUNOA`). Se guarda tal cual, sin separar (ver "Fuera de alcance"). |
| 15 | Caso: Propietario del caso | Nombre de la persona responsable del caso. |
| 16 | Caso: Monto Total Reclamado UF | Número decimal con **coma como separador decimal**, puede ser negativo (ej. `17,84717275`, `-3,70587915`). |
| 17 | Acción Legal: Última modificación por | Nombre de quién modificó por última vez. |
| 18 | Estado Acción Legal | Ej. `Pendiente`, `En proceso`, `Terminada`. |

Todas las columnas excepto la OT (columna 1) pueden venir vacías (representadas en el CSV como `""`).

## Encoding

Confirmado con una muestra real del archivo (`report1788053375428.csv`): el encabezado llega como `"Caso: NÃºmero del caso"` en vez de `"Caso: Número del caso"`. Es **mojibake por doble codificación**: el texto original en UTF-8 (donde `ú` son los bytes `C3 BA`) fue reinterpretado como Latin-1/Windows-1252 (`C3`→`Ã`, `BA`→`º`) y vuelto a guardar como UTF-8. Es el mismo patrón que `N�mero` mencionado en el contexto de negocio, solo que aquí el motor de exportación produce `Ã`+símbolo en vez del carácter de reemplazo `�`.

Reparación: tomar el string ya decodificado como UTF-8 (con el mojibake visible), volver a codificarlo como Latin-1 para recuperar los bytes originales, y decodificar esos bytes como UTF-8. El parser debe aplicar esta normalización **antes** de procesar las columnas, de forma que el resultado tenga tildes y `ñ` legibles.

*(Nota: la primera muestra que se pegó en el chat traía además un BOM corrupto al inicio (`þÿþÿ`) y cada fila envuelta en una capa extra de comillas — eso resultó ser un artefacto de cómo se pegó el contenido en el chat, no del archivo real. Esta muestra corregida usa comillas CSV estándar por campo, sin envoltura extra, así que el parser no necesita manejar ese caso.)*

## Duplicados dentro de un mismo archivo

**Resuelto.** La muestra original que mostraba OTs repetidas mezclaba dos tipos de caso (Medidas Precautorias y Demandas) — un archivo que no corresponde al que va a usar el sistema. La muestra real (`ReporteImportarVF.csv`, 22 filas) confirmó que **cada OT aparece una sola vez** en el archivo que efectivamente se importará.

Aun así, el parser debe manejar una OT repetida de forma defensiva (sin lanzar error) por si llegara a ocurrir: se queda con la **última fila** de esa OT en el archivo. No hace falta confirmación de negocio adicional sobre esto — es solo una salvaguarda, no un caso esperado.

## Criterios de aceptación

- [ ] Dado un CSV con el encoding corrupto de la muestra, al parsearlo el resultado tiene las 18 columnas con texto legible (sin BOM, sin mojibake).
- [ ] Dada una fila cuya OT no existe en la base, al sincronizar se crea un Caso con `activo = true` y todos sus campos mapeados según la tabla de columnas.
- [ ] Dada una fila cuya OT ya existe en la base, al sincronizar se actualizan sus campos y `activo` queda en `true`.
- [ ] Dado un Caso existente en la base cuya OT no aparece en el archivo importado, al sincronizar ese Caso pasa a `activo = false` y sigue existiendo en la base (no se borra).
- [ ] Dado un archivo donde una misma OT aparece más de una vez, al sincronizar queda un solo Caso para esa OT con los datos de la última fila de esa OT en el archivo.
- [ ] Dado un monto con coma decimal (positivo o negativo), se convierte a un valor numérico correcto (ej. `"17,84717275"` → `17.84717275`; `"-3,70587915"` → `-3.70587915`).
- [ ] Dada una fecha con formato `dd-mm-aaaa` o `dd-mm-aaaa, HH:mm`, se convierte a una fecha válida.
- [ ] Dado un campo vacío (`""`) en cualquier columna opcional, se guarda como vacío/nulo sin lanzar error.
- [ ] Dado un RUT vacío o terminado en `K`, se guarda tal cual (como texto), sin validarlo.

## Preguntas para la experta de negocio (antes de pasar al plan técnico)

- **P1 — Casos repetidos dentro de una misma exportación. [RESUELTO]** La muestra que mostraba OTs repetidas mezclaba Medidas Precautorias (MP) y Demandas, algo que no corresponde al archivo real del sistema. Con la muestra real (`ReporteImportarVF.csv`) se confirmó que las OT no se repiten. Ver "Duplicados dentro de un mismo archivo" arriba.

- **P2 — Región / Comuna / Localidad. [RESUELTO, no cambia el alcance actual]** El orden del campo combinado es **Región, Capital, Comuna**. Puede faltar alguno de los tres, pero Región y Comuna siempre están presentes. Como separar este campo en columnas independientes sigue **fuera de alcance** de este spec (se guarda tal cual, ver "Alcance"), esta regla queda documentada acá para cuando se haga ese spec futuro, y no afecta los criterios de aceptación actuales.

- **P3 — Columnas del reporte. [RESUELTO]** Las 18 columnas del export son todas necesarias por ahora; ninguna se descarta y no falta ningún dato adicional para los reportes.
