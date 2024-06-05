import { dequal as deepEqual } from "dequal"
import { Fs } from "./fs"
import { Ipc } from "./ipc"
import { Message } from "./message"
import { Preview } from "./preview"
import type {
  ClientOptions,
  IBuildOptions,
  PlaygroundSetup
} from "./type"
import {
  generateHtml,
  getTemplate
} from "./utils"

export class Client {
  playgroundSetup: PlaygroundSetup
  options: ClientOptions

  message = new Message();
  ipc!: Ipc
  fs: Fs
  preview: Preview

  constructor(
    iframeSelector: string | HTMLIFrameElement,
    PlaygroundSetup: PlaygroundSetup,
    options: ClientOptions = {},
  ) {
    this.options = options
    this.playgroundSetup = PlaygroundSetup

    this.fs = new Fs(this.playgroundSetup.name)
    this.preview = new Preview(iframeSelector, options)
  }

  public async init() {

    // init fs
    const template = this.getTemplate()
    if (template) {
      this.playgroundSetup.buildOptions.entry = template.entry
    }

    await this.fs.init()
    this.fs.checkAndformatFiles({
      ...this.playgroundSetup,
      files: {
        ...(template?.files ?? {}),
        ...this.playgroundSetup.files,
      }
    })
    this.message.set({ type: "success", message: "init-fs-successful" })

    // init preview
    this.preview.init()
    this.message.set({ type: "success", message: "init-preview-successful" })

    // init ipc
    this.ipc = await Ipc.getInstance()
    this.message.set({ type: "success", message: "init-ipc-successful" })

    this.message.set({ type: "success", message: "init-playground-success" })
    return true
  }

  getTemplate() {
    return getTemplate(this.playgroundSetup.template)
  }

  public async build(options: IBuildOptions = this.playgroundSetup.buildOptions) {
    this.message.set({ type: "normal", message: "building" })
    const startTimestamp = Date.now()
    const buildRes = await this.ipc.postMessage({
      type: "build",
      options
    })

    this.message.set({ type: "success", message: `build-success: ${Date.now() - startTimestamp}ms` })

    if (this.playgroundSetup.template === "react") {
      const htmlFile = await this.fs.get("/index.html")
      const html = generateHtml(htmlFile, buildRes.module)
      this.preview.setHtml(html)
    }
  }

  public async updateOptions(options: ClientOptions): Promise<boolean> {
    if (!deepEqual(this.options, options)) {
      this.options = options
      await this.updateSandbox()
    }
    return true
  }

  public async updateSandbox(
    playgroundSetup = this.playgroundSetup,
  ): Promise<boolean> {
    this.playgroundSetup = {
      ...this.playgroundSetup,
      ...playgroundSetup,
    }

    let files = this.playgroundSetup.files ?? {}

    if (playgroundSetup.template !== this.playgroundSetup.template) {
      this.fs.clear()
      const template = this.getTemplate()
      if (template) {
        this.playgroundSetup.name = template.entry
      }
      files = {
        ...(template?.files ?? {}),
        ...this.playgroundSetup.files,
      }
    }

    this.fs.checkAndformatFiles({
      ...this.playgroundSetup,
      files
    })


    await this.build()

    return true
  }
}
