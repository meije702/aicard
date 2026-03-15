import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the app under /aicard/ — this ensures asset paths are correct.
  // In local dev (VITE_BASE unset) the base defaults to '/' so nothing changes.
  base: process.env.VITE_BASE ?? '/',
  optimizeDeps: {
    // The Anthropic SDK is large and complex; excluding it from pre-bundling
    // prevents Vite from timing out trying to trace its CJS/ESM hybrid entry points.
    exclude: ["@anthropic-ai/sdk"],
  },
})
