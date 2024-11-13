import {afterEach, test} from 'node:test'
import {act, assert} from '../src/graphql-call-plugin'
import nock from 'nock'
import {appsync, checkForPendingMocks} from './nock-appsync'

nock.disableNetConnect()
afterEach(() => {
  checkForPendingMocks()
})

test('It calls a graphql endpoint with the token', async () => {
  process.env.AUTHORIZATION_TOKEN = 'token'
  const response = {data: {key: 'value'}}
  const query = `myQuery { items: {name, status} }`
  const variables = {id: 1}

  const expectedHeaders = {
    authorization: process.env.AUTHORIZATION_TOKEN,
  }

  appsync({query, variables}, expectedHeaders, response)

  await act({
    url: `https://appsync.eu-west-1.amazonaws.com`,
    query,
    variables: {id: 1},
  })

  await assert({graphql: response})
})

test('It calls a graphql endpoint without the token', async () => {
  delete process.env.AUTHORIZATION_TOKEN
  const response = {data: {key: 'value'}}
  const query = `myQuery { items: {name, status} }`
  const expectedHeaders = {
    authorization: '',
  }

  appsync({query}, expectedHeaders, response)

  await act({
    url: `https://appsync.eu-west-1.amazonaws.com`,
    query,
  })

  await assert({graphql: response})
})
