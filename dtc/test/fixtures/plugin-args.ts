import {mock} from 'node:test'

export const arrange = mock.fn()
export const act = mock.fn(() => true)
export const assert = mock.fn()
export const clean = mock.fn()
