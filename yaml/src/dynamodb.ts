import {marshall} from '@aws-sdk/util-dynamodb'
import yaml from 'js-yaml'

export const marshallType = new yaml.Type('!marshall', {
  kind: 'mapping',
  construct: (data) => marshall(data),
})
