import { useEffect, useState } from "react";
import { isMockActive } from "@/lib/mock-overlay";

/** React hook that stays in sync with the mock-overlay localStorage flag. */
export function useMockActive() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(isMockActive());
    const h = () => setOn(isMockActive());
    window.addEventListener("ats-mock-change", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("ats-mock-change", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return on;
}
