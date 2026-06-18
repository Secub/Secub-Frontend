import { useEffect, useMemo, useState } from "react";
import AccessPage from "../pages/access/AccessPage";
import LandingPage from "../pages/landing/LandingPage";
import ProgramSelectorPage from "../pages/program-selector/ProgramSelectorPage";
import DashboardPage from "../pages/panel/dashboard/DashboardPage";
import PerfilEgresoPage from "../pages/panel/perfil-egreso/PerfilEgresoPage";
import PropositoFormacionPage from "../pages/panel/proposito-formacion/PropositoFormacionPage";
import CompetenciasRAPage from "../pages/panel/competencias-ra/CompetenciasRAPage";
import MapeoCompetenciasPage from "../pages/panel/mapeo-competencias/MapeoCompetenciasPage";
import MapeoCompetenciasCreatePage from "../pages/panel/mapeo-competencias/MapeoCompetenciasCreatePage";
import CicloPage from "../pages/panel/ciclo/CicloPage";
import AsignarRAPage from "../pages/panel/asignar-ra/AsignarRAPage";
import MedicionRAPage from "../pages/panel/medicion-ra/MedicionRAPage";
import UserSettingsPage from "../pages/panel/ajustes/UserSettingsPage";
import AccessibilitySettingsPage from "../pages/panel/accesibilidad/AccessibilitySettingsPage";
import {
  APP_NAVIGATION_EVENT,
  ROUTES,
  buildRouteWithSearch,
  navigateToRoute,
  normalizePathname,
} from "./appRoutes";
import { getPanelRouteAccessRedirect } from "./panelRoutePermissions";
import { getCurrentMockUser } from "../services/auth/mockUser";
import { useInactivityLogout } from "../services/auth/useInactivityLogout";
import { hasSelectedProgram } from "../services/programSelection";

function isAccessRoute(pathname: string) {
  return (
    pathname === ROUTES.access ||
    (ROUTES.accessAliases as readonly string[]).includes(pathname)
  );
}

function isProgramSelectorRoute(pathname: string) {
  return (
    pathname === ROUTES.programSelector ||
    (ROUTES.programSelectorAliases as readonly string[]).includes(pathname)
  );
}

function getCurrentLocation() {
  if (typeof window === "undefined") return { pathname: ROUTES.landing, search: "" };
  return { pathname: window.location.pathname, search: window.location.search };
}

function redirectToProgramSelector() {
  const params = new URLSearchParams(window.location.search);
  params.set("role", params.get("role") ?? "direccionPrograma");
  navigateToRoute(buildRouteWithSearch(ROUTES.programSelector, params), { replace: true, notify: false });
}

export default function AppRouter() {
  const [location, setLocation] = useState(getCurrentLocation);
  const normalizedPath = useMemo(
    () => normalizePathname(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    const handleRouteChange = () => setLocation(getCurrentLocation());

    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener(APP_NAVIGATION_EVENT, handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener(APP_NAVIGATION_EVENT, handleRouteChange);
    };
  }, []);

  const isPanelRoute =
    normalizedPath === ROUTES.panel ||
    normalizedPath.startsWith(`${ROUTES.panel}/`);

  useInactivityLogout(isPanelRoute);

  if (isProgramSelectorRoute(normalizedPath)) {
    return <ProgramSelectorPage />;
  }

  if (isPanelRoute && !hasSelectedProgram()) {
    redirectToProgramSelector();
    return <ProgramSelectorPage />;
  }

  if (isPanelRoute) {
    const redirectPath = getPanelRouteAccessRedirect(normalizedPath, getCurrentMockUser().role);

    if (redirectPath) {
      navigateToRoute(buildRouteWithSearch(redirectPath, new URLSearchParams(location.search)), { replace: true, notify: false });
      return <DashboardPage />;
    }
  }

  if (isAccessRoute(normalizedPath)) {
    return <AccessPage />;
  }

  switch (normalizedPath) {
    case ROUTES.panel:
    case ROUTES.panelDashboard:
      return <DashboardPage />;
    case ROUTES.panelSettings:
      return <UserSettingsPage />;
    case ROUTES.panelAccessibility:
      return <AccessibilitySettingsPage />;
    case ROUTES.panelPerfilEgreso:
      return <PerfilEgresoPage />;
    case ROUTES.panelPropositoFormacion:
      return <PropositoFormacionPage />;
    case ROUTES.panelCompetenciasRa:
      return <CompetenciasRAPage />;
    case ROUTES.panelMapeoCompetencias:
      return <MapeoCompetenciasPage />;
    case ROUTES.panelMapeoCompetenciasCrear:
    case ROUTES.panelMapeoCompetenciasEditar:
      return <MapeoCompetenciasCreatePage />;
    case ROUTES.panelCiclo:
      return <CicloPage />;
    case ROUTES.panelAsignarRa:
      return <AsignarRAPage />;
    case ROUTES.panelMedicionRa:
      return <MedicionRAPage />;
    default:
      return <LandingPage />;
  }
}
