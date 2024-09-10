import nock from 'nock'
import {partialBodyCheck} from './helpers'

const region = process.env.AWS_REGION || 'eu-west-1'
const url = `https://translate.${region}.amazonaws.com`

export const translate = (request: any, response: any): void => {
  nock(url).post('/', partialBodyCheck(request)).reply(200, response)
}
