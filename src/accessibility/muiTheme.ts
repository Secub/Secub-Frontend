import { createTheme, type Theme } from "@mui/material/styles";
import type { ContrastMode } from "./AccessibilityProvider";

// MUI styles are unlayered, so they beat Tailwind utilities and ignore the
// `html[data-contrast="high"]` tokens. Its palette must follow the contrast
// mode itself. Keep these values in sync with `src/styles/base.css`.
const highContrastTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#000000", paper: "#111111" },
    text: { primary: "#ffffff", secondary: "#f3f4f6", disabled: "#9ca3af" },
    primary: { main: "#6cb6ff", contrastText: "#000000" },
    divider: "#ffffff",
  },
});

const defaultTheme = createTheme();

export function createSecubMuiTheme(contrast: ContrastMode): Theme {
  return contrast === "high" ? highContrastTheme : defaultTheme;
}
