import {Lambda} from '@aws-sdk/client-lambda'
import extraAssert from '@cgauge/assert'
import {is, unknown, record, diff} from '@cgauge/type-guard'
import createLogger from '@cgauge/log'

const logger = createLogger('dtc:lambda');

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
  if (!('lambda' in (args as any))) {
    return false
  }

  if (!is(args, {lambda: [LambdaCall]})) {
    const mismatch = diff(args, {lambda: [LambdaCall]})
    throw new Error(`(Lambda) Invalid argument on arrange: ${mismatch[0]}`)
  }

  await Promise.all(args.lambda.map((v) => invokeLambda(v.functionName, v.payload)))

  return true
}

export const act = async (args: unknown): Promise<boolean> => {
  response = undefined

  if (!is(args, LambdaCall)) {
    const mismatch = diff(args, LambdaCall)
    logger.info(`Plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}`)
    return false
  }

  response = await invokeLambda(args.functionName, args.payload)

  return true
}

export const assert = async (args: unknown) => {
  if (!('lambda' in (args as any))) {
    return false
  }

  if (!is(args, {lambda: record(String, unknown)})) {
    const mismatch = diff(args, {lambda: record(String, unknown)})
    throw new Error(`(Lambda) Invalid argument on assert: ${mismatch[0]}`)
  }

  extraAssert.objectContains(args.lambda, response)

  return true
}

export const clean = async (args: unknown) => {
  if (!('lambda' in (args as any))) {
    return false
  }

  if (!is(args, {lambda: [LambdaCall]})) {
    const mismatch = diff(args, {lambda: [LambdaCall]})
    throw new Error(`(Lambda) Invalid argument on clean: ${mismatch[0]}`)
  }

  await Promise.all(args.lambda.map((v) => invokeLambda(v.functionName, v.payload)))

  return true
}
