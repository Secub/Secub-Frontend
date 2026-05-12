import { useEffect, useMemo, useState } from "react";
import { GoDownload } from "react-icons/go";
import { PanelLayout } from "../../../components/panel";
import { Button, Modal } from "../../../components/ui";
import CompetenceResultsPanel from "./components/CompetenceResultsPanel";
import CoursesMeasurementTable from "./components/CoursesMeasurementTable";
import DashboardEmptyState from "./components/DashboardEmptyState";
import DashboardFilters from "./components/DashboardFilters";
import MeasurementCycleCard from "./components/MeasurementCycleCard";
import MeasurementSummaryCards, {
  buildSupervisorSummaryItems,
  buildTeacherSummaryItems,
} from "./components/MeasurementSummaryCards";
import ResultsMeasurementPanel from "./components/ResultsMeasurementPanel";
import { getCurrentDashboardUser, getDashboardData } from "./dashboard.mock";
import type {
  DashboardFiltersState,
  EnrichedCourse,
  EnrichedCycle,
  EnrichedRaResult,
} from "./dashboard.types";
import {
  INITIAL_DASHBOARD_FILTERS,
  applyDashboardFiltersToCourses,
  applyDashboardFiltersToCycles,
  applyUserScopeToCourses,
  applyUserScopeToCycles,
  enrichCourses,
  enrichCycles,
  getAvailableCompetences,
  getDashboardMetrics,
  getRaResultsForCourses,
  simulateEvidenceDownload,
  simulateReportDownload,
  simulateTeacherEmail,
} from "./dashboard.utils";

type DashboardView = "control" | "courses" | "detail" | "results";

const DASHBOARD_PATH = "/panel/dashboard";

const user = getCurrentDashboardUser();
const dashboardData = getDashboardData();

function getCycleLabel(cycle: EnrichedCycle | null) {
  return cycle?.name ?? "el ciclo seleccionado";
}

function getSearchParam(name: string) {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

function getInitialView(): DashboardView {
  const view = getSearchParam("view");

  if (view === "courses" || view === "detail" || view === "results") {
    return view;
  }

  return "control";
}

function getInitialFilters(): DashboardFiltersState {
  return {
    ...INITIAL_DASHBOARD_FILTERS,
    cycleId: getSearchParam("cycleId"),
    status: getSearchParam("status"),
  };
}

function buildDashboardHref(params?: {
  view?: DashboardView;
  cycleId?: string;
  courseId?: string;
  status?: string;
}) {
  const currentParams = new URLSearchParams(window.location.search);
  const nextParams = new URLSearchParams();

  nextParams.set("role", currentParams.get("role") ?? user.role);

  const scenario = currentParams.get("scenario");
  if (scenario) {
    nextParams.set("scenario", scenario);
  }

  if (params?.view && params.view !== "control") {
    nextParams.set("view", params.view);
  }

  if (params?.cycleId) {
    nextParams.set("cycleId", params.cycleId);
  }

  if (params?.courseId) {
    nextParams.set("courseId", params.courseId);
  }

  if (params?.status) {
    nextParams.set("status", params.status);
  }

  return `${DASHBOARD_PATH}?${nextParams.toString()}`;
}

export default function DashboardPage() {
  const [view, setView] = useState<DashboardView>(getInitialView);
  const [filters, setFilters] = useState<DashboardFiltersState>(getInitialFilters);
  const [selectedCycleId, setSelectedCycleId] = useState(() => getSearchParam("cycleId"));
  const [detailCourseId, setDetailCourseId] = useState(() => getSearchParam("courseId"));
  const [detailCompetenceId, setDetailCompetenceId] = useState("");
  const [selectedRa, setSelectedRa] = useState<EnrichedRaResult | null>(null);
  const [notifyCourse, setNotifyCourse] = useState<EnrichedCourse | null>(null);
  const [reportCycle, setReportCycle] = useState<EnrichedCycle | null>(null);
  const [selectedReportCompetences, setSelectedReportCompetences] = useState<string[]>([]);

  const isTeacher = user.role === "docente";

  const enrichedCycles = useMemo(
    () => enrichCycles(dashboardData.cycles, dashboardData.courses, dashboardData.catalogs),
    [],
  );

  const enrichedCourses = useMemo(
    () => enrichCourses(dashboardData.courses, dashboardData.cycles, dashboardData.catalogs),
    [],
  );

  const scopedCycles = useMemo(
    () => applyUserScopeToCycles(enrichedCycles, user),
    [enrichedCycles],
  );

  const scopedCourses = useMemo(
    () => applyUserScopeToCourses(enrichedCourses, user),
    [enrichedCourses],
  );

  const filteredCycles = useMemo(
    () => applyDashboardFiltersToCycles(scopedCycles, filters),
    [filters, scopedCycles],
  );

  const filteredCourses = useMemo(
    () => applyDashboardFiltersToCourses(scopedCourses, filters),
    [filters, scopedCourses],
  );

  const selectedCycle = useMemo(() => {
    const requestedCycleId = selectedCycleId || filters.cycleId;

    if (!requestedCycleId) return null;

    return scopedCycles.find((cycle) => cycle.id === requestedCycleId) ?? null;
  }, [filters.cycleId, scopedCycles, selectedCycleId]);

  const coursesForSelectedView = useMemo(() => {
    if (!selectedCycle) return filteredCourses;

    return filteredCourses.filter((course) => course.cycleId === selectedCycle.id);
  }, [filteredCourses, selectedCycle]);

  const detailSourceCourses = useMemo(() => {
    if (detailCourseId) {
      return scopedCourses.filter((course) => course.id === detailCourseId);
    }

    if (selectedCycle) {
      return scopedCourses.filter((course) => course.cycleId === selectedCycle.id);
    }

    return scopedCourses;
  }, [detailCourseId, scopedCourses, selectedCycle]);

  const detailCoursesForSelect = useMemo(() => {
    if (selectedCycle) {
      return scopedCourses.filter((course) => course.cycleId === selectedCycle.id);
    }

    return scopedCourses;
  }, [scopedCourses, selectedCycle]);

  const detailResults = useMemo(
    () => getRaResultsForCourses(detailSourceCourses, dashboardData.catalogs),
    [detailSourceCourses],
  );

  const consolidatedSourceCourses = useMemo(() => {
    if (selectedCycle) {
      return scopedCourses.filter((course) => course.cycleId === selectedCycle.id);
    }

    return filteredCourses;
  }, [filteredCourses, scopedCourses, selectedCycle]);

  const consolidatedResults = useMemo(
    () => getRaResultsForCourses(consolidatedSourceCourses, dashboardData.catalogs),
    [consolidatedSourceCourses],
  );

  const reportCycleCourses = useMemo(() => {
    if (!reportCycle) return [];
    return scopedCourses.filter((course) => course.cycleId === reportCycle.id);
  }, [reportCycle, scopedCourses]);

  const availableReportCompetences = useMemo(
    () => getAvailableCompetences(reportCycleCourses, dashboardData.catalogs),
    [reportCycleCourses],
  );

  const metrics = getDashboardMetrics(scopedCourses, scopedCycles);

  useEffect(() => {
    if (selectedCycleId && !scopedCycles.some((cycle) => cycle.id === selectedCycleId)) {
      setSelectedCycleId("");
    }
  }, [scopedCycles, selectedCycleId]);

  useEffect(() => {
    if (detailCourseId && !scopedCourses.some((course) => course.id === detailCourseId)) {
      setDetailCourseId("");
    }
  }, [detailCourseId, scopedCourses]);

  useEffect(() => {
    setSelectedReportCompetences((current) => {
      const availableIds = new Set(availableReportCompetences.map((competence) => competence.id));
      const filtered = current.filter((competenceId) => availableIds.has(competenceId));

      if (filtered.length > 0) return filtered;
      return availableReportCompetences[0] ? [availableReportCompetences[0].id] : [];
    });
  }, [availableReportCompetences]);

  const handleFilterChange = <K extends keyof DashboardFiltersState>(
    key: K,
    value: DashboardFiltersState[K],
  ) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };

      if (key === "seccionalId") {
        next.facultadId = "";
        next.programaId = "";
        next.planId = "";
        next.cycleId = "";
      }

      if (key === "facultadId") {
        next.programaId = "";
        next.planId = "";
        next.cycleId = "";
      }

      if (key === "programaId") {
        next.planId = "";
        next.cycleId = "";
      }

      if (key === "planId") {
        next.cycleId = "";
      }

      return next;
    });

    if (key === "cycleId") {
      setSelectedCycleId(String(value));
      setDetailCourseId("");
      setDetailCompetenceId("");
    }
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_DASHBOARD_FILTERS);
    setSelectedCycleId("");
    setDetailCourseId("");
    setDetailCompetenceId("");
  };

  const handleViewPending = (cycle: EnrichedCycle) => {
    setSelectedCycleId(cycle.id);
    setDetailCourseId("");
    setDetailCompetenceId("");
    setFilters((current) => ({
      ...current,
      cycleId: cycle.id,
      status: "pendiente",
      competenceId: "",
      teacherId: "",
    }));
    setView("courses");
  };

  const handleViewResultsFromCycle = (cycle: EnrichedCycle) => {
    setSelectedCycleId(cycle.id);
    setDetailCourseId("");
    setDetailCompetenceId("");
    setFilters((current) => ({
      ...current,
      cycleId: cycle.id,
      status: "",
      competenceId: "",
      teacherId: "",
    }));
    setView("results");
  };

  const handleViewCourseDetail = (course: EnrichedCourse) => {
    setSelectedCycleId(course.cycleId);
    setDetailCourseId(course.id);
    setDetailCompetenceId("");
    setFilters((current) => ({
      ...current,
      cycleId: course.cycleId,
      status: "",
      competenceId: "",
      teacherId: "",
    }));
    setView("detail");
  };

  const handleMeasureCourse = (course: EnrichedCourse) => {
    window.location.href = `/panel/medicion-ra?role=docente&courseId=${course.id}`;
  };

  const handleDownloadCycleReport = (cycle: EnrichedCycle) => {
    if (isTeacher) {
      simulateReportDownload(`Reporte individual docente - ${cycle.name}`);
      return;
    }

    setReportCycle(cycle);
  };

  const handleToggleReportCompetence = (competenceId: string) => {
    setSelectedReportCompetences((current) =>
      current.includes(competenceId)
        ? current.filter((item) => item !== competenceId)
        : [...current, competenceId],
    );
  };

  const layoutTitle =
    view === "courses"
      ? isTeacher
        ? "Mis Cursos"
        : "Ciclos"
      : view === "detail"
        ? "Ver Detalle"
        : view === "results"
          ? "Resultados de Medición"
          : "Panel de Control";

  const layoutDescription =
    view === "control"
      ? `${user.label} - Usuario`
      : view === "courses"
        ? "Panel de Medición"
        : `Panel de Medición · ${getCycleLabel(selectedCycle)}`;

  const controlBreadcrumbHref = buildDashboardHref({
    view: "control",
  });

  const coursesBreadcrumbHref = buildDashboardHref({
    view: "courses",
    cycleId: selectedCycleId || filters.cycleId,
    status: "pendiente",
  });

  const coursesBreadcrumbLabel = isTeacher ? "Mis cursos" : "Cursos pendientes";

  const breadcrumbItems =
    view === "control"
      ? [{ label: "Panel de control" }]
      : view === "courses"
        ? [
            {
              label: "Panel de control",
              href: controlBreadcrumbHref,
            },
            {
              label: coursesBreadcrumbLabel,
            },
          ]
        : view === "detail"
          ? [
              {
                label: "Panel de control",
                href: controlBreadcrumbHref,
              },
              {
                label: coursesBreadcrumbLabel,
                href: coursesBreadcrumbHref,
              },
              {
                label: "Ver detalle",
              },
            ]
          : [
              {
                label: "Panel de control",
                href: controlBreadcrumbHref,
              },
              {
                label: "Resultados de medición",
              },
            ];

  if (isTeacher && scopedCourses.length === 0) {
    return (
      <PanelLayout
        currentStep="dashboard"
        title="Panel de Control"
        description={`${user.label} - Usuario`}
        breadcrumbItems={[{ label: "Panel de control" }]}
      >
        <DashboardEmptyState
          title="No tienes cursos asignados a ciclos de medición"
          description="Cuando tengas cursos de Síntesis vinculados a un ciclo de medición, aquí verás el avance, los pendientes y los reportes individuales disponibles."
          helperText="Este estado cubre el escenario en el que el docente no tiene cursos de Síntesis asignados a ningún ciclo activo o finalizado."
        />
      </PanelLayout>
    );
  }

  if (!isTeacher && scopedCycles.length === 0) {
    return (
      <PanelLayout
        currentStep="dashboard"
        title="Panel de Control"
        description={`${user.label} - Usuario`}
        breadcrumbItems={[{ label: "Panel de control" }]}
      >
        <DashboardEmptyState
          title="Aún no se han creado ciclos de medición"
          description="Para visualizar avances, pendientes y reportes consolidados primero se debe crear un ciclo de medición desde el módulo Creación del ciclo."
          helperText="La creación del ciclo es exclusiva del Director de Programa. Los demás roles solo consultan la información disponible."
        />
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      currentStep="dashboard"
      title={layoutTitle}
      description={layoutDescription}
      breadcrumbItems={breadcrumbItems}
    >
      {view === "control" ? (
        <div className="space-y-6">
          <MeasurementSummaryCards
            items={
              isTeacher
                ? buildTeacherSummaryItems(metrics)
                : buildSupervisorSummaryItems(metrics)
            }
          />

          <DashboardFilters
            user={user}
            catalogs={dashboardData.catalogs}
            cycles={scopedCycles}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          <section className="space-y-5">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
                Ciclos de Medición
              </h2>
            </div>

            {filteredCycles.length > 0 ? (
              <div className="grid gap-5">
                {filteredCycles.map((cycle) => (
                  <MeasurementCycleCard
                    key={cycle.id}
                    cycle={cycle}
                    isTeacher={isTeacher}
                    onViewPending={handleViewPending}
                    onViewResults={handleViewResultsFromCycle}
                    onDownloadReport={handleDownloadCycleReport}
                  />
                ))}
              </div>
            ) : (
              <DashboardEmptyState
                title="No hay ciclos para los filtros seleccionados"
                description="Ajusta los filtros para consultar otros periodos, programas o estados de medición."
              />
            )}
          </section>
        </div>
      ) : null}

      {view === "courses" ? (
        <div className="space-y-6">
          <DashboardFilters
            user={user}
            catalogs={dashboardData.catalogs}
            cycles={scopedCycles}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          <CoursesMeasurementTable
            courses={coursesForSelectedView}
            mode={isTeacher ? "teacher" : "supervisor"}
            onMeasureCourse={handleMeasureCourse}
            onViewResults={handleViewCourseDetail}
            onNotifyTeacher={setNotifyCourse}
          />
        </div>
      ) : null}

      {view === "detail" ? (
        <ResultsMeasurementPanel
          results={detailResults}
          courses={detailCoursesForSelect}
          selectedCourseId={detailCourseId}
          selectedCompetenceId={detailCompetenceId}
          onCourseChange={(courseId) => {
            setDetailCourseId(courseId);
            setDetailCompetenceId("");
          }}
          onCompetenceChange={setDetailCompetenceId}
          onDownloadFile={simulateEvidenceDownload}
          onOpenRaDetail={setSelectedRa}
        />
      ) : null}

      {view === "results" ? (
        <CompetenceResultsPanel
          results={consolidatedResults}
          onDownloadFile={simulateEvidenceDownload}
          onOpenRaDetail={setSelectedRa}
        />
      ) : null}

      <Modal
        open={Boolean(selectedRa)}
        title="Detalle Informativo del RA"
        description={selectedRa ? `${selectedRa.raCode} · ${selectedRa.raName}` : undefined}
        size="md"
        onClose={() => setSelectedRa(null)}
      >
        {selectedRa ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[var(--color-gray-3)]">
              {selectedRa.raDescription}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[var(--radius-md)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gray-4)]">
                  Cumplimiento
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-secondary-4)]">
                  {selectedRa.compliance}%
                </p>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gray-4)]">
                  Curso
                </p>
                <p className="mt-2 font-heading text-base font-semibold text-[var(--color-secondary-4)]">
                  {selectedRa.courseName}
                </p>
              </div>
            </div>

            {selectedRa.improvementPlanSummary ? (
              <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[color:rgba(251,199,86,0.16)] p-4">
                <p className="font-heading text-sm font-semibold text-[var(--color-secondary-4)]">
                  Plan de mejora sugerido
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">
                  {selectedRa.improvementPlanSummary}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(notifyCourse)}
        title="Enviar correo de incumplimiento"
        description="Esta acción es una simulación. Luego se conectará con el servicio real de notificaciones institucionales."
        size="md"
        onClose={() => setNotifyCourse(null)}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setNotifyCourse(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (notifyCourse) simulateTeacherEmail(notifyCourse);
                setNotifyCourse(null);
              }}
            >
              Confirmar envío simulado
            </Button>
          </div>
        }
      >
        {notifyCourse ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-5">
            <p className="text-sm leading-6 text-[var(--color-gray-3)]">
              Se notificará a <strong>{notifyCourse.teacherName}</strong> por el curso{" "}
              <strong>{notifyCourse.name}</strong>, que tiene{" "}
              <strong>{notifyCourse.pendingRa}</strong> RA pendientes de medición.
            </p>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(reportCycle)}
        title="Reporte consolidado PDF"
        description="Selecciona una o varias competencias antes de generar el reporte consolidado."
        size="lg"
        onClose={() => setReportCycle(null)}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setReportCycle(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              leftIcon={<GoDownload className="text-lg" />}
              disabled={!reportCycle || selectedReportCompetences.length === 0}
              onClick={() => {
                simulateReportDownload(
                  `Reporte consolidado ${reportCycle?.name ?? "sin ciclo"} - ${
                    selectedReportCompetences.length
                  } competencia(s)`,
                );
                setReportCycle(null);
              }}
            >
              Descargar consolidado
            </Button>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          {availableReportCompetences.map((competence) => {
            const checked = selectedReportCompetences.includes(competence.id);

            return (
              <label
                key={competence.id}
                className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-gray-6)] bg-white p-4 shadow-sm transition-colors hover:bg-[var(--color-surface-soft)]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleToggleReportCompetence(competence.id)}
                  className="mt-1 h-4 w-4 accent-[var(--color-secondary-1)]"
                />
                <span>
                  <span className="block font-heading text-sm font-semibold text-[var(--color-secondary-4)]">
                    {competence.code} · {competence.name}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--color-gray-4)]">
                    {competence.learningResults.length} RA asociados al ciclo seleccionado.
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </Modal>
    </PanelLayout>
  );
}
