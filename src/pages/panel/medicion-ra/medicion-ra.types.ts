export type PerformanceLevel =
  | "sobresaliente"
  | "satisfactorio"
  | "en-desarrollo"
  | "deficiente"
  | "";

export type RequiredPerformanceLevel = Exclude<PerformanceLevel, "">;

export interface PerformanceLevelOption {
  value: RequiredPerformanceLevel;
  label: string;
  descriptor: string;
  gradeRange: string;
  tone: "success" | "info" | "warning" | "danger";
}

export interface LearningResult {
  id: string;
  code: string;
  title: string;
  description: string;
}

export interface Competence {
  id: string;
  code: string;
  title: string;
  description: string;
  learningResults: LearningResult[];
}

export interface Student {
  id: string;
  code: string;
  name: string;
  email: string;
}

export interface CourseRecord {
  id: string;
  name: string;
  code: string;
  group: string;
  credits: number;
  period: string;
  program: string;
  studyPlan: string;
  measurementCycle: string;
  teacher: string;
  competences: Competence[];
  students: Student[];
}

export type EvaluationMatrix = Record<
  string,
  Record<string, PerformanceLevel>
>;

export interface InstrumentState {
  fileName: string;
  description: string;
}

export type InstrumentByRa = Record<string, InstrumentState>;

export interface EvidenceState {
  fileName: string;
  link: string;
}

export interface ImprovementPlanState {
  analysis: string;
  actions: string;
}

export interface LevelCount {
  level: RequiredPerformanceLevel;
  label: string;
  count: number;
  percentage: number;
}

export interface RaResultSummary {
  raId: string;
  raCode: string;
  raTitle: string;
  competenceCode: string;
  achievedCount: number;
  totalStudents: number;
  approvalPercentage: number;
  targetPercentage: number;
  reachedTarget: boolean;
  levelCounts: LevelCount[];
}

export interface ValidationFeedback {
  type: "success" | "error" | "info";
  title: string;
  message: string;
  details?: string[];
}
