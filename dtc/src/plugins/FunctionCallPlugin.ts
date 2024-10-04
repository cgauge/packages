import type {Plugin} from '../domain'
import extraAssert from '@cgauge/assert'
import {isRecord} from '../utils.js'

type FunctionCallAct = {
  import: string
  from: string
  attributes?: unknown[]
}

const isFunctionCallAct = (v: unknown): v is FunctionCallAct => typeof v === 'object' && v !== null && 'import' in v

export class FunctionCallPlugin implements Plugin {
  private response: any
  private basePath?: string

  setBasePath(path: string) {
    this.basePath = path
  }

  async act(args: unknown): Promise<any> {
    if (!isFunctionCallAct(args)) {
      return
    }

    const module = await import(this.basePath + '/' + args.from)

    /* c8 ignore start */
    if (typeof module[args.import] !== 'function') {
      throw new Error(`Function [${args.import}] not found at [${args.from}]`)
    }
    /* c8 ignore end */

    this.response = await module[args.import].apply(null, args.attributes)
  }

  assert(args: unknown) {
    if (this.response && isRecord(args) && args) {
      extraAssert.objectContains(this.response, args)
    }
  }
}
