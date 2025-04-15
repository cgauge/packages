import {mock} from 'node:test'

export const arrange = mock.fn(() => true)
export const act = mock.fn(() => {
    throw new Error('Act failed')
})
export const assert = mock.fn(() => true)
export const clean = mock.fn(() => true)
