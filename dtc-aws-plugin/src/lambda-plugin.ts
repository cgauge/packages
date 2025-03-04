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

export const arrange = async (args: unknown): Promise<boolean> => {
  if (!is(args, {lambda: [LambdaCall]})) {
    return false
  }

  await Promise.all(args.lambda.map((v) => invokeLambda(v.functionName, v.payload)))

  return true
}

export const act = async (args: unknown): Promise<boolean> => {
  response = undefined

  if (!is(args, LambdaCall)) {
    const mismatch = diff(args, LambdaCall)
    info(`Lambda plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}`)
    return false
  }

  response = await invokeLambda(args.functionName, args.payload)

  return true
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
