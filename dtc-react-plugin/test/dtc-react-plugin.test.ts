import {test} from 'node:test'
import {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {act, assert, arrange} from '../src/dtc-react-plugin'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('It does not arrange if type does not match', () => arrange({}, 'basePath'))

test('It does not act if type does not match', () => act({}, 'basePath'))

test('It does not assert if type does not match', () => assert({}, 'basePath'))

test('It mounts a component', async () => {
  await arrange(
    {
      import: 'default',
      from: 'fixtures/TestComponent.tsx',
    },
    __dirname,
  )

  await act(
    [
      {
        target: {
          name: 'getByText',
          args: ['Hello React'],
        },
        toBeVisible: true,
      },
    ],
    __dirname,
  )

  await assert(
    [
      {
        target: {
          name: 'getByText',
          args: ['hidden'],
        },
        toBeVisible: false,
      },
    ],
    __dirname,
  )
})

test('It interacts with a component', async () => {
  await arrange(
    {
      import: 'default',
      from: 'fixtures/EventsComponent.tsx',
    },
    __dirname,
  )

  await act(
    [
      {
        target: {
          name: 'getByRole',
          args: ['button'],
        },
        click: true,
      },
      {
        target: {
          name: 'findByRole',
          args: ['textbox'],
        },
        fill: 'one',
      },
    ],
    __dirname,
  )

  await assert(
    [
      {
        target: {
          name: 'getByText',
          args: ['one'],
        },
        toBeVisible: false,
      },
      {
        target: {
          name: 'getByText',
          args: ['two'],
        },
        toBeVisible: true,
      },
    ],
    __dirname,
  )
})
