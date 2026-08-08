# Project structure

Snapshot of every non-generated source path, so you know where to make
changes later.

```text
ats-engine/
├── firebase.json                  # Spark hosting config (SPA rewrites, cache headers)
├── .firebaserc                    # Firebase project alias — edit before deploy
├── DEPLOY.md                      # step-by-step deployment guide
├── STRUCTURE.md                   # this file
├── README.md
├── SETUP.md
├── AGENTS.md
├── package.json                   # name: "ats-engine" (rename here if you fork)
├── vite.config.ts                 # TanStack Start plugin config (Wave 2: SPA mode)
├── tsconfig.json
├── components.json                # shadcn component config
├── eslint.config.js
├── .env.example                   # required env vars — copy to .env
│
├── docs/
│   ├── schema.sql                 # Supabase tables, enums, RLS, demo seed rows
│   └── ai-worker/                 # ⇢ standalone Cloudflare Worker (separate deploy)
│       ├── wrangler.toml
│       └── src/index.ts           # /chat, /generate, /joblink — holds GROQ_API_KEY
│
├── src/
│   ├── router.tsx                 # TanStack router + QueryClient factory
│   ├── server.ts                  # SSR entry (Wave 1 only; removed in Wave 2)
│   ├── start.ts                   # createStart config (Wave 1)
│   ├── styles.css                 # Tailwind v4 + design tokens + .dark overrides
│   │
│   ├── routes/                    # file-based routing
│   │   ├── __root.tsx             # <html>, head meta, theme bootstrap script, providers
│   │   ├── index.tsx              # landing page (rebranded ATS Engine)
│   │   ├── demo.tsx               # ★ View Demo page + Load/Clear Mock Data button
│   │   ├── auth.login.tsx         # demo login (user123 / 1234)
│   │   ├── auth.signup.tsx
│   │   ├── auth.role.tsx
│   │   │
│   │   ├── _app.tsx               # authenticated layout — sidebar, top bar,
│   │   │                          #   theme toggle, MockBanner, role guard
│   │   │
│   │   ├── _app.candidate.index.tsx
│   │   ├── _app.candidate.jobs.tsx
│   │   ├── _app.candidate.applications.tsx
│   │   ├── _app.candidate.notifications.tsx
│   │   ├── _app.candidate.resume.tsx
│   │   ├── _app.candidate.cover-letter.tsx
│   │   ├── _app.candidate.interview.tsx
│   │   ├── _app.candidate.assistant.tsx     # streaming chat
│   │   ├── _app.candidate.skills.tsx
│   │   ├── _app.candidate.portfolio.tsx
│   │   ├── _app.candidate.salary.tsx
│   │   ├── _app.candidate.referrals.tsx
│   │   ├── _app.candidate.onboarding.tsx
│   │   │
│   │   ├── _app.employer.index.tsx
│   │   ├── _app.employer.jobs.tsx           # includes “Import from URL”
│   │   ├── _app.employer.candidates.tsx
│   │   ├── _app.employer.interviews.tsx
│   │   ├── _app.employer.talent-pool.tsx
│   │   ├── _app.employer.offers.tsx
│   │   ├── _app.employer.templates.tsx
│   │   ├── _app.employer.careers.tsx
│   │   ├── _app.employer.analytics.tsx
│   │   ├── _app.settings.tsx
│   │   │
│   │   └── api/                    # Wave 1 server routes (deleted in Wave 2)
│   │       ├── chat.ts             # ⇢ moves to Cloudflare Worker /chat
│   │       └── generate.ts         # ⇢ moves to Cloudflare Worker /generate
│   │
│   ├── components/
│   │   ├── theme-toggle.tsx        # ★ Sun/Moon/System toggle in top bar
│   │   ├── mock-banner.tsx         # ★ sticky “Clear Mock Data” bar
│   │   ├── dashboard/primitives.tsx
│   │   └── ui/                     # shadcn components
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-mock-active.ts      # ★ subscribes to mock-overlay flag
│   │
│   ├── lib/
│   │   ├── theme.ts                # ★ theme storage + FOUC-free bootstrap script
│   │   ├── mock-overlay.ts         # ★ localStorage enable/disable/isActive
│   │   ├── mock-fixtures.ts        # ★ sample jobs/candidates/apps/interviews
│   │   ├── auth.functions.ts       # Wave 1 login / logout / session (server)
│   │   ├── session.server.ts       # Wave 1 encrypted cookie config
│   │   ├── profile.functions.ts    # candidate onboarding save
│   │   ├── joblink.functions.ts    # URL scrape + Groq extract + evaluate
│   │   ├── data.functions.ts       # Supabase reads (server functions)
│   │   ├── groq.server.ts          # AI SDK provider (server-only)
│   │   ├── mock-data.ts            # empty shim — DO NOT re-add mock arrays here
│   │   ├── types.ts                # shared DTOs
│   │   ├── utils.ts
│   │   ├── error-capture.ts
│   │   ├── error-page.ts
│   │   └── lovable-error-reporting.ts
│   │
│   └── integrations/supabase/
│       ├── client.ts               # browser Supabase client (anon key)
│       └── client.server.ts        # server admin client (service role)
│
└── dist/                           # build output — uploaded to Firebase
```

## Where to edit what

| Change                              | File                               |
| ----------------------------------- | ---------------------------------- |
| Rebrand copy                        | `src/routes/index.tsx`, `demo.tsx` |
| Dark-mode colors                    | `src/styles.css` `.dark { … }`     |
| Sidebar entries / groups            | `src/routes/_app.tsx`              |
| Landing → Demo CTA text             | `src/routes/index.tsx`             |
| Demo page copy / steps              | `src/routes/demo.tsx`              |
| Sample content in mock overlay      | `src/lib/mock-fixtures.ts`         |
| AI system prompts                   | `docs/ai-worker/src/index.ts` (Wave 2) or `src/routes/api/*.ts` (Wave 1) |
| Add a new AI feature                | new route in `src/routes/` + call Worker endpoint |
| Add a new database table            | `docs/schema.sql` (write GRANTs + RLS) |
| SEO title/description per page      | `head()` in each route file        |
| Firebase cache / rewrite rules      | `firebase.json`                    |
