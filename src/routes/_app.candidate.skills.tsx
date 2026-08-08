import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/routes/_app";
import { SectionCard } from "@/components/dashboard/primitives";
import { useDataset } from "@/hooks/use-dataset";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { Check, Circle, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_app/candidate/skills")({
  head: () => ({ meta: [{ title: "Skill Roadmap · ATS Engine" }] }),
  component: Skills,
});

function Skills() {
  const { roadmap, skillRadar, learningResources } = useDataset();
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Skill gap analysis"
        title="Close the distance to your dream role"
        subtitle="We compared your profile against target roles and mapped a 4-week plan."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Skill radar (You vs target)" className="lg:col-span-2">
          <div className="h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillRadar}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="var(--brand)"
                  fill="var(--brand)"
                  fillOpacity={0.15}
                />
                <Radar
                  name="You"
                  dataKey="you"
                  stroke="var(--accent)"
                  fill="var(--accent)"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Gap summary">
          <div className="space-y-3 p-5 text-xs">
            {skillRadar.map((s) => {
              const gap = s.target - s.you;
              return (
                <div key={s.skill}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium">{s.skill}</span>
                    <span
                      className={`font-mono font-bold ${gap > 10 ? "text-amber-600" : gap > 0 ? "text-brand" : "text-accent"}`}
                    >
                      {gap > 0 ? `-${gap}` : "on target"}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                    <div
                      className={`h-full ${gap > 10 ? "bg-amber-500" : gap > 0 ? "bg-brand" : "bg-accent"}`}
                      style={{ width: `${(s.you / s.target) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="4-week personalized roadmap">
          <div className="space-y-4 p-5">
            {roadmap.map((r) => (
              <div key={r.week} className="flex gap-4">
                <div
                  className={`grid size-8 shrink-0 place-items-center rounded-full ${r.done ? "bg-accent text-accent-foreground" : "bg-surface text-muted-foreground ring-1 ring-border"}`}
                >
                  {r.done ? <Check className="size-4" /> : <Circle className="size-3" />}
                </div>
                <div className="flex-1 rounded-lg border border-border bg-surface/40 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{r.title}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {r.week}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{r.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recommended learning">
          <div className="divide-y divide-border">
            {learningResources.map((r) => (
              <a
                key={r.title}
                href={r.url || "#"}
                target={r.url ? "_blank" : undefined}
                rel="noreferrer noopener"
                className="flex items-center gap-4 p-4 hover:bg-surface/40"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                  <ExternalLink className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{r.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.provider} · {r.hours}h
                  </div>
                </div>
                <span className="rounded bg-surface px-2 py-0.5 text-[10px] font-medium ring-1 ring-border">
                  {r.skill}
                </span>
              </a>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
