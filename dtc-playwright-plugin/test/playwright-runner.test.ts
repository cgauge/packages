import {test} from 'node:test'
import playwrightRunner from '../src/playwright-runner.js'
import assert from 'node:assert'

test('It calls playwright runner', async () => {
  const runner = playwrightRunner()

  await runner(
    [],
    [],
    [],
    `./test/fixtures/config.js`,
  )

  assert.ok(true)
})

