import {Type} from 'js-yaml'
import {faker} from '@faker-js/faker'

export const fakerType = new Type('!faker', {
  kind: 'scalar',
  construct: (data) => {
    if (!data || typeof data !== 'string') {
      throw new Error('Invalid faker data.')
    }

    const value = faker.helpers.fake(data)

    return isNaN(Number(value)) ? value : parseFloat(value)
  },
})
