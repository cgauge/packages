import {executeTestCase, FunctionCallPlugin} from '@cgauge/dtc'
import {MysqlPlugin} from '../src/MysqlPlugin'
import {dirname} from 'node:path'
import {test} from 'node:test'
import {fileURLToPath} from 'node:url'
import executeQueryTestCase from './fixtures/execute-query'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('It execute mysql query', async () => {
  await executeTestCase(executeQueryTestCase.narrow, [new FunctionCallPlugin(`${__dirname}/fixtures`), new MysqlPlugin()])
})

