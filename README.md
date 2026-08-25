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

El deploy es a Vercel. El Build Command del proyecto está configurado como `prisma migrate deploy && next build`, así que **las migraciones pendientes se aplican automáticamente en cada deploy**, antes de que el build nuevo reciba tráfico.

Esto funciona porque `prisma.config.ts` apunta el `datasource.url` que usa el CLI de Prisma (migrate, studio, db pull) a `DIRECT_URL`, no a `DATABASE_URL`:

- **`DATABASE_URL`** es la conexión pooleada de Supabase (Supavisor/pgbouncer, puerto `6543`). La usa el cliente de la app en runtime (`src/lib/prisma.ts`, vía `@prisma/adapter-pg`) — nunca pasa por `prisma.config.ts`.
- **`DIRECT_URL`** es la conexión directa a Postgres (host `db.<project-ref>.supabase.co`, puerto `5432`, Project Settings → Database → Connection string → "Direct connection"). La usa el CLI de Prisma para todo (`migrate deploy`, `migrate dev`, `migrate status`, etc.), porque Prisma Migrate necesita locks de sesión que el pooler en modo transacción no soporta bien.

Ambas variables deben existir en el entorno (local `.env`/`.env.local`, y en Vercel → Project Settings → Environment Variables para Production). En local development apuntan a la misma base (no hay pooler), así que no hay diferencia de comportamiento.

Para verificar o aplicar migraciones manualmente (por ejemplo, si el Build Command de Vercel cambia o corres esto desde otra máquina):

```bash
pnpm prisma migrate status   # solo lee, no aplica nada
pnpm prisma migrate deploy   # aplica las migraciones pendientes
```

Ambos comandos ya usan `DIRECT_URL` automáticamente gracias a `prisma.config.ts` — no hace falta pasar `DATABASE_URL` a mano, siempre que `DIRECT_URL` esté definida en el `.env` que se esté usando.
