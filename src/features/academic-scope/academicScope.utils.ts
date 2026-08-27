import { secubLugares, type SecubLugarCatalog } from "../../data/secubAcademicPrograms";
import type {
  AcademicScopeCatalogs,
  AcademicScopeErrors,
  AcademicScopeFormValue,
} from "./academicScope.types";

export function getDefaultLugarBySeccional(
  seccionalId: string,
  lugares: readonly SecubLugarCatalog[] = secubLugares,
) {
  if (!seccionalId) return "";
  return lugares.find((lugar) => lugar.seccionalId === seccionalId)?.id ?? "";
}

export function isLugarEditableForSeccional(_seccionalId: string) {
  return false;
}

export function getActivePlansByProgram<
  TCatalogs extends Pick<AcademicScopeCatalogs, "planes">,
>(catalogs: TCatalogs, programaId: string, selectedPlanId = "") {
  return catalogs.planes.filter((plan) => {
    if (programaId && plan.programaId !== programaId) return false;
    return plan.estado === "activo" || plan.id === selectedPlanId;
  });
}

export function validateAcademicScope(
  form: AcademicScopeFormValue,
  catalogs: Pick<AcademicScopeCatalogs, "planes">,
): AcademicScopeErrors {
  const errors: AcademicScopeErrors = {};

  if (!form.seccionalId) errors.seccionalId = "Selecciona una seccional.";
  if (!form.lugarId) errors.lugarId = "Selecciona un lugar de desarrollo.";
  if (!form.facultadId) errors.facultadId = "Selecciona una facultad.";
  if (!form.programaId) errors.programaId = "Selecciona un programa.";
  if (!form.planId) errors.planId = "Selecciona un plan de estudios.";

  const selectedPlan = catalogs.planes.find((plan) => plan.id === form.planId);
  if (form.planId && selectedPlan?.estado !== "activo") {
    errors.planId = "Selecciona un plan de estudios activo.";
  }

  return errors;
}
