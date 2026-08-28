import { defineConfig } from "vitest/config";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  base: process.env.GITHUB_PAGES === "true" ? "/Secub-Frontend/" : "/",
  server: {
    // Pre-transform the entry graph on server start so the first navigation
    // does not wait on it.
    warmup: {
      clientFiles: [
        "./src/main.tsx",
        "./src/App.tsx",
        "./src/app/AppRouter.tsx",
      ],
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    // Prebundle the heavy eager deps up front instead of discovering them
    // mid-session (which forces a full-page reload in dev).
    include: ["react", "react-dom", "react-dom/client", "motion/react"],
    // PDF/Excel are only reached through dynamic import() now; keep them out
    // of the cold-start scan and let them optimize on first export instead.
    exclude: ["@react-pdf/renderer", "exceljs"],
  },
  plugins: [
    react(),
    // React Compiler runs through a full Babel pass (~64% of build time).
    // Apply it only for `vite build`; skip it during `vite` dev so cold
    // start and HMR stay fast.
    ...(command === "build"
      ? [babel({ presets: [reactCompilerPreset()] })]
      : []),
    tailwindcss(),
  ],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    restoreMocks: true,
    clearMocks: true,
  },
}));
