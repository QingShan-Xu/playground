import { promises } from "@zenfs/core"
import { beforeEach, describe, expect, it } from "vitest"

import { Client } from "./client"
import type { ClientOptions, PlaygroundSetup } from "./type"

describe("Client", () => {
  let client: Client
  let iframe: HTMLIFrameElement
  let PlaygroundSetup: PlaygroundSetup
  let options: ClientOptions

  beforeEach(async () => {
    const div = document.createElement("div")
    document.body.appendChild(div)
    iframe = document.createElement("iframe")
    div.appendChild(iframe)

    PlaygroundSetup = {
      name: "test",
      files: {},
      entry: "/src",
    }

    options = {
      width: "500px",
      height: "500px",
    }

    client = new Client(iframe, PlaygroundSetup, options)
    await client.init()
  })

  it("should initialize iframe correctly", () => {
    expect(client.iframe).toBe(iframe)
    expect(client.iframe.style.border).toBe("0px")
    expect(client.iframe.getAttributeNames()).toContain("playground")
  })

  it('fs readFile should be back "test-fs-success"', async () => {
    const content = "test-fs-success"
    await promises.writeFile("/test.txt", content)
    const res = await client.ipc.postMessage("test-fs")
    expect(res).toBe(content)
  })
})
