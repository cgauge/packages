export const debug = (message: string) => process.env.DTC_DEBUG && process.stdout.write(`[DTC_DEBUG] ${message}\n`)
export const info = (message: string) => process.env.DTC_DEBUG && process.stdout.write(`[DTC_INFO] ${message}\n`)
export const warn = (message: string) => process.stdout.write(`[DTC_WARN] ${message}\n`)
export const warnExit = (message: string) => {
  warn(message)
  process.exit(1)
}
export const error = (message: string) => {
  process.stdout.write(`[DTC_ERROR] ${message}\n`)
  process.exit(1)
}

export const sleep = (ms: number): Promise<unknown> => new Promise((resolve) => setTimeout(resolve, ms))

export const retry = async <T>(fn: () => Promise<T>, times = 0, seconds = 1): Promise<T> => {
  const errors: Error[] = []

  do {
    try {
      const result = await fn()
      return result
    } catch (e: any) {
      errors.push(e)

      debug(`Retry ${times}`)

      await sleep(seconds * 1000)

      times--
    }
  } while (times > -1)

  debug(`Errors ${errors.map((e) => e.message)}`)

  throw errors[0]
}

export const merge = (to: any, from: any) => {
  to = {...to}
  for (const n in from) {
    if (typeof to[n] != 'object') {
      to[n] = from[n]
    } else if (typeof from[n] == 'object') {
      to[n] = merge(to[n], from[n])
    }
  }
  return to
}
