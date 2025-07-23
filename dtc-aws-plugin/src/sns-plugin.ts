import {SNS} from '@aws-sdk/client-sns'
import {is, unknown, record, optional, union, diff} from '@cgauge/type-guard'
import createLogger from '@cgauge/log'

const logger = createLogger('dtc:sns');

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
    logger.info(`(SNS) Plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}`)
    return false
  }

  await sns.publish({
    TopicArn: args.topic,
    Message: JSON.stringify(args.message),
    MessageAttributes: args.messageAttributes,
  })

  return true
}
