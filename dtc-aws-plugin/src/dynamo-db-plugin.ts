import {DynamoDB, AttributeValue} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import extraAssert from '@cgauge/assert'
import nodeAssert from 'node:assert'
import {is, optional, unknown, record, diff, TypeFromSchema, union} from '@cgauge/type-guard'
import createLogger from '@cgauge/log'

const logger = createLogger('dtc:dynamodb');

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
  logger.debug(`Arrange Table: ${statement.table}`)
  logger.debug(`Arrange Item: ${JSON.stringify(statement.item)}`)

  await documentClient.put({TableName: statement.table, Item: statement.item})
}

export const assertExists = async (statement: DynamoAssert): Promise<void> => {
  logger.debug(`Assert Table: ${statement.table}`)
  logger.debug(`Assert Item: ${JSON.stringify(statement.item)}`)

  const getItemResponse = await documentClient.get({
    TableName: statement.table,
    Key: statement.key,
    ConsistentRead: true,
  })

  if (!getItemResponse.Item) {
    nodeAssert.fail('(DynamoDB) Item not found')
  }

  extraAssert.objectContains(getItemResponse.Item, statement.item)
}

const cleanDynamoItems = async (clean: DynamoClean) => {
  logger.debug(`Clean Table: ${clean.table}`)

  if ('key' in clean) {
    logger.debug(`Clean Key: ${JSON.stringify(clean.key)}`)

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
      logger.debug(`Clean Item: ${JSON.stringify(item)}`)

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
  if (!('dynamodb' in (args as any))) {
    return false
  }

  if (!is(args, {dynamodb: [DynamoArrange]})) {
    const mismatch = diff(args, {dynamodb: [DynamoArrange]})
    throw new Error(`(DynamoDB) Invalid argument on arrange: ${mismatch[0]}`)
  }

  await Promise.all(args.dynamodb.map(executeDynamoStatement))

  return true
}

export const act = async (args: unknown): Promise<boolean> => {
  if (!is(args, DynamoAct)) {
    const mismatch = diff(args, DynamoAct)
    logger.info(`Plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}`)
    return false
  }

  await documentClient.put({TableName: args.table, Item: args.item})

  return true
}

export const assert = async (args: unknown): Promise<boolean> => {
  if (!('dynamodb' in (args as any))) {
    return false
  }

  if (!is(args, {dynamodb: [DynamoAssert]})) {
    const mismatch = diff(args, {dynamodb: [DynamoAssert]})
    throw new Error(`(DynamoDB) Invalid argument on assert: ${mismatch[0]}`)
  }

  await Promise.all(args.dynamodb.map(assertExists))

  return true
}

export const clean = async (args: unknown) => {
  if (!('dynamodb' in (args as any))) {
    return false
  }

  if (!is(args, {dynamodb: [DynamoClean]})) {
    const mismatch = diff(args, {dynamodb: [DynamoClean]})
    throw new Error(`(DynamoDB) Invalid argument on clean: ${mismatch[0]}`)
  }

  await Promise.all(args.dynamodb.map(cleanDynamoItems))

  return true
}
