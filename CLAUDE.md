# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build (Turbopack)
npm run start      # Serve the production build
npm run lint       # ESLint (flat config, next lint was removed in Next 16)
npm test           # Run the Vitest suite once
npm run test:watch # Vitest in watch mode
npx vitest run path/to/file.test.ts   # Run a single test file
npx vitest run -t "test name"         # Run a single test by name

npx prisma generate       # Regenerate the Prisma Client after any schema.prisma change
npx prisma migrate dev    # Create/apply a migration in development
npx prisma studio         # Browse the database
```

Test runner is Vitest (`vitest.config.mts`), environment `node` — this project has no browser/DOM tests yet, only server-side logic (CSV parser, upsert), so no `jsdom`/testing-library is installed. Add those only when a component actually needs to be tested. Tests live next to the code as `*.test.ts`.

## Architecture

- **Next.js 16, App Router, TypeScript**, source under `src/app`. Path alias `@/*` → `./src/*`.
- **Styling**: Tailwind CSS v4 + shadcn/ui (`components.json`, style `base-nova`). UI primitives live in `src/components/ui`; add new ones with `npx shadcn@latest add <component>`.
- **Auth**: Clerk (`@clerk/nextjs`, single user for now). `src/app/layout.tsx` wraps the app in `<ClerkProvider>`. `src/proxy.ts` just runs `clerkMiddleware()` with no path matching — the installed Clerk version (7.8.3) **deprecates** `createRouteMatcher`/path-based `.protect()` in middleware (it can drift from Next's actual routing and leave resources unprotected). Protect routes by calling `await auth.protect()` inside the layout/page/route handler itself (resource-based auth) — see `src/app/(app)/layout.tsx` for the pattern. `/sign-in` lives outside that route group so it stays public.
- **Proxy / Middleware**: Next.js 16 renamed the `middleware.ts` convention to `proxy.ts` (exported function `proxy`, not `middleware`).
- **Database**: Prisma ORM 7 targeting Postgres (Neon in production). Config lives in `prisma7.config.ts` (not `schema.prisma`) and reads `DATABASE_URL` via `dotenv/config`. The client is generated to `src/generated/prisma` (gitignored, regenerate with `npx prisma generate`) and instantiated through the `@prisma/adapter-pg` driver adapter — see `src/lib/prisma.ts` for the singleton (`import { prisma } from "@/lib/prisma"`), which also avoids exhausting connections from Next.js dev hot-reload.
- **Prisma Client on deploy**: `package.json` has `"postinstall": "prisma generate"`. Since the generated client is gitignored, a fresh checkout (Vercel included) has no client until something runs `prisma generate` — without the postinstall hook, `npm install` alone leaves `@/generated/prisma/client` missing and `next build`'s type-check fails (`Cannot find module`, plus cascading `implicitly has an 'any' type` errors on anything using `prisma.<model>` results). Don't remove this script; if `schema.prisma` changes, regenerating still also requires it locally (`npx prisma generate`) since postinstall only fires on `npm install`, not on every schema edit.
- **Prisma agent skills**: `prisma init` installed reference skills under `.agents/skills` (symlinked from `.claude/skills`, `.windsurf/skills`) covering the Prisma 7 CLI, client API, and Postgres/driver-adapter setup — consult those before making Prisma-related changes, since Prisma 7's config/generator conventions differ from earlier versions.
- **Environment variables**: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `BLOB_READ_WRITE_TOKEN`. Documented (without real values) in `.env.example`; real values go in the gitignored `.env`.
- **File uploads**: Vercel Serverless Functions cap request/response bodies at 4.5MB at the infrastructure level — not configurable via `next.config.ts`, and the CSV import feature needs to handle files bigger than that. The CSV import (`src/components/import-dialog.tsx`) uploads directly from the browser to **Vercel Blob** via `@vercel/blob/client`'s `upload()`, using `src/app/api/upload/route.ts` (implements `handleUpload`, gated by `auth.protect()`) to issue the client token — the file itself never passes through a Server Action or Route Handler body. Server Actions then take the blob's URL (a tiny string) and `fetch()` it server-side to read the content; any new large-file upload should follow the same pattern rather than sending file content through a Server Action.
  - The Blob store is **Private** (the CSVs carry RUT/names/addresses) — `access` passed to `upload()` must match the store's configured mode or the upload PUT 400s (the browser reports this as a misleading CORS error, since Vercel's blob endpoint only sends `Access-Control-Allow-Origin` on success). Private blobs aren't fetchable by bare URL from the server either — `readBlob()` in `import-actions.ts` sends `Authorization: Bearer ${BLOB_READ_WRITE_TOKEN}` per Vercel's "accessing without the SDK" pattern.
  - Vercel Blob's client-upload CORS only allows the actual deployment's origin, so this can't be end-to-end tested from plain `next dev` on localhost — verify on a Vercel preview/production deploy instead.
- **Deployment target**: Vercel.
- **UI copy language**: neutral Chilean Spanish, tuteo (`tú` conjugation: "sube", "verifica", "intenta") — never Argentine voseo ("subí", "verificá", "probá").

## Business context

This is a reporting/dashboard app for importing CSV files of legal cases (bank fraud).

- Each CSV row is a **Caso** (Case). The unique/primary key is the case number, called **OT**.
- CSV imports are recurring, not one-time. Every import must **upsert by OT**: create if the OT doesn't exist, update its fields if it does.
- If an OT that previously appeared in the CSV is missing from a new import, **do not delete the record** — mark it inactive/closed via a boolean `activo` field.
- Source CSVs often have broken encoding (mangled tildes/ñ, e.g. `"N�mero"` instead of `"Número"`). Any CSV parser must normalize encoding on import.

## Metodología de trabajo

Estas reglas aplican a todas las sesiones futuras en este repo:

- **Specs antes de features (SDD)**: antes de implementar cualquier feature no trivial (que toque varios archivos o implique una decisión de diseño), debe existir un spec en `specs/NNN-nombre-feature.md` con: qué debe hacer la feature, reglas de negocio, y criterios de aceptación. El spec se presenta y se espera confirmación explícita del usuario sobre su contenido antes de pasar a la etapa de plan.
- **Plan antes de código**: nunca implementar directamente desde el spec. Primero presentar un plan técnico con una lista de tareas chicas y verificables, y esperar aprobación antes de escribir código.
- **Una tarea a la vez**: implementar una tarea del plan a la vez (no el plan completo de una sola vez), y mostrar el diff de cada tarea antes de pasar a la siguiente.
- **TDD para lógica crítica**: el parser de CSV y la lógica de upsert/reconciliación por OT deben desarrollarse con TDD — escribir primero el test que describe el comportamiento esperado, mostrarlo, confirmar que falla (rojo), y solo después escribir la implementación mínima para que pase (verde). No escribir tests que solo validen código que uno mismo acaba de escribir.
- **Dashboards/UI**: TDD no es obligatorio para pantallas de dashboard y componentes visuales, pero sí hay que correr `npm run build` y `npm run lint` antes de dar una tarea por terminada.
- **Tests existentes**: nunca modificar un test existente para que pase sin decirlo explícitamente y explicar por qué.
- **Definición de "terminado" por spec**: un spec se considera completo cuando todas sus tareas del plan están implementadas y aprobadas, `npm run build` compila sin errores, `npm run lint` no reporta problemas, y (si el spec incluye lógica crítica) los tests correspondientes pasan en verde.
- **Commit y push automáticos**: apenas un spec cumple la definición de "terminado" de arriba, hacer commit y push a `origin main` automáticamente, sin pedir confirmación adicional para ese push puntual. Si el build, el lint o los tests fallan, no hacer commit: primero arreglar y volver a verificar. Esta autorización también cubre fixes puntuales que reparan un build/deploy roto (ej. un error de `next build` en Vercel) — no hace falta spec ni confirmación previa para pushearlos, solo verificar que el build/lint/tests queden en verde antes de commitear. Cualquier otra operación de git fuera de estos dos casos (force-push, reescritura de historia, push a otro remoto/rama) sigue requiriendo confirmación explícita.
