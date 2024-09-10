import {test} from 'node:test'
import * as network from '../src/index.js'
import {DynamoDB} from '@aws-sdk/client-dynamodb'

const client = new DynamoDB({})

test('It mocks DynamoDB calls', async () => {
  const payload = {
    TableName: 'Table',
    Item: {
      a: {S:'API_KEY_ID'}
    },
  }

  network.dynamodb(payload)

  await client.putItem(payload)
})
