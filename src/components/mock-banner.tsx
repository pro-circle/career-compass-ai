import { FlaskConical, X } from "lucide-react";
import { toast } from "sonner";
import { disableMock } from "@/lib/mock-overlay";
import { useMockActive } from "@/hooks/use-mock-active";

/** Sticky bar shown at the top of every authenticated page while the mock overlay is on. */
export function MockBanner() {
  const on = useMockActive();
  if (!on) return null;
  return (
    <div className="sticky top-16 z-30 flex items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/10 px-6 py-2 text-xs">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
        <FlaskConical className="size-3.5" />
        <span className="font-semibold">Mock data active</span>
        <span className="text-amber-700/80 dark:text-amber-200/70">
          — pages show sample jobs / candidates / applications. AI stays live.
        </span>
      </div>
      <button
        onClick={() => {
          disableMock();
          toast.success("Mock data cleared");
        }}
        className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-900 hover:bg-amber-500/20 dark:text-amber-100"
      >
        <X className="size-3" /> Clear Mock Data
      </button>
    </div>
  );
}
