import { nullthrows } from "./utils"
import backend from "./backend?worker&inline"

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
      nullthrows(currentCallback)
      error && currentCallback?.reject(error)
      result && currentCallback?.resolver(result)
      this.callBackFuncs.delete(ipcId)
    })
  }

  postMessage(args: any) {
    this.ipcId = this.ipcId++
    this.worker.postMessage({ args, ipcId: this.ipcId })
    return new Promise((resolver, reject) => {
      this.callBackFuncs.set(this.ipcId, { resolver, reject })
    })
  }

  public static getInstance(): Ipc {
    if (!Ipc.instance) {
      Ipc.instance = new Ipc()
    }
    return Ipc.instance
  }
}