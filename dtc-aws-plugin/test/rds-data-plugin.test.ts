import {test, afterEach} from 'node:test'
import {act, arrange, assert, clean} from '../src/rds-data-plugin'
import * as network from '@cgauge/nock-aws'
import nock from 'nock'

nock.disableNetConnect()

afterEach(() => {
  network.checkForPendingMocks()
})

test('It does not arrange if type does not match', () => {
  arrange({})
})

test('It does not act if type does not match', () => {
  act({})
})

test('It does not assert if type does not match', () => {
  assert({})
})

test('It does not clean if type does not match', () => {
  clean({})
})

test('It executes a statement in RDS during arrange', async () => {
  const statement = {
    sql: 'SELECT now()',
    resourceArn: 'arn:resource',
    secretArn: 'arn:secret',
    database: 'database-name',
  }

  network.rdsData(statement)

  await arrange({rds: [statement]})
})

test('It executes a statement in RDS during act', async () => {
  const statement = {
    sql: 'SELECT now()',
    resourceArn: 'arn:resource',
    secretArn: 'arn:secret',
    database: 'database-name',
  }

  network.rdsData(statement)

  await act(statement)
})

test('It executes a statement in RDS during assert', async () => {
  const statement = {
    sql: 'SELECT now()',
    resourceArn: 'arn:resource',
    secretArn: 'arn:secret',
    database: 'database-name',
  }

  network.rdsData(statement, {$metadata: {}, formattedRecords: '[{"a": 1}]'})

  await assert({rds: [{...statement, response: [{a: 1}]}]})
})

test('It executes a statement in RDS during clean', async () => {
  const statement = {
    sql: 'SELECT now()',
    resourceArn: 'arn:resource',
    secretArn: 'arn:secret',
    database: 'database-name',
  }

  network.rdsData(statement)

  await clean({rds: [statement]})
})
