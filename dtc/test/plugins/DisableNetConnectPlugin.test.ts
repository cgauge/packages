import {test} from 'node:test'
import {DisableNetConnectPlugin} from '../../src/plugins/DisableNetConnectPlugin'
import assert from 'node:assert'

test('It does not allow http connections', async () => {
  new DisableNetConnectPlugin().arrange()

  try {
    await fetch('https://customergauge.com')
  } catch (error) {
    assert.equal(error.name, 'NetConnectNotAllowedError')
  }
})
