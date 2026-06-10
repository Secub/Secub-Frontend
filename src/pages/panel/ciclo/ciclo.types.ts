export type CicloRole = "admin" | "vice" | "decano" | "director" | "docente";

export type ProgramaEstado = "activo" | "inactivo";
export type CicloEstado = "borrador" | "activo" | "finalizado" | "pendiente";
export type NucleoCurso = "Fundamentación" | "Profesionalización" | "Síntesis";
export type NivelCompromiso = "I" | "R" | "A" | "";

export interface UserScope {
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  academicProgramId?: string;
  planId?: string;
}

export interface CurrentUser {
  id: string;
  nombre: string;
  email?: string;
  cargo: string;
  role: CicloRole;
  scope: UserScope;
}

export interface Seccional {
  id: string;
  nombre: string;
}

export interface Facultad {
  id: string;
  nombre: string;
  seccionalId: string;
}

export interface ProgramaAcademico {
  id: string;
  nombre: string;
  facultadId: string;
  seccionalId: string;
  estado: ProgramaEstado;
}

export interface PlanEstudio {
  id: string;
  nombre: string;
  programaId: string;
  estado: ProgramaEstado;
}

export interface CursoSintesis {
  id: string;
  nombre: string;
  codigo: string;
  creditos: number;
  semestre: number;
  nucleo: NucleoCurso;
  programaId: string;
  planId: string;
  docente: string;
  tipoVinculacion: string;
  competenciasAsignadas: number;
  nivelCompromiso: NivelCompromiso;
  asignadoANucleoSintesis: boolean;
}

export interface CicloMedicion {
  id: string;
  mapeoCompetenciasId?: string;
  nombre: string;
  seccionalId: string;
  facultadId: string;
  programaId: string;
  planId: string;
  periodo: string;
  duracionAnios: 1.5;
  fechaInicio: string;
  fechaFin: string;
  estado: CicloEstado;
  cursoIds: string[];
  progreso: number;
  responsableId: string;
  responsableNombre: string;
  createdAt: string;
  updatedAt: string;
}

export interface CicloCatalogs {
  seccionales: Seccional[];
  facultades: Facultad[];
  programas: ProgramaAcademico[];
  planes: PlanEstudio[];
  cursos: CursoSintesis[];
}

export interface CicloFilters {
  seccionalId: string;
  facultadId: string;
  programaId: string;
  periodo: string;
  estado: string;
}

export interface CicloFormState {
  nombre: string;
  programaId: string;
  planId: string;
  fechaInicio: string;
  cursoIds: string[];
}

export interface CicloEnriched extends CicloMedicion {
  seccionalNombre: string;
  facultadNombre: string;
  programaNombre: string;
  programaEstado: ProgramaEstado;
  planNombre: string;
  planEstado: ProgramaEstado;
  cursosSeleccionados: CursoSintesis[];
}

export interface CursoElegibility {
  selectable: boolean;
  reason: string;
}

export interface CicloRolePermissions {
  canReadSummary: boolean;
  canCreateCycle: boolean;
  canEditCycle: boolean;
  canDeleteCycle: boolean;
  canDuplicateCycle: boolean;
  canConfirmSelection: boolean;
  canFilterBySeccional: boolean;
  canFilterByFacultad: boolean;
  canFilterByPrograma: boolean;
  canFilterByPeriodo: boolean;
  canFilterByEstado: boolean;
}
