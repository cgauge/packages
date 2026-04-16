import {mock} from 'node:test'

export const arrange = mock.fn(async () => {
  if (arrange.mock.callCount() === 0) {
    return [
      'arrange output 1',
      'arrange output 2',
    ]
  }
  
  return true
})

export const act = mock.fn(async () => 'act output')
export const assert = mock.fn(async () => true)
export const clean = mock.fn(async () => true)

