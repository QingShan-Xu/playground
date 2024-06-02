import { defineProject } from "vitest/config"

export default defineProject({
  test: {
    name: "playground-client",
    browser: {
      enabled: true,
      provider: "playwright",
      name: "chromium",
    },
  },
})
