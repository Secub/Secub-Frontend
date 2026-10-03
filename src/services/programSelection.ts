import { getStoredAuthSession } from "./auth/session";

function selectedContext() {
  const session = getStoredAuthSession();
  return session?.contexts.find((context) => context.context_id === session.selected_context_id);
}

export function readSelectedProgramId() {
  return selectedContext()?.program_codigo ?? "";
}

export function hasSelectedProgram() {
  return Boolean(selectedContext());
}

export function getSelectedProgram() {
  const context = selectedContext();
  if (!context) return undefined;
  return {
    id: context.program_codigo,
    name: context.program_name,
    faculty: context.faculty_name,
    planId: context.plan_codigo,
    planName: context.plan_name,
  };
}

export function getSelectedProgramScope() {
  const context = selectedContext();
  return {
    seccionalId: context?.campus_codigo ?? "",
    lugarId: context?.location_codigo ?? "",
    facultadId: context?.faculty_codigo ?? "",
    programaId: context?.program_codigo ?? "",
    academicProgramId: context?.program_codigo ?? "",
    planId: context?.plan_codigo ?? "",
  };
}

export function clearSelectedProgramId() {
  window.dispatchEvent(new Event("secub:selected-program-updated"));
}
