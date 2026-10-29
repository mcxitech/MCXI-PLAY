# MCXI Play — Claude Code Instructions

## Project
Commercial platform for personalized gift videogames. React + Vite + TypeScript frontend, Phaser 3 games, Cloudflare Workers + D1 backend.

## Stack
- Frontend: React 19, Vite 8, TypeScript 6.0 (D018), Tailwind CSS 4
- Games: Phaser 3
- Backend: Cloudflare Workers with Static Assets, D1
- Deployment: Cloudflare (free tier)

## Structure
- `src/` — React frontend (components, pages, game, types, lib)
- `worker/` — Cloudflare Worker backend
- `docs/` — Project documentation
- `public/` — Static assets

## Rules
- Work one phase at a time. Don't skip ahead.
- Don't rewrite working code unnecessarily.
- Don't add features beyond current phase scope.
- Keep commits small with clear descriptions.
- Update docs/TASKS.md, docs/HANDOFF.md after each task.
- Run build before marking a task complete.
- Stop at phase boundary and wait for approval.
- **Security (permanent):** demo/preview never yields a full or exportable gift. Full engine and ZIP only via server-checked `activated` orders. Never rely on hiding frontend code. See "Permanent Requirement: Demo vs Paid Product" in docs/PROJECT.md and D020.

## Commands
- `npm run dev` — Start Vite dev server
- `npm run build` — TypeScript check + Vite build (app + export engine)
- `ADMIN_PASSWORD=<pw> npm run test:api` — API/security regression tests (needs `npx wrangler dev` running)
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript only
- `npm run worker:dev` — Wrangler local dev
- `npm run worker:deploy` — Deploy to Cloudflare

## Context Files
- `docs/PROJECT.md` — Architecture and scope
- `docs/TASKS.md` — Master checklist
- `docs/DECISIONS.md` — Technical decisions
- `docs/HANDOFF.md` — Current state for AI handoff
- `docs/TESTS.md` — Test log
- `docs/MARKETING.md` — Official marketing module (copies, prices, WhatsApp scripts). Keep site facts and copies consistent; never add features just because a copy mentions them.
- `AGENTS.md` — Instructions for Codex
