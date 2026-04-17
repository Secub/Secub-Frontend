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

export interface PropositoFormacionRecord {
  id: string;
  seccionalId: string;
  facultadId: string;
  programaId: string;
  planId: string;
  estado: PropositoEstado;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentUserScope {
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
}

export interface CurrentUser {
  id: string;
  nombre: string;
  cargo: string;
  role: PropositoFormacionRole;
  scope: CurrentUserScope;
}

export interface PropositoFilters {
  seccionalId: string;
  facultadId: string;
  programaId: string;
  planId: string;
  estado: "" | PropositoEstado;
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

export interface PropositoEnriched extends PropositoFormacionRecord {
  seccionalNombre: string;
  facultadNombre: string;
  programaNombre: string;
  planNombre: string;
}

export interface Catalogs {
  seccionales: Seccional[];
  facultades: Facultad[];
  programas: ProgramaAcademico[];
  planes: PlanEstudio[];
}

export interface FormState {
  seccionalId: string;
  facultadId: string;
  programaId: string;
  planId: string;
  estado: PropositoEstado;
  descripcion: string;
}
