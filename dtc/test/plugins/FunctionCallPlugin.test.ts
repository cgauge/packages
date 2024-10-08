import {test} from 'node:test'
import {FunctionCallPlugin} from '../../src/plugins/FunctionCallPlugin'
import {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('It call a sync function without args', async () => {
  const functionCallPlugin = new FunctionCallPlugin(__dirname)

  await functionCallPlugin.act({
    import: 'noArgs',
    from: '../fixtures/functions.js',
  })

  functionCallPlugin.assert(true)
})

test('It call a sync function with args', async () => {
  const functionCallPlugin = new FunctionCallPlugin(__dirname)
  const args = {a: 'b'}

  await functionCallPlugin.act({
    import: 'syncFunction',
    from: '../fixtures/functions.js',
    arguments: [args],
  })

  functionCallPlugin.assert(args)
})

test('It call a async function with args', async () => {
  const functionCallPlugin = new FunctionCallPlugin(__dirname)
  const args = {a: 'b'}

  await functionCallPlugin.act({
    import: 'asyncFunction',
    from: '../fixtures/functions.js',
    arguments: [args],
  })

  functionCallPlugin.assert(args)
})
