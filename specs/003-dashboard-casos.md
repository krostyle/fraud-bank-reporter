# 003 - Dashboard de Casos (página principal)

## Alcance

Esta feature cubre:

1. Rebranding de la UI: la app deja de mostrar "Bank Fraud Reporter" y pasa a usar **"Sistema de Gestión de Fraudes"** como marca (header y título de pestaña).
2. La página principal (`/`, dentro del layout protegido) deja de ser un placeholder y pasa a ser el dashboard de Casos: KPIs de resumen, filtros/búsqueda, y una tabla paginada.

**Fuera de alcance** (specs futuros):
- La UI de importación de CSV.
- Separar Región/Comuna/Localidad en columnas propias — los filtros de ubicación siguen siendo búsqueda de texto libre sobre el campo combinado (`localidadComunaRegion`), tal como se guarda hoy (spec 001).
- Detalle de un Caso individual (vista de un solo caso) — este spec es solo el listado.
- Ordenar la tabla por columna (sorting) — se puede agregar después si hace falta.

## Qué debe hacer la feature

### Branding

- Título de pestaña (`metadata.title` en `src/app/layout.tsx`) y el nombre en el header (`src/app/(app)/layout.tsx`) pasan a ser **"Sistema de Gestión de Fraudes"**.
- No debe quedar ningún texto visible en la UI con "Bank Fraud Reporter" (el nombre del repo/paquete interno no cambia, solo lo que ve el usuario).

### Dashboard (página principal)

1. **KPIs de resumen** arriba de la tabla:
   - Total de Casos activos.
   - Total de Casos inactivos (cerrados).
   - Monto total reclamado (UF), sumado sobre los Casos activos.
   - Desglose de Casos activos por `Estado Acción Legal` (ej. Pendiente: N, En proceso: N, Terminada: N).
2. **Filtros y búsqueda**, combinables entre sí:
   - Búsqueda de texto libre que matchea por OT, RUT o Nombre del contacto.
   - Filtro por `Estado Acción Legal` (select).
   - Filtro por `Sub Status` (select).
   - Filtro por `Propietario del caso` (select).
   - Filtro por Región y por Comuna (selects dependientes — ver spec 004, reemplazó la búsqueda de texto libre original sobre el campo combinado).
   - Filtro por estado `activo`/`inactivo` (por defecto: solo activos).
3. **Tabla paginada** con los Casos que matchean los filtros, columnas: OT, Nombre del contacto, RUT, Sub Status, Propietario del caso, Estado Acción Legal, Monto Total Reclamado UF, Activo (badge visual).
   - Paginación simple (anterior/siguiente), 25 filas por página.
4. Los datos se consultan directamente desde Prisma en un Server Component (sin necesidad de una API route aparte para este spec).

## Criterios de aceptación

- [ ] El título de la pestaña y el header muestran "Sistema de Gestión de Fraudes", no "Bank Fraud Reporter".
- [ ] Los KPIs reflejan correctamente los datos reales de la tabla `Caso` (totales y desglose por estado).
- [ ] Buscar por OT, RUT o nombre filtra la tabla correctamente (coincidencia parcial, no sensible a mayúsculas/minúsculas).
- [ ] Filtrar por Estado Acción Legal, Sub Status, o Propietario muestra solo los Casos que coinciden exactamente con el valor elegido.
- [ ] Filtrar por Región y/o Comuna muestra solo los Casos vinculados a esa Región/Comuna (spec 004).
- [ ] Por defecto la tabla muestra solo Casos activos; el filtro permite ver también los inactivos.
- [ ] La tabla pagina correctamente cuando hay más de 25 resultados.
- [ ] `npm run build` y `npm run lint` pasan sin errores (no aplica TDD, es UI/dashboard).
