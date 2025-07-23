import createLogger from '@cgauge/log'

const logger = createLogger('dtc');

export const warnExit = (message: string) => {
  logger.warn(message)
  process.exit(1)
}
export const error = (message: string) => {
  logger.error(message)
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

      logger.debug(`Retry ${times}`)

      await sleep(seconds * 1000)

      times--
    }
  } while (times > -1)

  logger.debug(`Errors ${errors.map((e) => e.message)}`)

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
