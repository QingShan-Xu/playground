import localforage from "localforage";

import type { IDB } from "../types/db";

import { PlaygroundError } from "./error";


const E_DRIVER = {
  INDEXDB: localforage.INDEXEDDB
} as const;

type IDriver = keyof typeof E_DRIVER;
interface IOptions extends LocalForageOptions {
  driver: IDriver;
}


export class DB implements IDB {
  instance: LocalForage;
  driver: typeof E_DRIVER[IDriver];

  constructor(options: IOptions) {
    this.driver = E_DRIVER[options.driver];
    this.instance = localforage.createInstance({ ...options, driver: this.driver });
  }

  checkDriverSupport() {
    if (!localforage.supports(this.driver)) {
      throw new PlaygroundError(`Driver ${this.driver} is not supported`, "DATABASE_DRIVER_ERROR");
    }
  }

  /**
   * 获取值
   * @param keys 键
   * @returns 值
   */
  async getValue<T>(keys: string[]): Promise<T | null> {
    let tempValue: unknown | null = null;

    for (let idx = 0; idx < keys.length; idx++) {
      const fieldKey = keys[idx];
      if (idx === 0) {
        tempValue = await this.instance.getItem<T>(fieldKey);
        continue;
      }

      if (!tempValue) {
        return null;
      }

      if (Object.hasOwn(tempValue, fieldKey)) {
        tempValue = tempValue?.[fieldKey as keyof typeof tempValue];
      }
    }

    return tempValue as T | null;
  }

  /**
   * 设置值
   * @param keys 键
   * @param value 值
   */
  async setValue<T>(keys: string[], value: T): Promise<void> {
    return;
  }
}