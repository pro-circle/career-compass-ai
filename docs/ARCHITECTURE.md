# ATS Engine — Architecture

## 1. Tech stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start v1 (React 19, file-based routing, SSR) |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 (`src/styles.css`, semantic tokens) |
| Server logic | `createServerFn` RPC + server routes under `src/routes/api/` |
| Database / Auth | Supabase (Postgres + Auth), reached only from the server with the service-role key |
| Session | Signed HTTP-only cookie (`SESSION_SECRET`), `src/lib/session.server.ts` |
| AI SDK | Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/openai-compatible`) |
| Primary model | **Google Gemini `gemini-2.5-flash`** — all generation, always streamed |
| Grounding | Gemini + Google Search tool for live salary / market / job data |
| Failover | Groq `openai/gpt-oss-120b` key pool (up to 3 keys, round-robin + cooldown) |
| Voice | Web Speech API (`src/hooks/use-speech-input.ts`) — streaming transcript |
| Hosting | Firebase Hosting + Cloud Functions (SSR) |

## 2. Diagram

```text
                       ┌──────────────────────────────────────────┐
                       │              Browser (React)             │
                       │  routes/_app.* dashboards, voice input   │
                       └───────┬───────────────────────┬──────────┘
                               │ RPC (createServerFn)  │ fetch (SSE text stream)
                               ▼                       ▼
        ┌──────────────────────────────┐   ┌──────────────────────────────┐
        │  Server functions            │   │  Server routes               │
        │  src/lib/*.functions.ts      │   │  /api/chat  /api/generate    │
        │  data / apply / jobhunt /    │   │  streaming Gemini responses  │
        │  recruiter / auth / profile  │   └───────────────┬──────────────┘
        └──────┬───────────────┬───────┘                   │
               │               │                           │
               ▼               ▼                           ▼
   ┌────────────────┐  ┌──────────────────┐   ┌──────────────────────────┐
   │ session.server │  │ *.server.ts      │   │ ai-provider.server.ts    │
   │ signed cookie  │  │ business logic   │   │ Gemini → Groq failover   │
   └────────────────┘  └────────┬─────────┘   │ + Google Search grounding│
                                │             └───────────┬──────────────┘
                                ▼                         ▼
                    ┌────────────────────┐    ┌────────────────────────┐
                    │ Supabase Postgres  │    │ Gemini API / Groq API  │
                    │ RLS on, service    │    │ (server-side keys only)│
                    │ role from server   │    └────────────────────────┘
                    └────────────────────┘
```

**Key rule:** the browser never talks to Supabase or any model provider
directly. No API key ever reaches the client bundle.

## 3. Module map

```text
src/lib/env.server.ts        reads process.env, falls back to parsing .env in local dev
src/lib/session.server.ts    cookie session, requireUserId()
src/lib/auth.server.ts       Supabase Auth sign-up / sign-in / profile bootstrap
src/lib/auth.functions.ts    signup / login / logout RPC
src/lib/data.functions.ts    all dashboard reads (jobs, candidates, applications, …)
src/lib/profile.functions.ts onboarding + AI resume parsing into resume_json
src/lib/joblink.functions.ts paste-a-URL → parsed job description
src/lib/linkfetch.server.ts  fetches + strips remote job pages
src/lib/jobhunt.server.ts    the Job Hunt agent (search → score → propose/apply)
src/lib/jobhunt.functions.ts Job Hunt RPC surface
src/lib/apply.functions.ts   single-job application submit
src/lib/recruiter.functions.ts stage moves + bulk email / notification
src/lib/ai-provider.server.ts model routing, key pool, grounding
src/lib/ai-stream.ts         client helper that streams /api/generate
```

## 4. How auto-apply (Job Hunt agent) works

Settings live in `job_hunt_settings` (per user): `enabled`, `mode`
(`review` | `auto`), `min_score`, `daily_limit`, target `titles`,
`locations`, `remote_only`, and which assets to attach (resume, portfolio,
GitHub).

While the agent is on, the client calls `runJobHunt()` once a minute; the
whole pass runs on the server:

1. **Profile load** — reads `profiles` for the signed-in user: resume text,
   parsed `resume_json`, skills, target roles, years of experience.
2. **Discovery** — Gemini with the Google Search tool runs grounded queries
   built from the target titles + locations + remote flag, and returns live
   postings (title, company, location, salary, URL). Internal `jobs` rows
   are included in the same candidate set.
3. **Parse** — each unseen posting URL is fetched and stripped
   (`linkfetch.server.ts`), then Gemini extracts structured requirements.
4. **Score** — Gemini scores the profile against each parsed job 0–100 with a
   one-line reason. Anything below `min_score` is logged as `skipped`.
5. **Decide** —
   - `mode: "review"` → a row goes into `job_hunt_proposals` with
     `status: 'pending'`. The candidate approves or denies in the UI
     (`decideJobHuntProposal`); approval runs the apply step.
   - `mode: "auto"` → the apply step runs immediately.
6. **Apply** — the agent drafts a tailored cover note plus answers to the
   posting's questions (`draftApplication`), writes an `applications` row,
   and marks the proposal `applied`.
7. **Notify + audit** — a `notifications` row is inserted for the candidate
   and a `job_hunt_log` entry records score, decision and reason.
   `daily_limit` caps applications per UTC day; duplicates are blocked by the
   proposal/job id.

Everything is idempotent: re-running a pass never re-applies to a job that
already has a proposal or application row.

## 5. Data flow for the candidate journey

```text
Upload resume ──► profiles.resume_text + Gemini → resume_json
       │
Paste job link / pick match ──► joblink parse ──► job context
       │
Tailor ──► /api/generate (streaming Gemini) ──► resume + cover letter
       │
Practice ──► voice interview (Web Speech in, streaming Gemini coach out)
       │
Insights ──► scored feedback ──► practice again
       │
Apply ──► applications row ──► recruiter pipeline
```

## 6. Recruiter journey

`/employer/jobs` (card or table view) → `/employer/jobs/new` (dedicated
posting page, can pre-fill from a job URL) → `/employer/jobs/:jobId`, a
single continuous workspace: **Screen → Compare → Manage stages → Reach
out** (bulk email or in-app notification via `recruiter.functions.ts`).

## 7. Security model

- Service-role key, Gemini key, Groq keys and `SESSION_SECRET` are
  server-only and read through `serverEnv()`; never `VITE_`-prefixed.
- RLS is enabled on every table. Only `jobs` and `analytics_metrics` have
  public `anon` SELECT policies (public careers + share pages).
- All writes are authorized by `requireUserId()` from the signed cookie.
