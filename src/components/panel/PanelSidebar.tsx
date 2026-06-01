import { useMemo } from "react";
import { GoChevronRight, GoLock } from "react-icons/go";
import { HiCheck } from "react-icons/hi";
import { LuCircleDot } from "react-icons/lu";
import { getCurrentMockUser } from "../../services/auth/mockUser";
import { SHOW_DEMO_TOOLS } from "../../config/demo.config";
import {
  WORKFLOW_LOCKED_MESSAGE,
  getAcademicWorkflowLockedDescription,
  isAcademicWorkflowStepCompleted,
  isAcademicWorkflowStepLocked,
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

// Labels específicos para docentes (solo lectura)
const docenteReadOnlyLabels = [
  "Perfil de Egreso",
  "Propósito de Formación",
  "Competencias y RA",
];

export default function PanelSidebar({ currentStep }: PanelSidebarProps) {
  const dashboardItem =
    panelNavigation.find((item) => item.key === "dashboard") ??
    panelNavigation[0];

  const currentUser = getCurrentMockUser();
  const isDocente = currentUser.role === "docente";

  // Docentes ven solo las secciones de lectura; otros roles ven todas
  const visibleLabels = isDocente ? docenteReadOnlyLabels : academicLabels;

  const academicItems = visibleLabels
    .map((label) => panelNavigation.find((item) => item.label === label))
    .filter((item): item is NavigationItem => Boolean(item));

  const userName = currentUser.nombre;
  const medicionRaItem = panelNavigation.find((item) => item.key === "medicion-ra");
  const canAccessMedicionRa = isDocente;
  const canSeeAcademicWorkflow = true;
  const workflowProgress = useAcademicWorkflowProgress();
  const MedicionRaIcon = medicionRaItem?.icon;

  const goTo = (href: string) => {
    // Mantiene el rol demo en la navegación. Cuando exista Auth real, el rol saldrá del usuario autenticado.
    window.location.href = `${href}${window.location.search}`;
  };

  const academicProgress = useMemo(() => {
    return academicItems.map((item, index) => {
      const isCurrent = item.key === currentStep;
      const isCompleted = isAcademicWorkflowStepCompleted(item.key, workflowProgress);
      const isLocked = isAcademicWorkflowStepLocked(item.key, workflowProgress);

      return {
        ...item,
        stepNumber: index + 1,
        isCurrent,
        isCompleted,
        isLocked,
      };
    });
  }, [academicItems, currentStep, workflowProgress]);

  return (
    <aside className="sticky top-0 hidden h-screen w-[320px] shrink-0 self-start xl:flex">
      <div className="flex h-screen w-full flex-col overflow-hidden border-r border-[var(--color-secondary-4)] bg-[var(--color-footer-dark)] text-[var(--color-white)]">
        <div className="shrink-0 px-7 pb-4 pt-6">
          <a href="/panel/dashboard" className="flex items-center">
            <img
              src={LogoSecub}
              alt="SECUB"
              className="h-10 w-auto object-contain"
            />
          </a>
        </div>

        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-7 pb-4">
          <nav className="space-y-4">
            <button
              type="button"
              onClick={() => goTo(dashboardItem.href)}
              className={[
                "flex w-full items-center rounded-[var(--radius-pill)] px-4 py-2.5 text-left text-[0.95rem] font-medium transition-colors",
                currentStep === dashboardItem.key
                  ? "bg-[var(--color-secondary-3)] text-[var(--color-secondary-1)]"
                  : "text-[var(--color-secondary-3)] hover:bg-[var(--color-secondary-4)] hover:text-[var(--color-white)]",
              ].join(" ")}
            >
              Dashboard
            </button>

            {canSeeAcademicWorkflow ? (
              <div>
                <button
                  type="button"
                  onClick={() => academicItems[0] && goTo(academicItems[0].href)}
                  className="text-left text-[0.95rem] font-medium text-[var(--color-secondary-3)] transition-colors hover:text-[var(--color-white)]"
                >
                  Gestión Académica
                </button>

                <div className="mt-4 space-y-2">
                  {academicProgress.map((item) => {
                  const ItemIcon = item.icon;

                  const handleClick = () => {
                    if (item.isLocked) {
                      window.alert(WORKFLOW_LOCKED_MESSAGE);
                      return;
                    }

                    goTo(item.href);
                  };

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={handleClick}
                      title={
                        item.isLocked
                          ? getAcademicWorkflowLockedDescription(item.key)
                          : item.label
                      }
                      disabled={item.isLocked}
                      className={[
                        "group flex w-full items-center gap-3 rounded-[var(--radius-lg)] border px-3 py-2.5 text-left transition-all",
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
                          Paso {item.stepNumber}
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
                      </div>
                    </button>
                  );
                  })}
                </div>
              </div>
            ) : null}

            {canAccessMedicionRa && medicionRaItem ? (
              <div>
                <p className="text-left text-[0.95rem] font-medium text-[var(--color-secondary-3)]">
                  Evaluación docente
                </p>

                <button
                  type="button"
                  onClick={() => goTo(medicionRaItem.href)}
                  className={[
                    "mt-4 group flex w-full items-center gap-3 rounded-[var(--radius-lg)] border px-3 py-2.5 text-left transition-all",
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
              </div>
            ) : null}
          </nav>
        </div>

        <div className="shrink-0 space-y-4 border-t border-[var(--color-secondary-4)] px-6 py-4">
          {SHOW_DEMO_TOOLS ? <SidebarRoleSwitcher /> : null}

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] transition-colors hover:bg-[var(--color-secondary-4)]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-warning)] text-[var(--color-secondary-4)]">
              <span className="text-base font-bold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="min-w-0 flex-1 text-left">
              <p className="text-[0.78rem] text-[var(--color-secondary-3)]">
                Bienvenido de nuevo
              </p>

              <p className="truncate font-heading text-[0.95rem] font-semibold text-[var(--color-white)]">
                {userName}
              </p>
            </div>

            <GoChevronRight className="shrink-0 text-base text-[var(--color-secondary-3)]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
