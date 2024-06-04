import { IDBPDatabase, deleteDB, openDB } from "idb"
import path from "path-browserify"
import { PlaygroundSetup } from "./type"
import { addPackageJSONIfNeeded } from "./utils"

export class Fs {
  private dbName: string
  private storeName: string
  private db!: IDBPDatabase

  constructor(name: string) {
    this.dbName = `__playground_db_${name}`
    this.storeName = `__playground_store_${name}`
  }
  async init() {
    const storeName = this.storeName
    this.db = await openDB(this.dbName, undefined, {
      upgrade(db) {
        db.createObjectStore(storeName)
      },
    })
  }
  async destroy() {
    if (!this.db) {
      return
    }
    await this.db.clear(this.storeName)
    await this.db.close()
    await deleteDB(this.dbName)
  }
  async get(path: string) {
    if (!this.db) {
      return
    }
    return this.db.get(this.storeName, path)
  }
  async set(path: string, value: string) {
    if (!this.db) {
      return
    }
    return this.db.put(this.storeName, value, path)
  }
  async del(path: string) {
    if (!this.db) {
      return
    }
    return this.db.delete(this.storeName, path)
  }
  async clear() {
    if (!this.db) {
      return
    }
    return this.db.clear(this.storeName)
  }
  async paths() {
    if (!this.db) {
      return
    }
    return this.db.getAllKeys(this.storeName)
  }

  async formatAndSetFiles(playgroundSetup: PlaygroundSetup) {

    const files = addPackageJSONIfNeeded(
      playgroundSetup.files ?? {},
      playgroundSetup.name,
      playgroundSetup.entry,
      playgroundSetup.dependencies,
      playgroundSetup.devDependencies,
    )
    await Promise
      .all(
        Object
          .entries(files)
          .map(async ([filePath, content]) => {
            const fullPath = path.join("/", filePath)
            const isHas = await this.get(fullPath)
            if (!isHas) {
              await this.set(fullPath, content.code)
            }
          })
      )
  }
}