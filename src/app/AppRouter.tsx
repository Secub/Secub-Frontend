import { Suspense, useEffect, useMemo } from "react";
import {
  PERSISTED_DEMO_SEARCH_PARAMS,
  ROUTES,
  buildRouteWithSearch,
  navigateToRoute,
  normalizePathname,
  pickSearchParams,
} from "./appRoutes";
import { getPanelRouteAccessRedirect } from "./panelRoutePermissions";
import { getCurrentMockUser } from "../services/auth/mockUser";
import { useInactivityLogout } from "../services/auth/useInactivityLogout";
import { hasSelectedProgram } from "../services/programSelection";
import ChunkErrorBoundary, { clearChunkReloadFlag } from "./router/ChunkErrorBoundary";
import NotFoundPage from "./router/NotFoundPage";
import PageLoadingState from "./router/PageLoadingState";
import { resolveRoute } from "./router/routeConfig";
import { useBrowserLocation } from "./router/useBrowserLocation";

function isPanelPath(pathname: string) {
  return pathname === ROUTES.panel || pathname.startsWith(`${ROUTES.panel}/`);
}

export default function AppRouter() {
  const location = useBrowserLocation();
  const normalizedPath = useMemo(
    () => normalizePathname(location.pathname),
    [location.pathname],
  );
  const panelRoute = isPanelPath(normalizedPath);
  const currentRole = getCurrentMockUser().role;
  const needsProgramSelection = panelRoute && !hasSelectedProgram();
  const permissionRedirect = panelRoute && !needsProgramSelection
    ? getPanelRouteAccessRedirect(normalizedPath, currentRole)
    : null;

  useInactivityLogout(panelRoute);

  useEffect(() => {
    // Si llegamos hasta aquí es porque el árbol montó sin errores de chunk:
    // se limpia la marca para que un futuro despliegue también reciba su
    // propio intento de recarga automática.
    clearChunkReloadFlag();
  }, []);

  useEffect(() => {
    if (!needsProgramSelection) return;

    const params = pickSearchParams(location.search, PERSISTED_DEMO_SEARCH_PARAMS);
    params.set("role", params.get("role") ?? "director");
    navigateToRoute(buildRouteWithSearch(ROUTES.programSelector, params), {
      replace: true,
    });
  }, [location.search, needsProgramSelection]);

  useEffect(() => {
    if (!permissionRedirect) return;

    const params = pickSearchParams(location.search, PERSISTED_DEMO_SEARCH_PARAMS);
    navigateToRoute(buildRouteWithSearch(permissionRedirect, params), {
      replace: true,
    });
  }, [location.search, permissionRedirect]);

  if (needsProgramSelection || permissionRedirect) {
    return <PageLoadingState />;
  }

  const route = resolveRoute(normalizedPath);
  if (!route) return <NotFoundPage />;

  const Page = route.component;

  return (
    <ChunkErrorBoundary key={normalizedPath}>
      <Suspense fallback={<PageLoadingState />}>
        <Page />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
