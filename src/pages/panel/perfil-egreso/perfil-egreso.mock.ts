import { getCurrentMockUser } from "../../../services/auth/mockUser";
import {
  secubFacultades,
  secubLugares,
  secubPlanes,
  secubProgramas,
  secubSeccionales,
} from "../../../data/secubAcademicPrograms";
import { roleLabels } from "./perfil-egreso.permissions";
import type {
  Catalogs,
  CurrentUser,
  Facultad,
  LugarDesarrollo,
  PlanEstudio,
  ProgramaAcademico,
  PerfilEgresoRecord,
  PerfilEgresoRole,
  Seccional,
} from "./perfil-egreso.types";

export const DEFAULT_ROLE: PerfilEgresoRole = "admin";

export const seccionales: Seccional[] = secubSeccionales;
export const lugares: LugarDesarrollo[] = secubLugares;
export const facultades: Facultad[] = secubFacultades;
export const programas: ProgramaAcademico[] = secubProgramas.map(({ estado: _estado, ...program }) => program);
export const planes: PlanEstudio[] = secubPlanes.map(({ totalSemestres: _totalSemestres, ...plan }) => plan);

export const mockPerfilesEgreso: PerfilEgresoRecord[] = [];

export const mockUsers: Record<PerfilEgresoRole, CurrentUser> = {
  admin: { id: "usr-admin-001", nombre: "Camila Restrepo", cargo: roleLabels.admin, role: "admin", scope: { seccionalId: "cali" } },
  vice: { id: "usr-vice-001", nombre: "Andrea Londoño", cargo: roleLabels.vice, role: "vice", scope: { seccionalId: "cali" } },
  decano: { id: "usr-decano-001", nombre: "Carlos Ramírez", cargo: roleLabels.decano, role: "decano", scope: { seccionalId: "cali" } },
  director: { id: "usr-director-001", nombre: "Jefatura SECUB", cargo: roleLabels.director, role: "director", scope: { seccionalId: "cali" } },
  docente: { id: "usr-docente-001", nombre: "Docente SECUB", cargo: roleLabels.docente, role: "docente", scope: { seccionalId: "cali" } },
};

export function normalizeRole(rawRole: string | null | undefined): PerfilEgresoRole {
  const normalized = String(rawRole ?? "").trim().toLowerCase();
  const aliases: Record<string, PerfilEgresoRole> = {
    admin: "admin",
    administrador: "admin",
    administrative: "admin",
    vice: "vice",
    vicerrector: "vice",
    vicerrectoría: "vice",
    vicerrectoria: "vice",
    decano: "decano",
    director: "director",
    directorprograma: "director",
    director_de_programa: "director",
    docente: "docente",
    teacher: "docente",
  };

  return aliases[normalized] ?? DEFAULT_ROLE;
}

export function getCurrentUser(): CurrentUser {
  const demoUser = getCurrentMockUser();
  const fallbackUser = mockUsers[demoUser.role as keyof typeof mockUsers] ?? mockUsers.admin;

  return {
    ...fallbackUser,
    id: demoUser.id,
    nombre: demoUser.nombre,
    email: demoUser.email,
    cargo: demoUser.cargo || fallbackUser.cargo,
    role: demoUser.role as CurrentUser["role"],
    scope: {
      ...fallbackUser.scope,
      ...demoUser.scope,
    },
  };
}

export function getCatalogs(): Catalogs {
  return { seccionales, lugares, facultades, programas, planes };
}
