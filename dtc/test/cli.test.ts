import {test} from 'node:test'
import {spawnSync} from 'node:child_process'
import nodeAssert from 'node:assert'
import {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cliPath = `${__dirname}/../src/cli.ts`

test('It executes test using cli', async () => {
  const childProcess = spawnSync('npx', ['tsx', cliPath, './test/fixtures/unit.js'], {
    stdio: 'inherit',
  })

  nodeAssert.equal(childProcess.status, 0)
})

test('It fails test using cli', async () => {
  const childProcess = spawnSync('npx', ['tsx', cliPath, './test/fixtures/unit-fail.js'])

  nodeAssert.equal(childProcess.status, 1)
})

test('It executes all files', async () => {
  const childProcess = spawnSync('npx', ['tsx', cliPath], {stdio: 'inherit'})

  nodeAssert.equal(childProcess.status, 0)
})

test('dtc --help outputs usage info to stdout and exits with code 0', async () => {
  const childProcess = spawnSync('npx', ['tsx', cliPath, '--help'], {encoding: 'utf-8'})

  nodeAssert.equal(childProcess.status, 0)
  nodeAssert.ok(childProcess.stdout.includes('Usage: dtc'), 'stdout should contain usage info')
  nodeAssert.ok(childProcess.stdout.includes('--config'), 'stdout should mention --config flag')
  nodeAssert.ok(childProcess.stdout.includes('--help'), 'stdout should mention --help flag')
})

test('dtc -h outputs usage info to stdout and exits with code 0', async () => {
  const childProcess = spawnSync('npx', ['tsx', cliPath, '-h'], {encoding: 'utf-8'})

  nodeAssert.equal(childProcess.status, 0)
  nodeAssert.ok(childProcess.stdout.includes('Usage: dtc'), 'stdout should contain usage info')
  nodeAssert.ok(childProcess.stdout.includes('--config'), 'stdout should mention --config flag')
  nodeAssert.ok(childProcess.stdout.includes('--help'), 'stdout should mention --help flag')
})

test('dtc --unknown writes error to stderr, no stdout output, exits with code 1', async () => {
  const childProcess = spawnSync('npx', ['tsx', cliPath, '--unknown'], {encoding: 'utf-8'})

  nodeAssert.equal(childProcess.status, 1)
  nodeAssert.ok(childProcess.stderr.length > 0, 'stderr should contain error message')
  nodeAssert.ok(childProcess.stderr.includes('unknown'), 'stderr should mention the unknown flag')
  nodeAssert.equal(childProcess.stdout, '', 'stdout should be empty')
})

test('dtc --config without value writes error to stderr and exits with code 1', async () => {
  const childProcess = spawnSync('npx', ['tsx', cliPath, '--config'], {encoding: 'utf-8'})

  nodeAssert.equal(childProcess.status, 1)
  nodeAssert.ok(childProcess.stderr.length > 0, 'stderr should contain error message')
  nodeAssert.ok(childProcess.stderr.includes('config'), 'stderr should mention the config flag')
})
