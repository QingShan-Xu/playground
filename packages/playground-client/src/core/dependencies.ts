import type { IDB } from "../types/db";

import { PlaygroundError } from "./error";

interface IDependencyStrategy {
  /**
   * 下载依赖
   */
  download(name: string, version: string): Promise<Record<string, string>>;
}

/**
 * 依赖
 */
export class Dependency {
  constructor(
    public name: string,
    public version: string,
    public defaultFiles?: Record<string, string>
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

/**
 * 依赖管理
 */
export class Dependencies {
  private static instance: Dependencies;
  private dependencies: Dependency[] = [];

  private constructor(
    /**
     * 默认依赖
     */
    defaultDependencies: Array<{ name: string, version: string, defaultFiles?: Record<string, string>; }>,
    /**
     * 依赖策略
     */
    private strategy: IDependencyStrategy[],
    /**
     * 存储DB
     */
    private db: IDB,
  ) {
    defaultDependencies.forEach(({ name, version, defaultFiles }) => {
      this.addDependency(name, version, defaultFiles);
    });
  }

  static getInstance(
    /**
    * 默认依赖
    */
    defaultDependencies: Array<{ name: string, version: string, defaultFiles?: Record<string, string>; }>,
    /**
     * 依赖策略
     */
    strategy: IDependencyStrategy[],
    /**
     * 存储DB
     */
    db: IDB,
  ) {
    if (!this.instance) {
      this.instance = new Dependencies(defaultDependencies, strategy, db);
    }
    return this.instance;
  }

  /**
   * 获取依赖
   */
  async getDependency(name: string, version: string): Promise<Record<string, string> | undefined> {
    const dependency = this.dependencies.find(item => item.name === name && item.version === version);

    if (!dependency) {
      return undefined;
    }

    let cacheValue = await this.db.getValue<Record<string, string>>([name, version]);
    if (cacheValue) {
      return cacheValue;
    }

    cacheValue = await dependency.download(this.strategy);
    if (cacheValue) {
      await this.db.setValue([name, version], cacheValue);
    }

    return cacheValue;
  }

  /**
   * 添加依赖
   * @param name 依赖名称
   * @param version 依赖版本
   * @param defaultFiles 默认文件
   */
  async addDependency(name: string, version: string, defaultFiles?: Record<string, string>) {
    this.dependencies.push(new Dependency(name, version, defaultFiles));
    return;
  }

  /**
   * 初始化依赖
   */
  async init() {
    return Promise.all(this.dependencies.map(item => item.download(this.strategy)));
  }
}