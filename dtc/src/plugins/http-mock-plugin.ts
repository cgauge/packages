import nodeAssert from 'node:assert/strict'
import extraAssert from '@cgauge/assert'
import nock from 'nock'
import {diff, is, optional, record, union, unknown} from '@cgauge/type-guard'
import { debug } from '../utils'

const MockHttp = {
  url: String,
  method: optional(union('get', 'post', 'put', 'delete', 'options', 'patch', 'head')),
  path: optional(String),
  status: optional(Number),
  queries: optional(record(String, union(String, [String]))),
  headers: optional(record(String, String)),
  body: optional(union(String, record(String, unknown))),
  response: optional(union(String, record(String, unknown))),
}

export const partialBodyCheck = (expected: string | Record<string, unknown>) => (body: Record<string, unknown>) => {
  debug(`(HTTP Mock) Body check:\n ${JSON.stringify(body, null, 2)}\n ${JSON.stringify(expected, null, 2)}`)

  if (typeof expected === 'string') {
    nodeAssert.equal(body, expected)
    return true
  }

  extraAssert.objectContains(body, expected)
  return true
}

export const arrange = async (args: unknown): Promise<boolean> => {
  if (!('http' in (args as any))) {
    return false
  }

  if (!is(args, {http: [MockHttp]})) {
    const mismatch = diff(args, {http: [MockHttp]})
    throw new Error(`(HTTP Mock) Invalid argument on arrange: ${mismatch[0]}`)
  }

  for (const request of args.http) {
    let interceptor
    const method = request.method ?? 'get'
    const path = request.path ?? '/'

    if (method === 'get') {
      interceptor = nock(request.url).get(path)
    } else {
      if (request.body) {
        interceptor = nock(request.url)[method](path, partialBodyCheck(request.body))
      } else {
        interceptor = nock(request.url)[method](path)
      }
    }

    if (request.queries) {
      for (const [queryKey, queryValue] of Object.entries(request.queries)) {
        interceptor.query({[queryKey]: queryValue})
      }
    }

    if (request.headers) {
      for (const [headerKey, headerValue] of Object.entries(request.headers)) {
        interceptor.matchHeader(headerKey, headerValue)
      }
    }

    interceptor.reply(request.status, request.response)
  }

  return true
}

export const assert = (): boolean => {
  if (!nock.isDone()) {
    const error = nock.pendingMocks()
    console.log(error)
    nock.cleanAll()
    throw new Error('(HTTP Mock) Not all nock interceptors were used!')
  }
  
  return true
}
