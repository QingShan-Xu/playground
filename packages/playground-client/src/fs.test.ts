import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Fs } from './fs'

describe('Fs', () => {
  let fs: Fs

  beforeEach(async () => {
    fs = new Fs('test_fs')
    await fs.init()
  })

  afterEach(async () => {
    await fs.destroy()
  })

  it('should set a value', async () => {
    const path = '/test.txt'
    const value = 'Hello, World!'
    await fs.set(path, value)
    const result = await fs.get(path)
    expect(result).toEqual(value)
  })

  it('should get a value by path', async () => {
    const path = '/test.txt'
    const value = 'Hello, World!'
    await fs.set(path, value)
    const result = await fs.get(path)
    expect(result).toEqual(value)
  })

  it('should delete a value by path', async () => {
    const path = '/test.txt'
    const value = 'Hello, World!'
    await fs.set(path, value)
    await fs.del(path)
    const result = await fs.get(path)
    expect(result).toBeUndefined()
  })

  it('should clear all values', async () => {
    await fs.set('/test1.txt', 'Hello, World!')
    await fs.set('/test2.txt', 'Goodbye, World!')
    await fs.clear()
    const result = await fs.paths()
    expect(result).toEqual([])
  })

  it('should get all keys', async () => {
    await fs.set('/test1.txt', 'Hello, World!')
    await fs.set('/test2.txt', 'Goodbye, World!')
    const result = await fs.paths()
    expect(result).toEqual(['/test1.txt', '/test2.txt'])
  })

  it('should check and set files in the database', async () => {
    const playgroundSetup = {
      name: 'test-playground',
      entry: 'index.ts',
      files: {
        'index.ts': { code: 'console.log("Hello, world!")' }
      },
      dependencies: {},
      devDependencies: {}
    }

    await fs.formatAndSetFiles(playgroundSetup)
    const result = await fs.get('/index.ts')
    expect(result).toEqual(playgroundSetup.files['index.ts'].code)
  })

  it("should get two value by path in diffrefent fs", async () => {
    const fs2 = new Fs('test_fs2')
    await fs2.init()
    fs.set('/test1.txt', 'Hello, World!')
    fs2.set('/test2.txt', 'Goodbye, World!')
    const result = await fs.get('/test1.txt')
    const result2 = await fs2.get('/test2.txt')
    expect(result).toEqual('Hello, World!')
    expect(result2).toEqual('Goodbye, World!')
  })


}) 