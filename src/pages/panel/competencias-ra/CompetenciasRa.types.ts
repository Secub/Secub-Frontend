import type { SecubRole } from "../../../config/access/roles";

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
  programaId: string;
  estado: "activo" | "inactivo";
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
  academicProgramId?: string;
  planId?: string;
}

export interface CurrentUser {
  id: string;
  nombre: string;
  email?: string;
  cargo: string;
  role: SecubRole;
  scope: UserScope;
}

export interface CompetenciasRaFormacionRecord {
  id: string;
  propositoFormacionId?: string;
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
  planEstado: "activo" | "inactivo";
}

export interface CompetenciasRaPdfRow {
    numeroCompetencia: number;
    facultad: string;
    programa: string;
    plan: string;
    competencia: string;
    ra: string;
    estado: string;
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

