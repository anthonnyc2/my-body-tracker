<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Overview

Body Tracker - a physical evaluation and body tracking system for health professionals (evaluators) to track patients.

**Stack**: Next.js 16.2.9 + React 19.2.4 + PostgreSQL + Prisma + Supabase Auth + Tailwind CSS v4 + shadcn/ui

**Package manager**: pnpm (not npm/yarn)

**Node**: 24.13.1 (per .nvmrc)

## Dev Commands

```bash
pnpm dev      # Start dev server
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # ESLint
```

**No test script** is configured.

## Key Paths

- `@/*` → `./src/*`
- UI components: `src/components/ui/`
- Server actions: `src/actions/`
- Prisma schema: `prisma/schema.prisma`

## Architecture

- `src/app/(auth)/` — Login, register routes
- `src/app/(dashboard)/` — Protected dashboard routes
- `src/lib/supabase/` — Supabase client, server, middleware utilities
- `src/components/providers/` — QueryProvider, Toaster
- `src/lib/calculations.ts` — Body measurement calculations

## Database

Prisma 7 with `prisma.config.ts` (not `schema.prisma` with `datasource url`). Requires `DATABASE_URL` env var.

```bash
pnpm prisma generate   # Generate Prisma client
pnpm prisma migrate    # Run migrations
```

Prisma client bypasses Turbopack bundling in `src/lib/prisma.ts:4`.

## Styling

Tailwind CSS v4 (`@tailwindcss/postcss`). shadcn/ui style: `base-nova`. Components via `components.json` aliases.

## Validation

Zod 4 + react-hook-form. Schemas are likely in `src/components/forms/`.

## Skills

Skills are installed locally (see `skills-lock.json`). Available: prisma-*, shadcn, tailwind-v4-shadcn, next-*, react-*, zod, accessibility, etc.

### gstack

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

**Setup** (one-time, requires [bun](https://bun.sh)):
```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup
```

Available skills: `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/connect-chrome`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`, `/setup-gbrain`, `/retro`, `/investigate`, `/document-release`, `/document-generate`, `/codex`, `/cso`, `/autoplan`, `/plan-devex-review`, `/devex-review`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`

## Env Setup

Local dev uses Supabase at `127.0.0.1:54331` and Postgres at `127.0.0.1:54332` (see `.env`).

## CI/Deploy

No GitHub Actions or CI config found. Vercel deploy expected per Next.js default.
