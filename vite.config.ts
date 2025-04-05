import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Exclude xmllint-wasm so Vite doesn't try to pre-bundle it.
    exclude: ["xmllint-wasm"],
  },
  build: {
    // Ensuring your target supports top-level await, if needed.
    target: "esnext",
  },
  resolve: {
    alias: {
      file: resolve(__dirname, "src/mocks/file.js"),
      system: resolve(__dirname, "src/mocks/system.js"),
    },
  },
});
