import { fs } from "@zenfs/core"
import { dequal as deepEqual } from "dequal"
import path from "path-browserify"
import { Ipc } from "./ipc"
import { Message } from "./message"
import type {
  ClientOptions,
  PlaygroundBundlerFiles,
  PlaygroundSetup
} from "./type"
import {
  addPackageJSONIfNeeded,
  generateHtml,
  getTemplate,
  nullthrows
} from "./utils"
import { Fs } from "./fs"

export class Client {
  message = new Message();
  ipc!: Ipc
  fs: Fs

  playgroundSetup: PlaygroundSetup
  options: ClientOptions
  iframe!: HTMLIFrameElement
  iframeSelector: string | HTMLIFrameElement

  constructor(
    iframeSelector: string | HTMLIFrameElement,
    PlaygroundSetup: PlaygroundSetup,
    options: ClientOptions = {},
  ) {
    this.options = options
    this.playgroundSetup = PlaygroundSetup
    this.iframeSelector = iframeSelector
    this.fs = new Fs(this.playgroundSetup.name)
  }

  public async init() {

    // init fs
    await this.fs.init()
    this.message.set({ type: "normal", message: "init-fs-successful" })

    // init preview
    this.iframe = this.initializeIframe(this.iframeSelector)
    this.setLocationURLIntoIFrame()
    this.message.set({ type: "normal", message: "init-preview-successful" })

    // init ipc
    this.ipc = await Ipc.getInstance()

    const files = this.getFiles()
    this.setFile(files)
    this.setTemplate()
    this.message.set({ type: "success", message: "init-playground-success" })
    return true
  }



  public async build() {
    this.message.set({ type: "normal", message: "building" })
    const startTimestamp = Date.now()
    const modules = (await this.ipc.postMessage({
      type: "build",
      entry: this.playgroundSetup.entry,
    })) as any[]

    const htmlFile = this.fs.readFileSync("/index.html", "utf-8")
    const html = generateHtml(htmlFile, modules)
    const iframeDoc =
      this.iframe.contentDocument || this.iframe.contentWindow?.document
    if (iframeDoc) {
      iframeDoc.open()
      iframeDoc.write(html)
      iframeDoc.close()
    }
    this.message.set({ type: "success", message: `build-success: ${Date.now() - startTimestamp}ms` })
  }

  public setLocationURLIntoIFrame(): void {
    const urlSource = this.options.startRoute || ""
    this.iframe.contentWindow?.location.replace(urlSource)
    this.iframe.src = urlSource
  }

  /**
   * Initialize the iframe for the client
   * @param iframeSelector - The selector or element for the iframe
   * @returns The initialized iframe element
   */
  private initializeIframe(
    iframeSelector: string | HTMLIFrameElement,
  ): HTMLIFrameElement {
    this.message.set({ type: "normal", message: "init-preview" })
    let iframe: HTMLIFrameElement

    if (typeof iframeSelector === "string") {
      const element = document.querySelector(iframeSelector)
      nullthrows(element, `The element '${iframeSelector}' was not found`)

      iframe = document.createElement("iframe")

      nullthrows(
        element?.parentNode,
        "The given iframe does not have a parent.",
      )
      element?.parentNode!.replaceChild(iframe, element)
    } else {
      iframe = iframeSelector
    }

    iframe.style.border = "0"
    iframe.style.width = this.options.width || "100%"
    iframe.style.height = this.options.height || "100%"
    iframe.style.overflow = "hidden"

    if (!iframe.getAttribute("playground")) {
      iframe.setAttribute(
        "playground",
        "allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads allow-pointer-lock",
      )

      iframe.setAttribute(
        "allow",
        "accelerometer; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; clipboard-write;",
      )
    }

    this.message.set({ type: "success", message: "init-preview-success" })
    return iframe
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

    const files = this.getFiles()
    this.setFile(files)

    if (playgroundSetup.template !== this.playgroundSetup.template) {
      this.setTemplate()
    }

    await this.ipc.postMessage({
      type: "build",
      entry: this.playgroundSetup.entry,
    })

    return true
  }

  private getFiles(): PlaygroundBundlerFiles {
    const { playgroundSetup } = this

    if (playgroundSetup.files?.["/package.json"] === undefined) {
      return addPackageJSONIfNeeded(
        playgroundSetup.files ?? {},
        playgroundSetup.name,
        playgroundSetup.entry,
        playgroundSetup.dependencies,
        playgroundSetup.devDependencies,
      )
    }

    return this.playgroundSetup.files ?? {}
  }

  private setFile(files: PlaygroundBundlerFiles): void {
    Object.entries(files).forEach(([filePath, content]) => {
      const fullPath = path.join("/", filePath)
      const dir = path.dirname(fullPath)

      // 创建目录（如果不存在）
      if (!this.fs.existsSync(dir)) {
        this.fs.mkdirSync(dir, { recursive: true })
      }

      // 写入文件
      this.fs.writeFileSync(fullPath, content.code, "utf8")
    })
  }

  private setTemplate() {
    if (!this.playgroundSetup.template) {
      return
    }
    const {
      files = {},
      entry = ""
    } = getTemplate(this.playgroundSetup.template)!
    this.setFile(files)
    this.playgroundSetup.entry = entry
  }
}
