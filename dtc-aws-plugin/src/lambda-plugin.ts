import {isRecord} from '@cgauge/dtc'
import {Lambda} from '@aws-sdk/client-lambda'
import extraAssert from '@cgauge/assert'

type LambdaCall = {
  functionName: string
  payload: Record<string, unknown>
}

const isLambdaAct = (v: unknown): v is LambdaCall => isRecord(v) && 'functionName' in v && 'payload' in v

const lambda = new Lambda({})

export const invokeLambda = async (functionName: string, event: unknown): Promise<any> => {
  const response = await lambda.invoke({
    FunctionName: functionName,
    Payload: Buffer.from(JSON.stringify(event)),
  })

  const payload = new TextDecoder('utf-8').decode(response.Payload)

  return JSON.parse(payload)
}

let response: unknown | undefined

export const arrange = async (args: unknown) => {
  if (!isRecord(args) || !('lambda' in args)) {
    return
  }

  if (!Array.isArray(args.lambda)) {
    return
  }

  await Promise.all(args.lambda.map((v) => invokeLambda(v.functionName, v.payload)))
}

export const act = async (args: unknown) => {
  if (!isLambdaAct(args)) {
    return
  }

  response = await invokeLambda(args.functionName, args.payload)
}

export const assert = async (args: unknown) => {
  if (!isRecord(args) || !('lambda' in args)) {
    return
  }

  if (!isRecord(args.lambda)) {
    return
  }

  extraAssert.objectContains(args.lambda, response as Record<string, unknown>)
}

export const clean = async (args: unknown) => {
  if (!isRecord(args) || !('lambda' in args)) {
    return
  }

  if (!Array.isArray(args.lambda)) {
    return
  }

  await Promise.all(args.lambda.map((v) => invokeLambda(v.functionName, v.payload)))
}
