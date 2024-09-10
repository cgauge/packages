import nock from 'nock'
import {partialBodyCheck} from './helpers'

const region = process.env.AWS_REGION || 'eu-west-1'
const url = `https://sns.${region}.amazonaws.com`

const snsResponse = `
  <PublishResponse xmlns="https://sns.amazonaws.com/doc/2010-03-31/">
    <PublishResult>
        <MessageId>567910cd-659e-55d4-8ccb-5aaf14679dc0</MessageId>
    </PublishResult>
    <ResponseMetadata>
        <RequestId>d74b8436-ae13-5ab4-a9ff-ce54dfea72a0</RequestId>
    </ResponseMetadata>
  </PublishResponse>
`

export const sns = (request: any, response?: any): void => {
  nock(url).post('/', partialBodyCheck(request)).reply(200, response ?? snsResponse)
}
