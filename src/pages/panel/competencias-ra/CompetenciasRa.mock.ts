import { getCurrentMockUser } from "../../../services/auth/mockUser";
import {
  secubFacultades,
  secubLugares,
  secubPlanes,
  secubProgramas,
  secubSeccionales,
} from "../../../data/secubAcademicPrograms";
import type {
  Catalogs,
  CurrentUser,
  Facultad,
  LugarDesarrollo,
  PlanEstudio,
  ProgramaAcademico,
  CompetenciasRaFormacionRecord,
  Seccional,
} from "./CompetenciasRa.types";

export const seccionales: Seccional[] = secubSeccionales;
export const lugares: LugarDesarrollo[] = secubLugares;
export const facultades: Facultad[] = secubFacultades;
export const programas: ProgramaAcademico[] = secubProgramas.map(({ estado: _estado, ...program }) => program);
export const planes: PlanEstudio[] = secubPlanes.map(({ totalSemestres: _totalSemestres, ...plan }) => plan);

export const mockCompetenciasRa: CompetenciasRaFormacionRecord[] = [];

export function getCurrentUser(): CurrentUser {
  const demoUser = getCurrentMockUser();

  return {
    id: demoUser.id,
    nombre: demoUser.nombre,
    email: demoUser.email,
    cargo: demoUser.cargo,
    role: demoUser.role,
    scope: { ...demoUser.scope },
  };
}

export function getCatalogs(): Catalogs {
  return { seccionales, facultades, lugares, programas, planes };
}
