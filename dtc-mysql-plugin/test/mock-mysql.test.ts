import {executeTestCase, FunctionCallPlugin} from '@cgauge/dtc'
import {MysqlMockPlugin} from '../src/MysqlMockPlugin'
import {dirname} from 'node:path'
import {test} from 'node:test'
import assert from 'node:assert'
import {fileURLToPath} from 'node:url'
import mockTestCase from './fixtures/mock'
import invalidQueryTestCase from './fixtures/mock-invalid-query'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('It mock mysql calls', async () => {
  await executeTestCase(mockTestCase.narrow, [new FunctionCallPlugin(`${__dirname}/fixtures`), new MysqlMockPlugin()])
})

test('It validates SQL queries', async () => {
  try {
    await executeTestCase(invalidQueryTestCase.narrow, [new FunctionCallPlugin(`${__dirname}/fixtures`), new MysqlMockPlugin()])
  } catch (e) {
    if (e.code === 'ERR_ASSERTION' && e.operator === 'doesNotThrow') {
      assert.ok(true)
    }
  }
})
