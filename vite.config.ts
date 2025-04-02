import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      file: resolve(__dirname, "src/mocks/file.js"),
      system: resolve(__dirname, "src/mocks/system.js"),
    },
  },
});
