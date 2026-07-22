import type { CentralMockUser } from "../../../services/auth/mockUser";

export function canReadAsignarRA(user: CentralMockUser) {
  return user.role !== "docente";
}

export function canManageAsignarRA(user: CentralMockUser) {
  // RF07: la asignación operativa de RA queda a cargo de Dirección de programa.
  // Admin, Vicerrectoría y Decanatura consultan y hacen seguimiento según alcance.
  return user.role === "direccionPrograma";
}

export function canDeleteAsignarRA(user: CentralMockUser) {
  return canManageAsignarRA(user);
}

export function canFilterBySeccional(user: CentralMockUser) {
  return user.role === "admin";
}

export function canFilterByFacultad(user: CentralMockUser) {
  return user.role === "admin" || user.role === "vice";
}
