import {test} from 'node:test'
import {act, assert} from '../../src/plugins/http-call-plugin'

test('It calls an http endpoint', async () => {
  const content = {key: 'value'}

  await act({
    url: `data:application/json,${encodeURIComponent(JSON.stringify(content))}`,
  })

  await assert({http: content})
})
