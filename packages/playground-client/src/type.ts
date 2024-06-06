
export type PlaygroundSetup = {
  name: string
  files: PlaygroundBundlerFiles

  dependencies?: Dependencies
  devDependencies?: Dependencies
  template?: PlaygroundTemplate
  buildOptions: IBuildOptions
} | {
  name: string
  files?: PlaygroundBundlerFiles

  dependencies?: Dependencies
  devDependencies?: Dependencies
  template: PlaygroundTemplate
  buildOptions: IBuildOptions
}


export interface ClientOptions {
  // /**
  //  * Paths to external resources
  //  */
  // externalResources?: string[]
  // /**
  //  * Relative path that the iframe loads (eg: /about)
  //  */
  // startRoute?: string
  /**
   * Width of iframe.
   */
  width?: string
  /**
   * Height of iframe.
   */
  height?: string
}

export type PlaygroundBundlerFiles = Record<string, string>

export type Dependencies = Record<string, string>

export type PlaygroundTemplate = "react"

export type ClientStatus =
  | "initializing"
  | "installing-dependencies"
  | "transpiling"
  | "idle"
  | "done"

export interface IMessage {
  message: string
  type: "success" | "warn" | "error" | "normal"
}

export type IBuildOptions = {
  entry: string
}

/**
 * 打包完成后由后端发往前端的模块列表
 */
export type IModules = Array<{ url: string; type: "js" | "css" }>

export type IIpc =
  | {
    client2Backend: { type: "init-fs" },
    backend2Client: { type: "success", msg: "init-fs-successful" }
  }
  | {
    client2Backend: { type: "build", options?: IBuildOptions },
    backend2Client: {
      type: "success",
      msg: "init-build-successful",
      module: IModules
    }
  }
