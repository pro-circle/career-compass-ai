import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/routes/_app";
import { SectionCard, ScoreBar } from "@/components/dashboard/primitives";
import { useDataset } from "@/hooks/use-dataset";
import { Plus, Search, MoreHorizontal, X, Link2, Loader2, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { importJobFromUrl } from "@/lib/joblink.functions";
import { createJob } from "@/lib/apply.functions";

/** Vanity alias shown to recruiters, e.g. share.JOB-123.ats.com */
export function shareAlias(jobId: string) {
  return `share.${jobId}.ats.com`;
}

/** The real, working shareable link for a job. */
export function shareUrl(jobId: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/share/${jobId}`;
}

function ShareLink({ jobId, compact = false }: { jobId: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(shareUrl(jobId));
        setCopied(true);
        toast.success("Shareable link copied");
        setTimeout(() => setCopied(false), 1800);
      }}
      title={`Copy ${shareUrl(jobId)}`}
      className={`inline-flex items-center gap-1.5 rounded-md border border-border bg-surface font-mono text-[10px] text-foreground/80 hover:border-brand/40 hover:text-foreground ${
        compact ? "px-2 py-1" : "px-3 py-1.5 text-xs"
      }`}
    >
      {copied ? <Check className="size-3 text-accent" /> : <Copy className="size-3" />}
      {shareAlias(jobId)}
    </button>
  );
}

export const Route = createFileRoute("/_app/employer/jobs")({
  head: () => ({ meta: [{ title: "Jobs · ATS Engine" }] }),
  component: EmployerJobs,
});

function EmployerJobs() {
  const { jobs } = useDataset();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Open" | "Draft" | "Paused" | "Closed">("All");
  const [showNew, setShowNew] = useState(false);
  const [jobUrl, setJobUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState<{ id: string; title: string; company: string } | null>(null);
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    salary: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<{ id: string; title: string } | null>(null);

  async function handleCreate() {
    if (form.title.trim().length < 2) {
      toast.error("Add a role title first");
      return;
    }
    setSaving(true);
    try {
      const res = await createJob({
        data: {
          title: form.title.trim(),
          department: form.department.trim(),
          location: form.location.trim(),
          salary: form.salary.trim(),
          description: form.description.trim(),
          status: "Open",
        },
      });
      setCreated({ id: res.id, title: form.title.trim() });
      setForm({ title: "", department: "", location: "", salary: "", description: "" });
      setShowNew(false);
      toast.success(`${res.id} published — shareable link ready`);
      router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create requisition");
    } finally {
      setSaving(false);
    }
  }

  async function handleImport() {
    if (!jobUrl.trim()) return;
    setImporting(true);
    setImported(null);
    try {
      const res = await importJobFromUrl({ data: { url: jobUrl.trim() } });
      setImported({ id: res.id, title: res.job.title, company: res.job.company });
      toast.success(`Imported "${res.job.title}" from posting`);
      setJobUrl("");
      router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import job");
    } finally {
      setImporting(false);
    }
  }

  const filtered = jobs.filter(
    (j) =>
      (filter === "All" || j.status === filter) &&
      (j.title.toLowerCase().includes(query.toLowerCase()) ||
        j.department.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Manage listings"
        title="Job requisitions"
        subtitle="Post, edit, archive, and reopen roles. AI parses your JD automatically."
        actions={
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground hover:opacity-90"
          >
            <Plus className="size-3.5" /> New requisition
          </button>
        }
      />

      {created && (
        <div className="mb-6 rounded-xl border border-accent/30 bg-accent/5 p-5">
          <div className="mb-1 text-sm font-semibold">
            {created.title} is live · {created.id}
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Share this link anywhere — LinkedIn, email, your own site. Candidates apply
            through it and every application lands in this ATS.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <ShareLink jobId={created.id} />
            <span className="font-mono text-[10px] text-muted-foreground">
              {shareUrl(created.id)}
            </span>
          </div>
        </div>
      )}

      <SectionCard className="mb-6" title="Import from URL">
        <div className="p-5">
          <div className="mb-3 flex items-center gap-2 text-sm text-foreground/80">
            <Sparkles className="size-4 text-brand" />
            Paste a job posting URL — AI will fetch it, extract title, company, requirements, and preferences, then create a draft requisition.
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://company.com/careers/senior-engineer"
                className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <button
              onClick={handleImport}
              disabled={importing || !jobUrl.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50"
            >
              {importing ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              {importing ? "Parsing…" : "Parse & import"}
            </button>
          </div>
          {imported && (
            <div className="mt-3 rounded-md border border-accent/20 bg-accent/5 p-3 text-xs">
              <div className="font-semibold">Draft created: {imported.id}</div>
              <div className="text-muted-foreground">
                {imported.title} {imported.company ? `· ${imported.company}` : ""}
              </div>
            </div>
          )}
        </div>
      </SectionCard>


      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs…"
            className="w-64 rounded-md border border-border bg-card py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div className="flex rounded-md border border-border bg-card p-0.5 text-xs">
          {(["All", "Open", "Draft", "Paused", "Closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded px-3 py-1 font-medium ${
                filter === s ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <SectionCard>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/50 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Dept</th>
              <th className="px-5 py-3">Applicants</th>
              <th className="px-5 py-3">AI match</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Posted</th>
              <th className="px-5 py-3">Share link</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((j) => (
              <tr key={j.id} className="hover:bg-surface/40">
                <td className="px-5 py-4">
                  <div className="font-semibold">{j.title}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {j.id} · {j.type} · {j.salary}
                  </div>
                </td>
                <td className="px-5 py-4 text-xs">{j.department}</td>
                <td className="px-5 py-4 font-mono text-xs">
                  <span className="font-bold">{j.new}</span>
                  <span className="text-muted-foreground"> / {j.applicants}</span>
                </td>
                <td className="px-5 py-4">
                  <ScoreBar score={j.matchAvg} />
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${
                      j.status === "Open"
                        ? "bg-accent/10 text-accent ring-accent/20"
                        : j.status === "Paused"
                          ? "bg-amber-50 text-amber-700 ring-amber-200"
                          : j.status === "Draft"
                            ? "bg-surface text-foreground/70 ring-border"
                            : "bg-muted text-muted-foreground ring-border"
                    }`}
                  >
                    {j.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-muted-foreground">{j.postedAgo}</td>
                <td className="px-5 py-4">
                  <ShareLink jobId={j.id} compact />
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => toast.success(`Opened actions for ${j.title}`)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-xs text-muted-foreground">
                  No jobs match those filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </SectionCard>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Create new requisition</h3>
              <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Role title (e.g. Senior Engineer)"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/20"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Department"
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/20"
                />
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Location"
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <input
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="Compensation range (e.g. $150k – $185k)"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/20"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Job description, requirements, and nice-to-haves."
                rows={5}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowNew(false)}
                className="rounded-md border border-border px-3 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
              >
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                Publish & get share link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
