import extraAssert from '@cgauge/assert'
import { info } from '@cgauge/dtc'
import {GraphQLClient} from 'graphql-request'
import {is, record, diff, optional, unknown} from 'type-assurance'

const GraphQlCall = {
  url: String,
  query: String,
  variables: optional(record(String, unknown)),
  headers: optional(record(String, String)),
}

let response: any

export const act = async (args: unknown) => {
  response = undefined
  
  if (!is(args, GraphQlCall)) {
    const mismatch = diff(args, GraphQlCall)
    info(`GraphQL plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}\n`)
    return
  }

  const graphQLClient = new GraphQLClient(args.url, args)

  response = await graphQLClient.request(args.query, args.variables)
}

export const assert = async (args: unknown) => {
  if (!is(args, {graphql: GraphQlCall})) {
    return
  }

  extraAssert.objectContains(response, args.graphql)
}
