import {afterEach, test} from 'node:test'
import {act, assert} from '../src/graphql-call-plugin'
import nock from 'nock'
import {RequestDocument} from 'graphql-request'
import nodeAssert from 'node:assert/strict'
import extraAssert from '@cgauge/assert'

nock.disableNetConnect()

export interface AppSyncRequest {
  query: string | RequestDocument
  variables?: Record<string, unknown>
}

export const partialBodyCheck = (expected: AppSyncRequest) => (body: Record<string, unknown>) => {
  if (typeof expected === 'string') {
    nodeAssert.equal(body, expected)
    return true
  }

  extraAssert.objectContains(body, expected)
  return true
}

export const appsync = (request: AppSyncRequest, expectedHeaders, response): void => {
  nock('https://appsync.eu-west-1.amazonaws.com')
    .post('/', partialBodyCheck(request))
    .matchHeader('authorization', expectedHeaders.authorization)
    .matchHeader('accept', expectedHeaders.accept)
    .reply(200, response)
}

export const checkForPendingMocks = (): void => {
  if (!nock.isDone()) {
    const error = nock.pendingMocks()
    nock.cleanAll()
    throw new Error('Not all nock interceptors were used!')
  }
}
