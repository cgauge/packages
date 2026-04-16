import {test} from 'node:test'
import nodeAssert from 'node:assert'
import {executeTestCase} from '../src/index.js'
import {arrange, act, assert, clean} from './fixtures/plugin.ts'
import * as plugin from '../test/fixtures/plugin.ts'
import * as pluginOutputs from '../test/fixtures/plugin-outputs.ts'
import * as pluginOutputs2 from '../test/fixtures/plugin-outputs2.ts'
import * as pluginArgs from './fixtures/plugin-args.ts'
import * as pluginArray from './fixtures/plugin-array.ts'
import * as pluginLayers from './fixtures/plugin-layers.ts'
import * as pluginFalse from './fixtures/plugin-act-false.ts'
import * as pluginCleanup from './fixtures/plugin-cleanup.ts'
import * as pluginRetry from './fixtures/plugin-retry.ts'

test('It runs plugins methods', async () => {
  await executeTestCase(
    {
      testCase: {name: 'Test', act: {}, arrange: {}, assert: {}, clean: {}},
      filePath: './filePath.js',
    },
    [plugin],
  )

  nodeAssert.equal(arrange.mock.callCount(), 1)
  nodeAssert.equal(act.mock.callCount(), 1)
  nodeAssert.equal(assert.mock.callCount(), 1)
  nodeAssert.equal(clean.mock.callCount(), 1)
})

test('It replace act variable from arrange', async () => {
  const r = await executeTestCase(
    {
      testCase: {
        name: 'Test',
        arrange: {
          rds: [
            {id: 'rds_id_1', sql: 'SELECT 1'},
            {id: 'rds_id_2', sql: 'SELECT 2'},
          ],
        },
        act: {
          id: 'act_id',
          value1: '${{arrange.0.0}}',
          value2: '${{arrange.0.1}}'
        },
        clean: {},
      },
      filePath: './filePath.js',
    },
    [pluginOutputs],
  )

  const lastActCall = pluginOutputs.act.mock.calls.at(-1)
  const actPayload = lastActCall?.arguments.at(0)

  nodeAssert.deepEqual(actPayload, {id: 'act_id', value1: 'arrange output 1', value2: 'arrange output 2'})
})

test('It replace assert variables from act and arrange', async () => {
  const r = await executeTestCase(
    {
      testCase: {
        name: 'Test',
        arrange: {
          rds: [
            {id: 'rds_id_1', sql: 'SELECT 1'},
            {id: 'rds_id_2', sql: 'SELECT 2'},
          ],
        },
        act: {id: 'act_id'},
        assert: {
          value1: '${{arrange.0.0}}',
          value2: '${{arrange.0.1}}',
          value3: '${{act.0}}',
        },
        clean: {},
      },
      filePath: './filePath.js',
    },
    [pluginOutputs2],
  )

  const lastActCall = pluginOutputs2.assert.mock.calls.at(-1)
  const assertPayload = lastActCall?.arguments.at(0)

  nodeAssert.deepEqual(assertPayload, {value1: 'arrange output 1', value2: 'arrange output 2', value3: 'act output'})
})

test('It passes parameters to plugins functions', async () => {
  const testCase = {
    name: 'Test',
    arrange: {a: 'b'},
    act: {c: 'd'},
    assert: {e: 'f'},
    clean: {g: 'h'},
  }
  const filePath = './path/to/file'
  const basePath = './path/to'
  const testArgs = {i: 'j'}

  await executeTestCase({testCase, filePath}, [pluginArgs], testArgs)

  nodeAssert.deepEqual(pluginArgs.arrange.mock.calls[0].arguments.slice(0, 3), [testCase.arrange, basePath, testArgs])
  nodeAssert.deepEqual(pluginArgs.act.mock.calls[0].arguments.slice(0, 3), [testCase.act, basePath, testArgs])
  nodeAssert.deepEqual(pluginArgs.assert.mock.calls[0].arguments.slice(0, 3), [testCase.assert, basePath, testArgs])
  nodeAssert.deepEqual(pluginArgs.clean.mock.calls[0].arguments.slice(0, 3), [testCase.clean, basePath, testArgs])
})

test('It supports array on arrange, assert and clean', async () => {
  await executeTestCase(
    {
      testCase: {
        name: 'Test',
        act: {},
        arrange: {rds: [{}, {}]},
        assert: {rds: [{}, {}]},
        clean: {rds: [{}, {}]},
      },
      filePath: './filePath.js',
    },
    [pluginArray],
  )

  nodeAssert.equal(pluginArray.arrange.mock.callCount(), 1)
  nodeAssert.equal(pluginArray.act.mock.callCount(), 1)
  nodeAssert.equal(pluginArray.assert.mock.callCount(), 1)
  nodeAssert.equal(pluginArray.clean.mock.callCount(), 1)
})

test('It executes layers', async () => {
  await executeTestCase(
    {
      testCase: {
        name: 'Test',
        act: {},
      },
      filePath: './filePath.js',
      resolvedLayers: [
        {arrange: {}, clean: {}},
        {arrange: {}, clean: {}},
      ],
    },
    [pluginLayers],
  )

  nodeAssert.equal(pluginLayers.arrange.mock.callCount(), 2)
  nodeAssert.equal(pluginLayers.act.mock.callCount(), 1)
  nodeAssert.equal(pluginLayers.clean.mock.callCount(), 2)
})

test('It fails if no action is executed', async () => {
  await nodeAssert.rejects(
    executeTestCase(
      {
        testCase: {name: 'Test', act: {}},
        filePath: './filePath.js',
      },
      [pluginFalse],
    ),
  )

  nodeAssert.equal(pluginFalse.act.mock.callCount(), 1)
})

test('It runs cleanup even if arrange, act or assert fails', async () => {
  await nodeAssert.rejects(
    async () => {
      await executeTestCase(
        {
          resolvedLayers: [{clean: {}}, {clean: {}}],
          testCase: {
            name: 'Test with failing act',
            arrange: {},
            act: {},
            assert: {},
            clean: {},
          },
          filePath: './filePath.js',
        },
        [pluginCleanup],
      )
    },
    {
      message: 'TestCase: Test with failing act \nActError: Act failed',
    },
  )

  nodeAssert.equal(pluginCleanup.arrange.mock.callCount(), 1)
  nodeAssert.equal(pluginCleanup.act.mock.callCount(), 1)
  nodeAssert.equal(pluginCleanup.assert.mock.callCount(), 0)
  nodeAssert.equal(pluginCleanup.clean.mock.callCount(), 3)
})

test('It retries assertion when it fails', async () => {
  await executeTestCase(
    {
      testCase: {
        name: 'Test with retry',
        act: {},
        assert: {},
        retry: 2,
        delay: 0.1,
      },
      filePath: './filePath.js',
    },
    [pluginRetry],
  )

  nodeAssert.equal(pluginRetry.act.mock.callCount(), 1)
  nodeAssert.equal(pluginRetry.assert.mock.callCount(), 3)
})
