
import { unpkgPlugin } from "./unpkgPlugin"
import { bundleList, generateUrl } from "./utils"
import { IIpc } from "./type"
import _esbuild from "esbuild-wasm"

declare global {
  // eslint-disable-next-line no-var 
  var esbuild: typeof _esbuild
}

self.addEventListener("message", async ({ data }) => {
  try {
    const result = await trigger(data.args)
    postMessage({ result, ipcId: data.ipcId })
  } catch (error) {
    postMessage({ error, ipcId: data.ipcId })
  }
})

const handleInitEsbuild = async () => {
  importScripts("https://cdn.jsdelivr.net/npm/esbuild-wasm@0.21.4/lib/browser.min.js")
  await esbuild.initialize({
    wasmURL: "https://cdn.jsdelivr.net/npm/esbuild-wasm@0.21.4/esbuild.wasm",
    worker: false,
  })
  return "init-esbuild-success"
}

const handleBuild = async (
  data: Extract<IIpc["client2Backend"], { type: "build" }>
) => {
  const mainRes = await esbuild.build({
    bundle: true,
    write: false,
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".css", ".json"],
    treeShaking: true,
    define: {
      "process.env.NODE_ENV": "'production'",
      global: "window",
    },
    outdir: "/",
    format: "esm",
    plugins: [unpkgPlugin(data.files)],
    entryPoints: [data.options.entry],
  })

  bundleList
    .splice(0, bundleList.length)
    .forEach((bundle) => URL.revokeObjectURL(bundle.url))
  mainRes.outputFiles.forEach(generateUrl)

  return bundleList
}

const trigger = async (data: IIpc["client2Backend"]) => {
  switch (data.type) {
    case "init-esbuild":
      return handleInitEsbuild()
    default:
      if (data.type === "build") {
        return handleBuild(data)
      }
      throw new Error("Unknown command")
  }
}
