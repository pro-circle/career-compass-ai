import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/routes/_app";
import { Avatar, ScoreBar, SectionCard, StatTile, StatusPill } from "@/components/dashboard/primitives";
import { useDataset } from "@/hooks/use-dataset";
import { ArrowRight, Plus, Sparkles, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_app/employer/")({
  head: () => ({ meta: [{ title: "Employer Dashboard · ATS Engine" }] }),
  component: EmployerDashboard,
});

function EmployerDashboard() {
  const { analyticsMetrics, candidates, jobs, interviews: upcomingInterviews } = useDataset();
  const openJobs = jobs.filter((j) => j.status === "Open");
  const topCandidates = [...candidates].sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Employer portal"
        title="Active pipeline"
        subtitle={`Tracking ${openJobs.length} open roles across ${new Set(openJobs.map((j) => j.department)).size} departments.`}
        actions={
          <>
            <Link
              to="/employer/jobs"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-surface"
            >
              View all jobs
            </Link>
            <button className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground hover:opacity-90">
              <Plus className="size-3.5" /> New requisition
            </button>
          </>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analyticsMetrics.map((m) => (
          <StatTile key={m.label} {...m} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            title="Priority roles"
            action={
              <Link to="/employer/jobs" className="text-xs font-medium text-brand hover:underline">
                View all
              </Link>
            }
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3 text-center">Applicants</th>
                  <th className="px-5 py-3">AI match avg</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {openJobs.slice(0, 4).map((job) => (
                  <tr key={job.id} className="group transition-colors hover:bg-surface/50">
                    <td className="px-5 py-4">
                      <div className="font-semibold">{job.title}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {job.department} · {job.location}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center font-mono text-xs">
                      <span className="font-bold text-brand">{job.new}</span>
                      <span className="text-muted-foreground"> / {job.applicants}</span>
                    </td>
                    <td className="px-5 py-4">
                      <ScoreBar score={job.matchAvg} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to="/employer/candidates"
                        className="text-xs font-medium text-muted-foreground group-hover:text-brand"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          <SectionCard
            title="Top ranked candidates (all roles)"
            action={
              <Link to="/employer/candidates" className="text-xs font-medium text-brand hover:underline">
                Compare top 3
              </Link>
            }
          >
            <div className="divide-y divide-border">
              {topCandidates.map((c) => (
                <div key={c.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-surface/30">
                  <Avatar initials={c.initials} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{c.name}</span>
                      <StatusPill status={c.status} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.title} · {c.company} · {c.years}y
                    </div>
                  </div>
                  <div className="hidden gap-1.5 md:flex">
                    {c.skills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded bg-surface px-2 py-0.5 text-[10px] font-medium text-foreground/70 ring-1 ring-border"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Match</div>
                    <div className={`font-mono text-sm font-bold ${c.matchScore >= 95 ? "text-accent" : "text-brand"}`}>
                      {c.matchScore}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-foreground p-6 text-background shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-background/60">
                AI insight
              </h4>
              <Sparkles className="size-4 text-background/60" />
            </div>
            <p className="text-sm leading-relaxed">
              <strong className="text-accent">Sarah Chen</strong> exceeds the design pool
              average by <strong>24%</strong> on systems-thinking signals. Recommend
              scheduling a final panel this week.
            </p>
            <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
              <TrendingUp className="size-4 text-accent" />
              <span className="text-xs text-background/70">
                Pipeline health <strong className="text-background">strong</strong> — 14 new
                elite matches this week.
              </span>
            </div>
          </div>

          <SectionCard title="Upcoming interviews">
            <div className="divide-y divide-border">
              {upcomingInterviews.slice(0, 4).map((i) => (
                <div key={i.candidate} className="flex items-start gap-4 p-4">
                  <div className="text-center">
                    <div className="text-sm font-bold">{i.date.split(" ")[1]}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                      {i.date.split(" ")[0]}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold">{i.candidate}</div>
                    <div className="truncate text-[10px] text-muted-foreground">
                      {i.round} · {i.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/employer/interviews"
              className="flex items-center justify-center gap-1 border-t border-border p-3 text-xs font-medium text-brand hover:bg-surface"
            >
              Open scheduler <ArrowRight className="size-3" />
            </Link>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
