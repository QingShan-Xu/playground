import { invariant } from "outvariant"

export const createError = (message: string): string =>
  `[sandpack-client]: ${message}`

export function nullthrows<T>(value: T | null | undefined, err: string = "Value is nullish") {
  invariant(value != null, createError(err))
  return value
}
