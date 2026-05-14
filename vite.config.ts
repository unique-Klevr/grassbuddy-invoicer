import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === "true" ? "/grassbuddy-invoicer/" : "/",
  server: {
    port: 5188,
    proxy: {
      "/api": "http://localhost:4000"
    }
  }
});
