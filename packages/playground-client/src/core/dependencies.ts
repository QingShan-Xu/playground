import type { IDB } from "../types/db";

import { PlaygroundError } from "./error";

interface IDependencyStrategy {
  /**
   * 下载依赖
   */
  download(name: string, version: string): Promise<Record<string, string>>;
}

export class Dependency {
  constructor(
    public name: string,
    public version: string,
    public defaultFiles: Record<string, string>
  ) { }

  async download(strategies: IDependencyStrategy[]): Promise<Record<string, string>> {
    if (this.defaultFiles) {
      return this.defaultFiles;
    }

    for (let idx = 0; idx < strategies.length; idx++) {
      try {
        const files = await strategies[idx].download(this.name, this.version);
        return files;
      } catch (error) {
        if (idx === strategies.length - 1) {
          throw new PlaygroundError(`dependency ${this.name}:${this.version} download failed`, "DEPENDENCY_DOWNLOAD_ERROR");
        }
        continue;
      }
    }

    return {};
  }
}


interface IDependenciesOptions {
  /**
   * 默认依赖
   */
  defaultDependencies: Record<string, string>,
  /**
   * 依赖策略
   */
  defaultStrategy: IDependencyStrategy[],
  /**
   * 存储DB
   */
  db: IDB,
};

/**
 * 依赖
 */
export class Dependencies {
  private static instance: Dependencies;
  private dependencies: Dependency[] = [];
  private strategy: IDependencyStrategy[];
  private db: IDB;

  private constructor(
    options: IDependenciesOptions
  ) {
    this.strategy = options.defaultStrategy;
    this.db = options.db;
  }

  static getInstance(options: IDependenciesOptions) {
    if (!this.instance) {
      this.instance = new Dependencies(options);
    }
    return this.instance;
  }

  async getDependencies() {
    return;
  }

  async getDependency(name: string) {
    return;
  }

  async addDependency(name: string, version: string) {
    return;
  }

  async removeDependency(name: string) {
    return;
  }

  /**
   * 初始化依赖
   */
  async init() {
    return Promise.all(this.dependencies.map(item => item.download(this.strategy)));
  }
}
