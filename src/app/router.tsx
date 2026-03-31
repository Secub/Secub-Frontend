import AccessPage from "../pages/access/AccessPage";
import LandingPage from "../pages/landing/LandingPage";
import PanelDemoPage from "../pages/panel/PanelDemoPage";
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

  if (normalizedPath === ROUTES.panelDemo) {
    return <PanelDemoPage />;
  }

  return <LandingPage />;
}
