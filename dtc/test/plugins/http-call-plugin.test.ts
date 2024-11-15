import {test} from 'node:test'
import {act, assert} from '../../src/plugins/http-call-plugin'
import nodeAssert from 'node:assert/strict'

test('It does not act if type does not match', () => act({}))

test('It does not assert if type does not match', () => assert({}))

test('It calls an http endpoint', async () => {
  const content = {key: 'value'}

  await act({
    url: `data:application/json,${encodeURIComponent(JSON.stringify(content))}`,
  })

  await assert({http: content})
})

test('It fails to assert response', async () => {
  const content = 'a'

  await act({
    url: `data:application/json,${encodeURIComponent(JSON.stringify(content))}`,
  })

  nodeAssert.rejects(assert({http: 'b'}))
})
