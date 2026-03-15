import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // The Anthropic SDK is large and complex; excluding it from pre-bundling
    // prevents Vite from timing out trying to trace its CJS/ESM hybrid entry points.
    exclude: ["@anthropic-ai/sdk"],
  },
})
