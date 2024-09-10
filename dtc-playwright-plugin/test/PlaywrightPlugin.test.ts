import {test, mock} from 'node:test'
import {PlaywrightPlugin} from '../src/PlaywrightPlugin'
import assert from 'node:assert'

test('It calls playwright triggers', async () => {
  const playwrightPlugin = new PlaywrightPlugin()

  const page = {
    goto: mock.fn()
  }

  playwrightPlugin.setTestRunnerArgs({page})

  await playwrightPlugin.act({
    url: 'https://customergauge.com',
  })

  assert.equal(page.goto.mock.callCount(), 1)
})
