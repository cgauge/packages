import {Plugin, isRecord} from '@cgauge/dtc'
import {EventBridge} from '@aws-sdk/client-eventbridge'

type EventBridgeCall = {
  eventBus: string
  source: string
  eventType: string
  event: Record<string, unknown>
}

const isEventBridgeAct = (v: unknown): v is EventBridgeCall =>
  isRecord(v) && 'eventBus' in v && 'source' in v && 'eventType' in v && 'event' in v

const eventBridge = new EventBridge({})

export class EventBridgePlugin implements Plugin {
  async act(args: unknown): Promise<void> {
    if (!isEventBridgeAct(args)) {
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
}
