declare module "color-contrast-checker" {
  export default class ColorContrastChecker {
    isLevelAA(
      foregroundColor: string,
      backgroundColor: string,
      fontSize?: number
    ): boolean;

    isLevelAAA(
      foregroundColor: string,
      backgroundColor: string,
      fontSize?: number
    ): boolean;
  }
}