import { beforeEach, describe, expect, it } from 'vitest'
import { Fs } from './fs'
import { PlaygroundSetup } from "./type"

describe('Fs', () => {
  let fs: Fs
  const FSname = "test_fs"

  beforeEach(async () => {
    fs = await Fs.getInstance()

    return async () => {
      await fs.clear(FSname)
    }
  })

  it('should set a value', async () => {
    const path = '/test.txt'
    const value = 'Hello, World!'
    await fs.set(FSname, path, value)
    const result = await fs.get(FSname, path)
    expect(result).toEqual(value)
  })

  it('should get a value by path', async () => {
    const path = '/test.txt'
    const value = 'Hello, World!'
    await fs.set(FSname, path, value)
    const result = await fs.get(FSname, path)
    expect(result).toEqual(value)
  })

  it('should delete a value by path', async () => {
    const path = '/test.txt'
    const value = 'Hello, World!'
    await fs.set(FSname, path, value)
    await fs.del(FSname, path)
    const result = await fs.get(FSname, path)
    expect(result).toBeUndefined()
  })

  it('should clear all values', async () => {
    await fs.set(FSname, '/test1.txt', 'Hello, World!')
    await fs.set(FSname, '/test2.txt', 'Goodbye, World!')
    await fs.clear(FSname)
    const result = await fs.paths(FSname)
    expect(result).toEqual([])
  })

  it('should get all keys', async () => {
    await fs.set(FSname, '/test1.txt', 'Hello, World!')
    await fs.set(FSname, '/test2.txt', 'Goodbye, World!')
    const result = await fs.paths(FSname)

    expect(result).toEqual(['/test1.txt', '/test2.txt'])
  })

  it('should check and set files in the database', async () => {
    const playgroundSetup: PlaygroundSetup = {
      name: 'test-playground',
      buildOptions: { entry: 'index.ts' },
      files: {
        'index.ts': 'console.log("Hello, world!")'
      },
      dependencies: {},
      devDependencies: {}
    }
    const files = await fs.checkAndformatFiles(playgroundSetup)
    await fs.setFiles(FSname, files)
    const result = await fs.get(FSname, '/index.ts')
    expect(result).toEqual(playgroundSetup.files['index.ts'])
  })

  it("should get two value by path in diffrefent fs", async () => {
    const fs2 = await Fs.getInstance()
    fs.set(FSname, '/test1.txt', 'Hello, World!')
    fs2.set(FSname, '/test2.txt', 'Goodbye, World!')
    const result = await fs.get(FSname, '/test1.txt')
    const result2 = await fs2.get(FSname, '/test2.txt')
    expect(result).toEqual('Hello, World!')
    expect(result2).toEqual('Goodbye, World!')
  })
}) 