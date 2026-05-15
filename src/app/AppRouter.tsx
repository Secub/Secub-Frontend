import AccessPage from "../pages/access/AccessPage";
import LandingPage from "../pages/landing/LandingPage";
import DashboardPage from "../pages/panel/dashboard/DashboardPage";
import PerfilEgresoPage from "../pages/panel/perfil-egreso/PerfilEgresoPage";
import PropositoFormacionPage from "../pages/panel/proposito-formacion/PropositoFormacionPage";
import CompetenciasRAPage from "../pages/panel/competencias-ra/CompetenciasRAPage";
import MapeoCompetenciasPage from "../pages/panel/mapeo-competencias/MapeoCompetenciasPage";
// import MapeoCompetenciasClassificationCreatePage from "../pages/panel/mapeo-competencias/MapeoCompetenciasClassificationCreatePage";
import MapeoCompetenciasCreatePage from "../pages/panel/mapeo-competencias/MapeoCompetenciasCreatePage";
// import MapeoCompetenciasClassificationEditPage from "../pages/panel/mapeo-competencias/MapeoCompetenciasClassificationEditPage";
// import MapeoCompetenciasEditPage from "../pages/panel/mapeo-competencias/MapeoCompetenciasEditPage";
import CicloPage from "../pages/panel/ciclo/CicloPage";
import AsignarRAPage from "../pages/panel/asignar-ra/AsignarRAPage";
import MedicionRAPage from "../pages/panel/medicion-ra/MedicionRAPage";
import { ROUTES, normalizePathname } from "./appRoutes";

function isAccessRoute(pathname: string) {
  return (
    pathname === ROUTES.access ||
    (ROUTES.accessAliases as readonly string[]).includes(pathname)
  );
}

function parseMapeoRoute(pathname: string) {
  const classificationCreateMatch = pathname.match(
    /^\/panel\/mapeo-competencias\/clasificacion\/crear$/
  );
  const createMatch = pathname.match(/^\/panel\/mapeo-competencias\/crear$/);
  const classificationEditMatch = pathname.match(
    /^\/panel\/mapeo-competencias\/([^/]+)\/clasificacion\/editar$/
  );
  const editMatch = pathname.match(/^\/panel\/mapeo-competencias\/([^/]+)\/editar$/);

  if (classificationCreateMatch) return { type: "classificationCreate" };
  if (createMatch) return { type: "create" };
  if (classificationEditMatch) return { type: "classificationEdit", mapeoId: classificationEditMatch[1] };
  if (editMatch) return { type: "edit", mapeoId: editMatch[1] };

  return null;
}

export default function AppRouter() {
  const normalizedPath = normalizePathname(window.location.pathname);

  if (isAccessRoute(normalizedPath)) {
    return <AccessPage />;
  }

  // Verificar rutas de mapeo con parámetros
  const mapeoRoute = parseMapeoRoute(normalizedPath);
  if (mapeoRoute) {
    switch (mapeoRoute.type) {
      case "classificationCreate":
        return <MapeoCompetenciasClassificationCreatePage />;
      case "create":
        return <MapeoCompetenciasCreatePage />;
      // case "classificationEdit":
      //   return <MapeoCompetenciasClassificationEditPage />;
      // case "edit":
      //   return <MapeoCompetenciasEditPage />;
    }
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
