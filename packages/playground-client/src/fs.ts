import { IDBPDatabase, openDB } from "idb"
import pathBrowser from "path-browserify"
import { PlaygroundBundlerFiles, PlaygroundSetup } from "./type"
import { addPackageJSONIfNeeded, normalizePath } from "./utils"

export class Fs {
  private static instance: Fs
  private db!: IDBPDatabase

  private dbName: string = "__playground_db"
  private storeName: string = "__playground_store"
  private constructor() {
  }

  private genPath(rootDirName: string, path?: string,) {
    return pathBrowser.join("/", rootDirName, path ?? "")
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

  static async getInstance() {
    if (!Fs.instance) {
      const fs = new Fs()
      fs.db = await fs.init()
      Fs.instance = fs
    }
    return Fs.instance
  }

  async get(name: string, path: string,) {
    if (!this.db) {
      return
    }
    return this.db.get(this.storeName, this.genPath(name, path))
  }
  async set(name: string, path: string, value: string) {
    if (!this.db) {
      return
    }
    return this.db.put(this.storeName, value, this.genPath(name, path))
  }
  async del(name: string, path: string) {
    if (!this.db) {
      return
    }
    return this.db.delete(this.storeName, this.genPath(name, path))
  }
  async clear(name: string) {
    if (!this.db) {
      return
    }
    const currentName = normalizePath(name)
    return this.db.delete(this.storeName, IDBKeyRange.bound(`${currentName}/`, `${currentName}/\uffff`, false, false))
  }
  async paths(name: string) {
    if (!this.db) {
      return
    }

    const currentName = normalizePath(name)
    const keys = await this.db.getAllKeys(this.storeName, IDBKeyRange.bound(`${currentName}/`, `${currentName}/\uffff`, false, false))
    return keys.map(key => String(key).replace(`${currentName}`, ""))
  }
  async getFiles(name: string) {
    if (!this.db) {
      return
    }

    const keys = await this.paths(name) as string[]

    let files: PlaygroundBundlerFiles = {}

    await Promise
      .all(keys
        .map(async key => {
          files[key] = await this.get(name, key)
        })
      )

    return files
  }
  async checkAndformatFiles(playgroundSetup: PlaygroundSetup) {
    const currentFiles = await this.getFiles(playgroundSetup.buildOptions.entry)

    return addPackageJSONIfNeeded(
      { ...currentFiles, ...normalizePath(playgroundSetup.files) },
      playgroundSetup.name,
      playgroundSetup.buildOptions.entry,
      playgroundSetup.dependencies,
      playgroundSetup.devDependencies,
    )
  }
  async setFiles(name: string, files: PlaygroundBundlerFiles) {
    await Promise
      .all(
        Object
          .entries(files)
          .map(async ([filePath, code]) => {
            const isHas = await this.get(name, filePath)
            if (!isHas) {
              await this.set(name, filePath, code)
            }
          })
      )
  }
}