import type { EvidenceState, ImprovementPlanState, PerformanceLevelOption } from "../medicion-ra.types";

export const MEASUREMENT_STATE_PREFIX = "medicion-ra-state";
export const TARGET_PERCENTAGE = 70;
export const ACCEPTED_FILE_FORMATS = ".doc,.docx,.pdf,.png,.jpg,.jpeg";

export const performanceLevels: PerformanceLevelOption[] = [
  { value: "sobresaliente", label: "Sobresaliente", descriptor: "Demuestra un dominio excepcional del resultado de aprendizaje y supera lo esperado.", gradeRange: "Equivale a una nota entre 4.5 y 5.0", tone: "success" },
  { value: "satisfactorio", label: "Satisfactorio", descriptor: "Cumple adecuadamente con el resultado de aprendizaje establecido para el curso.", gradeRange: "Equivale a una nota entre 4.0 y 4.4", tone: "info" },
  { value: "en-desarrollo", label: "En desarrollo", descriptor: "Está avanzando en el resultado de aprendizaje y requiere fortalecimiento puntual.", gradeRange: "Equivale a una nota entre 3.0 y 3.9", tone: "warning" },
  { value: "deficiente", label: "Deficiente", descriptor: "No alcanza los niveles mínimos esperados para el resultado de aprendizaje.", gradeRange: "Equivale a una nota inferior a 3.0", tone: "danger" },
];

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
