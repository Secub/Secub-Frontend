import { getCurrentMockUser } from "../../../services/auth/mockUser";
import {
  secubFacultades,
  secubLugares,
  secubPlanes,
  secubProgramas,
  secubSeccionales,
} from "../../../data/secubAcademicPrograms";
import { roleLabels } from "./CompetenciasRa.permissions";
import type {
  Catalogs,
  CurrentUser,
  Facultad,
  LugarDesarrollo,
  PlanEstudio,
  ProgramaAcademico,
  CompetenciasRaFormacionRecord,
  CompetenciasRaFormacionRole,
  Seccional,
} from "./CompetenciasRa.types";

export const DEFAULT_ROLE: CompetenciasRaFormacionRole = "admin";

export const seccionales: Seccional[] = secubSeccionales;
export const lugares: LugarDesarrollo[] = secubLugares;
export const facultades: Facultad[] = secubFacultades;
export const programas: ProgramaAcademico[] = secubProgramas.map(({ estado: _estado, ...program }) => program);
export const planes: PlanEstudio[] = secubPlanes.map(({ totalSemestres: _totalSemestres, ...plan }) => plan);

export const mockCompetenciasRa: CompetenciasRaFormacionRecord[] = [];

const mockUsers: Record<CompetenciasRaFormacionRole, CurrentUser> = {
  admin: { id: "usr-admin-001", nombre: "Usuario administrador", cargo: roleLabels.admin, role: "admin", scope: {} },
  vice: { id: "usr-vice-001", nombre: "Usuario Vicerrectoría", cargo: roleLabels.vice, role: "vice", scope: {} },
  decano: { id: "usr-decano-001", nombre: "Usuario Decanatura", cargo: roleLabels.decano, role: "decano", scope: {} },
  direccionPrograma: { id: "direccion-programa-secub", nombre: "Dirección de programa", cargo: roleLabels["direccionPrograma"], role: "direccionPrograma", scope: {} },
  docente: { id: "docente-secub", nombre: "Docente", cargo: roleLabels.docente, role: "docente", scope: {} },
};

export function normalizeRole(rawRole: string | null | undefined): CompetenciasRaFormacionRole {
  const normalized = String(rawRole ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const compactRole = normalized.replace(/[^a-z0-9]+/g, "");

  const aliases: Record<string, CompetenciasRaFormacionRole> = {
    admin: "admin",
    administrador: "admin",
    administrative: "admin",
    vice: "vice",
    vicerrector: "vice",
    vicerrectoría: "vice",
    vicerrectoria: "vice",
    decano: "decano",
    director: "direccionPrograma",
    directorprograma: "direccionPrograma",
    director_de_programa: "direccionPrograma",
    direccionPrograma: "direccionPrograma",
    direccionprograma: "direccionPrograma",
    direccion_de_programa: "direccionPrograma",
    docente: "docente",
    teacher: "docente",
  };

  return aliases[normalized] ?? aliases[compactRole] ?? DEFAULT_ROLE;
}

export function getCurrentUser(): CurrentUser {
  const demoUser = getCurrentMockUser();
  const fallbackUser = mockUsers[demoUser.role] ?? mockUsers.admin;

  return {
    ...fallbackUser,
    id: demoUser.id,
    nombre: demoUser.nombre,
    email: demoUser.email,
    cargo: demoUser.cargo || fallbackUser.cargo,
    role: demoUser.role,
    scope: {
      ...fallbackUser.scope,
      ...demoUser.scope,
    },
  };
}

export function getCatalogs(): Catalogs {
  return { seccionales, facultades, lugares, programas, planes };
}
