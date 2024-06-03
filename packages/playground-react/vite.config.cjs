import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import pkg from "./package.json"
import path, { resolve } from "node:path"

const inlinePkg = [
  "@shikijs/monaco"
]

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "PlaygroundReact",
    },
    rollupOptions: {
      treeshake: {
        preset: "smallest",
        manualPureFunctions: ["createStitches"],
      },
      external: [
        "react/jsx-runtime",
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.devDependencies),
        ...Object.keys(pkg.peerDependencies),
      ].filter(name => !inlinePkg.includes(name)),
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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    }
  },
  plugins: [
    dts({
      rollupTypes: true,
      compilerOptions: {
        strict: false,
      },
    }),
  ],
})
