import { defineProject } from "vitest/config"

export default defineProject({
  test: {
    name: "playground-react",
    browser: {
      enabled: true,
      provider: "playwright",
      name: "chromium",
    },
  },
})