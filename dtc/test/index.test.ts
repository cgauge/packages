import {test} from 'node:test'
import nodeAssert from 'node:assert'
import {executeTestCase} from '../src/index.js'
import {arrange, act, assert, clean} from './fixtures/plugin.ts'
import {arrange as arrangeArgs, act as actArgs, assert as assertArgs, clean as cleanArgs} from './fixtures/plugin-args.ts'

test('It runs plugins methods', async () => {
  await executeTestCase({name: 'Test'}, ['../test/fixtures/plugin.ts'], './filePath.js')

  nodeAssert.equal(arrange.mock.callCount(), 1)
  nodeAssert.equal(act.mock.callCount(), 1)
  nodeAssert.equal(assert.mock.callCount(), 1)
  nodeAssert.equal(clean.mock.callCount(), 1)
})

test('It pass parameters to plugins functions', async () => {
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

test('It ensure plugins methods are optional', async () => {
  await executeTestCase({name: 'Test'}, ['../test/fixtures/blank-plugin.ts'], '', {})

  nodeAssert.ok(true)
})
