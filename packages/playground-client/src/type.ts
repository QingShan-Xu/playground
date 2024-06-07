
export type PlaygroundSetup = {
  name: string
  files: PlaygroundBundlerFiles
  buildOptions: IBuildOptions

  dependencies?: Dependencies
  devDependencies?: Dependencies
  defaultTemplate?: PlaygroundTemplate
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
    client2Backend: {
      type: "build",
      options: IBuildOptions,
      files: PlaygroundBundlerFiles
    },
    backend2Client: {
      type: "success",
      msg: "init-build-successful",
      module: IModules
    }
  }
  | {
    client2Backend: {
      type: "init-esbuild",
    },
    backend2Client: {
      type: "success",
      msg: "init-esbuild-successful",
    }
  }
