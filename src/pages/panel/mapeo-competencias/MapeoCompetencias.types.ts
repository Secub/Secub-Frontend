export type MapeoCompetenciasRole =
  | "admin"
  | "vice"
  | "decano"
  | "director"
  | "docente";

export type MapeoCompetenciasEstado = "activo" | "inactivo";

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
  numeroSemestres: number;
  semestres: ProgramaAcademicoSemestre[];
}

export interface ProgramaAcademicoSemestre {
  numero: number;
  cursos: ProgramaAcademicoCurso[];
}

export interface ProgramaAcademicoCurso {
  id: string;
  codigo: string;
  nombre: string;
  creditos: number;
  horasSemanales: number;
  nucleo: "fundamentacion" | "profesionalizacion" | "sintesis";
  descripcion: string;
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
  role: MapeoCompetenciasRole;
  scope: UserScope;
}

export interface MapeoResultadoAprendizaje {
  id: string;
  numero: number;
  descripcion: string;
}

export interface MapeoCompetencia {
  id: string;
  numero: number;
  descripcion: string;
  resultadosAprendizaje: MapeoResultadoAprendizaje[];
}

export interface MapeoSemesterData {
  semesterId: string;
  semesterNumber: number;
  competencias: MapeoCompetencia[];
}

export interface MapeoCompetenciasRecord {
  id: string;
  seccionalId: string;
  facultadId: string;
  lugarId: string;
  programaId: string;
  planId: string;
  estado: MapeoCompetenciasEstado;
  descripcion: string;
  nombre: string;
  numero: number;
  semestres?: MapeoSemesterData[];
  createdAt: string;
  updatedAt: string;
}

export interface MapeoCompetenciasEnriched extends MapeoCompetenciasRecord {
  seccionalNombre: string;
  facultadNombre: string;
  lugarNombre: string;
  programaNombre: string;
  planNombre: string;
}

export interface MapeoCompetenciasFilters {
  seccionalId: string;
  facultadId: string;
  lugarId: string;
  programaId: string;
  planId: string;
  estado: "" | MapeoCompetenciasEstado;
}

export interface FormState {
  seccionalId: string;
  facultadId: string;
  lugarId: string;
  programaId: string;
  planId: string;
  estado: MapeoCompetenciasEstado;
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
