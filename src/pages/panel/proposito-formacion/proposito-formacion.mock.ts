import { getCurrentMockUser } from "../../../services/auth/mockUser";
import {
  secubFacultades,
  secubLugares,
  secubPlanes,
  secubProgramas,
  secubSeccionales,
} from "../../../data/secubAcademicPrograms";
import { roleLabels } from "./proposito-formacion.permissions";
import type {
  Catalogs,
  CurrentUser,
  Facultad,
  LugarDesarrollo,
  PlanEstudio,
  ProgramaAcademico,
  PropositoFormacionRecord,
  PropositoFormacionRole,
  Seccional,
} from "./proposito-formacion.types";

export const DEFAULT_ROLE: PropositoFormacionRole = "admin";

export const seccionales: Seccional[] = secubSeccionales;
export const lugares: LugarDesarrollo[] = secubLugares;
export const facultades: Facultad[] = secubFacultades;
export const programas: ProgramaAcademico[] = secubProgramas.map(({ estado: _estado, ...program }) => program);
export const planes: PlanEstudio[] = secubPlanes.map(({ totalSemestres: _totalSemestres, ...plan }) => plan);

export const mockPropositos: PropositoFormacionRecord[] = [];

const mockUsers: Record<PropositoFormacionRole, CurrentUser> = {
  admin: { id: "usr-admin-001", nombre: "Juliana Mejía", cargo: roleLabels.admin, role: "admin", scope: { seccionalId: "cali" } },
  vice: { id: "usr-vice-001", nombre: "Ana María Restrepo", cargo: roleLabels.vice, role: "vice", scope: { seccionalId: "cali" } },
  decano: { id: "usr-decano-001", nombre: "Carlos Medina", cargo: roleLabels.decano, role: "decano", scope: { seccionalId: "cali" } },
  "direccion-programa": { id: "direccion-programa-secub", nombre: "Dirección de programa", cargo: roleLabels["direccion-programa"], role: "direccion-programa", scope: { seccionalId: "cali" } },
  docente: { id: "docente-secub", nombre: "Docente SECUB", cargo: roleLabels.docente, role: "docente", scope: { seccionalId: "cali" } },
};

export function normalizeRole(rawRole: string | null | undefined): PropositoFormacionRole {
  const normalized = String(rawRole ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const compactRole = normalized.replace(/[^a-z0-9]+/g, "");
  const aliases: Record<string, PropositoFormacionRole> = {
    admin: "admin",
    administrador: "admin",
    administrative: "admin",
    vice: "vice",
    vicerrector: "vice",
    vicerrectoría: "vice",
    vicerrectoria: "vice",
    decano: "decano",
    director: "direccion-programa",
    directorprograma: "direccion-programa",
    director_de_programa: "direccion-programa",
    "direccion-programa": "direccion-programa",
    direccionprograma: "direccion-programa",
    direccion_de_programa: "direccion-programa",
    docente: "docente",
    teacher: "docente",
  };

  return aliases[normalized] ?? aliases[compactRole] ?? DEFAULT_ROLE;
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
  return { seccionales, facultades, lugares, programas, planes };
}
