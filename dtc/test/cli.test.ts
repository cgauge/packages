import {test} from 'node:test'
import {spawnSync} from 'node:child_process'
import nodeAssert from 'node:assert'
import { dirname } from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('It executes test using cli', async () => {
  const childProcess = spawnSync('npx', ['tsx', `${__dirname}/../src/cli.ts`, './test/fixtures/unit.js'], {
    stdio: 'inherit',
  })

  nodeAssert.equal(childProcess.status, 0)
})

test('It fails test using cli', async () => {
  const childProcess = spawnSync('npx', ['tsx', `${__dirname}/../src/cli.ts`, './test/fixtures/unit-fail.js'])

  nodeAssert.equal(childProcess.status, 1)
})

test('It executes all files', async () => {
  const childProcess = spawnSync('npx', ['tsx', `${__dirname}/../src/cli.ts`], {stdio: 'inherit'})

  nodeAssert.equal(childProcess.status, 0)
})
