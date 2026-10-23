import { useMemo } from "react";
import { navigateToRoute } from "../../app/appRoutes";
import { getRoutePrefetchProps } from "../../app/router/routePrefetch";
import LogoSecub from "../../assets/logos/logo-secub-blanco.webp";
import { SecubIcon } from "../ui";
import { panelNavigation, type PanelStepKey } from "./panelNavigation";
import SidebarUserProfileMenu from "./SidebarUserProfileMenu";
import PanelAcademicNavigation from "./sidebar/PanelAcademicNavigation";
import { useOnboardingTour, type OnboardingTourStep } from "../OnboardingTour";
import {
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  useResizableSidebar,
} from "./sidebar/useResizableSidebar";

interface PanelSidebarProps {
  currentStep: PanelStepKey;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

export default function PanelSidebar({
  currentStep,
  variant = "desktop",
  onNavigate,
}: PanelSidebarProps) {
  const isDesktop = variant === "desktop";
  const {
    sidebarRef,
    sidebarWidth,
    isResizingSidebar,
    handleResizePointerDown,
    handleResizeKeyDown,
  } = useResizableSidebar(isDesktop);
  const dashboardItem =
    panelNavigation.find((item) => item.key === "dashboard") ?? panelNavigation[0];
  const sidebarTourSteps = useMemo<OnboardingTourStep[]>(
    () => [
      {
        target: "#panel-sidebar-logo",
        title: "Inicio SECUB",
        content: "Regresa al Estado del ciclo desde el logo de SECUB.",
        order: 1,
      },
      {
        target: "#panel-sidebar-dashboard",
        title: "Estado del ciclo",
        content: "Consulta el estado del ciclo, cursos, mediciones, resultados e históricos.",
        order: 2,
      },
      {
        target: "#panel-sidebar-academic",
        title: "Gestión Académica",
        content: "Accede a los módulos del flujo académico y revisa su progreso.",
        order: 3,
      },
      {
        target: "#panel-sidebar-settings",
        title: "Ajustes",
        content: "Abre las preferencias de usuario, accesibilidad y cambio de programa.",
        order: 4,
      },
      {
        target: "#panel-sidebar-logout",
        title: "Salir",
        content: "Cierra la sesión actual y vuelve a la pantalla de acceso.",
        order: 5,
      },
    ],
    [],
  );

  useOnboardingTour({
    steps: sidebarTourSteps,
    storageKey: "tour_panel_sidebar_v1",
    autoStart: isDesktop,
    enabled: isDesktop,
  });

  const goTo = (href: string) => {
    navigateToRoute(href, { preserveSearch: true });
    onNavigate?.();
  };

  return (
    <aside
      ref={sidebarRef}
      className={
        isDesktop
          ? "sticky top-0 hidden h-screen shrink-0 self-start xl:flex"
          : "flex h-full w-full"
      }
      aria-label="Barra lateral del panel SECUB"
      style={
        isDesktop
          ? {
              width: `${sidebarWidth}px`,
              minWidth: `${SIDEBAR_MIN_WIDTH}px`,
              maxWidth: `${SIDEBAR_MAX_WIDTH}px`,
            }
          : undefined
      }
    >
      <div
        className={`relative flex ${isDesktop ? "h-screen" : "h-full"} w-full flex-col overflow-hidden border-r border-[color:var(--color-sidebar-border)] bg-[var(--color-footer-dark)] text-[var(--color-white)]`}
      >
        <div className="shrink-0 border-b border-[color:var(--color-sidebar-border)] px-4 pb-4 pt-5">
          <button
            type="button"
            onClick={() => goTo(dashboardItem.href)}
            {...getRoutePrefetchProps(dashboardItem.href)}
            id="panel-sidebar-logo"
            className="inline-flex rounded-[12px] p-1.5 transition-colors hover:bg-[color:var(--color-sidebar-hover)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus-soft)]"
            aria-label="Ir al dashboard de SECUB"
          >
            <img src={LogoSecub} alt="SECUB" className="h-9 w-auto object-contain" />
          </button>
        </div>

        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-4">
          <nav className="space-y-3" aria-label="Navegación principal del panel">
            <p className="px-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[color:var(--color-sidebar-muted)]">
              Navegación
            </p>
            <ul className="space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => goTo(dashboardItem.href)}
                  {...getRoutePrefetchProps(dashboardItem.href)}
                  id="panel-sidebar-dashboard"
                  aria-current={currentStep === dashboardItem.key ? "page" : undefined}
                  className={[
                    "group flex w-full items-center gap-2.5 rounded-[14px] border border-transparent px-3 py-2.5 text-left text-[0.875rem] font-semibold leading-5 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus-soft)]",
                    currentStep === dashboardItem.key
                      ? "border-l-2 border-l-[var(--color-success)] bg-[color:var(--color-tint-success)] text-[var(--color-white)] shadow-[inset_0_0_0_1px_rgba(118,202,102,0.12)]"
                      : "text-[var(--color-secondary-3)] hover:bg-[color:var(--color-sidebar-hover)] hover:text-[var(--color-white)]",
                  ].join(" ")}
                >
                  <SecubIcon name={dashboardItem.icon} size={22} weight="bold" />
                  <span className="truncate">Estado del ciclo</span>
                </button>
              </li>
              <PanelAcademicNavigation
                currentStep={currentStep}
                onNavigate={onNavigate}
                tourId="panel-sidebar-academic"
              />
            </ul>
          </nav>
        </div>

        <div className="shrink-0 space-y-3 border-t border-[color:var(--color-sidebar-border)] px-3 py-3">
          <SidebarUserProfileMenu
            tourIds={{
              settings: "panel-sidebar-settings",
              logout: "panel-sidebar-logout",
            }}
          />
        </div>

        {isDesktop ? (
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
              "after:absolute after:inset-y-3 after:left-1/2 after:w-px after:-translate-x-1/2 after:rounded-full after:bg-[color:var(--color-sidebar-hover)] after:opacity-0 after:transition-opacity",
              "hover:after:opacity-100 focus-visible:after:opacity-100 focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus-soft)]",
              isResizingSidebar ? "after:opacity-100" : "",
            ].join(" ")}
          />
        ) : null}
      </div>
    </aside>
  );
}
