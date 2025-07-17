import {mock} from 'node:test'

export const arrange = mock.fn(async () => true)
export const act = mock.fn(async () => true)
export const assert = mock.fn(async () => true)
export const clean = mock.fn(async () => true)
