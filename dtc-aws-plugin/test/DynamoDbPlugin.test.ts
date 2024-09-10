import {test, afterEach} from 'node:test'
import {DynamoDbPlugin} from '../src/DynamoDbPlugin'
import * as network from '@cgauge/nock-aws'
import {marshall} from '@aws-sdk/util-dynamodb'
import nock from 'nock'

nock.disableNetConnect()

afterEach(() => {network.checkForPendingMocks()})

test('It executes put item during arrange', async () => {
  const dynamoDbPlugin = new DynamoDbPlugin()
  const item = {table: 'table', item: {a: 'b'}}

  network.dynamodb({TableName: item.table, Item: marshall(item.item)})

  await dynamoDbPlugin.arrange({dynamodb: [item]})
})

test('It executes put item during act', async () => {
  const dynamoDbPlugin = new DynamoDbPlugin()
  const item = {table: 'table', item: {a: 'b'}}

  network.dynamodb({TableName: item.table, Item: marshall(item.item)})

  await dynamoDbPlugin.act(item)
})

test('It gets item during assert', async () => {
  const dynamoDbPlugin = new DynamoDbPlugin()
  const key = {a: 'b'}
  const item = {table: 'table', key, item: {c: 'd'}}

  network.dynamodb({TableName: item.table, Key: marshall(key)}, {Item: marshall(item.item)})

  await dynamoDbPlugin.assert({dynamodb: [item]})
})

test('It deletes item during clean', async () => {
  const dynamoDbPlugin = new DynamoDbPlugin()
  const key = {a: 'b'}
  const item = {table: 'table', key}

  network.dynamodb({TableName: item.table, Key: marshall(key)})

  await dynamoDbPlugin.clean({dynamodb: [item]})
})

test('It deletes all items returned in query during clean', async () => {
  const dynamoDbPlugin = new DynamoDbPlugin()
  const key1 = {a: 'b'}
  const key2 = {a: 'd'}
  const query = {table: 'table', query: {a: 'b'}, keys: ['a']}

  network.dynamodb({
    TableName: query.table, 
    KeyConditionExpression: `#a = :a`,
    ExpressionAttributeNames: {'#a': 'a'},
    ExpressionAttributeValues: marshall({':a': 'b'}),
  }, {Items: [marshall(key1), marshall(key2)]})

  network.dynamodb({TableName: query.table, Key: marshall(key1)})

  network.dynamodb({TableName: query.table, Key: marshall(key2)})

  await dynamoDbPlugin.clean({dynamodb: [query]})
})
