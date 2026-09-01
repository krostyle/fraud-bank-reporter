# 011 - Pestaña Medida Precautoria (MP) + mejoras visuales del detalle de Caso

## Contexto

Sigue completándose la vista de detalle de Caso (spec 010). Este spec agrega el contenido de la pestaña **Medida Precautoria (MP)** y mejora la presentación visual general de la pantalla, que hoy se ve "tosca"/vacía (un grid plano de etiqueta+valor sin ninguna jerarquía).

Mapeos de campos confirmados para MP (todos ya existen en el modelo `Caso`, no se agrega nada al schema):

| Dato pedido | Campo |
|---|---|
| Rol | `rol` |
| Fecha de presentación | `fechaPresentacion` |
| Fecha de asignación abogado | `fechaCreacionAccionLegal` |
| Tribunal | `tribunal` |
| Número del Tribunal | `numeroTribunal` |
| Abogado Asignado | `abogadoAsignado` |
| Fecha notificación resolución tribunal | `fechaNotificacionResolucionTribunal` |
| Fecha resolución tribunal | `fechaResolucionTribunal` |
| Resolución tribunal | `resolucionTribunal` |

## Alcance

1. **Pestaña Medida Precautoria (MP)**: muestra los 9 datos de la tabla de arriba (con `—` para los `null`). "Demanda" sigue como placeholder "Próximamente" (no se toca en este spec).
2. **Mejora visual de la pantalla de detalle** (aplica a "Datos del Caso" y "Medida Precautoria (MP)"):
   - El contenido de cada pestaña se muestra dentro de una `Card` (con borde/sombra suave), no como un grid suelto sobre el fondo de la página — le da más estructura y "peso" visual.
   - Los datos de cada pestaña se agrupan en secciones con un subtítulo, en vez de un único grid plano:
     - **Datos del Caso**: sección "Cliente" (Cliente, RUT, Localidad) y sección "Denuncia" (OT, Monto reclamado, Fecha reclamo, Estado de la denuncia).
     - **Medida Precautoria (MP)**: sección "Tribunal" (Tribunal, Número del Tribunal, Rol) y sección "Resolución" (Resolución tribunal, Fecha resolución tribunal, Fecha notificación resolución tribunal, Abogado Asignado, Fecha de asignación abogado).
   - El encabezado de la pantalla agrega un badge de Estado (Activo/Inactivo) al lado del nombre, para que no se sienta tan vacío arriba.

**Fuera de alcance:**
- Contenido de la pestaña "Demanda" (spec futuro).
- Cualquier dato nuevo que no esté ya en el modelo `Caso`.
- Rediseño del dashboard principal o de Estadísticas — solo la pantalla de detalle de Caso.

## Criterios de aceptación

- [x] La pestaña Medida Precautoria (MP) muestra los 9 datos mapeados arriba, agrupados en las 2 secciones descritas ("Fecha de presentación" se ubicó en la sección Resolución). Verificado visualmente.
- [x] La pestaña Datos del Caso mantiene sus 7 datos (spec 010), reorganizados en las 2 secciones descritas. Verificado visualmente.
- [x] Ambas pestañas muestran su contenido dentro de una `Card`, no como grid suelto.
- [x] El encabezado muestra el badge de Estado (Activo/Inactivo) junto al nombre del Caso.
- [x] `npm run build`, `npm run lint` y los tests (68) pasan sin errores; verificación visual en navegador.
