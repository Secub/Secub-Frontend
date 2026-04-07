import AccessPage from "../pages/access/AccessPage";
import LandingPage from "../pages/landing/LandingPage";
import DashboardPage from "../pages/panel/dashboard/DashboardPage";
import PerfilEgresoPage from "../pages/panel/perfil-egreso/PerfilEgresoPage";
import PropositoFormacionPage from "../pages/panel/proposito-formacion/PropositoFormacionPage";
import CompetenciasRAPage from "../pages/panel/competencias-ra/CompetenciasRAPage";
import MapeoCompetenciasPage from "../pages/panel/mapeo-competencias/MapeoCompetenciasPage";
import CicloPage from "../pages/panel/ciclo/CicloPage";
import AsignarRAPage from "../pages/panel/asignar-ra/AsignarRAPage";
import MedicionRAPage from "../pages/panel/medicion-ra/MedicionRAPage";
import { ROUTES, normalizePathname } from "./routes";

function isAccessRoute(pathname: string) {
  return (
    pathname === ROUTES.access ||
    (ROUTES.accessAliases as readonly string[]).includes(pathname)
  );
}

export default function AppRouter() {
  const normalizedPath = normalizePathname(window.location.pathname);

  if (isAccessRoute(normalizedPath)) {
    return <AccessPage />;
  }

  switch (normalizedPath) {
    case ROUTES.panel:
    case ROUTES.panelDashboard:
      return <DashboardPage />;
    case ROUTES.panelPerfilEgreso:
      return <PerfilEgresoPage />;
    case ROUTES.panelPropositoFormacion:
      return <PropositoFormacionPage />;
    case ROUTES.panelCompetenciasRa:
      return <CompetenciasRAPage />;
    case ROUTES.panelMapeoCompetencias:
      return <MapeoCompetenciasPage />;
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
