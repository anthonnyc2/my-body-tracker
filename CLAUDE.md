@AGENTS.md

## gstack

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

Available gstack skills: `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/connect-chrome`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`, `/setup-gbrain`, `/retro`, `/investigate`, `/document-release`, `/document-generate`, `/codex`, `/cso`, `/autoplan`, `/plan-devex-review`, `/devex-review`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec

## Deploy Configuration (configured by /setup-deploy)
- Platform: Vercel
- Production URL: https://my-body-tracker-three.vercel.app/
- Deploy workflow: auto-deploy on push to `main` (no GitHub Actions deploy workflow in this repo)
- Deploy status command: `gh api repos/anthonnyc2/my-body-tracker/commits/<sha>/status` (Vercel posts a commit status; `state: "success"` once the deploy completes)
- Merge method: direct push to `main` (no PR flow observed so far)
- Project type: web app (Next.js)
- Post-deploy health check: `curl -o /dev/null -w '%{http_code}' https://my-body-tracker-three.vercel.app/` (expect `307`, redirect to `/login`)

### Custom deploy hooks
- Pre-merge: `pnpm lint && pnpm exec tsc --noEmit && pnpm build`
- Deploy trigger: automatic on push to `main` (Vercel GitHub integration)
- Production DB migrations: **not yet automated.** Prisma schema changes need `prisma migrate deploy` run against the production `DIRECT_URL` (see `.env.production`) before/with the deploy that depends on them — otherwise the new Prisma client (matching the updated schema) will error on any query touching the changed table once deployed, since the columns won't exist in the DB yet.
  - Recommended fix (not yet applied — requires Vercel dashboard access this session doesn't have): set the Vercel Project's Build Command to `prisma migrate deploy && next build` so every production build applies pending migrations automatically using Vercel's own `DATABASE_URL`/`DIRECT_URL` env vars.
  - Until that's set up, migrations against prod must be run manually (by the user, or by an agent explicitly granted permission — Claude Code's auto-mode classifier blocks unattended writes/reads against a production database by design).
- Health check: not yet configured
