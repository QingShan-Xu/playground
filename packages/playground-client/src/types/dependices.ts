
export interface IDependencies {
  /**
   * 获取所有依赖
   */
  getDependencies(): Promise<IDependency[]>;
  /**
   * 获取指定依赖
   */
  getDependency(name: string): Promise<IDependency>;
  /**
   * 添加依赖
   */
  addDependency(name: string, version: string): Promise<void>;
  /**
   * 删除依赖
   */
  removeDependency(name: string): Promise<void>;

}

export interface IDependency {
  name: string;
  version: string;
  files: Record<string, string>;

  download(): Promise<void>;
};


