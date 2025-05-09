import esbuild from "esbuild-wasm";
import type { BuildOptions } from "esbuild-wasm";

import type { IEsbuildWorker, IEsbuildWorkerBuildOptions } from "../../types/esbuild-client";
import type { IIpcMsg2Main, IIpcMsg2Worker } from "../../types/ipc";


class EsbuildWorker implements IEsbuildWorker {
  esBuildOptions: BuildOptions;

  constructor(buildOptions: IEsbuildWorkerBuildOptions) {
    this.esBuildOptions = {
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
      ...buildOptions
    };
  }

  /**
   * 初始化 esbuild
   */
  async initEsbuild(params: Extract<IIpcMsg2Worker, { type: "init-esbuild"; }>): Promise<Extract<IIpcMsg2Main, { type: "init-esbuild-suc"; } | { type: "init-esbuild-err"; }>> {
    try {
      await esbuild.initialize({
        wasmURL: params.data.wasmURL,
        worker: false,
      });
      return {
        type: "init-esbuild-suc",
        data: undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "unknown error";
      return {
        type: "init-esbuild-err",
        data: {
          error: errorMessage,
        },
      };
    }
  }

  /**
   * 打包
   */
  async bundle(params: Extract<IIpcMsg2Worker, { type: "build"; }>): Promise<Extract<IIpcMsg2Main, { type: "build-suc"; } | { type: "build-err"; }>> {
    return;
  }
}


