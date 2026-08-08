import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/routes/_app";
import { SectionCard } from "@/components/dashboard/primitives";
import { useDataset } from "@/hooks/use-dataset";
import { Sparkles, Calendar, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/employer/interviews")({
  head: () => ({ meta: [{ title: "Interviews · ATS Engine" }] }),
  component: Interviews,
});

function Interviews() {
  const { interviewQuestions, interviews: upcomingInterviews } = useDataset();
  const [role, setRole] = useState("Senior Product Designer");
  const [type, setType] = useState<"technical" | "behavioral" | "system">("technical");

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Interview management"
        title="Schedule & prepare"
        subtitle="AI-generated question sets tailored to the role. Manage calendar and invites."
        actions={
          <button
            onClick={() => toast.success("Interview invitation sent")}
            className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground hover:opacity-90"
          >
            <Plus className="size-3.5" /> Schedule interview
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <SectionCard title="Upcoming interviews" className="lg:col-span-2">
          <div className="divide-y divide-border">
            {upcomingInterviews.map((i) => (
              <div key={i.candidate + i.date} className="flex items-start gap-4 p-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                  <Calendar className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{i.candidate}</div>
                  <div className="text-xs text-muted-foreground">
                    {i.role} · {i.round}
                  </div>
                  <div className="mt-1 text-[10px] font-medium text-brand">
                    {i.date} · {i.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="AI question generator" className="lg:col-span-3">
          <div className="p-5">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/20"
              />
              <div className="flex rounded-md border border-border bg-surface p-0.5 text-xs">
                {(["technical", "behavioral", "system"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`rounded px-3 py-1 font-medium capitalize ${
                      type === t ? "bg-brand text-brand-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-lg border border-brand/20 bg-brand/5 p-3 text-xs">
              <Sparkles className="size-3.5 text-brand" />
              <span>
                Generated <strong>{interviewQuestions[type].length} {type} questions</strong> for{" "}
                <strong>{role}</strong>.
              </span>
            </div>

            <ol className="space-y-3">
              {interviewQuestions[type].map((q, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-lg border border-border bg-surface/40 p-4 text-sm"
                >
                  <div className="font-mono text-xs font-bold text-brand">
                    Q{String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1">{q}</div>
                </li>
              ))}
            </ol>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
