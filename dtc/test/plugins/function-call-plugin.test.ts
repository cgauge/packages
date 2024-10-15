import {test} from 'node:test'
import {act, assert} from '../../src/plugins/function-call-plugin'
import {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('It call a sync function without args', async () => {
  await act({
    import: 'noArgs',
    from: '../fixtures/functions.js',
  }, __dirname)

  assert(true)
})

test('It call a sync function with args', async () => {
  const args = {a: 'b'}

  await act({
    import: 'syncFunction',
    from: '../fixtures/functions.js',
    arguments: [args],
  }, __dirname)

  assert(args)
})

test('It call a async function with args', async () => {
  const args = {a: 'b'}

  await act({
    import: 'asyncFunction',
    from: '../fixtures/functions.js',
    arguments: [args],
  }, __dirname)

  assert(args)
})
