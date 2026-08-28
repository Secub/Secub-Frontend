import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import WorkflowCompletionAlert from "../WorkflowCompletionAlert";
import { ROUTES, buildRouteWithSearch, navigateToRoute } from "../../app/appRoutes";
import { preloadRoutesWhenIdle } from "../../app/router/routePrefetch";
import { Breadcrumb, type BreadcrumbItem } from "../ui";
import PanelSidebar from "./PanelSidebar";
import PanelMobileNavigation from "./sidebar/PanelMobileNavigation";
import { getCurrentMockUser } from "../../services/auth/mockUser";
import {
  academicWorkflowSteps,
  getAcademicWorkflowState,
  isAcademicWorkflowStep,
  isAcademicWorkflowStepLocked,
  useAcademicWorkflowProgress,
} from "./academicWorkflow";
import { panelNavigation, type PanelStepKey } from "./panelNavigation";
import { getBrowserSearchParams } from "../../shared/browser";

interface PanelLayoutProps {
  children: ReactNode;
  currentStep: PanelStepKey;
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
}

export default function PanelLayout({
  children,
  currentStep,
  title,
  description,
  actions,
  breadcrumbItems,
}: PanelLayoutProps) {
  const currentUser = getCurrentMockUser();
  const shouldHideActionsForDocente =
    currentUser.role === "docente" && isAcademicWorkflowStep(currentStep);
  const workflowProgress = useAcademicWorkflowProgress();
  const workflowState = useMemo(
    () => getAcademicWorkflowState(workflowProgress),
    [workflowProgress],
  );
  const isWorkflowCompleted = workflowState === "completed";
  const wasCompletedRef = useRef(isWorkflowCompleted);
  const hasMountedRef = useRef(false);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);

  useEffect(() => {
    // Precarga predictiva: mientras el navegador está inactivo, adelanta la
    // descarga del chunk del Dashboard (destino más frecuente) y, si el paso
    // actual pertenece al flujo académico secuencial, la del siguiente paso
    // no bloqueado. Es una optimización de percepción de velocidad: si el
    // usuario nunca navega hacia allí, la descarga simplemente no se usa.
    const currentIndex = academicWorkflowSteps.indexOf(currentStep);
    const nextStepKey =
      currentIndex >= 0 ? academicWorkflowSteps[currentIndex + 1] : undefined;
    const isNextStepAvailable =
      nextStepKey && !isAcademicWorkflowStepLocked(nextStepKey, workflowProgress);
    const nextStepHref = isNextStepAvailable
      ? panelNavigation.find((item) => item.key === nextStepKey)?.href
      : undefined;

    preloadRoutesWhenIdle([ROUTES.panelDashboard, nextStepHref]);
  }, [currentStep, workflowProgress]);

  const handleCompletionAlertClose = () => {
    const dashboardParams = getBrowserSearchParams();
    dashboardParams.set("role", currentUser.role);
    dashboardParams.delete("view");
    dashboardParams.delete("cycleId");
    dashboardParams.delete("courseId");
    dashboardParams.delete("status");

    setShowCompletionAlert(false);
    navigateToRoute(
      buildRouteWithSearch(ROUTES.panelDashboard, dashboardParams),
      { replace: true },
    );
  };

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      wasCompletedRef.current = isWorkflowCompleted;
      return;
    }

    if (isWorkflowCompleted && !wasCompletedRef.current) {
      setShowCompletionAlert(true);
    }

    wasCompletedRef.current = isWorkflowCompleted;
  }, [isWorkflowCompleted]);

  return (
    <div className="min-h-screen bg-[var(--secub-bg)] text-[var(--secub-text)]">
      <div className="flex min-h-screen items-start">
        <PanelSidebar currentStep={currentStep} />

        <div className="min-w-0 flex-1">
          <PanelMobileNavigation currentStep={currentStep} />
          <main className="px-6 py-6 lg:px-8 lg:py-8">
            <Breadcrumb items={breadcrumbItems} />


            <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h1 className="font-heading text-3xl font-semibold tracking-tight text-[var(--color-secondary-4)] md:text-[2rem]">
                  {title}
                </h1>

                {description ? (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-gray-3)]">
                    {description}
                  </p>
                ) : null}
              </div>

              {!shouldHideActionsForDocente && actions ? (
                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  {actions}
                </div>
              ) : null}
            </div>

            {children}
          </main>
        </div>
      </div>

      <WorkflowCompletionAlert
        open={showCompletionAlert}
        onClose={handleCompletionAlertClose}
      />
    </div>
  );
}
