import { Ipc } from "./ipc"
import { expect, test, describe, beforeEach } from 'vitest'
import '@vitest/web-worker'

describe('Ipc', () => {
  let ipc: Ipc

  beforeEach(() => {
    ipc = Ipc.getInstance()
  })

  test('postMessage should return a promise', () => {
    const args = "test-res"
    const promise = ipc.postMessage(args)
    expect(promise).toBeInstanceOf(Promise)
  })

  test('worker should receive message and call resolver', () => {
    const args = "test-res"
    ipc.postMessage(args).then((result) => {
      expect(result).toEqual(args)
    })
  })

  test('worker should receive error and call reject', () => {
    const args = "test-rej"
    ipc.postMessage(args).catch((error) => {
      expect(error).toEqual(args)
    })
  })
})