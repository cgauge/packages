import {Plugin, isRecord} from '@cgauge/dtc'
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

export class LambdaPlugin implements Plugin {
  private response?: unknown

  async arrange(args: unknown) {
    if (!isRecord(args) || !('lambda' in args)) {
      return
    }

    if (!Array.isArray(args.lambda)) {
      return
    }

    await Promise.all(args.lambda.map((v) => invokeLambda(v.functionName, v.payload)))
  }

  async act(args: unknown): Promise<void> {
    if (!isLambdaAct(args)) {
      return
    }

    this.response = await invokeLambda(args.functionName, args.payload)
  }

  async assert(args: unknown) {
    if (!isRecord(args) || !('lambda' in args)) {
      return
    }

    if (!isRecord(args.lambda)) {
      return
    }

    extraAssert.objectContains(args.lambda, this.response as Record<string, unknown>)
  }

  async clean(args: unknown) {
    if (!isRecord(args) || !('lambda' in args)) {
      return
    }

    if (!Array.isArray(args.lambda)) {
      return
    }

    await Promise.all(args.lambda.map((v) => invokeLambda(v.functionName, v.payload)))
  }
}
