import nodeAssert from 'node:assert/strict'
import extraAssert from '@cgauge/assert'
import {is, union, optional, unknown, record, assert as typeAssert, diff} from 'type-assurance'
import {info} from '../utils'

let response: Response | undefined

const HttpCall = {
  url: String,
  method: optional(String),
  keepalive: optional(Boolean),
  headers: optional(record(String, String)),
  body: optional(String),
  redirect: optional(union('error', 'follow', 'manual')),
}

const HttpCallResponse = {http: union(String, record(String, unknown))}

export const act = async (args: unknown) => {
  response = undefined
  
  if (!is(args, HttpCall)) {
    const mismatch = diff(args, HttpCall)
    info(`HTTP Call plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}\n`)
    return
  }

  response = await fetch(args.url, args)
}

export const assert = async (args: unknown) => {
  if (!is(args, HttpCallResponse)) {
    return
  }

  if (is(args.http, String)) {
    nodeAssert.deepStrictEqual(await response?.text(), args.http)
  } else {
    const jsonResponse = await response?.json()

    typeAssert(jsonResponse, record(String, unknown))

    extraAssert.objectContains(jsonResponse, args.http)
  }
}
