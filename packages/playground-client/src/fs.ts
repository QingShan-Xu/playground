import { IDBPDatabase, deleteDB, openDB } from "idb"
import pathBrowser from "path-browserify"
import { PlaygroundBundlerFiles, PlaygroundSetup } from "./type"
import { addPackageJSONIfNeeded, getTemplate, isWorkerContext, normalizePath } from "./utils"

export class Fs {
  private static instance: Fs
  private db!: IDBPDatabase

  private dbName: string = "__playground_db"
  private storeName: string = "__playground_store"
  private rootDirName!: string

  private constructor() {
  }

  private genPath(path: string) {
    return pathBrowser.join("/", this.rootDirName, path)
  }

  private async init() {
    const storeName = this.storeName
    const db = await openDB(this.dbName, undefined, {
      upgrade(db) {
        db.createObjectStore("/node_modules")
        db.createObjectStore(storeName)
      },
    })
    return db
  }

  static async getInstance(name: string) {
    if (!Fs.instance) {
      const fs = new Fs()
      fs.rootDirName = pathBrowser.join("/", name)
      fs.db = await fs.init()
      Fs.instance = fs
    }
    return Fs.instance
  }

  async destroy() {
    if (!this.db) {
      return
    }
    return this.clear()
  }
  async get(path: string) {
    if (!this.db) {
      return
    }
    return this.db.get(this.storeName, this.genPath(path))
  }
  async set(path: string, value: string) {
    if (!this.db) {
      return
    }
    return this.db.put(this.storeName, value, this.genPath(path))
  }
  async del(path: string) {
    if (!this.db) {
      return
    }
    return this.db.delete(this.storeName, this.genPath(path))
  }
  async clear() {
    if (!this.db) {
      return
    }
    return this.db.delete(this.storeName, IDBKeyRange.bound(`${this.rootDirName}/`, `${this.rootDirName}/\uffff`, false, false))
  }
  async paths() {
    if (!this.db) {
      return
    }

    const lower = `${this.rootDirName}/`
    const upper = `${this.rootDirName}/\uffff`
    const keys = await this.db.getAllKeys(this.storeName, IDBKeyRange.bound(lower, upper, false, false))

    return keys.map(key => String(key).replace(this.rootDirName, ""))
  }
  async getFiles() {
    if (!this.db) {
      return
    }

    const keys = await this.paths() as string[]

    let files: PlaygroundBundlerFiles = {}

    await Promise
      .all(keys
        .map(async key => {
          files[key] = await this.get(key)
        })
      )

    return files
  }
  async checkAndformatFiles(playgroundSetup: PlaygroundSetup) {
    const currentFiles = await this.getFiles()

    return addPackageJSONIfNeeded(
      { ...currentFiles, ...normalizePath(playgroundSetup.files) },
      playgroundSetup.name,
      playgroundSetup.buildOptions.entry,
      playgroundSetup.dependencies,
      playgroundSetup.devDependencies,
    )
  }
  async setFiles(files: PlaygroundBundlerFiles) {
    await Promise
      .all(
        Object
          .entries(files)
          .map(async ([filePath, code]) => {
            const isHas = await this.get(filePath)
            if (!isHas) {
              await this.set(filePath, code)
            }
          })
      )
  }
}