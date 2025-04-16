import {fileURLToPath} from 'url'
import {dirname} from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  name: 'Test case',
  timeout: 1000,
  arrange: {
    playwright: {
      url: `file://${__dirname}/login.html`,
      actions: [
        {
          target: 'username-test-id',
          fill: '',
          options: {timeout: 1000},
        },
        {
          target: {
            name: 'getByPlaceholder',
            args: ['Your password'],
          },
          action: {
            name: 'fill',
            args: ['', {timeout: 1000}],
          },
        },
        {
          target: {
            name: 'getByRole',
            args: [
              'button',
              {
                type: 'submit',
              },
            ],
          },
          action: {
            name: 'click',
          },
        },
        {
          toBeVisible: 'input#username[required]:invalid',
        },
      ],
    },
  },
  act: {
    url: `file://${__dirname}/index.html`,
    options: {timeout: 1000},
  },
  assert: {
    playwright: {
      actions: [
        {
          target: {
            name: 'getByText',
            args: ['Index page'],
          },
          toBeVisible: true,
        },
        {
          target: 'invalid-id',
          toBeVisible: false,
        },
      ],
    },
  },
}
