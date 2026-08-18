import { useId, useMemo, useState } from "react";
import { navigateToRoute } from "../../../app/appRoutes";
import { getCurrentMockUser } from "../../../services/auth/mockUser";
import { canStartNewAcademicPlan as canRoleStartNewAcademicPlan } from "../../../services/auth/roleAccess";
import { showNotification } from "../../../shared/feedback";
import { SecubIcon } from "../../ui";
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
} from "../academicWorkflow";
import { panelNavigation, type PanelStepKey } from "../panelNavigation";
import {
  academicStepKeys,
  docenteAcademicStepKeys,
  getDocenteMeasurementProgress,
  getStepStatusLabel,
  isDocenteProgressStep,
} from "./panelSidebar.model";

type NavigationItem = (typeof panelNavigation)[number];

interface PanelAcademicNavigationProps {
  currentStep: PanelStepKey;
  onNavigate?: () => void;
}

export default function PanelAcademicNavigation({
  currentStep,
  onNavigate,
}: PanelAcademicNavigationProps) {
  const currentUser = getCurrentMockUser();
  const isDocente = currentUser.role === "docente";
  const academicMenuId = useId();
  const [isAcademicMenuOpen, setIsAcademicMenuOpen] = useState(true);
  const workflowProgress = useAcademicWorkflowProgress();
  const { activePlan } = useAcademicPlanInfo();

  const academicKeys = isDocente ? docenteAcademicStepKeys : academicStepKeys;
  const academicItems = academicKeys
    .map((key) => panelNavigation.find((item) => item.key === key))
    .filter((item): item is NavigationItem => Boolean(item));
  const isCurrentInsideAcademicWorkflow = academicItems.some(
    (item) => item.key === currentStep,
  );
  const docenteMeasurementProgress = getDocenteMeasurementProgress(currentUser);
  const workflowState = getAcademicWorkflowState(workflowProgress);
  const completedStepsCount = isDocente
    ? docenteMeasurementProgress.completed
    : getCompletedAcademicWorkflowStepsCount(workflowProgress);
  const totalStepsCount = isDocente
    ? docenteMeasurementProgress.total
    : academicItems.length;
  const isWorkflowCompleted = !isDocente && workflowState === "completed";
  const renewalAvailability = getNewAcademicPlanRenewalAvailability(workflowProgress);
  const canStartNewAcademicPlan = renewalAvailability.isAvailable;
  const canManageNewAcademicPlan = canRoleStartNewAcademicPlan(currentUser.role);
  const newAcademicPlanLockedMessage =
    renewalAvailability.lockedMessage ??
    "El nuevo plan académico estará disponible cuando el ciclo actual cumpla 1.5 años.";
  const newAcademicPlanTarget =
    academicItems.find((item) => item.key === newAcademicPlanStartStep) ??
    academicItems[2] ??
    academicItems[0];

  const goTo = (href: string) => {
    navigateToRoute(href, { preserveSearch: true });
    onNavigate?.();
  };

  const handleStartNewAcademicPlan = () => {
    if (!canManageNewAcademicPlan) return;

    if (!canStartNewAcademicPlan) {
      showNotification(newAcademicPlanLockedMessage);
      return;
    }

    try {
      startNewAcademicPlanFromCurrentProgress(workflowProgress);
      if (newAcademicPlanTarget) goTo(newAcademicPlanTarget.href);
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : newAcademicPlanLockedMessage,
      );
    }
  };

  const academicProgress = useMemo(
    () =>
      academicItems.map((item, index) => {
        const isWorkflowStep = isAcademicWorkflowStep(item.key);
        const isCurrent = item.key === currentStep;
        const isDocenteTrackedStep = isDocente && isDocenteProgressStep(item.key);
        const isAccessOnlyForDocente = isDocente && !isDocenteTrackedStep;
        const isCompleted = isDocente
          ? isDocenteTrackedStep && docenteMeasurementProgress.isCompleted
          : isWorkflowStep
            ? isAcademicWorkflowStepCompleted(item.key, workflowProgress)
            : false;
        const isLocked =
          !isDocente && isWorkflowStep
            ? isAcademicWorkflowStepLocked(item.key, workflowProgress)
            : false;
        const isInherited =
          !isDocente && isWorkflowStep
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
          statusLabel: getStepStatusLabel({
            isCurrent,
            isCompleted,
            isInherited,
            isLocked,
          }),
        };
      }),
    [
      academicItems,
      activePlan,
      currentStep,
      docenteMeasurementProgress.isCompleted,
      isDocente,
      workflowProgress,
    ],
  );

  const renderAcademicItem = (
    item: (typeof academicProgress)[number],
    completedView = false,
  ) => {
    const lockedDescription = item.isLocked
      ? getAcademicWorkflowLockedDescription(item.key)
      : item.label;
    const shouldShowProgressStatus =
      !completedView && item.isCurrent && !item.isCompleted && !item.isLocked;

    const handleClick = () => {
      if (item.isLocked) {
        showNotification(WORKFLOW_LOCKED_MESSAGE);
        return;
      }

      if (isDocente && item.key === "medicion-ra") {
        const dashboardHref =
          panelNavigation.find((navigationItem) => navigationItem.key === "dashboard")?.href;

        showNotification({
          title: "Selecciona primero el curso que vas a medir",
          message:
            "Para iniciar Medición RA, ve a Estado del ciclo y selecciona el curso que deseas evaluar. La medición se abrirá directamente con ese curso.",
          variant: "info",
          durationMs: 6500,
        });

        if (dashboardHref) goTo(dashboardHref);
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
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-pill)] transition-colors",
                item.isCurrent
                  ? "bg-[color:rgba(118,202,102,0.14)] text-[var(--color-success)]"
                  : "text-[color:rgba(217,221,231,0.70)] group-hover:text-[var(--color-white)]",
              ].join(" ")}
              aria-hidden="true"
            >
              <SecubIcon name={item.icon} size={18} weight="regular" />
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
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden="true">
            <span
              className={[
                "flex h-[18px] w-[18px] items-center justify-center rounded-[var(--radius-pill)] border transition-colors",
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
                <SecubIcon name="check" size={12} weight="bold" />
              ) : item.isCurrent ? (
                <span className="h-2 w-2 rounded-[var(--radius-pill)] bg-current" />
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
    <li>
      <button
        type="button"
        aria-expanded={isAcademicMenuOpen}
        aria-controls={academicMenuId}
        onClick={() => setIsAcademicMenuOpen((value) => !value)}
        className={[
          "group flex w-full items-center gap-2.5 rounded-[14px] border border-transparent px-3 py-2.5 text-left text-[0.875rem] font-semibold leading-5 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
          isCurrentInsideAcademicWorkflow
            ? "border-l-2 border-l-[var(--color-success)] bg-[color:rgba(118,202,102,0.13)] text-[var(--color-white)] shadow-[inset_0_0_0_1px_rgba(118,202,102,0.12)]"
            : "text-[var(--color-secondary-3)] hover:bg-[color:rgba(255,255,255,0.055)] hover:text-[var(--color-white)]",
        ].join(" ")}
      >
        <SecubIcon name="book" size={22} weight="bold" />
        <span className="min-w-0 flex-1 truncate">Gestión Académica</span>
        <span className="rounded-[var(--radius-pill)] bg-[color:rgba(118,202,102,0.12)] px-2 py-0.5 text-[0.72rem] font-bold leading-4 text-[var(--color-success)]">
          {completedStepsCount}/{totalStepsCount}
        </span>
        <SecubIcon
          name="chevron-down"
          size={16}
          weight="bold"
          className={[
            "text-[var(--color-secondary-2)] transition-transform",
            isAcademicMenuOpen ? "rotate-180" : "",
          ].join(" ")}
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
          <nav
            aria-label={
              isWorkflowCompleted
                ? "Secciones completadas de Gestión Académica"
                : isDocente
                  ? "Módulos académicos"
                  : "Flujo de Gestión Académica"
            }
          >
            <ol className="space-y-1">
              {academicProgress.map((item) =>
                renderAcademicItem(
                  item,
                  isWorkflowCompleted || (isDocente && item.isAccessOnlyForDocente),
                ),
              )}
            </ol>
          </nav>

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
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-pill)]",
                  canStartNewAcademicPlan
                    ? "bg-[color:rgba(248,129,29,0.16)] text-[var(--color-primary)]"
                    : "text-[var(--color-secondary-3)]",
                ].join(" ")}
                aria-hidden="true"
              >
                {canStartNewAcademicPlan ? (
                  <SecubIcon name="add" size={18} weight="regular" />
                ) : (
                  <SecubIcon name="lock" size={18} weight="regular" />
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
                  {canStartNewAcademicPlan ? "Nuevo ciclo" : "Bloqueado"}
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
  );
}
