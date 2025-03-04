import {test} from 'node:test'
import assert from 'node:assert'
import {retry} from '../src/utils'

test('It execute at least one time', async () => {
  const response = await retry(() => Promise.resolve(true))

  assert.ok(response)
})

test('It stops if it fails and there is no retry', async () => {
  const response = retry(() => Promise.reject(new Error('Bla')))

  await assert.rejects(response)
})

test('It retries when it fails', async () => {
  let times = 0
  const response = await retry(() => {
    if (times === 0) {
      times++
      return Promise.reject(new Error('Bla'))
    }
    return Promise.resolve(true)
  }, 1)

  assert.ok(response)
})
