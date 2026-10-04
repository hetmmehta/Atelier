import path from "node:path";
import { defineConfig } from "vitest/config";

// Kept separate from vite.config.js so unit tests don't load the Base44 plugin.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{js,jsx}"],
  },
});
