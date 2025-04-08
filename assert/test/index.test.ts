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
  let asserted = 0

  try {
    extraAssert.objectContains(actual, expected)
  } catch (error) {
    nodeAssert.equal(error.message, 'Invalid key [c]')
    nodeAssert.equal(error.code, 'ERR_ASSERTION')
    asserted = 1
  }

  nodeAssert.ok(asserted)
})

test('It fails when array does not have the same size', () => {
  const actual = [{a: 'b'}, {c: 'd'}]
  const expected = [{c: 'e'}]
  let asserted = 0

  try {
    extraAssert.objectContains(actual, expected)
  } catch (error) {
    nodeAssert.equal(error.message, 'Both actual and expected should have the same number of elements')
    nodeAssert.equal(error.code, 'ERR_ASSERTION')
    asserted = 1
  }

  nodeAssert.ok(asserted)
})

test('It fails when key is null', () => {
  const actual = {a: null}
  const expected = {a: {c: 'b'}}
  let asserted = 0

  try {
    extraAssert.objectContains(actual, expected)
  } catch (error) {
    nodeAssert.equal(error.message, 'Invalid key [a]')
    nodeAssert.equal(error.code, 'ERR_ASSERTION')
    asserted = 1
  }

  nodeAssert.ok(asserted)
})

test('It fails when values is not an object', () => {
  const actual = 1 as any
  const expected = {a: 1}
  let asserted = 0

  try {
    extraAssert.objectContains(actual, expected)
  } catch (error) {
    nodeAssert.equal(error.message, 'Both actual and expected values must be objects')
    nodeAssert.equal(error.code, 'ERR_ASSERTION')
    asserted = 1
  }

  nodeAssert.ok(asserted)
})

test('It fails if expected key is not present', () => {
  const actual = {b: 2}
  const expected = {a: 1}
  let asserted = 0

  try {
    extraAssert.objectContains(actual, expected)
  } catch (error) {
    nodeAssert.equal(error.message, 'Invalid key [a]')
    nodeAssert.equal(error.code, 'ERR_ASSERTION')
    asserted = 1
  }

  nodeAssert.ok(asserted)
})
