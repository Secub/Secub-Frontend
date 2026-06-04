export type PropositoFormacionRole =
  | "admin"
  | "vice"
  | "decano"
  | "director"
  | "docente";

export type PropositoEstado = "activo" | "inactivo";

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
  role: PropositoFormacionRole;
  scope: UserScope;
}

export interface PropositoFormacionRecord {
  id: string;
  perfilEgresoId?: string;
  seccionalId: string;
  facultadId: string;
  lugarId: string;
  programaId: string;
  planId: string;
  estado: PropositoEstado;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
  academicPlanInstanceId?: string;
  inheritedFromAcademicPlanInstanceId?: string;
  inheritedFromRecordId?: string;
  isInheritedAcademicBase?: boolean;
  readonlyInherited?: boolean;
}

export interface PropositoEnriched extends PropositoFormacionRecord {
  seccionalNombre: string;
  facultadNombre: string;
  lugarNombre: string;
  programaNombre: string;
  planNombre: string;
  planEstado: "activo" | "inactivo";
}

export interface PropositoFilters {
  seccionalId: string;
  facultadId: string;
  lugarId: string;
  programaId: string;
  planId: string;
  estado: "" | PropositoEstado;
}

export interface FormState {
  seccionalId: string;
  facultadId: string;
  lugarId: string;
  programaId: string;
  planId: string;
  estado: PropositoEstado;
  descripcion: string;
}

export interface RolePermissions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExportPdf: boolean;
  canExportExcel: boolean;
  canFilterBySeccional: boolean;
  canFilterByFacultad: boolean;
  canFilterByPrograma: boolean;
  canFilterByPlan: boolean;
  canFilterByEstado: boolean;
}
