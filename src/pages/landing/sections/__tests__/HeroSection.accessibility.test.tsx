import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ColorContrastChecker from "color-contrast-checker";
import HeroSection from "../HeroSection";

describe("HeroSection accesible", () => {
  it("muestra el enlace Ver módulos con texto visible y contraste AA", () => {
    render(<HeroSection />);

    const modulesLink = screen.getByRole("link", { name: /ver módulos/i });

    expect(modulesLink).toBeVisible();
    expect(modulesLink).not.toHaveAttribute("aria-disabled", "true");
    expect(modulesLink.className).toContain("hero-button-secondary");

    const checker = new ColorContrastChecker();
    expect(checker.isLevelAA("#111827", "#ffffff", 14)).toBe(true);
  });
});
