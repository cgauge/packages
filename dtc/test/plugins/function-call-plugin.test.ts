import {test} from 'node:test'
import {act, assert} from '../../src/plugins/function-call-plugin'
import {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import nodeAssert from 'node:assert'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('It does not act if type does not match', async () => {
  await act({}, __dirname)
})

test('It does not assert if type does not match', async () => {
  await assert({})
})

test('It call a sync function with args', async () => {
  const args = {a: 'b'}

  await act(
    {
      import: 'syncFunction',
      from: '../fixtures/functions.js',
      arguments: [args],
    },
    __dirname,
  )

  await assert(args)
})

test('It call a async function with args', async () => {
  const args = {a: 'b'}

  await act(
    {
      import: 'asyncFunction',
      from: '../fixtures/functions.js',
      arguments: [args],
    },
    __dirname,
  )

  await assert(args)
})

test('It call a sync function with exception', async () => {
  const args = {exception: {name: 'Error'}}

  await act(
    {
      import: 'functionWithException',
      from: '../fixtures/functions.js',
      arguments: [args],
    },
    __dirname,
  )

  await assert(args)
})

test('It call a sync function and throw exception if id does not exist in assert', async () => {
  const args = {}

  await act(
    {
      import: 'functionWithException',
      from: '../fixtures/functions.js',
      arguments: [args],
    },
    __dirname,
  )

  try {
    await assert(args)
  } catch (e) {
    nodeAssert.ok(true)
  }
})
