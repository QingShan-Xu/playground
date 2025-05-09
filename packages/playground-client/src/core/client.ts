

export class Client {
  private entry: string;
  private files: Record<string, string>;
  private devDependencies: Record<string, string>;
  private dependencies: Record<string, string>;

  constructor({ entry, files, devDependencies, dependencies }: {
    entry: string;
    files: Record<string, string>;
    devDependencies: Record<string, string>;
    dependencies: Record<string, string>;
  }) {
    this.entry = entry;
    this.files = files;
    this.devDependencies = devDependencies;
    this.dependencies = dependencies;
  }

}
