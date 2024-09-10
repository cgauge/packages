import nock from 'nock'
import {partialBodyCheck} from './helpers'

const region = process.env.AWS_REGION || 'eu-west-1'
const url = `https://events.${region}.amazonaws.com`

export const eventBridge = (entries: unknown[]): void => {
  nock(url)
    .post('/', partialBodyCheck({Entries: entries}))
    .reply(200, {FailedEntryCount: 0})
}

export const failEventBridge = (): void => {
  nock(url).post('/').reply(200, {FailedEntryCount: 1})
}
