import { useMemo, type Dispatch, type SetStateAction } from "react";
import {
  getActivePlansByProgram,
  getDefaultLugarBySeccional,
  isLugarEditableForSeccional,
} from "../academicScope.utils";
import type {
  AcademicScopeCatalogs,
  AcademicScopeFormValue,
  AcademicScopeUserScope,
} from "../academicScope.types";

type AcademicScopeField = keyof AcademicScopeFormValue;

interface UseAcademicScopeFormOptions<TForm extends AcademicScopeFormValue> {
  form: TForm;
  setForm: Dispatch<SetStateAction<TForm>>;
  catalogs: AcademicScopeCatalogs;
  userScope: AcademicScopeUserScope;
  canEditStructure: boolean;
}

export function useAcademicScopeForm<TForm extends AcademicScopeFormValue>({
  form,
  setForm,
  catalogs,
  userScope,
  canEditStructure,
}: UseAcademicScopeFormOptions<TForm>) {
  const lugaresDisponibles = useMemo(
    () =>
      catalogs.lugares.filter(
        (item) => !form.seccionalId || item.seccionalId === form.seccionalId,
      ),
    [catalogs.lugares, form.seccionalId],
  );

  const facultadesDisponibles = useMemo(
    () =>
      catalogs.facultades.filter(
        (item) => !form.seccionalId || item.seccionalId === form.seccionalId,
      ),
    [catalogs.facultades, form.seccionalId],
  );

  const programasDisponibles = useMemo(
    () =>
      catalogs.programas.filter((item) => {
        if (form.seccionalId && item.seccionalId !== form.seccionalId) return false;
        if (form.facultadId && item.facultadId !== form.facultadId) return false;
        if (userScope.programaId) return item.id === userScope.programaId;
        return true;
      }),
    [catalogs.programas, form.facultadId, form.seccionalId, userScope.programaId],
  );

  const planesDisponibles = useMemo(
    () => getActivePlansByProgram(catalogs, form.programaId, form.planId),
    [catalogs, form.planId, form.programaId],
  );

  const updateScopeField = <K extends AcademicScopeField>(
    key: K,
    value: TForm[K],
  ) => {
    setForm((current) => {
      const next = { ...current, [key]: value } as TForm;

      if (key === "seccionalId") {
        next.lugarId = getDefaultLugarBySeccional(String(value));
        next.facultadId = userScope.facultadId ?? "";
        next.programaId = userScope.programaId ?? "";
        next.planId = "";
      }

      if (key === "lugarId") {
        next.facultadId = userScope.facultadId ?? "";
        next.programaId = userScope.programaId ?? "";
        next.planId = "";
      }

      if (key === "facultadId") {
        next.programaId = userScope.programaId ?? "";
        next.planId = "";
      }

      if (key === "programaId") {
        next.planId = getActivePlansByProgram(catalogs, String(value))[0]?.id ?? "";
      }

      return next;
    });
  };

  return {
    lugaresDisponibles,
    facultadesDisponibles,
    programasDisponibles,
    planesDisponibles,
    updateScopeField,
    isDirectorScoped: Boolean(userScope.programaId),
    isLugarLocked:
      !canEditStructure || !isLugarEditableForSeccional(form.seccionalId),
  };
}
