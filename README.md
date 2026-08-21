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
