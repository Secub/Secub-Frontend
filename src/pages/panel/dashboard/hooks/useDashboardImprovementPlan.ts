import { useState } from "react";
import { getCycleImprovementPlan, saveCycleImprovementPlan } from "../../../../services/cycles";
import type { EnrichedCycle } from "../dashboard.types";

export function useDashboardImprovementPlan({
  isDirector,
}: {
  isDirector: boolean;
}) {
  const [improvementCycle, setImprovementCycle] = useState<EnrichedCycle | null>(null);
  const [improvementDraft, setImprovementDraft] = useState("");
  const [improvementTitle, setImprovementTitle] = useState("");
  const [improvementError, setImprovementError] = useState("");

  const handleImprovementPlan = (cycle: EnrichedCycle) => {
    if (!isDirector || cycle.progress < 100) return;

    setImprovementCycle(cycle);
    setImprovementDraft("");
    setImprovementTitle("");
    setImprovementError("");
    void getCycleImprovementPlan(cycle.id)
      .then((plan) => {
        setImprovementDraft(plan?.description ?? "");
        setImprovementTitle(plan?.title ?? "");
      })
      .catch((error: unknown) => setImprovementError(error instanceof Error ? error.message : "No fue posible cargar el plan de mejora."));
  };

  const handleCloseImprovementPlan = () => {
    setImprovementCycle(null);
    setImprovementDraft("");
    setImprovementTitle("");
    setImprovementError("");
  };

  const handleSaveImprovementPlan = () => {
    if (!improvementCycle || !isDirector) return;

    const description = improvementDraft.trim();

    if (!description) {
      setImprovementError("Describe el plan de mejora general del ciclo.");
      window.requestAnimationFrame(() => {
        document
          .querySelector('[data-validation-field="dashboard-improvement-plan"]')
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    void saveCycleImprovementPlan(improvementCycle.id, {
      title: improvementTitle.trim(),
      description,
    })
      .then(handleCloseImprovementPlan)
      .catch((error: unknown) => setImprovementError(error instanceof Error ? error.message : "No fue posible guardar el plan de mejora."));
  };

  return {
    improvementCycle,
    improvementDraft,
    improvementTitle,
    improvementError,
    setImprovementDraft,
    setImprovementError,
    setImprovementTitle,
    handleImprovementPlan,
    handleCloseImprovementPlan,
    handleSaveImprovementPlan,
  };
}
