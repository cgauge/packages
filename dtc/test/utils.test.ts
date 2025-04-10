import {test} from 'node:test'
import assert from 'node:assert'
import {retry, merge} from '../src/utils'

test('It execute at least one time', async () => {
  const response = await retry(() => Promise.resolve(true))

  assert.ok(response)
})

test('It stops if it fails and there is no retry', async () => {
  const response = retry(() => Promise.reject(new Error('Bla')))

  await assert.rejects(response)
})

test('It retries when it fails', async () => {
  let times = 0
  const response = await retry(() => {
    if (times === 0) {
      times++
      return Promise.reject(new Error('Bla'))
    }
    return Promise.resolve(true)
  }, 1)

  assert.ok(response)
});

([
  //objects
  [{a: 'a'}, {a: 'b'}, {a: 'b'}],
  [{a: 'a', b: 'c'}, {a: 'b'}, {a: 'b', b: 'c'}],
  [{a: 'a'}, {a: 'b', b: 'c'}, {a: 'b', b: 'c'}],
  [{a: {a: 'a'}}, {a: {a: 'b'}}, {a: {a: 'b'}}],
  [{a: {a: 'a'}, b: 'c'}, {a: {a: 'b'}}, {a: {a: 'b'}, b: 'c'}],
  //arrays
  [[1], [2], [2]],
  [[1], [2,3], [2,3]],
  [[1,2], [3], [3,2]],
  [[[1]], [[2]], [[2]]],
  [[[1], 2], [[2]], [[2], 2]],
  [[[1]], [[2], 3], [[2], 3]],
  //mixed types
  [{a: [1]}, {a: 1}, {a: 1}],
  [{a: 1}, {a: [1]}, {a: [1]}],
  [{a: {b: 'a'}}, {a: [1]}, {a: [1]}],
  [[{a: 'a', b: 'c'}], [{a: 'b'}], [{a: 'b', b: 'c'}]],
  //primitives
  [1, 2, 2],
  ['a', 'b', 'b'],
]).forEach(([source, target, expected], index) => {
  test(`It merge objects (${index})`, async () => {
    const result = merge(source, target)

    assert.deepStrictEqual(result, expected)
  })
})
