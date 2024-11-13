import extraAssert from '@cgauge/assert'
import {isRecord} from '@cgauge/dtc'
import {GraphQLClient} from 'graphql-request'

type GraphQlCall = {url: string; query: string; variables: {}} & RequestInit

const isGraphQlCall = (v: unknown): v is GraphQlCall => isRecord(v) && 'url' in v

let response: Response

export const act = async (args: unknown) => {
  if (!isGraphQlCall(args)) {
    return
  }

  const graphQLClient = new GraphQLClient(args.url, {
    headers: {authorization: process.env.AUTHORIZATION_TOKEN as string},
  })

  response = await graphQLClient.request(args.query, args.variables)
  console.log(response)
}

export const assert = async (args: unknown) => {
  if (!isRecord(args)) {
    return
  }

  if (!args.graphql) {
    return
  }

  extraAssert.objectContains(response, args.graphql)
}
