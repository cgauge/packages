import {mock} from 'node:test'

export const arrange = mock.fn(() => true)
export const act = mock.fn(() => true)
export const assert = mock.fn((data) => {
  if (assert.mock.callCount() < 2) {
    throw new Error('Failing assertion')
  }
  return true
})
export const clean = mock.fn(() => true) 