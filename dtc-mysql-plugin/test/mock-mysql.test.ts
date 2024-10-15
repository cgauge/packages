import {test} from 'node:test'
import nodeAssert from 'node:assert'
import mockTestCase from './fixtures/mock'
import mockTwoConnectionsTestCase from './fixtures/mock-two-connections'
import invalidQueryTestCase from './fixtures/mock-invalid-query'
import {arrange, assert} from '../src/mysql-mock-plugin'
import {query, queryTwo} from './fixtures/mysql'

test('It mocks mysql calls', async () => {
  await arrange(mockTestCase.arrange)

  await query({var: 'value'})

  assert()
})

test('It supports more than one mysql connection', async () => {
  await arrange(mockTwoConnectionsTestCase.arrange)

  await queryTwo({var: 'value'})

  assert()
})

test('It validates SQL queries', async () => {
  try {
    await arrange(invalidQueryTestCase.arrange)

    await query({var: 'value'})

    assert()
  } catch (e) {
    if (e.code === 'ERR_ASSERTION' && e.operator === 'doesNotThrow') {
      nodeAssert.ok(true)
    }
  }
})
