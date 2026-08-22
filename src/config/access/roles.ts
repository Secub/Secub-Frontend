export const SECUB_ROLES = {
  ADMINISTRADOR: "administrador",
  VICERRECTOR: "vicerrector",
  DECANO: "decano",
  DIRECTOR: "director",
  DOCENTE: "docente",
} as const;

export type SecubRole = (typeof SECUB_ROLES)[keyof typeof SECUB_ROLES];

export const SECUB_ROLE_ORDER: readonly SecubRole[] = [
  SECUB_ROLES.DIRECTOR,
  SECUB_ROLES.DOCENTE,
  SECUB_ROLES.VICERRECTOR,
  SECUB_ROLES.DECANO,
  SECUB_ROLES.ADMINISTRADOR,
];

export const DEFAULT_SECUB_ROLE: SecubRole = SECUB_ROLES.ADMINISTRADOR;

/**
 * Etiquetas oficiales de los cinco roles de SECUB.
 * Los valores de rol son canónicos y son los únicos aceptados por la aplicación.
 */
export const SECUB_ROLE_LABELS: Record<SecubRole, string> = {
  administrador: "Administrador",
  vicerrector: "Vicerrector",
  decano: "Decano",
  director: "Dirección de programa",
  docente: "Docente",
};

/**
 * Valida el contrato de rol recibido desde URL, mocks y, posteriormente, backend.
 * No traduce alias históricos: un valor diferente de los cinco roles oficiales
 * se considera inválido y usa el fallback indicado.
 */
export function isSecubRole(value: unknown): value is SecubRole {
  return typeof value === "string" && SECUB_ROLE_ORDER.includes(value as SecubRole);
}

export function normalizeSecubRole(
  rawRole: string | null | undefined,
  fallback: SecubRole = DEFAULT_SECUB_ROLE,
): SecubRole {
  const normalizedRole = String(rawRole ?? "").trim().toLowerCase();
  return isSecubRole(normalizedRole) ? normalizedRole : fallback;
}
