import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  FlaskConical,
  ScanSearch,
  Brain,
  Target,
  Wand2,
  Mic,
  MessagesSquare,
  BarChart3,
  Link2,
  Users,
  Rocket,
  ShieldCheck,
  Check,
  Zap,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { enableMock, disableMock, isMockActive } from "@/lib/mock-overlay";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "View Demo — ATS Engine" },
      {
        name: "description",
        content:
          "Explore ATS Engine end-to-end: AI resume parsing, job-link intake, candidate ranking, mock interviews, and career roadmaps. Load sample data with one click.",
      },
      { property: "og:title", content: "View Demo — ATS Engine" },
      {
        property: "og:description",
        content:
          "Take a guided tour of ATS Engine. Load browser-only mock data to explore every feature without a live backend.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemoPage,
});

const steps = [
  {
    n: "01",
    title: "Sign in as recruiter or candidate",
    body: "Two purpose-built portals share one AI engine. Demo credentials: user123 / 1234.",
  },
  {
    n: "02",
    title: "Onboard your profile or job",
    body: "Candidates paste a resume, recruiters paste a job link. AI structures the rest.",
  },
  {
    n: "03",
    title: "Match, rank, evaluate",
    body: "AI scores candidates against roles with an explainable rationale.",
  },
  {
    n: "04",
    title: "Prep with live AI",
    body: "Mock interviews, cover letters, and a career-assistant chat all stream live.",
  },
];

const capabilities = [
  { icon: ScanSearch, title: "Resume Parsing", desc: "Extracts skills, education, projects into JSON." },
  { icon: Brain, title: "Semantic Matching", desc: "Goes beyond keywords to context." },
  { icon: Target, title: "AI Ranking", desc: "Prioritizes applicants with rationale." },
  { icon: Link2, title: "Job Link Intake", desc: "Paste any URL — auto-import or evaluate." },
  { icon: Wand2, title: "Resume Optimizer", desc: "Boosts ATS score and role relevance." },
  { icon: Mic, title: "Mock Interview", desc: "Voice/text practice with coaching feedback." },
  { icon: MessagesSquare, title: "Career Assistant", desc: "Streaming chat, warm and specific." },
  { icon: BarChart3, title: "Recruiting Analytics", desc: "Pipeline, velocity, offer acceptance." },
];

function DemoPage() {
  const router = useRouter();
  const [mockOn, setMockOn] = useState(false);
  useEffect(() => setMockOn(isMockActive()), []);

  function toggleMock() {
    if (mockOn) {
      disableMock();
      setMockOn(false);
      toast.success("Mock data cleared");
    } else {
      enableMock();
      setMockOn(true);
      toast.success("Mock data loaded — sample content is now visible across the app");
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/80 px-6 py-4 backdrop-blur-xl lg:px-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-brand text-brand-foreground font-bold text-[10px]">ATS</div>
          <span className="font-display text-xl font-extrabold tracking-tight">ATS Engine</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Try it live <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center lg:py-24">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-brand" /> Interactive product tour
        </div>
        <h1 className="mx-auto max-w-3xl font-display text-5xl font-extrabold leading-[1.05] tracking-tight lg:text-6xl">
          See <span className="text-brand">ATS Engine</span> in action.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Load one-click sample data to explore every feature — or sign in and connect
          your own. AI streams live either way.
        </p>

        <div className="mx-auto mt-10 flex flex-wrap justify-center gap-3">
          <button
            onClick={toggleMock}
            className={`inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90 ${
              mockOn ? "bg-destructive text-destructive-foreground" : "bg-brand text-brand-foreground"
            }`}
          >
            {mockOn ? (
              <>
                <X className="size-4" /> Clear Mock Data
              </>
            ) : (
              <>
                <FlaskConical className="size-4" /> Load Mock Data
              </>
            )}
          </button>
          <button
            onClick={() => router.navigate({ to: "/auth/login" })}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-surface"
          >
            Sign in <ArrowRight className="size-4" />
          </button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Mock data lives only in <span className="font-mono">localStorage</span>. It never touches your database.
        </p>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">How it works</span>
            <h2 className="mt-2 font-display text-4xl font-bold">Four steps, end to end.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 font-mono text-xs font-bold text-brand">{s.n}</div>
                <div className="font-display text-base font-bold">{s.title}</div>
                <p className="mt-2 text-xs text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">Capabilities</span>
          <h2 className="mt-2 font-display text-4xl font-bold">Every AI feature, in one place.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
              <div className="mb-4 grid size-9 place-items-center rounded-lg bg-brand/10 text-brand">
                <Icon className="size-4" />
              </div>
              <div className="text-sm font-bold">{title}</div>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust row */}
      <section className="border-t border-border bg-surface py-14">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Keys stay on the server", body: "AI and database secrets never touch the browser bundle." },
            { icon: Zap, title: "Streaming responses", body: "AI answers render token-by-token for zero-wait UX." },
            { icon: Check, title: "Bring-your-own data", body: "Live Supabase for real use, mock overlay for demos." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6">
              <Icon className="size-5 text-brand" />
              <div className="mt-3 text-sm font-bold">{title}</div>
              <p className="mt-1 text-xs text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-3xl bg-foreground p-12 text-center text-background lg:p-16">
          <h2 className="font-display text-4xl font-extrabold leading-tight lg:text-5xl">
            Ready to try the real thing?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-background/70">
            {mockOn
              ? "Mock data is loaded — jump into either portal to explore."
              : "Load sample data or sign in to connect live."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/employer"
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-5 py-3 text-sm font-medium text-brand-foreground hover:opacity-90"
            >
              <Users className="size-4" /> Recruiter portal
            </Link>
            <Link
              to="/candidate"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              <Rocket className="size-4" /> Candidate portal
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10 text-center text-xs text-muted-foreground">
        The new standard in talent acquisition.
      </footer>
    </div>
  );
}
