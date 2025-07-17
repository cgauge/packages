import {test} from 'node:test'
import {arrange} from '../../src/plugins/disable-net-connect-plugin'
import assert from 'node:assert'

test('It does not allow http connections', async () => {
  try {
    await arrange()
    await fetch('https://customergauge.com')
  } catch (error) {
    assert.equal(error.name, 'NetConnectNotAllowedError')
  }
})
