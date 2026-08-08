import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/routes/_app";
import { SectionCard, StatTile } from "@/components/dashboard/primitives";
import { useDataset } from "@/hooks/use-dataset";
import { ArrowRight, Bell, Mic, Sparkles, Target, Wand2 } from "lucide-react";

export const Route = createFileRoute("/_app/candidate/")({
  head: () => ({ meta: [{ title: "Candidate Overview · ATS Engine" }] }),
  component: CandidateHome,
});

function CandidateHome() {
  const { applications, jobMatches, notifications, roadmap } = useDataset();
  const activeApps = applications.filter((a) => a.stage !== "Rejected");
  const nextInterview = applications.find((a) => a.nextStep);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Candidate portal"
        title="Welcome back, Jordan"
        subtitle="Your readiness is trending up. Here's what to focus on this week."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="ATS resume score" value="94" delta="+6" positive />
        <StatTile label="Active applications" value={String(activeApps.length)} delta="+2" positive />
        <StatTile label="Interview readiness" value="82%" delta="+11%" positive />
        <StatTile label="New matches" value="5" delta="+3" positive />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Top matches for you" action={<Link to="/candidate/jobs" className="text-xs font-medium text-accent hover:underline">See all matches</Link>}>
            <div className="divide-y divide-border">
              {jobMatches.slice(0, 3).map((m) => (
                <div key={m.id} className="flex items-center gap-4 p-4">
                  <div className="grid size-11 place-items-center rounded-lg bg-surface font-display text-sm font-bold">
                    {m.logo}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{m.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.company} · {m.location} · {m.salary}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Match</div>
                    <div className="font-mono text-sm font-bold text-accent">{m.matchScore}%</div>
                  </div>
                  <button className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Your career roadmap" action={<Link to="/candidate/skills" className="text-xs font-medium text-accent hover:underline">Open roadmap</Link>}>
            <div className="space-y-3 p-5">
              {roadmap.map((r) => (
                <div key={r.week} className="flex gap-4">
                  <div className={`mt-1 size-4 shrink-0 rounded-full ring-4 ${r.done ? "bg-accent ring-accent/20" : "bg-surface ring-border"}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{r.title}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{r.week}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{r.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-foreground p-6 text-background">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-background/60">Next milestone</h4>
              <Sparkles className="size-4 text-accent" />
            </div>
            <div className="mb-1 text-sm font-bold">{nextInterview?.nextStep ?? "AI Mock Interview"}</div>
            <p className="text-xs text-background/70">
              Complete a systems-design mock to unlock the "Elite Applicant" badge on your public profile.
            </p>
            <Link
              to="/candidate/interview"
              className="mt-5 inline-flex items-center gap-1 rounded-md bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground hover:opacity-90"
            >
              <Mic className="size-3.5" /> Start mock
            </Link>
          </div>

          <SectionCard title="Notifications">
            <div className="divide-y divide-border">
              {notifications.slice(0, 4).map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-4">
                  <Bell className="mt-0.5 size-4 text-brand" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium">{n.title}</div>
                    <div className="text-[10px] text-muted-foreground">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/candidate/resume" className="rounded-xl border border-border bg-card p-4 hover:border-accent/40">
              <Wand2 className="size-4 text-accent" />
              <div className="mt-2 text-xs font-bold">Optimize resume</div>
              <div className="text-[10px] text-muted-foreground">Improve ATS score</div>
            </Link>
            <Link to="/candidate/skills" className="rounded-xl border border-border bg-card p-4 hover:border-accent/40">
              <Target className="size-4 text-accent" />
              <div className="mt-2 text-xs font-bold">Skill gap</div>
              <div className="text-[10px] text-muted-foreground">See what's missing</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
