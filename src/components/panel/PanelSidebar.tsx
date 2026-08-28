import { navigateToRoute } from "../../app/appRoutes";
import { getRoutePrefetchProps } from "../../app/router/routePrefetch";
import LogoSecub from "../../assets/logos/logo-secub-blanco.webp";
import { SecubIcon } from "../ui";
import { panelNavigation, type PanelStepKey } from "./panelNavigation";
import SidebarUserProfileMenu from "./SidebarUserProfileMenu";
import PanelAcademicNavigation from "./sidebar/PanelAcademicNavigation";
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
        className={`relative flex ${isDesktop ? "h-screen" : "h-full"} w-full flex-col overflow-hidden border-r border-[color:rgba(217,221,231,0.10)] bg-[var(--color-footer-dark)] text-[var(--color-white)]`}
      >
        <div className="shrink-0 border-b border-[color:rgba(217,221,231,0.10)] px-4 pb-4 pt-5">
          <button
            type="button"
            onClick={() => goTo(dashboardItem.href)}
            {...getRoutePrefetchProps(dashboardItem.href)}
            className="inline-flex rounded-[12px] p-1.5 transition-colors hover:bg-[color:rgba(255,255,255,0.055)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]"
            aria-label="Ir al dashboard de SECUB"
          >
            <img src={LogoSecub} alt="SECUB" className="h-9 w-auto object-contain" />
          </button>
        </div>

        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-4">
          <nav className="space-y-3" aria-label="Navegación principal del panel">
            <p className="px-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[color:rgba(179,206,226,0.72)]">
              Navegación
            </p>
            <ul className="space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => goTo(dashboardItem.href)}
                  {...getRoutePrefetchProps(dashboardItem.href)}
                  aria-current={currentStep === dashboardItem.key ? "page" : undefined}
                  className={[
                    "group flex w-full items-center gap-2.5 rounded-[14px] border border-transparent px-3 py-2.5 text-left text-[0.875rem] font-semibold leading-5 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
                    currentStep === dashboardItem.key
                      ? "border-l-2 border-l-[var(--color-success)] bg-[color:rgba(118,202,102,0.13)] text-[var(--color-white)] shadow-[inset_0_0_0_1px_rgba(118,202,102,0.12)]"
                      : "text-[var(--color-secondary-3)] hover:bg-[color:rgba(255,255,255,0.055)] hover:text-[var(--color-white)]",
                  ].join(" ")}
                >
                  <SecubIcon name={dashboardItem.icon} size={22} weight="bold" />
                  <span className="truncate">Estado del ciclo</span>
                </button>
              </li>
              <PanelAcademicNavigation
                currentStep={currentStep}
                onNavigate={onNavigate}
              />
            </ul>
          </nav>
        </div>

        <div className="shrink-0 space-y-3 border-t border-[color:rgba(217,221,231,0.10)] px-3 py-3">
          <SidebarUserProfileMenu />
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
              "after:absolute after:inset-y-3 after:left-1/2 after:w-px after:-translate-x-1/2 after:rounded-full after:bg-[color:rgba(217,221,231,0.12)] after:opacity-0 after:transition-opacity",
              "hover:after:opacity-100 focus-visible:after:opacity-100 focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
              isResizingSidebar ? "after:opacity-100" : "",
            ].join(" ")}
          />
        ) : null}
      </div>
    </aside>
  );
}
