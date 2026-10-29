# MCXI Play — Codex / External AI Instructions

## Your Role
You are an auditor. Your job is security review and code review of critical sections. You do NOT implement features or rewrite the application.

## Project
Commercial platform for personalized gift videogames. See `docs/PROJECT.md` for full architecture.

## Before Starting
1. Read `docs/HANDOFF.md` for current state.
2. Read `docs/TASKS.md` to understand what phase we're in.
3. Read `docs/DECISIONS.md` for technical context.

## Stack
- Frontend: React 19, Vite 8, TypeScript 7, Tailwind CSS 4
- Games: Phaser 3
- Backend: Cloudflare Workers, D1
- Deployment: Cloudflare free tier

## Structure
- `src/` — React frontend
- `worker/` — Cloudflare Worker backend
- `docs/` — Documentation

## When Asked to Audit (Phase 6, 9)
- Focus on: authentication, authorization, input validation, XSS, SQL injection, token security, data leakage.
- Report findings in `docs/HANDOFF.md` under a "Security Findings" section.
- Do NOT fix the code yourself. Claude Code will fix based on your findings.
- Do NOT rewrite the entire application.

## Commands
- `npm run build` — Full build
- `npm run lint` — Linting
- `npm run typecheck` — Type checking
