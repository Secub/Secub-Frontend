export type MapeoCompetenciasRole =
  | "admin"
  | "vice"
  | "decano"
  | "director"
  | "docente";

export type MapeoCompetenciasEstado = "activo" | "inactivo";
export type ProgramaEstado = "activo" | "inactivo";

export type NucleoFormacion =
  | "fundamentacion"
  | "profesionalizacion"
  | "sintesis";

export type NivelCompromiso =
  | "introduce"
  | "refuerza"
  | "afianza"
  | "no-aplica";

export type NivelCompromisoCorto = "I" | "R" | "A" | "NA";
export type SemestreMapeoEstado = "pendiente" | "en-progreso" | "completo" | "sin-cursos";

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
  estado?: ProgramaEstado;
}

export interface PlanEstudio {
  id: string;
  nombre: string;
  programaId: string;
  estado: ProgramaEstado;
  totalSemestres?: number;
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
  role: MapeoCompetenciasRole;
  scope: UserScope;
}

export interface ResultadoAprendizajeDemoRecord {
  id?: string;
  numero?: number;
  descripcion?: string;
}

export interface CompetenciaRaDemoRecord {
  id: string;
  propositoFormacionId?: string;
  seccionalId?: string;
  facultadId?: string;
  lugarId?: string;
  programaId?: string;
  planId?: string;
  estado?: MapeoCompetenciasEstado;
  nombre?: string;
  descripcion?: string;
  numero?: number;
  resultadosAprendizaje?: ResultadoAprendizajeDemoRecord[];
}

export interface CursoAsis {
  id: string;
  nombre: string;
  codigo: string;
  creditos: number;
  semestre: number;
  nucleo?: string;
  programaId: string;
  planId: string;
  docente?: string;
  tipoVinculacion?: string;
  asignadoANucleoSintesis?: boolean;
}

export interface SemestreClasificado {
  semestreId: string;
  semestreNumero: number;
  nucleo: NucleoFormacion | null;
}

export interface NivelCompromisoItem {
  programaId: string;
  planId: string;
  semestreId: string;
  semestreNumero: number;
  nucleo: NucleoFormacion;
  cursoId: string;
  cursoNombre: string;
  cursoCodigo: string;
  competenciaId: string;
  competenciaNombre: string;
  nivelCompromiso: NivelCompromiso;
}

export interface CursoMapeadoCompat {
  cursoId: string;
  cursoNombre?: string;
  cursoCodigo?: string;
  semestre?: number;
  nucleo?: string;
  competenciaRaId?: string;
  competenciaRaIds?: string[];
  competenciaNombre?: string;
  nivel?: NivelCompromisoCorto;
}

export interface MapeoCompetenciasRecord {
  id: string;
  userId?: string;
  seccionalId: string;
  facultadId: string;
  lugarId: string;
  programaId: string;
  planId: string;
  estado: MapeoCompetenciasEstado;
  descripcion: string;
  competenciaRaIds: string[];
  semestresClasificados: SemestreClasificado[];
  nivelesCompromiso: NivelCompromisoItem[];
  cursosMapeados: CursoMapeadoCompat[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface MapeoCompetenciasEnriched extends MapeoCompetenciasRecord {
  seccionalNombre: string;
  facultadNombre: string;
  lugarNombre: string;
  programaNombre: string;
  programaEstado: ProgramaEstado;
  planNombre: string;
  planEstado: ProgramaEstado;
  semestresResumen: SemestreResumen[];
}

export interface MapeoCompetenciasFilters {
  seccionalId: string;
  facultadId: string;
  lugarId: string;
  programaId: string;
  planId: string;
  estado: "" | MapeoCompetenciasEstado;
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

export type NucleosDraft = Record<number, NucleoFormacion | null>;
export type NivelesDraft = Record<string, NivelCompromiso>;

export interface SemestreResumen {
  semestreNumero: number;
  semestreId: string;
  nucleo: NucleoFormacion | null;
  estado: SemestreMapeoEstado;
  cursos: CursoAsis[];
  niveles: NivelCompromisoItem[];
  totalCeldas: number;
  totalAsignadas: number;
}

export type BadgeVariant = "neutral" | "info" | "success" | "warning" | "danger" | "accent";

export interface SummaryMetric {
  label: string;
  value: number | string;
  helper: string;
  variant?: BadgeVariant;
}
