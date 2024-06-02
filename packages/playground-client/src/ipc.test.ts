import { beforeEach, describe, expect, test } from "vitest"

import { Ipc } from "./ipc"

describe("Ipc", () => {
  let ipc: Ipc

  beforeEach(async () => {
    ipc = await Ipc.getInstance()
  })

  test("postMessage should return a promise", () => {
    const args = "test-res"
    const promise = ipc.postMessage(args)
    expect(promise).toBeInstanceOf(Promise)
  })

  test('worker should receive "test-res" and back "test-res"', async () => {
    const args = "test-res"
    const res = await ipc.postMessage(args)
    expect(res).toEqual(args)
  })

  test('worker should receive "test-rej" and back Error: "test-rej"', async () => {
    const args = "test-rej"
    try {
      await ipc.postMessage(args)
    } catch (error) {
      expect(error).toEqual(new Error(args))
    }
  })
})
