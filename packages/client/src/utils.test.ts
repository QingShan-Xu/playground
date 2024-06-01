import { describe, expect, it } from "vitest"

import { nullthrows } from "./utils"

describe("nullthrows function", () => {
  it("should return the value when it is not null or undefined", () => {
    const value = "test"
    const result = nullthrows(value)
    expect(result).toBe(value)
  })

  it("should throw an error when the value is null", () => {
    const value = null
    const action = () => nullthrows(value)
    expect(action).toThrow("[sandpack-client]: Value is nullish")
  })

  it("should throw an error when the value is undefined", () => {
    const value = undefined
    const action = () => nullthrows(value)
    expect(action).toThrow("[sandpack-client]: Value is nullish")
  })

  it("should throw an error with a custom message when the value is null or undefined", () => {
    const value = null
    const customErrorMessage = "Custom error message"
    const action = () => nullthrows(value, customErrorMessage)
    expect(action).toThrow(`[sandpack-client]: ${customErrorMessage}`)
  })
})
