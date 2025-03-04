import extraAssert from '@cgauge/assert'
import {info} from '@cgauge/dtc'
import {GraphQLClient} from 'graphql-request'
import nodeAssert from 'node:assert'
import {is, record, diff, optional, unknown, intersection} from '@cgauge/type-guard'

const GraphQlCall = {
  url: String,
  query: String,
  variables: optional(record(String, unknown)),
  headers: optional(record(String, String)),
}

const GraphQlCallResponse = intersection({exception: optional({name: String})}, {graphql: record(String, unknown)})

let response: any
let exception: any

export const act = async (args: unknown): Promise<boolean> => {
  response = undefined
  exception = undefined

  if (!is(args, GraphQlCall)) {
    const mismatch = diff(args, GraphQlCall)
    info(`GraphQL plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}`)
    return false
  }

  const graphQLClient = new GraphQLClient(args.url, args)

  try {
    response = await graphQLClient.request(args.query, args.variables)
  } catch (e) {
    exception = e
  }

  return true
}

export const assert = async (args: unknown) => {
  if (!is(args, GraphQlCallResponse)) {
    return
  }

  if (args.exception) {
    if (!exception) {
      throw Error(`Exception ${exception.name} was not thrown.`)
    }

    nodeAssert.equal(args.exception.name, exception.name)
  } else {
    if (exception) {
      throw exception
    }
  }

  extraAssert.objectContains(response, args.graphql)
}
