# ATS Engine — Setup

This app runs on TanStack Start with **Supabase** (your own project) and
**Groq** (`openai/gpt-oss-120b`) for streaming AI. No Lovable Cloud required.

## 1. Environment variables

Copy `.env.example` to `.env` and fill in:

```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...service-role...
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...anon...
GROQ_API_KEY=gsk_...
# SESSION_SECRET is auto-provisioned; set manually only if self-hosting.
```

Server-only vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`,
`SESSION_SECRET`) are read inside server-function handlers and `/api/*` routes.
The `VITE_` variants are safe to ship to the browser.

## 2. Database schema

Open the Supabase dashboard → **SQL Editor** and run the entire contents of
`docs/schema.sql`. It creates all tables + seeds the two demo accounts and
example rows. Re-run any time; every insert is idempotent.

## 3. Demo credentials

The app ships with a fixed demo login for both portals:

| Field    | Value     |
|----------|-----------|
| Username | `user123` |
| Password | `1234`    |

Pick the **Employer** or **Candidate** toggle on `/auth/login` to enter the
corresponding portal. A first-time candidate is routed through
`/candidate/onboarding` to capture their resume/profile before the workspace
unlocks.

## 4. AI features

Streaming Groq calls power:

- **Career Assistant** (`/candidate/assistant`) — `POST /api/chat`, AI SDK `useChat`.
- **Resume optimizer, cover letter, mock interview** — `POST /api/generate` (text stream).
- **Resume parsing on onboarding** — non-streaming `generateText` from `saveOnboarding`.

If `GROQ_API_KEY` is unset, the endpoints return `500` with a clear message —
UI toasts the error rather than crashing.

## 5. Notes

- Old `src/lib/mock-data.ts` still exists as an empty-typed compatibility
  layer; every data read now flows through `src/lib/data.functions.ts` →
  Supabase. Pages render empty states until you run the schema/seed above.
- Sessions are encrypted cookies via TanStack Start's `useSession`
  (`src/lib/session.server.ts`). The `_app` layout redirects unauthenticated
  visitors to `/auth/login`.
