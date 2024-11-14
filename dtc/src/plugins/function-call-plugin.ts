import extraAssert from '@cgauge/assert'
import {isRecord} from '../utils.js'
import nodeAssert from 'node:assert'

type FunctionCallAct = {
  import: string
  from: string
  arguments?: unknown[]
}

const isFunctionCallAct = (v: unknown): v is FunctionCallAct => typeof v === 'object' && v !== null && 'import' in v

let response: any
let exception: any

export const act = async (args: unknown, basePath: string) => {
  if (!isFunctionCallAct(args)) {
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

export const assert = (args: {exception?: {name?: string}; [x: string]: unknown}) => {
  if (exception) {
    nodeAssert.equal(args?.exception?.name, exception.name)
  }

  if (response && isRecord(args) && args) {
    extraAssert.objectContains(response, args)
  }
}
