import {test} from 'node:test'
import querystring from 'node:querystring'
import {arrange, assert} from '../../src/plugins/http-mock-plugin'

test('It does not arrange if type does not match', async () => { await arrange({}) })

test('It does not assert if type does not match', async () => { await assert() })

test('It mocks an http request', async () => { 
  const url = 'http://localhost.com'
  const queries = {a: '1', b: '2'}

  await arrange({
    http: [
      {url, queries}
    ]
  })

  await fetch(`${url}?${querystring.stringify(queries)}`)
})
