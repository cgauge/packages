import {test} from 'node:test'
import nodeAssert from 'node:assert'
import {executeTestCase} from '../src/index.js'
import {arrange, act, assert, clean} from './fixtures/plugin.ts'
import {
  arrange as arrangeArgs,
  act as actArgs,
  assert as assertArgs,
  clean as cleanArgs,
} from './fixtures/plugin-args.ts'
import {
  arrange as arrangeArray,
  act as actArray,
  assert as assertArray,
  clean as cleanArray,
} from './fixtures/plugin-array.ts'
import {
  arrange as arrangeLayers,
  act as actLayers,
  assert as assertLayers,
  clean as cleanLayers,
} from './fixtures/layers.ts'
import {
  act as actFalse,
} from './fixtures/plugin-act-false.ts'
import {
  arrange as arrangeCleanup,
  act as actCleanup,
  assert as assertCleanup,
  clean as cleanCleanup,
} from './fixtures/plugin-cleanup.ts'

test('It runs plugins methods', async () => {
  await executeTestCase(
    {
      testCase: {name: 'Test', act: {}, arrange: {}, assert: {}, clean: {}},
      filePath: './filePath.js',
    },
    ['../test/fixtures/plugin.ts'],
  )

  nodeAssert.equal(arrange.mock.callCount(), 1)
  nodeAssert.equal(act.mock.callCount(), 1)
  nodeAssert.equal(assert.mock.callCount(), 1)
  nodeAssert.equal(clean.mock.callCount(), 1)
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

  await executeTestCase({testCase, filePath}, ['../test/fixtures/plugin-args.ts'], testArgs)

  nodeAssert.deepEqual(arrangeArgs.mock.calls[0].arguments, [testCase.arrange, basePath, testArgs])
  nodeAssert.deepEqual(actArgs.mock.calls[0].arguments, [testCase.act, basePath, testArgs])
  nodeAssert.deepEqual(assertArgs.mock.calls[0].arguments, [testCase.assert, basePath, testArgs])
  nodeAssert.deepEqual(cleanArgs.mock.calls[0].arguments, [testCase.clean, basePath, testArgs])
})

test('It ensures plugins methods are optional', async () => {
  await executeTestCase({testCase: {name: 'Test'},filePath: ''}, ['../test/fixtures/blank-plugin.ts'], {})

  nodeAssert.ok(true)
})

test('It supports array on arrange, assert and clean', async () => {
  await executeTestCase(
    {
      testCase: {
        name: 'Test',
        act: {},
        arrange: [{}, {}],
        assert: [{}, {}],
        clean: [{}, {}],
      },
      filePath: './filePath.js',
    },
    ['../test/fixtures/plugin-array.ts'],
  )

  nodeAssert.equal(arrangeArray.mock.callCount(), 2)
  nodeAssert.equal(actArray.mock.callCount(), 1)
  nodeAssert.equal(assertArray.mock.callCount(), 2)
  nodeAssert.equal(cleanArray.mock.callCount(), 2)
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
        {arrange: [{}, {}], clean: [{}, {}]},
      ],
    },
    ['../test/fixtures/layers.ts'],
  )

  nodeAssert.equal(arrangeLayers.mock.callCount(), 3)
  nodeAssert.equal(actLayers.mock.callCount(), 1)
  nodeAssert.equal(cleanLayers.mock.callCount(), 3)
})

test('It fails if no action is executed', async () => {
  await nodeAssert.rejects(executeTestCase(
    {
      testCase: {name: 'Test', act: {}},
      filePath: './filePath.js',
    },
    ['../test/fixtures/plugin-act-false.ts'],
  ))

  nodeAssert.equal(actFalse.mock.callCount(), 1)
})

test.only('It runs cleanup even if arrange, act or assert fails', async () => { 
  await nodeAssert.rejects(
    async () => {
      await executeTestCase({
        resolvedLayers: [
          {clean: {}},
          {clean: [{}, {}]},
        ],
        testCase: {
          name: 'Test with failing act',
          arrange: [{}, {}],
          act: {},
          assert: [{}],
          clean: [{}, {}],
        },
        filePath: './filePath.js',
      }, ['../test/fixtures/plugin-cleanup.ts'])
    },
    {
      message: 'TestCase: Test with failing act \nActError: Act failed',
    }
  )

  nodeAssert.equal(arrangeCleanup.mock.callCount(), 2)
  nodeAssert.equal(actCleanup.mock.callCount(), 1)
  nodeAssert.equal(assertCleanup.mock.callCount(), 0)
  nodeAssert.equal(cleanCleanup.mock.callCount(), 5)
})
