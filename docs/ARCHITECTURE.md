# ATS Engine — Architecture

## 1. System overview

```text
                         ┌──────────────────────────────────────────┐
                         │              BROWSER (SPA)               │
                         │  React 19 · TanStack Router · Tailwind   │
                         │                                          │
                         │  Landing /  ·  /demo  ·  /auth/*         │
                         │  /candidate/*        /employer/*         │
                         │                                          │
                         │  ┌────────────────────────────────────┐  │
                         │  │ useDataset()   – page data         │  │
                         │  │ useMockActive()– demo overlay flag │  │
                         │  │ useAutoApplyAgent() – 60s agent    │  │
                         │  │ useChat()      – streaming AI      │  │
                         │  │ theme.ts       – dark / light      │  │
                         │  └────────────────────────────────────┘  │
                         └───────────┬───────────────┬──────────────┘
                                     │               │
                    server functions │               │ streaming HTTP
                    (typed RPC)      │               │ (SSE text stream)
                                     ▼               ▼
        ┌────────────────────────────────────────────────────────────────┐
        │                    SERVER (TanStack Start)                     │
        │                                                                │
        │  data.functions.ts      auth.functions.ts   profile.functions  │
        │  autoapply.functions.ts joblink.functions.ts                   │
        │                                                                │
        │  /api/chat      → streamText  (assistant, threaded)            │
        │  /api/generate  → streamText  (resume, cover letter, coach)    │
        │                                                                │
        │  session.server.ts  – signed, httpOnly cookie                  │
        │  ai-provider.server.ts – provider router (below)               │
        │  client.server.ts   – Supabase service-role client             │
        └───────┬──────────────────────────────────────┬────────────────┘
                │                                      │
                ▼                                      ▼
   ┌────────────────────────────┐        ┌──────────────────────────────┐
   │        SUPABASE            │        │        AI PROVIDER POOL      │
   │  Postgres + RLS            │        │                              │
   │                            │        │  ┌────────────────────────┐  │
   │  profiles      jobs        │        │  │ Groq key 1  ┐          │  │
   │  candidates    job_matches │        │  │ Groq key 2  ├ round-   │  │
   │  applications  interviews  │        │  │ Groq key 3  ┘ robin    │  │
   │  interview_questions       │        │  │ gpt-oss-120b           │  │
   │  notifications  roadmap    │        │  └───────────┬────────────┘  │
   │  skill_radar   analytics   │        │              │ on 429/5xx    │
   │  funnel        hiring_trend│        │              ▼               │
   │  assistant_threads/messages│        │  ┌────────────────────────┐  │
   │  auto_apply_settings       │        │  │ Gemini 2.5 Flash       │  │
   │  auto_apply_log            │        │  │ + Google Search        │  │
   └────────────────────────────┘        │  │   grounding (live web) │  │
                                         │  └────────────────────────┘  │
                                         └──────────────────────────────┘
```

## 2. AI request path

```text
UI action ──► server fn / api route ──► runAgent()
                                          │
                     needsLiveData(prompt)?│
                        ┌──────────────────┴──────────────────┐
                        │ yes                                 │ no
                        ▼                                     ▼
             Gemini 2.5 Flash                        Groq gpt-oss-120b
             + Google Search grounding               (key rotated per call)
                        │                                     │
                        │            on error / rate limit ───┤
                        │                                     ▼
                        │                          next Groq key → Gemini
                        └──────────────┬──────────────────────┘
                                       ▼
                         streamed tokens back to the browser
```

Keys live only in server env (`GROQ_API_KEY_1..3`, `GEMINI_API_KEY`). They are
never sent to, requested from, or stored in the browser.

## 3. Data path — live vs demo

```text
                       ┌──────────────────────────┐
   page component ───► │       useDataset()       │
                       └────────────┬─────────────┘
                                    │
              localStorage flag "ats-engine-mock" ?
                 ┌──────────────────┴──────────────────┐
                 │ off (default)                       │ on (Demo page)
                 ▼                                     ▼
   server fns → Supabase (real rows)        MOCK_DATASET (typed, in-browser)
                 │                                     │
                 └───────────────┬─────────────────────┘
                                 ▼
                       same typed Dataset shape
```

The overlay never writes to Supabase, the auto-apply agent is suspended while
it is on, and AI endpoints stay live in both modes. "Clear Mock Data" in the
sticky banner returns every page to real data instantly.

## 4. Auto-apply agent

```text
candidate toggles ON
        │
        ▼
useAutoApplyAgent() ── every 60s ──► runAutoApply()  (server)
                                        │
                                        ├─ load settings (min score, daily cap)
                                        ├─ count today's applications
                                        ├─ fetch job_matches ≥ min score
                                        ├─ drop duplicates already applied to
                                        ├─ insert applications rows
                                        └─ insert auto_apply_log audit rows
                                        │
        toast + activity feed ◄─────────┘
```

## 5. Auth and session

```text
/auth/login ─► auth.functions.signIn ─► verify demo credentials
                                       └─► signed httpOnly cookie {userId, role}
                                                    │
_app route beforeLoad ──────────────────────────────┤
   • no session          → redirect /auth/login     │
   • candidate, no profile → redirect /candidate/onboarding
   • role mismatch       → redirect to own portal
```

## 6. Deployment shape (Firebase Spark)

```text
   Firebase Hosting (static SPA build)      Cloudflare Worker (free)
   ┌────────────────────────────┐           ┌────────────────────────┐
   │ dist/ client bundle        │  fetch ─► │ /chat  /generate       │
   │ SPA rewrite → index.html   │           │ holds GROQ/GEMINI keys │
   └──────────┬─────────────────┘           └────────────────────────┘
              │ supabase-js (anon key + RLS)
              ▼
       Supabase Postgres
```

See `DEPLOY.md` for the step-by-step deployment procedure.
