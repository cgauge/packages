import {test, mock} from 'node:test'
import {act} from '../src/playwright-plugin'
import assert from 'node:assert'

test('It calls playwright triggers', async () => {
  const page = {goto: mock.fn()}

  //@ts-ignore
  await act({url: 'https://customergauge.com'}, 'basePath', {page})

  assert.equal(page.goto.mock.callCount(), 1)
})
