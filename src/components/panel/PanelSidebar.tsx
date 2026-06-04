import { useMemo } from "react";
import { GoChevronRight, GoLock, GoPlus } from "react-icons/go";
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

interface PanelSidebarProps {
  currentStep: PanelStepKey;
}

type NavigationItem = (typeof panelNavigation)[number];

const academicLabels = [
  "Perfil de Egreso",
  "Propósito de Formación",
  "Competencias y RA",
  "Mapeo de Competencias",
  "Creación del ciclo",
  "Asignar RA",
];

function formatRenewalDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "la fecha permitida";

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
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
  const dashboardItem =
    panelNavigation.find((item) => item.key === "dashboard") ??
    panelNavigation[0];

  const academicItems = academicLabels
    .map((label) => panelNavigation.find((item) => item.label === label))
    .filter((item): item is NavigationItem => Boolean(item));

  const currentUser = getCurrentMockUser();
  const userName = currentUser.nombre;
  const userCargo = currentUser.cargo || "Cargo no registrado";
  const medicionRaItem = panelNavigation.find((item) => item.key === "medicion-ra");
  const canAccessMedicionRa = currentUser.role === "docente";
  const canSeeAcademicWorkflow = true;
  const workflowProgress = useAcademicWorkflowProgress();
  const { activePlan, archivedPlans } = useAcademicPlanInfo();
  const workflowState = getAcademicWorkflowState(workflowProgress);
  const completedStepsCount = getCompletedAcademicWorkflowStepsCount(workflowProgress);
  const progressPercentage = academicItems.length
    ? Math.round((completedStepsCount / academicItems.length) * 100)
    : 0;
  const isWorkflowCompleted = workflowState === "completed";
  const isNewAcademicPlan = workflowState === "newAcademicPlan";
  const renewalAvailability = getNewAcademicPlanRenewalAvailability(workflowProgress);
  const canStartNewAcademicPlan = renewalAvailability.isAvailable;
  const newAcademicPlanLockedMessage =
    renewalAvailability.lockedMessage ??
    "Solo puedes crear un nuevo plan académico cuando el ciclo actual haya cumplido 1.5 años.";
  const newAcademicPlanTarget =
    academicItems.find((item) => item.key === newAcademicPlanStartStep) ??
    academicItems[2] ??
    academicItems[0];
  const MedicionRaIcon = medicionRaItem?.icon;
  const newAcademicPlanHelpId = "new-academic-plan-help";

  const goTo = (href: string) => {
    // Mantiene el rol demo en la navegación. Cuando exista Auth real, el rol saldrá del usuario autenticado.
    window.location.href = `${href}${window.location.search}`;
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
      const isCurrent = item.key === currentStep;
      const isCompleted = isAcademicWorkflowStepCompleted(item.key, workflowProgress);
      const isLocked = isAcademicWorkflowStepLocked(item.key, workflowProgress);
      const isInherited = isAcademicWorkflowBaseStepInherited(item.key, activePlan);

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

  return (
    <aside className="sticky top-0 hidden h-screen w-[320px] shrink-0 self-start xl:flex" aria-label="Barra lateral del panel SECUB">
      <div className="flex h-screen w-full flex-col overflow-hidden border-r border-[var(--color-secondary-4)] bg-[var(--color-footer-dark)] text-[var(--color-white)]">
        <div className="shrink-0 px-7 pb-4 pt-6">
          <a href="/panel/dashboard" className="flex items-center" aria-label="Ir al dashboard de SECUB">
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

              {canSeeAcademicWorkflow ? (
                <li>
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => academicItems[0] && goTo(academicItems[0].href)}
                      className="text-left text-[0.95rem] font-medium text-[var(--color-secondary-3)] transition-colors hover:text-[var(--color-white)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]"
                    >
                      Gestión Académica
                    </button>

                    <span
                      className={[
                        "rounded-[var(--radius-pill)] border px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.14em]",
                        isWorkflowCompleted
                          ? "border-[color:rgba(118,202,102,0.45)] bg-[color:rgba(118,202,102,0.12)] text-[var(--color-success)]"
                          : isNewAcademicPlan
                            ? "border-[color:rgba(248,129,29,0.55)] bg-[color:rgba(248,129,29,0.13)] text-[var(--color-warning)]"
                            : "border-[color:rgba(179,206,226,0.28)] bg-[color:rgba(255,255,255,0.06)] text-[var(--color-secondary-2)]",
                      ].join(" ")}
                    >
                      {isWorkflowCompleted ? "Completado" : isNewAcademicPlan ? "Nuevo" : "En progreso"}
                    </span>
                  </div>

                  {isWorkflowCompleted ? (
                    <div className="mt-4 space-y-3" role="tablist" aria-label="Secciones completadas de Gestión Académica">
                      {academicProgress.map((item) => {
                        const ItemIcon = item.icon;

                        return (
                          <button
                            key={item.key}
                            type="button"
                            role="tab"
                            aria-selected={item.isCurrent}
                            aria-current={item.isCurrent ? "page" : undefined}
                            onClick={() => goTo(item.href)}
                            className={[
                              "group flex w-full items-center gap-3 rounded-[var(--radius-lg)] border px-3 py-2.5 text-left transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
                              item.isCurrent
                                ? "cursor-pointer border-[var(--color-secondary-1)] bg-[color:rgba(127,86,217,0.24)] shadow-[var(--shadow-sm)]"
                                : "cursor-pointer border-[color:rgba(255,255,255,0.10)] bg-[color:rgba(255,255,255,0.04)] hover:border-[var(--color-secondary-3)] hover:bg-[var(--color-secondary-4)]",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-pill)] border transition-colors",
                                item.isCurrent
                                  ? "border-[var(--color-secondary-1)] bg-[var(--color-secondary-1)] text-[var(--color-white)]"
                                  : "border-[var(--color-secondary-3)] bg-transparent text-[var(--color-secondary-3)] group-hover:border-[var(--color-white)] group-hover:text-[var(--color-white)]",
                              ].join(" ")}
                              aria-hidden="true"
                            >
                              <ItemIcon className="text-[0.85rem]" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-[0.48rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-secondary-2)]">
                                Consulta
                              </p>

                              <p
                                className={[
                                  "truncate font-heading text-[0.9rem] font-medium leading-[1.15] transition-colors",
                                  item.isCurrent
                                    ? "text-[var(--color-white)]"
                                    : "text-[var(--color-secondary-3)] group-hover:text-[var(--color-white)]",
                                ].join(" ")}
                              >
                                {item.label}
                              </p>
                            </div>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={handleStartNewAcademicPlan}
                        aria-disabled={!canStartNewAcademicPlan}
                        aria-describedby={!canStartNewAcademicPlan ? newAcademicPlanHelpId : undefined}
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
                          {!canStartNewAcademicPlan ? (
                            <p id={newAcademicPlanHelpId} className="mt-1 text-[0.62rem] leading-4 text-[var(--color-secondary-3)]">
                              {newAcademicPlanLockedMessage} Disponible desde {formatRenewalDate(renewalAvailability.renewalDate)}.
                            </p>
                          ) : null}
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-[var(--radius-lg)] border border-[color:rgba(255,255,255,0.10)] bg-[color:rgba(255,255,255,0.04)] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-secondary-2)]">
                            {isNewAcademicPlan ? activePlan.title : "Avance del flujo"}
                          </p>
                          <span className="text-[0.72rem] font-semibold text-[var(--color-white)]">
                            {completedStepsCount}/{academicItems.length}
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[color:rgba(255,255,255,0.10)]" aria-hidden="true">
                          <div
                            className="h-full rounded-[var(--radius-pill)] bg-[linear-gradient(90deg,var(--color-primary),var(--color-secondary-1))] transition-[width] duration-700 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>

                        <progress className="sr-only" value={completedStepsCount} max={academicItems.length} aria-label="Avance de Gestión Académica" />

                        <p className="mt-2 text-[0.68rem] leading-5 text-[var(--color-secondary-3)]">
                          {isNewAcademicPlan
                            ? "Este plan heredó Perfil de egreso y Propósito de formación. Continúa desde Competencias y RA."
                            : `${progressPercentage}% completado`}
                        </p>
                      </div>

                      {archivedPlans.length > 0 ? (
                        <div className="rounded-[var(--radius-lg)] border border-[color:rgba(118,202,102,0.22)] bg-[color:rgba(118,202,102,0.07)] px-3 py-2">
                          <p className="text-[0.68rem] font-medium leading-5 text-[var(--color-secondary-3)]">
                            {archivedPlans.length} plan{archivedPlans.length === 1 ? "" : "es"} completado{archivedPlans.length === 1 ? "" : "s"} guardado{archivedPlans.length === 1 ? "" : "s"} localmente.
                          </p>
                        </div>
                      ) : null}

                      <nav aria-label="Progreso de Gestión Académica">
                        <ol className="space-y-3">
                          {academicProgress.map((item) => {
                            const ItemIcon = item.icon;
                            const lockedDescription = getAcademicWorkflowLockedDescription(item.key);

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
                                  title={item.isLocked ? lockedDescription : item.label}
                                  disabled={item.isLocked}
                                  aria-current={item.isCurrent ? "step" : undefined}
                                  aria-label={`Paso ${item.stepNumber}: ${item.label}. Estado: ${item.statusLabel}.`}
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
                                      {item.isInherited ? "Heredado" : `Paso ${item.stepNumber}`}
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
                                    <p className="mt-1 text-[0.62rem] leading-4 text-[var(--color-secondary-3)]">
                                      {item.statusLabel}
                                    </p>
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ol>
                      </nav>
                    </div>
                  )}
                </li>
              ) : null}

              {canAccessMedicionRa && medicionRaItem ? (
                <li>
                  <p className="text-left text-[0.95rem] font-medium text-[var(--color-secondary-3)]">
                    Evaluación docente
                  </p>

                  <button
                    type="button"
                    onClick={() => goTo(medicionRaItem.href)}
                    aria-current={currentStep === medicionRaItem.key ? "page" : undefined}
                    className={[
                      "mt-4 group flex w-full items-center gap-3 rounded-[var(--radius-lg)] border px-3 py-2.5 text-left transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
                      currentStep === medicionRaItem.key
                        ? "cursor-pointer border-[var(--color-secondary-1)] bg-[color:rgba(127,86,217,0.24)] shadow-[var(--shadow-sm)]"
                        : "cursor-pointer border-[color:rgba(255,255,255,0.10)] bg-[color:rgba(255,255,255,0.04)] hover:border-[var(--color-secondary-3)] hover:bg-[var(--color-secondary-4)]",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-pill)] border transition-colors",
                        currentStep === medicionRaItem.key
                          ? "border-[var(--color-secondary-1)] bg-[var(--color-secondary-1)] text-[var(--color-white)]"
                          : "border-[var(--color-secondary-3)] bg-transparent text-[var(--color-secondary-3)] group-hover:border-[var(--color-white)] group-hover:text-[var(--color-white)]",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      {MedicionRaIcon ? <MedicionRaIcon className="text-[0.85rem]" /> : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[0.48rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-secondary-2)]">
                        Módulo docente
                      </p>

                      <p
                        className={[
                          "truncate font-heading text-[0.9rem] font-medium leading-[1.15] transition-colors",
                          currentStep === medicionRaItem.key
                            ? "text-[var(--color-white)]"
                            : "text-[var(--color-secondary-3)] group-hover:text-[var(--color-white)]",
                        ].join(" ")}
                      >
                        {medicionRaItem.label}
                      </p>
                    </div>
                  </button>
                </li>
              ) : null}
            </ul>
          </nav>
        </div>

        <div className="shrink-0 space-y-4 border-t border-[var(--color-secondary-4)] px-6 py-4">
          {SHOW_DEMO_TOOLS ? <SidebarRoleSwitcher /> : null}

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] transition-colors hover:bg-[var(--color-secondary-4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]"
            aria-label={`Usuario actual: ${userName}. Cargo: ${userCargo}`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-warning)] text-[var(--color-secondary-4)]" aria-hidden="true">
              <span className="text-base font-bold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="min-w-0 flex-1 text-left">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-secondary-2)]">
                Nombre
              </p>

              <p className="truncate font-heading text-[0.95rem] font-semibold text-[var(--color-white)]">
                {userName}
              </p>

              <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-secondary-2)]">
                Cargo
              </p>

              <p className="truncate text-[0.78rem] font-medium text-[var(--color-secondary-3)]">
                {userCargo}
              </p>
            </div>

            <GoChevronRight aria-hidden="true" className="shrink-0 text-base text-[var(--color-secondary-3)]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
