import { configDefaults, defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      css: true,
      clearMocks: true,
      environment: "jsdom",
      exclude: [...configDefaults.exclude, "tests/e2e/**"],
      restoreMocks: true,
      setupFiles: ["./tests/setup.ts"],
    },
  }),
);
