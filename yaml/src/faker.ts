import {Type} from 'js-yaml'
import {Faker, faker} from '@faker-js/faker'

function propertyOf<T>(key: string | number | symbol, obj: T): key is keyof T {
  return obj !== null && typeof obj === 'object' && key in obj
}

type KeyOfFaker = keyof Faker

export const fakerType = new Type('!faker', {
  kind: 'scalar',
  construct: (data) => {
    if (!data || typeof data !== 'string') {
      throw new Error('Invalid faker data.')
    }

    const [command, ...args] = data.split(' ')
    const commands = command.split('.')
    const fakerCommand = commands.reduce((acc: KeyOfFaker | Faker, key) => {
      if (propertyOf(key, acc)) {
        return acc[key]
      }

      throw new Error(`Invalid faker command: ${command}`)
    }, faker) as unknown

    if (fakerCommand instanceof Function) {
      return fakerCommand(...args)
    }

    throw new Error(`Invalid faker command: ${command}`)
  },
})
