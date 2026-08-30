# 002 - Login (autenticación de usuario único)

## Alcance

Esta feature cubre **solo**:

1. Una pantalla de inicio de sesión con Clerk.
2. Proteger todas las rutas de la app: sin sesión, se redirige a la pantalla de login.
3. Un control mínimo para cerrar sesión, visible una vez logueado.

**Fuera de alcance de este spec** (van en specs separados más adelante):
- Registro público de nuevos usuarios (el proyecto es de un solo usuario por ahora; la cuenta se crea directo en el dashboard de Clerk, no desde la app).
- Roles o permisos — no aplica todavía con un solo usuario.
- El contenido real del dashboard (listado de Casos, reportes) — esta spec solo deja la pantalla principal protegida y vacía/mínima.
- La UI de importación de CSV.

## Qué debe hacer la feature

1. `src/proxy.ts` debe usar `clerkMiddleware` con `auth.protect()` para exigir sesión en todas las rutas de la app, excepto las rutas propias de Clerk para el login (`/sign-in` y sus subrutas).
2. Debe existir una ruta `/sign-in` (catch-all, `/sign-in/[[...rest]]`) que renderiza el componente `<SignIn />` de Clerk.
3. Al entrar a cualquier ruta protegida sin sesión activa, Clerk redirige automáticamente a `/sign-in`.
4. Una vez logueado, el usuario puede navegar la app normalmente.
5. Debe existir un control de cierre de sesión visible (el `<UserButton />` de Clerk) en un header mínimo compartido por las páginas autenticadas.
6. No se expone ningún flujo de registro (`/sign-up`) en la UI.

## Criterios de aceptación

- [ ] Sin sesión, entrar a `/` (o cualquier ruta protegida) redirige a `/sign-in`.
- [ ] `/sign-in` muestra el formulario de login de Clerk y permite autenticarse con el usuario creado en el dashboard de Clerk.
- [ ] Con sesión activa, `/` carga normalmente y muestra el `<UserButton />`.
- [ ] Al cerrar sesión desde el `<UserButton />`, la siguiente navegación a una ruta protegida vuelve a redirigir a `/sign-in`.
- [ ] No hay ningún link ni ruta pública de registro.
- [ ] `npm run build` y `npm run lint` pasan sin errores (no aplica TDD por ser feature de UI, según CLAUDE.md).
