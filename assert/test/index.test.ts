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
  let asserted  = 0

  try {
    extraAssert.objectContains(actual, expected)
  } catch (error) {
    nodeAssert.equal(error.code, 'ERR_ASSERTION')
    asserted = 1
  }
  
  nodeAssert.ok(asserted)
})

test('It fails when array does not have the same size', () => {
  const actual = [{a: 'b'}, {c: 'd'}]
  const expected = [{c: 'e'}]
  let asserted  = 0

  try {
    extraAssert.objectContains(actual, expected)
  } catch (error) {
    nodeAssert.ok(error.message.indexOf('Both actual and expected should have the same number of elements') !== -1)
    asserted = 1
  }

  nodeAssert.ok(asserted)
})
