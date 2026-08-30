# 005 - UI de importación de CSV

## Alcance

Pantalla para subir el archivo CSV de Casos y disparar la lógica de importación ya construida en el spec 001 (`importCasosCsv`: parseo + upsert por OT + baja lógica), mostrando el resultado al usuario.

**Fuera de alcance:**
- Historial de importaciones pasadas (qué se importó y cuándo) — no se guarda un registro, solo se muestra el resultado de la importación actual.
- Deshacer una importación ya confirmada (evaluado y descartado para este spec — el import hace upsert por OT, así que deshacerlo bien requeriría guardar el valor anterior de cada campo pisado, no solo qué se creó; queda como spec futuro si en la práctica hace falta).

## Qué debe hacer la feature

1. Nueva ruta protegida (dentro del layout autenticado), por ejemplo `/importar`, con un link para llegar a ella desde el header del dashboard.
2. La pantalla tiene un selector de archivo (solo `.csv`).
3. **Paso de vista previa (antes de escribir nada en la base)**: al elegir el archivo, se parsea y se calcula qué pasaría si se confirma — cuántos Casos se crearían, cuántos se actualizarían, cuántos se desactivarían — sin tocar la base todavía. Esto le da al usuario la oportunidad de darse cuenta de que subió el archivo equivocado antes de comprometerlo.
4. El usuario revisa ese resumen y confirma explícitamente (botón "Confirmar importación") o cancela (elige otro archivo).
5. Al confirmar, recién ahí se ejecuta la importación real (misma lógica del spec 001: normalización de encoding, parseo, upsert por OT, baja lógica de OT ausentes) — sin cambios a esa lógica.
6. Mientras se calcula la vista previa o se confirma la importación, se muestra un estado de carga (el archivo puede tener cientos de filas).
7. Al confirmar, se muestra el resultado final: cantidad de Casos creados, actualizados, y desactivados (debería coincidir con lo que decía la vista previa).
8. Si el archivo no se puede procesar (ej. no es un CSV válido), se muestra un mensaje de error claro en el paso de vista previa, sin romper la pantalla ni dejarla en un estado inconsistente.
9. Después de una importación confirmada, hay forma de volver al dashboard (que ya reflejará los datos nuevos).

## Criterios de aceptación

- [ ] Se puede llegar a la pantalla de importación desde un link visible en el dashboard.
- [ ] Elegir un CSV válido muestra una vista previa (creados/actualizados/desactivados) **sin** modificar la base de datos todavía.
- [ ] Confirmar la vista previa recién ahí crea/actualiza/desactiva los Casos correspondientes, con números que coinciden con lo mostrado en la vista previa.
- [ ] Es posible cancelar después de ver la vista previa (elegir otro archivo) sin que se haya escrito nada en la base.
- [ ] Después de confirmar, el dashboard (`/`) refleja los cambios (nuevos Casos, montos, KPIs actualizados).
- [ ] Subir un archivo que no es un CSV parseable muestra un error legible en la vista previa, sin crashear la pantalla.
- [ ] Mientras se calcula la vista previa o se confirma, la UI muestra que está trabajando (no queda "colgada" sin feedback).
- [ ] `npm run build` y `npm run lint` pasan sin errores. Como se necesita una función nueva de "vista previa" (calcular creados/actualizados/desactivados sin escribir), esa lógica se cubre con TDD igual que `syncCasos` en el spec 001.
