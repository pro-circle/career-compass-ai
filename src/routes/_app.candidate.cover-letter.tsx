import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/routes/_app";
import { SectionCard } from "@/components/dashboard/primitives";
import { Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/candidate/cover-letter")({
  head: () => ({ meta: [{ title: "Cover Letter · ATS Engine" }] }),
  component: CoverLetter,
});


function CoverLetter() {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [tone, setTone] = useState<"confident" | "warm" | "direct">("confident");
  const [content, setContent] = useState("");

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="AI writing"
        title="Cover letter generator"
        subtitle="Personalized to each role — grounded in your resume and portfolio."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Prompt" className="lg:col-span-1">
          <div className="space-y-3 p-5">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Role
              </label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Company
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Tone
              </label>
              <div className="flex rounded-md border border-border bg-surface p-0.5 text-xs">
                {(["confident", "warm", "direct"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`flex-1 rounded px-2 py-1 font-medium capitalize ${
                      tone === t ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                toast.success("Cover letter regenerated");
                setContent(SAMPLE.replace("Linear", company).replace("Senior Product Designer", role));
              }}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent py-2.5 text-xs font-semibold text-accent-foreground"
            >
              <Sparkles className="size-3.5" /> Generate with AI
            </button>
          </div>
        </SectionCard>

        <SectionCard
          title="Generated letter"
          className="lg:col-span-2"
          action={
            <button
              onClick={() => {
                navigator.clipboard?.writeText(content);
                toast.success("Copied to clipboard");
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              <Copy className="size-3" /> Copy
            </button>
          }
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={22}
            className="w-full resize-none border-0 bg-transparent p-6 font-sans text-sm leading-relaxed outline-none"
          />
        </SectionCard>
      </div>
    </div>
  );
}
