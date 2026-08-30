import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    // Default "threads" pool intermittently fails with "Vitest failed to
    // find the runner" on this Windows setup; "forks" doesn't.
    pool: "forks",
  },
});
