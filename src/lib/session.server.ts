import { useSession } from "@tanstack/react-start/server";

export type AppRole = "employer" | "candidate";

export type AppSession = {
  userId?: string;
  username?: string;
  role?: AppRole;
  onboarded?: boolean;
};

// Deterministic UUIDs for the two demo accounts (stable across restarts).
export const DEMO_EMPLOYER_ID = "11111111-1111-1111-1111-111111111111";
export const DEMO_CANDIDATE_ID = "22222222-2222-2222-2222-222222222222";

export const DEMO_USERNAME = "user123";
export const DEMO_PASSWORD = "1234";

// Fallback keeps dev/preview working when SESSION_SECRET isn't injected yet.
// Cookies are still encrypted; set SESSION_SECRET in production for stability.
const FALLBACK_SESSION_SECRET =
  "ats-engine-dev-session-secret-please-set-SESSION_SECRET-env-0001";

export function sessionConfig() {
  const env = process.env.SESSION_SECRET;
  const password = env && env.length >= 32 ? env : FALLBACK_SESSION_SECRET;
  if (password === FALLBACK_SESSION_SECRET) {
    console.warn(
      "[session] SESSION_SECRET missing or too short — using dev fallback.",
    );
  }
  return {
    password,
    name: "ats-engine-session",
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: true,
      path: "/",
    },
  };
}


export async function getAppSession() {
  return useSession<AppSession>(sessionConfig());
}
