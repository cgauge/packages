import nock from 'nock'
import {partialBodyCheck} from './helpers'

const region = process.env.AWS_REGION || 'eu-west-1'
const url = `https://lambda.${region}.amazonaws.com`

const lambdaAsyncResponse = {
  $metadata: {
    httpStatusCode: 202,
    requestId: '4be1d6d6-8bd0-468c-b220-dd488618358e',
    attempts: 1,
    totalRetryDelay: 0,
  },
  Status: 202,
}

type LambdaRequest = {
  FunctionName: string
  InvokeArgs?: any
}

export const lambdaAsync = (request: LambdaRequest, response?: any): void => {
  nock(url)
    .post(
      `/2014-11-13/functions/${request.FunctionName || ''}/invoke-async`,
      partialBodyCheck({
        ...JSON.parse(request.InvokeArgs?.toString() || ''),
      }),
    )
    .reply(200, response ?? lambdaAsyncResponse)
}

export const failLambdaAsync = (request: LambdaRequest): void => {
  nock(url)
    .post(`/2014-11-13/functions/${request.FunctionName || ''}/invoke-async`)
    .reply(500)
}
