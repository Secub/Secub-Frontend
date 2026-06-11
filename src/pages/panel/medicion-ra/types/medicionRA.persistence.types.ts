import type {
  EvaluationMatrix,
  EvidenceState,
  ImprovementPlanState,
  InstrumentByRa,
} from "../medicion-ra.types";

export interface MedicionRaDemoState {
  id: string;
  cicloId?: string;
  asignacionRaId?: string;
  asignacionRaIds?: string[];
  selectedCourseId: string;
  activeCompetenceId: string;
  evaluationsByCourse: Record<string, EvaluationMatrix>;
  instrumentsByCourse: Record<string, InstrumentByRa>;
  evidenceByCompetence: Record<string, EvidenceState>;
  improvementByCompetence: Record<string, ImprovementPlanState>;
  completedCompetenceIds: string[];
  isEvaluationLocked: boolean;
  completed: boolean;
  userId?: string;
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AsignacionRaDemoRecord {
  id: string;
  cicloId?: string;
  cursoId?: string;
  cursoIds?: string[];
  competenciaRaId?: string;
  competenciaRaIds?: string[];
  resultadoAprendizajeId?: string;
  resultadoAprendizajeIds?: string[];
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
  docenteId?: string;
  docenteNombre?: string;
  docenteEmail?: string;
}

export interface CicloDemoRecord {
  id: string;
  nombre?: string;
  periodo?: string;
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
}

export interface CompetenciaDemoRecord {
  id: string;
  nombre?: string;
  descripcion?: string;
  resultadosAprendizaje?: Array<{
    id: string;
    numero?: number;
    descripcion?: string;
  }>;
}
