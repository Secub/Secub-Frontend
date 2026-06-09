export type DashboardRole = "admin" | "vice" | "decano" | "director" | "docente";

export type MeasurementStatus = "pendiente" | "finalizado";

export interface DashboardScope {
  seccionalId?: string;
  facultadId?: string;
  programaIds?: string[];
  teacherId?: string;
}

export interface DashboardUser {
  id: string;
  nombre: string;
  cargo: string;
  role: DashboardRole;
  scope: DashboardScope;
}

export interface SeccionalOption {
  id: string;
  nombre: string;
}

export interface FacultadOption {
  id: string;
  nombre: string;
  seccionalId: string;
}

export interface ProgramaOption {
  id: string;
  nombre: string;
  facultadId: string;
  seccionalId: string;
}

export interface TeacherOption {
  id: string;
  nombre: string;
  email: string;
}

export interface CompetenceOption {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface LearningResultOption {
  id: string;
  code: string;
  name: string;
  description: string;
  competenceId: string;
}

export interface MeasurementCycle {
  id: string;
  name: string;
  period: string;
  status: MeasurementStatus;
  seccionalId: string;
  facultadId: string;
  programaId: string;
  planName: string;
  startDate: string;
  endDate: string;
}

export interface CourseMeasurement {
  id: string;
  code: string;
  name: string;
  cycleId: string;
  seccionalId: string;
  facultadId: string;
  programaId: string;
  teacherId: string;
  teacherName: string;
  competenceIds: string[];
  raIds: string[];
  totalRa: number;
  evaluatedRa: number;
}

export interface RaResultRecord {
  id: string;
  courseId: string;
  competenceId: string;
  raId: string;
  totalStudents: number;
  approvedStudents: number;
  notApprovedStudents: number;
  instrumentFile: string;
  evidenceFile: string;
  improvementPlanFile?: string;
}

export interface DashboardCatalogs {
  seccionales: SeccionalOption[];
  facultades: FacultadOption[];
  programas: ProgramaOption[];
  teachers: TeacherOption[];
  competences: CompetenceOption[];
  learningResults: LearningResultOption[];
}

export interface DashboardFiltersState {
  seccionalId: string;
  facultadId: string;
  programaId: string;
  cycleId: string;
  status: string;
  competenceId: string;
  teacherId: string;
}

export interface CycleSummary extends MeasurementCycle {
  progress: number;
  totalRa: number;
  evaluatedRa: number;
  totalCourses: number;
  pendingCourses: number;
  finishedCourses: number;
}

export interface CourseSummary extends CourseMeasurement {
  cycleName: string;
  cyclePeriod: string;
  progress: number;
  status: MeasurementStatus;
}

export interface RaResultSummary extends RaResultRecord {
  courseName: string;
  courseCode: string;
  teacherName: string;
  competenceCode: string;
  competenceName: string;
  raCode: string;
  raName: string;
  raDescription: string;
  fulfillment: number;
  status: "aprobado" | "no-aprobado";
}
