import { useEffect, useState } from "react";
import { useMockActive } from "@/hooks/use-mock-active";
import { EMPTY_DATASET, MOCK_DATASET, type Dataset } from "@/lib/mock-dataset";
import {
  listJobs,
  listCandidates,
  listApplications,
  listJobMatches,
  listNotifications,
  getSkillRadar,
  getRoadmap,
  getAnalytics,
  listInterviews,
  getInterviewQuestions,
} from "@/lib/data.functions";

/**
 * Single source of truth for page data.
 *
 * - Mock overlay OFF (default): every array comes from Supabase through
 *   server functions in `src/lib/data.functions.ts`.
 * - Mock overlay ON: the typed sample dataset is returned instead, without
 *   touching the backend. AI features are unaffected either way.
 */
export function useDataset(): Dataset & { loading: boolean; mock: boolean } {
  const mock = useMockActive();
  const [live, setLive] = useState<Dataset>(EMPTY_DATASET);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mock) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [
          jobs,
          candidates,
          applications,
          jobMatches,
          notifications,
          skillRadar,
          roadmap,
          analytics,
          interviews,
          interviewQuestions,
        ] = await Promise.all([
          listJobs(),
          listCandidates(),
          listApplications(),
          listJobMatches(),
          listNotifications(),
          getSkillRadar(),
          getRoadmap(),
          getAnalytics(),
          listInterviews(),
          getInterviewQuestions(),
        ]);
        if (cancelled) return;
        setLive({
          ...EMPTY_DATASET,
          jobs,
          candidates,
          applications,
          jobMatches,
          notifications,
          skillRadar,
          roadmap,
          analyticsMetrics: analytics.metrics,
          funnel: analytics.funnel,
          trend: analytics.trend,
          interviews,
          interviewQuestions,
          // Real inbox entries are derived from the notifications table.
          inbox: notifications.map((n) => ({
            id: n.id,
            type: (["match", "message", "interview", "offer", "insight"] as const).includes(
              n.type as "match",
            )
              ? (n.type as "match")
              : "insight",
            title: n.title,
            desc: "",
            when: n.time,
            unread: true,
          })),
        });

      } catch {
        if (!cancelled) setLive(EMPTY_DATASET);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mock]);

  const data = mock ? MOCK_DATASET : live;
  return { ...data, loading, mock };
}
