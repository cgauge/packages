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
 
  nodeAssert.throws(
    () => {
      extraAssert.objectContains(actual, expected)
    },
    {
      name: 'AssertionError',
      message: 'Invalid key [c]',
    },
  )
})

test('It fails when array does not have the same size', () => {
  const actual = [{a: 'b'}, {c: 'd'}]
  const expected = [{c: 'e'}]

  nodeAssert.throws(
    () => {
      extraAssert.objectContains(actual, expected)
    },
    {
      name: 'AssertionError',
      message: 'Both actual and expected should have the same number of elements',
    },
  )
})

test('It fails when key is null', () => {
  const actual = {a: null}
  const expected = {a: {c: 'b'}}

  nodeAssert.throws(
    () => {
      extraAssert.objectContains(actual, expected)
    },
    {
      name: 'AssertionError',
      message: 'Invalid key [a]',
    },
  )
})

test('It fails when values is not an object', () => {
  const actual = 1 as any
  const expected = {a: 1}

  nodeAssert.throws(
    () => {
      extraAssert.objectContains(actual, expected)
    },
    {
      name: 'AssertionError',
      message: 'Both actual and expected values must be objects',
    },
  )
})

test('It fails if expected key is not present', () => {
  const actual = {b: 2}
  const expected = {a: 1}

  nodeAssert.throws(
    () => {
      extraAssert.objectContains(actual, expected)
    },
    {
      name: 'AssertionError',
      message: 'Invalid key [a]',
    },
  )
})
