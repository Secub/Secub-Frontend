import type { CentralMockUser } from "../../../services/auth/mockUser";

export function canReadAsignarRA(_user: CentralMockUser) {
  return true;
}

export function canManageAsignarRA(user: CentralMockUser) {
  // RF07: la asignación operativa de RA queda a cargo del Director de Programa.
  // Admin, Vice y Decano consultan y hacen seguimiento según alcance; no editan en esta versión demo.
  return user.role === "director";
}

export function canDeleteAsignarRA(user: CentralMockUser) {
  return canManageAsignarRA(user);
}

export function canFilterBySeccional(user: CentralMockUser) {
  return user.role === "admin" || user.role === "vice" || user.role === "decano";
}

export function canFilterByFacultad(user: CentralMockUser) {
  return user.role === "admin" || user.role === "vice" || user.role === "decano";
}
