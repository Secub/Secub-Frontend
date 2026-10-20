/// <reference types="node" />
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Hardcoded colors ignore the high contrast tokens, so components must use the
// CSS variables from src/styles/tokens.css. Translucent white/black overlays
// (`white/40`, `black/55`) stay allowed: they sit on photos, the always-dark
// sidebar or modal backdrops and read the same in both modes.
const FORBIDDEN = [
  /-\[(?:color:)?#[0-9a-f]{3,8}\]/gi,
  /-\[(?:color:)?rgba?\([^\]]*\)\]/gi,
  /\b(?:bg|text|border|ring|divide|from|to|via|fill|stroke)-(?:amber|red|green|blue|slate|gray|zinc|neutral|emerald|yellow|orange|sky|indigo)-\d{2,3}\b/g,
  /(?<![\w-])(?:[\w-]+:)*(?:bg|text)-(?:white|black)(?![\w/-])/g,
  /(?<![\w-])(?:[\w-]+:)*bg-white\/(?:8|9)\d\b/g,
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe("component colors", () => {
  it("use design tokens instead of hardcoded colors", () => {
    const offenders = sourceFiles("src").flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return FORBIDDEN.flatMap((pattern) => [...source.matchAll(pattern)].map((match) => `${file}: ${match[0]}`));
    });

    expect(offenders).toEqual([]);
  });
});
