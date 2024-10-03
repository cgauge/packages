import {test, mock} from 'node:test'
import nodeAssert from 'node:assert'
import {executeTestCase} from '../src/index.js'

test('It runs plugins methods', async () => {
  const setTestRunnerArgs = mock.fn()
  const arrange = mock.fn()
  const act = mock.fn()
  const assert = mock.fn()
  const clean = mock.fn()

  const mockedPlugin = {setTestRunnerArgs, arrange, act, assert, clean}

  await executeTestCase({}, [mockedPlugin], {})

  nodeAssert.equal(setTestRunnerArgs.mock.callCount(), 1)
  nodeAssert.equal(arrange.mock.callCount(), 1)
  nodeAssert.equal(act.mock.callCount(), 1)
  nodeAssert.equal(assert.mock.callCount(), 1)
  nodeAssert.equal(clean.mock.callCount(), 1)
})

test('It pass parameters to plugins methods', async () => {
  const setTestRunnerArgs = mock.fn()
  const setBasePath = mock.fn()
  const arrange = mock.fn()
  const act = mock.fn()
  const assert = mock.fn()
  const clean = mock.fn()

  const mockedPlugin = {setTestRunnerArgs, setBasePath, arrange, act, assert, clean}

  const testCase = {
    arrange: {a: 'b'},
    act: {c: 'd'},
    assert: {e: 'f'},
    clean: {g: 'h'},
  }
  const filePath = 'path/to/file'
  const testArgs = {i: 'j'}

  await executeTestCase(testCase, [mockedPlugin], filePath, testArgs)

  nodeAssert.deepEqual(setTestRunnerArgs.mock.calls[0].arguments, [testArgs])
  nodeAssert.deepEqual(arrange.mock.calls[0].arguments, [testCase.arrange])
  nodeAssert.deepEqual(act.mock.calls[0].arguments, [testCase.act])
  nodeAssert.deepEqual(assert.mock.calls[0].arguments, [testCase.assert])
  nodeAssert.deepEqual(clean.mock.calls[0].arguments, [testCase.clean])
})

test('It ensure plugins methods are optional', async () => {
  await executeTestCase({}, [{}], '', {})

  nodeAssert.ok(true)
})
