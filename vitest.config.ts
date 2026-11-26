import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      clearMocks: true,
      environment: "jsdom",
      restoreMocks: true,
      setupFiles: ["./tests/setup.ts"],
    },
  }),
);
