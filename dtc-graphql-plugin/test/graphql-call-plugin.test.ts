import {afterEach, test} from 'node:test'
import {act, assert} from '../src/graphql-call-plugin'
import nock from 'nock'
import {appsync, checkForPendingMocks} from './nock-appsync'

nock.disableNetConnect()
afterEach(() => {
  checkForPendingMocks()
})

test.only('It calls a graphql endpoint', async () => {
  process.env.AUTHORIZATION_TOKEN = 'token';
  const response = {data: {key: 'value'}}
  const query = `myQuery { items: {name, status} }`
  const variables = {id: 1}

  const expectedHeaders = {
    accept: 'application/graphql-response+json, application/json',
    authorization: process.env.AUTHORIZATION_TOKEN,
    'content-type': 'application/json',
  }

  appsync({query, variables}, expectedHeaders, response)

  await act({
    url: `https://appsync.eu-west-1.amazonaws.com`,
    query,
    variables: {id: 1},
  })

  await assert({graphql: response})
})
