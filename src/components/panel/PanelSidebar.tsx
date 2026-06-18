import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  LockKeyhole,
  Plus,
} from "lucide-react";
import { navigateToRoute } from "../../app/appRoutes";
import { getCurrentMockUser } from "../../services/auth/mockUser";
import { mockBackend } from "../../services/mockBackend";
import type { MedicionRaDemoState } from "../../pages/panel/medicion-ra/types/medicionRA.persistence.types";
import { buildCoursesFromRealAssignments } from "../../pages/panel/medicion-ra/utils/medicionRA.assignments";
import { buildMedicionRaDemoStateId } from "../../pages/panel/medicion-ra/utils/medicionRA.persistence";
import {
  WORKFLOW_LOCKED_MESSAGE,
  getAcademicWorkflowLockedDescription,
  getAcademicWorkflowState,
  getCompletedAcademicWorkflowStepsCount,
  getNewAcademicPlanRenewalAvailability,
  isAcademicWorkflowBaseStepInherited,
  isAcademicWorkflowStep,
  isAcademicWorkflowStepCompleted,
  isAcademicWorkflowStepLocked,
  newAcademicPlanStartStep,
  startNewAcademicPlanFromCurrentProgress,
  useAcademicPlanInfo,
  useAcademicWorkflowProgress,
} from "./academicWorkflow";
import { panelNavigation, type PanelStepKey } from "./panelNavigation";
import LogoSecub from "../../assets/logos/logo-secub-blanco.webp";
import SidebarUserProfileMenu from "./SidebarUserProfileMenu";

interface PanelSidebarProps {
  currentStep: PanelStepKey;
}

type NavigationItem = (typeof panelNavigation)[number];

const SIDEBAR_STORAGE_KEY = "secub-sidebar-width";
const SIDEBAR_MIN_WIDTH = 240;
const SIDEBAR_DEFAULT_WIDTH = 320;
const SIDEBAR_MAX_WIDTH = 360;
const SIDEBAR_RESIZE_STEP = 12;

function clampSidebarWidth(width: number) {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));
}

function getInitialSidebarWidth() {
  if (typeof window === "undefined") return SIDEBAR_DEFAULT_WIDTH;

  const storedWidth = Number(window.localStorage.getItem(SIDEBAR_STORAGE_KEY));

  return Number.isFinite(storedWidth)
    ? clampSidebarWidth(storedWidth)
    : SIDEBAR_DEFAULT_WIDTH;
}

const academicStepKeys: PanelStepKey[] = [
  "perfil-egreso",
  "proposito-formacion",
  "competencias-ra",
  "mapeo-competencias",
  "ciclo",
  "asignar-ra",
];

const docenteAcademicStepKeys: PanelStepKey[] = [
  "perfil-egreso",
  "proposito-formacion",
  "competencias-ra",
  "mapeo-competencias",
  "medicion-ra",
];

function isDocenteProgressStep(stepKey: PanelStepKey) {
  return stepKey === "medicion-ra";
}

function getDocenteMeasurementProgress(user: ReturnType<typeof getCurrentMockUser>) {
  const assignedCourses = buildCoursesFromRealAssignments(user);
  const completedCourses = assignedCourses.filter((course) => {
    const stateId = buildMedicionRaDemoStateId({
      userId: user.id,
      cicloId: course.cycleId,
      courseId: course.id,
    });
    const state = mockBackend.getById<MedicionRaDemoState>("medicionesRa", stateId);
    const measuredAssignmentIds = new Set(state?.asignacionRaIds ?? []);
    const currentAssignmentIds = course.assignmentIds ?? [];
    const coversCurrentAssignments =
      currentAssignmentIds.length > 0 &&
      currentAssignmentIds.every((assignmentId) => measuredAssignmentIds.has(assignmentId));

    return Boolean((state?.completed || state?.isEvaluationLocked) && coversCurrentAssignments);
  }).length;
  const isCompleted = assignedCourses.length > 0 && completedCourses === assignedCourses.length;

  return {
    completed: isCompleted ? 1 : 0,
    total: 1,
    isCompleted,
  };
}

function getStepStatusLabel({
  isCurrent,
  isCompleted,
  isInherited,
  isLocked,
}: {
  isCurrent: boolean;
  isCompleted: boolean;
  isInherited: boolean;
  isLocked: boolean;
}) {
  if (isLocked) return "Bloqueado";
  if (isInherited) return "Heredado";
  if (isCompleted) return "Completado";
  if (isCurrent) return "Paso actual";
  return "Pendiente";
}

export default function PanelSidebar({ currentStep }: PanelSidebarProps) {
  const sidebarRef = useRef<HTMLElement | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(getInitialSidebarWidth);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const currentUser = getCurrentMockUser();
  const isDocente = currentUser.role === "docente";
  const academicMenuId = useId();
  const dashboardItem =
    panelNavigation.find((item) => item.key === "dashboard") ??
    panelNavigation[0];

  const academicKeys =
    isDocente ? docenteAcademicStepKeys : academicStepKeys;
  const academicItems = academicKeys
    .map((key) => panelNavigation.find((item) => item.key === key))
    .filter((item): item is NavigationItem => Boolean(item));
  const isCurrentInsideAcademicWorkflow = academicItems.some(
    (item) => item.key === currentStep,
  );
  const [isAcademicMenuOpen, setIsAcademicMenuOpen] = useState(true);

  const workflowProgress = useAcademicWorkflowProgress();
  const { activePlan } = useAcademicPlanInfo();
  const docenteMeasurementProgress = useMemo(
    () => getDocenteMeasurementProgress(currentUser),
    [currentUser, workflowProgress],
  );
  const workflowState = getAcademicWorkflowState(workflowProgress);
  const completedStepsCount = isDocente
    ? docenteMeasurementProgress.completed
    : getCompletedAcademicWorkflowStepsCount(workflowProgress);
  const totalStepsCount = isDocente
    ? docenteMeasurementProgress.total
    : academicItems.length;
  const isWorkflowCompleted = !isDocente && workflowState === "completed";
  const renewalAvailability =
    getNewAcademicPlanRenewalAvailability(workflowProgress);
  const canStartNewAcademicPlan = renewalAvailability.isAvailable;
  const canManageNewAcademicPlan = !isDocente;
  const newAcademicPlanLockedMessage =
    renewalAvailability.lockedMessage ??
    "Solo puedes crear un nuevo plan académico cuando el ciclo actual haya cumplido 1.5 años.";
  const newAcademicPlanTarget =
    academicItems.find((item) => item.key === newAcademicPlanStartStep) ??
    academicItems[2] ??
    academicItems[0];

  const updateSidebarWidth = useCallback(
    (nextWidth: number | ((currentWidth: number) => number)) => {
      setSidebarWidth((currentWidth) => {
        const resolvedWidth =
          typeof nextWidth === "function" ? nextWidth(currentWidth) : nextWidth;
        const clampedWidth = clampSidebarWidth(resolvedWidth);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            SIDEBAR_STORAGE_KEY,
            String(clampedWidth),
          );
        }

        return clampedWidth;
      });
    },
    [],
  );

  useEffect(() => {
    if (!isResizingSidebar) return;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      updateSidebarWidth(event.clientX - sidebarLeft);
    };

    const handlePointerUp = () => {
      setIsResizingSidebar(false);
    };

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isResizingSidebar, updateSidebarWidth]);

  const handleResizePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsResizingSidebar(true);
  };

  const handleResizeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateSidebarWidth((currentWidth) => currentWidth - SIDEBAR_RESIZE_STEP);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      updateSidebarWidth((currentWidth) => currentWidth + SIDEBAR_RESIZE_STEP);
    }

    if (event.key === "Home") {
      event.preventDefault();
      updateSidebarWidth(SIDEBAR_MIN_WIDTH);
    }

    if (event.key === "End") {
      event.preventDefault();
      updateSidebarWidth(SIDEBAR_MAX_WIDTH);
    }
  };

  const goTo = (href: string) => {
    // Mantiene el rol demo en la navegación. Cuando exista Auth real, el rol saldrá del usuario autenticado.
    navigateToRoute(href, { preserveSearch: true });
  };

  const handleStartNewAcademicPlan = () => {
    if (!canStartNewAcademicPlan) {
      window.alert(newAcademicPlanLockedMessage);
      return;
    }

    try {
      startNewAcademicPlanFromCurrentProgress(workflowProgress);

      if (newAcademicPlanTarget) {
        goTo(newAcademicPlanTarget.href);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : newAcademicPlanLockedMessage;
      window.alert(message);
    }
  };

  const academicProgress = useMemo(() => {
    return academicItems.map((item, index) => {
      const isWorkflowStep = isAcademicWorkflowStep(item.key);
      const isCurrent = item.key === currentStep;
      const isDocenteTrackedStep = isDocente && isDocenteProgressStep(item.key);
      const isAccessOnlyForDocente = isDocente && !isDocenteTrackedStep;
      const isCompleted = isDocente
        ? isDocenteTrackedStep && docenteMeasurementProgress.isCompleted
        : isWorkflowStep
          ? isAcademicWorkflowStepCompleted(item.key, workflowProgress)
          : false;
      const isLocked = !isDocente && isWorkflowStep
        ? isAcademicWorkflowStepLocked(item.key, workflowProgress)
        : false;
      const isInherited = !isDocente && isWorkflowStep
        ? isAcademicWorkflowBaseStepInherited(item.key, activePlan)
        : false;

      return {
        ...item,
        stepNumber: index + 1,
        isCurrent,
        isCompleted,
        isLocked,
        isInherited,
        isAccessOnlyForDocente,
        statusLabel: isAccessOnlyForDocente
          ? "Acceso de consulta"
          : getStepStatusLabel({
              isCurrent,
              isCompleted,
              isInherited,
              isLocked,
            }),
      };
    });
  }, [
    academicItems,
    activePlan,
    currentStep,
    docenteMeasurementProgress.isCompleted,
    isDocente,
    workflowProgress,
  ]);

  const DashboardIcon = BarChart3;

  const renderAcademicItem = (
    item: (typeof academicProgress)[number],
    completedView = false,
  ) => {
    const ItemIcon = item.icon;
    const lockedDescription = item.isLocked
      ? getAcademicWorkflowLockedDescription(item.key)
      : item.label;
    const shouldShowProgressStatus =
      !completedView && item.isCurrent && !item.isCompleted && !item.isLocked;

    const handleClick = () => {
      if (item.isLocked) {
        window.alert(WORKFLOW_LOCKED_MESSAGE);
        return;
      }

      goTo(item.href);
    };

    if (completedView) {
      return (
        <li key={item.key}>
          <button
            type="button"
            onClick={handleClick}
            title={lockedDescription}
            disabled={item.isLocked}
            aria-current={item.isCurrent ? "page" : undefined}
            aria-label={`Sección: ${item.label}. Estado: ${item.statusLabel}.`}
            className={[
              "group flex w-full items-center gap-2.5 rounded-[12px] border border-transparent px-2.5 py-2 text-left transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
              item.isLocked
                ? "cursor-not-allowed opacity-55"
                : item.isCurrent
                  ? "cursor-pointer border-l-2 border-l-[var(--color-success)] bg-[color:rgba(118,202,102,0.12)] text-[var(--color-white)] shadow-[inset_0_0_0_1px_rgba(118,202,102,0.10)]"
                  : "cursor-pointer text-[var(--color-secondary-3)] hover:bg-[color:rgba(255,255,255,0.055)] hover:text-[var(--color-white)]",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-pill)] transition-colors",
                item.isCurrent
                  ? "bg-[color:rgba(118,202,102,0.14)] text-[var(--color-success)]"
                  : "text-[color:rgba(217,221,231,0.70)] group-hover:text-[var(--color-white)]",
              ].join(" ")}
              aria-hidden="true"
            >
              <ItemIcon className="text-[0.78rem]" />
            </span>

            <span className="min-w-0 flex-1 truncate font-heading text-[0.86rem] font-semibold leading-5">
              {item.label}
            </span>
          </button>
        </li>
      );
    }

    return (
      <li key={item.key}>
        <button
          type="button"
          onClick={handleClick}
          title={lockedDescription}
          disabled={item.isLocked}
          aria-current={item.isCurrent ? "step" : undefined}
          aria-label={`Paso ${item.stepNumber}: ${item.label}. Estado: ${item.statusLabel}.`}
          className={[
            "group flex w-full items-start gap-2.5 rounded-[13px] border border-transparent px-2.5 py-2.5 text-left transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
            item.isLocked
              ? "cursor-not-allowed opacity-50"
              : item.isCurrent
                ? "cursor-pointer border-[color:rgba(14,101,217,0.22)] bg-[color:rgba(14,101,217,0.16)] text-[var(--color-white)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]"
                : "cursor-pointer hover:bg-[color:rgba(255,255,255,0.05)]",
          ].join(" ")}
        >
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center"
            aria-hidden="true"
          >
            <span
              className={[
                "flex h-3.5 w-3.5 items-center justify-center rounded-[var(--radius-pill)] border transition-colors",
                item.isLocked
                  ? "border-[color:rgba(179,206,226,0.30)] text-[color:rgba(179,206,226,0.30)]"
                  : item.isCompleted
                    ? "border-[var(--color-success)] bg-[color:rgba(118,202,102,0.12)] text-[var(--color-success)]"
                    : item.isCurrent
                      ? "border-[var(--color-info)] text-[var(--color-info)]"
                      : "border-[color:rgba(179,206,226,0.42)] text-[color:rgba(179,206,226,0.62)] group-hover:border-[color:rgba(179,206,226,0.62)]",
              ].join(" ")}
            >
              {item.isCompleted ? (
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              ) : item.isCurrent ? (
                <span className="h-1.5 w-1.5 rounded-[var(--radius-pill)] bg-current" />
              ) : null}
            </span>
          </span>

          <span className="min-w-0 flex-1">
            <span
              className={[
                "block font-heading text-[0.86rem] font-semibold leading-[1.25] transition-colors",
                item.isCurrent && !item.isLocked
                  ? "text-[var(--color-white)]"
                  : item.isLocked
                    ? "text-[color:rgba(217,221,231,0.58)]"
                    : item.isCompleted
                      ? "text-[var(--color-secondary-2)] group-hover:text-[var(--color-white)]"
                      : "text-[var(--color-secondary-3)] group-hover:text-[var(--color-white)]",
              ].join(" ")}
            >
              {item.label}
            </span>

            {shouldShowProgressStatus ? (
              <span className="mt-1 block text-[0.75rem] font-semibold leading-4 text-[var(--color-info)]">
                En progreso
              </span>
            ) : null}
          </span>
        </button>
      </li>
    );
  };

  return (
    <aside
      ref={sidebarRef}
      className="sticky top-0 hidden h-screen shrink-0 self-start xl:flex"
      aria-label="Barra lateral del panel SECUB"
      style={{
        width: `${sidebarWidth}px`,
        minWidth: `${SIDEBAR_MIN_WIDTH}px`,
        maxWidth: `${SIDEBAR_MAX_WIDTH}px`,
      }}
    >
      <div className="relative flex h-screen w-full flex-col overflow-hidden border-r border-[color:rgba(217,221,231,0.10)] bg-[var(--color-footer-dark)] text-[var(--color-white)]">
        <div className="shrink-0 border-b border-[color:rgba(217,221,231,0.10)] px-4 pb-4 pt-5">
          <button
            type="button"
            onClick={() => goTo(dashboardItem.href)}
            className="inline-flex rounded-[12px] p-1.5 transition-colors hover:bg-[color:rgba(255,255,255,0.055)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]"
            aria-label="Ir al dashboard de SECUB"
          >
            <img
              src={LogoSecub}
              alt="SECUB"
              className="h-9 w-auto object-contain"
            />
          </button>
        </div>

        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-4">
          <nav
            className="space-y-3"
            aria-label="Navegación principal del panel"
          >
            <p className="px-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[color:rgba(179,206,226,0.72)]">
              Navegación
            </p>

            <ul className="space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => goTo(dashboardItem.href)}
                  aria-current={
                    currentStep === dashboardItem.key ? "page" : undefined
                  }
                  className={[
                    "group flex w-full items-center gap-2.5 rounded-[14px] border border-transparent px-3 py-2.5 text-left text-[0.875rem] font-semibold leading-5 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
                    currentStep === dashboardItem.key
                      ? "border-l-2 border-l-[var(--color-success)] bg-[color:rgba(118,202,102,0.13)] text-[var(--color-white)] shadow-[inset_0_0_0_1px_rgba(118,202,102,0.12)]"
                      : "text-[var(--color-secondary-3)] hover:bg-[color:rgba(255,255,255,0.055)] hover:text-[var(--color-white)]",
                  ].join(" ")}
                >
                  <DashboardIcon
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">Estado del ciclo</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  aria-expanded={isAcademicMenuOpen}
                  aria-controls={academicMenuId}
                  onClick={() =>
                    setIsAcademicMenuOpen((currentValue) => !currentValue)
                  }
                  className={[
                    "group flex w-full items-center gap-2.5 rounded-[14px] border border-transparent px-3 py-2.5 text-left text-[0.875rem] font-semibold leading-5 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
                    isCurrentInsideAcademicWorkflow
                      ? "border-l-2 border-l-[var(--color-success)] bg-[color:rgba(118,202,102,0.13)] text-[var(--color-white)] shadow-[inset_0_0_0_1px_rgba(118,202,102,0.12)]"
                      : "text-[var(--color-secondary-3)] hover:bg-[color:rgba(255,255,255,0.055)] hover:text-[var(--color-white)]",
                  ].join(" ")}
                >
                  <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">
                    Gestión Académica
                  </span>
                  <span className="rounded-[var(--radius-pill)] bg-[color:rgba(118,202,102,0.12)] px-2 py-0.5 text-[0.72rem] font-bold leading-4 text-[var(--color-success)]">
                    {completedStepsCount}/{totalStepsCount}
                  </span>
                  <ChevronDown
                    className={[
                      "h-3.5 w-3.5 shrink-0 text-[var(--color-secondary-2)] transition-transform",
                      isAcademicMenuOpen ? "rotate-180" : "",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                </button>

                {isAcademicMenuOpen ? (
                  <div
                    id={academicMenuId}
                    className={
                      isWorkflowCompleted
                        ? "mt-2"
                        : "ml-4 mt-2 border-l border-[color:rgba(217,221,231,0.12)] pl-2.5"
                    }
                  >
                    {isDocente ? (
                      <nav aria-label="Accesos y progreso de Docencia">
                        <ol className="space-y-1">
                          {academicProgress.map((item) =>
                            renderAcademicItem(
                              item,
                              item.isAccessOnlyForDocente,
                            ),
                          )}
                        </ol>
                      </nav>
                    ) : isWorkflowCompleted ? (
                      <nav aria-label="Secciones completadas de Gestión Académica">
                        <ol className="space-y-1">
                          {academicProgress.map((item) =>
                            renderAcademicItem(item, true),
                          )}
                        </ol>
                      </nav>
                    ) : (
                      <div className="space-y-2">
                        <nav aria-label="Flujo de Gestión Académica">
                          <ol className="space-y-1">
                            {academicProgress.map((item) =>
                              renderAcademicItem(item),
                            )}
                          </ol>
                        </nav>
                      </div>
                    )}

                    {canManageNewAcademicPlan && isWorkflowCompleted ? (
                      <button
                        type="button"
                        onClick={handleStartNewAcademicPlan}
                        aria-disabled={!canStartNewAcademicPlan}
                        title={
                          canStartNewAcademicPlan
                            ? "Crear un nuevo plan académico desde el paso 3"
                            : newAcademicPlanLockedMessage
                        }
                        className={[
                          "group mt-2 flex w-full items-center gap-2.5 rounded-[14px] border border-transparent px-2.5 py-2 text-left transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
                          canStartNewAcademicPlan
                            ? "cursor-pointer bg-[color:rgba(248,129,29,0.10)] hover:bg-[color:rgba(248,129,29,0.16)]"
                            : "cursor-not-allowed bg-[color:rgba(255,255,255,0.045)] opacity-65",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-pill)]",
                            canStartNewAcademicPlan
                              ? "bg-[color:rgba(248,129,29,0.16)] text-[var(--color-primary)]"
                              : "text-[var(--color-secondary-3)]",
                          ].join(" ")}
                          aria-hidden="true"
                        >
                          {canStartNewAcademicPlan ? (
                            <Plus className="h-3.5 w-3.5" />
                          ) : (
                            <LockKeyhole className="h-3.5 w-3.5" />
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className={[
                              "block text-[0.75rem] font-bold uppercase tracking-[0.12em]",
                              canStartNewAcademicPlan
                                ? "text-[var(--color-warning)]"
                                : "text-[var(--color-secondary-2)]",
                            ].join(" ")}
                          >
                            {canStartNewAcademicPlan
                              ? "Nuevo ciclo"
                              : "Bloqueado"}
                          </span>
                          <span className="block truncate font-heading text-[0.82rem] font-medium leading-4 text-[var(--color-white)]">
                            Ciclo nuevo
                          </span>
                        </span>
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            </ul>
          </nav>
        </div>

        <div className="shrink-0 space-y-3 border-t border-[color:rgba(217,221,231,0.10)] px-3 py-3">
          <SidebarUserProfileMenu />
        </div>

        <div
          role="separator"
          tabIndex={0}
          aria-label="Redimensionar barra lateral"
          aria-orientation="vertical"
          aria-valuemin={SIDEBAR_MIN_WIDTH}
          aria-valuemax={SIDEBAR_MAX_WIDTH}
          aria-valuenow={sidebarWidth}
          onPointerDown={handleResizePointerDown}
          onKeyDown={handleResizeKeyDown}
          className={[
            "absolute inset-y-0 right-0 z-20 w-2 translate-x-1 cursor-col-resize touch-none outline-none transition-colors",
            "after:absolute after:inset-y-3 after:left-1/2 after:w-px after:-translate-x-1/2 after:rounded-full after:bg-[color:rgba(217,221,231,0.12)] after:opacity-0 after:transition-opacity",
            "hover:after:opacity-100 focus-visible:after:opacity-100 focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
            isResizingSidebar ? "after:opacity-100" : "",
          ].join(" ")}
        />
      </div>
    </aside>
  );
}
