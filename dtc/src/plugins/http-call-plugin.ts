import nodeAssert from 'node:assert/strict'
import extraAssert from '@cgauge/assert'
import {is, union, optional, unknown, record, assert as typeAssert, diff} from '@cgauge/type-guard'
import {debug, info} from '../utils'

let response: Response | undefined
let textResponse: string | undefined
let jsonResponse: unknown | undefined

const HttpCall = {
  url: String,
  method: optional(String),
  keepalive: optional(Boolean),
  headers: optional(record(String, String)),
  body: optional(String),
  redirect: optional(union('error', 'follow', 'manual')),
}

const HttpCallResponse = {http: union(String, record(String, unknown))}

export const act = async (args: unknown): Promise<boolean> => {
  response = undefined
  textResponse = undefined
  jsonResponse = undefined

  if (!is(args, HttpCall)) {
    const mismatch = diff(args, HttpCall)
    info(`(HTTP) Plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}`)
    return false
  }

  response = await fetch(args.url, args)

  return true
}

export const assert = async (args: unknown): Promise<boolean> => {
  if (!('http' in (args as any))) {
    return false
  }

  if (!is(args, HttpCallResponse)) {
    const mismatch = diff(args, HttpCallResponse)
    throw new Error(`(HTTP) Invalid argument on assert: ${mismatch[0]}`)
  }

  if (is(args.http, String)) {
    textResponse = textResponse ?? (await response?.text())

    debug(`(HTTP) Text response: ${textResponse}`);

    nodeAssert.deepStrictEqual(textResponse, args.http)
  } else {
    jsonResponse = jsonResponse ?? (await response?.json())

    debug(`(HTTP) JSON response: ${JSON.stringify(jsonResponse, null, 2)}`);

    typeAssert(jsonResponse, record(String, unknown))

    extraAssert.objectContains(jsonResponse, args.http)
  }

  return true
}
