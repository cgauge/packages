import {debug, info} from '@cgauge/dtc'
import {DynamoDB, AttributeValue} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import extraAssert from '@cgauge/assert'
import nodeAssert from 'node:assert'
import {is, optional, unknown, record, diff, TypeFromSchema, union} from 'type-assurance'

const DynamoArrange = {
  table: String,
  item: record(String, unknown),
}
type DynamoArrange = TypeFromSchema<typeof DynamoArrange>

const DynamoAct = DynamoArrange
type DynamoAct = TypeFromSchema<typeof DynamoAct>

const DynamoAssert = {
  table: String,
  key: record(String, unknown),
  item: record(String, unknown),
}
type DynamoAssert = TypeFromSchema<typeof DynamoAssert>

const CleanDynamoDBDelete = {
  table: String,
  key: record(String, unknown),
}

const CleanDynamoDBQuery = {
  table: String,
  index: optional(String),
  query: record(String, unknown),
  keys: [String],
}

const DynamoClean = union(CleanDynamoDBDelete, CleanDynamoDBQuery)
type DynamoClean = TypeFromSchema<typeof DynamoClean>

const documentClient = DynamoDBDocument.from(new DynamoDB({}))

const executeDynamoStatement = async (statement: DynamoArrange) => {
  debug(`  [Arrange] Table: ${statement.table}\n`)
  debug(`  [Arrange] Item: ${JSON.stringify(statement.item)}\n`)

  await documentClient.put({TableName: statement.table, Item: statement.item})
}

export const assertExists = async (statement: DynamoAssert): Promise<void> => {
  debug(`  [Assert] Table: ${statement.table}\n`)
  debug(`  [Assert] Item: ${JSON.stringify(statement.item)}\n`)

  const getItemResponse = await documentClient.get({
    TableName: statement.table,
    Key: statement.key,
    ConsistentRead: true,
  })

  if (!getItemResponse.Item) {
    nodeAssert.fail('Item not found.')
  }

  extraAssert.objectContains(getItemResponse.Item, statement.item)
}

const cleanDynamoItems = async (clean: DynamoClean) => {
  debug(`  [Clean] Table: ${clean.table}\n`)

  if ('key' in clean) {
    debug(`  [Clean] Key: ${JSON.stringify(clean.key)}\n`)

    await documentClient.delete({
      TableName: clean.table,
      Key: clean.key,
    })
  }

  if ('query' in clean) {
    const result = await documentClient.query({
      ConsistentRead: clean.index ? false : true,
      TableName: clean.table,
      IndexName: clean.index,
      KeyConditionExpression: Object.entries(clean.query)
        .map(([key]) => `#${key} = :${key}`)
        .join(' AND '),
      ExpressionAttributeNames: Object.fromEntries(Object.entries(clean.query).map(([key]) => [`#${key}`, key])),
      ExpressionAttributeValues: Object.fromEntries(
        Object.entries(clean.query).map(([key, value]) => [`:${key}`, value]),
      ),
    })

    for (const item of result.Items || []) {
      debug(`  [Clean] Item: ${JSON.stringify(item)}\n`)

      const key: Record<string, AttributeValue> = {}

      for (const keyName of clean.keys) {
        key[keyName] = item[keyName]
      }

      await documentClient.delete({
        TableName: clean.table,
        Key: key,
      })
    }
  }
}

export const arrange = async (args: unknown) => {
  if (!is(args, {dynamodb: [DynamoArrange]})) {
    return
  }

  await Promise.all(args.dynamodb.map(executeDynamoStatement))
}

export const act = async (args: unknown) => {
  if (!is(args, DynamoAct)) {
    const mismatch = diff(args, DynamoAct)
    info(`DynamoDB plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}\n`)
    return
  }

  await documentClient.put({TableName: args.table, Item: args.item})
}

export const assert = async (args: unknown) => {
  if (!is(args, {dynamodb: [DynamoAssert]})) {
    return
  }

  await Promise.all(args.dynamodb.map(assertExists))
}

export const clean = async (args: unknown) => {
  if (!is(args, {dynamodb: [DynamoClean]})) {
    return
  }

  await Promise.all(args.dynamodb.map(cleanDynamoItems))
}
