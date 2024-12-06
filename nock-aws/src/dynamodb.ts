import nock from 'nock'
import {partialBodyCheck} from './helpers'

const region = process.env.AWS_REGION || 'eu-west-1'
const url = `https://dynamodb.${region}.amazonaws.com`
const streamUrl = `https://streams.dynamodb.${region}.amazonaws.com`

export const dynamodb = (request: any, response?: any): void => {
  nock(url).post('/', partialBodyCheck(request)).reply(200, response)
}

export const streamDynamodb = (request: any, response?: any): void => {
  nock(streamUrl).post('/', partialBodyCheck(request)).reply(200, response)
}

export const dynamodbFailWith = (request: any): void => {
  nock(url).post('/', partialBodyCheck(request)).reply(400)
}

export const dynamodbFail = (): void => {
  nock(url).post('/').reply(400)
}
