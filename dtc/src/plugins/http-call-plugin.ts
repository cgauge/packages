import nodeAssert from 'node:assert/strict'
import extraAssert from '@cgauge/assert'
import {isRecord} from '../utils.js'

type HttpCall = {url: string} & RequestInit

const isHttpCall = (v: unknown): v is HttpCall => isRecord(v) && 'url' in v

let response: Response | undefined

export const act = async (args: unknown) => {
  if (!isHttpCall(args)) {
    return
  }

  response = await fetch(args.url, args)
}

export const assert = async (args: unknown) => {
  if (isRecord(args)) {
    if (isRecord(args.http)) {
      extraAssert.objectContains(await response?.json(), args.http)
    } else {
      nodeAssert.deepStrictEqual(await response?.text(), args.http)
    }
  }
}
