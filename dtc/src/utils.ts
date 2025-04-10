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

export const merge = (to: any, from: any): any => {
  if (Array.isArray(to) && Array.isArray(from)) {
    return to.length > from.length
      ? to.map((v, i) => merge(v, from[i] ?? v))
      : from.map((v: any, i: number) => merge(to[i], v))
  } else if (typeof to === 'object' && !Array.isArray(to) && typeof from === 'object' && !Array.isArray(from)) {
    to = structuredClone(to)
    for (const key in from) {
      to[key] = merge(to[key], from[key])
    }
    return to
  }

  return from
}
