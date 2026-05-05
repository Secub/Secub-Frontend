export type CompetenciasRaFormacionRole =
  | "admin"
  | "vice"
  | "decano"
  | "director"
  | "docente";

export type CompetenciasRaEstado = "activo" | "inactivo";

export interface ResultadoAprendizaje {
  id: string;
  numero: number;
  descripcion: string;
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

export interface LugarDesarrollo {
  id: string;
  nombre: string;
  seccionalId: string;
}

export interface ProgramaAcademico {
  id: string;
  nombre: string;
  facultadId: string;
  seccionalId: string;
}

export interface PlanEstudio {
  id: string;
  nombre: string;
}

export interface Catalogs {
  seccionales: Seccional[];
  facultades: Facultad[];
  lugares: LugarDesarrollo[];
  programas: ProgramaAcademico[];
  planes: PlanEstudio[];
}

export interface UserScope {
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
}

export interface CurrentUser {
  id: string;
  nombre: string;
  cargo: string;
  role: CompetenciasRaFormacionRole;
  scope: UserScope;
}

export interface CompetenciasRaFormacionRecord {
  id: string;
  seccionalId: string;
  facultadId: string;
  lugarId: string;
  programaId: string;
  planId: string;
  estado: CompetenciasRaEstado;
  descripcion: string;
  nombre: string;
  numero: number;
  resultadosAprendizaje: ResultadoAprendizaje[];
  createdAt: string;
  updatedAt: string;
}

export interface CompetenciasRaEnriched extends CompetenciasRaFormacionRecord {
  seccionalNombre: string;
  facultadNombre: string;
  lugarNombre: string;
  programaNombre: string;
  planNombre: string;
}

export interface CompetenciasRaFilters {
  seccionalId: string;
  facultadId: string;
  lugarId: string;
  programaId: string;
  planId: string;
  estado: "" | CompetenciasRaEstado;
}

export interface FormState {
  seccionalId: string;
  facultadId: string;
  lugarId: string;
  programaId: string;
  planId: string;
  estado: CompetenciasRaEstado;
  numeroRA: number;
  descripcion: string;
  raDescripciones: string[];
}

export interface RolePermissions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExportPdf: boolean;
  canExportExcel: boolean;
  canFilterBySeccional: boolean;
  canFilterByLugar: boolean;
  canFilterByFacultad: boolean;
  canFilterByPrograma: boolean;
  canFilterByPlan: boolean;
  canFilterByEstado: boolean;
}
