import { ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { createSecubMuiTheme } from "./muiTheme";
import { useAccessibilitySettings } from "./useAccessibilitySettings";

interface MuiThemeBridgeProps {
  children: ReactNode;
}

export function MuiThemeBridge({ children }: MuiThemeBridgeProps) {
  const { settings } = useAccessibilitySettings();

  return <ThemeProvider theme={createSecubMuiTheme(settings.contrast)}>{children}</ThemeProvider>;
}
