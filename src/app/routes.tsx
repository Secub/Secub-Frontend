export const ROUTES = {
  landing: "/",
  access: "/acceder",
  accessAliases: ["/login", "/auth"],
  panelDemo: "/panel-demo",
} as const;

export function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}
