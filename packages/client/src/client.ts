import { Ipc } from "./ipc"
import { ClientOptions, ClientStatus, SandboxSetup, SandpackError } from "./type"
import { nullthrows } from "./utils"

export class Client {
  errors: SandpackError[]

  selector: string
  element: Element

  Ipc: Ipc = Ipc.getInstance()

  /**
   * Sandbox configuration: files, setup, customizations;
   */
  sandboxSetup: SandboxSetup
  options: ClientOptions

  /**
   * DOM bindings
   */
  iframe: HTMLIFrameElement
  iframeSelector: string | HTMLIFrameElement
  status: ClientStatus = "idle";

  constructor(
    selector: string | HTMLIFrameElement,
    sandboxSetup: SandboxSetup,
    options: ClientOptions = {}
  ) {
    this.options = options
    this.sandboxSetup = sandboxSetup
    this.iframeSelector = selector

    this.errors = []
    this.status = "initializing"

    if (typeof selector === "string") {
      this.selector = selector
      const element = document.querySelector(selector)

      nullthrows(element, `The element '${selector}' was not found`)

      this.element = element!
      this.iframe = document.createElement("iframe")
      this.iframe.style.border = "0"
      this.iframe.style.width = this.options.width || "100%"
      this.iframe.style.height = this.options.height || "100%"
      this.iframe.style.overflow = "hidden"
      nullthrows(
        this.element.parentNode,
        "The given iframe does not have a parent."
      )
      this.element.parentNode!.replaceChild(this.iframe, this.element)
    } else {
      this.element = selector
      this.iframe = selector
    }

    if (!this.iframe.getAttribute("playground")) {
      this.iframe.setAttribute(
        "playground",
        "allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads allow-pointer-lock"
      )

      this.iframe.setAttribute(
        "allow",
        "accelerometer; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; clipboard-write;"
      )
    }

    this.setLocationURLIntoIFrame()
  }

  public setLocationURLIntoIFrame(): void {
    const urlSource = this.options.startRoute || ""
    this.iframe.contentWindow?.location.replace(urlSource)
  }

  // destroy(): void {
  //   this.unsubscribeChannelListener()
  //   this.unsubscribeGlobalListener()
  //   this.iframeProtocol.cleanup()
  // }

  // updateOptions(options: ClientOptions): void {
  //   if (!deepEqual(this.options, options)) {
  //     this.options = options
  //     this.updateSandbox()
  //   }
  // }

  // updateSandbox(
  //   sandboxSetup = this.sandboxSetup,
  //   isInitializationCompile?: boolean
  // ): void {
  //   this.sandboxSetup = {
  //     ...this.sandboxSetup,
  //     ...sandboxSetup,
  //   }

  //   const files = this.getFiles()

  //   const modules: Modules = Object.keys(files).reduce(
  //     (prev, next) => ({
  //       ...prev,
  //       [next]: {
  //         code: files[next].code,
  //         path: next,
  //       },
  //     }),
  //     {}
  //   )

  //   let packageJSON = JSON.parse(
  //     createPackageJSON(
  //       this.sandboxSetup.dependencies,
  //       this.sandboxSetup.devDependencies,
  //       this.sandboxSetup.entry
  //     )
  //   )
  //   try {
  //     packageJSON = JSON.parse(files["/package.json"].code)
  //   } catch (e) {
  //     console.error(
  //       createError(
  //         "could not parse package.json file: " + (e as Error).message
  //       )
  //     )
  //   }

  //   // TODO move this to a common format
  //   const normalizedModules = Object.keys(files).reduce(
  //     (prev, next) => ({
  //       ...prev,
  //       [next]: {
  //         content: files[next].code,
  //         path: next,
  //       },
  //     }),
  //     {}
  //   )

  //   this.dispatch({
  //     ...this.options,
  //     type: "compile",
  //     codesandbox: true,
  //     version: 3,
  //     isInitializationCompile,
  //     modules,
  //     reactDevTools: this.options.reactDevTools,
  //     externalResources: this.options.externalResources || [],
  //     hasFileResolver: Boolean(this.options.fileResolver),
  //     disableDependencyPreprocessing:
  //       this.sandboxSetup.disableDependencyPreprocessing,
  //     template:
  //       this.sandboxSetup.template ||
  //       getTemplate(packageJSON, normalizedModules),
  //     showOpenInCodeSandbox: this.options.showOpenInCodeSandbox ?? true,
  //     showErrorScreen: this.options.showErrorScreen ?? true,
  //     showLoadingScreen: this.options.showLoadingScreen ?? false,
  //     skipEval: this.options.skipEval || false,
  //     clearConsoleDisabled: !this.options.clearConsoleOnFirstCompile,
  //     logLevel: this.options.logLevel ?? SandpackLogLevel.Info,
  //     customNpmRegistries: this.options.customNpmRegistries,
  //     teamId: this.options.teamId,
  //     sandboxId: this.options.sandboxId,
  //   })
  // }

  // public dispatch(message: SandpackRuntimeMessage): void {
  //   /**
  //    * Intercept "refresh" dispatch: this will make sure
  //    * that the iframe is still in the location it's supposed to be.
  //    * External links inside the iframe will change the location and
  //    * prevent the user from navigating back.
  //    */
  //   if (message.type === "refresh") {
  //     this.setLocationURLIntoIFrame()
  //   }

  //   this.iframeProtocol.dispatch(message)
  // }

  // public listen(listener: ListenerFunction): UnsubscribeFunction {
  //   return this.iframeProtocol.channelListen(listener)
  // }

  // /**
  //  * Get the URL of the contents of the current sandbox
  //  */
  // public getCodeSandboxURL(): Promise<{
  //   sandboxId: string
  //   editorUrl: string
  //   embedUrl: string
  // }> {
  //   const files = this.getFiles()

  //   const paramFiles = Object.keys(files).reduce(
  //     (prev, next) => ({
  //       ...prev,
  //       [next.replace("/", "")]: {
  //         content: files[next].code,
  //         isBinary: false,
  //       },
  //     }),
  //     {}
  //   )

  //   return fetch("https://codesandbox.io/api/v1/sandboxes/define?json=1", {
  //     method: "POST",
  //     body: JSON.stringify({ files: paramFiles }),
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //   })
  //     .then((x) => x.json())
  //     .then((res: { sandbox_id: string }) => ({
  //       sandboxId: res.sandbox_id,
  //       editorUrl: `https://codesandbox.io/s/${res.sandbox_id}`,
  //       embedUrl: `https://codesandbox.io/embed/${res.sandbox_id}`,
  //     }))
  // }

  // public getTranspilerContext = (): Promise<
  //   Record<string, Record<string, unknown>>
  // > =>
  //   new Promise((resolve) => {
  //     const unsubscribe = this.listen((message) => {
  //       if (message.type === "transpiler-context") {
  //         resolve(message.data)

  //         unsubscribe()
  //       }
  //     })

  //     this.dispatch({ type: "get-transpiler-context" })
  //   });

  // private getFiles(): SandpackBundlerFiles {
  //   const { sandboxSetup } = this

  //   if (sandboxSetup.files["/package.json"] === undefined) {
  //     return addPackageJSONIfNeeded(
  //       sandboxSetup.files,
  //       sandboxSetup.dependencies,
  //       sandboxSetup.devDependencies,
  //       sandboxSetup.entry
  //     )
  //   }

  //   return this.sandboxSetup.files
  // }
}
