declare module "color-contrast-checker" {
  export default class ColorContrastChecker {
    isLevelAA(colorA: string, colorB: string, fontSize?: number): boolean;
    isLevelAAA(colorA: string, colorB: string, fontSize?: number): boolean;
    isLevelCustom(colorA: string, colorB: string, ratio: number): boolean;
  }
}
