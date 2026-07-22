import { lazy, type LazyExoticComponent, type ComponentType } from "react";
import { ROUTES } from "../appRoutes";

export type LazyPageComponent = LazyExoticComponent<ComponentType>;

export interface AppRouteDefinition {
  paths: readonly string[];
  component: LazyPageComponent;
}

const LandingPage = lazy(() => import("../../pages/landing/LandingPage"));
const AccessPage = lazy(() => import("../../pages/access/AccessPage"));
const ProgramSelectorPage = lazy(() => import("../../pages/program-selector/ProgramSelectorPage"));
const DashboardPage = lazy(() => import("../../pages/panel/dashboard/DashboardPage"));
const UserSettingsPage = lazy(() => import("../../pages/panel/ajustes/UserSettingsPage"));
const AccessibilitySettingsPage = lazy(() => import("../../pages/panel/accesibilidad/AccessibilitySettingsPage"));
const PerfilEgresoPage = lazy(() => import("../../pages/panel/perfil-egreso/PerfilEgresoPage"));
const PropositoFormacionPage = lazy(() => import("../../pages/panel/proposito-formacion/PropositoFormacionPage"));
const CompetenciasRAPage = lazy(() => import("../../pages/panel/competencias-ra/CompetenciasRAPage"));
const MapeoCompetenciasPage = lazy(() => import("../../pages/panel/mapeo-competencias/MapeoCompetenciasPage"));
const MapeoCompetenciasCreatePage = lazy(() => import("../../pages/panel/mapeo-competencias/MapeoCompetenciasCreatePage"));
const CicloPage = lazy(() => import("../../pages/panel/ciclo/CicloPage"));
const AsignarRAPage = lazy(() => import("../../pages/panel/asignar-ra/AsignarRAPage"));
const MedicionRAPage = lazy(() => import("../../pages/panel/medicion-ra/MedicionRAPage"));

export const appRouteDefinitions: readonly AppRouteDefinition[] = [
  { paths: [ROUTES.landing], component: LandingPage },
  { paths: [ROUTES.access, ...ROUTES.accessAliases], component: AccessPage },
  { paths: [ROUTES.programSelector, ...ROUTES.programSelectorAliases], component: ProgramSelectorPage },
  { paths: [ROUTES.panel, ROUTES.panelDashboard], component: DashboardPage },
  { paths: [ROUTES.panelSettings], component: UserSettingsPage },
  { paths: [ROUTES.panelAccessibility], component: AccessibilitySettingsPage },
  { paths: [ROUTES.panelPerfilEgreso], component: PerfilEgresoPage },
  { paths: [ROUTES.panelPropositoFormacion], component: PropositoFormacionPage },
  { paths: [ROUTES.panelCompetenciasRa], component: CompetenciasRAPage },
  { paths: [ROUTES.panelMapeoCompetencias], component: MapeoCompetenciasPage },
  {
    paths: [ROUTES.panelMapeoCompetenciasCrear, ROUTES.panelMapeoCompetenciasEditar],
    component: MapeoCompetenciasCreatePage,
  },
  { paths: [ROUTES.panelCiclo], component: CicloPage },
  { paths: [ROUTES.panelAsignarRa], component: AsignarRAPage },
  { paths: [ROUTES.panelMedicionRa], component: MedicionRAPage },
];

export function resolveRoute(pathname: string) {
  return appRouteDefinitions.find((route) => route.paths.includes(pathname));
}
