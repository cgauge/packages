import {test} from 'node:test'
import {PlaywrightRunner} from '../src/PlaywrightRunner'
import assert from 'node:assert'
import {fileURLToPath} from 'url'
import {dirname} from 'path'
import {PlaywrightPlugin} from '../src/PlaywrightPlugin'
import testCase from './fixtures/base.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('It calls playwright runner', async () => {
  const playwrightRunner = new PlaywrightRunner()

  await playwrightRunner.run(
    `${__dirname}/fixtures/base.js`,
    testCase,
    {playwright: [new PlaywrightPlugin()]},
    'playwright',
    `./dtc-playwright-plugin/test/fixtures/config.js`,
  )

  assert.ok(true)
})
