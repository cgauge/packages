import {describe, it} from 'node:test'
import {spawnSync} from 'node:child_process'
import nodeAssert from 'node:assert'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cliPath = join(__dirname, '..', 'src', 'cli.ts')
const dtcRoot = join(__dirname, '..')

describe('glob pattern integration', () => {
  it('exits with warning when glob matches zero files', () => {
    const result = spawnSync('npx', ['tsx', cliPath, 'test/fixtures/nonexistent-*.dtc.ts'], {
      encoding: 'utf-8',
      cwd: dtcRoot,
      env: {...process.env, NODE_DEBUG: 'dtc'},
    })

    nodeAssert.equal(result.status, 1)
    nodeAssert.ok(
      result.stderr.includes('No test cases found'),
      `Expected stderr to include "No test cases found", got: ${result.stderr}`,
    )
  })

  it('passes runner arguments through when combined with glob pattern', () => {
    const result = spawnSync('npx', ['tsx', cliPath, 'test/fixtures/t*.dtc.ts', '--', '--some-arg', 'value'], {
      encoding: 'utf-8',
      cwd: dtcRoot,
    })

    nodeAssert.equal(result.status, 0, `Expected exit code 0, got ${result.status}. stderr: ${result.stderr}`)
  })

  it('resolves config before glob files are loaded', () => {
    const result = spawnSync(
      'npx',
      ['tsx', cliPath, '--config', 'test/fixtures/dtc.config.ts', 'test/fixtures/t*.dtc.ts'],
      {
        encoding: 'utf-8',
        cwd: dtcRoot,
      },
    )

    // Config is resolved first — the glob pattern still works with the configured loader/plugins
    nodeAssert.equal(result.status, 0, `Expected exit code 0, got ${result.status}. stderr: ${result.stderr}`)
  })

  it('loads multiple .dtc.ts fixture files via a glob pattern', () => {
    const result = spawnSync('npx', ['tsx', cliPath, 'test/fixtures/t*.dtc.ts'], {
      encoding: 'utf-8',
      cwd: dtcRoot,
    })

    nodeAssert.equal(result.status, 0, `Expected exit code 0, got ${result.status}. stderr: ${result.stderr}`)
    nodeAssert.ok(result.stdout.includes('Test 1'), 'Expected output to include Test 1')
    nodeAssert.ok(result.stdout.includes('Test 2'), 'Expected output to include Test 2')
    nodeAssert.ok(result.stdout.includes('Test 4'), 'Expected output to include Test 4')
  })
})
