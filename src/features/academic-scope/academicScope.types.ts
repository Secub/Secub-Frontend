export interface AcademicScopeFormValue {
  seccionalId: string;
  lugarId: string;
  facultadId: string;
  programaId: string;
  planId: string;
}

export interface AcademicScopeUserScope {
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  academicProgramId?: string;
  planId?: string;
}

export interface AcademicScopeCatalogs {
  seccionales: Array<{ id: string; nombre: string }>;
  lugares: Array<{ id: string; nombre: string; seccionalId: string }>;
  facultades: Array<{ id: string; nombre: string; seccionalId: string }>;
  programas: Array<{
    id: string;
    nombre: string;
    facultadId: string;
    seccionalId: string;
  }>;
  planes: Array<{
    id: string;
    nombre: string;
    programaId: string;
    estado: "activo" | "inactivo";
  }>;
}

export interface AcademicScopeErrors {
  seccionalId?: string;
  lugarId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
}
