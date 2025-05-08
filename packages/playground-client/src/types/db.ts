export interface IDB {
  getValue<T>(keys: string[]): Promise<T>;
}
