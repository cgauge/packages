import nock from 'nock'
import {partialBodyCheck} from './helpers'
import {ExecuteStatementCommandInput, ExecuteStatementCommandOutput} from '@aws-sdk/client-rds-data'

const region = process.env.AWS_REGION || 'eu-west-1'
const url = `https://rds-data.${region}.amazonaws.com`

export const rdsData = (request: ExecuteStatementCommandInput, response?: ExecuteStatementCommandOutput): void => {
  nock(url)
    .post(`/Execute`, partialBodyCheck(request as unknown as Record<string, unknown>))
    .reply(200, {
      formattedRecords: '{}',
      ...response,
    })
}

export const rdsDataFailWith = (request: ExecuteStatementCommandInput): void => {
  nock(url)
    .post('/Execute', partialBodyCheck(request as unknown as Record<string, unknown>))
    .reply(400)
}

export const rdsDataFail = (): void => {
  nock(url).post(`/Execute`).reply(500)
}
