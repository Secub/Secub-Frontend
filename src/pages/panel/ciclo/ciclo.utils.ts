import type {
  CicloCatalogs,
  CicloEnriched,
  CicloFilters,
  CicloFormState,
  CicloMedicion,
  CursoElegibility,
  CursoSintesis,
  CurrentUser,
  PlanEstudio,
  ProgramaAcademico,
} from "./ciclo.types";

export const INITIAL_CICLO_FILTERS: CicloFilters = {
  seccionalId: "",
  facultadId: "",
  programaId: "",
  periodo: "",
  estado: "",
};

export function formatDate(value: string) {
  if (!value) return "Sin fecha";

  const [year, month, day] = value.includes("T")
    ? value.slice(0, 10).split("-").map(Number)
    : value.split("-").map(Number);

  if (!year || !month || !day) return value;

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function formatDateTime(value: string) {
  if (!value) return "Sin actualización";

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function addEighteenMonths(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const base = new Date(year, month - 1, day || 1);
  base.setMonth(base.getMonth() + 18);
  return base.toISOString().slice(0, 10);
}

export function buildPeriodFromStartDate(date: string) {
  const [year] = date.split("-").map(Number);
  return `${year}-${year + 1}`;
}

export function getNivelCompromisoLabel(nivel?: string | null) {
  const labels: Record<string, string> = {
    I: "Introduce",
    R: "Refuerza",
    A: "Afianza",
    NA: "No aplica",
  };

  if (!nivel) return "Nivel sin definir";

  return `Nivel ${nivel} (${labels[nivel] ?? "Sin definir"})`;
}

export function getDefaultFormState(user: CurrentUser, catalogs: CicloCatalogs): CicloFormState {
  const defaultPrograma = resolveDefaultPrograma(user, catalogs.programas);
  const defaultPlan = catalogs.planes.find(
    (plan) => plan.programaId === defaultPrograma?.id && plan.estado === "activo",
  );

  return {
    nombre: "Ciclo 2026-1",
    programaId: defaultPrograma?.id ?? "",
    planId: defaultPlan?.id ?? "",
    fechaInicio: "2026-01-15",
    cursoIds: [],
  };
}

export function resolveDefaultPrograma(user: CurrentUser, programas: ProgramaAcademico[]) {
  if (user.scope.programaId) {
    return programas.find((programa) => programa.id === user.scope.programaId);
  }

  if (user.scope.facultadId) {
    return programas.find((programa) => programa.facultadId === user.scope.facultadId);
  }

  if (user.scope.seccionalId) {
    return programas.find((programa) => programa.seccionalId === user.scope.seccionalId);
  }

  return programas[0];
}

export function getPlansByProgram(catalogs: CicloCatalogs, programaId: string) {
  return catalogs.planes.filter((plan) => plan.programaId === programaId);
}

export function getActivePlansByProgram(catalogs: CicloCatalogs, programaId: string) {
  return getPlansByProgram(catalogs, programaId).filter((plan) => plan.estado === "activo");
}

export function getSynthesisCourses(catalogs: CicloCatalogs, programaId: string, planId: string) {
  return catalogs.cursos.filter(
    (curso) =>
      curso.programaId === programaId &&
      curso.planId === planId &&
      curso.nucleo === "Síntesis" &&
      curso.asignadoANucleoSintesis &&
      curso.competenciasAsignadas > 0 &&
      Boolean(curso.nivelCompromiso),
  );
}

export function getCourseEligibility(
  course: CursoSintesis,
  programa: ProgramaAcademico | undefined,
  plan: PlanEstudio | undefined,
): CursoElegibility {
  if (!programa || programa.estado !== "activo") {
    return {
      selectable: false,
      reason: "El programa académico no está activo.",
    };
  }

  if (!plan || plan.estado !== "activo") {
    return {
      selectable: false,
      reason: "El plan de estudios no está activo.",
    };
  }

  if (course.nucleo !== "Síntesis") {
    return {
      selectable: false,
      reason: "El curso no pertenece al núcleo de Síntesis.",
    };
  }

  if (!course.asignadoANucleoSintesis) {
    return {
      selectable: false,
      reason: "El curso aún no está confirmado dentro del núcleo de Síntesis.",
    };
  }

  if (course.competenciasAsignadas <= 0) {
    return {
      selectable: false,
      reason: "El curso no tiene competencias asignadas.",
    };
  }

  if (!course.nivelCompromiso) {
    return {
      selectable: false,
      reason: "El curso no tiene nivel de compromiso I-R-A definido.",
    };
  }

  return {
    selectable: true,
    reason: "Curso disponible para la creación del ciclo.",
  };
}

export function enrichCiclos(ciclos: CicloMedicion[], catalogs: CicloCatalogs): CicloEnriched[] {
  return ciclos.map((ciclo) => {
    const seccional = catalogs.seccionales.find((item) => item.id === ciclo.seccionalId);
    const facultad = catalogs.facultades.find((item) => item.id === ciclo.facultadId);
    const programa = catalogs.programas.find((item) => item.id === ciclo.programaId);
    const plan = catalogs.planes.find((item) => item.id === ciclo.planId);
    const cursosSeleccionados = catalogs.cursos.filter((curso) => ciclo.cursoIds.includes(curso.id));

    return {
      ...ciclo,
      seccionalNombre: seccional?.nombre ?? "Sin seccional",
      facultadNombre: facultad?.nombre ?? "Sin facultad",
      programaNombre: programa?.nombre ?? "Sin programa",
      programaEstado: programa?.estado ?? "inactivo",
      planNombre: plan?.nombre ?? "Sin plan",
      planEstado: plan?.estado ?? "inactivo",
      cursosSeleccionados,
    };
  });
}

export function applyRoleScope(ciclos: CicloEnriched[], user: CurrentUser) {
  return ciclos.filter((ciclo) => {
    if (user.scope.programaId && ciclo.programaId !== user.scope.programaId) return false;
    if (user.scope.facultadId && ciclo.facultadId !== user.scope.facultadId) return false;
    if (user.scope.seccionalId && ciclo.seccionalId !== user.scope.seccionalId) return false;
    return true;
  });
}

export function applyCycleFilters(ciclos: CicloEnriched[], filters: CicloFilters) {
  return ciclos.filter((ciclo) => {
    if (filters.seccionalId && ciclo.seccionalId !== filters.seccionalId) return false;
    if (filters.facultadId && ciclo.facultadId !== filters.facultadId) return false;
    if (filters.programaId && ciclo.programaId !== filters.programaId) return false;
    if (filters.periodo && ciclo.periodo !== filters.periodo) return false;
    if (filters.estado && ciclo.estado !== filters.estado) return false;
    return true;
  });
}

export function getAvailablePeriods(ciclos: CicloEnriched[]) {
  return Array.from(new Set(ciclos.map((ciclo) => ciclo.periodo))).sort().reverse();
}

export function buildCycleFromForm(
  values: CicloFormState,
  catalogs: CicloCatalogs,
  user: CurrentUser,
  previous?: CicloEnriched | null,
): CicloMedicion {
  const programa = catalogs.programas.find((item) => item.id === values.programaId);
  const now = new Date().toISOString();

  return {
    id: previous?.id ?? `ciclo-${values.planId}-${Date.now()}`,
    nombre: values.nombre.trim() || `Ciclo ${buildPeriodFromStartDate(values.fechaInicio)}`,
    seccionalId: programa?.seccionalId ?? previous?.seccionalId ?? "",
    facultadId: programa?.facultadId ?? previous?.facultadId ?? "",
    programaId: values.programaId,
    planId: values.planId,
    periodo: buildPeriodFromStartDate(values.fechaInicio),
    duracionAnios: 1.5,
    fechaInicio: values.fechaInicio,
    fechaFin: addEighteenMonths(values.fechaInicio),
    estado: "activo",
    cursoIds: values.cursoIds,
    progreso: previous?.progreso ?? 0,
    responsableId: previous?.responsableId ?? user.id,
    responsableNombre: previous?.responsableNombre ?? user.nombre,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };
}

export function mapCycleToForm(ciclo: CicloEnriched): CicloFormState {
  return {
    nombre: ciclo.nombre,
    programaId: ciclo.programaId,
    planId: ciclo.planId,
    fechaInicio: ciclo.fechaInicio,
    cursoIds: ciclo.cursoIds,
  };
}