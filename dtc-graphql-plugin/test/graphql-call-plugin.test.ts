import {afterEach, test} from 'node:test'
import {act, assert} from '../src/graphql-call-plugin'
import nock from 'nock'
import {appsync, checkForPendingMocks} from './nock-appsync'

nock.disableNetConnect()
afterEach(() => {
  checkForPendingMocks()
})

test('It calls a graphql endpoint with the token', async () => {
  const response = {data: {key: 'value'}}
  const query = `myQuery { items: {name, status} }`
  const variables = {id: 1}

  const expectedHeaders = {
    authorization: 'token',
  }

  appsync({query, variables}, expectedHeaders, response)

  await act({
    url: `https://appsync.eu-west-1.amazonaws.com`,
    query,
    variables: {id: 1},
    headers: {
      Authorization: 'token'
    }
  })

  await assert({graphql: response})
})
