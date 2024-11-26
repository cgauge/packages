import {EventBridge} from '@aws-sdk/client-eventbridge'
import {info} from '@cgauge/dtc'
import {is, unknown, record, diff} from '@cgauge/type-guard'

const EventBridgeAct = {
  eventBus: String,
  source: String,
  eventType: String,
  event: record(String, unknown),
}

const eventBridge = new EventBridge({})

export const act = async (args: unknown) => {
  if (!is(args, EventBridgeAct)) {
    const mismatch = diff(args, EventBridgeAct)
    info(`EventBridge plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}\n`)
    return
  }

  await eventBridge.putEvents({
    Entries: [
      {
        Time: new Date(),
        EventBusName: args.eventBus,
        Source: args.source,
        DetailType: args.eventType,
        Detail: JSON.stringify(args.event),
      },
    ],
  })
}
