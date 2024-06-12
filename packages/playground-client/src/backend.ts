
import { unpkgPlugin } from "./unpkgPlugin"
import { bundleList, generateUrl, normalizePath } from "./utils"
import { ExtractBackendFunc, IIpc } from "./type"
import esbuild from "esbuild-wasm"

let isEsbuildInit = false

self.addEventListener("message", async ({ data }) => {
  try {
    const values = await trigger(data.args)
    postMessage({ result: { type: "success", ...values }, ipcId: data.ipcId })
  } catch (error) {
    postMessage({ error, ipcId: data.ipcId })
  }
})

const trigger = async (data: IIpc["client2Backend"]) => {
  if (data.type === "init-esbuild") {
    return handleInitEsbuild(data)
  }

  if (data.type === "build") {
    return handleBuild(data)
  }

  throw new Error("Unknown command")
}

// esbuild初始化
const handleInitEsbuild: ExtractBackendFunc<"init-esbuild"> = async () => {
  if (isEsbuildInit) {
    return { msg: "init-esbuild-successful" }
  }
  await esbuild.initialize({
    wasmURL: "https://cdn.jsdelivr.net/npm/esbuild-wasm@0.21.4/esbuild.wasm",
    worker: false,
  })
  isEsbuildInit = true
  return { msg: "init-esbuild-successful" }
}

// 打包
const handleBuild: ExtractBackendFunc<"build"> = async (data) => {

  data.files = normalizePath(data.files)
  data.options.entry = normalizePath(data.options.entry)
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

  return {
    msg: "build-successful",
    modules: bundleList
  }
}