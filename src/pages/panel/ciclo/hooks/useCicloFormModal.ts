import { useEffect, useMemo, useState } from "react";
import { scrollToFirstValidationError } from "../../../../utils/validationScroll";
import { cicloRolePermissions } from "../ciclo.permissions";
import type { CicloCatalogs, CicloEnriched, CicloFormState, CurrentUser } from "../ciclo.types";
import {
  getActivePlansByProgram,
  getCourseEligibility,
  getSynthesisCourses,
  sortCoursesByContractType,
} from "../ciclo.utils";

function normalizeContractType(tipoVinculacion: string) {
  return tipoVinculacion
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function isCatedraTeacher(tipoVinculacion: string) {
  return normalizeContractType(tipoVinculacion).includes("HC");
}

export function isExceptionalTeacher(tipoVinculacion: string) {
  return normalizeContractType(tipoVinculacion).includes("MT");
}

export function getTeacherContractAlert(tipoVinculacion: string) {
  if (normalizeContractType(tipoVinculacion).includes("TC")) return "";
  if (isExceptionalTeacher(tipoVinculacion)) {
    return "Caso excepcional: docente de medio tiempo. Prioriza tiempo completo cuando exista disponibilidad.";
  }
  // return "Caso excepcional: valida la dedicación docente antes de confirmar el ciclo."; 
  // OJO: Se comenta esta alerta porque el proceso de validación ya no bloquea la confirmación, pero se mantiene la función por si se quiere mostrar un mensaje informativo en el futuro.
}

interface UseCicloFormModalParams {
  open: boolean;
  mode: "create" | "edit" | "view";
  catalogs: CicloCatalogs;
  user: CurrentUser;
  initialValues: CicloFormState;
  record?: CicloEnriched | null;
  onSubmit: (values: CicloFormState) => void;
}

export function useCicloFormModal({
  open,
  mode,
  catalogs,
  user,
  initialValues,
  record,
  onSubmit,
}: UseCicloFormModalParams) {
  const [values, setValues] = useState<CicloFormState>(initialValues);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setSubmitted(false);
    }
  }, [initialValues, open]);

  const permissions = cicloRolePermissions[user.role];
  const isReadOnly = mode === "view" || !permissions.canConfirmSelection;
  const selectedPrograma = catalogs.programas.find((programa) => programa.id === values.programaId);
  const selectedPlan = catalogs.planes.find((plan) => plan.id === values.planId);
  const selectedFacultad = catalogs.facultades.find((facultad) => facultad.id === selectedPrograma?.facultadId);

  const availableProgramas = useMemo(() => {
    return catalogs.programas.filter((programa) => {
      if (user.scope.programaId && programa.id !== user.scope.programaId) return false;
      if (user.scope.facultadId && programa.facultadId !== user.scope.facultadId) return false;
      if (user.scope.seccionalId && programa.seccionalId !== user.scope.seccionalId) return false;
      return true;
    });
  }, [catalogs.programas, user.scope.facultadId, user.scope.programaId, user.scope.seccionalId]);

  const activePlans = useMemo(
    () => getActivePlansByProgram(catalogs, values.programaId),
    [catalogs, values.programaId],
  );

  const synthesisCourses = useMemo(
    () => getSynthesisCourses(catalogs, values.programaId, values.planId),
    [catalogs, values.planId, values.programaId],
  );

  const availableCourses = useMemo(() => {
    const filtered = synthesisCourses.filter((course) => {
      return getCourseEligibility(course, selectedPrograma, selectedPlan).selectable;
    });
    // Ordenar por tipo de contrato: Tiempo Completo → Medio Tiempo → Cátedra
    return sortCoursesByContractType(filtered);
  }, [selectedPlan, selectedPrograma, synthesisCourses]);

  const selectedCount = values.cursoIds.filter((cursoId) =>
    availableCourses.some((course) => course.id === cursoId),
  ).length;

  const nombreError = submitted && values.nombre.trim().length === 0 ? "El nombre del ciclo es obligatorio." : undefined;
  const programaError =
    submitted && (!values.programaId || selectedPrograma?.estado !== "activo")
      ? "Solo se pueden crear ciclos para programas activos."
      : undefined;
  const planError =
    submitted && (!values.planId || selectedPlan?.estado !== "activo")
      ? "El plan de estudios debe estar activo."
      : undefined;
  const cursosError = submitted && selectedCount === 0 ? "Selecciona al menos un curso para confirmar el ciclo." : undefined;
  const showValidationAlert = submitted && Boolean(nombreError || programaError || planError || cursosError);
  const canSubmit =
    !isReadOnly &&
    selectedPrograma?.estado === "activo" &&
    selectedPlan?.estado === "activo" &&
    values.nombre.trim().length > 0 &&
    selectedCount > 0;

  const handleProgramChange = (programaId: string) => {
    const firstPlan = getActivePlansByProgram(catalogs, programaId)[0];
    setValues((current) => ({ ...current, programaId, planId: firstPlan?.id ?? "", cursoIds: [] }));
  };

  const toggleCourse = (courseId: string) => {
    setValues((current) => {
      const exists = current.cursoIds.includes(courseId);
      return {
        ...current,
        cursoIds: exists ? current.cursoIds.filter((id) => id !== courseId) : [...current.cursoIds, courseId],
      };
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!canSubmit) {
      scrollToFirstValidationError({ fieldOrder: ["nombre", "programaId", "planId", "cursoIds"] });
      return;
    }
    onSubmit(values);
  };

  const title = { create: "Crear ciclo de medición", edit: "Editar ciclo", view: "Detalle del ciclo" }[mode];
  const primaryLabel = mode === "edit" ? "Guardar cambios" : "Crear ciclo de medición";

  return {
    values,
    setValues,
    record,
    title,
    primaryLabel,
    isReadOnly,
    selectedFacultad,
    activePlans,
    availableProgramas,
    availableCourses,
    selectedCount,
    nombreError,
    programaError,
    planError,
    cursosError,
    showValidationAlert,
    canSubmit,
    handleProgramChange,
    toggleCourse,
    handleSubmit,
  };
}
