import type { Loader, LogLevel } from "esbuild-wasm";

export interface IEsbuildBuildOptions {
  /**
   * 压缩
   * @default false
   */
  minify?: boolean;
  /**
   * 摇树
   * @default true
   */
  treeShaking?: boolean;
  /**
   * ts配置文件
   */
  tsconfigRaw?: string;
  /**
   * 常量 替换 全局标识符
   * @default {"process.env.NODE_ENV":"'development'"}
   */
  define?: Record<string, string>;
  /**
   * 日志级别
   * @default "info"
   */
  logLevel?: LogLevel;
  /**
   * 外部依赖
   */
  external?: string[];
  /**
   * 别名
   */
  alias?: Record<string, string>;
  /**
   * 加载器
   */
  loader?: Record<string, Loader>;
  /**
   * 解析扩展名
   * @default [".tsx",".ts",".jsx",".js",".css",".json"]
   */
  resolveExtensions?: string[];
  /**
   * 注入
   */
  inject?: string[];
  /**
   * 头部注入
   */
  banner?: Record<string, string>;
  /**
   * 尾部注入
   */
  footer?: Record<string, string>;
}


export interface IEsbuildClient {
  build: (buildOptions: IEsbuildBuildOptions) => Promise<void>;
  init: (wasmURL: string) => Promise<void>;
}
