import {isRecord, debug} from '@cgauge/dtc'
import {DynamoDB, AttributeValue} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import extraAssert from '@cgauge/assert'
import nodeAssert from 'node:assert'

type DynamoArrange = {
  table: string
  item: Record<string, unknown>
}

type DynamoAct = DynamoArrange

type DynamoAssert = {
  table: string
  key: Record<string, unknown>
  item: Record<string, unknown>
}

export type CleanDynamoDBDelete = {
  table: string
  key: Record<string, unknown>
}

export type CleanDynamoDBQuery = {
  table: string
  index?: string
  query: Record<string, unknown>
  keys: string[]
}

export type DynamoClean = CleanDynamoDBDelete | CleanDynamoDBQuery

const documentClient = DynamoDBDocument.from(new DynamoDB({}))

const isDynamoAct = (v: unknown): v is DynamoAct => isRecord(v) && 'table' in v && 'item' in v
const isDynamoArrange = (v: unknown): v is {dynamodb: DynamoArrange[]} => isRecord(v) && 'dynamodb' in v
const isDynamoAssert = (v: unknown): v is {dynamodb: DynamoAssert[]} => isRecord(v) && 'dynamodb' in v
const isDynamoClean = (v: unknown): v is {dynamodb: DynamoClean[]} => isRecord(v) && 'dynamodb' in v

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
  if (!isDynamoArrange(args) || !Array.isArray(args.dynamodb)) {
    return
  }

  await Promise.all(args.dynamodb.map(executeDynamoStatement))
}

export const act = async (args: unknown) => {
  if (!isDynamoAct(args)) {
    return
  }

  await documentClient.put({TableName: args.table, Item: args.item})
}

export const assert = async (args: unknown) => {
  if (!isDynamoAssert(args) || !Array.isArray(args.dynamodb)) {
    return
  }

  await Promise.all(args.dynamodb.map(assertExists))
}

export const clean = async (args: unknown) => {
  if (!isDynamoClean(args) || !Array.isArray(args.dynamodb)) {
    return
  }

  await Promise.all(args.dynamodb.map(cleanDynamoItems))
}
