import type { OutputFile } from "esbuild-wasm"
import { createStore, get, set } from "idb-keyval"
import { invariant } from "outvariant"
import pathBrowser, { extname } from "path-browserify"

import { ReactTemplate, ReactTemplateEntry } from "./common/template"
import type { Dependencies, PlaygroundBundlerFiles, PlaygroundTemplate } from "./type"

const DEPENDENCY_ERROR_MESSAGE = `"dependencies" was not specified - provide either a package.json or a "dependencies" value`
const ENTRY_ERROR_MESSAGE = `"entry" was not specified - provide either a package.json with the "main" field or an "entry" value`

export const bundleList: Array<{ url: string; type: "js" | "css" }> = []

const customStore = createStore("node_modules", "playground_store")

export const createError = (message: string): string =>
  `[playground-client]: ${message}`

export function nullthrows<T>(
  value: T | null | undefined,
  err = "Value is nullish",
) {
  invariant(value != null, createError(err))
  return value
}

export function addPackageJSONIfNeeded(
  files: PlaygroundBundlerFiles,
  name: string,
  entry?: string,
  dependencies?: Dependencies,
  devDependencies?: Dependencies,
): PlaygroundBundlerFiles {
  const normalizedFilesPath = normalizePath(files)

  const packageJsonFile = normalizedFilesPath["/package.json"]

  if (!packageJsonFile) {
    normalizedFilesPath["/package.json"] = {
      code: createPackageJSON(name, entry, dependencies, devDependencies),
    }

    return normalizedFilesPath
  }

  if (packageJsonFile) {
    const packageJsonContent = JSON.parse(packageJsonFile.code)

    nullthrows(
      !(!dependencies && !packageJsonContent.dependencies),
      ENTRY_ERROR_MESSAGE,
    )

    if (dependencies) {
      packageJsonContent.dependencies = {
        ...(packageJsonContent.dependencies ?? {}),
        ...(dependencies ?? {}),
      }
    }

    if (devDependencies) {
      packageJsonContent.devDependencies = {
        ...(packageJsonContent.devDependencies ?? {}),
      }
    }

    if (entry) {
      packageJsonContent.main = entry
    }

    normalizedFilesPath["/package.json"] = {
      code: JSON.stringify(packageJsonContent, null, 2),
    }
  }

  return normalizedFilesPath
}

export function createPackageJSON(
  name: string,
  entry = "/index.js",
  dependencies: Dependencies = {},
  devDependencies: Dependencies = {},
): string {
  return JSON.stringify(
    {
      name,
      main: entry,
      dependencies,
      devDependencies,
    },
    null,
    2,
  )
}

export const normalizePath = <R>(path: R): R => {
  if (typeof path === "string") {
    return pathBrowser.normalize(path) as R
  }

  if (Array.isArray(path)) {
    return path.map(pathBrowser.normalize) as R
  }

  if (typeof path === "object" && path !== null) {
    return Object.entries(path as any).reduce<any>(
      (all, [key, content]: [string, string | any]) => {
        const fileName = pathBrowser.normalize(key)
        all[fileName] = content
        return all
      },
      {},
    )
  }

  return null as R
}

export function getTemplate(
  type?: PlaygroundTemplate,
): { files: PlaygroundBundlerFiles, entry: string } | undefined {
  if (type === "react") {
    return {
      files: ReactTemplate,
      entry: ReactTemplateEntry
    }
  }
  return undefined
}

export async function getPkgFromUnpkg(uri: string) {
  let contents = await get(uri, customStore)
  if (!contents) {
    const res = await (
      await fetch(new URL(uri, "https://www.unpkg.com/"))
    ).text()
    res && set(uri, res, customStore)
    contents = res
  }
  return contents
}

export const generateUrl = (item: OutputFile) => {
  const ext = extname(item.path)

  if (ext == ".js") {
    const blob = new Blob([item.text], { type: "application/javascript" })
    const url = URL.createObjectURL(blob)
    bundleList.push({
      url,
      type: "js",
    })
  }

  if (ext == ".css") {
    const blob = new Blob([item.text], { type: "text/css" })
    const url = URL.createObjectURL(blob)
    bundleList.push({
      url,
      type: "css",
    })
  }
}

export const generateHtml = (
  html: string,
  modules: Array<{
    url: string
    type: "js" | "css"
  }>,
): string => {
  const parse = new DOMParser()
  const dom = parse.parseFromString(html, "text/html")
  modules.forEach((module) => {
    if (module.type == "js") {
      const script = dom.createElement("script")
      script.type = "module"
      script.src = module.url
      dom.body.appendChild(script)
      return
    }

    if (module.type == "css") {
      const link = dom.createElement("link")
      link.rel = "stylesheet"
      link.type = "text/css"
      link.href = module.url
      dom.head.appendChild(link)
      return
    }
  })
  return dom.documentElement.outerHTML
}

export const isDev = "development"
