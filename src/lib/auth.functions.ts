import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const loginInput = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  role: z.enum(["employer", "candidate"]),
});

export const login = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => loginInput.parse(data))
  .handler(async ({ data }) => {
    const {
      DEMO_USERNAME,
      DEMO_PASSWORD,
      DEMO_EMPLOYER_ID,
      DEMO_CANDIDATE_ID,
      getAppSession,
    } = await import("@/lib/session.server");

    if (data.username !== DEMO_USERNAME || data.password !== DEMO_PASSWORD) {
      return { ok: false as const, error: "Invalid credentials." };
    }

    const userId =
      data.role === "employer" ? DEMO_EMPLOYER_ID : DEMO_CANDIDATE_ID;

    // Look up onboarded flag if candidate.
    let onboarded = data.role === "employer";
    if (data.role === "candidate") {
      try {
        const { getSupabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const admin = getSupabaseAdmin();
        if (admin) {
          const { data: row } = await admin
            .from("profiles")
            .select("onboarded")
            .eq("id", userId)
            .maybeSingle();
          onboarded = !!row?.onboarded;
        }
      } catch {
        // ignore; treat as not onboarded
      }
    }

    const session = await getAppSession();
    await session.update({
      userId,
      username: data.username,
      role: data.role,
      onboarded,
    });
    return { ok: true as const, role: data.role, onboarded };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const { getAppSession } = await import("@/lib/session.server");
  const session = await getAppSession();
  await session.clear();
  return { ok: true as const };
});

export const getCurrentSession = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const { getAppSession } = await import("@/lib/session.server");
      const session = await getAppSession();
      return session.data;
    } catch (error) {
      console.error("[auth] failed to read session", error);
      return {} as Record<string, never>;
    }
  },
);


export const markOnboarded = createServerFn({ method: "POST" }).handler(
  async () => {
    const { getAppSession } = await import("@/lib/session.server");
    const session = await getAppSession();
    await session.update({ ...session.data, onboarded: true });
    return { ok: true as const };
  },
);
