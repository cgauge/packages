import {test} from 'node:test'
import assert from 'node:assert'
import {parseCliArgs} from '../src/args.js'

test('No arguments returns all undefined/empty defaults', () => {
  const result = parseCliArgs([])

  assert.deepStrictEqual(result, {
    configPath: undefined,
    filePath: undefined,
    runnerArgs: [],
    help: false,
  })
})

test('--config flag returns configPath', () => {
  const result = parseCliArgs(['--config', 'path.js'])

  assert.strictEqual(result.configPath, 'path.js')
})

test('-c short alias returns configPath', () => {
  const result = parseCliArgs(['-c', 'path.js'])

  assert.strictEqual(result.configPath, 'path.js')
})

test('Positional argument returns filePath', () => {
  const result = parseCliArgs(['file.ts'])

  assert.strictEqual(result.filePath, 'file.ts')
})

test('Positional and --config returns both independently', () => {
  const result = parseCliArgs(['file.ts', '--config', 'c.js'])

  assert.strictEqual(result.filePath, 'file.ts')
  assert.strictEqual(result.configPath, 'c.js')
})

test('-- separator collects runner args', () => {
  const result = parseCliArgs(['--', 'a', 'b'])

  assert.deepStrictEqual(result.runnerArgs, ['a', 'b'])
})

test('filePath and -- separator returns both correctly', () => {
  const result = parseCliArgs(['file.ts', '--', 'a'])

  assert.strictEqual(result.filePath, 'file.ts')
  assert.deepStrictEqual(result.runnerArgs, ['a'])
})

test('--help returns help: true', () => {
  const result = parseCliArgs(['--help'])

  assert.strictEqual(result.help, true)
})

test('-h returns help: true', () => {
  const result = parseCliArgs(['-h'])

  assert.strictEqual(result.help, true)
})

test('--config without value throws error', () => {
  assert.throws(() => parseCliArgs(['--config']))
})

test('--unknown flag throws error containing the flag name', () => {
  assert.throws(
    () => parseCliArgs(['--unknown']),
    (err: Error) => {
      assert.ok(err.message.includes('unknown'), `Expected error message to include "unknown", got: ${err.message}`)
      return true
    },
  )
})
