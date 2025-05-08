export type ExtractBackendFunc<T extends IIpc["client2Backend"]["type"]> = (
  arg: Extract<IIpc, { client2Backend: { type: T; }; }>["client2Backend"],
) =>
  | Promise<
    Omit<
      Extract<IIpc, { client2Backend: { type: T; }; }>["backend2Client"],
      "type"
    >
  >
  | Omit<
    Extract<IIpc, { client2Backend: { type: T; }; }>["backend2Client"],
    "type"
  >;

export interface PlaygroundSetup {
  name: string;
  files: PlaygroundBundlerFiles;
  buildOptions: IBuildOptions;

  dependencies?: Dependencies;
  devDependencies?: Dependencies;
  defaultTemplate?: PlaygroundTemplate;
}

export interface ClientOptions {
  /**
   * todo: Paths to external resources
   */
  externalResources?: string[];
  /**
   * Width of iframe.
   */
  width?: string;
  /**
   * Height of iframe.
   */
  height?: string;
}

export type PlaygroundBundlerFiles = Record<string, string>;

export type Dependencies = Record<string, string>;

export type PlaygroundTemplate = "react";

export type ClientStatus =
  | "initializing"
  | "installing-dependencies"
  | "transpiling"
  | "idle"
  | "done";

export interface IMessage {
  message: string;
  type: "success" | "warning" | "error" | "info";
}

export interface IBuildOptions {
  entry: string;
}

/**
 * 打包完成后由后端发往前端的模块列表
 */
export interface IModule {
  url: string;
  type: "js" | "css";
}

export type IIpc =
  | {
    client2Backend: {
      type: "build";
      options: IBuildOptions;
      files: PlaygroundBundlerFiles;
    };
    backend2Client: {
      type: "success";
      msg: "build-successful";
      modules: IModule[];
    };
  }
  | {
    client2Backend: {
      type: "init-esbuild";
    };
    backend2Client: {
      type: "success";
      msg: "init-esbuild-successful";
    };
  };


// 打包配置项
export interface IPlaygroundBundleOptions<TFILES extends Record<string, string>> {
  /**
   * 入口文件
   */
  entry: keyof TFILES;
  /**
   * 文件列表
   */
  files: TFILES;
  /**
   * package.json 文件
   */
  packageJson: keyof TFILES | {
    /**
     * 依赖
     */
    dependencies: Record<string, string>;
    /**
     * 开发依赖
     */
    devDependencies: Record<string, string>;
  };
}