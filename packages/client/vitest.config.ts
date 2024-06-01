import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    reporters: ["html"],
    browser: {
      provider: "playwright",
      name: "chromium",
    },
  },
});
