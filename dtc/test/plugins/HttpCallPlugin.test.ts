import {test} from 'node:test'
import {HttpCallPlugin} from '../../src/plugins/HttpCallPlugin'

test('It calls an http endpoint', async () => {
  const httpCallPlugin = new HttpCallPlugin()
  const content = {content: 'a'}

  await httpCallPlugin.act({
    url: `data:application/json,${encodeURIComponent(JSON.stringify(content))}`,
  })

  await httpCallPlugin.assert({http: content})
})
