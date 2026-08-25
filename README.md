# Body Tracker

Sistema Web de Evaluación Física y Seguimiento Corporal para profesionales de la salud.

## Stack

- **Framework**: Next.js 16.2.9 (App Router)
- **UI**: React 19.2.4 + Tailwind CSS v4 + shadcn/ui (base-nova)
- **Base de datos**: PostgreSQL + Prisma 7
- **Auth**: Supabase Auth
- **Validación**: Zod 4 + react-hook-form
- **Gestor de paquetes**: pnpm

## Requisitos

- Node.js 24.13.1
- pnpm

## Setup

```bash
# Instalar dependencias
pnpm install

# Generar cliente Prisma
pnpm prisma generate

# Aplicar migraciones
pnpm prisma migrate dev

# Iniciar servidor de desarrollo
pnpm dev
```

## Scripts

```bash
pnpm dev      # Servidor de desarrollo
pnpm build    # Build de producción
pnpm start    # Servidor de producción
pnpm lint     # ESLint
```

## Estructura

- `src/app/(auth)/` — Rutas de autenticación (login, registro)
- `src/app/(dashboard)/` — Panel de control protegido
- `src/actions/` — Server actions
- `src/components/` — Componentes UI y de negocio
- `src/lib/` — Utilidades, cliente Prisma, Supabase
- `prisma/schema.prisma` — Esquema de base de datos

## Desarrollo local

El proyecto usa Supabase y Postgres en localhost:

- Supabase: `127.0.0.1:54331`
- Postgres: `127.0.0.1:54332`

Configura las variables de entorno en `.env` si necesitas cambiarlas.

## Deploy y migraciones en producción

El deploy es a Vercel con la configuración por defecto (no hay `vercel.json` ni CI configurado en el repo). El `build` (`next build`) y el `postinstall` (`prisma generate`) **no aplican migraciones** — `prisma generate` solo regenera el cliente/tipos a partir del schema, no toca la base de datos.

Esto significa que **las migraciones pendientes deben aplicarse manualmente contra la base de producción antes de que el deploy con el código nuevo reciba tráfico**. Si el código llega a producción sin que la migración se haya corrido, cualquier query que use columnas nuevas del schema falla con un error de Prisma tipo `Unknown argument`.

Para aplicar las migraciones pendientes en producción:

```bash
DATABASE_URL="<url-de-produccion>" pnpm prisma migrate deploy
```

- `migrate deploy` (a diferencia de `migrate dev`) solo aplica migraciones ya existentes en `prisma/migrations/` — no genera ninguna nueva ni pide confirmación interactiva. Es el comando indicado para CI/producción.
- **Usa la conexión directa a Postgres, no el connection pooler de Supabase (Supavisor/pgbouncer, puerto `6543`).** Prisma Migrate necesita locks de sesión que el pooler en modo transacción no soporta bien y la migración puede quedarse colgada. En Supabase, la conexión directa usa el host `db.<project-ref>.supabase.co` en el puerto `5432` (Project Settings → Database → Connection string → "Direct connection"), a diferencia del host del pooler (`aws-*.pooler.supabase.com:6543`). El `DATABASE_URL` en `.env`/Vercel para runtime de la app sí puede seguir usando el pooler (`6543`) normalmente; usa el host de conexión directa solo para correr migraciones.
- Verifica el estado de las migraciones sin aplicar nada con `DATABASE_URL="<url>" pnpm prisma migrate status`.
