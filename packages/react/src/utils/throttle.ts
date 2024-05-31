export function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let lastFunc: NodeJS.Timeout | null
  let lastRan: number | undefined

  return function (this: unknown, ...args: Parameters<T>) {
    if (!lastRan) {
      func.apply(this, args)
      lastRan = Date.now()
    } else {
      if (lastFunc) {
        clearTimeout(lastFunc)
      }
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan!) >= limit) {
          func.apply(this, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  } as T
}
