# Deploying ATS Engine

Two things must be live: **Supabase** (database + auth) and the **app**
(static assets + SSR/server functions). The app is SSR — a static-only
Firebase Hosting deploy will break every server function and `/api` route.

---

## 1. Supabase

1. Create a project at https://supabase.com.
2. **SQL Editor → New query** → paste all of `docs/schema.sql` → **Run**.
   It is idempotent and contains no demo rows.
3. **Authentication → Providers → Email**: enable, and turn **Confirm email**
   off for the first run (or wire your SMTP before going live).
4. **Project Settings → API**, copy:
   - Project URL → `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - `anon` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never
     expose)

RLS stays enabled on every table. The app reaches Postgres only from server
code with the service-role key, so no extra policies are needed beyond the
two public ones already in the schema (`jobs`, `analytics_metrics`).

---

## 2. Environment variables

Copy `.env.example` to `.env` and fill it in:

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...            # primary model, required
GROQ_API_KEY_1=...            # optional failover
SESSION_SECRET=<64+ random chars>
```

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Local dev reads `.env` through `src/lib/env.server.ts` (it parses the file
directly, because Vite does not put unprefixed vars on `process.env`), so
`vite dev` picks the keys up with no extra tooling.

```bash
bun install     # or npm install
bun run dev     # http://localhost:8080
```

---

## 3. Firebase deploy (SSR, error-free path)

### 3.1 One-time setup

```bash
npm i -g firebase-tools
firebase login
```

Edit `.firebaserc` and replace `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID` with
your real project id.

Requirements:
- Firebase project on the **Blaze** plan (Cloud Functions need it).
- Enable **Cloud Functions**, **Cloud Run**, **Artifact Registry** and
  **Cloud Build** APIs in the Google Cloud console for that project.

### 3.2 Build for Firebase

The app builds with Nitro; the `firebase` preset emits `.output/public`
(static) and `.output/server` (the SSR Cloud Function named `server`).

```bash
npm run build:firebase
```

This is `cross-env NITRO_PRESET=firebase vite build`, so it works the same
on Windows, macOS and Linux.

### 3.3 Set production secrets

Runtime secrets must exist in the deployed function, not just in `.env`:

```bash
firebase functions:secrets:set SUPABASE_URL
firebase functions:secrets:set SUPABASE_SERVICE_ROLE_KEY
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set GROQ_API_KEY_1
firebase functions:secrets:set SESSION_SECRET
```

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are baked into the client
bundle at build time, so they only need to be in `.env` when you run
`npm run build:firebase`.

### 3.4 Deploy

```bash
npm run deploy        # build:firebase + firebase deploy
```

or explicitly:

```bash
firebase deploy --only hosting,functions:ssr
```

`firebase.json` is already configured: Hosting serves `.output/public` and
rewrites everything else to the `server` function, so SSR pages,
`createServerFn` RPC calls, and `/api/chat` + `/api/generate` streaming all
work in production.

### 3.5 Post-deploy checklist

1. Open the Hosting URL — the landing page should SSR (view source shows
   markup, not an empty div).
2. Sign up with a real email; confirm a row appears in `public.profiles`.
3. Open the Career Assistant and send a message — the response must stream
   token by token (that proves `GEMINI_API_KEY` reached the function).
4. Post a job as a recruiter and confirm the row lands in `public.jobs`.
5. Turn the Job Hunt agent on in review mode and run one pass; check
   `job_hunt_log` for entries.

### Common failure causes

| Symptom | Cause / fix |
|---|---|
| Blank page, 404 on every route | Hosting `public` not `.output/public`, or the `**` → `server` rewrite is missing |
| `No AI provider configured` | `GEMINI_API_KEY` not set as a function secret |
| Auth works locally, fails in prod | `SESSION_SECRET` or `SUPABASE_SERVICE_ROLE_KEY` missing from function secrets |
| Deploy rejected | Project still on the Spark plan — upgrade to Blaze |
| Streaming responses arrive all at once | A proxy/CDN buffering layer in front of Hosting; test the function URL directly |

---

## 4. Alternative: Firebase App Hosting

If you prefer App Hosting (no manual preset), connect the GitHub repo in the
Firebase console, set the build command to `npm run build`, the output to
`.output`, and add the same secrets in the App Hosting settings. The rest of
the app is unchanged.
