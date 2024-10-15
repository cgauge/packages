import extraAssert from '@cgauge/assert'
import {isRecord} from '../utils.js'

type FunctionCallAct = {
  import: string
  from: string
  arguments?: unknown[]
}

const isFunctionCallAct = (v: unknown): v is FunctionCallAct => typeof v === 'object' && v !== null && 'import' in v

let response: any

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

  response = await module[args.import].apply(null, args.arguments)
}

export const assert = (args: unknown) => {
  if (response && isRecord(args) && args) {
    extraAssert.objectContains(response, args)
  }
}
