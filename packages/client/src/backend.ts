import {
  resolveMountConfig,
  InMemory,
  attachFS,
  fs,
  promises,
  umount,
  mount,
} from "@zenfs/core"
import esbuild from "esbuild-wasm"

import { unpkgPlugin } from "./unpkgPlugin"
import { bundleList, generateUrl } from "./utils"

self.addEventListener("message", async ({ data }) => {
  try {
    const result = await trigger(data.args)
    postMessage({ result, ipcId: data.ipcId })
  } catch (error) {
    postMessage({ error, ipcId: data.ipcId })
  }
})

const handleInitFs = async () => {
  const rootFs = fs.mounts.get("/")
  if (rootFs) {
    attachFS(self as any, rootFs)
    return "init-fs-success"
  }

  const tmpfs = await resolveMountConfig({
    backend: InMemory,
    name: "playground",
  })
  attachFS(self as any, tmpfs)
  umount("/")
  mount("/", tmpfs)
  return "init-fs-success"
}

const handleInitEsbuild = async () => {
  await esbuild.initialize({
    wasmURL: "https://cdn.jsdelivr.net/npm/esbuild-wasm@0.21.4/esbuild.wasm",
    worker: false,
  })
  return "init-esbuild-success"
}

const handleBuild = async (entry: string) => {
  const mainRes = await esbuild.build({
    bundle: true,
    write: false,
    entryPoints: [entry],
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".css", ".json"],
    treeShaking: true,
    define: {
      "process.env.NODE_ENV": "'production'",
      global: "window",
    },
    outdir: "/",
    format: "esm",
    plugins: [unpkgPlugin],
  })

  bundleList
    .splice(0, bundleList.length)
    .forEach((bundle) => URL.revokeObjectURL(bundle.url))
  mainRes.outputFiles.forEach(generateUrl)

  return bundleList
}

const trigger = async (data: any) => {
  switch (data) {
    case "init-fs":
      return handleInitFs()
    case "init-esbuild":
      return handleInitEsbuild()
    case "test-res":
      return "test-res"
    case "test-fs":
      return promises.readFile("/test.txt", "utf-8")
    case "test-rej":
      throw new Error("test-rej")
    default:
      if (data.type === "build") {
        return handleBuild(data.entry)
      }
      throw new Error("Unknown command")
  }
}
