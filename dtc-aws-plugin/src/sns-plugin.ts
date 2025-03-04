import {SNS} from '@aws-sdk/client-sns'
import {info} from '@cgauge/dtc'
import {is, unknown, record, optional, union, diff} from '@cgauge/type-guard'

const SnsCall = {
  topic: String,
  message: record(String, unknown),
  messageAttributes: optional(
    record(String, {
      DataType: union(String, undefined),
      StringValue: optional(String),
    }),
  ),
}

const sns = new SNS({})

export const act = async (args: unknown): Promise<boolean> => {
  if (!is(args, SnsCall)) {
    const mismatch = diff(args, SnsCall)
    info(`SNS plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}`)
    return false
  }

  await sns.publish({
    TopicArn: args.topic,
    Message: JSON.stringify(args.message),
    MessageAttributes: args.messageAttributes,
  })

  return true
}
