import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccessibilityProvider } from "../AccessibilityProvider";
import AccessibilityMenu from "../AccessibilityMenu";

function renderAccessibilityMenu() {
  return render(
    <AccessibilityProvider>
      <AccessibilityMenu />
    </AccessibilityProvider>,
  );
}

describe("AccessibilityMenu", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-contrast");
    document.documentElement.removeAttribute("data-font-size");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("abre el panel y permite cambiar contraste y tamaño de letra", async () => {
    const user = userEvent.setup();

    renderAccessibilityMenu();

    const trigger = screen.getByRole("button", { name: /accesibilidad/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("dialog", { name: /opciones de accesibilidad/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /contraste alto/i }));
    expect(document.documentElement).toHaveAttribute("data-contrast", "high");

    await user.click(screen.getByRole("button", { name: /texto grande/i }));
    expect(document.documentElement).toHaveAttribute("data-font-size", "large");

    expect(window.localStorage.getItem("secub-accessibility-settings")).toContain(
      '"contrast":"high"',
    );
    expect(window.localStorage.getItem("secub-accessibility-settings")).toContain(
      '"fontSize":"large"',
    );
  });

  it("restaura los ajustes por defecto", async () => {
    const user = userEvent.setup();

    renderAccessibilityMenu();

    await user.click(screen.getByRole("button", { name: /accesibilidad/i }));
    await user.click(screen.getByRole("button", { name: /contraste alto/i }));
    await user.click(screen.getByRole("button", { name: /texto extra grande/i }));
    await user.click(screen.getByRole("button", { name: /restablecer ajustes/i }));

    expect(document.documentElement).toHaveAttribute("data-contrast", "default");
    expect(document.documentElement).toHaveAttribute("data-font-size", "default");
  });

  it("cierra el panel con Escape", async () => {
    const user = userEvent.setup();

    renderAccessibilityMenu();

    const trigger = screen.getByRole("button", { name: /accesibilidad/i });
    await user.click(trigger);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: /opciones de accesibilidad/i })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
