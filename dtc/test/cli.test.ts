import {test} from 'node:test'
import {spawnSync} from 'node:child_process'
import nodeAssert from 'node:assert'
import { dirname } from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('It executes based unit test using cli', async () => {
  const childProcess = spawnSync(`npx tsx ${__dirname}/../src/cli.ts ${__dirname}/fixtures/unit.js`, {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
  })

  nodeAssert.equal(childProcess.status, 0)
})

test('It executes all files', async () => {
  const childProcess = spawnSync(`npx tsx ${__dirname}/../src/cli.ts`, {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
  })

  nodeAssert.equal(childProcess.status, 0)
})
