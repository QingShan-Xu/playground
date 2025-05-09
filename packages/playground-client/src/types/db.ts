export interface IDB {
  getValue<T>(keys: string[]): Promise<T | null>;
  setValue<T>(keys: string[], value: T): Promise<void>;
}
