/// <reference types="node" />
import { readFileSync } from "node:fs";
import ColorContrastChecker from "color-contrast-checker";
import { describe, expect, it } from "vitest";

// Vitest returns an empty string for `?raw` CSS imports, so the files are read
// from disk (Vitest runs from the project root) to test the real values.
const tokensCss = readFileSync("src/styles/tokens.css", "utf8");
const baseCss = readFileSync("src/styles/base.css", "utf8");

const checker = new ColorContrastChecker();

type Tokens = Record<string, string>;

function readTokens(css: string, selector: string): Tokens {
  const start = css.indexOf(selector);
  const block = css.slice(start, css.indexOf("}", start));
  const tokens: Tokens = {};
  for (const [, name, value] of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens[name] = value.trim().toLowerCase();
  }
  return tokens;
}

// Follows `var(--token)` aliases so a token pointing at another one is tested
// with the value it actually renders in that mode.
function resolveTokens(tokens: Tokens): Tokens {
  const resolve = (value: string, depth = 0): string => {
    const alias = /^var\((--[\w-]+)\)$/.exec(value);
    if (!alias || depth > 10) return value;
    return resolve(tokens[alias[1]] ?? value, depth + 1);
  };
  return Object.fromEntries(Object.entries(tokens).map(([name, value]) => [name, resolve(value)]));
}

const rawNormal = readTokens(tokensCss, ":root");
const normal = resolveTokens(rawNormal);
const highContrast = resolveTokens({ ...rawNormal, ...readTokens(baseCss, 'html[data-contrast="high"]') });

const modes: Array<[mode: string, tokens: Tokens]> = [
  ["normal", normal],
  ["high contrast", highContrast],
];

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
  ["links and icon actions on cards", "--color-link", "--color-surface-card"],
  ["links on page background", "--color-link", "--color-surface"],
  ["pill text on inverse fill", "--color-on-inverse", "--color-inverse-surface"],
  ["neutral badge", "--color-secondary-4", "--color-neutral-fill"],
  ["info badge", "--color-on-status", "--color-info"],
  ["success badge and completed step", "--color-on-status", "--color-success"],
  ["warning badge", "--color-on-status", "--color-warning"],
  ["danger badge and danger button", "--color-on-error", "--color-error"],
  ["accent badge", "--color-on-status", "--color-primary"],
];

const modePairs = modes.flatMap(([mode, tokens]) =>
  textPairs.map(([label, text, background]) => [`${label} (${mode})`, tokens[text], tokens[background]] as const),
);

describe("color tokens contrast (WCAG 2.1 AA)", () => {
  it.each(modePairs)("%s passes", (_label, text, background) => {
    expect(text).toMatch(/^#[0-9a-f]{6}$/);
    expect(background).toMatch(/^#[0-9a-f]{6}$/);
    expect(checker.isLevelAA(text, background, 14)).toBe(true);
  });

  it.each(modes)("keeps the focus ring visible against the page background in %s mode (3:1)", (_mode, tokens) => {
    expect(checker.isLevelCustom(tokens["--secub-focus"], tokens["--secub-bg"], 3)).toBe(true);
  });
});
