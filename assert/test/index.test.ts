import {test} from 'node:test'
import extraAssert from '../src/index.js'
import nodeAssert from 'node:assert'

test('It partially check object properties', () => {
  const actual = {a: 'b', c: 'd'}
  const expected = {c: 'd'}

  extraAssert.objectContains(actual, expected)
})

test('It fails when object properties does not match', () => {
  const actual = {a: 'b', c: 'd'}
  const expected = {c: 'e'}

  try {
    extraAssert.objectContains(actual, expected)
  } catch (error) {
    nodeAssert.equal(error.code, 'ERR_ASSERTION')
  }
})
