import type { EvidenceState, ImprovementPlanState } from "../medicion-ra.types";

export const MEDICION_RA_DEMO_STATE_PREFIX = "medicion-ra-demo-state";

export const LOCKED_TOOLTIP =
  "Esta información ya fue guardada y bloqueada. No puedes modificarla después de finalizar la evaluación.";

export const EMPTY_EVIDENCE: EvidenceState = {
  fileName: "",
  link: "",
};

export const EMPTY_IMPROVEMENT_PLAN: ImprovementPlanState = {
  analysis: "",
  actions: "",
};
