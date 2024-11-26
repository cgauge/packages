import extraAssert from '@cgauge/assert'
import {info} from '../utils.js'
import nodeAssert from 'node:assert'
import {is, optional, unknown, record, diff, intersection} from '@cgauge/type-guard'

const FunctionCallAct = {
  import: String,
  from: String,
  arguments: optional([unknown]),
}

const FunctionCallResponse = intersection({exception: optional({name: String})}, record(String, unknown))

let response: any
let exception: any

export const act = async (args: unknown, basePath: string) => {
  response = undefined
  exception = undefined

  if (!is(args, FunctionCallAct)) {
    const mismatch = diff(args, FunctionCallAct)
    info(`Function Call plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}\n`)
    return
  }

  const module = await import(basePath + '/' + args.from)

  /* c8 ignore start */
  if (typeof module[args.import] !== 'function') {
    throw new Error(`Function [${args.import}] not found at [${args.from}]`)
  }
  /* c8 ignore end */

  try {
    response = await module[args.import].apply(null, args.arguments)
  } catch (e) {
    exception = e
  }
}

export const assert = (args: unknown) => {
  if (!is(args, FunctionCallResponse)) {
    return
  }

  if (args.exception) {
    if (!exception) {
      throw Error(`Exception ${exception.name} was not thrown.`)
    }

    nodeAssert.equal(args.exception.name, exception.name)
  }

  if (response) {
    extraAssert.objectContains(response, args)
  }
}
