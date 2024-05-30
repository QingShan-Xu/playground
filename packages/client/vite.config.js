import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import pkg from "./package.json"
import replace from "@rollup/plugin-replace"

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Client',
    },
    rollupOptions: {
      external: Object.keys({
        ...(pkg?.dependencies || {}),
        ...(pkg?.devDependencies || {}),
        ...(pkg?.peerDependencies || {}),
      }),
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
        "process.env.CODESANDBOX_ENV": `"${process.env.CODESANDBOX_ENV}"`,
        "process.env.PACKAGE_VERSION": `"${pkg.version}"`,
      },
    }),
  ],
})
