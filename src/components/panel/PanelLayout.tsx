import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "../ui";
import PanelSidebar from "./PanelSidebar";
import { getCurrentMockUser } from "../../services/auth/mockUser";
import { isAcademicWorkflowStep } from "./academicWorkflow";
import type { PanelStepKey } from "./panelNavigation";

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
  
  // Los docentes pueden consultar (solo lectura) estos pasos académicos
  const docenteReadOnlySteps: PanelStepKey[] = [
    "perfil-egreso",
    "proposito-formacion",
    "competencias-ra",
  ];
  
  const isDocenteWithReadOnlyAccess = 
    currentUser.role === "docente" && docenteReadOnlySteps.includes(currentStep);
  
  const isDocenteTryingAcademicModule =
    currentUser.role === "docente" && isAcademicWorkflowStep(currentStep) && !isDocenteWithReadOnlyAccess;

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-gray-1)]">
      <div className="flex min-h-screen items-start">
        <PanelSidebar currentStep={currentStep} />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[var(--color-gray-6)] bg-[var(--color-white)]" />

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

              {!isDocenteTryingAcademicModule && actions ? (
                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  {actions}
                </div>
              ) : null}
            </div>

            {isDocenteTryingAcademicModule ? (
              <div className="surface-card p-8 text-center">
                <h2 className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
                  Acceso restringido
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--color-gray-3)]">
                  El rol Docente solo tiene acceso a Dashboard y Medición RA.
                  Los pasos de Gestión Académica se habilitan para los roles administrativos según permisos.
                </p>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
