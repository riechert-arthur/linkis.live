import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    alias: {
      "~": path.resolve(__dirname, "app"),
      "~/": path.resolve(__dirname, "app") + "/",
    },
  },
})
