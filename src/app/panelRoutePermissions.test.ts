import { describe, expect, it } from "vitest";
import { getPanelRouteAccessRedirect } from "./panelRoutePermissions";
import { ROUTES } from "./appRoutes";

describe("seccionales route permissions", () => {
  it("allows administrators and redirects other roles to the dashboard", () => {
    expect(getPanelRouteAccessRedirect(ROUTES.panelSeccionales, "administrador")).toBeNull();
    expect(getPanelRouteAccessRedirect(ROUTES.panelSeccionales, "vicerrector"))
      .toBe(ROUTES.panelDashboard);
    expect(getPanelRouteAccessRedirect(ROUTES.panelSeccionales, "decano"))
      .toBe(ROUTES.panelDashboard);
  });
});
