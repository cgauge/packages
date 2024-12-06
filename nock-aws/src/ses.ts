import nock from 'nock'
import {partialBodyCheck} from './helpers'

const region = process.env.AWS_REGION || 'eu-west-1'
const url = `https://email.${region}.amazonaws.com`

const sendEmailResponse = `
  <SendEmailResponse xmlns="https://email.amazonaws.com/doc/2010-03-31/">
      <SendEmailResult>
          <MessageId>000001271b15238a-fd3ae762-2563-11df-8cd4-6d4e828a9ae8-000000</MessageId>
      </SendEmailResult>
      <ResponseMetadata>
          <RequestId>fd3ae762-2563-11df-8cd4-6d4e828a9ae8</RequestId>
      </ResponseMetadata>
  </SendEmailResponse>
`

type SesRequest = {
  Destination?: {ToAddresses?: string[]},
  Message?: {
    Body?: {Html?: {Data?: string}}
    Subject?: {Data?: string}
  }
  Source: string
}

export const ses = (request: SesRequest, response?: any): void => {
  const params = {
    Action: 'SendEmail',
    'Destination.ToAddresses.member.1': request.Destination?.ToAddresses?.[0],
    'Message.Body.Html.Charset': 'UTF-8',
    'Message.Body.Html.Data': request.Message?.Body?.Html?.Data,
    'Message.Subject.Charset': 'UTF-8',
    'Message.Subject.Data': request.Message?.Subject?.Data,
    Source: request.Source,
    Version: '2010-12-01',
  }
  nock(url)
    .post('/', partialBodyCheck(params))
    .reply(200, response ?? sendEmailResponse)
}

export const sesFail = (): void => {
  nock(url).post('/').reply(500)
}

export const sesFailWith = (request: SesRequest): void => {
  const params = {
    Action: 'SendEmail',
    'Destination.ToAddresses.member.1': request.Destination?.ToAddresses?.[0],
    'Message.Body.Html.Charset': 'UTF-8',
    'Message.Body.Html.Data': request.Message?.Body?.Html?.Data,
    'Message.Subject.Charset': 'UTF-8',
    'Message.Subject.Data': request.Message?.Subject?.Data,
    Source: request.Source,
    Version: '2010-12-01',
  }

  nock(url).post('/', partialBodyCheck(params)).reply(500)
}
