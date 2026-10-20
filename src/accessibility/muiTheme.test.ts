import ColorContrastChecker from "color-contrast-checker";
import { describe, expect, it } from "vitest";
import { createSecubMuiTheme } from "./muiTheme";

const checker = new ColorContrastChecker();

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

  it.each([
    ["primary text on paper", "primary"],
    ["secondary text on paper", "secondary"],
  ] as const)("keeps %s readable in high contrast (AA)", (_label, key) => {
    const theme = createSecubMuiTheme("high");

    expect(checker.isLevelAA(theme.palette.text[key], theme.palette.background.paper, 14)).toBe(true);
  });
});
