export type PlaygroundSetup = {
  name: string
  files: PlaygroundBundlerFiles
  entry: string

  dependencies?: Dependencies
  devDependencies?: Dependencies
  template?: PlaygroundTemplate
} | {
  name: string
  files?: PlaygroundBundlerFiles
  entry?: string

  dependencies?: Dependencies
  devDependencies?: Dependencies
  template: PlaygroundTemplate
}


export interface ClientOptions {
  /**
   * Paths to external resources
   */
  externalResources?: string[]
  /**
   * Relative path that the iframe loads (eg: /about)
   */
  startRoute?: string
  /**
   * Width of iframe.
   */
  width?: string
  /**
   * Height of iframe.
   */
  height?: string
}

export interface PlaygroundBundlerFile {
  code: string
  hidden?: boolean
  active?: boolean
  readOnly?: boolean
}

export interface IIpc {
  ipcId: number
}

export type PlaygroundBundlerFiles = Record<string, PlaygroundBundlerFile>

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
