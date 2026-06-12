import {
  getProgramById,
  getProgramScope,
  secubAcademicPrograms,
  type SecubProgramId,
} from "../data/secubAcademicPrograms";

export const SELECTED_PROGRAM_STORAGE_KEY = "secub:selected-program-id:v1";

function canUseStorage() {
  try {
    return typeof window !== "undefined" && "localStorage" in window;
  } catch {
    return false;
  }
}

function normalizeProgramId(value?: string | null): SecubProgramId | "" {
  const normalized = String(value ?? "").trim().toLowerCase();
  return secubAcademicPrograms.some((program) => program.id === normalized)
    ? (normalized as SecubProgramId)
    : "";
}

export function readSelectedProgramId(): SecubProgramId | "" {
  if (!canUseStorage()) return "";

  const params = new URLSearchParams(window.location.search);
  const fromQuery = normalizeProgramId(params.get("programaId") ?? params.get("programId"));
  if (fromQuery) return fromQuery;

  return normalizeProgramId(window.localStorage.getItem(SELECTED_PROGRAM_STORAGE_KEY));
}

export function hasSelectedProgram() {
  return Boolean(readSelectedProgramId());
}

export function getSelectedProgram() {
  return getProgramById(readSelectedProgramId());
}

export function getSelectedProgramScope() {
  return getProgramScope(readSelectedProgramId());
}

export function persistSelectedProgramId(programId: SecubProgramId) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SELECTED_PROGRAM_STORAGE_KEY, programId);
  window.dispatchEvent(new CustomEvent("secub:selected-program-updated", { detail: { programId } }));
}

export function clearSelectedProgramId() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SELECTED_PROGRAM_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("secub:selected-program-updated", { detail: { programId: "" } }));
}
