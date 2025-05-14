import type { BuildOptions } from "esbuild-wasm";
import esbuild from "esbuild-wasm";
import { extname } from "path-browserify";

import type { IEsbuildClient, IEsbuildBuildOptions } from "../types/esbuild-client";

export class EsbuildClient implements IEsbuildClient {
  private defaultEsBuildOptions: BuildOptions = {
    bundle: true,
    splitting: true,
    format: "esm",
    sourcemap: false,
    legalComments: "eof",
    platform: "neutral",
    target: "chrome58,firefox57,safari11,edge16",
    minify: false,
    treeShaking: true,
    jsx: "transform",
    define: {
      "process.env.NODE_ENV": "'development'",
    },
    logLevel: "info",
    metafile: false,
    outdir: "/",
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".css", ".json"],
    mainFields: ["browser", "module", "main"],
    write: false,
    plugins: [],
  };

  bundleList: Array<{ url: string; type: "js" | "css"; }> = [];

  /**
   * 清除 bundleList
   */
  private clearBundleList() {
    this.bundleList.forEach(item => URL.revokeObjectURL(item.url));
    this.bundleList = [];
  }

  /**
   * 初始化 esbuild
   */
  async init(wasmURL: string) {
    await esbuild.initialize({ wasmURL, worker: false });
  }

  /**
   * 打包
   */
  async build(buildOptions: IEsbuildBuildOptions) {
    const mainRes = await esbuild.build({
      ...this.defaultEsBuildOptions,
      ...buildOptions,
    });

    this.clearBundleList();

    mainRes.outputFiles?.forEach(item => {
      const ext = extname(item.path);

      if (ext === ".js") {
        const blob = new Blob([item.text], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);
        this.bundleList.push({ url, type: "js" });
      }

      if (ext === ".css") {
        const blob = new Blob([item.text], { type: "text/css" });
        const url = URL.createObjectURL(blob);
        this.bundleList.push({ url, type: "css" });
      }
    });
  }
}