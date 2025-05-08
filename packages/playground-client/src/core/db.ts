import localforage from "localforage";

import { PlaygroundError } from "./error";

const E_DRIVER = {
  INDEXDB: localforage.INDEXEDDB
} as const;

type IDriver = keyof typeof E_DRIVER;
interface IOptions extends LocalForageOptions {
  driver: IDriver;
}


export class DB {
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
}