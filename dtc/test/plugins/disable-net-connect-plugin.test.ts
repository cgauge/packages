import {test} from 'node:test'
import * as disableNetConnect from '../../src/plugins/disable-net-connect-plugin'
import assert from 'node:assert'

test('It does not allow http connections', async () => {
  try {
    await fetch('https://customergauge.com')
  } catch (error) {
    assert.equal(error.name, 'NetConnectNotAllowedError')
  }
})
