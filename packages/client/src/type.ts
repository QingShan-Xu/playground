export interface SandboxSetup {
  name: string;
  files: SandpackBundlerFiles;
  entry: string;

  dependencies?: Dependencies;
  devDependencies?: Dependencies;
  /**
   * What template we use, if not defined we infer the template from the dependencies or files.
   *
   */
  template?: SandpackTemplate;
}

export interface ClientOptions {
  /**
   * Paths to external resources
   */
  externalResources?: string[];
  /**
   * Relative path that the iframe loads (eg: /about)
   */
  startRoute?: string;
  /**
   * Width of iframe.
   */
  width?: string;
  /**
   * Height of iframe.
   */
  height?: string;
}

export interface SandpackBundlerFile {
  code: string;
  hidden?: boolean;
  active?: boolean;
  readOnly?: boolean;
}

export interface IIpc {
  ipcId: number;
}

export type SandpackBundlerFiles = Record<string, SandpackBundlerFile>;

export type Dependencies = Record<string, string>;

export type SandpackTemplate = "react";

export type ClientStatus =
  | "initializing"
  | "installing-dependencies"
  | "transpiling"
  | "idle"
  | "done";

export interface SandpackError {
  message: string;
  line?: number;
  column?: number;
  path?: string;
  title?: string;
}

export interface IMessage {
  message: string;
  type: "success" | "warn" | "error" | "normal";
}
