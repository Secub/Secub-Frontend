/// <reference types="node" />
import { readFileSync } from "node:fs";
import ColorContrastChecker from "color-contrast-checker";
import { describe, expect, it } from "vitest";
import { createSecubMuiTheme } from "./muiTheme";

const checker = new ColorContrastChecker();

function readHighContrastToken(name: string) {
  const css = readFileSync("src/styles/base.css", "utf8");
  const start = css.indexOf('html[data-contrast="high"]');
  const block = css.slice(start, css.indexOf("}", start));
  return new RegExp(`${name}\\s*:\\s*(#[0-9a-f]{6})`, "i").exec(block)?.[1].toLowerCase();
}

describe("createSecubMuiTheme", () => {
  it("keeps MUI's default light palette in default contrast", () => {
    const theme = createSecubMuiTheme("default");

    expect(theme.palette.mode).toBe("light");
    expect(theme.palette.background.paper).toBe("#fff");
  });

  it("switches MUI to a dark palette in high contrast", () => {
    const theme = createSecubMuiTheme("high");

    expect(theme.palette.mode).toBe("dark");
    expect(theme.palette.background.default).toBe("#000000");
    expect(theme.palette.background.paper).toBe("#111111");
  });

  it("stays in sync with the high contrast tokens in base.css", () => {
    const { palette } = createSecubMuiTheme("high");

    expect(palette.background.default).toBe(readHighContrastToken("--secub-bg"));
    expect(palette.background.paper).toBe(readHighContrastToken("--secub-surface"));
    expect(palette.text.primary).toBe(readHighContrastToken("--secub-text"));
    expect(palette.text.secondary).toBe(readHighContrastToken("--secub-muted-text"));
    expect(palette.primary.main).toBe(readHighContrastToken("--color-link"));
    expect(palette.divider).toBe(readHighContrastToken("--secub-border"));
  });

  it.each([
    ["primary text on paper", "primary"],
    ["secondary text on paper", "secondary"],
  ] as const)("keeps %s readable in high contrast (AA)", (_label, key) => {
    const theme = createSecubMuiTheme("high");

    expect(checker.isLevelAA(theme.palette.text[key], theme.palette.background.paper, 14)).toBe(true);
  });
});
