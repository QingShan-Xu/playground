import backend from "./backend?worker&inline"
import { nullthrows } from "./utils"
import { configure, Port } from "@zenfs/core"

export class Ipc {
  private static instance: Ipc
  private callBackFuncs: Map<number, { resolver: Function, reject: Function }> = new Map()
  private ipcId = 0
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
      port: this.worker as any
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

  destory() {
    this.worker.terminate()
  }

  postMessage(args: any) {
    this.ipcId++
    return new Promise((resolver, reject) => {
      this.callBackFuncs.set(this.ipcId, { resolver, reject })
      this.worker.postMessage({ args, ipcId: this.ipcId })
    })
  }
}