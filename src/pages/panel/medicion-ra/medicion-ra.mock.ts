import type {
  CourseRecord,
  EvaluationMatrix,
  InstrumentByRa,
  PerformanceLevelOption,
} from "./medicion-ra.types";

export const TARGET_PERCENTAGE = 70;
export const ACCEPTED_FILE_FORMATS = ".doc,.docx,.pdf,.png,.jpg,.jpeg";

export const performanceLevels: PerformanceLevelOption[] = [
  {
    value: "sobresaliente",
    label: "Sobresaliente",
    descriptor: "Demuestra un dominio excepcional del resultado de aprendizaje y supera lo esperado.",
    gradeRange: "Equivale a una nota entre 4.5 y 5.0",
    tone: "success",
  },
  {
    value: "satisfactorio",
    label: "Satisfactorio",
    descriptor: "Cumple adecuadamente con el resultado de aprendizaje establecido para el curso.",
    gradeRange: "Equivale a una nota entre 4.0 y 4.4",
    tone: "info",
  },
  {
    value: "en-desarrollo",
    label: "En desarrollo",
    descriptor: "Está avanzando en el resultado de aprendizaje y requiere fortalecimiento puntual.",
    gradeRange: "Equivale a una nota entre 3.0 y 3.9",
    tone: "warning",
  },
  {
    value: "deficiente",
    label: "Deficiente",
    descriptor: "No alcanza los niveles mínimos esperados para el resultado de aprendizaje.",
    gradeRange: "Equivale a una nota inferior a 3.0",
    tone: "danger",
  },
];

/** Datos académicos temporales desactivados hasta definir una única semilla controlada. */
export const mockCourses: CourseRecord[] = [];
export const mockInitialEvaluations: Record<string, EvaluationMatrix> = {};
export const mockInitialInstruments: Record<string, InstrumentByRa> = {};
