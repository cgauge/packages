import {test} from 'node:test'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

test('It logs a message', async (t) => {
  const app = spawnSync('npx', ['tsx', `${__dirname}/fixtures/log.ts`], {
    env: {...process.env, NODE_DEBUG: 'test', LOG_LEVEL: 'debug'},
  })
  const output = app.stderr?.toString()
  
  t.assert.match(output, /DEBUG/)
  t.assert.match(output, /message/)
})

test('It does not log a message without a namespace', async (t) => {
  const app = spawnSync('npx', ['tsx', `${__dirname}/fixtures/no-log-namespace.ts`])
  const output = app.stderr?.toString()

  t.assert.equal(output, '')
})

test('It does not log a message with lower level', async (t) => {
  const app = spawnSync('npx', ['tsx', `${__dirname}/fixtures/no-log-level.ts`], {
    env: {...process.env, NODE_DEBUG: 'test', LOG_LEVEL: 'info'},
  })
  const output = app.stderr?.toString()

  t.assert.equal(output, '')
})
