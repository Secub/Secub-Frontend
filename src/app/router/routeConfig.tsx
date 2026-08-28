import { lazy, type LazyExoticComponent, type ComponentType } from "react";
import { ROUTES } from "../appRoutes";

export type LazyPageComponent = LazyExoticComponent<ComponentType>;

export interface AppRouteDefinition {
  paths: readonly string[];
  component: LazyPageComponent;
}

/**
 * Cada loader es la misma función `() => import(...)` que antes se pasaba
 * directamente a `lazy()`. Guardarlos aparte permite invocarlos para
 * precargar el chunk (por ejemplo al pasar el mouse sobre un enlace) sin
 * montar el componente ni depender de que Suspense ya esté renderizando esa
 * ruta.
 */
const pageLoaders = {
  landing: () => import("../../pages/landing/LandingPage"),
  access: () => import("../../pages/access/AccessPage"),
  programSelector: () => import("../../pages/program-selector/ProgramSelectorPage"),
  dashboard: () => import("../../pages/panel/dashboard/DashboardPage"),
  settings: () => import("../../pages/panel/ajustes/UserSettingsPage"),
  accessibility: () => import("../../pages/panel/accesibilidad/AccessibilitySettingsPage"),
  perfilEgreso: () => import("../../pages/panel/perfil-egreso/PerfilEgresoPage"),
  propositoFormacion: () => import("../../pages/panel/proposito-formacion/PropositoFormacionPage"),
  competenciasRa: () => import("../../pages/panel/competencias-ra/CompetenciasRAPage"),
  mapeoCompetencias: () => import("../../pages/panel/mapeo-competencias/MapeoCompetenciasPage"),
  mapeoCompetenciasManage: () => import("../../pages/panel/mapeo-competencias/MapeoCompetenciasCreatePage"),
  ciclo: () => import("../../pages/panel/ciclo/CicloPage"),
  asignarRa: () => import("../../pages/panel/asignar-ra/AsignarRAPage"),
  medicionRa: () => import("../../pages/panel/medicion-ra/MedicionRAPage"),
} as const satisfies Record<string, () => Promise<{ default: ComponentType }>>;

type PageKey = keyof typeof pageLoaders;
type RouteLoader = (typeof pageLoaders)[PageKey];

const lazyPages = Object.fromEntries(
  (Object.entries(pageLoaders) as [PageKey, RouteLoader][]).map(([key, loader]) => [
    key,
    lazy(loader),
  ]),
) as Record<PageKey, LazyPageComponent>;

export const appRouteDefinitions: readonly AppRouteDefinition[] = [
  { paths: [ROUTES.landing], component: lazyPages.landing },
  { paths: [ROUTES.access, ...ROUTES.accessAliases], component: lazyPages.access },
  { paths: [ROUTES.programSelector, ...ROUTES.programSelectorAliases], component: lazyPages.programSelector },
  { paths: [ROUTES.panel, ROUTES.panelDashboard], component: lazyPages.dashboard },
  { paths: [ROUTES.panelSettings], component: lazyPages.settings },
  { paths: [ROUTES.panelAccessibility], component: lazyPages.accessibility },
  { paths: [ROUTES.panelPerfilEgreso], component: lazyPages.perfilEgreso },
  { paths: [ROUTES.panelPropositoFormacion], component: lazyPages.propositoFormacion },
  { paths: [ROUTES.panelCompetenciasRa], component: lazyPages.competenciasRa },
  { paths: [ROUTES.panelMapeoCompetencias], component: lazyPages.mapeoCompetencias },
  {
    paths: [ROUTES.panelMapeoCompetenciasCrear, ROUTES.panelMapeoCompetenciasEditar],
    component: lazyPages.mapeoCompetenciasManage,
  },
  { paths: [ROUTES.panelCiclo], component: lazyPages.ciclo },
  { paths: [ROUTES.panelAsignarRa], component: lazyPages.asignarRa },
  { paths: [ROUTES.panelMedicionRa], component: lazyPages.medicionRa },
];

export function resolveRoute(pathname: string) {
  return appRouteDefinitions.find((route) => route.paths.includes(pathname));
}

const loaderByPath = new Map<string, RouteLoader>(
  appRouteDefinitions.flatMap((route) => {
    const pageKey = (Object.keys(pageLoaders) as PageKey[]).find(
      (key) => lazyPages[key] === route.component,
    );
    if (!pageKey) return [];
    return route.paths.map((path) => [path, pageLoaders[pageKey]] as const);
  }),
);

const preloadedPaths = new Set<string>();

/**
 * Dispara la descarga del chunk de una ruta sin montar su componente.
 * Es seguro llamarla repetidas veces para la misma ruta: el navegador
 * cachea el módulo descargado y, además, esta función evita reintentos
 * mientras la primera precarga sigue en curso o ya se completó.
 *
 * Si la descarga falla (por ejemplo, sin conexión) no se interrumpe al
 * usuario: `React.lazy` volverá a intentarlo de forma normal cuando la
 * ruta se navegue realmente.
 */
export function preloadRoute(pathname?: string | null) {
  if (!pathname || preloadedPaths.has(pathname)) return;

  const loader = loaderByPath.get(pathname);
  if (!loader) return;

  preloadedPaths.add(pathname);
  loader().catch(() => {
    preloadedPaths.delete(pathname);
  });
}

export function preloadRoutes(pathnames: ReadonlyArray<string | null | undefined>) {
  pathnames.forEach((pathname) => preloadRoute(pathname));
}
