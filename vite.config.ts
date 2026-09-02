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
      "/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split stable vendors into their own long-cached chunks so the app
        // shell streams and they survive across deploys. The dynamically
        // imported @react-pdf/renderer and exceljs are left to default
        // splitting so they stay out of the eager path.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id))
            return "vendor-react";
          if (
            /[\\/]node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/.test(
              id,
            )
          )
            return "vendor-motion";
          if (/[\\/]node_modules[\\/](@emotion|@mui)[\\/]/.test(id))
            return "vendor-mui";
        },
      },
    },
  },
  optimizeDeps: {
    // Prebundle the heavy deps up front instead of discovering them
    // mid-session (which forces a full-page reload in dev). @react-pdf and
    // exceljs must stay prebundled — their CommonJS deps (base64-js, …) break
    // when served unbundled, even though the app only reaches them via
    // dynamic import().
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "motion/react",
      "@react-pdf/renderer",
      "exceljs",
    ],
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
