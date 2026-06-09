import { useEffect, useRef } from "react";

export function useMedicionRAAutoScroll(activeCompetenceId: string) {
  const competenceContentRef = useRef<HTMLDivElement | null>(null);
  const pendingAutoScrollCompetenceIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (pendingAutoScrollCompetenceIdRef.current !== activeCompetenceId) {
      return undefined;
    }

    if (typeof window === "undefined") {
      pendingAutoScrollCompetenceIdRef.current = null;
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      competenceContentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      pendingAutoScrollCompetenceIdRef.current = null;
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [activeCompetenceId]);

  return {
    competenceContentRef,
    pendingAutoScrollCompetenceIdRef,
  };
}
