import {Lambda} from '@aws-sdk/client-lambda'
import extraAssert from '@cgauge/assert'
import {info} from '@cgauge/dtc'
import {is, unknown, record, diff} from '@cgauge/type-guard'

const LambdaCall = {
  functionName: String,
  payload: record(String, unknown),
}

const lambda = new Lambda({})

export const invokeLambda = async (functionName: string, event: unknown): Promise<any> => {
  const response = await lambda.invoke({
    FunctionName: functionName,
    Payload: Buffer.from(JSON.stringify(event)),
  })

  const payload = new TextDecoder('utf-8').decode(response.Payload)

  return JSON.parse(payload)
}

let response: any

export const arrange = async (args: unknown) => {
  if (!is(args, {lambda: [LambdaCall]})) {
    return
  }

  await Promise.all(args.lambda.map((v) => invokeLambda(v.functionName, v.payload)))
}

export const act = async (args: unknown) => {
  response = undefined

  if (!is(args, LambdaCall)) {
    const mismatch = diff(args, LambdaCall)
    info(`Lambda plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}\n`)
    return
  }

  response = await invokeLambda(args.functionName, args.payload)
}

export const assert = async (args: unknown) => {
  if (!is(args, {lambda: record(String, unknown)})) {
    return
  }

  extraAssert.objectContains(args.lambda, response)
}

export const clean = async (args: unknown) => {
  if (!is(args, {lambda: [LambdaCall]})) {
    return
  }

  await Promise.all(args.lambda.map((v) => invokeLambda(v.functionName, v.payload)))
}
