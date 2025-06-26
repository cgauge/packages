import {test} from 'node:test'
import nodeAssert from 'node:assert'
import {arrange} from '../src/redis-mock-plugin'

test('It mocks redis calls', async () => {
  await arrange({})


})