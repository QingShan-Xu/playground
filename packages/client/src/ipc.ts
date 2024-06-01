import { configure, Port } from "@zenfs/core"

import backend from "./backend?worker&inline"
import { nullthrows } from "./utils"

export class Ipc {
  private static instance: Ipc
  private callBackFuncs: Map<number, { resolver: (data: unknown) => void; reject: (data: unknown) => void }> = new Map();
  private ipcId = 0;
  private worker: Worker

  private constructor() {
    this.worker = new backend()
    this.worker.addEventListener("message", ({ data }) => {
      const { result, error, ipcId } = data
      const currentCallback = this.callBackFuncs.get(ipcId)
      if (!currentCallback) {
        return
      }
      error && currentCallback?.reject(error)
      result && currentCallback?.resolver(result)
      this.callBackFuncs.delete(ipcId)
    })
  }

  private async initFs(): Promise<"init-fs-success"> {
    if (Ipc.instance) return "init-fs-success"
    const res = await this.postMessage("init-fs")
    nullthrows(res === "init-fs-success", "init-fs-error")
    await configure({
      backend: Port,
      port: this.worker as unknown as any,
    })
    return "init-fs-success"
  }

  private async initEsbuild(): Promise<"init-esbuild-success"> {
    if (Ipc.instance) return "init-esbuild-success"
    const res = await this.postMessage("init-esbuild")
    nullthrows(res === "init-esbuild-success", "init-esbuild-error")
    return res as "init-esbuild-success"
  }

  public static async getInstance(): Promise<Ipc> {
    if (!Ipc.instance) {
      const ipc = new Ipc()
      await ipc.initFs()
      await ipc.initEsbuild()
      Ipc.instance = ipc
    }
    return Ipc.instance
  }

  destroy() {
    this.worker.terminate()
  }

  postMessage<T>(args: any, timeout = 10000): Promise<T> {
    this.ipcId++
    return new Promise((resolver, reject) => {
      const timer = setTimeout(() => {
        this.callBackFuncs.delete(this.ipcId)
        reject(new Error("Request timed out: " + JSON.stringify(args)))
      }, timeout)
      this.callBackFuncs.set(this.ipcId, {
        resolver: (result: T) => {
          clearTimeout(timer)
          resolver(result)
        },
        reject: (error: any) => {
          clearTimeout(timer)
          reject(error)
        },
      })
      this.worker.postMessage({ args, ipcId: this.ipcId })
    })
  }
}
