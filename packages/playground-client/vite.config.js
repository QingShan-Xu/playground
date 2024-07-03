import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import pkg from "./package.json"
import replace from "@rollup/plugin-replace"

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "Client",
    },
    rollupOptions: {
      external: Object.keys({
        ...(pkg?.dependencies || {}),
        ...(pkg?.devDependencies || {}),
        ...(pkg?.peerDependencies || {}),
      }),
      output: [
        {
          chunkFileNames: "[name]-[hash].js",
          entryFileNames: "[name].js",
          format: "es",
          inlineDynamicImports: true,
        },
      ],
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
    }),
    replace({
      preventAssignment: true,
      values: {
        global: "globalThis",
        "process.env.PACKAGE_VERSION": `"${pkg.version}"`,
      },
    }),
  ],
})
