import { DEFAULT_SECUB_ROLE, SECUB_ROLE_LABELS, normalizeSecubRole, type SecubRole } from "../../config/access/roles";
import { getStoredAuthSession } from "./session";

export interface CurrentUser {
  id: string;
  nombre: string;
  email: string;
  cargo: string;
  role: SecubRole;
  seccionalId?: string;
  lugarId?: string;
  facultadId?: string;
  programaId?: string;
  academicProgramId?: string;
  planId?: string;
  scope: {
    seccionalId?: string;
    lugarId?: string;
    facultadId?: string;
    programaId?: string;
    academicProgramId?: string;
    planId?: string;
  };
}

const EMPTY_USER: CurrentUser = {
  id: "",
  nombre: "Usuario SECUB",
  email: "",
  cargo: SECUB_ROLE_LABELS[DEFAULT_SECUB_ROLE],
  role: DEFAULT_SECUB_ROLE,
  scope: {},
};

export function getCurrentUser(): CurrentUser {
  const authenticated = getStoredAuthSession();
  const context = authenticated?.contexts.find((item) => item.context_id === authenticated.selected_context_id);
  if (!authenticated || !context) return EMPTY_USER;
  const role = normalizeSecubRole(context.role);
  return {
    id: authenticated.user_id,
    nombre: authenticated.full_name,
    email: authenticated.email,
    cargo: SECUB_ROLE_LABELS[role],
    role,
    seccionalId: context.campus_codigo,
    lugarId: context.location_codigo,
    facultadId: context.faculty_codigo,
    programaId: context.program_codigo,
    academicProgramId: context.program_codigo,
    planId: context.plan_codigo,
    scope: {
      seccionalId: context.campus_codigo,
      lugarId: context.location_codigo,
      facultadId: context.faculty_codigo,
      programaId: context.program_codigo,
      academicProgramId: context.program_codigo,
      planId: context.plan_codigo,
    },
  };
}

export function getSeccionalFromUser(user: Pick<CurrentUser, "seccionalId" | "scope">) {
  return user.seccionalId ?? user.scope.seccionalId ?? "";
}

export function canUserSelectSeccional(user: Pick<CurrentUser, "role">) {
  return user.role === "administrador";
}
