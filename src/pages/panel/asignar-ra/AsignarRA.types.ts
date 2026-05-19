import type { RefObject } from "react";
import type { SelectOption } from "../../../components/ui/Select";
import type { CentralMockUser } from "../../../services/auth/mockUser";
import type { CursoSintesis } from "../ciclo/ciclo.types";

export type BadgeVariant = "neutral" | "info" | "success" | "warning" | "danger" | "accent";

export interface CicloDemoRecord {
  id: string;
  nombre?: string;
  periodo?: string;
  mapeoCompetenciasId?: string;
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
  cursoIds?: string[];
  estado?: string;
}

export interface ResultadoAprendizajeDemoRecord {
  id?: string;
  numero?: number;
  descripcion?: string;
}

export interface CompetenciaRaDemoRecord {
  id: string;
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
  nombre?: string;
  descripcion?: string;
  resultadosAprendizaje?: ResultadoAprendizajeDemoRecord[];
}

export interface MapeoDemoRecord {
  id: string;
  programaId?: string;
  planId?: string;
  cursosMapeados?: Array<{
    cursoId: string;
    competenciaRaId?: string;
    nivel?: "I" | "R" | "A" | "NA";
  }>;
}

export interface AsignacionRaRecord {
  id: string;
  cicloId?: string;
  periodoId?: string;
  cursoId?: string;
  cursoIds: string[];
  competenciaRaId?: string;
  competenciaRaIds?: string[];
  resultadoAprendizajeId?: string;
  resultadoAprendizajeIds: string[];
  estado: "activo" | "activa" | "incompleta";
  estadoMedicion?: "pendiente" | "medido";
  userId?: string;
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
  docenteNombre?: string;
  docenteId?: string;
  docenteEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicionRaRecord {
  id: string;
  cicloId?: string;
  asignacionRaId?: string;
  asignacionRaIds?: string[];
  selectedCourseId?: string;
  completed?: boolean;
  isEvaluationLocked?: boolean;
}

export type DraftSelections = Record<string, string[]>;

export interface FilterState {
  selectedSeccionalId: string;
  selectedFacultadId: string;
  selectedProgramId: string;
  selectedPlanId: string;
  selectedCycleId: string;
  courseFilterId: string;
  courseSearchTerm: string;
}

export interface FilterOptions {
  seccionalOptions: SelectOption[];
  facultadOptions: SelectOption[];
  programOptions: SelectOption[];
  planOptions: SelectOption[];
  cycleOptions: SelectOption[];
  courseOptions: SelectOption[];
}

export interface FilterLocks {
  isSeccionalLocked: boolean;
  isFacultadLocked: boolean;
  isProgramLocked: boolean;
  isPlanLocked: boolean;
  showSeccionalFilter: boolean;
  showFacultadFilter: boolean;
}

export interface SummaryMetrics {
  totalCourses: number;
  assignedCourses: number;
  pendingCourses: number;
  totalAssignedRa: number;
}

export interface CourseAssignmentStatus {
  label: "Pendiente" | "Medido";
  variant: Extract<BadgeVariant, "warning" | "success">;
}

export interface AsignarRARefs {
  filtersRef: RefObject<HTMLDivElement | null>;
  coursesRef: RefObject<HTMLDivElement | null>;
  assignmentPanelRef: RefObject<HTMLDivElement | null>;
}

export interface AsignarRAAccess {
  currentUser: CentralMockUser;
  canRead: boolean;
  canManage: boolean;
  canDelete: boolean;
  isStepLocked: boolean;
}

export interface AsignarRACourseRow {
  course: CursoSintesis;
  assignments: AsignacionRaRecord[];
  status: CourseAssignmentStatus;
  assignedCount: number;
  competenceCount: number;
  isSelected: boolean;
  actionLabel: string;
}
