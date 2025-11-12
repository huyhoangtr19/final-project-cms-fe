import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
  },
  server: {
    port: process.env.VITE_PORT || 3000,
  },
});
