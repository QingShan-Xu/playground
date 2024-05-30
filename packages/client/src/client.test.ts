import { beforeEach, describe, expect, it } from 'vitest'
import { Client } from "./client"
import { ClientOptions, SandboxSetup } from "./type"
import { promises } from "@zenfs/core"

describe('Client', () => {
  let client: Client
  let iframe: HTMLIFrameElement
  let sandboxSetup: SandboxSetup
  let options: ClientOptions

  beforeEach(async () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    iframe = document.createElement('iframe')
    div.appendChild(iframe)

    sandboxSetup = {
      name: "test",
      files: {},
      dependencies: {},
      devDependencies: {},
      entry: '',
    }

    options = {
      width: '500px',
      height: '500px',
    }

    client = new Client(iframe, sandboxSetup, options)
    await client.init()
  })

  it('should initialize iframe correctly', () => {
    expect(client.iframe).toBe(iframe)
    expect(client.iframe.style.border).toBe('0px')
    expect(client.iframe.getAttributeNames()).toContain('playground')
  })

  it('fs readFile should be back "test-fs-success"', async () => {
    const content = "test-fs-success"
    await promises.writeFile("/test.txt", content)
    const res = await client.Ipc.postMessage('test-fs')
    expect(res).toBe(content)
  })

})
