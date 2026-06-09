import { describe, expect, it } from "vitest";
import ColorContrastChecker from "color-contrast-checker";

describe("contraste de colores base SECUB", () => {
  it("mantiene contraste AA en textos principales sobre fondo claro", () => {
    const checker = new ColorContrastChecker();

    expect(checker.isLevelAA("#182233", "#ffffff", 14)).toBe(true);
    expect(checker.isLevelAA("#374151", "#ffffff", 14)).toBe(true);
    expect(checker.isLevelAA("#0e65d9", "#ffffff", 14)).toBe(true);
  });

  it("mantiene contraste AA en el botón Ver módulos del hero", () => {
    const checker = new ColorContrastChecker();

    expect(checker.isLevelAA("#111827", "#ffffff", 14)).toBe(true);
  });

  it("mantiene contraste AA en el modo de alto contraste", () => {
    const checker = new ColorContrastChecker();

    expect(checker.isLevelAA("#ffffff", "#000000", 14)).toBe(true);
    expect(checker.isLevelAA("#000000", "#ffd400", 14)).toBe(true);
    expect(checker.isLevelAA("#ffffff", "#005fcc", 14)).toBe(true);
  });
});
