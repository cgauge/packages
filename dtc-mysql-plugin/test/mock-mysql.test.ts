import {executeTestCase, FunctionCallPlugin} from '@cgauge/dtc'
import {MysqlMockPlugin} from '../src/MysqlMockPlugin'
import {dirname} from 'node:path'
import {test} from 'node:test'
import assert from 'node:assert'
import {fileURLToPath} from 'node:url'
import mockTestCase from './fixtures/mock'
import mockTwoConnectionsTestCase from './fixtures/mock-two-connections'
import invalidQueryTestCase from './fixtures/mock-invalid-query'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('It mocks mysql calls', async () => {
  await executeTestCase(mockTestCase.narrow, [new FunctionCallPlugin(), new MysqlMockPlugin()], `${__dirname}/fixtures/mock.ts`)
})

test('It supports more than one mysql connection', async () => {
  await executeTestCase(mockTwoConnectionsTestCase.narrow, [new FunctionCallPlugin(), new MysqlMockPlugin()], `${__dirname}/fixtures/mockTwoConnectionsTestCase.ts`)
})

test('It validates SQL queries', async () => {
  try {
    await executeTestCase(invalidQueryTestCase.narrow, [new FunctionCallPlugin(), new MysqlMockPlugin()], `${__dirname}/fixtures/invalidQueryTestCase.ts`)
  } catch (e) {
    if (e.code === 'ERR_ASSERTION' && e.operator === 'doesNotThrow') {
      assert.ok(true)
    }
  }
})
