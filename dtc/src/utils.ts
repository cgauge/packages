export const debug = (message: string) => process.env.DTC_DEBUG && process.stdout.write(message)

export const sleep = (ms: number): Promise<unknown> => new Promise((resolve) => setTimeout(resolve, ms))

export const retry = async <T>(fn: () => Promise<T>, times = 2, seconds = 1): Promise<T> => {
  const errors: unknown[] = []

  // If times is 0 we call the function at least one time
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

export const isRecord = (v: unknown): v is Record<string, unknown> => {
  if (typeof v !== 'object' || Array.isArray(v) || Object.getOwnPropertySymbols(v).length > 0) {
    return false
  }

  return Object.getOwnPropertyNames(v).length > 0
}