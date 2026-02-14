# Maths-com — AI Reference

## Goal
Next.js app for math training (solo + multiplayer) with ranking (Elo), profiles, friends/messages, achievements/badges, and banner customization.

Primary DB is Supabase Postgres accessed via Prisma.

## Stack
- Next.js 16.1.6 (App Router)
- TypeScript
- Prisma v5
- NextAuth v4 (JWT session)
- Supabase Postgres (hosted)

## Environments / Secrets
- Local secrets live in `.env.local` (not committed)
- Template lives in `.env.example`
- `.env` in repo is kept empty (no secrets)

### Key env vars
- `DATABASE_URL` (Supabase Postgres connection string)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (set only in Production; avoid in Preview)
- OAuth (optional, enabled only if vars exist)
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`

### Vercel + Prisma
Vercel caches dependencies; Prisma client must be generated on install:
- `package.json` has `postinstall: "prisma generate"`

## Data model (Prisma)
Schema: `prisma/schema.prisma`
Major tables (mapped):
- `users`, `statistics`, `tests`, `questions`
- `friendships`, `messages`
- `multiplayer_games`, `multiplayer_questions`, `multiplayer_statistics`
- `badges`, `user_badges`
- `courses`
- `custom_banners`

## Auth
NextAuth config: `src/lib/auth.ts`
- Providers:
  - Credentials provider (email or username + password)
  - Google/Discord only when env vars are present
- Session strategy: JWT
- Important: `session.user` is defensively initialized.

NextAuth route: `src/app/api/auth/[...nextauth]/route.ts`

## DB access
Prisma client singleton: `src/lib/prisma.ts`

## API routes (App Router)
All under `src/app/api/**/route.ts`.

### Important security invariants (semi-public mode)
- Public profile data is allowed (username/displayName/avatar/banner/badges + aggregated stats)
- Private data (tests/questions, messages) requires auth + ownership checks

Recent hardening changes:
- `GET /api/tests` now requires auth and only returns the current user’s tests.
- `POST /api/tests/[id]/complete` now requires auth and checks test ownership.
- `PATCH /api/users` now requires auth and updates only the current user (never trust client-provided `id`).
- Public profile endpoints (`/api/profile?userId=...`, `/api/users`, `/api/users/[id]`) do not expose tests/questions and do not expose email unless self.

## Profiles + banners + badges
- Profile page for other users: `src/app/users/[id]/page.tsx`
- Banner component: `src/components/PlayerBanner.tsx`

Badge display rules:
- "Active" badges are `selectedBadgeIds` (JSON string in DB)
- Full badge inventory is `userBadges` relation.

## Friends
Endpoint: `src/app/api/friends/route.ts`
- POST creates friend request
- GET returns friendships for current user

UI behavior:
- On other user profile page, button should reflect:
  - Already friend
  - Request sent
  - Disabled via query param `?friends=0`

## Migration history
SQLite -> Supabase Postgres migration was completed via SQL dump.
Key dump file: `sqlite_dump_postgres_supabase_final.sql`.

A dev-only migration script that depended on optional Prisma adapters was disabled for production builds:
- `prisma/migrate-sqlite-to-postgres.ts` is a stub in prod.

## Deployment notes
- Vercel project URL currently used while domain purchase is pending.
- Domain target: `maths-app.com` (Porkbun) later.

## Contribution / Protocols for AI agents
- Do not add or remove comments unless requested.
- Prefer minimal, targeted patches.
- Any API returning user-specific data must check session + ownership.
- Never introduce `NEXT_PUBLIC_*` secrets.
- Never commit secrets; keep `.env*` ignored.
