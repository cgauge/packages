import {Plugin, isRecord} from '@cgauge/dtc'
import {MessageAttributeValue, SNS} from '@aws-sdk/client-sns'

type SnsCall = {
  topic: string
  message: Record<string, unknown>
  messageAttributes?: Record<string, MessageAttributeValue>
}

const isSnsAct = (v: unknown): v is SnsCall => isRecord(v) && 'topic' in v && 'message' in v

const sns = new SNS({})

export class SnsPlugin implements Plugin {
  async act(args: unknown): Promise<void> {
    if (!isSnsAct(args)) {
      return
    }

    await sns.publish({
      TopicArn: args.topic,
      Message: JSON.stringify(args.message),
      MessageAttributes: args.messageAttributes,
    })
  }
}
