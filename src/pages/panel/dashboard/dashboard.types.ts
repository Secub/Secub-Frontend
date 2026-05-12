export type DashboardRole = "admin" | "vice" | "decano" | "director" | "docente";

export type CycleStatus = "pendiente" | "finalizado";
export type CourseStatus = "pendiente" | "finalizado";
export type RaStatus = "aprobado" | "no-aprobado";

export interface DashboardUserScope {
  seccionalId?: string;
  facultadId?: string;
  programaIds?: string[];
  docenteId?: string;
}

export interface DashboardUser {
  id: string;
  name: string;
  role: DashboardRole;
  label: string;
  scope: DashboardUserScope;
}

export interface SeccionalCatalog {
  id: string;
  name: string;
}

export interface FacultadCatalog {
  id: string;
  name: string;
  seccionalId: string;
}

export interface ProgramaCatalog {
  id: string;
  name: string;
  facultadId: string;
  seccionalId: string;
}

export interface PlanCatalog {
  id: string;
  name: string;
  programaId: string;
}

export interface TeacherCatalog {
  id: string;
  name: string;
  email: string;
}

export interface LearningResultCatalog {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface CompetenceCatalog {
  id: string;
  code: string;
  name: string;
  description: string;
  learningResults: LearningResultCatalog[];
}

export interface MeasurementCycle {
  id: string;
  name: string;
  seccionalId: string;
  facultadId: string;
  programaId: string;
  planId: string;
  period: string;
  startDate: string;
  endDate: string;
  courseIds: string[];
}

export interface CourseRaResult {
  raId: string;
  totalStudents: number;
  approvedStudents: number;
  notApprovedStudents: number;
  instrumentFile: string;
  evidenceFile: string;
  improvementPlanFile?: string;
  improvementPlanSummary?: string;
}

export interface CourseMeasurement {
  id: string;
  code: string;
  name: string;
  cycleId: string;
  seccionalId: string;
  facultadId: string;
  programaId: string;
  planId: string;
  teacherId: string;
  competenceIds: string[];
  totalRa: number;
  evaluatedRa: number;
  results: CourseRaResult[];
}

export interface DashboardCatalogs {
  seccionales: SeccionalCatalog[];
  facultades: FacultadCatalog[];
  programas: ProgramaCatalog[];
  planes: PlanCatalog[];
  teachers: TeacherCatalog[];
  competences: CompetenceCatalog[];
}

export interface DashboardFiltersState {
  seccionalId: string;
  facultadId: string;
  programaId: string;
  planId: string;
  cycleId: string;
  status: string;
  competenceId: string;
  teacherId: string;
}

export interface EnrichedCycle extends MeasurementCycle {
  seccionalName: string;
  facultadName: string;
  programaName: string;
  planName: string;
  status: CycleStatus;
  progress: number;
  totalRa: number;
  evaluatedRa: number;
  totalCourses: number;
  pendingCourses: number;
  completedCourses: number;
}

export interface EnrichedCourse extends CourseMeasurement {
  cycleName: string;
  period: string;
  seccionalName: string;
  facultadName: string;
  programaName: string;
  planName: string;
  teacherName: string;
  teacherEmail: string;
  competences: CompetenceCatalog[];
  status: CourseStatus;
  pendingRa: number;
  progress: number;
}

export interface EnrichedRaResult {
  key: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  teacherName: string;
  competenceId: string;
  competenceCode: string;
  competenceName: string;
  raId: string;
  raCode: string;
  raName: string;
  raDescription: string;
  totalStudents: number;
  approvedStudents: number;
  notApprovedStudents: number;
  compliance: number;
  status: RaStatus;
  reachedTarget: boolean;
  instrumentFile: string;
  evidenceFile: string;
  improvementPlanFile?: string;
  improvementPlanSummary?: string;
}

export interface DashboardData {
  catalogs: DashboardCatalogs;
  cycles: MeasurementCycle[];
  courses: CourseMeasurement[];
}
