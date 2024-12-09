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

test('It runs plugins methods', async () => {
  await executeTestCase(
    {name: 'Test', act: {}, arrange: {}, assert: {}, clean: {}},
    ['../test/fixtures/plugin.ts'],
    './filePath.js',
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

  await executeTestCase(testCase, ['../test/fixtures/plugin-args.ts'], filePath, testArgs)

  nodeAssert.deepEqual(arrangeArgs.mock.calls[0].arguments, [testCase.arrange, basePath, testArgs])
  nodeAssert.deepEqual(actArgs.mock.calls[0].arguments, [testCase.act, basePath, testArgs])
  nodeAssert.deepEqual(assertArgs.mock.calls[0].arguments, [testCase.assert, basePath, testArgs])
  nodeAssert.deepEqual(cleanArgs.mock.calls[0].arguments, [testCase.clean, basePath, testArgs])
})

test('It ensures plugins methods are optional', async () => {
  await executeTestCase({name: 'Test'}, ['../test/fixtures/blank-plugin.ts'], '', {})

  nodeAssert.ok(true)
})

test('It supports array on arrange, assert and clean', async () => {
  await executeTestCase(
    {name: 'Test', act: {}, arrange: [{}, {}], assert: [{}, {}], clean: [{}, {}]},
    ['../test/fixtures/plugin-array.ts'],
    './filePath.js',
  )

  nodeAssert.equal(arrangeArray.mock.callCount(), 2)
  nodeAssert.equal(actArray.mock.callCount(), 1)
  nodeAssert.equal(assertArray.mock.callCount(), 2)
  nodeAssert.equal(cleanArray.mock.callCount(), 2)
})

test('It executes layers', async () => {
  await executeTestCase(
    {
      name: 'Test', 
      act: {}, 
      layers: [
        {arrange: {}, clean: {}},
        {arrange: [{}, {}], clean: [{}, {}]}
      ]
    },
    ['../test/fixtures/layers.ts'],
    './filePath.js',
  )

  nodeAssert.equal(arrangeLayers.mock.callCount(), 3)
  nodeAssert.equal(actLayers.mock.callCount(), 1)
  nodeAssert.equal(cleanLayers.mock.callCount(), 3)
})
