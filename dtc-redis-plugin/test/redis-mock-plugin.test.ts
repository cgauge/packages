import {test} from 'node:test'
import nodeAssert from 'node:assert'
import {arrange} from '../src/redis-mock-plugin'
import {Redis} from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  lazyConnect: true,
})

test('It does not arrange if type does not match', () => {
  arrange({})
})

test('It mocks redis get call', async () => {
  const key = 'test-key'
  const value = 'test-value'

  arrange({
    redis: [{command: 'set', key, value}],
  })

  nodeAssert.strictEqual(await redis.get(key), value)
})
