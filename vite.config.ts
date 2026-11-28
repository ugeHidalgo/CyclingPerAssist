import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: "buffer/",
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
