import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SidebarUserProfileMenu from "./SidebarUserProfileMenu";

vi.mock("../../services/auth/currentUser", () => ({
  getCurrentUser: () => ({
    nombre: "Ana Gómez",
    cargo: "Dirección de programa",
    email: "ana@usbcali.edu.co",
  }),
}));

vi.mock("../../services/auth/session", () => ({
  getStoredAuthSession: () => ({ contexts: [{}] }),
  logoutAuthSession: vi.fn(),
}));

vi.mock("../../services/programSelection", () => ({
  clearSelectedProgramId: vi.fn(),
  getSelectedProgram: () => ({ name: "Ingeniería de Sistemas", faculty: "Ingeniería" }),
}));

describe("SidebarUserProfileMenu", () => {
  it("does not show the account and role card in the sidebar", () => {
    render(<SidebarUserProfileMenu />);

    expect(screen.queryByLabelText(/Perfil activo/)).not.toBeInTheDocument();
    expect(screen.queryByText("Dirección de programa")).not.toBeInTheDocument();
    expect(screen.queryByText(/Ingeniería de Sistemas/)).not.toBeInTheDocument();
  });

  it("keeps the settings and logout actions", () => {
    render(<SidebarUserProfileMenu />);

    expect(screen.getByRole("button", { name: /Ajustes/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Salir/ })).toBeInTheDocument();
  });
});
