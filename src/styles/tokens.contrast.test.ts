/// <reference types="node" />
import { readFileSync } from "node:fs";
import ColorContrastChecker from "color-contrast-checker";
import { describe, expect, it } from "vitest";

// Vitest returns an empty string for `?raw` CSS imports, so the files are read
// from disk (Vitest runs from the project root) to test the real values.
const tokensCss = readFileSync("src/styles/tokens.css", "utf8");
const baseCss = readFileSync("src/styles/base.css", "utf8");

const checker = new ColorContrastChecker();

function readTokens(css: string, selector: string) {
  const start = css.indexOf(selector);
  const block = css.slice(start, css.indexOf("}", start));
  const tokens: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-f]{6})\s*;/gi)) {
    tokens[name] = value.toLowerCase();
  }
  return tokens;
}

const normal = readTokens(tokensCss, ":root");
const highContrast = { ...normal, ...readTokens(baseCss, 'html[data-contrast="high"]') };

// Text/background pairs that the components actually render (WCAG 2.1 AA,
// normal-size text: at least 4.5:1).
const textPairs: Array<[label: string, text: string, background: string]> = [
  ["body text on page background", "--secub-text", "--secub-bg"],
  ["body text on surface", "--secub-text", "--secub-surface"],
  ["muted text on surface", "--secub-muted-text", "--secub-surface"],
  ["muted text on page background", "--secub-muted-text", "--secub-bg"],
  ["primary button text", "--secub-secondary-text", "--secub-secondary"],
  ["accent button text", "--secub-primary-text", "--secub-primary"],
  ["headings on cards", "--color-secondary-4", "--color-surface-card"],
  ["secondary text on cards", "--color-gray-3", "--color-surface-card"],
];

describe("color tokens contrast (WCAG 2.1 AA)", () => {
  it.each(textPairs)("%s passes in normal mode", (_label, text, background) => {
    expect(checker.isLevelAA(normal[text], normal[background], 14)).toBe(true);
  });

  it.each(textPairs.filter(([, text, background]) => text.startsWith("--secub-") && background.startsWith("--secub-")))(
    "%s passes in high contrast mode",
    (_label, text, background) => {
      expect(checker.isLevelAA(highContrast[text], highContrast[background], 14)).toBe(true);
    },
  );

  it("keeps the focus ring visible against the page background (3:1)", () => {
    expect(checker.isLevelCustom(normal["--secub-focus"], normal["--secub-bg"], 3)).toBe(true);
    expect(checker.isLevelCustom(highContrast["--secub-focus"], highContrast["--secub-bg"], 3)).toBe(true);
  });
});
