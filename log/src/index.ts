import {styleText, debug, inspect, InspectOptions} from 'node:util'

const LOG_LEVEL_MAP = {debug: 100, info: 200, notice: 250, warning: 300, error: 400}

type LOG_LEVEL = keyof typeof LOG_LEVEL_MAP

const createLogFunction = (namespace: string, options: InspectOptions) => (level: LOG_LEVEL) => (message: unknown) => {
  const currentLogLevel = process.env.LOG_LEVEL ?? 'info'
  
  if (currentLogLevel in LOG_LEVEL_MAP && LOG_LEVEL_MAP[level] < LOG_LEVEL_MAP[currentLogLevel as LOG_LEVEL]) {
    return
  }

  debug(namespace)(`${styleText(['blue'], level.toUpperCase())} ${inspect(message, options)}`)
}

export default (namespace: string, options: InspectOptions = {depth: 20, colors: true}) => ({
  debug: createLogFunction(namespace, options)('debug'),
  info: createLogFunction(namespace, options)('info'),
  warn: createLogFunction(namespace, options)('warning'),
  error: createLogFunction(namespace, options)('error'),
})
