# Deploying ATS Engine

This project ships in two waves. **Wave 1** (this repo, right now) is the SSR
prototype you're running locally — great for development and demos. **Wave 2**
(SPA on Firebase Spark) is the production deployment plan below.

---

## Architecture (target — Wave 2)

```
┌───────────────────────────────┐         ┌───────────────────────────┐
│  Firebase Hosting (Spark)     │         │  Supabase                 │
│  - static SPA (index.html +   │◀───────▶│  - Postgres + Auth        │
│    hashed JS/CSS)             │  anon   │  - RLS enforces role      │
│  - no server code             │   key   │    access                 │
└───────────────┬───────────────┘         └───────────────────────────┘
                │
                │  POST /chat, /generate, /joblink
                ▼
┌───────────────────────────────┐
│  Cloudflare Worker            │
│  - holds GROQ_API_KEY         │
│  - streams Groq gpt-oss-120b  │
└───────────────────────────────┘
```

**Why not put the Groq key in the Firebase env?** Firebase Hosting Spark serves
static files only — any `VITE_*` env at build time is inlined into the JS
bundle and readable by anyone. Cloud Functions on Spark also block outbound
calls to non-Google APIs. Cloudflare Workers has a genuine free tier and can
hold the secret.

---

## Prerequisites

1. **Node 20+**, `bun`, and the `gcloud`/`firebase-tools` CLIs.
2. A Supabase project.
3. A Cloudflare account (free tier — no card needed for Workers up to 100k
   requests/day).
4. A Groq API key from https://console.groq.com

---

## Step 1 — Supabase

1. Create a new project at https://supabase.com.
2. Open the SQL editor and paste the contents of `docs/schema.sql`, then run.
3. Authentication → Providers → enable **Email**.
4. Authentication → Users → invite a user with email `user123@ats-engine.local`
   and password `1234` (this is the demo account after Wave 2 auth migration).
5. Copy **Project URL** and **anon key** from Settings → API.

---

## Step 2 — Cloudflare AI Worker

The Worker in `docs/ai-worker/` proxies Groq. Deploy it separately.

```bash
cd docs/ai-worker
npm i -g wrangler
wrangler login
wrangler secret put GROQ_API_KEY          # paste your Groq key when prompted
wrangler secret put ALLOWED_ORIGINS       # e.g. https://your-app.web.app,http://localhost:8080
wrangler deploy
```

The command prints a URL like `https://ats-engine-ai.yourname.workers.dev`.
Copy it — this is your `VITE_AI_ENDPOINT`.

---

## Step 3 — SPA build

Create `.env` in the project root:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
VITE_AI_ENDPOINT=https://ats-engine-ai.yourname.workers.dev
```

Build the client bundle:

```bash
bun install
bun run build
```

Wave 2 will produce `dist/client/index.html` + hashed assets. Everything
under `dist/client` is public — never put secrets in it.

---

## Step 4 — Firebase Hosting

```bash
npm i -g firebase-tools
firebase login
# edit .firebaserc — replace REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID
npm run deploy          # builds, then deploys hosting
```

### `Error: Directory 'dist/client' for Hosting does not exist.`

This means the deploy ran before a build. Two fixes are now in the repo:

- `package.json` has `npm run deploy` = `vite build` + `firebase deploy --only hosting`.
- `firebase.json` has a `predeploy` hook (`npm run build`), so even a plain
  `firebase deploy --only hosting` builds first.

If you still hit it, run the build by hand and confirm the folder exists:

```bash
npm run build
ls dist/client/index.html    # must exist before deploying
```

Never commit `dist/` — it is a build artifact and is regenerated on deploy.

Firebase prints your live URL: `https://<project>.web.app`. Copy that URL back
into the Worker's `ALLOWED_ORIGINS` secret and redeploy the Worker if you
tightened it.


---

## Local dev

```bash
bun install
cp .env.example .env    # then fill values
bun run dev             # http://localhost:8080
```

The Wave 1 preview uses TanStack Start's SSR runtime with server functions.
Wave 2 flips to SPA mode (config change) so the same source deploys to
Firebase.

---

## Wave 2 migration checklist (not yet applied)

- [ ] Vite/TanStack config: enable SPA prerender, drop server functions.
- [ ] Replace `useSession` cookie auth (`src/lib/session.server.ts`,
      `src/lib/auth.functions.ts`) with Supabase Auth calls from the browser.
- [ ] Rewrite `src/lib/data.functions.ts` and
      `src/lib/profile.functions.ts` as browser Supabase queries.
- [ ] Route `_app.tsx` guard: use Supabase session, not the cookie.
- [ ] Change `/api/chat`, `/api/generate`, `joblink` calls to `fetch(VITE_AI_ENDPOINT + "/chat")` etc.
- [ ] `bun run build` must emit `dist/client/index.html` (SPA), not a Worker.
- [ ] Firebase preview channel: `firebase hosting:channel:deploy preview`.

Ping me when you're ready for Wave 2 and I'll do it in one pass.

---

## Free-tier limits to watch

| Service            | Free tier                              | Watch for                    |
| ------------------ | -------------------------------------- | ---------------------------- |
| Firebase Hosting   | 10 GB storage, 360 MB/day egress       | large images, heavy SPA size |
| Supabase           | 500 MB DB, 50k MAU, 5 GB egress        | resume PDFs → move to Storage|
| Cloudflare Workers | 100k req/day, 10ms CPU per req         | tight loops, big prompts     |
| Groq               | Free tier per account, rate-limited    | burst chat traffic           |

---

## Troubleshooting

- **Blank page after deploy** → check the SPA rewrite in `firebase.json`.
- **CORS error hitting Worker** → add your Firebase URL to `ALLOWED_ORIGINS`.
- **`Invalid JWT` from Supabase** → you pasted the service-role key instead of
  the anon key. Anon key only in the SPA.
- **Groq 401** → wrangler secret didn't save; re-run `wrangler secret put GROQ_API_KEY`.

---

## Important: SSR build output vs Firebase Spark

`npm run build` produces:

- `dist/client/` — hashed JS/CSS assets (this is what `firebase.json` publishes)
- `dist/server/` — the SSR + server-function bundle (Cloudflare-Workers ready)

The SSR build intentionally does **not** emit `dist/client/index.html`, so
Firebase Hosting alone cannot render pages — it can only serve the static
assets. On the Spark plan the recommended split is:

1. Deploy `dist/server` to Cloudflare Workers (free tier):
   `npx nitro deploy --prebuilt`
2. Point your domain / Firebase Hosting at that Worker for HTML, and keep
   Firebase Hosting for static assets and the AI proxy in `docs/ai-worker/`.

Everything server-side (Supabase service key, Groq/Gemini keys) stays in the
Worker environment — never in `dist/client`.
