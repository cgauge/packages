import {test, mock} from 'node:test'
import {arrange, act, assert} from '../src/playwright-plugin'
import nodeAssert from 'node:assert'

const page = {goto: mock.fn()}

test('It does not arrange if type does not match', () => arrange(
  {},
  'basePath',
  //@ts-ignore
  {page}
))

test('It does not act if type does not match', () => act(
  {},
  'basePath',
  //@ts-ignore
  {page}
))

test('It does not act if type does not match 2', () => act(
  {
    url: 'https://customergauge.com',
    script: './script.js',
  },
  'basePath',
  //@ts-ignore
  {page}
))

test('It does not assert if type does not match', () => assert(
  {},
  'basePath',
  //@ts-ignore
  {page}
))

test('It calls playwright triggers', async () => {
  const page = {goto: mock.fn()}

  await act(
    {
      url: 'https://customergauge.com',
    },
    'basePath',
    //@ts-ignore
    {page: page},
  )

  nodeAssert.equal(page.goto.mock.callCount(), 1)
})
