# MCXI Play — Claude Code Instructions

## Project
Commercial platform for personalized gift videogames. React + Vite + TypeScript frontend, Phaser 3 games, Cloudflare Workers + D1 backend.

## Stack
- Frontend: React 19, Vite 8, TypeScript 7, Tailwind CSS 4
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

## Commands
- `npm run dev` — Start Vite dev server
- `npm run build` — TypeScript check + Vite build
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
- `AGENTS.md` — Instructions for Codex
