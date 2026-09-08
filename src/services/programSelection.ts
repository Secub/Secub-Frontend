import {
  getProgramById,
  getProgramScope,
  secubAcademicPrograms,
  type SecubProgramId,
} from "../data/secubAcademicPrograms";
import { getBrowserSearchParams, storageClient } from "../shared/browser";
import { getStoredAuthSession } from "./auth/session";

export const SELECTED_PROGRAM_STORAGE_KEY = "secub:selected-program-id:v2";

function normalizeProgramId(value?: string | null): SecubProgramId {
  const normalized = String(value ?? "").trim().toLowerCase();
  return secubAcademicPrograms.some((program) => program.id === normalized)
    ? normalized
    : "";
}

export function readSelectedProgramId(): SecubProgramId {
  const authenticated = getStoredAuthSession();
  const authenticatedContext = authenticated?.contexts.find(
    (context) => context.context_id === authenticated.selected_context_id,
  );
  if (authenticatedContext) return authenticatedContext.program_codigo;

  const params = getBrowserSearchParams();
  const fromQuery = normalizeProgramId(params.get("programaId") ?? params.get("programId"));
  if (fromQuery) return fromQuery;

  return normalizeProgramId(storageClient.get(SELECTED_PROGRAM_STORAGE_KEY));
}

export function hasSelectedProgram() {
  return Boolean(readSelectedProgramId());
}

export function getSelectedProgram() {
  return getProgramById(readSelectedProgramId());
}

export function getSelectedProgramScope() {
  const authenticated = getStoredAuthSession();
  const context = authenticated?.contexts.find(
    (item) => item.context_id === authenticated.selected_context_id,
  );
  if (context) {
    return {
      seccionalId: context.campus_codigo,
      lugarId: context.location_codigo,
      facultadId: context.faculty_codigo,
      programaId: context.program_codigo,
      academicProgramId: context.program_codigo,
      planId: context.plan_codigo,
    };
  }
  return getProgramScope(readSelectedProgramId());
}

export function persistSelectedProgramId(programId: SecubProgramId) {
  storageClient.set(SELECTED_PROGRAM_STORAGE_KEY, programId);
  window.dispatchEvent(new CustomEvent("secub:selected-program-updated", { detail: { programId } }));
}

export function clearSelectedProgramId() {
  storageClient.remove(SELECTED_PROGRAM_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("secub:selected-program-updated", { detail: { programId: "" } }));
}
