export const debug = (message: string) => process.env.DTC_DEBUG && process.stdout.write(`[DTC_DEBUG] ${message}`)
export const info = (message: string) => process.env.DTC_DEBUG && process.stdout.write(`[DTC_INFO] ${message}`)
export const warn = (message: string) => process.stdout.write(`[DTC_WARN] ${message}`)

export const sleep = (ms: number): Promise<unknown> => new Promise((resolve) => setTimeout(resolve, ms))

export const retry = async <T>(fn: () => Promise<T>, times = 2, seconds = 1): Promise<T> => {
  const errors: unknown[] = []

  // If times is 0 we call the function at least one time
  if (times === 0) {
    const result = await fn()
    return result
  }
  
  times++

  for (let i = 0; i < times; i++) {
    try {
      const result = await fn()
      return result
    } catch (e) {
      errors.push(e)

      await sleep(seconds * 1000)
    }
  }

  debug(`Errors ${JSON.stringify(errors)}`)

  throw new Error(`Failed retrying ${times} times`)
}