import { describe, expect, it } from "vitest";
import ColorContrastChecker from "color-contrast-checker";

describe("contraste de colores base SECUB", () => {
  it("mantiene contraste AA en textos principales sobre fondo claro", () => {
    const checker = new ColorContrastChecker();

    expect(checker.isLevelAA("#182233", "#ffffff", 14)).toBe(true);
    expect(checker.isLevelAA("#374151", "#ffffff", 14)).toBe(true);
    expect(checker.isLevelAA("#0e65d9", "#ffffff", 14)).toBe(true);
  });
});