import type { IIpc } from "../types";
import { nullthrows } from "../utils";

import backend from "./backend?worker&inline";

/**
 * 用于在主进程和子进程之间通信
 */
export class Ipc {
  private static instance: Ipc;
  /**
   * 用于存储回调函数，以实现web-worker异步化
   */
  private callBackFuncs: Map<
    number,
    {
      resolver: (data: unknown) => void;
      reject: (data: unknown) => void;
    }
  > = new Map();
  /**
   * 用于生成唯一的ipcId
   */
  private ipcId = 0;

  private constructor(private worker: Worker) {
    this.worker.addEventListener("message", ({ data }) => {
      const { result, error, ipcId } = data;
      const currentCallback = this.callBackFuncs.get(ipcId);
      if (!currentCallback) {
        return;
      }
      error && currentCallback?.reject(error);
      result && currentCallback?.resolver(result);
      this.callBackFuncs.delete(ipcId);
    });
  }

  private async initEsbuild() {
    if (Ipc.instance) return;
    const res = await this.postMessage({ type: "init-esbuild" });
    nullthrows(res.msg === "init-esbuild-successful", "init-esbuild-error");
  }

  public static async getInstance(worker: Worker): Promise<Ipc> {
    if (!Ipc.instance) {
      const ipc = new Ipc(worker);
      await ipc.initEsbuild();
      Ipc.instance = ipc;
    }
    return Ipc.instance;
  }

  postMessage<
    A extends IIpc["client2Backend"],
    T extends A["type"],
    R extends Extract<IIpc, { client2Backend: { type: T } }>["backend2Client"],
  >(args: A, timeout = 20000): Promise<R> {
    this.ipcId++;
    return new Promise((resolver, reject) => {
      // 超时
      const timer = setTimeout(() => {
        this.callBackFuncs.delete(this.ipcId);
        reject(new Error("Request timed out: " + JSON.stringify(timeout)));
      }, timeout);

      this.callBackFuncs.set(this.ipcId, {
        resolver: (result: unknown) => {
          clearTimeout(timer);
          resolver(result as R);
        },
        reject: (error: unknown) => {
          clearTimeout(timer);
          reject(error);
        },
      });

      this.worker.postMessage({ args, ipcId: this.ipcId });
    });
  }
}
