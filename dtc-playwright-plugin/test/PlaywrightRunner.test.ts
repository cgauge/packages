import {test} from 'node:test'
import {PlaywrightRunner} from '../src/PlaywrightRunner'
import assert from 'node:assert'
import {fileURLToPath} from 'url'
import {dirname} from 'path'
import {PlaywrightPlugin} from '../src/PlaywrightPlugin'
import testCase from './fixtures/t1.dtc.js'
import testCase2 from './fixtures/t2.dtc.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('It calls playwright runner', async () => {
  const playwrightRunner = new PlaywrightRunner()

  await playwrightRunner.run(
    [
      {filePath: `${__dirname}/fixtures/t1.dtc.js`, testCase},
      {filePath: `${__dirname}/fixtures/t2.dtc.js`, testCase: testCase2},
    ],
    {playwright: [new PlaywrightPlugin()]},
    'playwright',
    `./test/fixtures/config.js`,
  )

  assert.ok(true)
})
