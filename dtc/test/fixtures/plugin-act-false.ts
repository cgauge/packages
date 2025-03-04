import {mock} from 'node:test'

export const arrange = mock.fn()
export const act = mock.fn(() => false)
export const assert = mock.fn()
export const clean = mock.fn()
