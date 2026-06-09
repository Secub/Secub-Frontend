import { useState } from "react";
import { mockBackend } from "../../../../services/mockBackend";
import type { DashboardUser, EnrichedCycle } from "../dashboard.types";

interface DashboardImprovementPlanRecord {
  id: string;
  cicloId: string;
  programaId: string;
  planId: string;
  directorId: string;
  userId: string;
  descripcion: string;
  fechaCreacion: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useDashboardImprovementPlan({
  isDirector,
  user,
}: {
  isDirector: boolean;
  user: DashboardUser;
}) {
  const [improvementCycle, setImprovementCycle] = useState<EnrichedCycle | null>(null);
  const [improvementDraft, setImprovementDraft] = useState("");
  const [improvementError, setImprovementError] = useState("");

  const handleImprovementPlan = (cycle: EnrichedCycle) => {
    if (!isDirector || cycle.progress < 100) return;

    const existingPlan = mockBackend.getById<DashboardImprovementPlanRecord>(
      "planesMejora",
      `plan-mejora-${cycle.id}`,
    );

    setImprovementCycle(cycle);
    setImprovementDraft(existingPlan?.descripcion ?? "");
    setImprovementError("");
  };

  const handleCloseImprovementPlan = () => {
    setImprovementCycle(null);
    setImprovementDraft("");
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

    const now = new Date().toISOString();
    const existingPlan = mockBackend.getById<DashboardImprovementPlanRecord>(
      "planesMejora",
      `plan-mejora-${improvementCycle.id}`,
    );

    // TODO backend: reemplazar este registro demo por el CRUD real de planes de mejora
    // conectado al ciclo, programa, plan y director institucional autenticado.
    mockBackend.upsert<DashboardImprovementPlanRecord>(
      "planesMejora",
      {
        id: `plan-mejora-${improvementCycle.id}`,
        cicloId: improvementCycle.id,
        programaId: improvementCycle.programaId,
        planId: improvementCycle.planId,
        directorId: user.id,
        userId: user.id,
        descripcion: description,
        fechaCreacion: existingPlan?.fechaCreacion ?? now,
        createdAt: existingPlan?.createdAt ?? now,
        updatedAt: now,
      },
      user,
    );

    handleCloseImprovementPlan();
  };

  return {
    improvementCycle,
    improvementDraft,
    improvementError,
    setImprovementDraft,
    setImprovementError,
    handleImprovementPlan,
    handleCloseImprovementPlan,
    handleSaveImprovementPlan,
  };
}
