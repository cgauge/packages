import {test} from 'node:test'
import playwrightRunner from '../src/playwright-runner.js'
import assert from 'node:assert'
import {fileURLToPath} from 'url'
import {dirname} from 'path'
import testCase from './fixtures/t1.dtc.js'
import testCase2 from './fixtures/t2.dtc.js'
import testCase3 from './fixtures/t3.dtc.js'
import testCase4 from './fixtures/t4.dtc.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('It calls playwright runner', async () => {
  const runner = playwrightRunner()

  await runner(
    [
      {filePath: `${__dirname}/fixtures/t1.dtc.js`, testCase},
      {filePath: `${__dirname}/fixtures/t2.dtc.js`, testCase: testCase2},
      {filePath: `${__dirname}/fixtures/t3.dtc.js`, testCase: testCase3},
      {filePath: `${__dirname}/fixtures/t4.dtc.js`, testCase: testCase4},
    ],
    [],
    [],
    `./test/fixtures/config.js`,
  )

  assert.ok(true)
})

