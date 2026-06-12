import { useId, useMemo, useState } from "react";
import { GoChevronDown, GoLock, GoPlus } from "react-icons/go";
import { HiCheck } from "react-icons/hi";
import { LuCircleDot } from "react-icons/lu";
import { getCurrentMockUser } from "../../services/auth/mockUser";
import { SHOW_DEMO_TOOLS } from "../../config/demo.config";
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
import SidebarRoleSwitcher from "./SidebarRoleSwitcher";
import SidebarUserProfileMenu from "./SidebarUserProfileMenu";

interface PanelSidebarProps {
  currentStep: PanelStepKey;
}

type NavigationItem = (typeof panelNavigation)[number];

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
  "medicion-ra",
];

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
  const currentUser = getCurrentMockUser();
  const academicMenuId = useId();
  const dashboardItem =
    panelNavigation.find((item) => item.key === "dashboard") ??
    panelNavigation[0];

  const academicKeys = currentUser.role === "docente" ? docenteAcademicStepKeys : academicStepKeys;
  const academicItems = academicKeys
    .map((key) => panelNavigation.find((item) => item.key === key))
    .filter((item): item is NavigationItem => Boolean(item));
  const isCurrentInsideAcademicWorkflow = academicItems.some((item) => item.key === currentStep);
  const [isAcademicMenuOpen, setIsAcademicMenuOpen] = useState(true);

  const workflowProgress = useAcademicWorkflowProgress();
  const { activePlan } = useAcademicPlanInfo();
  const workflowState = getAcademicWorkflowState(workflowProgress);
  const completedStepsCount = getCompletedAcademicWorkflowStepsCount(workflowProgress);
  const progressPercentage = academicItems.length
    ? Math.round((completedStepsCount / academicItems.length) * 100)
    : 0;
  const isWorkflowCompleted = workflowState === "completed";
  const isNewAcademicPlan = workflowState === "newAcademicPlan";
  const renewalAvailability = getNewAcademicPlanRenewalAvailability(workflowProgress);
  const canStartNewAcademicPlan = renewalAvailability.isAvailable;
  const canManageNewAcademicPlan = currentUser.role !== "docente";
  const newAcademicPlanLockedMessage =
    renewalAvailability.lockedMessage ??
    "Solo puedes crear un nuevo plan académico cuando el ciclo actual haya cumplido 1.5 años.";
  const newAcademicPlanTarget =
    academicItems.find((item) => item.key === newAcademicPlanStartStep) ??
    academicItems[2] ??
    academicItems[0];

  const goTo = (href: string) => {
    // Mantiene el rol demo en la navegación. Cuando exista Auth real, el rol saldrá del usuario autenticado.
    window.location.assign(`${href}${window.location.search}`);
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
      const message = error instanceof Error ? error.message : newAcademicPlanLockedMessage;
      window.alert(message);
    }
  };

  const academicProgress = useMemo(() => {
    return academicItems.map((item, index) => {
      const isWorkflowStep = isAcademicWorkflowStep(item.key);
      const isCurrent = item.key === currentStep;
      const isCompleted = isWorkflowStep
        ? isAcademicWorkflowStepCompleted(item.key, workflowProgress)
        : false;
      const isLocked = isWorkflowStep
        ? isAcademicWorkflowStepLocked(item.key, workflowProgress)
        : false;
      const isInherited = isWorkflowStep
        ? isAcademicWorkflowBaseStepInherited(item.key, activePlan)
        : false;

      return {
        ...item,
        stepNumber: index + 1,
        isCurrent,
        isCompleted,
        isLocked,
        isInherited,
        statusLabel: getStepStatusLabel({ isCurrent, isCompleted, isInherited, isLocked }),
      };
    });
  }, [academicItems, activePlan, currentStep, workflowProgress]);

  const renderAcademicItem = (item: (typeof academicProgress)[number], completedView = false) => {
    const ItemIcon = item.icon;
    const lockedDescription = item.isLocked
      ? getAcademicWorkflowLockedDescription(item.key)
      : item.label;

    const handleClick = () => {
      if (item.isLocked) {
        window.alert(WORKFLOW_LOCKED_MESSAGE);
        return;
      }

      goTo(item.href);
    };

    return (
      <li key={item.key}>
        <button
          type="button"
          onClick={handleClick}
          title={lockedDescription}
          disabled={item.isLocked}
          aria-current={item.isCurrent ? (completedView ? "page" : "step") : undefined}
          aria-label={`${completedView ? "Sección" : `Paso ${item.stepNumber}`}: ${item.label}. Estado: ${item.statusLabel}.`}
          className={[
            "group flex w-full items-center gap-3 rounded-[var(--radius-lg)] border px-3 py-2.5 text-left transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
            item.isLocked
              ? "cursor-not-allowed border-[color:rgba(255,255,255,0.08)] bg-transparent opacity-55"
              : item.isCurrent
                ? "cursor-pointer border-[var(--color-secondary-1)] bg-[color:rgba(127,86,217,0.24)] shadow-[var(--shadow-sm)]"
                : item.isCompleted
                  ? "cursor-pointer border-[color:rgba(118,202,102,0.45)] bg-[color:rgba(118,202,102,0.12)] hover:bg-[color:rgba(118,202,102,0.18)]"
                  : "cursor-pointer border-[color:rgba(255,255,255,0.10)] bg-[color:rgba(255,255,255,0.04)] hover:border-[var(--color-secondary-3)] hover:bg-[var(--color-secondary-4)]",
          ].join(" ")}
        >
          <div
            className={[
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-pill)] border transition-colors",
              item.isLocked
                ? "border-[var(--color-secondary-3)] bg-transparent text-[var(--color-secondary-3)]"
                : item.isCompleted
                  ? "border-[var(--color-success)] bg-[var(--color-success)] text-[var(--color-secondary-4)]"
                  : item.isCurrent
                    ? "border-[var(--color-secondary-1)] bg-[var(--color-secondary-1)] text-[var(--color-white)]"
                    : "border-[var(--color-secondary-3)] bg-transparent text-[var(--color-secondary-3)] group-hover:border-[var(--color-white)] group-hover:text-[var(--color-white)]",
            ].join(" ")}
            aria-hidden="true"
          >
            {item.isLocked ? (
              <GoLock className="text-[0.78rem]" />
            ) : item.isCompleted ? (
              <HiCheck className="text-sm" />
            ) : item.isCurrent ? (
              <ItemIcon className="text-[0.85rem]" />
            ) : (
              <LuCircleDot className="text-[0.78rem]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[0.48rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-secondary-2)]">
              {completedView ? "Consulta" : item.isInherited ? "Heredado" : `Paso ${item.stepNumber}`}
            </p>

            <p
              className={[
                "truncate font-heading text-[0.9rem] font-medium leading-[1.15] transition-colors",
                item.isCurrent && !item.isLocked
                  ? "text-[var(--color-white)]"
                  : item.isLocked
                    ? "text-[var(--color-secondary-3)]"
                    : "text-[var(--color-secondary-3)] group-hover:text-[var(--color-white)]",
              ].join(" ")}
            >
              {item.label}
            </p>
            {!completedView ? (
              <p className="mt-1 text-[0.62rem] leading-4 text-[var(--color-secondary-3)]">
                {item.statusLabel}
              </p>
            ) : null}
          </div>
        </button>
      </li>
    );
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-[320px] shrink-0 self-start xl:flex" aria-label="Barra lateral del panel SECUB">
      <div className="flex h-screen w-full flex-col overflow-hidden border-r border-[var(--color-secondary-4)] bg-[var(--color-footer-dark)] text-[var(--color-white)]">
        <div className="shrink-0 px-7 pb-4 pt-6">
          <a href={dashboardItem.href} className="flex items-center" aria-label="Ir al dashboard de SECUB">
            <img
              src={LogoSecub}
              alt="SECUB"
              className="h-10 w-auto object-contain"
            />
          </a>
        </div>

        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-7 pb-4">
          <nav className="space-y-4" aria-label="Navegación principal del panel">
            <ul className="space-y-4">
              <li>
                <button
                  type="button"
                  onClick={() => goTo(dashboardItem.href)}
                  aria-current={currentStep === dashboardItem.key ? "page" : undefined}
                  className={[
                    "flex w-full items-center rounded-[var(--radius-pill)] px-4 py-2.5 text-left text-[0.95rem] font-medium transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
                    currentStep === dashboardItem.key
                      ? "bg-[var(--color-secondary-3)] text-[var(--color-secondary-1)]"
                      : "text-[var(--color-secondary-3)] hover:bg-[var(--color-secondary-4)] hover:text-[var(--color-white)]",
                  ].join(" ")}
                >
                  Dashboard
                </button>
              </li>

              <li>
                <button
                  type="button"
                  aria-expanded={isAcademicMenuOpen}
                  aria-controls={academicMenuId}
                  onClick={() => setIsAcademicMenuOpen((currentValue) => !currentValue)}
                  className={[
                    "flex w-full items-center justify-between gap-3 rounded-[var(--radius-pill)] px-4 py-2.5 text-left text-[0.95rem] font-medium transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
                    isCurrentInsideAcademicWorkflow
                      ? "bg-[var(--color-secondary-3)] text-[var(--color-secondary-1)]"
                      : "text-[var(--color-secondary-3)] hover:bg-[var(--color-secondary-4)] hover:text-[var(--color-white)]",
                  ].join(" ")}
                >
                  <span>Gestión Académica</span>
                  <GoChevronDown
                    className={["text-[1rem] transition-transform", isAcademicMenuOpen ? "rotate-180" : ""].join(" ")}
                    aria-hidden="true"
                  />
                </button>

                {isAcademicMenuOpen ? (
                  <div id={academicMenuId} className="mt-4 space-y-3">
                    {isWorkflowCompleted ? (
                      <nav aria-label="Secciones completadas de Gestión Académica">
                        <ol className="space-y-3">
                          {academicProgress.map((item) => renderAcademicItem(item, true))}
                        </ol>
                      </nav>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-[var(--radius-lg)] border border-[color:rgba(255,255,255,0.10)] bg-[color:rgba(255,255,255,0.04)] p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-secondary-2)]">
                              {isNewAcademicPlan ? activePlan.title : "Avance del flujo"}
                            </p>

                            <span className="text-[0.72rem] font-semibold text-[var(--color-white)]">
                              {completedStepsCount}/{academicItems.length}
                            </span>
                          </div>

                          <div
                            className="mt-3 h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[color:rgba(255,255,255,0.10)]"
                            aria-hidden="true"
                          >
                            <div
                              className="h-full rounded-[var(--radius-pill)] bg-[linear-gradient(90deg,var(--color-primary),var(--color-secondary-1))] transition-[width] duration-700 ease-out"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>

                          <progress
                            className="sr-only"
                            value={completedStepsCount}
                            max={academicItems.length}
                            aria-label="Avance de Gestión Académica"
                          />

                          <p className="mt-2 text-[0.68rem] leading-5 text-[var(--color-secondary-3)]">
                            {isNewAcademicPlan
                              ? "Este plan heredó Perfil de egreso y Propósito de formación. Continúa desde Competencias y RA."
                              : `${progressPercentage}% completado`}
                          </p>
                        </div>

                        <nav aria-label="Flujo de Gestión Académica">
                          <ol className="space-y-3">
                            {academicProgress.map((item) => renderAcademicItem(item))}
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
                          "group flex w-full items-center gap-3 rounded-[var(--radius-lg)] border px-3 py-2.5 text-left transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
                          canStartNewAcademicPlan
                            ? "cursor-pointer border-[color:rgba(248,129,29,0.45)] bg-[color:rgba(248,129,29,0.10)] hover:bg-[color:rgba(248,129,29,0.16)]"
                            : "cursor-not-allowed border-[color:rgba(255,255,255,0.10)] bg-[color:rgba(255,255,255,0.04)] opacity-65",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-pill)] border",
                            canStartNewAcademicPlan
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-white)]"
                              : "border-[var(--color-secondary-3)] bg-transparent text-[var(--color-secondary-3)]",
                          ].join(" ")}
                          aria-hidden="true"
                        >
                          {canStartNewAcademicPlan ? (
                            <GoPlus className="text-[0.85rem]" />
                          ) : (
                            <GoLock className="text-[0.78rem]" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={[
                              "text-[0.48rem] font-semibold uppercase tracking-[0.16em]",
                              canStartNewAcademicPlan
                                ? "text-[var(--color-warning)]"
                                : "text-[var(--color-secondary-2)]",
                            ].join(" ")}
                          >
                            {canStartNewAcademicPlan ? "Nuevo ciclo" : "Bloqueado"}
                          </p>
                          <p className="truncate font-heading text-[0.9rem] font-medium leading-[1.15] text-[var(--color-white)]">
                            Plan académico nuevo
                          </p>
                        </div>
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            </ul>
          </nav>
        </div>

        <div className="shrink-0 space-y-4 border-t border-[var(--color-secondary-4)] px-6 py-4">
          {SHOW_DEMO_TOOLS ? <SidebarRoleSwitcher /> : null}
          <SidebarUserProfileMenu />
        </div>
      </div>
    </aside>
  );
}
