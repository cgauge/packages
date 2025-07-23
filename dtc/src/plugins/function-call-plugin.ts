import extraAssert from '@cgauge/assert'
import nodeAssert from 'node:assert'
import {is, optional, unknown, record, diff, intersection} from '@cgauge/type-guard'
import createLogger from '@cgauge/log'

const logger = createLogger('dtc:function-call');

const FunctionCallAct = {
  import: String,
  from: String,
  arguments: optional([unknown]),
}

const FunctionCallResponse = intersection({exception: optional({name: String})}, record(String, unknown))

let response: any
let exception: any

export const act = async (args: unknown, basePath: string): Promise<boolean> => {
  response = undefined
  exception = undefined

  if (!is(args, FunctionCallAct)) {
    const mismatch = diff(args, FunctionCallAct)
    logger.info(`Plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}`)
    return false
  }

  const module = await import(basePath + '/' + args.from)

  /* c8 ignore start */
  if (typeof module[args.import] !== 'function') {
    throw new Error(`(Function Call) '${args.import}' not found at [${args.from}]`)
  }
  /* c8 ignore end */

  try {
    response = await module[args.import].apply(null, args.arguments)
  } catch (e) {
    exception = e
  }

  return true
}

export const assert = async (args: unknown): Promise<boolean> => {
  if (!is(args, FunctionCallResponse)) {
    return false
  }

  if (args.exception) {
    if (!exception) {
      throw Error(`(Function Call) Exception ${exception.name} was not thrown`)
    }

    nodeAssert.equal(args.exception.name, exception.name)
  } else {
    if (exception) {
        throw exception
    }
}

  if (response) {
    extraAssert.objectContains(response, args)
  }

  return true
}
