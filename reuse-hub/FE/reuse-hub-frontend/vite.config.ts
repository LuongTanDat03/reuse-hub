import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  define: {
    global: 'globalThis',
  },
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
