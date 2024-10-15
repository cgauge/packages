import nodeAssert from 'node:assert/strict'
import extraAssert from '@cgauge/assert'
import {isRecord} from '../utils.js'
import nock from 'nock'

type MockHttp = {
  url: string
  method?: 'get' | 'post' | 'put' | 'delete' | 'options' | 'patch' | 'head'
  path?: string
  status?: number
  queries?: Record<string, string | string[]>
  headers?: Record<string, string>
  body?: string | Record<string, unknown>
  response?: string | Record<string, unknown>
}

const isMockHttp = (v: unknown): v is {http: MockHttp[]} => isRecord(v) && 'http' in v

export const partialBodyCheck = (expected: string | Record<string, unknown>) => (body: Record<string, unknown>) => {
  if (typeof expected === 'string') {
    nodeAssert.equal(body, expected)
    return true
  }

  extraAssert.objectContains(body, expected)
  return true
}

export const arrange = async (args: unknown) => {
  if (!isMockHttp(args)) {
    return
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
}

export const assert = () => {
  if (!nock.isDone()) {
    const error = nock.pendingMocks()
    console.log(error)
    nock.cleanAll()
    throw new Error('Not all nock interceptors were used!')
  }
}
