import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ContrastMode = "default" | "high";
export type FontSizeMode = "default" | "large" | "xlarge";

export interface AccessibilitySettings {
  contrast: ContrastMode;
  fontSize: FontSizeMode;
}

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  setContrast: (contrast: ContrastMode) => void;
  setFontSize: (fontSize: FontSizeMode) => void;
  toggleHighContrast: () => void;
  resetSettings: () => void;
}

export const ACCESSIBILITY_STORAGE_KEY = "secub-accessibility-settings";

const defaultSettings: AccessibilitySettings = {
  contrast: "default",
  fontSize: "default",
};

export const AccessibilitySettingsContext = createContext<AccessibilityContextValue | null>(null);

function isContrastMode(value: unknown): value is ContrastMode {
  return value === "default" || value === "high";
}

function isFontSizeMode(value: unknown): value is FontSizeMode {
  return value === "default" || value === "large" || value === "xlarge";
}

function readStoredSettings(): AccessibilitySettings {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  try {
    const rawSettings = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);

    if (!rawSettings) {
      return defaultSettings;
    }

    const parsedSettings = JSON.parse(rawSettings) as Partial<AccessibilitySettings>;

    return {
      contrast: isContrastMode(parsedSettings.contrast)
        ? parsedSettings.contrast
        : defaultSettings.contrast,
      fontSize: isFontSizeMode(parsedSettings.fontSize)
        ? parsedSettings.fontSize
        : defaultSettings.fontSize,
    };
  } catch {
    return defaultSettings;
  }
}

function applySettingsToDocument(settings: AccessibilitySettings) {
  if (typeof document === "undefined") return;

  document.documentElement.dataset.contrast = settings.contrast;
  document.documentElement.dataset.fontSize = settings.fontSize;
}

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const storedSettings = readStoredSettings();
    applySettingsToDocument(storedSettings);
    return storedSettings;
  });

  useEffect(() => {
    applySettingsToDocument(settings);

    try {
      window.localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // La plataforma debe seguir funcionando aunque localStorage no esté disponible.
    }
  }, [settings]);

  const setContrast = useCallback((contrast: ContrastMode) => {
    setSettings((currentSettings) => ({ ...currentSettings, contrast }));
  }, []);

  const setFontSize = useCallback((fontSize: FontSizeMode) => {
    setSettings((currentSettings) => ({ ...currentSettings, fontSize }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      contrast: currentSettings.contrast === "high" ? "default" : "high",
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      settings,
      setContrast,
      setFontSize,
      toggleHighContrast,
      resetSettings,
    }),
    [resetSettings, setContrast, setFontSize, settings, toggleHighContrast],
  );

  return (
    <AccessibilitySettingsContext.Provider value={value}>
      {children}
    </AccessibilitySettingsContext.Provider>
  );
}
