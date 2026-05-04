export type PerfilEgresoRole =
  | "admin"
  | "vice"
  | "decano"
  | "director"
  | "docente";

export type PerfilEgresoEstado = "activo" | "inactivo";

export interface Seccional {
  id: string;
  nombre: string;
}

export interface LugarDesarrollo {
  id: string;
  nombre: string;
  seccionalId: string;
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

export interface PerfilEgresoRecord {
  id: string;
  seccionalId: string;
  lugarId: string;
  facultadId: string;
  programaId: string;
  planId: string;
  estado: PerfilEgresoEstado;
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
  role: PerfilEgresoRole;
  scope: CurrentUserScope;
}

export interface PerfilEgresoFilters {
  seccionalId: string;
  lugarId: string;
  facultadId: string;
  programaId: string;
  planId: string;
  estado: "" | PerfilEgresoEstado;
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

export interface PerfilEgresoEnriched extends PerfilEgresoRecord {
  seccionalNombre: string;
  lugarNombre: string;
  facultadNombre: string;
  programaNombre: string;
  planNombre: string;
}

export interface Catalogs {
  seccionales: Seccional[];
  lugares: LugarDesarrollo[];
  facultades: Facultad[];
  programas: ProgramaAcademico[];
  planes: PlanEstudio[];
}

export interface FormState {
  seccionalId: string;
  lugarId: string;
  facultadId: string;
  programaId: string;
  planId: string;
  estado: PerfilEgresoEstado;
  descripcion: string;
}