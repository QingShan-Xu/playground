import { beforeEach, describe, expect, test } from "vitest"
import { Ipc } from "./ipc"

describe("Ipc And Backend", () => {
  let ipc: Ipc

  beforeEach(async () => {
    ipc = await Ipc.getInstance()
  })

  test('worker should receive "init-esbuild" twice and back { msg: "init-esbuild-successful" }', async () => {
    const res1 = await ipc.postMessage({ type: "init-esbuild" })
    expect(res1.msg).toEqual("init-esbuild-successful")
    const res2 = await ipc.postMessage({ type: "init-esbuild" })
    expect(res2.msg).toEqual("init-esbuild-successful")
  })

  test('worker should receive "build" twice and back { msg: "build-successful" }', async () => {
    const res = await ipc.postMessage({
      type: "build",
      files: { "index.ts": "const a = '1111'" },
      options: {
        entry: "index.ts"
      }
    })
    expect(res.msg).toEqual("build-successful")
  })

})
