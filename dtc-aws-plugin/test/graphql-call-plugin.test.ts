import {test} from 'node:test'
import {act, assert} from '../src/graphql-call-plugin'

test.only('It calls a graphql endpoint', async () => {
  const content = {data: {key: 'value'}}

  await act({
    url: `data:application/json,${encodeURIComponent(JSON.stringify(content))}`,
    query: `query { key }`,
    variables: {},
  })

  await assert({graphql: content})
})
