import {test} from 'node:test'
import assert from 'node:assert'
import {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {load} from '../src/index'

const __dirname = dirname(fileURLToPath(import.meta.url))

test(`it replaces env var`, () => {
  const filename = __dirname + `/fixtures/env.yml`

  assert.deepEqual(load(filename), {envVar: 'test'})
})

test(`it includes yml and json files`, () => {
  const filename = __dirname + `/fixtures/include.yml`

  assert.deepEqual(load(filename), {
    yml: {envVar: 'test'},
    json: {key: 'value'},
    key: 'value',
  })
})

test(`it loads a file content`, () => {
  const filename = __dirname + `/fixtures/content.yml`

  assert.deepEqual(load(filename), {value: '{\n  "key": "value"\n}'})
})

test(`it stringify an object`, () => {
  const filename = __dirname + `/fixtures/stringify.yml`

  assert.deepEqual(load(filename), {value: '{"key":"value"}'})
})

test(`it eval javascript code`, () => {
  const filename = __dirname + `/fixtures/js.yml`

  assert.deepEqual(load(filename), {value: 2})
})

test(`it replaces interpolated env var values`, () => {
  const filename = __dirname + `/fixtures/sub.yml`

  assert.deepEqual(load(filename), {value: 'string-test-value'})
})

test(`it generates fake data`, () => {
  const filename = __dirname + `/fixtures/faker.yml`
  const data = load(filename) as Record<string, unknown>

  assert.ok(typeof data.uuid === 'string')
  assert.ok(typeof data.int === 'number')
  assert.ok(typeof data.fullName === 'string')
  assert.ok(typeof data.ip === 'string')
  assert.ok(typeof data.sample === 'string')
})

test(`it marshalls objects`, () => {
  const filename = __dirname + `/fixtures/marshall.yml`

  assert.deepEqual(load(filename), {value: {key: {S: 'string-value'}}})
})
